import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  BackHandler,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
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
  info: '#3B82F6',
};

interface EmployeeList {
  id: number;
  emp_name: string;
  empatt_emp_id: string;
  empatt_date: string;
  empatt_clockin: string;
  empatt_clockout: string;
  empatt_att_status: string;
}

interface EmployeeDropdown {
  id: number;
  emp_name: string;
}

interface AddAttendance {
  emp: string;
  status: string;
  clockIn: Date;
  clockOut: Date;
  date: Date;
}

const initialAddAttendance: AddAttendance = {
  clockIn: new Date(),
  clockOut: new Date(),
  date: new Date(),
  emp: '',
  status: 'Present',
};

export default function AllEmployeeAttendanceList({navigation}: any) {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [modal, setModal] = useState('');
  const [empDropdown, setEmpDropdown] = useState<EmployeeDropdown[]>([]);
  const transformedEmp = empDropdown.map(emp => ({
    label: emp.emp_name,
    value: emp.id.toString(),
  }));
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<EmployeeList[]>([]);
  const [masterData, setMasterData] = useState<EmployeeList[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const [showClockInPicker, setShowClockInPicker] = useState(false);
  const [showClockOutPicker, setShowClockOutPicker] = useState(false);
  const [showClockInPickerAdd, setShowClockInPickerAdd] = useState(false);
  const [showClockOutPickerAdd, setShowClockOutPickerAdd] = useState(false);
  const [editAttendance, setEditAttendance] = useState({
    empId: '',
    status: '',
    date: new Date(),
    clockIn: new Date(),
    clockOut: new Date(),
  });
  const [addAttendance, setAddAttendance] =
    useState<AddAttendance>(initialAddAttendance);
  const [selectedEmp, setSelectedEmp] = useState<number | null>(null);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(null);
      return;
    }

    if (selectedDate) {
      if (showDatePicker === 'from') {
        setFromDate(selectedDate);
      } else if (showDatePicker === 'to') {
        setToDate(selectedDate);
      }
    }
    setShowDatePicker(null);
  };

  const handleAddChange = (
    field: keyof AddAttendance,
    value: string | Date,
  ) => {
    setAddAttendance(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditChange = (field: string, value: any) => {
    setEditAttendance(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle time change
  const onClockInChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowClockInPicker(false);
    }
    if (selectedDate) handleEditChange('clockIn', selectedDate);
  };

  const onClockOutChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === 'android') {
      setShowClockOutPicker(false);
    }
    if (selectedDate) handleEditChange('clockOut', selectedDate);
  };

  // Handle Add time change
  const onClockInChangeAdd = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === 'android') {
      setShowClockInPickerAdd(false);
    }
    if (selectedDate) handleAddChange('clockIn', selectedDate);
  };

  const onClockOutChangeAdd = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === 'android') {
      setShowClockOutPickerAdd(false);
    }
    if (selectedDate) handleAddChange('clockOut', selectedDate);
  };

  const [startDate, setStartDate] = useState(new Date());

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || startDate;
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    setStartDate(currentDate);
    handleAddChange('date', currentDate);
  };

  const [showeditDatePicker, setShoweditDatePicker] = useState(false);

  const [customerType, setcustomerType] = useState(false);

  const [customerArea, setcustomerArea] = useState(false);

  const customerAreaItem = [
    {label: 'Present', value: 'Present'},
    {label: 'Leave', value: 'Leave'},
    {label: 'Absent', value: 'Absent'},
  ];

  const [editType, seteditType] = useState(false);

  const [customereditArea, setcustomereditArea] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [warningModal, setWarningModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageTitle, setMessageTitle] = useState('');

  // Fetch Empoyee List
  const fetchEmpList = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];

      const res = await axios.get(
        `${BASE_URL}/fetchemployeeattendancelist?from=${from}&to=${to}&_token=${token}`,
      );

      const empList = res.data.emp;
      setFilteredData(empList);
      setMasterData(empList);
      setCurrentPage(1);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Edit Modal Data
  const fetchEditData = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editempattendance?id=${id}&_token=${token}`,
      );
      const data = res.data;
      setEditAttendance({
        clockIn: new Date(`1970-01-01T${data.empatt_clockin}`),
        clockOut: new Date(`1970-01-01T${data.empatt_clockout}`),
        date: new Date(data.empatt_date),
        empId: data.empatt_emp_id.toString(),
        status: data.empatt_att_status,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Employee Dropdown
  const empDropdownList = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchemployeedata`);
      setEmpDropdown(res.data.emp);
    } catch (error) {
      console.log(error);
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDateForAPI = (date: any) => {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  };

  // Update Attendance
  const updateAttendance = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/updateempattendance`, {
        emp_att_id: selectedEmp,
        emp_id: editAttendance.empId,
        clockin: formatTime(editAttendance.clockIn),
        clockout: formatTime(editAttendance.clockOut),
        date: formatDateForAPI(editAttendance.date),
        att_status: editAttendance.status,
      });
      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        setSuccessModal(true);
        setMessageTitle('Updated!');
        setMessageText('Attendance has been Updated successfully');
        setSelectedEmp(null);
        setModal('');
        fetchEmpList();
      } else if (res.status === 200 && data.status === 203) {
        setWarningModal(true);
        setMessageTitle('Warning!');
        setMessageText('Clockin time must be greater than clockout time!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Mark Attendance
  const markAttendance = async () => {
    if (
      !addAttendance.emp ||
      !addAttendance.status ||
      !addAttendance.clockIn ||
      !addAttendance.clockOut ||
      !addAttendance.date
    ) {
      setWarningModal(true);
      setMessageTitle('Missing Fields');
      setMessageText('Please fill all fields before submitting.');
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/add_attendance`, {
        emp_id: addAttendance.emp,
        clockin:
          addAttendance.status === 'Present'
            ? formatTime(addAttendance.clockIn)
            : '',
        clockout:
          addAttendance.status === 'Present'
            ? formatTime(addAttendance.clockOut)
            : '',
        date: formatDateForAPI(addAttendance.date),
        att_status: addAttendance.status,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        setSuccessModal(true);
        setMessageTitle('Success');
        setMessageText('Attendance Marked Sucessfully');
        setModal('');
        setAddAttendance(initialAddAttendance);
        fetchEmpList();
      } else if (res.status === 200 && data.status === 202) {
        setWarningModal(true);
        setMessageTitle('Warning!');
        setMessageText(
          'Attendance Already added in the record for this employee.',
        );
      } else if (res.status === 200 && data.status === 203) {
        setWarningModal(true);
        setMessageTitle('Warning!');
        setMessageText('Clockout time must be greater than clockin time!');
      } else if (res.status === 200 && data.status === 204) {
        setWarningModal(true);
        setMessageTitle('Warning!');
        setMessageText('Please enter the Clockin Time!');
      } else if (res.status === 200 && data.status === 205) {
        setWarningModal(true);
        setMessageTitle('Warning!');
        setMessageText('Please enter the Clockout Time!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Attendance
  const delAttendance = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/empattendancedelete`, {
        id: selectedEmp,
      });
      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        setSuccessModal(true);
        setMessageTitle('Deleted!');
        setMessageText('Employee Attendance has been deleted successfully.');
        setModal('');
        fetchEmpList();
        setSelectedEmp(null);
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

  // Search Filter
  const searchFilter = (text: string) => {
    if (text) {
      const newData = masterData.filter(item => {
        const itemData = item.emp_name
          ? item.emp_name.toLocaleUpperCase()
          : ''.toLocaleLowerCase();
        const textData = text.toLocaleUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredData(newData);
      setSearchQuery(text);
    } else {
      setFilteredData(masterData);
      setSearchQuery(text);
    }
  };

  useEffect(() => {
    fetchEmpList();
    empDropdownList();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [fromDate, toDate]);

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.headerTitle}>Attendance List</Text>
            <TouchableOpacity
              onPress={() => setModal('Add')}
              style={styles.iconBtn}>
              <Icon name="plus" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Unified Floating Filter Card */}
        <View style={styles.floatingFilterCard}>
          {/* Search Row */}
          <View style={styles.searchRow}>
            <Icon name="magnify" size={20} color={THEME.textGray} />
            <TextInput
              placeholder="Search by employee name"
              placeholderTextColor={THEME.textGray}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={text => searchFilter(text)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => searchFilter('')}>
                <Icon name="close-circle" size={18} color={THEME.textGray} />
              </TouchableOpacity>
            )}
          </View>

          {/* Date Filter Row */}
          <View style={styles.dateFilterRow}>
            <TouchableOpacity
              onPress={() => setShowDatePicker('from')}
              style={styles.dateInput}>
              <Icon name="calendar" size={18} color={THEME.primary} />
              <Text style={styles.dateText}>
                {fromDate ? fromDate.toLocaleDateString() : 'From'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDatePicker('to')}
              style={styles.dateInput}>
              <Icon name="calendar" size={18} color={THEME.primary} />
              <Text style={styles.dateText}>
                {toDate ? toDate.toLocaleDateString() : 'To'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Filter Card Removed - Integrated into Header */}

        {showDatePicker && (
          <DateTimePicker
            value={
              showDatePicker === 'from'
                ? fromDate ?? new Date()
                : toDate ?? new Date()
            }
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Employee List */}
        <View style={styles.listContainer}>
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.employeeInfoSection}>
                    <Text style={styles.employeeName}>{item.emp_name}</Text>
                    <View style={styles.dateSection}>
                      <Icon
                        name="calendar-today"
                        size={14}
                        color={THEME.textDark}
                      />
                      <Text style={styles.dateText}>
                        {new Date(item.empatt_date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Card Body with Time Information */}
                <View style={styles.cardBody}>
                  {/* Clock In */}
                  <View style={styles.timeCard}>
                    <View style={styles.timeCardContent}>
                      <Icon name="clock-in" size={20} color={THEME.primary} />
                      <View style={styles.timeInfo}>
                        <Text style={styles.timeLabel}>Clock In</Text>
                        <Text style={styles.timeValue}>
                          {item.empatt_clockin ? item.empatt_clockin : '——'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Clock Out */}
                  <View style={styles.timeCard}>
                    <View style={styles.timeCardContent}>
                      <Icon name="clock-out" size={20} color={THEME.danger} />
                      <View style={styles.timeInfo}>
                        <Text style={styles.timeLabel}>Clock Out</Text>
                        <Text style={styles.timeValue}>
                          {item.empatt_clockout ? item.empatt_clockout : '——'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Card Footer */}
                <View style={styles.cardFooter}>
                  <View
                    style={[
                      styles.statusBadge,
                      getStatusStyle(item.empatt_att_status),
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        {color: getStatusTextColor(item.empatt_att_status)},
                      ]}>
                      {item.empatt_att_status}
                    </Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => {
                        setModal('Edit');
                        fetchEditData(item.id);
                        setSelectedEmp(item.id);
                      }}
                      style={styles.changeStatusButton}>
                      <Text style={styles.changeStatusText}>Edit</Text>
                      <Icon name="pencil" size={16} color={THEME.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setModal('Delete');
                        setSelectedEmp(item.id);
                      }}
                      style={[styles.changeStatusButton, {marginLeft: 15}]}>
                      <Text
                        style={[
                          styles.changeStatusText,
                          {color: THEME.danger},
                        ]}>
                        Delete
                      </Text>
                      <Icon name="delete" size={16} color={THEME.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon
                  name="account-multiple-outline"
                  size={48}
                  color={THEME.textGray}
                />
                <Text style={styles.emptyText}>
                  No attendance records found.
                </Text>
                <Text style={styles.emptySubText}>
                  Add new attendance records to get started.
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 100}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Floating Pagination */}
        {filteredData.length > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => prev - 1)}
              style={[
                styles.pageButton,
                currentPage === 1 && styles.pageButtonDisabled,
              ]}>
              <Icon name="chevron-left" size={24} color={THEME.white} />
            </TouchableOpacity>

            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(prev => prev + 1)}
              style={[
                styles.pageButton,
                currentPage === totalPages && styles.pageButtonDisabled,
              ]}>
              <Icon name="chevron-right" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        )}

        {/* Custom Success Modal */}
        <Modal isVisible={successModal}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.delAnim}>
              <LottieView
                style={{flex: 1}}
                source={require('../../../assets/success.json')}
                autoPlay
                loop={false}
              />
            </View>
            <Text style={styles.deleteTitle}>{messageTitle}</Text>
            <Text style={styles.deleteSubtitle}>{messageText}</Text>
            <TouchableOpacity
              onPress={() => setSuccessModal(false)}
              style={styles.successButton}>
              <Text style={styles.confirmDeleteText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Custom Warning Modal */}
        <Modal isVisible={warningModal}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.delAnim}>
              <LottieView
                style={{flex: 1}}
                source={require('../../../assets/warning.json')}
                autoPlay
                loop={false}
              />
            </View>
            <Text style={styles.deleteTitle}>{messageTitle}</Text>
            <Text style={styles.deleteSubtitle}>{messageText}</Text>
            <TouchableOpacity
              onPress={() => setWarningModal(false)}
              style={styles.warningButton}>
              <Text style={styles.confirmDeleteText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Add Attendance Modal */}
        <Modal isVisible={modal === 'Add'}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Attendance</Text>
              <TouchableOpacity
                onPress={() => {
                  setModal('');
                  setAddAttendance(initialAddAttendance);
                }}
                style={styles.closeButton}>
                <Icon name="close" size={20} color={THEME.textGray} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Employee</Text>
                <DropDownPicker
                  items={transformedEmp}
                  open={customerType}
                  setOpen={setcustomerType}
                  value={addAttendance.emp}
                  setValue={callback =>
                    handleAddChange('emp', callback(addAttendance.emp))
                  }
                  placeholder="Select Employee"
                  placeholderStyle={{color: '#999'}}
                  textStyle={{color: THEME.textDark}}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                  zIndex={3000}
                  zIndexInverse={1000}
                  searchable
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Status</Text>
                <DropDownPicker
                  items={customerAreaItem}
                  open={customerArea}
                  setOpen={setcustomerArea}
                  value={addAttendance.status}
                  setValue={callback => {
                    handleAddChange('status', callback(addAttendance.status));
                  }}
                  placeholder="Select Status"
                  placeholderStyle={{color: '#999'}}
                  textStyle={{color: THEME.textDark}}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                  zIndex={2000}
                  zIndexInverse={2000}
                />
              </View>

              {/* Time Section */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Time</Text>
                <View style={styles.timeRow}>
                  {/* Clock In */}
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Clock In</Text>
                    <TouchableOpacity
                      style={[
                        styles.timeInput,
                        {
                          opacity:
                            addAttendance.status === 'Leave' ||
                            addAttendance.status === 'Absent'
                              ? 0.5
                              : 1,
                        },
                      ]}
                      disabled={
                        addAttendance.status === 'Leave' ||
                        addAttendance.status === 'Absent'
                      }
                      onPress={() => setShowClockInPickerAdd(prev => !prev)}>
                      <Icon name="clock-in" size={20} color={THEME.primary} />
                      <Text style={styles.timeText}>
                        {addAttendance.clockIn.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Clock Out */}
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Clock Out</Text>
                    <TouchableOpacity
                      style={[
                        styles.timeInput,
                        {
                          opacity:
                            addAttendance.status === 'Leave' ||
                            addAttendance.status === 'Absent'
                              ? 0.5
                              : 1,
                        },
                      ]}
                      disabled={
                        addAttendance.status === 'Leave' ||
                        addAttendance.status === 'Absent'
                      }
                      onPress={() => setShowClockOutPickerAdd(prev => !prev)}>
                      <Icon name="clock-out" size={20} color={THEME.danger} />
                      <Text style={styles.timeText}>
                        {addAttendance.clockOut.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Date Section */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowStartDatePicker(prev => !prev)}>
                  <Icon name="calendar" size={20} color={THEME.primary} />
                  <Text style={styles.dateText}>
                    {addAttendance.date.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Time Pickers INSIDE the Modal */}
              {showClockInPickerAdd && (
                <DateTimePicker
                  value={addAttendance.clockIn}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onClockInChangeAdd}
                />
              )}
              {showClockOutPickerAdd && (
                <DateTimePicker
                  value={addAttendance.clockOut}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onClockOutChangeAdd}
                />
              )}
              {showStartDatePicker && (
                <DateTimePicker
                  testID="startDatePicker"
                  value={addAttendance.date}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={onStartDateChange}
                />
              )}

              <TouchableOpacity
                onPress={markAttendance}
                style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Add Attendance</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/* Edit Attendance Modal */}
        <Modal isVisible={modal === 'Edit'}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Attendance</Text>
              <TouchableOpacity
                onPress={() => setModal('')}
                style={styles.closeButton}>
                <Icon name="close" size={20} color={THEME.textGray} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Employee</Text>
                <DropDownPicker
                  items={transformedEmp}
                  open={editType}
                  setOpen={seteditType}
                  value={editAttendance.empId}
                  setValue={callback =>
                    handleEditChange('empId', callback(editAttendance.empId))
                  }
                  placeholder="Select Employee"
                  placeholderStyle={{color: '#999'}}
                  textStyle={{color: THEME.textDark}}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                  zIndex={3000}
                  zIndexInverse={1000}
                  searchable
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Status</Text>
                <DropDownPicker
                  items={customerAreaItem}
                  open={customereditArea}
                  setOpen={setcustomereditArea}
                  value={editAttendance.status}
                  setValue={callback =>
                    handleEditChange('status', callback(editAttendance.status))
                  }
                  placeholder="Select Status"
                  placeholderStyle={{color: '#999'}}
                  textStyle={{color: THEME.textDark}}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                  zIndex={2000}
                  zIndexInverse={2000}
                />
              </View>

              {/* Time Section */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Time</Text>
                <View style={styles.timeRow}>
                  {/* Clock In */}
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeLabel}>Clock In</Text>
                    <TouchableOpacity
                      style={[
                        styles.timeInput,
                        {
                          opacity:
                            editAttendance.status === 'Leave' ||
                            editAttendance.status === 'Absent'
                              ? 0.5
                              : 1,
                        },
                      ]}
                      disabled={
                        editAttendance.status === 'Leave' ||
                        editAttendance.status === 'Absent'
                      }
                      onPress={() => setShowClockInPicker(prev => !prev)}>
                      <Icon name="clock-in" size={20} color={THEME.primary} />
                      <Text style={styles.timeText}>
                        {editAttendance.clockIn.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Clock Out */}
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeLabel}>Clock Out</Text>
                    <TouchableOpacity
                      style={[
                        styles.timeInput,
                        {
                          opacity:
                            editAttendance.status === 'Leave' ||
                            editAttendance.status === 'Absent'
                              ? 0.5
                              : 1,
                        },
                      ]}
                      disabled={
                        editAttendance.status === 'Leave' ||
                        editAttendance.status === 'Absent'
                      }
                      onPress={() => setShowClockOutPicker(prev => !prev)}>
                      <Icon name="clock-out" size={20} color={THEME.danger} />
                      <Text style={styles.timeText}>
                        {editAttendance.clockOut.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Date Section */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShoweditDatePicker(prev => !prev)}>
                  <Icon name="calendar" size={20} color={THEME.primary} />
                  <Text style={styles.dateText}>
                    {new Date(editAttendance.date).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Time Pickers INSIDE the Modal */}
              {showClockInPicker && (
                <DateTimePicker
                  value={editAttendance.clockIn}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onClockInChange}
                />
              )}
              {showClockOutPicker && (
                <DateTimePicker
                  value={editAttendance.clockOut}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onClockOutChange}
                />
              )}
              {showeditDatePicker && (
                <DateTimePicker
                  value={editAttendance.date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') {
                      setShoweditDatePicker(false);
                    }
                    if (selectedDate) handleEditChange('date', selectedDate);
                  }}
                />
              )}

              <TouchableOpacity
                onPress={updateAttendance}
                style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Update Attendance</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/*Delete Confirmation Modal*/}
        <Modal isVisible={modal === 'Delete'}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.delAnim}>
              <LottieView
                style={{flex: 1}}
                source={require('../../../assets/warning.json')}
                autoPlay
                loop={false}
              />
            </View>
            <Text style={styles.deleteTitle}>Are you sure?</Text>
            <Text style={styles.deleteSubtitle}>
              You won't be able to revert this record!
            </Text>
            <View style={styles.deleteButtonContainer}>
              <TouchableOpacity
                onPress={() => {
                  setModal('');
                  setSelectedEmp(null);
                }}
                style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={delAttendance}
                style={styles.confirmDeleteButton}>
                <Text style={styles.confirmDeleteText}>Yes, delete it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      <BottomBar />
    </SafeAreaView>
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
    paddingBottom: 90, // Extended for larger floating card
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

  // --- Unified Floating Filter Card ---
  floatingFilterCard: {
    position: 'absolute',
    bottom: -60,
    left: 20,
    right: 20,
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    gap: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: THEME.textDark,
    fontSize: 14,
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 8,
  },
  dateText: {
    fontSize: 13,
    color: THEME.textDark,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 13,
    color: THEME.textDark,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timeInputContainer: {
    flex: 1,
    gap: 5,
  },
  timeInputLabel: {
    fontSize: 12,
    color: THEME.textGray,
    fontWeight: '500',
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 8,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 70, // Space for floating card overlap
  },

  // --- Deprecated Filter Styles ---
  filterCard: {
    display: 'none',
  },
  searchContainer: {
    display: 'none',
  },
  floatingSearchContainer: {
    display: 'none',
  },
  floatingSearchInput: {
    display: 'none',
  },
  dateRow: {
    display: 'none',
  },

  // --- List ---
  listContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    marginBottom: 10,
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
    alignItems: 'center',
    paddingBottom: 6,
    marginBottom: 6,
  },
  employeeInfoSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  // --- Time Cards (Compact) ---
  cardBody: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  timeCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  changeStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  changeStatusText: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '600',
    marginRight: 4,
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

  // --- Pagination (Floating) ---
  paginationContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: THEME.primary,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  pageButton: {
    padding: 5,
  },
  pageButtonDisabled: {
    opacity: 0.3,
  },
  pageText: {
    color: THEME.white,
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 15,
  },

  // --- Modal ---
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    maxHeight: 500,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textGray,
    marginBottom: 5,
  },
  dropdown: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 48,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // --- Delete Modal ---
  deleteModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  delAnim: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginBottom: 10,
  },
  deleteSubtitle: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteButtonContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: THEME.textDark,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: THEME.danger,
    alignItems: 'center',
  },
  confirmDeleteText: {
    color: THEME.white,
    fontWeight: '600',
  },
  successButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    marginTop: 10,
  },
  warningButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: THEME.warning,
    alignItems: 'center',
    marginTop: 10,
  },
});
