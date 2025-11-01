import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import backgroundColors from '../../Colors';

interface RolesInterface {
  id: number;
  role_name: string;
  role_status: string;
}

export default function Roles() {
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
      console.log(res.data);

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
            <Text style={styles.headerTitle}>Roles</Text>
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
            placeholder="Search by role name"
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
                {/* Header Row */}
                <View style={styles.headerRow}>
                  <View style={styles.headerTxtContainer}>
                    <View style={{flex: 1}}>
                      <Text style={styles.roleName}>{item.role_name}</Text>
                    </View>
                  </View>
                  <View style={styles.actionContainer}>
                    <TouchableOpacity
                      style={styles.acctionBtn}
                      onPress={() => toggleedit(item.id)}>
                      <Icon name="pencil" size={20} color={'#144272'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.acctionBtn}
                      onPress={() => tglModal(item.id)}>
                      <Icon name="delete" size={20} color={'red'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-cog" size={48} color="#666" />
                <Text style={styles.emptyText}>No roles found.</Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 90}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Add Role Modal */}
        <Modal
          visible={modalVisible === 'Add'}
          transparent
          animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Add New Role</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setRole('');
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              <View style={styles.addCustomerForm}>
                <View style={styles.addCustomerFullRow}>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor={backgroundColors.dark}
                    placeholder="Enter role name"
                    value={role}
                    onChangeText={text => setRole(text)}
                  />
                </View>

                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={handleAddRole}>
                  <Icon name="account-plus-outline" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>Add Role</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/* Delete Role Modal */}
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
                  onPress={handleDeleteRole}>
                  <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Toast />
          </View>
        </Modal>

        {/* Edit Role Modal */}
        <Modal visible={edit} transparent animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>Edit Role</Text>
                <TouchableOpacity
                  onPress={() => {
                    setedit(!edit);
                    setEditRole('');
                    setSelectedRole(null);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              <View style={styles.addCustomerForm}>
                <View style={styles.addCustomerFullRow}>
                  <TextInput
                    style={styles.addCustomerInput}
                    placeholderTextColor="#999"
                    placeholder="Enter role name"
                    value={editRole}
                    onChangeText={t => setEditRole(t)}
                  />
                </View>

                <TouchableOpacity
                  style={styles.addCustomerSubmitBtn}
                  onPress={handleUpdateRole}>
                  <Icon name="account-edit" size={20} color="white" />
                  <Text style={styles.addCustomerSubmitText}>Update Role</Text>
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
              <Text style={styles.totalText}>Total: {totalRecords} roles</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTxtContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
  },
  roleName: {
    fontSize: 16,
    fontWeight: '700',
    color: backgroundColors.dark,
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

  // Add Role Modal Styles
  addCustomerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
  addCustomerFullRow: {
    marginBottom: 15,
  },
  addCustomerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 5,
  },
  addCustomerInput: {
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
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
