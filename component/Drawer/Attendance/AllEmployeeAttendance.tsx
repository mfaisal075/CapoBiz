import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
  const [attCart, setAttCart] = useState<AttendanceCart[]>([]);
  const [clockInPickerFor, setClockInPickerFor] = useState<number | null>(null);
  const [clockOutPickerFor, setClockOutPickerFor] = useState<number | null>(
    null,
  );

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

  // Get status badge style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Present':
        return {backgroundColor: '#E8F5E8', borderColor: '#4CAF50'};
      case 'Absent':
        return {backgroundColor: '#FFEBEE', borderColor: '#F44336'};
      case 'Leave':
        return {backgroundColor: '#E3F2FD', borderColor: '#2196F3'};
      default:
        return {backgroundColor: '#F5F5F5', borderColor: '#9E9E9E'};
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'Present':
        return '#4CAF50';
      case 'Absent':
        return '#F44336';
      case 'Leave':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>All Employees Attendance</Text>
          </View>

          <View style={[styles.headerBtn, {backgroundColor: 'transparent'}]} />
        </View>

        {/* Filter/Action Section */}
        <View style={styles.filterContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                fetchData();
              }}>
              <Icon name="account-multiple" size={18} color="#144272" />
              <Text style={styles.buttonText}>Load Employees</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                handleReset();
              }}>
              <Icon name="refresh" size={18} color="#144272" />
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Employee List */}
        <View style={styles.listContainer}>
          <FlatList
            data={attCart}
            keyExtractor={item => item.emp_id.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.name?.charAt(0) || 'E'}
                    </Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.employeeName}>{item.name}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      getStatusStyle(item.att_status),
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        {color: getStatusTextColor(item.att_status)},
                      ]}>
                      {item.att_status}
                    </Text>
                  </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="card-account-details"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>CNIC</Text>
                    </View>
                    <Text style={styles.valueText}>{item.cnic ?? '--'}</Text>
                  </View>

                  {/* Clock In - Only enabled when status is Present */}
                  <TouchableOpacity
                    onPress={() => {
                      if (item.att_status === 'Present') {
                        setClockInPickerFor(item.emp_id);
                      }
                    }}
                    disabled={item.att_status !== 'Present'}
                    style={[
                      styles.infoRow,
                      item.att_status !== 'Present' && styles.disabledRow,
                    ]}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="clock-in"
                        size={18}
                        color={
                          item.att_status === 'Present' ? '#144272' : '#999'
                        }
                        style={styles.infoIcon}
                      />
                      <Text
                        style={[
                          styles.labelText,
                          item.att_status !== 'Present' && styles.disabledText,
                        ]}>
                        Clock In
                      </Text>
                    </View>
                    <View style={styles.timeContainer}>
                      <Text
                        style={[
                          styles.valueText,
                          item.att_status !== 'Present' && styles.disabledText,
                        ]}>
                        {item.clockin
                          ? formatTimeForDisplay(item.clockin)
                          : '—'}
                      </Text>
                      {item.att_status === 'Present' && (
                        <Icon name="pencil" size={14} color="#666" />
                      )}
                      {item.att_status !== 'Present' && (
                        <Icon name="lock" size={14} color="#999" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Clock Out - Only enabled when status is Present */}
                  <TouchableOpacity
                    onPress={() => {
                      if (item.att_status === 'Present') {
                        setClockOutPickerFor(item.emp_id);
                      }
                    }}
                    disabled={item.att_status !== 'Present'}
                    style={[
                      styles.infoRow,
                      item.att_status !== 'Present' && styles.disabledRow,
                    ]}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="clock-out"
                        size={18}
                        color={
                          item.att_status === 'Present' ? '#144272' : '#999'
                        }
                        style={styles.infoIcon}
                      />
                      <Text
                        style={[
                          styles.labelText,
                          item.att_status !== 'Present' && styles.disabledText,
                        ]}>
                        Clock Out
                      </Text>
                    </View>
                    <View style={styles.timeContainer}>
                      <Text
                        style={[
                          styles.valueText,
                          item.att_status !== 'Present' && styles.disabledText,
                        ]}>
                        {item.clockout
                          ? formatTimeForDisplay(item.clockout)
                          : '—'}
                      </Text>
                      {item.att_status === 'Present' && (
                        <Icon name="pencil" size={14} color="#666" />
                      )}
                      {item.att_status !== 'Present' && (
                        <Icon name="lock" size={14} color="#999" />
                      )}
                    </View>
                  </TouchableOpacity>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="calendar"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Date</Text>
                    </View>
                    <Text style={styles.valueText}>{item.date}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedEmployeeId(item.emp_id);
                      setStatusModalVisible(true);
                    }}
                    style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="information-outline"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Status</Text>
                    </View>
                    <View style={styles.timeContainer}>
                      <Text
                        style={[
                          styles.valueText,
                          {color: getStatusTextColor(item.att_status)},
                        ]}>
                        {item.att_status}
                      </Text>
                      <Icon name="pencil" size={14} color="#666" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Date Time Pickers - Only show when status is Present */}
                {clockInPickerFor === item.emp_id &&
                  item.att_status === 'Present' && (
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

                {clockOutPickerFor === item.emp_id &&
                  item.att_status === 'Present' && (
                    <DateTimePicker
                      value={getDateFrom12HourTime(item.clockout)}
                      mode="time"
                      is24Hour={false}
                      display="default"
                      onChange={(event, selectedDate) =>
                        onClockOutChangeForItem(
                          item.emp_id,
                          event,
                          selectedDate,
                        )
                      }
                    />
                  )}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-multiple-outline" size={48} color="#666" />
                <Text style={styles.emptyText}>No employees found.</Text>
                <Text style={styles.emptySubText}>
                  Load employees to start marking attendance.
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 20}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Submit Button */}
        {attCart.length > 0 && (
          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={compAttendance}>
              <Icon name="check-circle" size={20} color="white" />
              <Text style={styles.submitText}>Submit Attendance</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status Modal */}
        {statusModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Status</Text>

              {['Present', 'Absent', 'Leave'].map(status => (
                <TouchableOpacity
                  key={status}
                  onPress={() => {
                    if (selectedEmployeeId !== null) {
                      updateAttendanceStatus(selectedEmployeeId, status);
                    }
                  }}
                  style={styles.modalOption}>
                  <Icon
                    name={
                      status === 'Present'
                        ? 'check-circle'
                        : status === 'Absent'
                        ? 'close-circle'
                        : 'information'
                    }
                    size={20}
                    color={getStatusTextColor(status)}
                  />
                  <Text
                    style={[
                      styles.modalOptionText,
                      {color: getStatusTextColor(status)},
                    ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setStatusModalVisible(false)}
                style={styles.modalCancelButton}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Toast />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#144272',
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
    elevation: 2,
  },
  buttonText: {
    color: '#144272',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#144272',
    flexWrap: 'wrap',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    flex: 1,
  },
  infoIcon: {
    marginRight: 6,
  },
  labelText: {
    fontSize: 13,
    color: '#144272',
    fontWeight: '600',
  },
  valueText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },
  emptySubText: {
    color: '#999',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  submitContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  disabledRow: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#144272',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 5,
  },
  submitText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#144272',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: -2},
    elevation: 6,
  },
  pageButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  pageButtonDisabled: {
    backgroundColor: '#ddd',
  },
  pageButtonText: {
    color: '#144272',
    fontWeight: '600',
    fontSize: 14,
  },
  pageButtonTextDisabled: {
    color: '#777',
  },
  pageIndicator: {
    alignItems: 'center',
  },
  pageIndicatorText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  pageCurrent: {
    fontWeight: '700',
    color: '#FFD166',
  },
  totalText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: -5},
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#144272',
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  modalCancelButton: {
    marginTop: 15,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
});
