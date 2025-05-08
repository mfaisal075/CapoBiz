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
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';

type Product = {
  sr: number;
  date: string;
  addedby: string;
  note: string;
  amount: number;
  category?: string;
};

type InfoType = {
  [key: string]: Product[];
};

export default function ExpenseReport() {
    
  const {openDrawer} = useDrawer();

  const Info: InfoType = {
    'Select Category': [
      {
        sr: 1,
        date: '0-0-0',
        addedby: 'jhk',
        note: 'kio',
        amount: 9,
        category: 'bbn',
      },
    ],
    Rent: [
      {
        sr: 1,
        date: '0-0-0',
        addedby: 'rent',
        note: 'kio',
        amount: 9,
      },
    ],
    'Internet Bill': [
      {
        sr: 1,
        date: '0-0-0',
        addedby: 'bill',
        note: 'kio',
        amount: 9,
      },
    ],
  };

  const [category, setCategory] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<string>('Rent');

  const categoryItems = [
    {label: 'Rent', value: 'Rent'},
    {label: 'Internet Bil', value: 'Internet Bill'},
  ];

  const [selectionMode, setSelectionMode] = useState<
    'allproducts' | 'categorywiseproduct' | ''
  >('');

  const totalProducts =
    selectionMode === 'allproducts'
      ? Object.values(Info).reduce((acc, list) => acc + list.length, 0)
      : Info[currentCategory]?.length || 0;

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
              Expense Report
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

        <DropDownPicker
          items={categoryItems}
          open={category}
          setOpen={setCategory}
          value={currentCategory}
          setValue={setCurrentCategory}
          placeholder="Select Category"
          disabled={selectionMode === 'allproducts'}
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
            value="allproducts"
            status={selectionMode === 'allproducts' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => {
              setSelectionMode('allproducts');
              setCurrentCategory('Select Category');
            }}
          />
          <Text style={{color: 'white', marginTop: 7, marginLeft: -5}}>
            All Expenses
          </Text>
          <RadioButton
            value="categorywiseproduct"
            color="white"
            uncheckedColor="white"
            status={
              selectionMode === 'categorywiseproduct' ? 'checked' : 'unchecked'
            }
            onPress={() => {
              setSelectionMode('categorywiseproduct');
              setCurrentCategory('');
            }}
          />
          <Text style={{color: 'white', marginTop: 7, marginLeft: -5}}>
            Category Wise Expense
          </Text>
        </View>

        <ScrollView>
          {(selectionMode === 'allproducts' ||
            (selectionMode === 'categorywiseproduct' && currentCategory)) && (
            <FlatList
              data={
                selectionMode === 'allproducts'
                  ? Info['Select Category']
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
                        {item.addedby}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>

                    {item.category && (
                                              <View style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                              }}>
                                                <Text style={styles.text}>Category:</Text>
                                                <Text style={styles.text}>{item.category}</Text>
                                              </View>
                                            )}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Date:</Text>
                        <Text style={styles.text}>{item.date}</Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Amount:</Text>
                        <Text style={styles.text}>{item.amount}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',marginBottom:5
                        }}>
                        <Text style={styles.text}>Note:</Text>
                        <Text style={styles.text}>{item.note}</Text>
                      </View>
                    
                  
                    
                    </View>
                  </View>
                </View>
              )}
            />
          )}

          {selectionMode === 'categorywiseproduct' && !currentCategory && (
            <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
              Please select a category to view items.
            </Text>
          )}
        </ScrollView>

        {selectionMode !== '' && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total Records: {totalProducts}</Text>
            <Text style={styles.totalText}>
              Total Expense Amount: {totalProducts}
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
});
