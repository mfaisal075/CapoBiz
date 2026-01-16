import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  BackHandler,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../BottomBar';

import LottieView from 'lottie-react-native';

// --- THEME (Matched to PurchaseReturn) ---
const THEME = {
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  white: '#FFFFFF',
  background: '#F8F9FA',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  shadow: 'rgba(0, 0, 0, 0.1)',
  primaryDark: '#143D15',
  info: '#3B82F6',
  rowHover: '#F9FAFB',
};

interface CartDetails {
  name: string;
  fatherName: string;
  address: string;
}

const initialCartDetails: CartDetails = {
  address: '',
  fatherName: '',
  name: '',
};

interface CartItems {
  prod_id: number;
  sold_qty: string;
  product_name: string;
  return_qty: number;
  return_subqty: number;
  price: string;
  total: string;
  cart_id?: number; // Added for compatibility if needed
}

interface EditForm {
  prod_id: number;
  product_name: string;
  sold_qty: string;
  return_qty: number;
  return_subqty: number;
  price: string;
  uom_id: number;
  sub_uom: any;
}

const initialEditFrom: EditForm = {
  prod_id: 0,
  price: '',
  product_name: '',
  return_qty: 0,
  return_subqty: 0,
  sold_qty: '',
  uom_id: 0,
  sub_uom: null,
};

interface CartItemsWithout {
  prod_id: number;
  product_name: string;
  uom_id: number;
  sub_uom: string;
  return_qty: string;
  return_subqty: string;
  sub_price: string;
  price: string;
  total: string;
}

interface InvoiceDetails {
  cust_name: string;
  cust_contact: string;
  cust_fathername: string;
  cust_address: string;
}

interface InvoiceItems {
  prod_name: string;
  salrd_return_qty: number;
  salrd_price: string;
  salrd_total_price: number;
}

