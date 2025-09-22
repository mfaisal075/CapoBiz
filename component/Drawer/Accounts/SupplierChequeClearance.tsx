import {
  ImageBackground,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';

interface Suppliers {
  id: number;
  sup_name: string;
  sup_company_name: string;
}

interface SingleSupplier {
  id: string;
  sup_name: string;
  sup_company_name: string;
  sup_address: string;
}

interface ChequeData {
  sup_name: string;
  chi_sup_id: number;
  id: string;
  chi_number: string;
  chi_amount: string;
  chi_status: string;
  chi_payment_method: string;
  chi_date: string;
}

const SupplierChequeClearance = () => {
  const {openDrawer} = useDrawer();
  const [suppDropdown, setSuppDropdown] = useState<Suppliers[]>([]);
  const transformedSupp = suppDropdown.map(supp => ({
    label: `${supp.sup_name} | ${supp.sup_company_name}`,
    value: supp.id.toString(),
  }));
  const [Open, setOpen] = useState(false);
  const [suppValue, setSuppValue] = useState<string | ''>('');
  const [suppData, setSuppData] = useState<SingleSupplier | null>(null);
  const [chequeData, setChequeData] = useState<ChequeData[]>([]);
  const [loadchequeData, setLoadChequeData] = useState<ChequeData | null>(null);
  const [clearanceDate, setClearanceDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState<string>('');
  const [modalVisible, setModalVisible] = useState('');

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

  // Fetch Cheque Info
  const fetchChequeInfo = async () => {
    if (suppValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchsuppchequeinfo`, {
          supp_id: suppValue,
        });
        setChequeData(res.data.chque_info);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Cheque Clearance
  const clearCheque = async () => {
    if (!loadchequeData || !clearanceDate) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please select a cheque and clearance date',
        visibilityTime: 3000,
      });
      return;
    }
    if (!note.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Note Required',
        text2: 'Please add a note for the clearance',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/clearsuppcheque`, {
        info_id: loadchequeData.id,
        supp_id: suppValue,
        amount: loadchequeData.chi_amount,
        supp_clear_date: clearanceDate.toISOString().split('T')[0],
        clear_note: note,
        pay_type: loadchequeData.chi_payment_method,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Cheque Cleared',
          text2: 'Cheque has been cleared successfully.',
          visibilityTime: 3000,
        });
        setModalVisible('');
        setLoadChequeData(null);
        setClearanceDate(null);
        setNote('');
        fetchChequeInfo();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to Clear Cheque',
          text2: data.message || 'Please try again',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to clear cheque. Please try again.',
        visibilityTime: 3000,
      });
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSuppDropdown();
    getSuppData();
    fetchChequeInfo();
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
            <Text style={styles.headerTitle}>Supplier Cheque Clearance</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}
            onPress={() => {}}
            disabled>
            <Icon name="account-balance" size={24} color="transparent" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} nestedScrollEnabled>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cheque Information</Text>

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

            {/* Cheque List */}
            <View style={{marginTop: 16}}>
              {chequeData.length === 0 ? (
                <View style={{alignItems: 'center', marginTop: 20}}>
                  <Text style={styles.noRecordText}>No cheques found.</Text>
                </View>
              ) : (
                chequeData.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.chequeItem,
                      loadchequeData?.id === item.id && {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                      },
                    ]}
                    onPress={() => {
                      setLoadChequeData(item);
                      setClearanceDate(new Date(item.chi_date));
                    }}>
                    <View style={styles.chequeHeader}>
                      <Text style={styles.chequeName}>{item.sup_name}</Text>
                      <Icon
                        name="receipt"
                        size={20}
                        color={
                          loadchequeData?.id === item.id ? '#D0F4DE' : 'white'
                        }
                      />
                    </View>

                    <View style={styles.chequeDetails}>
                      {[
                        {
                          label: 'Date:',
                          value: new Date(item.chi_date)
                            .toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                            .replace(/\//g, '-'),
                        },
                        {
                          label: 'Cheque No:',
                          value: item.chi_number,
                        },
                        {
                          label: 'Amount:',
                          value: `Rs. ${item.chi_amount}`,
                        },
                        {
                          label: 'Status:',
                          value: item.chi_status,
                        },
                        {
                          label: 'Method:',
                          value: item.chi_payment_method,
                        },
                      ].map((field, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.chequeDetailRow,
                            idx % 2 === 0 && {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                            },
                          ]}>
                          <Text style={styles.chequeDetailLabel}>
                            {field.label}
                          </Text>
                          <Text style={styles.chequeDetailValue}>
                            {field.value}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Selected Cheque Details */}
            {loadchequeData && (
              <View style={styles.selectedChequeSection}>
                <Text style={styles.sectionTitle}>Selected Cheque Details</Text>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Cheque Number</Text>
                    <Text style={styles.readOnlyInput}>
                      {loadchequeData.chi_number}
                    </Text>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Amount</Text>
                    <Text style={styles.readOnlyInput}>
                      Rs. {loadchequeData.chi_amount}
                    </Text>
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Payment Method</Text>
                    <Text style={styles.readOnlyInput}>
                      {loadchequeData.chi_payment_method}
                    </Text>
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Clearance Date</Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      style={styles.dateInput}>
                      <Icon name="event" size={20} color="white" />
                      <Text style={styles.dateText}>
                        {clearanceDate
                          ? clearanceDate.toLocaleDateString()
                          : 'Select Date'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Note</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={note}
                      placeholder="Enter clearance note"
                      placeholderTextColor={'rgba(255,255,255,0.7)'}
                      onChangeText={t => setNote(t)}
                      numberOfLines={3}
                      multiline
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={() => {
                    setModalVisible('confirmation');
                  }}>
                  <Text style={styles.submitBtnText}>Clear Cheque</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={clearanceDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setClearanceDate(selectedDate);
              }
            }}
            themeVariant="dark"
          />
        )}

        {/* Confirmation Modal */}
        <Modal
          visible={modalVisible === 'confirmation'}
          onDismiss={() => setModalVisible('')}
          transparent
          animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.delAnim}>
                <LottieView
                  style={{flex: 1}}
                  source={require('../../../assets/warning.json')}
                  autoPlay
                  loop={false}
                />
              </View>

              <Text style={styles.modalTitle}>Are you sure?</Text>
              <Text style={styles.modalMessage}>
                Do you really want to clear this cheque?
              </Text>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  onPress={() => setModalVisible('')}
                  style={[styles.modalButton, styles.cancelButton]}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    clearCheque();
                    setModalVisible('');
                  }}
                  style={[styles.modalButton, styles.confirmButton]}>
                  <Text style={styles.modalButtonText}>Yes</Text>
                </TouchableOpacity>
              </View>
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
  chequeItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chequeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chequeName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  chequeDetails: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  chequeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chequeDetailLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  chequeDetailValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedChequeSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  inputContainer: {
    flex: 1,
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
  readOnlyInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: 'rgba(255,255,255,0.7)',
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
  noRecordText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
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
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#144272',
  },
  modalMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  delAnim: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
});

export default SupplierChequeClearance;
