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

interface Supplier {
  id: number;
  sup_name: string;
  sup_company_name: string;
}

interface AllSupplierList {
  sup_name: string;
  supac_total_bill_amount: string;
  supac_paid_amount: string;
  supac_balance: string;
}

interface SingleSupplierList {
  id: number;
  supac_invoice_no: string;
  supac_date: string;
  supac_total_bill_amount: string;
  supac_paid_amount: string;
  supac_balance: string;
}

export default function SupplierAccounts() {
  const {openDrawer} = useDrawer();
  const [open, setOpen] = useState(false);
  const [supValue, setSupValue] = useState('');
  const [supDropdown, setSupDropdown] = useState<Supplier[]>([]);
  const transformedSup = supDropdown.map(sup => ({
    label: `${sup.sup_name} | ${sup.sup_company_name}`,
    value: sup.id.toString(),
  }));
  const [allSupList, setAllSupList] = useState<AllSupplierList[]>([]);
  const [singleSupList, setSingleSupList] = useState<SingleSupplierList[]>([]);
  const [unpaidChqAmount, setUnpaidChqAmount] = useState('');

  const [selectionMode, setSelectionMode] = useState<
    'allsuppliers' | 'singlesupplier' | ''
  >('allsuppliers');

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

  // Fetch Supplier dropdown
  const fetchSupDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchsuppliersdropdown`);
      setSupDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch All Aupplier List
  const fetchAllSupList = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchsuppaccount`, {
        from,
        to,
      });
      setAllSupList(res.data.account);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate All Supplier Totals
  const calculateAllSupTotal = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    allSupList.forEach(sup => {
      const receivable = parseFloat(sup.supac_total_bill_amount) || 0;
      const received = parseFloat(sup.supac_paid_amount) || 0;

      totalReceivables += receivable;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  // Fetch Single Customer List
  const fetchSingleCustList = async () => {
    if (supValue) {
      try {
        const from = startDate.toISOString().split('T')[0];
        const to = endDate.toISOString().split('T')[0];
        const res = await axios.post(`${BASE_URL}/fetchsinglesuppaccount`, {
          supplier_id: supValue,
          from,
          to,
        });
        setSingleSupList(res.data.account);
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

    singleSupList.forEach(sup => {
      const receivable = parseFloat(sup.supac_total_bill_amount) || 0;
      const received = parseFloat(sup.supac_paid_amount) || 0;

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
    fetchSupDropdown();
    fetchAllSupList();
    fetchSingleCustList();
  }, [startDate, endDate, supValue]);

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
              Supplier Accounts
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
          items={transformedSup}
          open={open}
          setOpen={setOpen}
          value={supValue}
          setValue={setSupValue}
          placeholder="Select Suppliers"
          disabled={selectionMode === 'allsuppliers'}
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
            selectionMode === 'allsuppliers' && {backgroundColor: 'gray'},
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
        />

        <View style={[styles.row]}>
          <TouchableOpacity
            style={styles.radioBtnContainer}
            onPress={() => {
              setSelectionMode('allsuppliers');
              setSupValue('');
            }}>
            <RadioButton
              value="allsuppliers"
              status={
                selectionMode === 'allsuppliers' ? 'checked' : 'unchecked'
              }
              color="white"
              uncheckedColor="white"
              onPress={() => {
                setSelectionMode('allsuppliers');
                setSupValue('');
              }}
            />
            <Text style={{color: 'white'}}>All Suppliers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioBtnContainer}
            onPress={() => {
              setSelectionMode('singlesupplier');
              setSupValue('');
            }}>
            <RadioButton
              value="singlesupplier"
              color="white"
              uncheckedColor="white"
              status={
                selectionMode === 'singlesupplier' ? 'checked' : 'unchecked'
              }
              onPress={() => {
                setSelectionMode('singlesupplier');
                setSupValue('');
              }}
            />
            <Text style={{color: 'white'}}>Single Supplier</Text>
          </TouchableOpacity>
        </View>

        {selectionMode === 'allsuppliers' && (
          <FlatList
            data={allSupList}
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
                      {item.sup_name}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Total Bill Amount:</Text>
                      <Text style={styles.text}>
                        {item.supac_total_bill_amount}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Total Paid Amount:</Text>
                      <Text style={styles.text}>{item.supac_paid_amount}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}>
                      <Text style={styles.text}>Balance:</Text>
                      <Text style={styles.text}>{item.supac_balance}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        )}

        {selectionMode === 'singlesupplier' && (
          <FlatList
            data={singleSupList}
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
                      {item.supac_invoice_no}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Total Bill Amount:</Text>
                      <Text style={styles.text}>
                        {item.supac_total_bill_amount}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Total Paid Amount:</Text>
                      <Text style={styles.text}>{item.supac_paid_amount}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}>
                      <Text style={styles.text}>Date:</Text>
                      <Text style={styles.text}>
                        {new Date(item.supac_date)
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
                        marginBottom: 5,
                      }}>
                      <Text style={styles.text}>Balance:</Text>
                      <Text style={styles.text}>{item.supac_balance}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        )}

        {selectionMode === 'allsuppliers' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{allSupList.length}</Text>
            </View>
            {(() => {
              const {netReceivables, totalReceivables, totalReceived} =
                calculateAllSupTotal();

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

        {selectionMode === 'singlesupplier' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{singleSupList.length}</Text>
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
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
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
