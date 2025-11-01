import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
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
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import backgroundColors from '../../Colors';

interface Categories {
  id: number;
  expc_name: string;
  created_at: string;
}

export default function ExpenseCategories() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [modalVisible, setModalVisible] = useState('');
  const [category, setCategory] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Categories[]>([]);
  const [masterData, setMasterData] = useState<Categories[]>([]);

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

  // Fetch Expense Categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchexpensecategories`);

      const catData = res.data.cat;
      setMasterData(catData);
      setFilteredData(catData);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Category
  const handleAddCategory = async () => {
    const nameRegex = /^[A-Za-z ]+$/;

    if (!category) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a category name',
        visibilityTime: 1500,
      });
      return;
    }

    if (!nameRegex.test(category.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Category name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addexpensecategory`, {
        cat_name: category.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Category has been added successfully',
          visibilityTime: 1500,
        });
        fetchCategories();
        setCategory('');
        setModalVisible('');
      } else if (res.status === 200 && data.status === 404) {
        Toast.show({
          type: 'info',
          text1: 'Warning!',
          text2: 'This expense category already exist!',
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Get Edit Category Data
  const getEditCategoryData = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editexpensecategory?id=${id}&_token=${token}`,
      );
      setEditCategory(res.data.expc_name);
    } catch (error) {
      console.log(error);
    }
  };

  // Edit Category
  const handleUpdateCategory = async () => {
    const nameRegex = /^[A-Za-z ]+$/;

    if (!editCategory) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a category name',
        visibilityTime: 1500,
      });
      return;
    }

    if (!nameRegex.test(editCategory.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'name should only contain letters and spaces.',
        visibilityTime: 2000,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/updateexpensecategory`, {
        cat_id: selectedItem,
        cat_name: editCategory.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Category has been Updated successfully',
          visibilityTime: 1500,
        });
        fetchCategories();
        setEditCategory('');
        setSelectedItem(null);
        setModalVisible('');
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'info',
          text1: 'Warning!',
          text2: 'This expense category already exist!',
          visibilityTime: 1500,
        });
      }
    } catch (error) {}
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/expcatdelete`, {
        id: selectedItem,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Category has been Deleted successfully',
          visibilityTime: 1500,
        });
        fetchCategories();
        setSelectedItem(null);
        setModalVisible('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Search Filter
  const searchFilter = (text: string) => {
    if (text) {
      const newData = masterData.filter(item => {
        const itemData = item.expc_name
          ? item.expc_name.toLocaleUpperCase()
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
    fetchCategories();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Expense Categories</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setModalVisible('Add');
            }}
            style={[styles.headerBtn]}>
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
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>{item.expc_name}</Text>
                    <Text style={styles.subText}>
                      <Icon name="calendar" size={12} color="#666" />{' '}
                      {new Date(item.created_at)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .replace(/ /g, '-')}
                    </Text>
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
                        getEditCategoryData(item.id);
                        setSelectedItem(item.id);
                      }}>
                      <Icon
                        name="pencil"
                        size={20}
                        color={backgroundColors.dark}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('Delete');
                        setSelectedItem(item.id);
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

        {/*Delete Category*/}
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
                  onPress={handleDeleteCategory}>
                  <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Category Modal */}
        <Modal
          visible={modalVisible === 'Edit'}
          transparent
          animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Category</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setEditCategory('');
                  }}
                  style={styles.closeBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.formRow}>
                <Text style={styles.inputLabel}>Category Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter category name"
                  placeholderTextColor="#999"
                  value={editCategory}
                  onChangeText={t => setEditCategory(t)}
                />
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleUpdateCategory}>
                <Icon name="pencil" size={18} color="#fff" />
                <Text style={styles.submitText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Category Modal */}
        <Modal
          visible={modalVisible === 'Add'}
          transparent
          animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Category</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setCategory('');
                  }}
                  style={styles.closeBtn}>
                  <Icon name="close" size={20} color={backgroundColors.dark} />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.formRow}>
                <Text style={styles.inputLabel}>Category Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter category name"
                  placeholderTextColor="#999"
                  value={category}
                  onChangeText={t => setCategory(t)}
                />
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleAddCategory}>
                <Icon name="plus" size={18} color="#fff" />
                <Text style={styles.submitText}>Add</Text>
              </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
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
    backgroundColor: backgroundColors.info,
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
  addCustomerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  // Edit and Add Modal styling
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 12,
    padding: 16,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: backgroundColors.dark,
  },
  closeBtn: {
    padding: 4,
  },
  formRow: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: backgroundColors.dark,
    backgroundColor: '#f9f9f9',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
});
