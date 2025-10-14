import {
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import backgroundColors from '../Colors';
import {ScrollView} from 'react-native-gesture-handler';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import {RadioButton} from 'react-native-paper';

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
      console.log(employee);
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

      console.log('Edit payload:', payload);

      const res = await axios.post(`${BASE_URL}/updateemployee`, payload);

      if (res.status === 200 && res.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Employee has been updated successfully',
          visibilityTime: 1500,
        });
        fetchEmpDetails();
        setEditForm(initialEditEmployee);
        setModalVisible('');
        setEditWorker('Worker');

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
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Employees');
            }}>
            <Icon
              name="chevron-left"
              size={28}
              color={backgroundColors.light}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Employee Details</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerBtn]}
          onPress={() => {
            setModalVisible('EmpDelete');
          }}>
          <Icon name="delete" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Employee Details */}
      <ScrollView
        style={styles.detailsContainer}
        showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarBox}>
          <Image
            source={require('../../assets/man.png')}
            style={styles.avatar}
          />
          <Text style={styles.empName}>{employee?.emp_name}</Text>
        </View>

        {/* Inner Details */}
        <View style={styles.innerDetails}>
          <View style={styles.innerHeader}>
            <Text style={styles.headerText}>Employee Details</Text>
            <TouchableOpacity
              style={{flexDirection: 'row', gap: 5}}
              onPress={() => {
                setModalVisible('EditEmp');
                getEditData();
              }}>
              <Text style={styles.editText}>Edit</Text>
              <Icon
                name="square-edit-outline"
                size={18}
                color={backgroundColors.dark}
              />
            </TouchableOpacity>
          </View>

          {/* Details */}
          <View style={styles.detailsView}>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Employee Name</Text>
              <Text style={styles.value}>{employee?.emp_name ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Father Name</Text>
              <Text style={styles.value}>
                {employee?.emp_fathername ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>{employee?.emp_contact ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{employee?.emp_email ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact Person 1</Text>
              <Text style={styles.value}>
                {employee?.emp_contact_person_one ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>
                {employee?.emp_sec_contact ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact Person 2</Text>
              <Text style={styles.value}>
                {employee?.emp_contact_person_two ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>
                {employee?.emp_third_contact ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Employee Type</Text>
              <Text style={styles.value}>{employee?.emp_type ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{employee?.emp_address ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>CNIC</Text>
              <Text style={styles.value}>{employee?.emp_cnic ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Opening Balance</Text>
              <Text style={styles.value}>
                {employee?.emp_opening_balance ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Transaction Type</Text>
              <Text style={styles.value}>
                {employee?.emp_transaction_type ?? '--'}
              </Text>
            </View>
            <View style={[styles.detailsRow, {borderBottomWidth: 0}]}>
              <Text style={styles.label}>Paymemt Type</Text>
              <Text style={styles.value}>
                {employee?.emp_payment_type ?? '--'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/*Epmloyee Delete*/}
      <Modal
        visible={modalVisible === 'EmpDelete'}
        transparent
        animationType="fade">
        <View style={styles.delModalOverlay}>
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
        <View style={styles.editEmployeeModalOverlay}>
          <ScrollView style={styles.editEmployeeModalContainer}>
            {/* Header */}
            <View style={styles.editEmployeeHeader}>
              <Text style={styles.editEmployeeTitle}>Edit Employee</Text>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={styles.editEmployeeCloseBtn}>
                <Icon name="close" size={20} color="#144272" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.editEmployeeForm}>
              {/* Row 1 */}
              <View style={styles.editEmployeeField}>
                <Text style={styles.editEmployeeLabel}>Employee Name *</Text>
                <TextInput
                  style={styles.editEmployeeInput}
                  value={editForm.emp_name}
                  onChangeText={t => editOnchange('emp_name', t)}
                />
              </View>
              <View style={styles.editEmployeeField}>
                <Text style={styles.editEmployeeLabel}>Father Name</Text>
                <TextInput
                  style={styles.editEmployeeInput}
                  value={editForm.emp_fathername}
                  onChangeText={t => editOnchange('emp_fathername', t)}
                />
              </View>

              {/* Row 2 */}
              <View style={styles.editEmployeeField}>
                <Text style={styles.editEmployeeLabel}>Email</Text>
                <TextInput
                  style={styles.editEmployeeInput}
                  value={editForm.emp_email}
                  onChangeText={t => editOnchange('emp_email', t)}
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.editEmployeeField}>
                <Text style={styles.editEmployeeLabel}>Address</Text>
                <TextInput
                  style={styles.editEmployeeInput}
                  value={editForm.emp_address}
                  onChangeText={t => editOnchange('emp_address', t)}
                />
              </View>

              {/* Row 3 */}
              <View style={styles.editEmployeeField}>
                <Text style={styles.editEmployeeLabel}>Contact</Text>
                <TextInput
                  style={styles.editEmployeeInput}
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
              <View style={styles.editEmployeeField}>
                <Text style={styles.editEmployeeLabel}>CNIC</Text>
                <TextInput
                  style={styles.editEmployeeInput}
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
              <View style={styles.editEmployeeField}>
                <Text style={styles.editEmployeeLabel}>Contact Person One</Text>
                <TextInput
                  style={styles.editEmployeeInput}
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
              <View style={styles.editEmployeeField}>
                <Text style={styles.editEmployeeLabel}>Contact</Text>
                <TextInput
                  style={styles.editEmployeeInput}
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

              <View style={styles.editEmployeeField}>
                <Text style={styles.editEmployeeLabel}>Contact Person Two</Text>
                <TextInput
                  style={styles.editEmployeeInput}
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
              <View style={styles.editEmployeeField}>
                <Text style={styles.editEmployeeLabel}>Contact</Text>
                <TextInput
                  style={styles.editEmployeeInput}
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
              <Text style={[styles.editEmployeeLabel, {marginLeft: 10}]}>
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
                    color={backgroundColors.primary}
                    uncheckedColor={backgroundColors.dark}
                    onPress={() => setEditWorker('Worker')}
                  />
                  <Text style={{color: backgroundColors.dark, fontWeight: 'bold'}}>Worker</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{flexDirection: 'row', alignItems: 'center'}}
                  onPress={() => setEditWorker('other')}
                  activeOpacity={0.7}>
                  <RadioButton
                    value="other"
                    status={editWorker === 'other' ? 'checked' : 'unchecked'}
                    color={backgroundColors.primary}
                    uncheckedColor={backgroundColors.dark}
                    onPress={() => setEditWorker('other')}
                  />
                  <Text style={{color: backgroundColors.dark, fontWeight: 'bold'}}>Other</Text>
                </TouchableOpacity>
              </View>

              {editWorker === 'other' && (
                <View style={styles.editEmployeeFullRow}>
                  <Text style={styles.editEmployeeLabel}>Other</Text>
                  <TextInput
                    style={styles.editEmployeeInput}
                    placeholder="Specify type"
                    placeholderTextColor="#999"
                    value={editForm.emp_type}
                    onChangeText={t => editOnchange('emp_type', t)}
                  />
                </View>
              )}

              {/* Submit */}
              <TouchableOpacity
                style={styles.editEmployeeSubmitBtn}
                onPress={editEmployee}>
                <Icon name="account-edit" size={20} color="white" />
                <Text style={styles.editEmployeeSubmitText}>
                  Update Employee
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Toast />
        </View>
      </Modal>

      {/*Success*/}
      <Modal
        visible={modalVisible === 'Success'}
        transparent
        animationType="fade">
        <View style={styles.delModalOverlay}>
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

            {/* Title */}
            <Text style={styles.deleteModalTitle}>Updated!</Text>

            {/* Subtitle */}
            <Text style={styles.deleteModalMessage}>
              Employee record has been updated successfully!
            </Text>

            {/* Buttons */}
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[
                  styles.deleteModalBtn,
                  {backgroundColor: backgroundColors.success},
                ]}
                onPress={() => {
                  setModalVisible('');
                }}>
                <Text style={styles.deleteModalBtnText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default EmployeeDetails;

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
  headerCenter: {
    flex: 1,
    gap: 10,
    flexDirection: 'row',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
  },

  // Details container
  detailsContainer: {
    flex: 1,
    paddingHorizontal: '3%',
  },
  avatarBox: {
    marginVertical: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    height: 125,
    width: 125,
  },
  empName: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 10,
    color: backgroundColors.primary,
  },

  // Inner Details
  innerDetails: {
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  innerHeader: {
    width: '100%',
    height: 50,
    borderBottomColor: backgroundColors.primary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: backgroundColors.dark,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
  },
  detailsView: {
    flex: 1,
  },
  detailsRow: {
    alignItems: 'baseline',
    paddingVertical: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: backgroundColors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.primary,
  },
  value: {
    fontSize: 16,
    color: backgroundColors.dark,
  },

  //Delete Modal
  delModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
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

  // Add Modal Styling
  editEmployeeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  editEmployeeModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  editEmployeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editEmployeeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.primary,
  },
  editEmployeeCloseBtn: {
    padding: 5,
  },
  editEmployeeForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  editEmployeeField: {
    flex: 1,
    marginBottom: 5,
  },
  editEmployeeFullRow: {
    marginBottom: 15,
  },
  editEmployeeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 5,
  },
  editEmployeeInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  editEmployeeRadioText: {
    color: '#144272',
    fontSize: 14,
    marginRight: 15,
  },
  editEmployeeDropdownRow: {
    marginBottom: 15,
  },
  editEmployeeDropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 42,
    zIndex: 999,
  },
  editEmployeeDropdownContainer: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    zIndex: 1000,
    maxHeight: 160,
  },
  editEmployeeDropdownText: {
    color: '#333',
    fontSize: 14,
  },
  editEmployeeDropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  editEmployeeSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  editEmployeeSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
