import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
  BackHandler,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomBar from '../../BottomBar';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  primarySoft: 'rgba(42, 101, 43, 0.1)',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  accent: '#4CAF50',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textDark: '#1F2937',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  danger: '#EF4444',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
};

interface BusinessDetails {
  id: number;
  bus_name: string;
  bus_name_ur: string;
  bus_contact1: string;
  bus_language: string;
  bus_email: string;
  bus_address: string;
  bus_address_ur: string;
  bus_contact2: string;
  bus_contact3: string;
}

interface EditBusiness {
  id: number;
  bus_name: string;
  bus_name_ur: string;
  bus_address: string;
  bus_address_ur: string;
  bus_contact1: string;
  bus_contact2: string;
  bus_contact3: string;
  bus_email: string;
}

const initialEditBusiness: EditBusiness = {
  id: 0,
  bus_address: '',
  bus_address_ur: '',
  bus_contact1: '',
  bus_contact2: '',
  bus_contact3: '',
  bus_email: '',
  bus_name: '',
  bus_name_ur: '',
};

interface AddBussiness {
  name: string;
  urName: string;
  add: string;
  urAddress: string;
  contact1: string;
  contact2: string;
  contact3: string;
  busEmail: string;
}

const initialAddBusiness: AddBussiness = {
  add: '',
  busEmail: '',
  contact1: '',
  contact2: '',
  contact3: '',
  name: '',
  urAddress: '',
  urName: '',
};

