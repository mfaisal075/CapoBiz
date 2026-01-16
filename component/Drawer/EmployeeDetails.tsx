import {
  BackHandler,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import {RadioButton} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../BottomBar';

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  accent: '#4CAF50',
  background: '#F0F2F5',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  danger: '#EF4444',
  border: '#E5E7EB',
};

// --- HELPER COMPONENT FOR ROWS ---
const DetailRow = ({
  label,
  value,
  icon,
  isLast,
}: {
  label: string;
  value: string;
  icon: string;
  isLast?: boolean;
}) => (
  <View style={[styles.detailRow, isLast && {borderBottomWidth: 0}]}>
    <View style={styles.iconContainer}>
      <Icon name={icon} size={18} color={THEME.primary} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '--'}</Text>
    </View>
  </View>
);

interface EmployeeDetails {
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

const EmployeeDetails = ({navigation, route}: any) => {
  const {id} = route.params;
  const {token} = useUser();
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
  const [modalVisible, setModalVisible] = useState('');
  const [editForm, setEditForm] = useState<EditEmployee>(initialEditEmployee);
  const [editWorker, setEditWorker] = useState<'Worker' | 'other'>('Worker');

  // Edit form on change
  const editOnchange = (field: keyof EditEmployee, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Employee Details
  const fetchEmpDetails = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/employeesshow?id=${id}&_token=${token}`,
      );
      setEmployee(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Employee
  const delEmployee = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/employeedelete`, {
        id: id,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Employee has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setModalVisible('');
        navigation.navigate('Employees');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Get employee data to update
  const getEditData = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editemployee?id=${id}&_token=${token}`,
      );
      setEditForm(res.data);
      if (res.data.emp_type === 'Worker') {
        setEditWorker('Worker');
      } else {
        setEditWorker('other');
      }
    } catch (error) {
      console.log(error);
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

      const res = await axios.post(`${BASE_URL}/updateemployee`, payload);

      if (res.status === 200 && res.data.status === 200) {
        setEditForm(initialEditEmployee);
        setModalVisible('');
        setEditWorker('Worker');
        fetchEmpDetails();
        setTimeout(() => {
          setModalVisible('Success');
        }, 500);
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
    fetchEmpDetails();

    const backKey = () => {
      navigation.navigate('Employees');
      return true;
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 100}}>
        {/* --- HEADER --- */}
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.headerGradient}>
          {/* Top Navigation */}
          <View style={styles.navBar}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Employees')}
              style={styles.navBtn}>
              <Icon name="arrow-left" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Employee Profile</Text>
            <TouchableOpacity
              onPress={() => setModalVisible('EmpDelete')}
              style={styles.navBtn}>
              <Icon name="trash-can-outline" size={22} color={THEME.white} />
            </TouchableOpacity>
          </View>

          {/* Profile Content */}
          <View style={styles.profileContent}>
            {/* Avatar with White Border */}
            <View style={styles.avatarContainer}>
              <Image
                source={require('../../assets/man.png')}
                style={styles.avatarImage}
              />
              <TouchableOpacity
                style={styles.editIconBtn}
                onPress={() => {
                  getEditData();
                  setModalVisible('EditEmp');
                }}>
                <Icon name="pencil" size={16} color={THEME.primary} />
              </TouchableOpacity>
            </View>

            {/* Name & Role */}
            <Text style={styles.profileName}>
              {employee?.emp_name || 'Loading...'}
            </Text>

            {/* Badges Row */}
            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Icon
                  name="card-account-details-outline"
                  size={14}
                  color="rgba(255,255,255,0.9)"
                />
                <Text style={styles.badgeText}>
                  {employee?.emp_type || 'Worker'}
                </Text>
              </View>
              <View style={styles.badge}>
                <Icon
                  name="map-marker-outline"
                  size={14}
                  color="rgba(255,255,255,0.9)"
                />
                <Text style={styles.badgeText}>
                  {employee?.emp_address || 'General'}
                </Text>
              </View>
            </View>

            {/* Quick Stats: Balance */}
            {employee?.emp_opening_balance && (
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Opening Balance</Text>
                <Text style={styles.balanceValue}>
                  Rs. {employee?.emp_opening_balance}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* --- DETAILS CARDS --- */}
        <View style={styles.contentContainer}>
          {/* Card 1: Personal Info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Personal Information</Text>
            </View>
            <DetailRow
              icon="account"
              label="Father Name"
              value={employee?.emp_fathername!}
            />
            <DetailRow
              icon="card-account-details"
              label="CNIC"
              value={employee?.emp_cnic!}
            />
            <DetailRow
              icon="email"
              label="Email"
              value={employee?.emp_email!}
            />
            <DetailRow
              icon="map-marker"
              label="Address"
              value={employee?.emp_address!}
              isLast
            />
          </View>

          {/* Card 2: Contact Details */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Contact Details</Text>
            </View>
            <DetailRow
              icon="phone"
              label="Primary Contact"
              value={employee?.emp_contact!}
            />
            <DetailRow
              icon="account-tie"
              label="Contact Person 1"
              value={employee?.emp_contact_person_one!}
            />
            <DetailRow
              icon="phone-classic"
              label="Sec. Contact"
              value={employee?.emp_sec_contact!}
            />
            <DetailRow
              icon="account-tie"
              label="Contact Person 2"
              value={employee?.emp_contact_person_two!}
            />
            <DetailRow
              icon="phone-classic"
              label="Third Contact"
              value={employee?.emp_third_contact!}
              isLast
            />
          </View>

          {/* Card 3: Financials */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Financials</Text>
            </View>
            <DetailRow
              icon="cash-multiple"
              label="Payment Type"
              value={employee?.emp_payment_type!}
            />
            <DetailRow
              icon="bank-transfer"
              label="Transaction Type"
              value={employee?.emp_transaction_type!}
              isLast
            />
          </View>
        </View>
      </ScrollView>

      {/* Delete Modal */}
      <Modal
        visible={modalVisible === 'EmpDelete'}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.delAnim}>
              <LottieView
                style={{flex: 1}}
                source={require('../../assets/warning.json')}
                autoPlay
                loop={false}
              />
            </View>
            <Text style={styles.deleteModalTitle}>Are you sure?</Text>
            <Text style={styles.deleteModalMessage}>
              You won’t be able to revert this record!
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: '#F3F4F6'}]}
                onPress={() => setModalVisible('')}>
                <Text style={[styles.modalBtnText, {color: THEME.textDark}]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: THEME.danger}]}
                onPress={delEmployee}>
                <Text style={[styles.modalBtnText, {color: 'white'}]}>
                  Yes, Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={modalVisible === 'Success'}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.delAnim}>
              <LottieView
                style={{flex: 1}}
                source={require('../../assets/success.json')}
                autoPlay
                duration={2500}
                loop={false}
              />
            </View>
            <Text style={styles.deleteModalTitle}>Updated!</Text>
            <Text style={styles.deleteModalMessage}>
              Employee record has been updated successfully!
            </Text>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                {backgroundColor: THEME.primary, width: '100%', marginTop: 10},
              ]}
              onPress={() => setModalVisible('')}>
              <Text style={[styles.modalBtnText, {color: 'white'}]}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        visible={modalVisible === 'EditEmp'}
        transparent
        animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.editModalContainer}>
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>Edit Employee</Text>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={styles.closeBtn}>
                <Icon name="close" size={24} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.editForm}>
              {/* Row 1 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Employee Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.emp_name}
                  onChangeText={t => editOnchange('emp_name', t)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Father Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.emp_fathername}
                  onChangeText={t => editOnchange('emp_fathername', t)}
                />
              </View>

              {/* Row 2 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.emp_email}
                  onChangeText={t => editOnchange('emp_email', t)}
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.emp_address}
                  onChangeText={t => editOnchange('emp_address', t)}
                />
              </View>

              {/* Row 3 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.emp_contact}
                  maxLength={12}
                  keyboardType="phone-pad"
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9]/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnchange('emp_contact', cleaned);
                  }}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CNIC</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.emp_cnic}
                  maxLength={15}
                  keyboardType="number-pad"
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9]/g, '');
                    if (cleaned.length > 5)
                      cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                    if (cleaned.length > 13)
                      cleaned =
                        cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                    if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                    editOnchange('emp_cnic', cleaned);
                  }}
                />
              </View>

              {/* Row 4 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Person One</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.emp_contact_person_one}
                  maxLength={12}
                  keyboardType="phone-pad"
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9]/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnchange('emp_contact_person_one', cleaned);
                  }}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.emp_sec_contact}
                  maxLength={12}
                  keyboardType="phone-pad"
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9]/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnchange('emp_sec_contact', cleaned);
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Person Two</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.emp_contact_person_two}
                  maxLength={12}
                  keyboardType="phone-pad"
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9]/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnchange('emp_contact_person_two', cleaned);
                  }}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.emp_third_contact}
                  maxLength={12}
                  keyboardType="phone-pad"
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9]/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnchange('emp_third_contact', cleaned);
                  }}
                />
              </View>

              {/* Worker Type */}
              <Text style={[styles.inputLabel, {marginTop: 10}]}>
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
                    color={THEME.primary}
                    uncheckedColor={THEME.textDark}
                    onPress={() => setEditWorker('Worker')}
                  />
                  <Text style={{color: THEME.textDark, fontWeight: 'bold'}}>
                    Worker
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{flexDirection: 'row', alignItems: 'center'}}
                  onPress={() => setEditWorker('other')}
                  activeOpacity={0.7}>
                  <RadioButton
                    value="other"
                    status={editWorker === 'other' ? 'checked' : 'unchecked'}
                    color={THEME.primary}
                    uncheckedColor={THEME.textDark}
                    onPress={() => setEditWorker('other')}
                  />
                  <Text style={{color: THEME.textDark, fontWeight: 'bold'}}>
                    Other
                  </Text>
                </TouchableOpacity>
              </View>

              {editWorker === 'other' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Other</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Specify type"
                    placeholderTextColor="#999"
                    value={editForm.emp_type}
                    onChangeText={t => editOnchange('emp_type', t)}
                  />
                </View>
              )}

              {/* Submit */}
              <TouchableOpacity style={styles.updateBtn} onPress={editEmployee}>
                <Icon name="check" size={20} color="white" />
                <Text style={styles.updateBtnText}>Update Employee</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Toast />
        </View>
      </Modal>
      <BottomBar />
    </SafeAreaView>
  );
};

export default EmployeeDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- REFINED HEADER STYLES ---
  headerGradient: {
    paddingBottom: 50, // Extra space for overlap
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 8,
    shadowColor: THEME.primary,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  navBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  navTitle: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: THEME.white,
    backgroundColor: THEME.white,
  },
  editIconBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: THEME.white,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 6,
  },
  badgeText: {
    color: THEME.white,
    fontSize: 13,
    fontWeight: '600',
  },
  balanceContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  balanceValue: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: '700',
  },

  // --- CONTENT & CARDS ---
  contentContainer: {
    paddingHorizontal: 16,
    marginTop: -30, // Moves card up to overlap header
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textDark,
    letterSpacing: 0.3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: THEME.textGray,
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    color: THEME.textDark,
    fontWeight: '600',
  },

  // --- MODALS (Standard Styles) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  deleteModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  delAnim: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  deleteModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginBottom: 8,
  },
  deleteModalMessage: {
    fontSize: 15,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  // Edit Modal Styles
  editModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    maxHeight: '85%',
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },
  closeBtn: {
    padding: 5,
  },
  editForm: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.textDark,
  },
  updateBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  updateBtnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
