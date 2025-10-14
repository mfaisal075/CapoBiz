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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
import {Checkbox} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import backgroundColors from '../Colors';

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

  // Add Customer Form On Change
  const onChange = (field: keyof AddCustomer, value: string) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
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

  // Fetch Customer
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcustomersdata`);
      const customersData = res.data.cust;
      setFilteredData(customersData);
      setMasterData(customersData);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Type
  const fetchType = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchtypedata`);
      setTypes(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const transformedTypes = types.map(item => ({
    label: item.custtyp_name,
    value: item.id,
  }));

  // Fetch Area
  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchareadata`);
      setAreaData(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const transformedAreas = areaData.map(item => ({
    label: item.area_name,
    value: item.id,
  }));

  // Add Customer
  const addCustomer = async () => {
    const nameRegex = /^[A-Za-z ]+$/;

    if (!addForm.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Field names with * are Mandatory',
        visibilityTime: 2000,
      });
      return;
    }

    if (!nameRegex.test(addForm.name.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Customer name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (
      addForm.father_name && // only check if field has some value
      !nameRegex.test(addForm.father_name.trim())
    ) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Father Name',
        text2: 'Father name should only contain letters and spaces.',
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
          text1: 'Added!',
          text2: 'Customer has been Added successfully',
          visibilityTime: 2000,
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
          text1: 'Warning!',
          text2: 'Please select payment type first!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.log();
    }
  };

  // Search Filter
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
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Customer</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible('Add')}
            style={[styles.headerBtn]}>
            <Text style={styles.addBtnText}>Add</Text>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Filter */}
        <View style={styles.searchFilter}>
          <Icon name="magnify" size={36} color={backgroundColors.dark} />
          <TextInput
            placeholder="Search by supplier name"
            style={styles.search}
            value={searchQuery}
            onChangeText={text => searchFilter(text)}
          />
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  navigation.navigate('CustomerDetails', {
                    id: item.id,
                  });
                }}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View style={styles.avatarBox}>
                    <Image
                      source={require('../../assets/man.png')}
                      style={styles.avatar}
                    />
                  </View>

                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.cust_name}</Text>
                    {/* small details inline */}
                    <Text style={styles.subText}>
                      <Icon name="phone" size={12} color="#666" />{' '}
                      {item.cust_contact || 'No contact'}
                    </Text>
                  </View>

                  {/* Actions on right */}
                  <View style={styles.actionRow}>
                    <Icon
                      name="chevron-right"
                      size={28}
                      color={backgroundColors.dark}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-group" size={48} color="#666" />
                <Text style={styles.emptyText}>No record found.</Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 90}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/*Add Customer Modal*/}
        <Modal
          visible={modalVisible === 'Add'}
          transparent
          animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Add New Customer</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setAddForm(initialAddCustomer);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              <View style={styles.addCustomerForm}>
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Customer Name *</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    value={addForm.name}
                    onChangeText={t => onChange('name', t)}
                  />
                </View>

                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Father Name</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    value={addForm.father_name}
                    onChangeText={t => onChange('father_name', t)}
                  />
                </View>

                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Email</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    value={addForm.email}
                    keyboardType="email-address"
                    onChangeText={t => onChange('email', t)}
                  />
                </View>

                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    value={addForm.contact}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      onChange('contact', cleaned);
                    }}
                  />
                </View>

                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Address</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    value={addForm.address}
                    onChangeText={t => onChange('address', t)}
                  />
                </View>

                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>CNIC</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
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
                      onChange('cnic', cleaned);
                    }}
                  />
                </View>

                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact Person 1</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    value={addForm.contact_person_one}
                    onChangeText={t => onChange('contact_person_one', t)}
                  />
                </View>

                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact </Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    value={addForm.sec_contact}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      onChange('sec_contact', cleaned);
                    }}
                  />
                </View>

                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact Person 2</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    value={addForm.contact_person_two}
                    onChangeText={t => onChange('contact_person_two', t)}
                  />
                </View>

                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    value={addForm.third_contact}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '');
                      cleaned = cleaned.replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      onChange('third_contact', cleaned);
                    }}
                  />
                </View>

                <View style={styles.addCustomerDropdownRow}>
                  <View style={styles.addCustomerDropdownField}>
                    <Text style={styles.addCustomerLabel}>Customer Type</Text>
                    <DropDownPicker
                      items={transformedTypes}
                      open={customerType}
                      setOpen={setcustomerType}
                      value={custType}
                      setValue={setCustType}
                      placeholder="Select type"
                      style={styles.addCustomerDropdown}
                      dropDownContainerStyle={
                        styles.addCustomerDropdownContainer
                      }
                      textStyle={styles.addCustomerDropdownText}
                      placeholderStyle={styles.addCustomerDropdownPlaceholder}
                      listMode="SCROLLVIEW"
                      searchable
                      searchTextInputStyle={{
                        borderWidth: 0,
                        width: '100%',
                      }}
                      searchContainerStyle={{
                        borderColor: backgroundColors.gray
                      }}
                    />
                  </View>
                </View>

                <View style={styles.addCustomerDropdownRow}>
                  <View style={styles.addCustomerDropdownField}>
                    <Text style={styles.addCustomerLabel}>Area</Text>
                    <DropDownPicker
                      items={transformedAreas}
                      open={customerArea}
                      setOpen={setcustomerArea}
                      value={custArea}
                      setValue={setCustArea}
                      placeholder="Select area"
                      style={styles.addCustomerDropdown}
                      dropDownContainerStyle={
                        styles.addCustomerDropdownContainer
                      }
                      textStyle={styles.addCustomerDropdownText}
                      placeholderStyle={styles.addCustomerDropdownPlaceholder}
                      listMode="SCROLLVIEW"
                      searchable
                      searchTextInputStyle={{
                        borderWidth: 0,
                        width: '100%',
                      }}
                      searchContainerStyle={{
                        borderColor: backgroundColors.gray
                      }}
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
                      status={
                        enableBal.includes('on') ? 'checked' : 'unchecked'
                      }
                      color={backgroundColors.primary}
                      uncheckedColor={backgroundColors.dark}
                    />
                    <Text style={[styles.addCustomerLabel, {marginLeft: 8, marginBottom: 0}]}>
                      Enable Opening Balance
                    </Text>
                  </TouchableOpacity>
                </View>

                {enableBal.includes('on') && (
                  <>
                    <View style={styles.addCustomerFullRow}>
                      <Text style={styles.addCustomerLabel}>
                        Opening Balance
                      </Text>
                      <TextInput
                        style={styles.addCustomerInput}
                        placeholderTextColor="#999"
                        placeholder="Enter opening balance"
                        keyboardType="numeric"
                        value={addForm.opening_balance}
                        onChangeText={t => onChange('opening_balance', t)}
                      />
                    </View>

                    <View style={styles.addCustomerDropdownRow}>
                      <View style={styles.addCustomerDropdownField}>
                        <Text style={styles.addCustomerLabel}>
                          Payment Type
                        </Text>
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
                          placeholderStyle={
                            styles.addCustomerDropdownPlaceholder
                          }
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
                          !(
                            current === 'recievable' || current === 'payable'
                          ) && enableBal.includes('on')
                        }
                      />
                    </View>
                  </>
                )}

                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={addCustomer}>
                  <Icon name="account-plus-outline" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>Add Customer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => prev - 1)}
              style={[
                styles.pageButton,
                currentPage === 1 && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === 1 && styles.pageButtonTextDisabled,
                ]}>
                Prev
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                Page <Text style={styles.pageCurrent}>{currentPage}</Text> of{' '}
                {totalPages}
              </Text>
              <Text style={styles.totalText}>
                Total: {totalRecords} records
              </Text>
            </View>

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(prev => prev + 1)}
              style={[
                styles.pageButton,
                currentPage === totalPages && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === totalPages && styles.pageButtonTextDisabled,
                ]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: backgroundColors.primary,
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.light,
  },
  menuIcon: {
    width: 28,
    height: 28,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gradientBackground: {
    flex: 1,
  },

  // Search Filter
  searchFilter: {
    width: '94%',
    alignSelf: 'center',
    height: 48,
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  search: {
    height: '100%',
    fontSize: 14,
    color: backgroundColors.dark,
    width: '100%',
  },

  // FlatList Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: '3%',
  },
  card: {
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    height: 45,
    width: 45,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    width: '96%',
    alignSelf: 'center',
    marginTop: 60,
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Pagination Component
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: backgroundColors.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: -2},
    elevation: 6,
  },
  pageButton: {
    backgroundColor: backgroundColors.info,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  pageButtonDisabled: {
    backgroundColor: '#ddd',
  },
  pageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  pageButtonTextDisabled: {
    color: '#777',
  },
  pageIndicator: {
    paddingHorizontal: 10,
  },
  pageIndicatorText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  pageCurrent: {
    fontWeight: '700',
    color: '#FFD166',
  },
  totalText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },

  // Add Customer Modal Styles
  addCustomerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  addCustomerModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: backgroundColors.primary,
  },
  addCustomerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.primary,
  },
  addCustomerCloseBtn: {
    padding: 5,
  },
  addCustomerForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  addCustomerField: {
    flex: 1,
    marginBottom: 5,
  },
  addCustomerFullRow: {
    marginBottom: 15,
  },
  addCustomerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 5,
  },
  addCustomerInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  addCustomerDropdownRow: {
    marginBottom: 15,
  },
  addCustomerDropdownField: {
    flex: 1,
  },
  addCustomerDropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 42,
    zIndex: 999,
  },
  addCustomerDropdownContainer: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    zIndex: 1000,
    maxHeight: 160,
  },
  addCustomerDropdownText: {
    color: '#333',
    fontSize: 14,
  },
  addCustomerDropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  addCustomerSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  addCustomerSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
