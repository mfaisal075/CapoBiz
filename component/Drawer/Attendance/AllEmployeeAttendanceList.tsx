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
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

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
        clockin: formatTime(addAttendance.clockIn),
        clockout: formatTime(addAttendance.clockOut),
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
              style={{
                width: 30,
                height: 30,
                tintColor: 'white',
              }}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text
              style={{
                color: 'white',
                fontSize: 22,
                fontWeight: 'bold',
              }}>
              Attendance List
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setModal('Add');
            }}>
            <Image
              style={{
                tintColor: 'white',
                width: 18,
                height: 18,
                alignSelf: 'center',
                marginRight: 5,
              }}
              source={require('../../../assets/add.png')}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Export Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Print</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={empList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <ScrollView
              style={{
                padding: 5,
              }}>
              <View style={styles.table}>
                <View style={styles.tablehead}>
                  <Text
                    style={{
                      color: '#144272',
                      fontWeight: 'bold',
                      marginLeft: 5,
                      marginTop: 5,
                    }}>
                    {item.emp_name}
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        setModal('Edit');
                        fetchEditData(item.id);
                        setSelectedEmp(item.id);
                      }}>
                      <Image
                        style={{
                          tintColor: '#144272',
                          width: 15,
                          height: 15,
                          alignSelf: 'center',
                          marginTop: 8,
                        }}
                        source={require('../../../assets/edit.png')}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setModal('Delete');
                        setSelectedEmp(item.id);
                      }}>
                      <Image
                        style={{
                          tintColor: '#144272',
                          width: 15,
                          height: 15,
                          alignSelf: 'center',
                          marginRight: 5,
                          marginTop: 8,
                        }}
                        source={require('../../../assets/delete.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Clock In:</Text>
                    <Text style={styles.text}>
                      {item.empatt_clockin ?? '--'}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Clock Out:</Text>
                    <Text style={styles.text}>
                      {item.empatt_clockout ?? '--'}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Date:</Text>
                    <Text style={styles.text}>
                      {new Date(item.empatt_date)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .replace(/ /g, '-')}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={[styles.value, {marginBottom: 5}]}>
                      Status:
                    </Text>
                    <Text style={[styles.value, {marginBottom: 5}]}>
                      {item.empatt_att_status}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
          ListEmptyComponent={
            <View
              style={{
                height: 150,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 14, fontWeight: 'bold', color: '#fff'}}>
                No recordfound in the database!
              </Text>
            </View>
          }
        />

        {/*Add Attendance (✔️)*/}
        <Modal isVisible={modal === 'Add'}>
          <View
            style={{
              backgroundColor: 'white',
              width: '98%',
              height: 'auto',
              maxHeight: 335,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Add New Attendance
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModal('');
                  setAddAttendance(initialAddAttendance);
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

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
                <Icon name="keyboard-arrow-up" size={18} color="#144272" />
              )}
              ArrowDownIconComponent={() => (
                <Icon name="keyboard-arrow-down" size={18} color="#144272" />
              )}
              style={styles.dropdown}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: '90%',
                alignSelf: 'center',
                marginTop: 8,
                zIndex: 1000,
              }}
              labelStyle={{color: '#144272'}}
              listItemLabelStyle={{color: '#144272'}}
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
                <Icon name="keyboard-arrow-up" size={18} color="#144272" />
              )}
              ArrowDownIconComponent={() => (
                <Icon name="keyboard-arrow-down" size={18} color="#144272" />
              )}
              style={[
                styles.dropdown,
                {
                  zIndex: 999,
                },
              ]}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: '90%',
                alignSelf: 'center',
                marginTop: 8,
              }}
              labelStyle={{color: '#144272'}}
              listItemLabelStyle={{color: '#144272'}}
            />

            {/* Clock In/Out */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.productinput}
                onPress={() => setShowClockInPickerAdd(true)}>
                <Text style={{color: '#144272'}}>Clock In:</Text>
                <Text style={{color: '#144272'}}>
                  {addAttendance.clockIn.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.productinput}
                onPress={() => setShowClockOutPickerAdd(true)}>
                <Text style={{color: '#144272'}}>Clock Out:</Text>
                <Text style={{color: '#144272'}}>
                  {addAttendance.clockOut.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            </View>
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

            <View
              style={[
                styles.datePicker,
                {
                  justifyContent: 'space-between',
                },
              ]}>
              <Text style={{marginLeft: 8, color: '#144272'}}>
                {`${addAttendance.date.toLocaleDateString()}`}
              </Text>
              <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                <Image
                  style={{
                    height: 20,
                    width: 20,
                    tintColor: '#144272',
                  }}
                  source={require('../../../assets/calendar.png')}
                />
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
            </View>

            <TouchableOpacity onPress={markAttendance}>
              <View
                style={{
                  backgroundColor: '#144272',
                  height: 30,
                  width: 120,
                  margin: 10,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add Attendance
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/*Delete Attendance (✔️)*/}
        <Modal isVisible={modal === 'Delete'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 220,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/info.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Are you sure?
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              You won't be able to revert this record!
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setModal('');
                  setSelectedEmp(null);
                }}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 100,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={delAttendance}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 100,
                    height: 30,
                    padding: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Yes, delete it
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*Edit Employee Attendance (✔️)*/}
        <Modal isVisible={modal === 'Edit'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              height: 'auto',
              maxHeight: 335,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Edit Attendance
              </Text>
              <TouchableOpacity onPress={() => setModal('')}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

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
                <Icon name="keyboard-arrow-up" size={18} color="#144272" />
              )}
              ArrowDownIconComponent={() => (
                <Icon name="keyboard-arrow-down" size={18} color="#144272" />
              )}
              style={[styles.dropdown]}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: '90%',
                alignSelf: 'center',
                zIndex: 1000,
                marginTop: 8,
              }}
              labelStyle={{color: '#144272'}}
              listItemLabelStyle={{color: '#144272'}}
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
                <Icon name="keyboard-arrow-up" size={18} color="#144272" />
              )}
              ArrowDownIconComponent={() => (
                <Icon name="keyboard-arrow-down" size={18} color="#144272" />
              )}
              style={[
                styles.dropdown,
                {
                  zIndex: 999,
                },
              ]}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: '90%',
                alignSelf: 'center',
                marginTop: 8,
              }}
              labelStyle={{color: '#144272'}}
              listItemLabelStyle={{color: '#144272'}}
            />

            {/* Clock In/Out */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.productinput}
                onPress={() => setShowClockInPicker(true)}>
                <Text style={{color: '#144272'}}>Clock In:</Text>
                <Text style={{color: '#144272'}}>
                  {editAttendance.clockIn.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.productinput}
                onPress={() => setShowClockOutPicker(true)}>
                <Text style={{color: '#144272'}}>Clock Out:</Text>
                <Text style={{color: '#144272'}}>
                  {editAttendance.clockOut.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            </View>
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

            {/* Date Picker */}
            <View style={styles.datePicker}>
              <Text style={{marginLeft: 8, color: '#144272'}}>
                {new Date(editAttendance.date).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                onPress={() => setShoweditDatePicker(true)}
                style={{marginLeft: 'auto'}}>
                <Image
                  source={require('../../../assets/calendar.png')}
                  style={{height: 20, width: 20, tintColor: '#144272'}}
                />
              </TouchableOpacity>
            </View>
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

            <TouchableOpacity onPress={updateAttendance}>
              <View
                style={{
                  backgroundColor: '#144272',
                  height: 34,
                  width: 150,
                  margin: 10,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}>
                  Update Attendance
                </Text>
              </View>
            </TouchableOpacity>
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
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 5,
    borderTopLeftRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  value: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 8,
    alignSelf: 'center',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#144272',
    minHeight: 38,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '90%',
    alignSelf: 'center',
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
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 5,
    padding: 5,
    alignSelf: 'center',
    width: '90%',
    height: 38,
    marginTop: 12,
  },
});