export default function SaleReturn({navigation}: any) {
  const {token} = useUser();
  const {openDrawer} = useDrawer();

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // For Invoice Search
  const [selectedProductWithout, setSelectedProductWithout] =
    useState<any>(null); // For Product Search

  // Cart & Data State
  const [cartDetails, setCartDetails] =
    useState<CartDetails>(initialCartDetails);
  const [selectedOption, setSelectedOption] = useState<'with' | 'without'>(
    'with',
  );

  // Without Invoice Inputs
  const [qty, setQty] = useState('');
  const [qtyError, setQtyError] = useState('');

  // Lists
  const [cartItems, setCartItems] = useState<CartItems[]>([]);
  const [cartItemsWithout, setCartItemsWithout] = useState<CartItemsWithout[]>(
    [],
  );

  // Totals
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [orderTotalWithout, setOrderTotalWithout] = useState<number>(0);

  // Modal State
  const [modal, setModal] = useState('');
  const [editForm, setEditForm] = useState<EditForm>(initialEditFrom);
  const [invcDetails, setInvcDetails] = useState<InvoiceDetails | null>(null);
  const [invcItems, setInvcItems] = useState<InvoiceItems[]>([]);

  // Alert Modal State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'warning'>('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [confirmReturnError, setConfirmReturnError] = useState('');

  // Cart Animation
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const animateCartIcon = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const editOnChange = (field: keyof EditForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const showAlert = (
    type: 'success' | 'warning',
    title: string,
    message: string,
  ) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // --- Search Handlers ---
  const handleSearchInput = async (text: string) => {
    setSearchTerm(text);
    if (selectedOption === 'with') {
      // Invoice Search logic
      if (text.length > 0) {
        try {
          const response = await axios.post(`${BASE_URL}/srinvautocomplete`, {
            term: text,
          });
          setSearchResults(response.data);
          setShowResults(true);
        } catch (error) {
          console.error('Search failed:', error);
          setShowResults(false);
        }
      } else {
        setShowResults(false);
      }
    } else {
      // Product Search logic
      if (text.length > 0) {
        try {
          const response = await axios.post(`${BASE_URL}/autocomplete`, {
            term: text,
          });
          setSearchResults(response.data);
          setShowResults(true);
        } catch (error) {
          console.error('Search failed:', error);
          setShowResults(false);
        }
      } else {
        setShowResults(false);
      }
    }
  };

  const handleSelectResult = (item: any) => {
    if (selectedOption === 'with') {
      setSelectedProduct(item);
      setSearchTerm(item.value); // Set input to selected invoice
      addInvoice(item);
    } else {
      setSelectedProductWithout(item);
      setSearchTerm(item.value); // Set input to selected product
      // Don't auto-add, show qty form
    }
    setShowResults(false);
  };

  // --- Logic Functions ---

  // Add Invoice to Cart
  const addInvoice = async (product: any) => {
    if (!product) {
      Toast.show({type: 'error', text1: 'Please select a product first'});
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/addtoinvoicecart`,
        {search_invoice: product.value},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      const data = res.data;
      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Product added to cart successfully!',
        });
        setSearchTerm('');
        setSelectedProduct(null);
        getInvoiceCart();
        fetchCartItems();
        animateCartIcon();
      } else if (res.status === 200 && data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This invoice cannot be return anymore!.',
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Add Item to cart (Without)
  const handleAddToCart = async () => {
    if (!selectedProductWithout) {
      Toast.show({type: 'error', text1: 'Please select a product first'});
      return;
    }
    if (!qty) {
      setQtyError('Please enter quantity');
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/addtoreturncart`, {
        search_name: selectedProductWithout.value,
        prod_id: selectedProductWithout.prod_id,
        return_qty: qty,
        return_subqty: 0,
      });

      if (res.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Product added to cart successfully!',
        });
        setSearchTerm('');
        setSelectedProductWithout(null);
        setQty('');
        setQtyError('');
        fetchCartItemsWithout();
        animateCartIcon();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Get Invoice Cart Details
  const getInvoiceCart = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadinvoicereturncart`);
      setCartDetails({
        address: res.data?.address,
        fatherName: res.data?.fathername,
        name: res.data?.cust_name,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Cart Items
  const fetchCartItems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadinvoicereturncart`);
      if (res.data.cartsession) {
        const items = Object.values(res.data.cartsession).map((item: any) => ({
          ...item,
          total: (item.return_qty * parseFloat(item.price)).toString(),
        }));
        setCartItems(items);
        if (res.data.order_total)
          setOrderTotal(parseFloat(res.data.order_total));
      } else {
        setCartItems([]);
        setOrderTotal(0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Cart Items (Without)
  const fetchCartItemsWithout = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadreturncart`);
      if (res.data.cartsession) {
        const items = Object.values(res.data.cartsession).map((item: any) => ({
          ...item,
          total: (item.return_qty * parseFloat(item.price)).toString(),
        }));
        setCartItemsWithout(items);
        if (res.data.order_total)
          setOrderTotalWithout(parseFloat(res.data.order_total));
      } else {
        setCartItemsWithout([]);
        setOrderTotalWithout(0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Edit Logic
  const getEditData = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editsalewithinvoicereturn?pid=${id}&_token=${token}`,
      );
      const item = res.data[0];
      setEditForm({
        price: item.price,
        prod_id: item.prod_id,
        sold_qty: item.sold_qty,
        product_name: item.product_name,
        return_qty: item.return_qty ?? 0,
        return_subqty: item.return_subqty ?? 0,
        uom_id: item.uom_id,
        sub_uom: item.sub_uom,
      });
      setModal('Edit');
    } catch (error) {
      console.log(error);
    }
  };

  const updateCartItem = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/updatesalewithinvoicereturn`, {
        pro_id: editForm.prod_id,
        product_name: editForm.product_name,
        sold_qty: editForm.sold_qty,
        uom_id: editForm.uom_id,
        sub_uom: editForm.sub_uom,
        return_qty: editForm.return_qty,
        return_subqty: editForm.return_subqty,
        price: editForm.price,
      });

      if (res.status === 200 && res.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Return Order Updated Successfully!',
        });
        setEditForm(initialEditFrom);
        setModal('');
        fetchCartItems();
      } else if (res.status === 200 && res.data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Return quantity cannot be greater than sold quantity!',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const delCartItem = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/removesaleinvoicereturn?id=${id}&_token=${token}`,
      );
      if (res.status === 200 && res.data.status === 200) {
        Toast.show({type: 'success', text1: 'Cart item removed successfully!'});
        fetchCartItems();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const delCartItemWithout = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/removesalereturn?id=${id}&_token=${token}`,
      );
      if (res.status === 200 && res.data.status === 200) {
        Toast.show({type: 'success', text1: 'Cart item removed successfully!'});
        fetchCartItemsWithout();
        setOrderTotalWithout(0);
        emptyCartWithoutInv();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const emptyCart = async () => {
    try {
      await axios.get(`${BASE_URL}/emptyinvoicecart`);
    } catch (error) {
      console.log(error);
    }
  };

  const emptyCartWithoutInv = async () => {
    try {
      await axios.get(`${BASE_URL}/emptyreturncart`);
      setCartItemsWithout([]);
      setOrderTotalWithout(0);
    } catch (error) {
      console.log(error);
    }
  };

  // Complete Sale Return
  const completeSaleReturn = async () => {
    console.log('Pressed');
    setConfirmReturnError('');
    try {
      const res = await axios.post(`${BASE_URL}/productinvoicereturn`, {
        invoice_no: selectedProduct?.value,
        cust_id: null,
        sale_return: orderTotal,
      });
      const data = res.data;
      if (data.status === 200) {
        showAlert(
          'success',
          'Success',
          'Product has been returned successfully!',
        );
        await emptyCart();
        setCartDetails(initialCartDetails);
        setOrderTotal(0);
        fetchCartItems();
      } else if (data.status === 202) {
        setConfirmReturnError('Please Add some quantity to return!');
      } else if (data.status === 203) {
        setConfirmReturnError('Return quantity should be greater than 0!');
      } else if (data.status === 205) {
        setConfirmReturnError('Please Add Invoice data into the Cart!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Complete Sale Return Without Invoice
  const completeSaleReturnWithout = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/productreturn`, {
        sale_return: orderTotalWithout,
      });
      const data = res.data;
      if (data.status === 200) {
        showAlert(
          'success',
          'Success',
          'Product has been returned successfully!',
        );
        fetchCartItemsWithout();
        setOrderTotalWithout(0);
        emptyCartWithoutInv();
        setInvcDetails(res.data.return_detail[0]);
        setInvcItems(res.data.return_detail);
        setModal('Invoice');
      } else if (data.status === 202) {
        showAlert('warning', 'Warning', 'Please Add some quantity to return!');
      } else if (data.status === 203) {
        showAlert(
          'warning',
          'Warning!',
          'Return quantity should not be less than 0!',
        );
      } else if (data.status === 206) {
        showAlert(
          'warning',
          'Warning!',
          'Both quantity and sub quantity cannot be 0!',
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    emptyCart();
    emptyCartWithoutInv();
    fetchCartItems();
    fetchCartItemsWithout();

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('Dashboard');
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sale Return</Text>
            <View style={{width: 24}} />
          </View>
        </LinearGradient>

        {/* Floating Search */}
        <View style={styles.floatingSearchContainer}>
          <Icon name="magnify" size={22} color={THEME.primary} />
          <TextInput
            placeholder={
              selectedOption === 'with'
                ? 'Search by Invoice Number...'
                : 'Search Product by name...'
            }
            placeholderTextColor={THEME.textLight}
            style={styles.floatingSearchInput}
            value={searchTerm}
            onChangeText={handleSearchInput}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchTerm('');
                setShowResults(false);
                setSelectedProduct(null);
                setSelectedProductWithout(null);
              }}>
              <Icon name="close-circle" size={18} color={THEME.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Segmented Control */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              selectedOption === 'with' && styles.segmentButtonActive,
            ]}
            onPress={() => {
              setSelectedOption('with');
              setSearchTerm('');
              setShowResults(false);
            }}>
            <Text
              style={[
                styles.segmentText,
                selectedOption === 'with' && styles.segmentTextActive,
              ]}>
              With Invoice
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              selectedOption === 'without' && styles.segmentButtonActive,
            ]}
            onPress={() => {
              setSelectedOption('without');
              setSearchTerm('');
              setShowResults(false);
            }}>
            <Text
              style={[
                styles.segmentText,
                selectedOption === 'without' && styles.segmentTextActive,
              ]}>
              Without Invoice
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- WITH INVOICE CONTENT --- */}
        {selectedOption === 'with' && (
          <View>
            {/* Customer Info Card if available */}
            {(cartDetails.name || cartDetails.fatherName) && (
              <View style={styles.formCard}>
                <Text style={styles.cardTitle}>Customer Details</Text>
                <Text style={styles.infoText}>
                  Name: <Text style={styles.infoValue}>{cartDetails.name}</Text>
                </Text>
                <Text style={styles.infoText}>
                  Father Name:{' '}
                  <Text style={styles.infoValue}>{cartDetails.fatherName}</Text>
                </Text>
                <Text style={styles.infoText}>
                  Address:{' '}
                  <Text style={styles.infoValue}>{cartDetails.address}</Text>
                </Text>
              </View>
            )}

            {cartItems.length > 0 ? (
              <View style={styles.cartPreviewCard}>
                <View style={styles.cartPreviewHeader}>
                  <Text style={styles.cartPreviewTitle}>Return Items</Text>
                </View>
                {cartItems.map((item, index) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemCardHeader}>
                      <View style={{flex: 1}}>
                        <Text style={styles.itemName}>{item.product_name}</Text>
                        <Text style={styles.itemSubText}>
                          Invoice Qty: {item.sold_qty}
                        </Text>
                      </View>
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          onPress={() => getEditData(item.prod_id)}
                          style={styles.editBtn}>
                          <Icon name="pencil" size={18} color={THEME.info} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => delCartItem(item.prod_id)}
                          style={styles.deleteBtn}>
                          <Icon
                            name="delete-outline"
                            size={18}
                            color={THEME.danger}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.itemDivider} />
                    <View style={styles.itemCardFooter}>
                      <View>
                        <Text style={styles.itemLabel}>Return Qty</Text>
                        <Text style={styles.itemValue}>{item.return_qty}</Text>
                      </View>
                      <View>
                        <Text style={styles.itemLabel}>Price</Text>
                        <Text style={styles.itemValue}>{item.price}</Text>
                      </View>
                      <View>
                        <Text style={[styles.itemLabel, {textAlign: 'right'}]}>
                          Total
                        </Text>
                        <Text style={styles.itemTotalValue}>
                          {parseFloat(item.total).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
                <View style={[styles.summaryRow, {padding: 15}]}>
                  <Text style={styles.summaryLabel}>Total Refund Amount:</Text>
                  <Text style={styles.summaryValue}>
                    {orderTotal.toFixed(2)}
                  </Text>
                </View>
                {confirmReturnError ? (
                  <View style={{paddingHorizontal: 15, paddingBottom: 15}}>
                    <Text
                      style={{
                        color: THEME.danger,
                        textAlign: 'right',
                        fontSize: 13,
                        fontWeight: '500',
                      }}>
                      {confirmReturnError}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="receipt" size={48} color={THEME.textLight} />
                <Text style={styles.emptyText}>
                  Search an invoice to add items
                </Text>
              </View>
            )}
          </View>
        )}

        {/* --- WITHOUT INVOICE CONTENT --- */}
        {selectedOption === 'without' && (
          <View>
            {/* Add Item Form (Visible if product selected) */}
            {selectedProductWithout && (
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.cardTitle}>Add Product Return</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedProductWithout(null)}>
                    <Icon name="close" size={20} color={THEME.textGray} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.selectedProdName}>
                  {selectedProductWithout.value}
                </Text>

                <View style={styles.row}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Quantity</Text>
                    <TextInput
                      style={[
                        styles.input,
                        qtyError
                          ? {borderColor: THEME.danger, borderWidth: 1}
                          : null,
                      ]}
                      keyboardType="numeric"
                      value={qty}
                      onChangeText={text => {
                        setQty(text);
                        if (text) setQtyError('');
                      }}
                      placeholder="0"
                    />
                    {qtyError ? (
                      <Text
                        style={{
                          color: THEME.danger,
                          fontSize: 12,
                          marginTop: 4,
                        }}>
                        {qtyError}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleAddToCart}
                  style={styles.addBtn}>
                  <Text style={styles.addBtnText}>Add to Return List</Text>
                </TouchableOpacity>
              </View>
            )}

            {cartItemsWithout.length > 0 ? (
              <View style={styles.cartPreviewCard}>
                {cartItemsWithout.map((item, index) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemCardHeader}>
                      <Text style={styles.itemName}>{item.product_name}</Text>
                      <TouchableOpacity
                        onPress={() => delCartItemWithout(item.prod_id)}
                        style={styles.deleteBtn}>
                        <Icon
                          name="delete-outline"
                          size={18}
                          color={THEME.danger}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.itemDivider} />
                    <View style={styles.itemCardFooter}>
                      <View>
                        <Text style={styles.itemLabel}>Ret Qty</Text>
                        <Text style={styles.itemValue}>{item.return_qty}</Text>
                      </View>
                      <View>
                        <Text style={styles.itemLabel}>Note</Text>
                        <Text style={styles.itemValue}>
                          {item.uom_id ? 'UOM' : 'Unit'}
                        </Text>
                      </View>
                      <View>
                        <Text style={[styles.itemLabel, {textAlign: 'right'}]}>
                          Total
                        </Text>
                        <Text style={styles.itemTotalValue}>
                          {parseFloat(item.total).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
                <View style={[styles.summaryRow, {padding: 15}]}>
                  <Text style={styles.summaryLabel}>Total Refund Amount:</Text>
                  <Text style={styles.summaryValue}>
                    {orderTotalWithout.toFixed(2)}
                  </Text>
                </View>
              </View>
            ) : (
              !selectedProductWithout && (
                <View style={styles.emptyState}>
                  <Icon
                    name="basket-outline"
                    size={48}
                    color={THEME.textLight}
                  />
                  <Text style={styles.emptyText}>
                    Search a product to return
                  </Text>
                </View>
              )
            )}
          </View>
        )}

        <View style={{height: 100}} />
      </ScrollView>

      {/* --- BOTTOM FLOATING BAR --- */}
      {((selectedOption === 'with' && cartItems.length > 0) ||
        (selectedOption === 'without' && cartItemsWithout.length > 0)) && (
        <TouchableOpacity
          style={styles.floatingBillingBtn}
          onPress={() => {
            if (selectedOption === 'with') {
              completeSaleReturn();
            } else {
              completeSaleReturnWithout();
            }
          }}>
          <LinearGradient
            colors={[THEME.gradientStart, THEME.gradientEnd]}
            style={styles.floatingBtnGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <View style={styles.floatingBtnContent}>
              <Icon name="check-circle" size={24} color={THEME.white} />
              <View style={styles.floatingBtnTextContainer}>
                <Text style={styles.floatingBtnTitle}>Confirm Return</Text>
                <Text style={styles.floatingBtnSubtitle}>
                  Total:{' '}
                  {(selectedOption === 'with'
                    ? orderTotal
                    : orderTotalWithout
                  ).toFixed(2)}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={THEME.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
      {/* Search Results Dropdown */}
      {showResults && (
        <View style={styles.searchResultsList}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{maxHeight: 200}}>
            {(selectedOption === 'with' ? searchResults : searchResults).map(
              (item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectResult(item)}>
                  <Text style={styles.searchResultText} numberOfLines={1}>
                    {(selectedOption === 'with' ? item.value : item.label)
                      .replace(/\s+/g, ' ')
                      .trim()}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </ScrollView>
        </View>
      )}

      {/* --- EDIT MODAL (Preserved for complex editing) --- */}
      <Modal
        visible={modal === 'Edit'}
        transparent
        animationType="fade"
        onRequestClose={() => setModal('')}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Return Item</Text>
            <Text style={styles.modalSubtitle}>{editForm.product_name}</Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.label}>Sold Qty (Max)</Text>
              <Text
                style={[
                  styles.input,
                  {backgroundColor: '#EEE', textAlignVertical: 'center'},
                ]}>
                {editForm.sold_qty}
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Return Qty</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={editForm.return_qty.toString()}
                  onChangeText={val => editOnChange('return_qty', val)}
                />
              </View>
              {editForm.sub_uom && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Sub Qty</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={editForm.return_subqty.toString()}
                    onChangeText={val => editOnChange('return_subqty', val)}
                  />
                </View>
              )}
            </View>

            <View style={[styles.row, {marginTop: 20}]}>
              <TouchableOpacity
                onPress={() => setModal('')}
                style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={updateCartItem} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* --- CUSTOM ALERT MODAL --- */}
      <Modal
        visible={alertVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAlertVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {alignItems: 'center'}]}>
            <LottieView
              source={
                alertType === 'success'
                  ? require('../../../assets/CheckMark.json')
                  : require('../../../assets/warning.json')
              }
              autoPlay
              loop={false}
              style={{width: 100, height: 100, marginBottom: 10}}
            />
            <Text
              style={[
                styles.modalTitle,
                {
                  color:
                    alertType === 'success' ? THEME.primary : THEME.warning,
                },
              ]}>
              {alertTitle}
            </Text>
            <Text style={[styles.modalSubtitle, {textAlign: 'center'}]}>
              {alertMessage}
            </Text>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  marginTop: 15,
                  width: '80%',
                  backgroundColor:
                    alertType === 'success' ? THEME.primary : THEME.warning,
                },
              ]}
              onPress={() => setAlertVisible(false)}>
              <Text style={styles.saveBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  headerWrapper: {
    zIndex: 10,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },

  // Floating Search
  floatingSearchContainer: {
    position: 'absolute',
    bottom: -25,
    left: 20,
    right: 20,
    backgroundColor: THEME.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  floatingSearchInput: {
    flex: 1,
    height: 45,
    fontSize: 14,
    color: THEME.textDark,
    paddingHorizontal: 10,
  },
  searchResultsList: {
    position: 'absolute',
    top: 180, // below header
    left: 20,
    right: 20,
    backgroundColor: THEME.white,
    borderRadius: 12,
    maxHeight: 200,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchResultText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.textDark,
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
  },

  // Tabs
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentButtonActive: {
    backgroundColor: THEME.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  segmentText: {
    fontSize: 13,
    color: THEME.textGray,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: THEME.primary,
  },

  // Cards
  cartPreviewCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cartPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cartPreviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.primary,
  },

  // Item Card
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 2,
  },
  itemSubText: {
    fontSize: 12,
    color: THEME.textGray,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    padding: 6,
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  itemCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 11,
    color: THEME.textGray,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textDark,
  },
  itemTotalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.primary,
  },

  // Forms
  formCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: THEME.textGray,
    marginBottom: 4,
  },
  infoValue: {
    color: THEME.textDark,
    fontWeight: '600',
  },
  selectedProdName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
    backgroundColor: THEME.primaryLight,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textGray,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: THEME.textDark,
    backgroundColor: '#F9FAFB',
  },
  addBtn: {
    backgroundColor: THEME.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  addBtnText: {
    color: THEME.white,
    fontWeight: '700',
    fontSize: 14,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    color: THEME.textGray,
    fontSize: 14,
  },

  // Bottom Bar

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: THEME.textGray,
    marginBottom: 20,
  },
  modalInputGroup: {
    marginBottom: 15,
  },
  floatingBillingBtn: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    elevation: 5,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  floatingBtnGradient: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  floatingBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floatingBtnTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  floatingBtnTitle: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },
  floatingBtnSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    marginTop: 10,
    paddingTop: 10,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: THEME.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: THEME.white,
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: THEME.textDark,
    fontWeight: '600',
  },
});
