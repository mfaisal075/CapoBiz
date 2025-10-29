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
import backgroundColors from '../../Colors';

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
  status: '',
};

export default function AllEmployeeAttendanceList() {
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
    setShowClockInPicker(false);
    if (selectedDate) handleEditChange('clockIn', selectedDate);
  };

  const onClockOutChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowClockOutPicker(false);
    if (selectedDate) handleEditChange('clockOut', selectedDate);
  };

  // Handle Add time change
  const onClockInChangeAdd = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowClockInPickerAdd(false);
    if (selectedDate) handleAddChange('clockIn', selectedDate);
  };

  const onClockOutChangeAdd = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowClockOutPickerAdd(false);
    if (selectedDate) handleAddChange('clockOut', selectedDate);
  };

  const [startDate, setStartDate] = useState(new Date());

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
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

  const formatTimeForDisplay = (timeString: string) => {
    if (!timeString) return '—';
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
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
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Attendance has been Updated successfully',
          visibilityTime: 1500,
        });
        setSelectedEmp(null);
        setModal('');
        fetchEmpList();
      } else if (res.status === 200 && data.status === 203) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Clockin time must be greater than clockout time!',
          visibilityTime: 2000,
        });
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
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all fields before submitting.',
        visibilityTime: 1500,
      });
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
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Attendance Marked Sucessfully',
          visibilityTime: 1500,
        });
        setModal('');
        setAddAttendance(initialAddAttendance);
        fetchEmpList();
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Attendance already marked!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 203) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Clockout time must be greater than clockin time!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 204) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Please enter the Clockin Time!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 205) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Please enter the Clockout Time!',
          visibilityTime: 2000,
        });
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
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Employee Attendance has been deleted successfully.',
          visibilityTime: 1500,
        });
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
  }, [fromDate, toDate]);

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
            <Text style={styles.headerTitle}>Attendance List</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModal('Add')}
            style={[styles.headerBtn]}>
            <Text style={styles.addBtnText}>Add</Text>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Filter */}
        <View style={styles.searchFilter}>
          <Icon name="magnify" size={36} color={backgroundColors.dark} />
          <TextInput
            placeholder="Search by employee name"
            style={styles.search}
            value={searchQuery}
            onChangeText={text => searchFilter(text)}
          />
        </View>

        {/* Date Range Section */}
        <View style={styles.dateSection}>
          <View style={styles.labelCtr}>
            <Text style={styles.inputLabel}>From:</Text>
            <Text style={styles.inputLabel}>To:</Text>
          </View>

          <View style={styles.dateRow}>
            <TouchableOpacity
              onPress={() => setShowDatePicker('from')}
              style={styles.dateInput}>
              <Icon name="calendar" size={20} color={backgroundColors.dark} />
              <Text style={styles.dateText}>
                {fromDate ? fromDate.toLocaleDateString() : 'From Date'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDatePicker('to')}
              style={styles.dateInput}>
              <Icon name="calendar" size={20} color={backgroundColors.dark} />
              <Text style={styles.dateText}>
                {toDate ? toDate.toLocaleDateString() : 'To Date'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
                  <Text style={styles.employeeName}>{item.emp_name}</Text>
                  <View style={[styles.dateSection, {flexDirection: 'row'}]}>
                    <Icon name="calendar-today" size={16} color="#666" />
                    <Text style={styles.dateTextFooter}>
                      {new Date(item.empatt_date)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .replace(/ /g, '-')}
                    </Text>
                  </View>
                </View>

                {/* Card Body with Time Information */}
                <View style={styles.cardBody}>
                  {/* Clock In */}
                  <View style={styles.timeCard}>
                    <View style={styles.timeCardLeft}>
                      <View
                        style={[
                          styles.iconCircle,
                          {backgroundColor: '#E8F5E9'},
                        ]}>
                        <Icon name="clock-in" size={20} color="#2A652B" />
                      </View>
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
                    <View style={styles.timeCardLeft}>
                      <View
                        style={[
                          styles.iconCircle,
                          {backgroundColor: '#FFEBEE'},
                        ]}>
                        <Icon name="clock-out" size={20} color="#D32F2F" />
                      </View>
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
                    <Icon
                      name={
                        item.empatt_att_status === 'Present'
                          ? 'check-circle'
                          : item.empatt_att_status === 'Absent'
                          ? 'close-circle'
                          : 'information'
                      }
                      size={14}
                      color={getStatusTextColor(item.empatt_att_status)}
                    />
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
                      style={styles.editButton}>
                      <Icon name="pencil" size={16} color="#144272" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setModal('Delete');
                        setSelectedEmp(item.id);
                      }}
                      style={styles.deleteButton}>
                      <Icon name="delete" size={16} color="#F44336" />
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
                  color={backgroundColors.dark}
                />
                <Text style={styles.emptyText}>
                  No attendance records found.
                </Text>
                <Text style={styles.emptySubText}>
                  Add new attendance records to get started.
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 40}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => prev - 1)}
              style={[
                styles.pageButton,
                currentPage === 1 && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === 1 && styles.pageButtonTextDisabled,
                ]}>
                Prev
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                Page <Text style={styles.pageCurrent}>{currentPage}</Text> of{' '}
                {totalPages}
              </Text>
              <Text style={styles.totalText}>
                Total: {totalRecords} records
              </Text>
            </View>

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(prev => prev + 1)}
              style={[
                styles.pageButton,
                currentPage === totalPages && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === totalPages && styles.pageButtonTextDisabled,
                ]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/*Add Attendance Modal*/}
        <Modal isVisible={modal === 'Add'}>
          <Toast />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Attendance</Text>
              <TouchableOpacity
                onPress={() => {
                  setModal('');
                  setAddAttendance(initialAddAttendance);
                }}
                style={styles.closeButton}>
                <Icon name="close" size={20} color={backgroundColors.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              <DropDownPicker
                items={transformedEmp}
                open={customerType}
                setOpen={setcustomerType}
                value={addAttendance.emp}
                setValue={callback =>
                  handleAddChange('emp', callback(addAttendance.emp))
                }
                placeholder="Select Employee"
                placeholderStyle={{color: backgroundColors.dark}}
                textStyle={{color: backgroundColors.dark}}
                ArrowUpIconComponent={() => (
                  <Icon
                    name="chevron-up"
                    size={18}
                    color={backgroundColors.dark}
                  />
                )}
                ArrowDownIconComponent={() => (
                  <Icon
                    name="chevron-down"
                    size={18}
                    color={backgroundColors.dark}
                  />
                )}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropDownContainer}
                listItemLabelStyle={{
                  color: backgroundColors.dark,
                  fontWeight: '500',
                }}
                labelStyle={{
                  color: backgroundColors.dark,
                  fontSize: 16,
                }}
                searchable
                searchTextInputStyle={{
                  borderWidth: 0,
                  width: '100%',
                }}
                searchContainerStyle={{
                  borderColor: backgroundColors.gray,
                }}
                listMode="SCROLLVIEW"
              />

              <DropDownPicker
                items={customerAreaItem}
                open={customerArea}
                setOpen={setcustomerArea}
                value={addAttendance.status}
                setValue={callback => {
                  handleAddChange('status', callback(addAttendance.status));
                }}
                placeholder="Select Status"
                placeholderStyle={{color: backgroundColors.dark}}
                textStyle={{color: backgroundColors.dark}}
                ArrowUpIconComponent={() => (
                  <Icon
                    name="chevron-up"
                    size={18}
                    color={backgroundColors.dark}
                  />
                )}
                ArrowDownIconComponent={() => (
                  <Icon
                    name="chevron-down"
                    size={18}
                    color={backgroundColors.dark}
                  />
                )}
                style={[styles.dropdown, {zIndex: 999}]}
                dropDownContainerStyle={styles.dropDownContainer}
                listItemLabelStyle={{
                  color: backgroundColors.dark,
                  fontWeight: '500',
                }}
                labelStyle={{
                  color: backgroundColors.dark,
                  fontSize: 16,
                }}
                listMode="SCROLLVIEW"
              />

              {/* Clock In/Out - Only enabled when status is Present */}

              <TouchableOpacity
                style={[
                  styles.timeInput,
                  addAttendance.status !== 'Present' &&
                    styles.disabledTimeInput,
                ]}
                onPress={() => {
                  if (addAttendance.status === 'Present') {
                    setShowClockInPickerAdd(true);
                  }
                }}
                disabled={addAttendance.status !== 'Present'}>
                <Text
                  style={[
                    styles.timeLabel,
                    addAttendance.status !== 'Present' && styles.disabledText,
                  ]}>
                  Clock In:
                </Text>
                <Text
                  style={[
                    styles.timeValueModal,
                    addAttendance.status !== 'Present' && styles.disabledText,
                  ]}>
                  {addAttendance.clockIn.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {addAttendance.status !== 'Present' && (
                  <Icon
                    name="lock"
                    size={16}
                    color="#999"
                    style={{marginLeft: 6}}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.timeInput,
                  addAttendance.status !== 'Present' &&
                    styles.disabledTimeInput,
                ]}
                onPress={() => {
                  if (addAttendance.status === 'Present') {
                    setShowClockOutPickerAdd(true);
                  }
                }}
                disabled={addAttendance.status !== 'Present'}>
                <Text
                  style={[
                    styles.timeLabel,
                    addAttendance.status !== 'Present' && styles.disabledText,
                  ]}>
                  Clock Out:
                </Text>
                <Text
                  style={[
                    styles.timeValueModal,
                    addAttendance.status !== 'Present' && styles.disabledText,
                  ]}>
                  {addAttendance.clockOut.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {addAttendance.status !== 'Present' && (
                  <Icon
                    name="lock"
                    size={16}
                    color="#999"
                    style={{marginLeft: 6}}
                  />
                )}
              </TouchableOpacity>

              {/* Only show time pickers when status is Present */}
              {showClockInPickerAdd && addAttendance.status === 'Present' && (
                <DateTimePicker
                  value={addAttendance.clockIn}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onClockInChangeAdd}
                />
              )}
              {showClockOutPickerAdd && addAttendance.status === 'Present' && (
                <DateTimePicker
                  value={addAttendance.clockOut}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onClockOutChangeAdd}
                />
              )}

              <TouchableOpacity
                style={styles.datePickerContainer}
                onPress={() => setShowStartDatePicker(true)}>
                <Icon name="calendar" size={18} color={backgroundColors.dark} />
                <Text style={styles.dateLabelModal}>Date:</Text>
                <Text style={styles.dateValueModal}>
                  {addAttendance.date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

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
                <Icon name="check-circle" size={18} color="white" />
                <Text style={styles.submitButtonText}>Add Attendance</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/*Edit Attendance Modal*/}
        <Modal isVisible={modal === 'Edit'}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Attendance</Text>
              <TouchableOpacity
                onPress={() => setModal('')}
                style={styles.closeButton}>
                <Icon name="close" size={20} color={backgroundColors.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              <DropDownPicker
                items={transformedEmp}
                open={editType}
                setOpen={seteditType}
                value={editAttendance.empId}
                setValue={callback =>
                  handleEditChange('empId', callback(editAttendance.empId))
                }
                placeholder="Select Employee"
                placeholderStyle={{color: backgroundColors.dark}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon
                    name="chevron-up"
                    size={18}
                    color={backgroundColors.dark}
                  />
                )}
                ArrowDownIconComponent={() => (
                  <Icon
                    name="chevron-down"
                    size={18}
                    color={backgroundColors.dark}
                  />
                )}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropDownContainer}
                listItemLabelStyle={{
                  color: backgroundColors.dark,
                  fontWeight: '500',
                }}
                labelStyle={{
                  color: backgroundColors.dark,
                  fontSize: 16,
                }}
                searchable
                searchTextInputStyle={{
                  borderWidth: 0,
                  width: '100%',
                }}
                searchContainerStyle={{
                  borderColor: backgroundColors.gray,
                }}
                listMode="SCROLLVIEW"
              />

              <DropDownPicker
                items={customerAreaItem}
                open={customereditArea}
                setOpen={setcustomereditArea}
                value={editAttendance.status}
                setValue={callback =>
                  handleEditChange('status', callback(editAttendance.status))
                }
                placeholder="Select Status"
                placeholderStyle={{color: backgroundColors.dark}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon
                    name="chevron-up"
                    size={18}
                    color={backgroundColors.dark}
                  />
                )}
                ArrowDownIconComponent={() => (
                  <Icon
                    name="chevron-down"
                    size={18}
                    color={backgroundColors.dark}
                  />
                )}
                style={[styles.dropdown, {zIndex: 999}]}
                dropDownContainerStyle={styles.dropDownContainer}
                listItemLabelStyle={{
                  color: backgroundColors.dark,
                  fontWeight: '500',
                }}
                labelStyle={{
                  color: backgroundColors.dark,
                  fontSize: 16,
                }}
                listMode="SCROLLVIEW"
              />

              {/* Clock In/Out - Only enabled when status is Present */}

              <TouchableOpacity
                style={[
                  styles.timeInput,
                  editAttendance.status !== 'Present' &&
                    styles.disabledTimeInput,
                ]}
                onPress={() => {
                  if (editAttendance.status === 'Present') {
                    setShowClockInPicker(true);
                  }
                }}
                disabled={editAttendance.status !== 'Present'}>
                <Text
                  style={[
                    styles.timeLabel,
                    editAttendance.status !== 'Present' && styles.disabledText,
                  ]}>
                  Clock In:
                </Text>
                <Text
                  style={[
                    styles.timeValueModal,
                    editAttendance.status !== 'Present' && styles.disabledText,
                  ]}>
                  {editAttendance.clockIn.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {editAttendance.status !== 'Present' && (
                  <Icon
                    name="lock"
                    size={16}
                    color="#999"
                    style={{marginLeft: 6}}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.timeInput,
                  editAttendance.status !== 'Present' &&
                    styles.disabledTimeInput,
                ]}
                onPress={() => {
                  if (editAttendance.status === 'Present') {
                    setShowClockOutPicker(true);
                  }
                }}
                disabled={editAttendance.status !== 'Present'}>
                <Text
                  style={[
                    styles.timeLabel,
                    editAttendance.status !== 'Present' && styles.disabledText,
                  ]}>
                  Clock Out:
                </Text>
                <Text
                  style={[
                    styles.timeValueModal,
                    editAttendance.status !== 'Present' && styles.disabledText,
                  ]}>
                  {editAttendance.clockOut.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {editAttendance.status !== 'Present' && (
                  <Icon
                    name="lock"
                    size={16}
                    color="#999"
                    style={{marginLeft: 6}}
                  />
                )}
              </TouchableOpacity>

              {/* Only show time pickers when status is Present */}
              {showClockInPicker && editAttendance.status === 'Present' && (
                <DateTimePicker
                  value={editAttendance.clockIn}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onClockInChange}
                />
              )}
              {showClockOutPicker && editAttendance.status === 'Present' && (
                <DateTimePicker
                  value={editAttendance.clockOut}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onClockOutChange}
                />
              )}

              {/* Date Picker */}
              <TouchableOpacity
                style={styles.datePickerContainer}
                onPress={() => setShoweditDatePicker(true)}>
                <Icon name="calendar" size={18} color={backgroundColors.dark} />
                <Text style={styles.dateLabelModal}>Date:</Text>
                <Text style={styles.dateValueModal}>
                  {new Date(editAttendance.date).toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              {showeditDatePicker && (
                <DateTimePicker
                  value={editAttendance.date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShoweditDatePicker(false);
                    if (selectedDate) handleEditChange('date', selectedDate);
                  }}
                />
              )}

              <TouchableOpacity
                onPress={updateAttendance}
                style={styles.submitButton}>
                <Icon name="check-circle" size={18} color="white" />
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
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.light,
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

  // Search Filter
  searchFilter: {
    width: '94%',
    alignSelf: 'center',
    height: 48,
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  search: {
    height: '100%',
    fontSize: 14,
    color: backgroundColors.dark,
    width: '100%',
  },

  // Date Filteration
  dateSection: {
    gap: 6,
  },
  labelCtr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    paddingHorizontal: '3%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginLeft: 3,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '3%',
    marginBottom: 10,
  },
  dateInput: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
  },
  dateText: {
    color: backgroundColors.dark,
    fontSize: 14,
    marginLeft: 8,
  },

  delAnim: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },

  // Card Style
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
    paddingVertical: 12,
    backgroundColor: '#FAFFFE',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E9',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 4,
    letterSpacing: 0.3,
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
  dateTextFooter: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
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

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: backgroundColors.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: -2},
    elevation: 6,
  },
  pageButton: {
    backgroundColor: backgroundColors.info,
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
    color: backgroundColors.light,
    fontWeight: '600',
    fontSize: 14,
  },
  pageButtonTextDisabled: {
    color: backgroundColors.dark,
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

  // Modal Styles
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    maxHeight: '80%',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.dark,
  },
  closeButton: {
    padding: 4,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  dropdown: {
    backgroundColor: backgroundColors.light,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
    marginBottom: 16,
    zIndex: 2999,
  },
  dropDownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    maxHeight: 200,
    zIndex: 3000,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: '100%',
  },
  timeInput: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
    marginBottom: 16,
  },
  timeValueModal: {
    color: backgroundColors.dark,
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '600',
  },
  datePickerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
    marginBottom: 20,
  },
  dateLabelModal: {
    color: backgroundColors.dark,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  dateValueModal: {
    color: backgroundColors.dark,
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: backgroundColors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  disabledTimeInput: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  disabledText: {
    color: '#111',
  },

  // Delete Modal Styles
  deleteModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 10,
  },
  deleteTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 10,
    textAlign: 'center',
  },
  deleteSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  deleteButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmDeleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    shadowColor: '#F44336',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 5,
  },
  confirmDeleteText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
});
