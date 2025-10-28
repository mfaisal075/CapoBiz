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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../../Colors';

interface Transporter {
  id: number;
  trans_name: string;
  trans_cnic: string;
  trans_address: string;
}

interface TransporterAddForm {
  amount: string;
  note: string;
  date: Date;
}

const initialTransporterAddFrom: TransporterAddForm = {
  amount: '',
  date: new Date(),
  note: '',
};

const TransporterAddPayment = () => {
  const {openDrawer} = useDrawer();
  const [transDropdown, setTransDropdown] = useState<Transporter[]>([]);
  const transformedTrans = transDropdown.map(trans => ({
    label: trans.trans_name,
    value: trans.id.toString(),
  }));
  const [transData, setTransData] = useState<Transporter | null>(null);
  const [Open, setOpen] = useState(false);
  const [transValue, setTransValue] = useState<string | ''>('');
  const [cashAddFrom, setCashAddForm] = useState<TransporterAddForm>(
    initialTransporterAddFrom,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cashType, setCashType] = useState('');
  const [cashTypeOpen, setCashTypeOpen] = useState(false);

  // Cash Payment Add Form OnChange
  const cashOnChange = (
    field: keyof TransporterAddForm,
    value: string | Date,
  ) => {
    setCashAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Payment Type
  const paymentType = [
    {label: 'Received', value: 'Received'},
    {label: 'Paid', value: 'Paid'},
  ];

  // Fetch Transporter dropdown
  const fetchTransDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchtransportersdropdown`);
      setTransDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Transporter Data
  const getTransData = async () => {
    if (transValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchtransporterdata`, {
          id: transValue,
        });
        setTransData({
          id: res.data.transporter.id,
          trans_address: res.data.transporter.trans_address,
          trans_cnic: res.data.transporter.trans_cnic,
          trans_name: res.data.transporter.trans_name,
        });
      } catch (error) {
        console.log(error);
      }
    }
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

  // Add Cash Payment
  const addCashPayment = async () => {
    if (!transValue) {
      Toast.show({
        type: 'error',
        text1: 'Please Select Transporter First!',
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
      const res = await axios.post(`${BASE_URL}/addtransportercashpayment`, {
        transporter_id: transValue,
        amount: cashAddFrom.amount,
        note: cashAddFrom.note.trim(),
        trans_acc_date: cashAddFrom.date.toISOString().split('T')[0],
        pay_type: cashType,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Payment has been added successfully!',
          visibilityTime: 1500,
        });
        setTransValue('');
        setCashType('');
        setCashAddForm(initialTransporterAddFrom);
        setTransData(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTransData();
    fetchTransDropdown();
  }, [transValue]);

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
            <Text style={styles.headerTitle}>Add Transporter Payment</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} nestedScrollEnabled>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>

            {/* Transporter Selection */}
            <View style={styles.dropdownRow}>
              <Icon
                name="person"
                size={28}
                color={backgroundColors.dark}
                style={styles.personIcon}
              />
              <DropDownPicker
                items={transformedTrans}
                open={Open}
                value={transValue}
                setValue={setTransValue}
                setOpen={setOpen}
                placeholder="Choose transporter..."
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

            {transData && (
              <View style={styles.transporterInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Transporter Name:</Text>
                  <Text style={styles.infoValue}>{transData.trans_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CNIC:</Text>
                  <Text style={styles.infoValue}>{transData.trans_cnic}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.infoValue}>
                    {transData.trans_address}
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
                  maxLength={9}
                  placeholder="Enter amount *"
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
                <Text style={styles.inputLabel}>Date *</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
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
                <Text style={styles.inputLabel}>Payment Type</Text>
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
            themeVariant="dark"
          />
        )}
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
  transporterInfo: {
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
});

export default TransporterAddPayment;
