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
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Users {
  id: number;
  name: string;
}

interface SaleReturnData {
  prod_name: string;
  salrd_invoice_no: string;
  salrd_return_qty: string;
  salrd_profit: string;
  salrd_price: string;
  salrd_total_price: string;
  created_at: string;
}

interface SaleData {
  id: number;
  sal_date: string;
  sal_order_total: string;
  sal_discount: string;
  sal_invoice_no: string;
  sal_total_amount: string;
  sal_profit: string;
  cust_name: string;
}

export default function SaleSaleReturnReport() {
  const {openDrawer} = useDrawer();
  const [usersDropdown, setUsersDropdown] = useState<Users[]>([]);
  const transformedUsers = usersDropdown.map(user => ({
    label: user.name,
    value: user.id.toString(),
  }));
  const [userOpen, setUserOpen] = useState(false);
  const [userValue, setUserValue] = useState('');
  const [saleReturnData, setSaleReturnData] = useState<SaleReturnData[]>([]);
  const [saleData, setSaleData] = useState<SaleData[]>([]);
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

  // Fetch Users Dropdown
  const fetchUserDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchusersdropdown`);
      setUsersDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSaleData = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];

      const res = await axios.post(`${BASE_URL}/fetchsalesandreturns`, {
        from,
        to,
        user_id: userValue,
      });
      setSaleReturnData(res.data.sales_return);
      setSaleData(res.data.sales);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Sales
  const calculateTotalSales = () => {
    let totalSale = 0;
    let totalSaleProfit = 0;
    let totalReturn = 0;
    let totalReturnProfit = 0;

    saleData.forEach(sale => {
      const sales = parseFloat(sale.sal_total_amount) || 0;
      const profit = parseFloat(sale.sal_profit) || 0;

      totalSale += sales;
      totalSaleProfit += profit;
    });
    saleReturnData.forEach(sale => {
      const returns = parseFloat(sale.salrd_total_price) || 0;
      const profit = parseFloat(sale.salrd_profit) || 0;

      totalReturn += returns;
      totalReturnProfit += profit;
    });

    return {
      totalSale: totalSale.toFixed(2),
      totalSaleProfit: totalSaleProfit.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      totalReturnProfit: totalReturnProfit.toFixed(2),
      netProfit: (totalSaleProfit - totalReturnProfit).toFixed(2),
    };
  };

  useEffect(() => {
    fetchUserDropdown();
    fetchSaleData();
  }, [startDate, endDate, userValue]);

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
              Sale & Sale Return Report
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

        <View style={[styles.dropDownContainer, {marginTop: 10}]}>
          <DropDownPicker
            items={transformedUsers}
            open={userOpen}
            setOpen={setUserOpen}
            value={userValue}
            setValue={setUserValue}
            placeholder="Select User"
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
            style={[styles.dropdown, {zIndex: 999}]}
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

        <ScrollView>
          <Text style={styles.sectionHeader}>Sale Profit</Text>
          <FlatList
            data={saleData}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            renderItem={({item}) => (
              <View style={{padding: 5}}>
                <View style={styles.table}>
                  <View style={styles.tablehead}>
                    <Text style={styles.invoiceText}>
                      {item.sal_invoice_no}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <View style={styles.row}>
                      <Text style={styles.text}>Customer:</Text>
                      <Text style={styles.text}>{item.cust_name}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.text}>Date:</Text>
                      <Text style={styles.text}>
                        {new Date(item.sal_date)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.text}>Order Total:</Text>
                      <Text style={styles.text}>{item.sal_order_total}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.text}>Discount:</Text>
                      <Text style={styles.text}>{item.sal_discount}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.text}>Total Amount:</Text>
                      <Text style={styles.text}>{item.sal_total_amount}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.text}>Profit:</Text>
                      <Text style={styles.text}>{item.sal_profit}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View
                style={{
                  height: 200,
                  width: '100%',
                  marginTop: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>
                  No record found.
                </Text>
              </View>
            }
          />

          <Text style={styles.sectionHeader}>Sale Return</Text>
          <FlatList
            data={saleReturnData}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            renderItem={({item}) => (
              <View style={{padding: 5}}>
                <View style={styles.table}>
                  <View style={styles.tablehead}>
                    <Text style={styles.invoiceText}>
                      {item.salrd_invoice_no}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <View style={styles.row}>
                      <Text style={styles.text}>Product:</Text>
                      <Text style={styles.text}>{item.prod_name}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.text}>Return Date:</Text>
                      <Text style={styles.text}>
                        {new Date(item.created_at)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.text}>Quantity:</Text>
                      <Text style={styles.text}>{item.salrd_return_qty}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.text}>Price:</Text>
                      <Text style={styles.text}>{item.salrd_price}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.text}>Total Price:</Text>
                      <Text style={styles.text}>{item.salrd_total_price}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.text}>Profit:</Text>
                      <Text style={styles.text}>{item.salrd_profit}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        </ScrollView>

        <View style={styles.totalContainer}>
          {(() => {
            const {
              totalReturn,
              totalReturnProfit,
              totalSale,
              totalSaleProfit,
              netProfit,
            } = calculateTotalSales();

            return (
              <>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                    }}>
                    <Text style={styles.totalText}>Total Sale: </Text>
                    <Text style={styles.totalText}>{totalSale}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                    }}>
                    <Text style={styles.totalText}>Total Return: </Text>
                    <Text style={styles.totalText}>{totalReturn}</Text>
                  </View>
                </View>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                    }}>
                    <Text style={styles.totalText}>Total Sale Profit: </Text>
                    <Text style={styles.totalText}>{totalSaleProfit}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'column',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.totalText}>
                        Total Return Profit:{' '}
                      </Text>
                      <Text style={styles.totalText}>{totalReturnProfit}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.totalText}>Total Net Profit: </Text>
                      <Text style={styles.totalText}>{netProfit}</Text>
                    </View>
                  </View>
                </View>
              </>
            );
          })()}
        </View>
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
    paddingHorizontal: 15,
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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  sectionHeader: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  invoiceText: {
    color: '#144272',
    fontWeight: 'bold',
    marginLeft: 5,
    marginTop: 5,
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
