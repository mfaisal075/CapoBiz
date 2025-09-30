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
  const [empList, setEmpList] = useState<EmployeeList[]>([]);
  const [modal, setModal] = useState('');
  const [empDropdown, setEmpDropdown] = useState<EmployeeDropdown[]>([]);
  const transformedEmp = empDropdown.map(emp => ({
    label: emp.emp_name,
    value: emp.id.toString(),
  }));

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = empList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = empList.slice(
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
      const res = await axios.get(`${BASE_URL}/fetchemployeeattendancelist`);
      setEmpList(res.data.emp);
      setCurrentPage(1); // Reset to first page when data changes
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
    return date; // already in YYYY-MM-DD
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

  useEffect(() => {
    fetchEmpList();
    empDropdownList();
  }, []);

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
            <Text style={styles.headerTitle}>Attendance List</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModal('Add')}
            style={styles.headerBtn}>
            <Icon name="plus-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>
        {/* Employee List */}
        <View style={styles.listContainer}>
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.emp_name?.charAt(0) || 'E'}
                    </Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.employeeName}>{item.emp_name}</Text>
                    <Text style={styles.subText}>ID: {item.empatt_emp_id}</Text>
                  </View>
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

                {/* Info Section */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="clock-in"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Clock In</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.empatt_clockin ?? '--'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="clock-out"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Clock Out</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.empatt_clockout ?? '--'}
                    </Text>
                  </View>

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
                    <Text style={styles.valueText}>
                      {new Date(item.empatt_date)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .replace(/ /g, '-')}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="information-outline"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Status</Text>
                    </View>
                    <Text
                      style={[
                        styles.valueText,
                        {color: getStatusTextColor(item.empatt_att_status)},
                      ]}>
                      {item.empatt_att_status}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-multiple-outline" size={48} color="#666" />
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
                <Icon name="close" size={20} color="#144272" />
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
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="chevron-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="chevron-down" size={18} color="#144272" />
                )}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropDownContainer}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
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
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="chevron-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="chevron-down" size={18} color="#144272" />
                )}
                style={[styles.dropdown, {zIndex: 999}]}
                dropDownContainerStyle={styles.dropDownContainer}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />

              {/* Clock In/Out - Only enabled when status is Present */}
              <View style={styles.timeRow}>
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
                      styles.timeValue,
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
                      styles.timeValue,
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
              </View>

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
                <Icon name="calendar" size={18} color="#144272" />
                <Text style={styles.dateLabel}>Date:</Text>
                <Text style={styles.dateValue}>
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
                <Icon name="close" size={20} color="#144272" />
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
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="chevron-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="chevron-down" size={18} color="#144272" />
                )}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropDownContainer}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
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
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="chevron-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="chevron-down" size={18} color="#144272" />
                )}
                style={[styles.dropdown, {zIndex: 999}]}
                dropDownContainerStyle={styles.dropDownContainer}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />

              {/* Clock In/Out - Only enabled when status is Present */}
              <View style={styles.timeRow}>
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
                      editAttendance.status !== 'Present' &&
                        styles.disabledText,
                    ]}>
                    Clock In:
                  </Text>
                  <Text
                    style={[
                      styles.timeValue,
                      editAttendance.status !== 'Present' &&
                        styles.disabledText,
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
                      editAttendance.status !== 'Present' &&
                        styles.disabledText,
                    ]}>
                    Clock Out:
                  </Text>
                  <Text
                    style={[
                      styles.timeValue,
                      editAttendance.status !== 'Present' &&
                        styles.disabledText,
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
              </View>

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
                <Icon name="calendar" size={18} color="#144272" />
                <Text style={styles.dateLabel}>Date:</Text>
                <Text style={styles.dateValue}>
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
  delAnim: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 8,
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
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    marginRight: 6,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
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
    maxWidth: '50%',
    textAlign: 'right',
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
    color: '#144272',
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
    borderWidth: 1,
    borderColor: '#144272',
    minHeight: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  dropDownContainer: {
    backgroundColor: '#fff',
    borderColor: '#144272',
    borderRadius: 8,
    marginBottom: 15,
    zIndex: 3000,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: '100%',
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 12,
    width: '48%',
    backgroundColor: '#fff',
  },
  timeLabel: {
    color: '#144272',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  timeValue: {
    color: '#144272',
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '600',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  dateLabel: {
    color: '#144272',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  dateValue: {
    color: '#144272',
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#144272',
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
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
  disabledText: {
    color: '#999',
  },

  // Delete Modal Styles
  deleteModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 10,
  },
  deleteIconContainer: {
    marginBottom: 20,
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
