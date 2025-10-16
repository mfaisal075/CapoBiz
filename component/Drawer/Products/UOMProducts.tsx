import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
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
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../../Colors';

interface UMOs {
  id: number;
  ums_name: string;
}

export default function UOMProducts() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [umos, setUmos] = useState<UMOs[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [editUmo, setEditUmo] = useState('');
  const [selectedUmo, setSelectedUmo] = useState<number | null>(null);
  const [umoName, setUmoName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<UMOs[]>([]);
  const [masterData, setMasterData] = useState<UMOs[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Fetch UMOs
  const fetchUoms = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchuoms`);

      const uomData = res.data.uom;

      setFilteredData(uomData);
      setMasterData(uomData);
    } catch (error) {
      console.log(error);
    }
  };

  // Update Umo
  const updateUmo = async () => {
    if (!editUmo) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a UOM name',
      });
      return;
    }

    if (!/^[a-zA-Z0-9 ]+$/.test(editUmo)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid UOM name',
        text2: 'Special characters are not allowed.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/updateuom`, {
        uom_id: selectedUmo,
        ums_name: editUmo.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'UOM has been Updated successfully',
          visibilityTime: 1500,
        });

        setEditUmo('');
        setModalVisible('');
        setSelectedUmo(null);
        fetchUoms();
      } else if (res.status === 200 && data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This UOM already exist!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: `${error}`,
        visibilityTime: 2000,
      });
      console.log(error);
    }
  };

  // Delete Umo
  const deleteUmo = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/uomdelete`, {
        id: selectedUmo,
      });

      const data = res.data;

      if (res.status === 200 && data.status) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'UOM has been deleted successfully.',
          visibilityTime: 1500,
        });
        setSelectedUmo(null);
        setModalVisible('');
        fetchUoms();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Add Umo
  const addUmo = async () => {
    if (!umoName) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a UOM name',
        visibilityTime: 1500,
      });
      return;
    }

    // Check for special characters (allow only letters, numbers, spaces)
    if (!/^[a-zA-Z0-9 ]+$/.test(umoName)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid UOM name',
        text2: 'Special characters are not allowed.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/adduom`, {
        uom_name: umoName,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'UOM has been added successfully',
          visibilityTime: 1500,
        });

        fetchUoms();
        setUmoName('');
        setModalVisible('');
      } else if (res.status === 200 && data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'UOM already exist!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: `${error}`,
      });
      console.log(error);
    }
  };

  // Search Filter
  const searchFilter = (text: string) => {
    if (text) {
      const newData = masterData.filter(item => {
        const itemData = item.ums_name
          ? item.ums_name.toLocaleUpperCase()
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
    fetchUoms();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>UOMs</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible('Add')}
            style={[styles.headerBtn]}>
            <Text style={styles.addBtnText}>Add</Text>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Filter */}
        <View style={styles.searchFilter}>
          <Icon name="magnify" size={36} color={backgroundColors.dark} />
          <TextInput
            placeholder="Search by supplier name"
            style={styles.search}
            value={searchQuery}
            onChangeText={text => searchFilter(text)}
          />
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
                    <Image
                      source={require('../../../assets/scale.png')}
                      style={styles.avatar}
                    />
                  </View>

                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.ums_name}</Text>
                  </View>

                  {/* Actions on right */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('Edit');
                        const fetchSignleUmo = async (id: number) => {
                          try {
                            const res = await axios.get(
                              `${BASE_URL}/edituom?id=${id}&_token=${token}`,
                            );
                            setEditUmo(res.data.ums_name);
                            setSelectedUmo(res.data.id);
                          } catch (error) {
                            console.log(error);
                          }
                        };
                        fetchSignleUmo(item.id);
                      }}>
                      <Icon
                        name="pencil"
                        size={20}
                        color={backgroundColors.success}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('Delete');
                        setSelectedUmo(item.id);
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

        {/*Delete Umo*/}
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
                  onPress={deleteUmo}>
                  <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Toast />
          </View>
        </Modal>

        {/* Edit UOM */}
        <Modal
          visible={modalVisible === 'Edit'}
          transparent
          animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <View style={styles.addCustomerModalContainer}>
              {/* Header */}
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Edit UOM</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setEditUmo('');
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.addCustomerForm}>
                <View style={styles.addCustomerFullRow}>
                  <Text style={styles.addCustomerLabel}>UOM Name *</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholder="Enter UOM name"
                    placeholderTextColor="#999"
                    value={editUmo}
                    onChangeText={t => setEditUmo(t)}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={updateUmo}>
                  <Icon name="pencil" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>Update UOM</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Toast />
          </View>
        </Modal>

        {/* Add UOM */}
        <Modal
          visible={modalVisible === 'Add'}
          transparent
          animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <View style={styles.addCustomerModalContainer}>
              {/* Header */}
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Add New UOM</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setUmoName('');
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.addCustomerForm}>
                <View style={styles.addCustomerFullRow}>
                  <Text style={styles.addCustomerLabel}>UOM Name *</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholder="Enter UOM name"
                    placeholderTextColor="#999"
                    value={umoName}
                    onChangeText={t => setUmoName(t)}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={addUmo}>
                  <Icon name="shape-plus" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>Add UOM</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Toast />
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
    paddingHorizontal: '3%',
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
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    height: 40,
    width: 40,
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
    alignSelf: 'center',
    gap: 12,
    marginLeft: 10,
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
});
