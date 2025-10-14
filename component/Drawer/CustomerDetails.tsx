import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import backgroundColors from '../Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import {ScrollView} from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';

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
  const transformedTypes = types.map(item => ({
    label: item.custtyp_name,
    value: item.id,
  }));
  const [areaData, setAreaData] = useState<AreaData[]>([]);
  const transformedAreas = areaData.map(item => ({
    label: item.area_name,
    value: item.id,
  }));

  // Add Customer Form On Change
  const editOnChange = (field: keyof EditCustomer, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
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

  // Fetch Area
  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchareadata`);
      setAreaData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Customer Details
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

  // Delete Customer
  const delCustomer = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/customerdelete`, {
        id: id,
      });

      const data = res.data;
      console.log(res.status);
      console.log(data.status);

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Customer has been Deleted successfully!',
          visibilityTime: 1500,
        });
        setModalVisible('');
        navigation.navigate('Customer');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Get Edit Form Data
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

  // Update Customer
  const updateCustomer = async () => {
    const nameRegex = /^[A-Za-z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const name = editForm.cust_name?.trim() || '';
    const fatherName = editForm.cust_fathername?.trim() || '';
    const email = editForm.cust_email?.trim() || '';

    if (!nameRegex.test(name)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Customer name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (fatherName && !nameRegex.test(fatherName)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Father Name',
        text2: 'Father name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (email && !emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
        visibilityTime: 2000,
      });
      return;
    }

    if (!name) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Field names with * are Mandatory',
        visibilityTime: 2000,
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
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Customer record has been updated successfully',
          visibilityTime: 1500,
        });
        setEditForm(initialEditCustomer);
        setAreaValue('');
        setTypeValue('');
        setModalVisible('');
        fetchCustDetails();

        setTimeout(() => {
          setModalVisible('Success');
        }, 500);
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Contact number already exist!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 203) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'CNIC number already exist!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 204) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email already exist!',
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCustDetails();
    fetchType();
    fetchAreas();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Customer');
            }}>
            <Icon
              name="chevron-left"
              size={28}
              color={backgroundColors.light}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Details</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerBtn]}
          onPress={() => setModalVisible('Delete')}>
          <Icon name="delete" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Details */}
      <ScrollView
        style={styles.detailsContainer}
        showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarBox}>
          <Image
            source={require('../../assets/man.png')}
            style={styles.avatar}
          />
          <Text style={styles.custName}>{customer?.cust.cust_name}</Text>
        </View>

        {/* Inner Details */}
        <View style={styles.innerDetails}>
          <View style={styles.innerHeader}>
            <Text style={styles.headerText}>Customer Details</Text>
            <TouchableOpacity
              style={{flexDirection: 'row', gap: 5}}
              onPress={() => {
                getEditData();
                setModalVisible('Edit');
              }}>
              <Text style={styles.editText}>Edit</Text>
              <Icon
                name="square-edit-outline"
                size={18}
                color={backgroundColors.dark}
              />
            </TouchableOpacity>
          </View>

          {/* Details */}
          <View style={styles.detailsView}>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>
                {customer?.cust?.cust_name ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Father Name</Text>
              <Text style={styles.value}>
                {customer?.cust?.cust_fathername ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>
                {customer?.cust?.cust_email ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.value}>
                {customer?.cust?.cust_contact ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact Person One</Text>
              <Text style={styles.value}>
                {customer?.cust?.cust_contact_person_one ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>
                {customer?.cust?.cust_sec_contact ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact Person Two</Text>
              <Text style={styles.value}>
                {customer?.cust?.cust_contact_person_two ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>
                {customer?.cust?.cust_third_contact ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>CNIC</Text>
              <Text style={styles.value}>
                {customer?.cust?.cust_cnic ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>
                {customer?.cust?.cust_address ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Customer Area</Text>
              <Text style={styles.value}>
                {customer?.area?.area_name ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Customer Type</Text>
              <Text style={styles.value}>
                {customer?.type?.custtyp_name ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Opening Balance</Text>
              <Text style={styles.value}>
                {customer?.cust?.cust_opening_balance ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Payment Type</Text>
              <Text style={styles.value}>
                {customer?.cust?.cust_payment_type ?? '--'}
              </Text>
            </View>
            <View style={[styles.detailsRow, {borderBottomWidth: 0}]}>
              <Text style={styles.label}>Transaction Type</Text>
              <Text style={styles.value}>
                {customer?.cust?.cust_transaction_type ?? '--'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/*Delete*/}
      <Modal
        visible={modalVisible === 'Delete'}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.delAnim}>
              <LottieView
                style={{flex: 1}}
                source={require('../../assets/warning.json')}
                autoPlay
                loop={false}
              />
            </View>

            {/* Title */}
            <Text style={styles.deleteModalTitle}>Are you sure?</Text>

            {/* Subtitle */}
            <Text style={styles.deleteModalMessage}>
              You won’t be able to revert this record!
            </Text>

            {/* Buttons */}
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.deleteModalBtn, {backgroundColor: '#e0e0e0'}]}
                onPress={() => setModalVisible('')}>
                <Text style={[styles.deleteModalBtnText, {color: '#144272'}]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteModalBtn, {backgroundColor: '#d9534f'}]}
                onPress={delCustomer}>
                <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/*Success*/}
      <Modal
        visible={modalVisible === 'Success'}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.delAnim}>
              <LottieView
                style={{flex: 1}}
                source={require('../../assets/success.json')}
                autoPlay
                duration={2500}
                loop={false}
              />
            </View>

            {/* Title */}
            <Text style={styles.deleteModalTitle}>Updated!</Text>

            {/* Subtitle */}
            <Text style={styles.deleteModalMessage}>
              Customer record has been updated successfully!
            </Text>

            {/* Buttons */}
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[
                  styles.deleteModalBtn,
                  {backgroundColor: backgroundColors.success},
                ]}
                onPress={() => {
                  setModalVisible('');
                }}>
                <Text style={styles.deleteModalBtnText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/*Edit*/}
      <Modal
        visible={modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.addeditCustomerModalOverlay}>
          <ScrollView style={styles.editCustomerModalContainer}>
            {/* Header */}
            <View style={styles.editCustomerHeader}>
              <Text style={styles.editCustomerTitle}>Edit Customer</Text>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={styles.editCustomerCloseBtn}>
                <Icon name="close" size={20} color="#144272" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.editCustomerForm}>
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Customer Name *</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  value={editForm.cust_name}
                  onChangeText={t => editOnChange('cust_name', t)}
                />
              </View>
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Father Name</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  value={editForm.cust_fathername}
                  onChangeText={t => editOnChange('cust_fathername', t)}
                />
              </View>

              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Email</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  value={editForm.cust_email}
                  keyboardType="email-address"
                  onChangeText={t => editOnChange('cust_email', t)}
                />
              </View>
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Address</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  value={editForm.cust_address}
                  onChangeText={t => editOnChange('cust_address', t)}
                />
              </View>

              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Contact</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  value={editForm.cust_contact}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnChange('cust_contact', cleaned);
                  }}
                />
              </View>
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>CNIC</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  value={editForm.cust_cnic}
                  keyboardType="numeric"
                  maxLength={15}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                    if (cleaned.length > 5)
                      cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                    if (cleaned.length > 13)
                      cleaned =
                        cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                    if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                    editOnChange('cust_cnic', cleaned);
                  }}
                />
              </View>

              {/* Contact Persons */}
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Contact Person 1</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  value={editForm.cust_contact_person_one}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnChange('cust_contact_person_one', cleaned);
                  }}
                />
              </View>
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Contact</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  value={editForm.cust_sec_contact}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnChange('cust_sec_contact', cleaned);
                  }}
                />
              </View>

              {/* Other Contacts */}
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Contact Person 2</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  value={editForm.cust_contact_person_two}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnChange('cust_contact_person_two', cleaned);
                  }}
                />
              </View>

              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Contact</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  value={editForm.cust_third_contact}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnChange('cust_third_contact', cleaned);
                  }}
                />
              </View>

              {/* Dropdowns */}
              <View style={styles.editCustomerDropdownRow}>
                <View style={styles.editCustomerDropdownField}>
                  <Text style={styles.editCustomerLabel}>Customer Type</Text>
                  <DropDownPicker
                    items={transformedTypes}
                    open={open}
                    setOpen={setOpen}
                    value={typeValue}
                    setValue={setTypeValue}
                    placeholder="Select type"
                    style={styles.editCustomerDropdown}
                    dropDownContainerStyle={
                      styles.editCustomerDropdownContainer
                    }
                    textStyle={styles.editCustomerDropdownText}
                    placeholderStyle={styles.editCustomerDropdownPlaceholder}
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
              </View>

              <View style={styles.editCustomerDropdownRow}>
                <View style={styles.editCustomerDropdownField}>
                  <Text style={styles.editCustomerLabel}>Area</Text>
                  <DropDownPicker
                    items={transformedAreas}
                    open={openArea}
                    setOpen={setOpenArea}
                    value={areaValue}
                    setValue={setAreaValue}
                    placeholder="Select area"
                    style={styles.editCustomerDropdown}
                    dropDownContainerStyle={
                      styles.editCustomerDropdownContainer
                    }
                    textStyle={styles.editCustomerDropdownText}
                    placeholderStyle={styles.editCustomerDropdownPlaceholder}
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

              {/* Update Button */}
              <TouchableOpacity
                style={styles.editCustomerSubmitBtn}
                onPress={updateCustomer}>
                <Icon name="account-edit" size={20} color="white" />
                <Text style={styles.editCustomerSubmitText}>
                  Update Customer
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Toast />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CustomerDetails;

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
  headerCenter: {
    flex: 1,
    gap: 10,
    flexDirection: 'row',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
  },

  // Details container
  detailsContainer: {
    flex: 1,
    paddingHorizontal: '3%',
  },
  avatarBox: {
    marginVertical: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    height: 125,
    width: 125,
  },
  custName: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 10,
    color: backgroundColors.primary,
  },

  // Inner Details
  innerDetails: {
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  innerHeader: {
    width: '100%',
    height: 50,
    borderBottomColor: backgroundColors.primary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: backgroundColors.dark,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
  },
  detailsView: {
    flex: 1,
  },
  detailsRow: {
    alignItems: 'baseline',
    paddingVertical: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: backgroundColors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.primary,
  },
  value: {
    fontSize: 16,
    color: backgroundColors.dark,
  },

  //Delete Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  deleteModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    width: '100%',
    alignSelf: 'center',
  },
  deleteModalIcon: {
    width: 60,
    height: 60,
    tintColor: '#144272',
    marginBottom: 15,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 8,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  deleteModalBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteModalBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  delAnim: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },

  // Edit Customer Modal Styles
  addeditCustomerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  editCustomerModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  editCustomerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editCustomerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.primary,
  },
  editCustomerCloseBtn: {
    padding: 5,
  },
  editCustomerForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  editCustomerField: {
    flex: 1,
    marginBottom: 5,
  },
  editCustomerFullRow: {
    marginBottom: 15,
  },
  editCustomerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 5,
  },
  editCustomerInput: {
    borderWidth: 1,
    borderColor: backgroundColors.gray,
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: backgroundColors.dark,
    backgroundColor: '#f9f9f9',
  },
  editCustomerDropdownRow: {
    marginBottom: 15,
  },
  editCustomerDropdownField: {
    flex: 1,
  },
  editCustomerDropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 42,
    zIndex: 999,
  },
  editCustomerDropdownContainer: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    zIndex: 1000,
    maxHeight: 160,
  },
  editCustomerDropdownText: {
    color: '#333',
    fontSize: 14,
  },
  editCustomerDropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  editCustomerSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  editCustomerSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
