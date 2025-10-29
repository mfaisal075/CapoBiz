import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import backgroundColors from '../../Colors';

interface SystemUser {
  id: number;
  name: string;
  email: string;
  contact: string;
  cnic: string;
  role: string;
}

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

export default function User({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {token} = useUser();
  const [customer, setcustomer] = useState(false);
  const [roleDropDown, setRoleDropDown] = useState<RolesDropDown[]>([]);
  const [roleValue, setRoleValue] = useState<string | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserForm>(initialUserForm);
  const [modalVisible, setModalVisible] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<SystemUser[]>([]);
  const [masterData, setMasterData] = useState<SystemUser[]>([]);

  const transformedRoleDropDown = roleDropDown.map(item => ({
    label: item.role_name,
    value: item.id.toString(),
  }));

  const handleUserIputChange = (field: keyof UserForm, value: string) => {
    setUserForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Pagination for Customer
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData = filteredData;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

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

      const userData = res.data.user;

      setFilteredData(userData);
      setMasterData(userData);
    } catch (error) {
      console.log(error);
    }
  };

  // Search Filter
  const searchFilter = (text: string) => {
    if (text) {
      const newData = masterData.filter(item => {
        const itemData = item.name
          ? item.name.toLocaleUpperCase()
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
    handleFetchData();
    fetchRoleDropDown();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Users</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible('Add')}
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
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  navigation.navigate('UserDetails', {
                    id: item.id,
                    name: item.name,
                    contact: item.contact,
                    cnic: item.cnic,
                    email: item.email,
                    role: item.role,
                  });
                }}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View style={styles.avatarBox}>
                    <Image
                      source={require('../../../assets/man.png')}
                      style={styles.avatar}
                    />
                  </View>

                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.name}</Text>
                    {/* small details inline */}
                    <Text style={styles.subText}>
                      <Icon name="phone" size={12} color="#666" />{' '}
                      {item.contact || 'No contact'}
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

        {/* Add User Modal */}
        <Modal
          visible={modalVisible === 'Add'}
          transparent
          animationType="slide">
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

  // Pagination Styling
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
    color: backgroundColors.light,
    fontWeight: '600',
    fontSize: 14,
  },
  pageButtonTextDisabled: {
    color: backgroundColors.dark,
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
});
