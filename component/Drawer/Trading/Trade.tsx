import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Modal,
  Animated,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState, useRef} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useUser} from '../../CTX/UserContext';

interface Customers {
  id: number;
  cust_name: string;
  cust_fathername: string;
}

interface Supplier {
  id: number;
  sup_name: string;
  sup_company_name: string;
}

interface ProductDetails {
  name: string;
  barCode: string;
  costPrice: string;
  salePrice: string;
  qty: string;
}

const initialProductDetails: ProductDetails = {
  barCode: '',
  costPrice: '',
  name: '',
  qty: '',
  salePrice: '',
};

interface CartItem {
  id: number;
  tmptrd_qty: string;
  tmptrd_cost_price: string;
  tmptrd_sale_price: string;
  tmptrd_sub_total: string;
  prod_name: string;
}

interface SelectedCustomer {
  name: string;
  fatherName: string;
  address: string;
}

const initialSelectedCust: SelectedCustomer = {
  address: '',
  fatherName: '',
  name: '',
};

interface SelectedSupplier {
  name: string;
  compnayName: string;
  address: string;
}

const initialSelectedSup: SelectedSupplier = {
  address: '',
  compnayName: '',
  name: '',
};

interface CheckoutDetails {
  costtotal: string;
  saletotal: string;
  profitandloss: string;
  payable: string;
}

