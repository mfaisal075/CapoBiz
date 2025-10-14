import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
import {Checkbox, RadioButton} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import backgroundColors from '../Colors';

interface Employee {
  id: number;
  emp_name: string;
  emp_address: string;
  emp_contact: string;
  emp_cnic: string;
  emp_email: string;
  emp_type: string;
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

export default function EmployeesPeople({navigation}: any) {
  const {openDrawer} = useDrawer();
  const [modalVisible, setModalVisible] = useState('');
  const [addForm, setAddForm] = useState<AddEmployeeForm>(initialAddEmployee);
  const [enableBal, setEnableBal] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Employee[]>([]);
  const [masterData, setMasterData] = useState<Employee[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = filteredData.slice(
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

  const [paymentType, setpaymentType] = useState(false);
  const [current, setcurrentpaymentType] = useState<string | null>('');
  const paymentTypeItem = [
    {label: 'Payable', value: 'payable'},
    {label: 'Recievable', value: 'recievable'},
  ];
  const [Worker, setWorker] = useState<'Worker' | 'other'>('Worker');

  // Fetch Employee
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchemployeedata`);

      const employeeData = res.data.emp;

      setMasterData(employeeData);
      setFilteredData(employeeData);
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
    fetchEmployees();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Employees</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible('AddEmp')}
            style={[styles.headerBtn]}>
            <Text style={styles.addBtnText}>Add</Text>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Filter */}
        <View style={styles.searchFilter}>
          <Icon name="magnify" size={36} color={backgroundColors.dark} />
          <TextInput
            placeholder="Search by supplier name"
            style={styles.search}
            value={searchQuery}
            onChangeText={text => searchFilter(text)}
          />
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  navigation.navigate('EmployeeDetails', {
                    id: item.id,
                  });
                }}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View style={styles.avatarBox}>
                    <Image
                      source={require('../../assets/man.png')}
                      style={styles.avatar}
                    />
                  </View>

                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.emp_name}</Text>
                    {/* small details inline */}
                    <Text style={styles.subText}>
                      <Icon name="phone" size={12} color="#666" />{' '}
                      {item.emp_contact || 'No contact'}
                    </Text>
                  </View>

                  {/* Actions on right */}
                  <View style={styles.actionRow}>
                    <Icon
                      name="chevron-right"
                      size={28}
                      color={backgroundColors.dark}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-group" size={48} color="#666" />
                <Text style={styles.emptyText}>No record found.</Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 90}}
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
                <View style={styles.addEmployeeField}>
                  <Text style={styles.addEmployeeLabel}>Employee Name *</Text>
                  <TextInput
                    style={styles.addEmployeeInput}
                    value={addForm.emp_name}
                    onChangeText={t => onChange('emp_name', t)}
                  />
                </View>
                <View style={styles.addEmployeeField}>
                  <Text style={styles.addEmployeeLabel}>Father Name</Text>
                  <TextInput
                    style={styles.addEmployeeInput}
                    value={addForm.fathername}
                    onChangeText={t => onChange('fathername', t)}
                  />
                </View>

                {/* Row 2 */}
                <View style={styles.addEmployeeField}>
                  <Text style={styles.addEmployeeLabel}>Email</Text>
                  <TextInput
                    style={styles.addEmployeeInput}
                    value={addForm.email}
                    onChangeText={t => onChange('email', t)}
                  />
                </View>
                <View style={styles.addEmployeeField}>
                  <Text style={styles.addEmployeeLabel}>Address</Text>
                  <TextInput
                    style={styles.addEmployeeInput}
                    value={addForm.address}
                    onChangeText={t => onChange('address', t)}
                  />
                </View>

                {/* Row 3 */}
                <View style={styles.addEmployeeField}>
                  <Text style={styles.addEmployeeLabel}>Contact</Text>
                  <TextInput
                    style={styles.addEmployeeInput}
                    value={addForm.contact}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9]/g, ''); // keep only digits
                      if (cleaned.length > 4) {
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
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
                    value={addForm.cnic}
                    keyboardType="numeric"
                    maxLength={15}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 5)
                        cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                      if (cleaned.length > 13)
                        cleaned =
                          cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                      if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                      onChange('cnic', cleaned);
                    }}
                  />
                </View>

                {/* Extra Contacts */}
                <View style={styles.addEmployeeField}>
                  <Text style={styles.addEmployeeLabel}>
                    Contact Person One
                  </Text>
                  <TextInput
                    style={styles.addEmployeeInput}
                    value={addForm.contact_person_one}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      onChange('contact_person_one', cleaned);
                    }}
                  />
                </View>
                <View style={styles.addEmployeeField}>
                  <Text style={styles.addEmployeeLabel}>Contact</Text>
                  <TextInput
                    style={styles.addEmployeeInput}
                    value={addForm.sec_contact}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9]/g, ''); // keep only digits
                      if (cleaned.length > 4) {
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      }
                      if (cleaned.length > 12) {
                        cleaned = cleaned.slice(0, 12);
                      }
                      onChange('sec_contact', cleaned);
                    }}
                  />
                </View>

                <View style={styles.addEmployeeField}>
                  <Text style={styles.addEmployeeLabel}>
                    Contact Person Two
                  </Text>
                  <TextInput
                    style={styles.addEmployeeInput}
                    value={addForm.contact_person_two}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      onChange('contact_person_two', cleaned);
                    }}
                  />
                </View>
                <View style={styles.addEmployeeField}>
                  <Text style={styles.addEmployeeLabel}>Contact</Text>
                  <TextInput
                    style={styles.addEmployeeInput}
                    value={addForm.third_contact}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9]/g, ''); // keep only digits
                      if (cleaned.length > 4) {
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      }
                      if (cleaned.length > 12) {
                        cleaned = cleaned.slice(0, 12);
                      }
                      onChange('third_contact', cleaned);
                    }}
                  />
                </View>

                {/* Worker / Other */}
                <View style={styles.addEmployeeFullRow}>
                  <Text style={styles.addEmployeeLabel}>Employee Type *</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <RadioButton
                      value="Worker"
                      status={Worker === 'Worker' ? 'checked' : 'unchecked'}
                      color={backgroundColors.primary}
                      uncheckedColor={backgroundColors.dark}
                      onPress={() => setWorker('Worker')}
                    />
                    <Text style={styles.addEmployeeRadioText}>Worker</Text>

                    <RadioButton
                      value="other"
                      status={Worker === 'other' ? 'checked' : 'unchecked'}
                      color={backgroundColors.primary}
                      uncheckedColor={backgroundColors.dark}
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
                      color={backgroundColors.primary}
                      uncheckedColor={backgroundColors.dark}
                    />
                    <Text
                      style={[
                        styles.addEmployeeLabel,
                        {marginLeft: 8, marginBottom: 0},
                      ]}>
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
    color: backgroundColors.primary,
  },
  addEmployeeCloseBtn: {
    padding: 5,
  },
  addEmployeeForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  addEmployeeField: {
    flex: 1,
    marginBottom: 5,
  },
  addEmployeeFullRow: {
    marginBottom: 15,
  },
  addEmployeeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
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
    color: backgroundColors.dark,
    fontWeight: 'bold',
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
    backgroundColor: backgroundColors.primary,
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
    paddingHorizontal: '3%',
  },
  card: {
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
    height: 45,
    width: 45,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    width: '96%',
    alignSelf: 'center',
    marginTop: 60,
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Pagination Component
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: backgroundColors.primary,
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
    backgroundColor: backgroundColors.info,
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
    color: '#fff',
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
});
