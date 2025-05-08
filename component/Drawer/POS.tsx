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
import {useNavigation} from '@react-navigation/native';
import {useDrawer} from '../DrawerContext';
import Modal from 'react-native-modal';
import {RadioButton} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

export default function POS() {
  const paidInputRef = React.useRef<TextInput>(null);

  const handlePaymentPress = () => {
    setModalVisible(false);
    setTimeout(() => {
      paidInputRef.current?.focus();
    }, 300);
  };

  const [isModalV, setModalV] = useState(false);
  const tglModal = () => {
    setModalV(!isModalV);
  };

  const [isModalVisi, setModalVisi] = useState(false);
  const tglMdl = () => {
    setModalVisi(!isModalVisi);
  };
  const [isModalView, setModalView] = useState(false);
  const tglView = () => {
    setModalView(!isModalView);
  };
  const item = [
    {
      label: 'walk_in_customer s/o Nill | NILL',
      value: 'walk_in_customer s/o Nill | NILL',
    },
    {label: 'Naeem s/o | NILL', value: 'Naeem s/o  | NILL'},
    {label: 'Khalid s/o | NILL', value: 'Khalid s/o  | NILL'},
    {label: 'a s/o | NILL', value: 'a s/o  | NILL'},
  ];

  const labour = [
    {label: 'Saif', value: 'Saif'},
    {label: 'Bilal', value: 'Bilal'},
    {label: 'Khan', value: 'Khan'},
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<string | null>('');

  const [Open, setOpen] = useState(false);
  const [currentVal, setCurrentVal] = useState<string | null>('');

  const [Labour, setLabour] = useState(false);
  const [currentLabour, setCurrentLabour] = useState<string | null>('');

  const navigation = useNavigation();

  const {openDrawer} = useDrawer();
  const [discountType, setDiscountType] = React.useState<'cash' | 'percent'>(
    'cash',
  );

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const [isModalCash, setModalCash] = useState(false);

  const toggleCash = () => {
    setModalCash(!isModalCash);
  };

  const [isModalClose, setModalClose] = useState(false);

  const toggleClose = () => {
    setModalClose(!isModalClose);
  };

  const [isModalOK, setModalOK] = useState(false);

  const toggleOK = () => {
    setModalOK(!isModalOK);
  };

  const [isModalSubmit, setModalSubmit] = useState(false);

  const toggleSubmit = () => {
    setModalSubmit(!isModalSubmit);
  };

  const [isModalInvoice, setModalInvoice] = useState(false);

  const toggleInvoice = () => {
    setModalInvoice(!isModalInvoice);
  };

  const [addproduct, setaddproduct] = useState(false);

  const toggleproduct = () => {
    setaddproduct(!addproduct);
  };
  const [Type, setType] = React.useState<'GenerateAutoBarCode' | 'number'>(
    'GenerateAutoBarCode',
  );

  const Info = [
    {
      user: 'Admin',
      cashinhand: '1',
      totalsales: '0',
      chequestotal: '123',
      totalreturn: '00',
      closingamount: '200',
    },
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

  {
    /*customer*/
  }
  const [customer, setcustomer] = useState(false);

  const togglecustomer = () => {
    setcustomer(!customer);
  };

  const [customerType, setcustomerType] = useState(false);
  const [currentcustomer, setCurrentcustomer] = useState<string | null>('');
  const customerItem = [
    {label: 'New', value: 'New'},
    {label: 'Blue', value: 'Blue'},
    {label: 'Standard', value: 'Standard'},
  ];

  const [addcustomer, setaddcustomer] = useState(false);

  const toggleaddcustomer = () => {
    setaddcustomer(!addcustomer);
  };

  const [btncustomer, setbtncustomer] = useState(false);

  const togglebtncustomer = () => {
    setbtncustomer(!btncustomer);
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
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/screen.jpg')}
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
                source={require('../../assets/menu.png')}
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
                POS
              </Text>
            </View>
            <TouchableOpacity onPress={toggleModal}>
              <Image
                source={require('../../assets/dots.png')}
                style={{
                  width: 22,
                  height: 22,
                  tintColor: 'white',
                }}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              padding: 12,
            }}>
            <View style={styles.section}>
              <Text style={styles.label}>Search Product By Name/Barcode</Text>
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: -10,
                }}>
                <TextInput
                  style={[styles.input, {width: 258}]}
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
                    source={require('../../assets/search.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleproduct}>
                  <Image
                    style={{
                      tintColor: 'white',
                      width: 22,
                      height: 17,
                      alignSelf: 'center',
                      marginLeft: 5,
                      marginTop: 18,
                    }}
                    source={require('../../assets/add.png')}
                  />
                </TouchableOpacity>
              </View>
              <View style={[styles.row, {alignItems: 'center'}]}>
                <TextInput
                  style={styles.inputSmall}
                  placeholderTextColor={'white'}
                  placeholder="Product"
                />

                <TextInput
                  style={styles.inputSmall}
                  placeholderTextColor={'white'}
                  placeholder="Stock"
                />

                <View style={{width: 85, zIndex: isOpen ? 1000 : 0}}>
                  <DropDownPicker
                    open={isOpen}
                    value={currentValue}
                    items={[{label: '', value: ''}]}
                    setOpen={setIsOpen}
                    setValue={setCurrentValue}
                    setItems={() => {}}
                    placeholder="UOM"
                    placeholderStyle={{color: 'white'}}
                    textStyle={{color: 'white'}}
                    arrowIconStyle={{tintColor: 'white'}}
                    style={[styles.dropdown, {width: 83}]}
                    dropDownContainerStyle={{
                      backgroundColor: 'white',
                      borderColor: '#144272',
                      width: 83,
                    }}
                    labelStyle={{color: 'white'}}
                    listItemLabelStyle={{color: '#144272'}}
                  />
                </View>
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
                    Add
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Customer</Text>

              <View
                style={{
                  flexDirection: 'row',
                }}>
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
                    width: 287,
                  }}
                  labelStyle={{color: 'white'}}
                  listItemLabelStyle={{color: '#144272'}}
                />
                <TouchableOpacity onPress={togglecustomer}>
                  <Image
                    style={{
                      tintColor: 'white',
                      width: 22,
                      height: 17,
                      alignSelf: 'center',
                      marginLeft: -26,
                      marginTop: 17,
                    }}
                    source={require('../../assets/add.png')}
                  />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholderTextColor={'white'}
                placeholder="Name"
              />
              <TextInput
                style={styles.input}
                placeholderTextColor={'white'}
                placeholder="Contact#"
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholderTextColor={'white'}
                placeholder="Address"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Builty Address</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor={'white'}
                placeholder="Builty Address"
              />

              <View style={styles.row}>
                <TextInput
                  style={styles.inputSmall}
                  placeholderTextColor={'white'}
                  placeholder="Builty Contact#"
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.inputSmall}
                  placeholderTextColor={'white'}
                  placeholder="Freight Charges"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.row, {alignItems: 'center'}]}>
                <View
                  style={{
                    width: '48%',
                    zIndex: Labour ? 1000 : 0,
                    marginRight: 8,
                  }}>
                  <DropDownPicker
                    items={labour}
                    open={Labour}
                    setOpen={setLabour}
                    value={currentLabour}
                    setValue={setCurrentLabour}
                    placeholder="Select"
                    placeholderStyle={{color: 'white'}}
                    textStyle={{color: currentVal ? 'white' : 'white'}}
                    arrowIconStyle={{tintColor: 'white'}}
                    style={[styles.dropdown, {width: 155}]}
                    dropDownContainerStyle={{
                      backgroundColor: 'white',
                      borderColor: '#144272',
                      width: 155,
                    }}
                    labelStyle={{color: 'white'}}
                    listItemLabelStyle={{color: '#144272'}}
                  />
                </View>

                <TextInput
                  style={styles.inputSmall}
                  placeholder="Labour Expense"
                  keyboardType="numeric"
                  placeholderTextColor="white"
                />
              </View>
            </View>

            <ScrollView style={styles.section}>
              <Text style={styles.label}>Order Summary</Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('Table' as never)}>
                <View
                  style={[
                    styles.input,
                    {flexDirection: 'row', justifyContent: 'space-between'},
                  ]}>
                  <Text style={styles.label}>Order Details</Text>
                  <Image
                    style={{
                      width: 22,
                      height: 17,
                      tintColor: 'white',
                      alignSelf: 'center',
                    }}
                    source={require('../../assets/rightarrow.png')}
                  />
                </View>
              </TouchableOpacity>

              <Text style={{color: 'white'}}>Order Total: 0.00</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor={'white'}
                placeholder="Discount"
                keyboardType="numeric"
              />
              <View style={[styles.row,{marginTop:-6}]}>
                <RadioButton
                  value="cash"
                  status={discountType === 'cash' ? 'checked' : 'unchecked'}
                  color="white"
                  uncheckedColor="white"
                  onPress={() => setDiscountType('cash')}
                />
                <Text
                  style={{
                    color: 'white',
                    marginTop: 7,
                  }}>
                  Cash
                </Text>
                <RadioButton
                  value="percent"
                  color="white"
                  uncheckedColor="white"
                  status={discountType === 'percent' ? 'checked' : 'unchecked'}
                  onPress={() => setDiscountType('percent')}
                />
                <Text
                  style={{
                    color: 'white',
                    marginTop: 7,
                  }}>
                  %age
                </Text>
                <Text
                  style={{
                    color: 'white',
                    marginTop: 7,
                  }}>
                  0.00
                </Text>
              </View>
              <Text
                style={{
                  color: 'white',
                }}>
                Pre. Balance: 0.00
              </Text>
              <Text
                style={{
                  color: 'white',
                }}>
                Net Payable: 0.00
              </Text>
              <TextInput
                ref={paidInputRef}
                style={styles.input}
                placeholder="Paid"
                keyboardType="numeric"
                placeholderTextColor={'white'}
              />

              <Text
                style={{
                  color: 'white',
                }}>
                Balance: 0.00
              </Text>
              <View style={styles.completeButton}>
                <Text
                  style={{
                    color: '#144272',
                    textAlign: 'center',
                    padding: 7,
                  }}>
                  Complete
                </Text>
              </View>
            </ScrollView>
          </View>
        </ScrollView>

        <Modal
          isVisible={isModalVisible}
          onBackdropPress={toggleModal}
          backdropOpacity={0.3}
          animationIn="fadeIn"
          animationOut="fadeOut"
          style={{margin: 0, position: 'absolute', top: 32, right: 10}}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 5,
              width: 130,
              padding: 10,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
            <TouchableOpacity onPress={handlePaymentPress}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <Image
                  style={{
                    width: 16,
                    height: 10,
                    marginRight: 5,
                    tintColor: '#144272',
                    marginTop: 10,
                  }}
                  source={require('../../assets/payment.png')}
                />
                <Text
                  style={{
                    color: '#144272',
                    paddingTop: 5,
                  }}>
                  Payment
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={tglModal}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <Image
                  style={{
                    width: 16,
                    height: 14,
                    marginRight: 5,
                    tintColor: '#144272',
                    marginTop: 7,
                  }}
                  source={require('../../assets/hold.png')}
                />

                <Text
                  style={{
                    color: '#144272',
                    paddingTop: 5,
                  }}>
                  Hold
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={tglView}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <Image
                  style={{
                    width: 25,
                    height: 25,
                    marginRight: 1,
                    tintColor: '#144272',
                    marginTop: 5,
                    marginLeft: -4,
                  }}
                  source={require('../../assets/viewinvoice.png')}
                />

                <Text
                  style={{
                    color: '#144272',
                    paddingTop: 5,
                  }}>
                  View Invoice
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleCash}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                    marginRight: 5,
                    tintColor: '#144272',
                    marginTop: 6,
                  }}
                  source={require('../../assets/cashregister.png')}
                />

                <Text
                  style={{
                    color: '#144272',
                    paddingTop: 5,
                  }}>
                  Cash Register
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={tglMdl}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <Image
                  style={{
                    width: 12,
                    height: 12,
                    marginRight: 10,
                    tintColor: '#144272',
                    marginTop: 10,
                  }}
                  source={require('../../assets/refresh.png')}
                />

                <Text
                  style={{
                    color: '#144272',
                    paddingTop: 5,
                  }}>
                  Refresh
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleInvoice}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <Image
                  style={{
                    width: 17,
                    height: 19,
                    marginRight: 5,
                    tintColor: '#144272',
                    marginTop: 7,
                    marginLeft: -1,
                  }}
                  source={require('../../assets/holdinvoice.png')}
                />

                <Text
                  style={{
                    color: '#144272',
                    paddingTop: 5,
                  }}>
                  Hold Invoice
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Close' as never)}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <Image
                  style={{
                    width: 18,
                    height: 18,
                    marginRight: 5,
                    tintColor: '#144272',
                    marginTop: 6.2,
                  }}
                  source={require('../../assets/close.png')}
                />

                <Text
                  style={{
                    color: '#144272',
                    paddingTop: 5,
                  }}>
                  Close
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        <Modal isVisible={isModalV}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 220,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../assets/info.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Are you sure?
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Do you really want to hold this invoice!
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setModalV(!isModalV)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 100,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 100,
                    height: 30,
                    padding: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Yes, hold it
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/*refresh*/}
        <Modal isVisible={isModalVisi}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 220,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../assets/info.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Are you sure?
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              You won't be able to revert this record!
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setModalVisi(!isModalVisi)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 100,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 100,
                    height: 30,
                    padding: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Yes, refresh it
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*View Invoice*/}
        <Modal isVisible={isModalView}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 250,
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
                Search Invoice
              </Text>
              <TouchableOpacity onPress={() => setModalView(!isModalView)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="Search Invoice..."
              />
              <TouchableOpacity>
                <Image
                  style={{
                    width: 25,
                    height: 22,
                    tintColor: '#144272',
                    marginLeft: 5,
                  }}
                  source={require('../../assets/search.png')}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*cash register*/}
        <Modal isVisible={isModalCash}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 240,
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
                Cash Register
              </Text>
              <TouchableOpacity onPress={() => setModalCash(!isModalCash)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
                fontSize: 16,
              }}>
              Cash Close
            </Text>

            <FlatList
              data={Info}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <ScrollView
                  style={{
                    padding: 5,
                  }}>
                  <View style={styles.infoRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>User:</Text>
                      <Text style={styles.text}>{item.user}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.value}>Cash In Hand:</Text>
                      <Text style={styles.value}>{item.cashinhand}</Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                    <Text style={styles.value}>
                      Total Sales:
                    </Text>
                    <Text style={styles.value}>
                      {item.totalsales}
                    </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                    <Text style={styles.value}>
                      Cheque's Total: 
                    </Text>
                    <Text style={styles.value}>
                      {item.chequestotal}
                    </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                    <Text style={styles.value}>
                      Total Return: 
                    </Text>
                    <Text style={styles.value}>
                      {item.totalreturn}
                    </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                    <Text style={styles.value}>
                      Closing Amount: 
                    </Text>
                    <Text style={styles.value}>
                   {item.closingamount}
                    </Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={toggleClose}>
                    <View
                      style={{
                        width: 70,
                        height: 30,
                        backgroundColor: '#144272',
                        borderRadius: 10,
                        margin: 10,
                        alignSelf: 'center',
                      }}>
                      <Text
                        style={{
                          color: 'white',
                          textAlign: 'center',
                          marginTop: 5,
                        }}>
                        Close
                      </Text>
                    </View>
                  </TouchableOpacity>
                </ScrollView>
              )}
            />
          </View>
        </Modal>
        {/*close*/}
        <Modal isVisible={isModalClose}>
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
              source={require('../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Success
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Cash register has been closed successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={toggleOK}>
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
        {/*ok btn*/}
        <Modal isVisible={isModalOK}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 160,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Text
              style={{
                color: '#144272',
                fontWeight: 'bold',
                margin: 10,
                fontSize: 16,
                textAlign: 'center',
              }}>
              Cash Register
            </Text>
            <Text
              style={{
                marginLeft: 10,
                color: '#144272',
              }}>
              {' '}
              Cash In Hand
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#144272',
                borderRadius: 5,
                width: 250,
                alignSelf: 'center',
              }}
              placeholderTextColor={'#144272'}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={toggleSubmit}>
              <View
                style={{
                  backgroundColor: '#144272',
                  borderRadius: 5,
                  height: 30,
                  width: 60,
                  margin: 10,
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    marginTop: 5,
                  }}>
                  Submit
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/*submitbtn*/}
        <Modal isVisible={isModalSubmit}>
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
              source={require('../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Success
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Cash register opened successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('POS' as never)}>
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

        {/*invoice*/}
        <Modal isVisible={isModalInvoice}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 130,
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
                Hold Invoices
              </Text>
              <TouchableOpacity
                onPress={() => setModalInvoice(!isModalInvoice)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                    marginTop: 2,
                  }}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>{' '}
            </View>
            <Text
              style={{
                color: '#144272',
                margin: 10,
                textAlign: 'center',
              }}>
              No record present in the database for this Date range!
            </Text>
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
                  source={require('../../assets/cross.png')}
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

            <View style={[styles.row, {marginLeft: 7,
               marginRight: 10}]}>
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
                        alignSelf:'flex-end'
                      }}
                      source={require('../../assets/calendar.png')}
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
                arrowIconStyle={{tintColor: '#144272'}}
                style={[styles.dropdown, {borderColor: '#144272', width: 265}]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
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
                  source={require('../../assets/add.png')}
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
                arrowIconStyle={{tintColor: '#144272'}}
                style={[styles.dropdown, {borderColor: '#144272', width: 265}]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
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
                  source={require('../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.row,
                {marginLeft: 10, marginRight: 10, marginTop: -8,marginBottom:-8},
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
                arrowIconStyle={{tintColor: '#144272'}}
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
              arrowIconStyle={{tintColor: '#144272'}}
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
                width: 295,marginLeft:11
              }}
              labelStyle={{color: '#144272'}}
              listItemLabelStyle={{color: '#144272'}}
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
                  alignSelf:'center'
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
              source={require('../../assets/tick.png')}
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
                  source={require('../../assets/cross.png')}
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
              source={require('../../assets/tick.png')}
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
                  source={require('../../assets/cross.png')}
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
              source={require('../../assets/tick.png')}
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

        {/*customer*/}
        <Modal isVisible={customer}>
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
              <TouchableOpacity onPress={() => setcustomer(!customer)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../assets/cross.png')}
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
                open={customerType}
                setOpen={setcustomerType}
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
                  source={require('../../assets/add.png')}
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
                items={customerAreaItem}
                open={customerArea}
                setOpen={setcustomerArea}
                value={currentcustomerarea}
                setValue={setCurrentcustomerarea}
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
                  source={require('../../assets/add.png')}
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
                    alignSelf:'center'
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
                  Add Customer
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>
        {/*add customer type*/}
        <Modal isVisible={addcustomer}>
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
              <TouchableOpacity onPress={() => setaddcustomer(!addcustomer)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../assets/cross.png')}
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
        <Modal isVisible={btncustomer}>
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
              source={require('../../assets/tick.png')}
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
              <TouchableOpacity onPress={() => setbtncustomer(!btncustomer)}>
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
                  source={require('../../assets/cross.png')}
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
              source={require('../../assets/tick.png')}
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
       
        {/*btn customer*/}
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
              source={require('../../assets/tick.png')}
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
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
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
});
