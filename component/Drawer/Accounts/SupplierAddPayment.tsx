import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ImageBackground} from 'react-native';
import {Image} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
    label: supp.sup_name,
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

  // Date OnChnage
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
        text2: 'Please filled add fields',
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
        text1: 'Please Select Suppliet First!',
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
        text2: 'Please filled add fields',
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
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../../assets/menu.png')}
              style={{
                width: 30,
                height: 30,
                tintColor: 'white',
              }}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text
              style={{
                color: 'white',
                fontSize: 22,
                fontWeight: 'bold',
              }}>
              Add Supplier payment
            </Text>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
          }}>
          {/* Toggle Buttons */}
          <View style={styles.toggleBtnContainer}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'Cash' && {backgroundColor: '#D0F4DE'},
              ]}
              onPress={() => setSelectedTab('Cash')}>
              <Text style={styles.toggleBtnText}>Cash Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'Cheque' && {backgroundColor: '#D0F4DE'},
              ]}
              onPress={() => setSelectedTab('Cheque')}>
              <Text style={styles.toggleBtnText}>Cheque Payment</Text>
            </TouchableOpacity>
          </View>

          {selectedTab === 'Cash' ? (
            <>
              <View style={styles.row}>
                <DropDownPicker
                  items={transformedSupp}
                  open={Open}
                  value={suppValue}
                  setValue={setSuppValue}
                  setOpen={setOpen}
                  placeholder="Select Customer"
                  placeholderStyle={{color: 'white'}}
                  textStyle={{color: 'white'}}
                  style={styles.dropdown}
                  dropDownContainerStyle={{
                    backgroundColor: 'white',
                    borderColor: '#144272',
                    width: '100%',
                    marginTop: 8,
                  }}
                  labelStyle={{color: 'white'}}
                  listItemLabelStyle={{color: '#144272'}}
                  ArrowUpIconComponent={() => (
                    <Text>
                      <Icon name="chevron-up" size={15} color="white" />
                    </Text>
                  )}
                  ArrowDownIconComponent={() => (
                    <Text>
                      <Icon name="chevron-down" size={15} color="white" />
                    </Text>
                  )}
                  listMode="SCROLLVIEW"
                />
              </View>

              <View style={styles.row}>
                <Text
                  style={[
                    styles.productinput,
                    {backgroundColor: 'gray', color: '#F0F0EC'},
                  ]}>
                  {suppData?.sup_company_name
                    ? suppData?.sup_company_name
                    : 'Customer Name'}
                </Text>
                <Text
                  style={[
                    styles.productinput,
                    {backgroundColor: 'gray', color: '#F0F0EC'},
                  ]}>
                  {suppData?.sup_company_name
                    ? suppData?.sup_company_name
                    : 'Company Name'}
                </Text>
              </View>

              <View style={styles.row}>
                <Text
                  style={[
                    styles.productinput,
                    {backgroundColor: 'gray', color: '#F0F0EC'},
                  ]}>
                  {suppData?.sup_address ? suppData?.sup_address : 'Address'}
                </Text>
                <TextInput
                  style={styles.productinput}
                  value={cashAddFrom.amount}
                  placeholder="Amount"
                  placeholderTextColor={'#F0F0EC'}
                  keyboardType="number-pad"
                  onChangeText={t => cashOnChange('amount', t)}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[
                    styles.productinput,
                    {height: 75, textAlignVertical: 'top', width: '100%'},
                  ]}
                  value={cashAddFrom.note}
                  placeholder="Note"
                  placeholderTextColor={'#f0f0ec'}
                  onChangeText={t => cashOnChange('note', t)}
                  numberOfLines={3}
                  multiline
                />
              </View>

              {/* Date Fields Section */}
              <View style={styles.row}>
                <View style={{width: '100%'}}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker('cash')}
                    style={styles.dateInput}>
                    <Text style={{color: 'white'}}>
                      {cashAddFrom.date
                        ? cashAddFrom.date.toLocaleDateString()
                        : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.row}>
                <DropDownPicker
                  items={paymentType}
                  open={cashTypeOpen}
                  value={cashType}
                  setValue={setCashType}
                  setOpen={setCashTypeOpen}
                  placeholder="Select Type"
                  placeholderStyle={{color: 'white'}}
                  textStyle={{color: 'white'}}
                  style={styles.dropdown}
                  dropDownContainerStyle={{
                    backgroundColor: 'white',
                    borderColor: '#144272',
                    width: '100%',
                    marginTop: 8,
                  }}
                  labelStyle={{color: 'white'}}
                  listItemLabelStyle={{color: '#144272'}}
                  ArrowUpIconComponent={() => (
                    <Text>
                      <Icon name="chevron-up" size={15} color="white" />
                    </Text>
                  )}
                  ArrowDownIconComponent={() => (
                    <Text>
                      <Icon name="chevron-down" size={15} color="white" />
                    </Text>
                  )}
                  listMode="SCROLLVIEW"
                />
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={addCashPayment}>
                  <Text style={styles.submitBtnText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.row}>
                <TextInput
                  style={styles.productinput}
                  value={chequeAddFrom.chequeNumber}
                  placeholder="Cheque Number"
                  placeholderTextColor={'#F0F0EC'}
                  keyboardType="number-pad"
                  onChangeText={t => chequeOnChange('chequeNumber', t)}
                />
                <TextInput
                  style={styles.productinput}
                  value={chequeAddFrom.amount}
                  placeholder="Amount"
                  placeholderTextColor={'#F0F0EC'}
                  keyboardType="number-pad"
                  onChangeText={t => chequeOnChange('amount', t)}
                />
              </View>

              <View style={styles.row}>
                <DropDownPicker
                  items={transformedSupp}
                  open={Open}
                  value={suppValue}
                  setValue={setSuppValue}
                  setOpen={setOpen}
                  placeholder="Select Customer"
                  placeholderStyle={{color: 'white'}}
                  textStyle={{color: 'white'}}
                  style={styles.dropdown}
                  dropDownContainerStyle={{
                    backgroundColor: 'white',
                    borderColor: '#144272',
                    width: '100%',
                    marginTop: 8,
                  }}
                  labelStyle={{color: 'white'}}
                  listItemLabelStyle={{color: '#144272'}}
                  ArrowUpIconComponent={() => (
                    <Text>
                      <Icon name="chevron-up" size={15} color="white" />
                    </Text>
                  )}
                  ArrowDownIconComponent={() => (
                    <Text>
                      <Icon name="chevron-down" size={15} color="white" />
                    </Text>
                  )}
                  listMode="SCROLLVIEW"
                />
              </View>

              <View style={styles.row}>
                <Text
                  style={[
                    styles.productinput,
                    {backgroundColor: 'gray', color: '#F0F0EC'},
                  ]}>
                  {suppData?.sup_company_name
                    ? suppData.sup_name
                    : 'Supplier Name'}
                </Text>
                <Text
                  style={[
                    styles.productinput,
                    {backgroundColor: 'gray', color: '#F0F0EC'},
                  ]}>
                  {suppData?.sup_company_name
                    ? suppData.sup_company_name
                    : 'Company Name'}
                </Text>
              </View>

              <View style={styles.row}>
                <Text
                  style={[
                    styles.productinput,
                    {backgroundColor: 'gray', color: '#F0F0EC', width: '100%'},
                  ]}>
                  {suppData?.sup_address ? suppData.sup_address : 'Address'}
                </Text>
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[
                    styles.productinput,
                    {height: 75, textAlignVertical: 'top', width: '100%'},
                  ]}
                  value={chequeAddFrom.note}
                  placeholder="Note"
                  placeholderTextColor={'#f0f0ec'}
                  onChangeText={t => chequeOnChange('note', t)}
                  numberOfLines={3}
                  multiline
                />
              </View>

              {/* Date Fields Section */}
              <View style={styles.row}>
                <View style={{width: '100%'}}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker('cash')}
                    style={styles.dateInput}>
                    <Text style={{color: 'white'}}>
                      {chequeAddFrom.date
                        ? chequeAddFrom.date.toLocaleDateString()
                        : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.row}>
                <Text
                  style={[
                    styles.productinput,
                    {backgroundColor: 'gray', width: '100%'},
                  ]}>
                  Paid by Company
                </Text>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={addChequePayment}>
                  <Text style={styles.submitBtnText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

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
              style={{backgroundColor: '#144272'}}
            />
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SupplierAddPayment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnContainer: {
    width: '100%',
    height: 50,
    paddingHorizontal: '5%',
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  toggleBtn: {
    height: '80%',
    width: '40%',
    backgroundColor: '#f8f8f8',
    alignSelf: 'center',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 38,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '100%',
  },
  productinput: {
    borderWidth: 1,
    width: '46%',
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginTop: 5,
    color: '#fff',
    height: 38,
  },
  row: {
    width: '100%',
    marginTop: 10,
    paddingHorizontal: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginTop: 5,
    justifyContent: 'center',
    height: 38, // Match other input heights
  },
  submitBtn: {
    height: 38,
    width: '100%',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#144272',
    backgroundColor: '#fff',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#144272',
    textAlign: 'center',
  },
});
