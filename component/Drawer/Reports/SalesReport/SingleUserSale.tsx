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

interface ProductDropdown {
  id: number;
  prod_name: string;
}

interface Category {
  id: number;
  pcat_name: string;
}

interface Users {
  id: number;
  name: string;
}

interface SalesReport {
  id: number;
  sal_date: string;
  sal_order_total: string;
  sal_discount: string;
  sal_invoice_no: string;
  sal_profit: string;
  cust_name: string;
  sal_total_amount: string;
}

interface SaleSummary {
  sald_prod_id: number;
  sald_prod_name: string;
  total_qty: number;
  total_sale_value: number;
}

export default function SingleUserSale() {
  const {openDrawer} = useDrawer();
  const [prodOpen, setProdOpen] = useState(false);
  const [prodValue, setProdValue] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [catValue, setCatValue] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const [userValue, setUserValue] = useState('');
  const [prodDropdown, setProdDropdown] = useState<ProductDropdown[]>([]);
  const transformedProd = prodDropdown.map(prod => ({
    label: prod.prod_name,
    value: prod.id.toString(),
  }));
  const [categoryDropdown, setCategoryDropdown] = useState<Category[]>([]);
  const transformedCategory = categoryDropdown.map(cat => ({
    label: cat.pcat_name,
    value: cat.id.toString(),
  }));
  const [usersDropdown, setUsersDropdown] = useState<Users[]>([]);
  const transformedUsers = usersDropdown.map(user => ({
    label: user.name,
    value: user.id.toString(),
  }));
  const [salesReport, setSalesReport] = useState<SalesReport[]>([]);
  const [salesDetailedRep, setSalesDetailedRep] = useState<SalesReport[]>([]);

  const [selectionMode, setSelectionMode] = useState<
    'salereport' | 'detailedsalereport' | 'saleSummary' | ''
  >('salereport');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [salesSummary, setSalesSummary] = useState<SaleSummary[]>([]);

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

  // Product Dropdown
  const fetchProdDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchproductsdropdown`);
      setProdDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Category Dropdown
  const fetchCatDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcategories`);
      setCategoryDropdown(res.data.cat);
    } catch (error) {
      console.log(error);
    }
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

  // Fetch Sales Reports
  const fetchSales = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchsinglesales`, {
        from,
        to,
        category: catValue,
        product: prodValue,
        user_id: userValue,
      });
      setSalesReport(res.data.sales);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Sales and Profit
  const calculateTotalSalesProfit = () => {
    let totalSale = 0;
    let totalProfit = 0;

    salesReport.forEach(sale => {
      const sales = parseFloat(sale.sal_total_amount) || 0;
      const profit = parseFloat(sale.sal_profit) || 0;

      totalSale += sales;
      totalProfit += profit;
    });

    return {
      totalSale: totalSale.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
    };
  };

  // Fetch Detailed Sales Reports
  const fetchDetailedSales = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchsinglesaledetails`, {
        from,
        to,
        category: catValue,
        product: prodValue,
        user: userValue,
      });
      setSalesDetailedRep(res.data.sales);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Detailed Sales and Profit
  const calculateDetailedSalesProfit = () => {
    let totalSale = 0;
    let totalProfit = 0;

    salesDetailedRep.forEach(sale => {
      const sales = parseFloat(sale.sal_total_amount) || 0;
      const profit = parseFloat(sale.sal_profit) || 0;

      totalSale += sales;
      totalProfit += profit;
    });

    return {
      totalSale: totalSale.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
    };
  };

  // Fetch Sales Reports
  const fetchSalesSummary = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchsalesummaryreport`, {
        from,
        to,
        category: catValue,
        product: prodValue,
        user_id: userValue,
      });
      setSalesSummary(res.data.salesummary);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Sales
  const calculateTotalSales = () => {
    let totalSale = 0;

    salesSummary.forEach(sale => {
      const sales = sale.total_sale_value || 0;

      totalSale += sales;
    });

    return {
      totalSale: totalSale.toFixed(2),
    };
  };

  useEffect(() => {
    fetchCatDropdown();
    fetchProdDropdown();
    fetchDetailedSales();
    fetchUserDropdown();
    fetchSalesSummary();
    fetchSales();
  }, [startDate, endDate, catValue, prodValue, userValue]);

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
              Single User Sales
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

        <View style={styles.dropDownContainer}>
          <View
            style={{
              width: '46%',
              height: 38,
            }}>
            <DropDownPicker
              items={transformedCategory}
              open={catOpen}
              setOpen={setCatOpen}
              value={catValue}
              setValue={setCatValue}
              placeholder="Select Category"
              disabled={selectionMode === 'salereport'}
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
                zIndex: 1000,
              }}
              labelStyle={{color: 'white'}}
              listItemLabelStyle={{color: '#144272'}}
            />
          </View>

          <View
            style={{
              width: '46%',
              height: 38,
            }}>
            <DropDownPicker
              items={transformedProd}
              open={prodOpen}
              setOpen={setProdOpen}
              value={prodValue}
              setValue={setProdValue}
              placeholder="Select Product"
              disabled={selectionMode === 'salereport'}
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
                zIndex: 1000,
              }}
              labelStyle={{color: 'white'}}
              listItemLabelStyle={{color: '#144272'}}
            />
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

        <View style={[styles.row]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <RadioButton
              value="salereport"
              status={selectionMode === 'salereport' ? 'checked' : 'unchecked'}
              color="white"
              uncheckedColor="white"
              onPress={() => {
                setSelectionMode('salereport');
                setCatValue('');
                setUserValue('');
                setProdValue('');
              }}
            />
            <Text
              style={{
                color: 'white',
              }}>
              Sale Report
            </Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <RadioButton
              value="detailedsalereport"
              color="white"
              uncheckedColor="white"
              status={
                selectionMode === 'detailedsalereport' ? 'checked' : 'unchecked'
              }
              onPress={() => {
                setSelectionMode('detailedsalereport');
                setCatValue('');
                setUserValue('');
                setProdValue('');
              }}
            />
            <Text
              style={{
                color: 'white',
              }}>
              Detailed Report
            </Text>
          </View>
        </View>
        <View style={[styles.row, {marginTop: 2}]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <RadioButton
              value="saleSummary"
              color="white"
              uncheckedColor="white"
              status={selectionMode === 'saleSummary' ? 'checked' : 'unchecked'}
              onPress={() => {
                setSelectionMode('saleSummary');
                setCatValue('');
                setUserValue('');
                setProdValue('');
              }}
            />
            <Text
              style={{
                color: 'white',
              }}>
              Sale Summary
            </Text>
          </View>
        </View>

        {selectionMode === 'salereport' ||
          (selectionMode === 'detailedsalereport' && (
            <FlatList
              data={salesDetailedRep}
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
                        {item.cust_name}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      {/*  Sale Report */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Invoice:</Text>
                        <Text style={styles.text}>{item.sal_invoice_no}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
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
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Order Total:</Text>
                        <Text style={styles.text}>{item.sal_order_total}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Discount:</Text>
                        <Text style={styles.text}>{item.sal_discount}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Total Amount:</Text>
                        <Text style={styles.text}>{item.sal_total_amount}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 5,
                        }}>
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
                  <Text
                    style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>
                    No record found.
                  </Text>
                </View>
              }
            />
          ))}
        {selectionMode === 'saleSummary' && (
          <FlatList
            data={salesSummary}
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
                      {item.sald_prod_name}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    {/*  Sale Report */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Quantity:</Text>
                      <Text style={styles.text}>{item.total_qty}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Sale Value:</Text>
                      <Text style={styles.text}>{item.total_sale_value}</Text>
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
        )}

        {selectionMode === 'detailedsalereport' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{salesDetailedRep.length}</Text>
            </View>
            {(() => {
              const {totalProfit, totalSale} = calculateDetailedSalesProfit();

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
                    <Text style={styles.totalText}>Total Sales: </Text>
                    <Text style={styles.totalText}>{totalSale}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Profit: </Text>
                    <Text style={styles.totalText}>{totalProfit}</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        )}
        {selectionMode === 'saleSummary' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{salesSummary.length}</Text>
            </View>
            {(() => {
              const {totalSale} = calculateTotalSales();

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
                    <Text style={styles.totalText}>Total Sales: </Text>
                    <Text style={styles.totalText}>{totalSale}</Text>
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
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'space-around',
  },
  dropDownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
  },
});
