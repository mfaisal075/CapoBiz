import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ImageBackground} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

interface Supplier {
  id: string;
  sup_name: string;
  sup_company_name: string;
}

interface SingleSupplier {
  id: string;
  sup_name: string;
  sup_company_name: string;
  sup_address: string;
}

interface SupplierAddForm {
  amount: string;
  note: string;
  date: Date;
}

const initialSupplierAddFrom: SupplierAddForm = {
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

const SupplierAddPayment = () => {
  const {openDrawer} = useDrawer();
  const [selectedTab, setSelectedTab] = useState('Cash');
  const [suppDropdown, setSuppDropdown] = useState<Supplier[]>([]);
  const transformedSupp = suppDropdown.map(supp => ({
    label: `${supp.sup_name} | ${supp.sup_company_name}`,
    value: supp.id.toString(),
  }));
  const [suppData, setSuppData] = useState<SingleSupplier | null>(null);
  const [Open, setOpen] = useState(false);
  const [suppValue, setSuppValue] = useState<string | ''>('');
  const [cashAddFrom, setCashAddForm] = useState<SupplierAddForm>(
    initialSupplierAddFrom,
  );
  const [showDatePicker, setShowDatePicker] = useState<
    'cash' | 'cheque' | null
  >(null);
  const [chequeAddFrom, setChequeAddForm] =
    useState<ChequeAddFrom>(initialChequeAddForm);
  const [cashType, setCashType] = useState('');
  const [cashTypeOpen, setCashTypeOpen] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [chequeReceipt, setChequeReceipt] = useState<any | null>(null);

  // Cash Payment Add Form OnChange
  const cashOnChange = (field: keyof SupplierAddForm, value: string | Date) => {
    setCashAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Payment Type
  const paymentType = [
    {label: 'Received in Company', value: 'received_in_company'},
    {label: 'Paid by Company', value: 'paid_by_company'},
  ];

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

  // Cash Cheque Add Form OnChange
  const chequeOnChange = (field: keyof ChequeAddFrom, value: string | Date) => {
    setChequeAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch Supplier dropdown
  const fetchSuppDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadsuppliers`);
      setSuppDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Supplier Data
  const getSuppData = async () => {
    if (suppValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchsuppdata`, {
          id: suppValue,
        });
        setSuppData({
          sup_address: res.data.supplier.sup_address,
          sup_company_name: res.data.supplier.sup_company_name,
          sup_name: res.data.supplier.sup_name,
          id: res.data.supplier.id,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Add Cash Payment
  const addCashPayment = async () => {
    if (!suppValue) {
      Toast.show({
        type: 'error',
        text1: 'Please Select Supplier First!',
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
        text2: 'Please filled all fields',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addsuppcashpayment`, {
        supplier: suppValue,
        amount: cashAddFrom.amount,
        note: cashAddFrom.note.trim(),
        supp_acc_date: cashAddFrom.date.toISOString().split('T')[0],
        pay_type: cashType,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        setReceipt(data.supp_account || data);
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Payment has been added successfully!',
          visibilityTime: 1500,
        });
        setSuppValue('');
        setCashType('');
        setCashAddForm(initialSupplierAddFrom);
        setSuppData(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Add Cheque Payment
  const addChequePayment = async () => {
    if (!suppValue) {
      Toast.show({
        type: 'error',
        text1: 'Please Select Supplier First!',
        visibilityTime: 1500,
      });
      return;
    }

    if (
      !chequeAddFrom.amount ||
      !chequeAddFrom.date ||
      !chequeAddFrom.note ||
      !chequeAddFrom.chequeNumber
    ) {
      Toast.show({
        type: 'error',
        text1: 'Fields Missing',
        text2: 'Please filled all fields',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addsuppchqpayment`, {
        chq_number: chequeAddFrom.chequeNumber,
        amount: chequeAddFrom.amount,
        supplier: suppValue,
        note: chequeAddFrom.note.trim(),
        supp_chq_date: chequeAddFrom.date.toISOString().split('T')[0],
        pay_type: 'Paid by Company',
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        setChequeReceipt(data.chq_info || data);
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Payment has been added successfully!',
          visibilityTime: 1500,
        });
        setSuppValue('');
        setCashType('');
        setChequeAddForm(initialChequeAddForm);
        setSuppData(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSuppDropdown();
    getSuppData();
  }, [suppValue]);

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

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Add Supplier Payment</Text>
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

            {/* Supplier Selection */}
            <View style={styles.dropdownRow}>
              <Text style={styles.inputLabel}>Select Supplier</Text>
              <DropDownPicker
                items={transformedSupp}
                open={Open}
                value={suppValue}
                setValue={setSuppValue}
                setOpen={setOpen}
                placeholder="Choose supplier..."
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

            {suppData && (
              <View style={styles.supplierInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Supplier Name:</Text>
                  <Text style={styles.infoValue}>{suppData.sup_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Company Name:</Text>
                  <Text style={styles.infoValue}>
                    {suppData.sup_company_name}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.infoValue}>{suppData.sup_address}</Text>
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
                    <View style={styles.readOnlyInput}>
                      <Text style={styles.readOnlyText}>Paid by Company</Text>
                    </View>
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

        {/* Cash Payment Receipt Modal */}
        <Modal
          visible={!!receipt}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setReceipt(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Payment Receipt</Text>

              <View style={styles.modalDetails}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Invoice No:</Text>
                  <Text style={styles.modalValue}>
                    {receipt?.supac_invoice_no || 'N/A'}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Amount:</Text>
                  <Text style={[styles.modalValue, {color: '#4CAF50'}]}>
                    Rs. {receipt?.supac_paid_amount || cashAddFrom.amount}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Method:</Text>
                  <Text style={styles.modalValue}>
                    {receipt?.supac_payment_method || 'Cash'}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Type:</Text>
                  <Text style={styles.modalValue}>
                    {receipt?.supac_payment_type || cashType}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Date:</Text>
                  <Text style={styles.modalValue}>
                    {receipt?.supac_date ||
                      cashAddFrom.date.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Note:</Text>
                  <Text style={styles.modalValue}>
                    {receipt?.supac_note || cashAddFrom.note}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Balance:</Text>
                  <Text style={[styles.modalValue, {color: '#ff4444'}]}>
                    {receipt?.supac_balance || '0.00'}
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

        {/* Cheque Receipt Modal */}
        <Modal
          visible={!!chequeReceipt}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setChequeReceipt(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cheque Receipt</Text>

              <View style={styles.modalDetails}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Cheque No:</Text>
                  <Text style={styles.modalValue}>
                    {chequeReceipt?.chi_number || chequeAddFrom.chequeNumber}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Date:</Text>
                  <Text style={styles.modalValue}>
                    {chequeReceipt?.chi_date ||
                      chequeAddFrom.date.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Amount:</Text>
                  <Text style={[styles.modalValue, {color: '#4CAF50'}]}>
                    Rs. {chequeReceipt?.chi_amount || chequeAddFrom.amount}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Note:</Text>
                  <Text style={styles.modalValue}>
                    {chequeReceipt?.chi_note || chequeAddFrom.note}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Payment Method:</Text>
                  <Text style={styles.modalValue}>
                    {chequeReceipt?.chi_payment_method || 'Cheque'}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Status:</Text>
                  <Text style={styles.modalValue}>
                    {chequeReceipt?.chi_status || 'Pending'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setChequeReceipt(null)}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
};

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
    backgroundColor: 'rgba(255,255,255,0.1)',
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
  supplierInfo: {
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
  readOnlyInput: {
    backgroundColor: 'rgba(128,128,128,0.3)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  readOnlyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#144272',
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

export default SupplierAddPayment;
