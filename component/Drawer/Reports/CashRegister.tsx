import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';

interface Users {
  id: number;
  name: string;
}

interface CashRegisterData {
  id: number;
  name: string;
  creg_closing_amount: string;
  creg_cash_in_hand: string;
  creg_opening_date: string;
  creg_closing_date: string;
}

export default function CashRegister() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [userOpen, setUserOpen] = useState(false);
  const [userValue, setUserValue] = useState('');
  const [cashRegister, setCashRegister] = useState<CashRegisterData[]>([]);
  const [usersDropdown, setUsersDropdown] = useState<Users[]>([]);
  const transformedUsers = usersDropdown.map(user => ({
    label: user.name,
    value: user.id.toString(),
  }));

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

  // Fetch Users Dropdown
  const fetchUsersDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchusers`);
      setUsersDropdown(res.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Cash Register
  const fetchCashRegister = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.get(
        `${BASE_URL}/fetchcashregister?from=${from}&to=${to}&user=${userValue}&_token=${token}`,
      );
      setCashRegister(res.data.cash_register);
    } catch (error) {
      console.log();
    }
  };

  useEffect(() => {
    fetchUsersDropdown();
    fetchCashRegister();
  }, [userValue, startDate, endDate]);

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
              Cash Register
            </Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 5,
              padding: 5,
              height: 38,
              width: '46%',
            }}>
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
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 5,
              padding: 5,
              height: 38,
              width: '46%',
            }}>
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

        <View style={[styles.dropDownContainer]}>
          <DropDownPicker
            items={transformedUsers}
            open={userOpen}
            setOpen={setUserOpen}
            value={userValue}
            setValue={setUserValue}
            placeholder="Select User"
            placeholderStyle={{color: 'white'}}
            textStyle={{color: 'white'}}
            ArrowUpIconComponent={() => (
              <Text>
                <Icon name="chevron-up" size={15} color="white" />
              </Text>
            )}
            ArrowDownIconComponent={() => (
              <Text>
                <Icon name="chevron-down" size={15} color="white" />
              </Text>
            )}
            style={[styles.dropdown, {zIndex: 999}]}
            dropDownContainerStyle={{
              backgroundColor: 'white',
              borderColor: '#144272',
              width: '100%',
              marginTop: 8,
            }}
            labelStyle={{color: 'white'}}
            listItemLabelStyle={{color: '#144272'}}
          />
        </View>

        <FlatList
          data={cashRegister}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{paddingBottom: 50}}
          style={{marginTop: 10}}
          renderItem={({item}) => (
            <View style={styles.table}>
              <View style={styles.tablehead}>
                <Text
                  style={{
                    color: '#144272',
                    fontWeight: 'bold',
                    marginLeft: 5,
                    marginTop: 5,
                  }}>
                  {item.name}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.row}>
                  <Text style={styles.text}>Opening Date:</Text>
                  <Text style={styles.text}>{item.creg_opening_date}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.text}>Closing Date:</Text>
                  <Text style={styles.text}>{item.creg_closing_date}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.text}>Opening Amount:</Text>
                  <Text style={styles.text}>{item.creg_cash_in_hand}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.text}>Closing Amount:</Text>
                  <Text style={styles.text}>{item.creg_closing_amount}</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
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
          }
        />
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
    width: '90%',
    borderRadius: 5,
    marginTop: 10,
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
    minHeight: 38,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '100%',
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
    marginHorizontal: 5,
    marginVertical: 2,
  },
  dropDownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
  },
});
