import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Animated,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
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

export default function PurchaseAddStock() {
  const {token} = useUser();
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

  // Cart Animation
  const bounceAnim = useRef(new Animated.Value(0)).current;

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
        animateCartIcon();
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
    if (!currentsupplier) {
      Toast.show({
        type: 'error',
        text1: 'Please select a supplier',
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
      const res = await axios.post(`${BASE_URL}/completepurchase`, {
        supp_id: currentsupplier,
        refrence_no: checkOutFrom.refNumber.trim(),
        date: orderDate.toISOString().split('T')[0],
        transporter_id: currentLabour,
        builty_no: checkOutFrom.builty,
        vehicle_no: checkOutFrom.vehicle,
        order_total: orderTotal,
        freight_charges: checkOutFrom.freCharges,
        purchase_total: orderTotal + parseFloat(checkOutFrom.freCharges),
        paid_amount: checkOutFrom.paidAmount,
      });

      const data = res.data;
      setInvoiceNo(res.data.invoice_no);

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Purchase completed successfully!',
          visibilityTime: 1500,
        });
        emptyCart();
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
        setModalVisible('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSupplierData();
    fetchAddToCartOrders();
    fetchTransporter();
    fetchSuppData();
  }, [currentsupplier]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Purchase Add Stock</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}
            onPress={() => {}}
            disabled>
            <Icon name="shopping-cart" size={24} color="transparent" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Product Search Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Product</Text>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <Icon
                  name="search"
                  size={20}
                  color="rgba(255,255,255,0.7)"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  placeholder="Search by name or barcode..."
                  value={searchTerm}
                  onChangeText={handleSearch}
                />
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity</Text>
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
                <Text style={styles.inputLabel}>Purchase Price</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  placeholder="0.00"
                  value={purchasePrice}
                  onChangeText={setPurchasePrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.inputGroup, {width: '100%'}]}>
                <Text style={styles.inputLabel}>Retail Price</Text>
                <TextInput
                  style={[styles.input, {width: '100%'}]}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  placeholder="0.00"
                  value={retailPrice}
                  onChangeText={setRetailPrice}
                  keyboardType="decimal-pad"
                />
              </View>
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
                  color="#fff"
                  uncheckedColor="rgba(255,255,255,0.5)"
                />
                <Text style={styles.checkboxLabel}>Apply Expiry Date</Text>
              </TouchableOpacity>

              {expiry.includes('on') && (
                <TouchableOpacity
                  onPress={() => setShowStartDatePicker(true)}
                  style={styles.dateInput}>
                  <Icon name="event" size={20} color="white" />
                  <Text style={styles.dateText}>
                    {startDate.toLocaleDateString()}
                  </Text>
                  <Icon name="keyboard-arrow-down" size={20} color="white" />
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
                color="#144272"
                style={{marginRight: 8}}
              />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>

          {/* Order Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Details</Text>

            <View style={styles.formRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Order Date</Text>
                <TouchableOpacity
                  onPress={() => setShoworderDatePicker(true)}
                  style={styles.dateInput}>
                  <Icon name="event" size={20} color="white" />
                  <Text style={styles.dateText}>
                    {orderDate.toLocaleDateString()}
                  </Text>
                  <Icon name="keyboard-arrow-down" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, {zIndex: 1000}]}>
                <Text style={styles.inputLabel}>Select Supplier</Text>
                <DropDownPicker
                  items={transformedSupplier}
                  open={issupplier}
                  setOpen={setissupplier}
                  value={currentsupplier}
                  setValue={setCurrentsupplier}
                  placeholder="Choose supplier..."
                  placeholderStyle={{color: 'rgba(255,255,255,0.7)'}}
                  textStyle={{color: 'white'}}
                  ArrowUpIconComponent={() => (
                    <Icon name="keyboard-arrow-up" size={18} color="#fff" />
                  )}
                  ArrowDownIconComponent={() => (
                    <Icon name="keyboard-arrow-down" size={18} color="#fff" />
                  )}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  labelStyle={{color: 'white'}}
                  listItemLabelStyle={{color: '#144272'}}
                  listMode="MODAL"
                />
              </View>
            </View>

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

            {/* Supplier Info */}
            {selectedSupp && (
              <View style={styles.supplierInfo}>
                <View style={styles.supplierCard}>
                  <Text style={styles.supplierLabel}>Supplier Name</Text>
                  <Text style={styles.supplierValue}>
                    {selectedSupp.sup_name}
                  </Text>
                </View>
                <View style={styles.supplierCard}>
                  <Text style={styles.supplierLabel}>Company Name</Text>
                  <Text style={styles.supplierValue}>
                    {selectedSupp.sup_company_name}
                  </Text>
                </View>
              </View>
            )}

            {/* Transport Details */}
            <View style={styles.transportSection}>
              <Text style={styles.transportTitle}>Transport Details</Text>

              <View style={styles.formRow}>
                <View style={[styles.inputGroup, {zIndex: 999}]}>
                  <Text style={styles.inputLabel}>Transporter</Text>
                  <DropDownPicker
                    items={transformedTransporter}
                    open={Labour}
                    setOpen={setLabour}
                    value={currentLabour}
                    setValue={setCurrentLabour}
                    placeholder="Choose transporter..."
                    placeholderStyle={{color: 'rgba(255,255,255,0.7)'}}
                    textStyle={{color: 'white'}}
                    ArrowUpIconComponent={() => (
                      <Icon name="keyboard-arrow-up" size={18} color="#fff" />
                    )}
                    ArrowDownIconComponent={() => (
                      <Icon name="keyboard-arrow-down" size={18} color="#fff" />
                    )}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    labelStyle={{color: 'white'}}
                    listItemLabelStyle={{color: '#144272'}}
                    listMode="MODAL"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Reference</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    placeholder="Enter Reference"
                    value={checkOutFrom.refNumber}
                    onChangeText={t => checkoutOnChange('refNumber', t)}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Builty Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    placeholder="Enter Builty"
                    value={checkOutFrom.builty}
                    onChangeText={t => checkoutOnChange('builty', t)}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Vehicle</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    placeholder="Vehicle Number"
                    value={checkOutFrom.vehicle}
                    onChangeText={t => checkoutOnChange('vehicle', t)}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Freight Charges</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    placeholder="0.00"
                    value={checkOutFrom.freCharges}
                    onChangeText={t => checkoutOnChange('freCharges', t)}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Paid Amount</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    placeholder="0.00"
                    value={checkOutFrom.paidAmount}
                    onChangeText={t => checkoutOnChange('paidAmount', t)}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Complete Purchase Button */}
          <TouchableOpacity style={styles.checkoutBtn} onPress={checkout}>
            <Icon name="shopping-cart-checkout" size={20} color="white" />
            <Text style={styles.checkoutBtnText}>Complete Purchase</Text>
          </TouchableOpacity>

          <View style={{height: 100}} />
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

        {/* Floating Cart Button */}
        <Animated.View
          style={[
            styles.floatingCartContainer,
            {
              transform: [
                {
                  scale: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}>
          <TouchableOpacity
            style={styles.floatingCartBtn}
            onPress={() => setModalVisible('Cart')}>
            <Icon name="shopping-cart" size={24} color="white" />
            {addToCartOrders.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {addToCartOrders.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Cart Modal */}
        <Modal
          visible={modalVisible === 'Cart'}
          animationType="slide"
          transparent={false}>
          <SafeAreaView style={styles.cartModalContainer}>
            {/* Header */}
            <View style={styles.cartModalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={styles.cartModalCloseBtn}>
                <Icon name="arrow-back" size={24} color="#144272" />
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
                          PKR {item.prod_cost_price}
                        </Text>
                        <Text style={styles.detailTextPrice}>
                          PKR{' '}
                          {(
                            parseFloat(item.prod_cost_price) *
                            parseFloat(item.prod_purchase_qty)
                          ).toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.cartItemDetails}>
                        <Text style={styles.detailText}>
                          Expiry: {item.prod_expiry_date}
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
                      setModalVisible('');
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
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 12,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultText: {
    color: '#144272',
    fontSize: 14,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    width: '48%',
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 16,
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
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addToCartText: {
    color: '#144272',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minHeight: 40,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    maxHeight: 200,
  },
  supplierInfo: {
    marginTop: 16,
  },
  supplierCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  supplierLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  supplierValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  transportSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  transportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },

  // Floating Cart
  floatingCartContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  floatingCartBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#144272',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
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
    backgroundColor: '#f8f9fa',
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
    color: '#144272',
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
    backgroundColor: 'white',
    borderTopWidth: 1,
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
    backgroundColor: '#144272',
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

  // Checkout Button
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
