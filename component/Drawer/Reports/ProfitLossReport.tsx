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
import backgroundColors from '../../Colors';

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
            <Text style={styles.headerTitle}>Profit Loss Report</Text>
          </View>

          <TouchableOpacity style={[styles.headerBtn]} onPress={handlePrint}>
            <Icon name="printer" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Filter Section */}
          <View style={styles.filterContainer}>
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
                  <Icon
                    name="calendar"
                    size={18}
                    color={backgroundColors.dark}
                  />
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
                  <Icon
                    name="calendar"
                    size={18}
                    color={backgroundColors.dark}
                  />
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
            <Text style={styles.summaryTitle}>Profit & Loss Report</Text>

            <Image
              source={require('../../../assets/profit_loss.png')}
              resizeMode="contain"
              style={styles.profitLossPng}
            />

            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>HEADS</Text>
              <Text style={styles.cardTitle}>AMOUNT</Text>
            </View>
            <View style={styles.summaryInnerCard}>
              <Text style={styles.innerCardTitle}>Sale Profit</Text>
              <Text
                style={[styles.innerCardTitle, {color: backgroundColors.info}]}>
                {saleProfit.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryInnerCard}>
              <Text style={styles.innerCardTitle}>Sale Return Profit</Text>
              <Text
                style={[styles.innerCardTitle, {color: backgroundColors.info}]}>
                {saleReturnProfit.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryInnerCard}>
              <Text style={styles.innerCardTitle}>Expenses</Text>
              <Text
                style={[
                  styles.innerCardTitle,
                  {color: backgroundColors.danger},
                ]}>
                {expenses.toFixed(2)}
              </Text>
            </View>
            <View
              style={[
                styles.summaryInnerCard,
                {borderBottomWidth: 0, marginBottom: 50},
              ]}>
              <Text style={styles.innerCardTitle}>Net Profit</Text>
              <Text
                style={[
                  styles.innerCardTitle,
                  {color: backgroundColors.success},
                ]}>
                {netProfit.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={{height: 50}} />
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
  },

  scrollContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },

  // Filter Container
  filterContainer: {
    backgroundColor: backgroundColors.light,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 4,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  datePicker: {
    width: '48%',
  },
  dateLabel: {
    color: backgroundColors.dark,
    fontWeight: '600',
    marginBottom: 5,
    fontSize: 14,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    height: 48,
  },
  dateText: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '500',
  },

  // Summary Container
  summaryContainer: {
    backgroundColor: backgroundColors.light,
    borderRadius: 14,
    marginVertical: 5,
    padding: 10,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: backgroundColors.dark,
    textAlign: 'center',
  },
  profitLossPng: {
    width: 250,
    height: 250,

    alignSelf: 'center',
  },
  summaryCard: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryInnerCard: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.6,
    borderBottomColor: '#999',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: backgroundColors.dark,
  },
  innerCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
  },
});
