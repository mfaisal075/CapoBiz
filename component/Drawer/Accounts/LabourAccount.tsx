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
import React, {useEffect, useState} from 'react';
import {ImageBackground} from 'react-native';
import {Image} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';

interface Labour {
  id: string;
  labr_name: string;
  labr_cnic: string;
  labr_address: string;
}

interface SingleAccountDetails {
  id: number;
  labrac_invoice_no: string;
  labrac_total_bill_amount: string;
  labrac_paid_amount: string;
  labrac_balance: string;
  labrac_payment_type: string;
  labrac_payment_method: string;
  labrac_date: string;
}

interface AllLabour {
  labr_name: string;
  labrac_total_bill_amount: string;
  labrac_paid_amount: string;
  labrac_balance: string;
}

export default function LabourAccount() {
  const {openDrawer} = useDrawer();
  const [selectedTab, setSelectedTab] = useState('Single');
  const [Open, setOpen] = useState(false);
  const [labourVal, setLabourVal] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [labourDropdown, setLabourDropdown] = useState<Labour[]>([]);
  const transformedLab = labourDropdown.map(lab => ({
    label: lab.labr_name,
    value: lab.id.toString(),
  }));
  const [labourData, setLabourData] = useState<Labour | null>(null);
  const [singleAccDetails, setSingleAccDetails] = useState<
    SingleAccountDetails[]
  >([]);
  const [allLabourData, setAllLabourData] = useState<AllLabour[]>([]);

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

  // Fetch Labour dropdown
  const fetchCustDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchlaboursdropdown`);
      setLabourDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Labour Data
  const getLabourData = async () => {
    if (labourVal) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchlabourdata`, {
          id: labourVal,
        });
        setLabourData({
          id: res.data.labour.id,
          labr_address: res.data.labour.labr_address,
          labr_cnic: res.data.labour.labr_cnic,
          labr_name: res.data.labour.labr_name,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Fetch Single Labour Details
  const fetchTransportDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/singlelabouraccount`, {
        labour_id: labourVal,
        from,
        to,
      });
      setSingleAccDetails(res.data.account);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Single Labour Totals
  const calculateSingleTransTotals = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    singleAccDetails.forEach(trans => {
      const receivables = parseFloat(trans.labrac_total_bill_amount) || 0;
      const received = parseFloat(trans.labrac_paid_amount) || 0;

      totalReceivables += receivables;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  //Fetch All Labour Data
  const fetchAllLabourData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/alllabouraccount`);
      setAllLabourData(res.data.supp);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate All Labour Totals
  const calculateAllLabourTotals = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    allLabourData.forEach(lab => {
      const receivables = parseFloat(lab.labrac_total_bill_amount) || 0;
      const received = parseFloat(lab.labrac_paid_amount) || 0;

      totalReceivables += receivables;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  useEffect(() => {
    fetchCustDropdown();
    getLabourData();
    fetchTransportDetails();
    fetchAllLabourData();
  }, [labourVal]);

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
                  items={transformedLab}
                  open={Open}
                  value={labourVal}
                  setValue={setLabourVal}
                  setOpen={setOpen}
                  placeholder="Select Labour"
                  placeholderStyle={{color: 'white'}}
                  textStyle={{color: 'white'}}
                  style={styles.dropdown}
                  dropDownContainerStyle={{
                    backgroundColor: 'white',
                    borderColor: '#144272',
                    width: '90%',
                    marginTop: 8,
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
                  listMode="SCROLLVIEW"
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
                <TextInput
                  style={[styles.productinput, {backgroundColor: 'gray'}]}
                  value={labourData?.labr_name}
                  editable={false}
                />
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
                <TextInput
                  style={[styles.productinput, {backgroundColor: 'gray'}]}
                  value={labourData?.labr_cnic}
                  editable={false}
                />
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
                <TextInput
                  style={[styles.productinput, {backgroundColor: 'gray'}]}
                  value={labourData?.labr_address}
                  editable={false}
                />
              </View>

              {/* Invoices Cards */}
              <View style={{paddingBottom: 30}}>
                <View style={{marginTop: 20}}>
                  {singleAccDetails.length === 0 ? (
                    <View style={{alignItems: 'center', marginTop: 20}}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}>
                        No record found.
                      </Text>
                    </View>
                  ) : (
                    singleAccDetails.map((item, index) => (
                      <View key={item.id} style={{padding: 5}}>
                        <View style={styles.table}>
                          <View style={styles.tablehead}>
                            <Text
                              style={{
                                color: '#144272',
                                fontWeight: 'bold',
                                marginLeft: 5,
                                marginTop: 5,
                              }}>
                              {item.labrac_invoice_no}
                            </Text>
                          </View>

                          <View style={styles.infoRow}>
                            {[
                              {
                                label: 'Date:',
                                value: new Date(item.labrac_date)
                                  .toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                  .replace(/\//g, '-'),
                              },
                              {
                                label: 'Payable:',
                                value: item.labrac_total_bill_amount,
                              },
                              {label: 'Paid:', value: item.labrac_paid_amount},
                              {label: 'Balance:', value: item.labrac_balance},
                              {label: 'Type:', value: item.labrac_payment_type},
                              {
                                label: 'Method:',
                                value: item.labrac_payment_method,
                              },
                            ].map(
                              (
                                field: {label: string; value: number | string},
                                idx,
                              ) => (
                                <View
                                  key={`${index}-${idx}`}
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                  }}>
                                  <Text
                                    style={[styles.value, {marginBottom: 5}]}>
                                    {field.label}
                                  </Text>
                                  <Text
                                    style={[styles.value, {marginBottom: 5}]}>
                                    {typeof field.value === 'number'
                                      ? field.value.toFixed(2)
                                      : field.value}
                                  </Text>
                                </View>
                              ),
                            )}
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>

              {/* Last Component */}
              <View
                style={{
                  width: '100%',
                  paddingVertical: 20,
                  paddingHorizontal: 10,
                }}>
                {(() => {
                  const {netReceivables, totalReceivables, totalReceived} =
                    calculateSingleTransTotals();

                  return (
                    <>
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
                          {totalReceivables}
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
                          {totalReceived}
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
                          {netReceivables}
                        </Text>
                      </View>
                    </>
                  );
                })()}

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
                  {allLabourData.length === 0 ? (
                    <View style={{alignItems: 'center', marginTop: 20}}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}>
                        No record found.
                      </Text>
                    </View>
                  ) : (
                    allLabourData.map((item, index) => (
                      <View key={index} style={{padding: 5}}>
                        <View style={styles.table}>
                          <View style={styles.tablehead}>
                            <Text
                              style={{
                                color: '#144272',
                                fontWeight: 'bold',
                                marginLeft: 5,
                                marginTop: 5,
                              }}>
                              {item.labr_name}
                            </Text>
                          </View>

                          <View style={styles.infoRow}>
                            {[
                              {
                                label: 'Bill Amount:',
                                value: item.labrac_total_bill_amount,
                              },
                              {
                                label: 'Paid amount:',
                                value: item.labrac_paid_amount,
                              },
                              {label: 'Balance:', value: item.labrac_balance},
                            ].map(
                              (
                                field: {label: string; value: number | string},
                                idx,
                              ) => (
                                <View
                                  key={`${index}-${idx}`}
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                  }}>
                                  <Text
                                    style={[styles.value, {marginBottom: 5}]}>
                                    {field.label}
                                  </Text>
                                  <Text
                                    style={[styles.value, {marginBottom: 5}]}>
                                    {typeof field.value === 'number'
                                      ? field.value.toFixed(2)
                                      : field.value}
                                  </Text>
                                </View>
                              ),
                            )}
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>

              {/* Last Component */}
              <View
                style={{
                  width: '100%',
                  paddingVertical: 20,
                  paddingHorizontal: 10,
                }}>
                {(() => {
                  const {netReceivables, totalReceivables, totalReceived} =
                    calculateAllLabourTotals();

                  return (
                    <>
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
                          {totalReceivables}
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
                          {totalReceived}
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
                          {netReceivables}
                        </Text>
                      </View>
                    </>
                  );
                })()}
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
    minHeight: 38,
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
    height: 38,
    color: '#fff',
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
