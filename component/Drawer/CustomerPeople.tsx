import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  BackHandler,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
import {Checkbox} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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

interface Customers {
  id: number;
  cust_image: string;
  cust_email: string;
  cust_cnic: string;
  cust_name: string;
  cust_contact: string;
  cust_address: string;
  custtyp_name: string;
  area_name: string;
}

interface AddCustomer {
  name: string;
  father_name: string;
  contact: string;
  email: string;
  contact_person_one: string;
  sec_contact: string;
  contact_person_two: string;
  third_contact: string;
  cnic: string;
  address: string;
  opening_balance: string;
  transfer_type: string;
  transaction_type: string;
}

const initialAddCustomer: AddCustomer = {
  name: '',
  father_name: '',
  contact: '',
  email: '',
  contact_person_one: '',
  sec_contact: '',
  contact_person_two: '',
  third_contact: '',
  cnic: '',
  address: '',
  opening_balance: '',
  transfer_type: '',
  transaction_type: '',
};

interface TypeData {
  id: string;
  custtyp_name: string;
}

interface AreaData {
  id: string;
  area_name: string;
}

export default function CustomerPeople({navigation}: any) {
  const {openDrawer} = useDrawer();
  const [addForm, setAddForm] = useState<AddCustomer>(initialAddCustomer);
  const [types, setTypes] = useState<TypeData[]>([]);
  const [areaData, setAreaData] = useState<AreaData[]>([]);
  const [enableBal, setEnableBal] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Customers[]>([]);
  const [masterData, setMasterData] = useState<Customers[]>([]);
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

  const onChange = (field: keyof AddCustomer, value: string) => {
    setAddForm(prev => ({...prev, [field]: value}));
  };

  const [customerType, setcustomerType] = useState(false);
  const [custType, setCustType] = useState<string | null>('');
  const [customerArea, setcustomerArea] = useState(false);
  const [custArea, setCustArea] = useState<string | null>('');
  const [paymentType, setpaymentType] = useState(false);
  const [current, setcurrentpaymentType] = useState<string | null>('');

  const paymentTypeItem = [
    {label: 'Payable', value: 'payable'},
    {label: 'Recievable', value: 'recievable'},
  ];

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/fetchcustomersdata`);
      const customersData = res.data.cust;
      setFilteredData(customersData);
      setMasterData(customersData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

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

  const transformedTypes = types.map(item => ({
    label: item.custtyp_name,
    value: item.id,
  }));
  const transformedAreas = areaData.map(item => ({
    label: item.area_name,
    value: item.id,
  }));

  const addCustomer = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/addcustomer`, {
        cust_name: addForm.name.trim(),
        fathername: addForm.father_name.trim(),
        contact: addForm.contact.trim(),
        email: addForm.email.trim(),
        contact_person_one: addForm.contact_person_one,
        sec_contact: addForm.sec_contact,
        contact_person_two: addForm.contact_person_two,
        third_contact: addForm.third_contact,
        cnic: addForm.cnic.trim(),
        address: addForm.address.trim(),
        cust_type: custType,
        cust_area: custArea,
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
          text1: 'Success',
          text2: 'Customer added successfully',
        });
        fetchCustomers();
        setAddForm(initialAddCustomer);
        setCustArea('');
        setCustType('');
        setEnableBal([]);
        setcurrentpaymentType('');
        setModalVisible('');
      } else if (res.status === 200 && data.status === 203) {
        Toast.show({
          type: 'error',
          text1: 'Warning',
          text2: 'Select payment type first!',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const searchFilter = (text: string) => {
    if (text) {
      const newData = masterData.filter(item => {
        const itemData = item.cust_name
          ? item.cust_name.toLocaleUpperCase()
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
    fetchCustomers();
    fetchType();
    fetchAreas();

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
  const renderItem = ({item, index}: {item: Customers; index: number}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.cardRow}
        onPress={() => navigation.navigate('CustomerDetails', {id: item.id})}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.cust_name)}</Text>
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
              {item.cust_name}
            </Text>
            <View style={styles.badgeContainer}>
              <View style={styles.areaBadge}>
                <Text style={styles.areaBadgeText} numberOfLines={1}>
                  {item.area_name || 'General'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.iconTextRow}>
            <Icon name="phone-outline" size={14} color={THEME.textGray} />
            <Text style={styles.subText}>
              {item.cust_contact || 'No Contact'}
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
            <Text style={styles.headerTitle}>Customers</Text>
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
            placeholder="Search by name..."
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
              <Text style={styles.tableHeaderLabel}>CUSTOMER LIST</Text>
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
                  <Icon name="account-search" size={60} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No customers found</Text>
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

      {/* --- ADD CUSTOMER MODAL --- */}
      <Modal visible={modalVisible === 'Add'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Customer</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setAddForm(initialAddCustomer);
                }}
                style={styles.closeModalBtn}>
                <Icon name="close" size={22} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={{paddingBottom: 20}}
              showsVerticalScrollIndicator={false}>
              {/* Section: Basic Info */}
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. John Doe"
                    placeholderTextColor={THEME.textLight}
                    value={addForm.name}
                    onChangeText={t => onChange('name', t)}
                  />
                </View>

                <View style={styles.rowInputs}>
                  <View
                    style={[styles.inputContainer, {flex: 1, marginRight: 8}]}>
                    <Text style={styles.label}>Father Name</Text>
                    <TextInput
                      style={styles.input}
                      value={addForm.father_name}
                      onChangeText={t => onChange('father_name', t)}
                    />
                  </View>
                  <View style={[styles.inputContainer, {flex: 1}]}>
                    <Text style={styles.label}>CNIC</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      maxLength={15}
                      placeholder="xxxxx-xxxxxxx-x"
                      placeholderTextColor={THEME.textLight}
                      value={addForm.cnic}
                      onChangeText={t => onChange('cnic', t)}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="email-address"
                    placeholder="john@example.com"
                    placeholderTextColor={THEME.textLight}
                    value={addForm.email}
                    onChangeText={t => onChange('email', t)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Primary Contact *</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="phone-pad"
                    maxLength={12}
                    placeholder="03xx-xxxxxxx"
                    placeholderTextColor={THEME.textLight}
                    value={addForm.contact}
                    onChangeText={t => onChange('contact', t)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Address</Text>
                  <TextInput
                    style={styles.input}
                    multiline
                    numberOfLines={2}
                    value={addForm.address}
                    onChangeText={t => onChange('address', t)}
                  />
                </View>
              </View>

              {/* Section: Classification */}
              <Text style={styles.sectionTitle}>Classification</Text>
              <View style={[styles.inputGroup, {zIndex: 2000}]}>
                <View style={styles.rowInputs}>
                  <View style={{flex: 1, marginRight: 8, zIndex: 2000}}>
                    <Text style={styles.label}>Type</Text>
                    <DropDownPicker
                      items={transformedTypes}
                      open={customerType}
                      setOpen={setcustomerType}
                      value={custType}
                      setValue={setCustType}
                      placeholder="Select"
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.dropdownContainer}
                      listMode="SCROLLVIEW"
                    />
                  </View>
                  <View style={{flex: 1, zIndex: 1900}}>
                    <Text style={styles.label}>Area</Text>
                    <DropDownPicker
                      items={transformedAreas}
                      open={customerArea}
                      setOpen={setcustomerArea}
                      value={custArea}
                      setValue={setCustArea}
                      placeholder="Select"
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.dropdownContainer}
                      listMode="SCROLLVIEW"
                    />
                  </View>
                </View>
              </View>

              {/* Section: Financials */}
              <TouchableOpacity
                style={styles.checkboxRow}
                activeOpacity={0.7}
                onPress={() => {
                  const newOptions = enableBal.includes('on') ? [] : ['on'];
                  setEnableBal(newOptions);
                }}>
                <Checkbox.Android
                  status={enableBal.includes('on') ? 'checked' : 'unchecked'}
                  color={THEME.primary}
                  uncheckedColor={THEME.textGray}
                />
                <Text style={styles.checkboxLabel}>Enable Opening Balance</Text>
              </TouchableOpacity>

              {enableBal.includes('on') && (
                <View style={[styles.financialBox, {zIndex: 1000}]}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Opening Balance Amount</Text>
                    <TextInput
                      style={styles.inputWhite}
                      keyboardType="numeric"
                      value={addForm.opening_balance}
                      onChangeText={t => onChange('opening_balance', t)}
                    />
                  </View>

                  <View style={{zIndex: 1000, marginBottom: 15}}>
                    <Text style={styles.label}>Payment Type</Text>
                    <DropDownPicker
                      items={paymentTypeItem}
                      open={paymentType}
                      setOpen={setpaymentType}
                      value={current}
                      setValue={setcurrentpaymentType}
                      placeholder="Select Type"
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.dropdownContainer}
                      listMode="SCROLLVIEW"
                    />
                  </View>

                  {/* Auto Calculated Field */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Transaction Preview</Text>
                    <View style={styles.readOnlyInput}>
                      <Text style={{color: THEME.textGray}}>
                        {current === 'recievable'
                          ? 'Debit Amount'
                          : current === 'payable'
                          ? 'Credit Amount'
                          : 'Balance'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={addCustomer}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={[THEME.gradientStart, THEME.gradientEnd]}
                  style={styles.submitBtnGradient}>
                  <Icon name="check-circle-outline" size={20} color="white" />
                  <Text style={styles.submitBtnText}>Save Customer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
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

  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: THEME.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -5},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },
  closeModalBtn: {
    padding: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  modalBody: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 5,
  },
  inputGroup: {
    marginBottom: 0,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 10,
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
  inputWhite: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.textDark,
  },
  readOnlyInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: THEME.primaryLight,
    padding: 10,
    borderRadius: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
    marginLeft: 8,
  },
  financialBox: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  submitBtn: {
    marginTop: 10,
    marginBottom: 30,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  submitBtnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
