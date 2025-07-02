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
import {Checkbox} from 'react-native-paper';
import {useDrawer} from '../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BASE_URL from '../../BASE_URL';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';

interface Supplier {
  id: number;
  sup_name: string;
}

interface SupplierData {
  id: number;
  sup_name: string;
  sup_company_name: string;
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
  const [supData, setSupData] = useState<SupplierData | null>(null);
  const [addToCartOrders, setAddToCartOrders] = useState<CartItem[]>([]);
  const [supplierItems, setSupplierItems] = useState<Supplier[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const transformedSupplier = supplierItems.map(sup => ({
    label: sup.sup_name,
    value: sup.id.toString(),
  }));
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const navigation = useNavigation();

  const {openDrawer} = useDrawer();

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

  const [issupplier, setissupplier] = useState(false);
  const [currentsupplier, setCurrentsupplier] = useState<string | null>('');

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
        text1: 'Please select a product first',
      });
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
        setShowResults(false);
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
      Toast.show({
        type: 'success',
        text1: 'Deleted Successfully!',
        visibilityTime: 1500,
      });
      fetchAddToCartOrders();
    }
  };

  // Purchase Order Checkuot
  const purchaseOrderCheckout = async () => {
    if (!currentsupplier) {
      Toast.show({
        type: 'error',
        text1: 'Please select a supplier',
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/purchaseordercheckout`,
        {
          supp_id: currentsupplier,
          date: orderDate.toISOString().split('T')[0],
          purchase_total: orderTotal.toFixed(2), // Use server's total
        },
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      if (res.data.status) {
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
        setOrderTotal(0);
        refreshAddToCart();
        await axios.get(`${BASE_URL}/emptypurchaseordercart`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        navigation.navigate('Purchase Order List' as never);
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
    }
  }, [currentsupplier]);

  useFocusEffect(
    React.useCallback(() => {
      fetchAddToCartOrders();
    }, []),
  );

  useEffect(() => {
    fetchSupplierData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Topbar */}
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
              Purchase Order
            </Text>
          </View>
        </View>

        <ScrollView
          style={{
            marginBottom: 10,
          }}>
          <View style={styles.section}>
            <Text style={styles.label}>Search Product By Name/Barcode</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, {width: '90%'}]}
                placeholderTextColor={'white'}
                placeholder="Search Product..."
                value={searchTerm}
                onChangeText={handleSearch}
              />

              {searchTerm.length > 0 &&
                showResults &&
                searchResults.length > 0 && (
                  <View style={styles.resultsContainer}>
                    {searchResults.map((item: any) => (
                      <TouchableOpacity
                        key={item.prod_id}
                        style={styles.resultItem}
                        onPress={() => {
                          setSearchTerm(item.value);
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
                          setShowResults(false);
                        }}>
                        <Text style={styles.resultText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

              <TouchableOpacity>
                <Image
                  style={{
                    tintColor: 'white',
                    width: 20,
                    height: 17,
                    alignSelf: 'center',
                    marginLeft: 5,
                    marginTop: 18,
                  }}
                  source={require('../../../assets/search.png')}
                />
              </TouchableOpacity>
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
              onPress={purchaseOrderAddToCart}>
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
                  marginTop: 1,
                  zIndex: 1000,
                }}
                labelStyle={{color: 'white'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="MODAL"
              />
            </View>

            <View style={styles.row}>
              <Text
                style={[
                  styles.inputSmall,
                  {backgroundColor: 'gray', color: 'white'},
                ]}>
                {supData?.sup_name || 'Supplier Name'}
              </Text>
              <Text
                style={[
                  styles.inputSmall,
                  {backgroundColor: 'gray', color: 'white'},
                ]}>
                {supData?.sup_company_name || 'Company Name'}
              </Text>
            </View>
          </View>

          {/* FlatList */}
          <FlatList
            data={addToCartOrders}
            keyExtractor={item => item.prod_id.toString()}
            renderItem={({item}) => (
              <View style={{padding: 5}}>
                <View style={styles.table}>
                  <View style={styles.tablehead}>
                    <Text
                      style={{
                        color: '#144272',
                        fontWeight: 'bold',
                        marginLeft: 5,
                        marginTop: 5,
                      }}>
                      {item.product_name}
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        removeAddToCart(item.prod_id);
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

                  <View style={styles.infoRow}>
                    <View style={styles.rowt}>
                      <Text style={styles.text}>Quantity:</Text>
                      <Text style={styles.text}>{item.purchase_qty}</Text>
                    </View>
                    <View style={styles.rowt}>
                      <Text style={styles.text}>Purchase Price:</Text>
                      <Text style={styles.text}>{item.cost_price}</Text>
                    </View>
                    <View style={styles.rowt}>
                      <Text style={styles.text}>Retail Price:</Text>
                      <Text style={styles.text}>{item.retail_price}</Text>
                    </View>
                    <View style={styles.rowt}>
                      <Text style={styles.text}>Total Price:</Text>
                      <Text style={styles.text}>
                        {(
                          parseFloat(item.purchase_qty) *
                          parseFloat(item.cost_price)
                        ).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.rowt}>
                      <Text style={[styles.text, {marginBottom: 5}]}>
                        Expiry Date:
                      </Text>
                      <Text style={[styles.text, {marginBottom: 5}]}>
                        {item.expiry_date}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            scrollEnabled={false}
          />
        </ScrollView>

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalText}>{orderTotal.toFixed(2)}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            justifyContent: 'center',
            marginBottom: 7,
          }}>
          <TouchableOpacity onPress={purchaseOrderCheckout}>
            <View
              style={{
                width: 80,
                height: 30,
                backgroundColor: 'white',
                borderRadius: 15,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#144272',
                  marginTop: 5,
                }}>
                Check Out
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Purchase Order List' as never)}>
            <View
              style={{
                width: 80,
                height: 30,
                backgroundColor: 'white',
                borderRadius: 15,
                marginLeft: 5,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#144272',
                  marginTop: 5,
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
  addButton: {
    marginLeft: 8,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    width: 60,
  },
  completeButton: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 320,
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
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 'auto',
    width: 314,
    borderRadius: 5,
  },
  tablehead: {
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 5,
    borderTopLeftRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },
  rowt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalContainer: {
    padding: 7,
    borderTopWidth: 1,
    borderTopColor: 'white',
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
  resultsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 5,
    zIndex: 100,
    elevation: 10,
    maxHeight: 'auto',
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  resultText: {
    color: '#144272',
  },
});
