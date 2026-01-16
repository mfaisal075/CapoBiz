import {
  ActivityIndicator,
  BackHandler,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
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

// --- HELPER COMPONENT: Detail Row ---
const DetailRow = ({
  label,
  value,
  icon,
  isLast,
}: {
  label: string;
  value: string;
  icon: string;
  isLast?: boolean;
}) => (
  <View style={[styles.detailRow, isLast && {borderBottomWidth: 0}]}>
    <View style={styles.iconBox}>
      <Icon name={icon} size={20} color={THEME.primary} />
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '--'}</Text>
    </View>
  </View>
);

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
        setModalVisible('');
        navigation.navigate('Manage Expenses');
      }
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
      setModalVisible('Edit');
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

    const backKey = () => {
      navigation.navigate('Manage Expenses');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 100}}>
        {/* --- HEADER (Like CustomerPeople) --- */}
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Manage Expenses')}
              style={styles.iconBtn}>
              <Icon name="arrow-left" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Expense Details</Text>
            <TouchableOpacity
              onPress={() => setModalVisible('Delete')}
              style={styles.iconBtn}>
              <Icon name="trash-can-outline" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* --- CONTENT (Consolidated Single Card Overlapping Header) --- */}
        <View style={styles.contentContainer}>
          <View style={styles.mainCard}>
            {/* "Header" of the Card (Category Name) - Acts visually like the floating bar */}
            <View style={styles.cardTopRow}>
              <View style={styles.cardTitleContainer}>
                <Icon
                  name="tag-outline"
                  size={20}
                  color={THEME.primary}
                  style={{marginRight: 8}}
                />
                <Text style={styles.mainCardTitle}>
                  {expense?.category.expc_name || 'Loading...'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={fetchEditDetails}
                style={styles.editBtn}>
                <Icon name="pencil" size={18} color={THEME.primary} />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Details */}
            <DetailRow
              icon="currency-usd"
              label="Amount"
              value={expense?.expense.exp_amount || '0.00'}
            />
            <DetailRow
              icon="calendar-month-outline"
              label="Date"
              value={
                expense?.expense.exp_date
                  ? new Date(expense.expense.exp_date).toLocaleDateString(
                      'en-GB',
                      {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      },
                    )
                  : '--'
              }
            />
            <DetailRow
              icon="account-outline"
              label="Added By"
              value={expense?.expense.exp_addedby!}
            />
            <DetailRow
              icon="text-box-outline"
              label="Description"
              value={expense?.expense.exp_desc!}
              isLast
            />
          </View>
        </View>
      </ScrollView>

      {/* Delete Expense Modal */}
      <Modal
        visible={modalVisible === 'Delete'}
        transparent
        animationType="fade">
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.lottieContainer}>
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
                style={[styles.deleteModalBtn, {backgroundColor: '#F3F4F6'}]}
                onPress={() => setModalVisible('')}>
                <Text
                  style={[styles.deleteModalBtnText, {color: THEME.textDark}]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteModalBtn, {backgroundColor: THEME.danger}]}
                onPress={handleDelete}>
                <Text style={[styles.deleteModalBtnText, {color: '#fff'}]}>
                  Yes, Delete
                </Text>
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
          <View style={styles.editModalContainer}>
            {/* Header */}
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Expense</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setEditFrom(initialEditExpense);
                  setEditCategoryValue('');
                }}
                style={styles.closeBtn}>
                <Icon name="close" size={20} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.editModalBody}>
                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <DropDownPicker
                    items={transformedCategories}
                    open={editCatOpen}
                    setOpen={setEditCatOpen}
                    value={editCategoryValue}
                    setValue={setEditCategoryValue}
                    placeholder="Select category *"
                    placeholderStyle={{color: '#999'}}
                    textStyle={{color: THEME.textDark}}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    listMode="SCROLLVIEW"
                    zIndex={3000}
                    zIndexInverse={1000}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Amount</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    placeholderTextColor="#999"
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

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Added By</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter name"
                    placeholderTextColor="#999"
                    value={editFrom.addedBy}
                    onChangeText={t => editOnChange('addedBy', t)}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowEditDatePicker(true)}>
                    <Text style={styles.dateText}>
                      {editFrom.date.toLocaleDateString('en-GB')}
                    </Text>
                    <Icon name="calendar" size={20} color={THEME.primary} />
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

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {height: 100, textAlignVertical: 'top', paddingTop: 10},
                    ]}
                    placeholder="Enter description"
                    placeholderTextColor="#999"
                    value={editFrom.description}
                    onChangeText={t => editOnChange('description', t)}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, loading && {opacity: 0.7}]}
                  onPress={handleEditExpense}
                  disabled={loading}>
                  <LinearGradient
                    colors={[THEME.gradientStart, THEME.gradientEnd]}
                    style={styles.submitBtnGradient}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Icon
                          name="check-circle-outline"
                          size={20}
                          color="white"
                        />
                        <Text style={styles.submitText}>Update Expense</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
          <Toast />
        </View>
      </Modal>
      <BottomBar />
    </View>
  );
};

export default ExpenseDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  // --- HEADER (From CustomerPeople) ---
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 60, // Extra space overlap
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

  // --- CONTENT ---
  contentContainer: {
    paddingHorizontal: 12,
  },
  mainCard: {
    marginTop: -40, // Overlap the header
    backgroundColor: THEME.white,
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mainCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
    flex: 1,
  },
  editBtn: {
    padding: 6,
    backgroundColor: THEME.primaryLight,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: THEME.textGray,
    marginBottom: 2,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: THEME.textDark,
    fontWeight: '600',
  },

  // --- Modals ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  editModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },
  closeBtn: {
    padding: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  editModalBody: {
    padding: 20,
  },
  formRow: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.textDark,
  },
  dropdown: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    minHeight: 45,
  },
  dropdownContainer: {
    borderColor: '#E5E7EB',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
  },
  dateText: {
    fontSize: 14,
    color: THEME.textDark,
  },
  submitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  submitText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // Delete Modal
  deleteModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  deleteModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  lottieContainer: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginBottom: 8,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteModalBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
