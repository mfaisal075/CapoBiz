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
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import backgroundColors from '../../Colors';

interface Types {
  id: number;
  custtyp_name: string;
  custtyp_status: string;
  created_at: string;
}

export default function CustomerType() {
  const {openDrawer} = useDrawer();
  const [type, setType] = useState('');
  const {token} = useUser();
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [editType, setEditType] = useState<string | ''>('');
  const [modalVisible, setModalVisible] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Types[]>([]);
  const [masterData, setMasterData] = useState<Types[]>([]);

  const getDataToEdit = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/edittype?id=${id}&_token=${token}`,
      );

      setSelectedType(id);
      setEditType(res.data.custtyp_name);
    } catch (error) {
      console.log(error);
    }
  };

  // Pagination for Customer
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData = filteredData;
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

        setModalVisible('');
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
        setModalVisible('');
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
        setModalVisible('');
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

      const typeData = res.data.type;

      setMasterData(typeData);
      setFilteredData(typeData);
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  // Search Filter
  const searchFilter = (text: string) => {
    if (text) {
      const newData = masterData.filter(item => {
        const itemData = item.custtyp_name
          ? item.custtyp_name.toLocaleUpperCase()
          : ''.toLocaleLowerCase();
        const textData = text.toLocaleUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredData(newData);
      setSearchQuery(text);
    } else {
      setFilteredData(masterData);
      setSearchQuery(text);
    }
  };

  useEffect(() => {
    handleGetTypes();
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
            <Text style={styles.headerTitle}>Customer Types</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn]}
            onPress={() => setModalVisible('Add')}>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Filter */}
        <View style={styles.searchFilter}>
          <Icon name="magnify" size={36} color={backgroundColors.dark} />
          <TextInput
            placeholder="Search by category name"
            style={styles.search}
            value={searchQuery}
            onChangeText={text => searchFilter(text)}
          />
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>{item.custtyp_name}</Text>
                  </View>

                  <View
                    style={{
                      alignSelf: 'center',
                      flexDirection: 'row',
                      gap: 10,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('Edit');
                        getDataToEdit(item.id);
                      }}>
                      <Icon
                        name="pencil"
                        size={20}
                        color={backgroundColors.dark}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedType(item.id);
                        setModalVisible('Delete');
                      }}>
                      <Icon
                        name="delete"
                        size={20}
                        color={backgroundColors.danger}
                      />
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

        {/* Add Type Modal */}
        <Modal
          visible={modalVisible === 'Add'}
          transparent
          animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Add New Type</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setType('');
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color={backgroundColors.dark} />
                </TouchableOpacity>
              </View>

              <View style={styles.addCustomerForm}>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Enter type name"
                  value={type}
                  onChangeText={text => setType(text)}
                />

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
        <Modal
          visible={modalVisible === 'Delete'}
          transparent
          animationType="fade">
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
                  onPress={() => setModalVisible('')}>
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
                  onPress={handleDeleteType}>
                  <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Toast />
          </View>
        </Modal>

        {/* Edit Type Modal */}
        <Modal
          visible={modalVisible === 'Edit'}
          transparent
          animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Edit Type</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setEditType('');
                    setSelectedType(null);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color={backgroundColors.dark} />
                </TouchableOpacity>
              </View>

              <View style={styles.addCustomerForm}>
                <TextInput
                  style={styles.addCustomerInput}
                  placeholderTextColor="#999"
                  placeholder="Enter type name"
                  value={editType}
                  onChangeText={t => setEditType(t)}
                />

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

  // Search Filter
  searchFilter: {
    width: '94%',
    alignSelf: 'center',
    height: 48,
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  search: {
    height: '100%',
    fontSize: 14,
    color: backgroundColors.dark,
    width: '100%',
  },

  // FlatList Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#144272',
    paddingVertical: 4,
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    width: '96%',
    alignSelf: 'center',
    marginTop: 60,
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Pagination Styling
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
    backgroundColor: backgroundColors.info,
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
    color: backgroundColors.light,
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
    paddingHorizontal: 15,
  },
  addCustomerModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '30%',
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
  addCustomerInput: {
    borderWidth: 1,
    backgroundColor: backgroundColors.light,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    height: 48,
    color: backgroundColors.dark,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
