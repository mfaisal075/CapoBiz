import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
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

export default function CustomerBalances() {
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
    setCurrentPage(1); // Reset to first page when data changes
  }, [custValue, areaValue, selectedTab, selectionMode]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Customer Balances</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} onPress={handlePrint}>
            <Icon name="printer" size={24} color="white" />
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
                color="#144272"
                uncheckedColor="#666"
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
                color="#144272"
                uncheckedColor="#666"
              />
              <Text style={styles.radioText}>Single Customer</Text>
            </TouchableOpacity>
          </View>

          {/* Dropdowns */}
          <View style={styles.dropdownRow}>
            <View style={styles.dropdownWrapper}>
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
                  <Icon name="chevron-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="chevron-down" size={18} color="#144272" />
                )}
                style={[
                  styles.dropdown,
                  selectionMode === 'allCustomers' && styles.dropdownDisabled,
                ]}
                dropDownContainerStyle={styles.dropDownContainer}
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            <View style={styles.dropdownWrapper}>
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
                  <Icon name="chevron-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="chevron-down" size={18} color="#144272" />
                )}
                style={[
                  styles.dropdown,
                  selectionMode === 'singleCustomer' && styles.dropdownDisabled,
                ]}
                dropDownContainerStyle={styles.dropDownContainer}
                zIndex={2000}
                zIndexInverse={2000}
              />
            </View>
          </View>
        </View>

        {/* Summary Cards */}

        {selectionMode === 'allCustomers' && selectedTab === 'receivables' && (
          <View style={styles.summaryContainer}>
            <View style={styles.innerSummaryCtx}>
              <Text style={styles.summaryLabel}>
                Total{' '}
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}:{' '}
              </Text>
              <Text style={styles.summaryValue}>{totals.totalReceivable}</Text>
            </View>
          </View>
        )}

        <View style={styles.listContainer}>
          <FlatList<AllCustomersReceivable | SingleCustomersReceivable>
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              const isAllCustomers = selectionMode === 'allCustomers';
              const allCustomerItem = item as AllCustomersReceivable;
              const singleCustomerItem = item as SingleCustomersReceivable;

              return (
                <View style={styles.card}>
                  {/* Header Row */}
                  <View style={styles.headerRow}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {(isAllCustomers
                          ? allCustomerItem.cust_name
                          : singleCustomerItem.cust_name
                        )?.charAt(0) || 'C'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.customerName}>
                        {isAllCustomers
                          ? allCustomerItem.cust_name
                          : singleCustomerItem.cust_name}
                      </Text>
                    </View>
                  </View>

                  {/* Info Section */}
                  <View style={styles.infoBox}>
                    {isAllCustomers ? (
                      <>
                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="cash"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>Balance</Text>
                          </View>
                          <Text style={styles.valueText}>
                            Rs.{' '}
                            {selectedTab === 'receivables'
                              ? allCustomerItem.custac_balance?.toFixed(2) ||
                                '0.00'
                              : allCustomerItem.Balance?.toFixed(2) || '0.00'}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="phone"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>Contact 1</Text>
                          </View>
                          <Text style={styles.valueText}>
                            {allCustomerItem.cust_contact || '--'}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="phone-plus"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>Contact 2</Text>
                          </View>
                          <Text style={styles.valueText}>
                            {allCustomerItem.cust_sec_contact || '--'}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="phone-ring"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>Contact 3</Text>
                          </View>
                          <Text style={styles.valueText}>
                            {allCustomerItem.cust_third_contact || '--'}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="map-marker"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>Address</Text>
                          </View>
                          <Text style={[styles.valueText, {maxWidth: '60%'}]}>
                            {allCustomerItem.cust_address || '--'}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="receipt"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>
                              Total Bill Amount
                            </Text>
                          </View>
                          <Text style={styles.valueText}>
                            Rs.{' '}
                            {singleCustomerItem.custac_total_bill_amount?.toFixed(
                              2,
                            ) || '0.00'}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="cash-check"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>Paid Amount</Text>
                          </View>
                          <Text style={styles.valueText}>
                            Rs.{' '}
                            {singleCustomerItem.custac_paid_amount?.toFixed(
                              2,
                            ) || '0.00'}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="cash-minus"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>Balance</Text>
                          </View>
                          <Text style={styles.valueText}>
                            Rs.{' '}
                            {singleCustomerItem.custac_balance?.toFixed(2) ||
                              '0.00'}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-group" size={48} color="#666" />
                <Text style={styles.emptyText}>No customers found.</Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 70}}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
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

  // Filter Container
  filterContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
    zIndex: 1000,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  toggleButton: {
    flex: 1,
    padding: 8,
    borderColor: '#144272',
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  activeButton: {
    backgroundColor: '#144272',
  },
  toggleText: {
    textAlign: 'center',
    color: '#144272',
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    marginBottom: 15,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: '#144272',
    marginLeft: -5,
    fontWeight: '500',
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#144272',
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  dropdownDisabled: {
    backgroundColor: '#9a9a9a48',
    borderColor: '#ccc',
  },
  dropDownContainer: {
    backgroundColor: '#fff',
    borderColor: '#144272',
  },

  //Summary Container Styling
  summaryContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    paddingVertical: 10,
  },
  innerSummaryCtx: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#144272',
    fontWeight: 'bold',
  },

  // Flat List Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    zIndex: 1000,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#144272',
    flexWrap: 'wrap',
  },
  infoBox: {
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    flex: 1,
  },
  infoIcon: {
    marginRight: 6,
  },
  labelText: {
    fontSize: 13,
    color: '#144272',
    fontWeight: '600',
  },
  valueText: {
    fontSize: 13,
    color: '#333',
    maxWidth: '50%',
    textAlign: 'right',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },

  // Pagination Styling
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#144272',
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
    backgroundColor: '#fff',
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
    color: '#144272',
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
