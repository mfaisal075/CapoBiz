import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React, {useEffect, useState} from 'react';
import backgroundColors from '../Colors';
import {useUser} from '../CTX/UserContext';
import BASE_URL from '../BASE_URL';
import axios from 'axios';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';

interface OrderBooker {
  name: string;
  cnic: string;
  area: string;
  contact: string;
  email: string;
  pic: string;
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

interface AreaDropDown {
  id: string;
  area_name: string;
}

const OrderBookerDetails = ({navigation, route}: any) => {
  const {id} = route.params;
  const {token} = useUser();
  const [modalVisible, setModalVisible] = useState('');
  const [orderBooker, setOrderBooker] = useState<OrderBooker | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(initialEditForm);
  const [areaDropdown, setAreaDropdown] = useState<AreaDropDown[] | []>([]);
  const [areaOpen, setAreaOpen] = useState(false);
  const transformedAreas = areaDropdown.map(item => ({
    label: item.area_name,
    value: Number(item.id),
  }));

  const handleEditInputChange = (
    field: keyof EditForm,
    value: string | Array<string>,
  ) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch Order Booker Details
  const fetchObDetails = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/vieworderbooker?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOrderBooker(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete OrderBooker
  const handleDeleteOB = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/deleteorderbooker`, {
        id: id,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'OrderBooker has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setModalVisible('');
        navigation.navigate('Order Booker');
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

  // Get data to update
  const getEditData = async () => {
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

      setEditForm({
        name: booker.name || '',
        email: booker.email || '',
        contact: booker.contact || '',
        cnic: booker.cnic || '',
        areas: parsedAreas, // ✅ now numbers
      });
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

      formData.append('booker_id', id);
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
        setModalVisible('');
        fetchObDetails();
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

  useEffect(() => {
    handleFetchAreas();
    fetchObDetails();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Order Booker');
            }}>
            <Icon
              name="chevron-left"
              size={28}
              color={backgroundColors.light}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Booker Details</Text>
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
          <Text style={styles.custName}>{orderBooker?.name}</Text>
        </View>

        {/* Inner Details */}
        <View style={styles.innerDetails}>
          <View style={styles.innerHeader}>
            <Text style={styles.headerText}>Order Booker Details</Text>
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
              <Text style={styles.value}>{orderBooker?.name ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>CNIC</Text>
              <Text style={styles.value}>{orderBooker?.cnic ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{orderBooker?.email ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>{orderBooker?.contact ?? '--'}</Text>
            </View>
            <View style={[styles.detailsRow, {borderBottomWidth: 0}]}>
              <Text style={styles.label}>Area</Text>
              <Text style={styles.value}>{orderBooker?.area ?? '--'}</Text>
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
                onPress={handleDeleteOB}>
                <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/*Edit Modal*/}
      <Modal
        visible={modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.editOBModalOverlay}>
          <ScrollView style={styles.editOBModalContainer}>
            {/* Header */}
            <View style={styles.editOBHeader}>
              <Text style={styles.editOBTitle}>Edit Order Booker</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setEditForm(initialEditForm);
                }}
                style={styles.editOBCloseBtn}>
                <Icon name="close" size={20} color="#144272" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.editOBForm}>
              <View style={styles.editOBField}>
                <Text style={styles.editOBLabel}>Name *</Text>
                <TextInput
                  style={styles.editOBInput}
                  value={editForm.name}
                  onChangeText={t => handleEditInputChange('name', t)}
                />
              </View>
              <View style={styles.editOBField}>
                <Text style={styles.editOBLabel}>Email</Text>
                <TextInput
                  style={[styles.editOBInput, {backgroundColor: '#9e9e9e6a'}]}
                  value={editForm.email}
                  keyboardType="email-address"
                  editable={false}
                  onChangeText={t => handleEditInputChange('email', t)}
                />
              </View>

              <View style={styles.editOBField}>
                <Text style={styles.editOBLabel}>Contact</Text>
                <TextInput
                  style={styles.editOBInput}
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
              <View style={styles.editOBField}>
                <Text style={styles.editOBLabel}>CNIC</Text>
                <TextInput
                  style={styles.editOBInput}
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
              <View style={styles.editOBDropdownRow}>
                <Text style={styles.editOBLabel}>Order Booker Area</Text>
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
                  style={styles.editOBDropdown}
                  dropDownContainerStyle={styles.editOBDropdownContainer}
                  textStyle={styles.editOBDropdownText}
                  placeholderStyle={styles.editOBDropdownPlaceholder}
                  listMode="SCROLLVIEW"
                  ArrowUpIconComponent={() => (
                    <Icon name="chevron-up" size={18} color="#144272" />
                  )}
                  ArrowDownIconComponent={() => (
                    <Icon name="chevron-down" size={18} color="#144272" />
                  )}
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

              {/* Update Button */}
              <TouchableOpacity
                style={styles.editOBSubmitBtn}
                onPress={handleUpdateOB}>
                <Icon name="account-edit" size={20} color="white" />
                <Text style={styles.editOBSubmitText}>Update Order Booker</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Toast />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default OrderBookerDetails;

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

  // Edit Modal Styling
  editOBModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  editOBModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  editOBHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editOBTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.primary,
  },
  editOBCloseBtn: {
    padding: 5,
  },
  editOBForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  editOBField: {
    flex: 1,
    marginBottom: 5,
  },
  editOBLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 5,
  },
  editOBInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  editOBDropdownRow: {
    marginBottom: 15,
  },
  editOBDropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 42,
  },
  editOBDropdownContainer: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    maxHeight: 160,
  },
  editOBDropdownText: {
    color: '#333',
    fontSize: 14,
  },
  editOBDropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  editOBSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  editOBSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
