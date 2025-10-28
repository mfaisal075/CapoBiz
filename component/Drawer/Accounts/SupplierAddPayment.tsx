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
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import backgroundColors from '../../Colors';

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
            <Text style={styles.headerTitle}>Add Supplier Payment</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} nestedScrollEnabled>
          {/* Toggle Buttons */}
          <View style={styles.toggleBtnContainer}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'Cash' && {
                  backgroundColor: backgroundColors.primary,
                },
              ]}
              onPress={() => setSelectedTab('Cash')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  selectedTab === 'Cash' && {color: backgroundColors.light},
                ]}>
                Cash Payment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'Cheque' && {
                  backgroundColor: backgroundColors.primary,
                },
              ]}
              onPress={() => setSelectedTab('Cheque')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  selectedTab === 'Cheque' && {color: backgroundColors.light},
                ]}>
                Cheque Payment
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>

            {/* Supplier Selection */}
            <View style={styles.dropdownRow}>
              <Icon
                name="person"
                size={28}
                color={backgroundColors.dark}
                style={styles.personIcon}
              />
              <DropDownPicker
                items={transformedSupp}
                open={Open}
                value={suppValue}
                setValue={setSuppValue}
                setOpen={setOpen}
                placeholder="Select Supplier"
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
                    <TextInput
                      style={styles.input}
                      value={cashAddFrom.amount}
                      placeholder="Enter amount *"
                      maxLength={9}
                      placeholderTextColor={'rgba(0,0,0,0.7)'}
                      keyboardType="number-pad"
                      onChangeText={t => cashOnChange('amount', t)}
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={cashAddFrom.note}
                      placeholder="Add note *"
                      placeholderTextColor={'rgba(0,0,0,0.7)'}
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
                      <Icon
                        name="event"
                        size={20}
                        color={backgroundColors.dark}
                      />
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
                    <DropDownPicker
                      items={paymentType}
                      open={cashTypeOpen}
                      value={cashType}
                      setValue={setCashType}
                      setOpen={setCashTypeOpen}
                      placeholder="Select type..."
                      placeholderStyle={[
                        styles.dropdownPlaceholder,
                        {marginLeft: 10},
                      ]}
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
                        marginLeft: 10,
                        fontSize: 16,
                      }}
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
                    <TextInput
                      style={styles.input}
                      value={chequeAddFrom.chequeNumber}
                      placeholder="Enter cheque number *"
                      placeholderTextColor={'rgba(0,0,0,0.7)'}
                      keyboardType="number-pad"
                      onChangeText={t => chequeOnChange('chequeNumber', t)}
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={chequeAddFrom.amount}
                      placeholder="Enter amount *"
                      placeholderTextColor={'rgba(0,0,0,0.7)'}
                      keyboardType="number-pad"
                      onChangeText={t => chequeOnChange('amount', t)}
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={chequeAddFrom.note}
                      placeholder="Add note*"
                      placeholderTextColor={'rgba(0,0,0,0.7)'}
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
                      <Icon name="event" size={20} color={backgroundColors.dark} />
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
      </View>
    </SafeAreaView>
  );
};

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
  toggleBtn: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: backgroundColors.light,
    borderColor: backgroundColors.gray,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  toggleBtnText: {
    color: backgroundColors.dark,
    fontWeight: '600',
    fontSize: 16,
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
  personIcon: {
    position: 'absolute',
    zIndex: 10000,
    top: 7,
    left: 6,
  },
  supplierInfo: {
    backgroundColor: 'rgba(0,0,0,0.1)',
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
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    color: backgroundColors.dark,
    fontSize: 14,
  },
  inputRow: {
    marginBottom: 16,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
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
    color: backgroundColors.dark,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
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
  readOnlyInput: {
    backgroundColor: 'rgba(128,128,128,0.3)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  readOnlyText: {
    color: 'rgba(0,0,0,0.8)',
    fontSize: 14,
    
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

export default SupplierAddPayment;
