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

type Product = {
  sr: number;
  Supplier: string;
  TotalBillAmount: number;
  TotalPaidAmount: number;
  Balance: number;
};

type InfoType = {
  [key: string]: Product[];
};

export default function SupplierAccounts() {
  const {openDrawer} = useDrawer();

  const Info: InfoType = {
    'Select Supplier': [
      {
        sr: 1,
        Supplier: 'name',
        TotalBillAmount: 0,
        TotalPaidAmount: 7,
        Balance: 99,
      },
    ],
    Ali: [
      {
        sr: 1,
        Supplier: 'name',
        TotalBillAmount: 0,
        TotalPaidAmount: 7,
        Balance: 99,
      },
      {
        sr: 2,
        Supplier: 'name',
        TotalBillAmount: 0,
        TotalPaidAmount: 7,
        Balance: 99,
      },
    ],
    Ahmad: [
      {
        sr: 1,
        Supplier: 'name',
        TotalBillAmount: 0,
        TotalPaidAmount: 7,
        Balance: 99,
      },
    ],
    Ayan: [
      {
        sr: 1,
        Supplier: 'name',
        TotalBillAmount: 0,
        TotalPaidAmount: 7,
        Balance: 99,
      },
    ],
    Asim: [
      {
        sr: 1,
        Supplier: 'name',
        TotalBillAmount: 0,
        TotalPaidAmount: 7,
        Balance: 99,
      },
    ],
    Aryan: [
      {
        sr: 1,
        Supplier: 'name',
        TotalBillAmount: 0,
        TotalPaidAmount: 7,
        Balance: 99,
      },
      {
        sr: 2,
        Supplier: 'name',
        TotalBillAmount: 0,
        TotalPaidAmount: 7,
        Balance: 99,
      },
      {
        sr: 3,
        Supplier: 'name',
        TotalBillAmount: 0,
        TotalPaidAmount: 7,
        Balance: 99,
      },
    ],
  };

  const [category, setCategory] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<string>('Select Supplier');

  const categoryItems = [
    {label: 'Select Supplier', value: 'Select Supplier'},
    {label: 'Ali', value: 'Ali'},
    {label: 'Ahmad', value: 'Ahmad'},
    {label: 'Ayan', value: 'Ayan'},
    {label: 'Asim', value: 'Asim'},
    {label: 'Aryan', value: 'Aryan'},
  ];

  const [selectionMode, setSelectionMode] = useState<
    'allsuppliers' | 'singlesupplier' | ''
  >('');

  const totalProducts =
    selectionMode === 'allsuppliers'
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
              Supplier Accounts
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
          placeholder="Select Suppliers"
          disabled={selectionMode === 'allsuppliers'}
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
            value="allsuppliers"
            status={selectionMode === 'allsuppliers' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => {
              setSelectionMode('allsuppliers');
              setCurrentCategory('Select Category');
            }}
          />
          <Text style={{color: 'white', marginTop: 7, marginLeft: -5}}>
            All Suppliers
          </Text>
          <RadioButton
            value="singlesupplier"
            color="white"
            uncheckedColor="white"
            status={
              selectionMode === 'singlesupplier' ? 'checked' : 'unchecked'
            }
            onPress={() => {
              setSelectionMode('singlesupplier');
              setCurrentCategory('');
            }}
          />
          <Text style={{color: 'white', marginTop: 7, marginLeft: -5}}>
            Single Supplier
          </Text>
        </View>

        <ScrollView>
          {(selectionMode === 'allsuppliers' ||
            (selectionMode === 'singlesupplier' && currentCategory)) && (
            <FlatList
              data={
                selectionMode === 'allsuppliers'
                  ? Object.values(Info).flat()
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
                        {item.Supplier}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Total Bill Amount:</Text>
                        <Text style={styles.text}>{item.TotalBillAmount}</Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Total Paid Amount:</Text>
                        <Text style={styles.text}>{item.TotalPaidAmount}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 5,
                        }}>
                        <Text style={styles.text}>Balance:</Text>
                        <Text style={styles.text}>{item.Balance}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            />
          )}

          {selectionMode === 'singlesupplier' && !currentCategory && (
            <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
              Please select a category to view items.
            </Text>
          )}
        </ScrollView>

       
        {selectionMode !== '' && totalProducts > 0 && (
          <View
            style={styles.totalContainer}>
            <Text style={styles.totalText}>Total Paid:{totalProducts}</Text>
            <Text style={styles.totalText}>Net Payables: 8</Text>
          </View>
        )}
              {selectionMode !== '' && totalProducts > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 3,
            }}>
            <Text style={styles.totalText}>Total Records:{totalProducts}</Text>

            <Text style={styles.totalText}>Total Payable:{totalProducts}</Text>
          </View>
        )}
         {selectionMode === 'singlesupplier' && currentCategory && (

<View style={{ flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 3,}}>
  <Text style={styles.totalText}>Unpaid Cheques Amount:</Text>
  <Text style={styles.totalText}> 8</Text>
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
