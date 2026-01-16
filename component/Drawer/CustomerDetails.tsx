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
};

// --- INTERFACES ---
interface CustomersDetails {
  cust: {
    id: number;
    cust_area_id: string;
    cust_type_id: string;
    cust_sup_id: string;
    cust_name: string;
    cust_fathername: string;
    cust_contact: string;
    cust_sec_contact: string;
    cust_third_contact: string;
    cust_contact_person_one: string;
    cust_contact_person_two: string;
    cust_cnic: string;
    cust_email: string;
    cust_address: string;
    cust_image: string;
    cust_status: string;
    cust_payment_type: string;
    cust_opening_balance: string;
    cust_transaction_type: string;
    created_at: string;
    updated_at: string;
  };
  type: {
    id: number;
    custtyp_name: string;
    custtyp_status: string;
    created_at: string;
    updated_at: string;
  };
  area: {
    id: number;
    area_name: string;
    area_status: string;
    created_at: string;
    updated_at: string;
  };
}

interface EditCustomer {
  id: number;
  cust_area_id: number;
  cust_type_id: number;
  cust_sup_id: number;
  cust_name: string;
  cust_fathername: string;
  cust_contact: string;
  cust_sec_contact: string;
  cust_third_contact: string;
  cust_contact_person_one: string;
  cust_contact_person_two: string;
  cust_cnic: string;
  cust_email: string;
  cust_address: string;
  cust_payment_type: string;
  cust_opening_balance: string;
  cust_transaction_type: string;
  updated_at: string;
}

const initialEditCustomer: EditCustomer = {
  id: 0,
  cust_area_id: 0,
  cust_type_id: 0,
  cust_sup_id: 0,
  cust_name: '',
  cust_fathername: '',
  cust_contact: '',
  cust_sec_contact: '',
  cust_third_contact: '',
  cust_contact_person_one: '',
  cust_contact_person_two: '',
  cust_cnic: '',
  cust_email: '',
  cust_address: '',
  cust_payment_type: '',
  cust_opening_balance: '',
  cust_transaction_type: '',
  updated_at: '',
};

interface TypeData {
  id: string;
  custtyp_name: string;
  custtyp_status: string;
  created_at: string;
  updated_at: string;
}

