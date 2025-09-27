import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPrint from 'react-native-print';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';

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

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Business Capital</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} onPress={handlePrint}>
            <Icon name="printer" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Business Capital Summary Cards */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Capital Summary</Text>

            {/* Stock Value Card */}
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <Icon name="package-variant" size={24} color="#2196F3" />
                <Text style={styles.cardTitle}>Current Stock Value</Text>
              </View>
              <Text style={styles.cardValue}>
                Rs. {capital?.stockvalue.toFixed(2) ?? '0.00'}
              </Text>
            </View>

            {/* Cash In Hand Card */}
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <Icon name="cash" size={24} color="#4CAF50" />
                <Text style={styles.cardTitle}>Cash In Hand</Text>
              </View>
              <Text style={styles.cardValue}>
                Rs. {capital?.cashinhand ?? '0.00'}
              </Text>
            </View>

            {/* Customer Receivables Card */}
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <Icon name="account-arrow-right" size={24} color="#FF9800" />
                <Text style={styles.cardTitle}>Customer Receivables</Text>
              </View>
              <Text style={styles.cardValue}>
                Rs. {capital?.customerReceiveable.toFixed(2) ?? '0.00'}
              </Text>
            </View>

            {/* Customer Payables Card */}
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <Icon name="account-arrow-left" size={24} color="#F44336" />
                <Text style={styles.cardTitle}>Customer Payables</Text>
              </View>
              <Text style={styles.cardValue}>
                Rs. {capital?.customerPayable.toFixed(2) ?? '0.00'}
              </Text>
            </View>

            {/* Supplier Receivables Card */}
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <Icon name="truck-delivery" size={24} color="#9C27B0" />
                <Text style={styles.cardTitle}>Supplier Receivables</Text>
              </View>
              <Text style={styles.cardValue}>
                Rs. {capital?.supplierReceiveable.toFixed(2) ?? '0.00'}
              </Text>
            </View>

            {/* Supplier Payables Card */}
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <Icon name="truck-delivery-outline" size={24} color="#795548" />
                <Text style={styles.cardTitle}>Supplier Payables</Text>
              </View>
              <Text style={styles.cardValue}>
                Rs. {capital?.supplierPayable.toFixed(2) ?? '0.00'}
              </Text>
            </View>

            {/* Total Business Capital Card */}
            <View style={[styles.summaryCard, styles.totalCapitalCard]}>
              <View style={styles.cardHeader}>
                <Icon name="bank" size={24} color="#4CAF50" />
                <Text style={[styles.cardTitle, styles.totalCapitalTitle]}>
                  Total Business Capital
                </Text>
              </View>
              <Text style={[styles.cardValue, styles.totalCapitalValue]}>
                Rs. {capital?.business_capital.toFixed(2) ?? '0.00'}
              </Text>
            </View>
          </View>

          <View style={{height: 50}} />
        </ScrollView>

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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Summary Container
  summaryContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
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
    color: '#144272',
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
    color: '#144272',
    textAlign: 'right',
  },
  totalCapitalValue: {
    fontSize: 20,
    color: '#4CAF50',
  },
});
