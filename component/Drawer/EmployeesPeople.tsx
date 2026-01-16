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
  BackHandler,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
import {Checkbox, RadioButton} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import BottomBar from '../BottomBar';

const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F0F2F5', // Slightly darker white for contrast
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
  danger: '#EF4444',
};

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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/fetchemployeedata`);

      const employeeData = res.data.emp;

      setMasterData(employeeData);
      setFilteredData(employeeData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true; // prevents default behavior (exit app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      <View style={styles.mainContent}>
        {/* --- HEADER --- */}
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={[THEME.gradientStart, THEME.gradientEnd]}
            style={styles.headerContainer}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
                <Icon name="menu" size={24} color={THEME.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Employees</Text>
              <TouchableOpacity
                onPress={() => setModalVisible('AddEmp')}
                style={styles.iconBtn}>
                <Icon name="plus" size={24} color={THEME.white} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Floating Search Bar */}
          <View style={styles.floatingSearchContainer}>
            <Icon name="magnify" size={22} color={THEME.primary} />
            <TextInput
              placeholder="Search employees..."
              placeholderTextColor={THEME.textGray}
              style={styles.floatingSearchInput}
              value={searchQuery}
              onChangeText={searchFilter}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => searchFilter('')}>
                <Icon name="close-circle" size={18} color={THEME.textGray} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* --- CONTENT LIST --- */}
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.centerContent}>
              <LottieView
                source={require('../../assets/Loading-Dots.json')}
                autoPlay
                loop
                style={styles.lottie}
              />
            </View>
          ) : (
            <>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.tableHeaderLabel}>EMPLOYEE LIST</Text>
                <Text style={styles.tableHeaderCount}>
                  {totalRecords} Found
                </Text>
              </View>

              <FlatList
                data={currentData}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{paddingBottom: 160}}
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.cardRow}
                    onPress={() =>
                      navigation.navigate('EmployeeDetails', {id: item.id})
                    }>
                    {/* Avatar Section */}
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {item.emp_name
                          ? item.emp_name.charAt(0).toUpperCase()
                          : 'E'}
                      </Text>
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoContainer}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 4,
                        }}>
                        <Text style={styles.nameText} numberOfLines={1}>
                          {item.emp_name}
                        </Text>
                        <View style={styles.badgeContainer}>
                          <View style={styles.areaBadge}>
                            <Text
                              style={styles.areaBadgeText}
                              numberOfLines={1}>
                              {item.emp_type || 'Worker'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.iconTextRow}>
                        <Icon
                          name="phone-outline"
                          size={14}
                          color={THEME.textGray}
                        />
                        <Text style={styles.subText}>
                          {item.emp_contact || 'No Contact'}
                        </Text>
                      </View>
                    </View>

                    {/* Arrow */}
                    <Icon
                      name="chevron-right"
                      size={24}
                      color={THEME.primary}
                      style={{marginLeft: 6}}
                    />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.centerContent}>
                    <Icon name="account-search" size={60} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No employees found</Text>
                  </View>
                }
              />
            </>
          )}
        </View>

        {/* --- PAGINATION (Floating) --- */}
        {totalRecords > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => prev - 1)}
              style={[styles.pageBtn, currentPage === 1 && styles.disabledBtn]}>
              <Icon name="chevron-left" size={24} color={THEME.white} />
            </TouchableOpacity>

            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(prev => prev + 1)}
              style={[
                styles.pageBtn,
                currentPage === totalPages && styles.disabledBtn,
              ]}>
              <Icon name="chevron-right" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        )}

        {/*Add Employee Modal*/}
        <Modal
          visible={modalVisible === 'AddEmp'}
          transparent
          animationType="slide">
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Employee</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setAddForm(initialAddEmployee);
                    setEnableBal([]);
                    setWorker('Worker');
                  }}
                  style={styles.closeBtn}>
                  <Icon name="close" size={24} color={THEME.textDark} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                {/* Row 1 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Employee Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter name"
                    placeholderTextColor="#999"
                    value={addForm.emp_name}
                    onChangeText={t => onChange('emp_name', t)}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Father Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter father name"
                    placeholderTextColor="#999"
                    value={addForm.fathername}
                    onChangeText={t => onChange('fathername', t)}
                  />
                </View>

                {/* Row 2 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter email"
                    placeholderTextColor="#999"
                    value={addForm.email}
                    onChangeText={t => onChange('email', t)}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter address"
                    placeholderTextColor="#999"
                    value={addForm.address}
                    onChangeText={t => onChange('address', t)}
                  />
                </View>

                {/* Row 3 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="03XX-XXXXXXX"
                    placeholderTextColor="#999"
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
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CNIC</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="XXXXX-XXXXXXX-X"
                    placeholderTextColor="#999"
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
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact Person One</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Contact person name"
                    placeholderTextColor="#999"
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
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="03XX-XXXXXXX"
                    placeholderTextColor="#999"
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

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact Person Two</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Contact person name"
                    placeholderTextColor="#999"
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
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="03XX-XXXXXXX"
                    placeholderTextColor="#999"
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
                <View style={styles.radioGroup}>
                  <Text style={styles.inputLabel}>Employee Type *</Text>
                  <View style={styles.radioRow}>
                    <TouchableOpacity
                      style={styles.radioBtn}
                      onPress={() => setWorker('Worker')}>
                      <RadioButton
                        value="Worker"
                        status={Worker === 'Worker' ? 'checked' : 'unchecked'}
                        color={THEME.primary}
                        uncheckedColor={THEME.textGray}
                        onPress={() => setWorker('Worker')}
                      />
                      <Text style={styles.radioText}>Worker</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioBtn}
                      onPress={() => setWorker('other')}>
                      <RadioButton
                        value="other"
                        status={Worker === 'other' ? 'checked' : 'unchecked'}
                        color={THEME.primary}
                        uncheckedColor={THEME.textGray}
                        onPress={() => setWorker('other')}
                      />
                      <Text style={styles.radioText}>Other</Text>
                    </TouchableOpacity>
                  </View>

                  {Worker === 'other' && (
                    <TextInput
                      style={[styles.textInput, {marginTop: 10}]}
                      placeholder="Enter type"
                      placeholderTextColor="#999"
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
                      color={THEME.primary}
                      uncheckedColor={THEME.textGray}
                    />
                    <Text
                      style={[
                        styles.inputLabel,
                        {marginLeft: 8, marginBottom: 0},
                      ]}>
                      Enable Opening Balance
                    </Text>
                  </TouchableOpacity>
                </View>

                {enableBal.includes('on') && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Opening Balance</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter opening balance"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={addForm.opening_balance}
                        onChangeText={t => onChange('opening_balance', t)}
                      />
                    </View>

                    <View style={[styles.inputGroup, {zIndex: 1000}]}>
                      <Text style={styles.inputLabel}>Payment Type</Text>
                      <DropDownPicker
                        items={paymentTypeItem}
                        open={paymentType}
                        setOpen={setpaymentType}
                        value={current}
                        setValue={setcurrentpaymentType}
                        placeholder="Select payment type"
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                        textStyle={{color: THEME.textDark}}
                        placeholderStyle={{color: '#999'}}
                        listMode="SCROLLVIEW"
                        disabled={!enableBal.includes('on')}
                      />
                    </View>
                  </>
                )}

                {/* Submit */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={addEmployee}>
                  <Icon name="account-plus-outline" size={20} color="white" />
                  <Text style={styles.submitBtnText}>Add Employee</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
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
  mainContent: {
    flex: 1,
  },
  // --- Header ---
  headerWrapper: {
    marginBottom: 20,
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 40, // Extra space for floating search
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    zIndex: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  // --- Floating Search ---
  floatingSearchContainer: {
    position: 'absolute',
    bottom: -24,
    left: 12,
    right: 12,
    backgroundColor: THEME.white,
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: THEME.textDark,
  },

  // --- List & Table Header ---
  listContainer: {
    flex: 1,
    paddingTop: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 14,
  },
  tableHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textGray,
    letterSpacing: 0.5,
  },
  tableHeaderCount: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.primary,
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  // --- Card Row ---
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '94%',
    alignSelf: 'center',
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#222',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.19,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.primary,
    letterSpacing: 0.5,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 0,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  subText: {
    fontSize: 12,
    color: THEME.textGray,
    marginLeft: 4,
    flexShrink: 1,
  },
  badgeContainer: {
    marginLeft: 12,
    marginRight: 8,
    alignItems: 'flex-end',
    flex: 0,
  },
  areaBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginTop: 0,
  },
  areaBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.textDark,
    maxWidth: 80,
  },

  // --- Pagination ---
  paginationContainer: {
    position: 'absolute',
    bottom: 80,
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
  pageBtn: {
    padding: 5,
  },
  disabledBtn: {
    opacity: 0.3,
  },
  pageText: {
    color: THEME.white,
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 15,
  },

  // --- Empty & Loading ---
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  lottie: {
    width: 150,
    height: 150,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: THEME.textGray,
    fontWeight: '500',
  },

  // --- Add Modal Styles (Preserving existing modal styles used in JSX) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },
  closeBtn: {
    padding: 4,
  },
  modalForm: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.textDark,
  },
  radioGroup: {
    marginBottom: 15,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 15,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  radioText: {
    fontSize: 14,
    color: THEME.textDark,
    fontWeight: '500',
  },
  dropdown: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    minHeight: 45,
  },
  dropdownContainer: {
    borderColor: '#E5E7EB',
    backgroundColor: THEME.white,
  },
  submitBtn: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },
  // Used in Modal for loader or other
  loadingContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
