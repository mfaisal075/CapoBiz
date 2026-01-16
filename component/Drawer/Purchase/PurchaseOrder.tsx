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
import BottomBar from '../../BottomBar';

// THEME
const THEME = {
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  white: '#FFFFFF',
  background: '#F8F9FA', // Slightly lighter background
  textDark: '#111827', // Darker text for better contrast
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
}

interface SupplierData {
  id: number;
  sup_name: string;
  sup_company_name: string;
  sup_phone: string;
}

interface CartItem {
  prod_id: number;
  product_name: string;
  upc_ean: string;
  purchase_qty: string;
  cost_price: string;
  retail_price: string;
  expiry_date: string;
  fretail_price: string;
  total?: string;
}

export default function PurchaseOrder() {
  const {token, refreshAddToCart} = useUser();
  const [expiry, setExpiry] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [supData, setSupData] = useState<SupplierData | null>(null);
  const [addToCartOrders, setAddToCartOrders] = useState<CartItem[]>([]);
  const [supplierItems, setSupplierItems] = useState<Supplier[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState('');
  const {openDrawer} = useDrawer();
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [orderDate, setorderDate] = useState(new Date());
  const [showorderDatePicker, setShoworderDatePicker] = useState(false);
  const [issupplier, setissupplier] = useState(false);
  const [currentsupplier, setCurrentsupplier] = useState<string | null>('');
  const navigation = useNavigation();

  const transformedSupplier = supplierItems.map(sup => ({
    label: sup.sup_name,
    value: sup.id.toString(),
  }));

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

  // Purchase Order Add To Cart
  const purchaseOrderAddToCart = async () => {
    if (!selectedProduct) {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Please select a product first',
        visibilityTime: 2000,
      });
      return;
    }

    if (!quantity || !purchasePrice || !retailPrice) {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Quantity, Purchase Price, and Retail Price are required.',
        visibilityTime: 2000,
      });
      return;
    }

    if (quantity === '0' || quantity === '') {
      setQuantityError('Quantity must be greater than 0');
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/purchaseorderaddtocart`,
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
        setQuantityError('');
        setShowResults(false);
        setSelectedProduct(null);
        fetchAddToCartOrders();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Add To Cart Orders
  const fetchAddToCartOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadpurchaseordercart`, {
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

  // Delete Add to cart
  const removeAddToCart = async (id: number) => {
    const res = await axios.get(
      `${BASE_URL}/removefrompurchaseordercart?id=${id}&_token=${token}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = res.data;

    if (res.status === 200 && data.status === 200) {
      fetchAddToCartOrders();
    }
  };

  // Purchase Order Checkout
  const purchaseOrderCheckout = async () => {
    if (!currentsupplier) {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Please select a supplier!',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/purchaseordercheckout`,
        {
          supp_id: currentsupplier,
          date: orderDate.toISOString().split('T')[0],
          purchase_total: orderTotal.toFixed(2),
        },
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      if (res.status === 200 && res.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Order placed successfully!',
        });
        setAddToCartOrders([]);
        setOrderTotal(0);
        setSearchTerm('');
        setQuantity('');
        setPurchasePrice('');
        setRetailPrice('');
        setCurrentsupplier('');
        setSupData(null);
        refreshAddToCart();
        setModalVisible('');
        await axios.get(`${BASE_URL}/emptypurchaseordercart`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        navigation.navigate('Purchase Order List' as never);
      } else if (res.status === 200 && res.data.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Cart is empty,please add some products!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Checkout failed',
        text2: 'Please try again',
      });
    }
  };

  useEffect(() => {
    fetchSupplierData();
    if (currentsupplier) {
      const fetchSupplierDetails = async () => {
        try {
          const response = await axios.post(`${BASE_URL}/fetchsuppdata`, {
            id: currentsupplier,
          });
          setSupData(response.data.supplier);
        } catch (error) {
          console.error('Failed to fetch supplier details:', error);
        }
      };
      fetchSupplierDetails();

      fetchAddToCartOrders();
    }

    const backKey = () => {
      navigation.navigate('Dashboard' as never);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
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
            <Text style={styles.headerTitle}>Purchase Order</Text>
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
              onChangeText={text => {
                setQuantity(text);
                if (text !== '0' && text !== '') {
                  setQuantityError('');
                }
              }}
              keyboardType="numeric"
            />
            {quantityError ? (
              <Text style={styles.errorText}>{quantityError}</Text>
            ) : null}
          </View>

          {/* Prices Row */}
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
                Retail Price <Text style={{color: THEME.danger}}>*</Text>
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
              const newOptions = expiry.includes('on')
                ? expiry.filter(opt => opt !== 'on')
                : [...expiry, 'on'];
              setExpiry(newOptions);
            }}>
            <Checkbox.Android
              status={expiry.includes('on') ? 'checked' : 'unchecked'}
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.checkboxLabel}>Apply Expiry Date</Text>
          </TouchableOpacity>

          {/* Expiry Date Picker */}
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

          {/* Add to Cart Button */}
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
        {/* Cart Items List */}
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
                      {item.product_name}
                    </Text>
                    <View style={styles.uomBadge}>
                      <Text style={styles.uomText}>
                        Stock: {item.purchase_qty}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardTotal}>
                    {(
                      parseFloat(item.cost_price) *
                      parseFloat(item.purchase_qty)
                    ).toFixed(2)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.cardRow,
                    {marginTop: 8, justifyContent: 'space-between'},
                  ]}>
                  <View>
                    <Text style={styles.cardUnitPrice}>
                      Pur: {item.cost_price} | Ret: {item.retail_price}
                    </Text>
                    {item.expiry_date && (
                      <Text style={styles.cardExpiryText}>
                        Exp: {item.expiry_date}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => removeAddToCart(item.prod_id)}
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

      {/* Search Product Container */}
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

      {/* Floating Billing Button */}
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
                <Text style={styles.floatingBtnTitle}>Proceed to Order</Text>
                <Text style={styles.floatingBtnSubtitle}>
                  Total: {orderTotal.toFixed(2)}
                </Text>
              </View>
              <Icon name="arrow-right" size={24} color={THEME.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
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
              {/* Invoice Date */}
              <View style={[styles.checkoutSection, {marginBottom: 10}]}>
                <View style={styles.sectionHeader}>
                  <Icon name="calendar-month" size={20} color={THEME.primary} />
                  <Text style={styles.sectionTitle}>Invoice Date</Text>
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
                    placeholderStyle={{
                      color: 'rgba(0,0,0,0.5)',
                      fontSize: 15,
                    }}
                    textStyle={{color: THEME.textDark, fontSize: 15}}
                    ArrowUpIconComponent={() => (
                      <Icon name="chevron-up" size={20} color={THEME.primary} />
                    )}
                    ArrowDownIconComponent={() => (
                      <Icon
                        name="chevron-down"
                        size={20}
                        color={THEME.primary}
                      />
                    )}
                    style={{
                      borderColor: THEME.border,
                      borderRadius: 12,
                      minHeight: 50,
                    }}
                    dropDownContainerStyle={{
                      borderColor: THEME.border,
                      borderRadius: 12,
                    }}
                    labelStyle={{
                      color: THEME.textDark,
                      fontWeight: '500',
                    }}
                    listMode="SCROLLVIEW"
                    searchable
                    searchTextInputStyle={{
                      borderWidth: 0,
                      borderBottomWidth: 1,
                      borderBottomColor: THEME.border,
                    }}
                  />
                </View>
              </View>

              {/* Supplier Details Card */}
              {supData && (
                <View style={styles.checkoutSection}>
                  <LinearGradient
                    colors={[THEME.white, '#F0FDF4']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.supplierCard}>
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
                          {supData.sup_name}
                        </Text>
                        <View style={styles.infoRow}>
                          <Icon
                            name="domain"
                            size={16}
                            color={THEME.textGray}
                            style={{marginRight: 5}}
                          />
                          <Text style={styles.supplierDetailText}>
                            {supData.sup_company_name || 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Icon
                            name="phone"
                            size={16}
                            color={THEME.textGray}
                            style={{marginRight: 5}}
                          />
                          <Text style={styles.supplierDetailText}>
                            {supData.sup_phone || 'N/A'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              )}

              {/* Amount to Pay */}
              <View style={styles.checkoutSection}>
                <Text style={styles.checkoutSectionTitle}>Payment Summary</Text>
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
                    {orderTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.checkoutFooter}>
              <TouchableOpacity
                style={styles.completePurchaseBtn}
                activeOpacity={0.8}
                onPress={purchaseOrderCheckout}>
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

      {/* Order Date Picker */}
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

      <Toast />
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- Header ---
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: THEME.danger,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.white,
  },
  cartBadgeText: {
    color: THEME.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  // --- Floating Search ---
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
  },
  floatingSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: THEME.textDark,
  },
  // --- Content ---
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
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 6,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textGray,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F9FAFB',
    color: THEME.textDark,
    fontSize: 14,
  },
  errorText: {
    color: THEME.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkboxLabel: {
    fontSize: 14,
    color: THEME.textDark,
    marginLeft: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: THEME.textDark,
  },
  addToCartBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  btnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- Search Results Overlay ---
  searchResultsOverlay: {
    position: 'absolute',
    top: 135, // Adjusted for new header height + search bar
    left: 24, // Matches container padding + margin
    right: 24,
    backgroundColor: THEME.white,
    borderRadius: 10,
    maxHeight: 200,
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultText: {
    color: THEME.textDark,
    fontSize: 14,
  },
  // --- Cart Modal Styles ---
  cartModalContainer: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- Inline Cart List ---
  cartPreviewCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
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
  cartPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartPreviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.primary,
  },
  compactCard: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardProductName: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.textDark,
    marginBottom: 4,
  },
  uomBadge: {
    backgroundColor: '#E0F2FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  uomText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '500',
  },
  cardTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.primary,
  },
  cardUnitPrice: {
    fontSize: 13,
    color: THEME.textGray,
    fontWeight: '500',
  },
  cardExpiryText: {
    fontSize: 12,
    color: THEME.danger,
    marginTop: 2,
  },
  compactDeleteBtn: {
    padding: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
  },
  // --- Floating Billing Button ---
  floatingBillingBtn: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    borderRadius: 16,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
    marginLeft: 16,
  },
  floatingBtnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.white,
  },
  floatingBtnSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  // --- Checkout Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  checkoutModalContainer: {
    backgroundColor: THEME.background,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },

  // Supplier Card
  supplierCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.primaryLight,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  supplierLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.primary,
    letterSpacing: 1,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '600',
  },
  supplierContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  supplierDetailText: {
    fontSize: 13,
    color: THEME.textGray,
    marginLeft: 6,
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
  // --- Checkout Modal Styles ---
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
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  checkoutModalSubtitle: {
    fontSize: 13,
    color: THEME.textGray,
    marginTop: 2,
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
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginLeft: 8,
  },
  checkoutSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textGray,
    marginBottom: 6,
  },
  customerSelectContainer: {
    marginBottom: 4,
  },
  checkoutDateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 50,
  },
  checkoutDateText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: THEME.textDark,
  },
});
