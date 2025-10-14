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

interface Transporter {
  trans_name: string;
  trans_cnic: string;
  trans_address: string;
  trans_contact: string;
  trans_email: string;
  trans_contact_person_one: string;
  trans_contact_person_two: string;
  trans_sec_contact: string;
  trans_third_contact: string;
  trans_image: string;
  trans_opening_balance: string;
  trans_payment_type: string;
  trans_transaction_type: string;
}

interface EditForm {
  trans_name: string;
  trans_email: string;
  trans_address: string;
  trans_contact: string;
  trans_contact_person_one: string;
  trans_contact_person_two: string;
  trans_cnic: string;
  trans_sec_contact: string;
  trans_third_contact: string;
}

const initialEditForm: EditForm = {
  trans_name: '',
  trans_email: '',
  trans_address: '',
  trans_contact: '',
  trans_contact_person_one: '',
  trans_contact_person_two: '',
  trans_cnic: '',
  trans_sec_contact: '',
  trans_third_contact: '',
};

const TransporterDetails = ({navigation, route}: any) => {
  const {id} = route.params;
  const {token} = useUser();
  const [modalVisible, setModalVisible] = useState('');
  const [trans, setTrans] = useState<Transporter | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(initialEditForm);

  const handleEditInputChange = (field: keyof EditForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get Transporter Details
  const getTransDetails = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/showTransporter?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTrans(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Transporter
  const handleDeleteTrans = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/Transporterdelete`, {
        id: id,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Transporter has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setModalVisible('');
        navigation.navigate('Transporter');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Get data to update
  const getEditData = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editTransporter?id=${id}&_token=${token}`,
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

  // Update Transporter
  const handleEditTrans = async () => {
    const nameRegex = /^[A-Za-z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const transName = (editForm.trans_name ?? '').trim();
    const transEmail = (editForm.trans_email ?? '').trim();
    const transAddress = (editForm.trans_address ?? '').trim();

    if (!transName) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Field names with * are Mandatory',
        visibilityTime: 1500,
      });
      return;
    }

    if (!nameRegex.test(transName)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Customer name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (transEmail && !emailRegex.test(transEmail)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/updateTransporter`, {
        transporter_id: id,
        trans_name: transName,
        cnic: editForm.trans_cnic ?? '',
        contact: editForm.trans_contact ?? '',
        email: transEmail,
        contact_person_one: editForm.trans_contact_person_one ?? '',
        sec_contact: editForm.trans_sec_contact ?? '',
        contact_person_two: editForm.trans_contact_person_two ?? '',
        third_contact: editForm.trans_third_contact ?? '',
        address: transAddress,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Transporter has been updated successfully!',
          visibilityTime: 2000,
        });

        setEditForm(initialEditForm);
        setModalVisible('');
        getTransDetails();
        setTimeout(() => {
          setModalVisible('Success');
        }, 500);
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Contact number already exist',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 204) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email already exist',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 205) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'CNIC already exist',
          visibilityTime: 2000,
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
    getTransDetails();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Transporter');
            }}>
            <Icon
              name="chevron-left"
              size={28}
              color={backgroundColors.light}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transporter Details</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerBtn]}
          onPress={() => setModalVisible('Delete')}>
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
          <Text style={styles.custName}>{trans?.trans_name}</Text>
        </View>

        {/* Inner Details */}
        <View style={styles.innerDetails}>
          <View style={styles.innerHeader}>
            <Text style={styles.headerText}>Transporter Details</Text>
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

          <View style={styles.detailsView}>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Transporter Name</Text>
              <Text style={styles.value}>{trans?.trans_name ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>{trans?.trans_contact ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>CNIC</Text>
              <Text style={styles.value}>{trans?.trans_cnic ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{trans?.trans_email ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact Person 1</Text>
              <Text style={styles.value}>
                {trans?.trans_contact_person_one ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>
                {trans?.trans_sec_contact ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact Person 2</Text>
              <Text style={styles.value}>
                {trans?.trans_contact_person_two ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>
                {trans?.trans_third_contact ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Addreaa</Text>
              <Text style={styles.value}>{trans?.trans_address ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Opening Balance</Text>
              <Text style={styles.value}>
                {trans?.trans_opening_balance ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Payment Type</Text>
              <Text style={styles.value}>
                {trans?.trans_payment_type ?? '--'}
              </Text>
            </View>
            <View style={[styles.detailsRow, {borderBottomWidth: 0}]}>
              <Text style={styles.label}>Transaction Type</Text>
              <Text style={styles.value}>
                {trans?.trans_transaction_type ?? '--'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Delete Modal */}
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
                onPress={handleDeleteTrans}>
                <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
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
              Transporter record has been updated successfully!
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

      {/* Edit Transporter Modal */}
      <Modal
        visible={modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.editTransModalOverlay}>
          <ScrollView style={styles.editTransModalContainer}>
            {/* Header */}
            <View style={styles.editTransHeader}>
              <Text style={styles.editTransTitle}>Edit Transporter</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setEditForm(initialEditForm);
                }}
                style={styles.editTransCloseBtn}>
                <Icon name="close" size={20} color="#144272" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.editTransForm}>
              {/* Name */}
              <View style={styles.editTransField}>
                <Text style={styles.editTransLabel}>Transporter Name *</Text>
                <TextInput
                  style={styles.editTransInput}
                  value={editForm.trans_name}
                  onChangeText={t => handleEditInputChange('trans_name', t)}
                />
              </View>

              {/* CNIC + Contact */}
              <View style={styles.editTransField}>
                <Text style={styles.editTransLabel}>CNIC</Text>
                <TextInput
                  style={styles.editTransInput}
                  keyboardType="numeric"
                  maxLength={15}
                  value={editForm.trans_cnic}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 5)
                      cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                    if (cleaned.length > 13)
                      cleaned =
                        cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                    if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                    handleEditInputChange('trans_cnic', cleaned);
                  }}
                />
              </View>
              <View style={styles.editTransField}>
                <Text style={styles.editTransLabel}>Contact</Text>
                <TextInput
                  style={styles.editTransInput}
                  keyboardType="phone-pad"
                  maxLength={12}
                  value={editForm.trans_contact}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleEditInputChange('trans_contact', cleaned);
                  }}
                />
              </View>

              {/* Email + Contact Person 1 */}
              <View style={styles.editTransField}>
                <Text style={styles.editTransLabel}>Email</Text>
                <TextInput
                  style={styles.editTransInput}
                  keyboardType="email-address"
                  value={editForm.trans_email}
                  onChangeText={t => handleEditInputChange('trans_email', t)}
                />
              </View>
              <View style={styles.editTransField}>
                <Text style={styles.editTransLabel}>Contact Person 1</Text>
                <TextInput
                  style={styles.editTransInput}
                  keyboardType="phone-pad"
                  maxLength={12}
                  value={editForm.trans_contact_person_one}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleEditInputChange('trans_contact_person_one', cleaned);
                  }}
                />
              </View>

              {/* Contact 1 + Contact Person 2 */}
              <View style={styles.editTransField}>
                <Text style={styles.editTransLabel}>Contact 1</Text>
                <TextInput
                  style={styles.editTransInput}
                  keyboardType="phone-pad"
                  maxLength={12}
                  value={editForm.trans_sec_contact}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleEditInputChange('trans_sec_contact', cleaned);
                  }}
                />
              </View>
              <View style={styles.editTransField}>
                <Text style={styles.editTransLabel}>Contact Person 2</Text>
                <TextInput
                  style={styles.editTransInput}
                  keyboardType="phone-pad"
                  maxLength={12}
                  value={editForm.trans_contact_person_two}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleEditInputChange('trans_contact_person_two', cleaned);
                  }}
                />
              </View>

              {/* Contact 2 + Address */}
              <View style={styles.editTransField}>
                <Text style={styles.editTransLabel}>Contact 2</Text>
                <TextInput
                  style={styles.editTransInput}
                  keyboardType="phone-pad"
                  maxLength={12}
                  value={editForm.trans_third_contact}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleEditInputChange('trans_third_contact', cleaned);
                  }}
                />
              </View>
              <View style={styles.editTransField}>
                <Text style={styles.editTransLabel}>Address</Text>
                <TextInput
                  style={styles.editTransInput}
                  value={editForm.trans_address}
                  onChangeText={t => handleEditInputChange('trans_address', t)}
                />
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={styles.editTransSubmitBtn}
                onPress={handleEditTrans}>
                <Icon name="truck-check-outline" size={20} color="white" />
                <Text style={styles.editTransSubmitText}>
                  Update Transporter
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Toast />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TransporterDetails;

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

  // Add Customer Modal Styles
  editTransModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  editTransModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  editTransHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editTransTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.primary,
  },
  editTransCloseBtn: {
    padding: 5,
  },
  editTransForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  editTransRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  editTransField: {
    flex: 1,
    marginBottom: 5,
  },
  editTransFullRow: {
    marginBottom: 15,
  },
  editTransLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 5,
  },
  editTransInput: {
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
  editTransDropdownRow: {
    marginBottom: 15,
  },
  editTransDropdownField: {
    flex: 1,
  },
  editTransDropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 42,
    zIndex: 999,
  },
  editTransDropdownContainer: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    zIndex: 1000,
    maxHeight: 160,
  },
  editTransDropdownText: {
    color: '#333',
    fontSize: 14,
  },
  editTransDropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  editTransSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  editTransSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
