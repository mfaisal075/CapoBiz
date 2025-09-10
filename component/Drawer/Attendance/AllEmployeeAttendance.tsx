import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';

type Employee = {
  id: string;
  name: string;
  cnic: string;
  clockIn: Date;
  clockOut: Date;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
};

const initialData: Employee[] = [
  {
    id: '1',
    name: 'Haroon',
    cnic: '11111-1111111-1',
    clockIn: new Date(),
    clockOut: new Date(),
    date: '08-05-2025',
    status: 'Leave',
  },
  {
    id: '2',
    name: 'Tahir',
    cnic: '11111-1111444-4',
    clockIn: new Date(),
    clockOut: new Date(),
    date: '08-05-2025',
    status: 'Absent',
  },
  {
    id: '3',
    name: 'Furqan',
    cnic: '22222-2222222-2',
    clockIn: new Date(),
    clockOut: new Date(),
    date: '08-05-2025',
    status: 'Present',
  },
  {
    id: '4',
    name: 'Fakhar',
    cnic: '12345-6789999-9',
    clockIn: new Date(),
    clockOut: new Date(),
    date: '08-05-2025',
    status: 'Present',
  },
];

interface AttendanceCart {
  emp_id: number;
  name: string;
  cnic: string;
  date: string;
  clockin: string;
  clockout: string;
  att_status: string;
}

