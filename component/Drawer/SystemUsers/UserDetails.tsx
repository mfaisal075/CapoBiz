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
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../BottomBar';

// --- THEME (Matching CustomerDetails.tsx) ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  primarySoft: 'rgba(42, 101, 43, 0.1)',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textDark: '#1F2937',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
};

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

// --- HELPER COMPONENT FOR ROWS ---
// --- HELPER COMPONENT: Detail Row ---
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
    <View style={styles.iconBox}>
      <Icon name={icon} size={20} color={THEME.primary} />
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '--'}</Text>
    </View>
  </View>
);

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

    const backKey = () => {
      navigation.navigate('Users');
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
        {/* --- HEADER BACKGROUND --- */}
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          {/* Nav Bar */}
          <SafeAreaView style={styles.navBar}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Users')}
              style={styles.navBtn}>
              <Icon name="arrow-left" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>User Profile</Text>
            <TouchableOpacity
              onPress={() => setModalVisible('Delete')}
              style={styles.navBtn}>
              <Icon name="trash-can-outline" size={22} color={THEME.white} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={require('../../../assets/man.png')}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.editBadge}
                activeOpacity={0.8}
                onPress={() => {
                  getEditData();
                  setModalVisible('Edit');
                }}>
                <Icon name="pencil" size={16} color={THEME.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>{name || 'Loading...'}</Text>

            <View style={styles.badgeRow}>
              <View style={styles.capsuleBadge}>
                <Icon
                  name="shield-account-outline"
                  size={14}
                  color={THEME.white}
                />
                <Text style={styles.capsuleText}>{role || 'Role'}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* --- DETAILS CARDS --- */}
        <View style={styles.contentContainer}>
          {/* Card 1: Personal Info */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Personal Information</Text>
            </View>
            <DetailRow icon="account" label="Full Name" value={name} />
            <DetailRow icon="card-account-details" label="CNIC" value={cnic} />
            <DetailRow icon="email" label="Email" value={email} isLast />
          </View>

          {/* Card 2: Contact Details */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Contact Details</Text>
            </View>
            <DetailRow
              icon="phone"
              label="Primary Contact"
              value={contact}
              isLast
            />
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
            <View style={styles.lottieContainer}>
              <LottieView
                style={{flex: 1}}
                source={require('../../../assets/warning.json')}
                autoPlay
                loop={false}
              />
            </View>
            <Text style={styles.modalTitle}>Delete User?</Text>
            <Text style={styles.modalText}>This action cannot be undone.</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible('')}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDelete}
                onPress={handleDeleteUser}>
                <Text style={styles.btnDeleteText}>Delete</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit User</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setEditForm(initialEditUser);
                  setRoleValue(null);
                }}
                style={styles.closeModalBtn}>
                <Icon name="close" size={24} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.editModalBody}
              contentContainerStyle={{paddingBottom: 30}}>
              <View style={styles.formGroup}>
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
                  listMode="SCROLLVIEW"
                  zIndex={3000}
                  zIndexInverse={1000}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  placeholderTextColor={THEME.textGray}
                  value={editForm.name}
                  onChangeText={text => handleEditInputChange('name', text)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Contact *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0300-1234567"
                  placeholderTextColor={THEME.textGray}
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

              <View style={styles.formGroup}>
                <Text style={styles.label}>CNIC *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12345-1234567-1"
                  placeholderTextColor={THEME.textGray}
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

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="user@example.com"
                  placeholderTextColor={THEME.textGray}
                  keyboardType="email-address"
                  value={editForm.email}
                  onChangeText={text => handleEditInputChange('email', text)}
                />
              </View>

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleUpdateUser}>
                <Icon
                  name="check-circle-outline"
                  size={20}
                  color="white"
                  style={{marginRight: 8}}
                />
                <Text style={styles.btnPrimaryText}>Update User</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
        <Toast />
      </Modal>
      <BottomBar />
    </SafeAreaView>
  );
};

export default UserDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- HEADER & PROFILE ---
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  navBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  avatarWrapper: {
    marginBottom: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: THEME.white,
    backgroundColor: THEME.white,
  },
  editBadge: {
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
    fontSize: 22,
    fontWeight: '800',
    color: THEME.white,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  capsuleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  capsuleText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.white,
    marginLeft: 6,
  },

  // --- CONTENT ---
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: -20, // Overlap header slightly less due to missing balance card
  },
  sectionCard: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textDark,
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: THEME.textGray,
    marginBottom: 0,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: THEME.textDark,
    fontWeight: '600',
  },

  // --- MODALS ---
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
  lottieContainer: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnCancel: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnCancelText: {
    color: THEME.textDark,
    fontWeight: '700',
  },
  btnDelete: {
    flex: 1,
    backgroundColor: THEME.danger,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDeleteText: {
    color: THEME.white,
    fontWeight: '700',
  },

  // --- EDIT MODAL STYLES ---
  editModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },
  closeModalBtn: {
    padding: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  editModalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.textDark,
  },
  dropdown: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    minHeight: 45,
  },
  dropdownContainer: {
    borderColor: '#E5E7EB',
  },
  btnPrimary: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  btnPrimaryText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
