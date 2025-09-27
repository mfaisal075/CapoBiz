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
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPrint from 'react-native-print';
import Toast from 'react-native-toast-message';

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

export default function DayBook() {
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
            <Text style={styles.headerTitle}>Day Book</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} onPress={handlePrint}>
            <Icon name="printer" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Date Picker Section */}
        <View style={styles.datePickerContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowStartDatePicker(true)}
            style={styles.datePickerButton}>
            <Icon name="calendar" size={20} color="white" />
            <Text style={styles.dateText}>
              {startDate.toLocaleDateString()}
            </Text>
            <Icon name="chevron-down" size={20} color="white" />
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

        <ScrollView style={styles.scrollContainer}>
          {dayBook ? (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Daily Summary</Text>

              {/* Sales Card */}
              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Icon name="cart" size={24} color="#4CAF50" />
                  <Text style={styles.cardTitle}>Sales</Text>
                </View>
                <Text style={styles.cardValue}>
                  Rs. {dayBook.sale.toFixed(2)}
                </Text>
              </View>

              {/* Sale Return Card */}
              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Icon name="cart-arrow-up" size={24} color="#FF5722" />
                  <Text style={styles.cardTitle}>Sale Return</Text>
                </View>
                <Text style={styles.cardValue}>
                  Rs. {dayBook.sale_return.toFixed(2)}
                </Text>
              </View>

              {/* Purchase Card */}
              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Icon name="shopping" size={24} color="#2196F3" />
                  <Text style={styles.cardTitle}>Purchase</Text>
                </View>
                <Text style={styles.cardValue}>
                  Rs. {dayBook.purchase.toFixed(2)}
                </Text>
              </View>

              {/* Purchase Return Card */}
              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Icon name="shopping-outline" size={24} color="#FF9800" />
                  <Text style={styles.cardTitle}>Purchase Return</Text>
                </View>
                <Text style={styles.cardValue}>
                  Rs. {dayBook.purchase_return.toFixed(2)}
                </Text>
              </View>

              {/* Daily Expense Card */}
              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Icon name="cash-minus" size={24} color="#F44336" />
                  <Text style={styles.cardTitle}>Daily Expense</Text>
                </View>
                <Text style={styles.cardValue}>
                  Rs. {dayBook.exp.toFixed(2)}
                </Text>
              </View>

              {/* Customer Payables Card */}
              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Icon name="account-arrow-left" size={24} color="#9C27B0" />
                  <Text style={styles.cardTitle}>All Customer Payables</Text>
                </View>
                <Text style={styles.cardValue}>
                  Rs. {dayBook.customerpayable.toFixed(2)}
                </Text>
              </View>

              {/* Customer Receivables Card */}
              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Icon name="account-arrow-right" size={24} color="#00BCD4" />
                  <Text style={styles.cardTitle}>All Customer Receivables</Text>
                </View>
                <Text style={styles.cardValue}>
                  Rs. {dayBook.customerreceiveable.toFixed(2)}
                </Text>
              </View>

              {/* Supplier Payables Card */}
              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Icon
                    name="truck-delivery-outline"
                    size={24}
                    color="#795548"
                  />
                  <Text style={styles.cardTitle}>All Supplier Payables</Text>
                </View>
                <Text style={styles.cardValue}>
                  Rs. {dayBook.supplierpayable.toFixed(2)}
                </Text>
              </View>

              {/* Supplier Receivables Card */}
              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Icon name="truck-delivery" size={24} color="#607D8B" />
                  <Text style={styles.cardTitle}>All Supplier Receivables</Text>
                </View>
                <Text style={styles.cardValue}>
                  Rs. {dayBook.supplierreceivable.toFixed(2)}
                </Text>
              </View>

              {/* Income & Expense Summary Cards */}
              <View style={styles.incomeExpenseContainer}>
                {/* Income Card */}
                <View style={[styles.summaryCard, styles.incomeCard]}>
                  <View style={styles.cardHeader}>
                    <Icon name="trending-up" size={24} color="#4CAF50" />
                    <Text style={[styles.cardTitle, styles.incomeExpenseTitle]}>
                      Income
                    </Text>
                  </View>
                  <Text style={[styles.cardValue, styles.incomeExpenseValue]}>
                    Rs. {parseFloat(dayBook.income).toFixed(2)}
                  </Text>
                </View>

                {/* Expense Card */}
                <View style={[styles.summaryCard, styles.expenseCard]}>
                  <View style={styles.cardHeader}>
                    <Icon name="trending-down" size={24} color="#F44336" />
                    <Text style={[styles.cardTitle, styles.incomeExpenseTitle]}>
                      Expense
                    </Text>
                  </View>
                  <Text style={[styles.cardValue, styles.incomeExpenseValue]}>
                    Rs. {parseFloat(dayBook.expense).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Icon
                name="file-document-outline"
                size={64}
                color="rgba(255,255,255,0.5)"
              />
              <Text style={styles.noDataText}>No data found for this date</Text>
            </View>
          )}

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
  datePickerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
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
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#144272',
    textAlign: 'right',
  },
  incomeExpenseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  incomeCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  expenseCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#F44336',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  incomeExpenseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  incomeExpenseValue: {
    fontSize: 16,
  },
  noDataContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 40,
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  noDataText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 16,
    textAlign: 'center',
  },
});
