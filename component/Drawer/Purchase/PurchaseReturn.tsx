import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Animated,
  Image,
  ToastAndroid,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {BackHandler} from 'react-native';
import LottieView from 'lottie-react-native';
import BottomBar from '../../BottomBar';

const {width} = Dimensions.get('window');

// THEME - Updated to match PurchaseOrder
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
  rowHover: '#F9FAFB', // Kept for logic compatibility if needed
};

interface Supplier {
  id: number;
  sup_name: string;
  sup_company_name: string;
}

interface SupplierData {
  sup_name: string;
  sup_company_name: string;
  sup_address: string;
}

interface InvoiceListWith {
  prod_id: number;
  invoice_no: string;
  prod_name: string;
  prod_purchase_qty: string;
  prod_return_qty: number;
  prod_price: string;
  total: string;
  cart_id?: number;
}

interface InvoiceListWithout {
  prod_id: number;
  prod_name: string;
  prod_upc_ean: string;
  prod_availavble_qty: string;
  prod_return_qty: number;
  prod_price: string;
  prod_fretail_price: string;
  total: string;
  cart_id?: number;
}

interface InvoiceData {
  prod_name: string;
  prchr_sup_id: number;
  created_at: string;
  sup_name: string;
  sup_contact: string;
  sup_company_name: string;
  sup_address: string;
  prchrd_return_qty: number;
  prchrd_price: string;
  prchrd_total_price: number;
}

