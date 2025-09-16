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
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';

interface OrderBooker {
  id: number;
  name: string;
  cnic: string;
  contact: string;
  email: string;
}

interface ViewOrderBooker {
  name: string;
  cnic: string;
  area: string;
  contact: string;
  email: string;
  pic: string;
}

interface AreaDropDown {
  id: string;
  area_name: string;
}

interface EditForm {
  name: string;
  email: string;
  contact: string;
  cnic: string;
  areas: Array<string>;
}

const initialEditForm: EditForm = {
  name: '',
  email: '',
  contact: '',
  cnic: '',
  areas: [],
};

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

export default function OrderBookerPeople() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [orderBooker, setOrderBooker] = useState<OrderBooker[]>([]);
  const [viewOrderBooker, setViewOrderBooker] = useState<ViewOrderBooker[]>([]);
  const [areaDropdown, setAreaDropdown] = useState<AreaDropDown[] | []>([]);
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaValue, setAreaValue] = useState<string[] | null>(null);
  const transformedAreas = areaDropdown.map(item => ({
    label: item.area_name,
    value: Number(item.id),
  }));
  const [editForm, setEditForm] = useState<EditForm>(initialEditForm);
  const [selectedOB, setSelectedOB] = useState<number | null>(null);
  const [addForm, setAddForm] = useState<AddForm>(initialAddForm);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = orderBooker.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = orderBooker.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const handleEditInputChange = (
    field: keyof EditForm,
    value: string | Array<string>,
  ) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

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

  const [isModalV, setModalV] = useState(false);
  const tglModal = (id: number) => {
    setSelectedOB(id);
    setModalV(!isModalV);
  };

  {
    /*edit*/
  }
  const [edit, setedit] = useState(false);

  const toggleedit = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editorderbooker?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const booker = res.data;

      // Convert "3,2" → [3, 2]
      const parsedAreas = booker.area
        ? booker.area.split(',').map((a: string) => Number(a.trim()))
        : [];

      setedit(true);
      setEditForm({
        name: booker.name || '',
        email: booker.email || '',
        contact: booker.contact1 || '',
        cnic: booker.cnic || '',
        areas: parsedAreas, // ✅ now numbers
      });

      setSelectedOB(id);
    } catch (error) {
      console.log(error);
    }
  };

  const [view, setview] = useState(false);

  // View Modal
  const toggleview = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/vieworderbooker?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = Array.isArray(res.data) ? res.data : [res.data];
      setViewOrderBooker(data);
      setview(!view);
    } catch (error) {
      console.log(error);
    }
    setview(!view);
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

  // Delete OrderBooker
  const handleDeleteOB = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/deleteorderbooker`, {
        id: selectedOB,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'OrderBooker has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setSelectedOB(null);
        handleFetchData();
        setModalV(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update OrderBooker
  const handleUpdateOB = async () => {
    const nameRegex = /^[A-Za-z ]+$/;

    if (!editForm.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all fields and select an area before updating.',
        visibilityTime: 1500,
      });
      return;
    }

    if (!nameRegex.test(editForm.name.trim())) {
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

      formData.append('booker_id', selectedOB);
      formData.append('name', editForm.name.trim());
      formData.append('cnic', editForm.cnic);
      formData.append('contact1', editForm.contact);
      formData.append('email', editForm.email);

      if (Array.isArray(editForm.areas) && editForm.areas.length > 0) {
        editForm.areas.forEach(areaId => {
          formData.append('areas[]', areaId);
        });
      }

      console.log('Areas: ', formData);

      const res = await axios.post(`${BASE_URL}/updateorderbooker`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'OrderBooker has been Updated successfully!',
          visibilityTime: 2000,
        });

        setEditForm(initialEditForm);
        setSelectedOB(null);
        handleFetchData();
        setedit(false);
      } else if (res.status === 200 && data.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Email Already Exist!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 203) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'CNIC Already Exist!',
          visibilityTime: 2000,
        });
      }
    } catch (error: any) {
      console.log('Update error:', error.response?.data || error.message);
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

      setOrderBooker(res.data.orderbooker);
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
            <Text style={styles.headerTitle}>Order Booker</Text>
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
                      {item.name?.charAt(0) || 'U'}
                    </Text>
                  </View>

                  {/* Name + Contact */}
                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.subText}>
                      {item.contact || 'No contact'}
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
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <Icon
                      name="phone"
                      size={20}
                      color={'#144272'}
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>{item.contact || '--'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Icon
                      name="id-card"
                      size={20}
                      color={'#144272'}
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>{item.cnic || '--'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Icon
                      name="mail"
                      size={20}
                      color={'#144272'}
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>{item.email || '--'}</Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No record present in the database!
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 110}}
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
                <View style={styles.addOBRow}>
                  <View style={styles.addOBField}>
                    <Text style={styles.addOBLabel}>Name *</Text>
                    <TextInput
                      style={styles.addOBInput}
                      placeholder="Enter name"
                      placeholderTextColor="#999"
                      value={addForm.name}
                      onChangeText={t => handleAddInputChange('name', t)}
                    />
                  </View>
                  <View style={styles.addOBField}>
                    <Text style={styles.addOBLabel}>Email</Text>
                    <TextInput
                      style={styles.addOBInput}
                      placeholder="Enter email"
                      placeholderTextColor="#999"
                      value={addForm.email}
                      onChangeText={t => handleAddInputChange('email', t)}
                    />
                  </View>
                </View>

                {/* Contact + CNIC */}
                <View style={styles.addOBRow}>
                  <View style={styles.addOBField}>
                    <Text style={styles.addOBLabel}>Contact</Text>
                    <TextInput
                      style={styles.addOBInput}
                      placeholder="0300-1234567"
                      placeholderTextColor="#999"
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
                      placeholder="12345-1234567-1"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      maxLength={15}
                      value={addForm.cnic}
                      onChangeText={t => handleAddInputChange('cnic', t)}
                    />
                  </View>
                </View>

                {/* Passwords */}
                <View style={styles.addOBRow}>
                  <View style={styles.addOBField}>
                    <Text style={styles.addOBLabel}>Password</Text>
                    <TextInput
                      style={styles.addOBInput}
                      placeholder="Enter password"
                      placeholderTextColor="#999"
                      secureTextEntry
                      value={addForm.password}
                      onChangeText={t => handleAddInputChange('password', t)}
                    />
                  </View>
                  <View style={styles.addOBField}>
                    <Text style={styles.addOBLabel}>Confirm Password</Text>
                    <TextInput
                      style={styles.addOBInput}
                      placeholder="Re-enter password"
                      placeholderTextColor="#999"
                      secureTextEntry
                      value={addForm.confirmPassword}
                      onChangeText={t =>
                        handleAddInputChange('confirmPassword', t)
                      }
                    />
                  </View>
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
                    placeholder="Select order booker area"
                    style={styles.addOBDropdown}
                    dropDownContainerStyle={styles.addOBDropdownContainer}
                    textStyle={styles.addOBDropdownText}
                    placeholderStyle={styles.addOBDropdownPlaceholder}
                    listMode="SCROLLVIEW"
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

        {/*Delete*/}
        <Modal visible={isModalV} transparent animationType="fade">
          <View style={styles.addOBModalOverlay}>
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
                  onPress={handleDeleteOB}>
                  <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/*Edit*/}
        <Modal visible={edit} transparent animationType="slide">
          <View style={styles.addOBModalOverlay}>
            <ScrollView style={styles.addOBModalContainer}>
              {/* Header */}
              <View style={styles.addOBHeader}>
                <Text style={styles.addOBTitle}>Edit Order Booker</Text>
                <TouchableOpacity
                  onPress={() => {
                    setedit(!edit);
                    setEditForm(initialEditForm);
                    setSelectedOB(null);
                  }}
                  style={styles.addOBCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.addOBForm}>
                <View style={styles.addOBRow}>
                  <View style={styles.addOBField}>
                    <Text style={styles.addOBLabel}>Name *</Text>
                    <TextInput
                      style={styles.addOBInput}
                      placeholder="Enter name"
                      placeholderTextColor="#999"
                      value={editForm.name}
                      onChangeText={t => handleEditInputChange('name', t)}
                    />
                  </View>
                  <View style={styles.addOBField}>
                    <Text style={styles.addOBLabel}>Email</Text>
                    <TextInput
                      style={styles.addOBInput}
                      placeholder="orderbooker@example.com"
                      placeholderTextColor="#999"
                      value={editForm.email}
                      keyboardType="email-address"
                      disableFullscreenUI
                      onChangeText={t => handleEditInputChange('email', t)}
                    />
                  </View>
                </View>

                <View style={styles.addOBRow}>
                  <View style={styles.addOBField}>
                    <Text style={styles.addOBLabel}>Contact</Text>
                    <TextInput
                      style={styles.addOBInput}
                      placeholder="0300-1234567"
                      placeholderTextColor="#999"
                      value={editForm.contact}
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
                        handleEditInputChange('contact', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addOBField}>
                    <Text style={styles.addOBLabel}>CNIC</Text>
                    <TextInput
                      style={styles.addOBInput}
                      placeholder="12345-1234567-1"
                      placeholderTextColor="#999"
                      value={editForm.cnic}
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
                        handleEditInputChange('cnic', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Dropdown for Area */}
                <View style={styles.addOBDropdownRow}>
                  <Text style={styles.addOBLabel}>Order Booker Area</Text>
                  <DropDownPicker
                    items={transformedAreas}
                    open={areaOpen}
                    setOpen={setAreaOpen}
                    value={editForm.areas} // e.g. [3, 2]
                    setValue={callback => {
                      const newVal = callback(editForm.areas || []);
                      handleEditInputChange('areas', newVal || []);
                    }}
                    multiple={true}
                    mode="BADGE"
                    badgeDotColors={['green']}
                    placeholder="Select area"
                    style={styles.addOBDropdown}
                    dropDownContainerStyle={styles.addOBDropdownContainer}
                    textStyle={styles.addOBDropdownText}
                    placeholderStyle={styles.addOBDropdownPlaceholder}
                    listMode="SCROLLVIEW"
                    ArrowUpIconComponent={() => (
                      <Icon name="chevron-up" size={18} color="#144272" />
                    )}
                    ArrowDownIconComponent={() => (
                      <Icon name="chevron-down" size={18} color="#144272" />
                    )}
                  />
                </View>

                {/* Update Button */}
                <TouchableOpacity
                  style={styles.addOBSubmitBtn}
                  onPress={handleUpdateOB}>
                  <Icon name="account-edit" size={20} color="white" />
                  <Text style={styles.addOBSubmitText}>
                    Update Order Booker
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/* View Order Booker Modal */}
        <Modal visible={view} transparent animationType="slide">
          <View style={styles.addOBModalOverlay}>
            <ScrollView style={styles.addOBModalContainer}>
              {/* Header */}
              <View style={styles.addOBHeader}>
                <Text style={styles.addOBTitle}>Order Booker Details</Text>
                <TouchableOpacity
                  onPress={() => {
                    setview(false);
                    setSelectedOB(null);
                  }}
                  style={styles.addOBCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {viewOrderBooker.length > 0 && (
                <View style={styles.orderBookerDetailsWrapper}>
                  {/* Profile Image */}
                  <View style={styles.orderBookerImageWrapper}>
                    {viewOrderBooker[0]?.pic ? (
                      <Image
                        source={{uri: viewOrderBooker[0].pic}}
                        style={styles.orderBookerImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.orderBookerNoImage}>
                        <Icon name="account" size={40} color="#999" />
                        <Text style={styles.orderBookerNoImageText}>
                          No Image
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Info Fields */}
                  <View style={styles.orderBookerInfoBox}>
                    <View style={styles.orderBookerInfoRow}>
                      <Text style={styles.orderBookerInfoLabel}>Name</Text>
                      <Text style={styles.orderBookerInfoValue}>
                        {viewOrderBooker[0]?.name ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.orderBookerInfoRow}>
                      <Text style={styles.orderBookerInfoLabel}>Email</Text>
                      <Text style={styles.orderBookerInfoValue}>
                        {viewOrderBooker[0]?.email ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.orderBookerInfoRow}>
                      <Text style={styles.orderBookerInfoLabel}>Contact</Text>
                      <Text style={styles.orderBookerInfoValue}>
                        {viewOrderBooker[0]?.contact ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.orderBookerInfoRow}>
                      <Text style={styles.orderBookerInfoLabel}>CNIC</Text>
                      <Text style={styles.orderBookerInfoValue}>
                        {viewOrderBooker[0]?.cnic ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.orderBookerInfoRow}>
                      <Text style={styles.orderBookerInfoLabel}>Area</Text>
                      <Text style={styles.orderBookerInfoValue}>
                        {viewOrderBooker[0]?.area ?? 'N/A'}
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    width: 18,
    height: 18,
    tintColor: '#144272',
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    color: '#333',
    fontSize: 13,
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
    color: '#144272',
  },
  addOBCloseBtn: {
    padding: 5,
  },
  addOBForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  addOBRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  addOBField: {
    flex: 1,
    marginHorizontal: 5,
  },
  addOBLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
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
    backgroundColor: '#144272',
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
  orderBookerDetailsWrapper: {
    padding: 20,
    alignItems: 'center',
  },
  orderBookerImageWrapper: {
    marginBottom: 20,
  },
  orderBookerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#144272',
  },
  orderBookerNoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  orderBookerNoImageText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  orderBookerInfoBox: {
    width: '100%',
    marginTop: 10,
  },
  orderBookerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 6,
  },
  orderBookerInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
  },
  orderBookerInfoValue: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
    textAlign: 'right',
  },
});
