import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

interface BusinessDetails {
  id: number;
  bus_name: string;
  bus_name_ur: string;
  bus_contact1: string;
  bus_language: string;
  bus_email: string;
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

export default function BusinessVariables() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [busDetails, setBusDetails] = useState<BusinessDetails[]>([]);
  const [editBus, setEditBus] = useState<EditBusiness>(initialEditBusiness);
  const [modal, setModal] = useState('');
  const [selectedBus, setSelectedBus] = useState<number | null>(null);

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
      setBusDetails(res.data.comp);
    } catch (error) {
      console.log(error);
    }
  };

  // Pagination for Customer
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData = busDetails;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Fetch Business Details to Edit it
  const editBusiness = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editcomp?id=${id}&_token=${token}`,
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
        id: selectedBus,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted',
          text2: 'Company has been deleted successfully.',
          visibilityTime: 1500,
        });

        setSelectedBus(null);
        fetchBusinesses();
        setModal('');
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Business Variables</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}>
            <Icon name="plus" size={24} color="transparent" />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                  <View style={styles.headerTxtContainer}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {item.bus_name?.charAt(0) || 'B'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.productName}>{item.bus_name}</Text>
                    </View>
                  </View>
                  <View style={styles.actionContainer}>
                    <TouchableOpacity
                      style={styles.acctionBtn}
                      onPress={() => {
                        setModal('Edit');
                        editBusiness(item.id);
                      }}>
                      <Icon name="pencil" size={20} color={'#144272'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.acctionBtn}
                      onPress={() => {
                        setModal('Delete');
                      }}>
                      <Icon name="delete" size={20} color={'red'} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="translate"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Urdu Name</Text>
                    </View>
                    <Text style={styles.valueText}>{item.bus_name_ur}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="phone"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Contact</Text>
                    </View>
                    <Text style={styles.valueText}>{item.bus_contact1}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="mail"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Email</Text>
                    </View>
                    <Text style={styles.valueText}>{item.bus_email}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="alphabetical"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Language</Text>
                    </View>
                    <Text style={styles.valueText}>{item.bus_language}</Text>
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
                  <Text style={[styles.deleteModalBtnText, {color: '#144272'}]}>
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
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              <View style={styles.addCustomerForm}>
                {/* Name Row */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Name *</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter company name"
                      value={editBus.bus_name}
                      onChangeText={t => editOnChange('bus_name', t)}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Urdu Name</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter Urdu name"
                      value={editBus.bus_name_ur}
                      onChangeText={t => editOnChange('bus_name_ur', t)}
                    />
                  </View>
                </View>

                {/* Address Row */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Address *</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter address"
                      value={editBus.bus_address}
                      onChangeText={t => editOnChange('bus_address', t)}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Urdu Address</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="Enter Urdu address"
                      value={editBus.bus_address_ur}
                      onChangeText={t => editOnChange('bus_address_ur', t)}
                    />
                  </View>
                </View>

                {/* Contact 1 & 2 Row */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 1</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="0300-1234567"
                      keyboardType="phone-pad"
                      maxLength={12}
                      value={editBus.bus_contact1}
                      onChangeText={text => {
                        let cleaned = text.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        editOnChange('bus_contact1', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 2</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="0300-1234567"
                      keyboardType="phone-pad"
                      maxLength={12}
                      value={editBus.bus_contact2}
                      onChangeText={text => {
                        let cleaned = text.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        editOnChange('bus_contact2', cleaned);
                      }}
                    />
                  </View>
                </View>

                {/* Contact 3 & Email Row */}
                <View style={styles.addCustomerRow}>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Contact 3</Text>
                    <TextInput
                      style={styles.addCustomerInput}
                      placeholderTextColor="#999"
                      placeholder="0300-1234567"
                      keyboardType="phone-pad"
                      maxLength={12}
                      value={editBus.bus_contact3}
                      onChangeText={text => {
                        let cleaned = text.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        editOnChange('bus_contact3', cleaned);
                      }}
                    />
                  </View>
                  <View style={styles.addCustomerField}>
                    <Text style={styles.addCustomerLabel}>Business Email</Text>
                    <TextInput
                      style={[
                        styles.addCustomerInput,
                        {backgroundColor: '#f0f0f0'},
                      ]}
                      placeholderTextColor="#999"
                      placeholder="business@example.com"
                      value={editBus.bus_email}
                      editable={false}
                    />
                  </View>
                </View>

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

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
              onPress={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))
              }
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
  background: {
    flex: 1,
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

  // Flat List Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    zIndex: 1000,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  headerTxtContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
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
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#144272',
    flexWrap: 'wrap',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  acctionBtn: {
    padding: 8,
    backgroundColor: '#14417212',
    borderRadius: 8,
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 12,
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
    flex: 1,
  },
  infoIcon: {
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
    maxWidth: '50%',
    textAlign: 'right',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
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
});
