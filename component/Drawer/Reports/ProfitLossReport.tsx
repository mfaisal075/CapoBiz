import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
  danger: '#EF4444',
  success: '#10B981',
  info: '#3B82F6',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
};

interface ProfitLoss {
  expences: string;
  profit: string;
  salereturnprofit: string;
}

export default function ProfitLossReport({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
  const [profitLossData, setProfitLossData] = useState<ProfitLoss | null>(null);
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

  const fetchProfitLossData = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchprofitloss`, {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      });
      setProfitLossData(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Handle Print
  const handlePrint = async () => {
    if (!profitLossData) {
      Toast.show({
        type: 'error',
        text1: 'No data found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const dateStr = new Date().toLocaleDateString();
    const saleProfit = parseFloat(profitLossData.profit).toFixed(2);
    const saleReturnProfit = parseFloat(
      profitLossData.salereturnprofit,
    ).toFixed(2);
    const expenses = parseFloat(profitLossData.expences).toFixed(2);
    const netProfit = (
      parseFloat(profitLossData.profit) -
      parseFloat(profitLossData.expences) -
      parseFloat(profitLossData.salereturnprofit)
    ).toFixed(2);

    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Profit Loss Report</title>
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
              Profit Loss Report
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
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
            
          <table style="border-collapse:collapse; width:100%; font-size:14px;">
            <thead>
              <tr style="background:#f0f0f0;">
                <th style="border:1px solid #000; padding:10px; text-align:left;">Description</th>
                <th style="border:1px solid #000; padding:10px; text-align:right;">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border:1px solid #000; padding:8px;">Sale Profit</td>
                <td style="border:1px solid #000; padding:8px; text-align:right;">${saleProfit}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000; padding:8px;">Sale Return Profit</td>
                <td style="border:1px solid #000; padding:8px; text-align:right;">-${saleReturnProfit}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000; padding:8px;">Expenses</td>
                <td style="border:1px solid #000; padding:8px; text-align:right;">-${expenses}</td>
              </tr>
              <tr style="background:#f0f0f0; font-weight:bold;">
                <td style="border:1px solid #000; padding:8px;">Net Profit</td>
                <td style="border:1px solid #000; padding:8px; text-align:right;">${netProfit}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      await RNPrint.print({html});
    } catch (error) {
      console.log('Print error:', error);
    }
  };

  useEffect(() => {
    fetchProfitLossData();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [startDate, endDate]);

  // Calculate values
  const saleProfit = profitLossData ? parseFloat(profitLossData.profit) : 0;
  const saleReturnProfit = profitLossData
    ? parseFloat(profitLossData.salereturnprofit)
    : 0;
  const expenses = profitLossData ? parseFloat(profitLossData.expences) : 0;
  const netProfit = saleProfit - expenses - saleReturnProfit;

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
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profit Loss Report</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* --- FILTER SECTION --- */}
      <View style={styles.filterSection}>
        <View style={styles.filterRow}>
          {/* Start Date */}
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartDatePicker(true)}>
            <Icon name="calendar" size={20} color={THEME.primary} />
            <Text style={styles.dateText}>
              {startDate.toLocaleDateString('en-GB')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateSeparator}>to</Text>

          {/* End Date */}
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndDatePicker(true)}>
            <Icon name="calendar" size={20} color={THEME.primary} />
            <Text style={styles.dateText}>
              {endDate.toLocaleDateString('en-GB')}
            </Text>
          </TouchableOpacity>
        </View>

        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={onEndDateChange}
          />
        )}
      </View>

      <ScrollView contentContainerStyle={{paddingBottom: 100}}>
        {/* --- REPORT SUMMARY SURFACE --- */}
        <View style={styles.reportSurface}>
          <Text style={styles.sectionTitle}>Summary</Text>

          <View style={styles.summaryTable}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.thText}>HEADS</Text>
              <Text style={[styles.thText, {textAlign: 'right'}]}>AMOUNT</Text>
            </View>

            {/* Rows */}
            <View style={styles.tableRow}>
              <Text style={styles.tdText}>Sale Profit</Text>
              <Text style={[styles.tdTextBold, {color: THEME.info}]}>
                {saleProfit.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={styles.tdText}>Sale Return Profit</Text>
              <Text style={[styles.tdTextBold, {color: THEME.info}]}>
                {saleReturnProfit.toFixed(2)}
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tdText}>Expenses</Text>
              <Text style={[styles.tdTextBold, {color: THEME.danger}]}>
                -{expenses.toFixed(2)}
              </Text>
            </View>

            {/* Net Profit Row */}
            <View style={styles.netProfitRow}>
              <Text style={styles.netProfitLabel}>Net Profit</Text>
              <Text style={[styles.netProfitValue, {color: THEME.success}]}>
                {netProfit.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

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
    paddingBottom: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: THEME.primary,
  },
  headerContent: {
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
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
  },

  // --- FILTER SECTION ---
  filterSection: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 10,
    marginTop: -40,
    marginHorizontal: 16,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    zIndex: 1000,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  // --- REPORT SURFACE ---
  reportSurface: {
    backgroundColor: THEME.white,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    overflow: 'hidden',
  },
  summaryTable: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: THEME.rowHover,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  thText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textGray,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  tdText: {
    fontSize: 14,
    color: THEME.textDark,
  },
  tdTextBold: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  netProfitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F0FDF4', // Light green bg for net profit
    alignItems: 'center',
  },
  netProfitLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  netProfitValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
