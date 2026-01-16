import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Image,
  Modal,
  BackHandler,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
import {Checkbox} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
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
};

// --- HELPER: Get Initials ---
const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface Transporter {
  id: number;
  trans_name: string;
  trans_cnic: string;
  trans_address: string;
  trans_contact: string;
  trans_email: string;
}

interface AddForm {
  trans_name: string;
  cnic: string;
  contact: string;
  email: string;
  contact_person_one: string;
  sec_contact: string;
  contact_person_two: string;
  third_contact: string;
  address: string;
  opening_balancechechboc: string;
  opening_balance: string;
  transfer_type: string;
  transaction_type: string;
}

const initialAddForm: AddForm = {
  trans_name: '',
  cnic: '',
  contact: '',
  email: '',
  contact_person_one: '',
  sec_contact: '',
  contact_person_two: '',
  third_contact: '',
  address: '',
  opening_balancechechboc: '',
  opening_balance: '',
  transfer_type: '',
  transaction_type: '',
};

export default function TransporterPeople({navigation}: any) {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [addForm, setAddForm] = useState<AddForm>(initialAddForm);
  const [enableBal, setEnableBal] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Transporter[]>([]);
  const [masterData, setMasterData] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const handleAddInputChange = (field: keyof AddForm, value: string) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const [customer, setcustomer] = useState(false);

  const togglecustomer = () => {
    setcustomer(!customer);
  };

  const [paymentType, setpaymentType] = useState(false);
  const [current, setcurrentpaymentType] = useState<string | null>('');
  const paymentTypeItem = [
    {label: 'Payable', value: 'payable'},
    {label: 'Recievable', value: 'recievable'},
  ];

  // Add Transporter
  const handleAddTrans = async () => {
    const nameRegex = /^[A-Za-z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!addForm.trans_name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Field names with * are Mandatory',
        visibilityTime: 1500,
      });
      return;
    }

    if (!nameRegex.test(addForm.trans_name.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Customer name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (addForm.email && !emailRegex.test(addForm.email.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addTransporter`, {
        trans_name: addForm.trans_name.trim(),
        cnic: addForm.cnic,
        contact: addForm.contact,
        email: addForm.email,
        contact_person_one: addForm.contact_person_one,
        sec_contact: addForm.sec_contact,
        contact_person_two: addForm.contact_person_one,
        third_contact: addForm.third_contact,
        address: addForm.address.trim(),
        ...(enableBal.includes('on') && {opening_balancechechboc: 'on'}),
        ...(enableBal.includes('on') && {
          opening_balance: addForm.opening_balance,
        }),
        ...(enableBal.includes('on') && {transfer_type: current}),
        ...(enableBal.includes('on') && {
          transaction_type:
            current === 'payable'
              ? 'Credit Amount'
              : current === 'recievable'
              ? 'Debit Amount'
              : '',
        }),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Transporter has been Added successfully',
          visibilityTime: 2000,
        });

        setAddForm(initialAddForm);
        setcurrentpaymentType('');
        setEnableBal([]);
        fetchTransporters();
        setcustomer(false);
      } else if (res.status === 200 && data.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email already exist!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 405) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Contact already exist!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 409) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'CNIC already exist!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 406) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'NTN No. already exist!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 203) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Please select payment type first!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Transporters
  const fetchTransporters = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/fetchTransportersdata`);
      const transporterData = res.data.transporter;
      setMasterData(transporterData);
      setFilteredData(transporterData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Search Filter
  const searchFilter = (text: string) => {
    if (text) {
      const newData = masterData.filter(item => {
        const itemData = item.trans_name
          ? item.trans_name.toLocaleUpperCase()
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
    fetchTransporters();

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

  // --- RENDER ITEM ---
  const renderItem = ({item, index}: {item: Transporter; index: number}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.cardRow}
        onPress={() =>
          navigation.navigate('TransporterDetails', {id: item.id})
        }>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.trans_name)}</Text>
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
              {item.trans_name}
            </Text>
          </View>
          <View style={styles.iconTextRow}>
            <Icon name="phone-outline" size={14} color={THEME.textGray} />
            <Text style={styles.subText}>
              {item.trans_contact || 'No Contact'}
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
    );
  };

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
            <Text style={styles.headerTitle}>Transporters</Text>
            <TouchableOpacity
              onPress={() => togglecustomer()}
              style={styles.iconBtn}>
              <Icon name="plus" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Floating Search Bar */}
        <View style={styles.floatingSearchContainer}>
          <Icon name="magnify" size={22} color={THEME.primary} />
          <TextInput
            placeholder="Search Transporters..."
            placeholderTextColor={THEME.textLight}
            style={styles.floatingSearchInput}
            value={searchQuery}
            onChangeText={searchFilter}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => searchFilter('')}>
              <Icon name="close-circle" size={18} color={THEME.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* --- CONTENT LIST --- */}
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.centerContent}>
            <LottieView
              source={require('../../assets/Loading-Dots.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        ) : (
          <>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeaderLabel}>TRANSPORTER LIST</Text>
              <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
            </View>

            <FlatList
              data={currentData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={{paddingBottom: 160}}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.centerContent}>
                  <Icon name="truck-remove-outline" size={60} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No Transporters found</Text>
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

      {/* --- ADD TRANSPORTER MODAL --- */}
      <Modal visible={customer} transparent animationType="slide">
        <View style={styles.addCustomerModalOverlay}>
          <ScrollView style={styles.addCustomerModalContainer}>
            {/* Header */}
            <View style={styles.addCustomerHeader}>
              <Text style={styles.addCustomerTitle}>Add New Transporter</Text>
              <TouchableOpacity
                onPress={() => {
                  setcustomer(!customer);
                  setAddForm(initialAddForm);
                }}
                style={styles.addCustomerCloseBtn}>
                <Icon name="close" size={24} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.addCustomerForm}>
              {/* Row 1: Name */}
              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Transporter Name *</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  value={addForm.trans_name}
                  onChangeText={t => handleAddInputChange('trans_name', t)}
                />
              </View>

              {/* Row 2: CNIC + Contact */}
              <View style={styles.addCustomerFullRow}>
                <View style={{flex: 1, marginRight: 8}}>
                  <Text style={styles.addCustomerLabel}>CNIC</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    keyboardType="numeric"
                    maxLength={15}
                    value={addForm.cnic}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 5)
                        cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                      if (cleaned.length > 13)
                        cleaned =
                          cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                      if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                      handleAddInputChange('cnic', cleaned);
                    }}
                  />
                </View>
                <View style={{flex: 1, marginLeft: 8}}>
                  <Text style={styles.addCustomerLabel}>Contact</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    maxLength={12}
                    keyboardType="phone-pad"
                    value={addForm.contact}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      handleAddInputChange('contact', cleaned);
                    }}
                  />
                </View>
              </View>

              {/* Row 3: Email + Contact Person 1 */}
              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Email</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  value={addForm.email}
                  keyboardType="email-address"
                  onChangeText={t => handleAddInputChange('email', t)}
                />
              </View>
              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Contact Person 1</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  maxLength={12}
                  keyboardType="phone-pad"
                  value={addForm.contact_person_one}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleAddInputChange('contact_person_one', cleaned);
                  }}
                />
              </View>

              {/* Row 4: Contact 1 + Contact Person 2 */}
              <View style={styles.addCustomerFullRow}>
                <View style={{flex: 1, marginRight: 8}}>
                  <Text style={styles.addCustomerLabel}>Contact 1</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    maxLength={12}
                    keyboardType="phone-pad"
                    value={addForm.sec_contact}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      handleAddInputChange('sec_contact', cleaned);
                    }}
                  />
                </View>
                <View style={{flex: 1, marginLeft: 8}}>
                  <Text style={styles.addCustomerLabel}>Contact Person 2</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    maxLength={12}
                    keyboardType="phone-pad"
                    value={addForm.contact_person_two}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      handleAddInputChange('contact_person_two', cleaned);
                    }}
                  />
                </View>
              </View>

              {/* Row 5: Contact 2 + Address */}
              <View style={styles.addCustomerFullRow}>
                <View style={{flex: 1, marginRight: 8}}>
                  <Text style={styles.addCustomerLabel}>Contact 2</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    maxLength={12}
                    keyboardType="phone-pad"
                    value={addForm.third_contact}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      handleAddInputChange('third_contact', cleaned);
                    }}
                  />
                </View>
                <View style={{flex: 1, marginLeft: 8}}>
                  <Text style={styles.addCustomerLabel}>Address</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    value={addForm.address}
                    onChangeText={t => handleAddInputChange('address', t)}
                  />
                </View>
              </View>

              <View style={{marginBottom: 15}}>
                <TouchableOpacity
                  style={{flexDirection: 'row', alignItems: 'center'}}
                  activeOpacity={0.7}
                  onPress={() => {
                    const newOptions = enableBal.includes('on')
                      ? enableBal.filter(opt => opt !== 'on')
                      : [...enableBal, 'on'];
                    setEnableBal(newOptions);
                  }}>
                  <Checkbox.Android
                    status={enableBal.includes('on') ? 'checked' : 'unchecked'}
                    color={THEME.primary}
                    uncheckedColor={THEME.textGray}
                  />
                  <Text
                    style={[
                      styles.addCustomerLabel,
                      {marginLeft: 8, marginBottom: 0},
                    ]}>
                    Enable Opening Balance
                  </Text>
                </TouchableOpacity>
              </View>

              {enableBal.includes('on') && (
                <>
                  <View style={styles.addCustomerFullRow}>
                    <Text style={styles.addCustomerLabel}>Opening Balance</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter opening balance"
                      keyboardType="numeric"
                      value={addForm.opening_balance}
                      onChangeText={t =>
                        handleAddInputChange('opening_balance', t)
                      }
                    />
                  </View>

                  <View style={styles.addCustomerDropdownRow}>
                    <View style={styles.addCustomerDropdownField}>
                      <Text style={styles.addCustomerLabel}>Payment Type</Text>
                      <DropDownPicker
                        items={paymentTypeItem}
                        open={paymentType}
                        setOpen={setpaymentType}
                        value={current}
                        setValue={setcurrentpaymentType}
                        placeholder="Select payment type"
                        style={styles.addCustomerDropdown}
                        dropDownContainerStyle={
                          styles.addCustomerDropdownContainer
                        }
                        textStyle={styles.addCustomerDropdownText}
                        placeholderStyle={styles.addCustomerDropdownPlaceholder}
                        listMode="SCROLLVIEW"
                        disabled={!enableBal.includes('on')}
                      />
                    </View>
                  </View>

                  <View style={styles.addCustomerFullRow}>
                    <TextInput
                      style={[
                        styles.addCustomerInput,
                        {
                          backgroundColor:
                            current === 'recievable' || current === 'payable'
                              ? '#e0e0e0'
                              : '#f9f9f9',
                        },
                      ]}
                      placeholder={
                        current === 'recievable'
                          ? 'Debit Amount'
                          : current === 'payable'
                          ? 'Credit Amount'
                          : 'Balance'
                      }
                      editable={
                        !(current === 'recievable' || current === 'payable') &&
                        enableBal.includes('on')
                      }
                    />
                  </View>
                </>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.addCustomerSubmitBtn}
                onPress={handleAddTrans}>
                <Icon name="truck-plus-outline" size={20} color="white" />
                <Text style={styles.addCustomerSubmitText}>
                  Add Transporter
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Toast />
        </View>
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

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  emptyText: {
    marginTop: 10,
    color: '#9CA3AF',
    fontSize: 16,
  },

  // --- Pagination ---
  paginationContainer: {
    position: 'absolute',
    bottom: 80,
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
  disabledBtn: {
    opacity: 0.3,
  },
  pageBtn: {
    padding: 5,
  },
  pageText: {
    color: THEME.white,
    fontSize: 14,
    marginHorizontal: 15,
    fontWeight: '600',
  },

  // --- MODAL STYLES (Preserved) ---
  addCustomerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  addCustomerModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  addCustomerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },
  addCustomerCloseBtn: {
    padding: 5,
  },
  addCustomerForm: {
    padding: 20,
  },
  addCustomerField: {
    marginBottom: 15,
  },
  addCustomerFullRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  addCustomerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  addCustomerInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.textDark,
  },
  addCustomerDropdownRow: {
    marginBottom: 15,
  },
  addCustomerDropdownField: {
    flex: 1,
  },
  addCustomerDropdown: {
    backgroundColor: '#F9FAFB',
    borderColor: THEME.border,
    borderRadius: 10,
    minHeight: 45,
  },
  addCustomerDropdownContainer: {
    borderColor: THEME.border,
    borderRadius: 10,
  },
  addCustomerDropdownText: {
    fontSize: 14,
    color: THEME.textDark,
  },
  addCustomerDropdownPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  addCustomerSubmitBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  addCustomerSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  // --- Loading State ---
  loadingContainer: {
    height: 400, // Fixed height to keep the card shape while loading
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 300,
    height: 300,
  },
});
