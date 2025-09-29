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
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

interface Types {
  id: number;
  custtyp_name: string;
  custtyp_status: string;
}

export default function CustomerType() {
  const {openDrawer} = useDrawer();
  const [type, setType] = useState('');
  const {token} = useUser();
  const [types, setTypes] = useState<Types[] | []>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [editType, setEditType] = useState<string | ''>('');

  const [customer, setcustomer] = useState(false);

  const togglecustomer = () => {
    setcustomer(!customer);
  };

  const [isModalV, setModalV] = useState(false);

  {
    /*edit*/
  }
  const [edit, setedit] = useState(false);

  const toggleEdit = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/edittype?id=${id}&_token=${token}`,
      );

      setSelectedType(id);
      setEditType(res.data.custtyp_name);
      setedit(!edit);
    } catch (error) {
      console.log(error);
    }
  };

  // Pagination for Customer
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData = types;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Delete Type
  const handleDeleteType = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/typedelete`, {
        id: selectedType,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Type has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setModalV(false);
        setSelectedType(null);
        handleGetTypes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update Type
  const handleUpdateType = async () => {
    if (!editType) {
      Toast.show({
        type: 'error',
        text1: 'Missing Field',
        text2: 'Please fill out type field.',
        autoHide: true,
        visibilityTime: 2500,
      });
      return;
    }

    const specialCharRegex = /[^a-zA-Z0-9 _-]/;
    if (specialCharRegex.test(editType)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Type Name',
        text2: 'Special characters are not allowed in the type name.',
        autoHide: true,
        visibilityTime: 1500,
      });
      return;
    }

    try {
      // Check Uniqueness
      const reschk = await axios.post(`${BASE_URL}/uniquetype`, {
        type: editType.trim(),
      });

      const check = reschk.data;

      if (reschk.status === 200 && check.status === 'non-unique') {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This type already exists!',
          visibilityTime: 2000,
        });
        return;
      }

      const res = await axios.post(`${BASE_URL}/updatetype`, {
        type_id: selectedType,
        custtyp_name: editType,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Type has been Updated successfully!',
          visibilityTime: 1500,
        });
        setedit(!edit);
        setEditType('');
        setSelectedType(null);
        handleGetTypes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Add Type function
  const handleAddType = async () => {
    if (!type) {
      Toast.show({
        type: 'error',
        text1: 'Missing Field',
        text2: 'Please fill out type field.',
        autoHide: true,
        visibilityTime: 2500,
      });
      return;
    }

    const specialCharRegex = /[^a-zA-Z0-9 _-]/;
    if (specialCharRegex.test(type)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Type Name',
        text2: 'Special characters are not allowed in the type name.',
        autoHide: true,
        visibilityTime: 1500,
      });
      return;
    }

    try {
      // Check Uniqueness
      const res = await axios.post(`${BASE_URL}/uniquetype`, {
        type: type.trim(),
      });

      const check = res.data;

      if (res.status === 200 && check.status === 'non-unique') {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This type already exists!',
          visibilityTime: 2000,
        });
        return;
      }

      const response = await axios.post(`${BASE_URL}/addtype`, {
        custtyp_name: type.trim(),
      });

      const data = response.data;

      if (response.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added',
          text2: 'Type has been added successfully!',
          autoHide: true,
          visibilityTime: 2500,
        });
        setcustomer(false);
        setType('');
        handleGetTypes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Types Data
  const handleGetTypes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchtypes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTypes(res.data.type);
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  useEffect(() => {
    handleGetTypes();
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
            <Text style={styles.headerTitle}>Types</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} onPress={togglecustomer}>
            <Icon name="plus" size={24} color="white" />
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
                        {item.custtyp_name?.charAt(0) || 'T'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.productName}>
                        {item.custtyp_name}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actionContainer}>
                    <TouchableOpacity
                      style={styles.acctionBtn}
                      onPress={() => {
                        toggleEdit(item.id);
                      }}>
                      <Icon name="pencil" size={20} color={'#144272'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.acctionBtn}
                      onPress={() => {
                        setModalV(!isModalV);
                        setSelectedType(item.id);
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
                        name="account-cog"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Type Name</Text>
                    </View>
                    <Text style={styles.valueText}>{item.custtyp_name}</Text>
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

        {/* Add Type Modal */}
        <Modal visible={customer} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Add New Type</Text>
                <TouchableOpacity
                  onPress={() => {
                    setcustomer(!customer);
                    setType('');
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              <View style={styles.addCustomerForm}>
                <View style={styles.addCustomerFullRow}>
                  <Text style={styles.addCustomerLabel}>Type Name *</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    placeholder="Enter type name"
                    value={type}
                    onChangeText={text => setType(text)}
                  />
                </View>

                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={handleAddType}>
                  <Icon name="account-plus-outline" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>Add Type</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/* Delete Type Modal */}
        <Modal visible={isModalV} transparent animationType="fade">
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
                  onPress={() => setModalV(!isModalV)}>
                  <Text style={[styles.deleteModalBtnText, {color: '#144272'}]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteModalBtn, {backgroundColor: '#d9534f'}]}
                  onPress={handleDeleteType}>
                  <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Toast />
          </View>
        </Modal>

        {/* Edit Type Modal */}
        <Modal visible={edit} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Edit Type</Text>
                <TouchableOpacity
                  onPress={() => {
                    setedit(!edit);
                    setEditType('');
                    setSelectedType(null);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              <View style={styles.addCustomerForm}>
                <View style={styles.addCustomerFullRow}>
                  <Text style={styles.addCustomerLabel}>Type Name *</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    placeholder="Enter type name"
                    value={editType}
                    onChangeText={t => setEditType(t)}
                  />
                </View>

                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={handleUpdateType}>
                  <Icon name="account-edit" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>Update Area</Text>
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
    maxHeight: '40%',
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
