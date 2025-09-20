import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

interface Expenses {
  expc_name: string;
  id: number;
  exp_amount: string;
  exp_addedby: string;
  exp_date: string;
  exp_desc: string;
  exp_expc_id: number;
}

interface ExpenseCategories {
  id: string;
  expc_name: string;
}

interface AddExpense {
  category: string;
  amount: string;
  addedBy: string;
  date: Date;
  description: string;
}

const initialAddExpense: AddExpense = {
  addedBy: '',
  amount: '',
  category: '',
  date: new Date(),
  description: '',
};

interface EditExpense {
  category: string;
  amount: string;
  addedBy: string;
  date: Date;
  description: string;
}

const initialEditExpense: EditExpense = {
  addedBy: '',
  amount: '',
  category: '',
  date: new Date(),
  description: '',
};

export default function ManageExpenses() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [expenses, setExpenses] = useState<Expenses[]>([]);
  const [totalExpense, setTotalExpense] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<Expenses[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [expCategories, setExpCategories] = useState<ExpenseCategories[]>([]);
  const transformedCategories = expCategories.map(cat => ({
    label: cat.expc_name,
    value: cat.id.toString(),
  }));
  const [addFrom, setAddFrom] = useState<AddExpense>(initialAddExpense);
  const [editFrom, setEditFrom] = useState<EditExpense>(initialEditExpense);
  const [categoryValue, setCategoryValue] = useState('');
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const [editCatOpen, setEditCatOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = expenses.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = expenses.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Add Form OnChange
  const addOnChange = (field: keyof AddExpense, value: string | Date) => {
    setAddFrom(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Edit Form OnChange
  const editOnChange = (field: keyof EditExpense, value: string | Date) => {
    setEditFrom(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Date On Change
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || addFrom.date;
    setShowDatePicker(false);
    addOnChange('date', currentDate);
  };

  const onEditDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || editFrom.date;
    setShowEditDatePicker(false);
    editOnChange('date', currentDate);
  };

  // Fetch Expenses
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchexpenses`);
      setExpenses(res.data.exp);
      setTotalExpense(res.data.total);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Expense
  const handleDelete = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/expdelete`, {
        id: selectedExpense[0].id,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Expense has been Deleted successfully',
          visibilityTime: 1500,
        });
      }
      fetchExpenses();
      setSelectedExpense([]);
      setModalVisible('');
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Expenses Dropdown
  const getExpenseDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchexpensecategorydropdown`);
      setExpCategories(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Expense
  const handleAddExpense = async () => {
    if (!categoryValue) {
      Toast.show({
        type: 'error',
        text1: 'Please select expense category',
        visibilityTime: 1500,
      });
      return;
    }

    if (!addFrom.amount || !addFrom.addedBy || !addFrom.description) {
      Toast.show({
        type: 'error',
        text1: 'Please fill all fields!',
        visibilityTime: 1500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/addexpense`, {
        cat_id: categoryValue,
        exp_amount: addFrom.amount,
        exp_addedby: addFrom.addedBy.trim(),
        exp_date: addFrom.date.toISOString().split('T')[0],
        exp_desc: addFrom.description,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Expense has been added successfully',
          visibilityTime: 1500,
        });
        fetchExpenses();
        setAddFrom(initialAddExpense);
        setModalVisible('');
        setCategoryValue('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Edit Expense
  const handleEditExpense = async () => {
    if (!editCategoryValue) {
      Toast.show({
        type: 'error',
        text1: 'Please select expense category',
        visibilityTime: 1500,
      });
      return;
    }

    if (!editFrom.amount || !editFrom.addedBy || !editFrom.description) {
      Toast.show({
        type: 'error',
        text1: 'Please fill all fields!',
        visibilityTime: 1500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/updateexpenses`, {
        cat_id: editCategoryValue,
        exp_id: selectedExpense[0]?.id,
        exp_amount: editFrom.amount,
        exp_addedby: editFrom.addedBy.trim(),
        exp_date: editFrom.date.toISOString().split('T')[0],
        exp_desc: editFrom.description,
        _method: 'PUT',
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Expense has been updated successfully',
          visibilityTime: 1500,
        });
        fetchExpenses();
        setEditFrom(initialAddExpense);
        setModalVisible('');
        setEditCategoryValue('');
        setSelectedExpense([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    getExpenseDropdown();
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
            <Text style={styles.headerTitle}>Manage Expenses</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible('Add')}
            style={styles.headerBtn}>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Expenses List */}
        <View>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.expc_name?.charAt(0) || 'E'}
                    </Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.expc_name}</Text>
                    <Text style={styles.subText}>
                      {new Date(item.exp_date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('View');
                        setSelectedExpense([item]);
                      }}>
                      <Icon
                        name="eye"
                        size={20}
                        color={'#144272'}
                        style={styles.actionIcon}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('Edit');
                        setEditFrom({
                          addedBy: item.exp_addedby,
                          amount: item.exp_amount,
                          category: '',
                          date: new Date(item.exp_date),
                          description: item.exp_desc,
                        });
                        setEditCategoryValue(item.exp_expc_id.toString());
                        setSelectedExpense([item]);
                      }}>
                      <Icon
                        name="pencil"
                        size={20}
                        color={'#144272'}
                        style={styles.actionIcon}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('Delete');
                        setSelectedExpense([item]);
                      }}>
                      <Icon
                        name="delete"
                        size={20}
                        color={'#144272'}
                        style={styles.actionIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="cash"
                        size={16}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Amount:</Text>
                    </View>
                    <Text style={styles.valueText}>{item.exp_amount}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="account"
                        size={16}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Added By:</Text>
                    </View>
                    <Text style={styles.valueText}>{item.exp_addedby}</Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No expenses found.
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 120}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Total Expense */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Expense Amount:</Text>
          <Text style={styles.totalText}>{totalExpense ?? '0'}</Text>
        </View>

        {/* Add Expense Modal */}
        <Modal
          visible={modalVisible === 'Add'}
          transparent
          animationType="slide">
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Expense</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setAddFrom(initialAddExpense);
                    setCategoryValue('');
                  }}
                  style={styles.modalCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                <View style={styles.dropdownRow}>
                  <Text style={styles.label}>Expense Category *</Text>
                  <DropDownPicker
                    items={transformedCategories}
                    open={categoryOpen}
                    setOpen={setCategoryOpen}
                    value={categoryValue}
                    setValue={setCategoryValue}
                    placeholder="Select expense category"
                    placeholderStyle={styles.dropdownPlaceholder}
                    textStyle={styles.dropdownText}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    listMode="SCROLLVIEW"
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Amount *</Text>
                    <TextInput
                      style={styles.input}
                      placeholderTextColor="#999"
                      placeholder="Enter amount"
                      keyboardType="numeric"
                      value={addFrom.amount}
                      onChangeText={t => addOnChange('amount', t)}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>Added By *</Text>
                    <TextInput
                      style={styles.input}
                      placeholderTextColor="#999"
                      placeholder="Enter name"
                      value={addFrom.addedBy}
                      onChangeText={t => addOnChange('addedBy', t)}
                    />
                  </View>
                </View>

                <View style={styles.dateRow}>
                  <Text style={styles.label}>Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateText}>
                      {addFrom.date.toLocaleDateString('en-GB')}
                    </Text>
                    <Icon name="calendar" size={20} color="#144272" />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={addFrom.date}
                      mode="date"
                      display="default"
                      onChange={onDateChange}
                    />
                  )}
                </View>

                <View style={styles.fullRow}>
                  <Text style={styles.label}>Description *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {height: 100, textAlignVertical: 'top'},
                    ]}
                    placeholderTextColor="#999"
                    placeholder="Enter description"
                    value={addFrom.description}
                    onChangeText={t => addOnChange('description', t)}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleAddExpense}>
                  <Icon name="plus-circle-outline" size={20} color="white" />
                  <Text style={styles.submitText}>Add Expense</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Delete Expense Modal */}
        <Modal
          visible={modalVisible === 'Delete'}
          transparent
          animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.deleteModalContainer}>
              <View style={styles.animationContainer}>
                <LottieView
                  style={styles.animation}
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
                  style={[styles.deleteModalBtn, styles.cancelBtn]}
                  onPress={() => {
                    setModalVisible('');
                    setSelectedExpense([]);
                  }}>
                  <Text
                    style={[styles.deleteModalBtnText, styles.cancelBtnText]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteModalBtn, styles.confirmBtn]}
                  onPress={handleDelete}>
                  <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Expense Modal */}
        <Modal
          visible={modalVisible === 'Edit'}
          transparent
          animationType="slide">
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Expense</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setEditFrom(initialEditExpense);
                    setEditCategoryValue('');
                  }}
                  style={styles.modalCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                <View style={styles.dropdownRow}>
                  <Text style={styles.label}>Expense Category *</Text>
                  <DropDownPicker
                    items={transformedCategories}
                    open={editCatOpen}
                    setOpen={setEditCatOpen}
                    value={editCategoryValue}
                    setValue={setEditCategoryValue}
                    placeholder="Select expense category"
                    placeholderStyle={styles.dropdownPlaceholder}
                    textStyle={styles.dropdownText}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    listMode="SCROLLVIEW"
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Amount *</Text>
                    <TextInput
                      style={styles.input}
                      placeholderTextColor="#999"
                      placeholder="Enter amount"
                      keyboardType="numeric"
                      value={editFrom.amount}
                      onChangeText={t => editOnChange('amount', t)}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>Added By *</Text>
                    <TextInput
                      style={styles.input}
                      placeholderTextColor="#999"
                      placeholder="Enter name"
                      value={editFrom.addedBy}
                      onChangeText={t => editOnChange('addedBy', t)}
                    />
                  </View>
                </View>

                <View style={styles.dateRow}>
                  <Text style={styles.label}>Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowEditDatePicker(true)}>
                    <Text style={styles.dateText}>
                      {editFrom.date.toLocaleDateString('en-GB')}
                    </Text>
                    <Icon name="calendar" size={20} color="#144272" />
                  </TouchableOpacity>
                  {showEditDatePicker && (
                    <DateTimePicker
                      value={editFrom.date}
                      mode="date"
                      display="default"
                      onChange={onEditDateChange}
                    />
                  )}
                </View>

                <View style={styles.fullRow}>
                  <Text style={styles.label}>Description *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {height: 100, textAlignVertical: 'top'},
                    ]}
                    placeholderTextColor="#999"
                    placeholder="Enter description"
                    value={editFrom.description}
                    onChangeText={t => editOnChange('description', t)}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleEditExpense}>
                  <Icon name="pencil-circle-outline" size={20} color="white" />
                  <Text style={styles.submitText}>Update Expense</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* View Expense Modal */}
        <Modal
          visible={modalVisible === 'View'}
          transparent
          animationType="slide">
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Expense Details</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setSelectedExpense([]);
                  }}
                  style={styles.modalCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {selectedExpense.length > 0 && (
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailValue}>
                      {selectedExpense[0].expc_name}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.detailValue}>
                      {selectedExpense[0].exp_amount}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Added By:</Text>
                    <Text style={styles.detailValue}>
                      {selectedExpense[0].exp_addedby}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedExpense[0].exp_date).toLocaleDateString(
                        'en-GB',
                      )}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.detailValue}>
                      {selectedExpense[0].exp_desc || 'N/A'}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
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

  // Card Styling
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
    marginHorizontal: 10,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#666',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionIcon: {
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
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },

  // Total Container
  totalContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 66, 114, 0.8)',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#144272',
  },
  modalCloseBtn: {
    padding: 5,
  },
  modalForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  field: {
    flex: 1,
    marginHorizontal: 5,
  },
  fullRow: {
    marginBottom: 15,
  },
  dropdownRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
    marginBottom: 5,
  },
  input: {
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
  dropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 42,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  dropdownText: {
    color: '#333',
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  dateRow: {
    marginBottom: 15,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#144272',
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Delete Modal
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
  },
  animationContainer: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  animation: {
    flex: 1,
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
  cancelBtn: {
    backgroundColor: '#e0e0e0',
  },
  confirmBtn: {
    backgroundColor: '#d9534f',
  },
  deleteModalBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cancelBtnText: {
    color: '#144272',
  },

  // View Modal Details
  detailsContainer: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
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
});
