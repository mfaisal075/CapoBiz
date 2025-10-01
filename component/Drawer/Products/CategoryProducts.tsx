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
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

interface Categories {
  id: number;
  pcat_name: string;
}

export default function CategoryProducts() {
  const {openDrawer} = useDrawer();
  const [categories, setCategories] = useState<Categories[]>([]);
  const [addCate, setAddCate] = useState('');
  const [modal, setModal] = useState<string | ''>('');
  const [selectedCate, setSelectedCate] = useState<Categories | null>(null);
  const [editCate, setEditCate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = categories.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = categories.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Fetch Category Dropdown
  const fetchCatDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcategories`);
      setCategories(res.data.cat);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Category
  const addCategory = async () => {
    if (!addCate) {
      Toast.show({
        type: 'error',
        text1: 'Please fill out field',
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addcategory`, {
        cat_name: addCate.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Category has been added successfully',
        });
        setAddCate('');
        fetchCatDropdown();
        setModal('');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `${error}`,
      });
      console.log(error);
    }
  };

  // Delete Category
  const delCategory = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/catdelete`, {
        id: selectedCate?.id,
      });
      const data = res.data;
      console.log(data);

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Category has been deleted successfully.',
        });
        fetchCatDropdown();
        setSelectedCate(null);
        setModal('');
      } else if (res.status === 200 && data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2:
            'You have products in this category, cannot delete this category!.',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `${error}`,
      });
      console.log(error);
    }
  };

  // Edit Category
  const editCategory = async () => {
    if (!editCate) {
      Toast.show({
        type: 'error',
        text1: 'Please fill out field',
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/updatecategory`, {
        cat_id: selectedCate?.id,
        cat_name: editCate.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Category has been Updated successfully',
        });
        fetchCatDropdown();
        setEditCate('');
        setSelectedCate(null);
        setModal('');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `${error}`,
      });
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCatDropdown();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Categories</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setModal('Add');
            }}
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
                {/* Header Row */}
                <View style={styles.headerRow}>
                  {/* Avatar Circle */}
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.pcat_name?.charAt(0).toUpperCase() || 'C'}
                    </Text>
                  </View>

                  {/* Category Info */}
                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.pcat_name}</Text>
                    <Text style={styles.subText}>Category</Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setModal('editCategory');
                        setEditCate(item.pcat_name);
                        setSelectedCate({
                          id: item.id,
                          pcat_name: item.pcat_name,
                        });
                      }}>
                      <Icon
                        name="pencil"
                        size={20}
                        color="#144272"
                        style={styles.actionIcon}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setModal('delCategory');
                        setSelectedCate({
                          id: item.id,
                          pcat_name: item.pcat_name,
                        });
                      }}>
                      <Icon
                        name="delete"
                        size={20}
                        color="#144272"
                        style={styles.actionIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="tag"
                        size={18}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Category ID (In DB)</Text>
                    </View>
                    <Text style={styles.valueText}>{item.id || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No categories found.
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 100}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/*Delete Category*/}
        <Modal
          visible={modal === 'delCategory'}
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
                  onPress={() => setModal('')}>
                  <Text style={[styles.deleteModalBtnText, {color: '#144272'}]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteModalBtn, {backgroundColor: '#d9534f'}]}
                  onPress={delCategory}>
                  <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Toast />
          </View>
        </Modal>

        {/* Edit Category Modal */}
        <Modal
          visible={modal === 'editCategory'}
          transparent
          animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <View style={styles.addCustomerModalContainer}>
              {/* Header */}
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Edit Category</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModal('');
                    setEditCate('');
                    setSelectedCate(null);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.addCustomerForm}>
                <View style={styles.addCustomerFullRow}>
                  <Text style={styles.addCustomerLabel}>Category Name *</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholder="Enter category name"
                    placeholderTextColor="#999"
                    value={editCate}
                    onChangeText={t => setEditCate(t)}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={editCategory}>
                  <Icon name="pencil" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>
                    Update Category
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Toast />
          </View>
        </Modal>

        {/* Add Category Modal */}
        <Modal visible={modal === 'Add'} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <View style={styles.addCustomerModalContainer}>
              {/* Header */}
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Add New Category</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModal('');
                    setAddCate('');
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.addCustomerForm}>
                <View style={styles.addCustomerFullRow}>
                  <Text style={styles.addCustomerLabel}>Category Name *</Text>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholder="Enter category name"
                    placeholderTextColor="#999"
                    value={addCate}
                    onChangeText={t => setAddCate(t)}
                  />
                </View>

                {/* Submit */}
                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={addCategory}>
                  <Icon name="shape-plus" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>Add Category</Text>
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
