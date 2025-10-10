import {
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BASE_URL from '../../BASE_URL';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import {Modal} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../../Colors';

interface Customers {
  id: number;
  cust_name: string;
  cust_fathername: string;
  cust_address: string;
}

interface CustomerAddForm {
  amount: string;
  note: string;
  date: Date;
}

const initialCustomerAddFrom: CustomerAddForm = {
  amount: '',
  date: new Date(),
  note: '',
};

interface ChequeAddFrom {
  amount: string;
  note: string;
  date: Date;
  chequeNumber: string;
}

const initialChequeAddForm: ChequeAddFrom = {
  amount: '',
  chequeNumber: '',
  date: new Date(),
  note: '',
};

const AddCustomerPayment = () => {
  const {openDrawer} = useDrawer();
  const [custDropdown, setCustDropdown] = useState<Customers[]>([]);
  const transformedCust = custDropdown.map(cust => ({
    label: `${cust.cust_name} s/o ${cust.cust_fathername} | ${cust.cust_address}`,
    value: cust.id.toString(),
  }));
  const [Open, setOpen] = useState(false);
  const [customerVal, setCustomerVal] = useState<string | ''>('');
  const [custData, setCustData] = useState<Customers | null>(null);
  const [selectedTab, setSelectedTab] = useState('Cash');
  const [cashAddFrom, setCashAddForm] = useState<CustomerAddForm>(
    initialCustomerAddFrom,
  );
  const [chequeAddFrom, setChequeAddForm] =
    useState<ChequeAddFrom>(initialChequeAddForm);
  const [showDatePicker, setShowDatePicker] = useState<
    'cash' | 'cheque' | null
  >(null);
  const [cashType, setCashType] = useState('');
  const [cashTypeOpen, setCashTypeOpen] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [chiReceipt, setChiReceipt] = useState<any | null>(null);

  // Cash Payment Add Form OnChange
  const cashOnChange = (field: keyof CustomerAddForm, value: string | Date) => {
    setCashAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Cash Cheque Add Form OnChange
  const chequeOnChange = (field: keyof ChequeAddFrom, value: string | Date) => {
    setChequeAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Date OnChange
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(null);
      return;
    }

    if (selectedDate) {
      if (showDatePicker === 'cash') {
        cashOnChange('date', selectedDate);
      } else if (showDatePicker === 'cheque') {
        chequeOnChange('date', selectedDate);
      }
    }
    setShowDatePicker(null);
  };

  // Payment Type
  const paymentType = [
    {label: 'Received', value: 'Received'},
    {label: 'Paid', value: 'Paid'},
  ];

  // Fetch Customer dropdown
  const fetchCustDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchdropcustomer`);
      setCustDropdown(res.data.customers);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Customet Data
  const getCustData = async () => {
    if (customerVal) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchcustdata`, {
          id: customerVal,
        });
        setCustData({
          cust_address: res.data.customer.cust_address,
          cust_fathername: res.data.customer.cust_fathername,
          cust_name: res.data.customer.cust_name,
          id: res.data.customer.id,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Add Cash Payment
  const addCashPayment = async () => {
    if (!customerVal) {
      Toast.show({
        type: 'error',
        text1: 'Please Select Customer First!',
        visibilityTime: 1500,
      });
      return;
    }

    if (
      !cashType ||
      !cashAddFrom.amount ||
      !cashAddFrom.date ||
      !cashAddFrom.note
    ) {
      Toast.show({
        type: 'error',
        text1: 'Fields Missing',
        text2: 'Please filled add fields',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addcashpayment`, {
        customer: customerVal,
        amount: cashAddFrom.amount,
        note: cashAddFrom.note.trim(),
        cust_acc_date: cashAddFrom.date.toISOString().split('T')[0],
        pay_type: cashType,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        setReceipt(data.cust_account);
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Payment has been added successfully!',
          visibilityTime: 1500,
        });
        setCustomerVal('');
        setCashType('');
        setCashAddForm(initialCustomerAddFrom);
        setCustData(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Add Cheque Payment
  const addChequePayment = async () => {
    if (!customerVal) {
      Toast.show({
        type: 'error',
        text1: 'Please Select Customer First!',
        visibilityTime: 1500,
      });
      return;
    }

    if (
      !cashType ||
      !chequeAddFrom.amount ||
      !chequeAddFrom.date ||
      !chequeAddFrom.note ||
      !chequeAddFrom.chequeNumber
    ) {
      Toast.show({
        type: 'error',
        text1: 'Fields Missing',
        text2: 'Please filled add fields',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addchqpayment`, {
        chq_number: chequeAddFrom.chequeNumber,
        customer: customerVal,
        amount: chequeAddFrom.amount,
        note: chequeAddFrom.note.trim(),
        chq_date: chequeAddFrom.date.toISOString().split('T')[0],
        pay_type: cashType,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        setChiReceipt(res.data.chq_info);

        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Payment has been added successfully!',
          visibilityTime: 1500,
        });
        setCustomerVal('');
        setCashType('');
        setChequeAddForm(initialChequeAddForm);
        setCustData(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCustDropdown();
    getCustData();
  }, [customerVal]);

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
            <Text style={styles.headerTitle}>Add Customer Payment</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}
            onPress={() => {}}
            disabled>
            <Icon name="account-balance" size={24} color="transparent" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} nestedScrollEnabled>
          {/* Toggle Buttons */}
          <View style={styles.toggleBtnContainer}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'Cash' && {backgroundColor: '#D0F4DE'},
              ]}
              onPress={() => setSelectedTab('Cash')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  selectedTab === 'Cash' && {color: '#144272'},
                ]}>
                Cash Payment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'Cheque' && {backgroundColor: '#D0F4DE'},
              ]}
              onPress={() => setSelectedTab('Cheque')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  selectedTab === 'Cheque' && {color: '#144272'},
                ]}>
                Cheque Payment
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>

            {/* Customer Selection */}
            <View style={styles.dropdownRow}>
              <Text style={styles.inputLabel}>Select Customer</Text>
              <DropDownPicker
                items={transformedCust}
                open={Open}
                value={customerVal}
                setValue={setCustomerVal}
                setOpen={setOpen}
                placeholder="Choose customer..."
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

            {custData && (
              <View style={styles.customerInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Customer Name:</Text>
                  <Text style={styles.infoValue}>{custData.cust_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Father Name:</Text>
                  <Text style={styles.infoValue}>
                    {custData.cust_fathername}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.infoValue}>{custData.cust_address}</Text>
                </View>
              </View>
            )}

            {selectedTab === 'Cash' ? (
              <>
                {/* Cash Payment Form */}
                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Amount</Text>
                    <TextInput
                      style={styles.input}
                      value={cashAddFrom.amount}
                      placeholder="Enter amount"
                      placeholderTextColor={'rgba(255,255,255,0.7)'}
                      keyboardType="number-pad"
                      onChangeText={t => cashOnChange('amount', t)}
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Note</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={cashAddFrom.note}
                      placeholder="Enter note"
                      placeholderTextColor={'rgba(255,255,255,0.7)'}
                      onChangeText={t => cashOnChange('note', t)}
                      numberOfLines={3}
                      multiline
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Date</Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker('cash')}
                      style={styles.dateInput}>
                      <Icon name="event" size={20} color="white" />
                      <Text style={styles.dateText}>
                        {cashAddFrom.date
                          ? cashAddFrom.date.toLocaleDateString()
                          : 'Select Date'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Payment Type</Text>
                    <DropDownPicker
                      items={paymentType}
                      open={cashTypeOpen}
                      value={cashType}
                      setValue={setCashType}
                      setOpen={setCashTypeOpen}
                      placeholder="Select type..."
                      placeholderStyle={styles.dropdownPlaceholder}
                      textStyle={styles.dropdownText}
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.dropdownContainer}
                      ArrowUpIconComponent={() => (
                        <Icon name="keyboard-arrow-up" size={18} color="#fff" />
                      )}
                      ArrowDownIconComponent={() => (
                        <Icon
                          name="keyboard-arrow-down"
                          size={18}
                          color="#fff"
                        />
                      )}
                      listMode="SCROLLVIEW"
                      listItemLabelStyle={{color: '#144272'}}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={addCashPayment}>
                  <Text style={styles.submitBtnText}>Submit Payment</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Cheque Payment Form */}
                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Cheque Number</Text>
                    <TextInput
                      style={styles.input}
                      value={chequeAddFrom.chequeNumber}
                      placeholder="Enter cheque number"
                      placeholderTextColor={'rgba(255,255,255,0.7)'}
                      keyboardType="number-pad"
                      onChangeText={t => chequeOnChange('chequeNumber', t)}
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Amount</Text>
                    <TextInput
                      style={styles.input}
                      value={chequeAddFrom.amount}
                      placeholder="Enter amount"
                      placeholderTextColor={'rgba(255,255,255,0.7)'}
                      keyboardType="number-pad"
                      onChangeText={t => chequeOnChange('amount', t)}
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Note</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={chequeAddFrom.note}
                      placeholder="Enter note"
                      placeholderTextColor={'rgba(255,255,255,0.7)'}
                      onChangeText={t => chequeOnChange('note', t)}
                      numberOfLines={3}
                      multiline
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Date</Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker('cheque')}
                      style={styles.dateInput}>
                      <Icon name="event" size={20} color="white" />
                      <Text style={styles.dateText}>
                        {chequeAddFrom.date
                          ? chequeAddFrom.date.toLocaleDateString()
                          : 'Select Date'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Payment Type</Text>
                    <DropDownPicker
                      items={paymentType}
                      open={cashTypeOpen}
                      value={cashType}
                      setValue={setCashType}
                      setOpen={setCashTypeOpen}
                      placeholder="Select type..."
                      placeholderStyle={styles.dropdownPlaceholder}
                      textStyle={styles.dropdownText}
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.dropdownContainer}
                      ArrowUpIconComponent={() => (
                        <Icon name="keyboard-arrow-up" size={18} color="#fff" />
                      )}
                      ArrowDownIconComponent={() => (
                        <Icon
                          name="keyboard-arrow-down"
                          size={18}
                          color="#fff"
                        />
                      )}
                      listMode="SCROLLVIEW"
                      listItemLabelStyle={{color: '#144272'}}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={addChequePayment}>
                  <Text style={styles.submitBtnText}>Submit Cheque</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={
              showDatePicker === 'cash'
                ? cashAddFrom.date ?? new Date()
                : chequeAddFrom.date ?? new Date()
            }
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            themeVariant="dark"
          />
        )}

        {/* Receipt Modals */}
        <Modal
          visible={!!receipt}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setReceipt(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🧾 Payment Receipt</Text>

              <View style={styles.modalDetails}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Invoice No:</Text>
                  <Text style={styles.modalValue}>
                    {receipt?.custac_invoice_no}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Amount:</Text>
                  <Text style={[styles.modalValue, {color: '#4CAF50'}]}>
                    Rs. {receipt?.custac_paid_amount}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Method:</Text>
                  <Text style={styles.modalValue}>
                    {receipt?.custac_payment_method}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Type:</Text>
                  <Text style={styles.modalValue}>
                    {receipt?.custac_payment_type}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Date:</Text>
                  <Text style={styles.modalValue}>{receipt?.custac_date}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Note:</Text>
                  <Text style={styles.modalValue}>{receipt?.custac_note}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Balance:</Text>
                  <Text style={[styles.modalValue, {color: '#ff4444'}]}>
                    {receipt?.custac_balance}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setReceipt(null)}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={!!chiReceipt}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setChiReceipt(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🧾 Cheque Receipt</Text>

              <View style={styles.modalDetails}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Cheque No:</Text>
                  <Text style={styles.modalValue}>
                    {chiReceipt?.chi_number}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Date:</Text>
                  <Text style={styles.modalValue}>{chiReceipt?.chi_date}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Amount:</Text>
                  <Text style={[styles.modalValue, {color: '#4CAF50'}]}>
                    Rs. {chiReceipt?.chi_amount}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Note:</Text>
                  <Text style={styles.modalValue}>{chiReceipt?.chi_note}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Payment Method:</Text>
                  <Text style={styles.modalValue}>
                    {chiReceipt?.chi_payment_method}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Status:</Text>
                  <Text style={styles.modalValue}>
                    {chiReceipt?.chi_status}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setChiReceipt(null)}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

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
    backgroundColor: 'rgba(0,0,0,0.1)',
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
  toggleBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  toggleBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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
  customerInfo: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  infoValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  inputRow: {
    marginBottom: 16,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: 'white',
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  dateText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  submitBtn: {
    backgroundColor: backgroundColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#144272',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalDetails: {
    marginBottom: 15,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalLabel: {
    fontWeight: '600',
    color: '#333',
  },
  modalValue: {
    fontWeight: '400',
  },
  modalButton: {
    backgroundColor: '#144272',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default AddCustomerPayment;
