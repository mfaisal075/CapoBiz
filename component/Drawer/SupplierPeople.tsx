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
import DropDownPicker from 'react-native-dropdown-picker';
import {useUser} from '../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import Toast from 'react-native-toast-message';
import {Checkbox} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import RNPrint from 'react-native-print';
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

interface SupplierData {
  id: number;
  sup_name: string;
  sup_company_name: string;
  sup_agancy_name: string;
  sup_contact: string;
  area_name: string;
}

interface AreaDropDown {
  id: string;
  area_name: string;
}

interface AddSupplier {
  alsocust: string;
  comp_name: string;
  agencyname: string;
  supp_name: string;
  contact: string;
  sec_contact: string;
  third_contact: string;
  email: string;
  address: string;
  supp_area: string;
  opening_balancechechboc: string;
  opening_balance: string;
  transfer_type: string;
  transaction_type: string;
}

const initialAddSupplier: AddSupplier = {
  address: '',
  agencyname: '',
  alsocust: '',
  comp_name: '',
  contact: '',
  email: '',
  opening_balance: '',
  opening_balancechechboc: '',
  sec_contact: '',
  supp_area: '',
  supp_name: '',
  third_contact: '',
  transfer_type: '',
  transaction_type: '',
};

export default function SupplierPeople({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
  const {token} = useUser();
  const [areaDropdown, setAreaDropdown] = useState<AreaDropDown[] | []>([]);
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaValue, setAreaValue] = useState<string | null>('');
  const transformedAreas = areaDropdown.map(item => ({
    label: item.area_name,
    value: item.id,
  }));
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [addForm, setAddForm] = useState<AddSupplier>(initialAddSupplier);
  const [enableBal, setEnableBal] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<SupplierData[]>([]);
  const [masterData, setMasterData] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(false); // Loading State
  const [modalVisible, setModalVisible] = useState('');

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

  const handleAddInputChange = (field: keyof AddSupplier, value: string) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const [paymentType, setpaymentType] = useState(false);
  const [current, setcurrentpaymentType] = useState<string | null>('');
  const paymentTypeItem = [
    {label: 'Payable', value: 'payable'},
    {label: 'Recievable', value: 'recievable'},
  ];

  // Add Supplier
  const handleAddSupplier = async () => {
    const nameRegex = /^[A-Za-z ]+$/;

    if (!addForm.comp_name || !addForm.supp_name || !addForm.contact) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Field names with * are mandatory',
        visibilityTime: 1500,
      });
      return;
    }

    if (addForm.supp_name.length < 3) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Supplier name must be at least 3 characters.',
        visibilityTime: 1500,
      });
      return;
    }

    if (!nameRegex.test(addForm.supp_name.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Customer name should only contain letters and spaces.',
        visibilityTime: 2000,
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
          visibilityTime: 2000,
        });
        return;
      }
    }

    try {
      const res = await axios.post(`${BASE_URL}/addsupplier`, {
        comp_name: addForm.comp_name.trim(),
        agencyname: addForm.agencyname,
        supp_name: addForm.supp_name.trim(),
        contact: addForm.contact,
        sec_contact: addForm.sec_contact,
        third_contact: addForm.third_contact,
        email: addForm.email.trim(),
        address: addForm.address.trim(),
        supp_area: areaValue,
        ...(enableBal.includes('on') && {opening_balancechechboc: 'on'}),
        ...(enableBal.includes('on') && {
          opening_balance: addForm.opening_balancechechboc,
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
          text2: 'Supplier has been Added successfully',
          visibilityTime: 2000,
        });
        setAddForm(initialAddSupplier);
        setSelectedOptions([]);
        setAreaValue('');
        setEnableBal([]);
        setcurrentpaymentType('');
        handleFetchData();
        setModalVisible('');
      } else if (res.status === 200 && data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email already exist!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Contact already exist!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 206) {
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

  // Fetch User Data
  const handleFetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/fetchsuppliersdata`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const supplierData = res.data.supp;

      setFilteredData(supplierData);
      setMasterData(supplierData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const printSuppliers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/fetchsuppliers`);
      if (res.data && res.data.suppliers) {
        const suppliersList = res.data.suppliers;
        const totalSuppliers = suppliersList.length;

        const rows = suppliersList
          .map(
            (item: any, index: number) => `
          <tr>
            <td class="text-left">${index + 1}</td>
            <td class="text-left">${item.sup_name || '--'}</td>
            <td class="text-left">${item.sup_company_name || '--'}</td>
            <td class="text-left">${item.sup_contact || '--'}</td>
            <td class="text-left">${item.sup_email || '--'}</td>
            <td class="text-left">${item.sup_address || '--'}</td>
          </tr>
        `,
          )
          .join('');

        const htmlContent = `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
              <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 { margin: 0; color: #111; font-size: 24px; text-transform: uppercase; }
                .header p { margin: 5px 0 0 0; color: #555; font-size: 14px; }
                h2 { text-align: center; color: #333; margin-bottom: 20px; font-size: 18px; text-decoration: underline; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #e5e7eb; padding: 10px 8px; text-align: left; }
                thead td, th { background-color: #f9fafb; font-weight: bold; color: #374151; }
                tbody tr:nth-child(even) { background-color: #fdfdfd; }
                .footer { margin-top: 20px; padding-top: 10px; font-weight: bold; font-size: 14px; text-align: right; border-top: 1px solid #e5e7eb; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${bussName || 'Business Name'}</h1>
                <p>${bussAddress || 'Business Address'}</p>
              </div>
              <h2>Supplier List Report</h2>
              <table>
                <thead>
                  <tr>
                    <th>Sr#</th>
                    <th>Supplier</th>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
              <div class="footer">
                Total Suppliers: ${totalSuppliers}
              </div>
            </body>
          </html>
        `;
        await RNPrint.print({html: htmlContent});
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No data available to print.',
        });
      }
    } catch (error) {
      console.log('Print error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to generate print document.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Search Filter
  const searchFilter = (text: string) => {
    if (text) {
      const newData = masterData.filter(item => {
        const itemData = item.sup_name
          ? item.sup_name.toLocaleUpperCase()
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
    handleFetchData();
    handleFetchAreas();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true; // prevents default behavior (exit app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, []);

  // --- RENDER ITEM ---
  const renderItem = ({item, index}: {item: SupplierData; index: number}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.cardRow}
        onPress={() => navigation.navigate('SupplierDetails', {id: item.id})}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.sup_name)}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.sup_name}
          </Text>
          <View style={styles.iconTextRow}>
            <Icon name="phone-outline" size={14} color={THEME.textGray} />
            <Text style={styles.subText} numberOfLines={1}>
              {item.sup_contact || 'No Contact'}
            </Text>
          </View>
        </View>

        {/* Right Section (Badge & Arrow) */}
        <View style={styles.rightSection}>
          <View style={styles.areaBadge}>
            <Text style={styles.areaBadgeText} numberOfLines={1}>
              {item.area_name || 'General'}
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

      {/* --- MODERN HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Suppliers</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={printSuppliers}
                style={[styles.iconBtn, {marginRight: 8}]}>
                <Icon name="printer" size={22} color={THEME.white} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible('Add')}
                style={styles.iconBtn}>
                <Icon name="plus" size={24} color={THEME.white} />
              </TouchableOpacity>
            </View>
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
              <Text style={styles.tableHeaderLabel}>SUPPLIER LIST</Text>
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
                  <Text style={styles.emptyText}>No suppliers found</Text>
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

      {/* Add Supplier Modal */}
      <Modal visible={modalVisible === 'Add'} transparent animationType="slide">
        <View style={styles.addCustomerModalOverlay}>
          <ScrollView style={styles.addCustomerModalContainer}>
            <View style={styles.addCustomerHeader}>
              <Text style={styles.addCustomerTitle}>Add New Supplier</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setAddForm(initialAddSupplier);
                }}
                style={styles.addCustomerCloseBtn}>
                <Icon name="close" size={20} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.addCustomerForm}>
              {/* Also a Customer Checkbox */}
              <View style={{marginBottom: 15}}>
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
                  <Text
                    style={[
                      styles.addCustomerLabel,
                      {marginLeft: 8, marginBottom: 0},
                    ]}>
                    Also a Customer
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Company + Agency */}
              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Company Name *</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  value={addForm.comp_name}
                  onChangeText={text => handleAddInputChange('comp_name', text)}
                />
              </View>
              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Agency Name</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  value={addForm.agencyname}
                  onChangeText={text =>
                    handleAddInputChange('agencyname', text)
                  }
                />
              </View>

              {/* Supplier Name + Contact 1 */}
              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Supplier Name *</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  value={addForm.supp_name}
                  onChangeText={text => handleAddInputChange('supp_name', text)}
                />
              </View>
              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Email</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  value={addForm.email}
                  onChangeText={text => handleAddInputChange('email', text)}
                />
              </View>

              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Contact 1 *</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={addForm.contact}
                  maxLength={12}
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
              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Contact 2</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={addForm.sec_contact}
                  maxLength={12}
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

              {/* Contact 3 */}
              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Contact 3</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={addForm.third_contact}
                  maxLength={12}
                  onChangeText={text => {
                    let cleaned = text.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleAddInputChange('third_contact', cleaned);
                  }}
                />
              </View>
              <View style={styles.addCustomerField}>
                <Text style={styles.addCustomerLabel}>Address</Text>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  value={addForm.address}
                  onChangeText={text => handleAddInputChange('address', text)}
                />
              </View>

              {/* Supplier Area */}
              <View style={styles.addCustomerDropdownRow}>
                <View style={styles.addCustomerDropdownField}>
                  <Text style={styles.addCustomerLabel}>Supplier Area</Text>
                  <DropDownPicker
                    items={transformedAreas}
                    open={areaOpen}
                    setOpen={setAreaOpen}
                    value={areaValue}
                    setValue={setAreaValue}
                    placeholder="Select supplier area"
                    style={styles.addCustomerDropdown}
                    dropDownContainerStyle={styles.addCustomerDropdownContainer}
                    textStyle={styles.addCustomerDropdownText}
                    placeholderStyle={styles.addCustomerDropdownPlaceholder}
                    listMode="SCROLLVIEW"
                    searchable
                    searchTextInputStyle={{
                      borderWidth: 0,
                      width: '100%',
                    }}
                    searchContainerStyle={{
                      borderColor: THEME.textGray,
                    }}
                  />
                </View>
              </View>

              {/* Opening Balance Checkbox */}
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
                    uncheckedColor={THEME.textDark}
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
                      keyboardType="numeric"
                      value={addForm.opening_balance}
                      onChangeText={text =>
                        handleAddInputChange('opening_balance', text)
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
                      value={addForm.opening_balance}
                      onChangeText={text =>
                        handleAddInputChange('opening_balance', text)
                      }
                    />
                  </View>
                </>
              )}

              <TouchableOpacity
                style={styles.addCustomerSubmitBtn}
                onPress={handleAddSupplier}>
                <Icon name="account-plus-outline" size={20} color="white" />
                <Text style={styles.addCustomerSubmitText}>Add Supplier</Text>
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  disabledBtn: {
    opacity: 0.3,
  },
  pageText: {
    color: THEME.white,
    fontWeight: '700',
    fontSize: 12,
    marginHorizontal: 12,
  },

  // --- Loading / Empty ---
  centerContent: {
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
    fontSize: 16,
    color: THEME.textGray,
    marginTop: 10,
  },

  // --- Modal Styles (Preserved) ---
  addCustomerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  addCustomerModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    flex: 1,
    marginBottom: 20,
    marginTop: 40,
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
    fontWeight: '700',
    color: THEME.primary,
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  addCustomerDropdownRow: {
    flexDirection: 'row',
    marginBottom: 15,
    zIndex: 2000,
  },
  addCustomerDropdownField: {
    flex: 1,
  },
  addCustomerDropdown: {
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  addCustomerDropdownContainer: {
    borderColor: '#DDD',
  },
  addCustomerDropdownText: {
    color: '#333',
    fontSize: 14,
  },
  addCustomerDropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  addCustomerFullRow: {
    marginBottom: 15,
    zIndex: 1000,
  },
  addCustomerSubmitBtn: {
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
  addCustomerSubmitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
