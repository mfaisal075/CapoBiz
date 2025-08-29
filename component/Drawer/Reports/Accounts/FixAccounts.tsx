import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
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

interface Accounts {
  id: number;
  fixprf_title: string;
}

interface AllAccountsList {
  id: number;
  fixac_invoice_no: string;
  fixac_date: string;
  fixac_payment_type: string;
  fixac_debit: string;
  fixac_credit: string;
  fixac_balance: string;
  fixac_description: string;
}

export default function FixAccounts() {
  const {openDrawer} = useDrawer();
  const [open, setOpen] = useState(false);
  const [accValue, setAccValue] = useState('');
  const [accountsDropdown, setAccountsDropdown] = useState<Accounts[]>([]);
  const transformedAcc = accountsDropdown.map(acc => ({
    label: acc.fixprf_title,
    value: acc.id.toString(),
  }));
  const [allAccountsList, setAllAccountsList] = useState<AllAccountsList[]>([]);
  const [singleAccountList, setSingleAccountList] = useState<AllAccountsList[]>(
    [],
  );

  const [selectionMode, setSelectionMode] = useState<
    'allaccounts' | 'singleaccounts' | ''
  >('allaccounts');

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

  // Fetch Accounts dropdown
  const fetchAccountsDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchfixedaccountdropdown`);
      setAccountsDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch All Accounts List
  const fetchAllAccountsList = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchfixaccount`, {
        from,
        to,
      });
      setAllAccountsList(res.data.account);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate All Accounts Totals
  const calculateAllAccountsTotal = () => {
    let totalCredit = 0;
    let totalDebit = 0;

    allAccountsList.forEach(acc => {
      const credit = parseFloat(acc.fixac_credit) || 0;
      const debit = parseFloat(acc.fixac_debit) || 0;

      totalCredit += credit;
      totalDebit += debit;
    });

    return {
      totalCredit: totalCredit.toFixed(2),
      totalDebit: totalDebit.toFixed(2),
      netBalance: (totalDebit - totalCredit).toFixed(2),
    };
  };

  // Fetch Single Account List
  const fetchSingleAccountList = async () => {
    if (accValue) {
      try {
        const from = startDate.toISOString().split('T')[0];
        const to = endDate.toISOString().split('T')[0];
        const res = await axios.post(`${BASE_URL}/fetchsinglefixaccount`, {
          fix_id: accValue,
          from,
          to,
        });
        setSingleAccountList(res.data.account);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    fetchAccountsDropdown();
    fetchAllAccountsList();
    fetchSingleAccountList();
  }, [startDate, endDate, accValue]);

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
              Fixed Accounts
            </Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 5,
              padding: 5,
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
          items={transformedAcc}
          open={open}
          setOpen={setOpen}
          value={accValue}
          setValue={setAccValue}
          placeholder="Select Account"
          disabled={selectionMode === 'allaccounts'}
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
            selectionMode === 'allaccounts' && {backgroundColor: 'gray'},
          ]}
          dropDownContainerStyle={{
            backgroundColor: 'white',
            borderColor: '#144272',
            width: '90%',
            marginTop: 8,
            alignSelf: 'center',
          }}
          labelStyle={{color: 'white'}}
          listItemLabelStyle={{color: '#144272'}}
        />

        <View style={[styles.row]}>
          <TouchableOpacity
            style={styles.radioBtnContainer}
            onPress={() => {
              setSelectionMode('allaccounts');
              setAccValue('');
            }}>
            <RadioButton
              value="allaccounts"
              status={selectionMode === 'allaccounts' ? 'checked' : 'unchecked'}
              color="white"
              uncheckedColor="white"
              onPress={() => {
                setSelectionMode('allaccounts');
                setAccValue('');
              }}
            />
            <Text style={{color: 'white'}}>All Fixed Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioBtnContainer}
            onPress={() => {
              setSelectionMode('singleaccounts');
              setAccValue('');
            }}>
            <RadioButton
              value="singleaccounts"
              color="white"
              uncheckedColor="white"
              status={
                selectionMode === 'singleaccounts' ? 'checked' : 'unchecked'
              }
              onPress={() => {
                setSelectionMode('singleaccounts');
                setAccValue('');
              }}
            />
            <Text style={{color: 'white'}}>Single Fixed Account</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={
            selectionMode === 'allaccounts'
              ? allAccountsList
              : singleAccountList
          }
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
                    {item.fixac_invoice_no}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Payment Type:</Text>
                    <Text style={styles.text}>{item.fixac_payment_type}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Date:</Text>
                    <Text style={styles.text}>
                      {new Date(item.fixac_date)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .replace(/ /g, '-')}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Credit:</Text>
                    <Text style={styles.text}>{item.fixac_credit}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Debit:</Text>
                    <Text style={styles.text}>{item.fixac_debit}</Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Balance:</Text>
                    <Text style={styles.text}>{item.fixac_balance}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Description:</Text>
                    <Text
                      style={[
                        styles.text,
                        {width: '60%', textAlign: 'center'},
                      ]}>
                      {item.fixac_description}
                    </Text>
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

        {selectionMode === 'allaccounts' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{allAccountsList.length}</Text>
            </View>
            {(() => {
              const {netBalance, totalCredit, totalDebit} =
                calculateAllAccountsTotal();

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
                    <Text style={styles.totalText}>Total Credit :</Text>
                    <Text style={styles.totalText}>{totalCredit}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Debit:</Text>
                    <Text style={styles.totalText}>{totalDebit}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Net Balance:</Text>
                    <Text style={styles.totalText}>{netBalance}</Text>
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
    marginTop: 10,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '90%',
  },
  totalContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
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
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    width: '90%',
    height: 38,
    alignSelf: 'center',
    gap: 33,
    marginTop: 10,
  },
  radioBtnContainer: {
    flexDirection: 'row',
    width: '46%',
    alignItems: 'center',
  },
});
