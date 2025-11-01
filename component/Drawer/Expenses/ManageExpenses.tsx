import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
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
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import backgroundColors from '../../Colors';
import {ActivityIndicator} from 'react-native-paper';

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

export default function ManageExpenses({navigation}: any) {
  const {openDrawer} = useDrawer();
  const [expenses, setExpenses] = useState<Expenses[]>([]);
  const [totalExpense, setTotalExpense] = useState('');
  const [modalVisible, setModalVisible] = useState('');
  const [expCategories, setExpCategories] = useState<ExpenseCategories[]>([]);
  const transformedCategories = expCategories.map(cat => ({
    label: cat.expc_name,
    value: cat.id.toString(),
  }));
  const [addFrom, setAddFrom] = useState<AddExpense>(initialAddExpense);
  const [categoryValue, setCategoryValue] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Expenses[]>([]);
  const [masterData, setMasterData] = useState<Expenses[]>([]);

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

  // Add Form OnChange
  const addOnChange = (field: keyof AddExpense, value: string | Date) => {
    setAddFrom(prev => ({
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

  // Fetch Expenses
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchexpenses`);

      const expData = res.data.exp;

      setFilteredData(expData);
      setMasterData(expData);
      setTotalExpense(res.data.total);
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

    if (parseFloat(addFrom.amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Amount must be greater than 0!',
        visibilityTime: 2000,
      });
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(addFrom.amount)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Please enter a valid numeric amount.',
        visibilityTime: 2000,
      });
      return;
    }

    setLoading(true);

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
    } finally {
      setLoading(false);
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
    fetchExpenses();
    getExpenseDropdown();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Manage Expenses</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setModalVisible('Add');
            }}
            style={[styles.headerBtn]}>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchFilter}>
          <Icon name="magnify" size={36} color={backgroundColors.dark} />
          <TextInput
            placeholder="Search by category name"
            style={styles.search}
            value={searchQuery}
            onChangeText={text => searchFilter(text)}
          />
        </View>

        {/* Total Expense */}
        {currentData.length > 0 && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total Expense Amount:</Text>
            <Text style={styles.totalText}>{totalExpense ?? '0'}</Text>
          </View>
        )}

        {/* Expenses List */}
        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  navigation.navigate('ExpenseDetails', {
                    id: item.id,
                  });
                }}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>{item.expc_name}</Text>
                    <Text style={styles.subText}>
                      <Icon name="calendar" size={12} color="#666" />{' '}
                      {new Date(item.exp_date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="cash" size={12} color="#666" />{' '}
                      {item.exp_amount}
                    </Text>
                  </View>

                  <View style={styles.actionRow}>
                    <Icon
                      name="chevron-right"
                      size={28}
                      color={backgroundColors.dark}
                    />
                  </View>
                </View>
              </TouchableOpacity>
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

        {/* Add Expense Modal */}
        <Modal
          visible={modalVisible === 'Add'}
          transparent
          animationType="slide">
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.modalContainer}>
              <View
                style={[
                  styles.modalHeader,
                  {
                    paddingHorizontal: 15,
                    marginTop: 10,
                    borderBottomWidth: 1,
                  },
                ]}>
                <Text style={styles.modalTitle}>Add New Expense</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setAddFrom(initialAddExpense);
                    setCategoryValue('');
                  }}
                  style={styles.modalCloseBtn}>
                  <Icon name="close" size={20} color={backgroundColors.dark} />
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
                      maxLength={11}
                      placeholder="Enter amount"
                      keyboardType="numeric"
                      value={addFrom.amount}
                      onChangeText={t => {
                        const filtered = t
                          .replace(/[^0-9.]/g, '')
                          .replace(/(\..*)\./g, '$1');
                        addOnChange('amount', filtered);
                      }}
                      editable={!loading}
                    />
                  </View>
                </View>
                <View style={[styles.row, {marginVertical: 10}]}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Added By *</Text>
                    <TextInput
                      style={styles.input}
                      placeholderTextColor="#999"
                      placeholder="Enter name"
                      value={addFrom.addedBy}
                      onChangeText={t => addOnChange('addedBy', t)}
                      editable={!loading}
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
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    loading && styles.submitButtonDisabled,
                  ]}
                  onPress={handleAddExpense}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon
                        name="plus-circle-outline"
                        size={20}
                        color="white"
                      />
                      <Text style={styles.submitText}>Add Expense</Text>
                    </>
                  )}
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
              <Text
                style={{
                  color: '#fff',
                  fontSize: 12,
                  marginTop: 2,
                  opacity: 0.8,
                }}>
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
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

  // Total Container
  totalContainer: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  totalText: {
    color: backgroundColors.dark,
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '75%',
    width: '95%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.dark,
  },
  modalCloseBtn: {
    padding: 5,
  },
  modalForm: {
    padding: 15,
  },
  field: {
    flex: 1,
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
    color: backgroundColors.dark,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 48,
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
    minHeight: 48,
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
    backgroundColor: backgroundColors.primary,
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
  submitButtonDisabled: {
    opacity: 0.7,
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
});
