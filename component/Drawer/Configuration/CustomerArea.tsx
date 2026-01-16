import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
  Image,
  BackHandler,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BottomBar from '../../BottomBar';
import {useDrawer} from '../../DrawerContext';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  primarySoft: 'rgba(42, 101, 43, 0.1)',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  accent: '#4CAF50',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textDark: '#1F2937',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  danger: '#EF4444',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
};

interface Areas {
  id: number;
  area_name: string;
  area_status: string;
}

export default function CustomerArea({navigation}: any) {
  const {openDrawer} = useDrawer();
  const [area, setArea] = useState('');
  const {token} = useUser();
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [editArea, setEditArea] = useState<string | ''>('');
  const [modalVisible, setModalVisible] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Areas[]>([]);
  const [masterData, setMasterData] = useState<Areas[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Get Data to edit
  const getAreaToEdit = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editarea?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setEditArea(res.data.area_name);
      setSelectedArea(id);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Area
  const handleDeleteArea = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/areadelete`, {
        id: selectedArea,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Area has been Deleted successfully!',
          visibilityTime: 1500,
        });
        setSelectedArea(null);
        handleFetchAreas();
        setModalVisible('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update Area
  const handleUpdateArea = async () => {
    if (!editArea) {
      Toast.show({
        type: 'error',
        text1: 'Missing Field',
        text2: 'Area field can not empty.',
        autoHide: true,
        visibilityTime: 1500,
      });
      return;
    }

    const specialCharRegex = /[^a-zA-Z0-9 _-]/;
    if (specialCharRegex.test(editArea)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Area Name',
        text2: 'Special characters are not allowed in the area name.',
        autoHide: true,
        visibilityTime: 1500,
      });
      return;
    }

    try {
      // Check Uniqueness
      const reschk = await axios.post(`${BASE_URL}/uniquearea`, {
        area: editArea.trim(),
      });

      const check = reschk.data;

      if (reschk.status === 200 && check.status === 0) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This area already exists!',
          visibilityTime: 2000,
        });
        return;
      }

      const res = await axios.post(`${BASE_URL}/updatearea`, {
        area_id: selectedArea,
        area_name: editArea.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Area has been Updated successfully!',
          visibilityTime: 1500,
        });

        setSelectedArea(null);
        setEditArea('');
        setModalVisible('');
        handleFetchAreas();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Get Areas
  const handleFetchAreas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/fetchareas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const areaData = res.data.area;

      setFilteredData(areaData);
      setMasterData(areaData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Add Area
  const handleAddArea = async () => {
    if (!area) {
      Toast.show({
        type: 'error',
        text1: 'Missing Field',
        text2: 'Area field can not empty.',
        autoHide: true,
        visibilityTime: 1500,
      });
      return;
    }

    const specialCharRegex = /[^a-zA-Z0-9 _-]/;
    if (specialCharRegex.test(area)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Area Name',
        text2: 'Special characters are not allowed in the area name.',
        autoHide: true,
        visibilityTime: 1500,
      });
      return;
    }

    try {
      // Check Uniqueness
      const res = await axios.post(`${BASE_URL}/uniquearea`, {
        area: area.trim(),
      });

      const check = res.data;

      if (res.status === 200 && check.status === 0) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This area already exists!',
          visibilityTime: 2000,
        });
        return;
      }

      const response = await axios.post(`${BASE_URL}/addarea`, {
        area_name: area.trim(),
      });

      const data = response.data;
      console.log('Response: ', data);

      if (response.status === 200 && data.status === 200) {
        setModalVisible('');
        setArea('');
        Toast.show({
          type: 'success',
          text1: 'Added',
          text2: 'Area has been added successfully!',
          visibilityTime: 1500,
        });
        handleFetchAreas();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Search Filter
  const searchFilter = (text: string) => {
    if (text) {
      const newData = masterData.filter(item => {
        const itemData = item.area_name
          ? item.area_name.toLocaleUpperCase()
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
    handleFetchAreas();

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

  // --- HELPER: Get Initials ---
  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // --- RENDER ITEM ---
  const renderItem = ({item}: {item: Areas}) => {
    return (
      <View style={styles.cardRow}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.area_name)}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.area_name}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: '#E3F2FD'}]}
            onPress={() => {
              setModalVisible('Edit');
              getAreaToEdit(item.id);
            }}>
            <Icon name="pencil" size={16} color="#1976D2" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: '#FFEBEE'}]}
            onPress={() => {
              setSelectedArea(item.id);
              setModalVisible('Delete');
            }}>
            <Icon name="delete" size={16} color={THEME.danger} />
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

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Area List</Text>
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
            placeholder="Search areas..."
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
        {loading ? (
          <View style={styles.centerContent}>
            <LottieView
              source={require('../../../assets/Loading-Dots.json')}
              autoPlay
              loop
              style={{width: 100, height: 100}}
            />
          </View>
        ) : (
          <>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeaderLabel}>AREA LIST</Text>
              <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
            </View>

            <FlatList
              data={paginatedData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={{paddingBottom: 160}}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.centerContent}>
                  <Icon name="format-list-bulleted" size={60} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No areas found</Text>
                </View>
              }
            />
          </>
        )}
      </View>

      {/* --- PAGINATION (Bottom Floating) --- */}
      {!loading && totalRecords > 0 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={[styles.pageBtn, currentPage === 1 && styles.disabledBtn]}>
            <Icon name="chevron-left" size={24} color={THEME.white} />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() =>
              setCurrentPage(prev => Math.min(prev + 1, totalPages))
            }
            style={[
              styles.pageBtn,
              currentPage === totalPages && styles.disabledBtn,
            ]}>
            <Icon name="chevron-right" size={24} color={THEME.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Add Area Modal */}
      <Modal visible={modalVisible === 'Add'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Area</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setArea('');
                }}
                style={styles.closeBtn}>
                <Icon name="close" size={24} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Area Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter area name"
                  placeholderTextColor={THEME.textGray}
                  value={area}
                  onChangeText={text => setArea(text)}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleAddArea}>
                <LinearGradient
                  colors={[THEME.gradientStart, THEME.gradientEnd]}
                  style={styles.submitBtnGradient}>
                  <Icon name="check" size={20} color="white" />
                  <Text style={styles.submitBtnText}>Add Area</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Toast />
      </Modal>

      {/* Edit Area Modal */}
      <Modal
        visible={modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Area</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setEditArea('');
                  setSelectedArea(null);
                }}
                style={styles.closeBtn}>
                <Icon name="close" size={24} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Area Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter area name"
                  placeholderTextColor={THEME.textGray}
                  value={editArea}
                  onChangeText={t => setEditArea(t)}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleUpdateArea}>
                <LinearGradient
                  colors={[THEME.gradientStart, THEME.gradientEnd]}
                  style={styles.submitBtnGradient}>
                  <Icon name="check" size={20} color="white" />
                  <Text style={styles.submitBtnText}>Update Area</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Toast />
      </Modal>

      {/* Delete Area Modal */}
      <Modal
        visible={modalVisible === 'Delete'}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
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
              You won't be able to revert this!
            </Text>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: '#F3F4F6'}]}
                onPress={() => setModalVisible('')}>
                <Text style={[styles.modalBtnText, {color: THEME.textDark}]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: THEME.danger}]}
                onPress={handleDeleteArea}>
                <Text style={[styles.modalBtnText, {color: 'white'}]}>
                  Yes, Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Toast />
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '94%',
    alignSelf: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#222',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.19,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 2,
  },
  subText: {
    fontSize: 12,
    color: THEME.textGray,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Pagination ---
  paginationContainer: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: THEME.primary,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
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

  // --- Empty & Loaders ---
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: THEME.textGray,
    fontSize: 16,
  },

  // --- MODALS ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    elevation: 10,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  closeBtn: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: THEME.background,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.textDark,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  submitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitBtnGradient: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // --- Delete Modal ---
  deleteModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  delAnim: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginBottom: 10,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
