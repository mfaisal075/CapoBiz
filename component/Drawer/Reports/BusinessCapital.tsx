import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPrint from 'react-native-print';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import backgroundColors from '../../Colors';

interface Capital {
  stockvalue: number;
  cashinhand: string;
  customerReceiveable: number;
  customerPayable: number;
  supplierReceiveable: number;
  supplierPayable: number;
  business_capital: number;
}

export default function BusinessCapital() {
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
  }, []);

  function formatNumber(num?: number | string): string {
    if (num === undefined || num === null || num === '') return '0.00';

    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0.00';

    const abs = Math.abs(n);

    if (abs >= 1e33) {
      return (n / 1e33).toFixed(n % 1e33 === 0 ? 0 : 2) + 'Dec';
    } else if (abs >= 1000000000000000) {
      return (n / 1000000000000000).toFixed(n % 1000000000000000 === 0 ? 0 : 2) + 'Q';
    } else if (abs >= 1000000000000) {
      return (n / 1000000000000).toFixed(n % 1000000000000 === 0 ? 0 : 2) + 'T';
    } else if (abs >= 1000000000) {
      return (n / 1000000000).toFixed(n % 1000000000 === 0 ? 0 : 2) + 'B';
    } else if (abs >= 10000000) {
      return (n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 2) + 'Cr';
    } else if (abs >= 100000) {
      return (n / 100000).toFixed(n % 100000 === 0 ? 0 : 2) + 'L';
    } else if (abs >= 1000) {
      return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 2) + 'K';
    } else {
      return n.toFixed(2);
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
            <Text style={styles.headerTitle}>Business Capital</Text>
          </View>

          <TouchableOpacity style={[styles.headerBtn]} onPress={handlePrint}>
            <Icon name="printer" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.netCapitalCtr}>
          <View>
            <Text style={styles.busCapTitle}>Net Business Capital</Text>
            <Text style={styles.businessCapText}>
              {formatNumber(capital?.business_capital) ?? '0.00'}
            </Text>
          </View>
          <Image
            source={require('../../../assets/money.png')}
            style={styles.busCapitalImg}
          />
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Business Capital Summary Cards */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Assets (What you own)</Text>

            <View style={styles.summaryCard}>
              <View
                style={{
                  borderLeftColor: backgroundColors.info,
                  borderLeftWidth: 2,
                }}>
                <Text style={styles.cardTitle}>Current Stock Value</Text>
                <Text style={styles.cardValue}>
                  {formatNumber(capital?.stockvalue) ?? '0.00'}
                </Text>
              </View>
              <View
                style={{
                  borderLeftColor: backgroundColors.info,
                  borderLeftWidth: 2,
                  marginLeft: 10,
                }}>
                <Text style={styles.cardTitle}>Supplier Payables</Text>
                <Text style={styles.cardValue}>
                  {formatNumber(capital?.supplierPayable) ?? '0.00'}
                </Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View
                style={{
                  borderLeftColor: backgroundColors.info,
                  borderLeftWidth: 2,
                }}>
                <Text style={styles.cardTitle}>Cash In Hand</Text>
                <Text style={styles.cardValue}>
                  {formatNumber(capital?.cashinhand) ?? '0.00'}
                </Text>
              </View>
              <View
                style={{
                  borderLeftColor: backgroundColors.info,
                  borderLeftWidth: 2,
                  marginLeft: 10,
                }}>
                <Text style={styles.cardTitle}>Supplier Receivables</Text>
                <Text style={styles.cardValue}>
                  {formatNumber(capital?.supplierReceiveable) ?? '0.00'}
                </Text>
              </View>
            </View>

            <Text style={[styles.summaryTitle, {marginTop: 12}]}>
              Liabilities (What you owe)
            </Text>

            <View style={styles.summaryCard}>
              <View
                style={{
                  borderLeftColor: backgroundColors.warning,
                  borderLeftWidth: 2,
                }}>
                <Text style={styles.cardTitle}>Customer Receivables</Text>
                <Text style={styles.cardValue}>
                  {formatNumber(capital?.customerReceiveable) ?? '0.00'}
                </Text>
              </View>
              <View
                style={{
                  borderLeftColor: backgroundColors.warning,
                  borderLeftWidth: 2,
                }}>
                <Text style={styles.cardTitle}>Customer Payables</Text>
                <Text style={styles.cardValue}>
                  {formatNumber(capital?.customerPayable) ?? '0.00'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <Toast />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.gray,
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
    backgroundColor: backgroundColors.primary,
  },

  scrollContainer: {
    marginTop: '20%',
    backgroundColor: backgroundColors.gray,
    borderTopRightRadius: 14,
    borderTopLeftRadius: 14,
  },

  // Net Capital Container
  netCapitalCtr: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    left: 12,
    top: 80,
    height: 160,
    width: '94%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: backgroundColors.light,
    borderRadius: 14,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
    zIndex: 1,
  },

  // Summary Container
  summaryContainer: {
    backgroundColor: backgroundColors.gray,
    borderRadius: 14,
    padding: 10,
  },
  busCapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: backgroundColors.primary,
    marginBottom: 10,
  },
  summaryTitle: {
    marginTop: 90,
    marginHorizontal: 15,
    color: backgroundColors.dark,
    fontSize: 18,
    fontWeight: '600',
    borderBottomColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1.5,
    paddingBottom: 8,
  },
  businessCapText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: backgroundColors.dark,
  },
  busCapitalImg: {
    height: 80,
    width: 80,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    backgroundColor: backgroundColors.light,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  totalCapitalCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.6)',
    marginLeft: 8,
  },
  totalCapitalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.dark,
    marginLeft: 8,
    marginTop: 4,
  },
  totalCapitalValue: {
    fontSize: 20,
    color: '#4CAF50',
  },
});
