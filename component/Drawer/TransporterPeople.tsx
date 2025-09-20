import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
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
import LottieView from 'lottie-react-native';

interface Transporter {
  id: number;
  trans_name: string;
  trans_cnic: string;
  trans_address: string;
  trans_contact: string;
  trans_email: string;
}

interface ViewTransporter {
  trans_name: string;
  trans_cnic: string;
  trans_address: string;
  trans_contact: string;
  trans_email: string;
  trans_contact_person_one: string;
  trans_contact_person_two: string;
  trans_sec_contact: string;
  trans_third_contact: string;
  trans_image: string;
  trans_opening_balance: string;
  trans_payment_type: string;
  trans_transaction_type: string;
}

interface EditForm {
  trans_name: string;
  trans_email: string;
  trans_address: string;
  trans_contact: string;
  trans_contact_person_one: string;
  trans_contact_person_two: string;
  trans_cnic: string;
  trans_sec_contact: string;
  trans_third_contact: string;
}

const initialEditForm: EditForm = {
  trans_name: '',
  trans_email: '',
  trans_address: '',
  trans_contact: '',
  trans_contact_person_one: '',
  trans_contact_person_two: '',
  trans_cnic: '',
  trans_sec_contact: '',
  trans_third_contact: '',
};

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

export default function TransporterPeople() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [selectedTransporter, setSelectedTransporter] = useState<number | null>(
    null,
  );
  const [viewTransporters, setViewTransporters] = useState<ViewTransporter[]>(
    [],
  );
  const [editForm, setEditForm] = useState<EditForm>(initialEditForm);
  const [addForm, setAddForm] = useState<AddForm>(initialAddForm);
  const [enableBal, setEnableBal] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = transporters.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = transporters.slice(
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

  // Delete Modal
  const tglModal = async (id: number) => {
    setSelectedTransporter(id);
    setModalV(!isModalV);
  };

  {
    /*edit*/
  }
  const [edit, setedit] = useState(false);

  // Edit Modal
  const toggleedit = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editTransporter?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setedit(!edit);
      setEditForm(res.data);
      setSelectedTransporter(id);
    } catch (error) {
      console.log(error);
    }
  };

  const [view, setview] = useState(false);

  // View Modal
  const toggleview = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/showTransporter?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = Array.isArray(res.data) ? res.data : [res.data];
      setViewTransporters(data);
      setview(!view);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Transporter
  const handleAddTrans = async () => {
    const nameRegex = /^[A-Za-z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!addForm.trans_name) {
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
        handleFetchData();
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

  // Delete Transporter
  const handleDeleteTrans = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/Transporterdelete`, {
        id: selectedTransporter,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Transporter has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setSelectedTransporter(null);
        handleFetchData();
        setModalV(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update Transporter
  const handleEditTrans = async () => {
    const nameRegex = /^[A-Za-z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const transName = (editForm.trans_name ?? '').trim();
    const transEmail = (editForm.trans_email ?? '').trim();
    const transAddress = (editForm.trans_address ?? '').trim();

    if (!transName) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Field names with * are Mandatory',
        visibilityTime: 1500,
      });
      return;
    }

    if (!nameRegex.test(transName)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Customer name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    if (transEmail && !emailRegex.test(transEmail)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/updateTransporter`, {
        transporter_id: selectedTransporter,
        trans_name: transName,
        cnic: editForm.trans_cnic ?? '',
        contact: editForm.trans_contact ?? '',
        email: transEmail,
        contact_person_one: editForm.trans_contact_person_one ?? '',
        sec_contact: editForm.trans_sec_contact ?? '',
        contact_person_two: editForm.trans_contact_person_two ?? '',
        third_contact: editForm.trans_third_contact ?? '',
        address: transAddress,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Transporter has been updated successfully!',
          visibilityTime: 2000,
        });

        setEditForm(initialEditForm);
        setSelectedTransporter(null);
        handleFetchData();
        setedit(false);
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Contact number already exist',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 204) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email already exist',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 205) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'CNIC already exist',
          visibilityTime: 2000,
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
      const res = await axios.get(`${BASE_URL}/fetchTransportersdata`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransporters(res.data.transporter);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Transporter</Text>
          </View>

          <TouchableOpacity onPress={togglecustomer} style={[styles.headerBtn]}>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Header Row (Avatar + Name + Actions) */}
                <View style={styles.headerRow}>
                  {/* Avatar */}
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.trans_name?.charAt(0) || 'T'}
                    </Text>
                  </View>

                  {/* Name + Contact */}
                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.trans_name}</Text>
                    <Text style={styles.subText}>
                      {item.trans_contact || 'No contact'}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => toggleview(item.id)}>
                      <Icon
                        style={styles.actionIcon}
                        name="eye"
                        size={20}
                        color={'#144272'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => toggleedit(item.id)}>
                      <Icon
                        style={styles.actionIcon}
                        name="pencil"
                        size={20}
                        color={'#144272'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => tglModal(item.id)}>
                      <Icon
                        style={styles.actionIcon}
                        name="delete"
                        size={20}
                        color={'#144272'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="phone"
                        size={18}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Phone</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.trans_contact || '--'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="id-card"
                        size={18}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>CNIC</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.trans_cnic || '--'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="email"
                        size={18}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Email</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.trans_email || '--'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No Transporters found.
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 120}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/*Add Modal*/}
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
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.addCustomerForm}>
                {/* Row 1: Name */}
                <View style={styles.addCustomerFullRow}>
                  <Text style={styles.addCustomerLabel}>
                    Transporter Name *
                  </Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    placeholder="Enter transporter name"
                    value={addForm.trans_name}
                    onChangeText={t => handleAddInputChange('trans_name', t)}
                  />
                </View>

                {/* Row 2: CNIC + Contact */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>CNIC</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="12345-1234567-1"
                      keyboardType="numeric"
                      maxLength={15}
                      value={addForm.cnic}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 5)
                          cleaned =
                            cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                        if (cleaned.length > 13)
                          cleaned =
                            cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                        if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                        handleAddInputChange('cnic', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="0300-1234567"
                      maxLength={12}
                      keyboardType="phone-pad"
                      value={addForm.contact}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleAddInputChange('contact', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Row 3: Email + Contact Person 1 */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Email</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="transporter@example.com"
                      value={addForm.email}
                      keyboardType="email-address"
                      onChangeText={t => handleAddInputChange('email', t)}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>
                      Contact Person 1
                    </Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Alternative contact"
                      maxLength={12}
                      keyboardType="phone-pad"
                      value={addForm.contact_person_one}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleAddInputChange('contact_person_one', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Row 4: Contact 1 + Contact Person 2 */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 1</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Alternative contact"
                      maxLength={12}
                      keyboardType="phone-pad"
                      value={addForm.sec_contact}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleAddInputChange('sec_contact', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>
                      Contact Person 2
                    </Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Alternative contact"
                      maxLength={12}
                      keyboardType="phone-pad"
                      value={addForm.contact_person_two}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleAddInputChange('contact_person_two', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Row 5: Contact 2 + Address */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 2</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Alternative contact"
                      maxLength={12}
                      keyboardType="phone-pad"
                      value={addForm.third_contact}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
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
                      placeholder="Enter complete address"
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
                  onPress={handleDeleteTrans}>
                  <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Transporter Modal */}
        <Modal visible={edit} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              {/* Header */}
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Edit Transporter</Text>
                <TouchableOpacity
                  onPress={() => {
                    setedit(!edit);
                    setEditForm(initialEditForm);
                    setSelectedTransporter(null);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.addCustomerForm}>
                {/* Name */}
                <View style={styles.addCustomerFullRow}>
                  <Text style={styles.addCustomerLabel}>
                    Transporter Name *
                  </Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    placeholder="Enter transporter name"
                    value={editForm.trans_name}
                    onChangeText={t => handleEditInputChange('trans_name', t)}
                  />
                </View>

                {/* CNIC + Contact */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>CNIC</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="12345-1234567-1"
                      keyboardType="numeric"
                      maxLength={15}
                      value={editForm.trans_cnic}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 5)
                          cleaned =
                            cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                        if (cleaned.length > 13)
                          cleaned =
                            cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                        if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                        handleEditInputChange('trans_cnic', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="0300-1234567"
                      keyboardType="phone-pad"
                      maxLength={12}
                      value={editForm.trans_contact}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleEditInputChange('trans_contact', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Email + Contact Person 1 */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Email</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="transporter@example.com"
                      keyboardType="email-address"
                      value={editForm.trans_email}
                      onChangeText={t =>
                        handleEditInputChange('trans_email', t)
                      }
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>
                      Contact Person 1
                    </Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Alternative contact"
                      keyboardType="phone-pad"
                      maxLength={12}
                      value={editForm.trans_contact_person_one}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleEditInputChange(
                          'trans_contact_person_one',
                          cleaned,
                        );
                      }}
                    />
                  </View>
                </View>

                {/* Contact 1 + Contact Person 2 */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 1</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Alternative contact"
                      keyboardType="phone-pad"
                      maxLength={12}
                      value={editForm.trans_sec_contact}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleEditInputChange('trans_sec_contact', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>
                      Contact Person 2
                    </Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Alternative contact"
                      keyboardType="phone-pad"
                      maxLength={12}
                      value={editForm.trans_contact_person_two}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleEditInputChange(
                          'trans_contact_person_two',
                          cleaned,
                        );
                      }}
                    />
                  </View>
                </View>

                {/* Contact 2 + Address */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 2</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Alternative contact"
                      keyboardType="phone-pad"
                      maxLength={12}
                      value={editForm.trans_third_contact}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleEditInputChange('trans_third_contact', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Address</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter address"
                      value={editForm.trans_address}
                      onChangeText={t =>
                        handleEditInputChange('trans_address', t)
                      }
                    />
                  </View>
                </View>

                {/* Submit */}
                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={handleEditTrans}>
                  <Icon name="truck-check-outline" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>
                    Update Transporter
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/* View Transporter Modal */}
        <Modal visible={view} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              {/* Header */}
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Transporter Details</Text>
                <TouchableOpacity
                  onPress={() => {
                    setview(!view);
                    setSelectedTransporter(null);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {viewTransporters.length > 0 && (
                <View style={styles.customerDetailsWrapper}>
                  {/* Profile Image */}
                  <View style={styles.customerImageWrapper}>
                    {viewTransporters[0]?.trans_image ? (
                      <Image
                        source={{uri: viewTransporters[0]?.trans_image}}
                        style={styles.customerImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.customerNoImage}>
                        <Icon name="truck" size={40} color="#999" />
                        <Text style={styles.customerNoImageText}>No Image</Text>
                      </View>
                    )}
                  </View>

                  {/* Info Fields */}
                  <View style={styles.customerInfoBox}>
                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Transporter Name
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewTransporters[0]?.trans_name ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Contact</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewTransporters[0]?.trans_contact ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>CNIC</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewTransporters[0]?.trans_cnic ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Email</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewTransporters[0]?.trans_email ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Contact 1</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewTransporters[0]?.trans_sec_contact ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Contact 2</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewTransporters[0]?.trans_third_contact ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Contact Person 1
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewTransporters[0]?.trans_contact_person_one ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Contact Person 2
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewTransporters[0]?.trans_contact_person_two ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Address</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewTransporters[0]?.trans_address ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Opening Balance
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewTransporters[0]?.trans_opening_balance ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Payment Type</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewTransporters[0]?.trans_payment_type ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Transaction Type
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewTransporters[0]?.trans_transaction_type ?? 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
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
      </ImageBackground>
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
  background: {
    flex: 1,
  },

  // FlatList Styling
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
    marginHorizontal: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionIcon: {
    tintColor: '#144272',
    width: 20,
    height: 20,
    marginHorizontal: 4,
  },
  infoBox: {
    marginTop: 10,
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 10,
  },
  infoText: {
    flex: 1,
    color: '#333',
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  infoIcon: {
    width: 18,
    height: 18,
    tintColor: '#144272',
    marginRight: 6,
  },
  labelText: {
    fontSize: 13,
    color: '#144272',
    fontWeight: '600',
  },
  valueText: {
    fontSize: 13,
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
  },

  // Pagination Component
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#144272',
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
    backgroundColor: '#fff',
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
    color: '#144272',
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
  addCustomerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  addCustomerField: {
    flex: 1,
    marginHorizontal: 5,
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

  // View Modal Styling
  customerDetailsWrapper: {
    padding: 20,
    alignItems: 'center',
  },
  customerImageWrapper: {
    marginBottom: 20,
  },
  customerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#144272',
  },
  customerNoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
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
  customerInfoBox: {
    width: '100%',
    marginTop: 10,
  },
  customerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 6,
  },
  customerInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
  },
  customerInfoValue: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
    textAlign: 'right',
  },
});
