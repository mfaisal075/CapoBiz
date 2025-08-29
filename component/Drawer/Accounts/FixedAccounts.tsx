import {
  KeyboardAvoidingView,
  Modal,
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
import {ScrollView} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';

interface FixedAccount {
  id: number;
  fixprf_business_account_name: string;
}

interface FixedAccountDetails {
  id: number;
  fixac_invoice_no: string;
  fixac_date: string;
  fixac_payment_type: string;
  fixac_debit: string;
  fixac_credit: string;
  fixac_balance: string;
  fixac_description: string;
  fixprf_business_account_name: string;
}

interface FixedAccAddForm {
  amount: string;
  desc: string;
  date: Date;
}

const initialFixedAccAddFrom: FixedAccAddForm = {
  amount: '',
  date: new Date(),
  desc: '',
};

export default function FixedAccounts() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [Open, setOpen] = useState(false);
  const [txnOpen, setTxnOpen] = useState(false);
  const [modalDropdownOpen, setModalDropdownOpen] = useState(false);
  const [fixedAccValue, setFixedAccValue] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [modalShowDatePicker, setModalShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState('');
  const [fixedDropdown, setFixedDropdown] = useState<FixedAccount[]>([]);
  const transformedFixedAcc = fixedDropdown.map(fix => ({
    label: fix.fixprf_business_account_name,
    value: fix.id.toString(),
  }));
  const [fixedAccDetails, setFixedAccDetails] = useState<FixedAccountDetails[]>(
    [],
  );
  const [cashAddFrom, setCashAddForm] = useState<FixedAccAddForm>(
    initialFixedAccAddFrom,
  );
  const [txnTypeValue, setTxnTypeValue] = useState('');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(null);
      return;
    }

    if (selectedDate) {
      if (showDatePicker === 'from') {
        setFromDate(selectedDate);
      } else if (showDatePicker === 'to') {
        setToDate(selectedDate);
      }
    }
    setShowDatePicker(null);
  };

  // Cash Payment Add Form OnChange
  const cashOnChange = (field: keyof FixedAccAddForm, value: string | Date) => {
    setCashAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const modalDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setModalShowDatePicker(false);
      return;
    }

    if (selectedDate) {
      cashOnChange('date', selectedDate);
    }
    setModalShowDatePicker(false);
  };

  // Transaction Type
  const txnType = [
    {label: 'Debit', value: 'Debit'},
    {label: 'Credit', value: 'Credit'},
  ];

  // Fetch Fixed dropdown
  const fetchFixesDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchfixedaccountdropdown`);
      setFixedDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Fixed Accounts Details
  const fetchFixedAccDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.get(
        `${BASE_URL}/fetchfixedaccounts?account_id=${fixedAccValue}&from=${from}&to=${to}&_token=${token}`,
      );
      setFixedAccDetails(res.data.accounts);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Cash Payment
  const addCashPayment = async () => {
    if (!fixedAccValue) {
      Toast.show({
        type: 'error',
        text1: 'Please Select Account First!',
        visibilityTime: 1500,
      });
      return;
    }

    if (
      !txnTypeValue ||
      !cashAddFrom.amount ||
      !cashAddFrom.date ||
      !cashAddFrom.desc
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
      const res = await axios.post(`${BASE_URL}/addfixedaccountpayment`, {
        invoice_no: '',
        account_id: fixedAccValue,
        payment_type: txnTypeValue,
        date: cashAddFrom.date.toISOString().split('T')[0],
        amount: cashAddFrom.amount,
        description: cashAddFrom.desc.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Payment has been added successfully!',
          visibilityTime: 1500,
        });
        setFixedAccValue('');
        setTxnTypeValue('');
        setCashAddForm(initialFixedAccAddFrom);
        setModalVisible('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchFixesDropdown();
    fetchFixedAccDetails();
  }, [fixedAccValue, fromDate, toDate]);

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
              Fixed Accounts
            </Text>
          </View>
        </View>

        <ScrollView style={{flex: 1}}>
          {/* Other Buttons */}
          <View style={[styles.toggleBtnContainer, {marginVertical: 5}]}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                {borderRadius: 10, backgroundColor: '#144272'},
              ]}
              onPress={() => setModalVisible('addPayment')}>
              <Text style={[styles.toggleBtnText, {color: 'white'}]}>
                Add Payment
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'column',
              alignSelf: 'center',
              marginTop: 10,
            }}>
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 14,
                marginLeft: 5,
              }}>
              Account:
            </Text>
            <DropDownPicker
              items={transformedFixedAcc}
              open={Open}
              value={fixedAccValue}
              setValue={setFixedAccValue}
              setOpen={setOpen}
              placeholder="Select Customer"
              placeholderStyle={{color: 'white'}}
              textStyle={{color: 'white'}}
              style={styles.dropdown}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: '90%',
                marginTop: 8,
              }}
              labelStyle={{color: 'white', fontWeight: 'bold'}}
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

          {/* Date Fields Section */}
          <View
            style={{
              width: '100%',
              marginTop: 10,
              paddingHorizontal: '5%',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            {/* From Date */}
            <View style={{width: '48%'}}>
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 14,
                  marginLeft: 5,
                  textAlign: 'left',
                }}>
                From Date:
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker('from')}
                style={styles.dateInput}>
                <Text style={{color: 'white'}}>
                  {fromDate ? fromDate.toLocaleDateString() : ''}
                </Text>
              </TouchableOpacity>
            </View>

            {/* To Date */}
            <View style={{width: '48%'}}>
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 14,
                  marginLeft: 5,
                  textAlign: 'left',
                }}>
                To Date:
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker('to')}
                style={styles.dateInput}>
                <Text style={{color: 'white'}}>
                  {toDate ? toDate.toLocaleDateString() : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={
                showDatePicker === 'from'
                  ? fromDate ?? new Date()
                  : toDate ?? new Date()
              }
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              themeVariant="dark"
              style={{backgroundColor: '#144272'}}
            />
          )}

          {/* Invoices Cards */}
          <View style={{paddingBottom: 30}}>
            <View style={{marginTop: 20}}>
              {fixedAccDetails.length === 0 ? (
                <View style={{alignItems: 'center', marginTop: 20}}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}>
                    No record found.
                  </Text>
                </View>
              ) : (
                fixedAccDetails.map((item, index) => (
                  <View key={item.id} style={{padding: 5}}>
                    <View style={styles.table}>
                      <View style={styles.tablehead}>
                        <Text
                          style={{
                            color: '#144272',
                            fontWeight: 'bold',
                            marginLeft: 5,
                            marginTop: 5,
                          }}>
                          {item.fixac_invoice_no}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        {[
                          {
                            label: 'Date:',
                            value: new Date(item.fixac_date)
                              .toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                              .replace(/\//g, '-'),
                          },
                          {
                            label: 'Account:',
                            value: item.fixprf_business_account_name,
                          },
                          {label: 'Debit:', value: item.fixac_debit},
                          {label: 'Credit:', value: item.fixac_credit},
                          {label: 'Balance:', value: item.fixac_balance},
                        ].map(
                          (
                            field: {label: string; value: string | number},
                            idx,
                          ) => (
                            <View
                              key={`${index}-${idx}`}
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                              }}>
                              <Text style={[styles.value, {marginBottom: 5}]}>
                                {field.label}
                              </Text>
                              <Text style={[styles.value, {marginBottom: 5}]}>
                                {typeof field.value === 'number'
                                  ? field.value.toFixed(2)
                                  : field.value}
                              </Text>
                            </View>
                          ),
                        )}
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
      {/* Add & WithDraw Payment Modal */}
      <Modal
        visible={modalVisible === 'addPayment'}
        transparent
        animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidContainer}>
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Payment</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible('')}
                  style={styles.closeButton}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView
                style={styles.modalBodyScroll}
                contentContainerStyle={styles.modalBodyContent}
                keyboardShouldPersistTaps="handled">
                <View style={styles.modalBody}>
                  <View
                    style={{
                      width: '100%',
                      marginTop: 10,
                      paddingHorizontal: '5%',
                    }}>
                    <Text
                      style={{
                        color: '#000',
                        fontWeight: 'bold',
                        fontSize: 14,
                        marginLeft: 5,
                        textAlign: 'left',
                      }}>
                      Invoice#
                    </Text>
                    <TextInput
                      style={[styles.productinput, {backgroundColor: 'gray'}]}
                      editable={false}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: 'column',
                      alignSelf: 'center',
                      marginTop: 10,
                    }}>
                    <Text
                      style={{
                        color: '#000',
                        fontWeight: 'bold',
                        fontSize: 14,
                        marginLeft: 5,
                      }}>
                      Account:
                    </Text>
                    <DropDownPicker
                      items={transformedFixedAcc}
                      open={modalDropdownOpen}
                      value={fixedAccValue}
                      setValue={setFixedAccValue}
                      setOpen={setModalDropdownOpen}
                      placeholder="Select Account"
                      placeholderStyle={{color: '#000'}}
                      textStyle={{color: 'white'}}
                      style={[styles.dropdown, {borderColor: '#000'}]}
                      dropDownContainerStyle={{
                        backgroundColor: 'white',
                        borderColor: '#144272',
                        width: '90%',
                        marginTop: 8,
                        zIndex: 1000,
                      }}
                      labelStyle={{color: '#144272', fontWeight: 'bold'}}
                      listItemLabelStyle={{color: '#144272'}}
                      ArrowUpIconComponent={() => (
                        <Text>
                          <Icon name="chevron-up" size={15} color="#000" />
                        </Text>
                      )}
                      ArrowDownIconComponent={() => (
                        <Text>
                          <Icon name="chevron-down" size={15} color="#000" />
                        </Text>
                      )}
                      listMode="SCROLLVIEW"
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: 'column',
                      alignSelf: 'center',
                      marginTop: 10,
                    }}>
                    <Text
                      style={{
                        color: '#000',
                        fontWeight: 'bold',
                        fontSize: 14,
                        marginLeft: 5,
                      }}>
                      Transaction Type:
                    </Text>
                    <DropDownPicker
                      items={txnType}
                      open={txnOpen}
                      value={txnTypeValue}
                      setValue={setTxnTypeValue}
                      setOpen={setTxnOpen}
                      placeholder="Select Type"
                      placeholderStyle={{color: '#000'}}
                      textStyle={{color: 'white'}}
                      style={[
                        styles.dropdown,
                        {borderColor: '#000', zIndex: 999},
                      ]}
                      dropDownContainerStyle={{
                        backgroundColor: 'white',
                        borderColor: '#144272',
                        width: '90%',
                        marginTop: 8,
                      }}
                      labelStyle={{color: '#144272', fontWeight: 'bold'}}
                      listItemLabelStyle={{color: '#144272'}}
                      ArrowUpIconComponent={() => (
                        <Text>
                          <Icon name="chevron-up" size={15} color="#000" />
                        </Text>
                      )}
                      ArrowDownIconComponent={() => (
                        <Text>
                          <Icon name="chevron-down" size={15} color="#000" />
                        </Text>
                      )}
                      listMode="SCROLLVIEW"
                    />
                  </View>

                  {/* Date Fields Section */}
                  <View
                    style={{
                      width: '100%',
                      marginTop: 10,
                      paddingHorizontal: '5%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    {/* From Date */}
                    <View style={{width: '100%'}}>
                      <Text
                        style={{
                          color: '#000',
                          fontWeight: 'bold',
                          fontSize: 14,
                          marginLeft: 5,
                          textAlign: 'left',
                        }}>
                        Date <Text style={{color: 'red'}}>*</Text>
                      </Text>
                      <TouchableOpacity
                        onPress={() => setModalShowDatePicker(true)}
                        style={[styles.dateInput, {borderColor: '#000'}]}>
                        <Text style={{color: '#000'}}>
                          {cashAddFrom.date
                            ? cashAddFrom.date.toLocaleDateString()
                            : ''}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {modalShowDatePicker && (
                    <DateTimePicker
                      value={cashAddFrom.date}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={modalDateChange}
                      themeVariant="dark"
                      style={{backgroundColor: '#144272'}}
                    />
                  )}

                  <View
                    style={{
                      width: '100%',
                      marginTop: 10,
                      paddingHorizontal: '5%',
                    }}>
                    <Text
                      style={{
                        color: '#000',
                        fontWeight: 'bold',
                        fontSize: 14,
                        marginLeft: 5,
                        textAlign: 'left',
                      }}>
                      Amount <Text style={{color: 'red'}}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.productinput}
                      keyboardType="number-pad"
                      value={cashAddFrom.amount}
                      onChangeText={t => cashOnChange('amount', t)}
                    />
                  </View>

                  <View
                    style={{
                      width: '100%',
                      marginTop: 10,
                      paddingHorizontal: '5%',
                    }}>
                    <Text
                      style={{
                        color: '#000',
                        fontWeight: 'bold',
                        fontSize: 14,
                        marginLeft: 5,
                        textAlign: 'left',
                      }}>
                      Description
                    </Text>
                    <TextInput
                      style={[
                        styles.productinput,
                        {height: 100, textAlignVertical: 'top'},
                      ]}
                      multiline
                      numberOfLines={4}
                      value={cashAddFrom.desc}
                      onChangeText={t => cashOnChange('desc', t)}
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Footer Button */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={addCashPayment}>
                  <Text style={styles.submitButtonText}>Add Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

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
    width: '90%',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginTop: 5,
    justifyContent: 'center',
    height: 40,
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 'auto',
    width: 314,
    borderRadius: 5,
  },
  tablehead: {
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 5,
    borderTopLeftRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  value: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },

  //Modal Styles
  keyboardAvoidContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    marginTop: 50,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalBodyScroll: {
    flex: 1,
  },
  modalBodyContent: {
    flexGrow: 1,
    paddingBottom: 80, // Space for fixed footer
  },
  modalBody: {
    padding: 15,
  },
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#144272',
  },
  closeButton: {
    padding: 5,
  },
  submitButton: {
    backgroundColor: '#144272',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  productinput: {
    borderWidth: 1,
    width: '100%',
    borderColor: '#000',
    color: '#000',
    borderRadius: 6,
    padding: 8,
    marginTop: 5,
    height: 40,
  },
});
