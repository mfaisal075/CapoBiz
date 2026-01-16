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
import {useDrawer} from '../../DrawerContext';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../BottomBar';

const {width} = Dimensions.get('window');

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  accent: '#4CAF50',
  background: '#F0F2F5',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  danger: '#EF4444',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
};

interface RolesInterface {
  id: number;
  role_name: string;
  role_status: string;
}

// --- HELPER: Get Initials ---
const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Roles({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {token} = useUser();
  const [role, setRole] = useState<string | ''>('');
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [editRole, setEditRole] = useState('');
  const [modalVisible, setModalVisible] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<RolesInterface[]>([]);
  const [masterData, setMasterData] = useState<RolesInterface[]>([]);

  const [isModalV, setModalV] = useState(false);
  const tglModal = (id: number) => {
    setSelectedRole(id);
    setModalV(!isModalV);
  };
  const [edit, setedit] = useState(false);

  const toggleedit = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/rolesedit?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSelectedRole(id);
      setedit(!edit);
      setEditRole(res.data.role_name);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Role
  const handleDeleteRole = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/rolesdelete?id=${selectedRole}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Role has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setSelectedRole(null);
        setModalV(!isModalV);
        handleFetchRoles();
      } else if (data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2:
            'You have not permission to delete this role, because it is using Access Control!',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update Role
  const handleUpdateRole = async () => {
    if (!editRole) {
      Toast.show({
        type: 'error',
        text1: 'Missing Field',
        text2: 'Role field can not empty.',
        autoHide: true,
        visibilityTime: 1500,
      });
      return;
    }

    const specialCharRegex = /[^a-zA-Z0-9 _-]/;
    if (specialCharRegex.test(editRole)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Role Name',
        text2: 'Special characters are not allowed in the role name.',
        autoHide: true,
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/rolesupdate`, {
        role_id: selectedRole,
        role: editRole.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Role has been Updated successfully!',
          visibilityTime: 1500,
        });
        setSelectedRole(null);
        setEditRole('');
        setedit(!edit);
        handleFetchRoles();
      } else if (res.status === 200 && data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This role already exist!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Add Role
  const handleAddRole = async () => {
    if (!role) {
      Toast.show({
        type: 'error',
        text1: 'Missing Field',
        text2: 'Role field can not empty.',
        autoHide: true,
        visibilityTime: 1500,
      });
      return;
    }

    const specialCharRegex = /[^a-zA-Z0-9 _-]/;
    if (specialCharRegex.test(role)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Role Name',
        text2: 'Special characters are not allowed in the role name.',
        autoHide: true,
        visibilityTime: 1500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/rolesstore`, {
        role: role.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Role has been Added successfully!',
          visibilityTime: 1500,
        });

        handleFetchRoles();
        setModalVisible('');
        setRole('');
      } else if (res.status === 200 && data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This role already exist!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Roles
  const handleFetchRoles = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchroleslist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const roleData = res.data.roles;

      setFilteredData(roleData);
      setMasterData(roleData);
    } catch (error) {
      console.log(error);
    }
  };

  // Pagination for Roles
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

  useEffect(() => {
    handleFetchRoles();

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

  // Search Filter
  const searchFilter = (text: string) => {
    if (text) {
      const newData = masterData.filter(item => {
        const itemData = item.role_name
          ? item.role_name.toLocaleUpperCase()
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
            <Text style={styles.headerTitle}>Roles</Text>
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
            placeholder="Search roles..."
            placeholderTextColor={THEME.textGray}
            style={styles.floatingSearchInput}
            value={searchQuery}
            onChangeText={searchFilter}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => searchFilter('')}>
              <Icon name="close-circle" size={18} color={THEME.textGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* --- CONTENT LIST --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>ROLE LIST</Text>
          <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
        </View>

        <FlatList
          data={paginatedData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <View style={styles.cardRow}>
              {/* Avatar/Icon Section */}
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {getInitials(item.role_name)}
                </Text>
              </View>

              {/* Info Section */}
              <View style={styles.infoContainer}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {item.role_name}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, {backgroundColor: '#E3F2FD'}]}
                  onPress={() => toggleedit(item.id)}>
                  <Icon name="pencil" size={16} color="#1976D2" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, {backgroundColor: '#FFEBEE'}]}
                  onPress={() => tglModal(item.id)}>
                  <Icon name="delete" size={16} color={THEME.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{paddingBottom: 160}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Icon name="shield-account-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>No roles found</Text>
            </View>
          }
        />
      </View>

      {/* --- PAGINATION (Bottom Floating) --- */}
      {totalRecords > 0 && (
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

      {/* Add Role Modal */}
      <Modal visible={modalVisible === 'Add'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Role</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setRole('');
                }}
                style={styles.closeBtn}>
                <Icon name="close" size={24} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Role Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter role name"
                  placeholderTextColor={THEME.textGray}
                  value={role}
                  onChangeText={text => setRole(text)}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleAddRole}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={[THEME.gradientStart, THEME.gradientEnd]}
                  style={styles.submitBtnGradient}>
                  <Icon name="check-circle-outline" size={20} color="white" />
                  <Text style={styles.submitBtnText}>Add Role</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Toast />
      </Modal>

      {/* Delete Role Modal */}
      <Modal visible={isModalV} transparent animationType="fade">
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
                onPress={() => setModalV(!isModalV)}>
                <Text style={[styles.modalBtnText, {color: THEME.textDark}]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: THEME.danger}]}
                onPress={handleDeleteRole}>
                <Text style={[styles.modalBtnText, {color: 'white'}]}>
                  Yes, Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Toast />
        </View>
      </Modal>

      {/* Edit Role Modal */}
      <Modal visible={edit} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Role</Text>
              <TouchableOpacity
                onPress={() => {
                  setedit(!edit);
                  setEditRole('');
                  setSelectedRole(null);
                }}
                style={styles.closeBtn}>
                <Icon name="close" size={24} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Role Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter role name"
                  placeholderTextColor={THEME.textGray}
                  value={editRole}
                  onChangeText={t => setEditRole(t)}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleUpdateRole}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={[THEME.gradientStart, THEME.gradientEnd]}
                  style={styles.submitBtnGradient}>
                  <Icon name="check-circle-outline" size={20} color="white" />
                  <Text style={styles.submitBtnText}>Update Role</Text>
                </LinearGradient>
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
  // --- HEADER ---
  headerWrapper: {
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
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
    marginHorizontal: 10,
    fontSize: 15,
    color: THEME.textDark,
  },

  // --- LIST & CARDS ---
  listContainer: {
    flex: 1,
    marginTop: 40, // Space for floating search
    paddingHorizontal: 15,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  tableHeaderLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textGray,
    letterSpacing: 1,
  },
  tableHeaderCount: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '700',
  },
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(42, 101, 43, 0.1)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 4,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subText: {
    fontSize: 13,
    color: THEME.textGray,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 10,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    color: THEME.textGray,
    fontSize: 16,
  },

  // --- PAGINATION ---
  paginationContainer: {
    position: 'absolute',
    bottom: 100,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.3,
  },
  pageText: {
    color: THEME.white,
    fontWeight: '700',
    marginHorizontal: 15,
    fontSize: 14,
  },

  // --- MODALS ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    elevation: 10,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textDark,
  },
  closeBtn: {
    padding: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textGray,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: THEME.textDark,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  submitBtn: {
    marginTop: 10,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  submitBtnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // Delete Modal
  deleteModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    width: '100%',
  },
  delAnim: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textDark,
    marginBottom: 8,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
