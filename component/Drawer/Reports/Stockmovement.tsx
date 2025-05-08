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
import {useDrawer} from '../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';

interface EmployeeInfo {
  Sr: number;
  Invoive: number;
  Product: string;
  Quantity: number;
  CostPrice: number;
  TotalCost: number;
  StockStatus: string;
  Date: string;
}

export default function Stockmovement() {
  const {openDrawer} = useDrawer();

  const dateWiseInfo: EmployeeInfo[] = [
    {
      Sr: 1,
      Invoive: 77,
      Product: 'jelly',
      Quantity: 4,
      CostPrice: 77,
      TotalCost: 88,
      StockStatus: 'pending',
      Date: '78-00-99',
    },
  ];

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
              Stock Movement
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
                source={require('../../../assets/calendar.png')}
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
              <FlatList
                data={dateWiseInfo}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <View style={{padding: 5}}>
                    <View style={styles.table}>
                      <View style={styles.tablehead}>
                        <Text style={styles.invoiceText}>{item.Product}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <View style={styles.row}>
                          <Text style={styles.text}>Invoice:</Text>
                          <Text style={styles.text}>{item.Invoive}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Quantity:</Text>
                          <Text style={styles.text}>{item.Quantity}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Cost Price:</Text>
                          <Text style={styles.text}>{item.CostPrice}</Text>
                        </View>

                        <View style={styles.row}>
                          <Text style={styles.text}>Total Cost:</Text>
                          <Text style={styles.text}>{item.TotalCost}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Stock Status:</Text>
                          <Text style={styles.text}>{item.StockStatus}</Text>
                        </View>
                        <View style={[styles.row, {marginBottom: 5}]}>
                          <Text style={styles.text}>Date:</Text>
                          <Text style={styles.text}>{item.Date}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              />
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
  lastrow: {
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderBottomEndRadius: 5,
    borderBottomLeftRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