export default function Trade() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Cart Animation
  const bounceAnim = useRef(new Animated.Value(0)).current;

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
  const [prodDetails, setProdDetails] = useState<ProductDetails>(
    initialProductDetails,
  );
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [custData, setCustData] = useState<Customers[]>([]);
  const transformedCust = custData.map(cust => ({
    label: cust.cust_name,
    value: cust.id.toString(),
  }));
  const [supData, setSupData] = useState<Supplier[]>([]);
  const transformedSup = supData.map(sup => ({
    label: `${sup.sup_name}_${sup.sup_company_name}`,
    value: sup.id.toString(),
  }));
  const [supOpen, setSupOpen] = useState(false);
  const [supValue, setSupValue] = useState('');
  const [custOpen, setCustOpen] = useState(false);
  const [custValue, setCustValue] = useState('');
  const [selectedCust, setSelectedCust] =
    useState<SelectedCustomer>(initialSelectedCust);
  const [selectedSup, setSelectedSup] =
    useState<SelectedSupplier>(initialSelectedSup);
  const [checkoutDetails, setCheckoutDetails] =
    useState<CheckoutDetails | null>(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [modalVisible, setModalVisible] = useState('');

  // Product Details onChange
  const detailsOnChange = (field: keyof ProductDetails, value: string) => {
    setProdDetails(prev => ({
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
        console.log(response.data);
      } catch (error) {
        console.error('Search failed:', error);
        setShowResults(false);
      }
    } else {
      setShowResults(false);
    }
  };

  // Handle Store Product
  const handleStore = async () => {
    if (!selectedProduct) {
      Toast.show({
        type: 'error',
        text1: 'Select Product First',
      });
      return;
    }

    if (!prodDetails.qty || !prodDetails.salePrice || !prodDetails.costPrice) {
      Toast.show({
        type: 'error',
        text1: 'Please enter quantity, sale price, and cost price',
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/temp_store`, {
        search_name: selectedProduct.value,
        prod_id: selectedProduct.prod_id,
        cond_type: 'Add',
        cost_price: prodDetails.costPrice,
        sale_price: prodDetails.salePrice,
        qty: prodDetails.qty,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Product has been added successfully',
          visibilityTime: 1500,
        });

        setProdDetails(initialProductDetails);
        setSelectedProduct([]);
        setSearchTerm('');
        fetchCartItems();
        animateCartIcon();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Sale price must be greater than cost price!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Cart Items
  const fetchCartItems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/temp_loadproductcart`);
      setCartItems(res.data.cart);
      setCheckoutDetails(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Handle Delete Item from the Cart
  const handleDelete = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/deletetemptrade?id=${id}&_token=${token}`,
      );

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Product has been deleted successfully.',
          visibilityTime: 1500,
        });

        fetchCartItems();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Customer Dropdown
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcustomersdata`);
      setCustData(res.data.cust);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Supplier Dropdown
  const fetchSupplier = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadsuppliers`);
      setSupData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Customer Data
  const fetchCustData = async () => {
    if (custValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchcustdata`, {
          id: custValue,
        });

        setSelectedCust({
          address: res.data.customer.cust_address,
          fatherName: res.data.customer.cust_fathername,
          name: res.data.customer.cust_name,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Fetch Customer Data
  const fetchSupData = async () => {
    if (supValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchsuppdata`, {
          id: supValue,
        });

        setSelectedSup({
          address: res.data.supplier.sup_address,
          compnayName: res.data.supplier.sup_company_name,
          name: res.data.supplier.sup_name,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Handle Checkout
  const handleCheckout = async () => {
    if (!supValue) {
      Toast.show({
        type: 'error',
        text1: 'Please select a supplier',
        visibilityTime: 1500,
      });
      return;
    }
    if (!custValue) {
      Toast.show({
        type: 'error',
        text1: 'Please select a customer',
        visibilityTime: 1500,
      });
      return;
    }
    if (!refNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a reference number',
        visibilityTime: 1500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/checkouttrade`, {
        invoice_no: '',
        ref_no: refNumber.trim(),
        supplier_id: supValue,
        customer_id: custValue,
        cost_price: checkoutDetails?.costtotal,
        totalsale_price: checkoutDetails?.saletotal,
        profit_amount: checkoutDetails?.profitandloss,
        payable: checkoutDetails?.payable,
        paid: paidAmount,
        date: orderDate.toISOString().split('T')[0],
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Checkout successfully',
          visibilityTime: 1500,
        });

        setCheckoutDetails(null);
        await axios.post(`${BASE_URL}/clearCart`);
        fetchCartItems();
        setPaidAmount('');
        setRefNumber('');
        setSupValue('');
        setCustValue('');
        setSelectedSup(initialSelectedSup);
        setSelectedCust(initialSelectedCust);
      } else if (res.status === 200 && data.status === 409) {
        Toast.show({
          type: 'info',
          text1: 'Warning!',
          text2: 'Paid amount should equal to payable amount!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This Reference No. is Already exist!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 409) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Paid amount should equal to payable amount!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Please add some product in cart!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCartItems();
    fetchCustomers();
    fetchSupplier();
    fetchCustData();
    fetchSupData();
  }, [custValue, supValue]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Trading</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}
            onPress={() => {}}
            disabled>
            <Icon name="swap-horiz" size={24} color="transparent" />
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
                  placeholder="Search Product..."
                  value={searchTerm}
                  onChangeText={handleSearch}
                />
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sale Price</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={prodDetails.salePrice}
                  onChangeText={t => detailsOnChange('salePrice', t)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cost Price</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={prodDetails.costPrice}
                  onChangeText={t => detailsOnChange('costPrice', t)}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.inputGroup, {width: '100%'}]}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={[styles.input, {width: '100%'}]}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  placeholder="0"
                  keyboardType="numeric"
                  value={prodDetails.qty}
                  onChangeText={t => detailsOnChange('qty', t)}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleStore}>
              <Icon
                name="add"
                size={20}
                color="#144272"
                style={{marginRight: 8}}
              />
              <Text style={styles.addToCartText}>Add Product</Text>
            </TouchableOpacity>
          </View>

          {/* Invoice Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>

            <View style={styles.formRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Invoice No</Text>
                <View style={styles.infoDisplay}>
                  <Text style={styles.infoDisplayText}>Auto Generated</Text>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reference No *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter reference"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={refNumber}
                  onChangeText={t => setRefNumber(t)}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.inputGroup, {zIndex: 1000}]}>
                <Text style={styles.inputLabel}>Select Supplier</Text>
                <DropDownPicker
                  items={transformedSup}
                  open={supOpen}
                  setOpen={setSupOpen}
                  value={supValue}
                  setValue={setSupValue}
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

            {/* Supplier Info */}
            {selectedSup.name && (
              <View style={styles.supplierInfo}>
                <View style={styles.supplierCard}>
                  <Text style={styles.supplierLabel}>Supplier Name</Text>
                  <Text style={styles.supplierValue}>{selectedSup.name}</Text>
                </View>
                <View style={styles.supplierCard}>
                  <Text style={styles.supplierLabel}>Company Name</Text>
                  <Text style={styles.supplierValue}>
                    {selectedSup.compnayName}
                  </Text>
                </View>
                <View style={styles.supplierCard}>
                  <Text style={styles.supplierLabel}>Address</Text>
                  <Text style={styles.supplierValue}>
                    {selectedSup.address}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Customer Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Details</Text>

            <View style={styles.formRow}>
              <View style={[styles.inputGroup, {zIndex: 999}]}>
                <Text style={styles.inputLabel}>Select Customer</Text>
                <DropDownPicker
                  items={transformedCust}
                  open={custOpen}
                  setOpen={setCustOpen}
                  value={custValue}
                  setValue={setCustValue}
                  placeholder="Choose customer..."
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

            {/* Customer Info */}
            {selectedCust.name && (
              <View style={styles.customerInfo}>
                <View style={styles.customerCard}>
                  <Text style={styles.customerLabel}>Customer Name</Text>
                  <Text style={styles.customerValue}>{selectedCust.name}</Text>
                </View>
                <View style={styles.customerCard}>
                  <Text style={styles.customerLabel}>Father Name</Text>
                  <Text style={styles.customerValue}>
                    {selectedCust.fatherName}
                  </Text>
                </View>
                <View style={styles.customerCard}>
                  <Text style={styles.customerLabel}>Address</Text>
                  <Text style={styles.customerValue}>
                    {selectedCust.address}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Checkout Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Checkout Summary</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelContainer}>
                  <Icon
                    name="trending-down"
                    size={20}
                    color="#fff"
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Cost Total:</Text>
                </View>
                <Text style={styles.summaryValue}>
                  PKR {checkoutDetails?.costtotal ?? '0.00'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelContainer}>
                  <Icon
                    name="trending-up"
                    size={20}
                    color="#fff"
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Sale Total:</Text>
                </View>
                <Text style={styles.summaryValue}>
                  PKR {checkoutDetails?.saletotal ?? '0.00'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelContainer}>
                  <Icon
                    name="account-balance"
                    size={20}
                    color="#4CAF50"
                    style={styles.summaryIcon}
                  />
                  <Text style={[styles.summaryLabel, styles.profitLabel]}>
                    Profit/Loss:
                  </Text>
                </View>
                <Text style={[styles.summaryValue, styles.profitValue]}>
                  PKR {checkoutDetails?.profitandloss ?? '0.00'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelContainer}>
                  <Icon
                    name="payment"
                    size={20}
                    color="#fff"
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Payable:</Text>
                </View>
                <Text style={styles.summaryValue}>
                  PKR {checkoutDetails?.payable ?? '0.00'}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>

            <View style={styles.formRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Paid Amount</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  keyboardType="numeric"
                  value={paidAmount}
                  onChangeText={t => setPaidAmount(t)}
                />
              </View>
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
            </View>

            {showorderDatePicker && (
              <DateTimePicker
                testID="startDatePicker"
                value={orderDate}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onorderDateChange}
              />
            )}

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}>
              <Icon name="shopping-cart-checkout" size={20} color="white" />
              <Text style={styles.checkoutButtonText}>Complete Trade</Text>
            </TouchableOpacity>
          </View>

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
                    setProdDetails({
                      barCode: item.value,
                      costPrice: item.prod_costprice,
                      name: item.prod_name,
                      qty: '',
                      salePrice: item.prod_price,
                    });
                    setSelectedProduct(item);
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
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
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
              <Text style={styles.cartItemCount}>{cartItems.length} items</Text>
            </View>

            {/* Empty Cart */}
            {cartItems.length === 0 ? (
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
                  data={cartItems}
                  keyExtractor={(item, index) => index.toString()}
                  style={styles.cartList}
                  contentContainerStyle={styles.cartListContent}
                  renderItem={({item}) => (
                    <View style={styles.cartItemContainer}>
                      <View style={styles.cartItemHeader}>
                        <Text style={styles.cartProductName} numberOfLines={2}>
                          {item.prod_name}
                        </Text>
                        <Text style={styles.quantityValue}>
                          {item.tmptrd_qty}
                        </Text>
                      </View>

                      <View style={styles.cartItemDetails}>
                        <Text style={styles.detailLabel}>Cost Price:</Text>
                        <Text style={styles.detailValue}>
                          PKR {item.tmptrd_cost_price}
                        </Text>
                      </View>

                      <View style={styles.cartItemDetails}>
                        <Text style={styles.detailLabel}>Sale Price:</Text>
                        <Text style={styles.detailValue}>
                          PKR {item.tmptrd_sale_price}
                        </Text>
                      </View>

                      <View style={styles.cartItemDetails}>
                        <Text style={styles.detailLabel}>Sub Total:</Text>
                        <Text
                          style={[
                            styles.detailValue,
                            {fontSize: 16, color: '#4CAF50'},
                          ]}>
                          PKR {item.tmptrd_sub_total}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.cartItemDetails,
                          {justifyContent: 'flex-end'},
                        ]}>
                        <TouchableOpacity
                          onPress={() => handleDelete(item.id)}
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
                      PKR {checkoutDetails?.saletotal ?? '0.00'}
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
          </SafeAreaView>
        </Modal>

        <Toast />
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
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: 'white',
    fontSize: 16,
  },
  searchResultsOverlay: {
    position: 'absolute',
    top: 180,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    maxHeight: 280,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
  },
  infoDisplay: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  infoDisplayText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontStyle: 'italic',
  },
  dropdown: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minHeight: 48,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#144272',
    marginTop: 8,
    maxHeight: 200,
  },
  supplierInfo: {
    marginTop: 16,
  },
  supplierCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  supplierLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  supplierValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  customerInfo: {
    marginTop: 16,
  },
  customerCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  customerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  customerValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCartText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 12,
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
  quantityValue: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#144272',
    minWidth: 30,
    textAlign: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,82,82,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemDetails: {
    marginTop: 4,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#444',
    marginBottom: 2,
  },
  detailValue: {
    color: '#444',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  profitLabel: {
    color: '#4CAF50',
  },
  profitValue: {
    color: '#4CAF50',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  dateText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    gap: 8,
  },
  addToCartText: {
    color: '#144272',
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    gap: 8,
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Floating Cart Button Styles
  floatingCartContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  floatingCartBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Cart Modal Styles
  cartModalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  cartModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cartModalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#144272',
  },
  cartItemCount: {
    fontSize: 14,
    color: '#666',
  },
  cartList: {
    flex: 1,
  },
  cartListContent: {
    padding: 16,
  },
  cartSummaryContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cartTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#144272',
  },
  proceedBtn: {
    backgroundColor: '#144272',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  proceedBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCartSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
  },
});
