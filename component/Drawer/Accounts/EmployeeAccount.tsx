import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Image,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import {BackHandler} from 'react-native';
import BottomBar from '../../BottomBar';

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F0F2F5',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  shadow: '#000',
};

interface Employee {
  id: number;
  emp_name: string;
  emp_address: string;
  emp_contact: string;
  emp_cnic: string;
}

interface EmployeeDetails {
  emp_name: string;
  empac_balance: string;
  empac_date: string;
  empac_earning: string;
  empac_emp_id: number;
  empac_invoice_no: string;
  empac_withdraw_amount: string;
}

interface EmployeeAddForm {
  amount: string;
  note: string;
  date: Date;
  addedBy: string;
}

const initialEmployeeAddFrom: EmployeeAddForm = {
  amount: '',
  date: new Date(),
  note: '',
  addedBy: '',
};

export default function EmployeeAccount({navigation}: any) {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [Open, setOpen] = useState(false);
  const [modalDropdowOpen, setModalDropdowOpen] = useState(false);
  const [customerVal, setCustomerVal] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState('');
  const [employeeDropdown, setEmployeeDropdown] = useState<Employee[]>([]);
  const transformedEmp = employeeDropdown.map(emp => ({
    label: emp.emp_name,
    value: emp.id.toString(),
  }));
  const [empValue, setEmpValaue] = useState('');
  const [empData, setEmpData] = useState<EmployeeDetails[]>([]);
  const [cashAddFrom, setCashAddForm] = useState<EmployeeAddForm>(
    initialEmployeeAddFrom,
  );

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(null);
      return;
    }

    if (selectedDate) {
      if (showDatePicker === 'from') {
        setFromDate(selectedDate);
      } else if (showDatePicker === 'to') {
        setToDate(selectedDate);
      }
    }
    setShowDatePicker(null);
  };

  const modalDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(null);
      return;
    }

    if (selectedDate) {
      cashOnChange('date', selectedDate);
    }
    setShowDatePicker(null);
  };

  const cashOnChange = (field: keyof EmployeeAddForm, value: string | Date) => {
    setCashAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch Employee dropdown
  const fetchEmpDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchemployeedropdown`);
      setEmployeeDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Employee Details
  const fetchEmployeeDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.get(
        `${BASE_URL}/fetchemppayment?from=${from}&to=${to}&employee=${empValue}_token=${token}`,
      );
      setEmpData(res.data.emp);
      setCurrentPage(1);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Payment
  const addPayment = async () => {
    if (!customerVal) {
      Toast.show({
        type: 'error',
        text1: 'Please Select Employee First!',
        visibilityTime: 1500,
      });
      return;
    }

    if (
      !cashAddFrom.addedBy ||
      !cashAddFrom.amount ||
      !cashAddFrom.date ||
      !cashAddFrom.note
    ) {
      Toast.show({
        type: 'error',
        text1: 'Fields Missing',
        text2: 'Please fill all fields',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addpayment`, {
        emp_id: customerVal,
        emp_earning: cashAddFrom.amount,
        emp_acc_date: cashAddFrom.date.toISOString().split('T')[0],
        addedby: cashAddFrom.addedBy.trim(),
        note: cashAddFrom.note.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Payment has been added successfully!',
          visibilityTime: 1500,
        });
        setCustomerVal('');
        setCashAddForm(initialEmployeeAddFrom);
        setModalVisible('');
        fetchEmployeeDetails();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Withdraw Payment
  const withdrawPayment = async () => {
    if (!customerVal) {
      Toast.show({
        type: 'error',
        text1: 'Please Select Employee First!',
        visibilityTime: 1500,
      });
      return;
    }

    if (
      !cashAddFrom.addedBy ||
      !cashAddFrom.amount ||
      !cashAddFrom.date ||
      !cashAddFrom.note
    ) {
      Toast.show({
        type: 'error',
        text1: 'Fields Missing',
        text2: 'Please fill all fields',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addpayment`, {
        emp_id: customerVal,
        emp_withdraw_amount: cashAddFrom.amount,
        emp_acc_date: cashAddFrom.date.toISOString().split('T')[0],
        addedby: cashAddFrom.addedBy.trim(),
        note: cashAddFrom.note.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Payment has been Withdraw successfully!',
          visibilityTime: 1500,
        });
        setCustomerVal('');
        setCashAddForm(initialEmployeeAddFrom);
        setModalVisible('');
        fetchEmployeeDetails();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Earnings, withdraws, and balance
  const calculateTotals = () => {
    let totalEarning = 0;
    let totalWithdraw = 0;

    empData.forEach(emp => {
      const earnings = parseFloat(emp.empac_earning) || 0;
      const withdraws = parseFloat(emp.empac_withdraw_amount) || 0;

      totalEarning += earnings;
      totalWithdraw += withdraws;
    });

    return {
      totalEarning: totalEarning.toFixed(2),
      totalWithdraw: totalWithdraw.toFixed(2),
      netBalance: (totalEarning - totalWithdraw).toFixed(2),
    };
  };

  // Pagination helpers
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return empData.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(empData.length / ITEMS_PER_PAGE);

  // Pagination controls component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}>
          <Icon
            name="chevron-left"
            size={24}
            color={currentPage === 1 ? '#ccc' : THEME.primary}
          />
        </TouchableOpacity>

        <View style={styles.pageInfo}>
          <Text style={styles.pageText}>
            {currentPage} <Text style={{color: '#999'}}>/</Text> {totalPages}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.pageBtn,
            currentPage === totalPages && styles.pageBtnDisabled,
          ]}
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}>
          <Icon
            name="chevron-right"
            size={24}
            color={currentPage === totalPages ? '#ccc' : THEME.primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    fetchEmpDropdown();
    fetchEmployeeDetails();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [empValue, fromDate, toDate]);

  function formatNumber(num: number | string): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0';

    const abs = Math.abs(n);

    if (abs >= 10000000) {
      return (n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 2) + 'Cr';
    } else if (abs >= 100000) {
      return (n / 100000).toFixed(n % 100000 === 0 ? 0 : 2) + 'L';
    } else if (abs >= 1000) {
      return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 2) + 'K';
    } else {
      return n.toString();
    }
  }

  return (
    <View style={styles.container}>
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
            <Text style={styles.headerTitle}>Employee Account</Text>
            <View style={{width: 24}} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}>
        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: THEME.primary}]}
            onPress={() => setModalVisible('Payment')}>
            <Icon name="cash-plus" size={20} color="white" />
            <Text style={styles.actionBtnText}>Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: THEME.danger}]}
            onPress={() => setModalVisible('WithDraw')}>
            <Icon name="bank-remove" size={20} color="white" />
            <Text style={styles.actionBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Filter Options</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Employee</Text>
            <DropDownPicker
              items={transformedEmp}
              open={Open}
              value={empValue}
              setValue={setEmpValaue}
              setOpen={setOpen}
              placeholder="Select Employee"
              placeholderStyle={{color: '#999'}}
              textStyle={{color: THEME.textDark}}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={3000}
              zIndexInverse={1000}
              searchable
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date Range</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                onPress={() => setShowDatePicker('from')}
                style={styles.dateInput}>
                <Icon name="calendar" size={20} color={THEME.primary} />
                <Text style={styles.dateText}>
                  {fromDate ? fromDate.toLocaleDateString() : 'From Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDatePicker('to')}
                style={styles.dateInput}>
                <Icon name="calendar" size={20} color={THEME.primary} />
                <Text style={styles.dateText}>
                  {toDate ? toDate.toLocaleDateString() : 'To Date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Transaction List */}
        <View style={styles.listSection}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listHeaderTitle}>Transactions</Text>
          </View>

          {empData.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="receipt" size={48} color={THEME.textLight} />
              <Text style={styles.emptyText}>No transactions found.</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={getPaginatedData()}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
                renderItem={({item}) => (
                  <View style={styles.transactionCard}>
                    <View style={styles.transactionHeader}>
                      <View style={styles.invoiceBadge}>
                        <Icon
                          name="file-document-outline"
                          size={14}
                          color={THEME.primary}
                        />
                        <Text style={styles.invoiceText}>
                          {item.empac_invoice_no}
                        </Text>
                      </View>
                      <Text style={styles.dateTextList}>
                        {new Date(item.empac_date).toLocaleDateString('en-GB')}
                      </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statsRow}>
                      <View style={styles.statCol}>
                        <Text style={styles.statLabel}>Earning</Text>
                        <Text
                          style={[styles.statValue, {color: THEME.success}]}>
                          {formatNumber(item.empac_earning)}
                        </Text>
                      </View>
                      <View style={styles.statColCenter}>
                        <Text style={styles.statLabel}>Withdraw</Text>
                        <Text style={[styles.statValue, {color: THEME.danger}]}>
                          {formatNumber(item.empac_withdraw_amount)}
                        </Text>
                      </View>
                      <View style={styles.statColRight}>
                        <Text style={styles.statLabel}>Balance</Text>
                        <Text style={styles.statValue}>
                          {formatNumber(item.empac_balance)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              />
              <PaginationControls />
            </>
          )}
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Account Summary</Text>
          </View>
          <View style={styles.summaryBody}>
            {(() => {
              const {netBalance, totalEarning, totalWithdraw} =
                calculateTotals();
              return (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryItemLabel}>Total Earnings</Text>
                    <Text
                      style={[styles.summaryItemValue, {color: THEME.success}]}>
                      {formatNumber(totalEarning)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryItemLabel}>Total Withdraw</Text>
                    <Text
                      style={[styles.summaryItemValue, {color: THEME.danger}]}>
                      {formatNumber(totalWithdraw)}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryTotalRow}>
                    <Text style={styles.summaryTotalLabel}>Net Balance</Text>
                    <Text style={styles.summaryTotalValue}>
                      {formatNumber(netBalance)}
                    </Text>
                  </View>
                </>
              );
            })()}
          </View>
        </View>

        <View style={{height: 50}} />

        {showDatePicker && (
          <DateTimePicker
            value={
              showDatePicker === 'from'
                ? fromDate ?? new Date()
                : toDate ?? new Date()
            }
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}
      </ScrollView>

      {/* Add & WithDraw Payment Modal */}
      <Modal
        visible={modalVisible === 'Payment' || modalVisible === 'WithDraw'}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible('')}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalVisible === 'WithDraw'
                  ? 'Withdraw Payment'
                  : 'Add Payment'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setCustomerVal('');
                  setCashAddForm(initialEmployeeAddFrom);
                }}
                style={styles.closeButton}>
                <Icon name="close" size={24} color={THEME.textGray} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{maxHeight: 400}}
              showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Employee</Text>
                <DropDownPicker
                  items={transformedEmp}
                  open={modalDropdowOpen}
                  value={customerVal}
                  setValue={setCustomerVal}
                  setOpen={setModalDropdowOpen}
                  placeholder="Select Employee"
                  placeholderStyle={{color: '#999'}}
                  textStyle={{color: THEME.textDark}}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                  zIndex={3000}
                  zIndexInverse={1000}
                  searchable
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={cashAddFrom.amount}
                  maxLength={9}
                  onChangeText={t => cashOnChange('amount', t)}
                  placeholder="Enter amount"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker('from')}
                  style={styles.dateInput}>
                  <Icon name="calendar" size={20} color={THEME.primary} />
                  <Text style={styles.dateText}>
                    {cashAddFrom.date
                      ? cashAddFrom.date.toLocaleDateString()
                      : 'Select Date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Added By</Text>
                <TextInput
                  style={styles.input}
                  value={cashAddFrom.addedBy}
                  onChangeText={t => cashOnChange('addedBy', t)}
                  placeholder="Enter name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Note</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  value={cashAddFrom.note}
                  onChangeText={t => cashOnChange('note', t)}
                  placeholder="Enter note"
                  placeholderTextColor="#999"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => {
                modalVisible === 'Payment' && addPayment();
                modalVisible === 'WithDraw' && withdrawPayment();
              }}>
              <Text style={styles.submitBtnText}>
                {modalVisible === 'WithDraw'
                  ? 'Withdraw Payment'
                  : 'Add Payment'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- Header ---
  headerWrapper: {
    marginBottom: 0,
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // --- Action Buttons ---
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 2,
    gap: 5,
  },
  actionBtnText: {
    color: THEME.white,
    fontWeight: '600',
    fontSize: 13,
  },

  // --- Card Styles ---
  card: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textGray,
    marginBottom: 6,
  },
  dropdown: {
    backgroundColor: '#F9FAFB',
    borderColor: THEME.border,
    borderRadius: 10,
    height: 48,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: THEME.border,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  dateText: {
    fontSize: 13,
    color: THEME.textDark,
  },

  // --- List Section ---
  listSection: {
    marginBottom: 5,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textDark,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    marginTop: 10,
    color: THEME.textGray,
    fontSize: 14,
  },

  // --- Transaction Card ---
  transactionCard: {
    backgroundColor: THEME.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  invoiceText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.primary,
  },
  dateTextList: {
    fontSize: 12,
    color: THEME.textGray,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statColCenter: {
    flex: 1,
    alignItems: 'center',
  },
  statColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 11,
    color: THEME.textGray,
    marginBottom: 2,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
  },

  // --- Pagination ---
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
    gap: 16,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pageBtnDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  pageInfo: {
    backgroundColor: THEME.white,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
  },

  // --- Summary Card ---
  summaryCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  summaryHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    textTransform: 'uppercase',
  },
  summaryBody: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemLabel: {
    color: THEME.textGray,
    fontSize: 14,
  },
  summaryItemValue: {
    color: THEME.textDark,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: THEME.primaryLight,
    padding: 10,
    borderRadius: 8,
  },
  summaryTotalLabel: {
    color: THEME.textDark,
    fontSize: 16,
    fontWeight: '700',
  },
  summaryTotalValue: {
    color: THEME.primary,
    fontSize: 20,
    fontWeight: '800',
  },

  // --- Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
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
  closeButton: {
    padding: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    color: THEME.textDark,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
  submitBtn: {
    backgroundColor: THEME.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
