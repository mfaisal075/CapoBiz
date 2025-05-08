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
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';

interface EmployeeInfo {
  sr: number;
  Invoice: number;
  ReturnDate: string;
  Product?: string;
  Qty: number;
  Price: number;
  TotalPrice: number;
}

interface InfoObject {
  [key: string]: EmployeeInfo[];

  Cup: EmployeeInfo[];
  'Chilli Milli': EmployeeInfo[];
  'Nab Lemon': EmployeeInfo[];
  'Flour E': EmployeeInfo[];
  'Kunafa Bar': EmployeeInfo[];
  'Pizza Jelly': EmployeeInfo[];
}

export default function SaleReturnReport() {
  const {openDrawer} = useDrawer();

  const dateWiseInfo: EmployeeInfo[] = [
    {
      sr: 1,
      Invoice: 101,
      ReturnDate: '05-05-2025',
      Product: 'Cup',
      Qty: 10,
      Price: 20,
      TotalPrice: 200,
    },
    {
      sr: 2,
      Invoice: 102,
      ReturnDate: '05-05-2025',
      Product: 'Kunafa Bar',
      Qty: 7,
      Price: 30,
      TotalPrice: 210,
    },
  ];

  const Info: InfoObject = {
    Cup: [
      {
        sr: 1,
        Invoice: 8,
        ReturnDate: '09-98',
        Qty: 5,
        Price: 47,
        TotalPrice: 89,
      },
    ],
    'Kunafa Bar': [
      {
        sr: 1,
        Invoice: 8,
        ReturnDate: '09-98',
        Qty: 5,
        Price: 47,
        TotalPrice: 89,
      },
    ],
    'Chilli Milli': [
      {
        sr: 1,
        Invoice: 8,
        ReturnDate: '09-98',
        Qty: 5,
        Price: 47,
        TotalPrice: 89,
      },
    ],
    'Flour E': [
      {
        sr: 1,
        Invoice: 8,
        ReturnDate: '09-98',
        Qty: 5,
        Price: 47,
        TotalPrice: 89,
      },
    ],
    'Pizza Jelly': [
      {
        sr: 1,
        Invoice: 8,
        ReturnDate: '09-98',
        Qty: 5,
        Price: 47,
        TotalPrice: 89,
      },
    ],
    'Nab Lemon': [
      {
        sr: 1,
        Invoice: 8,
        ReturnDate: '09-98',
        Qty: 5,
        Price: 47,
        TotalPrice: 89,
      },
    ],
  };

  const [category, setCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('Cup');

  const categoryItems = [
    {label: 'Cup', value: 'Cup'},
    {label: 'Chilli Milli', value: 'Chilli Milli'},
    {label: 'Pizza Jelly', value: 'Pizza Jelly'},
    {label: 'Flour E', value: 'Flour E'},
    {label: 'Kunafa Bar', value: 'Kunafa Bar'},
    {label: 'Nab Lemon', value: 'Nab Lemon'},
  ];

  const [selectionMode, setSelectionMode] = useState<
    'allemployees' | 'singleemployee' | ''
  >('');

  const totalProducts =
    selectionMode === 'allemployees'
      ? Object.values(Info).reduce((acc, list) => acc + list.length, 0)
      : Info[currentCategory]?.length || 0;

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
              Sale Return Report
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
        <DropDownPicker
          items={categoryItems}
          open={category}
          setOpen={setCategory}
          value={currentCategory}
          setValue={setCurrentCategory}
          placeholder="Select"
          disabled={selectionMode === 'allemployees'}
          placeholderStyle={{color: 'white'}}
          textStyle={{color: 'white'}}
          arrowIconStyle={{tintColor: 'white'}}
          style={[
            styles.dropdown,
            {borderColor: 'white', width: '88%', alignSelf: 'center'},
          ]}
          dropDownContainerStyle={{
            backgroundColor: 'white',
            borderColor: '#144272',
            width: '88%',
            marginLeft: 22,
          }}
          labelStyle={{color: 'white'}}
          listItemLabelStyle={{color: '#144272'}}
        />

        <View style={[styles.row, {marginTop: -6, marginLeft: 20}]}>
          <RadioButton
            value="allemployees"
            status={selectionMode === 'allemployees' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => {
              setSelectionMode('allemployees');
              setCurrentCategory('Select Employee');
            }}
          />
          <Text style={{color: 'white', marginTop: 7, marginLeft: -5}}>
            Date Wise Report
          </Text>
          <RadioButton
            value="singleemployee"
            color="white"
            uncheckedColor="white"
            status={
              selectionMode === 'singleemployee' ? 'checked' : 'unchecked'
            }
            onPress={() => {
              setSelectionMode('singleemployee');
              setCurrentCategory('');
            }}
          />
          <Text style={{color: 'white', marginTop: 7, marginLeft: -5}}>
            Product Wise Report
          </Text>
        </View>

        <ScrollView>
          {(selectionMode === 'allemployees' ||
            (selectionMode === 'singleemployee' && currentCategory)) && (
            <FlatList
              data={
                selectionMode === 'allemployees'
                  ? dateWiseInfo
                  : Info[currentCategory] || []
              }
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View style={{padding: 5}}>
                  <View style={styles.table}>
                    <View style={styles.tablehead}>
                      <Text
                        style={{
                          color: '#144272',
                          fontWeight: 'bold',
                          marginLeft: 5,
                          marginTop: 5,
                        }}>
                        {item.Invoice}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      {selectionMode === 'singleemployee' ? (
                        <>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <Text style={styles.text}>Return Date:</Text>
                            <Text style={styles.text}>{item.ReturnDate}</Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <Text style={styles.text}>Quantity:</Text>
                            <Text style={styles.text}>{item.Qty}</Text>
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
                              marginBottom: 5,
                            }}>
                            <Text style={styles.text}>Total Price:</Text>
                            <Text style={styles.text}>{item.TotalPrice}</Text>
                          </View>
                        </>
                      ) : (
                        <>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <Text style={styles.text}>Product:</Text>
                            <Text style={styles.text}>{item.Product}</Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <Text style={styles.text}>Return Date:</Text>
                            <Text style={styles.text}>{item.ReturnDate}</Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <Text style={styles.text}>Quantity:</Text>
                            <Text style={styles.text}>{item.Qty}</Text>
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
                              marginBottom: 5,
                            }}>
                            <Text style={styles.text}>Total Price:</Text>
                            <Text style={styles.text}>{item.TotalPrice}</Text>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              )}
            />
          )}

          {selectionMode === 'singleemployee' && !currentCategory && (
            <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
              Please select a category to view items.
            </Text>
          )}
        </ScrollView>

        {selectionMode !== '' && totalProducts > 0 && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total Records:{totalProducts}</Text>

            <Text style={styles.totalText}>Total Return: 8</Text>
          </View>
        )}
        {selectionMode !== '' && totalProducts > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 3,
            }}>
            <Text style={styles.totalText}>Total Amount:</Text>
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
    gap: 8,
    marginTop: 8,
  },
});
