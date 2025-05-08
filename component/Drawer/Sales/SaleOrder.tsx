import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';

export default function SaleOrder() {

  const {openDrawer} = useDrawer();
  const [Open, setOpen] = useState(false);
  const [currentVal, setCurrentVal] = useState<string | null>('');
  const item = [
    {
      label: 'walk_in_customer',
      value: 'walk_in_customer',
    },
    {label: 'Naeem', value: 'Naeem'},
    {label: 'Khalid', value: 'Khalid'},
  ];
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
  const Info = [
    {
      ItemName: 'abc',
      QTY: '1',
      Retail: '9',
      UnitPrice: '5',
      totalPrice: '200',
      total: '555',
    },
    {
      ItemName: 'abc',
      QTY: '1',
      Retail: '9',
      UnitPrice: '5',
      totalPrice: '200',
      total: '555',
    },
    {
      ItemName: 'abc',
      QTY: '1',
      Retail: '9',
      UnitPrice: '5',
      totalPrice: '200',
      total: '555',
    },
  ];
  const total = Info.reduce((acc, item) => acc + parseFloat(item.total), 0);

  Info.forEach(item => {
    const qty = parseFloat(item.QTY);
    const retail = parseFloat(item.Retail);
    item.total = (qty * retail).toString();
  });
    const [btnproduct, setbtnproduct] = useState(false);
  
    const togglebtnproduct = () => {
      setbtnproduct(!btnproduct);
    };

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
                style={{width: 30, height: 30, tintColor: 'white'}}
              />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 22,
                  fontWeight: 'bold',
                }}>
                Take Order
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: -10,
              }}>
              <TextInput
                style={[styles.input, {width: 310}]}
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
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Item Name:
              </Text>

              <Text style={[styles.inputSmall, {color: 'white'}]}>Stock</Text>
              <Text style={[styles.inputSmall, {color: 'white'}]}>BarCode</Text>
            </View>

            <View style={styles.row}>
              <TextInput
                style={styles.inputSmall}
                placeholderTextColor={'white'}
                placeholder="Quantity"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.inputSmall}
                placeholderTextColor={'white'}
                placeholder="Unit Price"
                keyboardType="numeric"
              />

              <View style={styles.addButton}>
                <Text
                  style={{
                    color: '#144272',
                    padding: 6,
                    textAlign: 'center',
                  }}>
                  Add to Cart
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.row, {alignItems: 'center'}]}>
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Invoice No:
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
                        value={orderDate}
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
              items={item}
              open={Open}
              setOpen={setOpen}
              value={currentVal}
              setValue={setCurrentVal}
              placeholder="Select Customer"
              placeholderStyle={{color: 'white'}}
              textStyle={{color: 'white'}}
              arrowIconStyle={{tintColor: 'white'}}
              style={styles.dropdown}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: 340,
              }}
              labelStyle={{color: 'white'}}
              listItemLabelStyle={{color: '#144272'}}
            />
            <View style={[styles.row, {marginTop: -1}]}>
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Customer Name:
              </Text>
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Customer Number:
              </Text>
            </View>
            <View style={[styles.row, {marginBottom: 10}]}>
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Customer Address:
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
                          <Text style={styles.text}>Retail:</Text>
                          <Text style={styles.text}>{item.Retail}</Text>
                        </View>
                        <View style={styles.rowt}>
                          <Text style={styles.text}>Unit Price:</Text>
                          <Text style={styles.text}>{item.UnitPrice}</Text>
                        </View>
                        <View style={styles.rowt}>
                          <Text style={[styles.text, {marginBottom: 5}]}>
                            Total Price:
                          </Text>
                          <Text style={[styles.text, {marginBottom: 5}]}>
                            {item.totalPrice}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                )}
              />
            </View>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalText}>{total}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'center',
              justifyContent: 'center',
              marginBottom: 1,
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
          </View>
        </ScrollView>
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
    marginBottom: -13,
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
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  addButton: {
    marginLeft: 4,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    width: 100,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: 340,
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
});
