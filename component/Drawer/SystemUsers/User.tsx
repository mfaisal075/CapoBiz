import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';

interface SystemUser {
  id: number;
  name: string;
  email: string;
  contact: string;
  cnic: string;
  role: string;
}

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

interface UserForm {
  name: string;
  contact: string;
  cnic: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: any;
}

const initialUserForm: UserForm = {
  name: '',
  contact: '',
  cnic: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
};

export default function User() {
  const {openDrawer} = useDrawer();
  const {token} = useUser();
  const [systemUser, setSystemUser] = useState<SystemUser[] | []>([]);
  const [customer, setcustomer] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditUser>(initialEditUser);
  const [roleDropDown, setRoleDropDown] = useState<RolesDropDown[]>([]);
  const [roleValue, setRoleValue] = useState<string | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserForm>(initialUserForm);

  const transformedRoleDropDown = roleDropDown.map(item => ({
    label: item.role_name,
    value: item.id.toString(),
  }));

  const togglecustomer = () => {
    setcustomer(!customer);
  };

  const handleEditInputChange = (field: keyof EditUser, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUserIputChange = (field: keyof UserForm, value: string) => {
    setUserForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const [isModalV, setModalV] = useState(false);

  // Pagination for Customer
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData = systemUser;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Edit Modal
  const [edit, setedit] = useState(false);
  const toggleEdit = async (id: number) => {
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

      // Find the role id from the dropdown using the role name
      const roleObj = roleDropDown.find(
        role => role.role_name === res.data.role,
      );
      setRoleValue(roleObj ? roleObj.id.toString() : null);

      setSelectedUser(id);
      setedit(!edit);
    } catch (error) {
      console.log(error);
    }
  };

  // Add User
  const handleAddUser = async () => {
    if (
      !userForm.name ||
      !userForm.contact ||
      !userForm.cnic ||
      !userForm.email ||
      !userForm.password ||
      !userForm.confirmPassword ||
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

    if (userForm.password !== userForm.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Password and Confirm Password do not match.',
        visibilityTime: 1500,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z\s]+$/;

    if (!emailRegex.test(userForm.email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
        visibilityTime: 1500,
      });
      return;
    }

    if (!nameRegex.test(userForm.name)) {
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
      const res = await axios.post(`${BASE_URL}/adduser`, {
        name: userForm.name,
        contact: userForm.contact,
        cnic: userForm.cnic,
        email: userForm.email,
        password: userForm.password,
        role: roleName,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added',
          text2: 'User has been Added successfully',
          visibilityTime: 1500,
        });
        setUserForm(initialUserForm);
        setRoleValue(null);
        setcustomer(false);
        handleFetchData();
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

  // Delete User
  const handleDeleteUser = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/userdelete`, {
        id: selectedUser,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted',
          text2: 'User has been Deleted successfully',
          visibilityTime: 1500,
        });

        setSelectedUser(null);
        setModalV(false);
        handleFetchData();
      }
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
        user_id: selectedUser,
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

        setEditForm(initialEditUser);
        setedit(!edit);
        setSelectedUser(null);
        handleFetchData();
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

  // Fetch Data
  const handleFetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchusers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSystemUser(res.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleFetchData();
    fetchRoleDropDown();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Users</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} onPress={togglecustomer}>
            <Icon name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                  <View style={styles.headerTxtContainer}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {item.name?.charAt(0) || 'U'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.productName}>{item.name}</Text>
                    </View>
                  </View>
                  <View style={styles.actionContainer}>
                    <TouchableOpacity
                      style={styles.acctionBtn}
                      onPress={() => {
                        toggleEdit(item.id);
                      }}>
                      <Icon name="pencil" size={20} color={'#144272'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.acctionBtn}
                      onPress={() => {
                        setModalV(!isModalV);
                        setSelectedUser(item.id);
                        console.log(selectedUser);
                      }}>
                      <Icon name="delete" size={20} color={'red'} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="phone"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Contact</Text>
                    </View>
                    <Text style={styles.valueText}>{item.contact}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="id-card"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>CNIC</Text>
                    </View>
                    <Text style={styles.valueText}>{item.cnic}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="mail"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Email</Text>
                    </View>
                    <Text style={styles.valueText}>{item.email}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="account-cog"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Role</Text>
                    </View>
                    <Text style={styles.valueText}>{item.role}</Text>
                  </View>
                </View>
              </View>
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

        {/* Add User Modal */}
        <Modal visible={customer} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Add New User</Text>
                <TouchableOpacity
                  onPress={() => {
                    setcustomer(!customer);
                    setUserForm(initialUserForm);
                    setRoleValue(null);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
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
                      placeholder="Select Role"
                      placeholderStyle={styles.addCustomerDropdownPlaceholder}
                      textStyle={styles.addCustomerDropdownText}
                      ArrowUpIconComponent={() => (
                        <Icon name="chevron-up" size={18} color="#144272" />
                      )}
                      ArrowDownIconComponent={() => (
                        <Icon name="chevron-down" size={18} color="#144272" />
                      )}
                      style={styles.addCustomerDropdown}
                      dropDownContainerStyle={
                        styles.addCustomerDropdownContainer
                      }
                      listItemLabelStyle={{color: '#144272'}}
                      listMode="SCROLLVIEW"
                    />
                  </View>
                </View>

                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Name *</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter full name"
                      value={userForm.name}
                      onChangeText={text => handleUserIputChange('name', text)}
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
                      value={userForm.contact}
                      onChangeText={text => {
                        let cleaned = text.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleUserIputChange('contact', cleaned);
                      }}
                    />
                  </View>
                </View>

                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>CNIC *</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="12345-1234567-1"
                      keyboardType="numeric"
                      maxLength={15}
                      value={userForm.cnic}
                      onChangeText={text => {
                        let cleaned = text.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 5)
                          cleaned =
                            cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                        if (cleaned.length > 13)
                          cleaned =
                            cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                        if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                        handleUserIputChange('cnic', cleaned);
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
                      value={userForm.email}
                      onChangeText={text => handleUserIputChange('email', text)}
                    />
                  </View>
                </View>

                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Password *</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter password"
                      secureTextEntry
                      value={userForm.password}
                      onChangeText={text =>
                        handleUserIputChange('password', text)
                      }
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>
                      Confirm Password *
                    </Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Confirm password"
                      secureTextEntry
                      value={userForm.confirmPassword}
                      onChangeText={text =>
                        handleUserIputChange('confirmPassword', text)
                      }
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={handleAddUser}>
                  <Icon name="account-plus-outline" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>Add User</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/* Delete User Modal */}
        <Modal visible={isModalV} transparent animationType="fade">
          <View style={styles.addCustomerModalOverlay}>
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
                    setModalV(!isModalV);
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
        <Modal visible={edit} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Edit User</Text>
                <TouchableOpacity
                  onPress={() => {
                    setedit(!edit);
                    setEditForm(initialEditUser);
                    setSelectedUser(null);
                    setRoleValue(null);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
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
                      placeholder="Select Role"
                      placeholderStyle={styles.addCustomerDropdownPlaceholder}
                      textStyle={styles.addCustomerDropdownText}
                      ArrowUpIconComponent={() => (
                        <Icon name="chevron-up" size={18} color="#144272" />
                      )}
                      ArrowDownIconComponent={() => (
                        <Icon name="chevron-down" size={18} color="#144272" />
                      )}
                      style={styles.addCustomerDropdown}
                      dropDownContainerStyle={
                        styles.addCustomerDropdownContainer
                      }
                      listItemLabelStyle={{color: '#144272'}}
                      listMode="SCROLLVIEW"
                    />
                  </View>
                </View>

                <View style={styles.addCustomerRow}>
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
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleEditInputChange('contact', cleaned);
                      }}
                    />
                  </View>
                </View>

                <View style={styles.addCustomerRow}>
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
                          cleaned =
                            cleaned.slice(0, 5) + '-' + cleaned.slice(5);
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
                      onChangeText={text =>
                        handleEditInputChange('email', text)
                      }
                    />
                  </View>
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

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
              onPress={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))
              }
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
  background: {
    flex: 1,
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

  // Flat List Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    zIndex: 1000,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  headerTxtContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
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
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#144272',
    flexWrap: 'wrap',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  acctionBtn: {
    padding: 8,
    backgroundColor: '#14417212',
    borderRadius: 8,
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 12,
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
    flex: 1,
  },
  infoIcon: {
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
    maxWidth: '50%',
    textAlign: 'right',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },

  // Pagination Styling
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
    paddingVertical: 8,
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
    alignItems: 'center',
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

  // Add Customer Modal Styles
  addCustomerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  addCustomerModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
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
    color: '#144272',
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
    marginHorizontal: 5,
  },
  addCustomerFullRow: {
    marginBottom: 15,
  },
  addCustomerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
    marginBottom: 5,
  },
  addCustomerInput: {
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
  addCustomerDropdownRow: {
    marginBottom: 15,
  },
  addCustomerDropdownField: {
    flex: 1,
  },
  addCustomerDropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 42,
    zIndex: 999,
  },
  addCustomerDropdownContainer: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    zIndex: 1000,
    maxHeight: 160,
  },
  addCustomerDropdownText: {
    color: '#333',
    fontSize: 14,
  },
  addCustomerDropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  addCustomerSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#144272',
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
});
