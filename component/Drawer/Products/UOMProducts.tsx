import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  StatusBar,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
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
};

// --- HELPER: Get Initials ---
const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface UMOs {
  id: number;
  ums_name: string;
}

export default function UOMProducts({navigation}: any) {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState('');
  const [editUmo, setEditUmo] = useState('');
  const [selectedUmo, setSelectedUmo] = useState<number | null>(null);
  const [umoName, setUmoName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<UMOs[]>([]);
  const [masterData, setMasterData] = useState<UMOs[]>([]);
  const [successModal, setSuccessModal] = useState({
    visible: false,
    title: '',
    message: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Fetch UMOs
  const fetchUoms = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/fetchuoms`);
      const uomData = res.data.uom;
      setFilteredData(uomData);
      setMasterData(uomData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Add Umo
  const addUmo = async () => {
    if (!umoName) {
      Toast.show({type: 'error', text1: 'Please enter a UOM name'});
      return;
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(umoName)) {
      Toast.show({type: 'error', text1: 'Special characters not allowed'});
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/adduom`, {
        uom_name: umoName,
      });
      const data = res.data;
      if (res.status === 200 && data.status === 200) {
        setUmoName('');
        setModalVisible('');
        fetchUoms();
        setTimeout(() => {
          setSuccessModal({
            visible: true,
            title: 'Added!',
            message: 'UOM has been added successfully!',
          });
        }, 500);
      } else if (res.status === 200 && data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'UOM already exist!',
        });
      }
    } catch (error) {
      Toast.show({type: 'error', text1: 'Error!', text2: `${error}`});
    }
  };

  // Update Umo
  const updateUmo = async () => {
    if (!editUmo) {
      Toast.show({type: 'error', text1: 'Please enter a UOM name'});
      return;
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(editUmo)) {
      Toast.show({type: 'error', text1: 'Special characters not allowed'});
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/updateuom`, {
        uom_id: selectedUmo,
        ums_name: editUmo.trim(),
      });
      const data = res.data;
      if (res.status === 200 && data.status) {
        setEditUmo('');
        setModalVisible('');
        setSelectedUmo(null);
        fetchUoms();
        setTimeout(() => {
          setSuccessModal({
            visible: true,
            title: 'Updated!',
            message: 'UOM has been updated successfully!',
          });
        }, 500);
      } else if (res.status === 200 && data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This UOM already exist!',
        });
      }
    } catch (error) {
      Toast.show({type: 'error', text1: 'Error!', text2: `${error}`});
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
        setSelectedUmo(null);
        setModalVisible('');
        fetchUoms();
        Toast.show({type: 'success', text1: 'Deleted!', text2: 'UOM deleted'});
      }
    } catch (error) {
      console.log(error);
    }
  };

  const searchFilter = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const newData = masterData.filter(item => {
        const itemData = item.ums_name ? item.ums_name.toUpperCase() : '';
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredData(newData);
    } else {
      setFilteredData(masterData);
    }
  };

  useEffect(() => {
    fetchUoms();
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

  const renderItem = ({item}: {item: UMOs}) => {
    return (
      <View style={styles.cardRow}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.ums_name)}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.ums_name}
          </Text>
          {/* <View style={styles.iconTextRow}>
            <Icon name="scale-balance" size={14} color={THEME.textGray} />
            <Text style={styles.subText}>Product UOM</Text>
          </View> */}
        </View>

        {/* Delete Action */}
        <TouchableOpacity
          onPress={() => {
            setModalVisible('Delete');
            setSelectedUmo(item.id);
          }}
          style={{padding: 8}}>
          <Icon name="trash-can-outline" size={22} color={THEME.danger} />
        </TouchableOpacity>

        {/* Edit Action */}
        <TouchableOpacity
          onPress={() => {
            setModalVisible('Edit');
            // Pre-fill logic moved here for simplicity, though fetch could be done
            setEditUmo(item.ums_name); // Assuming name is enough or fetch if needed
            setSelectedUmo(item.id);
          }}
          style={{padding: 8}}>
          <Icon name="pencil" size={22} color={THEME.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
            <Text style={styles.headerTitle}>UOMs</Text>
            <TouchableOpacity
              onPress={() => setModalVisible('Add')}
              style={styles.iconBtn}>
              <Icon name="plus" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Floating Search */}
        <View style={styles.floatingSearchContainer}>
          <Icon name="magnify" size={22} color={THEME.primary} />
          <TextInput
            placeholder="Search UOMs..."
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

      {/* --- CONTENT --- */}
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.centerContent}>
            <LottieView
              source={require('../../../assets/Loading-Dots.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        ) : (
          <>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeaderLabel}>UOM LIST</Text>
              <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
            </View>

            <FlatList
              data={currentData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={{paddingBottom: 160}}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.centerContent}>
                  <Icon name="scale-balance" size={60} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No UOMs found.</Text>
                </View>
              }
            />
          </>
        )}
      </View>

      {/* --- PAGINATION --- */}
      {!loading && totalRecords > 0 && (
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

      {/* --- MODALS --- */}

      {/* Delete Modal */}
      <Modal
        visible={modalVisible === 'Delete'}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={{width: 100, height: 100, marginBottom: 15}}>
              <LottieView
                style={{flex: 1}}
                source={require('../../../assets/warning.json')}
                autoPlay
                loop={false}
              />
            </View>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalText}>
              You won’t be able to revert this record!
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible('')}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDelete} onPress={deleteUmo}>
                <Text style={styles.btnDeleteText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible === 'Add' || modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                {modalVisible === 'Add' ? 'Add UOM' : 'Edit UOM'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setUmoName('');
                  setEditUmo('');
                  setSelectedUmo(null);
                }}>
                <Icon name="close" size={22} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <View style={{width: '100%', marginTop: 20}}>
              <Text style={styles.label}>UOM Name *</Text>
              <TextInput
                style={styles.input}
                value={modalVisible === 'Add' ? umoName : editUmo}
                onChangeText={t =>
                  modalVisible === 'Add' ? setUmoName(t) : setEditUmo(t)
                }
                placeholder="Enter UOM name"
              />

              <TouchableOpacity
                style={[styles.btnPrimary, {marginTop: 20}]}
                onPress={modalVisible === 'Add' ? addUmo : updateUmo}>
                <Text
                  style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                  {modalVisible === 'Add' ? 'Save UOM' : 'Update UOM'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Toast />

      {/* Success Modal */}
      <Modal visible={successModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={{width: 100, height: 100}}>
              <LottieView
                source={require('../../../assets/success.json')}
                autoPlay
                duration={2500}
                loop={false}
                style={{width: '100%', height: '100%'}}
              />
            </View>
            <Text style={styles.modalTitle}>{successModal.title}</Text>
            <Text style={styles.modalText}>{successModal.message}</Text>
            <TouchableOpacity
              style={[styles.btnPrimary, {width: '100%', marginTop: 15}]}
              onPress={() =>
                setSuccessModal({visible: false, title: '', message: ''})
              }>
              <Text style={{color: 'white', fontWeight: 'bold'}}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Toast />
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
    paddingTop: 10,
    paddingBottom: 40,
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
  // --- List & Cards ---
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
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '94%',
    alignSelf: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#222',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  },
  nameText: {
    fontSize: 14,
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
  // --- Pagination ---
  paginationContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: THEME.primary,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  pageBtn: {
    padding: 8,
  },
  disabledBtn: {
    opacity: 0.3,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  deleteModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  btnCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textDark,
  },
  btnDelete: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: THEME.danger,
    alignItems: 'center',
  },
  btnDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  btnPrimary: {
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Common
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 100,
    height: 100,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: THEME.textGray,
  },
  modalHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textGray,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F9FAFB',
    color: THEME.textDark,
  },
});
