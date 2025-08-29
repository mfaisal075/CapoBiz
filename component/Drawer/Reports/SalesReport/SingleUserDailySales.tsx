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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';

interface EmployeeInfo {
  sr: number;
  invoice: number;
  customer: string;
  date: string;
  orderTable: number;
  discount: number;
  totalAmount: number;
  paid: number;
  balance: number;
  profit: number;
}

interface InfoObject {
  [key: string]: EmployeeInfo[];

  Chocolate: EmployeeInfo[];
  Oil: EmployeeInfo[];
  Flour: EmployeeInfo[];
  Jelly: EmployeeInfo[];
  'Murree Brwerry': EmployeeInfo[];

  'Chilli Milli': EmployeeInfo[];
  Cup: EmployeeInfo[];
  'Flour E': EmployeeInfo[];
  'Pizza Jelly': EmployeeInfo[];
  'Kunafa Bar': EmployeeInfo[];
}

interface Category {
  id: number;
  pcat_name: string;
}

interface ProductDropdown {
  id: number;
  prod_name: string;
}

interface Users {
  id: number;
  name: string;
}

interface DailyReports {
  id: number;
  sal_date: string;
  sal_order_total: string;
  sal_discount: string;
  sal_invoice_no: string;
  sal_total_amount: string;
  sal_payment_amount: string;
  sal_change_amount: string;
  cust_name: string;
  sal_profit: string;
}

interface DailyDetailedReports {
  id: number;
  sal_invoice_no: string;
  cust_name: string;
  cust_contact: string;
  cust_address: string;
  sal_date: string;
  sal_total_amount: string;
  sal_profit: string;
  sal_payment_amount: string;
}

