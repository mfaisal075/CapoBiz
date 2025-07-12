import {
  Image,
  ImageBackground,
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
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useNavigation} from '@react-navigation/native';

interface Transporter {
  id: number;
  trans_name: string;
  trans_cnic: string;
  trans_address: string;
}

interface AllTransporterData {
  trans_name: string;
  transac_total_bill_amount: string;
  transac_paid_amount: string;
  transac_balance: string;
}

interface SingleAccountDetails {
  id: number;
  transac_trans_id: number;
  transac_invoice_no: string;
  transac_date: string;
  transac_total_bill_amount: string;
  transac_paid_amount: string;
  transac_balance: string;
  transac_payment_type: string;
  transac_payment_method: string;
}

export default function TransporterAccount() {
  const {openDrawer, closeDrawer} = useDrawer();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('Single');
  const [Open, setOpen] = useState(false);
  const [transValue, setTransValue] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [transDropdown, setTransDropdown] = useState<Transporter[]>([]);
  const transformedTrans = transDropdown.map(trans => ({
    label: trans.trans_name,
    value: trans.id.toString(),
  }));
  const [transData, setTransData] = useState<Transporter | null>(null);
  const [allTransData, setAllTransData] = useState<AllTransporterData[]>([]);
  const [singleAccDetails, setSingleAccDetails] = useState<
    SingleAccountDetails[]
  >([]);

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

  // Calculate All Transporter Totals
  const calculateAllTransTotals = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    allTransData.forEach(trans => {
      const receivables = parseFloat(trans.transac_total_bill_amount) || 0;
      const received = parseFloat(trans.transac_paid_amount) || 0;

      totalReceivables += receivables;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  // Calculate Single Transporter Totals
  const calculateSingleTransTotals = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    singleAccDetails.forEach(trans => {
      const receivables = parseFloat(trans.transac_total_bill_amount) || 0;
      const received = parseFloat(trans.transac_paid_amount) || 0;

      totalReceivables += receivables;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  // Fetch Transporter dropdown
  const fetchCustDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchtransportersdropdown`);
      setTransDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Transporter Data
  const getTransData = async () => {
    if (transValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchtransporterdata`, {
          id: transValue,
        });
        setTransData({
          id: res.data.transporter.id,
          trans_address: res.data.transporter.trans_address,
          trans_cnic: res.data.transporter.trans_cnic,
          trans_name: res.data.transporter.trans_name,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  //Fetch All Transporter Data
  const fetchAllTransporterData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/alltransporteraccount`);
      setAllTransData(res.data.supp);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Single Transporter Details
  const fetchTransportDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/singletransporteraccount`, {
        transporter_id: transData,
        from,
        to,
      });
      setSingleAccDetails(res.data.account);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCustDropdown();
    getTransData();
    fetchAllTransporterData();
    fetchTransportDetails();
  }, [transValue]);

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
              Transporter Account
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
              <Text style={styles.toggleBtnText}>Single Transporter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'All' && {backgroundColor: '#D0F4DE'},
              ]}
              onPress={() => setSelectedTab('All')}>
              <Text style={styles.toggleBtnText}>All Transporter</Text>
            </TouchableOpacity>
          </View>

          {/* Other Buttons */}
          <View style={[styles.toggleBtnContainer, {marginVertical: 5}]}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                {borderRadius: 10, backgroundColor: '#144272'},
              ]}
              onPress={() => {
                closeDrawer();
                navigation.navigate('TransporterAddPayment' as never);
              }}>
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
                  Supplier:
                </Text>
                <DropDownPicker
                  items={transformedTrans}
                  open={Open}
                  value={transValue}
                  setValue={setTransValue}
                  setOpen={setOpen}
                  placeholder="Select Supplier"
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
                  Transporter Name:
                </Text>
                <TextInput
                  style={[styles.productinput, {backgroundColor: 'gray'}]}
                  value={transData?.trans_name}
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
                  value={transData?.trans_cnic}
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
                  value={transData?.trans_address}
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
                              {item.transac_invoice_no}
                            </Text>
                          </View>

                          <View style={styles.infoRow}>
                            {[
                              {
                                label: 'Date:',
                                value: new Date(item.transac_date)
                                  .toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                  .replace(/\//g, '_'),
                              },
                              {
                                label: 'Payable:',
                                value: item.transac_total_bill_amount,
                              },
                              {label: 'Paid:', value: item.transac_paid_amount},
                              {label: 'Balance:', value: item.transac_balance},
                              {
                                label: 'Type:',
                                value: item.transac_payment_type,
                              },
                              {
                                label: 'Method:',
                                value: item.transac_payment_method,
                              },
                            ].map(
                              (
                                field: {label: string; value: number | string},
                                idx,
                              ) => (
                                <View
                                  key={`${item.id}-${idx}`}
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
              </View>
            </>
          ) : (
            <>
              <View style={{paddingBottom: 30}}>
                <View style={{marginTop: 20}}>
                  {allTransData.length === 0 ? (
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
                    allTransData.map((item, index) => (
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
                              {item.trans_name}
                            </Text>
                          </View>

                          <View style={styles.infoRow}>
                            {[
                              {
                                label: 'Bill Amount:',
                                value: item.transac_total_bill_amount,
                              },
                              {
                                label: 'Paid amount:',
                                value: item.transac_paid_amount,
                              },
                              {label: 'Balance:', value: item.transac_balance},
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
                    calculateAllTransTotals();

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
                          Total Receivables:
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
                          Total Received:
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
                          Net Receivables:
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
