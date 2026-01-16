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
  StatusBar,
  BackHandler,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
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

interface OrderBooker {
  id: number;
  name: string;
  cnic: string;
  contact: string;
  email: string;
  area: string;
}

interface AreaDropDown {
  id: string;
  area_name: string;
}

interface AddForm {
  name: string;
  cnic: string;
  contact1: string;
  email: string;
  password: string;
  confirmPassword: string;
  area: Array<string>;
}

const initialAddForm: AddForm = {
  name: '',
  cnic: '',
  contact1: '',
  email: '',
  confirmPassword: '',
  password: '',
  area: [],
};

export default function OrderBookerPeople({navigation}: any) {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [areaDropdown, setAreaDropdown] = useState<AreaDropDown[] | []>([]);
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaValue, setAreaValue] = useState<string[] | null>(null);
  const transformedAreas = areaDropdown.map(item => ({
    label: item.area_name,
    value: Number(item.id),
  }));
  const [addForm, setAddForm] = useState<AddForm>(initialAddForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<OrderBooker[]>([]);
  const [masterData, setMasterData] = useState<OrderBooker[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const handleAddInputChange = (
    field: keyof AddForm,
    value: string | Array<string>,
  ) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add OrderBooker
  const handleAddOB = async () => {
    const nameRegex = /^[A-Za-z ]+$/;

    if (!addForm.name) {
      Toast.show({
        type: 'error',
        text1: 'Missing Field',
        text2: 'Field names with * are Mandatory',
      });
      return;
    }

    if (addForm.email && addForm.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(addForm.email.trim())) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Email',
          text2: 'Please enter a valid email address.',
        });
        return;
      }
    }

    if (!nameRegex.test(addForm.name.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Customer name should only contain letters and spaces.',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', addForm.name.trim());
      formData.append('cnic', addForm.cnic);
      formData.append('contact1', addForm.contact1);
      formData.append('email', addForm.email);
      formData.append('password', addForm.password);
      formData.append('confirmPassword', addForm.confirmPassword);
      if (areaValue) {
        areaValue.forEach((areaId: string) => {
          formData.append('areas[]', areaId);
        });
      }
      const res = await axios.post(`${BASE_URL}/orderbookestore`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'OrderBooker has been Added successfully',
        });

        setAddForm(initialAddForm);
        setAreaValue([]);
        fetchOrderBookers();
        setModalVisible('');
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email Already Exist!',
        });
      } else if (res.status === 200 && data.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Password Mismatch!',
          text2: 'Passwords do not match!',
        });
      } else if (res.status === 200 && data.status === 204) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This CNIC already exist!',
        });
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

  // Fetch OrderBooker
  const fetchOrderBookers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/fetchorderbooker`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const obData = res.data.orderbooker;
      setFilteredData(obData);
      setMasterData(obData);
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
    fetchOrderBookers();
    handleFetchAreas();

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

  const renderItem = ({item, index}: {item: OrderBooker; index: number}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.cardRow}
        onPress={() =>
          navigation.navigate('OrderBookerDetails', {id: item.id})
        }>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>
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
            {item.area ? (
              <View style={styles.badgeContainer}>
                <View style={styles.areaBadge}>
                  <Text style={styles.areaBadgeText} numberOfLines={1}>
                    {item.area}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
          <View style={styles.iconTextRow}>
            <Icon name="phone-outline" size={14} color={THEME.textGray} />
            <Text style={styles.subText}>{item.contact || 'No Contact'}</Text>
          </View>
        </View>
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

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Booker</Text>
            <TouchableOpacity
              onPress={() => setModalVisible('Add')}
              style={styles.iconBtn}>
              <Icon name="plus" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.floatingSearchContainer}>
          <Icon name="magnify" size={22} color={THEME.primary} />
          <TextInput
            placeholder="Search order booker..."
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
              <Text style={styles.tableHeaderLabel}>ORDER BOOKER LIST</Text>
              <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
            </View>

            <FlatList
              data={currentData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={{paddingBottom: 160}}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.loadingContainer}>
                  <Icon
                    name="account-search-outline"
                    size={48}
                    color="#D1D5DB"
                  />
                  <Text style={styles.emptyText}>No order booker found</Text>
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

      {/* --- ADD MODAL --- */}
      <Modal visible={modalVisible === 'Add'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Order Booker</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setAreaValue([]);
                    setAddForm(initialAddForm);
                  }}
                  style={styles.closeModalBtn}>
                  <Icon name="close" size={22} color={THEME.textDark} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                {/* Name */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={addForm.name}
                    onChangeText={t => handleAddInputChange('name', t)}
                  />
                </View>

                {/* Email */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={addForm.email}
                    onChangeText={t => handleAddInputChange('email', t)}
                  />
                </View>

                {/* Contact + CNIC */}
                <View style={styles.rowInputs}>
                  <View style={{flex: 1, marginRight: 10}}>
                    <Text style={styles.label}>Contact</Text>
                    <TextInput
                      style={styles.input}
                      maxLength={12}
                      keyboardType="phone-pad"
                      value={addForm.contact1}
                      onChangeText={t => handleAddInputChange('contact1', t)}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.label}>CNIC</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      maxLength={15}
                      value={addForm.cnic}
                      onChangeText={t => handleAddInputChange('cnic', t)}
                    />
                  </View>
                </View>

                {/* Password Fields */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={addForm.password}
                    onChangeText={t => handleAddInputChange('password', t)}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={addForm.confirmPassword}
                    onChangeText={t =>
                      handleAddInputChange('confirmPassword', t)
                    }
                  />
                </View>

                {/* Areas */}
                <View style={{marginBottom: 20}}>
                  <Text style={styles.label}>Select Areas</Text>
                  <DropDownPicker
                    items={transformedAreas}
                    open={areaOpen}
                    setOpen={setAreaOpen}
                    value={areaValue}
                    setValue={setAreaValue}
                    multiple={true}
                    mode="BADGE"
                    badgeDotColors={THEME.primary}
                    placeholder="Select areas"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    listMode="SCROLLVIEW"
                    searchable
                  />
                </View>

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleAddOB}>
                  <Icon
                    name="check-circle-outline"
                    size={20}
                    color="white"
                    style={{marginRight: 8}}
                  />
                  <Text style={styles.btnPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
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
  // --- HEADER ---
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
  // --- SEARCH ---
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
  // --- LIST ---
  listContainer: {
    flex: 1,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  lottie: {
    width: 100,
    height: 100,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: THEME.textGray,
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
  // --- CARD ROW ---
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
  // --- PAGINATION ---
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
    padding: 8,
  },
  disabledBtn: {
    opacity: 0.3,
  },
  pageText: {
    color: THEME.white,
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 15,
  },
  // --- MODAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalScroll: {
    flex: 1,
    marginTop: 60,
    marginBottom: 30,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
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
