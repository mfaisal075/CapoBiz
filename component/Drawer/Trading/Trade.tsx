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
import {RadioButton} from 'react-native-paper';

export default function Trade() {
  const {openDrawer} = useDrawer();
  const labour = [
    {label: 'Saif', value: 'Saif'},
    {label: 'Bilal', value: 'Bilal'},
    {label: 'Khan', value: 'Khan'},
  ];
  const [Labour, setLabour] = useState(false);
  const [currentLabour, setCurrentLabour] = useState<string | null>('');

  const [customer, setcustomer] = useState(false);

  const [Customerdr, setCustomerdr] = useState(false);
  const [currentCustomerdr, setCurrentCustomerdr] = useState<string | null>('');

  const togglecustomer = () => {
    setcustomer(!customer);
  };

  const [area, setarea] = useState(false);

  const togglearea = () => {
    setarea(!area);
  };
  const [customerArea, setcustomerArea] = useState(false);
  const [currentcustomerarea, setCurrentcustomerarea] = useState<string | null>(
    '',
  );
  const customerAreaItem = [
    {label: 'Gujranwala', value: 'Gujranwala'},
    {label: 'Lahore', value: 'Lahore'},
  ];
  const [areabtn, setareabtn] = useState(false);

  const toggleareabtn = () => {
    setareabtn(!areabtn);
  };

  const [btncustomerarea, setbtncustomerarea] = useState(false);

  const togglebtncustomerarea = () => {
    setbtncustomerarea(!btncustomerarea);
  };

  const [customerType, setcustomerType] = React.useState<
    'addacustomer' | 'string'
  >('addacustomer');

  const item = [
    {
      label: 'walk_in_customer s/o Nill | NILL',
      value: 'walk_in_customer s/o Nill | NILL',
    },
    {label: 'Naeem s/o | NILL', value: 'Naeem s/o  | NILL'},
    {label: 'Khalid s/o | NILL', value: 'Khalid s/o  | NILL'},
    {label: 'a s/o | NILL', value: 'a s/o  | NILL'},
  ];

  {
    /*customer*/
  }
  const [customermodal, setcustomermodal] = useState(false);

  const togglecustomermodal = () => {
    setcustomermodal(!customermodal);
  };

  const [customerTypemodal, setcustomerTypemodal] = useState(false);
  const [currentcustomer, setCurrentcustomer] = useState<string | null>('');
  const customerItem = [
    {label: 'New', value: 'New'},
    {label: 'Blue', value: 'Blue'},
    {label: 'Standard', value: 'Standard'},
  ];

  const [addcustomermodal, setaddcustomermodal] = useState(false);

  const toggleaddcustomer = () => {
    setaddcustomermodal(!addcustomermodal);
  };

  const [btncustomermodal, setbtncustomermodal] = useState(false);

  const togglebtncustomer = () => {
    setbtncustomermodal(!btncustomermodal);
  };

  const [areamodal, setareamodal] = useState(false);

  const toggleareamodal = () => {
    setareamodal(!areamodal);
  };
  const [customerAreamodal, setcustomerAreamodal] = useState(false);
  const [currentcustomerareamodal, setCurrentcustomerareamodal] = useState<
    string | null
  >('');
  const customerAreaItemmodal = [
    {label: 'Gujranwala', value: 'Gujranwala'},
    {label: 'Lahore', value: 'Lahore'},
  ];
  const [areabtnmodal, setareabtnmodal] = useState(false);

  const toggleareabtnmodal = () => {
    setareabtnmodal(!areabtnmodal);
  };

  const [btncustomerareamodal, setbtncustomerareamodal] = useState(false);

  const togglebtncustomerareamodal = () => {
    setbtncustomerareamodal(!btncustomerareamodal);
  };

  const Info = [
    {
      ProductName: 'abc',
      CostPrice: 6,
      SalePrice: 9,
      Quantity: '5',
      subtotal: '555',
    },
    {
      ProductName: 'abc',
      CostPrice: 6,
      SalePrice: 9,
      Quantity: '5',
      subtotal: '555',
    },
  ];

  const CostPrice = Object.values(Info)
    .flat()
    .reduce((acc, item) => acc + item.CostPrice, 0);
  const SalePrice = Object.values(Info)
    .flat()
    .reduce((acc, item) => acc + item.SalePrice, 0);

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

  const [checkout, setcheckout] = useState(false);

  const togglecheckout = () => {
    setcheckout(!checkout);
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
                Trading
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

              <Text style={[styles.inputSmall, {color: 'white'}]}>BarCode</Text>

              <TextInput
                style={styles.inputSmall}
                placeholderTextColor={'white'}
                placeholder="Quantity"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={styles.inputSmall}
                placeholderTextColor={'white'}
                placeholder="Sale Price"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.inputSmall}
                placeholderTextColor={'white'}
                placeholder="Cost Price"
                keyboardType="numeric"
              />

              <View style={styles.addButton}>
                <Text
                  style={{
                    color: '#144272',
                    padding: 6,
                    textAlign: 'center',
                  }}>
                  Submit
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <DropDownPicker
                  items={labour}
                  open={Labour}
                  setOpen={setLabour}
                  value={currentLabour}
                  setValue={setCurrentLabour}
                  placeholder="Select Supplier"
                  placeholderStyle={{color: 'white'}}
                  textStyle={{color: 'white'}}
                  arrowIconStyle={{tintColor: 'white'}}
                  style={[
                    styles.dropdown,
                    {
                      flex: 1,
                      marginLeft: 1,
                      marginBottom: -1,
                      marginTop: -1,
                      zIndex: Labour ? 1000 : 0,
                      width: 310,
                    },
                  ]}
                  dropDownContainerStyle={{
                    backgroundColor: 'white',
                    borderColor: '#144272',
                    width: 310,
                    marginLeft: 1,
                  }}
                  labelStyle={{color: 'white'}}
                  listItemLabelStyle={{color: '#144272'}}
                />

                <TouchableOpacity
                  onPress={togglecustomer}
                  style={{marginLeft: -19}}>
                  <Image
                    style={{
                      tintColor: 'white',
                      width: 18,
                      height: 18,
                      alignSelf: 'center',
                    }}
                    source={require('../../../assets/add.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.row, {alignItems: 'center'}]}>
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Invoice No:
              </Text>

              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Supplier Name
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Company Name:
              </Text>

              <Text style={[styles.inputSmall, {color: 'white'}]}>Address</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: -8,
                marginTop: -7,
              }}>
              <DropDownPicker
                items={item}
                open={Customerdr}
                setOpen={setCustomerdr}
                value={currentCustomerdr}
                setValue={setCurrentCustomerdr}
                placeholder="Select Customer"
                placeholderStyle={{color: 'white'}}
                textStyle={{color: 'white'}}
                arrowIconStyle={{tintColor: 'white'}}
                style={[styles.dropdown, {width: 310}]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 310,
                }}
                labelStyle={{color: 'white'}}
                listItemLabelStyle={{color: '#144272'}}
              />
              <TouchableOpacity onPress={togglecustomermodal}>
                <Image
                  style={{
                    tintColor: 'white',
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

            <View style={[styles.row, {alignItems: 'center'}]}>
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Reference No:
              </Text>

              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Customer Name
              </Text>
            </View>

            <View style={[styles.row, {marginBottom: 10}]}>
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Father Name:
              </Text>

              <Text style={[styles.inputSmall, {color: 'white'}]}>Address</Text>
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
                          <Text style={styles.text}>Cost Price:</Text>
                          <Text style={styles.text}>{item.CostPrice}</Text>
                        </View>
                        <View style={styles.rowt}>
                          <Text style={styles.text}>Sale Price:</Text>
                          <Text style={styles.text}>{item.SalePrice}</Text>
                        </View>
                        <View style={styles.rowt}>
                          <Text style={styles.text}>Quantity:</Text>
                          <Text style={styles.text}>{item.Quantity}</Text>
                        </View>
                        <View style={styles.rowt}>
                          <Text style={[styles.text, {marginBottom: 5}]}>
                            SubTotal:
                          </Text>
                          <Text style={[styles.text, {marginBottom: 5}]}>
                            {item.subtotal}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                )}
              />
            </View>
            <View style={[styles.row, {marginLeft: 15, marginRight: 10}]}>
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Cost Price: {CostPrice}
              </Text>
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Sale Price: {SalePrice}
              </Text>
            </View>
            <View style={[styles.row, {marginLeft: 15, marginRight: 10}]}>
              <Text style={[styles.inputSmall, {color: 'white'}]}>
                Profit/Loss
              </Text>
              <Text style={[styles.inputSmall, {color: 'white'}]}>Payable</Text>
            </View>

            <View style={styles.section}>
              <View
                style={[
                  styles.row,
                  {
                    alignItems: 'center',
                    marginBottom: 6,
                    marginTop: -2,
                    marginLeft: 5,
                  },
                ]}>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="Paid"
                  placeholderTextColor={'white'}
                />

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
            </View>

            <TouchableOpacity onPress={togglecheckout}>
              <View
                style={{
                  width: 335,
                  height: 30,
                  backgroundColor: 'white',
                  borderRadius: 15,
                  alignSelf: 'center',
                  margin: 5,
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

        {/*checkout*/}
        <Modal isVisible={checkout}>
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
              <TouchableOpacity onPress={() => setcheckout(!checkout)}>
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
        {/*supplier*/}
        <Modal isVisible={customer}>
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 380,
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
                Add New Supplier
              </Text>
              <TouchableOpacity onPress={() => setcustomer(!customer)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                marginTop: 10,
                flexDirection: 'row',
                marginLeft: 10,
              }}>
              <RadioButton
                value="addacustomer"
                status={
                  customerType === 'addacustomer' ? 'unchecked' : 'checked'
                }
                color="#144272"
                uncheckedColor="#144272"
                onPress={() => setcustomerType('addacustomer')}
              />
              <Text
                style={{
                  color: '#144272',
                  marginTop: 7,
                  marginLeft: -5,
                }}>
                Also a Customer
              </Text>
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Company Name"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Agency Name"
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Supplier Name"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 1"
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Address"
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={customerAreaItem}
                open={customerArea}
                setOpen={setcustomerArea}
                value={currentcustomerarea}
                setValue={setCurrentcustomerarea}
                placeholder="Select Supplier Area"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                arrowIconStyle={{tintColor: '#144272'}}
                style={[
                  styles.dropdown,
                  {
                    borderColor: '#144272',
                    width: 265,
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
              />
              <TouchableOpacity onPress={togglearea}>
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
              }}>
              <TouchableOpacity>
                <View
                  style={[
                    styles.row,
                    {
                      marginLeft: 13,
                      backgroundColor: '#144272',
                      borderRadius: 10,
                      width: 295,
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
            </View>

            <TouchableOpacity onPress={togglebtncustomerarea}>
              <View
                style={{
                  backgroundColor: '#144272',
                  height: 30,
                  width: 120,
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
                  Add Supplier
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*supplier area*/}
        <Modal isVisible={area}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 135,
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
                Add New Area
              </Text>
              <TouchableOpacity onPress={() => setarea(!area)}>
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
                placeholder="Area Name"
              />
            </View>
            <TouchableOpacity onPress={toggleareabtn}>
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
                  Add Area
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/*add area btn*/}
        <Modal isVisible={areabtn}>
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
              Area has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setareabtn(!areabtn)}>
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

        {/*btn supplier*/}
        <Modal isVisible={btncustomerarea}>
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
              Supplier has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => setbtncustomerarea(!btncustomerarea)}>
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

        {/*customer*/}
        <Modal isVisible={customermodal}>
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 430,
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
                Add New Customer
              </Text>
              <TouchableOpacity
                onPress={() => setcustomermodal(!customermodal)}>
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
                placeholder="Customer Name"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="father Name"
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Email"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Address"
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 1"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 2"
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 3"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="CNIC"
                keyboardType="numeric"
                maxLength={13}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={customerItem}
                open={customerTypemodal}
                setOpen={setcustomerTypemodal}
                value={currentcustomer}
                setValue={setCurrentcustomer}
                placeholder="Select Customer Type"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                arrowIconStyle={{tintColor: '#144272'}}
                style={[
                  styles.dropdown,
                  {
                    borderColor: '#144272',
                    width: 265,
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
              />
              <TouchableOpacity onPress={toggleaddcustomer}>
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
                items={customerAreaItemmodal}
                open={customerAreamodal}
                setOpen={setcustomerAreamodal}
                value={currentcustomerareamodal}
                setValue={setCurrentcustomerareamodal}
                placeholder="Select Customer Area"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                arrowIconStyle={{tintColor: '#144272'}}
                style={[
                  styles.dropdown,
                  {
                    borderColor: '#144272',
                    width: 265,
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
              />
              <TouchableOpacity onPress={toggleareamodal}>
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
            <TouchableOpacity>
              <View
                style={[
                  styles.row,
                  {
                    marginLeft: 10,
                    marginRight: 10,
                    backgroundColor: '#144272',
                    borderRadius: 10,
                    width: 290,
                    alignSelf: 'center',
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
            <TouchableOpacity onPress={togglebtncustomerareamodal}>
              <View
                style={{
                  backgroundColor: '#144272',
                  height: 30,
                  width: 120,
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
                  Add Customer
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>
        {/*add customer type*/}
        <Modal isVisible={addcustomermodal}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 135,
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
                Add New Type
              </Text>
              <TouchableOpacity
                onPress={() => setaddcustomermodal(!addcustomermodal)}>
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
                placeholder="Type Name"
              />
            </View>
            <TouchableOpacity onPress={togglebtncustomer}>
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
                  Add Type
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
        {/*add type btn*/}
        <Modal isVisible={btncustomermodal}>
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
              Type has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => setbtncustomermodal(!btncustomermodal)}>
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

        {/*customer area*/}
        <Modal isVisible={areamodal}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 135,
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
                Add New Area
              </Text>
              <TouchableOpacity onPress={() => setareamodal(!areamodal)}>
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
                placeholder="Area Name"
              />
            </View>
            <TouchableOpacity onPress={toggleareabtnmodal}>
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
                  Add Area
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/*add area btn*/}
        <Modal isVisible={areabtnmodal}>
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
              Area has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setareabtnmodal(!areabtnmodal)}>
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

        {/*btn customer*/}
        <Modal isVisible={btncustomerareamodal}>
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
              Customer has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => setbtncustomerareamodal(!btncustomerareamodal)}>
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
    width: 285,
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
  productinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  rowt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  infoRow: {
    marginTop: 5,
  },
});
