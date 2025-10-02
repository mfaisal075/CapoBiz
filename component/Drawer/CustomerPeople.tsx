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
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

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

interface CustomersData {
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

export default function CustomerPeople() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [custData, setCustData] = useState<Customers[]>([]);
  const [selectedCust, setSelectedCust] = useState<CustomersData[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [addForm, setAddForm] = useState<AddCustomer>(initialAddCustomer);
  const [types, setTypes] = useState<TypeData[]>([]);
  const [areaData, setAreaData] = useState<AreaData[]>([]);
  const [enableBal, setEnableBal] = useState<string[]>([]);
  const [editForm, setEditForm] = useState<EditCustomer>(initialEditCustomer);
  const [modalVisible, setModalVisible] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = custData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = custData.slice(
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

  // Add Customer Form On Change
  const editOnChange = (field: keyof EditCustomer, value: string | number) => {
    setEditForm(prev => ({
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

  {
    /*edit*/
  }

  const toggleedit = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editcustomer?id=${id}&_token=${token}`,
      );
      setEditForm(res.data);
      setCurrentEdit(res.data.cust_type_id);
      setCustEditArea(res.data.cust_area_id);
      setModalVisible('Edit');
    } catch (error) {
      console.log(error);
    }
  };

  const [editType, setEditType] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<string | null>('');
  const [customereditArea, setcustomereditArea] = useState(false);
  const [custEditArea, setCustEditArea] = useState<string | null>('');

  // Fetch Customer
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcustomersdata`);
      setCustData(res.data.cust);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Customer
  const delCustomer = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/customerdelete`, {
        id: selectedCustomer,
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

        setSelectedCustomer(null);
        setModalVisible('');
        fetchCustomers();
      }
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

  // Edit Customer
  const editCustomer = async () => {
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
        cust_type: currentEdit,
        cust_area: custEditArea,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Customer record has been updated successfully',
          visibilityTime: 1500,
        });
        fetchCustomers();
        setEditForm(initialEditCustomer);
        setCurrentEdit('');
        setCustEditArea('');
        setModalVisible('');
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
    fetchCustomers();
    fetchType();
    fetchAreas();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1E3A8A', '#20B2AA']}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Customer</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible('Add')}
            style={[styles.headerBtn]}>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Avatar + Name */}
                <View style={styles.headerRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.cust_name?.charAt(0) || 'C'}
                    </Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.cust_name}</Text>
                    <Text style={styles.subText}>
                      {item.cust_contact || 'No contact'}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('View');
                        const fetchDetails = async (id: number) => {
                          try {
                            const res = await axios.get(
                              `${BASE_URL}/custshow?id=${id}&_token=${token}`,
                            );
                            setSelectedCust([res.data]);
                          } catch (error) {
                            console.log(error);
                          }
                        };
                        fetchDetails(item.id);
                      }}>
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

                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('Delete');
                        setSelectedCustomer(item.id);
                      }}>
                      <Icon
                        style={styles.actionIcon}
                        size={20}
                        name="delete"
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
                        name="mail"
                        size={20}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Email</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.cust_email || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="id-card"
                        size={20}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>CNIC</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.cust_cnic || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="map-marker"
                        size={20}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Address</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.cust_address || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No customers found.
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 100}}
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
                <View style={styles.addCustomerRow}>
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
                </View>

                <View style={styles.addCustomerRow}>
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
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        onChange('contact', cleaned);
                      }}
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
                </View>

                <View style={styles.addCustomerRow}>
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
                          cleaned =
                            cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                        if (cleaned.length > 13)
                          cleaned =
                            cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                        if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                        onChange('cnic', cleaned);
                      }}
                    />
                  </View>
                </View>

                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>
                      Contact Person 1
                    </Text>
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
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        onChange('sec_contact', cleaned);
                      }}
                    />
                  </View>
                </View>

                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>
                      Contact Person 2
                    </Text>
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
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        onChange('third_contact', cleaned);
                      }}
                    />
                  </View>
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

        {/*Delete*/}
        <Modal
          visible={modalVisible === 'Delete'}
          transparent
          animationType="fade">
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

        {/*Edit*/}
        <Modal
          visible={modalVisible === 'Edit'}
          transparent
          animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              {/* Header */}
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Edit Customer</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible('')}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.addCustomerForm}>
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Customer Name *</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholder="Enter customer name"
                      placeholderTextColor="#999"
                      value={editForm.cust_name}
                      onChangeText={t => editOnChange('cust_name', t)}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Father Name</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholder="Enter father name"
                      placeholderTextColor="#999"
                      value={editForm.cust_fathername}
                      onChangeText={t => editOnChange('cust_fathername', t)}
                    />
                  </View>
                </View>

                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Email</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholder="customer@example.com"
                      placeholderTextColor="#999"
                      value={editForm.cust_email}
                      keyboardType="email-address"
                      onChangeText={t => editOnChange('cust_email', t)}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Address</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholder="Enter address"
                      placeholderTextColor="#999"
                      value={editForm.cust_address}
                      onChangeText={t => editOnChange('cust_address', t)}
                    />
                  </View>
                </View>

                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholder="0300-1234567"
                      placeholderTextColor="#999"
                      value={editForm.cust_contact}
                      keyboardType="phone-pad"
                      maxLength={12}
                      onChangeText={t => {
                        let cleaned = t
                          .replace(/[^0-9-]/g, '')
                          .replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        editOnChange('cust_contact', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>CNIC</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholder="12345-1234567-1"
                      placeholderTextColor="#999"
                      value={editForm.cust_cnic}
                      keyboardType="numeric"
                      maxLength={15}
                      onChangeText={t => {
                        let cleaned = t
                          .replace(/[^0-9-]/g, '')
                          .replace(/-/g, '');
                        if (cleaned.length > 5)
                          cleaned =
                            cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                        if (cleaned.length > 13)
                          cleaned =
                            cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                        if (cleaned.length > 15) cleaned = cleaned.slice(0, 15);
                        editOnChange('cust_cnic', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Contact Persons */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>
                      Contact Person 1
                    </Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholder="Enter contact person"
                      placeholderTextColor="#999"
                      value={editForm.cust_contact_person_one}
                      keyboardType="phone-pad"
                      maxLength={12}
                      onChangeText={t => {
                        let cleaned = t
                          .replace(/[^0-9-]/g, '')
                          .replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        editOnChange('cust_contact_person_one', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>
                      Contact Person 2
                    </Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholder="Enter contact person"
                      placeholderTextColor="#999"
                      value={editForm.cust_contact_person_two}
                      keyboardType="phone-pad"
                      maxLength={12}
                      onChangeText={t => {
                        let cleaned = t
                          .replace(/[^0-9-]/g, '')
                          .replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        editOnChange('cust_contact_person_two', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Other Contacts */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 1</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholder="Alternative contact"
                      placeholderTextColor="#999"
                      value={editForm.cust_sec_contact}
                      keyboardType="phone-pad"
                      maxLength={12}
                      onChangeText={t => {
                        let cleaned = t
                          .replace(/[^0-9-]/g, '')
                          .replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        editOnChange('cust_sec_contact', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 2</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholder="Alternative contact"
                      placeholderTextColor="#999"
                      value={editForm.cust_third_contact}
                      keyboardType="phone-pad"
                      maxLength={12}
                      onChangeText={t => {
                        let cleaned = t
                          .replace(/[^0-9-]/g, '')
                          .replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        editOnChange('cust_third_contact', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Dropdowns */}
                <View style={styles.addCustomerDropdownRow}>
                  <View style={styles.addCustomerDropdownField}>
                    <Text style={styles.addCustomerLabel}>Customer Type</Text>
                    <DropDownPicker
                      items={transformedTypes}
                      open={editType}
                      setOpen={setEditType}
                      value={currentEdit}
                      setValue={setCurrentEdit}
                      placeholder="Select type"
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

                <View style={styles.addCustomerDropdownRow}>
                  <View style={styles.addCustomerDropdownField}>
                    <Text style={styles.addCustomerLabel}>Area</Text>
                    <DropDownPicker
                      items={transformedAreas}
                      open={customereditArea}
                      setOpen={setcustomereditArea}
                      value={custEditArea}
                      setValue={setCustEditArea}
                      placeholder="Select area"
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

                {/* Update Button */}
                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={editCustomer}>
                  <Icon name="account-edit" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>
                    Update Customer
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/* View Modal*/}
        <Modal
          visible={modalVisible === 'View'}
          transparent
          animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ScrollView contentContainerStyle={styles.modalContent}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>Customer Details</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible('');
                      setSelectedCust([]);
                    }}
                    style={styles.closeBtn}>
                    <Icon name="close" size={22} color="#144272" />
                  </TouchableOpacity>
                </View>

                {selectedCust.length > 0 && (
                  <View style={styles.customerDetailsWrapper}>
                    {/* Profile Image */}
                    <View style={styles.customerImageWrapper}>
                      {selectedCust[0].cust.cust_image ? (
                        <Image
                          source={{uri: selectedCust[0].cust.cust_image}}
                          style={styles.customerImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.customerNoImage}>
                          <Icon name="account" size={40} color="#bbb" />
                          <Text style={styles.customerNoImageText}>
                            No Image
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Info Fields */}
                    <View style={styles.modalInfoBox}>
                      {[
                        {
                          label: 'Customer Name',
                          value: selectedCust[0]?.cust.cust_name,
                        },
                        {
                          label: 'Father Name',
                          value: selectedCust[0]?.cust.cust_fathername,
                        },
                        {
                          label: 'Email',
                          value: selectedCust[0]?.cust.cust_email,
                        },
                        {
                          label: 'Customer Contact',
                          value: selectedCust[0]?.cust.cust_contact,
                        },
                        {
                          label: 'Contact Person 1',
                          value: selectedCust[0]?.cust?.cust_contact_person_one,
                        },
                        {
                          label: 'Contact Person 2',
                          value: selectedCust[0]?.cust?.cust_contact_person_two,
                        },
                        {
                          label: 'CNIC',
                          value: selectedCust[0]?.cust?.cust_cnic,
                        },
                        {
                          label: 'Address',
                          value: selectedCust[0]?.cust?.cust_address,
                        },
                        {
                          label: 'Area',
                          value: selectedCust[0]?.area?.area_name,
                        },
                        {
                          label: 'Type',
                          value: selectedCust[0]?.type?.custtyp_name,
                        },
                        {
                          label: 'Opening Balance',
                          value: selectedCust[0]?.cust?.cust_opening_balance,
                        },
                        {
                          label: 'Payment Type',
                          value: selectedCust[0]?.cust?.cust_payment_type,
                        },
                        {
                          label: 'Transaction Type',
                          value: selectedCust[0]?.cust?.cust_transaction_type,
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
                )}
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
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 4,
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
    backgroundColor: 'rgba(30, 58, 138, 1)',
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
    backgroundColor: '#20B2AA',
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
