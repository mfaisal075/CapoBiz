import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Animated,
  Image,
  BackHandler,
  StatusBar,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPrint from 'react-native-print';
import {useUser} from '../../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../../BottomBar';

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
  danger: '#EF4444',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
  textLight: '#9CA3AF',
};

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

export default function SaleSaleReturnReport({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
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
  const [activeTab, setActiveTab] = useState<'sales' | 'returns'>('sales');

  // Handle Print
  const handlePrint = async () => {
    if (saleData.length === 0 && saleReturnData.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const userName =
      usersDropdown.find(user => user.id.toString() === userValue)?.name ||
      'Customer';

    // Get current date
    const dateStr = new Date().toLocaleDateString();

    // Build Sale HTML table rows
    const saleRows = saleData
      .map(
        (item, index) => `
          <tr>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
              index + 1
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.sal_invoice_no
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.cust_name
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
              item.sal_date,
            ).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.sal_order_total
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.sal_discount
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.sal_total_amount
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.sal_profit
            }</td>
          </tr>`,
      )
      .join('');

    // Build Sale Return HTML table rows
    const returnRows = saleReturnData
      .map(
        (item, index) => `
          <tr>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
              index + 1
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.salrd_invoice_no
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.prod_name
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
              item.created_at,
            ).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.salrd_return_qty
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.salrd_price
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.salrd_total_price
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.salrd_profit
            }</td>
          </tr>`,
      )
      .join('');

    // HTML Template
    const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Sale & Sale Return Report</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div style="font-size:12px;">Date: ${dateStr}</div>
              <div style="text-align:center; flex:1; font-size:16px; font-weight:bold;">Point of Sale System</div>
            </div>
              
            <div style="text-align:center; margin-bottom:20px;">
              <div style="font-size:18px; font-weight:bold;">${bussName}</div>
              <div style="font-size:14px;">${bussAddress}</div>
              <div style="font-size:14px; font-weight:bold; text-decoration:underline; margin-top:20px;">
                Sale Profit
              </div>
            </div>
    
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div style="font-size:12px; font-weight: bold;">
                Product: ${userValue === '' ? 'All Products' : userName}
              </div>
              <div style="display:flex; justify-content:space-between; width: 35%; gap: 20px;">
                <div style="font-size:12px;">
                  <span style="font-weight: bold;">From:</span> ${startDate.toLocaleDateString(
                    'en-US',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    },
                  )}
                </div>
                <div style="font-size:12px;">
                  <span style="font-weight: bold;">To:</span> ${endDate.toLocaleDateString(
                    'en-US',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    },
                  )}
                </div>
              </div>
            </div>
              
            <table style="border-collapse:collapse; width:100%; font-size:12px;">
              <thead>
                <tr style="background:#f0f0f0;">
                  <th style="border:1px solid #000; padding:6px;">Sr#</th>
                  <th style="border:1px solid #000; padding:6px;">Invoice No</th>
                  <th style="border:1px solid #000; padding:6px;">Customer</th>
                  <th style="border:1px solid #000; padding:6px;">Date</th>
                  <th style="border:1px solid #000; padding:6px;">Order Total</th>
                  <th style="border:1px solid #000; padding:6px;">Discount</th>
                  <th style="border:1px solid #000; padding:6px;">Total Amount</th>
                  <th style="border:1px solid #000; padding:6px;">Profit</th>
                </tr>
              </thead>
              <tbody>
                ${saleRows}
              </tbody>
            </table>

            <div style="text-align:center; margin-bottom:20px; margin-top:20px;">
              <div style="font-size:14px; font-weight:bold; text-decoration:underline;">
                Sale Return
              </div>
            </div>

            <table style="border-collapse:collapse; width:100%; font-size:12px;">
              <thead>
                <tr style="background:#f0f0f0;">
                  <th style="border:1px solid #000; padding:6px;">Sr#</th>
                  <th style="border:1px solid #000; padding:6px;">Invoice No</th>
                  <th style="border:1px solid #000; padding:6px;">Product</th>
                  <th style="border:1px solid #000; padding:6px;">Return Date</th>
                  <th style="border:1px solid #000; padding:6px;">Quantity</th>
                  <th style="border:1px solid #000; padding:6px;">Price</th>
                  <th style="border:1px solid #000; padding:6px;">Total Total</th>
                  <th style="border:1px solid #000; padding:6px;">Profit</th>
                </tr>
              </thead>
              <tbody>
                ${returnRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

    await RNPrint.print({html});
  };

  // Animation for toggle
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

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

  const totals = calculateTotalSales();

  // Handle tab switch with animation
  const handleTabSwitch = (tab: 'sales' | 'returns') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset pagination when switching tabs
    Animated.timing(slideAnim, {
      toValue: tab === 'sales' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Pagination calculations
  const currentData = activeTab === 'sales' ? saleData : saleReturnData;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

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

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    fetchUserDropdown();
    fetchSaleData();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [startDate, endDate, userValue]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={26} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sale & Return Report</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={26} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* --- FILTER SECTION --- */}
      <View style={styles.filterSection}>
        {/* Dropdown */}
        <View style={{zIndex: 1000, marginBottom: 10}}>
          <DropDownPicker
            items={transformedUsers}
            open={userOpen}
            setOpen={setUserOpen}
            value={userValue}
            setValue={setUserValue}
            placeholder="Select User"
            placeholderStyle={{color: THEME.textGray}}
            textStyle={{color: THEME.textDark}}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={20} color={THEME.textDark} />
            )}
            ArrowDownIconComponent={() => (
              <Icon name="chevron-down" size={20} color={THEME.textDark} />
            )}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode="SCROLLVIEW"
            listItemLabelStyle={{
              color: THEME.textDark,
              fontWeight: '500',
            }}
            labelStyle={{
              color: THEME.textDark,
              fontSize: 13,
            }}
            searchable
            searchTextInputStyle={{
              borderWidth: 0,
            }}
            searchContainerStyle={{
              borderBottomColor: THEME.border,
              borderBottomWidth: 1,
              paddingVertical: 3,
            }}
          />
        </View>

        {/* Date Inputs */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartDatePicker(true)}>
            <Icon name="calendar" size={20} color={THEME.primary} />
            <Text style={styles.dateText}>
              {startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateSeparator}>to</Text>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndDatePicker(true)}>
            <Icon name="calendar" size={20} color={THEME.primary} />
            <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>

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

      {/* --- STATS SECTION --- */}
      <View style={styles.statsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingRight: 10}}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: '#1976D2'}]}>
              {formatNumber(totals.totalSale)}
            </Text>
            <Text style={styles.statLabel}>Total Sale</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: '#388E3C'}]}>
              {formatNumber(totals.totalSaleProfit)}
            </Text>
            <Text style={styles.statLabel}>Sale Profit</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: '#D32F2F'}]}>
              {formatNumber(totals.totalReturn)}
            </Text>
            <Text style={styles.statLabel}>Total Return</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: '#FBC02D'}]}>
              {formatNumber(totals.totalReturnProfit)}
            </Text>
            <Text style={styles.statLabel}>Return Profit</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: '#7B1FA2'}]}>
              {formatNumber(totals.netProfit)}
            </Text>
            <Text style={styles.statLabel}>Net Profit</Text>
          </View>
        </ScrollView>
      </View>

      {/* --- TOGGLE BUTTON --- */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggleWrapper}>
          <Animated.View
            style={[
              styles.toggleSlider,
              {
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [2, 168], // Adjusted for wider slider
                    }),
                  },
                ],
              },
            ]}
          />
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => handleTabSwitch('sales')}>
            <Text
              style={[
                styles.toggleText,
                activeTab === 'sales' && styles.activeToggleText,
              ]}>
              Sales ({saleData.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => handleTabSwitch('returns')}>
            <Text
              style={[
                styles.toggleText,
                activeTab === 'returns' && styles.activeToggleText,
              ]}>
              Returns ({saleReturnData.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- LIST CONTENT --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>
            {activeTab === 'sales' ? 'SALES' : 'RETURNS'}
          </Text>
          <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
        </View>

        <FlatList
          data={paginatedData as any}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => {
            const name =
              activeTab === 'sales' ? item.cust_name : item.prod_name;
            const initials = getInitials(name);
            const date =
              activeTab === 'sales' ? item.sal_date : item.created_at;
            const invoice =
              activeTab === 'sales'
                ? item.sal_invoice_no
                : item.salrd_invoice_no;

            return (
              <View style={styles.cardRow}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.nameText} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text
                      style={[
                        styles.detailText,
                        {
                          color:
                            activeTab === 'sales' ? THEME.primary : '#D32F2F',
                          fontSize: 13,
                        },
                      ]}>
                      {activeTab === 'sales'
                        ? formatNumber(item.sal_total_amount)
                        : formatNumber(item.salrd_total_price)}
                    </Text>
                  </View>

                  <Text style={styles.dateLabelList}>
                    {new Date(date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    • #{invoice}
                  </Text>

                  <View style={styles.detailRow}>
                    {activeTab === 'sales' ? (
                      <>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Profit:</Text>
                          <Text
                            style={[styles.detailText, {color: THEME.primary}]}>
                            {formatNumber(item.sal_profit)}
                          </Text>
                        </View>
                        {/* Add more details if needed for sales */}
                      </>
                    ) : (
                      <>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Qty:</Text>
                          <Text style={styles.detailText}>
                            {item.salrd_return_qty}
                          </Text>
                        </View>
                        <View style={styles.detailSeparator} />
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Profit:</Text>
                          <Text style={[styles.detailText, {color: '#FBC02D'}]}>
                            {formatNumber(item.salrd_profit)}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Icon name="swap-horizontal" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>No records found.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 160}}
        />
      </View>

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
      <BottomBar />
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
    paddingBottom: 20,
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 80,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: THEME.primary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.white,
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  iconBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },

  // --- FILTER SECTION ---
  filterSection: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginTop: -80,
    marginHorizontal: 16,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: THEME.white,
    borderColor: THEME.border,
    borderRadius: 8,
    minHeight: 45,
  },
  dropDownContainer: {
    borderColor: THEME.border,
    backgroundColor: THEME.white,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
    marginTop: 0,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.white,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateText: {
    fontSize: 14,
    color: THEME.textDark,
    marginLeft: 8,
    fontWeight: '600',
  },
  dateSeparator: {
    marginHorizontal: 10,
    color: THEME.textGray,
    fontWeight: '600',
    fontSize: 14,
  },

  // --- STATS SECTION ---
  statsContainer: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
    minWidth: 80,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: THEME.textGray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    height: '60%',
    alignSelf: 'center',
  },

  // --- TOGGLE SWITCH ---
  toggleContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10,
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 30,
    width: 300,
    height: 40,
    position: 'relative',
    padding: 2,
  },
  toggleSlider: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 2,
    width: 146,
    backgroundColor: THEME.white,
    borderRadius: 28,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
  },
  toggleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textGray,
  },
  activeToggleText: {
    color: THEME.primary,
    fontWeight: '700',
  },

  // --- LIST CONTENT ---
  listContainer: {
    flex: 1,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  tableHeaderCount: {
    fontSize: 14,
    color: THEME.textGray,
    fontWeight: '500',
  },

  // CARD STYLE
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 3},
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: THEME.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 2,
    maxWidth: '75%',
  },
  dateLabelList: {
    fontSize: 12,
    color: THEME.textGray,
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailSeparator: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: THEME.textGray,
    marginRight: 4,
  },
  detailText: {
    fontSize: 12,
    color: THEME.textDark,
    fontWeight: '600',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.3,
  },
  pageText: {
    color: THEME.white,
    fontWeight: '700',
    marginHorizontal: 15,
    fontSize: 14,
  },
});
