import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Image,
  BackHandler,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Checkbox} from 'react-native-paper';
import {useDrawer} from '../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BASE_URL from '../../BASE_URL';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import RNPrint from 'react-native-print';
import BottomBar from '../../BottomBar';

// THEME
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
};

interface Supplier {
  id: number;
  sup_name: string;
  sup_company_name: string;
}

interface TransporterData {
  id: number;
  trans_name: string;
}

interface CartItem {
  prod_id: number;
  prod_name: string;
  upc_ean: string;
  prod_purchase_qty: string;
  prod_cost_price: string;
  prod_retail_price: string;
  prod_expiry_date: string;
  fretail_price: string;
  total?: string;
}

interface CheckoutFrom {
  refNumber: string;
  builty: string;
  vehicle: string;
  freCharges: string;
  paidAmount: string;
}

const initialCheckoutFrom: CheckoutFrom = {
  builty: '',
  freCharges: '',
  paidAmount: '',
  refNumber: '',
  vehicle: '',
};

interface InvcOrder {
  id: number;
  prch_invoice_no: string;
  prch_po_number: string;
  prch_date: string;
  prch_sup_id: number;
  prch_trans_id: number;
  prch_builty_no: string;
  prch_vehicle_no: string;
  prch_freight_charges: string;
  prch_total_purchase: string;
  prch_order_total: string;
  prch_paid_amount: string;
  prch_balance: string;
}

interface OrderDetails {
  id: number;
  prchd_prod_name: string;
  prchd_qty: string;
  prchd_cost_price: string;
  prchd_total_cost: string;
}

import {generateReceiptHTML} from '../../../utils/receiptTemplate';

