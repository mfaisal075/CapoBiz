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
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BASE_URL from '../BASE_URL';
import axios from 'axios';
import {useUser} from '../CTX/UserContext';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import {Checkbox} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
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

interface SupplierDetails {
  supp: {
    id: number;
    sup_area_id: string;
    sup_name: string;
    sup_company_name: string;
    sup_agancy_name: string;
    sup_address: string;
    sup_contact: string;
    sup_sec_contact: string;
    sup_third_contact: string;
    sup_email: string;
    sup_image: string;
    sup_payment_type: string;
    sup_transaction_type: string;
    sup_opening_balance: string;
  };
  area: {
    id: number;
    area_name: string;
  };
}

interface EditSupplier {
  id: number;
  sup_area_id: string;
  sup_name: string;
  sup_company_name: string;
  sup_agancy_name: string;
  sup_address: string;
  sup_contact: string;
  sup_sec_contact: string;
  sup_third_contact: string;
  sup_email: string;
}

const initialEditSupplier: EditSupplier = {
  id: 0,
  sup_address: '',
  sup_agancy_name: '',
  sup_area_id: '',
  sup_company_name: '',
  sup_contact: '',
  sup_email: '',
  sup_name: '',
  sup_sec_contact: '',
  sup_third_contact: '',
};

interface AreaDropDown {
  id: string;
  area_name: string;
}

