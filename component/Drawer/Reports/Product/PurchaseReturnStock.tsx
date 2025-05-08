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
import React, { useState } from 'react';
import { useDrawer } from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type Product = {
  Invoice: number;
  Product: string;
  UOM: number;
  Qty: number;
  Price: number;
  TotalPrice: number;
  Company: string;
  Supplier: string;
  EntryDate: string; 
};

type InfoType = {
  [key: string]: Product[];
};

export default function PurchaseReturnStock() {
  const { openDrawer } = useDrawer();

  const Info: InfoType = {
    'Stock In': [
      {
        Invoice: 5,
        Product: 'stock in',
        UOM: 9,
        Qty: 8,
        Price: 88,
        TotalPrice: 890,
        Company: 'string',
        Supplier: 'string',
        EntryDate: '2025-08-24',
      },
      {
        Invoice: 5,
        Product: 'stock in',
        UOM: 9,
        Qty: 8,
        Price: 88,
        TotalPrice: 890,
        Company: 'string',
        Supplier: 'string',
        EntryDate: '2025-08-24',
      },
    ],
    'Stock Out': [
      {
        Invoice: 5,
        Product: 'stock out',
        UOM: 9,
        Qty: 8,
        Price: 88,
        TotalPrice: 890,
        Company: 'string',
        Supplier: 'string',
        EntryDate: '2025-08-24',
      },
    ],
  };

  const [category, setCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('Stock In');
  const [selectionMode, setSelectionMode] = useState<'Stock In' | 'Stock Out' | ''>('');

  const categoryItems = [
    { label: 'Stock In', value: 'Stock In' },
    { label: 'Stock Out', value: 'Stock Out' },
  ];

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  
  const filteredData =
    Info[currentCategory]?.filter(item => {
     
      return true; 
    }) || [];

  const totalProducts = filteredData.length;

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
              style={{ width: 30, height: 30, tintColor: 'white' }}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>
              Stock Movement
            </Text>
          </View>
        </View>

        <DropDownPicker
          items={categoryItems}
          open={category}
          setOpen={setCategory}
          value={currentCategory}
          setValue={val => {
            setCurrentCategory(val);
            setSelectionMode(val);
          }}
          placeholder="Stock In"
          placeholderStyle={{ color: 'white' }}
          textStyle={{ color: 'white' }}
          arrowIconStyle={{ tintColor: 'white' }}
          style={[
            styles.dropdown,
            { borderColor: 'white', width: '88%', alignSelf: 'center' },
          ]}
          dropDownContainerStyle={{
            backgroundColor: 'white',
            borderColor: '#144272',
            width: '88%',
            marginLeft: 22,
          }}
          labelStyle={{ color: 'white' }}
          listItemLabelStyle={{ color: '#144272' }}
        />

        <View style={{ flexDirection: 'row', marginLeft: 23, gap: 33,marginBottom:10 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 5,
              padding: 5,
            }}>
            <Text style={{ color: 'white' }}>From:</Text>
            <Text style={{ marginLeft: 10, color: 'white' }}>
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
            <Text style={{ color: 'white' }}>To:</Text>
            <Text style={{ marginLeft: 10, color: 'white' }}>
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

        <ScrollView>
          <View>
            <FlatList
              data={filteredData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <ScrollView
                  style={{
                    padding: 5,
                  }}>
                  <View style={styles.table}>
                    <View style={styles.tablehead}>
                      <Text
                        style={{
                          color: '#144272',
                          fontWeight: 'bold',
                          marginLeft: 5,
                          marginTop: 5,
                        }}>
                        {item.Product}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Invoice:</Text>
                        <Text style={styles.text}>{item.Invoice}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, { marginBottom: 5 }]}>
                          UOM:
                        </Text>
                        <Text style={[styles.value, { marginBottom: 5 }]}>
                          {item.UOM}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, { marginBottom: 5 }]}>
                          Quantity:
                        </Text>
                        <Text style={[styles.value, { marginBottom: 5 }]}>
                          {item.Qty}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Price:</Text>
                        <Text style={styles.text}>{item.Price}</Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Total Price:</Text>
                        <Text style={styles.text}>{item.TotalPrice}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Company:</Text>
                        <Text style={styles.text}>{item.Company}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Supplier:</Text>
                        <Text style={styles.text}>{item.Supplier}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom:5
                        }}>
                        <Text style={styles.text}>Entry Date:</Text>
                        <Text style={styles.text}>{item.EntryDate}</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
            />
          </View>
        </ScrollView>

        {selectionMode !== '' && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total Products:</Text>
            <Text style={styles.totalText}>{totalProducts}</Text>
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
    padding: 7,
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
    gap: 8,
    marginTop: 8,
  },

  value: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
});
