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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import backgroundColors from '../Colors';
import BASE_URL from '../BASE_URL';
import axios from 'axios';
import {useUser} from '../CTX/UserContext';
import {ScrollView} from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import {Checkbox} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';

interface SupplierDetails {
  supp: {
    id: number;
    sup_area_id: string;
    sup_name: string;
    sup_company_name: string;
    sup_agancy_name: string;
    sup_address: string;
    sup_contact: string;
    sup_sec_contact: string;
    sup_third_contact: string;
    sup_email: string;
    sup_image: string;
    sup_payment_type: string;
    sup_transaction_type: string;
    sup_opening_balance: string;
  };
  area: {
    id: number;
    area_name: string;
  };
}

interface EditSupplier {
  id: number;
  sup_area_id: string;
  sup_name: string;
  sup_company_name: string;
  sup_agancy_name: string;
  sup_address: string;
  sup_contact: string;
  sup_sec_contact: string;
  sup_third_contact: string;
  sup_email: string;
}

const initialEditSupplier: EditSupplier = {
  id: 0,
  sup_address: '',
  sup_agancy_name: '',
  sup_area_id: '',
  sup_company_name: '',
  sup_contact: '',
  sup_email: '',
  sup_name: '',
  sup_sec_contact: '',
  sup_third_contact: '',
};

interface AreaDropDown {
  id: string;
  area_name: string;
}