const SupplierDetails = ({navigation, route}: any) => {
  const {id} = route.params;
  const {token} = useUser();
  const [supplier, setSupplier] = useState<SupplierDetails | null>(null);
  const [modalVisible, setModalVisible] = useState('');
  const [editForm, setEditForm] = useState<EditSupplier>(initialEditSupplier);
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaValue, setAreaValue] = useState<string | null>('');
  const [areaDropdown, setAreaDropdown] = useState<AreaDropDown[] | []>([]);
  const transformedAreas = areaDropdown.map(item => ({
    label: item.area_name,
    value: item.id,
  }));
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // On Change
  const handleEditInputChange = (
    field: keyof EditSupplier,
    value: string | number,
  ) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch Supplier Details
  const fetchSupDetails = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/suppliersshow?id=${id}&_token=${token}`,
      );
      setSupplier(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/supplierdelete`, {
        id: id,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Supplier has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setModalVisible('');
        navigation.navigate('Suppliers');
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

  // Get Edit Data
  const getEditData = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editsupplier?id=%20${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEditForm(res.data);
      setAreaValue(res.data.sup_area_id);
      setAreaOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  // Update Suuplier
  const handleUpdateSupplier = async () => {
    const nameRegex = /^[A-Za-z ]+$/;

    if (
      !editForm.sup_address ||
      !editForm.sup_name ||
      !editForm.sup_company_name
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all mandatory fields (*).',
        visibilityTime: 1500,
      });
      return;
    }

    if (editForm.sup_name.length < 3) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Supplier name must be at least 3 characters.',
        visibilityTime: 15,
      });
      return;
    }

    if (!nameRegex.test(editForm.sup_name.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Customer name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (editForm.sup_email && editForm.sup_email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.sup_email.trim())) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Email',
          text2: 'Please enter a valid email address.',
          visibilityTime: 2000,
        });
        return;
      }
    }

    try {
      const res = await axios.post(`${BASE_URL}/updatesupplier`, {
        supp_id: id,
        comp_name: editForm.sup_company_name.trim(),
        agencyname: editForm.sup_agancy_name,
        supp_name: editForm.sup_name.trim(),
        contact: editForm.sup_contact,
        sec_contact: editForm.sup_sec_contact,
        third_contact: editForm.sup_third_contact,
        email: editForm.sup_email,
        address: editForm.sup_address.trim(),
        supp_area: areaValue,
        ...(selectedOptions.includes('on') && {alsocust: 'on'}),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Supplier has been Updated successfully!',
          visibilityTime: 2000,
        });

        setEditForm(initialEditSupplier);
        setAreaValue(null);
        setAreaOpen(false);
        setAreaValue('');
        setModalVisible('');
        fetchSupDetails();
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Contact number already exist!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 204) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email already exist!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSupDetails();
    handleFetchAreas();

    const backKey = () => {
      navigation.navigate('Suppliers');
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
              onPress={() => navigation.goBack()}
              style={styles.navBtn}>
              <Icon name="arrow-left" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Supplier Profile</Text>
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
                source={require('../../assets/man.png')} // Replace with customer image if available
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

            <Text style={styles.profileName}>
              {supplier?.supp?.sup_name || 'Loading...'}
            </Text>

            <View style={styles.badgeRow}>
              <View style={styles.capsuleBadge}>
                <Icon name="domain" size={14} color={THEME.white} />
                <Text style={styles.capsuleText}>
                  {supplier?.supp?.sup_company_name || 'Company'}
                </Text>
              </View>
              <View style={styles.capsuleBadge}>
                <Icon name="map-marker-outline" size={14} color={THEME.white} />
                <Text style={styles.capsuleText}>
                  {supplier?.area?.area_name || 'General'}
                </Text>
              </View>
            </View>

            {/* Main Balance Card (Floating) */}
            <View style={styles.balanceCard}>
              <View>
                <Text style={styles.balanceLabel}>Opening Balance</Text>
                <Text style={styles.balanceAmount}>
                  Rs. {supplier?.supp?.sup_opening_balance || '0.00'}
                </Text>
              </View>
              <View style={styles.balanceIcon}>
                <Icon name="wallet-outline" size={24} color={THEME.white} />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* --- CONTENT CARDS --- */}
        <View style={styles.contentContainer}>
          {/* Company Info */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Company Information</Text>
            </View>
            <DetailRow
              icon="domain"
              label="Company Name"
              value={supplier?.supp?.sup_company_name!}
            />
            <DetailRow
              icon="office-building"
              label="Agency Name"
              value={supplier?.supp?.sup_agancy_name!}
            />
            <DetailRow
              icon="email-outline"
              label="Email"
              value={supplier?.supp?.sup_email!}
            />
            <DetailRow
              icon="map-marker-radius-outline"
              label="Address"
              value={supplier?.supp?.sup_address!}
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
              label="Primary Phone"
              value={supplier?.supp?.sup_contact!}
            />
            <DetailRow
              icon="phone-classic"
              label="Secondary Phone"
              value={supplier?.supp?.sup_sec_contact!}
            />
            <DetailRow
              icon="phone-classic"
              label="Third Phone"
              value={supplier?.supp?.sup_third_contact!}
              isLast
            />
          </View>

          {/* Financials Info */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Financial Setup</Text>
            </View>
            <DetailRow
              icon="cash-multiple"
              label="Payment Type"
              value={supplier?.supp?.sup_payment_type!}
            />
            <DetailRow
              icon="bank-transfer"
              label="Transaction Type"
              value={supplier?.supp?.sup_transaction_type!}
              isLast
            />
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
            <View style={styles.lottieContainer}>
              <LottieView
                source={require('../../assets/warning.json')}
                autoPlay
                loop={false}
                style={{width: '100%', height: '100%'}}
              />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Delete Supplier?</Text>

            {/* Subtitle */}
            <Text style={styles.modalText}>
              This action cannot be undone. All data associated with this
              supplier will be lost.
            </Text>

            {/* Buttons */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible('')}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnDelete}
                onPress={handleDeleteSupplier}>
                <Text style={styles.btnDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- EDIT SUPPLIER MODAL --- */}
      <Modal
        visible={modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Supplier</Text>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={styles.closeModalBtn}>
                <Icon name="close" size={22} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.editModalBody}
              contentContainerStyle={{paddingBottom: 30}}>
              {/* Also a Customer */}
              <View style={{marginBottom: 15, zIndex: 3000}}>
                <TouchableOpacity
                  style={{flexDirection: 'row', alignItems: 'center'}}
                  activeOpacity={0.7}
                  onPress={() => {
                    const newOptions = selectedOptions.includes('on')
                      ? selectedOptions.filter(opt => opt !== 'on')
                      : [...selectedOptions, 'on'];
                    setSelectedOptions(newOptions);
                  }}>
                  <Checkbox.Android
                    status={
                      selectedOptions.includes('on') ? 'checked' : 'unchecked'
                    }
                    color={THEME.primary}
                    uncheckedColor={THEME.textDark}
                  />
                  <Text style={styles.label}>Also a Customer</Text>
                </TouchableOpacity>
              </View>

              {/* Company + Agency */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Company Name *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.sup_company_name}
                  onChangeText={text =>
                    handleEditInputChange('sup_company_name', text)
                  }
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Agency Name</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.sup_agancy_name}
                  onChangeText={text =>
                    handleEditInputChange('sup_agancy_name', text)
                  }
                />
              </View>

              {/* Name + Email */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Supplier Name *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.sup_name}
                  onChangeText={text => handleEditInputChange('sup_name', text)}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.sup_email}
                  keyboardType="email-address"
                  onChangeText={text =>
                    handleEditInputChange('sup_email', text)
                  }
                />
              </View>

              {/* Contacts */}
              <View style={styles.rowInputs}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.label}>Contact 1</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.sup_contact}
                    maxLength={12}
                    keyboardType="phone-pad"
                    onChangeText={t => handleEditInputChange('sup_contact', t)}
                  />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>Contact 2</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.sup_sec_contact}
                    maxLength={12}
                    keyboardType="phone-pad"
                    onChangeText={t =>
                      handleEditInputChange('sup_sec_contact', t)
                    }
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Contact 3</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.sup_third_contact}
                  maxLength={12}
                  keyboardType="phone-pad"
                  onChangeText={t =>
                    handleEditInputChange('sup_third_contact', t)
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.sup_address}
                  onChangeText={text =>
                    handleEditInputChange('sup_address', text)
                  }
                />
              </View>

              {/* Area Dropdown */}
              <View style={[styles.formGroup, {zIndex: 1000}]}>
                <Text style={styles.label}>Supplier Area</Text>
                <DropDownPicker
                  items={transformedAreas}
                  open={areaOpen}
                  setOpen={setAreaOpen}
                  value={areaValue}
                  setValue={setAreaValue}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                />
              </View>

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleUpdateSupplier}>
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

export default SupplierDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- Header ---
  // --- HEADER & PROFILE ---
  headerContainer: {
    paddingBottom: 30, // Reduced from 40
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
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
    width: '100%',
    padding: 12, // Reduced from 16
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  balanceAmount: {
    color: THEME.white,
    fontSize: 22,
    fontWeight: '700',
  },
  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Content ---
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

  // --- Modals ---
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
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textDark,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
  },
  btnDelete: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.danger,
  },
  btnDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.white,
  },

  // Edit Modal
  editModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    flex: 1,
    marginBottom: 20,
    marginTop: 40,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.primary,
  },
  closeModalBtn: {
    padding: 5,
  },
  editModalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  sectionHeader: {
    marginVertical: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.primary,
  },
  dropdown: {
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  dropdownContainer: {
    borderColor: '#DDD',
    backgroundColor: THEME.white,
  },
  btnPrimary: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
