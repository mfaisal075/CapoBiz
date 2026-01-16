import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  BackHandler,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPrint from 'react-native-print';
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
  danger: '#EF4444',
  success: '#10B981',
  info: '#3B82F6',
  warning: '#F59E0B',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
};

interface DayBookData {
  sale: number;
  purchase_return: number;
  customerreceiveable: number;
  supplierpayable: number;
  income: string;
  purchase: number;
  sale_return: number;
  exp: number;
  customerpayable: number;
  supplierreceivable: number;
  expense: string;
}

export default function DayBook({navigation}: any) {
  const {token, bussName, bussAddress} = useUser();
  const {openDrawer} = useDrawer();
  const [dayBook, setDayBook] = useState<DayBookData | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  // Fetch Day Book Data
  const fetchDayBook = async () => {
    try {
      const date = startDate.toISOString().split('T')[0];
      const res = await axios.get(
        `${BASE_URL}/daybookdetail?date=${date}&_token=${token}`,
      );
      setDayBook(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDayBook();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [startDate]);

  // Handle Print
  const handlePrint = async () => {
    if (!dayBook) {
      Toast.show({
        type: 'error',
        text1: 'No data found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Day Book Report</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; font-size: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="font-size: 12px;">${dateStr}, ${timeStr}</div>
            <div style="text-align: center; flex: 1; font-size: 14px; font-weight: bold;">Point of Sale System</div>
          </div>
            
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${
              bussName || 'IMTIAZ'
            }</div>
            <div style="font-size: 14px; margin-bottom: 15px;">${
              bussAddress || 'Gujranwala'
            }</div>
            <div style="font-size: 16px; font-weight: bold; text-decoration: underline;">
              Day Book
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <!-- Left Column -->
            <div style="width: 45%;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 500;">Sales</span>
                <span style="font-weight: 500;">${dayBook.sale.toFixed(
                  2,
                )}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 500;">Purchase Return</span>
                <span style="font-weight: 500;">${dayBook.purchase_return.toFixed(
                  2,
                )}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 500;">All Customer Receivables</span>
                <span style="font-weight: 500;">${dayBook.customerreceiveable.toFixed(
                  2,
                )}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 500;">All Supplier Payables</span>
                <span style="font-weight: 500;">${dayBook.supplierpayable.toFixed(
                  2,
                )}</span>
              </div>
            </div>

            <!-- Vertical Separator -->
            <div style="width: 1px; background-color: #000; margin: 0 20px;"></div>

            <!-- Right Column -->
            <div style="width: 45%;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 500;">Purchase</span>
                <span style="font-weight: 500;">${dayBook.purchase.toFixed(
                  2,
                )}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 500;">Sale Return</span>
                <span style="font-weight: 500;">${dayBook.sale_return.toFixed(
                  2,
                )}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 500;">Daily Expense</span>
                <span style="font-weight: 500;">${dayBook.exp.toFixed(2)}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 500;">All Customer Payables</span>
                <span style="font-weight: 500;">${dayBook.customerpayable.toFixed(
                  2,
                )}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 500;">All Supplier Receivables</span>
                <span style="font-weight: 500;">${dayBook.supplierreceivable.toFixed(
                  2,
                )}</span>
              </div>
            </div>
          </div>

          <!-- Income and Expense Summary -->
          <div style="display: flex; justify-content: space-between; margin-top: 40px; font-size: 16px; font-weight: bold;">
            <div>Income: ${parseFloat(dayBook.income).toFixed(2)}</div>
            <div>Expense: ${parseFloat(dayBook.expense).toFixed(2)}</div>
          </div>

          <!-- Footer -->
          <div style="position: fixed; bottom: 20px; left: 20px; right: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #666;">
            <span>https://pos.technicmentors.com/daybook</span>
            <span>1/2</span>
          </div>
        </body>
      </html>
    `;

    await RNPrint.print({html});
  };

  function formatNumber(num: number | string): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0.00';

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

  // --- RENDER HELPERS ---
  const renderSummaryItem = (
    label: string,
    value: number,
    icon: string,
    color: string,
  ) => (
    <View style={styles.summaryItem}>
      <View style={[styles.iconContainer, {backgroundColor: color + '20'}]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={styles.summaryContent}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={[styles.summaryValue, {color: THEME.textDark}]}>
          {formatNumber(value)}
        </Text>
      </View>
    </View>
  );

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
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Day Book</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* --- CONTENT --- */}
      <View style={{flex: 1}}>
        {/* --- FILTER CONTAINER --- */}
        <View style={styles.filterContainer}>
          <View style={styles.dateRow}>
            {/* FROM DATE */}
            <View style={styles.dateCol}>
              <Text style={styles.inputLabel}>Select Date</Text>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowStartDatePicker(true)}>
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString()}
                </Text>
                <Icon name="calendar" size={18} color={THEME.textGray} />
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
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{paddingBottom: 100}}
          showsVerticalScrollIndicator={false}>
          {dayBook ? (
            <View style={styles.listContainer}>
              {/* --- INCOME SECTION --- */}
              <View style={styles.sectionContainer}>
                <View
                  style={[
                    styles.sectionHeader,
                    {borderLeftColor: THEME.success},
                  ]}>
                  <Text style={styles.sectionTitle}>Income</Text>
                  <Text style={[styles.sectionTotal, {color: THEME.success}]}>
                    {formatNumber(dayBook.income)}
                  </Text>
                </View>

                <View style={styles.card}>
                  {renderSummaryItem(
                    'Sales',
                    dayBook.sale,
                    'cart',
                    THEME.success,
                  )}
                  {renderSummaryItem(
                    'Purchase Return',
                    dayBook.purchase_return,
                    'clipboard-arrow-left',
                    THEME.success,
                  )}
                  {renderSummaryItem(
                    'Customer Receivables',
                    dayBook.customerreceiveable,
                    'cash-plus',
                    THEME.success,
                  )}
                  {renderSummaryItem(
                    'Supplier Payables',
                    dayBook.supplierpayable,
                    'account-cash',
                    THEME.success,
                  )}
                </View>
              </View>

              {/* --- EXPENSE SECTION --- */}
              <View style={styles.sectionContainer}>
                <View
                  style={[
                    styles.sectionHeader,
                    {borderLeftColor: THEME.danger},
                  ]}>
                  <Text style={styles.sectionTitle}>Expense</Text>
                  <Text style={[styles.sectionTotal, {color: THEME.danger}]}>
                    {formatNumber(dayBook.expense)}
                  </Text>
                </View>

                <View style={styles.card}>
                  {renderSummaryItem(
                    'Purchases',
                    dayBook.purchase,
                    'cart-plus',
                    THEME.danger,
                  )}
                  {renderSummaryItem(
                    'Sale Return',
                    dayBook.sale_return,
                    'keyboard-return',
                    THEME.danger,
                  )}
                  {renderSummaryItem(
                    'Daily Expense',
                    dayBook.exp,
                    'cash-minus',
                    THEME.danger,
                  )}
                  {renderSummaryItem(
                    'Customer Payables',
                    dayBook.customerpayable,
                    'account-arrow-right',
                    THEME.danger,
                  )}
                  {renderSummaryItem(
                    'Supplier Receivables',
                    dayBook.supplierreceivable,
                    'account-arrow-left',
                    THEME.danger,
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.centerContent}>
              <Icon
                name="chart-box-outline"
                size={50}
                color={THEME.textGray}
                style={{opacity: 0.5}}
              />
              <Text style={styles.emptyText}>No data found for this date.</Text>
            </View>
          )}
        </ScrollView>
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
    paddingBottom: 70, // allow overlap
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
    marginTop: -55,
    marginHorizontal: 16,
    marginBottom: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    zIndex: 1000,
  },
  dateRow: {
    flexDirection: 'row',
  },
  dateCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textGray,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dateBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: THEME.background,
  },
  dateText: {
    fontSize: 13,
    color: THEME.textDark,
    fontWeight: '500',
  },

  // --- LIST / SECTIONS ---
  listContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  sectionTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.rowHover,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: THEME.textGray,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // --- EMPTY ---
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: THEME.textGray,
  },
});
