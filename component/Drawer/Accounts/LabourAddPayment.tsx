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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import backgroundColors from '../../Colors';
import RNPrint from 'react-native-print';

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

const LabourAddPayment = ({navigation}: any) => {
  const {openDrawer} = useDrawer();
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
  const [showDatePicker, setShowDatePicker] = useState<
    'cash' | 'cheque' | null
  >(null);
  const [chequeAddFrom, setChequeAddForm] =
    useState<ChequeAddFrom>(initialChequeAddForm);
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

  // Cheque Payment Add Form OnChange
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
            <Text style={styles.headerTitle}>Add Labour Payment</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} nestedScrollEnabled>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>

            {/* Labour Selection */}
            <View style={styles.dropdownRow}>
              <Icon
                name="person"
                size={28}
                color={backgroundColors.dark}
                style={styles.personIcon}
              />
              <DropDownPicker
                items={transformedLabr}
                open={Open}
                value={labourValue}
                setValue={setLabourValue}
                setOpen={setOpen}
                placeholder="Choose labour..."
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

            {labourData && (
              <View style={styles.labourInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Labour Name:</Text>
                  <Text style={styles.infoValue}>{labourData.labr_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CNIC:</Text>
                  <Text style={styles.infoValue}>{labourData.labr_cnic}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.infoValue}>
                    {labourData.labr_address}
                  </Text>
                </View>
              </View>
            )}

            {/* Cash Payment Form */}
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={cashAddFrom.amount}
                  placeholder="Enter amount *"
                  placeholderTextColor={'rgba(0,0,0,0.7)'}
                  keyboardType="number-pad"
                  onChangeText={t => cashOnChange('amount', t)}
                  maxLength={9}
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
                <TouchableOpacity
                  onPress={() => setShowDatePicker('cash')}
                  style={styles.dateInput}>
                  <Icon name="event" size={20} color={backgroundColors.dark} />
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
                  placeholder="Select Type *"
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

            <TouchableOpacity style={styles.submitBtn} onPress={addCashPayment}>
              <Text style={styles.submitBtnText}>Submit Payment</Text>
            </TouchableOpacity>
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
      </View>

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
                <Text style={styles.modalLabel}>Date:</Text>
                <Text style={styles.modalValue}>{receipt?.date || 'N/A'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Labour Name:</Text>
                <Text style={[styles.modalValue]}>{receipt?.labour_name}</Text>
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
                <Text style={[styles.modalValue]}>By Cash</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                printReceipt();
                setCashType('');
                setReceipt(null);
              }}
              style={styles.modalButton}>
              <Icon name="print" size={20} color={backgroundColors.light} />
              <Text style={styles.modalButtonText}>Print</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Toast />
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
  labourInfo: {
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
  },
  infoValue: {
    color: backgroundColors.dark,
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
    fontWeight: '600',
    color: backgroundColors.dark,
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
  // Receipt Modal
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
    color: backgroundColors.dark,
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
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    alignSelf: 'center',
    backgroundColor: backgroundColors.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default LabourAddPayment;
