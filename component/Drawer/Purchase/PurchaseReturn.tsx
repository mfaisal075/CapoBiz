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
import Modal from 'react-native-modal';
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

export default function PurchaseReturn() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [selectedOption, setSelectedOption] = useState<'with' | 'without'>(
    'with',
  );
  const [supData, setSupData] = useState<SupplierData | null>(null);
  const [close, setclose] = useState(false);
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

  const toggleclosebtn = () => {
    setclose(!close);
  };
  const Info = [
    {
      ItemName: 'abc',
      PurchaseQTY: '1',
      ReturnQty: '4',
      TransactionQTY: 4,
      Price: '4',
      totalPrice: '200',
      total: '555',
    },
    {
      ItemName: 'abc',
      PurchaseQTY: '1',
      ReturnQty: '4',
      TransactionQTY: 4,
      Price: '4',
      totalPrice: '200',
      total: '555',
    },
    {
      ItemName: 'abc',
      PurchaseQTY: '1',
      ReturnQty: '4',
      TransactionQTY: 4,
      Price: '4',
      totalPrice: '200',
      total: '555',
    },
    {
      ItemName: 'abc',
      PurchaseQTY: '1',
      ReturnQty: '4',
      TransactionQTY: 4,
      Price: '4',
      totalPrice: '200',
      total: '555',
    },
  ];

  const without = [
    {
      ProductName: 'abc',
      barcode: '123',
      inStock: 'hj',
      returnQTY: '3',
      Price: '1',
      totalPrice: '9',
      totals: '22',
    },
    {
      ProductName: 'abc',
      barcode: '123',
      inStock: 'hj',
      returnQTY: '3',
      Price: '1',
      totalPrice: '9',
      totals: '22',
    },
  ];
  const total = Info.reduce((acc, item) => acc + parseFloat(item.total), 0);

  Info.forEach(item => {
    const qty = parseFloat(item.PurchaseQTY);
    const Price = parseFloat(item.Price);
    item.total = (qty * Price).toString();
  });

  const totals = without.reduce(
    (acc, item) => acc + parseFloat(item.totals),
    0,
  );

  without.forEach(item => {
    const qty = parseFloat(item.barcode);
    const Price = parseFloat(item.Price);
    item.totals = (qty * Price).toString();
  });
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

  useEffect(() => {
    if (currentpsupplier) {
      fetchSupData();
    }
    fetchSupplierData();
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

                <View>
                  <FlatList
                    data={Info}
                    keyExtractor={(item, index) => index.toString()}
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
                              {item.ItemName}
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
                              <Text style={styles.txt}>Purchase Quantity:</Text>
                              <Text style={styles.txt}>{item.PurchaseQTY}</Text>
                            </View>
                            <View style={styles.rowt}>
                              <Text style={styles.txt}>Return Quantity:</Text>
                              <Text style={styles.txt}>{item.ReturnQty}</Text>
                            </View>
                            <View style={styles.rowt}>
                              <Text style={styles.txt}>
                                Transaction Quantity:
                              </Text>
                              <Text style={styles.txt}>
                                {item.TransactionQTY}
                              </Text>
                            </View>
                            <View style={styles.rowt}>
                              <Text style={styles.txt}>Price:</Text>
                              <Text style={styles.txt}>{item.Price}</Text>
                            </View>
                            <View style={styles.rowt}>
                              <Text style={styles.txt}>Total Price:</Text>
                              <Text style={styles.txt}>{item.totalPrice}</Text>
                            </View>
                          </View>
                        </View>
                      </ScrollView>
                    )}
                  />
                </View>

                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>Total:</Text>
                  <Text style={styles.totalText}>{total}</Text>
                </View>

                <TouchableOpacity onPress={toggleclosebtn}>
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
                    style={[styles.input, {width: '100%'}]}
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
                  data={without}
                  keyExtractor={(item, index) => index.toString()}
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
                            {item.ProductName}
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
                            <Text style={styles.txt}>{item.barcode}</Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>In Stock:</Text>
                            <Text style={styles.txt}>{item.inStock}</Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>Return Quantity:</Text>
                            <Text style={styles.txt}>{item.returnQTY}</Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>Price:</Text>
                            <Text style={styles.txt}>{item.Price}</Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>Total Price:</Text>
                            <Text style={styles.txt}>{item.totalPrice}</Text>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  )}
                />
                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>Total:</Text>
                  <Text style={styles.totalText}>{totals}</Text>
                </View>
                <TouchableOpacity onPress={toggleclosebtn}>
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
