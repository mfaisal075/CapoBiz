import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';

interface EmployeeInfo {
  sr: number;
  Invoice: number;
  Customer?: string;
  Date?: string;
  OrderTotal?: number;
  Discount?: number;
  TotalAmount?: number;
  Profit: number;

  Product?: string;
  returnDate?: string;
  QTY?: number;
  Price?: number;
  TotalPrice?: number;
}

interface InfoObject {
  [key: string]: EmployeeInfo[];

  Cup: EmployeeInfo[];
}

export default function SaleSaleReturnReport() {
  const {openDrawer} = useDrawer();

  const dateWiseInfo: EmployeeInfo[] = [
    {
      sr: 1,
      Invoice: 101,
      Customer: 'nm',
      Date: '999-000-00',
      OrderTotal: 88,
      Discount: 99,
      TotalAmount: 66,
      Profit: 55,
    },
    {
      sr: 2,
      Invoice: 101,
      Customer: 'nm',
      Date: '999-000-00',
      OrderTotal: 88,
      Discount: 99,
      TotalAmount: 66,
      Profit: 55,
    },
  ];

  const Info: InfoObject = {
    Cup: [
      {
        sr: 1,
        Invoice: 8,
        Product: 'jkj',
        returnDate: '999-0',
        QTY: 8,
        Price: 99,
        TotalPrice: 77,
        Profit: 55,
      },
      {
        sr: 2,
        Invoice: 8,
        Product: 'jkj',
        returnDate: '999-0',
        QTY: 8,
        Price: 99,
        TotalPrice: 77,
        Profit: 55,
      },
    ],
  };

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

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

  const selectionMode = 'allemployees';
  const currentCategory = '';

  const totalProducts =
    selectionMode === 'allemployees'
      ? Object.values(Info).reduce((acc, list) => acc + list.length, 0)
      : Info[currentCategory]?.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../../assets/screen.jpg')}
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
              source={require('../../../../assets/menu.png')}
              style={{width: 30, height: 30, tintColor: 'white'}}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={{color: 'white', fontSize: 22, fontWeight: 'bold'}}>
              Sale & Sale Return Report
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            marginLeft: 23,
            gap: 33,
            marginTop: 10,
          }}>
          {/* From Date */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 5,
              padding: 5,
            }}>
            <Text style={{color: 'white'}}>From:</Text>
            <Text style={{marginLeft: 10, color: 'white'}}>
              {`${startDate.toLocaleDateString()}`}
            </Text>
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
              <Image
                style={{
                  height: 20,
                  width: 20,
                  marginLeft: 10,
                  tintColor: 'white',
                }}
                source={require('../../../../assets/calendar.png')}
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

          {/* To Date */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 5,
              padding: 5,
            }}>
            <Text style={{color: 'white'}}>To:</Text>
            <Text style={{marginLeft: 10, color: 'white'}}>
              {`${endDate.toLocaleDateString()}`}
            </Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
              <Image
                style={{
                  height: 20,
                  width: 20,
                  marginLeft: 10,
                  tintColor: 'white',
                }}
                source={require('../../../../assets/calendar.png')}
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

        {/* Load Data Button */}
        <TouchableOpacity onPress={() => setDataLoaded(true)}>
          <View
            style={{
              height: 30,
              width: 300,
              backgroundColor: 'white',
              borderRadius: 12,
              margin: 10,
              alignSelf: 'center',
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: '#144272',
                marginTop: 5,
              }}>
              Load Data
            </Text>
          </View>
        </TouchableOpacity>

        {dataLoaded && (
          <>
            <ScrollView>
              <Text style={styles.sectionHeader}>Sale Profit</Text>
              <FlatList
                data={dateWiseInfo}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <View style={{padding: 5}}>
                    <View style={styles.table}>
                      <View style={styles.tablehead}>
                        <Text style={styles.invoiceText}>{item.Invoice}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <View style={styles.row}>
                          <Text style={styles.text}>Customer:</Text>
                          <Text style={styles.text}>{item.Customer}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Date:</Text>
                          <Text style={styles.text}>{item.Date}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Order Total:</Text>
                          <Text style={styles.text}>{item.OrderTotal}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Discount:</Text>
                          <Text style={styles.text}>{item.Discount}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Total Amount:</Text>
                          <Text style={styles.text}>{item.TotalAmount}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Profit:</Text>
                          <Text style={styles.text}>{item.Profit}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              />

              <Text style={styles.sectionHeader}>Sale Return</Text>
              <FlatList
                data={Info['Cup']}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <View style={{padding: 5}}>
                    <View style={styles.table}>
                      <View style={styles.tablehead}>
                        <Text style={styles.invoiceText}>{item.Invoice}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <View style={styles.row}>
                          <Text style={styles.text}>Product:</Text>
                          <Text style={styles.text}>{item.Product}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Return Date:</Text>
                          <Text style={styles.text}>{item.returnDate}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Quantity:</Text>
                          <Text style={styles.text}>{item.QTY}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Price:</Text>
                          <Text style={styles.text}>{item.Price}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Total Price:</Text>
                          <Text style={styles.text}>{item.TotalPrice}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Profit:</Text>
                          <Text style={styles.text}>{item.Profit}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              />

              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>
                  Total Sale: {Info['Cup'].length}
                </Text>
                <Text style={styles.totalText}>Total Sale Profit: 100</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 3,
                }}>
                <Text style={styles.totalText}>
                  Total Return: {dateWiseInfo.length}
                </Text>
                <Text style={styles.totalText}>Total Return Profit: 50</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 3,
                }}>
                <Text style={styles.totalText}>Total Net Profit:</Text>
                <Text style={styles.totalText}>{100 - 50}</Text>
              </View>
            </ScrollView>
          </>
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
  tablehead: {
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 5,
    borderTopLeftRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  exportBtn: {
    backgroundColor: '#144272',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  exportText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: 285,
  },
  totalContainer: {
    padding: 3,
    borderTopWidth: 1,
    borderTopColor: 'white',
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  sectionHeader: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  invoiceText: {
    color: '#144272',
    fontWeight: 'bold',
    marginLeft: 5,
    marginTop: 5,
  },
});
