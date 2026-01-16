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

interface Suppliers {
  id: number;
  sup_name: string;
}

interface AllSupplierData {
  sup_name: string;
  sup_address: string;
  sup_contact: string;
  supac_balance: number;
  Balance: number;
}

interface SingleSupplierData {
  sup_name: string;
  Balance: number;
  supac_total_bill_amount: number;
  supac_paid_amount: number;
}

export default function SupplierBalances({navigation}: any) {
  const [selectedTab, setSelectedTab] = useState<TabType>('receivables');
  const [suppOpen, setSuppOpen] = useState(false);
  const [suppValue, setSuppValue] = useState('');
  const [suppDropdown, setSuppDropdown] = useState<Suppliers[]>([]);
  const transformedSuppliers = suppDropdown.map(supp => ({
    label: supp.sup_name,
    value: supp.id.toString(),
  }));
  const [allSuppData, setAllSuppData] = useState<AllSupplierData[]>([]);
  const [singleSuppData, setSingleSuppData] = useState<SingleSupplierData[]>(
    [],
  );
  const [selectionMode, setSelectionMode] = useState<
    'allSuppliers' | 'singleSupplier' | ''
  >('allSuppliers');

  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData =
    selectionMode === 'allSuppliers' ? allSuppData : singleSuppData;
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
      selectionMode === 'allSuppliers' ? allSuppData : singleSuppData;

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
        if (selectionMode === 'allSuppliers') {
          const balance =
            selectedTab === 'receivables' ? item.supac_balance : item.Balance;
          return `
            <tr>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${
                index + 1
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.sup_name
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                balance?.toFixed(2) || '0.00'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.sup_contact || '--'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.sup_address || '--'
              }</td>
            </tr>`;
        } else {
          return `
            <tr>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${
                index + 1
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.sup_name
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.supac_total_bill_amount?.toFixed(2) || '0.00'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.supac_paid_amount?.toFixed(2) || '0.00'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.Balance?.toFixed(2) || '0.00'
              }</td>
            </tr>`;
        }
      })
      .join('');

    const headers =
      selectionMode === 'allSuppliers'
        ? `<tr style="background:#f0f0f0;">
           <th style="border:1px solid #000; padding:6px;">Sr#</th>
           <th style="border:1px solid #000; padding:6px;">Supplier Name</th>
           <th style="border:1px solid #000; padding:6px;">Balance</th>
           <th style="border:1px solid #000; padding:6px;">Contact</th>
           <th style="border:1px solid #000; padding:6px;">Address</th>
         </tr>`
        : `<tr style="background:#f0f0f0;">
           <th style="border:1px solid #000; padding:6px;">Sr#</th>
           <th style="border:1px solid #000; padding:6px;">Supplier Name</th>
           <th style="border:1px solid #000; padding:6px;">Total Bill</th>
           <th style="border:1px solid #000; padding:6px;">Paid Amount</th>
           <th style="border:1px solid #000; padding:6px;">Balance</th>
         </tr>`;

    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Supplier ${tabTitle} Report</title>
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
              Supplier ${tabTitle} Report
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

  // Fetch Supplier Dropdown
  const fetchSuppDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchsuppliersdropdown`);
      setSuppDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Supplier Receiveable, Payable & Balance
  const fetchAllSuppData = async () => {
    try {
      if (selectedTab === 'receivables') {
        const res = await axios.post(`${BASE_URL}/fetchsupplier_receiveable`, {
          supp_id: suppValue,
        });
        setAllSuppData(res.data.allsupplierpayables || []);
      } else if (selectedTab === 'payables') {
        const res = await axios.post(`${BASE_URL}/fetchsupplier_payable`, {
          supp_id: suppValue,
        });
        setAllSuppData(res.data.allsupplierpayables || []);
      } else if (selectedTab === 'balances') {
        const res = await axios.post(`${BASE_URL}/fetchsupplierbalance`, {
          supp_id: suppValue,
        });
        setAllSuppData(res.data.allsupplierpayables || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Single Supplier Receivable, Payable, Balance
  const fetchSingleSuppData = async () => {
    try {
      if (selectedTab === 'receivables') {
        const res = await axios.post(`${BASE_URL}/singlesupplier_receiveable`, {
          supp_id: suppValue,
        });
        setSingleSuppData(res.data.supplier_payable || []);
      } else if (selectedTab === 'payables') {
        const res = await axios.post(`${BASE_URL}/singlesupplier_payable`, {
          supp_id: suppValue,
        });
        setSingleSuppData(res.data.supplier_payable || []);
      } else if (selectedTab === 'balances') {
        const res = await axios.post(`${BASE_URL}/singlesupplierbalance`, {
          supp_id: suppValue,
        });
        setSingleSuppData(res.data.supplier_payable || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Amount
  const calculateTotalAmount = () => {
    let totalAmount = 0;

    allSuppData.forEach(item => {
      const amount = item.supac_balance || item.Balance || 0;
      totalAmount += amount;
    });

    return {
      totalAmount: Number(totalAmount).toFixed(2),
    };
  };

  const totals = calculateTotalAmount();

  useEffect(() => {
    fetchSuppDropdown();
    fetchAllSuppData();
    fetchSingleSuppData();
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
  }, [suppValue, selectedTab, selectionMode]);

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
    const isAll = selectionMode === 'allSuppliers';
    let name, subtitle, balance, line1Label, line1Value, line2Label, line2Value;

    if (isAll) {
      const rowItem = item as AllSupplierData;
      name = rowItem.sup_name;
      subtitle = rowItem.sup_contact || 'No Contact';
      balance =
        selectedTab === 'receivables' ? rowItem.supac_balance : rowItem.Balance;

      line1Label = 'Address:';
      line1Value = rowItem.sup_address || 'N/A';
    } else {
      const rowItem = item as SingleSupplierData;
      name = rowItem.sup_name;
      subtitle = 'Single Supplier Record';
      balance = rowItem.Balance;

      line1Label = 'Total Bill:';
      line1Value = formatNumber(rowItem.supac_total_bill_amount);
      line2Label = 'Paid:';
      line2Value = formatNumber(rowItem.supac_paid_amount);
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
            <Text style={styles.headerTitle}>Supplier Balances</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* --- CONTENT --- */}
      <View style={{flex: 1}}>
        {/* --- FILTER SURFACE --- */}
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
                setSelectionMode('allSuppliers');
                setSuppValue('');
              }}>
              <RadioButton.Android
                value="allSuppliers"
                status={
                  selectionMode === 'allSuppliers' ? 'checked' : 'unchecked'
                }
                color={THEME.primary}
                onPress={() => {
                  setSelectionMode('allSuppliers');
                  setSuppValue('');
                }}
              />
              <Text style={styles.radioText}>All Suppliers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSelectionMode('singleSupplier');
              }}>
              <RadioButton.Android
                value="singleSupplier"
                status={
                  selectionMode === 'singleSupplier' ? 'checked' : 'unchecked'
                }
                color={THEME.primary}
                onPress={() => {
                  setSelectionMode('singleSupplier');
                }}
              />
              <Text style={styles.radioText}>Single Supplier</Text>
            </TouchableOpacity>
          </View>

          {/* DROPDOWNS */}
          <View style={{zIndex: 3000, marginBottom: 12}}>
            <Text style={styles.inputLabel}>Select Supplier</Text>
            <DropDownPicker
              items={transformedSuppliers}
              open={suppOpen}
              setOpen={setSuppOpen}
              value={suppValue}
              setValue={setSuppValue}
              placeholder="Select Supplier"
              disabled={selectionMode === 'allSuppliers'}
              style={[
                styles.dropdown,
                selectionMode === 'allSuppliers' && styles.dropdownDisabled,
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
          {selectionMode === 'allSuppliers' && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>
                Total{' '}
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
              </Text>
              <Text style={styles.summaryValue}>{totals.totalAmount}</Text>
            </View>
          )}

          {/* --- LIST --- */}
          <View style={styles.listContainer}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeaderLabel}>SUPPLIER LIST</Text>
              <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
            </View>

            <FlatList<AllSupplierData | SingleSupplierData>
              data={paginatedData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => renderCard(item, index)}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.centerContent}>
                  <Icon
                    name="account-off-outline"
                    size={50}
                    color={THEME.textGray}
                  />
                  <Text style={styles.emptyText}>No records found.</Text>
                </View>
              }
            />
          </View>
        </ScrollView>

        {/* --- PAGINATION FOOTER --- */}
        {totalRecords > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(p => p - 1)}
              style={[styles.pageBtn, currentPage === 1 && styles.disabledBtn]}>
              <Icon name="chevron-left" size={24} color={THEME.white} />
            </TouchableOpacity>

            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(p => p + 1)}
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
    elevation: 10,
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
    marginTop: 8,
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
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start', // Top alignment for balance push
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
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
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  detailText: {
    fontSize: 12,
    color: THEME.textGray,
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
    color: THEME.danger,
  },
  miniDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  miniLabel: {
    fontSize: 11,
    color: THEME.textLight,
  },
  miniValue: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.textGray,
  },

  // --- EMPTY / PAGINATION ---
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: THEME.textGray,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: THEME.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  pageBtn: {
    padding: 5,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  pageText: {
    color: THEME.white,
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 15,
  },
});
