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
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';

interface CustomerChequeList {
  id: number;
  cust_name: string;
  chi_number: string;
  chi_amount: string;
  chi_date: string;
  chi_clear_date: string;
}

export default function CustomerAccounts() {
  const {openDrawer} = useDrawer();
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState('');
  const [custChequeList, setCustChequeList] = useState<CustomerChequeList[]>(
    [],
  );

  const [currentCategory, setCurrentCategory] = useState<string>('Due');

  const statusItems = [
    {label: 'Due', value: 'Due'},
    {label: 'Cleared', value: 'Cleared'},
  ];

  const [selectionMode, setSelectionMode] = useState<
    'customers' | 'suppliers' | ''
  >('customers');

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

  // Customers Cheque List
  const fetchCustomerChequeList = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchcheques`, {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
        status: statusValue,
      });
      setCustChequeList(res.data.cheques);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Customers Total
  const calculateCustChequeTotal = () => {
    let totalAmount = 0;

    custChequeList.forEach(cust => {
      const amount = parseFloat(cust.chi_amount) || 0;

      totalAmount += amount;
    });

    return {
      totalSale: totalAmount.toFixed(2),
    };
  };

  useEffect(() => {
    fetchCustomerChequeList();
  }, [startDate, endDate, statusValue]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
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
              source={require('../../../assets/menu.png')}
              style={{width: 30, height: 30, tintColor: 'white'}}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={{color: 'white', fontSize: 22, fontWeight: 'bold'}}>
              Cheque List
            </Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 5,
              padding: 5,
              height: 38,
              width: '46%',
            }}>
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
                source={require('../../../assets/calendar.png')}
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
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 5,
              padding: 5,
              height: 38,
              width: '46%',
            }}>
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
                source={require('../../../assets/calendar.png')}
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

        <View style={styles.dropDownContainer}>
          <DropDownPicker
            items={statusItems}
            open={statusOpen}
            setOpen={setStatusOpen}
            value={statusValue}
            setValue={setStatusValue}
            placeholder="Select Status"
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
            style={[styles.dropdown]}
            dropDownContainerStyle={{
              backgroundColor: 'white',
              borderColor: '#144272',
              width: '100%',
              marginTop: 8,
            }}
            labelStyle={{color: 'white'}}
            listItemLabelStyle={{color: '#144272'}}
          />
        </View>

        <View style={[styles.row]}>
          <TouchableOpacity
            style={{flexDirection: 'row', width: '40%'}}
            onPress={() => {
              setSelectionMode('customers');
              setCurrentCategory('');
            }}>
            <RadioButton
              value="customer"
              status={selectionMode === 'customers' ? 'checked' : 'unchecked'}
              color="white"
              uncheckedColor="white"
              onPress={() => {
                setSelectionMode('customers');
                setCurrentCategory('');
              }}
            />
            <Text style={{color: 'white', marginTop: 7, marginLeft: 5}}>
              Customers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', width: '40%'}}
            onPress={() => {
              setSelectionMode('suppliers');
              setCurrentCategory('');
            }}>
            <RadioButton
              value="supplier"
              color="white"
              uncheckedColor="white"
              status={selectionMode === 'suppliers' ? 'checked' : 'unchecked'}
              onPress={() => {
                setSelectionMode('suppliers');
                setCurrentCategory('');
              }}
            />
            <Text style={{color: 'white', marginTop: 7, marginLeft: 5}}>
              Suppliers
            </Text>
          </TouchableOpacity>
        </View>

        {selectionMode === 'customers' && (
          <FlatList
            data={custChequeList}
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
                      {item.chi_number}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.RowTable}>
                      <Text style={styles.text}>Customer:</Text>
                      <Text style={styles.text}>{item.cust_name}</Text>
                    </View>

                    <View style={styles.RowTable}>
                      <Text style={styles.text}>Due Date:</Text>
                      <Text style={styles.text}>
                        {new Date(item.chi_date)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')}
                      </Text>
                    </View>

                    <View style={styles.RowTable}>
                      <Text style={styles.text}>Clearance Date:</Text>
                      <Text style={styles.text}>
                        {new Date(item.chi_clear_date)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')}
                      </Text>
                    </View>

                    <View style={[styles.RowTable, {marginBottom: 5}]}>
                      <Text style={styles.text}>Amount:</Text>
                      <Text style={styles.text}>{item.chi_amount}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        )}

        {selectionMode === 'suppliers' && !currentCategory && (
          <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
            Please select a category to view items.
          </Text>
        )}

        {selectionMode === 'customers' && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total Records:{custChequeList.length}
            </Text>
            {(() => {
              const {totalSale} = calculateCustChequeTotal();
              return (
                <Text style={styles.totalText}>
                  Total Cheque Amount:{totalSale}
                </Text>
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
    width: '100%',
  },
  totalContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
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
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-around',
  },
  RowTable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
  },
  dropDownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
  },
});
