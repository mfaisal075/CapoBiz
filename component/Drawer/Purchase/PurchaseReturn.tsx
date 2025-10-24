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
import Icon from 'react-native-vector-icons/MaterialIcons';
import backgroundColors from '../../Colors';

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
  cart_id?: number;
}

export default function PurchaseReturn() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [selectedOption, setSelectedOption] = useState<'with' | 'without'>(
    'with',
  );
  const [supData, setSupData] = useState<SupplierData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchTermWithout, setSearchTermWithout] = useState('');
  const [searchResultsWithout, setSearchResultsWithout] = useState<any[]>([]);
  const [showResultsWithout, setShowResultsWithout] = useState(false);
  const [selectedProductWithout, setSelectedProductWithout] =
    useState<any>(null);
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

  // Cart animation effect
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

  // Handle Search With
  const handleSearch = async (text: string) => {
    setSearchTerm(text);
    if (text.length > 0) {
      try {
        const response = await axios.post(`${BASE_URL}/prinvautocomplete`, {
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

  // Handle Search Without
  const handleSearchWithout = async (text: string) => {
    setSearchTermWithout(text);
    if (text.length > 0) {
      try {
        const response = await axios.post(`${BASE_URL}/autocomplete`, {
          term: text,
        });
        setSearchResultsWithout(response.data);
        setShowResultsWithout(true);
      } catch (error) {
        console.error('Search failed:', error);
        setShowResultsWithout(false);
      }
    } else {
      setShowResultsWithout(false);
    }
  };

  // Add Invoice to Cart
  const addInvoice = async () => {
    if (!selectedProduct) {
      Toast.show({
        type: 'error',
        text1: 'Please select a product first',
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/addtopinvoicecart`,
        {
          search_invoice: searchTerm,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = res.data;

      if (res.status === 200 && data.status) {
        Toast.show({
          type: 'success',
          text1: 'Product added to cart successfully!',
        });
        fetchInvcWith();
        setSearchTerm('');
        setShowResults(false);
        animateCartIcon();
      }
    } catch (error) {
      console.error('Error adding invoice:', error);
    }
  };

  // Add Invoice to Cart Without
  const addInvoiceWithout = async () => {
    if (!selectedProductWithout) {
      Toast.show({
        type: 'error',
        text1: 'Please select a product first',
      });
      return;
    }

    if (!quantity) {
      Toast.show({
        type: 'error',
        text1: 'Please enter quantity',
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/addtopurchreturncart`,
        {
          preturn_prod_id: selectedProductWithout.prod_id,
          purchase_return_prod_name: searchTermWithout,
          purch_return_qty: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = res.data;
      if (res.status === 200 && data.status == 200) {
        Toast.show({
          type: 'success',
          text1: 'Product added to cart successfully!',
        });
        setSearchTermWithout('');
        setShowResultsWithout(false);
        setQuantity('');
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

  // Fetch Supplier Dropdown Data
  const fetchSupplierData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/loadsuppliers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSupplierItems(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      return [];
    }
  };

  // Fetch Supplier Data
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

  // Fetch Return Purchase with invoice
  const fetchInvcWith = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadpinvoicereturncart`);

      if (res.data.cartsession) {
        const cartItems = Object.values(res.data.cartsession).map(
          (item: any) => ({
            ...item,
            cart_id: item.id, // Ensure cart_id is set
            total: (
              item.prod_return_qty * parseFloat(item.prod_price)
            ).toString(),
          }),
        );

        setWithInvcList(cartItems);

        if (res.data.order_total) {
          setOrderTotal(res.data.order_total);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update Quantity API Call
  const updateQuantity = async (
    id: number,
    qty: number,
    type: 'with' | 'without',
  ) => {
    // For "with" type, check if return qty > purchase qty
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
        {
          id: id,
          qty: qty,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.status === 200 && res.data.status) {
        Toast.show({
          type: 'success',
          text1: 'Quantity updated successfully!',
        });

        // Refresh the appropriate list based on type
        if (type === 'with') {
          fetchInvcWith();
        } else {
          fetchInvcWithout();
        }

        return true;
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to update quantity',
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Toast.show({
        type: 'error',
        text1: 'Error updating quantity',
      });
      return false;
    }
  };

  // Delete Cart Item (With Invoice)
  const delCartItem = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/removepurinvoicereturn?id=${id}&_token=${token}`,
      );

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Cart item removed successfully!',
          visibilityTime: 1500,
        });

        fetchInvcWith();
        setOrderTotal(0);
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
    }
  };

  // Delete Cart Item (Without Invoice)
  const delCartItemWithout = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/removepurchasereturn?id=${id}&_token=${token}`,
      );

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Cart item removed successfully!',
          visibilityTime: 1500,
        });

        fetchInvcWithout();
        setOrderTotalWithout(0);
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
    }
  };

  // Fetch Return Purchase without invoice
  const fetchInvcWithout = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadpurchasereturncart`);

      if (res.data.cartsession) {
        const cartItems = Object.values(res.data.cartsession).map(
          (item: any) => ({
            ...item,
            cart_id: item.id, // Ensure cart_id is set
            total: (
              item.prod_return_qty * parseFloat(item.prod_price)
            ).toString(),
          }),
        );

        setWithoutInvcList(cartItems);

        if (res.data.order_total) {
          setOrderTotalWithout(res.data.order_total);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Empty cart with invoice
  const emptyCartWithInvc = async () => {
    try {
      await axios.get(`${BASE_URL}/emptypurchaseinvreturncart`);
    } catch (error) {
      console.log(error);
    }
  };

  // Empty cart without invoice
  const emptyCartWithoutInvc = async () => {
    try {
      await axios.get(`${BASE_URL}/emptypurchasereturncart`);
    } catch (error) {
      console.log(error);
    }
  };

  // Complete Order With Invoice
  const compOrder = async () => {
    if (!withInvcList.length) {
      Toast.show({
        type: 'error',
        text1: 'No items in cart to complete order',
      });
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/purchaseinvoicereturn`,
        {
          invoice_no: withInvcList[0]?.invoice_no,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.status === 200 && res.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Order completed successfully!',
        });
        setWithInvcList([]);
        setOrderTotal(0);
        emptyCartWithInvc();
      } else if (res.status === 200 && res.data.status === 204) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: "The return quantity can't be available in stock!",
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Failed to complete order',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error completing order',
      });
    }
  };

  // Complete Order Without Invoice
  const compOrderWithoutInvc = async () => {
    if (!withoutInvcList.length) {
      ToastAndroid.show('No items in cart to complete order', 4000);
      Toast.show({
        type: 'error',
        text1: 'No items in cart to complete order',
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/completepurchasereturn`, {
        supp_id: currentpsupplier,
        refrence_no: ref,
        date: expireDate.toISOString().split('T')[0],
      });

      const data = res.data;
      console.log(data);

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Order completed successfully!',
        });
        setWithoutInvcList([]);
        setOrderTotalWithout(0);
        emptyCartWithoutInvc();
        setSupData(null);
        setCurrentpsupplier('');
        setModalVisible('');
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Please Select Supplier!',
          visibilityTime: 2000,
        });
        ToastAndroid.show('Please Select Supplier!', 4500);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error completing order',
      });
    }
  };

  // Start editing quantity
  const startEditing = (item: any, type: 'with' | 'without') => {
    setEditingItemId(item.cart_id || item.prod_id);
    setEditingQuantity(item.prod_return_qty.toString());
    setEditingType(type);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItemId(null);
    setEditingQuantity('');
  };

  // Save edited quantity
  const saveQuantity = async () => {
    if (!editingItemId || !editingQuantity) return;

    const qty = parseInt(editingQuantity);
    if (isNaN(qty) || qty <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid quantity',
      });
      return;
    }

    const success = await updateQuantity(editingItemId, qty, editingType);
    if (success) {
      cancelEditing();
    }
  };

  // Increase quantity
  const increaseQuantity = async (item: any, type: 'with' | 'without') => {
    const newQty = item.prod_return_qty + 1;
    await updateQuantity(item.cart_id || item.prod_id, newQty, type);
  };

  // Decrease quantity
  const decreaseQuantity = async (item: any, type: 'with' | 'without') => {
    if (item.prod_return_qty <= 1) return;
    const newQty = item.prod_return_qty - 1;
    await updateQuantity(item.cart_id || item.prod_id, newQty, type);
  };

  useEffect(() => {
    if (currentpsupplier) {
      fetchSupData();
    }
    fetchSupplierData();
    fetchInvcWith();
    fetchInvcWithout();
  }, [currentpsupplier]);

  // Render editable quantity component for "With Invoice" items
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
          <Icon name="remove" size={16} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => startEditing(item, 'with')}
          style={styles.quantityDisplay}>
          <Text style={[styles.quantityText, {color: backgroundColors.dark}]}>
            {item.prod_return_qty}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => increaseQuantity(item, 'with')}
          style={styles.quantityButton}>
          <Icon name="add" size={16} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render cart item for modal
  const renderCartItem = ({item}: {item: InvoiceListWithout}) => (
    <View style={styles.cartItemContainer}>
      <View style={styles.cartItemHeader}>
        <Text style={styles.cartProductName} numberOfLines={2}>
          {item.prod_name}
        </Text>
        <TouchableOpacity
          onPress={() => delCartItemWithout(item.cart_id || item.prod_id)}>
          <Icon name="delete" size={20} color="#FF5252" />
        </TouchableOpacity>
      </View>

      <View style={styles.cartItemDetails}>
        <View style={styles.cartDetailRow}>
          <Text style={[styles.detailLabel, {color: '#144272'}]}>Barcode:</Text>
          <Text style={[styles.detailValue, {color: '#144272'}]}>
            {item.prod_upc_ean}
          </Text>
        </View>
        <View style={styles.cartDetailRow}>
          <Text style={[styles.detailLabel, {color: '#144272'}]}>Price:</Text>
          <Text style={[styles.detailValue, {color: '#144272'}]}>
            PKR {item.prod_price}
          </Text>
        </View>
        <View style={styles.cartDetailRow}>
          <Text style={[styles.detailLabel, {color: '#144272'}]}>
            Quantity:
          </Text>
          <Text style={[styles.detailLabel, {color: '#144272'}]}>
            {item.prod_return_qty}
          </Text>
        </View>
        <View style={styles.cartDetailRow}>
          <Text style={[styles.detailLabel, {color: '#144272'}]}>Total:</Text>
          <Text style={styles.detailValuePrice}>
            PKR{' '}
            {(item.prod_return_qty * parseFloat(item.prod_price)).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Purchase Return</Text>
          </View>

          {selectedOption === 'without' && (
            <TouchableOpacity
              onPress={() => setModalVisible('Cart')}
              style={[styles.headerBtn]}>
              <Icon name="add-shopping-cart" size={26} color="#fff" />
              {withoutInvcList.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {withoutInvcList.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled>
          {/* Toggle Section */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedOption === 'with' && styles.toggleButtonActive,
              ]}
              onPress={() => setSelectedOption('with')}>
              <Text
                style={[
                  styles.toggleButtonText,
                  selectedOption === 'with' && styles.toggleButtonTextActive,
                ]}>
                Return With Invoice
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedOption === 'without' && styles.toggleButtonActive,
              ]}
              onPress={() => setSelectedOption('without')}>
              <Text
                style={[
                  styles.toggleButtonText,
                  selectedOption === 'without' && styles.toggleButtonTextActive,
                ]}>
                Return Without Invoice
              </Text>
            </TouchableOpacity>
          </View>

          {selectedOption === 'with' ? (
            <View>
              {/* Search Section */}
              <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                  <Icon
                    name="search"
                    size={20}
                    color={backgroundColors.dark}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholderTextColor="rgba(0,0,0,0.7)"
                    placeholder="Search Invoice..."
                    value={searchTerm}
                    onChangeText={handleSearch}
                  />
                  <TouchableOpacity onPress={addInvoice}>
                    <Icon name="add" size={24} color={backgroundColors.dark} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Cart Items */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Return Items</Text>

                {withInvcList.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Icon name="receipt" size={40} color="rgba(0,0,0,0.5)" />
                    <Text style={styles.emptyText}>
                      No items added for return
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={withInvcList}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={false}
                    renderItem={({item}) => (
                      <View style={styles.withCartItemContainer}>
                        <View style={styles.withCartItemHeader}>
                          <Text
                            style={styles.withCartProductName}
                            numberOfLines={2}>
                            {item.prod_name}
                          </Text>
                          <TouchableOpacity
                            onPress={() =>
                              delCartItem(item.cart_id || item.prod_id)
                            }>
                            <Icon name="delete" size={24} color="#FF5252" />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.withCartItemDetails}>
                          <View style={styles.withDetailRow}>
                            <Text style={styles.withDetailLabel}>
                              Purchase Qty:
                            </Text>
                            <Text style={styles.detailValue}>
                              {item.prod_purchase_qty}
                            </Text>
                          </View>
                          <View style={styles.withDetailRow}>
                            <Text style={styles.withDetailLabel}>
                              Return Qty:
                            </Text>
                            {renderQuantityWithInvoice(item)}
                          </View>
                          <View style={styles.withDetailRow}>
                            <Text style={styles.withDetailLabel}>Price:</Text>
                            <Text style={styles.detailValue}>
                              {item.prod_price}
                            </Text>
                          </View>
                          <View style={styles.withDetailRow}>
                            <Text style={styles.withDetailLabel}>Total:</Text>
                            <Text style={styles.detailValue}>
                              {(
                                item.prod_return_qty *
                                parseFloat(item.prod_price)
                              ).toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  />
                )}

                {withInvcList.length > 0 && (
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>
                      {orderTotal.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Complete Button */}
              <TouchableOpacity
                style={[
                  styles.checkoutBtn,
                  withInvcList.length === 0 && styles.checkoutBtnDisabled,
                ]}
                onPress={compOrder}
                disabled={withInvcList.length === 0}>
                <Icon
                  name="shopping-cart-checkout"
                  size={20}
                  color={
                    withInvcList.length === 0
                      ? backgroundColors.dark
                      : backgroundColors.light
                  }
                />
                <Text
                  style={[
                    styles.checkoutBtnText,
                    withInvcList.length === 0 && styles.checkoutDisableBtnText,
                  ]}>
                  Complete Return
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* Search Section Without Invoice */}
              <View style={styles.section}>
                <View style={styles.searchContainer}>
                  <View style={styles.searchInputWrapper}>
                    <Icon
                      name="search"
                      size={20}
                      color={backgroundColors.dark}
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholderTextColor="rgba(0,0,0,0.7)"
                      placeholder="Search Product..."
                      value={searchTermWithout}
                      onChangeText={handleSearchWithout}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.inputGroup]}>
                    <TextInput
                      style={styles.input}
                      placeholderTextColor="rgba(0,0,0,0.7)"
                      placeholder="Enter quantity"
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={addInvoiceWithout}>
                  <Icon
                    name="add"
                    size={20}
                    color={backgroundColors.light}
                    style={{marginRight: 8}}
                  />
                  <Text style={styles.addToCartText}>Add Product</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{height: 60}} />
        </ScrollView>

        {/* Search Results Overlay */}
        {searchTerm.length > 0 && showResults && searchResults.length > 0 && (
          <View style={styles.searchResultsOverlay}>
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  key={item.prod_id}
                  style={styles.resultItem}
                  onPress={() => {
                    setSearchTerm(item.value);
                    setSelectedProduct(item);
                    setShowResults(false);
                    fetchInvcWith();
                  }}>
                  <Text style={styles.resultText}>
                    {item.label.replace(/\n/g, ' ')}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Search Results Overlay Without */}
        {searchTermWithout.length > 0 &&
          showResultsWithout &&
          searchResultsWithout.length > 0 && (
            <View style={styles.searchResultsOverlay}>
              <FlatList
                data={searchResultsWithout}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity
                    key={item.prod_id}
                    style={styles.resultItem}
                    onPress={() => {
                      setSearchTermWithout(item.value);
                      setSelectedProductWithout(item);
                      setShowResultsWithout(false);
                    }}>
                    <Text style={styles.resultText}>
                      {item.label.replace(/\n/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

        {/* Cart Modal */}
        <Modal
          visible={modalVisible === 'Cart'}
          animationType="fade"
          transparent={false}>
          <SafeAreaView style={styles.cartModalContainer}>
            {/* Header */}
            <View style={styles.cartModalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={styles.cartModalCloseBtn}>
                <Icon
                  name="arrow-back"
                  size={24}
                  color={backgroundColors.dark}
                />
              </TouchableOpacity>
              <Text style={styles.cartModalTitle}>Shopping Cart</Text>
              <Text style={styles.cartItemCount}>
                {withoutInvcList.length} items
              </Text>
            </View>

            {/* Empty Cart */}
            {withoutInvcList.length === 0 ? (
              <View style={styles.emptyCartContainer}>
                <Icon name="shopping-cart" size={80} color="#ccc" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <Text style={styles.emptyCartSubtext}>
                  Add some products to get started
                </Text>
              </View>
            ) : (
              <>
                {/* Cart List */}
                <FlatList
                  data={withoutInvcList}
                  keyExtractor={item =>
                    (item.cart_id || item.prod_id).toString()
                  }
                  style={styles.cartList}
                  contentContainerStyle={styles.cartListContent}
                  renderItem={renderCartItem}
                />

                {/* Summary Footer */}
                <View style={styles.cartSummaryContainer}>
                  <View style={styles.cartTotalRow}>
                    <Text style={styles.cartTotalLabel}>Total Amount:</Text>
                    <Text style={styles.cartTotalValue}>
                      {orderTotalWithout.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.proceedBtn}
                    onPress={() => {
                      setModalVisible('Checkout');
                    }}>
                    <Text style={styles.proceedBtnText}>
                      Proceed to Checkout
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <Toast />
          </SafeAreaView>
        </Modal>

        {/* Checkout Modal */}
        <Modal
          visible={modalVisible === 'Checkout'}
          animationType="fade"
          transparent={false}>
          <SafeAreaView style={styles.container}>
            <View style={styles.checkoutModalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible('Cart')}
                style={styles.headerBtn}>
                <Icon
                  name="arrow-back"
                  size={24}
                  color={backgroundColors.dark}
                />
              </TouchableOpacity>
              <Text style={styles.checkoutModalTitle}>Checkout</Text>
            </View>

            <ScrollView
              style={styles.checkoutScrollView}
              contentContainerStyle={{paddingBottom: 100}}>
              {/* Return Date */}
              <View style={styles.checkoutSection}>
                <Text style={styles.checkoutSectionTitle}>Return date</Text>
                <TouchableOpacity
                  onPress={() => setShowexpireDatePicker(true)}
                  style={styles.dateInput}>
                  <Icon name="event" size={20} color={backgroundColors.dark} />
                  <Text style={styles.dateText}>
                    {expireDate.toLocaleDateString()}
                  </Text>
                  <Icon
                    name="keyboard-arrow-down"
                    size={20}
                    color={backgroundColors.dark}
                  />
                </TouchableOpacity>

                {showexpireDatePicker && (
                  <DateTimePicker
                    testID="expireDatePicker"
                    value={expireDate}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onexpireDateChange}
                  />
                )}
              </View>
              <View style={styles.checkoutSection}>
                <Text style={styles.checkoutSectionTitle}>Supplier *</Text>
                <View style={styles.inputGroup}>
                  <Icon
                    name="person"
                    size={28}
                    color={backgroundColors.dark}
                    style={styles.personIcon}
                  />
                  <DropDownPicker
                    items={transformedSupplier}
                    open={psupplier}
                    setOpen={setpsupplier}
                    value={currentpsupplier}
                    setValue={setCurrentpsupplier}
                    placeholder="Select Supplier"
                    placeholderStyle={{
                      color: 'rgba(0,0,0,0.7)',
                      marginLeft: 30,
                      fontSize: 16,
                    }}
                    textStyle={{color: 'white'}}
                    ArrowUpIconComponent={() => (
                      <Icon
                        name="keyboard-arrow-up"
                        size={18}
                        color={backgroundColors.dark}
                      />
                    )}
                    ArrowDownIconComponent={() => (
                      <Icon
                        name="keyboard-arrow-down"
                        size={18}
                        color={backgroundColors.dark}
                      />
                    )}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    labelStyle={{
                      color: backgroundColors.dark,
                      marginLeft: 30,
                      fontSize: 16,
                    }}
                    listItemLabelStyle={{color: '#144272'}}
                    listMode="MODAL"
                    searchable
                    searchTextInputStyle={{
                      borderWidth: 0,
                      width: '100%',
                    }}
                    searchContainerStyle={{
                      borderColor: backgroundColors.gray,
                    }}
                  />
                </View>
              </View>

              {/* Supplier Details */}
              {supData && (
                <View style={styles.checkoutSection}>
                  <View style={styles.checkoutCard}>
                    <Image
                      source={require('../../../assets/man.png')}
                      style={styles.avatar}
                    />
                    <View style={{flex: 1}}>
                      <Text style={styles.supplierName}>
                        {supData?.sup_name}
                      </Text>
                      <Text style={styles.supplierPhone}>
                        {supData?.sup_company_name} | {supData?.sup_address}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Amount to Pay */}
              <View style={styles.checkoutSection}>
                <Text style={styles.checkoutSectionTitle}>Total Amount</Text>
                <View style={styles.amountContainer}>
                  <Text style={styles.amountValue}>
                    {orderTotalWithout.toFixed(2)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.checkoutFooter}>
              <TouchableOpacity
                style={styles.completePurchaseBtn}
                onPress={compOrderWithoutInvc}>
                <Text style={styles.completePurchaseBtnText}>
                  Complete Purchase
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        <Toast />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: backgroundColors.primary,
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  menuIcon: {
    width: 28,
    height: 28,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gradientBackground: {
    flex: 1,
  },

  scrollContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  section: {
    backgroundColor: backgroundColors.light,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginVertical: 8,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.primary,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleButton: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: backgroundColors.light,
    borderColor: backgroundColors.gray,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  toggleButtonActive: {
    backgroundColor: backgroundColors.primary,
  },
  toggleButtonText: {
    color: backgroundColors.dark,
    fontWeight: 'bold',
  },
  toggleButtonTextActive: {
    color: backgroundColors.light,
  },

  searchContainer: {
    marginBottom: 10,
    position: 'relative',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: backgroundColors.dark,
    fontSize: 16,
    paddingVertical: 12,
  },

  formRow: {
    marginBottom: 12,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    height: 48,
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
  },
  input: {
    paddingVertical: 10,
    color: backgroundColors.dark,
    fontSize: 16,
    paddingHorizontal: 12,
  },
  
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
  },
  dateText: {
    flex: 1,
    color: backgroundColors.dark,
    fontSize: 16,
    marginLeft: 8,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addToCartText: {
    color: backgroundColors.light,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: backgroundColors.light,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
    marginBottom: 4,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    maxHeight: 200,
  },
  supplierInfo: {
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
  },
  supplierCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  supplierLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  supplierValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '300',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  detailValue: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '500',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  totalLabel: {
    color: backgroundColors.dark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    color: backgroundColors.dark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 16,
    marginTop: 10,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 16,
    shadowColor: backgroundColors.dark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutBtnDisabled: {
    backgroundColor: backgroundColors.gray,
  },
  checkoutBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  checkoutDisableBtnText: {
    color: backgroundColors.dark,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultText: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '600',
  },
  searchResultsOverlay: {
    position: 'absolute',
    top: 220,
    left: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    zIndex: 1000,
    elevation: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 5,
    width: '95%',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#FF5252',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Cart Modal
  cartModalContainer: {
    flex: 1,
    backgroundColor: backgroundColors.gray,
  },
  cartModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cartModalCloseBtn: {
    padding: 5,
  },
  cartModalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: backgroundColors.dark,
    textAlign: 'center',
  },
  cartItemCount: {
    fontSize: 14,
    color: '#666',
  },
  cartItemContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cartProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
    flex: 1,
  },
  cartItemDetails: {
    marginTop: 4,
  },
  cartDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailValuePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyCartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  cartSummaryContainer: {
    padding: 20,
    backgroundColor: backgroundColors.light,
    borderTopWidth: 1,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    borderTopColor: '#e0e0e0',
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cartTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#144272',
  },
  cartTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  proceedBtn: {
    backgroundColor: backgroundColors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartList: {
    flex: 1,
  },
  cartListContent: {
    paddingBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 66, 114, 0.1)',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#144272',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisplay: {
    minWidth: 40,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  quantityText: {
    color: '#144272',
    fontWeight: 'bold',
    fontSize: 14,
  },
  quantityEditorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    width: 60,
    backgroundColor: 'white',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: backgroundColors.dark,
    fontSize: 14,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    padding: 4,
    marginLeft: 4,
  },
  cancelButton: {
    backgroundColor: '#FF5252',
    borderRadius: 4,
    padding: 4,
    marginLeft: 4,
  },
  withCartItemContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  withCartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  withCartProductName: {
    color: backgroundColors.dark,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  withCartItemDetails: {
    marginTop: 8,
  },
  withDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  withDetailLabel: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 14,
  },

  // ================= NEW CHECKOUT MODAL STYLES =================
  checkoutModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 8,
    backgroundColor: backgroundColors.light,
  },
  checkoutModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: backgroundColors.dark,
    textAlign: 'center',
    flex: 1,
    marginRight: 24, // Adjust for the back button
  },
  checkoutScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  checkoutSection: {
    marginBottom: 5,
  },
  checkoutSectionTitle: {
    fontSize: 14,
    color: backgroundColors.dark,
    marginBottom: 8,
    fontWeight: '500',
  },
  checkoutCard: {
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutCardText: {
    fontSize: 16,
    color: backgroundColors.dark,
    marginLeft: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: backgroundColors.dark,
  },
  supplierPhone: {
    fontSize: 14,
    color: 'gray',
  },
  amountContainer: {
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  amountCurrency: {
    fontSize: 16,
    color: 'gray',
  },
  checkoutFooter: {
    padding: 20,
    backgroundColor: backgroundColors.light,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  completePurchaseBtn: {
    backgroundColor: backgroundColors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  completePurchaseBtnText: {
    color: backgroundColors.light,
    fontSize: 18,
    fontWeight: 'bold',
  },
  personIcon: {
    position: 'absolute',
    zIndex: 10000,
    top: 7,
    left: 6,
  },
});