const SupplierDetails = ({navigation, route}: any) => {
  const {id} = route.params;
  const {token} = useUser();
  const [supplier, setSupplier] = useState<SupplierDetails | null>(null);
  const [modalVisible, setModalVisible] = useState('');
  const [editForm, setEditForm] = useState<EditSupplier>(initialEditSupplier);
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaValue, setAreaValue] = useState<string | null>('');
  const [areaDropdown, setAreaDropdown] = useState<AreaDropDown[] | []>([]);
  const transformedAreas = areaDropdown.map(item => ({
    label: item.area_name,
    value: item.id,
  }));
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // On Change
  const handleEditInputChange = (
    field: keyof EditSupplier,
    value: string | number,
  ) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch Supplier Details
  const fetchSupDetails = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/suppliersshow?id=${id}&_token=${token}`,
      );
      setSupplier(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/supplierdelete`, {
        id: id,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Supplier has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setModalVisible('');
        navigation.navigate('Suppliers');
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

  // Get Edit Data
  const getEditData = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editsupplier?id=%20${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEditForm(res.data);
      setAreaValue(res.data.sup_area_id);
      setAreaOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  // Update Suuplier
  const handleUpdateSupplier = async () => {
    const nameRegex = /^[A-Za-z ]+$/;

    if (!editForm.sup_address || !editForm.sup_name) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all fields and select a role before updating.',
        visibilityTime: 1500,
      });
      return;
    }

    if (editForm.sup_name.length < 3) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Supplier name must be at least 3 characters.',
        visibilityTime: 15,
      });
      return;
    }

    if (!nameRegex.test(editForm.sup_name.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Customer name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (editForm.sup_email && editForm.sup_email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.sup_email.trim())) {
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
      const res = await axios.post(`${BASE_URL}/updatesupplier`, {
        supp_id: id,
        comp_name: editForm.sup_company_name.trim(),
        agencyname: editForm.sup_agancy_name,
        supp_name: editForm.sup_name.trim(),
        contact: editForm.sup_contact,
        sec_contact: editForm.sup_sec_contact,
        third_contact: editForm.sup_third_contact,
        email: editForm.sup_email,
        address: editForm.sup_address.trim(),
        supp_area: areaValue,
        ...(selectedOptions.includes('on') && {alsocust: 'on'}),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Supplier has been Updated successfully!',
          visibilityTime: 2000,
        });

        setEditForm(initialEditSupplier);
        setAreaValue(null);
        setAreaOpen(false);
        setAreaValue('');
        setModalVisible('');
        fetchSupDetails();
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Contact number already exist!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 204) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email already exist!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSupDetails();
    handleFetchAreas();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Suppliers');
            }}>
            <Icon
              name="chevron-left"
              size={28}
              color={backgroundColors.light}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Supplier Details</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerBtn]}
          onPress={() => {
            setModalVisible('Delete');
          }}>
          <Icon name="delete" size={28} color={backgroundColors.light} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.detailsContainer}
        showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarBox}>
          <Image
            source={require('../../assets/man.png')}
            style={styles.avatar}
          />
          <Text style={styles.custName}>
            {supplier?.supp?.sup_name ?? '--'}
          </Text>
        </View>

        {/* Inner Details */}
        <View style={styles.innerDetails}>
          <View style={styles.innerHeader}>
            <Text style={styles.headerText}>Supplier Details</Text>
            <TouchableOpacity
              style={{flexDirection: 'row', gap: 5}}
              onPress={() => {
                setModalVisible('Edit');
                getEditData();
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
                {supplier?.supp?.sup_name ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Company Name</Text>
              <Text style={styles.value}>
                {supplier?.supp?.sup_company_name ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Agency Name</Text>
              <Text style={styles.value}>
                {supplier?.supp?.sup_agancy_name ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact 1</Text>
              <Text style={styles.value}>
                {supplier?.supp?.sup_contact ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact 2</Text>
              <Text style={styles.value}>
                {supplier?.supp?.sup_sec_contact ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact 3</Text>
              <Text style={styles.value}>
                {supplier?.supp?.sup_third_contact ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>
                {supplier?.supp?.sup_email ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Supplier Area</Text>
              <Text style={styles.value}>
                {supplier?.area?.area_name ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>
                {supplier?.supp?.sup_address ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Opening Balance</Text>
              <Text style={styles.value}>
                {supplier?.supp?.sup_opening_balance ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Payment Type</Text>
              <Text style={styles.value}>
                {supplier?.supp?.sup_payment_type ?? '--'}
              </Text>
            </View>
            <View style={[styles.detailsRow, {borderBottomWidth: 0}]}>
              <Text style={styles.label}>Transaction Type</Text>
              <Text style={styles.value}>
                {supplier?.supp?.sup_transaction_type ?? '--'}
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
        <View style={styles.delModalOverlay}>
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
                onPress={handleDeleteSupplier}>
                <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Supplier Modal */}
      <Modal
        visible={modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.editCustomerModalOverlay}>
          <ScrollView style={styles.editCustomerModalContainer}>
            {/* Header */}
            <View style={styles.editCustomerHeader}>
              <Text style={styles.editCustomerTitle}>Edit Supplier</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setEditForm(initialEditSupplier);
                  setAreaOpen(false);
                }}
                style={styles.editCustomerCloseBtn}>
                <Icon name="close" size={20} color="#144272" />
              </TouchableOpacity>
            </View>

            <View style={styles.editCustomerForm}>
              {/* Also a Customer */}
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
                    color={backgroundColors.primary}
                    uncheckedColor={backgroundColors.dark}
                  />
                  <Text
                    style={[
                      styles.editCustomerLabel,
                      {marginLeft: 8, marginBottom: 0},
                    ]}>
                    Also a Customer
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Company + Agency */}
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Company Name *</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Enter company name"
                  value={editForm.sup_company_name}
                  onChangeText={text =>
                    handleEditInputChange('sup_company_name', text)
                  }
                />
              </View>
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Agency Name</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Enter agency name"
                  value={editForm.sup_agancy_name}
                  onChangeText={text =>
                    handleEditInputChange('sup_agancy_name', text)
                  }
                />
              </View>

              {/* Name + Contact 1 */}
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Supplier Name *</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Supplier Name"
                  value={editForm.sup_name}
                  onChangeText={text => handleEditInputChange('sup_name', text)}
                />
              </View>
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Email</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="supplier@example.com"
                  value={editForm.sup_email}
                  keyboardType="email-address"
                  onChangeText={text =>
                    handleEditInputChange('sup_email', text)
                  }
                />
              </View>

              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Contact</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Enter contact"
                  keyboardType="phone-pad"
                  value={editForm.sup_contact}
                  maxLength={12}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleEditInputChange('sup_contact', cleaned);
                  }}
                />
              </View>
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Contact 2</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Enter contact"
                  keyboardType="phone-pad"
                  value={editForm.sup_sec_contact}
                  maxLength={12}
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleEditInputChange('sup_sec_contact', cleaned);
                  }}
                />
              </View>

              {/* Contact 2 + Contact 3 */}
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Contact 3</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Enter contact"
                  keyboardType="phone-pad"
                  value={editForm.sup_third_contact}
                  maxLength={12}
                  onChangeText={text => {
                    let cleaned = text.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    handleEditInputChange('sup_third_contact', cleaned);
                  }}
                />
              </View>
              <View style={styles.editCustomerField}>
                <Text style={styles.editCustomerLabel}>Address</Text>
                <TextInput
                  style={styles.editCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Enter address"
                  value={editForm.sup_address}
                  onChangeText={text =>
                    handleEditInputChange('sup_address', text)
                  }
                />
              </View>

              {/* Supplier Area */}
              <View style={styles.editCustomerDropdownRow}>
                <View style={styles.editCustomerDropdownField}>
                  <Text style={styles.editCustomerLabel}>Supplier Area</Text>
                  <DropDownPicker
                    items={transformedAreas}
                    open={areaOpen}
                    setOpen={setAreaOpen}
                    value={areaValue}
                    setValue={setAreaValue}
                    placeholder="Select supplier area"
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

              {/* Submit */}
              <TouchableOpacity
                style={styles.editCustomerSubmitBtn}
                onPress={handleUpdateSupplier}>
                <Icon name="content-save-edit" size={20} color="white" />
                <Text style={styles.editCustomerSubmitText}>
                  Update Supplier
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

export default SupplierDetails;

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
  delModalOverlay: {
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
  editCustomerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  editCustomerModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
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
  editCustomerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
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
    borderColor: '#e0e0e0',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
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
