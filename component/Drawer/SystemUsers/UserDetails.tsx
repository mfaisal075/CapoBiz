import {
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import backgroundColors from '../../Colors';
import {ScrollView} from 'react-native';
import LottieView from 'lottie-react-native';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import {useUser} from '../../CTX/UserContext';
import DropDownPicker from 'react-native-dropdown-picker';

interface EditUser {
  user_id: number;
  name: string;
  contact: string;
  cnic: string;
  email: string;
  role: number;
}

const initialEditUser: EditUser = {
  user_id: 0,
  name: '',
  contact: '',
  cnic: '',
  email: '',
  role: 0,
};

interface RolesDropDown {
  id: number;
  role_name: string;
}

const UserDetails = ({navigation, route}: any) => {
  const {id, name, contact, email, cnic, role} = route.params;
  const [modalVisible, setModalVisible] = useState('');
  const {token} = useUser();
  const [editForm, setEditForm] = useState<EditUser>(initialEditUser);
  const [roleValue, setRoleValue] = useState<string | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleDropDown, setRoleDropDown] = useState<RolesDropDown[]>([]);
  const transformedRoleDropDown = roleDropDown.map(item => ({
    label: item.role_name,
    value: item.id.toString(),
  }));

  const handleEditInputChange = (field: keyof EditUser, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch Role DropDown
  const fetchRoleDropDown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchrolesdropdown`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoleDropDown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/userdelete`, {
        id: id,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted',
          text2: 'User has been Deleted successfully',
          visibilityTime: 1500,
        });

        setModalVisible('');
        navigation.navigate('Users');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Get user data to edit
  const getEditData = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editusers?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEditForm(res.data);

      const role = res.data.role;

      setRoleValue(
        roleDropDown.find(rol => rol.role_name === role)?.id?.toString() ||
          null,
      );
    } catch (error) {
      console.log(error);
    }
  };

  // Update User
  const handleUpdateUser = async () => {
    if (
      !editForm.name ||
      !editForm.email ||
      !editForm.contact ||
      !editForm.cnic ||
      roleValue === null
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all fields and select a role before updating.',
        visibilityTime: 1500,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z\s]+$/;

    if (!emailRegex.test(editForm.email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
        visibilityTime: 1500,
      });
      return;
    }

    if (!nameRegex.test(editForm.name)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Name should not contain special characters or numbers.',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const roleName = roleDropDown.find(
        role => role.id.toString() === roleValue,
      )?.role_name;
      const res = await axios.put(`${BASE_URL}/updateusers`, {
        user_id: id,
        name: editForm.name.trim(),
        contact: editForm.contact.trim(),
        cnic: editForm.cnic.trim(),
        email: editForm.email.trim(),
        role: roleName,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'User has been Updated successfully',
          visibilityTime: 1500,
        });

        const updatedUser = {
          id,
          name: editForm.name.trim(),
          contact: editForm.contact.trim(),
          cnic: editForm.cnic.trim(),
          email: editForm.email.trim(),
          role: roleName,
        };

        // Update the params in the current route
        navigation.setParams(updatedUser);

        setEditForm(initialEditUser);
        setModalVisible('');
        setRoleValue(null);
      } else if (res.status === 200 && data.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email Already Exists!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 405) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'CNIC Already Exists!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 406) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This Contact No. Already Exists!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRoleDropDown();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Users');
            }}>
            <Icon
              name="chevron-left"
              size={28}
              color={backgroundColors.light}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Details</Text>
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
            source={require('../../../assets/man.png')}
            style={styles.avatar}
          />
          <Text style={styles.custName}>{name}</Text>
        </View>

        {/* Inner Details */}
        <View style={styles.innerDetails}>
          <View style={styles.innerHeader}>
            <Text style={styles.headerText}>User Details</Text>
            <TouchableOpacity
              style={{flexDirection: 'row', gap: 5}}
              onPress={() => {
                setModalVisible('Edit');
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
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{name ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>{contact ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>CNIC</Text>
              <Text style={styles.value}>{cnic ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{email ?? '--'}</Text>
            </View>
            <View style={[styles.detailsRow, {borderBottomWidth: 0}]}>
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>{role ?? '--'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Delete User Modal */}
      <Modal
        visible={modalVisible === 'Delete'}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.delAnim}>
              <LottieView
                style={{flex: 1}}
                source={require('../../../assets/warning.json')}
                autoPlay
                loop={false}
              />
            </View>

            <Text style={styles.deleteModalTitle}>Are you sure?</Text>
            <Text style={styles.deleteModalMessage}>
              You won't be able to revert this record!
            </Text>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.deleteModalBtn, {backgroundColor: '#e0e0e0'}]}
                onPress={() => {
                  setModalVisible('');
                }}>
                <Text style={[styles.deleteModalBtnText, {color: '#144272'}]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteModalBtn, {backgroundColor: '#d9534f'}]}
                onPress={handleDeleteUser}>
                <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        visible={modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.addCustomerModalOverlay}>
          <ScrollView style={styles.addCustomerModalContainer}>
            <View style={styles.addCustomerHeader}>
              <Text style={styles.addCustomerTitle}>Edit User</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setEditForm(initialEditUser);
                  setRoleValue(null);
                }}
                style={styles.addCustomerCloseBtn}>
                <Icon name="close" size={20} color={backgroundColors.dark} />
              </TouchableOpacity>
            </View>

            <View style={styles.addCustomerForm}>
              <View style={styles.addCustomerDropdownRow}>
                <View style={styles.addCustomerDropdownField}>
                  <Text style={styles.addCustomerLabel}>Role *</Text>
                  <DropDownPicker
                    items={transformedRoleDropDown}
                    open={roleOpen}
                    setOpen={setRoleOpen}
                    value={roleValue}
                    setValue={setRoleValue}
                    placeholder="Select Role *"
                    placeholderStyle={styles.addCustomerDropdownPlaceholder}
                    textStyle={styles.addCustomerDropdownText}
                    ArrowUpIconComponent={() => (
                      <Icon
                        name="chevron-up"
                        size={18}
                        color={backgroundColors.dark}
                      />
                    )}
                    ArrowDownIconComponent={() => (
                      <Icon
                        name="chevron-down"
                        size={18}
                        color={backgroundColors.dark}
                      />
                    )}
                    style={styles.addCustomerDropdown}
                    dropDownContainerStyle={styles.addCustomerDropdownContainer}
                    listMode="SCROLLVIEW"
                    listItemLabelStyle={{
                      color: backgroundColors.dark,
                      fontWeight: '500',
                    }}
                    labelStyle={{
                      color: backgroundColors.dark,
                      fontSize: 16,
                    }}
                    searchable
                    searchTextInputStyle={{
                      borderWidth: 0,
                      width: '100%',
                    }}
                    searchContainerStyle={{
                      borderColor: backgroundColors.gray,
                    }}
                  />
                </View>
              </View>

              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Name *</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Enter full name"
                  value={editForm.name}
                  onChangeText={text => handleEditInputChange('name', text)}
                />
              </View>

              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Contact *</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="0300-1234567"
                  keyboardType="phone-pad"
                  maxLength={12}
                  value={editForm.contact}
                  onChangeText={text => {
                    let cleaned = text.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleEditInputChange('contact', cleaned);
                  }}
                />
              </View>

              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>CNIC *</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="12345-1234567-1"
                  keyboardType="numeric"
                  maxLength={15}
                  value={editForm.cnic}
                  onChangeText={text => {
                    let cleaned = text.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 5)
                      cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                    if (cleaned.length > 13)
                      cleaned =
                        cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                    if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                    handleEditInputChange('cnic', cleaned);
                  }}
                />
              </View>

              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Email *</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="user@example.com"
                  keyboardType="email-address"
                  value={editForm.email}
                  onChangeText={text => handleEditInputChange('email', text)}
                />
              </View>

              <TouchableOpacity
                style={styles.addCustomerSubmitBtn}
                onPress={handleUpdateUser}>
                <Icon name="account-edit" size={20} color="white" />
                <Text style={styles.addCustomerSubmitText}>Update User</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Toast />
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
};

export default UserDetails;

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

  // Edit Customer Modal Styles
  addCustomerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  addCustomerModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  addCustomerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addCustomerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.dark,
  },
  addCustomerCloseBtn: {
    padding: 5,
  },
  addCustomerForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  addCustomerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  addCustomerField: {
    flex: 1,
    marginBottom: 5,
  },
  addCustomerFullRow: {
    marginBottom: 15,
  },
  addCustomerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 5,
  },
  addCustomerInput: {
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
  },
  addCustomerDropdownRow: {
    marginBottom: 15,
  },
  addCustomerDropdownField: {
    flex: 1,
  },
  addCustomerDropdown: {
    backgroundColor: backgroundColors.light,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
  },
  addCustomerDropdownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    maxHeight: 200,
  },
  addCustomerDropdownText: {
    color: '#333',
    fontSize: 14,
  },
  addCustomerDropdownPlaceholder: {
    color: '#888',
    fontSize: 14,
  },
  addCustomerSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  addCustomerSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
