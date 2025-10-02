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
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
import {Checkbox, RadioButton} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

interface Employee {
  id: number;
  emp_name: string;
  emp_address: string;
  emp_contact: string;
  emp_cnic: string;
  emp_email: string;
  emp_type: string;
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

  const addEmployee = async () => {
    const nameRegex = /^[A-Za-z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!addForm.emp_name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all required fields.',
        visibilityTime: 2000,
      });
      return;
    }

    if (!nameRegex.test(addForm.emp_name.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Customer name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (addForm.fathername && !nameRegex.test(addForm.fathername.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Father Name',
        text2: 'Father name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (addForm.email && !emailRegex.test(addForm.email.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
        visibilityTime: 2000,
      });
      return;
    }

    if (Worker === 'other' && !addForm.employeetype.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Type',
        text2: 'Please add employee type.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      // Build payload more carefully
      const payload: any = {
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
        emp_type: Worker === 'Worker' ? 'Worker' : addForm.employeetype,
      };

      // Add opening balance fields only if enabled
      if (enableBal.includes('on')) {
        payload.opening_balancechechboc = 'on';
        payload.opening_balance = addForm.opening_balance;
        payload.transfer_type = current;

        if (current === 'payable') {
          payload.transaction_type = 'Credit Amount';
        } else if (current === 'recievable') {
          payload.transaction_type = 'Debit Amount';
        }
      }

      console.log('Sending payload:', payload); // Debug log

      const res = await axios.post(`${BASE_URL}/addemployee`, payload);

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Employee has been Added successfully',
          visibilityTime: 2000,
        });
        fetchEmployees();
        setAddForm(initialAddEmployee);
        setEnableBal([]);
        setcurrentpaymentType('');
        setModalVisible('');
        setWorker('Worker');
      } else {
        // Handle other status codes from backend
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: data.message || 'Something went wrong',
          visibilityTime: 2000,
        });
      }
    } catch (error: any) {
      console.log('Add Employee Error:', error);

      fetchEmployees();

      if (error.response?.status === 500) {
        Toast.show({
          type: 'info',
          text1: 'Employee Added',
          text2: 'Employee was added but there was a server response issue',
          visibilityTime: 2000,
        });
        // Close modal anyway
        setModalVisible('');
        setAddForm(initialAddEmployee);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response?.data?.message || 'Failed to add employee',
          visibilityTime: 2000,
        });
      }
    }
  };

  // Edit Employee
  const editEmployee = async () => {
    const nameRegex = /^[A-Za-z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const name = (editForm.emp_name ?? '').trim();
    const fatherName = (editForm.emp_fathername ?? '').trim();
    const email = (editForm.emp_email ?? '').trim();
    const address = (editForm.emp_address ?? '').trim();

    // Validation
    if (!name) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all required fields.',
        visibilityTime: 2000,
      });
      return;
    }

    if (!nameRegex.test(name)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Customer name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (fatherName && !nameRegex.test(fatherName)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Father Name',
        text2: 'Father name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (email && !emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      let empType;
      if (editWorker.includes('Worker')) {
        empType = 'Worker';
      } else if (editWorker.includes('other')) {
        empType = editForm.emp_type;
      }

      const payload = {
        emp_id: editForm.id,
        emp_name: name,
        fathername: fatherName,
        contact: editForm.emp_contact ?? '',
        cnic: editForm.emp_cnic ?? '',
        contact_person_one: editForm.emp_contact_person_one ?? '',
        contact_person_two: editForm.emp_contact_person_two ?? '',
        sec_contact: editForm.emp_sec_contact ?? '',
        third_contact: editForm.emp_third_contact ?? '',
        email,
        address,
        emp_type: empType,
      };

      console.log('Edit payload:', payload);

      const res = await axios.post(`${BASE_URL}/updateemployee`, payload);

      if (res.status === 200 && res.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Employee has been updated successfully',
          visibilityTime: 1500,
        });
        fetchEmployees();
        setEditForm(initialEditEmployee);
        setModalVisible('');
        setEditWorker('Worker');
      } else if (res.status === 200 && res.data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Contact number already exist!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && res.data.status === 204) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email already exist!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && res.data.status === 203) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'CNIC already exist!',
          visibilityTime: 1500,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: res.data.message || 'Unknown error occurred',
          visibilityTime: 2000,
        });
      }
    } catch (error: any) {
      console.error('Update Error:', error);
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Employees</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible('AddEmp')}
            style={[styles.headerBtn]}>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                <View style={styles.headerRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.emp_name?.charAt(0) || 'E'}
                    </Text>
                  </View>

                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.emp_name}</Text>
                    <Text style={styles.subText}>{item.emp_type || 'N/A'}</Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionRow}>
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
                      <Icon
                        style={styles.actionIcon}
                        name="eye"
                        size={20}
                        color={'#144272'}
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
                      <Icon
                        style={styles.actionIcon}
                        name="pencil"
                        size={20}
                        color={'#144272'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('EmpDelete');
                        setSelectedEmp(item.id);
                      }}>
                      <Icon
                        style={styles.actionIcon}
                        name="delete"
                        size={20}
                        color={'#144272'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="email"
                        size={20}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Email</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.emp_email || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="phone"
                        size={20}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Phone</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.emp_contact || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="card-account-details"
                        size={20}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>CNIC</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.emp_cnic || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="map-marker"
                        size={20}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Address</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.emp_address || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No Employee found.
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 110}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/*Add Employee*/}
        <Modal
          visible={modalVisible === 'AddEmp'}
          transparent
          animationType="slide">
          <View style={styles.addEmployeeModalOverlay}>
            <ScrollView style={styles.addEmployeeModalContainer}>
              <View style={styles.addEmployeeHeader}>
                <Text style={styles.addEmployeeTitle}>Add New Employee</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setAddForm(initialAddEmployee);
                    setEnableBal([]);
                    setWorker('Worker');
                  }}
                  style={styles.addEmployeeCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              <View style={styles.addEmployeeForm}>
                {/* Row 1 */}
                <View style={styles.addEmployeeRow}>
                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>Employee Name *</Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholderTextColor="#999"
                      placeholder="Enter employee name"
                      value={addForm.emp_name}
                      onChangeText={t => onChange('emp_name', t)}
                    />
                  </View>
                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>Father Name</Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholderTextColor="#999"
                      placeholder="Enter father name"
                      value={addForm.fathername}
                      onChangeText={t => onChange('fathername', t)}
                    />
                  </View>
                </View>

                {/* Row 2 */}
                <View style={styles.addEmployeeRow}>
                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>Email</Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholderTextColor="#999"
                      placeholder="example@mail.com"
                      value={addForm.email}
                      onChangeText={t => onChange('email', t)}
                    />
                  </View>
                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>Address</Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholderTextColor="#999"
                      placeholder="Enter address"
                      value={addForm.address}
                      onChangeText={t => onChange('address', t)}
                    />
                  </View>
                </View>

                {/* Row 3 */}
                <View style={styles.addEmployeeRow}>
                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>Contact</Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholderTextColor="#999"
                      placeholder="0300-1234567"
                      value={addForm.contact}
                      keyboardType="phone-pad"
                      maxLength={12}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9]/g, ''); // keep only digits
                        if (cleaned.length > 4) {
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        }
                        if (cleaned.length > 12) {
                          cleaned = cleaned.slice(0, 12);
                        }
                        onChange('contact', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>CNIC</Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholderTextColor="#999"
                      placeholder="12345-1234567-1"
                      value={addForm.cnic}
                      keyboardType="numeric"
                      maxLength={15}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 5)
                          cleaned =
                            cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                        if (cleaned.length > 13)
                          cleaned =
                            cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                        if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                        onChange('cnic', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Extra Contacts */}
                <View style={styles.addEmployeeRow}>
                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>
                      Contact Person One
                    </Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholder="0300-1234567"
                      value={addForm.contact_person_one}
                      keyboardType="phone-pad"
                      maxLength={12}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        onChange('contact_person_one', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>
                      Contact Person Two
                    </Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholder="0300-1234567"
                      value={addForm.contact_person_two}
                      keyboardType="phone-pad"
                      maxLength={12}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        onChange('contact_person_two', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Worker / Other */}
                <View style={styles.addEmployeeFullRow}>
                  <Text style={styles.addEmployeeLabel}>Employee Type *</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <RadioButton
                      value="Worker"
                      status={Worker === 'Worker' ? 'checked' : 'unchecked'}
                      color="#144272"
                      onPress={() => setWorker('Worker')}
                    />
                    <Text style={styles.addEmployeeRadioText}>Worker</Text>

                    <RadioButton
                      value="other"
                      status={Worker === 'other' ? 'checked' : 'unchecked'}
                      color="#144272"
                      onPress={() => setWorker('other')}
                    />
                    <Text style={styles.addEmployeeRadioText}>Other</Text>
                  </View>

                  {Worker === 'other' && (
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholder="Enter type"
                      value={addForm.employeetype}
                      onChangeText={t => onChange('employeetype', t)}
                    />
                  )}
                </View>

                {/* Opening Balance */}
                <View style={{marginBottom: 15}}>
                  <TouchableOpacity
                    style={{flexDirection: 'row', alignItems: 'center'}}
                    onPress={() => {
                      const newOptions = enableBal.includes('on')
                        ? enableBal.filter(opt => opt !== 'on')
                        : [...enableBal, 'on'];
                      setEnableBal(newOptions);
                    }}>
                    <Checkbox.Android
                      status={
                        enableBal.includes('on') ? 'checked' : 'unchecked'
                      }
                      color="#144272"
                      uncheckedColor="#144272"
                    />
                    <Text style={[styles.addEmployeeLabel, {marginLeft: 8}]}>
                      Enable Opening Balance
                    </Text>
                  </TouchableOpacity>
                </View>

                {enableBal.includes('on') && (
                  <>
                    <View style={styles.addEmployeeFullRow}>
                      <Text style={styles.addEmployeeLabel}>
                        Opening Balance
                      </Text>
                      <TextInput
                        style={styles.addEmployeeInput}
                        placeholder="Enter opening balance"
                        keyboardType="numeric"
                        value={addForm.opening_balance}
                        onChangeText={t => onChange('opening_balance', t)}
                      />
                    </View>

                    <View style={styles.addEmployeeDropdownRow}>
                      <Text style={styles.addEmployeeLabel}>Payment Type</Text>
                      <DropDownPicker
                        items={paymentTypeItem}
                        open={paymentType}
                        setOpen={setpaymentType}
                        value={current}
                        setValue={setcurrentpaymentType}
                        placeholder="Select payment type"
                        style={styles.addEmployeeDropdown}
                        dropDownContainerStyle={
                          styles.addEmployeeDropdownContainer
                        }
                        textStyle={styles.addEmployeeDropdownText}
                        placeholderStyle={styles.addEmployeeDropdownPlaceholder}
                        listMode="SCROLLVIEW"
                        disabled={!enableBal.includes('on')}
                      />
                    </View>
                  </>
                )}

                {/* Submit */}
                <TouchableOpacity
                  style={styles.addEmployeeSubmitBtn}
                  onPress={addEmployee}>
                  <Icon name="account-plus-outline" size={20} color="white" />
                  <Text style={styles.addEmployeeSubmitText}>Add Employee</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/*Epmloyee Delete*/}
        <Modal
          visible={modalVisible === 'EmpDelete'}
          transparent
          animationType="fade">
          <View style={styles.addEmployeeModalOverlay}>
            <View style={styles.deleteModalContainer}>
              <View style={styles.delAnim}>
                <LottieView
                  style={{flex: 1}}
                  source={require('../../assets/warning.json')}
                  autoPlay
                  loop={false}
                />
              </View>

              {/* Title */}
              <Text style={styles.deleteModalTitle}>Are you sure?</Text>

              {/* Subtitle */}
              <Text style={styles.deleteModalMessage}>
                You won’t be able to revert this record!
              </Text>

              {/* Buttons */}
              <View style={styles.deleteModalActions}>
                <TouchableOpacity
                  style={[styles.deleteModalBtn, {backgroundColor: '#e0e0e0'}]}
                  onPress={() => setModalVisible('')}>
                  <Text style={[styles.deleteModalBtnText, {color: '#144272'}]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteModalBtn, {backgroundColor: '#d9534f'}]}
                  onPress={delEmployee}>
                  <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/*Edit Employee*/}
        <Modal
          visible={modalVisible === 'EditEmp'}
          transparent
          animationType="slide">
          <View style={styles.addEmployeeModalOverlay}>
            <ScrollView style={styles.addEmployeeModalContainer}>
              {/* Header */}
              <View style={styles.addEmployeeHeader}>
                <Text style={styles.addEmployeeTitle}>Edit Employee</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible('')}
                  style={styles.addEmployeeCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.addEmployeeForm}>
                {/* Row 1 */}
                <View style={styles.addEmployeeRow}>
                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>Employee Name *</Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholder="Enter employee name"
                      placeholderTextColor="#999"
                      value={editForm.emp_name}
                      onChangeText={t => editOnchange('emp_name', t)}
                    />
                  </View>

                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>Father Name</Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholder="Enter father name"
                      placeholderTextColor="#999"
                      value={editForm.emp_fathername}
                      onChangeText={t => editOnchange('emp_fathername', t)}
                    />
                  </View>
                </View>

                {/* Row 2 */}
                <View style={styles.addEmployeeRow}>
                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>Email</Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholder="employee@example.com"
                      placeholderTextColor="#999"
                      value={editForm.emp_email}
                      onChangeText={t => editOnchange('emp_email', t)}
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>Address</Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholder="Enter address"
                      placeholderTextColor="#999"
                      value={editForm.emp_address}
                      onChangeText={t => editOnchange('emp_address', t)}
                    />
                  </View>
                </View>

                {/* Row 3 */}
                <View style={styles.addEmployeeRow}>
                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>Contact</Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholder="0300-1234567"
                      placeholderTextColor="#999"
                      value={editForm.emp_contact}
                      maxLength={12}
                      keyboardType="phone-pad"
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9]/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        editOnchange('emp_contact', cleaned);
                      }}
                    />
                  </View>

                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>CNIC</Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholder="12345-1234567-1"
                      placeholderTextColor="#999"
                      value={editForm.emp_cnic}
                      maxLength={15}
                      keyboardType="number-pad"
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9]/g, '');
                        if (cleaned.length > 5)
                          cleaned =
                            cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                        if (cleaned.length > 13)
                          cleaned =
                            cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                        if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                        editOnchange('emp_cnic', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Row 4 */}
                <View style={styles.addEmployeeRow}>
                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>
                      Contact Person One
                    </Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholder="0300-xxxxxxx"
                      placeholderTextColor="#999"
                      value={editForm.emp_contact_person_one}
                      maxLength={12}
                      keyboardType="phone-pad"
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9]/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        editOnchange('emp_contact_person_one', cleaned);
                      }}
                    />
                  </View>

                  <View style={styles.addEmployeeField}>
                    <Text style={styles.addEmployeeLabel}>
                      Contact Person Two
                    </Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholder="0300-xxxxxxx"
                      placeholderTextColor="#999"
                      value={editForm.emp_contact_person_two}
                      maxLength={12}
                      keyboardType="phone-pad"
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9]/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        editOnchange('emp_contact_person_two', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Worker Type */}
                <Text style={[styles.addEmployeeLabel, {marginLeft: 10}]}>
                  Employee Type *
                </Text>
                <View style={{flexDirection: 'row', marginBottom: 15}}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 30,
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
                    <Text style={{color: '#144272'}}>Worker</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{flexDirection: 'row', alignItems: 'center'}}
                    onPress={() => setEditWorker('other')}
                    activeOpacity={0.7}>
                    <RadioButton
                      value="other"
                      status={editWorker === 'other' ? 'checked' : 'unchecked'}
                      color="#144272"
                      uncheckedColor="#144272"
                      onPress={() => setEditWorker('other')}
                    />
                    <Text style={{color: '#144272'}}>Other</Text>
                  </TouchableOpacity>
                </View>

                {editWorker === 'other' && (
                  <View style={styles.addEmployeeFullRow}>
                    <Text style={styles.addEmployeeLabel}>Other</Text>
                    <TextInput
                      style={styles.addEmployeeInput}
                      placeholder="Specify type"
                      placeholderTextColor="#999"
                      value={editForm.emp_type}
                      onChangeText={t => editOnchange('emp_type', t)}
                    />
                  </View>
                )}

                {/* Submit */}
                <TouchableOpacity
                  style={styles.addEmployeeSubmitBtn}
                  onPress={editEmployee}>
                  <Icon name="account-edit" size={20} color="white" />
                  <Text style={styles.addEmployeeSubmitText}>
                    Update Employee
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/*Employee View Modal*/}
        <Modal
          visible={modalVisible === 'View Employee'}
          transparent
          animationType="slide">
          <View style={styles.addEmployeeModalOverlay}>
            <ScrollView style={styles.addEmployeeModalContainer}>
              {/* Header */}
              <View style={styles.addEmployeeHeader}>
                <Text style={styles.addEmployeeTitle}>Employee Details</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setViewEmp([]);
                  }}
                  style={styles.addEmployeeCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {viewEmp.length > 0 && (
                <View style={styles.customerDetailsWrapper}>
                  {/* Profile Image */}
                  <View style={styles.customerImageWrapper}>
                    {viewEmp[0].emp_image ? (
                      <Image
                        source={{uri: viewEmp[0].emp_image}}
                        style={styles.customerImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.customerNoImage}>
                        <Icon name="account" size={40} color="#999" />
                        <Text style={styles.customerNoImageText}>No Image</Text>
                      </View>
                    )}
                  </View>

                  {/* Info Box */}
                  <View style={styles.customerInfoBox}>
                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Employee Name
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_name}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Father Name</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_fathername ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Contact</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_contact ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Email</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_email ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Second Contact
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_sec_contact ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Third Contact
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_third_contact ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Contact Person One
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_contact_person_one ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Contact Person Two
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_contact_person_two ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>CNIC</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_cnic ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Address</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_address ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Employee Type
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_type ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Opening Balance
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_opening_balance ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Payment Type</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_payment_type ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Transaction Type
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewEmp[0]?.emp_transaction_type ?? 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>

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
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  background: {
    flex: 1,
  },

  // Add Modal Styling
  addEmployeeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  addEmployeeModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  addEmployeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addEmployeeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#144272',
  },
  addEmployeeCloseBtn: {
    padding: 5,
  },
  addEmployeeForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  addEmployeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  addEmployeeField: {
    flex: 1,
    marginHorizontal: 5,
  },
  addEmployeeFullRow: {
    marginBottom: 15,
  },
  addEmployeeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
    marginBottom: 5,
  },
  addEmployeeInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  addEmployeeRadioText: {
    color: '#144272',
    fontSize: 14,
    marginRight: 15,
  },
  addEmployeeDropdownRow: {
    marginBottom: 15,
  },
  addEmployeeDropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 42,
    zIndex: 999,
  },
  addEmployeeDropdownContainer: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    zIndex: 1000,
    maxHeight: 160,
  },
  addEmployeeDropdownText: {
    color: '#333',
    fontSize: 14,
  },
  addEmployeeDropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  addEmployeeSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#144272',
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  addEmployeeSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // FlatList Styling
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
    marginHorizontal: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionIcon: {
    width: 20,
    height: 20,
    marginHorizontal: 4,
  },
  infoBox: {
    marginTop: 10,
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 10,
  },
  infoText: {
    flex: 1,
    color: '#333',
    fontSize: 13,
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
  },
  infoIcon: {
    width: 18,
    height: 18,
    tintColor: '#144272',
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
    maxWidth: '60%',
    textAlign: 'right',
  },

  // Pagination Component
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#144272',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: -2},
    elevation: 6,
  },
  pageButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
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
    paddingHorizontal: 10,
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

  //Delete Modal
  deleteModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    width: '100%',
    alignSelf: 'center',
  },
  deleteModalIcon: {
    width: 60,
    height: 60,
    tintColor: '#144272',
    marginBottom: 15,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 8,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  deleteModalBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteModalBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  delAnim: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },

  // View Modal Styling
  customerDetailsWrapper: {
    padding: 20,
    alignItems: 'center',
  },
  customerImageWrapper: {
    marginBottom: 20,
  },
  customerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#144272',
  },
  customerNoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  customerNoImageText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  customerInfoBox: {
    width: '100%',
    marginTop: 10,
  },
  customerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 6,
  },
  customerInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
  },
  customerInfoValue: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
    textAlign: 'right',
  },
});
