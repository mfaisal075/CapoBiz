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
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../../CTX/UserContext';
import RNPrint from 'react-native-print';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../../BottomBar';

const {width} = Dimensions.get('window');

// --- THEME ---
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
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
};

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
  sal_order_total: string;
  sal_discount: string;
  sal_change_amount: string;
}

export default function SingleUserDailySales({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
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

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: selectionMode === 'salereport' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [selectionMode]);

  const toggleSwitch = (mode: 'salereport' | 'detailedsalereport') => {
    setSelectionMode(mode);
    setCatValue('');
    setUserValue('');
    setProdValue('');
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData =
    selectionMode === 'salereport' ? dailyReports : dailyDetailedReports;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Report Print
  const handlePrint = async () => {
    const dataList =
      selectionMode === 'salereport' ? dailyReports : dailyDetailedReports;

    if (dataList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const userName =
      userDropdown.find(user => user.id.toString() === userValue)?.name ||
      'User';

    // Get current date
    const dateStr = new Date().toLocaleDateString();

    // Build HTML table rows
    const rows = dataList
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
              ${
                selectionMode === 'detailedsalereport'
                  ? `<td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_total_amount}</td>`
                  : ''
              }
              ${
                selectionMode === 'salereport'
                  ? `<td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_order_total}</td>
                <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_discount}</td>
                <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_total_amount}</td>
                <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_payment_amount}</td>
                <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_change_amount}</td>`
                  : ''
              }
              <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
                item.sal_profit
              }</td>
            </tr>`,
      )
      .join('');

    // HTML Template
    const html = `
          <html>
            <head>
              <meta charset="utf-8">
              <title>Daily Sales</title>
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
                  ${
                    selectionMode === 'salereport'
                      ? 'Daily Sales'
                      : 'Daily Sale Detail'
                  }
                </div>
              </div>
      
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div style="font-size:12px; font-weight: bold;">
                  User: ${userName ? userName : 'All Users'}
                </div>
              </div>
                
              <table style="border-collapse:collapse; width:100%; font-size:12px;">
                <thead>
                  <tr style="background:#f0f0f0;">
                    <th style="border:1px solid #000; padding:6px;">Sr#</th>
                    <th style="border:1px solid #000; padding:6px;">Invoice#</th>
                    <th style="border:1px solid #000; padding:6px;">Customer</th>
                    <th style="border:1px solid #000; padding:6px;">Date</th>
                    ${
                      selectionMode === 'detailedsalereport'
                        ? `<th style="border:1px solid #000; padding:6px;">Sale</th>`
                        : ''
                    }
                    ${
                      selectionMode === 'salereport'
                        ? `<th style="border:1px solid #000; padding:6px;">Order Total</th>
                    <th style="border:1px solid #000; padding:6px;">Discount</th>
                    <th style="border:1px solid #000; padding:6px;">Total Amount</th>
                    <th style="border:1px solid #000; padding:6px;">Paid</th>
                    <th style="border:1px solid #000; padding:6px;">Balance</th>`
                        : ''
                    }
                    <th style="border:1px solid #000; padding:6px;">Profit</th>
                  </tr>
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

  const totals =
    selectionMode === 'salereport'
      ? calculateDailyTotals()
      : calculateDailyDailtedTotals();

  useEffect(() => {
    fetchCatDropdown();
    fetchProdDropdown();
    fetchUserDropdown();
    fetchDailyReport();
    fetchDailyDetailedReport();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [userValue, catValue, prodValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectionMode, userValue, catValue, prodValue]);

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

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.headerTitle}>Single User Sales</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={26} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* --- FILTER SECTION --- */}
      <View style={styles.filterSection}>
        {/* Toggle Switch */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleWrapper}>
            <Animated.View
              style={[
                styles.toggleSlider,
                {
                  left: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, 148], // Adjust based on width
                  }),
                },
              ]}
            />
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => toggleSwitch('salereport')}>
              <Text
                style={[
                  styles.toggleText,
                  selectionMode === 'salereport' && styles.activeToggleText,
                ]}>
                Daily Sales
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => toggleSwitch('detailedsalereport')}>
              <Text
                style={[
                  styles.toggleText,
                  selectionMode === 'detailedsalereport' &&
                    styles.activeToggleText,
                ]}>
                Detailed Report
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Dropdown */}
        <View style={{zIndex: 3000, marginTop: 10, marginBottom: 10}}>
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
              <Icon name="chevron-up" size={18} color={THEME.textDark} />
            )}
            ArrowDownIconComponent={() => (
              <Icon name="chevron-down" size={18} color={THEME.textDark} />
            )}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode="MODAL"
            listItemLabelStyle={{color: THEME.textDark, fontWeight: '500'}}
            labelStyle={{color: THEME.textDark, fontSize: 13}}
            searchable
            searchTextInputStyle={{borderWidth: 0, color: THEME.textDark}}
            searchContainerStyle={{borderColor: THEME.border}}
          />
        </View>

        {/* Category & Product Dropdowns (Side-by-Side) */}
        <View style={styles.filterRow}>
          <View style={{width: '48%'}}>
            <DropDownPicker
              items={transformedCategory}
              open={catOpen}
              setOpen={setCatOpen}
              value={catValue}
              setValue={setCatValue}
              placeholder="Category"
              disabled={selectionMode === 'salereport'}
              placeholderStyle={{color: THEME.textGray}}
              textStyle={{color: THEME.textDark}}
              ArrowUpIconComponent={() => (
                <Icon name="chevron-up" size={18} color={THEME.textDark} />
              )}
              ArrowDownIconComponent={() => (
                <Icon name="chevron-down" size={18} color={THEME.textDark} />
              )}
              style={[
                styles.dropdown,
                selectionMode === 'salereport' && styles.dropdownDisabled,
              ]}
              dropDownContainerStyle={styles.dropDownContainer}
              listMode="MODAL"
              listItemLabelStyle={{color: THEME.textDark, fontWeight: '500'}}
              labelStyle={{color: THEME.textDark, fontSize: 13}}
              searchable
              searchTextInputStyle={{borderWidth: 0, color: THEME.textDark}}
              searchContainerStyle={{borderColor: THEME.border}}
            />
          </View>

          <View style={{width: '48%'}}>
            <DropDownPicker
              items={transformedProd}
              open={prodOpen}
              setOpen={setProdOpen}
              value={prodValue}
              setValue={setProdValue}
              placeholder="Product"
              disabled={selectionMode === 'salereport'}
              placeholderStyle={{color: THEME.textGray}}
              textStyle={{color: THEME.textDark}}
              ArrowUpIconComponent={() => (
                <Icon name="chevron-up" size={18} color={THEME.textDark} />
              )}
              ArrowDownIconComponent={() => (
                <Icon name="chevron-down" size={18} color={THEME.textDark} />
              )}
              style={[
                styles.dropdown,
                selectionMode === 'salereport' && styles.dropdownDisabled,
              ]}
              dropDownContainerStyle={styles.dropDownContainer}
              listMode="MODAL"
              listItemLabelStyle={{color: THEME.textDark, fontWeight: '500'}}
              labelStyle={{color: THEME.textDark, fontSize: 13}}
              searchable
              searchTextInputStyle={{borderWidth: 0, color: THEME.textDark}}
              searchContainerStyle={{borderColor: THEME.border}}
            />
          </View>
        </View>
      </View>

      {/* --- STATS SECTION --- */}
      <View style={styles.statsWrapper}>
        <View style={styles.statsGridContainer}>
          <View style={[styles.statCard, {backgroundColor: '#E3F2FD'}]}>
            <View style={[styles.iconCircle, {backgroundColor: '#BBDEFB'}]}>
              <Icon name="cash-multiple" size={24} color="#1976D2" />
            </View>
            <View>
              <Text style={[styles.statValue, {color: '#1565C0'}]}>
                {formatNumber(totals.totalSale)}
              </Text>
              <Text style={styles.statLabel}>Total Sales</Text>
            </View>
          </View>

          <View style={[styles.statCard, {backgroundColor: '#E8F5E9'}]}>
            <View style={[styles.iconCircle, {backgroundColor: '#C8E6C9'}]}>
              <Icon name="trending-up" size={24} color="#388E3C" />
            </View>
            <View>
              <Text style={[styles.statValue, {color: '#2E7D32'}]}>
                {formatNumber(totals.totalProfit)}
              </Text>
              <Text style={styles.statLabel}>Total Profit</Text>
            </View>
          </View>

          <View style={[styles.statCard, {backgroundColor: '#FFF3E0'}]}>
            <View style={[styles.iconCircle, {backgroundColor: '#FFE0B2'}]}>
              <Icon
                name="arrow-down-bold-circle-outline"
                size={24}
                color="#F57C00"
              />
            </View>
            <View>
              <Text style={[styles.statValue, {color: '#EF6C00'}]}>
                {formatNumber(totals.totalReceived)}
              </Text>
              <Text style={styles.statLabel}>Received</Text>
            </View>
          </View>

          <View style={[styles.statCard, {backgroundColor: '#FFEBEE'}]}>
            <View style={[styles.iconCircle, {backgroundColor: '#FFCDD2'}]}>
              <Icon name="alert-circle-outline" size={24} color="#D32F2F" />
            </View>
            <View>
              <Text style={[styles.statValue, {color: '#C62828'}]}>
                {formatNumber(totals.totalCreditSale)}
              </Text>
              <Text style={styles.statLabel}>Credit Sale</Text>
            </View>
          </View>
        </View>
      </View>

      {/* --- LIST CONTENT --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>
            {selectionMode === 'salereport'
              ? 'SALES REPORT'
              : 'DETAILED REPORT'}
          </Text>
          <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
        </View>

        {selectionMode === 'salereport' && (
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({item}) => {
              const initials = getInitials(item.cust_name);
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
                        {item.cust_name}
                      </Text>
                      <Text
                        style={[
                          styles.detailText,
                          {color: THEME.primary, fontSize: 13},
                        ]}>
                        {formatNumber(item.sal_total_amount)}
                      </Text>
                    </View>

                    <Text style={styles.dateLabelList}>
                      {new Date(item.sal_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      • #{item.sal_invoice_no}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 2,
                      }}>
                      <Text style={{fontSize: 11, color: THEME.textLight}}>
                        Profit:{' '}
                        <Text
                          style={{
                            color:
                              parseFloat(item.sal_profit) >= 0
                                ? THEME.primary
                                : THEME.danger,
                            fontWeight: '600',
                          }}>
                          {formatNumber(item.sal_profit)}
                        </Text>
                      </Text>
                      <Text style={{fontSize: 11, color: THEME.textLight}}>
                        Paid:{' '}
                        <Text style={{color: THEME.textGray}}>
                          {formatNumber(item.sal_payment_amount)}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.centerContent}>
                <Icon name="file-document-outline" size={60} color="#E5E7EB" />
                <Text style={styles.emptyText}>No sales found</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 150}}
          />
        )}

        {selectionMode === 'detailedsalereport' && (
          <FlatList
            data={paginatedData as any}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({item}) => {
              // Note: item type here is DailyDetailedReports (which seems to conform to the layout)
              // But detailed report structure in AllUserSale uses nested product details which are not present in DailyDetailedReports interface used here.
              // Looking at fetchDailyDetailedReport, it fetches into setDailyDetailedReports.
              // Wait, in SingleUserDailySales, dailyDetailedReports seems to just be a flat list of sales with totals?
              // The AllUserSale used `saleDetails` map.
              // I will check the original file content for `DailyDetailedReports` interface.
              // It seems SingleUserDailySales might not have the nested details logic implemented same as AllUserSale yet?
              // The user asked to make the SCREEN look like AllUserSale.
              // I should maintain the data I have but display it in the card card format.
              // Logic check: DailyDetailedReports has invoice, customer, etc.
              // It does NOT have a list of products in the interface shown in line 74.
              // So I will just display the card.

              const initials = getInitials(item.cust_name);
              return (
                <View style={styles.cardRow}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View style={styles.infoContainer}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.nameText} numberOfLines={1}>
                        {item.cust_name}
                      </Text>
                      <Text
                        style={[
                          styles.detailText,
                          {color: THEME.primary, fontSize: 13},
                        ]}>
                        {formatNumber(item.sal_total_amount)}
                      </Text>
                    </View>

                    <Text style={styles.dateLabelList}>
                      {new Date(item.sal_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      • #{item.sal_invoice_no}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 2,
                      }}>
                      <Text style={{fontSize: 11, color: THEME.textLight}}>
                        Profit:{' '}
                        <Text
                          style={{
                            color:
                              parseFloat(item.sal_profit) >= 0
                                ? THEME.primary
                                : THEME.danger,
                            fontWeight: '600',
                          }}>
                          {formatNumber(item.sal_profit)}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.centerContent}>
                <Icon name="file-document-outline" size={60} color="#E5E7EB" />
                <Text style={styles.emptyText}>No detailed sales found</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 150}}
          />
        )}
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
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight : 20,
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
    paddingVertical: 10,
    paddingHorizontal: 10,
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
  // Toggle Switch
  toggleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 30,
    width: 300,
    height: 36,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
  },
  toggleSlider: {
    position: 'absolute',
    width: 150,
    height: 32,
    backgroundColor: THEME.white,
    borderRadius: 28,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  dropdown: {
    backgroundColor: THEME.white,
    borderColor: THEME.border,
    borderRadius: 8,
    minHeight: 45,
  },
  dropdownDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.7,
  },
  dropDownContainer: {
    borderColor: THEME.border,
    backgroundColor: THEME.white,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 0,
  },

  // --- STATS SECTION ---
  statsWrapper: {
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  statsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: THEME.textGray,
    fontWeight: '600',
  },
  statDivider: {
    // Unused in grid layout, but kept for compatibility if referenced unexpectedly
    width: 1,
    height: '80%',
    backgroundColor: THEME.border,
    alignSelf: 'center',
  },

  // --- LIST & CARDS ---
  listContainer: {
    flex: 1,
    marginTop: 0,
    paddingHorizontal: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
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
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 2,
    flex: 1,
  },
  dateLabelList: {
    fontSize: 12,
    color: THEME.textGray,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '700',
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
