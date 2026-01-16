import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Modal,
  BackHandler,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BASE_URL from '../../BASE_URL';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
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

const AddCustomerPayment = ({navigation}: any) => {
  const {openDrawer} = useDrawer();
  const [custDropdown, setCustDropdown] = useState<Customers[]>([]);
  const transformedCust = custDropdown.slice(1).map(cust => ({
    label: cust.cust_name,
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
        setCashAddForm(initialCustomerAddFrom);
        setCustData(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const printReceipt = async () => {
    if (!receipt) return;

    const customerName =
      custDropdown.find(cust => cust.id.toString() === receipt?.custac_cust_id)
        ?.cust_name || 'N/A';

    const formattedDate = new Date(receipt?.custac_date)
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

        <div class="section-title">Customer Payment</div>

        <table>
          <tr>
            <td class="label">Date:</td>
            <td class="value">${formattedDate}</td>
          </tr>
          <tr>
            <td class="label">Customer Name:</td>
            <td class="value">${customerName}</td>
          </tr>
          <tr>
            <td class="label">Payment:</td>
            <td class="value">${
              cashType === 'Paid'
                ? receipt.custac_total_bill_amount
                : receipt.custac_paid_amount
            }</td>
          </tr>
          <tr>
            <td class="label">Previous Balance:</td>
            <td class="value">${receipt.custac_balance}</td>
          </tr>
          <tr>
            <td class="label">Net Balance:</td>
            <td class="value">${
              Number(receipt.custac_balance || 0) +
              Number(
                cashType === 'Paid'
                  ? receipt.custac_total_bill_amount
                  : receipt.custac_paid_amount,
              )
            }</td>
          </tr>
          <tr>
            <td class="label">Payment Type:</td>
            <td class="value">${receipt.custac_payment_type}</td>
          </tr>
          <tr>
            <td class="label">Payment Method:</td>
            <td class="value">${receipt.custac_payment_method}</td>
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
        setChequeAddForm(initialChequeAddForm);
        setCustData(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Print Cheque payment receipt
  const printCheReceipt = async () => {
    if (!chiReceipt) return;

    const customerName =
      custDropdown.find(cust => cust.id.toString() === chiReceipt?.chi_cust_id)
        ?.cust_name || 'N/A';

    const formattedDate = new Date(receipt?.custac_date)
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

        <div class="section-title">Customer Payment</div>

        <table>
          <tr>
            <td class="label">Date:</td>
            <td class="value">${formattedDate}</td>
          </tr>
          <tr>
            <td class="label">Customer Name:</td>
            <td class="value">${chiReceipt?.chi_number}</td>
          </tr>
          <tr>
            <td class="label">Customer Name:</td>
            <td class="value">${customerName}</td>
          </tr>
          <tr>
            <td class="label">Payment:</td>
            <td class="value">${chiReceipt?.chi_amount}</td>
          </tr>
          <tr>
            <td class="label">Note:</td>
            <td class="value">${chiReceipt?.chi_note}</td>
          </tr>
          <tr>
            <td class="label">Paymmet Method:</td>
            <td class="value">${chiReceipt?.chi_payment_method}</td>
          </tr>
           <tr>
            <td class="label">Status:</td>
            <td class="value">${chiReceipt?.chi_status}</td>
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
    fetchCustDropdown();
    getCustData();

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
            <Text style={styles.headerTitle}>Add Customer Payment</Text>
            <View style={{width: 24}} />
          </View>
        </LinearGradient>

        {/* Floating Segment Control */}
        <View style={styles.floatingSegmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              selectedTab === 'Cash' && styles.segmentBtnActive,
            ]}
            onPress={() => setSelectedTab('Cash')}>
            <Text
              style={[
                styles.segmentText,
                selectedTab === 'Cash' && styles.segmentTextActive,
              ]}>
              Cash Payment
            </Text>
          </TouchableOpacity>
          <View style={styles.segmentDivider} />
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              selectedTab === 'Cheque' && styles.segmentBtnActive,
            ]}
            onPress={() => setSelectedTab('Cheque')}>
            <Text
              style={[
                styles.segmentText,
                selectedTab === 'Cheque' && styles.segmentTextActive,
              ]}>
              Cheque Payment
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Payment Details</Text>

          {/* Customer Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Customer</Text>
            <DropDownPicker
              items={transformedCust}
              open={Open}
              value={customerVal}
              setValue={setCustomerVal}
              setOpen={setOpen}
              placeholder="Select Customer"
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

          {selectedTab === 'Cash' ? (
            <>
              {/* Cash Payment Form */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  maxLength={9}
                  value={cashAddFrom.amount}
                  placeholder="Enter amount"
                  placeholderTextColor={'#999'}
                  keyboardType="number-pad"
                  onChangeText={t => cashOnChange('amount', t)}
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
                  onPress={() => setShowDatePicker('cash')}
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
                  placeholder="Select type"
                  placeholderStyle={{color: '#999'}}
                  textStyle={{color: THEME.textDark}}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                  zIndex={2000}
                  zIndexInverse={2000}
                />
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
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cheque Number</Text>
                <TextInput
                  style={styles.input}
                  value={chequeAddFrom.chequeNumber}
                  placeholder="Enter cheque number"
                  placeholderTextColor={'#999'}
                  keyboardType="number-pad"
                  onChangeText={t => chequeOnChange('chequeNumber', t)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={chequeAddFrom.amount}
                  maxLength={9}
                  placeholder="Enter amount"
                  placeholderTextColor={'#999'}
                  keyboardType="number-pad"
                  onChangeText={t => chequeOnChange('amount', t)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Note</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={chequeAddFrom.note}
                  placeholder="Add note"
                  placeholderTextColor={'#999'}
                  onChangeText={t => chequeOnChange('note', t)}
                  numberOfLines={3}
                  multiline
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker('cheque')}
                  style={styles.dateInput}>
                  <Icon name="event" size={20} color={THEME.primary} />
                  <Text style={styles.dateText}>
                    {chequeAddFrom.date
                      ? chequeAddFrom.date.toLocaleDateString()
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
                  placeholder="Select type"
                  placeholderStyle={{color: '#999'}}
                  textStyle={{color: THEME.textDark}}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                  zIndex={2000}
                  zIndexInverse={2000}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={addChequePayment}>
                <Text style={styles.submitBtnText}>Submit Cheque</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={{height: 50}} />
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
        />
      )}

      {/* Receipt Modals */}
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

            {/* Details */}
            <View style={styles.modalDetails}>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Invoice No:</Text>
                <Text style={styles.modalValue}>
                  {receipt?.custac_invoice_no}
                </Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Date:</Text>
                <Text style={styles.modalValue}>
                  {new Date(receipt?.custac_date)
                    .toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                    .replace(/ /g, '-')}
                </Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Customer:</Text>
                <Text style={styles.modalValue}>
                  {
                    custDropdown.find(
                      cust => cust.id.toString() === receipt?.custac_cust_id,
                    )?.cust_name
                  }
                </Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Amount:</Text>
                <Text style={styles.modalValue}>
                  {cashType === 'Paid'
                    ? receipt?.custac_total_bill_amount
                    : receipt?.custac_paid_amount}
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
                <Text style={styles.modalLabel}>Note:</Text>
                <Text style={styles.modalValue}>{receipt?.custac_note}</Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Balance:</Text>
                <Text style={styles.modalValue}>{receipt?.custac_balance}</Text>
              </View>
            </View>

            {/* Print Button */}
            <TouchableOpacity
              onPress={() => {
                setCashType('');
                setReceipt(null);
                printReceipt();
              }}
              style={styles.printBtn}>
              <Icon name="print" size={20} color={THEME.white} />
              <Text style={styles.printBtnText}>Print Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!chiReceipt}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setChiReceipt(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cheque Receipt</Text>
              <TouchableOpacity
                onPress={() => {
                  setCashType('');
                  setChiReceipt(null);
                }}
                style={styles.closeBtn}>
                <Icon name="close" size={20} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDetails}>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Cheque No:</Text>
                <Text style={styles.modalValue}>{chiReceipt?.chi_number}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Date:</Text>
                <Text style={styles.modalValue}>
                  {new Date(chiReceipt?.chi_date)
                    .toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                    .replace(/ /g, '-')}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Customer:</Text>
                <Text style={[styles.modalValue]}>
                  {
                    custDropdown.find(
                      cust => cust.id.toString() === chiReceipt?.chi_cust_id,
                    )?.cust_name
                  }
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Amount:</Text>
                <Text style={[styles.modalValue]}>
                  {chiReceipt?.chi_amount}
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
                <Text style={styles.modalValue}>{chiReceipt?.chi_status}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                printCheReceipt();
                setCashType('');
                setChiReceipt(null);
              }}
              style={styles.printBtn}>
              <Icon name="print" size={20} color={THEME.white} />
              <Text style={styles.printBtnText}>Print Receipt</Text>
            </TouchableOpacity>
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
    paddingBottom: 40, // Extra space for floating segment
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom removed as it's not needed with centering
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

  // --- FLOATING SEGMENT ---
  floatingSegmentContainer: {
    position: 'absolute',
    bottom: -24,
    left: 20,
    right: 20,
    backgroundColor: THEME.white,
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  segmentBtn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: THEME.primaryLight,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textGray,
  },
  segmentTextActive: {
    color: THEME.primary,
    fontWeight: '700',
  },
  segmentDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#eee',
    marginHorizontal: 4,
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

  // --- Modals ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
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

export default AddCustomerPayment;
