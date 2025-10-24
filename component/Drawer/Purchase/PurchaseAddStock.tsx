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
  Image,
  ToastAndroid,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import {Checkbox} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import backgroundColors from '../../Colors';

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
  freCharges: number;
  paidAmount: string;
}

const initialCheckoutFrom: CheckoutFrom = {
  builty: '',
  freCharges: 0,
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

export default function PurchaseAddStock() {
  const {token, bussName, bussAddress, bussContact} = useUser();
  const {openDrawer} = useDrawer();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [expiry, setExpiry] = useState<string[]>([]);
  const [supplierItems, setSupplierItems] = useState<Supplier[]>([]);
  const transformedSupplier = supplierItems.map(sup => ({
    label: sup.sup_name,
    value: sup.id.toString(),
  }));
  const [addToCartOrders, setAddToCartOrders] = useState<CartItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [transDropdown, setTransDropdown] = useState<TransporterData[]>([]);
  const transformedTransporter = transDropdown.map(trans => ({
    label: trans.trans_name,
    value: trans.id.toString(),
  }));
  const [checkOutFrom, SetCheckOutFrom] =
    useState<CheckoutFrom>(initialCheckoutFrom);
  const [selectedSupp, setSelectedSupp] = useState<Supplier | null>(null);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [modalVisible, setModalVisible] = useState('');
  const [invcOrder, setInvcOrder] = useState<InvcOrder | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails[]>([]);

  // Checkout on change
  const checkoutOnChange = (field: keyof CheckoutFrom, value: string) => {
    SetCheckOutFrom(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const [orderDate, setorderDate] = useState(new Date());
  const [showorderDatePicker, setShoworderDatePicker] = useState(false);

  const onorderDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || orderDate;
    setShoworderDatePicker(false);
    setorderDate(currentDate);
  };

  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const [issupplier, setissupplier] = useState(false);
  const [currentsupplier, setCurrentsupplier] = useState<string | null>('');

  const [Labour, setLabour] = useState(false);
  const [currentLabour, setCurrentLabour] = useState<string | null>('');

  // Handle Search
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

  // Fetch Add To Cart Orders
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
              parseFloat(item.purchase_qty) * parseFloat(item.cost_price)
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

  // Purchase Order Add To Cart
  const purchaseOrderAddToCart = async () => {
    if (!selectedProduct) {
      Toast.show({
        type: 'error',
        text1: 'Please select a product first',
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
          retail_price: retailPrice,
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

  // Fetch Supplier Dropdown Data
  const fetchSupplierData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/fetchsuppliersdropdown`, {
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

  // Fetch Selected Supplier Data
  const fetchSuppData = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchsuppdata`, {
        id: currentsupplier,
      });
      setSelectedSupp(res.data.supplier);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Cart Item
  const delCartItem = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/removefrompurchasecart?id=${id}&_token=${token}`,
      );

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
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

  // Fetch Transporter Dropdown
  const fetchTransporter = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchTransportersdata`);
      setTransDropdown(res.data.transporter);
    } catch (error) {
      console.log(error);
    }
  };

  // Empty Cart
  const emptyCart = async () => {
    try {
      await axios.get(`${BASE_URL}/emptypurchasecart`);
    } catch (error) {
      console.log(error);
    }
  };

  // Complete Purchase

  const checkout = async () => {
    // Validation
    if (!currentsupplier) {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Please select a supplier!',
        visibilityTime: 2000,
      });
      return;
    }

    if (
      !checkOutFrom.paidAmount.trim() ||
      isNaN(Number(checkOutFrom.paidAmount))
    ) {
      Toast.show({
        type: 'error',
        text1: 'Paid amount must be a valid number',
      });
      return;
    }

    if (addToCartOrders.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Cart is empty',
      });
      return;
    }

    try {
      // Complete purchase
      const res = await axios.post(`${BASE_URL}/completepurchase`, {
        supp_id: currentsupplier,
        refrence_no: checkOutFrom.refNumber.trim(),
        date: orderDate.toISOString().split('T')[0],
        transporter_id: currentLabour,
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

        // Clear cart and state
        await emptyCart();
        fetchAddToCartOrders();
        SetCheckOutFrom(initialCheckoutFrom);
        setCurrentsupplier('');
        setCurrentLabour('');
        setSearchTerm('');
        setQuantity('');
        setPurchasePrice('');
        setRetailPrice('');
        setStartDate(new Date());
        setExpiry([]);
        setSelectedProduct(null);
        setOrderTotal(0);

        // Fetch invoice data with fresh invoice number
        try {
          const res1 = await axios.post(`${BASE_URL}/purchase_invoiceprint`, {
            invoice: newInvoiceNo, // ✅ Use fresh value
          });

          setInvcOrder(res1.data.purchasedata);
          setOrderDetails(res1.data.detail);
          setModalVisible('Receipt');
        } catch (invoiceError) {
          console.error('Failed to fetch invoice:', invoiceError);
          Toast.show({
            type: 'error',
            text1: 'Warning',
            text2: 'Purchase completed but failed to load invoice',
          });
        }
      } else if (res.status === 200 && res.data.status === 203) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Please Select Transporter!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to complete purchase. Please try again.',
      });
    }
  };

  // Total Quantity Ivoice Order Items
  const totalItemsInvc = orderDetails.reduce(
    (sum, qty) => sum + Number(qty.prchd_qty),
    0,
  );

  // Total Amount of Ivoice Order
  const totalAmountInvc = orderDetails.reduce(
    (sum, amount) => sum + Number(amount.prchd_total_cost),
    0,
  );

  useEffect(() => {
    fetchSupplierData();
    fetchAddToCartOrders();
    fetchTransporter();
    fetchSuppData();
  }, [currentsupplier]);

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
            <Text style={styles.headerTitle}>Purchase Add Stock</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible('Cart')}
            style={[styles.headerBtn]}>
            <Icon name="add-shopping-cart" size={26} color="#fff" />
            {addToCartOrders.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {addToCartOrders.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Product Search Section */}
          <View style={styles.section}>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <Icon
                  name="search"
                  size={22}
                  color={backgroundColors.dark}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholderTextColor="rgba(0,0,0,0.7)"
                  placeholder="Search by name or barcode..."
                  value={searchTerm}
                  onChangeText={handleSearch}
                />
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="rgba(255,255,255,0.7)"
                placeholder="0"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Purchase Price *</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="rgba(255,255,255,0.7)"
                placeholder="0.00"
                value={purchasePrice}
                onChangeText={setPurchasePrice}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Expiry Section */}
            <View style={styles.expirySection}>
              <TouchableOpacity
                style={styles.checkboxRow}
                activeOpacity={0.7}
                onPress={() => {
                  const newOptions = expiry.includes('on')
                    ? expiry.filter(opt => opt !== 'on')
                    : [...expiry, 'on'];
                  setExpiry(newOptions);
                }}>
                <Checkbox.Android
                  status={expiry.includes('on') ? 'checked' : 'unchecked'}
                  color={backgroundColors.primary}
                  uncheckedColor={backgroundColors.dark}
                />
                <Text style={styles.checkboxLabel}>Apply Expiry Date</Text>
              </TouchableOpacity>

              {expiry.includes('on') && (
                <TouchableOpacity
                  onPress={() => setShowStartDatePicker(true)}
                  style={styles.dateInput}>
                  <Icon name="event" size={20} color={backgroundColors.dark} />
                  <Text style={styles.dateText}>
                    {startDate.toLocaleDateString()}
                  </Text>
                  <Icon
                    name="keyboard-arrow-down"
                    size={20}
                    color={backgroundColors.dark}
                  />
                </TouchableOpacity>
              )}
            </View>

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

            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={purchaseOrderAddToCart}>
              <Icon
                name="add-shopping-cart"
                size={20}
                color={backgroundColors.light}
                style={{marginRight: 8}}
              />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
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
                    setQuantity('0');
                    setPurchasePrice(item.prod_costprice);
                    setRetailPrice(item.prod_price);
                    setStartDate(new Date(item?.prod_expirydate ?? new Date()));
                    if (item?.prod_expirydate) {
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
                {addToCartOrders.length} items
              </Text>
            </View>

            {/* Empty Cart */}
            {addToCartOrders.length === 0 ? (
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
                  data={addToCartOrders}
                  keyExtractor={item => item.prod_id.toString()}
                  style={styles.cartList}
                  contentContainerStyle={styles.cartListContent}
                  renderItem={({item}) => (
                    <View style={styles.cartItemContainer}>
                      <View style={styles.cartItemHeader}>
                        <Text style={styles.cartProductName} numberOfLines={2}>
                          {item.prod_name}
                        </Text>
                        <Text style={styles.quantityValue}>
                          {item.prod_purchase_qty}
                        </Text>
                      </View>

                      <View style={styles.cartItemDetails}>
                        <Text style={styles.detailText}>
                          {item.prod_cost_price}
                        </Text>
                        <Text style={styles.detailTextPrice}>
                          {(
                            parseFloat(item.prod_cost_price) *
                            parseFloat(item.prod_purchase_qty)
                          ).toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.cartItemDetails}>
                        <Text style={styles.detailText}>
                          Expiry:{' '}
                          {item.prod_expiry_date
                            ? `${new Date(
                                item.prod_expiry_date,
                              ).toLocaleDateString('en-US', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}`
                            : 'No expiry date'}
                        </Text>
                        <TouchableOpacity
                          onPress={() => delCartItem(item.prod_id)}
                          style={styles.deleteBtn}>
                          <Icon name="delete" size={20} color="#FF5252" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />

                {/* Summary Footer */}
                <View style={styles.cartSummaryContainer}>
                  <View style={styles.cartTotalRow}>
                    <Text style={styles.cartTotalLabel}>Total Amount:</Text>
                    <Text style={styles.cartTotalValue}>
                      PKR {orderTotal.toFixed(2)}
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
              {/* Invoice Date */}
              <View style={styles.checkoutSection}>
                <Text style={styles.checkoutSectionTitle}>Invoice date</Text>
                <View style={[styles.inputGroup, {zIndex: 1000}]}>
                  <TouchableOpacity
                    onPress={() => setShoworderDatePicker(true)}
                    style={styles.dateInput}>
                    <Icon
                      name="event"
                      size={20}
                      color={backgroundColors.dark}
                    />
                    <Text style={styles.dateText}>
                      <Text style={[styles.dateText, {fontWeight: '600'}]}>
                        Order Date:
                      </Text>{' '}
                      {orderDate.toLocaleDateString()}
                    </Text>
                    <Icon
                      name="keyboard-arrow-down"
                      size={20}
                      color={backgroundColors.dark}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Supplier Picker */}
              <View style={styles.checkoutSection}>
                <Text style={styles.checkoutSectionTitle}>Supplier *</Text>
                <View style={[styles.inputGroup, {zIndex: 999}]}>
                  <Icon
                    name="person"
                    size={28}
                    color={backgroundColors.dark}
                    style={styles.personIcon}
                  />
                  <DropDownPicker
                    items={transformedSupplier}
                    open={issupplier}
                    setOpen={setissupplier}
                    value={currentsupplier}
                    setValue={setCurrentsupplier}
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
              {selectedSupp && (
                <View style={styles.checkoutSection}>
                  <View style={styles.checkoutCard}>
                    <Image
                      source={require('../../../assets/man.png')}
                      style={styles.avatar}
                    />
                    <View style={{flex: 1}}>
                      <Text style={styles.supplierName}>
                        {selectedSupp.sup_name}
                      </Text>
                      <Text style={styles.supplierPhone}>
                        {selectedSupp.sup_company_name || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Transporter */}
              <View style={[styles.inputGroup, {zIndex: 999}]}>
                <Text style={styles.checkoutSectionTitle}>Transporter</Text>
                <DropDownPicker
                  items={transformedTransporter}
                  open={Labour}
                  setOpen={setLabour}
                  value={currentLabour}
                  setValue={setCurrentLabour}
                  placeholder="Select Transporter"
                  placeholderStyle={{
                    color: 'rgba(0,0,0,0.7)',
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
                    fontSize: 16,
                  }}
                  listItemLabelStyle={{color: '#144272'}}
                  listMode="MODAL"
                />
              </View>

              {/* Billing */}
              <View style={styles.checkoutSection}>
                <Text style={styles.checkoutSectionTitle}>Billing</Text>
                {/* Reference */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(0,0,0,0.7)"
                    placeholder="Enter Reference"
                    value={checkOutFrom.refNumber}
                    onChangeText={t => checkoutOnChange('refNumber', t)}
                  />
                </View>
                {/* Builty */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(0,0,0,0.7)"
                    placeholder="Enter Builty"
                    value={checkOutFrom.builty}
                    onChangeText={t => checkoutOnChange('builty', t)}
                    keyboardType="number-pad"
                  />
                </View>
                {/* Freight Charges */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Freight Charges"
                    placeholderTextColor="rgba(0,0,0,0.7)"
                    value={
                      checkOutFrom.freCharges
                        ? checkOutFrom.freCharges.toString()
                        : ''
                    }
                    onChangeText={t => checkoutOnChange('freCharges', t)}
                    keyboardType="decimal-pad"
                  />
                </View>
                {/* Vehicle Number */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(0,0,0,0.7)"
                    placeholder="Vehicle Number"
                    value={checkOutFrom.vehicle}
                    onChangeText={t => checkoutOnChange('vehicle', t)}
                  />
                </View>
                {/* Paid Amount */}
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(0,0,0,0.7)"
                    placeholder="Paid Amount *"
                    value={checkOutFrom.paidAmount}
                    onChangeText={t => checkoutOnChange('paidAmount', t)}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Amount to Pay */}
              <View style={styles.checkoutSection}>
                <Text style={styles.checkoutSectionTitle}>Total Amount</Text>
                <View style={styles.amountContainer}>
                  <Text style={styles.amountValue}>
                    {Number(orderTotal) + Number(checkOutFrom.freCharges)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.checkoutFooter}>
              <TouchableOpacity
                style={styles.completePurchaseBtn}
                onPress={checkout}>
                <Text style={styles.completePurchaseBtnText}>
                  Complete Purchase
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Receipt Modal */}
        <Modal
          visible={modalVisible === 'Receipt'}
          animationType="slide"
          transparent
          presentationStyle="overFullScreen">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Modal Handle */}
              <View style={styles.modalHandle} />

              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerLeft}>
                  <View style={styles.invoiceIconContainer}>
                    <Icon name="receipt" size={24} color="#144272" />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Purchase Invoice</Text>
                    <Text style={styles.modalSubtitle}>Invoice Details</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                  }}
                  style={styles.closeButton}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}>
                {/* Company Info Card */}
                <View style={styles.companyCard}>
                  <View style={styles.companyHeader}>
                    <Text style={styles.companyName}>{bussName ?? 'N/A'}</Text>
                  </View>
                  <Text style={styles.companyAddress}>
                    {bussAddress ?? 'N/A'}
                  </Text>
                </View>

                {/* Order Info Grid */}
                <View style={styles.orderInfoGrid}>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Receipt#: </Text>
                    <Text style={styles.infoValue}>
                      {invcOrder?.prch_invoice_no ?? 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>PO Ref#: </Text>
                    <Text style={styles.infoValue}>
                      {invcOrder?.prch_po_number ?? '--'}
                    </Text>
                  </View>

                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Order Date: </Text>
                    <Text style={styles.infoValue}>
                      {invcOrder?.prch_date
                        ? new Date(invcOrder.prch_date)
                            .toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                            .replace(/ /g, '-')
                        : 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Supplier: </Text>
                    <Text style={styles.infoValue}>
                      {supplierItems.find(
                        sup =>
                          sup.id.toString() ===
                          invcOrder?.prch_sup_id?.toString(),
                      )?.sup_name ?? '--'}
                    </Text>
                  </View>

                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Transporter: </Text>
                    <Text style={styles.infoValue}>
                      {transDropdown.find(
                        tran =>
                          tran.id.toString() ===
                          invcOrder?.prch_trans_id?.toString(),
                      )?.trans_name ?? '--'}
                    </Text>
                  </View>

                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Builty#: </Text>
                    <Text style={styles.infoValue}>
                      {invcOrder?.prch_builty_no ?? '--'}
                    </Text>
                  </View>

                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Vehicle: </Text>
                    <Text style={styles.infoValue}>
                      {invcOrder?.prch_vehicle_no ?? '--'}
                    </Text>
                  </View>
                </View>

                {/* Order Table Section */}
                <View style={styles.tableSection}>
                  {/* Table Container */}
                  <View style={styles.tableContainer}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderText, styles.col1]}>
                        Product
                      </Text>
                      <Text style={[styles.tableHeaderText, styles.col2]}>
                        Cost Price
                      </Text>
                      <Text style={[styles.tableHeaderText, styles.col3]}>
                        QTY
                      </Text>
                      <Text style={[styles.tableHeaderText, styles.col4]}>
                        Total
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Table Rows */}
                <FlatList
                  data={orderDetails}
                  keyExtractor={(item, index) =>
                    item?.id ? item.id.toString() : index.toString()
                  }
                  renderItem={({item, index}) => (
                    <View style={[styles.tableRow]}>
                      <Text
                        style={[styles.tableCell, styles.col1]}
                        numberOfLines={2}>
                        {item.prchd_prod_name}
                      </Text>
                      <Text style={[styles.tableCell, styles.col2]}>
                        {item.prchd_cost_price}
                      </Text>
                      <Text style={[styles.tableCell, styles.col3]}>
                        {Number(item.prchd_qty).toLocaleString()}
                      </Text>
                      <Text style={[styles.tableCell, styles.col4]}>
                        {Number(item.prchd_total_cost).toLocaleString()}
                      </Text>
                    </View>
                  )}
                  ListFooterComponent={
                    <View
                      style={{
                        marginHorizontal: 20,
                        flexDirection: 'row',
                        marginTop: 5,
                        borderBottomWidth: 1,
                        borderBottomColor: backgroundColors.dark,
                        paddingBottom: 10,
                        paddingTop: 5,
                      }}>
                      <View style={{flex: 0.2}}>
                        <Text style={styles.tableHeaderText}>Total Items</Text>
                      </View>
                      <View style={{flex: 0.5}}>
                        <Text style={styles.tableHeaderText}>
                          {totalItemsInvc}
                        </Text>
                      </View>
                      <View style={{flex: 0.3}}>
                        <Text style={styles.tableHeaderText}>
                          {totalAmountInvc}
                        </Text>
                      </View>
                    </View>
                  }
                  scrollEnabled={false}
                />

                {/* Receipt Footer */}
                <View style={styles.orderInfoGrid}>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Total Order: </Text>
                    <Text style={styles.infoValue}>
                      {invcOrder?.prch_order_total ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Freight: </Text>
                    <Text style={styles.infoValue}>
                      {invcOrder?.prch_freight_charges ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Total Purchase: </Text>
                    <Text style={styles.infoValue}>
                      {invcOrder?.prch_total_purchase ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Total Paid: </Text>
                    <Text style={styles.infoValue}>
                      {invcOrder?.prch_paid_amount ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Balance: </Text>
                    <Text style={styles.infoValue}>
                      {invcOrder?.prch_balance ?? 'N/A'}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    width: '100%',
                    paddingVertical: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.footerText}>
                    Software Developed with love by
                  </Text>
                  <Text>Technic Mentors</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Toast />

        {/* Date Picker */}
        {showorderDatePicker && (
          <DateTimePicker
            testID="orderDatePicker"
            value={orderDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onorderDateChange}
          />
        )}
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
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.light,
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

  // Cards
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 14,
  },
  section: {
    backgroundColor: backgroundColors.light,
    borderRadius: 15,
    padding: 20,
    paddingTop: 25,
    marginBottom: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
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
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultText: {
    color: backgroundColors.dark,
    fontWeight: '600',
    fontSize: 14,
  },
  inputGroup: {
    width: '100%',
  },
  inputLabel: {
    color: backgroundColors.dark,
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  personIcon: {
    position: 'absolute',
    zIndex: 10000,
    top: 7,
    left: 6,
  },
  input: {
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: backgroundColors.dark,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
    marginBottom: 8,
  },
  expirySection: {
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '500',
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
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

  // Cart Badge
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5252',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
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

  // Search Results
  searchResultsOverlay: {
    position: 'absolute',
    top: 180,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    zIndex: 1000,
    elevation: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 5,
    width: '90%',
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
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 2,
  },
  detailTextPrice: {
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cartListContent: {},
  quantityValue: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#144272',
    minWidth: 30,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 5,
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

  // Receipt Modal stying
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FAFBFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#2a652b24',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyCard: {
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: backgroundColors.dark,
    borderStyle: 'dotted',
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#144272',
  },
  companyAddress: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  orderInfoGrid: {
    marginTop: 10,
    borderBottomColor: backgroundColors.dark,
    borderBottomWidth: 2,
    borderStyle: 'dotted',
    marginHorizontal: 20,
  },
  infoCard: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: backgroundColors.dark,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '400',
  },
  // Items Section
  itemsSection: {
    flex: 1,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  itemsList: {
    paddingHorizontal: 20,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  itemInvoice: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  itemBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#C62828',
  },
  itemDetails: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemDetailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  itemDetailValue: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  itemTotal: {
    color: '#144272',
    fontSize: 14,
  },
  totalsSection: {
    marginTop: 20,
    marginHorizontal: 20,
    borderBottomWidth: 2,
    borderColor: backgroundColors.dark,
    borderStyle: 'dotted',
    paddingBottom: 5,
  },
  totalRow: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingTotalRow: {
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '400',
  },
  pendingLabel: {
    color: backgroundColors.dark,
  },
  pendingValue: {
    color: backgroundColors.dark,
    fontSize: 14,
  },
  modalFooter: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  thankYou: {
    fontSize: 16,
    color: '#144272',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  developerInfo: {
    alignItems: 'center',
  },
  developerText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  companyContact: {
    fontSize: 12,
    color: '#144272',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
  },
  tableSection: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  tableContainer: {
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomColor: backgroundColors.dark,
    borderBottomWidth: 1.5,
    paddingBottom: 5,
  },
  tableHeaderText: {
    color: backgroundColors.dark,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tableCell: {
    fontSize: 12,
    color: backgroundColors.dark,
    textAlign: 'center',
  },
  col1: {
    flex: 0.2, // Total
  },
  col2: {
    flex: 0.3, // Product
  },
  col3: {
    flex: 0.2, // Qty
  },
  col4: {
    flex: 0.3, // Price
  },

  invoiceState: {
    fontSize: 16,
    color: '#144272',
    fontWeight: '600',
    marginBottom: 8,
  },
});
