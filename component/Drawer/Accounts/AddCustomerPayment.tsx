import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
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
import backgroundColors from '../../Colors';
import RNPrint from 'react-native-print';

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
  }, [customerVal]);

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
            <Text style={styles.headerTitle}>Add Customer Payment</Text>
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

            {/* Customer Selection */}
            <View style={styles.dropdownRow}>
              <Icon
                name="person"
                size={28}
                color={backgroundColors.dark}
                style={styles.personIcon}
              />
              <DropDownPicker
                items={transformedCust}
                open={Open}
                value={customerVal}
                setValue={setCustomerVal}
                setOpen={setOpen}
                placeholder="Select Customer"
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
                    <TextInput
                      style={styles.input}
                      maxLength={9}
                      value={cashAddFrom.amount}
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
                      placeholder="Select type *"
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
                      maxLength={9}
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
                      placeholder="Add note *"
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
                      <Icon
                        name="event"
                        size={20}
                        color={backgroundColors.dark}
                      />
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
                    <DropDownPicker
                      items={paymentType}
                      open={cashTypeOpen}
                      value={cashType}
                      setValue={setCashType}
                      setOpen={setCashTypeOpen}
                      placeholder="Select type *"
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
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🧾 Payment Receipt</Text>
                <TouchableOpacity
                  onPress={() => {
                    setCashType('');
                    setReceipt(null);
                  }}>
                  <Text style={styles.closeButton}>✕</Text>
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
                  <Text style={styles.modalValue}>
                    {receipt?.custac_balance}
                  </Text>
                </View>
              </View>

              {/* Print Button */}
              <TouchableOpacity
                onPress={() => {
                  setCashType('');
                  setReceipt(null);
                  printReceipt();
                }}
                style={styles.modalButton}>
                <Icon name="print" size={20} color={backgroundColors.light} />
                <Text style={styles.modalButtonText}>Print</Text>
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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🧾 Cheque Receipt</Text>
                <TouchableOpacity
                  onPress={() => {
                    setCashType('');
                    setChiReceipt(null);
                  }}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalDetails}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Cheque No:</Text>
                  <Text style={styles.modalValue}>
                    {chiReceipt?.chi_number}
                  </Text>
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
                  <Text style={styles.modalValue}>
                    {chiReceipt?.chi_status}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  printCheReceipt()
                  setCashType('')
                  setChiReceipt(null);
                }}
                style={styles.modalButton}>
                <Icon name="print" size={20} color={backgroundColors.light} />
                <Text style={styles.modalButtonText}>Print</Text>
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
  customerInfo: {
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

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    paddingHorizontal: 8,
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

export default AddCustomerPayment;
