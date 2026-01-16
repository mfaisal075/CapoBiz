import {
  BackHandler,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

// --- HELPER COMPONENT: Detail Row (Matches CustomerDetails exactly) ---
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
          text2: 'Transporter has been deleted successfully!',
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
      setModalVisible('Edit');
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
      });
      return;
    }

    if (!nameRegex.test(transName)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Transporter name should only contain letters and spaces.',
      });
      return;
    }

    if (transEmail && !emailRegex.test(transEmail)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
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
        setEditForm(initialEditForm);
        setModalVisible('');
        getTransDetails();
        setTimeout(() => {
          setModalVisible('Success');
        }, 500);
      } else {
        if (data.status === 202)
          Toast.show({
            type: 'error',
            text1: 'Warning',
            text2: 'Contact exists',
          });
        if (data.status === 204)
          Toast.show({type: 'error', text1: 'Warning', text2: 'Email exists'});
        if (data.status === 205)
          Toast.show({type: 'error', text1: 'Warning', text2: 'CNIC exists'});
      }
    } catch (error: any) {
      console.log('Update Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.response?.data?.message || error.message,
      });
    }
  };

  useEffect(() => {
    getTransDetails();
    const backKey = () => {
      navigation.navigate('Transporter');
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
              onPress={() => navigation.navigate('Transporter')}
              style={styles.navBtn}>
              <Icon name="arrow-left" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Profile</Text>
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
                source={require('../../assets/man.png')} // Replace with transporter image if available
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
              {trans?.trans_name || 'Loading...'}
            </Text>

            <View style={styles.badgeRow}>
              {/* Only showing Address as badge since that's what we have available */}
              <View style={styles.capsuleBadge}>
                <Icon name="map-marker-outline" size={14} color={THEME.white} />
                <Text style={styles.capsuleText}>
                  {trans?.trans_address || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Main Balance Card (Floating) - Now EXACLTY like CustomerDetails */}
            <View style={styles.balanceCard}>
              <View>
                <Text style={styles.balanceLabel}>Opening Balance</Text>
                <Text style={styles.balanceAmount}>
                  Rs. {trans?.trans_opening_balance || '0.00'}
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
              icon="card-account-details-outline"
              label="CNIC"
              value={trans?.trans_cnic!}
            />
            <DetailRow
              icon="email-outline"
              label="Email"
              value={trans?.trans_email!}
            />
            <DetailRow
              icon="map-marker-radius-outline"
              label="Address"
              value={trans?.trans_address!}
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
              value={trans?.trans_contact!}
            />
            <DetailRow
              icon="account-tie-outline"
              label="Contact Person 1"
              value={trans?.trans_contact_person_one!}
            />
            <DetailRow
              icon="phone-classic"
              label="Secondary Phone"
              value={trans?.trans_sec_contact!}
            />
            <DetailRow
              icon="account-tie-outline"
              label="Contact Person 2"
              value={trans?.trans_contact_person_two!}
            />
            <DetailRow
              icon="phone-classic"
              label="Third Phone"
              value={trans?.trans_third_contact!}
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
              value={trans?.trans_payment_type!}
            />
            <DetailRow
              icon="bank-transfer"
              label="Transaction Type"
              value={trans?.trans_transaction_type!}
              isLast
            />
          </View>
        </View>
      </ScrollView>

      {/* --- DELETE CONFIRMATION MODAL (Styles matched) --- */}
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
            <Text style={styles.modalTitle}>Delete Transporter?</Text>
            <Text style={styles.modalText}>
              This action cannot be undone. All data associated with this
              transporter will be lost.
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible('')}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDelete}
                onPress={handleDeleteTrans}>
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
              Transporter record updated successfully.
            </Text>
            <TouchableOpacity
              style={[styles.btnPrimary, {width: '100%', marginTop: 15}]}
              onPress={() => setModalVisible('')}>
              <Text style={styles.btnPrimaryText}>OK, Great</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- EDIT TRANSPORTER MODAL --- */}
      <Modal
        visible={modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Transporter</Text>
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
                <Text style={styles.label}>Transporter Name *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.trans_name}
                  onChangeText={t => handleEditInputChange('trans_name', t)}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.label}>CNIC</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.trans_cnic}
                    keyboardType="numeric"
                    maxLength={15}
                    placeholder="xxxxx-xxxxxxx-x"
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
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.trans_email}
                  keyboardType="email-address"
                  onChangeText={t => handleEditInputChange('trans_email', t)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Physical Address</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.trans_address}
                  multiline
                  onChangeText={t => handleEditInputChange('trans_address', t)}
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
                    value={editForm.trans_contact}
                    keyboardType="phone-pad"
                    maxLength={12}
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
                <View style={{flex: 1}}>
                  <Text style={styles.label}>Contact Person 1</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.trans_contact_person_one}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      handleEditInputChange(
                        'trans_contact_person_one',
                        cleaned,
                      );
                    }}
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.label}>Secondary Contact</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.trans_sec_contact}
                    keyboardType="phone-pad"
                    maxLength={12}
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
                <View style={{flex: 1}}>
                  <Text style={styles.label}>Contact Person 2</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.trans_contact_person_two}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      handleEditInputChange(
                        'trans_contact_person_two',
                        cleaned,
                      );
                    }}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Third Contact</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.trans_third_contact}
                  keyboardType="phone-pad"
                  maxLength={12}
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

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleEditTrans}>
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

export default TransporterDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  // --- HEADER & PROFILE ---
  headerContainer: {
    paddingBottom: 30, // Reduced from 40 to match CustomerDetails
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
    gap: 8,
    marginBottom: 12,
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
  // --- BALANCE CARD (Floating inside header) ---
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
    width: '100%',
    padding: 12,
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
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
    marginBottom: 8,
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
    alignItems: 'center',
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
    marginTop: 'auto',
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
