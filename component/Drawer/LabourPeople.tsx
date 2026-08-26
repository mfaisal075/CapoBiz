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
  Dimensions,
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

const {width} = Dimensions.get('window');

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

interface Labour {
  id: number;
  labr_name: string;
  labr_cnic: string;
  labr_contact: string;
  labr_email: string;
  labr_address: string;
}

interface AddForm {
  labr_name: string;
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
  labr_name: '',
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

export default function LabourPeople({navigation}: any) {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [addForm, setAddForm] = useState<AddForm>(initialAddForm);
  const [enableBal, setEnableBal] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Labour[]>([]);
  const [masterData, setMasterData] = useState<Labour[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
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

  // Add Labour
  const handleAddLabr = async () => {
    const nameRegex = /^[A-Za-z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!addForm.labr_name) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Field names with * are Mandatory',
      });
      return;
    }

    if (!nameRegex.test(addForm.labr_name.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Customer name should only contain letters and spaces.',
      });
      return;
    }

    if (addForm.email && !emailRegex.test(addForm.email.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addlabour`, {
        labour_name: addForm.labr_name.trim(),
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
          text2: 'Labour has been Added successfully',
        });

        setAddForm(initialAddForm);
        setcurrentpaymentType('');
        setEnableBal([]);
        fetchLabour();
        setcustomer(false);
      } else if (res.status === 200 && data.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email already exist!',
        });
      } else if (res.status === 200 && data.status === 405) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Contact already exist!',
        });
      } else if (res.status === 200 && data.status === 409) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'CNIC already exist!',
        });
      } else if (res.status === 200 && data.status === 406) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'NTN No. already exist!',
        });
      } else if (res.status === 200 && data.status === 203) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Please select payment type first!',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Labour
  const fetchLabour = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/fetchlaboursdata`);
      const labourData = res.data.labour || [];
      setMasterData(labourData);
      setFilteredData(labourData);
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
        const itemData = item.labr_name
          ? item.labr_name.toLocaleUpperCase()
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
    fetchLabour();

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

  const renderItem = ({item, index}: {item: Labour; index: number}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.cardRow}
        onPress={() => navigation.navigate('LabourDetails', {id: item.id})}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.labr_name)}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.labr_name}
          </Text>
          <View style={styles.iconTextRow}>
            <Icon name="phone-outline" size={14} color={THEME.textGray} />
            <Text style={styles.subText} numberOfLines={1}>
              {item.labr_contact || 'No Contact'}
            </Text>
          </View>
        </View>

        {/* Right Section (Badge & Arrow) */}
        <View style={styles.rightSection}>
          <View style={styles.areaBadge}>
            <Text style={styles.areaBadgeText} numberOfLines={1}>
              {item.labr_address || 'Labour'}
            </Text>
          </View>
          <Icon
            name="chevron-right"
            size={24}
            color="#9CA3AF"
            style={{marginLeft: 8}}
          />
        </View>
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

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Labour</Text>
            <TouchableOpacity
              onPress={() => togglecustomer()}
              style={styles.iconBtn}>
              <Icon name="plus" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.floatingSearchContainer}>
          <Icon name="magnify" size={22} color={THEME.primary} />
          <TextInput
            placeholder="Search labour..."
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
          <View style={styles.loadingContainer}>
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
              <Text style={styles.tableHeaderLabel}>LABOUR LIST</Text>
              <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
            </View>

            <FlatList
              data={currentData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon
                    name="account-search-outline"
                    size={80}
                    color={THEME.textLight}
                    style={{marginBottom: 10}}
                  />
                  <Text style={styles.emptyText}>No Labour Found</Text>
                </View>
              }
            />
          </>
        )}
      </View>

      {/* --- PAGINATION (Floating) --- */}
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

      {/* --- ADD LABOUR MODAL --- */}
      <Modal visible={customer} transparent animationType="slide">
        <View style={styles.addCustomerModalOverlay}>
          <ScrollView style={styles.addCustomerModalContainer}>
            {/* Header */}
            <View style={styles.addCustomerHeader}>
              <Text style={styles.addCustomerTitle}>Add New Labour</Text>
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
                <Text style={styles.addCustomerLabel}>Labour Name *</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  value={addForm.labr_name}
                  onChangeText={t => handleAddInputChange('labr_name', t)}
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
                onPress={handleAddLabr}>
                <Icon name="account-plus-outline" size={20} color="white" />
                <Text style={styles.addCustomerSubmitText}>Add Labour</Text>
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
  // --- HEADER & SEARCH ---
  headerWrapper: {
    zIndex: 10,
    marginBottom: 20, // Space for floating search bar
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.white,
    letterSpacing: 0.8,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
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
    marginLeft: 12,
    fontSize: 16, // larger text
    color: THEME.textDark,
  },

  // --- LIST CONTAINER ---
  listContainer: {
    flex: 1,
    paddingTop: 10, // Adjust for floating header overlap
  },
  flatListContent: {
    paddingBottom: 160,
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
  loadingContainer: {
    flex: 1,
    height: Dimensions.get('window').height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 150,
    height: 150,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyLottie: {
    width: 200,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.textLight,
    marginTop: 10,
  },

  // --- CARD ITEM ---
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '94%',
    alignSelf: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: THEME.primarySoft,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    flexShrink: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaBadge: {
    backgroundColor: THEME.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  areaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    maxWidth: 80,
  },

  // --- PAGINATION (Floating) ---
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
    padding: 6,
  },
  disabledBtn: {
    opacity: 0.3,
  },
  pageText: {
    color: THEME.white,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // --- ADD MODAL STYLES ---
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
    borderBottomColor: '#EEE',
  },
  addCustomerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  addCustomerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  addCustomerInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  addCustomerFullRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  addCustomerDropdownRow: {
    flexDirection: 'row',
    marginBottom: 15,
    zIndex: 1000,
  },
  addCustomerDropdownField: {
    flex: 1,
  },
  addCustomerDropdown: {
    backgroundColor: '#FAFAFA',
    borderColor: '#DDD',
  },
  addCustomerDropdownContainer: {
    borderColor: '#DDD',
  },
  addCustomerDropdownText: {
    fontSize: 14,
  },
  addCustomerDropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  addCustomerSubmitBtn: {
    backgroundColor: THEME.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  addCustomerSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
