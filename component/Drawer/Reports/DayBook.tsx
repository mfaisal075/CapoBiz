import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';

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
  const {token} = useUser();
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

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../../assets/menu.png')}
              style={{width: 30, height: 30, tintColor: 'white'}}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={{color: 'white', fontSize: 22, fontWeight: 'bold'}}>
              Day Book
            </Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowStartDatePicker(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 5,
              padding: 5,
              height: 38,
              width: '100%',
            }}>
            <Text style={{marginLeft: 10, color: 'white'}}>
              {`${startDate.toLocaleDateString()}`}
            </Text>
            <Image
              style={{
                height: 20,
                width: 20,
                marginLeft: 10,
                tintColor: 'white',
              }}
              source={require('../../../assets/calendar.png')}
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

        {dayBook ? (
          <View style={{padding: 5, marginTop: 10}}>
            <View style={styles.table}>
              <View style={styles.infoRow}>
                <View style={styles.row}>
                  <Text style={styles.text}>Sales:</Text>
                  <Text style={styles.text}>{dayBook.sale.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.text}>Sale Return:</Text>
                  <Text style={styles.text}>
                    {dayBook.sale_return.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.text}>Purchase:</Text>
                  <Text style={styles.text}>{dayBook.purchase.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.text}>Purchase Return:</Text>
                  <Text style={styles.text}>
                    {dayBook.purchase_return.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.text}>Daily Expense:</Text>
                  <Text style={styles.text}>{dayBook.exp.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.text}>All Customer Payables:</Text>
                  <Text style={styles.text}>
                    {dayBook.customerpayable.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.text}>All Customer Receivables:</Text>
                  <Text style={styles.text}>
                    {dayBook.customerreceiveable.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.text}>All Supplier Payables:</Text>
                  <Text style={styles.text}>
                    {dayBook.supplierpayable.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.text}>All Supplier Receivables:</Text>
                  <Text style={styles.text}>
                    {dayBook.supplierreceivable.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.lastRow}>
                  <Text style={styles.incomeExpenseText}>
                    Income: {parseFloat(dayBook.income).toFixed(2)}
                  </Text>
                  <Text style={styles.incomeExpenseText}>
                    Expanse: {parseFloat(dayBook.expense).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={{
              width: '100%',
              height: 300,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>
              No data found.
            </Text>
          </View>
        )}
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
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 'auto',
    width: 314,
    borderRadius: 5,
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  lastrow: {
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderBottomEndRadius: 5,
    borderBottomLeftRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
  },
  lastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
  },
  incomeExpenseText: {
    color: '#144272',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