interface AreaData {
  id: string;
  area_name: string;
  area_status: string;
  created_at: string;
  updated_at: string;
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

const CustomerDetails = ({navigation, route}: any) => {
  const {id} = route.params;
  const {token} = useUser();
  const [open, setOpen] = useState(false);
  const [typeValue, setTypeValue] = useState('');
  const [openArea, setOpenArea] = useState(false);
  const [areaValue, setAreaValue] = useState('');
  const [customer, setCustomer] = useState<CustomersDetails | null>(null);
  const [modalVisible, setModalVisible] = useState('');
  const [editForm, setEditForm] = useState<EditCustomer>(initialEditCustomer);
  const [types, setTypes] = useState<TypeData[]>([]);
  const [areaData, setAreaData] = useState<AreaData[]>([]);

  const transformedTypes = types.map(item => ({
    label: item.custtyp_name,
    value: item.id,
  }));

  const transformedAreas = areaData.map(item => ({
    label: item.area_name,
    value: item.id,
  }));

  const editOnChange = (field: keyof EditCustomer, value: string | number) => {
    setEditForm(prev => ({...prev, [field]: value}));
  };

  // --- API CALLS ---
  const fetchType = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchtypedata`);
      setTypes(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchareadata`);
      setAreaData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCustDetails = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/custshow?id=${id}&_token=${token}`,
      );
      setCustomer(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const delCustomer = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/customerdelete`, {id: id});
      if (res.status === 200 && res.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Customer has been deleted.',
        });
        setModalVisible('');
        navigation.goBack();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getEditData = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editcustomer?id=${id}&_token=${token}`,
      );
      setEditForm(res.data);
      setTypeValue(res.data.cust_type_id);
      setAreaValue(res.data.cust_area_id);
      setModalVisible('Edit');
    } catch (error) {
      console.log(error);
    }
  };

  const updateCustomer = async () => {
    const nameRegex = /^[A-Za-z ]+$/;
    const name = editForm.cust_name?.trim() || '';
    const fatherName = editForm.cust_fathername?.trim() || '';
    const email = editForm.cust_email?.trim() || '';

    if (!name) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Name is mandatory',
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/updatecustomer`, {
        cust_id: editForm.id,
        cust_name: name,
        fathername: fatherName,
        email: email,
        contact: editForm.cust_contact?.trim() || '',
        contact_person_one: editForm.cust_contact_person_one || '',
        sec_contact: editForm.cust_sec_contact || '',
        contact_person_two: editForm.cust_contact_person_two || '',
        third_contact: editForm.cust_third_contact || '',
        cnic: editForm.cust_cnic || '',
        address: editForm.cust_address || '',
        cust_type: typeValue,
        cust_area: areaValue,
      });

      const data = res.data;
      if (res.status === 200 && data.status === 200) {
        setEditForm(initialEditCustomer);
        setAreaValue('');
        setTypeValue('');
        setModalVisible('');
        fetchCustDetails();
        setTimeout(() => setModalVisible('Success'), 500);
      } else {
        if (data.status === 202)
          Toast.show({
            type: 'error',
            text1: 'Warning',
            text2: 'Contact exists',
          });
        if (data.status === 203)
          Toast.show({type: 'error', text1: 'Warning', text2: 'CNIC exists'});
        if (data.status === 204)
          Toast.show({type: 'error', text1: 'Warning', text2: 'Email exists'});
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCustDetails();
    fetchType();
    fetchAreas();
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      },
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
            <Text style={styles.navTitle}>Profile</Text>
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
                onPress={() => getEditData()}>
                <Icon name="pencil" size={16} color={THEME.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>
              {customer?.cust?.cust_name || 'Loading...'}
            </Text>

            <View style={styles.badgeRow}>
              <View style={styles.capsuleBadge}>
                <Icon name="tag-outline" size={14} color={THEME.white} />
                <Text style={styles.capsuleText}>
                  {customer?.type?.custtyp_name || 'N/A'}
                </Text>
              </View>
              <View style={styles.capsuleBadge}>
                <Icon name="map-marker-outline" size={14} color={THEME.white} />
                <Text style={styles.capsuleText}>
                  {customer?.area?.area_name || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Main Balance Card (Floating) */}
            <View style={styles.balanceCard}>
              <View>
                <Text style={styles.balanceLabel}>Opening Balance</Text>
                <Text style={styles.balanceAmount}>
                  Rs. {customer?.cust?.cust_opening_balance || '0.00'}
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
          {/* Personal Info */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Personal Information</Text>
            </View>
            <DetailRow
              icon="account-details"
              label="Father Name"
              value={customer?.cust?.cust_fathername!}
            />
            <DetailRow
              icon="card-account-details-outline"
              label="CNIC"
              value={customer?.cust?.cust_cnic!}
            />
            <DetailRow
              icon="email-outline"
              label="Email"
              value={customer?.cust?.cust_email!}
            />
            <DetailRow
              icon="map-marker-radius-outline"
              label="Address"
              value={customer?.cust?.cust_address!}
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
              value={customer?.cust?.cust_contact!}
            />
            <DetailRow
              icon="account-tie-outline"
              label="Contact Person 1"
              value={customer?.cust?.cust_contact_person_one!}
            />
            <DetailRow
              icon="phone-classic"
              label="Secondary Phone"
              value={customer?.cust?.cust_sec_contact!}
            />
            <DetailRow
              icon="account-tie-outline"
              label="Contact Person 2"
              value={customer?.cust?.cust_contact_person_two!}
            />
            <DetailRow
              icon="phone-classic"
              label="Third Phone"
              value={customer?.cust?.cust_third_contact!}
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
              value={customer?.cust?.cust_payment_type!}
            />
            <DetailRow
              icon="bank-transfer"
              label="Transaction Type"
              value={customer?.cust?.cust_transaction_type!}
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
                source={require('../../assets/warning.json')} // Ensure you have this or use an Icon
                autoPlay
                loop={false}
                style={{width: '100%', height: '100%'}}
              />
            </View>
            <Text style={styles.modalTitle}>Delete Customer?</Text>
            <Text style={styles.modalText}>
              This action cannot be undone. All data associated with this
              customer will be lost.
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible('')}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDelete} onPress={delCustomer}>
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
              Customer record updated successfully.
            </Text>
            <TouchableOpacity
              style={[styles.btnPrimary, {width: '100%', marginTop: 15}]}
              onPress={() => setModalVisible('')}>
              <Text style={styles.btnPrimaryText}>OK, Great</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- EDIT CUSTOMER MODAL --- */}
      <Modal
        visible={modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Customer</Text>
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
                  value={editForm.cust_name}
                  onChangeText={t => editOnChange('cust_name', t)}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.label}>Father Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.cust_fathername}
                    onChangeText={t => editOnChange('cust_fathername', t)}
                  />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>CNIC</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.cust_cnic}
                    keyboardType="numeric"
                    maxLength={15}
                    placeholder="xxxxx-xxxxxxx-x"
                    onChangeText={t => editOnChange('cust_cnic', t)}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.cust_email}
                  keyboardType="email-address"
                  onChangeText={t => editOnChange('cust_email', t)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Physical Address</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.cust_address}
                  multiline
                  onChangeText={t => editOnChange('cust_address', t)}
                />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Contact Info</Text>
              </View>

              <View style={styles.rowInputs}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.label}>Primary Contact</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.cust_contact}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => editOnChange('cust_contact', t)}
                  />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>Contact Person 1</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.cust_contact_person_one}
                    onChangeText={t =>
                      editOnChange('cust_contact_person_one', t)
                    }
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.label}>Secondary Contact</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.cust_sec_contact}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => editOnChange('cust_sec_contact', t)}
                  />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>Contact Person 2</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.cust_contact_person_two}
                    onChangeText={t =>
                      editOnChange('cust_contact_person_two', t)
                    }
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Third Contact</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.cust_third_contact}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => editOnChange('cust_third_contact', t)}
                />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Classification</Text>
              </View>

              <View style={[styles.formGroup, {zIndex: 2000}]}>
                <Text style={styles.label}>Customer Type</Text>
                <DropDownPicker
                  items={transformedTypes}
                  open={open}
                  setOpen={setOpen}
                  value={typeValue}
                  setValue={setTypeValue}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                />
              </View>

              <View style={[styles.formGroup, {zIndex: 1000}]}>
                <Text style={styles.label}>Area</Text>
                <DropDownPicker
                  items={transformedAreas}
                  open={openArea}
                  setOpen={setOpenArea}
                  value={areaValue}
                  setValue={setAreaValue}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                />
              </View>

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={updateCustomer}>
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

export default CustomerDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

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
  sectionHeader: {
    marginBottom: 15,
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 5,
  },
  sectionHeaderText: {
    color: THEME.primary,
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
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
