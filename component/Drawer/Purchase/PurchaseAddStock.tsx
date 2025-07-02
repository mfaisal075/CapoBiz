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
import Modal from 'react-native-modal';
import {Checkbox, RadioButton} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';

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
  const [supData, setSupData] = useState<SupplierData | null>(null);
  const [addToCartOrders, setAddToCartOrders] = useState<CartItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [addproduct, setaddproduct] = useState(false);

  const toggleproduct = () => {
    setaddproduct(!addproduct);
  };
  const [Type, setType] = React.useState<'GenerateAutoBarCode' | 'number'>(
    'GenerateAutoBarCode',
  );

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
  const [psupplier, setpsupplier] = useState(false);
  const [currentpsupplier, setCurrentpsupplier] = useState<string | null>('');
  const psupplierItem = [
    {label: 'Naeem', value: 'Naeem'},
    {label: 'Malik', value: 'Malik'},
  ];

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
  const [category, setcategory] = useState(false);
  const [currentcategory, setCurrentcategory] = useState<string | null>('');
  const categoryItem = [
    {
      label: 'Chocolate',
      value: 'Chocolate',
    },
    {label: 'Jelly', value: 'Jelly'},
    {label: 'Oil', value: 'Oil'},
    {label: 'Flour', value: 'Flour'},
  ];

  const [uom, setuom] = useState(false);
  const [currentuom, setCurrentuom] = useState<string | null>('');
  const uomItem = [
    {
      label: 'Pieces',
      value: 'Pieces',
    },
    {label: 'Kg', value: 'Kg'},
    {label: 'Box', value: 'Box'},
    {label: 'Inches', value: 'Inches'},
  ];
  const [stock, setstock] = React.useState<'managestock' | 'number'>(
    'managestock',
  );

  const [expire, setexpire] = React.useState<'applyexpiry' | 'number'>(
    'applyexpiry',
  );

  const [supplier, setsupplier] = React.useState<'supplier' | 'number'>(
    'supplier',
  );

  const [close, setclose] = useState(false);

  const toggleclosebtn = () => {
    setclose(!close);
  };
  const [issupplier, setissupplier] = useState(false);
  const [currentsupplier, setCurrentsupplier] = useState<string | null>('');
  const supplierItem = [{label: 'Naeem', value: 'Naeem'}];

  const [subuom, setsubuom] = React.useState<'subuom' | 'number'>('subuom');
  const [issubuom, setissubuom] = useState(false);
  const [currentsub, setCurrentsub] = useState<string | null>('');
  const subuomItem = [
    {
      label: 'Pieces',
      value: 'Pieces',
    },
    {label: 'Kg', value: 'Kg'},
    {label: 'Box', value: 'Box'},
    {label: 'Inches', value: 'Inches'},
  ];

  const [btnproduct, setbtnproduct] = useState(false);

  const togglebtnproduct = () => {
    setbtnproduct(!btnproduct);
  };

  const [addcategory, setaddcategory] = useState(false);

  const toggleaddcategory = () => {
    setaddcategory(!addcategory);
  };

  const [btncategory, setbtncategory] = useState(false);

  const togglebtncategory = () => {
    setbtncategory(!btncategory);
  };

  const [adduom, setadduom] = useState(false);

  const toggleadduom = () => {
    setadduom(!adduom);
  };

  const [btnuom, setbtnuom] = useState(false);

  const togglebtnuom = () => {
    setbtnuom(!btnuom);
  };
  const [Open, setOpen] = useState(false);
  const [currentVal, setCurrentVal] = useState<string | null>('');

  const [Labour, setLabour] = useState(false);
  const [currentLabour, setCurrentLabour] = useState<string | null>('');

  const labour = [
    {label: 'Saif', value: 'Saif'},
    {label: 'Bilal', value: 'Bilal'},
    {label: 'Khan', value: 'Khan'},
  ];
  const [stockexpire, setstockexpire] = React.useState<'apply' | 'number'>(
    'apply',
  );

  const [expireDate, setexpireDate] = useState(new Date());
  const [showexpireDatePicker, setShowexpireDatePicker] = useState(false);

  const onexpireDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || expireDate;
    setShowexpireDatePicker(false);
    setexpireDate(currentDate);
  };

  const Info = [
    {
      ItemName: 'abc',
      QTY: '1',
      PurchasePrice: '4',
      RetailPrice: '9',
      totalPrice: '200',
      ExpiryDate: '33',
      total: '555',
    },
    {
      ItemName: 'abc',
      QTY: '1',
      PurchasePrice: '4',
      RetailPrice: '9',
      totalPrice: '200',
      ExpiryDate: '33',
      total: '11',
    },
  ];

  const total = Info.reduce((acc, item) => acc + parseFloat(item.total), 0);

  Info.forEach(item => {
    const qty = parseFloat(item.QTY);
    const purchasePrice = parseFloat(item.PurchasePrice);
    item.total = (qty * purchasePrice).toString();
  });

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

  useEffect(() => {
    fetchSupplierData();
    fetchAddToCartOrders();
  }, []);

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
                style={[styles.input, {width: '70%', marginBottom: 0}]}
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
                        <Text style={styles.resultText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

              <TouchableOpacity
                style={{
                  marginLeft: 5,
                  marginBottom: 0,
                  justifyContent: 'flex-end',
                }}>
                <Icon
                  name="search"
                  size={22}
                  color="white"
                  style={{
                    alignSelf: 'center',
                  }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleproduct}
                style={{
                  marginLeft: 10,
                  marginBottom: 0,
                  justifyContent: 'flex-end',
                }}>
                <Icon
                  name="add-circle-outline"
                  size={28}
                  color="white"
                  style={{
                    alignSelf: 'center',
                  }}
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

          <View style={[styles.row]}>
            <TextInput
              style={styles.inputSmall}
              placeholderTextColor={'white'}
              placeholder="Reference"
            />

            <Text style={[styles.inputSmall, {color: 'white'}]}>Invoice</Text>
          </View>

          <View style={{zIndex: 1000}}>
            <DropDownPicker
              items={labour}
              open={Labour}
              setOpen={setLabour}
              value={currentLabour}
              setValue={setCurrentLabour}
              placeholder="Select Transporter"
              placeholderStyle={{color: 'white'}}
              textStyle={{color: currentVal ? 'white' : 'white'}}
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
            />

            <TextInput
              style={styles.inputSmall}
              placeholderTextColor={'white'}
              placeholder="Vehicle"
            />
          </View>

          <View style={[styles.row]}>
            <TextInput
              style={styles.inputSmall}
              placeholderTextColor={'white'}
              placeholder="Builty"
            />

            <TextInput
              style={styles.inputSmall}
              placeholderTextColor={'white'}
              placeholder="Vehicle"
            />
          </View>

          <View style={[styles.row]}>
            <TextInput
              style={styles.inputSmall}
              placeholderTextColor={'white'}
              placeholder="Freight Charges"
            />

            <TextInput
              style={styles.inputSmall}
              placeholderTextColor={'white'}
              placeholder="Paid Amount"
            />
          </View>

          <View style={[styles.row]}>
            <Text style={[styles.inputSmall, {color: 'white'}]}>
              Order Total
            </Text>

            <Text style={[styles.inputSmall, {color: 'white'}]}>
              Total Purchase
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
                        {item.product_name}
                      </Text>

                      <Image
                        style={{
                          tintColor: '#144272',
                          width: 15,
                          height: 15,
                          alignSelf: 'center',
                          marginRight: 5,
                        }}
                        source={require('../../../assets/show.png')}
                      />
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.rowt}>
                        <Text style={styles.txt}>Quantity:</Text>
                        <Text style={styles.txt}>{item.purchase_qty}</Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={styles.txt}>Purchase Price:</Text>
                        <Text style={styles.txt}>{item.cost_price}</Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={styles.txt}>Retail Price:</Text>
                        <Text style={styles.txt}>{item.retail_price}</Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={styles.txt}>Total Price:</Text>
                        <Text style={styles.text}>
                          {(
                            parseFloat(item.purchase_qty) *
                            parseFloat(item.cost_price)
                          ).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={[styles.txt, {marginBottom: 5}]}>
                          Expiry Date:
                        </Text>
                        <Text style={[styles.txt, {marginBottom: 5}]}>
                          {item.expiry_date}
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

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalText}>{total}</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            justifyContent: 'center',
            marginBottom: 5,
          }}>
          <TouchableOpacity onPress={toggleclosebtn}>
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

        <Modal isVisible={close}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Added
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Product has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setclose(!close)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*Add Product*/}
        <Modal isVisible={addproduct}>
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 500,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Add New Product
              </Text>
              <TouchableOpacity onPress={() => setaddproduct(!addproduct)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Product Name"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Second Name"
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <RadioButton
                value="GenerateAutoBarCode"
                status={
                  Type === 'GenerateAutoBarCode' ? 'checked' : 'unchecked'
                }
                color="#144272"
                uncheckedColor="#144272"
                onPress={() => setType('GenerateAutoBarCode')}
              />
              <Text
                style={{
                  color: '#144272',
                  marginTop: 7,
                  marginLeft: -10,
                }}>
                Generate Auto BarCode
              </Text>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <RadioButton
                value="applyexpiry"
                status={expire === 'applyexpiry' ? 'checked' : 'unchecked'}
                color="#144272"
                uncheckedColor="#144272"
                onPress={() => setexpire('applyexpiry')}
              />
              <Text
                style={{
                  color: '#144272',
                  marginTop: 7,
                  marginLeft: -10,
                }}>
                Apply Expiry
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  width: 165,
                  borderRightWidth: 1,
                  borderLeftWidth: 1,
                  borderRadius: 5,
                  borderColor: '#144272',
                  marginLeft: hp('2%'),
                  height: 30,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 5,
                    borderColor: '#144272',
                  }}>
                  <Text style={{marginLeft: 10, color: '#144272'}}>
                    {`${startDate.toLocaleDateString()}`}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(true)}>
                    <Image
                      style={{
                        height: 20,
                        width: 20,
                        resizeMode: 'stretch',
                        alignItems: 'center',
                        marginLeft: 60,
                        tintColor: '#144272',
                        alignSelf: 'flex-end',
                      }}
                      source={require('../../../assets/calendar.png')}
                    />
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
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={categoryItem}
                open={category}
                setOpen={setcategory}
                value={currentcategory}
                setValue={setCurrentcategory}
                placeholder="Select Category"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#fff" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#fff" />
                )}
                style={[styles.dropdown, {borderColor: '#144272', width: 265}]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />
              <TouchableOpacity onPress={toggleaddcategory}>
                <Image
                  style={{
                    tintColor: '#144272',
                    width: 22,
                    height: 17,
                    alignSelf: 'center',
                    marginLeft: -26,
                    marginTop: 17,
                  }}
                  source={require('../../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={uomItem}
                open={uom}
                setOpen={setuom}
                value={currentuom}
                setValue={setCurrentuom}
                placeholder="Select UOM"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#fff" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#fff" />
                )}
                style={[styles.dropdown, {borderColor: '#144272', width: 265}]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />
              <TouchableOpacity onPress={toggleadduom}>
                <Image
                  style={{
                    tintColor: '#144272',
                    width: 22,
                    height: 17,
                    alignSelf: 'center',
                    marginLeft: -26,
                    marginTop: 17,
                  }}
                  source={require('../../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.row,
                {
                  marginLeft: 10,
                  marginRight: 10,
                  marginTop: -8,
                  marginBottom: -8,
                },
              ]}>
              <RadioButton
                value="managestock"
                status={stock === 'managestock' ? 'checked' : 'unchecked'}
                color="#144272"
                uncheckedColor="#144272"
                onPress={() => setstock('managestock')}
              />
              <Text
                style={{
                  color: '#144272',
                  marginTop: 7,
                  marginLeft: -10,
                }}>
                Don't Manage Stock
              </Text>
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Opening Quantity"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Re Order Level"
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Cost Price"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Retail Price"
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Discount"
              />
              <Text style={[styles.productinput, {color: '#144272'}]}>
                Final Price:000
              </Text>
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <RadioButton
                value="supplier"
                status={supplier === 'supplier' ? 'checked' : 'unchecked'}
                color="#144272"
                uncheckedColor="#144272"
                onPress={() => setsupplier('supplier')}
              />
              <Text
                style={{
                  color: '#144272',
                  marginTop: 7,
                  marginLeft: -10,
                }}>
                Enable Supplier
              </Text>

              <DropDownPicker
                items={supplierItem}
                open={issupplier}
                setOpen={setissupplier}
                value={currentsupplier}
                setValue={setCurrentsupplier}
                placeholder="Select"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#fff" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#fff" />
                )}
                style={[
                  styles.dropdown,
                  {
                    borderColor: '#144272',
                    width: 140,
                    marginLeft: 18,
                    marginTop: 1,
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 140,
                  marginLeft: 18,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <TouchableOpacity>
                <View
                  style={[
                    styles.row,
                    {
                      marginLeft: 16,
                      marginRight: 10,
                      backgroundColor: '#144272',
                      borderRadius: 10,
                      width: 120,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.productinput,
                      {color: 'white', textAlign: 'center'},
                    ]}>
                    Choose Image
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={[styles.row, {marginLeft: 15, marginRight: 10}]}>
                <RadioButton
                  value="subuom"
                  status={subuom === 'subuom' ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                  onPress={() => setsubuom('subuom')}
                />
                <Text
                  style={{
                    color: '#144272',
                    marginTop: 7,
                    marginLeft: -10,
                  }}>
                  Have Sub UOM?
                </Text>
              </View>
            </View>

            <DropDownPicker
              items={subuomItem}
              open={issubuom}
              setOpen={setissubuom}
              value={currentsub}
              setValue={setCurrentsub}
              placeholder="Select Sub UOM"
              placeholderStyle={{color: '#144272'}}
              textStyle={{color: '#144272'}}
              ArrowUpIconComponent={() => (
                <Icon name="keyboard-arrow-up" size={18} color="#fff" />
              )}
              ArrowDownIconComponent={() => (
                <Icon name="keyboard-arrow-down" size={18} color="#fff" />
              )}
              style={[
                styles.dropdown,
                {
                  borderColor: '#144272',
                  width: 295,
                  alignSelf: 'center',
                },
              ]}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: 295,
                marginLeft: 11,
              }}
              labelStyle={{color: '#144272'}}
              listItemLabelStyle={{color: '#144272'}}
              listMode="SCROLLVIEW"
            />
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <Text
                style={[
                  styles.productinput,
                  {color: '#144272', marginBottom: 8},
                ]}>
                Master UOM:
              </Text>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Equivalence"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Sale Price"
              />
            </View>
            <TouchableOpacity onPress={togglebtnproduct}>
              <View
                style={{
                  backgroundColor: '#144272',
                  height: 30,
                  width: 295,
                  margin: 10,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add Product
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*add product btn*/}
        <Modal isVisible={btnproduct}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 230,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Added
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Product has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setbtnproduct(!btnproduct)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/*add category modal*/}
        <Modal isVisible={addcategory}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 140,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Add New Category
              </Text>
              <TouchableOpacity onPress={() => setaddcategory(!addcategory)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="Category Name"
              />
            </View>
            <TouchableOpacity onPress={togglebtncategory}>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#144272',
                  height: 30,
                  borderRadius: 10,
                  width: 100,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add Category
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
        {/*Add btn category*/}
        <Modal isVisible={btncategory}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Added
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Category has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setbtncategory(!btncategory)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal isVisible={adduom}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 130,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Add New UOM
              </Text>
              <TouchableOpacity onPress={() => setadduom(!adduom)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="UOM Name"
              />
            </View>
            <TouchableOpacity onPress={togglebtnuom}>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#144272',
                  height: 30,
                  borderRadius: 10,
                  width: 100,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add UOM
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
        {/*Add btn uom*/}
        <Modal isVisible={btnuom}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Added
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              UOM has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setbtnuom(!btnuom)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  addButton: {
    marginLeft: 2,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    width: 65,
  },
  completeButton: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 320,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
    marginLeft: 10,
    marginRight: 10,
  },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
  },
  text: {
    marginLeft: 15,
    color: '#144272',
    marginRight: 15,
  },
  value: {
    marginLeft: 15,
    color: '#144272',
    marginRight: 15,
  },
  infoRow: {
    marginTop: 5,
  },
  productinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
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
  valu: {
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
