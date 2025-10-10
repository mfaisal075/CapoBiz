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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../../Colors';

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

export default function EmployeeAccount() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [selectedTab, setSelectedTab] = useState('Single');
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
  const [itemsPerPage] = useState(5);

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
  const paginateData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return empData.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(empData.length / itemsPerPage);

  // Pagination controls component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationBtn,
            currentPage === 1 && styles.disabledBtn,
          ]}
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}>
          <Icon
            name="chevron-left"
            size={20}
            color={currentPage === 1 ? '#666' : 'white'}
          />
        </TouchableOpacity>

        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            {currentPage} of {totalPages}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.paginationBtn,
            currentPage === totalPages && styles.disabledBtn,
          ]}
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}>
          <Icon
            name="chevron-right"
            size={20}
            color={currentPage === totalPages ? '#666' : 'white'}
          />
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    fetchEmpDropdown();
    fetchEmployeeDetails();
  }, [empValue, fromDate, toDate]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[backgroundColors.primary, backgroundColors.secondary]}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Employee Account</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}
            onPress={() => {}}
            disabled>
            <Icon name="account-balance" size={24} color="transparent" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} nestedScrollEnabled>
          {/* Action Buttons */}
          <View style={[styles.toggleBtnContainer, {marginVertical: 5}]}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {backgroundColor: backgroundColors.primary},
              ]}
              onPress={() => setModalVisible('Payment')}>
              <Icon name="payment" size={16} color="white" />
              <Text style={styles.actionBtnText}>Add Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {backgroundColor: backgroundColors.primary},
              ]}
              onPress={() => setModalVisible('WithDraw')}>
              <Icon name="account-balance-wallet" size={16} color="white" />
              <Text style={styles.actionBtnText}>Withdraw Payment</Text>
            </TouchableOpacity>
          </View>

          {/* Date Range Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date Range</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                onPress={() => setShowDatePicker('from')}
                style={styles.dateInput}>
                <Icon name="event" size={20} color="white" />
                <Text style={styles.dateText}>
                  {fromDate ? fromDate.toLocaleDateString() : 'From Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDatePicker('to')}
                style={styles.dateInput}>
                <Icon name="event" size={20} color="white" />
                <Text style={styles.dateText}>
                  {toDate ? toDate.toLocaleDateString() : 'To Date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

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
              themeVariant="dark"
            />
          )}

          {/* Employee Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Employee Information</Text>
            <View style={styles.dropdownRow}>
              <Text style={styles.inputLabel}>Select Employee</Text>
              <DropDownPicker
                items={transformedEmp}
                open={Open}
                value={empValue}
                setValue={setEmpValaue}
                setOpen={setOpen}
                placeholder="Choose employee..."
                placeholderStyle={styles.dropdownPlaceholder}
                textStyle={styles.dropdownText}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#fff" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#fff" />
                )}
                listMode="SCROLLVIEW"
                listItemLabelStyle={{color: '#144272'}}
              />
            </View>
          </View>

          {/* Account Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Transactions</Text>

            {empData.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="receipt" size={40} color="rgba(255,255,255,0.5)" />
                <Text style={styles.emptyStateText}>No transactions found</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={paginateData()}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                  renderItem={({item}) => (
                    <View style={styles.transactionCard}>
                      <View style={styles.transactionHeader}>
                        <Text style={styles.invoiceNumber}>
                          {item.empac_invoice_no}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {new Date(item.empac_date).toLocaleDateString(
                            'en-GB',
                          )}
                        </Text>
                      </View>

                      <View style={styles.transactionDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Earnings:</Text>
                          <Text style={styles.detailValue}>
                            {item.empac_earning}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Withdrawals:</Text>
                          <Text style={styles.detailValue}>
                            {item.empac_withdraw_amount}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Balance:</Text>
                          <Text style={styles.detailValue}>
                            {item.empac_balance}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                />

                <PaginationControls />
              </>
            )}

            {/* Summary Section */}
            <View style={styles.summarySection}>
              {(() => {
                const {netBalance, totalEarning, totalWithdraw} =
                  calculateTotals();
                return (
                  <>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Earnings:</Text>
                      <Text style={styles.summaryValue}>{totalEarning}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Withdraw:</Text>
                      <Text style={styles.summaryValue}>{totalWithdraw}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                      <Text style={[styles.summaryLabel, styles.totalLabel]}>
                        Net Balance:
                      </Text>
                      <Text style={[styles.summaryValue, styles.totalValue]}>
                        {netBalance}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Add & WithDraw Payment Modal */}
      <Modal
        visible={modalVisible === 'Payment' || modalVisible === 'WithDraw'}
        transparent
        animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidContainer}>
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.modalContainer}>
              {/* Header */}
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
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView
                style={styles.modalBodyScroll}
                contentContainerStyle={styles.modalBodyContent}
                keyboardShouldPersistTaps="handled">
                <View style={styles.modalBody}>
                  <View style={styles.dropdownRow}>
                    <Text style={[styles.inputLabel, {color: '#000'}]}>
                      Select Employee
                    </Text>
                    <DropDownPicker
                      items={transformedEmp}
                      open={modalDropdowOpen}
                      value={customerVal}
                      setValue={setCustomerVal}
                      setOpen={setModalDropdowOpen}
                      placeholder="Choose employee..."
                      placeholderStyle={{color: '#666'}}
                      textStyle={{color: '#144272'}}
                      style={[styles.dropdown, {borderColor: '#ccc'}]}
                      dropDownContainerStyle={{
                        backgroundColor: 'white',
                        borderColor: '#144272',
                        borderRadius: 10,
                        marginTop: 2,
                      }}
                      listItemLabelStyle={{color: '#144272'}}
                      ArrowUpIconComponent={() => (
                        <Icon name="keyboard-arrow-up" size={18} color="#666" />
                      )}
                      ArrowDownIconComponent={() => (
                        <Icon
                          name="keyboard-arrow-down"
                          size={18}
                          color="#666"
                        />
                      )}
                      listMode="SCROLLVIEW"
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={[styles.inputLabel, {color: '#000'}]}>
                      Amount <Text style={{color: 'red'}}>*</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {color: '#000', borderColor: '#ccc'},
                      ]}
                      keyboardType="number-pad"
                      value={cashAddFrom.amount}
                      onChangeText={t => cashOnChange('amount', t)}
                      placeholder="Enter amount"
                      placeholderTextColor="#666"
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={[styles.inputLabel, {color: '#000'}]}>
                      Date <Text style={{color: 'red'}}>*</Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker('from')}
                      style={[styles.dateInput, {borderColor: '#ccc'}]}>
                      <Icon name="event" size={20} color="#666" />
                      <Text style={[styles.dateText, {color: '#000'}]}>
                        {cashAddFrom.date
                          ? cashAddFrom.date.toLocaleDateString()
                          : 'Select Date'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={[styles.inputLabel, {color: '#000'}]}>
                      Added By <Text style={{color: 'red'}}>*</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {color: '#000', borderColor: '#ccc'},
                      ]}
                      value={cashAddFrom.addedBy}
                      onChangeText={t => cashOnChange('addedBy', t)}
                      placeholder="Enter name"
                      placeholderTextColor="#666"
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={[styles.inputLabel, {color: '#000'}]}>
                      Note
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        {color: '#000', borderColor: '#ccc'},
                      ]}
                      multiline
                      numberOfLines={4}
                      value={cashAddFrom.note}
                      onChangeText={t => cashOnChange('note', t)}
                      placeholder="Enter note"
                      placeholderTextColor="#666"
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Footer Button */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => {
                    modalVisible === 'Payment' && addPayment();
                    modalVisible === 'WithDraw' && withdrawPayment();
                  }}>
                  <Text style={styles.submitButtonText}>
                    {modalVisible === 'WithDraw'
                      ? 'Withdraw Payment'
                      : 'Add Payment'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  toggleBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  section: {
    backgroundColor: 'rgba(15, 45, 78, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  dropdownRow: {
    marginBottom: 16,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  dropdown: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minHeight: 40,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    marginTop: 2,
    maxHeight: 200,
  },
  dropdownText: {
    color: 'white',
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  transactionDetails: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  detailValue: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  summarySection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  paginationBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  disabledBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pageIndicator: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  keyboardAvoidContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    marginTop: 50,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalBodyScroll: {
    flex: 1,
  },
  modalBodyContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  modalBody: {
    padding: 15,
  },
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#144272',
  },
  closeButton: {
    padding: 5,
  },
  submitButton: {
    backgroundColor: '#144272',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inputRow: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});
