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

interface FixedAccount {
  id: number;
  fixprf_business_account_name: string;
}

interface FixedAccountDetails {
  id: number;
  fixac_invoice_no: string;
  fixac_date: string;
  fixac_payment_type: string;
  fixac_debit: string;
  fixac_credit: string;
  fixac_balance: string;
  fixac_description: string;
  fixprf_business_account_name: string;
}

interface FixedAccAddForm {
  amount: string;
  desc: string;
  date: Date;
}

const initialFixedAccAddFrom: FixedAccAddForm = {
  amount: '',
  date: new Date(),
  desc: '',
};

export default function FixedAccounts() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [Open, setOpen] = useState(false);
  const [txnOpen, setTxnOpen] = useState(false);
  const [modalDropdownOpen, setModalDropdownOpen] = useState(false);
  const [fixedAccValue, setFixedAccValue] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [modalShowDatePicker, setModalShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState('');
  const [fixedDropdown, setFixedDropdown] = useState<FixedAccount[]>([]);
  const transformedFixedAcc = fixedDropdown.map(fix => ({
    label: fix.fixprf_business_account_name,
    value: fix.id.toString(),
  }));
  const [fixedAccDetails, setFixedAccDetails] = useState<FixedAccountDetails[]>(
    [],
  );
  const [cashAddFrom, setCashAddForm] = useState<FixedAccAddForm>(
    initialFixedAccAddFrom,
  );
  const [txnTypeValue, setTxnTypeValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [invc, setInvc] = useState('');

  const totalPages = Math.ceil(fixedAccDetails.length / itemsPerPage);

  // Pagination helpers for Fixed
  const paginateFixedAccounts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return fixedAccDetails.slice(startIndex, endIndex);
  };

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

  // Cash Payment Add Form OnChange
  const cashOnChange = (field: keyof FixedAccAddForm, value: string | Date) => {
    setCashAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const modalDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setModalShowDatePicker(false);
      return;
    }

    if (selectedDate) {
      cashOnChange('date', selectedDate);
    }
    setModalShowDatePicker(false);
  };

  // Transaction Type
  const txnType = [
    {label: 'Debit', value: 'Debit'},
    {label: 'Credit', value: 'Credit'},
  ];

  // Fetch Fixed dropdown
  const fetchFixesDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchfixedaccountdropdown`);
      setFixedDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Fixed Accounts Details
  const fetchFixedAccDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.get(
        `${BASE_URL}/fetchfixedaccounts?account_id=${fixedAccValue}&from=${from}&to=${to}&_token=${token}`,
      );
      setFixedAccDetails(res.data.accounts);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Invoice
  const fetchInvc = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fixedaccountinvoice`);
      setInvc(res.data.inv_fixac_no);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Cash Payment
  const addCashPayment = async () => {
    if (!fixedAccValue) {
      Toast.show({
        type: 'error',
        text1: 'Please Select Account First!',
        visibilityTime: 1500,
      });
      return;
    }

    if (!txnTypeValue || !cashAddFrom.amount || !cashAddFrom.date) {
      Toast.show({
        type: 'error',
        text1: 'Fields Missing',
        text2: 'Please fill all fields',
        visibilityTime: 1500,
      });
      return;
    }

    if (isNaN(Number(cashAddFrom.amount)) || cashAddFrom.amount.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Amount must be a valid number',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addfixedaccountpayment`, {
        invoice_no: `FIXAC-${invc}`,
        account_id: fixedAccValue,
        payment_type: txnTypeValue,
        date: cashAddFrom.date.toISOString().split('T')[0],
        amount: cashAddFrom.amount,
        description: cashAddFrom.desc.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Payment has been added successfully!',
          visibilityTime: 1500,
        });
        setFixedAccValue('');
        setTxnTypeValue('');
        setInvc('');
        setCashAddForm(initialFixedAccAddFrom);
        setModalVisible('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Pagination controls component
  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationBtn,
            currentPage === 1 && styles.disabledBtn,
          ]}
          onPress={() => onPageChange(Math.max(1, currentPage - 1))}
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
          onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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
    fetchFixesDropdown();
    fetchFixedAccDetails();
    fetchInvc();
  }, [fixedAccValue, fromDate, toDate]);

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
            <Text style={styles.headerTitle}>Fixed Account</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} nestedScrollEnabled>
          {/* Action Buttons */}
          <View
            style={[
              styles.toggleBtnContainer,
              {marginVertical: 5, justifyContent: 'flex-end'},
            ]}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {backgroundColor: backgroundColors.primary},
              ]}
              onPress={() => setModalVisible('addPayment')}>
              <Icon name="payment" size={18} color="white" />
              <Text style={styles.actionBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <View style={styles.dropdownRow}>
              <DropDownPicker
                items={transformedFixedAcc}
                open={Open}
                value={fixedAccValue}
                setValue={setFixedAccValue}
                setOpen={setOpen}
                placeholder="Select Account"
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
              />
            </View>

            {/* Date Range Section */}
            <View style={styles.dateSection}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '60%',
                }}>
                <Text style={styles.inputLabel}>From:</Text>
                <Text style={styles.inputLabel}>To:</Text>
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
                style={{backgroundColor: '#144272'}}
              />
            )}
          </View>

          {/* Account Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Transactions</Text>

            {fixedAccDetails.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="receipt" size={40} color="rgba(0,0,0,0.5)" />
                <Text style={styles.emptyStateText}>No transactions found</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={paginateFixedAccounts()}
                  keyExtractor={item => item.id.toString()}
                  scrollEnabled={false}
                  renderItem={({item}) => (
                    <View style={styles.transactionCard}>
                      <View style={styles.transactionHeader}>
                        <Text style={styles.invoiceNumber}>
                          {item.fixac_invoice_no}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {new Date(item.fixac_date)
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
                          <Text style={styles.detailLabel}>Account:</Text>
                          <Text style={styles.detailValue}>
                            {item.fixprf_business_account_name}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Type:</Text>
                          <Text style={styles.detailValue}>
                            {item.fixac_payment_type}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Debit:</Text>
                          <Text style={styles.detailValue}>
                            {item.fixac_debit}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Credit:</Text>
                          <Text style={styles.detailValue}>
                            {item.fixac_credit}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Balance:</Text>
                          <Text style={styles.detailValue}>
                            {item.fixac_balance}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Description:</Text>
                          <Text style={styles.detailValue}>
                            {item.fixac_description}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                />

                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Add Payment Modal */}
      <Modal
        visible={modalVisible === 'addPayment'}
        transparent
        animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidContainer}>
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Payment</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible('')}
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
                  <View style={styles.inputContainer}>
                    <Text
                      style={{
                        color: backgroundColors.dark,
                        fontWeight: 'bold',
                        fontSize: 14,
                        marginBottom: 5,
                      }}>
                      Invoice#
                    </Text>
                    <TextInput
                      style={[
                        styles.productinput,
                        {backgroundColor: backgroundColors.gray},
                      ]}
                      value={`FIXAC-${invc}`}
                      onChangeText={t => setInvc(t)}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text
                      style={{
                        color: backgroundColors.dark,
                        fontWeight: 'bold',
                        fontSize: 14,
                        marginBottom: 5,
                      }}>
                      Account:
                    </Text>
                    <DropDownPicker
                      items={transformedFixedAcc}
                      open={modalDropdownOpen}
                      value={fixedAccValue}
                      setValue={setFixedAccValue}
                      setOpen={setModalDropdownOpen}
                      placeholder="Select Account"
                      placeholderStyle={[
                        styles.dropdownPlaceholder,
                        {marginLeft: 0},
                      ]}
                      textStyle={{color: 'white'}}
                      style={[styles.dropdown]}
                      dropDownContainerStyle={styles.dropdownContainer}
                      ArrowUpIconComponent={() => (
                        <Text>
                          <Icon
                            name="keyboard-arrow-up"
                            size={15}
                            color="#000"
                          />
                        </Text>
                      )}
                      ArrowDownIconComponent={() => (
                        <Text>
                          <Icon
                            name="keyboard-arrow-down"
                            size={15}
                            color="#000"
                          />
                        </Text>
                      )}
                      listMode="SCROLLVIEW"
                      listItemLabelStyle={{
                        color: backgroundColors.dark,
                        fontWeight: '500',
                      }}
                      labelStyle={{
                        color: backgroundColors.dark,
                        fontSize: 16,
                      }}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text
                      style={{
                        color: backgroundColors.dark,
                        fontWeight: 'bold',
                        fontSize: 14,
                        marginBottom: 5,
                      }}>
                      Transaction Type:
                    </Text>
                    <DropDownPicker
                      items={txnType}
                      open={txnOpen}
                      value={txnTypeValue}
                      setValue={setTxnTypeValue}
                      setOpen={setTxnOpen}
                      placeholder="Select Type"
                      placeholderStyle={{color: '#000'}}
                      textStyle={{color: 'white'}}
                      style={[styles.dropdown, {zIndex: 999}]}
                      dropDownContainerStyle={styles.dropdownContainer}
                      ArrowUpIconComponent={() => (
                        <Text>
                          <Icon
                            name="keyboard-arrow-up"
                            size={15}
                            color="#000"
                          />
                        </Text>
                      )}
                      ArrowDownIconComponent={() => (
                        <Text>
                          <Icon
                            name="keyboard-arrow-down"
                            size={15}
                            color="#000"
                          />
                        </Text>
                      )}
                      listMode="SCROLLVIEW"
                      listItemLabelStyle={{
                        color: backgroundColors.dark,
                        fontWeight: '500',
                      }}
                      labelStyle={{
                        color: backgroundColors.dark,
                        fontSize: 16,
                      }}
                    />
                  </View>

                  {/* Date Fields Section */}
                  <View style={styles.inputContainer}>
                    {/* From Date */}
                    <View style={{width: '100%'}}>
                      <Text
                        style={{
                          color: backgroundColors.dark,
                          fontWeight: 'bold',
                          fontSize: 14,
                          marginBottom: 5,
                        }}>
                        Date <Text style={{color: 'red'}}>*</Text>
                      </Text>
                      <TouchableOpacity
                        onPress={() => setModalShowDatePicker(true)}
                        style={[styles.dateInput, {width: '100%'}]}>
                        <Text style={{color: '#000'}}>
                          {cashAddFrom.date
                            ? cashAddFrom.date.toLocaleDateString()
                            : ''}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {modalShowDatePicker && (
                    <DateTimePicker
                      value={cashAddFrom.date}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={modalDateChange}
                      themeVariant="dark"
                      style={{backgroundColor: '#144272'}}
                    />
                  )}

                  <View style={styles.inputContainer}>
                    <Text
                      style={{
                        color: backgroundColors.dark,
                        fontWeight: 'bold',
                        fontSize: 14,
                        marginBottom: 5,
                      }}>
                      Amount <Text style={{color: 'red'}}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.productinput}
                      keyboardType="number-pad"
                      value={cashAddFrom.amount}
                      onChangeText={t => cashOnChange('amount', t)}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text
                      style={{
                        color: backgroundColors.dark,
                        fontWeight: 'bold',
                        fontSize: 14,
                        marginBottom: 5,
                      }}>
                      Description
                    </Text>
                    <TextInput
                      style={[
                        styles.productinput,
                        {height: 100, textAlignVertical: 'top'},
                      ]}
                      multiline
                      numberOfLines={4}
                      value={cashAddFrom.desc}
                      onChangeText={t => cashOnChange('desc', t)}
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Footer Button */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={addCashPayment}>
                  <Text style={styles.submitButtonText}>Add Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
        <Toast />
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
    justifyContent: 'space-between',
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
    maxHeight: 140,
  },
  dropdownText: {
    color: 'white',
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 16,
  },
  dateSection: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    paddingBottom: 80, // Space for fixed footer
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
  inputContainer: {
    width: '100%',
    marginTop: 10,
    paddingHorizontal: '1%',
  },
  productinput: {
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
});
