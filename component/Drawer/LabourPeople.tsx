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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
import {Avatar, Checkbox} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../Colors';

interface ViewLabour {
  labr_name: string;
  labr_cnic: string;
  labr_address: string;
  labr_contact: string;
  labr_email: string;
  labr_contact_person_one: string;
  labr_contact_person_two: string;
  labr_sec_contact: string;
  labr_third_contact: string;
  labr_image: string;
  labr_opening_balance: string;
  labr_payment_type: string;
  labr_transaction_type: string;
}

interface Labour {
  id: number;
  labr_name: string;
  labr_cnic: string;
  labr_contact: string;
  labr_email: string;
  labr_address: string;
}

interface EditForm {
  labr_name: string;
  labr_email: string;
  labr_address: string;
  labr_contact: string;
  labr_contact_person_one: string;
  labr_contact_person_two: string;
  labr_cnic: string;
  labr_sec_contact: string;
  labr_third_contact: string;
}

const initialEditForm: EditForm = {
  labr_name: '',
  labr_email: '',
  labr_address: '',
  labr_contact: '',
  labr_contact_person_one: '',
  labr_contact_person_two: '',
  labr_cnic: '',
  labr_sec_contact: '',
  labr_third_contact: '',
};

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

export default function LabourPeople() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [labour, setLabour] = useState<Labour[]>([]);
  const [viewLabour, setViewLabour] = useState<ViewLabour | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(initialEditForm);
  const [addForm, setAddForm] = useState<AddForm>(initialAddForm);
  const [selectedLabour, setSelectedLabour] = useState<number | null>(null);
  const [enableBal, setEnableBal] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = labour.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = labour.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const handleEditInputChange = (field: keyof EditForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddInputChange = (field: keyof AddForm, value: string) => {
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

  const [paymentType, setpaymentType] = useState(false);
  const [current, setcurrentpaymentType] = useState<string | null>('');
  const paymentTypeItem = [
    {label: 'Payable', value: 'payable'},
    {label: 'Recievable', value: 'recievable'},
  ];

  const [isModalV, setModalV] = useState(false);
  const tglModal = (id: number) => {
    setSelectedLabour(id);
    setModalV(!isModalV);
  };

  {
    /*edit*/
  }
  const [edit, setedit] = useState(false);

  const toggleedit = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editlabour?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setedit(!edit);
      setEditForm(res.data);
      setSelectedLabour(id);
    } catch (error) {
      console.log(error);
    }
  };

  const [view, setview] = useState(false);

  // View Modal
  const toggleview = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/showlabour?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setViewLabour(res.data);
      setview(!view);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Labour
  const handleAddLabr = async () => {
    const nameRegex = /^[A-Za-z ]+$/;

    if (!addForm.labr_name) {
      Toast.show({
        type: 'error',
        text1: 'Missing Field',
        text2: 'Field names with * are Mandatory',
        visibilityTime: 1500,
      });
      return;
    }

    if (!nameRegex.test(addForm.labr_name.trim())) {
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
          visibilityTime: 1500,
        });

        setAddForm(initialAddForm);
        setcurrentpaymentType('');
        setEnableBal([]);
        handleFetchData();
        setcustomer(false);
      } else if (res.status === 200 && data.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email already exist!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 405) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Contact already exist!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 409) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'CNIC already exist!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 406) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'NTN No. already exist!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 203) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Please select payment type first!',
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Labour
  const handleDeleteLabr = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/Labourdelete`, {
        id: selectedLabour,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Labour has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setSelectedLabour(null);
        handleFetchData();
        setModalV(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update Labour
  const handleUpdateLabr = async () => {
    const nameRegex = /^[A-Za-z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const labrName = (editForm.labr_name ?? '').trim();
    const labrEmail = (editForm.labr_email ?? '').trim();
    const labrAddress = (editForm.labr_address ?? '').trim();

    if (!labrName) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all fields and select a role before updating.',
        visibilityTime: 1500,
      });
      return;
    }

    if (!nameRegex.test(labrName)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Labour name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (labrEmail && !emailRegex.test(labrEmail)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/updatelabour`, {
        Labour_id: selectedLabour,
        labour_name: labrName,
        cnic: editForm.labr_cnic ?? '',
        contact: editForm.labr_contact ?? '',
        email: labrEmail,
        contact_person_one: editForm.labr_contact_person_one ?? '',
        sec_contact: editForm.labr_sec_contact ?? '',
        contact_person_two: editForm.labr_contact_person_two ?? '',
        third_contact: editForm.labr_third_contact ?? '',
        address: labrAddress,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Labour has been updated successfully!',
          visibilityTime: 1500,
        });

        setEditForm(initialEditForm);
        setSelectedLabour(null);
        handleFetchData();
        setedit(false);
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Contact number already exist!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 204) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email already exist!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && data.status === 205) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'CNIC already exist!',
          visibilityTime: 1500,
        });
      }
    } catch (error: any) {
      console.log('Update Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.response?.data?.message || error.message,
        visibilityTime: 3000,
      });
    }
  };

  // Fetch Data
  const handleFetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchlaboursdata`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLabour(res.data.labour);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[backgroundColors.primary, backgroundColors.secondary]}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Labour</Text>
          </View>

          <TouchableOpacity onPress={togglecustomer} style={[styles.headerBtn]}>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.labr_name?.charAt(0) || 'L'}
                    </Text>
                  </View>

                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.labr_name}</Text>
                    {/* small details inline */}
                    <Text style={styles.subText}>
                      <Icon name="phone" size={12} color="#666" />{' '}
                      {item.labr_contact || 'No contact'}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="mail" size={12} color="#666" />{' '}
                      {item.labr_email || 'N/A'}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="map-marker" size={12} color="#666" />{' '}
                      {item.labr_address || 'N/A'}
                    </Text>
                  </View>

                  {/* Actions on right */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => {
                        toggleview(item.id);
                      }}>
                      <Icon name="eye" size={20} color={'#144272'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleedit(item.id)}>
                      <Icon name="pencil" size={20} color={'#144272'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        tglModal(item.id);
                      }}>
                      <Icon name="delete" size={20} color={'#144272'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
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

        {/* Add Labour Modal */}
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
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.addCustomerForm}>
                {/* Name + CNIC */}
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Labour Name *</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    value={addForm.labr_name}
                    onChangeText={t => handleAddInputChange('labr_name', t)}
                  />
                </View>
                <View style={styles.addCustomerField}>
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

                {/* Contact + Email */}
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    keyboardType="phone-pad"
                    maxLength={12}
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
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Email</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    keyboardType="email-address"
                    value={addForm.email}
                    onChangeText={t => handleAddInputChange('email', t)}
                  />
                </View>

                {/* Contact Person 1 + Contact 1 */}
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact Person 1</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    value={addForm.contact_person_one}
                    maxLength={12}
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
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact 1</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    keyboardType="phone-pad"
                    maxLength={12}
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

                {/* Contact Person 2 + Contact 2 */}
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact Person 2</Text>
                  <TextInput
                    style={styles.addCustomerInput}
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
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact 2</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    keyboardType="phone-pad"
                    maxLength={12}
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

                {/* Address */}
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Address</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    value={addForm.address}
                    onChangeText={t => handleAddInputChange('address', t)}
                  />
                </View>

                {/* Opening Balance Section */}
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
                      color="#144272"
                      uncheckedColor="#144272"
                    />
                    <Text style={[styles.addCustomerLabel, {marginLeft: 8}]}>
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
                        placeholder="Enter opening balance"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={addForm.opening_balance}
                        onChangeText={t =>
                          handleAddInputChange('opening_balance', t)
                        }
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

        {/*Delete*/}
        <Modal visible={isModalV} transparent animationType="fade">
          <View style={styles.addCustomerModalOverlay}>
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
                  onPress={() => setModalV(!isModalV)}>
                  <Text style={[styles.deleteModalBtnText, {color: '#144272'}]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteModalBtn, {backgroundColor: '#d9534f'}]}
                  onPress={handleDeleteLabr}>
                  <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/*Edit*/}
        <Modal visible={edit} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              {/* Header */}
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Edit Labour</Text>
                <TouchableOpacity
                  onPress={() => {
                    setedit(false);
                    setEditForm(initialEditForm);
                    setSelectedLabour(null);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.addCustomerForm}>
                {/* Row 1 */}
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Labour Name *</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    value={editForm.labr_name}
                    onChangeText={t => handleEditInputChange('labr_name', t)}
                  />
                </View>
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>CNIC</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    value={editForm.labr_cnic}
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
                      handleEditInputChange('labr_cnic', cleaned);
                    }}
                  />
                </View>

                {/* Row 2 */}
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    value={editForm.labr_contact}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      handleEditInputChange('labr_contact', cleaned);
                    }}
                  />
                </View>
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Email</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    value={editForm.labr_email}
                    keyboardType="email-address"
                    onChangeText={t => handleEditInputChange('labr_email', t)}
                  />
                </View>

                {/* Row 3 */}
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact Person 1</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    value={editForm.labr_contact_person_one}
                    onChangeText={t =>
                      handleEditInputChange('labr_contact_person_one', t)
                    }
                  />
                </View>
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact 1</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    value={editForm.labr_sec_contact}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      handleEditInputChange('labr_sec_contact', cleaned);
                    }}
                  />
                </View>

                {/* Row 4 */}
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact Person 2</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    value={editForm.labr_contact_person_two}
                    onChangeText={t =>
                      handleEditInputChange('labr_contact_person_two', t)
                    }
                  />
                </View>
                <View style={styles.addCustomerField}>
                  <Text style={styles.addCustomerLabel}>Contact 2</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    value={editForm.labr_third_contact}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      handleEditInputChange('labr_third_contact', cleaned);
                    }}
                  />
                </View>

                {/* Address */}
                <View style={[styles.addCustomerField, {flex: 1}]}>
                  <Text style={styles.addCustomerLabel}>Address</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    value={editForm.labr_address}
                    onChangeText={t => handleEditInputChange('labr_address', t)}
                  />
                </View>

                {/* Update Button */}
                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={handleUpdateLabr}>
                  <Icon name="account-edit" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>
                    Update Labour
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/*View Modal*/}
        <Modal visible={view} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ScrollView contentContainerStyle={styles.modalContent}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>Customer Details</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setview(false);
                      setSelectedLabour(null);
                    }}
                    style={styles.closeBtn}>
                    <Icon name="close" size={22} color="#144272" />
                  </TouchableOpacity>
                </View>

                <View style={styles.customerDetailsWrapper}>
                  {/* Profile Image */}
                  <View style={styles.customerImageWrapper}>
                    {viewLabour?.labr_image ? (
                      <Avatar.Image
                        size={110}
                        source={{uri: viewLabour.labr_image}}
                        style={styles.customerImage}
                      />
                    ) : (
                      <Avatar.Icon
                        size={110}
                        icon="account"
                        style={[
                          styles.customerNoImage,
                          {backgroundColor: '#e0f2fe'},
                        ]}
                        color="#144272"
                      />
                    )}
                  </View>

                  {/* Info Fields */}
                  <View style={styles.modalInfoBox}>
                    {[
                      {
                        label: 'Transporter Name',
                        value: viewLabour?.labr_name,
                      },
                      {
                        label: 'Contact',
                        value: viewLabour?.labr_contact,
                      },
                      {
                        label: 'CNIC',
                        value: viewLabour?.labr_cnic,
                      },
                      {
                        label: 'Email',
                        value: viewLabour?.labr_email,
                      },
                      {
                        label: 'Contact Person 1',
                        value: viewLabour?.labr_contact_person_one,
                      },
                      {
                        label: 'Contact 1',
                        value: viewLabour?.labr_sec_contact,
                      },
                      {
                        label: 'Contact Person 2',
                        value: viewLabour?.labr_contact_person_two,
                      },
                      {
                        label: 'Contact 2',
                        value: viewLabour?.labr_third_contact,
                      },
                      {
                        label: 'Address',
                        value: viewLabour?.labr_address,
                      },
                      {
                        label: 'Opening Balance',
                        value: viewLabour?.labr_opening_balance,
                      },
                      {
                        label: 'Payment Type',
                        value: viewLabour?.labr_payment_type,
                      },
                      {
                        label: 'Transaction Type',
                        value: viewLabour?.labr_transaction_type,
                      },
                    ].map((item, index) => (
                      <View key={index} style={styles.modalInfoRow}>
                        <Text style={styles.infoLabel}>{item.label}</Text>
                        <Text style={styles.infoValue}>
                          {item.value || 'N/A'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
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
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
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

  // FlatList Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
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
    alignSelf: 'flex-start',
    gap: 8,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    backgroundColor: '#fff',
    borderRadius: 15,
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
    backgroundColor: backgroundColors.secondary,
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
    borderBottomColor: '#e0e0e0',
  },
  addCustomerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#144272',
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
    color: '#144272',
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
    backgroundColor: '#144272',
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

  //Delete Modal
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

  // View Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  modalHeaderTitle: {
    color: '#144272',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  customerDetailsWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  customerImageWrapper: {
    marginBottom: 16,
  },
  customerImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#144272',
  },
  customerNoImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  customerNoImageText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  modalInfoBox: {
    width: '100%',
    marginTop: 10,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 12,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
  },
  infoValue: {
    fontSize: 14,
    color: '#555',
    flexShrink: 1,
    textAlign: 'right',
  },
});
