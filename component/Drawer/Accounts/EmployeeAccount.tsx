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
            color={
              currentPage === 1 ? 'rgba(0,0,0,0.3)' : backgroundColors.dark
            }
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
            color={
              currentPage === totalPages
                ? 'rgba(0,0,0,0.3)'
                : backgroundColors.dark
            }
          />
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    fetchEmpDropdown();
    fetchEmployeeDetails();
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
            <Text style={styles.headerTitle}>Employee Account</Text>
          </View>
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
              <Icon name="payment" size={18} color="white" />
              <Text style={styles.actionBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {backgroundColor: backgroundColors.danger},
              ]}
              onPress={() => setModalVisible('WithDraw')}>
              <Icon name="account-balance-wallet" size={18} color="white" />
              <Text style={styles.actionBtnText}>-</Text>
            </TouchableOpacity>
          </View>

          {/* Employee Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Employee Information</Text>
            <View style={styles.dropdownRow}>
              <Icon
                name="person"
                size={28}
                color={backgroundColors.dark}
                style={styles.personIcon}
              />
              <DropDownPicker
                items={transformedEmp}
                open={Open}
                value={empValue}
                setValue={setEmpValaue}
                setOpen={setOpen}
                placeholder="Select Employee *"
                placeholderStyle={styles.dropdownPlaceholder}
                textStyle={styles.dropdownText}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                ArrowUpIconComponent={() => (
                  <Icon
                    name="keyboard-arrow-up"
                    size={18}
                    color={backgroundColors.dark}
                  />
                )}
                ArrowDownIconComponent={() => (
                  <Icon
                    name="keyboard-arrow-down"
                    size={18}
                    color={backgroundColors.dark}
                  />
                )}
                listMode="SCROLLVIEW"
                listItemLabelStyle={{
                  color: backgroundColors.dark,
                  fontWeight: '500',
                }}
                labelStyle={{
                  color: backgroundColors.dark,
                  marginLeft: 30,
                  fontSize: 16,
                }}
                searchable
                searchTextInputStyle={{
                  borderWidth: 0,
                  width: '100%',
                }}
                searchContainerStyle={{
                  borderColor: backgroundColors.gray,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '60%',
              }}>
              <Text style={[styles.inputLabel, {fontWeight: '600'}]}>
                From:
              </Text>
              <Text style={[styles.inputLabel, {fontWeight: '600'}]}>To:</Text>
            </View>
            <View style={styles.dateRow}>
              <TouchableOpacity
                onPress={() => setShowDatePicker('from')}
                style={styles.dateInput}>
                <Icon name="event" size={20} color={backgroundColors.dark} />
                <Text style={styles.dateText}>
                  {fromDate ? fromDate.toLocaleDateString() : 'From Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDatePicker('to')}
                style={styles.dateInput}>
                <Icon name="event" size={20} color={backgroundColors.dark} />
                <Text style={styles.dateText}>
                  {toDate ? toDate.toLocaleDateString() : 'To Date'}
                </Text>
              </TouchableOpacity>
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
          </View>

          {/* Account Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Transactions</Text>

            {empData.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="receipt" size={40} color="rgba(0,0,0,0.5)" />
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
                          {new Date(item.empac_date)
                            .toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                            .replace(/ /g, '-')}
                        </Text>
                      </View>

                      <View style={styles.transactionDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Earnings:</Text>
                          <Text style={styles.detailValue}>
                            {formatNumber(item.empac_earning)}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Withdrawals:</Text>
                          <Text style={styles.detailValue}>
                            {formatNumber(item.empac_withdraw_amount)}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Balance:</Text>
                          <Text style={styles.detailValue}>
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

            {/* Summary Section */}
            <View style={styles.summarySection}>
              {(() => {
                const {netBalance, totalEarning, totalWithdraw} =
                  calculateTotals();
                return (
                  <>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Earnings:</Text>
                      <Text style={styles.summaryValue}>
                        {formatNumber(totalEarning)}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Withdraw:</Text>
                      <Text style={styles.summaryValue}>
                        {formatNumber(totalWithdraw)}
                      </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                      <Text style={[styles.summaryLabel, styles.totalLabel]}>
                        Net Balance:
                      </Text>
                      <Text style={[styles.summaryValue, styles.totalValue]}>
                        {formatNumber(netBalance)}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </View>
          </View>
        </ScrollView>
      </View>

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
                  <Icon name="close" size={24} color={backgroundColors.dark} />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView
                style={styles.modalBodyScroll}
                contentContainerStyle={styles.modalBodyContent}
                keyboardShouldPersistTaps="handled">
                <View style={styles.modalBody}>
                  <View style={styles.dropdownRow}>
                    <Icon
                      name="person"
                      size={28}
                      color={backgroundColors.dark}
                      style={styles.personIcon}
                    />
                    <DropDownPicker
                      items={transformedEmp}
                      open={modalDropdowOpen}
                      value={customerVal}
                      setValue={setCustomerVal}
                      setOpen={setModalDropdowOpen}
                      placeholder="Select Employee"
                      placeholderStyle={{color: '#777', marginLeft: 30}}
                      textStyle={{color: backgroundColors.dark}}
                      style={[styles.dropdown]}
                      dropDownContainerStyle={styles.dropdownContainer}
                      ArrowUpIconComponent={() => (
                        <Icon
                          name="keyboard-arrow-up"
                          size={18}
                          color={backgroundColors.dark}
                        />
                      )}
                      ArrowDownIconComponent={() => (
                        <Icon
                          name="keyboard-arrow-down"
                          size={18}
                          color={backgroundColors.dark}
                        />
                      )}
                      listMode="SCROLLVIEW"
                      listItemLabelStyle={{
                        color: backgroundColors.dark,
                        fontWeight: '500',
                      }}
                      labelStyle={{
                        color: backgroundColors.dark,
                        marginLeft: 30,
                        fontSize: 16,
                      }}
                      searchable
                      searchTextInputStyle={{
                        borderWidth: 0,
                        width: '100%',
                      }}
                      searchContainerStyle={{
                        borderColor: backgroundColors.gray,
                      }}
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
                      maxLength={9}
                      onChangeText={t => cashOnChange('amount', t)}
                      placeholder="Enter amount *"
                      placeholderTextColor="#666"
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={[styles.inputLabel, {color: '#000'}]}>
                      Date <Text style={{color: 'red'}}>*</Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker('from')}
                      style={[
                        styles.dateInput,
                        {borderColor: '#ccc', width: '100%'},
                      ]}>
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

  scrollContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  toggleBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 8,
  },
  actionBtn: {
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  section: {
    backgroundColor: backgroundColors.light,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginVertical: 8,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.dark,
    marginBottom: 16,
  },
  dropdownRow: {
    marginBottom: 16,
  },
  inputLabel: {
    color: 'rgba(0,0,0,0.8)',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  dropdown: {
    backgroundColor: backgroundColors.light,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
    marginBottom: 4,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    maxHeight: 200,
  },
  dropdownText: {
    color: 'white',
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: 'rgba(0,0,0,0.7)',
    marginLeft: 30,
    fontSize: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  personIcon: {
    position: 'absolute',
    zIndex: 10000,
    top: 7,
    left: 6,
  },
  dateInput: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
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
  dateText: {
    flex: 1,
    color: backgroundColors.dark,
    fontSize: 14,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: 'rgba(0,0,0,0.1)',
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
    color: backgroundColors.dark,
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDate: {
    color: 'rgba(0,0,0,0.7)',
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
    color: backgroundColors.dark,
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    color: backgroundColors.dark,
    fontSize: 12,
  },
  summarySection: {
    backgroundColor: 'rgba(0,0,0,0.05)',
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
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryValue: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '400',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.2)',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    color: backgroundColors.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: backgroundColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  paginationBtn: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  disabledBtn: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderColor: 'rgba(0,0,0,0.05)',
  },
  pageIndicator: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.5)',
  },
  pageText: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  keyboardAvoidContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    maxWidth: '95%',
    maxHeight: '80%',
    alignSelf: 'center',
    backgroundColor: 'white',
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
    color: backgroundColors.dark,
  },
  closeButton: {
    padding: 5,
  },
  submitButton: {
    backgroundColor: backgroundColors.primary,
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
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
    color: backgroundColors.dark,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});
