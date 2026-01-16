import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  BackHandler,
  Modal,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import RNPrint from 'react-native-print';
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

interface Labour {
  id: string;
  labr_name: string;
  labr_cnic: string;
  labr_address: string;
}

interface LabourAddForm {
  amount: string;
  note: string;
  date: Date;
}

const initialLabourAddFrom: LabourAddForm = {
  amount: '',
  date: new Date(),
  note: '',
};

const LabourAddPayment = ({navigation}: any) => {
  const {openDrawer} = useDrawer();
  const [selectedTab, setSelectedTab] = useState('Cash');
  const [labourDropdown, setLabourDropdown] = useState<Labour[]>([]);
  const transformedLabr = labourDropdown.map(lab => ({
    label: lab.labr_name,
    value: lab.id.toString(),
  }));
  const [labourData, setLabourData] = useState<Labour | null>(null);
  const [Open, setOpen] = useState(false);
  const [labourValue, setLabourValue] = useState<string | ''>('');
  const [cashAddFrom, setCashAddForm] =
    useState<LabourAddForm>(initialLabourAddFrom);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cashType, setCashType] = useState('');
  const [cashTypeOpen, setCashTypeOpen] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);

  // Cash Payment Add Form OnChange
  const cashOnChange = (field: keyof LabourAddForm, value: string | Date) => {
    setCashAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Date OnChange
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    if (selectedDate) {
      cashOnChange('date', selectedDate);
    }
    setShowDatePicker(false);
  };

  // Payment Type
  const paymentType = [
    {label: 'Received', value: 'Received'},
    {label: 'Paid', value: 'Paid'},
  ];

  // Fetch Labour dropdown
  const fetchLabrDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchlaboursdropdown`);
      setLabourDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Labour Data
  const getLabrData = async () => {
    if (labourValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchlabourdata`, {
          id: labourValue,
        });
        setLabourData({
          id: res.data.labour.id,
          labr_address: res.data.labour.labr_address,
          labr_cnic: res.data.labour.labr_cnic,
          labr_name: res.data.labour.labr_name,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Add Cash Payment
  const addCashPayment = async () => {
    if (!labourValue) {
      Toast.show({
        type: 'error',
        text1: 'Please Select Labour First!',
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
        text2: 'Please fill all fields',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addlabourcashpayment`, {
        labour_id: labourValue,
        amount: cashAddFrom.amount,
        note: cashAddFrom.note.trim(),
        labour_acc_date: cashAddFrom.date.toISOString().split('T')[0],
        pay_type: cashType,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        setReceipt(data);
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Payment has been added successfully!',
          visibilityTime: 2000,
        });
        setLabourValue('');
        setCashType('');
        setCashAddForm(initialLabourAddFrom);
        setLabourData(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const printReceipt = async () => {
    if (!receipt) return;

    const formattedDate = new Date(receipt?.date)
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .replace(/ /g, '-');

    const htmlContent = `
          <html>
            <head>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  padding: 20px;
                  color: #000;
                  font-size: 14px;
                  background-color: #fff;
                }
      
                .header {
                  text-align: center;
                  margin-bottom: 10px;
                }
      
                .header h2 {
                  margin: 0;
                  font-size: 20px;
                }
      
                .sub-header {
                  text-align: center;
                  margin-bottom: 15px;
                  font-size: 14px;
                }
      
                .section-title {
                  text-align: center;
                  font-weight: bold;
                  margin-top: 10px;
                  text-decoration: underline;
                }
      
                table {
                  width: 100%;
                  margin-top: 15px;
                  border-collapse: collapse;
                }
      
                td {
                  padding: 6px 0;
                  vertical-align: top;
                }
      
                .label {
                  width: 45%;
                  font-weight: bold;
                }
      
                .value {
                  width: 55%;
                  text-align: right;
                }
      
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 12px;
                  color: #555;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>Point of Sale System</h2>
                <div>IMTIAZ</div>
                <div>Gujranwala</div>
              </div>
      
              <div class="section-title">Labour Payment</div>
      
              <table>
                <tr>
                  <td class="label">Date:</td>
                  <td class="value">${formattedDate}</td>
                </tr>
                <tr>
                  <td class="label">Labour Name:</td>
                  <td class="value">${receipt?.labour_name}</td>
                </tr>
                <tr>
                  <td class="label">Payment:</td>
                  <td class="value">${receipt?.amount}</td>
                </tr>
                <tr>
                  <td class="label">Previous Balance:</td>
                  <td class="value">${receipt.previous_balance}</td>
                </tr>
                <tr>
                  <td class="label">Net Balance:</td>
                  <td class="value">${receipt?.net_balance}</td>
                </tr>
                <tr>
                  <td class="label">Payment Type:</td>
                  <td class="value">${receipt.type}</td>
                </tr>
                <tr>
                  <td class="label">Payment Method:</td>
                  <td class="value">By Cash</td>
                </tr>
              </table>
      
              <div class="footer">
                Software Developed with love by <b>Technic Mentors</b> | 0300-4900046
              </div>
            </body>
          </html>
        `;

    try {
      await RNPrint.print({html: htmlContent});
    } catch (error) {
      console.error('Print error:', error);
    }
  };

  useEffect(() => {
    fetchLabrDropdown();
    getLabrData();

    const backKey = () => {
      navigation.navigate('Labour Account');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [labourValue]);

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
            <Text style={styles.headerTitle}>Add Labour Payment</Text>
            <View style={{width: 24}} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Payment Details</Text>

          {/* Labour Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Labour</Text>
            <DropDownPicker
              items={transformedLabr}
              open={Open}
              value={labourValue}
              setValue={setLabourValue}
              setOpen={setOpen}
              placeholder="Choose labour..."
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

          {labourData && (
            <View style={styles.customerInfoBox}>
              <Text style={styles.custInfoTitle}>{labourData.labr_name}</Text>
              <Text style={styles.custInfoSub}>
                {labourData.labr_cnic} | {labourData.labr_address}
              </Text>
            </View>
          )}

          {/* Cash Payment Form */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={cashAddFrom.amount}
              placeholder="Enter amount"
              placeholderTextColor={'#999'}
              keyboardType="number-pad"
              onChangeText={t => cashOnChange('amount', t)}
              maxLength={9}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Note</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={cashAddFrom.note}
              placeholder="Add note"
              placeholderTextColor={'#999'}
              onChangeText={t => cashOnChange('note', t)}
              numberOfLines={3}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateInput}>
              <Icon name="event" size={20} color={THEME.primary} />
              <Text style={styles.dateText}>
                {cashAddFrom.date
                  ? cashAddFrom.date.toLocaleDateString()
                  : 'Select Date'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Type</Text>
            <DropDownPicker
              items={paymentType}
              open={cashTypeOpen}
              value={cashType}
              setValue={setCashType}
              setOpen={setCashTypeOpen}
              placeholder="Select Type"
              placeholderStyle={{color: '#999'}}
              textStyle={{color: THEME.textDark}}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={2000}
              zIndexInverse={2000}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={addCashPayment}>
            <Text style={styles.submitBtnText}>Submit Payment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={cashAddFrom.date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {/* Cash Payment Receipt Modal */}
      <Modal
        visible={!!receipt}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setReceipt(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Receipt</Text>
              <TouchableOpacity
                onPress={() => {
                  setCashType('');
                  setReceipt(null);
                }}
                style={styles.closeBtn}>
                <Icon name="close" size={20} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDetails}>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Date:</Text>
                <Text style={styles.modalValue}>{receipt?.date || 'N/A'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Labour Name:</Text>
                <Text style={styles.modalValue}>{receipt?.labour_name}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Payment:</Text>
                <Text style={styles.modalValue}>{receipt?.amount || '0'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Previous Balance:</Text>
                <Text style={styles.modalValue}>
                  {receipt?.previous_balance}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Net Balance:</Text>
                <Text style={styles.modalValue}>
                  {receipt?.net_balance ?? '0'}
                </Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Payment Type:</Text>
                <Text style={styles.modalValue}>{receipt?.type ?? '--'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Payment Method:</Text>
                <Text style={styles.modalValue}>By Cash</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                printReceipt();
                setCashType('');
                setReceipt(null);
              }}
              style={styles.printBtn}>
              <Icon name="print" size={20} color={THEME.white} />
              <Text style={styles.printBtnText}>Print Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <BottomBar />
      <Toast />
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
    paddingHorizontal: 15,
    marginTop: 15,
  },

  // --- Form Card ---
  formCard: {
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
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 20,
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
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.textDark,
    height: 48,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
  closeBtn: {
    padding: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  modalDetails: {
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textGray,
  },
  modalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
    maxWidth: '60%',
    textAlign: 'right',
  },
  printBtn: {
    backgroundColor: THEME.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  printBtnText: {
    color: THEME.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LabourAddPayment;
