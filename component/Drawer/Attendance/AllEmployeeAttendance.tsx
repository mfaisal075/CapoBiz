import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import backgroundColors from '../../Colors';

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
  const [secId, setSecId] = useState<number | null>(null);

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
      await addToEmpAttendanceCart();
      const res = await axios.get(`${BASE_URL}/loadcartemp`);
      console.log('📥 LOADED EMPLOYEE DATA:', res.data.carsession);
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

    try {
      // If it's already in 24-hour format (HH:mm)
      if (/^\d{1,2}:\d{2}$/.test(timeString)) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
      }

      // If it's in 12-hour format with AM/PM
      const normalized = timeString.replace(/\s+/g, ' ').trim().toUpperCase();
      const parts = normalized.split(' ');

      if (parts.length >= 2) {
        const [time, modifier] = parts;
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
      }

      return new Date();
    } catch (error) {
      console.log('Error parsing time:', error, timeString);
      return new Date();
    }
  };

  const onClockInChangeForItem = async (
    emp_id: number,
    event: DateTimePickerEvent,
    sec_id: number,
    selectedDate?: Date,
  ) => {
    setClockInPickerFor(null);
    if (!selectedDate) return;

    const hours = selectedDate.getHours().toString().padStart(2, '0');
    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    console.log('🕒 CLOCK IN UPDATE:', {
      emp_id,
      newTime: timeString,
      selectedDate: selectedDate.toString(),
    });

    // Update local state
    setAttCart(prev =>
      prev.map(emp =>
        emp.emp_id === sec_id ? {...emp, clockin: timeString} : emp,
      ),
    );

    // API call
    try {
      await axios.post(`${BASE_URL}/updateattendance`, {
        id: emp_id,
        clockin: timeString,
      });
      console.log(`✅ Clock in updated for employee ${emp_id}: ${timeString}`);
    } catch (error) {
      console.log('❌ Error updating clock in:', error);
    }
  };

  const onClockOutChangeForItem = async (
    emp_id: number,
    event: DateTimePickerEvent,
    sec_id: number,
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
        emp.emp_id === sec_id ? {...emp, clockout: timeString} : emp,
      ),
    );

    // Call API to update backend
    try {
      await axios.post(`${BASE_URL}/updateattendanceclockout`, {
        sid: emp_id,
        clockout: timeString,
      });
      console.log('Employee Id:', emp_id);
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

  const updateAttendanceStatus = async (
    emp_id: number,
    status: string,
    sec_id: number,
  ) => {
    try {
      // Update local state immediately
      setAttCart(prev =>
        prev.map(emp =>
          emp.emp_id === sec_id ? {...emp, att_status: status} : emp,
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
      console.log('Response: ', data);

      if (res.status === 200 && data.status === 200) {
        await axios.get(`${BASE_URL}/emptyattendancecart`);
        handleReset();

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
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>All Employees Attendance</Text>
          </View>
        </View>

        {/* Filter/Action Section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              fetchData();
            }}>
            <Icon
              name="account-multiple"
              size={18}
              color={backgroundColors.light}
            />
            <Text style={styles.buttonText}>Load Employees</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: backgroundColors.danger}]}
            onPress={() => {
              handleReset();
            }}>
            <Icon name="refresh" size={18} color={backgroundColors.light} />
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Employee List */}
        <View style={styles.listContainer}>
          <FlatList
            data={attCart}
            keyExtractor={item => item.emp_id.toString()}
            renderItem={({item, index}) => (
              <View style={styles.card}>
                {/* Card Header with Gradient Effect */}
                <View style={styles.cardHeader}>
                  <View style={styles.employeeInfoSection}>
                    <View style={styles.nameSection}>
                      <Text style={styles.employeeName}>{item.name}</Text>
                      <View style={styles.cnicRow}>
                        <Text style={styles.cnicText}>{item.cnic ?? '--'}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.dateSection}>
                    <Icon name="calendar-today" size={16} color="#666" />
                    <Text style={styles.dateText}>{item.date}</Text>
                  </View>
                </View>

                {/* Card Body with Time Information */}
                <View style={styles.cardBody}>
                  {/* Clock In */}
                  <TouchableOpacity
                    onPress={() => {
                      if (item.att_status === 'Present') {
                        setClockInPickerFor(item.emp_id);
                      }
                    }}
                    disabled={item.att_status !== 'Present'}
                    style={[
                      styles.timeCard,
                      item.att_status !== 'Present' && styles.disabledTimeCard,
                    ]}>
                    <View style={styles.timeCardLeft}>
                      <View
                        style={[
                          styles.iconCircle,
                          {
                            backgroundColor:
                              item.att_status === 'Present'
                                ? '#E8F5E9'
                                : '#F5F5F5',
                          },
                        ]}>
                        <Icon
                          name="clock-in"
                          size={20}
                          color={
                            item.att_status === 'Present' ? '#2A652B' : '#999'
                          }
                        />
                      </View>
                      <View style={styles.timeInfo}>
                        <Text
                          style={[
                            styles.timeLabel,
                            item.att_status !== 'Present' &&
                              styles.disabledText,
                          ]}>
                          Clock In
                        </Text>
                        <Text
                          style={[
                            styles.timeValue,
                            item.att_status !== 'Present' &&
                              styles.disabledText,
                          ]}>
                          {item.clockin
                            ? formatTimeForDisplay(item.clockin)
                            : '—'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.editIndicator}>
                      {item.att_status === 'Present' ? (
                        <Icon name="pencil-circle" size={22} color="#2A652B" />
                      ) : (
                        <Icon name="lock" size={18} color="#999" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Clock Out */}
                  <TouchableOpacity
                    onPress={() => {
                      if (item.att_status === 'Present') {
                        setClockOutPickerFor(item.emp_id);
                      }
                    }}
                    disabled={item.att_status !== 'Present'}
                    style={[
                      styles.timeCard,
                      item.att_status !== 'Present' && styles.disabledTimeCard,
                    ]}>
                    <View style={styles.timeCardLeft}>
                      <View
                        style={[
                          styles.iconCircle,
                          {
                            backgroundColor:
                              item.att_status === 'Present'
                                ? '#FFEBEE'
                                : '#F5F5F5',
                          },
                        ]}>
                        <Icon
                          name="clock-out"
                          size={20}
                          color={
                            item.att_status === 'Present' ? '#D32F2F' : '#999'
                          }
                        />
                      </View>
                      <View style={styles.timeInfo}>
                        <Text
                          style={[
                            styles.timeLabel,
                            item.att_status !== 'Present' &&
                              styles.disabledText,
                          ]}>
                          Clock Out
                        </Text>
                        <Text
                          style={[
                            styles.timeValue,
                            item.att_status !== 'Present' &&
                              styles.disabledText,
                          ]}>
                          {item.clockout
                            ? formatTimeForDisplay(item.clockout)
                            : '—'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.editIndicator}>
                      {item.att_status === 'Present' ? (
                        <Icon name="pencil-circle" size={22} color="#D32F2F" />
                      ) : (
                        <Icon name="lock" size={18} color="#999" />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Card Footer */}
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedEmployeeId(index);
                      setStatusModalVisible(true);
                      setSecId(item.emp_id);
                    }}
                    style={styles.changeStatusButton}>
                    <Text style={styles.changeStatusText}>Change Status</Text>
                    <Icon name="chevron-right" size={16} color="#2A652B" />
                  </TouchableOpacity>
                  <View
                    style={[
                      styles.statusBadge,
                      getStatusStyle(item.att_status),
                    ]}>
                    <Icon
                      name={
                        item.att_status === 'Present'
                          ? 'check-circle'
                          : item.att_status === 'Absent'
                          ? 'close-circle'
                          : 'information'
                      }
                      size={14}
                      color={getStatusTextColor(item.att_status)}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        {color: getStatusTextColor(item.att_status)},
                      ]}>
                      {item.att_status}
                    </Text>
                  </View>
                </View>

                {/* Date Time Pickers */}
                {clockInPickerFor === item.emp_id &&
                  item.att_status === 'Present' && (
                    <DateTimePicker
                      key={`clockin-${item.emp_id}-${item.clockin}`}
                      value={getDateFrom12HourTime(item.clockin)}
                      mode="time"
                      is24Hour={false}
                      display="default"
                      onChange={(event, selectedDate) =>
                        onClockInChangeForItem(
                          index,
                          event,
                          item.emp_id,
                          selectedDate,
                        )
                      }
                    />
                  )}

                {clockOutPickerFor === item.emp_id &&
                  item.att_status === 'Present' && (
                    <DateTimePicker
                      key={`clockout-${item.emp_id}-${item.clockout}`}
                      value={getDateFrom12HourTime(item.clockout)}
                      mode="time"
                      is24Hour={false}
                      display="default"
                      onChange={(event, selectedDate) =>
                        onClockOutChangeForItem(
                          index,
                          event,
                          item.emp_id,
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
                    if (selectedEmployeeId !== null && secId !== null) {
                      updateAttendanceStatus(selectedEmployeeId, status, secId);
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: backgroundColors.primary,
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  menuIcon: {
    width: 28,
    height: 28,
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
  gradientBackground: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  actionButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: backgroundColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: backgroundColors.dark,
    justifyContent: 'center',
    shadowColor: backgroundColors.dark,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
  },
  buttonText: {
    color: backgroundColors.light,
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },

  // NEW ENHANCED CARD STYLES
  card: {
    backgroundColor: backgroundColors.light,
    borderRadius: 20,
    marginVertical: 8,
    shadowColor: backgroundColors.dark,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 4},
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FAFFFE',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E9',
  },
  employeeInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    height: 50,
    width: 50,
  },
  nameSection: {
    marginLeft: 14,
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  cnicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cnicText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  timeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  disabledTimeCard: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  timeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  editIndicator: {
    marginLeft: 8,
  },
  disabledText: {
    color: '#999',
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FAFFFE',
    borderTopWidth: 1,
    borderTopColor: '#E8F5E9',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  changeStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: -2},
    elevation: 6,
  },
  changeStatusText: {
    fontSize: 13,
    color: '#2A652B',
    fontWeight: '700',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#555',
    fontSize: 17,
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubText: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  submitContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: '#2A652B',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2A652B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 8,
  },
  submitText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 34,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: -8},
    elevation: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 24,
    color: '#2A652B',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modalCancelButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
