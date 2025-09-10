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
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
import Modal from 'react-native-modal';
import {Checkbox, RadioButton} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Employee {
  id: number;
  emp_name: string;
  emp_address: string;
  emp_contact: string;
  emp_cnic: string;
  emp_email: string;
}

interface EmployeeView {
  id: number;
  emp_name: string;
  emp_address: string;
  emp_contact: string;
  emp_cnic: string;
  emp_email: string;
  emp_fathername: string;
  emp_sec_contact: string;
  emp_third_contact: string;
  emp_contact_person_one: string;
  emp_contact_person_two: string;
  emp_opening_balance: string;
  emp_transaction_type: string;
  emp_payment_type: string;
  emp_status: string;
  emp_image: string;
  emp_type: string;
  created_at: string;
  updated_at: string;
}

interface AddEmployeeForm {
  emp_name: string;
  fathername: string;
  contact: string;
  cnic: string;
  contact_person_one: string;
  sec_contact: string;
  contact_person_two: string;
  third_contact: string;
  email: string;
  address: string;
  emp_type: string;
  employeetype: string;
  opening_balancechechboc: string;
  opening_balance: string;
  transfer_type: string;
  transaction_type: string;
}

const initialAddEmployee: AddEmployeeForm = {
  emp_name: '',
  address: '',
  cnic: '',
  contact: '',
  contact_person_one: '',
  contact_person_two: '',
  email: '',
  emp_type: '',
  employeetype: '',
  fathername: '',
  opening_balance: '',
  opening_balancechechboc: '',
  sec_contact: '',
  third_contact: '',
  transaction_type: '',
  transfer_type: '',
};

interface EditEmployee {
  id: number;
  emp_name: string;
  emp_fathername: string;
  emp_contact: string;
  emp_cnic: string;
  emp_contact_person_one: string;
  emp_sec_contact: string;
  emp_contact_person_two: string;
  emp_third_contact: string;
  emp_email: string;
  emp_address: string;
  emp_type: string;
}

const initialEditEmployee: EditEmployee = {
  id: 0,
  emp_address: '',
  emp_cnic: '',
  emp_contact: '',
  emp_contact_person_one: '',
  emp_contact_person_two: '',
  emp_email: '',
  emp_name: '',
  emp_type: '',
  emp_fathername: '',
  emp_sec_contact: '',
  emp_third_contact: '',
};

