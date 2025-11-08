import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RadioButton} from 'react-native-paper';
import RNPrint from 'react-native-print';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import backgroundColors from '../../Colors';

type TabType = 'receivables' | 'payables' | 'balances';

interface Customer {
  id: number;
  cust_name: string;
  cust_fathername: string;
}

interface Areas {
  id: number;
  area_name: string;
}

interface AllCustomersReceivable {
  cust_name: string;
  cust_address: string;
  cust_contact: string;
  cust_sec_contact: string;
  cust_third_contact: string;
  custac_balance: number;
  Balance: number;
}

interface SingleCustomersReceivable {
  cust_name: string;
  custac_total_bill_amount: number;
  custac_paid_amount: number;
  custac_balance: number;
}

export default function CustomerBalances({navigation}: any) {
  const [selectedTab, setSelectedTab] = useState<TabType>('receivables');
  const [custOpen, setCustOpen] = useState(false);
  const [custValue, setCustValue] = useState('');
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaValue, setAreaValue] = useState('');
  const [custDropdown, setCustDropdown] = useState<Customer[]>([]);
  const transformedCustomer = custDropdown.map(cust => ({
    label: `${cust.cust_name} | ${cust.cust_fathername}`,
    value: cust.id.toString(),
  }));
  const [areaDropdown, setAreaDropdown] = useState<Areas[]>([]);
  const transformedAreas = areaDropdown.map(area => ({
    label: area.area_name,
    value: area.id.toString(),
  }));
  const [custReceivable, setCustReceivable] = useState<
    AllCustomersReceivable[]
  >([]);
  const [singleCustReceivable, setSingleCustReceivable] = useState<
    SingleCustomersReceivable[]
  >([]);
  const [selectionMode, setSelectionMode] = useState<
    'allCustomers' | 'singleCustomer' | ''
  >('allCustomers');

  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData =
    selectionMode === 'allCustomers' ? custReceivable : singleCustReceivable;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Handle Print
  const handlePrint = async () => {
    const dataList =
      selectionMode === 'allCustomers' ? custReceivable : singleCustReceivable;

    if (dataList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const dateStr = new Date().toLocaleDateString();
    const tabTitle = selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1);

    // Build HTML table rows
    const rows = dataList
      .map((item: any, index) => {
        if (selectionMode === 'allCustomers') {
          const balance =
            selectedTab === 'receivables' ? item.custac_balance : item.Balance;
          return `
            <tr>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${
                index + 1
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.cust_name
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                balance?.toFixed(2) || '0.00'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.cust_contact || '--'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.cust_sec_contact || '--'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.cust_third_contact || '--'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.cust_address || '--'
              }</td>
            </tr>`;
        } else {
          return `
            <tr>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${
                index + 1
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.cust_name
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.custac_total_bill_amount?.toFixed(2) || '0.00'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.custac_paid_amount?.toFixed(2) || '0.00'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.custac_balance?.toFixed(2) || '0.00'
              }</td>
            </tr>`;
        }
      })
      .join('');

    const headers =
      selectionMode === 'allCustomers'
        ? `<tr style="background:#f0f0f0;">
           <th style="border:1px solid #000; padding:6px;">Sr#</th>
           <th style="border:1px solid #000; padding:6px;">Customer Name</th>
           <th style="border:1px solid #000; padding:6px;">Balance</th>
           <th style="border:1px solid #000; padding:6px;">Contact 1</th>
           <th style="border:1px solid #000; padding:6px;">Contact 2</th>
           <th style="border:1px solid #000; padding:6px;">Contact 3</th>
           <th style="border:1px solid #000; padding:6px;">Address</th>
         </tr>`
        : `<tr style="background:#f0f0f0;">
           <th style="border:1px solid #000; padding:6px;">Sr#</th>
           <th style="border:1px solid #000; padding:6px;">Customer Name</th>
           <th style="border:1px solid #000; padding:6px;">Total Bill</th>
           <th style="border:1px solid #000; padding:6px;">Paid Amount</th>
           <th style="border:1px solid #000; padding:6px;">Balance</th>
         </tr>`;

    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Customer ${tabTitle} Report</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="font-size:12px;">Date: ${dateStr}</div>
            <div style="text-align:center; flex:1; font-size:16px; font-weight:bold;">Point of Sale System</div>
          </div>
            
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:18px; font-weight:bold;">${bussName}</div>
            <div style="font-size:14px;">${bussAddress}</div>
            <div style="font-size:14px; font-weight:bold; text-decoration:underline;">
              Customer ${tabTitle} Report
            </div>
          </div>
            
          <table style="border-collapse:collapse; width:100%; font-size:12px;">
            <thead>
              ${headers}
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    await RNPrint.print({html});
  };

  // Fetch Customer Dropdown
  const fetchCustDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcustomersdropdown`);
      setCustDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Area Dropdown
  const fetchAreaDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchareadata`);
      setAreaDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // All Customer Receivables, Payables
  const fetchAllCustData = async () => {
    try {
      if (selectedTab === 'receivables') {
        const res = await axios.post(`${BASE_URL}/fetchallreceivale`, {
          cust_id: custValue,
          area_id: areaValue,
        });
        setCustReceivable(res.data.allcustomerreceiveable);
      } else if (selectedTab === 'payables') {
        const res = await axios.post(`${BASE_URL}/fetchallpayables`, {
          cust_id: custValue,
          payarea_id: areaValue,
        });
        setCustReceivable(res.data.allcustomerpayables);
      } else if (selectedTab === 'balances') {
        const res = await axios.post(`${BASE_URL}/fetchbalances`, {
          cust_id: custValue,
          balarea_id: areaValue,
        });
        setCustReceivable(res.data.allcustomerbalance);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Single Customer Receivables
  const fetchSingleCustData = async () => {
    try {
      if (selectedTab === 'receivables') {
        const res = await axios.post(`${BASE_URL}/fetchcustreceivable`, {
          cust_id: custValue,
          area_id: areaValue,
        });
        setSingleCustReceivable(res.data.customer_receiveable);
      } else if (selectedTab === 'payables') {
        const res = await axios.post(`${BASE_URL}/singlepayable`, {
          cust_id: custValue,
          payarea_id: areaValue,
        });
        setSingleCustReceivable(res.data.customer_receiveable);
      } else if (selectedTab === 'balances') {
        const res = await axios.post(`${BASE_URL}/fetchcustbalances`, {
          cust_id: custValue,
          balarea_id: areaValue,
        });
        setSingleCustReceivable(res.data.customer_receiveable);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Receivable
  const calculateTotalReceivable = () => {
    let totalReceivable = 0;

    custReceivable.forEach(receivable => {
      const receivableAmount =
        receivable.custac_balance || receivable.Balance || 0;
      totalReceivable += receivableAmount;
    });

    return {
      totalReceivable: Number(totalReceivable).toFixed(2),
    };
  };

  const totals = calculateTotalReceivable();

  useEffect(() => {
    fetchCustDropdown();
    fetchAreaDropdown();
    fetchAllCustData();
    fetchSingleCustData();
    setCurrentPage(1);

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [custValue, areaValue, selectedTab, selectionMode]);

  function formatNumber(num: number | string): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0';

    const abs = Math.abs(n);

    if (abs >= 10000000) {
      return (n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 2) + 'Cr';
    } else if (abs >= 100000) {
      return (n / 100000).toFixed(n % 100000 === 0 ? 0 : 2) + 'L';
    } else if (abs >= 1000) {
      return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 2) + 'K';
    } else {
      return n.toString();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Customer Balances</Text>
          </View>

          <TouchableOpacity style={[styles.headerBtn]} onPress={handlePrint}>
            <Icon name="printer" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterContainer}>
          {/* Toggle Tabs */}
          <View style={styles.toggleRow}>
            {(['receivables', 'payables', 'balances'] as TabType[]).map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[
                  styles.toggleButton,
                  selectedTab === tab && styles.activeButton,
                ]}>
                <Text
                  style={[
                    styles.toggleText,
                    selectedTab === tab && styles.activeText,
                  ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Radio Buttons */}
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSelectionMode('allCustomers');
                setCustValue('');
              }}>
              <RadioButton
                value="allCustomers"
                status={
                  selectionMode === 'allCustomers' ? 'checked' : 'unchecked'
                }
                color={backgroundColors.primary}
                uncheckedColor={backgroundColors.dark}
              />
              <Text style={styles.radioText}>All Customers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSelectionMode('singleCustomer');
                setAreaValue('');
              }}>
              <RadioButton
                value="singleCustomer"
                status={
                  selectionMode === 'singleCustomer' ? 'checked' : 'unchecked'
                }
                color={backgroundColors.primary}
                uncheckedColor={backgroundColors.dark}
              />
              <Text style={styles.radioText}>Single Customer</Text>
            </TouchableOpacity>
          </View>

          {/* Dropdowns */}

          <DropDownPicker
            items={transformedCustomer}
            open={custOpen}
            setOpen={setCustOpen}
            value={custValue}
            setValue={setCustValue}
            placeholder="Select Customer"
            disabled={selectionMode === 'allCustomers'}
            placeholderStyle={{color: '#666'}}
            textStyle={{color: '#144272'}}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={18} color={backgroundColors.dark} />
            )}
            ArrowDownIconComponent={() => (
              <Icon
                name="chevron-down"
                size={18}
                color={backgroundColors.dark}
              />
            )}
            style={[
              styles.dropdown,
              selectionMode === 'allCustomers' && styles.dropdownDisabled,
            ]}
            dropDownContainerStyle={styles.dropDownContainer}
            zIndex={3000}
            zIndexInverse={1000}
            listMode="MODAL"
            listItemLabelStyle={{
              color: backgroundColors.dark,
              fontWeight: '500',
            }}
            labelStyle={{
              color: backgroundColors.dark,
              fontSize: 16,
            }}
            searchable
            searchTextInputStyle={{
              borderWidth: 0,
              width: '100%',
            }}
            searchContainerStyle={{
              borderColor: backgroundColors.gray,
            }}
          />

          <DropDownPicker
            items={transformedAreas}
            open={areaOpen}
            setOpen={setAreaOpen}
            value={areaValue}
            setValue={setAreaValue}
            placeholder="Select Area"
            disabled={selectionMode === 'singleCustomer'}
            placeholderStyle={{color: '#666'}}
            textStyle={{color: '#144272'}}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={18} color={backgroundColors.dark} />
            )}
            ArrowDownIconComponent={() => (
              <Icon
                name="chevron-down"
                size={18}
                color={backgroundColors.dark}
              />
            )}
            style={[
              styles.dropdown,
              selectionMode === 'singleCustomer' && styles.dropdownDisabled,
            ]}
            dropDownContainerStyle={styles.dropDownContainer}
            zIndex={2000}
            zIndexInverse={2000}
            listMode="MODAL"
            listItemLabelStyle={{
              color: backgroundColors.dark,
              fontWeight: '500',
            }}
            labelStyle={{
              color: backgroundColors.dark,
              fontSize: 16,
            }}
            searchable
            searchTextInputStyle={{
              borderWidth: 0,
              width: '100%',
            }}
            searchContainerStyle={{
              borderColor: backgroundColors.gray,
            }}
          />
        </View>

        <View style={styles.listContainer}>
          {/* Summary Cards */}
          {selectionMode === 'allCustomers' &&
            selectedTab === 'receivables' && (
              <View style={styles.summaryContainer}>
                <View style={styles.innerSummaryCtx}>
                  <Text style={styles.summaryLabel}>
                    Total{' '}
                    {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
                    :{' '}
                  </Text>
                  <Text style={styles.summaryValue}>
                    {formatNumber(totals.totalReceivable)}
                  </Text>
                </View>
              </View>
            )}

          <FlatList<AllCustomersReceivable | SingleCustomersReceivable>
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              const isAllCustomers = selectionMode === 'allCustomers';
              const allCustomerItem = item as AllCustomersReceivable;
              const singleCustomerItem = item as SingleCustomersReceivable;

              return (
                <View style={styles.card}>
                  {/* Avatar + Name + Actions */}
                  <View style={styles.row}>
                    <View>
                      <Text style={styles.name}>
                        {isAllCustomers
                          ? allCustomerItem.cust_name
                          : singleCustomerItem.cust_name}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.subText,
                          {
                            fontSize: 16,
                            fontWeight: '600',
                            color: backgroundColors.danger,
                          },
                        ]}>
                        {selectedTab === 'receivables'
                          ? formatNumber(allCustomerItem.custac_balance) ||
                            '0.00'
                          : formatNumber(allCustomerItem.Balance) || '0.00'}
                      </Text>
                    </View>
                  </View>
                  {isAllCustomers ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 4,
                      }}>
                      <Image
                        source={require('../../../assets/telephone.png')}
                        style={styles.contactPng}
                        tintColor={backgroundColors.primary}
                      />
                      <Text style={styles.subText}>
                        {allCustomerItem.cust_contact || 'N/A'}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                        marginTop: 4,
                        justifyContent: 'space-between',
                      }}>
                      <View style={{flexDirection: 'row'}}>
                        <Text style={{fontWeight: '600'}}>
                          Total Bill Amount:{' '}
                        </Text>
                        <Text style={styles.subText}>
                          {formatNumber(
                            singleCustomerItem.custac_total_bill_amount,
                          ) || '0.00'}
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <Text style={{fontWeight: '600'}}>Paid Amount: </Text>
                        <Text style={styles.subText}>
                          {formatNumber(
                            singleCustomerItem.custac_paid_amount,
                          ) || '0.00'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-group" size={48} color="#666" />
                <Text style={styles.emptyText}>No customers found.</Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 90}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => prev - 1)}
              style={[
                styles.pageButton,
                currentPage === 1 && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === 1 && styles.pageButtonTextDisabled,
                ]}>
                Prev
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                Page <Text style={styles.pageCurrent}>{currentPage}</Text> of{' '}
                {totalPages}
              </Text>
              <Text style={styles.totalText}>
                Total: {totalRecords} records
              </Text>
            </View>

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(prev => prev + 1)}
              style={[
                styles.pageButton,
                currentPage === totalPages && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === totalPages && styles.pageButtonTextDisabled,
                ]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Toast />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: backgroundColors.primary,
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  menuIcon: {
    width: 28,
    height: 28,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gradientBackground: {
    flex: 1,
  },

  // Filter Container
  filterContainer: {
    backgroundColor: backgroundColors.light,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 4,
    marginHorizontal: 12,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    padding: 8,
    borderColor: backgroundColors.gray,
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  activeButton: {
    backgroundColor: backgroundColors.primary,
  },
  toggleText: {
    textAlign: 'center',
    color: backgroundColors.dark,
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 6,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: backgroundColors.dark,
    marginLeft: -5,
    fontWeight: '500',
  },
  dropdown: {
    backgroundColor: backgroundColors.light,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
    height: 48,
    marginBottom: 10,
  },
  dropdownDisabled: {
    backgroundColor: '#dfdfdfff',
    borderColor: '#ccc',
  },
  dropDownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    maxHeight: 200,
  },

  // Summary Container
  summaryContainer: {
    borderRadius: 14,
    marginVertical: 5,
    padding: 10,
  },
  innerSummaryCtx: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: backgroundColors.dark,
    fontWeight: 'bold',
  },

  // Flat List Styling
  listContainer: {
    flex: 1,
    marginTop: 10,
    backgroundColor: backgroundColors.gray,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  card: {
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: backgroundColors.dark,
    marginTop: 2,
  },
  contactPng: {
    height: 16,
    width: 16,
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    width: '96%',
    alignSelf: 'center',
    marginTop: 60,
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Pagination Styling
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: backgroundColors.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: -2},
    elevation: 6,
  },
  pageButton: {
    backgroundColor: backgroundColors.info,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  pageButtonDisabled: {
    backgroundColor: '#ddd',
  },
  pageButtonText: {
    color: backgroundColors.light,
    fontWeight: '600',
    fontSize: 14,
  },
  pageButtonTextDisabled: {
    color: '#777',
  },
  pageIndicator: {
    alignItems: 'center',
  },
  pageIndicatorText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  pageCurrent: {
    fontWeight: '700',
    color: '#FFD166',
  },
  totalText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
});
