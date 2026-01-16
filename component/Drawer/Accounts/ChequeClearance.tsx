import {
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  BackHandler,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
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
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  shadow: '#000',
};

interface Customers {
  id: number;
  cust_name: string;
  cust_fathername: string;
  cust_address: string;
}

interface ChequeData {
  cust_name: string;
  id: string;
  chi_number: string;
  chi_amount: string;
  chi_status: string;
  chi_payment_method: string;
  chi_date: string;
}

const ChequeClearance = ({navigation}: any) => {
  const {openDrawer} = useDrawer();
  const [custDropdown, setCustDropdown] = useState<Customers[]>([]);
  const transformedCust = custDropdown.map(cust => ({
    label: `${cust.cust_name} s/o ${cust.cust_fathername} | ${cust.cust_address}`,
    value: cust.id.toString(),
  }));
  const [Open, setOpen] = useState(false);
  const [customerVal, setCustomerVal] = useState<string | ''>('');
  const [chequeData, setChequeData] = useState<ChequeData[]>([]);
  const [loadchequeData, setLoadChequeData] = useState<ChequeData | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [clearanceDate, setClearanceDate] = useState<Date | null>(null);
  const [note, setNote] = useState<string>('');
  const [modalVisible, setModalVisible] = useState('');
  const [custData, setCustData] = useState<Customers | null>(null);

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

  // Fetch Cheque Info
  const fetchChequeInfo = async () => {
    if (customerVal) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchchequeinfo`, {
          cust_id: customerVal,
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
      const res = await axios.post(`${BASE_URL}/clearcheque`, {
        info_id: loadchequeData.id,
        cust_id: customerVal,
        amount: loadchequeData.chi_amount,
        clear_note: note,
        pay_type: loadchequeData.chi_payment_method,
        cust_clear_date: clearanceDate.toISOString().split('T')[0],
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
    fetchCustDropdown();
    getCustData();
    fetchChequeInfo();

    const backKey = () => {
      navigation.navigate('Customer Account');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [customerVal]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cheque Clearance</Text>
            <View style={{width: 24}} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cheque Information</Text>

          {/* Customer Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Customer</Text>
            <DropDownPicker
              items={transformedCust}
              open={Open}
              value={customerVal}
              setValue={setCustomerVal}
              setOpen={setOpen}
              placeholder="Choose customer..."
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

          {custData && (
            <View style={styles.customerInfoBox}>
              <Text style={styles.custInfoTitle}>{custData.cust_name}</Text>
              <Text style={styles.custInfoSub}>
                {custData.cust_fathername} | {custData.cust_address}
              </Text>
            </View>
          )}

          {/* Cheque List */}
          <View style={{marginTop: 10}}>
            {chequeData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="receipt" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No cheques found.</Text>
              </View>
            ) : (
              chequeData.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.chequeItem,
                    loadchequeData?.id === item.id && styles.chequeItemSelected,
                  ]}
                  onPress={() => {
                    setLoadChequeData(item);
                    setClearanceDate(new Date(item.chi_date));
                  }}>
                  <View style={styles.chequeHeader}>
                    <Text style={styles.chequeNumber}>#{item.chi_number}</Text>
                    <Icon
                      name={
                        loadchequeData?.id === item.id
                          ? 'check-circle'
                          : 'radio-button-unchecked'
                      }
                      size={24}
                      color={
                        loadchequeData?.id === item.id
                          ? THEME.primary
                          : THEME.textGray
                      }
                    />
                  </View>

                  <View style={styles.chequeBody}>
                    <View style={styles.chequeRow}>
                      <Text style={styles.chequeLabel}>Amount:</Text>
                      <Text style={styles.chequeValue}>
                        Rs. {item.chi_amount}
                      </Text>
                    </View>
                    <View style={styles.chequeRow}>
                      <Text style={styles.chequeLabel}>Date:</Text>
                      <Text style={styles.chequeValue}>
                        {new Date(item.chi_date).toLocaleDateString('en-GB')}
                      </Text>
                    </View>
                    <View style={styles.chequeRow}>
                      <Text style={styles.chequeLabel}>Status:</Text>
                      <Text
                        style={[styles.chequeValue, {color: THEME.warning}]}>
                        {item.chi_status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Selected Cheque Details */}
          {loadchequeData && (
            <View style={styles.clearanceSection}>
              <Text style={styles.sectionHeader}>Clearance Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <Text style={styles.readOnlyInput}>
                  {loadchequeData.chi_amount}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cheque Number</Text>
                <Text style={styles.readOnlyInput}>
                  {loadchequeData.chi_number}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Method</Text>
                <Text style={styles.readOnlyInput}>
                  {loadchequeData.chi_payment_method}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Clearance Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateInput}>
                  <Icon name="event" size={20} color={THEME.primary} />
                  <Text style={styles.dateText}>
                    {clearanceDate
                      ? clearanceDate.toLocaleDateString()
                      : 'Select Date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Note</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={note}
                  placeholder="Enter clearance note"
                  placeholderTextColor={'#999'}
                  onChangeText={t => setNote(t)}
                  numberOfLines={3}
                  multiline
                />
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
        <View style={{height: 50}} />
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
        />
      )}

      {/* Confirmation Modal */}
      <Modal
        visible={modalVisible === 'confirmation'}
        onDismiss={() => setModalVisible('')}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.animContainer}>
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

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={[styles.modalBtn, styles.cancelBtn]}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  clearCheque();
                  setModalVisible('');
                }}
                style={[styles.modalBtn, styles.confirmBtn]}>
                <Text style={styles.modalBtnText}>Yes, Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <BottomBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- Header ---
  headerWrapper: {
    marginBottom: 20,
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuBtn: {
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

  // --- Card ---
  card: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textGray,
    marginBottom: 5,
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
  customerInfoBox: {
    backgroundColor: THEME.primaryLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  custInfoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.primary,
  },
  custInfoSub: {
    fontSize: 13,
    color: THEME.textGray,
    marginTop: 2,
  },

  // --- Cheque List ---
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: THEME.textGray,
  },
  chequeItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  chequeItemSelected: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primaryLight,
  },
  chequeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chequeNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  chequeBody: {
    gap: 5,
  },
  chequeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chequeLabel: {
    fontSize: 13,
    color: THEME.textGray,
  },
  chequeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textDark,
  },

  // --- Clearance Form ---
  clearanceSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 15,
  },
  readOnlyInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.textDark,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.textDark,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 48,
    gap: 10,
  },
  dateText: {
    fontSize: 14,
    color: THEME.textDark,
  },
  submitBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // --- Modal ---
  modalOverlay: {
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
    elevation: 5,
  },
  animContainer: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  confirmBtn: {
    backgroundColor: THEME.primary,
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
  },
});

export default ChequeClearance;
