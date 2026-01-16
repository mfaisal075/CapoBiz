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
  BackHandler,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import BottomBar from '../../BottomBar';

const {width} = Dimensions.get('window');

// --- THEME (Matching CustomerPeople.tsx) ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F0F2F5',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
  danger: '#EF4444',
  shadow: '#000000',
};

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

// --- HELPER: Get Initials ---
const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

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
  const [roleDropDown, setRoleDropDown] = useState<RolesDropDown[]>([]);
  const [roleValue, setRoleValue] = useState<string | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserForm>(initialUserForm);
  const [modalVisible, setModalVisible] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<SystemUser[]>([]);
  const [masterData, setMasterData] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData = filteredData;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

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
        setModalVisible('');
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

  const handleFetchData = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

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

    const backKey = () => {
      navigation.navigate('Dashboard');
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

      {/* --- MODERN HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>System Users</Text>
            <TouchableOpacity
              onPress={() => setModalVisible('Add')}
              style={styles.iconBtn}>
              <Icon name="plus" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Floating Search Bar */}
        <View style={styles.floatingSearchContainer}>
          <Icon name="magnify" size={22} color={THEME.primary} />
          <TextInput
            placeholder="Search users..."
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
              source={require('../../../assets/Loading-Dots.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        ) : (
          <>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeaderLabel}>USER LIST</Text>
              <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
            </View>

            <FlatList
              data={paginatedData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={styles.cardRow}
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
                  {/* Avatar Section */}
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {getInitials(item.name)}
                    </Text>
                  </View>

                  {/* Info Section */}
                  <View style={styles.infoContainer}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 2,
                      }}>
                      <Text style={styles.nameText} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.badgeContainer}>
                        <View style={styles.areaBadge}>
                          <Text style={styles.areaBadgeText} numberOfLines={1}>
                            {item.role || 'User'}
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
                        {item.contact || 'No Contact'}
                      </Text>
                    </View>
                  </View>

                  {/* Arrow */}
                  <Icon
                    name="chevron-right"
                    size={22}
                    color={THEME.primary}
                    style={{marginLeft: 6}}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={{paddingBottom: 160}}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.centerContent}>
                  <Icon name="account-search" size={60} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              }
            />
          </>
        )}
      </View>

      {/* --- PAGINATION (Bottom Floating) --- */}
      {!loading && totalRecords > 0 && (
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

      {/* --- ADD USER MODAL --- */}
      <Modal
        visible={modalVisible === 'Add'}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible('')}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New User</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setUserForm(initialUserForm);
                  setRoleValue(null);
                }}
                style={styles.closeBtn}>
                <Icon name="close" size={24} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Role *</Text>
                <DropDownPicker
                  items={transformedRoleDropDown}
                  open={roleOpen}
                  setOpen={setRoleOpen}
                  value={roleValue}
                  setValue={setRoleValue}
                  placeholder="Select Role"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.inputText}
                  listMode="SCROLLVIEW"
                  zIndex={3000}
                  zIndexInverse={1000}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  placeholderTextColor={THEME.textGray}
                  value={userForm.name}
                  onChangeText={text => handleUserIputChange('name', text)}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                  <Text style={styles.label}>Contact *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0300-1234567"
                    placeholderTextColor={THEME.textGray}
                    keyboardType="phone-pad"
                    maxLength={12}
                    value={userForm.contact}
                    onChangeText={text => {
                      let cleaned = text.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      handleUserIputChange('contact', cleaned);
                    }}
                  />
                </View>
                <View style={[styles.inputGroup, {flex: 1}]}>
                  <Text style={styles.label}>CNIC *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="CNIC Number"
                    placeholderTextColor={THEME.textGray}
                    keyboardType="numeric"
                    maxLength={15}
                    value={userForm.cnic}
                    onChangeText={text => {
                      let cleaned = text.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 5)
                        cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                      if (cleaned.length > 13)
                        cleaned =
                          cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                      if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                      handleUserIputChange('cnic', cleaned);
                    }}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="user@example.com"
                  placeholderTextColor={THEME.textGray}
                  keyboardType="email-address"
                  value={userForm.email}
                  onChangeText={text => handleUserIputChange('email', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={THEME.textGray}
                  secureTextEntry
                  value={userForm.password}
                  onChangeText={text => handleUserIputChange('password', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor={THEME.textGray}
                  secureTextEntry
                  value={userForm.confirmPassword}
                  onChangeText={text =>
                    handleUserIputChange('confirmPassword', text)
                  }
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleAddUser}>
                <Text style={styles.submitBtnText}>Create User</Text>
              </TouchableOpacity>
              <View style={{height: 20}} />
            </ScrollView>
          </View>
        </View>
        <Toast />
      </Modal>
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
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

  // --- List ---
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
    elevation: 8,
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
    marginTop: 3,
  },
  areaBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.textDark,
    maxWidth: 80,
  },

  // --- Pagination (Floating) ---
  paginationContainer: {
    position: 'absolute',
    bottom: 100,
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

  // --- Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: THEME.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  closeBtn: {
    padding: 5,
  },
  modalBody: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: THEME.background,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.textDark,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  dropdown: {
    backgroundColor: THEME.background,
    borderColor: THEME.border,
    borderRadius: 12,
  },
  dropdownContainer: {
    borderColor: THEME.border,
  },
  inputText: {
    fontSize: 14,
    color: THEME.textDark,
  },
  submitBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
