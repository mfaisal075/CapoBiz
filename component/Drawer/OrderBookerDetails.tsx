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
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../BottomBar';

// --- THEME ---
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
  success: '#10B981',
};

interface OrderBooker {
  booker: {
    name: string;
    cnic: string;
    area: string;
    contact: string;
    email: string;
    pic: string;
  };
  areas: Array<1>;
}

interface EditForm {
  name: string;
  email: string;
  contact: string;
  cnic: string;
  areas: Array<string>;
}

const initialEditForm: EditForm = {
  name: '',
  email: '',
  contact: '',
  cnic: '',
  areas: [],
};

interface AreaDropDown {
  id: string;
  area_name: string;
}

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

const OrderBookerDetails = ({navigation, route}: any) => {
  const {id} = route.params;
  const {token} = useUser();
  const [modalVisible, setModalVisible] = useState('');
  const [orderBooker, setOrderBooker] = useState<OrderBooker | null>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState<EditForm>(initialEditForm);
  const [areaDropdown, setAreaDropdown] = useState<AreaDropDown[] | []>([]);
  const [areaOpen, setAreaOpen] = useState(false);
  const transformedAreas = areaDropdown.map(item => ({
    label: item.area_name,
    value: Number(item.id),
  }));

  const handleEditInputChange = (
    field: keyof EditForm,
    value: string | Array<string>,
  ) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch Order Booker Details
  const fetchObDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/vieworderbooker?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOrderBooker(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete OrderBooker
  const handleDeleteOB = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/deleteorderbooker`, {
        id: id,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'OrderBooker has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setModalVisible('');
        navigation.navigate('Order Booker');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Area Data
  const handleFetchAreas = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchareadata`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAreaDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get data to update
  const getEditData = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editorderbooker?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const booker = res.data;

      // Convert "3,2" → [3, 2]
      const parsedAreas = booker.area
        ? booker.area.split(',').map((a: string) => Number(a.trim()))
        : [];

      setEditForm({
        name: booker.name || '',
        email: booker.email || '',
        contact: booker.contact || '',
        cnic: booker.cnic || '',
        areas: parsedAreas,
      });
      setModalVisible('Edit');
    } catch (error) {
      console.log(error);
    }
  };

  // Update OrderBooker
  const handleUpdateOB = async () => {
    const nameRegex = /^[A-Za-z ]+$/;

    if (!editForm.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all fields and select an area before updating.',
        visibilityTime: 1500,
      });
      return;
    }

    if (!nameRegex.test(editForm.name.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const formData = new FormData();

      formData.append('booker_id', id);
      formData.append('name', editForm.name.trim());
      formData.append('cnic', editForm.cnic);
      formData.append('contact1', editForm.contact);
      formData.append('email', editForm.email);

      if (Array.isArray(editForm.areas) && editForm.areas.length > 0) {
        editForm.areas.forEach(areaId => {
          formData.append('areas[]', areaId);
        });
      }

      const res = await axios.post(`${BASE_URL}/updateorderbooker`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        setEditForm(initialEditForm);
        setModalVisible('');
        fetchObDetails();
        setTimeout(() => {
          setModalVisible('Success');
        }, 500);
      } else if (res.status === 200 && data.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email Already Exist!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 203) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'CNIC Already Exist!',
          visibilityTime: 2000,
        });
      }
    } catch (error: any) {
      console.log('Update error:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    handleFetchAreas();
    fetchObDetails();

    const backKey = () => {
      navigation.navigate('Order Booker');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
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
              onPress={() => navigation.navigate('Order Booker')}
              style={styles.navBtn}>
              <Icon name="arrow-left" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Order Booker Details</Text>
            <TouchableOpacity
              onPress={() => setModalVisible('Delete')}
              style={[styles.navBtn]}>
              <Icon name="trash-can-outline" size={22} color={THEME.white} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={require('../../assets/man.png')}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.editBadge}
                activeOpacity={0.8}
                onPress={() => getEditData()}>
                <Icon name="pencil" size={16} color={THEME.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>
              {orderBooker?.booker?.name || 'Loading...'}
            </Text>

            {/* Badge Row */}
            <View style={styles.badgeRow}>
              <View style={styles.capsuleBadge}>
                <Icon
                  name="card-account-details-outline"
                  size={14}
                  color={THEME.white}
                />
                <Text style={styles.capsuleText}>Order Booker</Text>
              </View>
              <View style={styles.capsuleBadge}>
                <Icon name="map-marker-outline" size={14} color={THEME.white} />
                <Text style={styles.capsuleText}>
                  {orderBooker?.areas.length
                    ? `${orderBooker.areas.length} Areas`
                    : 'No Area'}
                </Text>
              </View>
            </View>

            {/* Note: Balance card omitted as per data structure but style maintained */}
          </View>
        </LinearGradient>

        {/* --- CONTENT CARDS --- */}
        <View style={styles.contentContainer}>
          {/* Personal Info */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Personal Information</Text>
            </View>
            <DetailRow
              icon="account"
              label="Full Name"
              value={orderBooker?.booker?.name!}
            />
            <DetailRow
              icon="email-outline"
              label="Email Address"
              value={orderBooker?.booker?.email!}
            />
            <DetailRow
              icon="card-account-details-outline"
              label="CNIC"
              value={orderBooker?.booker?.cnic!}
            />
            <DetailRow
              icon="map-marker-radius-outline"
              label="Assigned Areas"
              value={orderBooker?.areas.join(', ')!}
              isLast
            />
          </View>

          {/* Contact Info */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Contact Details</Text>
            </View>
            <DetailRow
              icon="phone"
              label="Phone Number"
              value={orderBooker?.booker?.contact!}
              isLast
            />
          </View>
        </View>
      </ScrollView>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal
        visible={modalVisible === 'Delete'}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.lottieContainer}>
              <LottieView
                source={require('../../assets/warning.json')}
                autoPlay
                loop={false}
                style={{width: '100%', height: '100%'}}
              />
            </View>
            <Text style={styles.modalTitle}>Delete Order Booker?</Text>
            <Text style={styles.modalText}>
              This action cannot be undone. All data associated with this record
              will be lost.
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible('')}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDelete}
                onPress={handleDeleteOB}>
                <Text style={styles.btnDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- SUCCESS MODAL --- */}
      <Modal
        visible={modalVisible === 'Success'}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.lottieContainer}>
              <LottieView
                source={require('../../assets/success.json')}
                autoPlay
                loop={false}
                style={{width: '100%', height: '100%'}}
              />
            </View>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalText}>
              Order Booker record updated successfully.
            </Text>
            <TouchableOpacity
              style={[styles.btnPrimary, {width: '100%', marginTop: 15}]}
              onPress={() => setModalVisible('')}>
              <Text style={styles.btnPrimaryText}>OK, Great</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- EDIT MODAL --- */}
      <Modal
        visible={modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Order Booker</Text>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={styles.closeModalBtn}>
                <Icon name="close" size={22} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.editModalBody}
              contentContainerStyle={{paddingBottom: 30}}>
              {/* Form Fields */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={t => handleEditInputChange('name', t)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.email}
                  keyboardType="email-address"
                  onChangeText={t => handleEditInputChange('email', t)}
                  editable={false} // Matches previous logic where email might not be editable or needed check
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.label}>Contact</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.contact}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      handleEditInputChange('contact', cleaned);
                    }}
                  />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>CNIC</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.cnic}
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
                      handleEditInputChange('cnic', cleaned);
                    }}
                  />
                </View>
              </View>

              <View style={[styles.formGroup, {zIndex: 1000}]}>
                <Text style={styles.label}>Assigned Areas</Text>
                <DropDownPicker
                  items={transformedAreas}
                  open={areaOpen}
                  setOpen={setAreaOpen}
                  value={editForm.areas}
                  setValue={callback => {
                    const newVal = callback(editForm.areas || []);
                    handleEditInputChange('areas', newVal || []);
                  }}
                  multiple={true}
                  mode="BADGE"
                  badgeDotColors={[THEME.primary]}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                  placeholder="Select Area"
                />
              </View>

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleUpdateOB}>
                <Icon
                  name="check-circle-outline"
                  size={20}
                  color="white"
                  style={{marginRight: 8}}
                />
                <Text style={styles.btnPrimaryText}>Update Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          <Toast />
        </View>
      </Modal>
      <BottomBar />
    </View>
  );
};

export default OrderBookerDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  // --- HEADER & PROFILE ---
  headerContainer: {
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? 30 : 0,
    marginBottom: 10,
  },
  navBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8, // Reduced from 10
    marginBottom: 12, // Reduced from 16
  },
  capsuleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    gap: 4,
  },
  capsuleText: {
    color: THEME.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // --- CONTENT SECTION ---
  contentContainer: {
    marginTop: -24, // Pulls content up to overlap header
    paddingHorizontal: 12,
    gap: 10,
  },
  sectionCard: {
    backgroundColor: THEME.white,
    borderRadius: 12, // Slightly tighter radius
    padding: 12, // Reduced padding
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08, // Slightly more visible shadow
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8, // Reduced
    marginBottom: 8, // Reduced
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5, // Reduced from 6
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // Slightly darker than F9FAFB for better separator visibility
  },
  iconBox: {
    width: 32, // Reduced from 36
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Reduced from 12
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
  rowInputs: {
    flexDirection: 'row',
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
