import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';

type Product = {
  sr: number;
  Product: string;
  Barcode: number;
  Category: string;
  UOM: string;
  SubUom: string;
  Quantity: number;
  ReorderedQTY: number;
  CostPrice: number;
  SalePrice: number;
};

type InfoType = {
  [key: string]: Product[];
};

interface AllCustomerList {
  custac_invoice_no: string;
  custac_payment_method: string;
  created_at: string;
  cust_name: string;
  custac_total_bill_amount: string;
  custac_paid_amount: string;
  custac_balance: string;
}

interface Customers {
  id: number;
  cust_name: string;
  cust_fathername: string;
  cust_address: string;
}

export default function CustomerAccounts() {
  const {openDrawer} = useDrawer();
  const [open, setOpen] = useState(false);
  const [custValue, setCustValue] = useState('');
  const [allCustList, setAllCustList] = useState<AllCustomerList[]>([]);
  const [singleCustList, setSingleCustList] = useState<AllCustomerList[]>([]);
  const [custDropdown, setCustDropdown] = useState<Customers[]>([]);
  const transformedCust = custDropdown.map(cust => ({
    label: `${cust.cust_name} s/o ${cust.cust_fathername} | ${cust.cust_address}`,
    value: cust.id.toString(),
  }));
  const [unpaidChqAmount, setUnpaidChqAmount] = useState('');
  const [selectionMode, setSelectionMode] = useState<
    'allcustomers' | 'singlecustomers' | ''
  >('allcustomers');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  // Fetch All Customer List
  const fetchAllCustList = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchcustaccount`, {
        from,
        to,
      });
      setAllCustList(res.data.account);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate All Customer Totals
  const calculateAllCustTotal = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    allCustList.forEach(cust => {
      const receivable = parseFloat(cust.custac_total_bill_amount) || 0;
      const received = parseFloat(cust.custac_paid_amount) || 0;

      totalReceivables += receivable;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
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

  // Fetch Single Customer List
  const fetchSingleCustList = async () => {
    if (custValue) {
      try {
        const from = startDate.toISOString().split('T')[0];
        const to = endDate.toISOString().split('T')[0];
        const res = await axios.post(`${BASE_URL}/fetchsinglecustaccount`, {
          customer: custValue,
          from,
          to,
        });
        setSingleCustList(res.data.account);
        setUnpaidChqAmount(res.data.chq[0]?.chi_amount);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Calculate Single Customer Totals
  const calculateSingleCustTotal = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    singleCustList.forEach(cust => {
      const receivable = parseFloat(cust.custac_total_bill_amount) || 0;
      const received = parseFloat(cust.custac_paid_amount) || 0;

      totalReceivables += receivable;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  useEffect(() => {
    fetchAllCustList();
    fetchSingleCustList();
    fetchCustDropdown();
  }, [startDate, endDate, custValue]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../../../assets/menu.png')}
              style={{width: 30, height: 30, tintColor: 'white'}}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={{color: 'white', fontSize: 22, fontWeight: 'bold'}}>
              Customer Accounts
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            width: '90%',
            alignSelf: 'center',
            gap: 33,
            marginTop: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 5,
              padding: 5,
              height: 38,
            }}>
            <Text style={{color: 'white'}}>From:</Text>
            <Text style={{marginLeft: 10, color: 'white'}}>
              {`${startDate.toLocaleDateString()}`}
            </Text>
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
              <Image
                style={{
                  height: 20,
                  width: 20,
                  marginLeft: 10,
                  tintColor: 'white',
                }}
                source={require('../../../../assets/calendar.png')}
              />
            </TouchableOpacity>
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
          </View>

          {/* To Date */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 5,
              padding: 5,
            }}>
            <Text style={{color: 'white'}}>To:</Text>
            <Text style={{marginLeft: 10, color: 'white'}}>
              {`${endDate.toLocaleDateString()}`}
            </Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
              <Image
                style={{
                  height: 20,
                  width: 20,
                  marginLeft: 10,
                  tintColor: 'white',
                }}
                source={require('../../../../assets/calendar.png')}
              />
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                testID="endDatePicker"
                value={endDate}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onEndDateChange}
              />
            )}
          </View>
        </View>

        <DropDownPicker
          items={transformedCust}
          open={open}
          setOpen={setOpen}
          value={custValue}
          setValue={setCustValue}
          placeholder="Select Customers"
          disabled={selectionMode === 'allcustomers'}
          placeholderStyle={{color: 'white'}}
          textStyle={{color: 'white'}}
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
          style={[
            styles.dropdown,
            selectionMode === 'allcustomers' && {backgroundColor: 'gray'},
          ]}
          dropDownContainerStyle={{
            backgroundColor: 'white',
            borderColor: '#144272',
            width: '90%',
            marginTop: 8,
            alignSelf: 'center',
          }}
          labelStyle={{color: 'white', fontWeight: 'bold'}}
          listItemLabelStyle={{color: '#144272'}}
          listMode="SCROLLVIEW"
        />

        <View style={[styles.row, {marginTop: -6, marginLeft: 20}]}>
          <RadioButton
            value="allcustomers"
            status={selectionMode === 'allcustomers' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => {
              setSelectionMode('allcustomers');
              setCustValue('');
            }}
          />
          <Text style={{color: 'white', marginTop: 7, marginLeft: -5}}>
            All Customers
          </Text>
          <RadioButton
            value="singlecustomers"
            color="white"
            uncheckedColor="white"
            status={
              selectionMode === 'singlecustomers' ? 'checked' : 'unchecked'
            }
            onPress={() => {
              setSelectionMode('singlecustomers');
            }}
          />
          <Text style={{color: 'white', marginTop: 7, marginLeft: -5}}>
            Single Customer
          </Text>
        </View>

        <FlatList
          data={selectionMode === 'allcustomers' ? allCustList : singleCustList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <View style={{padding: 5}}>
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
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Customer:</Text>
                    <Text style={styles.text}>{item.cust_name}</Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Total Amount:</Text>
                    <Text style={styles.text}>
                      {item.custac_total_bill_amount}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Paid Amount:</Text>
                    <Text style={styles.text}>{item.custac_paid_amount}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Date:</Text>
                    <Text style={styles.text}>
                      {new Date(item.created_at)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .replace(/\//g, '-')}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Balance:</Text>
                    <Text style={styles.text}>{item.custac_balance}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
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
          }
        />

        {selectionMode === 'allcustomers' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{allCustList.length}</Text>
            </View>
            {(() => {
              const {netReceivables, totalReceivables, totalReceived} =
                calculateAllCustTotal();

              return (
                <View
                  style={{
                    flexDirection: 'column',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Receivables:</Text>
                    <Text style={styles.totalText}>{totalReceivables}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Received:</Text>
                    <Text style={styles.totalText}>{totalReceived}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Net Receivables:</Text>
                    <Text style={styles.totalText}>{netReceivables}</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        )}

        {selectionMode === 'singlecustomers' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{singleCustList.length}</Text>
            </View>
            {(() => {
              const {netReceivables, totalReceivables, totalReceived} =
                calculateSingleCustTotal();

              return (
                <View
                  style={{
                    flexDirection: 'column',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Unpaid Cheques Amount:</Text>
                    <Text style={styles.totalText}>
                      {unpaidChqAmount ?? '0'}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Receivables:</Text>
                    <Text style={styles.totalText}>{totalReceivables}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Received:</Text>
                    <Text style={styles.totalText}>{totalReceived}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Net Receivables:</Text>
                    <Text style={styles.totalText}>{netReceivables}</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        )}
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
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  exportBtn: {
    backgroundColor: '#144272',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  exportText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 38,
    alignSelf: 'center',
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '90%',
  },
  totalContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'white',
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
