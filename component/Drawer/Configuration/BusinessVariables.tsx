import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import backgroundColors from '../../Colors';

interface BusinessDetails {
  id: number;
  bus_name: string;
  bus_name_ur: string;
  bus_contact1: string;
  bus_language: string;
  bus_email: string;
  bus_address: string;
  bus_address_ur: string;
  bus_contact2: string;
  bus_contact3: string;
}

interface EditBusiness {
  id: number;
  bus_name: string;
  bus_name_ur: string;
  bus_address: string;
  bus_address_ur: string;
  bus_contact1: string;
  bus_contact2: string;
  bus_contact3: string;
  bus_email: string;
}

const initialEditBusiness: EditBusiness = {
  id: 0,
  bus_address: '',
  bus_address_ur: '',
  bus_contact1: '',
  bus_contact2: '',
  bus_contact3: '',
  bus_email: '',
  bus_name: '',
  bus_name_ur: '',
};

interface AddBussiness {
  name: string;
  urName: string;
  add: string;
  urAddress: string;
  contact1: string;
  contact2: string;
  contact3: string;
  busEmail: string;
}

const initialAddBusiness: AddBussiness = {
  add: '',
  busEmail: '',
  contact1: '',
  contact2: '',
  contact3: '',
  name: '',
  urAddress: '',
  urName: '',
};