export default function EmployeesPeople() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [viewEmp, setViewEmp] = useState<EmployeeView[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<number | null>(null);
  const [btncustomerarea, setbtncustomerarea] = useState(false);
  const [addForm, setAddForm] = useState<AddEmployeeForm>(initialAddEmployee);
  const [enableBal, setEnableBal] = useState<string[]>([]);
  const [editForm, setEditForm] = useState<EditEmployee>(initialEditEmployee);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = employeeData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = employeeData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Add form On Change
  const onChange = (field: keyof AddEmployeeForm, value: string) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Edit form on change
  const editOnchange = (field: keyof EditEmployee, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const [paymentType, setpaymentType] = useState(false);
  const [current, setcurrentpaymentType] = useState<string | null>('');
  const paymentTypeItem = [
    {label: 'Payable', value: 'payable'},
    {label: 'Recievable', value: 'recievable'},
  ];
  const [Worker, setWorker] = useState<'Worker' | 'other'>('Worker');
  const [editWorker, setEditWorker] = useState<'Worker' | 'other'>('Worker');

  const [btncustomeraditarea, setbtncustomereditarea] = useState(false);

  // Fetch Employee
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchemployeedata`);
      setEmployeeData(res.data.emp);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Employee
  const delEmployee = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/employeedelete`, {
        id: selectedEmp,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Employee has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setSelectedEmp(null);
        setModalVisible('');
        fetchEmployees();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Add Employee
  const addEmployee = async () => {
    if (
      !addForm.emp_name.trim() ||
      !addForm.fathername.trim() ||
      !addForm.contact.trim() ||
      !addForm.email.trim() ||
      !addForm.address.trim() ||
      !addForm.cnic.trim()
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all required fields.',
        visibilityTime: 2000,
      });
      return;
    }

    if (Worker === 'other' && !addForm.employeetype.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all required fields.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addemployee`, {
        emp_name: addForm.emp_name.trim(),
        fathername: addForm.fathername.trim(),
        contact: addForm.contact,
        cnic: addForm.cnic,
        contact_person_one: addForm.contact_person_one,
        contact_person_two: addForm.contact_person_two,
        sec_contact: addForm.sec_contact,
        third_contact: addForm.third_contact,
        email: addForm.email.trim(),
        address: addForm.address.trim(),
        ...(enableBal.includes('on') && {opening_balancechechboc: 'on'}),
        ...(enableBal.includes('on') && {
          opening_balance: addForm.opening_balance,
        }),
        ...(enableBal.includes('on') && {transfer_type: current}),
        ...(enableBal.includes('on') && {
          transaction_type:
            current === 'payable'
              ? 'Credit Amount'
              : current === 'recievable'
              ? 'Debit Amount'
              : '',
          ...(Worker.includes('Worker') && {emp_type: 'Worker'}),
          ...(Worker.includes('other') && {emp_type: 'other'}),
          ...(Worker.includes('other') && {employeetype: addForm.employeetype}),
        }),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Employee has been Added successfully',
          visibilityTime: 1500,
        });
        fetchEmployees();
        setAddForm(initialAddEmployee);
        setEnableBal([]);
        setcurrentpaymentType('');
        setModalVisible('');
        setWorker('Worker');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Edit Employee
  const editEmployee = async () => {
    // Validation - ensure required fields aren't empty
    if (
      !editForm.emp_name?.trim() ||
      !editForm.emp_fathername?.trim() ||
      !editForm.emp_contact?.trim() ||
      !editForm.emp_email?.trim() ||
      !editForm.emp_address?.trim() ||
      !editForm.emp_cnic?.trim()
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all required fields.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      // Determine employee type
      let empType;
      if (editWorker.includes('Worker')) {
        empType = 'Worker';
      } else if (editWorker.includes('other')) {
        empType = editForm.emp_type;
      }

      const playload = {
        emp_id: editForm.id,
        emp_name: editForm.emp_name.trim(),
        fathername: editForm.emp_fathername.trim(),
        contact: editForm.emp_contact,
        cnic: editForm.emp_cnic,
        contact_person_one: editForm.emp_contact_person_one,
        contact_person_two: editForm.emp_contact_person_two,
        sec_contact: editForm.emp_sec_contact,
        third_contact: editForm.emp_third_contact,
        email: editForm.emp_email,
        address: editForm.emp_address.trim(),
        emp_type: empType,
      };
      const res = await axios.post(`${BASE_URL}/updateemployee`, playload);

      if (res.status === 200 && res.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!', // Changed from "Added!"
          text2: 'Employee has been updated successfully',
          visibilityTime: 1500,
        });
        fetchEmployees();
        setEditForm(initialEditEmployee);
        setModalVisible(''); // Close modal properly
        setEditWorker('Worker');
      } else {
        // Handle non-200 status responses
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: res.data.message || 'Unknown error occurred',
          visibilityTime: 2000,
        });
      }
    } catch (error: any) {
      console.error('Update Error:', error);
      // Show actual error message to user
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.response?.data?.message || error.message,
        visibilityTime: 3000,
      });
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
            justifyContent: 'space-between',
            marginBottom: 15,
          }}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../assets/menu.png')}
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
              Employees
            </Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible('AddEmp')}>
            <Image
              style={{
                tintColor: 'white',
                width: 18,
                height: 18,
                alignSelf: 'center',
                marginRight: 5,
              }}
              source={require('../../assets/add.png')}
            />
          </TouchableOpacity>
        </View>

        <View>
          <FlatList
            data={currentData}
            style={{marginBottom: 90}}
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
                          setModalVisible('View Employee');
                          const fetchDetails = async (id: number) => {
                            try {
                              const res = await axios.get(
                                `${BASE_URL}/employeesshow?id=${id}&_token=${token}`,
                              );
                              setViewEmp([res.data]);
                            } catch (error) {
                              console.log(error);
                            }
                          };

                          fetchDetails(item.id);
                        }}>
                        <Image
                          style={{
                            tintColor: '#144272',
                            width: 15,
                            height: 15,
                            alignSelf: 'center',
                            marginRight: 5,
                            marginTop: 9,
                          }}
                          source={require('../../assets/show.png')}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setModalVisible('EditEmp');
                          const fetchEditData = async (id: number) => {
                            try {
                              const res = await axios.get(
                                `${BASE_URL}/editemployee?id=${id}&_token=${token}`,
                              );
                              setEditForm(res.data);
                            } catch (error) {
                              console.log(error);
                            }
                          };

                          fetchEditData(item.id);
                        }}>
                        <Image
                          style={{
                            tintColor: '#144272',
                            width: 15,
                            height: 15,
                            alignSelf: 'center',
                            marginTop: 8,
                          }}
                          source={require('../../assets/edit.png')}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setModalVisible('EmpDelete');
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
                          source={require('../../assets/delete.png')}
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
                      <Text style={styles.text}>Email:</Text>
                      <Text style={styles.text}>{item.emp_email ?? 'N/A'}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Contact:</Text>
                      <Text style={styles.text}>
                        {item.emp_contact ?? 'N/A'}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>CNIC:</Text>
                      <Text style={styles.text}>{item.emp_cnic ?? 'N/A'}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        Address:
                      </Text>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        {item.emp_address ?? 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No Employee found.
                </Text>
              </View>
            }
          />
        </View>

        {/*Add Employee*/}
        <Modal isVisible={modalVisible === 'AddEmp'}>
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 620,
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
                Add New Employee
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setAddForm(initialAddEmployee);
                  setEnableBal([]);
                  setWorker('Worker');
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Employee Name"
                value={addForm.emp_name}
                onChangeText={t => onChange('emp_name', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Father Name"
                value={addForm.fathername}
                onChangeText={t => onChange('fathername', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Email"
                value={addForm.email}
                onChangeText={t => onChange('email', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Address"
                value={addForm.address}
                onChangeText={t => onChange('address', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact"
                value={addForm.contact}
                keyboardType="phone-pad"
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  onChange('contact', cleaned);
                }}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="CNIC"
                value={addForm.cnic}
                keyboardType="number-pad"
                maxLength={15}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 5 digits
                  if (cleaned.length > 5) {
                    cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                  }
                  // Insert another dash after 7 more digits (total 13 digits: 5-7-1)
                  if (cleaned.length > 13) {
                    cleaned =
                      cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                  }
                  // Limit to 15 characters (including dashes)
                  if (cleaned.length > 15) {
                    cleaned = cleaned.slice(0, 15);
                  }
                  onChange('cnic', cleaned);
                }}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person One"
                value={addForm.contact_person_one}
                keyboardType="phone-pad"
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  onChange('contact_person_one', cleaned);
                }}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person Two"
                value={addForm.contact_person_two}
                keyboardType="phone-pad"
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  onChange('contact_person_two', cleaned);
                }}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 2"
                value={addForm.sec_contact}
                keyboardType="phone-pad"
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  onChange('sec_contact', cleaned);
                }}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 3"
                keyboardType="numeric"
                value={addForm.third_contact}
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  onChange('third_contact', cleaned);
                }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  marginLeft: 6,
                  marginRight: 50,
                  alignItems: 'center',
                }}
                onPress={() => setWorker('Worker')}
                activeOpacity={0.7}>
                <RadioButton
                  value="Worker"
                  status={Worker === 'Worker' ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                  onPress={() => setWorker('Worker')}
                />
                <Text
                  style={{
                    color: '#144272',
                    marginTop: 7,
                    marginLeft: -5,
                  }}>
                  Worker
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  marginLeft: 28,
                  alignItems: 'center',
                }}
                onPress={() => setWorker('other')}
                activeOpacity={0.7}>
                <RadioButton
                  value="other"
                  status={Worker === 'other' ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                  onPress={() => setWorker('other')}
                />
                <Text
                  style={{
                    color: '#144272',
                    marginTop: 7,
                    marginLeft: -5,
                  }}>
                  Other
                </Text>
              </TouchableOpacity>
            </View>

            {Worker === 'other' && (
              <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
                <TextInput
                  style={styles.productinput}
                  placeholderTextColor={'#144272'}
                  placeholder="Other"
                  keyboardType="default"
                  value={addForm.employeetype}
                  onChangeText={t => onChange('employeetype', t)}
                />
              </View>
            )}

            <View
              style={[
                styles.row,
                {
                  marginLeft: 7,
                  marginRight: 10,
                  justifyContent: 'flex-start',
                  zIndex: 999,
                },
              ]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
                activeOpacity={0.7}
                onPress={() => {
                  const newOptions = enableBal.includes('on')
                    ? enableBal.filter(opt => opt !== 'on')
                    : [...enableBal, 'on'];
                  setEnableBal(newOptions);
                }}>
                <Checkbox.Android
                  status={enableBal.includes('on') ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                />
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Enable Opening Balance
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Opening balance"
                keyboardType="numeric"
                value={addForm.opening_balance}
                onChangeText={t => onChange('opening_balance', t)}
                editable={enableBal.includes('on')}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 8,
                marginRight: 10,
                zIndex: 999,
              }}>
              <DropDownPicker
                items={paymentTypeItem}
                open={paymentType}
                setOpen={setpaymentType}
                value={current}
                setValue={setcurrentpaymentType}
                placeholder="Payment Type"
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
                    borderColor: '#144272',
                    width: '100%',
                    marginLeft: 0,
                    height: 40,
                    backgroundColor: enableBal.includes('on')
                      ? 'transparent'
                      : '#e0e0e0',
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '100%',
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                disabled={!enableBal.includes('on')}
                listMode="SCROLLVIEW"
              />
            </View>

            <View
              style={[
                styles.row,
                {marginLeft: 7, marginRight: 10, marginTop: -1},
              ]}>
              <TextInput
                style={[
                  styles.productinput,
                  {
                    color: '#144272',
                    backgroundColor:
                      current === 'recievable'
                        ? 'gray'
                        : current === 'payable'
                        ? 'gray'
                        : enableBal.includes('on')
                        ? 'gray'
                        : '#e0e0e0',
                  },
                ]}
                placeholder={
                  current === 'recievable'
                    ? 'Debit Amount'
                    : current === 'payable'
                    ? 'Credit Amount'
                    : 'Balance'
                }
                editable={
                  current === 'recievable'
                    ? false
                    : current === 'payable'
                    ? false
                    : enableBal.includes('on')
                }
              />
            </View>

            <TouchableOpacity onPress={() => addEmployee()}>
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
                  Add Employee
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*btn employee*/}
        <Modal isVisible={btncustomerarea}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Added
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Employee has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => setbtncustomerarea(!btncustomerarea)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*Epmloyee Delete*/}
        <Modal isVisible={modalVisible === 'EmpDelete'}>
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
              source={require('../../assets/info.png')}
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
                  setModalVisible('');
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

              <TouchableOpacity onPress={delEmployee}>
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

        {/*Edit Employee*/}
        <Modal isVisible={modalVisible === 'EditEmp'}>
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 480,
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
                Edit Employee
              </Text>
              <TouchableOpacity onPress={() => setModalVisible('')}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Customer Name"
                value={editForm.emp_name}
                onChangeText={t => editOnchange('emp_name', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Father Name"
                value={editForm.emp_fathername}
                onChangeText={t => editOnchange('emp_fathername', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Email"
                value={editForm.emp_email}
                onChangeText={t => editOnchange('emp_email', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Address"
                value={editForm.emp_address}
                onChangeText={t => editOnchange('emp_address', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact"
                value={editForm.emp_contact}
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  editOnchange('emp_contact', cleaned);
                }}
                keyboardType="number-pad"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="CNIC"
                value={editForm.emp_cnic}
                maxLength={15}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 5 digits
                  if (cleaned.length > 5) {
                    cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                  }
                  // Insert another dash after 7 more digits (total 13 digits: 5-7-1)
                  if (cleaned.length > 13) {
                    cleaned =
                      cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                  }
                  // Limit to 15 characters (including dashes)
                  if (cleaned.length > 15) {
                    cleaned = cleaned.slice(0, 15);
                  }
                  editOnchange('emp_cnic', cleaned);
                }}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person One"
                value={editForm.emp_contact_person_one}
                keyboardType="phone-pad"
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  editOnchange('emp_contact_person_one', cleaned);
                }}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person Two"
                value={editForm.emp_contact_person_two}
                keyboardType="phone-pad"
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  editOnchange('emp_contact_person_two', cleaned);
                }}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 2"
                value={editForm.emp_sec_contact}
                keyboardType="phone-pad"
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  editOnchange('emp_sec_contact', cleaned);
                }}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 3"
                keyboardType="numeric"
                value={editForm.emp_third_contact}
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  editOnchange('emp_third_contact', cleaned);
                }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  marginLeft: 6,
                  marginRight: 50,
                  alignItems: 'center',
                }}
                onPress={() => setEditWorker('Worker')}
                activeOpacity={0.7}>
                <RadioButton
                  value="Worker"
                  status={editWorker === 'Worker' ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                  onPress={() => setEditWorker('Worker')}
                />
                <Text
                  style={{
                    color: '#144272',
                    marginTop: 7,
                    marginLeft: -5,
                  }}>
                  Worker
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  marginLeft: 28,
                  alignItems: 'center',
                }}
                onPress={() => setEditWorker('other')}
                activeOpacity={0.7}>
                <RadioButton
                  value="other"
                  status={editWorker === 'other' ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                  onPress={() => setEditWorker('other')}
                />
                <Text
                  style={{
                    color: '#144272',
                    marginTop: 7,
                    marginLeft: -5,
                  }}>
                  Other
                </Text>
              </TouchableOpacity>
            </View>

            {editWorker === 'other' && (
              <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
                <TextInput
                  style={styles.productinput}
                  placeholderTextColor={'#144272'}
                  placeholder="Other"
                  keyboardType="default"
                  value={editForm.emp_type}
                  onChangeText={t => editOnchange('emp_type', t)}
                />
              </View>
            )}

            <TouchableOpacity onPress={editEmployee}>
              <View
                style={{
                  backgroundColor: '#144272',
                  paddingHorizontal: 15,
                  paddingVertical: 10,
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
                  Update Employee
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*btn customer*/}
        <Modal isVisible={btncustomeraditarea}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Updated
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Employee has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => setbtncustomereditarea(!btncustomeraditarea)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*Employee View Modal*/}
        <Modal isVisible={modalVisible === 'View Employee'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 500,
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
                Employee's Detail
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setViewEmp([]);
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View>
              <FlatList
                data={viewEmp}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <ScrollView
                    style={{
                      padding: 5,
                    }}>
                    <View style={styles.table}>
                      <View style={[styles.cardContainer]}>
                        <View style={{alignItems: 'center', marginBottom: 16}}>
                          {item.emp_image ? (
                            <Image
                              source={{uri: item.emp_image}}
                              style={styles.customerImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={styles.noImageText}>
                              No Image Provided
                            </Text>
                          )}
                        </View>

                        <View style={styles.infoGrid}>
                          <Text style={styles.labl}>Employee Name:</Text>
                          <Text style={styles.valu}>{item.emp_name}</Text>

                          <Text style={styles.labl}>Father Name:</Text>
                          <Text style={styles.valu}>
                            {item.emp_fathername ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Contact:</Text>
                          <Text style={styles.valu}>
                            {item.emp_contact ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Email:</Text>
                          <Text style={styles.valu}>
                            {item.emp_email ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Second Contact:</Text>
                          <Text style={styles.valu}>
                            {item.emp_sec_contact ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Third Contact:</Text>
                          <Text style={styles.valu}>
                            {item.emp_third_contact ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Contact Person One:</Text>
                          <Text style={styles.valu}>
                            {item.emp_contact_person_one ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Contact Person Two:</Text>
                          <Text style={styles.valu}>
                            {item.emp_contact_person_two ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>CNIC:</Text>
                          <Text style={styles.valu}>
                            {item.emp_cnic ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Address:</Text>
                          <Text style={styles.valu}>
                            {item.emp_address ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Employee Type:</Text>
                          <Text style={styles.valu}>
                            {item.emp_type ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Opening Balance:</Text>
                          <Text style={styles.valu}>
                            {item.emp_opening_balance ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Payment Type:</Text>
                          <Text style={styles.valu}>
                            {item.emp_payment_type ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Transaction Type:</Text>
                          <Text style={styles.valu}>
                            {item.emp_transaction_type ?? 'N/A'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingVertical: 12,
              position: 'absolute',
              width: '100%',
              bottom: 0,
            }}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => prev - 1)}
              style={{
                marginHorizontal: 10,
                opacity: currentPage === 1 ? 0.5 : 1,
              }}>
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                Prev
              </Text>
            </TouchableOpacity>

            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
              Page {currentPage} of {totalPages}
            </Text>

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(prev => prev + 1)}
              style={{
                marginHorizontal: 10,
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}>
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                Next
              </Text>
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
    gap: 8,
    marginTop: 8,
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
  productinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
  },
  cardContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    paddingBottom: 24,
    marginBottom: 40,
  },
  customerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#144272',
  },
  noImageText: {
    color: '#144272',
    fontStyle: 'italic',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  labl: {
    width: '68%',
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 4,
  },
  valu: {
    width: '68%',
    marginBottom: 8,
    color: '#144272',
  },
});
