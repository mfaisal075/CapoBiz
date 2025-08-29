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

interface Transporter {
  id: number;
  trans_name: string;
  trans_contact: string;
}

interface AllTransporterList {
  trans_name: string;
  transac_total_bill_amount: string;
  transac_paid_amount: string;
  transac_balance: string;
}

interface SingleTransporterList {
  id: number;
  transac_invoice_no: string;
  transac_date: string;
  transac_total_bill_amount: string;
  transac_paid_amount: string;
  transac_balance: string;
}

export default function TransporterAccounts() {
  const {openDrawer} = useDrawer();
  const [open, setOpen] = useState(false);
  const [tranValue, setTranValue] = useState('');
  const [transDropdown, setTransDropdown] = useState<Transporter[]>([]);
  const transformedTrans = transDropdown.map(tran => ({
    label: `${tran.trans_name} | ${tran.trans_contact}`,
    value: tran.id.toString(),
  }));
  const [allTransList, setAllTransList] = useState<AllTransporterList[]>([]);
  const [singleTransList, setSingleTransList] = useState<
    SingleTransporterList[]
  >([]);

  const [selectionMode, setSelectionMode] = useState<
    'alltransporters' | 'singletransporter' | ''
  >('alltransporters');

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

  // Fetch Transporter dropdown
  const fetchTransDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchtransportersdropdown`);
      setTransDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch All Transporter List
  const fetchAllTransList = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchtransporteraccount`, {
        from,
        to,
      });
      setAllTransList(res.data.account);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate All Transporter Totals
  const calculateAllTransTotal = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    allTransList.forEach(tran => {
      const receivable = parseFloat(tran.transac_total_bill_amount) || 0;
      const received = parseFloat(tran.transac_paid_amount) || 0;

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
    if (tranValue) {
      try {
        const from = startDate.toISOString().split('T')[0];
        const to = endDate.toISOString().split('T')[0];
        const res = await axios.post(
          `${BASE_URL}/fetchsingletransporteraccount`,
          {
            transporter_id: tranValue,
            from,
            to,
          },
        );
        setSingleTransList(res.data.account);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Calculate Single Transporter Totals
  const calculateSingleTransTotal = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    singleTransList.forEach(trans => {
      const receivable = parseFloat(trans.transac_total_bill_amount) || 0;
      const received = parseFloat(trans.transac_paid_amount) || 0;

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
    fetchAllTransList();
    fetchTransDropdown();
    fetchSingleCustList();
  }, [startDate, endDate, tranValue]);

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
              Transporter Accounts
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
          items={transformedTrans}
          open={open}
          setOpen={setOpen}
          value={tranValue}
          setValue={setTranValue}
          placeholder="Select Transporters"
          disabled={selectionMode === 'alltransporters'}
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
            selectionMode === 'alltransporters' && {backgroundColor: 'gray'},
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
              setSelectionMode('alltransporters');
              setTranValue('');
            }}>
            <RadioButton
              value="alltransporters"
              status={
                selectionMode === 'alltransporters' ? 'checked' : 'unchecked'
              }
              color="white"
              uncheckedColor="white"
              onPress={() => {
                setSelectionMode('alltransporters');
                setTranValue('');
              }}
            />
            <Text style={{color: 'white'}}>All Transporters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioBtnContainer}
            onPress={() => {
              setSelectionMode('singletransporter');
              setTranValue('');
            }}>
            <RadioButton
              value="singletransporter"
              color="white"
              uncheckedColor="white"
              status={
                selectionMode === 'singletransporter' ? 'checked' : 'unchecked'
              }
              onPress={() => {
                setSelectionMode('singletransporter');
                setTranValue('');
              }}
            />
            <Text style={{color: 'white'}}>Single Transporter</Text>
          </TouchableOpacity>
        </View>

        {selectionMode === 'alltransporters' && (
          <FlatList
            data={allTransList}
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
                      {item.trans_name}
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
                        {item.transac_total_bill_amount}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Total Paid Amount:</Text>
                      <Text style={styles.text}>
                        {item.transac_paid_amount}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}>
                      <Text style={styles.text}>Balance:</Text>
                      <Text style={styles.text}>{item.transac_balance}</Text>
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
        )}

        {selectionMode === 'singletransporter' && (
          <FlatList
            data={singleTransList}
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
                      {item.transac_invoice_no}
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
                        {item.transac_total_bill_amount}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Total Paid Amount:</Text>
                      <Text style={styles.text}>
                        {item.transac_paid_amount}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}>
                      <Text style={styles.text}>Date:</Text>
                      <Text style={styles.text}>
                        {new Date(item.transac_date)
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
                      <Text style={styles.text}>{item.transac_balance}</Text>
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
        )}

        {selectionMode === 'alltransporters' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{allTransList.length}</Text>
            </View>
            {(() => {
              const {netReceivables, totalReceivables, totalReceived} =
                calculateAllTransTotal();

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
        {selectionMode === 'singletransporter' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{singleTransList.length}</Text>
            </View>
            {(() => {
              const {netReceivables, totalReceivables, totalReceived} =
                calculateSingleTransTotal();

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
