import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import backgroundColors from '../../Colors';
import {ScrollView} from 'react-native';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';

interface ExpenseDetails {
  expense: {
    exp_amount: string;
    exp_addedby: string;
    exp_desc: string;
    exp_date: string;
  };
  category: {
    expc_name: string;
  };
}

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

interface ExpenseCategories {
  id: string;
  expc_name: string;
}

const ExpenseDetails = ({navigation, route}: any) => {
  const {id} = route.params;
  const {token} = useUser();
  const [expense, setExpense] = useState<ExpenseDetails | null>(null);
  const [modalVisible, setModalVisible] = useState('');
  const [editFrom, setEditFrom] = useState<EditExpense>(initialEditExpense);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const [editCatOpen, setEditCatOpen] = useState(false);
  const [expCategories, setExpCategories] = useState<ExpenseCategories[]>([]);
  const transformedCategories = expCategories.map(cat => ({
    label: cat.expc_name,
    value: cat.id.toString(),
  }));
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit Form OnChange
  const editOnChange = (field: keyof EditExpense, value: string | Date) => {
    setEditFrom(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const onEditDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || editFrom.date;
    setShowEditDatePicker(false);
    editOnChange('date', currentDate);
  };

  const fetchExDetails = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/expshow?id=${id}&_token=${token}`,
      );
      setExpense(res.data);
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

  // Delete Expense
  const handleDelete = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/expdelete`, {
        id,
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
      setModalVisible('');
      navigation.navigate('Manage Expenses');
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch expense details to edit
  const fetchEditDetails = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editexpenses?id=${id}&_token=${token}`,
      );

      const data = res.data;
      setEditFrom({
        addedBy: data.exp_addedby,
        amount: data.exp_amount,
        category: '',
        date: new Date(data.exp_date),
        description: data.exp_desc,
      });
      setEditCategoryValue(data.exp_expc_id.toString());
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

    if (parseFloat(editFrom.amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Amount must be greater than 0!',
        visibilityTime: 2000,
      });
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(editFrom.amount)) {
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
      const res = await axios.post(`${BASE_URL}/updateexpenses`, {
        cat_id: editCategoryValue,
        exp_id: id,
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
        fetchExDetails();
        setModalVisible('');
        setEditCategoryValue('');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExDetails();
    getExpenseDropdown();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Manage Expenses');
            }}>
            <Icon
              name="chevron-left"
              size={28}
              color={backgroundColors.light}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expense Details</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerBtn]}
          onPress={() => {
            setModalVisible('Delete');
          }}>
          <Icon name="delete" size={28} color={'#fff'} />
        </TouchableOpacity>
      </View>

      {/* Details */}
      <ScrollView
        style={styles.detailsContainer}
        showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarBox}>
          <Image
            source={require('../../../assets/expense.jpg')}
            style={styles.avatar}
          />
          <Text style={styles.custName}>{expense?.category.expc_name}</Text>
        </View>

        {/* Inner Details */}
        <View style={styles.innerDetails}>
          <View style={styles.innerHeader}>
            <Text style={styles.headerText}>Expense Details</Text>
            <TouchableOpacity
              style={{flexDirection: 'row', gap: 5}}
              onPress={() => {
                fetchEditDetails();
                setModalVisible('Edit');
              }}>
              <Text style={styles.editText}>Edit</Text>
              <Icon
                name="square-edit-outline"
                size={18}
                color={backgroundColors.dark}
              />
            </TouchableOpacity>
          </View>

          {/* Details */}
          <View style={styles.detailsView}>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Expense</Text>
              <Text style={styles.value}>
                {expense?.category.expc_name ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.value}>
                {expense?.expense.exp_amount ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Added By</Text>
              <Text style={styles.value}>
                {expense?.expense.exp_addedby ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>
                {expense?.expense.exp_date
                  ? new Date(expense.expense.exp_date)
                      .toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                      .replace(/ /g, '-')
                  : '--'}
              </Text>
            </View>
            <View style={[styles.detailsRow, {borderBottomWidth: 0}]}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>
                {expense?.expense.exp_desc ?? '--'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

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
                }}>
                <Text style={[styles.deleteModalBtnText, styles.cancelBtnText]}>
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
            <View
              style={[
                styles.modalHeader,
                {
                  paddingHorizontal: 15,
                  marginTop: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#00000039',
                },
              ]}>
              <Text style={styles.modalTitle}>Edit Expense</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setEditFrom(initialEditExpense);
                  setEditCategoryValue('');
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
                    maxLength={11}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={editFrom.amount}
                    onChangeText={t => {
                      const filtered = t
                        .replace(/[^0-9.]/g, '')
                        .replace(/(\..*)\./g, '$1');
                      editOnChange('amount', filtered);
                    }}
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
                  <Icon
                    name="calendar"
                    size={20}
                    color={backgroundColors.dark}
                  />
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
                style={[
                  styles.submitBtn,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleEditExpense}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon
                      name="pencil-circle-outline"
                      size={20}
                      color="white"
                    />
                    <Text style={styles.submitText}>Update Expense</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Toast />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ExpenseDetails;

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
  headerCenter: {
    flex: 1,
    gap: 10,
    flexDirection: 'row',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
  },

  // Details container
  detailsContainer: {
    flex: 1,
    paddingHorizontal: '3%',
  },
  avatarBox: {
    marginVertical: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    height: 125,
    width: 125,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  custName: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 10,
    color: backgroundColors.primary,
  },

  // Inner Details
  innerDetails: {
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  innerHeader: {
    width: '100%',
    height: 50,
    borderBottomColor: backgroundColors.primary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: backgroundColors.dark,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
  },
  detailsView: {
    flex: 1,
  },
  detailsRow: {
    alignItems: 'baseline',
    paddingVertical: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: backgroundColors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.primary,
  },
  value: {
    fontSize: 16,
    color: backgroundColors.dark,
  },

  // Delete Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '95%',
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

  // Edit Expense Modal Styles
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '70%',
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
    paddingHorizontal: 20,
    paddingVertical: 15,
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
});
