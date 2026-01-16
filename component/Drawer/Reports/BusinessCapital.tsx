import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Platform,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPrint from 'react-native-print';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import {BackHandler} from 'react-native';
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

interface Capital {
  stockvalue: number;
  cashinhand: string;
  customerReceiveable: number;
  customerPayable: number;
  supplierReceiveable: number;
  supplierPayable: number;
  business_capital: number;
}

export default function BusinessCapital({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
  const [capital, setCapital] = useState<Capital | null>(null);

  // Fetch Capital
  const fetchCapital = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcapital`);
      setCapital(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Handle Print
  const handlePrint = async () => {
    if (!capital) {
      Toast.show({
        type: 'error',
        text1: 'No data found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const dateStr = new Date().toLocaleDateString();
    const stockValue = capital.stockvalue.toFixed(2);
    const cashInHand = capital.cashinhand;
    const customerReceivables = capital.customerReceiveable.toFixed(2);
    const customerPayables = capital.customerPayable.toFixed(2);
    const supplierReceivables = capital.supplierReceiveable.toFixed(2);
    const supplierPayables = capital.supplierPayable.toFixed(2);
    const businessCapital = capital.business_capital.toFixed(2);

    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Business Capital Report</title>
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
              Business Capital Report
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
                <td style="border:1px solid #000; padding:8px;">Current Stock Value</td>
                <td style="border:1px solid #000; padding:8px; text-align:right;">${stockValue}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000; padding:8px;">Cash In Hand</td>
                <td style="border:1px solid #000; padding:8px; text-align:right;">${cashInHand}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000; padding:8px;">Customer Receivables</td>
                <td style="border:1px solid #000; padding:8px; text-align:right;">${customerReceivables}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000; padding:8px;">Customer Payables</td>
                <td style="border:1px solid #000; padding:8px; text-align:right;">${customerPayables}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000; padding:8px;">Supplier Receivables</td>
                <td style="border:1px solid #000; padding:8px; text-align:right;">${supplierReceivables}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000; padding:8px;">Supplier Payables</td>
                <td style="border:1px solid #000; padding:8px; text-align:right;">${supplierPayables}</td>
              </tr>
              <tr style="background:#f0f0f0; font-weight:bold;">
                <td style="border:1px solid #000; padding:8px;">Total Business Capital</td>
                <td style="border:1px solid #000; padding:8px; text-align:right;">${businessCapital}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    await RNPrint.print({html});
  };

  useEffect(() => {
    fetchCapital();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, []);

  function formatNumber(num?: number | string): string {
    if (num === undefined || num === null || num === '') return '0.00';

    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0.00';
    return n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Helper to render rows safely
  const renderRow = (
    label: string,
    value: number | string | undefined,
    isLast: boolean = false,
  ) => (
    <View style={[styles.tableRow, isLast && {borderBottomWidth: 0}]}>
      <View style={{flex: 1}}>
        <Text style={styles.cellLabel}>{label}</Text>
      </View>
      <View>
        <Text style={styles.cellValue}>{formatNumber(value)}</Text>
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
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Business Capital</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* --- NET CAPITAL SURFACE (Fixed Overlap) --- */}
      <View style={styles.surface}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Net Business Capital</Text>
          <Text style={styles.summaryValue}>
            {formatNumber(capital?.business_capital)}
          </Text>
        </View>
        <View style={styles.separator} />
        <Text style={styles.surfaceSubText}>
          Includes all assets and liabilities.
        </Text>
      </View>

      {/* --- CONTENT --- */}
      <View style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={{paddingBottom: 100}}
          showsVerticalScrollIndicator={false}>
          {/* --- ASSETS TABLE --- */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Assets (What you own)</Text>
            <View style={styles.tableSurface}>
              {renderRow('Current Stock Value', capital?.stockvalue)}
              {renderRow('Cash In Hand', capital?.cashinhand)}
              {renderRow('Supplier Receivables', capital?.supplierReceiveable)}
              {renderRow('Supplier Payables', capital?.supplierPayable, true)}
            </View>
          </View>

          {/* --- LIABILITIES TABLE --- */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Liabilities (What you owe)</Text>
            <View style={styles.tableSurface}>
              {renderRow('Customer Receivables', capital?.customerReceiveable)}
              {renderRow('Customer Payables', capital?.customerPayable, true)}
            </View>
          </View>
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

  // --- SURFACE ---
  surface: {
    backgroundColor: THEME.white,
    marginHorizontal: 16,
    marginTop: -30, // Floating overlap effect
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    zIndex: 1000,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: THEME.textGray,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  separator: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 12,
  },
  surfaceSubText: {
    fontSize: 12,
    color: THEME.textGray,
    fontStyle: 'italic',
  },

  // --- SECTIONS ---
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  tableSurface: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cellLabel: {
    fontSize: 14,
    color: THEME.textGray,
    fontWeight: '500',
  },
  cellValue: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
  },
});