export default function BusinessVariables({navigation}: any) {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [busDetails, setBusDetails] = useState<BusinessDetails | null>(null);
  const [editBus, setEditBus] = useState<EditBusiness>(initialEditBusiness);
  const [modal, setModal] = useState('');
  const [addForm, setAddForm] = useState(initialAddBusiness);

  // Add OnChange
  const onChange = (field: keyof AddBussiness, value: string) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Edit OnChange
  const editOnChange = (field: keyof EditBusiness, value: string) => {
    setEditBus(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcomp`);
      const comp = Array.isArray(res.data.comp)
        ? res.data.comp[0]
        : res.data.comp;
      setBusDetails(comp ?? null);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Business Details to Edit it
  const editBusiness = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editcomp?id=${busDetails?.id}&_token=${token}`,
      );
      setEditBus({
        id: res.data.id,
        bus_address: res.data.bus_address,
        bus_address_ur: res.data.bus_address_ur,
        bus_contact1: res.data.bus_contact1,
        bus_contact2: res.data.bus_contact2,
        bus_contact3: res.data.bus_contact3,
        bus_email: res.data.bus_email,
        bus_name: res.data.bus_name,
        bus_name_ur: res.data.bus_name_ur,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Update Business Details
  const updateBusiness = async () => {
    if (
      !editBus.bus_name.trim() ||
      !editBus.bus_name_ur.trim() ||
      !editBus.bus_address.trim() ||
      !editBus.bus_contact1.trim()
    ) {
      Toast.show({
        type: 'error',
        text1: 'Please fill all required fields.',
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/updatecomp`,
        {
          comp_id: editBus.id,
          comp_name: editBus.bus_name,
          comp_urdu_name: editBus.bus_name_ur,
          comp_address: editBus.bus_address,
          comp_urdu_address: editBus.bus_address_ur,
          comp_cont1: editBus.bus_contact1,
          comp_cont2: editBus.bus_contact2,
          comp_cont3: editBus.bus_contact3,
          comp_email: editBus.bus_email,
          logo: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = res.data;
      console.log('Response:', res.status, res.data);

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Company has been updated successfully',
          visibilityTime: 1500,
        });

        setEditBus(initialEditBusiness);
        setModal('');
        fetchBusinesses();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update failed!',
          text2: res.data?.message || 'Unexpected response',
        });
      }
    } catch (error: any) {
      console.log('Update error:', error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: error.response?.data?.message || 'Something went wrong',
      });
    }
  };

  // Delete Business Details
  const delBusiness = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/compdelete`, {
        id: busDetails?.id,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted',
          text2: 'Company has been deleted successfully.',
          visibilityTime: 1500,
        });

        fetchBusinesses();
        setModal('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Add Busniess
  const addComp = async () => {
    if (
      !addForm.name.trim() ||
      !addForm.urName.trim() ||
      !addForm.add.trim() ||
      !addForm.contact1.trim()
    ) {
      Toast.show({
        type: 'error',
        text1: 'Required fields missing',
        text2: 'Please fill all required fields marked with *',
        visibilityTime: 2500,
      });
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (addForm.busEmail && !emailPattern.test(addForm.busEmail)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
        visibilityTime: 2500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/addcomp`, {
        comp_name: addForm.name,
        comp_urdu_name: addForm.urName,
        comp_address: addForm.add,
        comp_urdu_address: addForm.urAddress,
        comp_cont1: addForm.contact1,
        comp_con2: addForm.contact2,
        comp_con3: addForm.contact3,
        comp_email: addForm.busEmail,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Addedd!',
          text2: 'Bussiness details has been added successfully',
          visibilityTime: 2500,
        });

        setAddForm(initialAddBusiness);
        setModal('');
        fetchBusinesses();
      } else if (res.status === 200 && data.status === 404) {
        Toast.show({
          type: 'info',
          text1: 'Warning!',
          text2: 'This email  already exist!',
          visibilityTime: 2500,
        });
      } else if (res.status === 200 && data.status === 405) {
        Toast.show({
          type: 'info',
          text1: 'Warning!',
          text2: 'This Company Name already exist already exist!',
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBusinesses();

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

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Business Variables</Text>
            {busDetails === null ? (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setModal('Add')}>
                <Icon name="plus" size={24} color={THEME.white} />
              </TouchableOpacity>
            ) : (
              <View style={{width: 40}} />
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Details Section */}
      {busDetails === null ? (
        <View style={styles.emptyContainer}>
          <Icon name="folder-open-outline" size={80} color={THEME.textGray} />
          <Text style={styles.emptyTitle}>No Business Details Found</Text>
          <Text style={styles.emptyText}>
            Add your first business by clicking the plus button above
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.detailsContainer}
          contentContainerStyle={{paddingBottom: 100}}
          showsVerticalScrollIndicator={false}>
          {/* Inner Details */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={styles.cardIconBox}>
                  <Icon name="domain" size={24} color={THEME.primary} />
                </View>
                <Text style={styles.cardTitle}>Business Information</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, {backgroundColor: '#E3F2FD'}]}
                  onPress={() => {
                    editBusiness();
                    setModal('Edit');
                  }}>
                  <Icon name="pencil" size={16} color="#1976D2" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, {backgroundColor: '#FFEBEE'}]}
                  onPress={() => setModal('Delete')}>
                  <Icon name="delete" size={16} color={THEME.danger} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Details */}
            <View style={styles.detailsList}>
              <DetailRow label="Name" value={busDetails?.bus_name} />
              <DetailRow label="Urdu Name" value={busDetails?.bus_name_ur} />
              <DetailRow label="Address" value={busDetails?.bus_address} />
              <DetailRow
                label="Urdu Address"
                value={busDetails?.bus_address_ur}
              />
              <DetailRow label="Contact 1" value={busDetails?.bus_contact1} />
              <DetailRow label="Contact 2" value={busDetails?.bus_contact2} />
              <DetailRow label="Contact 3" value={busDetails?.bus_contact3} />
              <DetailRow label="Email" value={busDetails?.bus_email} />
              <DetailRow
                label="Language"
                value={busDetails?.bus_language}
                isLast
              />
            </View>
          </View>
        </ScrollView>
      )}

      {/* Delete Modal */}
      <Modal visible={modal === 'Delete'} transparent animationType="fade">
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
                style={[styles.modalBtn, {backgroundColor: '#F3F4F6'}]}
                onPress={() => setModal('')}>
                <Text style={[styles.modalBtnText, {color: THEME.textDark}]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: THEME.danger}]}
                onPress={delBusiness}>
                <Text style={[styles.modalBtnText, {color: 'white'}]}>
                  Yes, Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={modal === 'Edit'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Company</Text>
              <TouchableOpacity
                onPress={() => {
                  setModal('');
                  setEditBus(initialEditBusiness);
                }}
                style={styles.closeBtn}>
                <Icon name="close" size={24} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Basic Info</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Name *"
                  placeholderTextColor={THEME.textGray}
                  value={editBus.bus_name}
                  onChangeText={t => editOnChange('bus_name', t)}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Urdu Name *"
                  placeholderTextColor={THEME.textGray}
                  value={editBus.bus_name_ur}
                  onChangeText={t => editOnChange('bus_name_ur', t)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Address *"
                  placeholderTextColor={THEME.textGray}
                  value={editBus.bus_address}
                  onChangeText={t => editOnChange('bus_address', t)}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Urdu Address"
                  placeholderTextColor={THEME.textGray}
                  value={editBus.bus_address_ur}
                  onChangeText={t => editOnChange('bus_address_ur', t)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Info</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contact 1 *"
                  placeholderTextColor={THEME.textGray}
                  keyboardType="phone-pad"
                  maxLength={12}
                  value={editBus.bus_contact1}
                  onChangeText={text => {
                    let cleaned = text.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnChange('bus_contact1', cleaned);
                  }}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Contact 2"
                  placeholderTextColor={THEME.textGray}
                  keyboardType="phone-pad"
                  maxLength={12}
                  value={editBus.bus_contact2}
                  onChangeText={text => {
                    let cleaned = text.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnChange('bus_contact2', cleaned);
                  }}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Contact 3"
                  placeholderTextColor={THEME.textGray}
                  keyboardType="phone-pad"
                  maxLength={12}
                  value={editBus.bus_contact3}
                  onChangeText={text => {
                    let cleaned = text.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnChange('bus_contact3', cleaned);
                  }}
                />
                <TextInput
                  style={[styles.textInput, {backgroundColor: '#f5f5f5'}]}
                  placeholder="Business Email"
                  placeholderTextColor={THEME.textGray}
                  value={editBus.bus_email}
                  editable={false}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={updateBusiness}>
                <LinearGradient
                  colors={[THEME.gradientStart, THEME.gradientEnd]}
                  style={styles.submitBtnGradient}>
                  <Icon name="check" size={20} color="white" />
                  <Text style={styles.submitBtnText}>Update Company</Text>
                </LinearGradient>
              </TouchableOpacity>
              <View style={{height: 20}} />
            </ScrollView>
          </View>
        </View>
        <Toast />
      </Modal>

      {/* Add Business Modal */}
      <Modal visible={modal === 'Add'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Company</Text>
              <TouchableOpacity
                onPress={() => {
                  setModal('');
                }}
                style={styles.closeBtn}>
                <Icon name="close" size={24} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Basic Info</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Name *"
                  placeholderTextColor={THEME.textGray}
                  value={addForm.name}
                  onChangeText={t => onChange('name', t)}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Urdu Name *"
                  placeholderTextColor={THEME.textGray}
                  value={addForm.urName}
                  onChangeText={t => onChange('urName', t)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Address *"
                  placeholderTextColor={THEME.textGray}
                  value={addForm.add}
                  onChangeText={t => onChange('add', t)}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Urdu Address"
                  placeholderTextColor={THEME.textGray}
                  value={addForm.urAddress}
                  onChangeText={t => onChange('urAddress', t)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Info</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contact 1 *"
                  placeholderTextColor={THEME.textGray}
                  value={addForm.contact1}
                  maxLength={11}
                  keyboardType="number-pad"
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    onChange('contact1', cleaned);
                  }}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Contact 2"
                  placeholderTextColor={THEME.textGray}
                  value={addForm.contact2}
                  maxLength={11}
                  keyboardType="number-pad"
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    onChange('contact2', cleaned);
                  }}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Contact 3"
                  placeholderTextColor={THEME.textGray}
                  value={addForm.contact3}
                  maxLength={11}
                  keyboardType="number-pad"
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    onChange('contact3', cleaned);
                  }}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Business Email"
                  placeholderTextColor={THEME.textGray}
                  value={addForm.busEmail}
                  onChangeText={t => onChange('busEmail', t)}
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={addComp}>
                <LinearGradient
                  colors={[THEME.gradientStart, THEME.gradientEnd]}
                  style={styles.submitBtnGradient}>
                  <Icon name="check" size={20} color="white" />
                  <Text style={styles.submitBtnText}>Add Company</Text>
                </LinearGradient>
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

const DetailRow = ({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string | undefined;
  isLast?: boolean;
}) => (
  <View style={[styles.detailRow, isLast && {borderBottomWidth: 0}]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || '--'}</Text>
  </View>
);

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
    paddingBottom: 25,
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

  // --- EMPTY STATE ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },

  // --- DETAILS CARD ---
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- DETAILS LIST ---
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: THEME.textGray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: THEME.textDark,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    paddingLeft: 20,
  },

  // --- MODALS ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    elevation: 10,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  closeBtn: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: THEME.background,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.textDark,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 10,
  },
  submitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitBtnGradient: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // --- Delete Modal ---
  deleteModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  delAnim: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginBottom: 10,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
