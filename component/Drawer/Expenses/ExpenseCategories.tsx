import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  StatusBar,
  BackHandler,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../BottomBar';

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  primarySoft: 'rgba(42, 101, 43, 0.1)',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textDark: '#1F2937',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  danger: '#EF4444',
  warning: '#F59E0B',
  shadow: '#000',
};

// --- HELPER: Get Initials ---
const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface Categories {
  id: number;
  expc_name: string;
  created_at: string;
}

export default function ExpenseCategories({navigation}: any) {
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

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );
    return () => backHandler.remove();
  }, []);

  // --- RENDER ITEM ---
  const renderItem = ({item}: {item: Categories}) => {
    return (
      <View style={styles.cardRow}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.expc_name)}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.expc_name}
          </Text>
          <View style={styles.iconTextRow}>
            <Icon name="calendar-clock" size={14} color={THEME.textGray} />
            <Text style={styles.subText}>
              {new Date(item.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setModalVisible('Edit');
              getEditCategoryData(item.id);
              setSelectedItem(item.id);
            }}>
            <Icon name="pencil" size={20} color={THEME.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setModalVisible('Delete');
              setSelectedItem(item.id);
            }}>
            <Icon name="delete" size={20} color={THEME.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      {/* --- MODERN HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Expense Categories</Text>
            <TouchableOpacity
              onPress={() => setModalVisible('Add')}
              style={styles.iconBtn}>
              <Icon name="plus" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Floating Search Bar */}
        <View style={styles.floatingSearchContainer}>
          <Icon name="magnify" size={22} color={THEME.primary} />
          <TextInput
            placeholder="Search categories..."
            placeholderTextColor={THEME.textLight}
            style={styles.floatingSearchInput}
            value={searchQuery}
            onChangeText={searchFilter}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => searchFilter('')}>
              <Icon name="close-circle" size={18} color={THEME.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* --- CONTENT LIST --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>CATEGORY LIST</Text>
          <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
        </View>

        <FlatList
          data={currentData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{paddingBottom: 150}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Icon name="clipboard-text-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>No categories found</Text>
            </View>
          }
        />
      </View>

      {/* --- PAGINATION (Bottom Floating) --- */}
      {totalRecords > 0 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(prev => prev - 1)}
            style={[styles.pageBtn, currentPage === 1 && styles.disabledBtn]}>
            <Icon name="chevron-left" size={24} color={THEME.white} />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage(prev => prev + 1)}
            style={[
              styles.pageBtn,
              currentPage === totalPages && styles.disabledBtn,
            ]}>
            <Icon name="chevron-right" size={24} color={THEME.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* --- ADD CATEGORY MODAL --- */}
      <Modal visible={modalVisible === 'Add'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Category</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setCategory('');
                }}
                style={styles.closeModalBtn}>
                <Icon name="close" size={22} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Category Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Office Supplies"
                placeholderTextColor={THEME.textLight}
                value={category}
                onChangeText={setCategory}
              />
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleAddCategory}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[THEME.gradientStart, THEME.gradientEnd]}
                style={styles.submitBtnGradient}>
                <Icon name="check-circle-outline" size={20} color="white" />
                <Text style={styles.submitBtnText}>Save Category</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Toast />
        </View>
      </Modal>

      {/* --- EDIT CATEGORY MODAL --- */}
      <Modal visible={modalVisible === 'Edit'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Category</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setEditCategory('');
                }}
                style={styles.closeModalBtn}>
                <Icon name="close" size={22} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Category Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Category Name"
                placeholderTextColor={THEME.textLight}
                value={editCategory}
                onChangeText={setEditCategory}
              />
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleUpdateCategory}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[THEME.gradientStart, THEME.gradientEnd]}
                style={styles.submitBtnGradient}>
                <Icon name="check-circle-outline" size={20} color="white" />
                <Text style={styles.submitBtnText}>Update Category</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- DELETE CATEGORY MODAL --- */}
      <Modal
        visible={modalVisible === 'Delete'}
        transparent
        animationType="fade">
        <View style={styles.deleteModalOverlay}>
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
              You won’t be able to revert this record!
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.deleteModalBtn, {backgroundColor: '#F3F4F6'}]}
                onPress={() => setModalVisible('')}>
                <Text
                  style={[styles.deleteModalBtnText, {color: THEME.textDark}]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteModalBtn, {backgroundColor: THEME.danger}]}
                onPress={handleDeleteCategory}>
                <Text style={[styles.deleteModalBtnText, {color: '#fff'}]}>
                  Yes, Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- Header ---
  headerWrapper: {
    marginBottom: 20,
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 40, // Extra space for floating search
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  // --- Floating Search ---
  floatingSearchContainer: {
    position: 'absolute',
    bottom: -24,
    left: 12,
    right: 12,
    backgroundColor: THEME.white,
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: THEME.textDark,
  },

  // --- List ---
  listContainer: {
    flex: 1,
    paddingTop: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 14,
  },
  tableHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textGray,
    letterSpacing: 0.5,
  },
  tableHeaderCount: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.primary,
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  // --- Card Row ---
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: '94%',
    alignSelf: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#222',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.primary,
    letterSpacing: 0.5,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 4,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subText: {
    fontSize: 12,
    color: THEME.textGray,
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    marginLeft: 10,
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.textGray,
    marginTop: 10,
  },

  // --- Pagination ---
  paginationContainer: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 10,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pageBtn: {
    padding: 5,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  pageText: {
    color: THEME.white,
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 15,
  },

  // --- Modals ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.textDark,
  },
  closeModalBtn: {
    padding: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  formRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.border,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    color: THEME.textDark,
    backgroundColor: '#F9FAFB',
  },
  submitBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Delete Modal
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  deleteModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    elevation: 20,
    alignItems: 'center',
  },
  delAnim: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 15,
  },
  deleteModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteModalBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
