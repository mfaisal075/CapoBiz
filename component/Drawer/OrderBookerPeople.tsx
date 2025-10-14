import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import Toast from 'react-native-toast-message';
import backgroundColors from '../Colors';

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

  const handleAddInputChange = (
    field: keyof AddForm,
    value: string | Array<string>,
  ) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  {
    /*customer*/
  }
  const [customer, setcustomer] = useState(false);

  const togglecustomer = () => {
    setcustomer(!customer);
  };

  // Add OrderBooker
  const handleAddOB = async () => {
    const nameRegex = /^[A-Za-z ]+$/;

    if (!addForm.name) {
      Toast.show({
        type: 'error',
        text1: 'Missing Field',
        text2: 'Field names with * are Mandatory',
        visibilityTime: 1500,
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

    if (!nameRegex.test(addForm.name.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Customer name should only contain letters and spaces.',
        visibilityTime: 2000,
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
          visibilityTime: 2000,
        });

        setAddForm(initialAddForm);
        setAreaValue([]);
        handleFetchData();
        setcustomer(false);
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email Already Exist!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Password Mismatch!',
          text2: 'Passwords do not match!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 204) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This CNIC already exist!',
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

  // Fetch Data
  const handleFetchData = async () => {
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
    handleFetchData();
    handleFetchAreas();
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
            <Text style={styles.headerTitle}>Order Booker</Text>
          </View>

          <TouchableOpacity
            onPress={() => togglecustomer()}
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
                  navigation.navigate('OrderBookerDetails', {
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
                    <Text style={styles.name}>{item.name}</Text>
                    {/* small details inline */}
                    <Text style={styles.subText}>
                      <Icon name="phone" size={12} color="#666" />{' '}
                      {item.contact || 'No contact'}
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

        {/*Order Booker Add Modal*/}
        <Modal visible={customer} transparent animationType="slide">
          <View style={styles.addOBModalOverlay}>
            <ScrollView style={styles.addOBModalContainer}>
              {/* Header */}
              <View style={styles.addOBHeader}>
                <Text style={styles.addOBTitle}>Add Order Booker</Text>
                <TouchableOpacity
                  onPress={() => {
                    setcustomer(!customer);
                    setAreaValue([]);
                    setAddForm(initialAddForm);
                  }}
                  style={styles.addOBCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.addOBForm}>
                {/* Name + Email */}
                <View style={styles.addOBField}>
                  <Text style={styles.addOBLabel}>Name *</Text>
                  <TextInput
                    style={styles.addOBInput}
                    value={addForm.name}
                    onChangeText={t => handleAddInputChange('name', t)}
                  />
                </View>
                <View style={styles.addOBField}>
                  <Text style={styles.addOBLabel}>Email</Text>
                  <TextInput
                    style={styles.addOBInput}
                    value={addForm.email}
                    onChangeText={t => handleAddInputChange('email', t)}
                  />
                </View>

                {/* Contact + CNIC */}
                <View style={styles.addOBField}>
                  <Text style={styles.addOBLabel}>Contact</Text>
                  <TextInput
                    style={styles.addOBInput}
                    maxLength={12}
                    keyboardType="phone-pad"
                    value={addForm.contact1}
                    onChangeText={t => handleAddInputChange('contact1', t)}
                  />
                </View>
                <View style={styles.addOBField}>
                  <Text style={styles.addOBLabel}>CNIC</Text>
                  <TextInput
                    style={styles.addOBInput}
                    keyboardType="numeric"
                    maxLength={15}
                    value={addForm.cnic}
                    onChangeText={t => handleAddInputChange('cnic', t)}
                  />
                </View>

                {/* Passwords */}
                <View style={styles.addOBField}>
                  <Text style={styles.addOBLabel}>Password</Text>
                  <TextInput
                    style={styles.addOBInput}
                    secureTextEntry
                    value={addForm.password}
                    onChangeText={t => handleAddInputChange('password', t)}
                  />
                </View>
                <View style={styles.addOBField}>
                  <Text style={styles.addOBLabel}>Confirm Password</Text>
                  <TextInput
                    style={styles.addOBInput}
                    secureTextEntry
                    value={addForm.confirmPassword}
                    onChangeText={t =>
                      handleAddInputChange('confirmPassword', t)
                    }
                  />
                </View>

                {/* Area Selection */}
                <View style={styles.addOBDropdownRow}>
                  <Text style={styles.addOBLabel}>Select Areas</Text>
                  <DropDownPicker
                    items={transformedAreas}
                    open={areaOpen}
                    setOpen={setAreaOpen}
                    value={areaValue}
                    setValue={setAreaValue}
                    multiple={true}
                    mode="BADGE"
                    badgeDotColors={backgroundColors.primary}
                    placeholder="Select order booker area"
                    style={styles.addOBDropdown}
                    dropDownContainerStyle={styles.addOBDropdownContainer}
                    textStyle={styles.addOBDropdownText}
                    placeholderStyle={styles.addOBDropdownPlaceholder}
                    listMode="SCROLLVIEW"
                    searchable
                    searchTextInputStyle={{
                      borderWidth: 0,
                      width: '100%',
                    }}
                    searchContainerStyle={{
                      borderColor: backgroundColors.gray,
                    }}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.addOBSubmitBtn}
                  onPress={handleAddOB}>
                  <Icon name="account-plus-outline" size={20} color="white" />
                  <Text style={styles.addOBSubmitText}>Add Order Booker</Text>
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
    paddingVertical: 12,
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
    color: '#fff',
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

  // Add Modal Styling
  addOBModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  addOBModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  addOBHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addOBTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.primary,
  },
  addOBCloseBtn: {
    padding: 5,
  },
  addOBForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  addOBField: {
    flex: 1,
    marginBottom: 5,
  },
  addOBLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 5,
  },
  addOBInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  addOBDropdownRow: {
    marginBottom: 15,
  },
  addOBDropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 42,
  },
  addOBDropdownContainer: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    maxHeight: 160,
  },
  addOBDropdownText: {
    color: '#333',
    fontSize: 14,
  },
  addOBDropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  addOBSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  addOBSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
