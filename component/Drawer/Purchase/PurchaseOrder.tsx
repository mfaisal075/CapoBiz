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
import React, {useState} from 'react';
import {RadioButton} from 'react-native-paper';
import {useDrawer} from '../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import {useNavigation} from '@react-navigation/native';
import Modal from 'react-native-modal';

export default function PurchaseOrder() {
  
  const [btnproduct, setbtnproduct] = useState(false);

  const togglebtnproduct = () => {
    setbtnproduct(!btnproduct);
  };
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
  const [expire, setexpire] = React.useState<'applyexpiry' | 'number'>(
    'applyexpiry',
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

  const [issupplier, setissupplier] = useState(false);
  const [currentsupplier, setCurrentsupplier] = useState<string | null>('');
  const supplierItem = [
    {label: 'Naeem', value: 'Naeem'},
    {label: 'Malik', value: 'Malik'},
  ];

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

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <ScrollView
          style={{
            marginBottom: 10,
          }}>
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

          <View style={styles.section}>
            <Text style={styles.label}>Search Product By Name/Barcode</Text>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: -10,
              }}>
              <TextInput
                style={[styles.input, {width: '92%'}]}
                placeholderTextColor={'white'}
                placeholder="Search Product..."
              />
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
            <View style={[styles.row, {alignItems: 'center'}]}>
              <TextInput
                style={styles.inputSmall}
                placeholderTextColor={'white'}
                placeholder="Quantity"
              />

              <TextInput
                style={styles.inputSmall}
                placeholderTextColor={'white'}
                placeholder="Purchase Price"
              />
            </View>

            <View style={[styles.row, {marginLeft: -3}]}>
              <RadioButton
                value="applyexpiry"
                status={expire === 'applyexpiry' ? 'checked' : 'unchecked'}
                color="white"
                uncheckedColor="white"
                onPress={() => setexpire('applyexpiry')}
              />
              <Text
                style={{
                  color: 'white',
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
                  borderColor: 'white',
                  marginLeft: 58,
                  height: 30,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 5,
                    borderColor: 'white',
                  }}>
                  <Text style={{marginLeft: 10, color: 'white'}}>
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
                        tintColor: 'white',
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

            <View style={[styles.row, {alignItems: 'center'}]}>
              <TextInput
                style={styles.inputSmall}
                placeholderTextColor={'white'}
                placeholder="Retail Price"
              />
            </View>
            <View style={styles.submitButton}>
              <Text
                style={{
                  color: '#144272',
                  textAlign: 'center',
                  marginTop: 5,
                }}>
                Submit
              </Text>
            </View>
           
            <View style={[styles.row]}>
            <Text style={[styles.inputSmall, {color: 'white',}]}>
              New Invoice
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
                  borderColor: 'white',
             
                  height: 35,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 5,
                    borderColor: 'white',
                  }}>
                  <Text style={{marginLeft: 10, color: 'white'}}>
                    {`${orderDate.toLocaleDateString()}`}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setShoworderDatePicker(true)}>
                    <Image
                      style={{
                        height: 20,
                        width: 20,
                        resizeMode: 'stretch',
                        alignItems: 'center',
                        marginLeft: 60,
                        tintColor: 'white',
                        alignSelf: 'flex-end',
                      }}
                      source={require('../../../assets/calendar.png')}
                    />
                    {showorderDatePicker && (
                      <DateTimePicker
                        testID="startDatePicker"
                        value={startDate}
                        mode="date"
                        is24Hour={true}
                        display="default"
                        onChange={onorderDateChange}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <DropDownPicker
              items={supplierItem}
              open={issupplier}
              setOpen={setissupplier}
              value={currentsupplier}
              setValue={setCurrentsupplier}
              placeholder="Select"
              placeholderStyle={{color: 'white'}}
              textStyle={{color: 'white'}}
              arrowIconStyle={{tintColor: 'white'}}
              style={[
                styles.dropdown,
                {
                  borderColor: 'white',
                  width: 340,
                  alignSelf: 'center',
                  marginTop: 10,
                  marginRight: 10,
                  marginLeft: 10,
                },
              ]}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: 'white',
                width: 340,
                marginLeft: 10,
              }}
              labelStyle={{color: 'white'}}
              listItemLabelStyle={{color: '#144272'}}
            />
            <View style={[styles.row]}>
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Supplier Name
              </Text>
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Company Name
              </Text>
            </View>
          </View>
          <View>
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
                          <Text style={styles.text}>Quantity:</Text>
                          <Text style={styles.text}>{item.QTY}</Text>
                        </View>
                        <View style={styles.rowt}>
                          <Text style={styles.text}>Purchase Price:</Text>
                          <Text style={styles.text}>{item.PurchasePrice}</Text>
                        </View>
                        <View style={styles.rowt}>
                          <Text style={styles.text}>Retail Price:</Text>
                          <Text style={styles.text}>{item.RetailPrice}</Text>
                        </View>
                        <View style={styles.rowt}>
                          <Text style={styles.text}>Total Price:</Text>
                          <Text style={styles.text}>{item.totalPrice}</Text>
                        </View>
                        <View style={styles.rowt}>
                          <Text style={[styles.text, {marginBottom: 5}]}>
                            Expiry Date:
                          </Text>
                          <Text style={[styles.text, {marginBottom: 5}]}>
                            {item.ExpiryDate}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                )}
              />
            </View>
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
            marginBottom: 7,
          }}>
          <TouchableOpacity onPress={togglebtnproduct}>
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
        {/*add product btn*/}
        <Modal isVisible={btnproduct}>
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
    gap: 8,
    marginTop: 8,
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
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
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
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: 285,
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 330,
    alignSelf: 'center',
    height: 30,
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
});
