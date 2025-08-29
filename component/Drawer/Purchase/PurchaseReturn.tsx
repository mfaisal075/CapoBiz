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
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
}

interface InvoiceListWithout {
  prod_id: number;
  prod_name: string;
  prod_upc_ean: string;
  prod_availavble_qty: string;
  prod_return_qty: number;
  prod_price: string;
  prod_fretail_price: string;
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

  const [psupplier, setpsupplier] = useState(false);
  const [currentpsupplier, setCurrentpsupplier] = useState<string | null>('');

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
      }
    } catch (error) {}
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
      if (res.status === 200 && data.status) {
        Toast.show({
          type: 'success',
          text1: 'Product added to cart successfully!',
        });
        setSearchTermWithout('');
        setShowResultsWithout(false);
        setQuantity('');
        fetchInvcWithout();
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
    } catch (error) {}
  };

  // Fetch Return Purchase without invoice
  const fetchInvcWithout = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadpurchasereturncart`);

      if (res.data.cartsession) {
        const cartItems = Object.values(res.data.cartsession).map(
          (item: any) => ({
            ...item,
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
      if (res.status === 200 && res.data.status) {
        Toast.show({
          type: 'success',
          text1: 'Order completed successfully!',
        });
        setWithInvcList([]);
        setOrderTotal(0);
        emptyCartWithInvc();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to complete order',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error completing order',
      });
    }
  };

  // Complete Odrer Without Invoice
  const compOrderWithoutInvc = async () => {
    if (!withoutInvcList.length) {
      Toast.show({
        type: 'error',
        text1: 'No items in cart to complete order',
      });
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/completepurchasereturn`,
        {
          supp_id: currentpsupplier,
          refrence_no: '',
          date: expireDate.toISOString().split('T')[0],
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
          text1: 'Order completed successfully!',
        });
        setWithoutInvcList([]);
        setOrderTotalWithout(0);
        emptyCartWithoutInvc();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to complete order',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error completing order',
      });
    }
  };

  useEffect(() => {
    if (currentpsupplier) {
      fetchSupData();
    }
    fetchSupplierData();
    fetchInvcWith();
    fetchInvcWithout();
    emptyCartWithInvc();
    emptyCartWithoutInvc();
  }, [currentpsupplier]);

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
              Purchase Return
            </Text>
          </View>
        </View>

        <View style={{marginBottom: 10}}>
          <View style={{flexDirection: 'row'}}>
            {/* Updated With Invoice Button */}
            <TouchableOpacity onPress={() => setSelectedOption('with')}>
              <View
                style={[
                  styles.toggleButton,
                  selectedOption === 'with'
                    ? styles.selectedButton
                    : styles.unselectedButton,
                ]}>
                <Text
                  style={[
                    styles.toggleButtonText,
                    selectedOption === 'with'
                      ? styles.selectedText
                      : styles.unselectedText,
                  ]}>
                  Return With Invoice
                </Text>
              </View>
            </TouchableOpacity>

            {/* Updated Without Invoice Button */}
            <TouchableOpacity onPress={() => setSelectedOption('without')}>
              <View
                style={[
                  styles.toggleButton,
                  selectedOption === 'without'
                    ? styles.selectedButton
                    : styles.unselectedButton,
                ]}>
                <Text
                  style={[
                    styles.toggleButtonText,
                    selectedOption === 'without'
                      ? styles.selectedText
                      : styles.unselectedText,
                  ]}>
                  Return Without Invoice
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderColor: '#fff',
              marginHorizontal: 8,
              width: '30%',
              backgroundColor: 'gray',
              marginVertical: 5,
            }}>
            <Text style={{color: '#fff'}}>NEW INV</Text>
          </View>

          <View>
            {selectedOption === 'with' ? (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}>
                  <TextInput
                    style={[styles.input, {width: 280}]}
                    placeholderTextColor={'white'}
                    placeholder="Search Invoice..."
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
                              fetchInvcWith();
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
                  <TouchableOpacity onPress={() => addInvoice()}>
                    <Image
                      style={{
                        tintColor: 'white',
                        width: 22,
                        height: 17,
                        alignSelf: 'center',
                        marginLeft: 5,
                        marginTop: 18,
                      }}
                      source={require('../../../assets/add.png')}
                    />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={withInvcList}
                  keyExtractor={(item, index) => index.toString()}
                  style={{height: '75%'}}
                  renderItem={({item}) => (
                    <ScrollView
                      style={{
                        padding: 5,
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
                            <Text style={styles.txt}>Purchase Quantity:</Text>
                            <Text style={styles.txt}>
                              {item.prod_purchase_qty}
                            </Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>Return Quantity:</Text>
                            <Text style={styles.txt}>
                              {item.prod_return_qty}
                            </Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>
                              Transaction Quantity:
                            </Text>
                            <Text style={styles.txt}>
                              {item.prod_purchase_qty}
                            </Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>Price:</Text>
                            <Text style={styles.txt}>{item.prod_price}</Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>Total Price:</Text>
                            <Text style={styles.txt}>
                              {item.prod_return_qty *
                                parseFloat(item.prod_price)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  )}
                  ListEmptyComponent={
                    <View
                      style={{
                        width: '100%',
                        height: 300,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: '#fff',
                        }}>
                        No data found in the database.
                      </Text>
                    </View>
                  }
                />

                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>Total:</Text>
                  <Text style={styles.totalText}>{orderTotal}</Text>
                </View>

                <TouchableOpacity onPress={compOrder}>
                  <View style={styles.completeButton}>
                    <Text
                      style={{
                        textAlign: 'center',
                        padding: 5,
                        color: '#144272',
                      }}>
                      Complete
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}>
                  <TextInput
                    style={[styles.input, {width: '90%'}]}
                    placeholderTextColor={'white'}
                    placeholder="Search Product..."
                    value={searchTermWithout}
                    onChangeText={handleSearchWithout}
                  />

                  {searchTermWithout.length > 0 &&
                    showResultsWithout &&
                    searchResultsWithout.length > 0 && (
                      <View
                        style={[
                          styles.resultsContainer,
                          {marginHorizontal: 10},
                        ]}>
                        {searchResultsWithout.map((item: any) => (
                          <TouchableOpacity
                            key={item.prod_id}
                            style={styles.resultItem}
                            onPress={() => {
                              setSearchTermWithout(item.value);
                              setShowResultsWithout(false);
                              setSelectedProductWithout(item);
                            }}>
                            <Text style={styles.resultText}>{item.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                </View>

                <View style={styles.row}>
                  <TextInput
                    style={[styles.inputSmall, {width: '100%'}]}
                    placeholderTextColor={'white'}
                    placeholder="Quantity"
                    value={quantity}
                    onChangeText={t => setQuantity(t)}
                  />
                </View>

                <View style={{marginHorizontal: '5%'}}>
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 10,
                      backgroundColor: '#fff',
                      paddingVertical: 10,
                      marginVertical: 10,
                    }}
                    onPress={addInvoiceWithout}>
                    <Text style={{fontSize: 14, fontWeight: 'bold'}}>Add</Text>
                  </TouchableOpacity>
                </View>

                <View style={{marginHorizontal: '5%'}}>
                  <DropDownPicker
                    items={transformedSupplier}
                    open={psupplier}
                    setOpen={setpsupplier}
                    value={currentpsupplier}
                    setValue={setCurrentpsupplier}
                    placeholder="Select Supplier"
                    placeholderStyle={{color: 'white'}}
                    textStyle={{color: 'white'}}
                    ArrowUpIconComponent={() => (
                      <Icon name="keyboard-arrow-up" size={18} color="#fff" />
                    )}
                    ArrowDownIconComponent={() => (
                      <Icon name="keyboard-arrow-down" size={18} color="#fff" />
                    )}
                    style={[styles.dropdown]}
                    dropDownContainerStyle={{
                      backgroundColor: 'white',
                      borderColor: 'white',
                      width: '100%',
                      marginTop: 8,
                    }}
                    labelStyle={{color: 'white'}}
                    listItemLabelStyle={{color: '#144272'}}
                  />
                </View>

                <View style={[styles.row]}>
                  <Text style={[styles.inputSmall, {width: '100%'}]}>
                    Reference
                  </Text>
                </View>

                <View style={[styles.row]}>
                  <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                    {supData?.sup_name ?? 'Supplier Name'}
                  </Text>

                  <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                    {supData?.sup_company_name ?? 'Company Name'}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                    {supData?.sup_address ?? 'Address'}
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTopWidth: 1,
                      borderBottomWidth: 1,
                      width: '46%',
                      borderRightWidth: 1,
                      borderLeftWidth: 1,
                      borderRadius: 5,
                      borderColor: 'white',
                      height: 36,
                      paddingHorizontal: 10,
                    }}>
                    <Text style={{color: 'white'}}>
                      {`${expireDate.toLocaleDateString()}`}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowexpireDatePicker(true)}>
                      <Image
                        style={{
                          height: 20,
                          width: 20,
                          resizeMode: 'stretch',
                          tintColor: '#fff',
                        }}
                        source={require('../../../assets/calendar.png')}
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
                </View>

                <FlatList
                  data={withoutInvcList}
                  keyExtractor={(item, index) => index.toString()}
                  style={{height: '34%'}}
                  renderItem={({item}) => (
                    <ScrollView
                      style={{
                        padding: 5,
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
                            <Text style={styles.txt}>BarCode:</Text>
                            <Text style={styles.txt}>{item.prod_upc_ean}</Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>In Stock:</Text>
                            <Text style={styles.txt}>
                              {item.prod_availavble_qty}
                            </Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>Return Quantity:</Text>
                            <Text style={styles.txt}>
                              {item.prod_return_qty}
                            </Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>Price:</Text>
                            <Text style={styles.txt}>{item.prod_price}</Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>Total Price:</Text>
                            <Text style={styles.txt}>
                              {item.prod_return_qty *
                                parseFloat(item.prod_price)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  )}
                />
                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>Total:</Text>
                  <Text style={styles.totalText}>{orderTotalWithout}</Text>
                </View>

                <TouchableOpacity onPress={compOrderWithoutInvc}>
                  <View style={styles.completeButton}>
                    <Text
                      style={{
                        textAlign: 'center',
                        padding: 5,
                        color: '#144272',
                      }}>
                      Complete
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: '5%',
    marginBottom: 8,
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
    borderRadius: 6,
    padding: 8,
    width: '46%',
    color: '#fff',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  addButton: {
    margin: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    width: 160,
    height: 30,
  },
  completeButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: 80,
    alignSelf: 'center',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '100%',
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
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 138,
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
  rowt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalContainer: {
    padding: 5,
    borderTopWidth: 1,
    borderTopColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'static',
    bottom: 0,
    left: 0,
    right: 0,
    marginTop: 5,
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  txt: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  toggleButton: {
    margin: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 30,
    borderWidth: 1,
    borderColor: 'white',
  },
  selectedButton: {
    backgroundColor: 'white',
    borderColor: '#144272',
  },
  unselectedButton: {
    backgroundColor: 'transparent',
  },
  toggleButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  selectedText: {
    color: '#144272',
  },
  unselectedText: {
    color: 'white',
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
