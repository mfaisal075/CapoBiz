import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {ImageBackground} from 'react-native';
import {Image} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function LabourAccount() {
  const {openDrawer} = useDrawer();
  const [selectedTab, setSelectedTab] = useState('Single');
  const [Open, setOpen] = useState(false);
  const [customerVal, setCustomerVal] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );

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
      label: 'Iqbal',
      value: 'Iqbal',
    },
    {label: 'Bilal', value: 'Bilal'},
    {label: 'Saif', value: 'Saif'},
  ];

  const Info = [
    {
      'Sr#': 1,
      'Invoice#': 'LB-1',
      Date: '09-May-2025',
      Payable: 0.0,
      Paid: 1230.0,
      Balance: -1230.0,
      'Pre Balance': 0.0,
      Total: -1230.0,
      Type: 'Payment Withdraw',
      Method: 'By Cash',
    },
    {
      'Sr#': 2,
      'Invoice#': 'LB-2',
      Date: '10-May-2025',
      Payable: 0.0,
      Paid: 1500.0,
      Balance: -1500.0,
      'Pre Balance': -1230.0,
      Total: -2730.0,
      Type: 'Payment Withdraw',
      Method: 'By Cash',
    },
    {
      'Sr#': 3,
      'Invoice#': 'LB-3',
      Date: '11-May-2025',
      Payable: 0.0,
      Paid: 1000.0,
      Balance: -1000.0,
      'Pre Balance': -2730.0,
      Total: -3730.0,
      Type: 'Payment Withdraw',
      Method: 'By Cash',
    },
    {
      'Sr#': 4,
      'Invoice#': 'LB-4',
      Date: '12-May-2025',
      Payable: 0.0,
      Paid: 800.0,
      Balance: -800.0,
      'Pre Balance': -3730.0,
      Total: -4530.0,
      Type: 'Payment Withdraw',
      Method: 'By Cash',
    },
    {
      'Sr#': 5,
      'Invoice#': 'LB-5',
      Date: '13-May-2025',
      Payable: 0.0,
      Paid: 2000.0,
      Balance: -2000.0,
      'Pre Balance': -4530.0,
      Total: -6530.0,
      Type: 'Payment Withdraw',
      Method: 'By Cash',
    },
  ];

  const allLabourInfo = [
    {
      'Sr#': 1,
      'Labour name': 'Iqbal',
      'Total Bill Amount': 0.0,
      'Paid amount': 1230.0,
      Balance: -1230.0,
    },
    {
      'Sr#': 2,
      'Labour name': 'Ali',
      'Total Bill Amount': 0.0,
      'Paid amount': 1500.0,
      Balance: -1500.0,
    },
    {
      'Sr#': 3,
      'Labour name': 'Ahmed',
      'Total Bill Amount': 0.0,
      'Paid amount': 1000.0,
      Balance: -1000.0,
    },
    {
      'Sr#': 4,
      'Labour name': 'Sara',
      'Total Bill Amount': 0.0,
      'Paid amount': 800.0,
      Balance: -800.0,
    },
    {
      'Sr#': 5,
      'Labour name': 'Zainab',
      'Total Bill Amount': 0.0,
      'Paid amount': 2000.0,
      Balance: -2000.0,
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
              Labour Account
            </Text>
          </View>
        </View>

        <ScrollView style={{flex: 1}}>
          {/* Toggle Buttons */}
          <View style={styles.toggleBtnContainer}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'Single' && {backgroundColor: '#D0F4DE'},
              ]}
              onPress={() => setSelectedTab('Single')}>
              <Text style={styles.toggleBtnText}>Single Labour</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'All' && {backgroundColor: '#D0F4DE'},
              ]}
              onPress={() => setSelectedTab('All')}>
              <Text style={styles.toggleBtnText}>All Labours</Text>
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
          </View>

          {selectedTab === 'Single' ? (
            <>
              {/* Single Customer Data */}
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
                  Labour:
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
                  Labour Name:
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
                  CNIC:
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
                            {item['Invoice#']}
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
                    Total Payables:
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
                    Total Paid:
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
                    Net Payables:
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
                  {allLabourInfo.map((item, index) => (
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
                            {item['Labour name']}
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
                    Total Payables:
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
                    Total Paid:
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
                    Net Payables:
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
