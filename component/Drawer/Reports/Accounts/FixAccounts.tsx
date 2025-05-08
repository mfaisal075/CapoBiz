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
import { RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';


interface EmployeeInfo {
  sr: number; 
  Description:string;
  Invoice: number;
  Date: string;
  Balance: number;
  Type?:string;
  PaymentType?: string;
  Credit:number;
  Debit:number;
}

interface InfoObject {
  [key: string]: EmployeeInfo[]; 
  'Select Account': EmployeeInfo[];
  'Purchase Account': EmployeeInfo[];
 'Sales Account': EmployeeInfo[];
'Freight Account': EmployeeInfo[];
  'Counter Account': EmployeeInfo[];
 
}

export default function FixAccounts() {

  const { openDrawer } = useDrawer();


  const Info: InfoObject = {
    'Select Account': [
      {
        sr: 1,
      Invoice:8,
      Description:'abc',
      Date:'00-00-00',
      Type:'hj',
      Credit:90,
      Debit:8,
      Balance:0
      },
    ],
    'Purchase Account': [
      {
        sr: 1,
       
        Invoice: 66,
        Description:'abc',
        PaymentType:'cash',
        Date:'00-00-00',
    
        Credit:90,
        Debit:8,
        Balance: 99,
      },
     
    ],
   
    'Sales Account': [
      {
        sr: 1,
       
        Invoice: 66,
        Description:'abc',
        PaymentType:'cash',
        Date:'00-00-00',
    
        Credit:90,
        Debit:8,
        Balance: 99,
      },
    ],
    'Freight Account': [
      {
        sr: 1,
       
        Invoice: 66,
        Description:'abc',
        PaymentType:'cash',
        Date:'00-00-00',
    
        Credit:90,
        Debit:8,
        Balance: 99,
      },
    ],
    'Counter Account': [
      {
        sr: 1,
       
        Invoice: 66,
        Description:'abc',
        PaymentType:'cash',
        Date:'00-00-00',
    
        Credit:90,
        Debit:8,
        Balance: 99,
      },
      
    ],
  };

  const [category, setCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('Select Account');

  const categoryItems = [
    { label: 'Select Account', value: 'Select Account' },
    { label: 'Purchase Account', value: 'Purchase Account' },
    { label: 'Sales Account', value: 'Sales Account' },
    { label: 'Freight Account', value: 'Freight Account' },
    { label: 'Counter Account', value: 'Counter Account' },
 
  ];

  const [selectionMode, setSelectionMode] = useState<'allaccounts' | 'singleaccounts' | ''>('');

  const totalProducts =
    selectionMode === 'allaccounts'
      ? Object.values(Info).reduce((acc, list) => acc + list.length, 0)
      : Info[currentCategory]?.length || 0;

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
            Fixed Accounts
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
          placeholder="Select Accounts"
          disabled={selectionMode === 'allaccounts'}
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
            value="allaccounts"
            status={selectionMode === 'allaccounts' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => {
              setSelectionMode('allaccounts');
              setCurrentCategory('Select Account');
            }}
          />
          <Text style={{color: 'white', marginTop: 7, marginLeft: -9}}>
            All Fixed Accounts
          </Text>
          <RadioButton
            value="singleaccounts"
            color="white"
            uncheckedColor="white"
            status={
              selectionMode === 'singleaccounts' ? 'checked' : 'unchecked'
            }
            onPress={() => {
              setSelectionMode('singleaccounts');
              setCurrentCategory('');
            }}
          />
          <Text style={{color: 'white', marginTop: 7, marginLeft: -9}}>
            Single Fixed Account
          </Text>
        </View>

        <ScrollView>
          {(selectionMode === 'allaccounts' ||
            (selectionMode === 'singleaccounts' && currentCategory)) && (
              <FlatList
              data={
                selectionMode === 'allaccounts'
                  ? Object.values(Info).flat()  
                  : Info[currentCategory] || []  
                }
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View style={{padding: 5}}>
                  <View style={styles.table}>
                    <View style={styles.tablehead}>
                      <Text style={{color: '#144272', fontWeight: 'bold', marginLeft: 5, marginTop: 5}}>
                        {item.Invoice}
                      </Text>
                    </View>
            
                    <View style={styles.infoRow}>
                  
                      {selectionMode === 'singleaccounts' ? (
                        <>
                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.text}>Payment Type:</Text>
                            <Text style={styles.text}>{item.PaymentType}</Text>
                          </View>
                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.text}>Date:</Text>
                            <Text style={styles.text}>{item.Date}</Text>
                          </View>
            
                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.text}>Credit:</Text>
                            <Text style={styles.text}>{item.Credit}</Text>
                          </View>
                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.text}>Debit:</Text>
                            <Text style={styles.text}>{item.Debit}</Text>
                          </View>
            
          
                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.text}>Balance:</Text>
                            <Text style={styles.text}>{item.Balance}</Text>
                          </View>
                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.text}>Description:</Text>
                            <Text style={styles.text}>{item.Description}</Text>
                          </View>
                        </>
                      ) : (
                        
                        <>
                                                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.text}>Type:</Text>
                            <Text style={styles.text}>{item.Type}</Text>
                          </View>
                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.text}>Date:</Text>
                            <Text style={styles.text}>{item.Date}</Text>
                          </View>
            

                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.text}>Credit:</Text>
                            <Text style={styles.text}>{item.Credit}</Text>
                          </View>

                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.text}>Debit:</Text>
                            <Text style={styles.text}>{item.Debit}</Text>
                          </View>
                          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}>
                            <Text style={styles.text}>Balance:</Text>
                            <Text style={styles.text}>{item.Balance}</Text>
                          </View>
                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.text}>Description:</Text>
                            <Text style={styles.text}>{item.Description}</Text>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              )}
            />
            
            
          )}

          {selectionMode === 'singleaccounts' && !currentCategory && (
            <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
              Please select a category to view items.
            </Text>
          )}
        </ScrollView>

        
        {selectionMode !== '' && totalProducts > 0 && (
          <View
            style={styles.totalContainer}>
                <Text style={styles.totalText}>Total Records:{totalProducts}</Text>

           
            <Text style={styles.totalText}>Total Credit: 8</Text>
          </View>
        )}
       {selectionMode !== '' && totalProducts > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 3,
            }}>
           <Text style={styles.totalText}>Total Debit:{totalProducts}</Text>
            <Text style={styles.totalText}>Net Balance:{totalProducts}</Text>
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