export default function PurchaseReturn({navigation}: any) {
  const {token, bussName, bussAddress, bussContact} = useUser();
  const {openDrawer} = useDrawer();
  const [selectedOption, setSelectedOption] = useState<'with' | 'without'>(
    'with',
  );
  const [supData, setSupData] = useState<SupplierData | null>(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState(''); // Shared search term for visual input
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Product Selection (Without Invoice)
  const [selectedProductWithout, setSelectedProductWithout] =
    useState<any>(null);

  // Functionality States
  const [quantity, setQuantity] = useState('');
  const [supplierItems, setSupplierItems] = useState<Supplier[]>([]);
  const transformedSupplier = supplierItems.map(sup => ({
    label: `${sup.sup_name}_${sup.sup_company_name}`,
    value: sup.id.toString(),
  }));
  const [withInvcList, setWithInvcList] = useState<InvoiceListWith[]>([]);
  const [withoutInvcList, setWithoutInvcList] = useState<InvoiceListWithout[]>(
    [],
  );
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [orderTotalWithout, setOrderTotalWithout] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState('');

  const [psupplier, setpsupplier] = useState(false);
  const [currentpsupplier, setCurrentpsupplier] = useState<string | null>('');

  const [expireDate, setexpireDate] = useState(new Date());
  const [showexpireDatePicker, setShowexpireDatePicker] = useState(false);

  // Editing states
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<string>('');
  const [editingType, setEditingType] = useState<'with' | 'without'>('with');
  const [ref, setRef] = useState('');
  const [invcData, setInvcData] = useState<InvoiceData | null>(null);
  const [invcDetails, setInvcDetails] = useState<InvoiceData[]>([]);

  // Cart Animation
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const onexpireDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || expireDate;
    setShowexpireDatePicker(false);
    setexpireDate(currentDate);
  };

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

  // Enhanced Search Handler
  const handleSearchInput = async (text: string) => {
    setSearchTerm(text);
    if (selectedOption === 'with') {
      // Just update text for 'with invoice' mode, actual search triggers on enter/button
    } else {
      // Auto-search for products in 'without invoice' mode
      if (text.length > 0) {
        handleSearchWithout(text);
      } else {
        setShowResults(false);
      }
    }
  };

  const handleSearchWithout = async (text: string) => {
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
  };

  // Logic from original file
  const addInvoice = async () => {
    // For 'With Invoice', searchTerm is the invoice number
    if (!searchTerm) {
      Toast.show({type: 'error', text1: 'Please enter Invoice Number'});
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/addtopinvoicecart`,
        {search_invoice: searchTerm},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      const data = res.data;
      if (res.status === 200 && data.status) {
        Toast.show({
          type: 'success',
          text1: 'Product added to cart successfully!',
        });
        fetchInvcWith();
        setSearchTerm('');
        animateCartIcon();
      }
    } catch (error) {
      console.error('Error adding invoice:', error);
      Toast.show({type: 'error', text1: 'Failed to find invoice or add items'});
    }
  };

  const addInvoiceWithout = async () => {
    if (!selectedProductWithout) {
      Toast.show({type: 'error', text1: 'Please select a product first'});
      return;
    }
    if (!quantity) {
      Toast.show({type: 'error', text1: 'Please enter quantity'});
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/addtopurchreturncart`,
        {
          preturn_prod_id: selectedProductWithout.prod_id,
          purchase_return_prod_name: selectedProductWithout.value, // Changed from searchTerm to selectedProductWithout.value to be safe
          purch_return_qty: quantity,
        },
        {headers: {Authorization: `Bearer ${token}`}},
      );
      const data = res.data;
      if (res.status === 200 && data.status == 200) {
        Toast.show({
          type: 'success',
          text1: 'Product added to cart successfully!',
        });
        setSearchTerm('');
        setShowResults(false);
        setQuantity('');
        setSelectedProductWithout(null);
        fetchInvcWithout();
        animateCartIcon();
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'info',
          text1: 'Warning!',
          text2: 'The required quantity is not available!',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSupplierData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/loadsuppliers`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setSupplierItems(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      return [];
    }
  };

  const fetchSupData = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchsuppdata`, {
        id: currentpsupplier,
      });
      setSupData(res.data.supplier);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchInvcWith = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadpinvoicereturncart`);
      if (res.data.cartsession) {
        const cartItems = Object.values(res.data.cartsession).map(
          (item: any) => ({
            ...item,
            cart_id: item.id,
            total: (
              item.prod_return_qty * parseFloat(item.prod_price)
            ).toString(),
          }),
        );
        setWithInvcList(cartItems);
        if (res.data.order_total) setOrderTotal(res.data.order_total);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateQuantity = async (
    id: number,
    qty: number,
    type: 'with' | 'without',
  ) => {
    if (type === 'with') {
      const item = withInvcList.find(i => (i.cart_id || i.prod_id) === id);
      if (item && qty > parseInt(item.prod_purchase_qty)) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Return quantity cannot be greater than Purchase quantity',
        });
        return false;
      }
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/inlinepurinvoicechange`,
        {id: id, qty: qty},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      if (res.status === 200 && res.data.status) {
        Toast.show({type: 'success', text1: 'Quantity updated successfully!'});
        if (type === 'with') fetchInvcWith();
        else fetchInvcWithout();
        return true;
      } else {
        Toast.show({type: 'error', text1: 'Failed to update quantity'});
        return false;
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Toast.show({type: 'error', text1: 'Error updating quantity'});
      return false;
    }
  };

  const delCartItem = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/removepurinvoicereturn?id=${id}&_token=${token}`,
      );
      if (res.status === 200 && res.data.status === 200) {
        Toast.show({type: 'success', text1: 'Cart item removed successfully!'});
        fetchInvcWith();
        setOrderTotal(0);
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
    }
  };

  const delCartItemWithout = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/removepurchasereturn?id=${id}&_token=${token}`,
      );
      if (res.status === 200 && res.data.status === 200) {
        Toast.show({type: 'success', text1: 'Cart item removed successfully!'});
        fetchInvcWithout();
        setOrderTotalWithout(0);
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
    }
  };

  const fetchInvcWithout = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadpurchasereturncart`);
      if (res.data.cartsession) {
        const cartItems = Object.values(res.data.cartsession).map(
          (item: any) => ({
            ...item,
            cart_id: item.id,
            total: (
              item.prod_return_qty * parseFloat(item.prod_price)
            ).toString(),
          }),
        );
        setWithoutInvcList(cartItems);
        if (res.data.order_total) setOrderTotalWithout(res.data.order_total);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const emptyCartWithInvc = async () => {
    try {
      await axios.get(`${BASE_URL}/emptypurchaseinvreturncart`);
    } catch (error) {
      console.log(error);
    }
  };

  const emptyCartWithoutInvc = async () => {
    try {
      await axios.get(`${BASE_URL}/emptypurchasereturncart`);
    } catch (error) {
      console.log(error);
    }
  };

  const compOrder = async () => {
    if (!withInvcList.length) {
      Toast.show({type: 'error', text1: 'No items in cart to complete order'});
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/purchaseinvoicereturn`,
        {invoice_no: withInvcList[0]?.invoice_no},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      if (res.status === 200 && res.data.status === 200) {
        Toast.show({type: 'success', text1: 'Order completed successfully!'});
        setWithInvcList([]);
        setOrderTotal(0);
        emptyCartWithInvc();
      } else if (res.status === 200 && res.data.status === 204) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: "The return quantity can't be available in stock!",
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Failed to complete order',
        });
      }
    } catch (error) {
      Toast.show({type: 'error', text1: 'Error completing order'});
    }
  };

  const compOrderWithoutInvc = async () => {
    if (!withoutInvcList.length) {
      Toast.show({type: 'error', text1: 'No items in cart to complete order'});
      return;
    }
    if (!currentpsupplier) {
      Toast.show({type: 'error', text1: 'Please select a supplier'});
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/completepurchasereturn`, {
        supp_id: currentpsupplier,
        refrence_no: ref,
        date: expireDate.toISOString().split('T')[0],
      });
      const data = res.data;
      if (res.status === 200 && data.status === 200) {
        setInvcData(data.return_detail[0]);
        setInvcDetails(res.data.return_detail);
        Toast.show({type: 'success', text1: 'Order completed successfully!'});
        setWithoutInvcList([]);
        setOrderTotalWithout(0);
        emptyCartWithoutInvc();
        setSupData(null);
        setCurrentpsupplier('');
        setModalVisible('Invc');
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Please Select Supplier!',
        });
      }
    } catch (error) {
      Toast.show({type: 'error', text1: 'Error completing order'});
    }
  };

  const startEditing = (item: any, type: 'with' | 'without') => {
    setEditingItemId(item.cart_id || item.prod_id);
    setEditingQuantity(item.prod_return_qty.toString());
    setEditingType(type);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditingQuantity('');
  };

  const saveQuantity = async () => {
    if (!editingItemId || !editingQuantity) return;
    const qty = parseInt(editingQuantity);
    if (isNaN(qty) || qty <= 0) {
      Toast.show({type: 'error', text1: 'Please enter a valid quantity'});
      return;
    }
    const success = await updateQuantity(editingItemId, qty, editingType);
    if (success) cancelEditing();
  };

  const increaseQuantity = async (item: any, type: 'with' | 'without') => {
    const newQty = item.prod_return_qty + 1;
    await updateQuantity(item.cart_id || item.prod_id, newQty, type);
  };

  const decreaseQuantity = async (item: any, type: 'with' | 'without') => {
    if (item.prod_return_qty <= 1) return;
    const newQty = item.prod_return_qty - 1;
    await updateQuantity(item.cart_id || item.prod_id, newQty, type);
  };

  useEffect(() => {
    if (currentpsupplier) fetchSupData();
    fetchSupplierData();
    fetchInvcWith();
    fetchInvcWithout();
    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );
    return () => backHandler.remove();
  }, [currentpsupplier]);

  // Render Helpers
  const renderQuantityWithInvoice = (item: InvoiceListWith) => {
    if (
      editingItemId === (item.cart_id || item.prod_id) &&
      editingType === 'with'
    ) {
      return (
        <View style={styles.quantityEditorContainer}>
          <TextInput
            style={styles.quantityInput}
            value={editingQuantity}
            onChangeText={setEditingQuantity}
            keyboardType="numeric"
            maxLength={6}
            autoFocus
          />
          <TouchableOpacity onPress={saveQuantity} style={styles.saveButton}>
            <Icon name="check" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={cancelEditing} style={styles.cancelButton}>
            <Icon name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          onPress={() => decreaseQuantity(item, 'with')}
          style={styles.quantityButton}>
          <Icon name="minus" size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => startEditing(item, 'with')}
          style={styles.quantityDisplay}>
          <Text style={styles.quantityText}>{item.prod_return_qty}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => increaseQuantity(item, 'with')}
          style={styles.quantityButton}>
          <Icon name="plus" size={16} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

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
            <Text style={styles.headerTitle}>Purchase Return</Text>
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
            onSubmitEditing={() => selectedOption === 'with' && addInvoice()}
          />
          {searchTerm.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                setSearchTerm('');
                setShowResults(false);
              }}>
              <Icon name="close-circle" size={18} color={THEME.textLight} />
            </TouchableOpacity>
          ) : (
            selectedOption === 'with' && (
              <TouchableOpacity onPress={addInvoice}>
                <Icon name="plus-circle" size={24} color={THEME.primary} />
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={{paddingBottom: 160}}
        showsVerticalScrollIndicator={false}>
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

        {/* --- WITH INVOICE MODE --- */}
        {selectedOption === 'with' && (
          <View>
            {withInvcList.length > 0 && (
              <View style={styles.cartPreviewCard}>
                <View style={styles.cartPreviewHeader}>
                  <Text style={styles.cartPreviewTitle}>
                    Items from Invoice: {withInvcList[0]?.invoice_no}
                  </Text>
                </View>

                {withInvcList.map((item, index) => (
                  <View key={index} style={styles.itemCard}>
                    {/* Top Section: Name & Info */}
                    <View style={styles.itemCardHeader}>
                      <View style={{flex: 1, marginRight: 12}}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.prod_name}
                        </Text>
                        <View style={styles.itemBadge}>
                          <Text style={styles.itemBadgeText}>
                            In Invoice: {item.prod_purchase_qty}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          delCartItem(item.cart_id || item.prod_id)
                        }
                        style={styles.itemDeleteBtn}>
                        <Icon
                          name="delete-outline"
                          size={20}
                          color={THEME.danger}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.itemDivider} />

                    {/* Bottom Section: Controls & Pricing */}
                    <View style={styles.itemCardFooter}>
                      <View style={styles.priceContainer}>
                        <Text style={styles.itemLabel}>Price</Text>
                        <Text style={styles.itemValue}>{item.prod_price}</Text>
                      </View>

                      {/* Quantity Control */}
                      <View style={styles.qtyWrapper}>
                        {renderQuantityWithInvoice(item)}
                      </View>

                      <View style={styles.totalContainer}>
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
              </View>
            )}
            {withInvcList.length === 0 && (
              <View style={styles.emptyState}>
                <Icon
                  name="file-document-outline"
                  size={48}
                  color={THEME.textLight}
                />
                <Text style={styles.emptyText}>
                  Enter an Invoice Number above to start return
                </Text>
              </View>
            )}
          </View>
        )}

        {/* --- WITHOUT INVOICE MODE --- */}
        {selectedOption === 'without' && (
          <View>
            {/* Product Form Card (Only when product selected) */}
            {selectedProductWithout ? (
              <View style={styles.formCard}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                  <Text style={styles.cardTitle}>Selected Product</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedProductWithout(null)}>
                    <Icon name="close" size={20} color={THEME.textGray} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.selectedProdName}>
                  {selectedProductWithout.value}
                </Text>
                <Text style={styles.selectedProdPrice}>
                  Price: {selectedProductWithout.prod_price}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Return Quantity <Text style={{color: THEME.danger}}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={THEME.textLight}
                    maxLength={6}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                  />
                </View>

                <TouchableOpacity
                  style={styles.addToCartBtn}
                  activeOpacity={0.8}
                  onPress={addInvoiceWithout}>
                  <LinearGradient
                    colors={[THEME.primary, '#1e4620']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.gradientBtn}>
                    <Icon
                      name="cart-plus"
                      size={22}
                      color={THEME.white}
                      style={{marginRight: 8}}
                    />
                    <Text style={styles.btnText}>ADD TO RETURN LIST</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Added Items List */}
            {withoutInvcList.length > 0 ? (
              <View style={styles.cartPreviewCard}>
                <View style={styles.cartPreviewHeader}>
                  <Text style={styles.cartPreviewTitle}>
                    Return Items ({withoutInvcList.length})
                  </Text>
                </View>
                {withoutInvcList.map((item, index) => (
                  <View key={index} style={styles.itemCard}>
                    {/* Top: Name & Delete */}
                    <View style={styles.itemCardHeader}>
                      <View style={{flex: 1, marginRight: 12}}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.prod_name}
                        </Text>
                        <View
                          style={[
                            styles.itemBadge,
                            {backgroundColor: '#f3f4f6'},
                          ]}>
                          <Text
                            style={[
                              styles.itemBadgeText,
                              {color: THEME.textGray},
                            ]}>
                            Qty: {item.prod_return_qty}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          delCartItemWithout(item.cart_id || item.prod_id)
                        }
                        style={styles.itemDeleteBtn}>
                        <Icon
                          name="delete-outline"
                          size={20}
                          color={THEME.danger}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.itemDivider} />

                    {/* Bottom: Totals */}
                    <View style={styles.itemCardFooter}>
                      <View>
                        <Text style={styles.itemLabel}>Return Qty</Text>
                        <Text style={styles.itemValue}>
                          {item.prod_return_qty}
                        </Text>
                      </View>

                      <View style={styles.totalContainer}>
                        <Text style={[styles.itemLabel, {textAlign: 'right'}]}>
                          Subtotal
                        </Text>
                        <Text style={styles.itemTotalValue}>
                          {parseFloat(item.total || '0').toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              !selectedProductWithout && (
                <View style={styles.emptyState}>
                  <Icon name="cart-outline" size={48} color={THEME.textLight} />
                  <Text style={styles.emptyText}>
                    Search product to add to return list
                  </Text>
                </View>
              )
            )}
          </View>
        )}

        <View style={{height: 100}} />
      </ScrollView>

      {/* --- FLOATING SEARCH RESULTS --- */}
      {showResults &&
        searchResults.length > 0 &&
        selectedOption === 'without' && (
          <View style={styles.searchResultsOverlay}>
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => {
                    setSearchTerm(item.value);
                    setSelectedProductWithout(item);
                    setQuantity('');
                    setShowResults(false);
                  }}>
                  <Text style={styles.resultText}>
                    {item.label.replace(/\n/g, ' ')}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

      {/* --- PROCEED BUTTONS --- */}
      {((selectedOption === 'with' && withInvcList.length > 0) ||
        (selectedOption === 'without' && withoutInvcList.length > 0)) && (
        <TouchableOpacity
          style={styles.floatingBillingBtn}
          onPress={() => {
            if (selectedOption === 'with') {
              compOrder();
            } else {
              setModalVisible('Checkout');
            }
          }}>
          <LinearGradient
            colors={[THEME.gradientStart, THEME.gradientEnd]}
            style={styles.floatingBtnGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <View style={styles.floatingBtnContent}>
              <Icon
                name={
                  selectedOption === 'with'
                    ? 'check-circle'
                    : 'arrow-right-circle'
                }
                size={24}
                color={THEME.white}
              />
              <View style={styles.floatingBtnTextContainer}>
                <Text style={styles.floatingBtnTitle}>
                  {selectedOption === 'with'
                    ? 'Complete Return'
                    : 'Proceed Details'}
                </Text>
                <Text style={styles.floatingBtnSubtitle}>
                  Avg Total:{' '}
                  {selectedOption === 'with'
                    ? orderTotal.toFixed(2)
                    : orderTotalWithout.toFixed(2)}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={THEME.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* --- CHECKOUT MODAL (For Without Invoice) --- */}
      <Modal
        visible={modalVisible === 'Checkout'}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.checkoutModalContainer}>
            <View style={styles.checkoutModalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={{padding: 5}}>
                <Icon name="arrow-left" size={24} color={THEME.textDark} />
              </TouchableOpacity>
              <Text style={styles.checkoutModalTitle}>Return Details</Text>
              <View style={{width: 30}} />
            </View>

            <ScrollView contentContainerStyle={{padding: 20}}>
              {/* Supplier Select */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Supplier <Text style={{color: THEME.danger}}>*</Text>
                </Text>
                <DropDownPicker
                  items={transformedSupplier}
                  open={psupplier}
                  setOpen={setpsupplier}
                  value={currentpsupplier}
                  setValue={setCurrentpsupplier}
                  placeholder="Select Supplier"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                  searchable={true}
                  zIndex={3000}
                />
              </View>

              {/* Reference No */}
              <View style={[styles.inputGroup, {zIndex: 1000, marginTop: 15}]}>
                <Text style={styles.label}>Reference No</Text>
                <TextInput
                  style={styles.input}
                  value={ref}
                  onChangeText={setRef}
                  placeholder="Optional"
                />
              </View>

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  onPress={() => setShowexpireDatePicker(true)}
                  style={styles.dateInput}>
                  <Text style={styles.dateText}>
                    {expireDate.toLocaleDateString()}
                  </Text>
                  <Icon name="calendar" size={20} color={THEME.textGray} />
                </TouchableOpacity>
                {showexpireDatePicker && (
                  <DateTimePicker
                    value={expireDate}
                    mode="date"
                    display="default"
                    onChange={onexpireDateChange}
                  />
                )}
              </View>

              <TouchableOpacity
                style={[styles.addToCartBtn, {marginTop: 30}]}
                onPress={compOrderWithoutInvc}>
                <LinearGradient
                  colors={[THEME.primary, '#1e4620']}
                  style={styles.gradientBtn}>
                  <Text style={styles.btnText}>CONFIRM RETURN</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- INVOICE MODAL (Success) --- */}
      <Modal
        visible={modalVisible === 'Invc'}
        animationType="fade"
        transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.checkoutModalContainer, {maxHeight: '60%'}]}>
            <View style={{alignItems: 'center', padding: 20}}>
              <LottieView
                source={require('../../../assets/CheckMark.json')}
                autoPlay
                loop={false}
                style={{width: 150, height: 150}}
              />
              <Text style={[styles.cardTitle, {marginTop: 10}]}>
                Return Success!
              </Text>
              <Text
                style={{
                  color: THEME.textGray,
                  textAlign: 'center',
                  marginTop: 10,
                }}>
                Return has been processed successfully.
              </Text>
              <TouchableOpacity
                style={[styles.addToCartBtn, {marginTop: 30, width: '100%'}]}
                onPress={() => setModalVisible('')}>
                <LinearGradient
                  colors={[THEME.primary, '#1e4620']}
                  style={styles.gradientBtn}>
                  <Text style={styles.btnText}>CLOSE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
    marginBottom: 20, // Space for floating search
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingHorizontal: 20,
    paddingBottom: 40, // Extra padding for floating element
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  floatingSearchContainer: {
    position: 'absolute',
    bottom: -25, // Half overlap
    left: 20,
    right: 20,
    backgroundColor: THEME.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  floatingSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: THEME.textDark,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20, // Offset for floating search
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: THEME.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textGray,
  },
  segmentTextActive: {
    color: THEME.white,
  },

  // Card Styles
  formCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: THEME.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  selectedProdName: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.primary,
    marginBottom: 5,
  },
  selectedProdPrice: {
    fontSize: 13,
    color: THEME.textGray,
    marginBottom: 15,
  },

  // Input Styles
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textDark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    color: THEME.textDark,
    fontSize: 14,
  },
  // Date Input
  dateInput: {
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    color: THEME.textDark,
  },

  // Button Styles
  addToCartBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  btnText: {
    color: THEME.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Cart List Styles
  cartPreviewCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 20,
  },
  cartPreviewHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  cartPreviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
  },
  // Item Card Styles (New)
  itemCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: THEME.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 6,
    lineHeight: 22,
  },
  itemBadge: {
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  itemBadgeText: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '600',
  },
  itemDeleteBtn: {
    padding: 10,
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  itemCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    minWidth: 60,
  },
  itemLabel: {
    fontSize: 11,
    color: THEME.textGray,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.textDark,
  },
  qtyWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  totalContainer: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  itemTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.primary,
  },

  // Quantity Control Styles (Integrated)
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  quantityButton: {
    backgroundColor: THEME.primary,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  quantityDisplay: {
    paddingHorizontal: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
  },
  quantityEditorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    width: 50,
    height: 30,
    borderWidth: 1,
    borderColor: THEME.primary,
    borderRadius: 4,
    textAlign: 'center',
    padding: 0,
    marginRight: 5,
    color: THEME.textDark,
  },
  saveButton: {
    backgroundColor: THEME.success,
    borderRadius: 4,
    padding: 4,
    marginRight: 4,
  },
  cancelButton: {
    backgroundColor: THEME.danger,
    borderRadius: 4,
    padding: 4,
  },

  // Logic from Original: Search Overlay
  searchResultsOverlay: {
    position: 'absolute',
    top: 130, // Adjusted based on header height
    left: 20,
    right: 20,
    backgroundColor: THEME.white,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    maxHeight: 250,
    zIndex: 9999,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  resultText: {
    fontSize: 14,
    color: THEME.textDark,
  },

  // Logic from Original: Floating Button
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

  // Logic from Original: Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutModalContainer: {
    width: '90%',
    backgroundColor: THEME.white,
    borderRadius: 20,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  checkoutModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.background,
  },
  checkoutModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },
  dropdown: {
    borderColor: THEME.border,
    borderRadius: 10,
  },
  dropdownContainer: {
    borderColor: THEME.border,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: THEME.textGray,
    marginTop: 10,
    textAlign: 'center',
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
});
