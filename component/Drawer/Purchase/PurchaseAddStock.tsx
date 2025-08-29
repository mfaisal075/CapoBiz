import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
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
  const navigation = useNavigation();
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
        // Convert object to array and add calculated total
        const cartItems = Object.values(res.data.cartsessiondata).map(
          (item: any) => ({
            ...item,
            total: (
              parseFloat(item.purchase_qty) * parseFloat(item.cost_price)
            ).toString(),
          }),
        );

        setAddToCartOrders(cartItems);

        // Use server's order_total if available
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
    if (!checkOutFrom.refNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Reference number is required',
      });
      return;
    }
    if (!currentLabour) {
      Toast.show({
        type: 'error',
        text1: 'Please select a transporter',
      });
      return;
    }
    if (!checkOutFrom.builty.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Builty number is required',
      });
      return;
    }
    if (!checkOutFrom.vehicle.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Vehicle number is required',
      });
      return;
    }
    if (
      !checkOutFrom.freCharges.trim() ||
      isNaN(Number(checkOutFrom.freCharges))
    ) {
      Toast.show({
        type: 'error',
        text1: 'Freight charges must be a valid number',
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
    emptyCart();
  }, [currentsupplier]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View
          style={{
            marginBottom: 10,
          }}>
          {/* Top Bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 5,
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity onPress={openDrawer}>
              <Image
                source={require('../../../assets/menu.png')}
                style={{
                  width: 30,
                  height: 30,
                  tintColor: 'white',
                }}
              />
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 22,
                  fontWeight: 'bold',
                }}>
                Purchase Add stock
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Search Product By Name/Barcode</Text>
            <View style={[styles.row, {alignItems: 'flex-end'}]}>
              <TextInput
                style={[styles.input, {width: '100%', marginBottom: 0}]}
                placeholderTextColor={'white'}
                placeholder="Search Product..."
                value={searchTerm}
                onChangeText={handleSearch}
              />

              {searchTerm.length > 0 &&
                showResults &&
                searchResults.length > 0 && (
                  <View style={styles.resultsContainer}>
                    <ScrollView>
                      {searchResults.map((item: any) => (
                        <TouchableOpacity
                          key={item.prod_id}
                          style={styles.resultItem}
                          onPress={() => {
                            setSearchTerm(item.value);
                            setShowResults(false);
                            setSelectedProduct(item);
                            setQuantity('0');
                            setPurchasePrice(item.prod_costprice);
                            setRetailPrice(item.prod_price);
                            setStartDate(
                              new Date(item?.prod_expirydate ?? new Date()),
                            );
                            if (item?.prod_expirydate) {
                              setExpiry(['on']);
                            }
                          }}>
                          <Text
                            style={styles.resultText}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {item.label
                              .replace(/\s*\|\s*\n\s*/g, ' | ')
                              .replace(/\n/g, ' ')
                              .trim()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
            </View>

            <View style={styles.row}>
              <TextInput
                style={styles.inputSmall}
                placeholderTextColor={'white'}
                placeholder="Quantity"
                value={quantity}
                onChangeText={setQuantity}
              />

              <TextInput
                style={styles.inputSmall}
                placeholderTextColor={'white'}
                placeholder="Purchase Price"
                value={purchasePrice}
                onChangeText={setPurchasePrice}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.inputSmall, {width: '100%'}]}
                placeholderTextColor={'white'}
                placeholder="Retail Price"
                value={retailPrice}
                onChangeText={setRetailPrice}
              />
            </View>

            <View style={styles.row}>
              <View style={{width: '46%'}}>
                <TouchableOpacity
                  style={{flexDirection: 'row', alignItems: 'center'}}
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
                    uncheckedColor="#fff"
                  />
                  <Text style={{color: '#fff', marginLeft: 8}}>
                    Apply Expiry
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setShowStartDatePicker(true)}
                style={styles.dateInput}>
                <Text style={{color: 'white', flex: 1}}>
                  {`${startDate.toLocaleDateString()}`}
                </Text>
                <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                  <Image
                    style={{
                      height: 18,
                      width: 18,
                      resizeMode: 'stretch',
                      tintColor: 'white',
                      marginLeft: 8,
                    }}
                    source={require('../../../assets/calendar.png')}
                  />
                </TouchableOpacity>
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
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                purchaseOrderAddToCart();
              }}>
              <Text
                style={{
                  color: '#144272',
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}>
                Add To Cart
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
          }}>
          <View style={{zIndex: 1000}}>
            <DropDownPicker
              items={transformedSupplier}
              open={issupplier}
              setOpen={setissupplier}
              value={currentsupplier}
              setValue={setCurrentsupplier}
              placeholder="Select Supplier"
              placeholderStyle={{color: 'white'}}
              textStyle={{color: 'white'}}
              ArrowUpIconComponent={() => (
                <Icon name="keyboard-arrow-up" size={18} color="#fff" />
              )}
              ArrowDownIconComponent={() => (
                <Icon name="keyboard-arrow-down" size={18} color="#fff" />
              )}
              style={styles.dropdown}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: 'white',
                width: '100%',
                marginTop: 9,
                zIndex: 1000,
              }}
              labelStyle={{color: 'white'}}
              listItemLabelStyle={{color: '#144272'}}
              listMode="MODAL"
            />
          </View>

          <View style={[styles.row]}>
            <Text style={styles.inputSmall}>New Invoice</Text>

            <TouchableOpacity
              onPress={() => setShoworderDatePicker(true)}
              style={styles.dateInput}>
              <Text style={{color: 'white', flex: 1}}>
                {`${orderDate.toLocaleDateString()}`}
              </Text>
              <TouchableOpacity onPress={() => setShoworderDatePicker(true)}>
                <Image
                  style={{
                    height: 18,
                    width: 18,
                    resizeMode: 'stretch',
                    tintColor: 'white',
                    marginLeft: 8,
                  }}
                  source={require('../../../assets/calendar.png')}
                />
              </TouchableOpacity>
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
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text
              style={[
                styles.inputSmall,
                {backgroundColor: 'gray', color: 'white'},
              ]}>
              {selectedSupp?.sup_name || 'Supplier Name'}
            </Text>
            <Text
              style={[
                styles.inputSmall,
                {backgroundColor: 'gray', color: 'white'},
              ]}>
              {selectedSupp?.sup_company_name || 'Company Name'}
            </Text>
          </View>

          <View style={[styles.row]}>
            <TextInput
              style={styles.inputSmall}
              placeholderTextColor={'white'}
              placeholder="Reference"
              value={checkOutFrom.refNumber}
              onChangeText={t => checkoutOnChange('refNumber', t)}
            />

            <Text style={[styles.inputSmall, {color: 'white'}]}>Invoice</Text>
          </View>

          <View style={{zIndex: 1000}}>
            <DropDownPicker
              items={transformedTransporter}
              open={Labour}
              setOpen={setLabour}
              value={currentLabour}
              setValue={setCurrentLabour}
              placeholder="Select Transporter"
              placeholderStyle={{color: 'white'}}
              ArrowUpIconComponent={() => (
                <Icon name="keyboard-arrow-up" size={18} color="#fff" />
              )}
              ArrowDownIconComponent={() => (
                <Icon name="keyboard-arrow-down" size={18} color="#fff" />
              )}
              style={[styles.dropdown]}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: '100%',
              }}
              labelStyle={{color: 'white'}}
              listItemLabelStyle={{color: '#144272'}}
              listMode="MODAL"
            />
          </View>

          <View style={[styles.row]}>
            <TextInput
              style={styles.inputSmall}
              placeholderTextColor={'white'}
              placeholder="Builty"
              keyboardType="number-pad"
              value={checkOutFrom.builty}
              onChangeText={t => checkoutOnChange('builty', t)}
            />

            <TextInput
              style={styles.inputSmall}
              placeholderTextColor={'white'}
              placeholder="Vehicle"
              keyboardType="numeric"
              value={checkOutFrom.vehicle}
              onChangeText={t => checkoutOnChange('vehicle', t)}
            />
          </View>

          <View style={[styles.row]}>
            <TextInput
              style={styles.inputSmall}
              placeholderTextColor={'white'}
              placeholder="Freight Charges"
              keyboardType="number-pad"
              value={checkOutFrom.freCharges}
              onChangeText={t => checkoutOnChange('freCharges', t)}
            />

            <TextInput
              style={styles.inputSmall}
              placeholderTextColor={'white'}
              placeholder="Paid Amount"
              keyboardType="number-pad"
              value={checkOutFrom.paidAmount}
              onChangeText={t => checkoutOnChange('paidAmount', t)}
            />
          </View>

          <View style={[styles.row]}>
            <Text style={[styles.inputSmall, {color: 'white'}]}>
              {orderTotal.toFixed(2) ?? 'Order Total'}
            </Text>

            <Text style={[styles.inputSmall, {color: 'white'}]}>
              {(orderTotal + parseFloat(checkOutFrom.freCharges)).toFixed(2) ??
                'Total Purchase'}
            </Text>
          </View>

          <View>
            <FlatList
              data={addToCartOrders}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <ScrollView
                  style={{
                    padding: 5,
                    marginBottom: 10,
                  }}>
                  <View style={styles.table}>
                    <View style={styles.tablehead}>
                      <Text
                        style={{
                          color: '#144272',
                          fontWeight: 'bold',
                          marginLeft: 5,
                          marginTop: 5,
                        }}>
                        {item.prod_name}
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <TouchableOpacity
                          onPress={() => {
                            delCartItem(item.prod_id);
                          }}>
                          <Icon
                            name="delete"
                            size={20}
                            color="#B22222"
                            style={{
                              alignSelf: 'center',
                              marginRight: 5,
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.rowt}>
                        <Text style={styles.txt}>New Quantity:</Text>
                        <Text style={styles.txt}>{item.prod_purchase_qty}</Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={styles.txt}>Purchase Price:</Text>
                        <Text style={styles.txt}>{item.prod_cost_price}</Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={styles.txt}>Retail Price:</Text>
                        <Text style={styles.txt}>{item.prod_retail_price}</Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={styles.txt}>Total Price:</Text>
                        <Text style={styles.txt}>
                          {(
                            parseFloat(item.prod_purchase_qty) *
                            parseFloat(item.prod_cost_price)
                          ).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={[styles.txt, {marginBottom: 5}]}>
                          Expiry Date:
                        </Text>
                        <Text style={[styles.txt, {marginBottom: 5}]}>
                          {item.prod_expiry_date}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={{alignItems: 'center', marginBottom: 10}}>
                  <Text style={{color: '#fff', fontSize: 16}}>
                    No items in cart.
                  </Text>
                </View>
              }
            />
          </View>
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            justifyContent: 'center',
            marginBottom: 5,
          }}>
          <TouchableOpacity
            onPress={() => {
              checkout();
            }}>
            <View
              style={{
                width: 90,
                height: 35,
                backgroundColor: 'white',
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#144272',
                  fontWeight: 'bold',
                }}>
                Check Out
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Purchase Order List' as never)}>
            <View
              style={{
                width: 90,
                height: 35,
                backgroundColor: 'white',
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 10,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#144272',
                  fontWeight: 'bold',
                }}>
                Close
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    borderColor: 'white',
    height: 'auto',
    borderRadius: 12,
    elevation: 15,
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    color: 'white',
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: 'white',
    color: '#fff',
    borderRadius: 6,
    padding: 8,
    width: '46%',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 38,
    borderRadius: 6,
    padding: 8,
    backgroundColor: 'transparent',
    width: '100%',
    marginBottom: 10,
  },
  infoRow: {
    marginTop: 5,
  },
  rowt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 143,
    width: 314,
    borderRadius: 10,
  },
  tablehead: {
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 10,
    borderTopLeftRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txt: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  resultsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 5,
    zIndex: 100,
    elevation: 10,
    maxHeight: 230,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  resultText: {
    color: '#144272',
    fontSize: 14,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    alignItems: 'center',
    width: '46%',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 6,
    height: 38,
  },
  submitButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    alignSelf: 'center',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});