export default function SingleUserDailySales() {
  const {openDrawer} = useDrawer();
  const [prodOpen, setProdOpen] = useState(false);
  const [prodValue, setProdValue] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [catValue, setCatValue] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const [userValue, setUserValue] = useState('');
  const [dailyReports, setDailyReports] = useState<DailyReports[]>([]);
  const [dailyDetailedReports, setDailyDetailedReports] = useState<
    DailyDetailedReports[]
  >([]);

  const [categoryDropdown, setCategoryDropdown] = useState<Category[]>([]);
  const transformedCategory = categoryDropdown.map(cat => ({
    label: cat.pcat_name,
    value: cat.id.toString(),
  }));
  const [prodDropdown, setProdDropdown] = useState<ProductDropdown[]>([]);
  const transformedProd = prodDropdown.map(prod => ({
    label: prod.prod_name,
    value: prod.id.toString(),
  }));
  const [userDropdown, setUserDropdown] = useState<Users[]>([]);
  const transformedUsers = userDropdown.map(user => ({
    label: user.name,
    value: user.id.toString(),
  }));

  const [selectionMode, setSelectionMode] = useState<
    'salereport' | 'detailedsalereport' | ''
  >('salereport');

  // Fetch Category Dropdown
  const fetchCatDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcombocat`);
      setCategoryDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
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

  // Fetch User Dropdown
  const fetchUserDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchusersdropdown`);
      setUserDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  //Fetch Daily Sale Report
  const fetchDailyReport = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchsingledailysales`, {
        user: userValue,
        category: catValue,
        product: prodValue,
      });
      setDailyReports(res.data.sales);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Daily Detailed Sale Report
  const fetchDailyDetailedReport = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchsingledailysaledetails`, {
        user: userValue,
        category: catValue,
        product: prodValue,
      });
      setDailyDetailedReports(res.data.sales);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Sales
  const calculateDailyTotals = () => {
    let totalSale = 0;
    let totalProfit = 0;
    let totalReceived = 0;

    dailyReports.forEach(sale => {
      const sales = parseFloat(sale.sal_total_amount) || 0;
      const profit = parseFloat(sale.sal_profit) || 0;
      const received = parseFloat(sale.sal_payment_amount) || 0;

      totalSale += sales;
      totalProfit += profit;
      totalReceived += received;
    });

    return {
      totalSale: totalSale.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      totalCreditSale: (totalSale - totalReceived).toFixed(2),
    };
  };

  // Calculate Total Sales
  const calculateDailyDailtedTotals = () => {
    let totalSale = 0;
    let totalProfit = 0;
    let totalReceived = 0;

    dailyDetailedReports.forEach(sale => {
      const sales = parseFloat(sale.sal_total_amount) || 0;
      const profit = parseFloat(sale.sal_profit) || 0;
      const received = parseFloat(sale.sal_payment_amount) || 0;

      totalSale += sales;
      totalProfit += profit;
      totalReceived += received;
    });

    return {
      totalSale: totalSale.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      totalCreditSale: (totalSale - totalReceived).toFixed(2),
    };
  };

  useEffect(() => {
    fetchCatDropdown();
    fetchProdDropdown();
    fetchUserDropdown();
    fetchDailyReport();
    fetchDailyDetailedReport();
  }, [userValue, catValue, prodValue]);

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
              Daily Sales
            </Text>
          </View>
        </View>

        <View style={[styles.row, {width: '100%'}]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <RadioButton
              value="salereport"
              status={selectionMode === 'salereport' ? 'checked' : 'unchecked'}
              color="white"
              uncheckedColor="white"
              onPress={() => {
                setSelectionMode('salereport');
                setCatValue('');
                setProdValue('');
              }}
            />
            <Text
              style={{
                color: 'white',
              }}>
              Daily Report
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
                setProdValue('');
              }}
            />
            <Text
              style={{
                color: 'white',
              }}>
              Detailed Daily Report
            </Text>
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
              style={[
                styles.dropdown,
                selectionMode === 'salereport' && {backgroundColor: 'gray'},
              ]}
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
              style={[
                styles.dropdown,
                selectionMode === 'salereport' && {backgroundColor: 'gray'},
              ]}
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

        <View style={styles.dropDownContainer}>
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
            style={[styles.dropdown]}
            dropDownContainerStyle={{
              backgroundColor: 'white',
              borderColor: '#144272',
              width: '100%',
              marginTop: 8,
              zIndex: 998,
            }}
            labelStyle={{color: 'white'}}
            listItemLabelStyle={{color: '#144272'}}
          />
        </View>

        {selectionMode === 'salereport' && (
          <FlatList
            data={dailyReports}
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
                      }}>
                      <Text style={styles.text}>Paid:</Text>
                      <Text style={styles.text}>{item.sal_payment_amount}</Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Balance:</Text>
                      <Text style={styles.text}>{item.sal_change_amount}</Text>
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
                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>
                  No record found.
                </Text>
              </View>
            }
          />
        )}

        {selectionMode === 'detailedsalereport' && (
          <FlatList
            data={dailyDetailedReports}
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
                      {item.sal_invoice_no}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    {/*  Sale Report */}
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
                      <Text style={styles.text}>Contact:</Text>
                      <Text style={styles.text}>{item.cust_contact}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Address:</Text>
                      <Text style={styles.text}>{item.cust_address}</Text>
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
                      <Text style={styles.text}>Sale:</Text>
                      <Text style={styles.text}>{item.sal_total_amount}</Text>
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

        {selectionMode === 'salereport' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{dailyReports.length}</Text>
            </View>
            {(() => {
              const {totalProfit, totalSale, totalCreditSale, totalReceived} =
                calculateDailyTotals();

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
                    <Text style={styles.totalText}>Total Sale Profit: </Text>
                    <Text style={styles.totalText}>{totalProfit}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Received: </Text>
                    <Text style={styles.totalText}>{totalReceived}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Credit Sale: </Text>
                    <Text style={styles.totalText}>{totalCreditSale}</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        )}
        {selectionMode === 'detailedsalereport' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{dailyReports.length}</Text>
            </View>
            {(() => {
              const {totalProfit, totalSale, totalCreditSale, totalReceived} =
                calculateDailyDailtedTotals();

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
                    <Text style={styles.totalText}>Total Sale Profit: </Text>
                    <Text style={styles.totalText}>{totalProfit}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Received: </Text>
                    <Text style={styles.totalText}>{totalReceived}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Credit Sale: </Text>
                    <Text style={styles.totalText}>{totalCreditSale}</Text>
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
    padding: 3,
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
    marginTop: 15,
  },
  dropDownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginBottom: 15,
  },
});
