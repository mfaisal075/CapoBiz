import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  BackHandler,
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
import backgroundColors from '../../Colors';

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
            <Text style={styles.headerTitle}>Day Book</Text>
          </View>

          <TouchableOpacity style={[styles.headerBtn]} onPress={handlePrint}>
            <Icon name="printer" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Date Picker Section */}
        <View style={styles.datePickerContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowStartDatePicker(true)}
            style={styles.datePickerButton}>
            <Text style={styles.dateText}>
              Date: {startDate.toLocaleDateString()}
            </Text>
            <Icon name="calendar" size={20} color={backgroundColors.dark} />
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
            <>
              <View
                style={[
                  styles.summaryContainer,
                  {backgroundColor: '#28a7461d'},
                ]}>
                {/* Income Section */}
                <Text style={styles.summaryTitle}>Income</Text>

                <View style={styles.subContainer}>
                  <View style={styles.iconContainer}>
                    <Icon
                      name="cart"
                      size={16}
                      color={backgroundColors.light}
                    />
                  </View>

                  <View style={styles.valueContainer}>
                    <Text style={styles.label}>Sales</Text>
                    <Text style={styles.value}>
                      {formatNumber(dayBook.sale)}
                    </Text>
                  </View>
                </View>

                <View style={styles.subContainer}>
                  <View style={styles.iconContainer}>
                    <Icon
                      name="clipboard-arrow-left"
                      size={16}
                      color={backgroundColors.light}
                    />
                  </View>

                  <View style={styles.valueContainer}>
                    <Text style={styles.label}>Purchase Return</Text>
                    <Text style={styles.value}>
                      {formatNumber(dayBook.purchase_return)}
                    </Text>
                  </View>
                </View>

                <View style={styles.subContainer}>
                  <View style={styles.iconContainer}>
                    <Icon
                      name="cash"
                      size={16}
                      color={backgroundColors.light}
                    />
                  </View>

                  <View style={styles.valueContainer}>
                    <Text style={styles.label}>All Customer Receivables</Text>
                    <Text style={styles.value}>
                      {formatNumber(dayBook.customerreceiveable)}
                    </Text>
                  </View>
                </View>

                <View style={styles.subContainer}>
                  <View style={styles.iconContainer}>
                    <Icon
                      name="account-cash"
                      size={16}
                      color={backgroundColors.light}
                    />
                  </View>

                  <View style={styles.valueContainer}>
                    <Text style={styles.label}>All Supplier Payables</Text>
                    <Text style={styles.value}>
                      {formatNumber(dayBook.supplierpayable)}
                    </Text>
                  </View>
                </View>

                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total Income</Text>
                  <Text style={styles.totalValue}>
                    {formatNumber(dayBook.income)}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.summaryContainer,
                  {backgroundColor: '#dc35461f'},
                ]}>
                {/* Income Section */}
                <Text style={styles.summaryTitle}>Expense</Text>

                <View style={styles.subContainer}>
                  <View style={styles.expIconContainer}>
                    <Icon
                      name="cart-plus"
                      size={16}
                      color={backgroundColors.light}
                    />
                  </View>

                  <View style={styles.valueContainer}>
                    <Text style={styles.label}>Purchase</Text>
                    <Text style={styles.value}>
                      {formatNumber(dayBook.purchase)}
                    </Text>
                  </View>
                </View>

                <View style={styles.subContainer}>
                  <View style={styles.expIconContainer}>
                    <Icon
                      name="clipboard-arrow-left"
                      size={16}
                      color={backgroundColors.light}
                    />
                  </View>

                  <View style={styles.valueContainer}>
                    <Text style={styles.label}>Sale Return</Text>
                    <Text style={styles.value}>
                      {formatNumber(dayBook.sale_return)}
                    </Text>
                  </View>
                </View>

                <View style={styles.subContainer}>
                  <View style={styles.expIconContainer}>
                    <Icon
                      name="cash-minus"
                      size={16}
                      color={backgroundColors.light}
                    />
                  </View>

                  <View style={styles.valueContainer}>
                    <Text style={styles.label}>Daily Expense</Text>
                    <Text style={styles.value}>
                      {formatNumber(dayBook.exp)}
                    </Text>
                  </View>
                </View>

                <View style={styles.subContainer}>
                  <View style={styles.expIconContainer}>
                    <Icon
                      name="account-cash"
                      size={16}
                      color={backgroundColors.light}
                    />
                  </View>

                  <View style={styles.valueContainer}>
                    <Text style={styles.label}>All Customer Payables</Text>
                    <Text style={styles.value}>
                      {formatNumber(dayBook.customerpayable)}
                    </Text>
                  </View>
                </View>

                <View style={styles.subContainer}>
                  <View style={styles.expIconContainer}>
                    <Icon
                      name="account-cash"
                      size={16}
                      color={backgroundColors.light}
                    />
                  </View>

                  <View style={styles.valueContainer}>
                    <Text style={styles.label}>All Supplier Receivables</Text>
                    <Text style={styles.value}>
                      {formatNumber(dayBook.supplierreceivable)}
                    </Text>
                  </View>
                </View>

                <View style={styles.totalContainer}>
                  <Text style={styles.expTotalLabel}>Total Expense</Text>
                  <Text style={styles.expTotalValue}>
                    {formatNumber(dayBook.expense)}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Icon
                name="file-document-outline"
                size={64}
                color="rgba(0,0,0,0.5)"
              />
              <Text style={styles.noDataText}>No data found for this date</Text>
            </View>
          )}

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

  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 10,
  },
  datePickerButton: {
    width: '100%',
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
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  scrollContainer: {
    flex: 1,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 0,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.dark,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: backgroundColors.dark,
    marginBottom: 10,
  },
  value: {
    fontSize: 16,
    color: backgroundColors.dark,
    marginBottom: 10,
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: backgroundColors.primary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: backgroundColors.primary,
  },
  expTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: backgroundColors.danger,
  },
  expTotalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: backgroundColors.danger,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: backgroundColors.dark,
    borderRadius: 100,
    marginRight: 10,
  },
  expIconContainer: {
    padding: 8,
    backgroundColor: backgroundColors.dark,
    borderRadius: 100,
    marginRight: 10,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    borderBottomWidth: 0.2,
    borderBottomColor: backgroundColors.dark,
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
