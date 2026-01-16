import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../BottomBar';

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F0F2F5',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  shadow: '#000',
};

interface AttendanceCart {
  emp_id: number;
  name: string;
  cnic: string;
  date: string;
  clockin: string;
  clockout: string;
  att_status: string;
}

export default function AllEmployeeAttendance({navigation}: any) {
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

  // Custom Message Modal State
  const [msgModalVisible, setMsgModalVisible] = useState(false);
  const [msgType, setMsgType] = useState<'success' | 'warning' | 'error'>(
    'success',
  );
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');

  const showModalMessage = (
    type: 'success' | 'warning' | 'error',
    title: string,
    body: string,
  ) => {
    setMsgType(type);
    setMsgTitle(title);
    setMsgBody(body);
    setMsgModalVisible(true);
  };

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
        showModalMessage(
          'success',
          'Reset Successful',
          'Attendance cart has been cleared',
        );

        setAttCart([]);
      } else {
        showModalMessage(
          'error',
          'Reset Failed',
          res.data.message || 'Could not reset cart',
        );
      }
    } catch (error) {
      console.log(error);
      showModalMessage(
        'error',
        'Error',
        'Something went wrong while resetting',
      );
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
      showModalMessage(
        'error',
        'Update Failed',
        'Could not update clock-in time on server.',
      );
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
      showModalMessage(
        'error',
        'Update Failed',
        'Could not update clock-out time on server.',
      );
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
      showModalMessage(
        'error',
        'Update Failed',
        'Could not update status on server.',
      );
    }
  };

  // Complete Attendance
  const compAttendance = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/empcompleteattendance`);

      const data = res.data;
      console.log(res.data);

      if (res.status === 200 && data.status === 200) {
        await axios.get(`${BASE_URL}/emptyattendancecart`);
        handleReset();

        showModalMessage(
          'success',
          'Success!',
          'Attendance has been marked successfully!',
        );
      } else if (res.status === 200 && data.status === 203) {
        const errorList =
          data.errors && Array.isArray(data.errors)
            ? data.errors.join('\n')
            : '';
        const message =
          data.message || 'Clock out time must be greater than clock in time.';

        showModalMessage(
          'warning',
          'Validation Error',
          `${message}\n\n${errorList}`,
        );
      } else if (res.status === 200 && data.status === 201) {
        showModalMessage(
          'warning',
          'Warning!',
          'Please Load the Employees First!',
        );
      } else if (res.status === 200 && data.status === 202) {
        showModalMessage(
          'error',
          'Warning!',
          'You Have Already Marked Attendance!',
        );
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

  useEffect(() => {
    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>All Employees Attendance</Text>
            <View style={{width: 24}} />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.contentContainer}>
        {/* Filter/Action Section */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: THEME.primary}]}
            onPress={() => {
              fetchData();
            }}>
            <Icon name="account-arrow-right" size={20} color={THEME.white} />
            <Text style={styles.actionBtnText}>Load Employees</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: THEME.danger}]}
            onPress={() => {
              handleReset();
            }}>
            <Icon name="refresh" size={20} color={THEME.white} />
            <Text style={styles.actionBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Employee List */}
        <View style={styles.listContainer}>
          <FlatList
            data={attCart}
            keyExtractor={item => item.emp_id.toString()}
            renderItem={({item, index}) => (
              <View style={styles.card}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.employeeInfoSection}>
                    <Text style={styles.employeeName}>{item.name}</Text>
                    <Text style={styles.cnicText}>{item.cnic ?? '--'}</Text>
                  </View>
                  <View style={styles.dateSection}>
                    <Icon name="calendar" size={16} color={THEME.textGray} />
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
                    <View style={styles.timeCardContent}>
                      <Icon
                        name="clock-in"
                        size={20}
                        color={
                          item.att_status === 'Present'
                            ? THEME.primary
                            : THEME.textGray
                        }
                      />
                      <View style={styles.timeInfo}>
                        <Text style={styles.timeLabel}>Clock In</Text>
                        <Text style={styles.timeValue}>
                          {item.clockin
                            ? formatTimeForDisplay(item.clockin)
                            : '--:--'}
                        </Text>
                      </View>
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
                    <View style={styles.timeCardContent}>
                      <Icon
                        name="clock-out"
                        size={20}
                        color={
                          item.att_status === 'Present'
                            ? THEME.danger
                            : THEME.textGray
                        }
                      />
                      <View style={styles.timeInfo}>
                        <Text style={styles.timeLabel}>Clock Out</Text>
                        <Text style={styles.timeValue}>
                          {item.clockout
                            ? formatTimeForDisplay(item.clockout)
                            : '--:--'}
                        </Text>
                      </View>
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
                    <Text style={styles.changeStatusText}>Update Status</Text>
                    <Icon
                      name="chevron-right"
                      size={16}
                      color={THEME.primary}
                    />
                  </TouchableOpacity>
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
                <Icon name="account-group" size={48} color={THEME.textGray} />
                <Text style={styles.emptyText}>No employees found.</Text>
                <Text style={styles.emptySubText}>
                  Tap "Load Employees" to start.
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 100}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Submit Button */}
        {attCart.length > 0 && (
          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={compAttendance}>
              <Icon name="check-circle-outline" size={24} color="white" />
              <Text style={styles.submitText}>Submit Attendance</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Status Modal */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}>
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
                  size={24}
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
      </Modal>

      {/* Custom Message Modal */}
      <Modal
        visible={msgModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMsgModalVisible(false)}>
        <View style={styles.msgModalOverlay}>
          <View style={styles.msgModalContent}>
            <View
              style={[
                styles.msgIconContainer,
                msgType === 'success'
                  ? styles.msgIconSuccess
                  : msgType === 'error'
                  ? styles.msgIconError
                  : styles.msgIconWarning,
              ]}>
              <Icon
                name={
                  msgType === 'success'
                    ? 'check'
                    : msgType === 'error'
                    ? 'close'
                    : 'alert-outline'
                }
                size={32}
                color={
                  msgType === 'success'
                    ? '#10B981'
                    : msgType === 'error'
                    ? '#EF4444'
                    : '#F59E0B'
                }
              />
            </View>
            <Text style={styles.msgTitle}>{msgTitle}</Text>
            <Text style={styles.msgBody}>{msgBody}</Text>
            <TouchableOpacity
              style={[
                styles.msgButton,
                msgType === 'success'
                  ? styles.msgButtonSuccess
                  : msgType === 'error'
                  ? styles.msgButtonError
                  : styles.msgButtonWarning,
              ]}
              onPress={() => setMsgModalVisible(false)}>
              <Text style={styles.msgButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast />
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- Header ---
  headerWrapper: {
    marginBottom: 0,
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },

  contentContainer: {
    flex: 1,
    paddingTop: 10,
  },

  // --- Action Buttons ---
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 2,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionBtnText: {
    color: THEME.white,
    fontWeight: '600',
    fontSize: 14,
  },

  // --- List & Cards ---
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 6,
  },
  employeeInfoSection: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  cnicText: {
    fontSize: 12,
    color: THEME.textGray,
    marginTop: 2,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 12,
    color: THEME.textDark,
    fontWeight: '500',
  },

  // --- Time Input Cards ---
  cardBody: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  timeCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  disabledTimeCard: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
  },
  timeCardContent: {
    flexDirection: 'row',
    alignItems: 'center', // Align icon and text vertically centered
    gap: 8,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 10,
    color: THEME.textGray,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
  },

  // --- Card Footer ---
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  changeStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  changeStatusText: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // --- Empty State ---
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    marginTop: 15,
    color: THEME.textDark,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubText: {
    marginTop: 5,
    color: THEME.textGray,
    fontSize: 14,
  },

  // --- Submit Button ---
  submitContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 10,
  },
  submitButton: {
    backgroundColor: THEME.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    gap: 10,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // --- Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    padding: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 15,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  modalCancelText: {
    fontSize: 16,
    color: THEME.textGray,
    fontWeight: '600',
  },

  // --- Message Modal ---
  msgModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  msgModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    elevation: 10,
  },
  msgIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  msgIconSuccess: {
    backgroundColor: '#D1FAE5',
  },
  msgIconError: {
    backgroundColor: '#FEE2E2',
  },
  msgIconWarning: {
    backgroundColor: '#FEF3C7',
  },
  msgTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  msgBody: {
    fontSize: 16,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  msgButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  msgButtonSuccess: {
    backgroundColor: '#10B981',
  },
  msgButtonError: {
    backgroundColor: '#EF4444',
  },
  msgButtonWarning: {
    backgroundColor: '#F59E0B',
  },
  msgButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