export default function PurchaseAddStock() {
  const {token, bussName, bussAddress, bussContact} = useUser();
  const {openDrawer} = useDrawer();
  const navigation = useNavigation();

  // Print Receipt
  const printReceipt = async () => {
    try {
      if (!invcOrder) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No invoice data available to print.',
        });
        return;
      }

      const html = generateReceiptHTML(
        invcOrder,
        new Date().toLocaleDateString(),
        bussName,
        bussAddress,
        bussContact,
      );
      await RNPrint.print({
        html: html,
      });
    } catch (error) {
      console.error('Print error:', error);
      Toast.show({
        type: 'error',
        text1: 'Print Error',
        text2: 'Failed to print receipt.',
      });
    }
  };

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [retailPrice, setRetailPrice] = useState(''); // Added retail price state if needed

  const [expiry, setExpiry] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const [addToCartOrders, setAddToCartOrders] = useState<CartItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // checkout states
  const [modalVisible, setModalVisible] = useState('');
  const [orderDate, setorderDate] = useState(new Date());
  const [showorderDatePicker, setShoworderDatePicker] = useState(false);

  // Supplier & Transporter
  const [supplierItems, setSupplierItems] = useState<Supplier[]>([]);
  const [issupplier, setissupplier] = useState(false);
  const [currentsupplier, setCurrentsupplier] = useState<string | null>(null);
  const [selectedSupp, setSelectedSupp] = useState<Supplier | null>(null);

  const [transDropdown, setTransDropdown] = useState<TransporterData[]>([]);
  const [isTransporter, setIsTransporter] = useState(false);
  const [currentTransporter, setCurrentTransporter] = useState<string | null>(
    null,
  );

  const [checkOutFrom, SetCheckOutFrom] =
    useState<CheckoutFrom>(initialCheckoutFrom);
  const [errors, setErrors] = useState({
    supplier: '',
    paidAmount: '',
  });

  // Invoice / Receipt
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invcOrder, setInvcOrder] = useState<InvcOrder | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails[]>([]);
  const [animationFinished, setAnimationFinished] = useState(false);

  // Dropdown options
  const transformedSupplier = supplierItems.map(sup => ({
    label: sup.sup_name,
    value: sup.id.toString(),
  }));

  const transformedTransporter = transDropdown.map(trans => ({
    label: trans.trans_name,
    value: trans.id.toString(),
  }));

  // Date Handlers
  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const onorderDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || orderDate;
    setShoworderDatePicker(false);
    setorderDate(currentDate);
  };

  // Checkout inputs handler
  const checkoutOnChange = (field: keyof CheckoutFrom, value: string) => {
    SetCheckOutFrom(prev => ({
      ...prev,
      [field]: value,
    }));
    if (field === 'paidAmount') {
      setErrors(prev => ({...prev, paidAmount: ''}));
    }
  };

  // API Call: Fetch Suppliers
  const fetchSupplierData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/fetchsuppliersdropdown`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setSupplierItems(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  // API Call: Fetch Transporters
  const fetchTransporter = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchTransportersdata`);
      setTransDropdown(res.data.transporter);
    } catch (error) {
      console.log(error);
    }
  };

  // API Call: Search
  const handleSearch = async (text: string) => {
    setSearchTerm(text);
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

  // API Call: Fetch Cart
  const fetchAddToCartOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadpurchasecart`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      if (res.data.cartsessiondata) {
        const cartItems = Object.values(res.data.cartsessiondata).map(
          (item: any) => ({
            ...item,
            total: (
              parseFloat(item.prod_purchase_qty) *
              parseFloat(item.prod_cost_price)
            ).toString(),
          }),
        );

        setAddToCartOrders(cartItems);

        if (res.data.order_total) {
          setOrderTotal(parseFloat(res.data.order_total));
        }
      } else {
        setAddToCartOrders([]);
        setOrderTotal(0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // API Call: Add To Cart
  const purchaseOrderAddToCart = async () => {
    if (!selectedProduct) {
      Toast.show({
        type: 'error',
        text1: 'Warning',
        text2: 'Please select a product first',
      });
      return;
    }

    // Basic validation
    if (!quantity || !purchasePrice) {
      Toast.show({
        type: 'error',
        text1: 'Required',
        text2: 'Quantity and Purchase Price are required',
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/addtopurchasecart`,
        {
          search_name: selectedProduct.value,
          prod_id: selectedProduct.prod_id,
          purchase_qty: quantity,
          cost_price: purchasePrice,
          retail_price: retailPrice, // Even if 0 or empty, send it if strictly needed, or handle on backend
          expiry_date: startDate.toISOString().split('T')[0],
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
        setSearchTerm('');
        setQuantity('');
        setPurchasePrice('');
        setRetailPrice('');
        setStartDate(new Date());
        setExpiry([]);
        setShowResults(false);
        setSelectedProduct(null);
        fetchAddToCartOrders();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // API Call: Delete Cart Item
  const delCartItem = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/removefrompurchasecart?id=${id}&_token=${token}`,
      );
      if (res.status === 200 && res.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Cart item removed successfully!',
          visibilityTime: 1500,
        });
        fetchAddToCartOrders();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // API Call: Empty Cart
  const emptyCart = async () => {
    try {
      await axios.get(`${BASE_URL}/emptypurchasecart`);
    } catch (error) {
      console.log(error);
    }
  };

  // API Call: Checkout
  const checkout = async () => {
    let hasError = false;
    const newErrors = {supplier: '', paidAmount: ''};

    if (!currentsupplier) {
      newErrors.supplier = 'Please select a supplier!';
      hasError = true;
    }

    if (
      !checkOutFrom.paidAmount.trim() ||
      isNaN(Number(checkOutFrom.paidAmount))
    ) {
      newErrors.paidAmount = 'Paid amount is required!';
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    if (addToCartOrders.length === 0) {
      Toast.show({type: 'error', text1: 'Cart is empty'});
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/completepurchase`, {
        supp_id: currentsupplier,
        refrence_no: checkOutFrom.refNumber.trim(),
        date: orderDate.toISOString().split('T')[0],
        transporter_id: currentTransporter,
        builty_no: checkOutFrom.builty,
        vehicle_no: checkOutFrom.vehicle,
        order_total: orderTotal,
        freight_charges: checkOutFrom.freCharges,
        purchase_total:
          Number(orderTotal || 0) + Number(checkOutFrom.freCharges || 0),
        paid_amount: checkOutFrom.paidAmount,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        const newInvoiceNo = res.data.invoice_no;
        setInvoiceNo(newInvoiceNo);

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Purchase completed successfully!',
          visibilityTime: 1500,
        });

        await emptyCart();
        fetchAddToCartOrders();
        SetCheckOutFrom(initialCheckoutFrom);
        setCurrentsupplier(null);
        setCurrentTransporter(null);
        setSearchTerm('');
        setQuantity('');
        setPurchasePrice('');
        setRetailPrice('');
        setStartDate(new Date());
        setExpiry([]);
        setSelectedProduct(null);
        setOrderTotal(0);
        setModalVisible(''); // Close checkout modal

        // Fetch invoice for receipt
        try {
          const res1 = await axios.post(`${BASE_URL}/purchase_invoiceprint`, {
            invoice: newInvoiceNo,
          });
          setInvcOrder(res1.data.purchasedata);
          setOrderDetails(res1.data.detail);
          setAnimationFinished(false);
          setModalVisible('Receipt');
        } catch (invoiceError) {
          console.error('Invoice load fail', invoiceError);
        }
      } else if (res.status === 200 && res.data.status === 203) {
        // Transporter required logic from legacy code if needed
        Toast.show({
          type: 'error',
          text1: 'Please Select Transporter!',
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to complete purchase.',
      });
    }
  };

  // Side Effect: Fetch needed data on mount
  useEffect(() => {
    fetchSupplierData();
    fetchAddToCartOrders();
    fetchTransporter();

    const backKey = () => {
      navigation.navigate('Dashboard' as never);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );
    return () => backHandler.remove();
  }, []); // Run once on mount

  // Fetch supplier details when selection changes
  useEffect(() => {
    if (currentsupplier) {
      const fetchOneSupplier = async () => {
        try {
          const res = await axios.post(`${BASE_URL}/fetchsuppdata`, {
            id: currentsupplier,
          });
          setSelectedSupp(res.data.supplier);
        } catch (e) {
          console.log(e);
        }
      };
      fetchOneSupplier();
    } else {
      setSelectedSupp(null);
    }
  }, [currentsupplier]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
            <Text style={styles.headerTitle}>Add Purchase Stock</Text>
            <View style={{width: 24}} />
          </View>
        </LinearGradient>

        {/* Floating Search */}
        <View style={styles.floatingSearchContainer}>
          <Icon name="magnify" size={22} color={THEME.primary} />
          <TextInput
            placeholder="Search by name or barcode..."
            placeholderTextColor={THEME.textLight}
            style={styles.floatingSearchInput}
            value={searchTerm}
            onChangeText={handleSearch}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close-circle" size={18} color={THEME.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={{paddingBottom: 160}}
        showsVerticalScrollIndicator={false}>
        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Product Details</Text>

          {/* Quantity */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Quantity <Text style={{color: THEME.danger}}>*</Text>
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

          {/* Purchase Price (Row if needed, or stick to simpler stack) */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, {flex: 1, marginRight: 12}]}>
              <Text style={styles.label}>
                Purchase Price <Text style={{color: THEME.danger}}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={THEME.textLight}
                maxLength={9}
                value={purchasePrice}
                onChangeText={setPurchasePrice}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.inputGroup, {flex: 1}]}>
              <Text style={styles.label}>
                Retail Price <Text style={{color: '#999'}}>(Opt)</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={THEME.textLight}
                maxLength={9}
                value={retailPrice}
                onChangeText={setRetailPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Expiry Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.7}
            onPress={() => {
              const newOptions = expiry.includes('on') ? [] : ['on'];
              setExpiry(newOptions);
            }}>
            <Checkbox.Android
              status={expiry.includes('on') ? 'checked' : 'unchecked'}
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.checkboxLabel}>Apply Expiry Date</Text>
          </TouchableOpacity>

          {expiry.includes('on') && (
            <TouchableOpacity
              onPress={() => setShowStartDatePicker(true)}
              style={styles.dateInput}>
              <Icon name="calendar" size={20} color={THEME.textGray} />
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString()}
              </Text>
              <Icon name="chevron-down" size={20} color={THEME.textGray} />
            </TouchableOpacity>
          )}

          {showStartDatePicker && (
            <DateTimePicker
              testID="startDatePicker"
              value={startDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onStartDateChange}
            />
          )}

          {/* Add To Cart Button */}
          <TouchableOpacity
            style={styles.addToCartBtn}
            activeOpacity={0.8}
            onPress={purchaseOrderAddToCart}>
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
              <Text style={styles.btnText}>ADD TO CART</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Cart Items List - Shown directly on screen */}
        {addToCartOrders.length > 0 && (
          <View style={styles.cartPreviewCard}>
            <View style={styles.cartPreviewHeader}>
              <Text style={styles.cartPreviewTitle}>
                Added Items ({addToCartOrders.length})
              </Text>
            </View>
            {addToCartOrders.map((item, index) => (
              <View key={index} style={styles.compactCard}>
                <View style={styles.cardRow}>
                  <View style={{flex: 1, marginRight: 8}}>
                    <Text style={styles.cardProductName} numberOfLines={1}>
                      {item.prod_name}
                    </Text>
                    <View style={styles.uomBadge}>
                      <Text style={styles.uomText}>
                        Qty: {item.prod_purchase_qty}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardTotal}>
                    {Number(item.total).toFixed(2)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.cardRow,
                    {marginTop: 8, justifyContent: 'space-between'},
                  ]}>
                  <View>
                    <Text style={styles.cardUnitPrice}>
                      Cost: {item.prod_cost_price}
                    </Text>
                    {item.prod_expiry_date && (
                      <Text style={styles.cardExpiryText}>
                        Exp: {item.prod_expiry_date}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => delCartItem(item.prod_id)}
                    style={styles.compactDeleteBtn}>
                    <Icon
                      name="delete-outline"
                      size={18}
                      color={THEME.danger}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{height: 80}} />
      </ScrollView>

      {/* Floating Billing/Checkout Button */}
      {addToCartOrders.length > 0 && (
        <TouchableOpacity
          style={styles.floatingBillingBtn}
          onPress={() => setModalVisible('Checkout')}>
          <LinearGradient
            colors={[THEME.gradientStart, THEME.gradientEnd]}
            style={styles.floatingBtnGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <View style={styles.floatingBtnContent}>
              <Icon name="receipt" size={24} color={THEME.white} />
              <View style={styles.floatingBtnTextContainer}>
                <Text style={styles.floatingBtnTitle}>Proceed to Pay</Text>
                <Text style={styles.floatingBtnSubtitle}>
                  Total: {orderTotal.toFixed(2)}
                </Text>
              </View>
              <Icon name="arrow-right" size={24} color={THEME.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Search Overlay */}
      {searchTerm.length > 0 && showResults && searchResults.length > 0 && (
        <View style={styles.searchResultsOverlay}>
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => {
                  setSearchTerm(item.value);
                  setSelectedProduct(item);
                  setQuantity(''); // Reset qty inputs
                  setPurchasePrice(item.prod_costprice);
                  setRetailPrice(item.prod_price);
                  if (item?.prod_expirydate) {
                    setStartDate(new Date(item.prod_expirydate));
                    setExpiry(['on']);
                  }
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

      {/* Checkout Modal */}
      <Modal
        visible={modalVisible === 'Checkout'}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.checkoutModalContainer}>
            <View style={styles.checkoutModalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={[styles.checkoutCloseBtn, {marginRight: 10}]}>
                <Icon name="arrow-left" size={24} color={THEME.textDark} />
              </TouchableOpacity>
              <View style={styles.checkoutHeaderCenter}>
                <Text style={styles.checkoutModalTitle}>Checkout</Text>
              </View>
            </View>

            <ScrollView
              style={styles.checkoutScrollView}
              contentContainerStyle={{paddingBottom: 100}}>
              {/* Order Date */}
              <View style={[styles.checkoutSection, {marginBottom: 12}]}>
                <View style={styles.sectionHeader}>
                  <Icon name="calendar-month" size={20} color={THEME.primary} />
                  <Text style={styles.sectionTitle}>Order Date</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShoworderDatePicker(true)}
                  style={styles.checkoutDateInput}>
                  <Icon name="calendar" size={20} color={THEME.textDark} />
                  <Text style={styles.checkoutDateText}>
                    {orderDate.toLocaleDateString()}
                  </Text>
                  <Icon name="chevron-down" size={20} color={THEME.textDark} />
                </TouchableOpacity>
              </View>
              {showorderDatePicker && (
                <DateTimePicker
                  value={orderDate}
                  mode="date"
                  display="default"
                  onChange={onorderDateChange}
                />
              )}

              {/* Supplier Selection */}
              <View style={[styles.checkoutSection, {marginBottom: 10}]}>
                <View style={styles.sectionHeader}>
                  <Icon name="truck-delivery" size={20} color={THEME.primary} />
                  <Text style={styles.sectionTitle}>Supplier Details</Text>
                </View>
                <View style={styles.customerSelectContainer}>
                  <DropDownPicker
                    items={transformedSupplier}
                    open={issupplier}
                    setOpen={setissupplier}
                    value={currentsupplier}
                    setValue={setCurrentsupplier}
                    placeholder="Select Supplier"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    listMode="SCROLLVIEW"
                    searchable
                    searchTextInputStyle={styles.searchInputStyle}
                    textStyle={{color: THEME.textDark}}
                    placeholderStyle={{color: 'rgba(0,0,0,0.5)'}}
                  />
                  {errors.supplier ? (
                    <Text style={styles.errorText}>{errors.supplier}</Text>
                  ) : null}
                </View>
              </View>

              {/* Supplier Info Card */}
              {selectedSupp && (
                <View style={styles.checkoutSection}>
                  <LinearGradient
                    colors={[THEME.white, '#F0FDF4']}
                    style={styles.supplierCard}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}>
                    <View style={styles.supplierHeader}>
                      <Text style={styles.supplierLabel}>SUPPLIER INFO</Text>
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeText}>Active</Text>
                      </View>
                    </View>
                    <View style={styles.supplierContent}>
                      <View style={styles.avatarContainer}>
                        <Image
                          source={require('../../../assets/man.png')}
                          style={styles.avatar}
                        />
                      </View>
                      <View style={styles.supplierInfo}>
                        <Text style={styles.supplierName}>
                          {selectedSupp.sup_name}
                        </Text>
                        <View style={styles.infoRow}>
                          <Icon
                            name="domain"
                            size={16}
                            color={THEME.textGray}
                          />
                          <Text style={styles.supplierDetailText}>
                            {selectedSupp.sup_company_name}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              )}

              {/* Additional Fields (Ref, Builty, etc) */}
              <View style={styles.checkoutSection}>
                <View style={styles.sectionHeader}>
                  <Icon
                    name="file-document-edit"
                    size={20}
                    color={THEME.primary}
                  />
                  <Text style={styles.sectionTitle}>Additional Details</Text>
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                    <Text style={styles.label}>Ref Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Optional"
                      placeholderTextColor={THEME.textLight}
                      value={checkOutFrom.refNumber}
                      onChangeText={t => checkoutOnChange('refNumber', t)}
                    />
                  </View>
                  <View style={[styles.inputGroup, {flex: 1}]}>
                    <Text style={styles.label}>Builty No</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Optional"
                      placeholderTextColor={THEME.textLight}
                      value={checkOutFrom.builty}
                      onChangeText={t => checkoutOnChange('builty', t)}
                    />
                  </View>
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                    <Text style={styles.label}>Vehicle No</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Optional"
                      placeholderTextColor={THEME.textLight}
                      value={checkOutFrom.vehicle}
                      onChangeText={t => checkoutOnChange('vehicle', t)}
                    />
                  </View>
                  <View style={[styles.inputGroup, {flex: 1}]}>
                    <Text style={styles.label}>Freight Charges</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={THEME.textLight}
                      keyboardType="numeric"
                      value={checkOutFrom.freCharges.toString()}
                      onChangeText={t => checkoutOnChange('freCharges', t)}
                    />
                  </View>
                </View>

                {/* Transporter Select */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Transporter</Text>
                  <DropDownPicker
                    items={transformedTransporter}
                    open={isTransporter}
                    setOpen={setIsTransporter}
                    value={currentTransporter}
                    setValue={setCurrentTransporter}
                    placeholder="Select Transporter"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    listMode="SCROLLVIEW"
                    textStyle={{color: THEME.textDark}}
                    placeholderStyle={{color: 'rgba(0,0,0,0.5)'}}
                  />
                </View>
              </View>

              {/* Payment Summary */}
              <View style={styles.checkoutSection}>
                <Text style={styles.checkoutSectionTitle}>Payment Summary</Text>
                <View style={[styles.inputGroup, {marginBottom: 15}]}>
                  <Text style={styles.label}>
                    Paid Amount <Text style={{color: THEME.danger}}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: errors.paidAmount
                          ? THEME.danger
                          : THEME.border,
                      },
                    ]}
                    placeholder="Enter Amount"
                    placeholderTextColor={THEME.textLight}
                    keyboardType="numeric"
                    value={checkOutFrom.paidAmount}
                    onChangeText={t => checkoutOnChange('paidAmount', t)}
                  />
                  {errors.paidAmount ? (
                    <Text style={styles.errorText}>{errors.paidAmount}</Text>
                  ) : null}
                </View>

                <View style={styles.amountContainer}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: THEME.textGray,
                      marginBottom: 4,
                    }}>
                    Total Payable
                  </Text>
                  <Text style={styles.amountValue}>
                    {(
                      (parseFloat(orderTotal.toString()) || 0) +
                      (parseFloat(checkOutFrom.freCharges) || 0)
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.checkoutFooter}>
              <TouchableOpacity
                style={styles.completePurchaseBtn}
                activeOpacity={0.8}
                onPress={checkout}>
                <LinearGradient
                  colors={[THEME.primary, THEME.primaryDark]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.gradientBtn}>
                  <Text style={styles.completePurchaseBtnText}>
                    CONFIRM ORDER
                  </Text>
                  <Icon
                    name="check-circle-outline"
                    size={22}
                    color={THEME.white}
                    style={{marginLeft: 10}}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Invoice Modal (Receipt) */}
      <Modal
        visible={modalVisible === 'Receipt'}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.receiptModalContainer}>
            {/* Header */}
            <View style={styles.receiptModalHeader}>
              <Text style={styles.receiptHeaderTitle}>Receipt</Text>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={styles.receiptCloseBtn}>
                <Icon name="close" size={20} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{alignItems: 'center', padding: 10}}>
              {/* Success Icon */}
              <View style={styles.successIconWrapper}>
                {!animationFinished ? (
                  <LottieView
                    source={require('../../../assets/CheckMark.json')}
                    autoPlay
                    loop={false}
                    resizeMode="contain"
                    style={{width: 100, height: 100}}
                    onAnimationFinish={() => setAnimationFinished(true)}
                  />
                ) : (
                  <Icon name="check-circle" size={100} color={THEME.success} />
                )}
              </View>

              <Text style={styles.successTitle}>Purchase Successful!</Text>
              <Text style={styles.successSubtitle}>
                Transaction has been completed
              </Text>

              {/* Invoice Card */}
              <View style={styles.invoiceCard}>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Invoice No</Text>
                  <Text style={styles.invoiceValue}>
                    {invcOrder?.prch_invoice_no}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Date</Text>
                  <Text style={styles.invoiceValue}>
                    {new Date().toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceLabel}>Supplier</Text>
                  <Text style={[styles.invoiceValue, {color: THEME.primary}]}>
                    {invcOrder?.prch_sup_id}
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <View>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>
                      {invcOrder?.prch_total_purchase}
                    </Text>
                  </View>
                  <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.totalLabel}>Paid</Text>
                    <Text style={[styles.totalValue, {color: THEME.success}]}>
                      {invcOrder?.prch_paid_amount}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Print Button */}
              <TouchableOpacity
                onPress={printReceipt}
                activeOpacity={0.8}
                style={{
                  marginTop: 20,
                  alignSelf: 'center',
                  marginBottom: 10,
                }}>
                <LinearGradient
                  colors={[THEME.primary, THEME.primaryDark]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 30, // Rounded pill shape
                  }}>
                  <Icon
                    name="printer"
                    size={18}
                    color={THEME.white}
                    style={{marginRight: 8}}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: THEME.white,
                    }}>
                    Print Receipt
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
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
  // Header
  headerWrapper: {
    marginBottom: 20,
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 40,
    paddingHorizontal: 20,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  // Floating Search
  floatingSearchContainer: {
    position: 'absolute',
    bottom: -24,
    left: 12,
    right: 12,
    backgroundColor: THEME.white,
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  floatingSearchInput: {
    flex: 1,
    fontSize: 15,
    color: THEME.textDark,
    marginLeft: 10,
    height: '100%',
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  formCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textGray,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10, // consistent height
    fontSize: 15,
    color: THEME.textDark,
    minHeight: 48,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  checkboxLabel: {
    fontSize: 14,
    color: THEME.textDark,
    marginLeft: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 14,
    color: THEME.textDark,
    fontWeight: '500',
  },
  addToCartBtn: {
    marginTop: 5,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },

  // Cart Preview
  cartPreviewCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cartPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cartPreviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.primary,
  },
  compactCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardProductName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
  },
  uomBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  uomText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.textDark,
  },
  cardTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.primary,
  },
  cardUnitPrice: {
    fontSize: 12,
    color: THEME.textGray,
  },
  cardExpiryText: {
    fontSize: 11,
    color: THEME.danger,
    marginTop: 2,
  },
  compactDeleteBtn: {
    padding: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },

  // Floating Search Results
  searchResultsOverlay: {
    position: 'absolute',
    top: 130, // Adjust based on header height
    left: 20,
    right: 20,
    backgroundColor: THEME.white,
    borderRadius: 12,
    maxHeight: 250,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultText: {
    fontSize: 14,
    color: THEME.textDark,
  },

  // Floating Checkout Btn
  floatingBillingBtn: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    borderRadius: 16,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
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
    marginLeft: 15,
  },
  floatingBtnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.white,
  },
  floatingBtnSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },

  // Checkout Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  checkoutModalContainer: {
    backgroundColor: '#F8F9FA',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },

  checkoutModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  checkoutHeaderCenter: {
    flex: 1,
    marginLeft: 12,
  },
  checkoutModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },

  checkoutCloseBtn: {
    padding: 8,
    borderRadius: 12,
  },
  checkoutScrollView: {
    flex: 1,
    padding: 16,
  },
  checkoutSection: {
    borderRadius: 16,
    marginBottom: 10,
  },
  checkoutSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    marginLeft: 8,
  },
  checkoutDateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
  },
  checkoutDateText: {
    fontSize: 14,
    color: THEME.textDark,
  },
  customerSelectContainer: {
    marginBottom: 4,
  },
  dropdown: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 10,
  },
  dropdownContainer: {
    borderColor: '#E5E7EB',
  },
  searchInputStyle: {
    borderBottomColor: '#E5E7EB',
    color: THEME.textDark,
  },
  errorText: {
    color: THEME.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Supplier Info Card
  supplierCard: {
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  supplierLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.primary,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeText: {
    fontSize: 10,
    color: THEME.primary,
    fontWeight: '700',
  },
  supplierContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  avatar: {
    width: 50,
    height: 50,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  supplierDetailText: {
    fontSize: 12,
    color: THEME.textGray,
  },

  // Bill Summary
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 14,
    color: THEME.textGray,
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
  },
  billTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  billTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
  },

  checkoutBtn: {
    marginTop: 20,
    marginBottom: 20,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutBtnGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.white,
    marginRight: 10,
  },

  // Receipt
  // --- Receipt Modal ---
  receiptModalContainer: {
    backgroundColor: THEME.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '70%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  receiptModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  receiptHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },
  receiptCloseBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  successIconWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.textDark,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: THEME.textGray,
    marginBottom: 24,
  },
  invoiceCard: {
    width: '100%',
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  invoiceLabel: {
    fontSize: 14,
    color: THEME.textGray,
    fontWeight: '500',
  },
  invoiceValue: {
    fontSize: 14,
    color: THEME.textDark,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 12,
    color: THEME.textGray,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textDark,
  },
  receiptFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: THEME.white,
  },
  receiptDoneBtn: {
    backgroundColor: THEME.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  receiptDoneText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Payment
  amountContainer: {
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.primaryLight,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  checkoutFooter: {
    padding: 20,
    backgroundColor: THEME.white,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  completePurchaseBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  completePurchaseBtnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