export default function BusinessVariables() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [busDetails, setBusDetails] = useState<BusinessDetails | null>(null);
  const [editBus, setEditBus] = useState<EditBusiness>(initialEditBusiness);
  const [modal, setModal] = useState('');
  const [addForm, setAddForm] = useState(initialAddBusiness);

  // Add OnChange
  const onChange = (field: keyof AddBussiness, value: string) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Edit OnChange
  const editOnChange = (field: keyof EditBusiness, value: string) => {
    setEditBus(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcomp`);
      const comp = Array.isArray(res.data.comp)
        ? res.data.comp[0]
        : res.data.comp;
      setBusDetails(comp ?? null);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Business Details to Edit it
  const editBusiness = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editcomp?id=${busDetails?.id}&_token=${token}`,
      );
      setEditBus({
        id: res.data.id,
        bus_address: res.data.bus_address,
        bus_address_ur: res.data.bus_address_ur,
        bus_contact1: res.data.bus_contact1,
        bus_contact2: res.data.bus_contact2,
        bus_contact3: res.data.bus_contact3,
        bus_email: res.data.bus_email,
        bus_name: res.data.bus_name,
        bus_name_ur: res.data.bus_name_ur,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Update Business Details
  const updateBusiness = async () => {
    if (
      !editBus.bus_name.trim() ||
      !editBus.bus_name_ur.trim() ||
      !editBus.bus_address.trim() ||
      !editBus.bus_contact1.trim()
    ) {
      Toast.show({
        type: 'error',
        text1: 'Please fill all required fields.',
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/updatecomp`,
        {
          comp_id: editBus.id,
          comp_name: editBus.bus_name,
          comp_urdu_name: editBus.bus_name_ur,
          comp_address: editBus.bus_address,
          comp_urdu_address: editBus.bus_address_ur,
          comp_cont1: editBus.bus_contact1,
          comp_cont2: editBus.bus_contact2,
          comp_cont3: editBus.bus_contact3,
          comp_email: editBus.bus_email,
          logo: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = res.data;
      console.log('Response:', res.status, res.data);

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Company has been updated successfully',
          visibilityTime: 1500,
        });

        setEditBus(initialEditBusiness);
        setModal('');
        fetchBusinesses();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update failed!',
          text2: res.data?.message || 'Unexpected response',
        });
      }
    } catch (error: any) {
      console.log('Update error:', error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: error.response?.data?.message || 'Something went wrong',
      });
    }
  };

  // Delete Business Details
  const delBusiness = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/compdelete`, {
        id: busDetails?.id,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted',
          text2: 'Company has been deleted successfully.',
          visibilityTime: 1500,
        });

        fetchBusinesses();
        setModal('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Add Busniess
  const addComp = async () => {
    if (
      !addForm.name.trim() ||
      !addForm.urName.trim() ||
      !addForm.add.trim() ||
      !addForm.contact1.trim()
    ) {
      Toast.show({
        type: 'error',
        text1: 'Required fields missing',
        text2: 'Please fill all required fields marked with *',
        visibilityTime: 2500,
      });
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (addForm.busEmail && !emailPattern.test(addForm.busEmail)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
        visibilityTime: 2500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/addcomp`, {
        comp_name: addForm.name,
        comp_urdu_name: addForm.urName,
        comp_address: addForm.add,
        comp_urdu_address: addForm.urAddress,
        comp_cont1: addForm.contact1,
        comp_con2: addForm.contact2,
        comp_con3: addForm.contact3,
        comp_email: addForm.busEmail,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Addedd!',
          text2: 'Bussiness details has been added successfully',
          visibilityTime: 2500,
        });

        setAddForm(initialAddBusiness);
        setModal('');
        fetchBusinesses();
      } else if (res.status === 200 && data.status === 404) {
        Toast.show({
          type: 'info',
          text1: 'Warning!',
          text2: 'This email  already exist!',
          visibilityTime: 2500,
        });
      } else if (res.status === 200 && data.status === 405) {
        Toast.show({
          type: 'info',
          text1: 'Warning!',
          text2: 'This Company Name already exist already exist!',
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Business Variables</Text>
          </View>

          {busDetails === null && (
            <TouchableOpacity
              style={[styles.headerBtn]}
              onPress={() => setModal('Add')}>
              <Icon name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Details Section */}
        {busDetails === null ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Icon
              name="folder-open-outline"
              size={100}
              color={'#999'}
              style={{marginBottom: 20}}
            />
            <Text
              style={{
                fontSize: 18,
                color: backgroundColors.dark,
                fontWeight: '600',
              }}>
              No Business Details Found
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#666',
                marginTop: 8,
                textAlign: 'center',
              }}>
              Add your first business by clicking the plus button above
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.detailsContainer}
            showsVerticalScrollIndicator={false}>
            {/* Inner Details */}
            <View style={styles.innerDetails}>
              <View style={styles.innerHeader}>
                <Text style={styles.headerText}>Business Details</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity
                    onPress={() => {
                      editBusiness();
                      setModal('Edit');
                    }}>
                    <Icon
                      name="square-edit-outline"
                      size={24}
                      color={backgroundColors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.headerBtn]}
                    onPress={() => setModal('Delete')}>
                    <Icon
                      name="delete"
                      size={24}
                      color={backgroundColors.danger}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Details */}
              <View style={styles.detailsView}>
                <View style={styles.detailsRow}>
                  <Text style={styles.label}>Name</Text>
                  <Text style={styles.value}>
                    {busDetails?.bus_name ?? '--'}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.label}>Urdu Name</Text>
                  <Text style={styles.value}>
                    {busDetails?.bus_name_ur ?? '--'}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.label}>Address</Text>
                  <Text style={styles.value}>
                    {busDetails?.bus_address ?? '--'}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.label}>Urdu Address</Text>
                  <Text style={styles.value}>
                    {busDetails?.bus_address_ur ?? '--'}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.label}>Contact 1</Text>
                  <Text style={styles.value}>
                    {busDetails?.bus_contact1 ?? '--'}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.label}>Contact 2</Text>
                  <Text style={styles.value}>
                    {busDetails?.bus_contact2 ?? '--'}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.label}>Contact 3</Text>
                  <Text style={styles.value}>
                    {busDetails?.bus_contact3 ?? '--'}
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.label}>Business Email</Text>
                  <Text style={styles.value}>
                    {busDetails?.bus_email ?? '--'}
                  </Text>
                </View>
                <View style={[styles.detailsRow, {borderBottomWidth: 0}]}>
                  <Text style={styles.label}>Business Language</Text>
                  <Text style={styles.value}>
                    {busDetails?.bus_language ?? '--'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Delete Modal */}
        <Modal visible={modal === 'Delete'} transparent animationType="fade">
          <View style={styles.addCustomerModalOverlay}>
            <View style={styles.deleteModalContainer}>
              <View style={styles.delAnim}>
                <LottieView
                  style={{flex: 1}}
                  source={require('../../../assets/warning.json')}
                  autoPlay
                  loop={false}
                />
              </View>

              <Text style={styles.deleteModalTitle}>Are you sure?</Text>
              <Text style={styles.deleteModalMessage}>
                You won't be able to revert this record!
              </Text>

              <View style={styles.deleteModalActions}>
                <TouchableOpacity
                  style={[styles.deleteModalBtn, {backgroundColor: '#e0e0e0'}]}
                  onPress={() => {
                    setModal('');
                  }}>
                  <Text
                    style={[
                      styles.deleteModalBtnText,
                      {color: backgroundColors.dark},
                    ]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteModalBtn, {backgroundColor: '#d9534f'}]}
                  onPress={delBusiness}>
                  <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Modal */}
        <Modal visible={modal === 'Edit'} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Update Company</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModal('');
                    setEditBus(initialEditBusiness);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color={backgroundColors.dark} />
                </TouchableOpacity>
              </View>

              <View style={styles.addCustomerForm}>
                {/* Name Row */}
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#888"
                  placeholder="Name *"
                  value={editBus.bus_name}
                  onChangeText={t => editOnChange('bus_name', t)}
                />
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#888"
                  placeholder="Urdu Name *"
                  value={editBus.bus_name_ur}
                  onChangeText={t => editOnChange('bus_name_ur', t)}
                />

                {/* Address Row */}
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#888"
                  placeholder="Address *"
                  value={editBus.bus_address}
                  onChangeText={t => editOnChange('bus_address', t)}
                />
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Urdu Address"
                  value={editBus.bus_address_ur}
                  onChangeText={t => editOnChange('bus_address_ur', t)}
                />

                {/* Contact 1 & 2 Row */}
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Contact 1 *"
                  keyboardType="phone-pad"
                  maxLength={12}
                  value={editBus.bus_contact1}
                  onChangeText={text => {
                    let cleaned = text.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnChange('bus_contact1', cleaned);
                  }}
                />
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Contact 2 *"
                  keyboardType="phone-pad"
                  maxLength={12}
                  value={editBus.bus_contact2}
                  onChangeText={text => {
                    let cleaned = text.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnChange('bus_contact2', cleaned);
                  }}
                />

                {/* Contact 3 & Email Row */}
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Contact 2 *"
                  keyboardType="phone-pad"
                  maxLength={12}
                  value={editBus.bus_contact3}
                  onChangeText={text => {
                    let cleaned = text.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    editOnChange('bus_contact3', cleaned);
                  }}
                />
                <TextInput
                  style={[
                    styles.addCustomerInput,
                    {backgroundColor: '#f0f0f0'},
                  ]}
                  placeholderTextColor="#999"
                  placeholder="Business Email"
                  value={editBus.bus_email}
                  editable={false}
                />

                {/* Update Button */}
                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={updateBusiness}>
                  <Icon name="office-building" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>
                    Update Company
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/* Add Business Modal */}
        <Modal visible={modal === 'Add'} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Add Company</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModal('');
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color={backgroundColors.dark} />
                </TouchableOpacity>
              </View>

              <View style={styles.addCustomerForm}>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#888"
                  placeholder="Name *"
                  value={addForm.name}
                  onChangeText={t => onChange('name', t)}
                />
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#888"
                  placeholder="Urdu Name *"
                  value={addForm.urName}
                  onChangeText={t => onChange('urName', t)}
                />

                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#888"
                  placeholder="Address *"
                  value={addForm.add}
                  onChangeText={t => onChange('add', t)}
                />
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#888"
                  placeholder="Urdu Address"
                  value={addForm.urAddress}
                  onChangeText={t => onChange('urAddress', t)}
                />

                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#888"
                  placeholder="Contact 1 *"
                  value={addForm.contact1}
                  maxLength={11}
                  keyboardType="number-pad"
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    onChange('contact1', cleaned);
                  }}
                />
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#888"
                  placeholder="Contact 2"
                  value={addForm.contact2}
                  maxLength={11}
                  keyboardType="number-pad"
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    onChange('contact2', cleaned);
                  }}
                />
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#888"
                  placeholder="Contact 3"
                  value={addForm.contact3}
                  maxLength={11}
                  keyboardType='number-pad'
                  onChangeText={t => {
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    cleaned = cleaned.replace(/-/g, '');
                    if (cleaned.length > 4)
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                    onChange('contact3', cleaned);
                  }}
                />
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#888"
                  placeholder="Business Email"
                  value={addForm.busEmail}
                  onChangeText={t => onChange('busEmail', t)}
                />

                {/* Add Button */}
                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={addComp}>
                  <Icon name="office-building" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>Add Company</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>
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

  // Details container
  detailsContainer: {
    flex: 1,
    paddingHorizontal: '3%',
  },

  // Inner Details
  innerDetails: {
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 30,
    marginTop: 10,
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

  // Pagination Styling
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
    paddingVertical: 8,
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
    alignItems: 'center',
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

  // Add Customer Modal Styles
  addCustomerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  addCustomerModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '80%',
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
    color: backgroundColors.dark,
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
  addCustomerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 5,
  },
  addCustomerInput: {
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
    color: backgroundColors.dark,
    marginBottom: 8,
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
    backgroundColor: backgroundColors.primary,
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
});
