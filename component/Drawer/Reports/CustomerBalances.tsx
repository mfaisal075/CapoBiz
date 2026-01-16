import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
  StatusBar,
  ScrollView,
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
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../BottomBar';

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  accent: '#4CAF50',
  background: '#F0F2F5',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  danger: '#EF4444',
  success: '#10B981',
  info: '#3B82F6',
  warning: '#F59E0B',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
};

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

  // Helper: Get Initials
  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderCard = (item: any, index: number) => {
    const isAll = selectionMode === 'allCustomers';
    let name, subtitle, balance, line1Label, line1Value, line2Label, line2Value;

    if (isAll) {
      const rowItem = item as AllCustomersReceivable;
      name = rowItem.cust_name;
      subtitle = rowItem.cust_contact || 'No Contact';
      balance =
        selectedTab === 'receivables'
          ? rowItem.custac_balance
          : rowItem.Balance;

      line1Label = 'Address:';
      line1Value = rowItem.cust_address || 'N/A';
      line2Label = 'Contact2:';
      line2Value = rowItem.cust_sec_contact || 'N/A';
    } else {
      const rowItem = item as SingleCustomersReceivable;
      name = rowItem.cust_name;
      subtitle = 'Single Customer Record';
      balance = rowItem.custac_balance;

      line1Label = 'Total Bill:';
      line1Value = formatNumber(rowItem.custac_total_bill_amount);
      line2Label = 'Paid:';
      line2Value = formatNumber(rowItem.custac_paid_amount);
    }

    return (
      <View style={styles.cardRow}>
        {/* Left Side: Avatar + Name */}
        <View style={styles.leftContent}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>

          <View style={styles.infoWrapper}>
            <Text style={styles.nameText} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.detailRow}>
              <Icon name="phone" size={12} color={THEME.textGray} />
              <Text style={styles.detailText} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
            {isAll && (
              <View style={[styles.detailRow, {marginTop: 2}]}>
                <Icon
                  name="map-marker-outline"
                  size={12}
                  color={THEME.textGray}
                />
                <Text style={styles.detailText} numberOfLines={1}>
                  {line1Value}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Right Side: Balance & Details */}
        <View style={styles.rightContent}>
          <View style={[styles.balanceBadge, {marginTop: 22}]}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceValue}>{formatNumber(balance)}</Text>
          </View>

          {!isAll && (
            <View style={styles.miniDetailRow}>
              <Text style={styles.miniLabel}>{line1Label} </Text>
              <Text style={styles.miniValue} numberOfLines={1}>
                {line1Value}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Customer Balances</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* --- CONTENT --- */}
      <View style={{flex: 1}}>
        {/* FILTER SECTION (Floating) */}
        <View style={styles.filterContainer}>
          {/* TABS */}
          <View style={styles.tabContainer}>
            {(['receivables', 'payables', 'balances'] as TabType[]).map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[
                  styles.tabBtn,
                  selectedTab === tab && styles.tabBtnActive,
                ]}>
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === tab && styles.tabTextActive,
                  ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* RADIO MODE */}
          <View style={styles.radioRow}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSelectionMode('allCustomers');
                setCustValue('');
              }}>
              <RadioButton.Android
                value="allCustomers"
                status={
                  selectionMode === 'allCustomers' ? 'checked' : 'unchecked'
                }
                color={THEME.primary}
                onPress={() => {
                  setSelectionMode('allCustomers');
                  setCustValue('');
                }}
              />
              <Text style={styles.radioText}>All Customers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSelectionMode('singleCustomer');
                setAreaValue('');
              }}>
              <RadioButton.Android
                value="singleCustomer"
                status={
                  selectionMode === 'singleCustomer' ? 'checked' : 'unchecked'
                }
                color={THEME.primary}
                onPress={() => {
                  setSelectionMode('singleCustomer');
                  setAreaValue('');
                }}
              />
              <Text style={styles.radioText}>Single Customer</Text>
            </TouchableOpacity>
          </View>

          {/* DROPDOWNS */}
          <View style={{marginBottom: 12}}>
            <Text style={styles.inputLabel}>Select Customer</Text>
            <DropDownPicker
              items={transformedCustomer}
              open={custOpen}
              setOpen={setCustOpen}
              value={custValue}
              setValue={setCustValue}
              placeholder="Select Customer"
              disabled={selectionMode === 'allCustomers'}
              style={[
                styles.dropdown,
                selectionMode === 'allCustomers' && styles.dropdownDisabled,
              ]}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
              theme="LIGHT"
            />
          </View>

          <View style={{zIndex: 2000}}>
            <Text style={styles.inputLabel}>Select Area</Text>
            <DropDownPicker
              items={transformedAreas}
              open={areaOpen}
              setOpen={setAreaOpen}
              value={areaValue}
              setValue={setAreaValue}
              placeholder="Select Area"
              disabled={selectionMode === 'singleCustomer'}
              style={[
                styles.dropdown,
                selectionMode === 'singleCustomer' && styles.dropdownDisabled,
              ]}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
              theme="LIGHT"
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{paddingBottom: 160}}
          showsVerticalScrollIndicator={false}>
          {/* --- SUMMARY --- */}
          {selectionMode === 'allCustomers' &&
            selectedTab === 'receivables' && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Receivables</Text>
                <Text style={styles.summaryValue}>
                  {formatNumber(totals.totalReceivable)}
                </Text>
              </View>
            )}

          {/* --- LIST --- */}
          <View style={styles.listContainer}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeaderLabel}>CUSTOMER LIST</Text>
              <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
            </View>

            <FlatList<AllCustomersReceivable | SingleCustomersReceivable>
              data={paginatedData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => renderCard(item, index)}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.centerContent}>
                  <Icon name="scale-balance" size={60} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No balances found.</Text>
                </View>
              }
            />
          </View>
        </ScrollView>

        {/* --- PAGINATION (Bottom Floating) --- */}
        {totalRecords > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={[styles.pageBtn, currentPage === 1 && styles.disabledBtn]}>
              <Icon name="chevron-left" size={24} color={THEME.white} />
            </TouchableOpacity>

            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))
              }
              style={[
                styles.pageBtn,
                currentPage === totalPages && styles.disabledBtn,
              ]}>
              <Icon name="chevron-right" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <BottomBar />
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- HEADER ---
  headerWrapper: {
    zIndex: 999,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 90, // allow overlap
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: THEME.primary,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },

  // --- FILTER CONTAINER ---
  filterContainer: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginTop: -70,
    marginHorizontal: 16,
    marginBottom: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    zIndex: 1000,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.background,
    borderRadius: 12,
    marginBottom: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: THEME.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textGray,
  },
  tabTextActive: {
    color: THEME.primary,
  },
  radioRow: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-around',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: THEME.textDark,
    marginLeft: -2,
    fontWeight: '500',
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textGray,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dropdown: {
    borderColor: THEME.border,
    borderRadius: 8,
    minHeight: 44,
  },
  dropdownDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  dropdownContainer: {
    borderColor: THEME.border,
  },

  // --- SUMMARY ---
  // --- SUMMARY ---
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textDark,
  },

  // --- LIST / CARD ---
  listContainer: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  tableHeaderLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textGray,
    letterSpacing: 1,
  },
  tableHeaderCount: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '700',
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(42, 101, 43, 0.1)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: THEME.textGray,
    fontWeight: '500',
    marginLeft: 4,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  balanceBadge: {
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  balanceLabel: {
    fontSize: 10,
    color: THEME.textGray,
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.danger, // usually red for balance/due
  },
  miniDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniLabel: {
    fontSize: 11,
    color: THEME.textLight,
  },
  miniValue: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.textDark,
    maxWidth: 100,
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    color: THEME.textGray,
    fontSize: 16,
  },

  // --- PAGINATION ---
  paginationContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: THEME.primary,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  pageBtn: {
    padding: 5,
  },
  disabledBtn: {
    opacity: 0.3,
  },
  pageText: {
    color: THEME.white,
    fontWeight: '600',
    marginHorizontal: 15,
    fontSize: 13,
  },
});
