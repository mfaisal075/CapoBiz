import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import {SafeAreaView} from 'react-native';
import {ImageBackground} from 'react-native';
import {Image} from 'react-native';
import {ScrollView} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {RadioButton} from 'react-native-paper';

export default function SupplierAccount() {
  const [selectedTab, setSelectedTab] = useState('Single');
  const {openDrawer} = useDrawer();
  const [Open, setOpen] = useState(false);
  const [customerVal, setCustomerVal] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [selectedOption, setSelectedOption] = useState<
    'withoutDetails' | 'withDetails'
  >('withoutDetails');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(null);
      return;
    }

    if (selectedDate) {
      if (showDatePicker === 'from') {
        setFromDate(selectedDate);
      } else if (showDatePicker === 'to') {
        setToDate(selectedDate);
      }
    }
    setShowDatePicker(null);
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

  const Info = [
    {
      'Sr#': 1,
      'Invoice #': 'PU-3',
      Date: '15-Mar-2025',
      Payable: 50000.0,
      Paid: 0.0,
      Balance: 50000.0,
      'Pre Balance': 0.0,
      Total: 50000.0,
      Type: 'Purchase Invoice',
      Method: 'By Cash',
    },
    {
      'Sr#': 2,
      'Invoice #': 'PU-7',
      Date: '15-Mar-2025',
      Payable: 40000.0,
      Paid: 0.0,
      Balance: 40000.0,
      'Pre Balance': 50000.0,
      Total: 90000.0,
      Type: 'Purchase Invoice',
      Method: 'By Cash',
    },
    {
      'Sr#': 3,
      'Invoice #': 'PR-1',
      Date: '15-Mar-2025',
      Payable: 0.0,
      Paid: 25000.0,
      Balance: -25000.0,
      'Pre Balance': 90000.0,
      Total: 65000.0,
      Type: 'Purchase Return',
      Method: 'By Cash',
    },
    {
      'Sr#': 5,
      'Invoice #': 'PU-23',
      Date: '26-Mar-2025',
      Payable: 300000.0,
      Paid: 0.0,
      Balance: 300000.0,
      'Pre Balance': 64000.0,
      Total: 364000.0,
      Type: 'Purchase Invoice',
      Method: 'By Cash',
    },
    {
      'Sr#': 8,
      'Invoice #': 'PU-27',
      Date: '07-Apr-2025',
      Payable: 1000000.0,
      Paid: 0.0,
      Balance: 1000000.0,
      'Pre Balance': 299000.0,
      Total: 1299000.0,
      Type: 'Purchase Invoice',
      Method: 'By Cash',
    },
  ];

  const allSupplierInfo = [
    {
      'Sr#': 1,
      'Supplier name': 'Hajra Ali',
      'Total Bill Amount': 0.0,
      'Paid amount': 1500.0,
      Balance: -1500.0,
    },
    {
      'Sr#': 2,
      'Supplier name': 'Khalid',
      'Total Bill Amount': 900000.0,
      'Paid amount': 20800.0,
      Balance: 879200.0,
    },
    {
      'Sr#': 3,
      'Supplier name': 'Naeem',
      'Total Bill Amount': 4214000.0,
      'Paid amount': 91000.0,
      Balance: 4123000.0,
    },
    {
      'Sr#': 4,
      'Supplier name': 'zaheer',
      'Total Bill Amount': 83600.0,
      'Paid amount': 0.0,
      Balance: 83600.0,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Header */}
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
              Supplier Account
            </Text>
          </View>
        </View>

        <ScrollView style={{flex: 1}}>
          <View style={styles.toggleBtnContainer}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'Single' && {backgroundColor: '#D0F4DE'},
              ]}
              onPress={() => setSelectedTab('Single')}>
              <Text style={styles.toggleBtnText}>Single Supplier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'All' && {backgroundColor: '#D0F4DE'},
              ]}
              onPress={() => setSelectedTab('All')}>
              <Text style={styles.toggleBtnText}>All Supplier</Text>
            </TouchableOpacity>
          </View>

          {/* Other Buttons */}
          <View style={[styles.toggleBtnContainer, {marginVertical: 5}]}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                {borderRadius: 10, backgroundColor: '#144272'},
              ]}>
              <Text style={[styles.toggleBtnText, {color: 'white'}]}>
                Add Payment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                {borderRadius: 10, backgroundColor: '#144272'},
              ]}>
              <Text style={[styles.toggleBtnText, {color: 'white'}]}>
                Cheque Clearance
              </Text>
            </TouchableOpacity>
          </View>

          {selectedTab === 'Single' ? (
            <>
              <View
                style={{
                  flexDirection: 'column',
                  alignSelf: 'center',
                  marginTop: 10,
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 14,
                    marginLeft: 5,
                  }}>
                  Supplier:
                </Text>
                <DropDownPicker
                  items={item}
                  open={Open}
                  value={customerVal}
                  setValue={setCustomerVal}
                  setOpen={setOpen}
                  placeholder="Select Customer"
                  placeholderStyle={{color: 'white'}}
                  textStyle={{color: 'white'}}
                  style={styles.dropdown}
                  dropDownContainerStyle={{
                    backgroundColor: 'white',
                    borderColor: '#144272',
                    width: 287,
                  }}
                  labelStyle={{color: 'white'}}
                  listItemLabelStyle={{color: '#144272'}}
                  ArrowUpIconComponent={() => (
                    <Text>
                      <Icon name="chevron-up" size={15} color="white" />
                    </Text>
                  )}
                  ArrowDownIconComponent={() => (
                    <Text>
                      <Icon name="chevron-down" size={15} color="white" />
                    </Text>
                  )}
                />
              </View>

              {/* Date Fields Section */}
              <View
                style={{
                  width: '100%',
                  marginTop: 10,
                  paddingHorizontal: '5%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                {/* From Date */}
                <View style={{width: '48%'}}>
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 14,
                      marginLeft: 5,
                      textAlign: 'left',
                    }}>
                    From Date:
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker('from')}
                    style={styles.dateInput}>
                    <Text style={{color: 'white'}}>
                      {fromDate ? fromDate.toLocaleDateString() : ''}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* To Date */}
                <View style={{width: '48%'}}>
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 14,
                      marginLeft: 5,
                      textAlign: 'left',
                    }}>
                    To Date:
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker('to')}
                    style={styles.dateInput}>
                    <Text style={{color: 'white'}}>
                      {toDate ? toDate.toLocaleDateString() : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={
                    showDatePicker === 'from'
                      ? fromDate ?? new Date()
                      : toDate ?? new Date()
                  }
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  themeVariant="dark"
                  style={{backgroundColor: '#144272'}}
                />
              )}

              <View
                style={{
                  width: '100%',
                  marginTop: 10,
                  paddingHorizontal: '5%',
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 14,
                    marginLeft: 5,
                    textAlign: 'left',
                  }}>
                  Supplier Name:
                </Text>
                <TextInput style={styles.productinput} />
              </View>

              <View
                style={{
                  width: '100%',
                  marginTop: 10,
                  paddingHorizontal: '5%',
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 14,
                    marginLeft: 5,
                    textAlign: 'left',
                  }}>
                  Compnay Name:
                </Text>
                <TextInput style={styles.productinput} />
              </View>

              <View
                style={{
                  width: '100%',
                  marginTop: 10,
                  paddingHorizontal: '5%',
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 14,
                    marginLeft: 5,
                    textAlign: 'left',
                  }}>
                  Address:
                </Text>
                <TextInput style={styles.productinput} />
              </View>

              {/* Account Type Radio Buttons */}
              <View
                style={{
                  width: '100%',
                  marginTop: 15,
                  paddingHorizontal: '5%',
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 14,
                    marginLeft: 5,
                    marginBottom: 8,
                  }}>
                  Account:
                </Text>

                <RadioButton.Group
                  onValueChange={value =>
                    setSelectedOption(value as 'withoutDetails' | 'withDetails')
                  }
                  value={selectedOption}>
                  <View style={{flexDirection: 'row'}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginRight: 20,
                      }}>
                      <RadioButton.Android
                        value="withoutDetails"
                        color="#D0F4DE"
                        uncheckedColor="white"
                      />
                      <Text style={{color: 'white', marginLeft: 8}}>
                        Without Details
                      </Text>
                    </View>

                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <RadioButton.Android
                        value="withDetails"
                        color="#D0F4DE"
                        uncheckedColor="white"
                      />
                      <Text style={{color: 'white', marginLeft: 8}}>
                        With Details
                      </Text>
                    </View>
                  </View>
                </RadioButton.Group>
              </View>

              {/* Invoices Cards */}
              <View style={{paddingBottom: 30}}>
                <View style={{marginTop: 20}}>
                  {Info.map((item, index) => (
                    <View key={item['Sr#']} style={{padding: 5}}>
                      <View style={styles.table}>
                        <View style={styles.tablehead}>
                          <Text
                            style={{
                              color: '#144272',
                              fontWeight: 'bold',
                              marginLeft: 5,
                              marginTop: 5,
                            }}>
                            {item['Invoice #']}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          {[
                            {label: 'Date:', value: item.Date},
                            {label: 'Payable:', value: item.Payable},
                            {label: 'Paid:', value: item.Paid},
                            {label: 'Balance:', value: item.Balance},
                            {label: 'Pre Balance:', value: item['Pre Balance']},
                            {label: 'Total:', value: item.Total},
                            {label: 'Type:', value: item.Type},
                            {label: 'Method:', value: item.Method},
                          ].map((field, idx) => (
                            <View
                              key={`${item['Sr#']}-${idx}`}
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                              }}>
                              <Text style={[styles.value, {marginBottom: 5}]}>
                                {field.label}
                              </Text>
                              <Text style={[styles.value, {marginBottom: 5}]}>
                                {typeof field.value === 'number'
                                  ? field.value.toFixed(2)
                                  : field.value}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Last Component */}
              <View
                style={{
                  width: '100%',
                  paddingVertical: 20,
                  paddingHorizontal: 10,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 5,
                    paddingHorizontal: '10%',
                  }}>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    No of Unpaid Cheques:
                  </Text>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>1</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 5,
                    paddingHorizontal: '10%',
                  }}>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    Unpaid Cheques Amount:
                  </Text>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    11111.00
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 5,
                    paddingHorizontal: '10%',
                  }}>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    Total Receivables:
                  </Text>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    47203.00
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 5,
                    paddingHorizontal: '10%',
                  }}>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    Total Received:
                  </Text>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    47203.00
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 5,
                    paddingHorizontal: '10%',
                  }}>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    Net Receivables:
                  </Text>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>0.00</Text>
                </View>

                <View style={styles.btnContainer}>
                  <TouchableOpacity style={styles.btnItem}>
                    <Text style={styles.btnText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={{paddingBottom: 30}}>
                <View style={{marginTop: 20}}>
                  {allSupplierInfo.map((item, index) => (
                    <View key={item['Sr#']} style={{padding: 5}}>
                      <View style={styles.table}>
                        <View style={styles.tablehead}>
                          <Text
                            style={{
                              color: '#144272',
                              fontWeight: 'bold',
                              marginLeft: 5,
                              marginTop: 5,
                            }}>
                            {item['Supplier name']}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          {[
                            {
                              label: 'Bill Amount:',
                              value: item['Total Bill Amount'],
                            },
                            {label: 'Paid amount:', value: item['Paid amount']},
                            {label: 'Balance:', value: item.Balance},
                          ].map((field, idx) => (
                            <View
                              key={`${item['Sr#']}-${idx}`}
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                              }}>
                              <Text style={[styles.value, {marginBottom: 5}]}>
                                {field.label}
                              </Text>
                              <Text style={[styles.value, {marginBottom: 5}]}>
                                {typeof field.value === 'number'
                                  ? field.value.toFixed(2)
                                  : field.value}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Last Component */}
              <View
                style={{
                  width: '100%',
                  paddingVertical: 20,
                  paddingHorizontal: 10,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 5,
                    paddingHorizontal: '10%',
                  }}>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    Total Receivables:
                  </Text>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    333251.00
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 5,
                    paddingHorizontal: '10%',
                  }}>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    Total Received:
                  </Text>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    65173.00
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 5,
                    paddingHorizontal: '10%',
                  }}>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    Net Receivables:
                  </Text>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    268078.00
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
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
  toggleBtnContainer: {
    width: '100%',
    height: 50,
    paddingHorizontal: '5%',
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  toggleBtn: {
    height: '80%',
    width: '40%',
    backgroundColor: '#f8f8f8',
    alignSelf: 'center',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },

  //Single Screen Styles
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '90%',
  },
  productinput: {
    borderWidth: 1,
    width: '100%',
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginTop: 5,
    height: 40,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginTop: 5,
    justifyContent: 'center',
    height: 40, // Match other input heights
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
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 5,
    borderTopLeftRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  value: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },
  btnContainer: {
    width: '100%',
    paddingHorizontal: '10%',
    paddingVertical: 10,
    justifyContent: 'center',
    height: 55,
  },
  btnItem: {
    height: '100%',
    width: '30%',
    backgroundColor: '#144272',
    alignSelf: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
});
