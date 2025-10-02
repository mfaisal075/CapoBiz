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
import {useUser} from '../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';

interface ShowSupplierData {
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
}

interface SupplierData {
  id: number;
  sup_name: string;
  sup_company_name: string;
  sup_agancy_name: string;
  sup_contact: string;
  area_name: string;
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

export default function SupplierPeople() {
  const {openDrawer} = useDrawer();
  const {token} = useUser();
  const [supplierData, setSupplierData] = useState<SupplierData[] | []>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [showSupplierData, setShowSupplierData] = useState<
    ShowSupplierData[] | []
  >([]);
  const [editForm, setEditForm] = useState<EditSupplier>(initialEditSupplier);
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
  const [viewModalArea, setViewModalArea] = useState<any>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = supplierData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = supplierData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const handleEditInputChange = (
    field: keyof EditSupplier,
    value: string | number,
  ) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddInputChange = (field: keyof AddSupplier, value: string) => {
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

  const [isModalV, setModalV] = useState(false);
  const tglModal = async (id: number) => {
    setSelectedSupplier(id);
    setModalV(!isModalV);
  };
  const [edit, setedit] = useState(false);

  const toggleedit = async (id: number) => {
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
      setedit(!edit);
      setSelectedSupplier(id);
      setAreaOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const [view, setview] = useState(false);

  const toggleview = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/suppliersshow?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = Array.isArray(res.data.supp)
        ? res.data.supp
        : [res.data.supp];

      setViewModalArea(res.data.area);
      setShowSupplierData(data);
      setview(!view);
    } catch (error) {
      console.log(error);
    }
  };

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
        setcustomer(false);
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

  // Delete Supplier
  const handleDeleteSupplier = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/supplierdelete`, {
        id: selectedSupplier,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Supplier has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setSelectedSupplier(null);
        setModalV(false);
        handleFetchData();
      }
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
        supp_id: selectedSupplier,
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
        setSelectedSupplier(null);
        setAreaOpen(false);
        setAreaValue('');
        handleFetchData();
        setedit(false);
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
    try {
      const res = await axios.get(`${BASE_URL}/fetchsuppliersdata`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSupplierData(res.data.supp);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleFetchData();
    handleFetchAreas();
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
            <Text style={styles.headerTitle}>Suppliers</Text>
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
                {/* Avatar + Name */}
                <View style={styles.headerRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.sup_name?.charAt(0) || 'S'}
                    </Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.sup_name}</Text>
                    <Text style={styles.subText}>
                      {item.sup_contact || 'N/A'}
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
                        size={20}
                        name="delete"
                        color={'#144272'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info Section */}
                {/* Info Section */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="office-building"
                        size={20}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Company</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.sup_company_name || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="briefcase"
                        size={20}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Agency</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.sup_agancy_name || 'N/A'}
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
                      <Text style={styles.labelText}>Area</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.area_name || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No suppliers found.
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 110}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Add Supplier Modal */}
        <Modal visible={customer} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              {/* Header */}
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Add New Supplier</Text>
                <TouchableOpacity
                  onPress={() => setcustomer(!customer)}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
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
                      color="#144272"
                      uncheckedColor="#144272"
                    />
                    <Text style={[styles.addCustomerLabel, {marginLeft: 8}]}>
                      Also a Customer
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Company + Agency */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Company Name *</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter company name"
                      value={addForm.comp_name}
                      onChangeText={text =>
                        handleAddInputChange('comp_name', text)
                      }
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Agency Name</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter agency name"
                      value={addForm.agencyname}
                      onChangeText={text =>
                        handleAddInputChange('agencyname', text)
                      }
                    />
                  </View>
                </View>

                {/* Supplier Name + Contact 1 */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Supplier Name *</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter supplier name"
                      value={addForm.supp_name}
                      onChangeText={text =>
                        handleAddInputChange('supp_name', text)
                      }
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Email</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="example@gmail.com"
                      value={addForm.email}
                      onChangeText={text => handleAddInputChange('email', text)}
                    />
                  </View>
                </View>

                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 1 *</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter contact"
                      keyboardType="phone-pad"
                      value={addForm.contact}
                      maxLength={12}
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
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 2</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter contact"
                      keyboardType="phone-pad"
                      value={addForm.sec_contact}
                      maxLength={12}
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
                </View>

                {/* Contact 2 + Contact 3 */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 3</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter contact"
                      keyboardType="phone-pad"
                      value={addForm.third_contact}
                      maxLength={12}
                      onChangeText={text => {
                        let cleaned = text.replace(/[^0-9-]/g, '');
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
                      placeholder="Enter address"
                      value={addForm.address}
                      onChangeText={text =>
                        handleAddInputChange('address', text)
                      }
                    />
                  </View>
                </View>

                {/* Address */}

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
                      dropDownContainerStyle={
                        styles.addCustomerDropdownContainer
                      }
                      textStyle={styles.addCustomerDropdownText}
                      placeholderStyle={styles.addCustomerDropdownPlaceholder}
                      listMode="SCROLLVIEW"
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
                        onChangeText={text =>
                          handleAddInputChange('opening_balance', text)
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
                        />
                      </View>
                    </View>

                    <View style={styles.addCustomerFullRow}>
                      <TextInput
                        style={styles.addCustomerInput}
                        placeholderTextColor="#999"
                        placeholder="Balance"
                        editable={enableBal.includes('on')}
                        value={addForm.opening_balance}
                        onChangeText={text =>
                          handleAddInputChange('opening_balance', text)
                        }
                      />
                    </View>
                  </>
                )}

                {/* Submit */}
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
                  onPress={handleDeleteSupplier}>
                  <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Supplier Modal */}
        <Modal visible={edit} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              {/* Header */}
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Edit Supplier</Text>
                <TouchableOpacity
                  onPress={() => {
                    setedit(!edit);
                    setEditForm(initialEditSupplier);
                    setAreaOpen(false);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              <View style={styles.addCustomerForm}>
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
                      color="#144272"
                      uncheckedColor="#144272"
                    />
                    <Text style={[styles.addCustomerLabel, {marginLeft: 8}]}>
                      Also a Customer
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Company + Agency */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Company Name *</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter company name"
                      value={editForm.sup_company_name}
                      onChangeText={text =>
                        handleEditInputChange('sup_company_name', text)
                      }
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Agency Name</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter agency name"
                      value={editForm.sup_agancy_name}
                      onChangeText={text =>
                        handleEditInputChange('sup_agancy_name', text)
                      }
                    />
                  </View>
                </View>

                {/* Name + Contact 1 */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Supplier Name *</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Supplier Name"
                      value={editForm.sup_name}
                      onChangeText={text =>
                        handleEditInputChange('sup_name', text)
                      }
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Email</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="supplier@example.com"
                      value={editForm.sup_email}
                      keyboardType="email-address"
                      onChangeText={text =>
                        handleEditInputChange('sup_email', text)
                      }
                    />
                  </View>
                </View>

                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter contact"
                      keyboardType="phone-pad"
                      value={editForm.sup_contact}
                      maxLength={12}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleEditInputChange('sup_contact', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 2</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter contact"
                      keyboardType="phone-pad"
                      value={editForm.sup_sec_contact}
                      maxLength={12}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleEditInputChange('sup_sec_contact', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Contact 2 + Contact 3 */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 3</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter contact"
                      keyboardType="phone-pad"
                      value={editForm.sup_third_contact}
                      maxLength={12}
                      onChangeText={text => {
                        let cleaned = text.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        handleEditInputChange('sup_third_contact', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Address</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter address"
                      value={editForm.sup_address}
                      onChangeText={text =>
                        handleEditInputChange('sup_address', text)
                      }
                    />
                  </View>
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
                      dropDownContainerStyle={
                        styles.addCustomerDropdownContainer
                      }
                      textStyle={styles.addCustomerDropdownText}
                      placeholderStyle={styles.addCustomerDropdownPlaceholder}
                      listMode="SCROLLVIEW"
                    />
                  </View>
                </View>

                {/* Submit */}
                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={handleUpdateSupplier}>
                  <Icon name="content-save-edit" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>
                    Update Supplier
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/* Supplier View Modal */}
        <Modal visible={view} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              {/* Header */}
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Supplier Details</Text>
                <TouchableOpacity
                  onPress={() => {
                    setview(!view);
                    setShowSupplierData([]);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {showSupplierData.length > 0 && (
                <View style={styles.customerDetailsWrapper}>
                  {/* Profile Image */}
                  <View style={styles.customerImageWrapper}>
                    {showSupplierData[0]?.sup_image ? (
                      <Image
                        source={{uri: showSupplierData[0]?.sup_image}}
                        style={styles.customerImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.customerNoImage}>
                        <Icon name="account" size={40} color="#999" />
                        <Text style={styles.customerNoImageText}>No Image</Text>
                      </View>
                    )}
                  </View>

                  {/* Info Fields */}
                  <View style={styles.customerInfoBox}>
                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Company Name</Text>
                      <Text style={styles.customerInfoValue}>
                        {showSupplierData[0]?.sup_company_name ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Agency Name</Text>
                      <Text style={styles.customerInfoValue}>
                        {showSupplierData[0]?.sup_agancy_name ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Supplier Name
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {showSupplierData[0]?.sup_name ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Contact 1</Text>
                      <Text style={styles.customerInfoValue}>
                        {showSupplierData[0]?.sup_contact ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Contact 2</Text>
                      <Text style={styles.customerInfoValue}>
                        {showSupplierData[0]?.sup_sec_contact ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Contact 3</Text>
                      <Text style={styles.customerInfoValue}>
                        {showSupplierData[0]?.sup_third_contact ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Email</Text>
                      <Text style={styles.customerInfoValue}>
                        {showSupplierData[0]?.sup_email ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Supplier Area
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewModalArea?.area_name ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Address</Text>
                      <Text style={styles.customerInfoValue}>
                        {showSupplierData[0]?.sup_address ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Opening Balance
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {showSupplierData[0]?.sup_opening_balance ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Payment Type</Text>
                      <Text style={styles.customerInfoValue}>
                        {showSupplierData[0]?.sup_payment_type ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Transaction Type
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {showSupplierData[0]?.sup_transaction_type ?? 'N/A'}
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

        <Toast />
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
  listContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
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

  //Vew Modal Styling
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
});
