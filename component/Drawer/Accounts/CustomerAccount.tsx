import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {RadioButton} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useNavigation} from '@react-navigation/native';

interface Customers {
  id: number;
  cust_name: string;
  cust_fathername: string;
  cust_address: string;
}

interface CustomersAccounts {
  cust_name: string;
  custac_total_bill_amount: string;
  custac_paid_amount: string;
  custac_balance: string;
}

interface DetailsWithout {
  id: string;
  custac_invoice_no: string;
  custac_date: string;
  custac_total_bill_amount: string;
  custac_paid_amount: string;
  custac_balance: string;
  custac_payment_type: string;
  custac_payment_method: string;
}

interface DetailsWith {
  id: string;
  custac_invoice_no: string;
  custac_date: string;
  custac_total_bill_amount: string;
  custac_paid_amount: string;
  custac_balance: string;
}

export default function CustomerAccount() {
  const {openDrawer, closeDrawer} = useDrawer();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('Single');
  const [Open, setOpen] = useState(false);
  const [customerVal, setCustomerVal] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [custDropdown, setCustDropdown] = useState<Customers[]>([]);
  const transformedCust = custDropdown.map(cust => ({
    label: `${cust.cust_name} s/o ${cust.cust_fathername} | ${cust.cust_address}`,
    value: cust.id.toString(),
  }));
  const [custData, setCustData] = useState<Customers | null>(null);
  const [allCustAccount, setAllCustAccount] = useState<CustomersAccounts[]>([]);
  const [accountDetailsWithout, setAccountDetailsWithout] = useState<
    DetailsWithout[]
  >([]);
  const [accountDetailsWith, setAccountDetailsWith] = useState<DetailsWith[]>(
    [],
  );
  const [chequeCount, setChequeCount] = useState('');
  const [chequeAmount, setChequeAmount] = useState('');

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

  // Fetch Customer dropdown
  const fetchCustDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchdropcustomer`);
      setCustDropdown(res.data.customers);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Customet Data
  const getCustData = async () => {
    if (customerVal) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchcustdata`, {
          id: customerVal,
        });
        setCustData({
          cust_address: res.data.customer.cust_address,
          cust_fathername: res.data.customer.cust_fathername,
          cust_name: res.data.customer.cust_name,
          id: res.data.customer.id,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Fetch All Customer
  const fetchAllCustAccounts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/allcustomeraccount`);
      setAllCustAccount(res.data.cust);
    } catch (error) {
      console.log(error);
    }
  };

  //Calculate Totals
  const calculateTotals = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    allCustAccount.forEach(account => {
      const receivable = parseFloat(account.custac_total_bill_amount) || 0;
      const received = parseFloat(account.custac_paid_amount) || 0;

      totalReceivables += receivable;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  // Fetch Single Customer Without Details
  const fetchCustWithoutDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.post(
        `${BASE_URL}/singlecustomeraccountwithoutdetail`,
        {
          customer_id: customerVal,
          from,
          to,
        },
      );
      setAccountDetailsWithout(res.data.cust);
      setChequeCount(res.data.no_of_chqs);
      setChequeAmount(res.data.chq.chi_amount);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Single Customer With Details
  const fetchCustWithDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/singlecustomeraccount`, {
        customer_id: customerVal,
        from,
        to,
      });
      setAccountDetailsWith(res.data.cust);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate With Details Totals
  const calculateWithoutTotals = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    accountDetailsWith.forEach(invc => {
      const receivables = parseFloat(invc.custac_total_bill_amount) || 0;
      const received = parseFloat(invc.custac_paid_amount) || 0;

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
    getCustData();
    fetchAllCustAccounts();
    fetchCustWithoutDetails();
    fetchCustWithDetails();
  }, [customerVal, fromDate, toDate]);

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
              Customer Account
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
              <Text style={styles.toggleBtnText}>Single Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'All' && {backgroundColor: '#D0F4DE'},
              ]}
              onPress={() => setSelectedTab('All')}>
              <Text style={styles.toggleBtnText}>All Customer</Text>
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
                navigation.navigate('AddCustomerPayment' as never);
              }}>
              <Text style={[styles.toggleBtnText, {color: 'white'}]}>
                Add Payment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                {borderRadius: 10, backgroundColor: '#144272'},
              ]}
              onPress={() => {
                closeDrawer();
                navigation.navigate('ChequeClearance' as never);
              }}>
              <Text style={[styles.toggleBtnText, {color: 'white'}]}>
                Cheque Clearance
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
                  Customer:
                </Text>
                <DropDownPicker
                  items={transformedCust}
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
                  Customer Name:
                </Text>
                <Text style={[styles.productinput, {backgroundColor: 'gray'}]}>
                  {custData?.cust_name}
                </Text>
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
                  Father Name:
                </Text>
                <Text style={[styles.productinput, {backgroundColor: 'gray'}]}>
                  {custData?.cust_fathername}
                </Text>
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
                <Text style={[styles.productinput, {backgroundColor: 'gray'}]}>
                  {custData?.cust_address}
                </Text>
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

              {/* Without Details Invoices Cards */}
              {selectedOption === 'withoutDetails' && (
                <>
                  <View style={{paddingBottom: 30}}>
                    <View style={{marginTop: 20}}>
                      {accountDetailsWithout.length === 0 ? (
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
                        accountDetailsWithout.map((item, index) => (
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
                                  {item.custac_invoice_no}
                                </Text>
                              </View>

                              <View style={styles.infoRow}>
                                {[
                                  {
                                    label: 'Date:',
                                    value: new Date(item.custac_date)
                                      .toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                      .replace(/\//g, '-'),
                                  },
                                  {
                                    label: 'Payable:',
                                    value: item.custac_total_bill_amount,
                                  },
                                  {
                                    label: 'Paid:',
                                    value: item.custac_paid_amount,
                                  },
                                  {
                                    label: 'Balance:',
                                    value: item.custac_balance,
                                  },
                                  {
                                    label: 'Type:',
                                    value: item.custac_payment_type,
                                  },
                                  {
                                    label: 'Method:',
                                    value: item.custac_payment_method,
                                  },
                                ].map(
                                  (
                                    field: {
                                      label: string;
                                      value: number | string;
                                    },
                                    idx,
                                  ) => (
                                    <View
                                      key={`${index}-${idx}`}
                                      style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                      }}>
                                      <Text
                                        style={[
                                          styles.value,
                                          {marginBottom: 5},
                                        ]}>
                                        {field.label}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.value,
                                          {marginBottom: 5},
                                        ]}>
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
                </>
              )}

              {/* With Details Invoices Cards */}
              {selectedOption === 'withDetails' && (
                <>
                  <View style={{paddingBottom: 30}}>
                    <View style={{marginTop: 20}}>
                      {accountDetailsWith.length === 0 ? (
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
                        accountDetailsWith.map((item, index) => (
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
                                  {item.custac_invoice_no}
                                </Text>
                              </View>

                              <View style={styles.infoRow}>
                                {[
                                  {
                                    label: 'Date:',
                                    value: new Date(item.custac_date)
                                      .toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                      .replace(/\//g, '-'),
                                  },
                                  {
                                    label: 'Payable:',
                                    value: item.custac_total_bill_amount,
                                  },
                                  {
                                    label: 'Paid:',
                                    value: item.custac_paid_amount,
                                  },
                                  {
                                    label: 'Balance:',
                                    value: item.custac_balance,
                                  },
                                ].map(
                                  (
                                    field: {
                                      label: string;
                                      value: number | string;
                                    },
                                    idx,
                                  ) => (
                                    <View
                                      key={`${index}-${idx}`}
                                      style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                      }}>
                                      <Text
                                        style={[
                                          styles.value,
                                          {marginBottom: 5},
                                        ]}>
                                        {field.label}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.value,
                                          {marginBottom: 5},
                                        ]}>
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
                </>
              )}

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
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    {chequeCount ?? '0'}
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
                    Unpaid Cheques:
                  </Text>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    {parseFloat(chequeAmount).toFixed(2) ?? '0.00'}
                  </Text>
                </View>
                {(() => {
                  const {netReceivables, totalReceivables, totalReceived} =
                    calculateWithoutTotals();
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
          ) : (
            <>
              <View style={{paddingBottom: 30}}>
                <View style={{marginTop: 20}}>
                  {allCustAccount.map((item, index) => (
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
                            {item.cust_name}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          {[
                            {
                              label: 'Bill Amount:',
                              value: item.custac_total_bill_amount,
                            },
                            {
                              label: 'Paid amount:',
                              value: item.custac_paid_amount,
                            },
                            {label: 'Balance:', value: item.custac_balance},
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
                                <Text style={[styles.value, {marginBottom: 5}]}>
                                  {field.label}
                                </Text>
                                <Text style={[styles.value, {marginBottom: 5}]}>
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
                {(() => {
                  const {totalReceivables, totalReceived, netReceivables} =
                    calculateTotals();
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
    color: '#fff',
    height: 38,
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
