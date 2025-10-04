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
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../Colors';
import {Avatar} from 'react-native-paper';

interface OrderBooker {
  id: number;
  name: string;
  cnic: string;
  contact: string;
  email: string;
  area: string;
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

interface Areas {
  id: number;
  area_name: string;
}

export default function OrderBookerPeople() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [orderBooker, setOrderBooker] = useState<OrderBooker[]>([]);
  const [viewOrderBooker, setViewOrderBooker] =
    useState<ViewOrderBooker | null>(null);
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
  const [areas, setAreas] = useState<Areas[]>([]);

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

      setViewOrderBooker(res.data);
      setview(!view);
    } catch (error) {
      console.log(error);
    }
    setview(!view);
  };

  // Fetch Areas
  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchareas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAreas(res.data.area);
    } catch (error) {
      console.log(error);
    }
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
    fetchAreas();
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
            <Text style={styles.headerTitle}>Order Booker</Text>
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
                      {item.name?.charAt(0) || 'OB'}
                    </Text>
                  </View>

                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.name}</Text>
                    {/* small details inline */}
                    <Text style={styles.subText}>
                      <Icon name="phone" size={12} color="#666" />{' '}
                      {item.contact || 'No contact'}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="mail" size={12} color="#666" />{' '}
                      {item.email || 'N/A'}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="map-marker" size={12} color="#666" />{' '}
                      {(() => {
                        const areaObj = areas.find(
                          a => a.id === Number(item.area),
                        );
                        return areaObj ? areaObj.area_name : 'N/A';
                      })()}
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
                <View style={styles.addOBField}>
                  <Text style={styles.addOBLabel}>Name *</Text>
                  <TextInput
                    style={styles.addOBInput}
                    value={editForm.name}
                    onChangeText={t => handleEditInputChange('name', t)}
                  />
                </View>
                <View style={styles.addOBField}>
                  <Text style={styles.addOBLabel}>Email</Text>
                  <TextInput
                    style={[styles.addOBInput, {backgroundColor: '#9e9e9e6a'}]}
                    value={editForm.email}
                    keyboardType="email-address"
                    editable={false}
                    onChangeText={t => handleEditInputChange('email', t)}
                  />
                </View>

                <View style={styles.addOBField}>
                  <Text style={styles.addOBLabel}>Contact</Text>
                  <TextInput
                    style={styles.addOBInput}
                    value={editForm.contact}
                    keyboardType="phone-pad"
                    maxLength={12}
                    onChangeText={t => {
                      let cleaned = t.replace(/[^0-9-]/g, '').replace(/-/g, '');
                      if (cleaned.length > 4)
                        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                      if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                      handleEditInputChange('contact', cleaned);
                    }}
                  />
                </View>
                <View style={styles.addOBField}>
                  <Text style={styles.addOBLabel}>CNIC</Text>
                  <TextInput
                    style={styles.addOBInput}
                    value={editForm.cnic}
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
                      handleEditInputChange('cnic', cleaned);
                    }}
                  />
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ScrollView contentContainerStyle={styles.modalContent}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>Customer Details</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setview(false);
                    }}
                    style={styles.closeBtn}>
                    <Icon name="close" size={22} color="#144272" />
                  </TouchableOpacity>
                </View>

                <View style={styles.customerDetailsWrapper}>
                  {/* Profile Image */}
                  <View style={styles.customerImageWrapper}>
                    {viewOrderBooker?.pic ? (
                      <Avatar.Image
                        size={110}
                        source={{uri: viewOrderBooker.pic}}
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
                        label: 'Name',
                        value: viewOrderBooker?.name,
                      },
                      {
                        label: 'Email',
                        value: viewOrderBooker?.email,
                      },
                      {
                        label: 'Contact',
                        value: viewOrderBooker?.contact,
                      },
                      {
                        label: 'CNIC',
                        value: viewOrderBooker?.cnic,
                      },
                      {
                        label: 'Area',
                        value: `${
                          areas.find(
                            area =>
                              area.id.toString() === viewOrderBooker?.area,
                          )?.area_name
                        }`,
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
  addOBField: {
    flex: 1,
    marginBottom: 5,
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
