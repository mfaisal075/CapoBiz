import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import {SafeAreaView} from 'react-native';
import {ImageBackground} from 'react-native';
import {Image} from 'react-native';
import {ScrollView} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {RadioButton} from 'react-native-paper';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useNavigation} from '@react-navigation/native';

interface Suppliers {
  id: number;
  sup_name: string;
  sup_company_name: string;
}

interface AllSupplierData {
  sup_name: string;
  supac_total_bill_amount: number;
  supac_paid_amount: number;
  supac_balance: number;
}

interface SingleSupplier {
  id: string;
  sup_name: string;
  sup_company_name: string;
  sup_address: string;
}

interface DetailsWithout {
  id: string;
  supac_invoice_no: string;
  supac_date: string;
  supac_total_bill_amount: string;
  supac_paid_amount: string;
  supac_balance: string;
  supac_payment_type: string;
  supac_payment_method: string;
}

interface DetailsWith {
  id: string;
  supac_invoice_no: string;
  supac_date: string;
  supac_total_bill_amount: string;
  supac_paid_amount: string;
  supac_balance: string;
}

export default function SupplierAccount() {
  const [selectedTab, setSelectedTab] = useState('Single');
  const {openDrawer, closeDrawer} = useDrawer();
  const navigation = useNavigation();
  const [Open, setOpen] = useState(false);
  const [suppValue, setSuppValue] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [selectedOption, setSelectedOption] = useState<
    'withoutDetails' | 'withDetails'
  >('withoutDetails');
  const [allSuppData, setAllSuppData] = useState<AllSupplierData[]>([]);
  const [suppDropdown, setSuppDropdown] = useState<Suppliers[]>([]);
  const transformedSupp = suppDropdown.map(sup => ({
    label: `${sup.sup_name}_${sup.sup_company_name}`,
    value: sup.id.toString(),
  }));
  const [suppData, setSuppData] = useState<SingleSupplier | null>(null);
  const [accountDetailsWithout, setAccountDetailsWithout] = useState<
    DetailsWithout[]
  >([]);
  const [chequeCount, setChequeCount] = useState<number | null>(null);
  const [chequeAmount, setChequeAmount] = useState<number | null>(null);
  const [accountDetailsWith, setAccountDetailsWith] = useState<DetailsWith[]>(
    [],
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

  // Calculate All Supplier Totals
  const calculateTotals = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    allSuppData.forEach(sup => {
      const receivable = sup.supac_total_bill_amount || 0;
      const received = sup.supac_paid_amount || 0;

      totalReceivables += receivable;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  //Fetch All Supplier Data
  const fetchAllSupplierData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/allsupplieraccount`);
      setAllSuppData(res.data.supp);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Supplier dropdown
  const fetchCustDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadsuppliers`);
      setSuppDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Supplier Data
  const getSuppData = async () => {
    if (suppValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchsuppdata`, {
          id: suppValue,
        });
        setSuppData({
          sup_address: res.data.supplier.sup_address,
          sup_company_name: res.data.supplier.sup_company_name,
          sup_name: res.data.supplier.sup_name,
          id: res.data.supplier.id,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Fetch Single Supplier Without Details
  const fetchCustWithoutDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.post(
        `${BASE_URL}/singlesupplieraccountwithoutdetail`,
        {
          supplier_id: suppValue,
          from,
          to,
        },
      );
      setAccountDetailsWithout(res.data.cust);
      setChequeCount(res.data.no_of_chqs);
      setChequeAmount(res.data.chq[0]?.chi_amount || 0);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Withou Details Totals
  const calculateWithoutTotals = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    accountDetailsWithout.forEach(invc => {
      const receivables = parseFloat(invc.supac_total_bill_amount) || 0;
      const received = parseFloat(invc.supac_paid_amount) || 0;

      totalReceivables += receivables;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  // Fetch Single Customer With Details
  const fetchCustWithDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/singlesupplieraccount`, {
        supplier_id: suppValue,
        from,
        to,
      });
      setAccountDetailsWith(res.data.account);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllSupplierData();
    fetchCustWithoutDetails();
    getSuppData();
    fetchCustDropdown();
    fetchCustWithDetails();
  }, [suppValue]);

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
              ]}
              onPress={() => {
                closeDrawer();
                navigation.navigate('SupplierAddPayment' as never);
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
                navigation.navigate('SupplierChequeClearance' as never);
                closeDrawer();
              }}>
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
                  items={transformedSupp}
                  open={Open}
                  value={suppValue}
                  setValue={setSuppValue}
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
                  Supplier Name:
                </Text>
                <TextInput
                  style={[styles.productinput, {backgroundColor: 'gray'}]}
                  value={suppData?.sup_name}
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
                  Compnay Name:
                </Text>
                <TextInput
                  style={[styles.productinput, {backgroundColor: 'gray'}]}
                  value={suppData?.sup_company_name}
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
                  value={suppData?.sup_address}
                  editable={false}
                />
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

              {/* Without Details Invoices Cards */}
              {selectedOption === 'withoutDetails' && (
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
                                {item.supac_invoice_no}
                              </Text>
                            </View>

                            <View style={styles.infoRow}>
                              {[
                                {
                                  label: 'Date:',
                                  value: new Date(item.supac_date)
                                    .toLocaleDateString('en-DB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                    .replace(/\//g, '-'),
                                },
                                {
                                  label: 'Payable:',
                                  value: item.supac_total_bill_amount,
                                },
                                {label: 'Paid:', value: item.supac_paid_amount},
                                {label: 'Balance:', value: item.supac_balance},
                                {
                                  label: 'Type:',
                                  value: item.supac_payment_type,
                                },
                                {
                                  label: 'Method:',
                                  value: item.supac_payment_method,
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
              )}

              {/* Without Details Invoices Cards */}
              {selectedOption === 'withDetails' && (
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
                                {item.supac_invoice_no}
                              </Text>
                            </View>

                            <View style={styles.infoRow}>
                              {[
                                {
                                  label: 'Date:',
                                  value: new Date(item.supac_date)
                                    .toLocaleDateString('en-DB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                    .replace(/\//g, '-'),
                                },
                                {
                                  label: 'Payable:',
                                  value: item.supac_total_bill_amount,
                                },
                                {label: 'Paid:', value: item.supac_paid_amount},
                                {label: 'Balance:', value: item.supac_balance},
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
                    {chequeCount}
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
                    Unpaid Cheques Amount:
                  </Text>
                  <Text style={[styles.text, {fontWeight: 'bold'}]}>
                    {chequeAmount?.toFixed(2)}
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
              {allSuppData.length === 0 ? (
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
                <View style={{paddingBottom: 30}}>
                  <View style={{marginTop: 20}}>
                    {allSuppData.map((item, index) => (
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
                              {item.sup_name}
                            </Text>
                          </View>

                          <View style={styles.infoRow}>
                            {[
                              {
                                label: 'Bill Amount:',
                                value: item.supac_total_bill_amount,
                              },
                              {
                                label: 'Paid amount:',
                                value: item.supac_paid_amount,
                              },
                              {label: 'Balance:', value: item.supac_balance},
                            ].map((field, idx) => (
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
                            ))}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

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
    color: '#fff',
    borderRadius: 6,
    padding: 8,
    marginTop: 5,
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
