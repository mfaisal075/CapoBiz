import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
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

interface ProfitLoss {
  expences: string;
  profit: string;
  salereturnprofit: string;
}

export default function ProfitLossReport() {
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

    await RNPrint.print({html});
  };

  useEffect(() => {
    fetchProfitLossData();
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
            <Text style={styles.headerTitle}>Profit Loss Report</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} onPress={handlePrint}>
            <Icon name="printer" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Filter Section */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Select Date Range</Text>

            {/* Date Pickers */}
            <View style={styles.dateContainer}>
              <View style={styles.datePicker}>
                <Text style={styles.dateLabel}>From:</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}>
                  <Text style={styles.dateText}>
                    {startDate.toLocaleDateString()}
                  </Text>
                  <Icon name="calendar" size={18} color="#144272" />
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

              <View style={styles.datePicker}>
                <Text style={styles.dateLabel}>To:</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}>
                  <Text style={styles.dateText}>
                    {endDate.toLocaleDateString()}
                  </Text>
                  <Icon name="calendar" size={18} color="#144272" />
                </TouchableOpacity>
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
            </View>
          </View>

          {/* Profit Loss Summary Cards */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Financial Summary</Text>

            {/* Sale Profit Card */}
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <Icon name="trending-up" size={24} color="#4CAF50" />
                <Text style={styles.cardTitle}>Sale Profit</Text>
              </View>
              <Text style={styles.cardValue}>Rs. {saleProfit.toFixed(2)}</Text>
            </View>

            {/* Sale Return Loss Card */}
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <Icon name="undo" size={24} color="#FF9800" />
                <Text style={styles.cardTitle}>Sale Return Profit</Text>
              </View>
              <Text style={[styles.cardValue]}>
                Rs. {saleReturnProfit.toFixed(2)}
              </Text>
            </View>

            {/* Expenses Card */}
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <Icon name="cash-minus" size={24} color="#F44336" />
                <Text style={styles.cardTitle}>Expenses</Text>
              </View>
              <Text style={[styles.cardValue]}>Rs. {expenses.toFixed(2)}</Text>
            </View>

            {/* Net Profit Card */}
            <View style={[styles.summaryCard, styles.netProfitCard]}>
              <View style={styles.cardHeader}>
                <Icon name={'cash-check'} size={24} color={'#4CAF50'} />
                <Text style={[styles.cardTitle, styles.netProfitTitle]}>
                  Net Profit
                </Text>
              </View>
              <Text style={[styles.cardValue]}>Rs. {netProfit}</Text>
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

  // Filter Container
  filterContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 15,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePicker: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    color: '#144272',
    fontWeight: '600',
    marginBottom: 5,
    fontSize: 14,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  dateText: {
    color: '#144272',
    fontSize: 14,
    fontWeight: '500',
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
  netProfitCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
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
  netProfitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#144272',
    textAlign: 'right',
  },
});
