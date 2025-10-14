import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import backgroundColors from '../Colors';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';

interface Labour {
  labr_name: string;
  labr_cnic: string;
  labr_address: string;
  labr_contact: string;
  labr_email: string;
  labr_contact_person_one: string;
  labr_contact_person_two: string;
  labr_sec_contact: string;
  labr_third_contact: string;
  labr_image: string;
  labr_opening_balance: string;
  labr_payment_type: string;
  labr_transaction_type: string;
}

interface EditForm {
  labr_name: string;
  labr_email: string;
  labr_address: string;
  labr_contact: string;
  labr_contact_person_one: string;
  labr_contact_person_two: string;
  labr_cnic: string;
  labr_sec_contact: string;
  labr_third_contact: string;
}

const initialEditForm: EditForm = {
  labr_name: '',
  labr_email: '',
  labr_address: '',
  labr_contact: '',
  labr_contact_person_one: '',
  labr_contact_person_two: '',
  labr_cnic: '',
  labr_sec_contact: '',
  labr_third_contact: '',
};

const LabourDetails = ({navigation, route}: any) => {
  const {id} = route.params;
  const {token} = useUser();
  const [labour, setLabour] = useState<Labour | null>(null);
  const [modalVisible, setModalVisible] = useState('');
  const [editForm, setEditForm] = useState<EditForm>(initialEditForm);

  const handleEditInputChange = (field: keyof EditForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get Labour Details
  const fetchLabDetails = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/showlabour?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setLabour(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Labour
  const handleDeleteLabr = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/Labourdelete`, {
        id: id,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Labour has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setModalVisible('');
        navigation.navigate('Labour');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Get data to update
  const getEditData = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editlabour?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEditForm(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Update Labour
  const handleUpdateLabr = async () => {
    const nameRegex = /^[A-Za-z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const labrName = (editForm.labr_name ?? '').trim();
    const labrEmail = (editForm.labr_email ?? '').trim();
    const labrAddress = (editForm.labr_address ?? '').trim();

    if (!labrName) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all fields and select a role before updating.',
        visibilityTime: 1500,
      });
      return;
    }

    if (!nameRegex.test(labrName)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Labour name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (labrEmail && !emailRegex.test(labrEmail)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/updatelabour`, {
        Labour_id: id,
        labour_name: labrName,
        cnic: editForm.labr_cnic ?? '',
        contact: editForm.labr_contact ?? '',
        email: labrEmail,
        contact_person_one: editForm.labr_contact_person_one ?? '',
        sec_contact: editForm.labr_sec_contact ?? '',
        contact_person_two: editForm.labr_contact_person_two ?? '',
        third_contact: editForm.labr_third_contact ?? '',
        address: labrAddress,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Labour has been updated successfully!',
          visibilityTime: 1500,
        });

        setEditForm(initialEditForm);
        setModalVisible('');

        setTimeout(() => {
          setModalVisible('Success');
        }, 500);
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Contact number already exist!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 204) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email already exist!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 205) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'CNIC already exist!',
          visibilityTime: 1500,
        });
      }
    } catch (error: any) {
      console.log('Update Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.response?.data?.message || error.message,
        visibilityTime: 3000,
      });
    }
  };

  useEffect(() => {
    fetchLabDetails();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Labour');
            }}>
            <Icon
              name="chevron-left"
              size={28}
              color={backgroundColors.light}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Labour Details</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerBtn]}
          onPress={() => {
            setModalVisible('Delete');
          }}>
          <Icon name="delete" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Details */}
      <ScrollView
        style={styles.detailsContainer}
        showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarBox}>
          <Image
            source={require('../../assets/man.png')}
            style={styles.avatar}
          />
          <Text style={styles.custName}>{labour?.labr_name}</Text>
        </View>

        <View style={styles.innerDetails}>
          <View style={styles.innerHeader}>
            <Text style={styles.headerText}>Labour Details</Text>
            <TouchableOpacity
              style={{flexDirection: 'row', gap: 5}}
              onPress={() => {
                getEditData();
                setModalVisible('Edit');
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
              <Text style={styles.label}>Labour Name</Text>
              <Text style={styles.value}>{labour?.labr_name ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>{labour?.labr_contact ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>CNIC</Text>
              <Text style={styles.value}>{labour?.labr_cnic ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{labour?.labr_email ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact Person 1</Text>
              <Text style={styles.value}>
                {labour?.labr_contact_person_one ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>
                {labour?.labr_sec_contact ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact Person 2</Text>
              <Text style={styles.value}>
                {labour?.labr_contact_person_two ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>
                {labour?.labr_third_contact ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{labour?.labr_address ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Opening Balance</Text>
              <Text style={styles.value}>
                {labour?.labr_opening_balance ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Payment Type</Text>
              <Text style={styles.value}>
                {labour?.labr_payment_type ?? '--'}
              </Text>
            </View>
            <View style={[styles.detailsRow, {borderBottomWidth: 0}]}>
              <Text style={styles.label}>Transaction Type</Text>
              <Text style={styles.value}>
                {labour?.labr_transaction_type ?? '--'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/*Delete Modal*/}
      <Modal
        visible={modalVisible === 'Delete'}
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
                onPress={handleDeleteLabr}>
                <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/*Edit*/}
      <Modal
        visible={modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.editLabModalOverlay}>
          <ScrollView style={styles.editLabModalContainer}>
            {/* Header */}
            <View style={styles.editLabHeader}>
              <Text style={styles.editLabTitle}>Edit Labour</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setEditForm(initialEditForm);
                }}
                style={styles.editLabCloseBtn}>
                <Icon name="close" size={20} color="#144272" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.editLabForm}>
              {/* Row 1 */}
              <View style={styles.editLabField}>
                <Text style={styles.editLabLabel}>Labour Name *</Text>
                <TextInput
                  style={styles.editLabInput}
                  value={editForm.labr_name}
                  onChangeText={t => handleEditInputChange('labr_name', t)}
                />
              </View>
              <View style={styles.editLabField}>
                <Text style={styles.editLabLabel}>CNIC</Text>
                <TextInput
                  style={styles.editLabInput}
                  value={editForm.labr_cnic}
                  keyboardType="numeric"
                  maxLength={15}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                    if (cleaned.length > 5)
                      cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                    if (cleaned.length > 13)
                      cleaned =
                        cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                    if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                    handleEditInputChange('labr_cnic', cleaned);
                  }}
                />
              </View>

              {/* Row 2 */}
              <View style={styles.editLabField}>
                <Text style={styles.editLabLabel}>Contact</Text>
                <TextInput
                  style={styles.editLabInput}
                  value={editForm.labr_contact}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleEditInputChange('labr_contact', cleaned);
                  }}
                />
              </View>
              <View style={styles.editLabField}>
                <Text style={styles.editLabLabel}>Email</Text>
                <TextInput
                  style={styles.editLabInput}
                  value={editForm.labr_email}
                  keyboardType="email-address"
                  onChangeText={t => handleEditInputChange('labr_email', t)}
                />
              </View>

              {/* Row 3 */}
              <View style={styles.editLabField}>
                <Text style={styles.editLabLabel}>Contact Person 1</Text>
                <TextInput
                  style={styles.editLabInput}
                  value={editForm.labr_contact_person_one}
                  onChangeText={t =>
                    handleEditInputChange('labr_contact_person_one', t)
                  }
                />
              </View>
              <View style={styles.editLabField}>
                <Text style={styles.editLabLabel}>Contact 1</Text>
                <TextInput
                  style={styles.editLabInput}
                  value={editForm.labr_sec_contact}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleEditInputChange('labr_sec_contact', cleaned);
                  }}
                />
              </View>

              {/* Row 4 */}
              <View style={styles.editLabField}>
                <Text style={styles.editLabLabel}>Contact Person 2</Text>
                <TextInput
                  style={styles.editLabInput}
                  value={editForm.labr_contact_person_two}
                  onChangeText={t =>
                    handleEditInputChange('labr_contact_person_two', t)
                  }
                />
              </View>
              <View style={styles.editLabField}>
                <Text style={styles.editLabLabel}>Contact 2</Text>
                <TextInput
                  style={styles.editLabInput}
                  value={editForm.labr_third_contact}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleEditInputChange('labr_third_contact', cleaned);
                  }}
                />
              </View>

              {/* Address */}
              <View style={[styles.editLabField, {flex: 1}]}>
                <Text style={styles.editLabLabel}>Address</Text>
                <TextInput
                  style={styles.editLabInput}
                  value={editForm.labr_address}
                  onChangeText={t => handleEditInputChange('labr_address', t)}
                />
              </View>

              {/* Update Button */}
              <TouchableOpacity
                style={styles.editLabSubmitBtn}
                onPress={handleUpdateLabr}>
                <Icon name="account-edit" size={20} color="white" />
                <Text style={styles.editLabSubmitText}>Update Labour</Text>
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

            {/* Title */}
            <Text style={styles.deleteModalTitle}>Updated!</Text>

            {/* Subtitle */}
            <Text style={styles.deleteModalMessage}>
              Labour record has been updated successfully!
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

export default LabourDetails;

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
  custName: {
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
  modalOverlay: {
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

  // Edit Labour Modal Styles
  editLabModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  editLabModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  editLabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editLabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.primary,
  },
  editLabCloseBtn: {
    padding: 5,
  },
  editLabForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  editLabField: {
    flex: 1,
    marginBottom: 5,
  },
  editLabFullRow: {
    marginBottom: 15,
  },
  editLabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 5,
  },
  editLabInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  editLabDropdownRow: {
    marginBottom: 15,
  },
  editLabDropdownField: {
    flex: 1,
  },
  editLabDropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 42,
    zIndex: 999,
  },
  editLabDropdownContainer: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    zIndex: 1000,
    maxHeight: 160,
  },
  editLabDropdownText: {
    color: '#333',
    fontSize: 14,
  },
  editLabDropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  editLabSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  editLabSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