export default function AllEmployeeAttendance() {
  const {openDrawer} = useDrawer();
  const {token} = useUser();
  const [attCart, setAttCart] = useState<AttendanceCart[]>([]);
  const [clockInPickerFor, setClockInPickerFor] = useState<number | null>(null);
  const [clockOutPickerFor, setClockOutPickerFor] = useState<number | null>(
    null,
  );

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  );

  // Add Employee to Attendance cart
  const addToEmpAttendanceCart = async () => {
    try {
      await axios.post(`${BASE_URL}/addtoEmployeesattendancecart`);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Attendance Cart Data
  const fetchData = async () => {
    try {
      await addToEmpAttendanceCart(); // await here
      const res = await axios.get(`${BASE_URL}/loadcartemp`);
      setAttCart(res.data.carsession);
    } catch (error) {
      console.log(error);
    }
  };

  // Rest Api
  const handleReset = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/clearEmployeescart`);

      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Reset Successful',
          text2: 'Attendance cart has been cleared',
          visibilityTime: 1500,
        });

        setAttCart([]);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: res.data.message || 'Could not reset cart',
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while resetting',
        visibilityTime: 1500,
      });
    }
  };

  // Safe converter
  const getDateFrom12HourTime = (timeString: string) => {
    if (!timeString) return new Date();

    // Normalize: remove weird spaces and uppercase AM/PM
    const normalized = timeString.replace(/\s+/g, ' ').trim().toUpperCase();

    const parts = normalized.split(' ');
    if (parts.length < 2) return new Date();

    const [time, modifier] = parts;
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return new Date(1970, 0, 1, hours, minutes);
  };

  const onClockInChangeForItem = async (
    emp_id: number,
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    // Close the picker
    setClockInPickerFor(null);

    if (!selectedDate) return;

    // Convert Date to "HH:mm" format
    const hours = selectedDate.getHours().toString().padStart(2, '0');
    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    // Update local state immediately
    setAttCart(prev =>
      prev.map(emp =>
        emp.emp_id === emp_id ? {...emp, clockin: timeString} : emp,
      ),
    );

    // Call API to update backend
    try {
      await axios.post(`${BASE_URL}/updateattendance`, {
        id: emp_id,
        clockin: timeString,
      });
      console.log(`Clock in updated for employee ${emp_id}: ${timeString}`);
    } catch (error) {
      console.log('Error updating clock in:', error);
    }
  };

  const onClockOutChangeForItem = async (
    emp_id: number,
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    // Close the picker
    setClockOutPickerFor(null);

    if (!selectedDate) return;

    // Convert Date to "HH:mm" format
    const hours = selectedDate.getHours().toString().padStart(2, '0');
    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    // Update local state immediately
    setAttCart(prev =>
      prev.map(emp =>
        emp.emp_id === emp_id ? {...emp, clockout: timeString} : emp,
      ),
    );

    // Call API to update backend
    try {
      await axios.post(`${BASE_URL}/updateattendanceclockout`, {
        sid: emp_id,
        clockout: timeString,
      });
      console.log(`Clock Out updated for employee ${emp_id}: ${timeString}`);
    } catch (error) {
      console.log('Error updating clock in:', error);
    }
  };

  const formatTimeForDisplay = (timeString: string) => {
    if (!timeString) return '';

    let date: Date;

    // Check if string is already in "HH:mm" (24-hour)
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      const [hours, minutes] = timeString.split(':').map(Number);
      date = new Date(1970, 0, 1, hours, minutes);
    } else {
      // Try parsing 12-hour format with AM/PM
      date = new Date(`1970-01-01T${convert12To24(timeString)}:00`);
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Helper to convert "10:39 AM" → "10:39" in 24-hour format
  const convert12To24 = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  };

  const updateAttendanceStatus = async (emp_id: number, status: string) => {
    try {
      // Update local state immediately
      setAttCart(prev =>
        prev.map(emp =>
          emp.emp_id === emp_id ? {...emp, att_status: status} : emp,
        ),
      );

      // Close modal
      setStatusModalVisible(false);
      setSelectedEmployeeId(null);

      // Hit backend API
      await axios.post(`${BASE_URL}/updateattendancestatus`, {
        sid: emp_id,
        att_status: status,
      });

      console.log(`Status updated for employee ${emp_id}: ${status}`);
    } catch (error) {
      console.log('Error updating status:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not update status',
        visibilityTime: 1500,
      });
    }
  };

  // Complete Attendance
  const compAttendance = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/empcompleteattendance`);

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        await axios.get(`${BASE_URL}/emptyattendancecart`);

        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Attendance has been marked successfully!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 203) {
        Toast.show({
          type: 'info',
          text1: 'Warning!',
          text2: 'Clock out time must be greater than clock in time.',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 201) {
        Toast.show({
          type: 'info',
          text1: 'Warning!',
          text2: 'Please Load the Employees First!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'You Have Already Marked Attendance!',
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../../assets/menu.png')}
              style={styles.menuIcon}
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>All Employees Attendance</Text>
          </View>
        </View>

        <View style={styles.topButtons}>
          <TouchableOpacity
            style={styles.loadButton}
            onPress={() => {
              fetchData();
            }}>
            <Text style={styles.buttonText}>Load Employees</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              handleReset();
            }}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={attCart}
          keyExtractor={item => item.emp_id.toString()}
          renderItem={({item}) => (
            <ScrollView style={{padding: 5}}>
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
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={[styles.text, {marginTop: 5}]}>CNIC</Text>
                  <Text style={[styles.text, {marginTop: 5}]}>{item.cnic}</Text>
                </View>
                {/* Clock In */}
                <TouchableOpacity
                  onPress={() => setClockInPickerFor(item.emp_id)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Clock In:</Text>
                    <Text style={styles.text}>
                      {item.clockin ? formatTimeForDisplay(item.clockin) : '—'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setClockOutPickerFor(item.emp_id)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Clock Out:</Text>
                    <Text style={styles.text}>
                      {item.clockout
                        ? formatTimeForDisplay(item.clockout)
                        : '—'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {clockInPickerFor === item.emp_id && (
                  <DateTimePicker
                    value={getDateFrom12HourTime(item.clockin)}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={(event, selectedDate) =>
                      onClockInChangeForItem(item.emp_id, event, selectedDate)
                    }
                  />
                )}

                {clockOutPickerFor === item.emp_id && (
                  <DateTimePicker
                    value={getDateFrom12HourTime(item.clockout)}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={(event, selectedDate) =>
                      onClockOutChangeForItem(item.emp_id, event, selectedDate)
                    }
                  />
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.text}>Date</Text>
                  <Text style={styles.text}>{item.date}</Text>
                </View>

                {openDropdownId !== item.emp_id.toString() && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedEmployeeId(item.emp_id);
                      setStatusModalVisible(true);
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}>
                      <Text style={styles.text}>Status</Text>
                      <Text style={styles.text}>{item.att_status}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )}
        />

        <TouchableOpacity style={styles.submitButton} onPress={compAttendance}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
        {statusModalVisible && (
          <View
            style={{
              position: 'absolute',
              alignSelf: 'center',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              padding: 20,

              bottom: 0,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 10,
                color: '#144272',
              }}>
              Select Status
            </Text>

            {['Present', 'Absent', 'Leave'].map(status => (
              <TouchableOpacity
                key={status}
                onPress={() => {
                  if (selectedEmployeeId !== null) {
                    updateAttendanceStatus(selectedEmployeeId, status);
                  }
                }}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc',
                }}>
                <Text style={{fontSize: 16, color: '#144272'}}>{status}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setStatusModalVisible(false)}
              style={{
                marginTop: 10,
                alignItems: 'center',
                paddingVertical: 10,
                backgroundColor: '#144272',
                borderRadius: 8,
              }}>
              <Text style={{color: 'white'}}>Cancel</Text>
            </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    justifyContent: 'space-between',
  },
  menuIcon: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  loadButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
    width: '45%',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#144272',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  timeBox: {
    color: 'white',
    borderRadius: 4,
    marginBottom: 6,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 10,
    marginBottom: 5,
  },
  submitText: {
    color: '#144272',
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 'auto',
    width: 314,
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
  productinput: {
    flexDirection: 'row',
    height: 38,
    width: '46%',
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
    justifyContent: 'space-between',
  },
});
