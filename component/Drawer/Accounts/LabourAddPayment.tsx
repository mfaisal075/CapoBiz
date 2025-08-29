import {
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Image} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';

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

const LabourAddPayment = () => {
  const {openDrawer} = useDrawer();
  const [labourDropdown, setLabourDropdown] = useState<Labour[]>([]);
  const transformedLabr = labourDropdown.map(lab => ({
    label: lab.labr_name,
    value: lab.id.toString(),
  }));
  const [Open, setOpen] = useState(false);
  const [labourValue, setLabourValue] = useState<string | ''>('');
  const [labourData, setLabourData] = useState<Labour | null>(null);
  const [cashAddFrom, setCashAddForm] =
    useState<LabourAddForm>(initialLabourAddFrom);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cashType, setCashType] = useState('');
  const [cashTypeOpen, setCashTypeOpen] = useState(false);

  // Cash Payment Add Form OnChange
  const cashOnChange = (field: keyof LabourAddForm, value: string | Date) => {
    setCashAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Date OnChnage
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
    {label: 'Received in Company', value: 'received_in_company'},
    {label: 'Paid by Company', value: 'paid_by_company'},
  ];

  // Fetch Transporter dropdown
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
        text2: 'Please filled add fields',
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
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Payment has been added successfully!',
          visibilityTime: 1500,
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

  useEffect(() => {
    fetchLabrDropdown();
    getLabrData();
  }, [labourValue]);

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
              Add Transporter Payment
            </Text>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
          }}>
          <View style={styles.row}>
            <DropDownPicker
              items={transformedLabr}
              open={Open}
              value={labourValue}
              setValue={setLabourValue}
              setOpen={setOpen}
              placeholder="Select Labour"
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
              {labourData?.labr_name ? labourData?.labr_name : 'Labour Name'}
            </Text>
            <Text
              style={[
                styles.productinput,
                {backgroundColor: 'gray', color: '#F0F0EC'},
              ]}>
              {labourData?.labr_cnic ? labourData?.labr_cnic : 'CNIC'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text
              style={[
                styles.productinput,
                {backgroundColor: 'gray', color: '#F0F0EC'},
              ]}>
              {labourData?.labr_address ? labourData?.labr_address : 'Address'}
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
                onPress={() => setShowDatePicker(true)}
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
            <TouchableOpacity style={styles.submitBtn} onPress={addCashPayment}>
              <Text style={styles.submitBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={cashAddFrom.date}
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

export default LabourAddPayment;

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
