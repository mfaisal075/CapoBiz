import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Modal,
  View,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ImageBackground} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';

interface Employee {
  id: number;
  emp_name: string;
  emp_address: string;
  emp_contact: string;
  emp_cnic: string;
}

interface EmployeeDetails {
  emp_name: string;
  empac_balance: string;
  empac_date: string;
  empac_earning: string;
  empac_emp_id: number;
  empac_invoice_no: string;
  empac_withdraw_amount: string;
}

interface EmployeeAddForm {
  amount: string;
  note: string;
  date: Date;
  addedBy: string;
}

const initialEmployeeAddFrom: EmployeeAddForm = {
  amount: '',
  date: new Date(),
  note: '',
  addedBy: '',
};

export default function EmployeeAccount() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [Open, setOpen] = useState(false);
  const [modalDropdowOpen, setModalDropdowOpen] = useState(false);
  const [customerVal, setCustomerVal] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState('');
  const [employeeDropdown, setEmployeeDropdown] = useState<Employee[]>([]);
  const transformedEmp = employeeDropdown.map(emp => ({
    label: emp.emp_name,
    value: emp.id.toString(),
  }));
  const [empValue, setEmpValaue] = useState('');
  const [empData, setEmpData] = useState<EmployeeDetails[]>([]);
  const [cashAddFrom, setCashAddForm] = useState<EmployeeAddForm>(
    initialEmployeeAddFrom,
  );

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

  const modalDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(null);
      return;
    }

    if (selectedDate) {
      cashOnChange('date', selectedDate);
    }
    setShowDatePicker(null);
  };

  const cashOnChange = (field: keyof EmployeeAddForm, value: string | Date) => {
    setCashAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  // Fetch Employee dropdown
  const fetchEmpDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchemployeedropdown`);
      setEmployeeDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Employye Details
  const fetchEmployeeDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.get(
        `${BASE_URL}/fetchemppayment?from=${from}&to=${to}&employee=${empValue}_token=${token}`,
      );
      setEmpData(res.data.emp);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Payment
  const addPayment = async () => {
    if (!customerVal) {
      Toast.show({
        type: 'error',
        text1: 'Please Select Employee First!',
        visibilityTime: 1500,
      });
      return;
    }

    if (
      !cashAddFrom.addedBy ||
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
      const res = await axios.post(`${BASE_URL}/addpayment`, {
        emp_id: customerVal,
        emp_earning: cashAddFrom.amount,
        emp_acc_date: cashAddFrom.date.toISOString().split('T')[0],
        addedby: cashAddFrom.addedBy.trim(),
        note: cashAddFrom.note.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Payment has been added successfully!',
          visibilityTime: 1500,
        });
        setCustomerVal('');
        setCashAddForm(initialEmployeeAddFrom);
        setModalVisible('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Withdraw Payment
  const withdrawPayment = async () => {
    if (!customerVal) {
      Toast.show({
        type: 'error',
        text1: 'Please Select Employee First!',
        visibilityTime: 1500,
      });
      return;
    }

    if (
      !cashAddFrom.addedBy ||
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
      const res = await axios.post(`${BASE_URL}/addpayment`, {
        emp_id: customerVal,
        emp_withdraw_amount: cashAddFrom.amount,
        emp_acc_date: cashAddFrom.date.toISOString().split('T')[0],
        addedby: cashAddFrom.addedBy.trim(),
        note: cashAddFrom.note.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Payment has been Withdraw successfully!',
          visibilityTime: 1500,
        });
        setCustomerVal('');
        setCashAddForm(initialEmployeeAddFrom);
        setModalVisible('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Earnings, withdraws, and balance
  const calculateTotals = () => {
    let totalEarning = 0;
    let totalWithdraw = 0;

    empData.forEach(emp => {
      const earnings = parseFloat(emp.empac_earning) || 0;
      const withdraws = parseFloat(emp.empac_withdraw_amount) || 0;

      totalEarning += earnings;
      totalWithdraw += withdraws;
    });

    return {
      totalEarning: totalEarning.toFixed(2),
      totalWithdraw: totalWithdraw.toFixed(2),
      netBalance: (totalEarning - totalWithdraw).toFixed(2),
    };
  };

  useEffect(() => {
    fetchEmpDropdown();
    fetchEmployeeDetails();
  }, [empValue, fromDate, toDate]);

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
              Employee Account
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
              onPress={() => setModalVisible('Payment')}>
              <Text style={[styles.toggleBtnText, {color: 'white'}]}>
                Add Payment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                {borderRadius: 10, backgroundColor: '#144272'},
              ]}
              onPress={() => setModalVisible('WithDraw')}>
              <Text style={[styles.toggleBtnText, {color: 'white'}]}>
                WithDraw Payment
              </Text>
            </TouchableOpacity>
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
              Employee:
            </Text>
            <DropDownPicker
              items={transformedEmp}
              open={Open}
              value={empValue}
              setValue={setEmpValaue}
              setOpen={setOpen}
              placeholder="Select Employee"
              placeholderStyle={{color: 'white'}}
              textStyle={{color: 'white'}}
              style={styles.dropdown}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: '90%',
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

          {/* Invoices Cards */}
          <View style={{paddingBottom: 30}}>
            <View style={{marginTop: 20}}>
              {empData.length === 0 ? (
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
                empData.map((item, index) => (
                  <View key={index} style={{padding: 5}}>
                    <View style={styles.table}>
                      <View style={styles.tablehead}>
                        <Text
                          style={{
                            color: '#144272',
                            fontWeight: 'bold',
                            marginLeft: 5,
                            marginTop: 5,
                          }}>
                          {item.empac_invoice_no}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        {[
                          {
                            label: 'Total Earning:',
                            value: item.empac_earning,
                          },
                          {
                            label: 'Total WithDraw:',
                            value: item.empac_withdraw_amount,
                          },
                          {label: 'Balance:', value: item.empac_balance},
                          {
                            label: 'Date:',
                            value: new Date(item.empac_date)
                              .toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                              .replace(/\//g, '-'),
                          },
                        ].map(
                          (
                            field: {label: string; value: number | string},
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

          {/* Last Component */}
          <View
            style={{
              width: '100%',
              paddingVertical: 20,
              paddingHorizontal: 10,
            }}>
            {(() => {
              const {netBalance, totalEarning, totalWithdraw} =
                calculateTotals();

              return (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginVertical: 5,
                      paddingHorizontal: '10%',
                    }}>
                    <Text style={[styles.text, {fontWeight: 'bold'}]}>
                      Total Earnings:
                    </Text>
                    <Text style={[styles.text, {fontWeight: 'bold'}]}>
                      {totalEarning}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginVertical: 5,
                      paddingHorizontal: '10%',
                    }}>
                    <Text style={[styles.text, {fontWeight: 'bold'}]}>
                      Total Withdraw:
                    </Text>
                    <Text style={[styles.text, {fontWeight: 'bold'}]}>
                      {totalWithdraw}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginVertical: 5,
                      paddingHorizontal: '10%',
                    }}>
                    <Text style={[styles.text, {fontWeight: 'bold'}]}>
                      Net Balance:
                    </Text>
                    <Text style={[styles.text, {fontWeight: 'bold'}]}>
                      {netBalance}
                    </Text>
                  </View>
                </>
              );
            })()}
          </View>
        </ScrollView>
      </ImageBackground>

      {/* Add & WithDraw Payment Modal */}
      <Modal
        visible={modalVisible === 'Payment' || modalVisible === 'WithDraw'}
        transparent
        animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidContainer}>
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {modalVisible === 'WithDraw'
                    ? 'WithDraw Payment'
                    : 'Add Payment'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setCustomerVal('');
                    setCashAddForm(initialEmployeeAddFrom);
                  }}
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
                      Employee:
                    </Text>
                    <DropDownPicker
                      items={transformedEmp}
                      open={modalDropdowOpen}
                      value={customerVal}
                      setValue={setCustomerVal}
                      setOpen={setModalDropdowOpen}
                      placeholder="Select Customer"
                      placeholderStyle={{color: '#000'}}
                      textStyle={{color: '#144272'}}
                      style={[styles.dropdown, {borderColor: '#000'}]}
                      dropDownContainerStyle={{
                        backgroundColor: 'white',
                        borderColor: '#144272',
                        width: '90%',
                        marginTop: 8,
                      }}
                      labelStyle={{color: '#000', fontWeight: 'bold'}}
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
                        onPress={() => setShowDatePicker('from')}
                        style={[styles.dateInput, {borderColor: '#000'}]}>
                        <Text style={{color: '#000'}}>
                          {cashAddFrom.date
                            ? cashAddFrom.date.toLocaleDateString()
                            : ''}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {showDatePicker && (
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
                      Added By <Text style={{color: 'red'}}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.productinput}
                      value={cashAddFrom.addedBy}
                      onChangeText={t => cashOnChange('addedBy', t)}
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
                      Note
                    </Text>
                    <TextInput
                      style={[
                        styles.productinput,
                        {height: 100, textAlignVertical: 'top'},
                      ]}
                      multiline
                      numberOfLines={4}
                      value={cashAddFrom.note}
                      onChangeText={t => cashOnChange('note', t)}
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Footer Button */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => {
                    modalVisible === 'Payment' && addPayment();
                    modalVisible === 'WithDraw' && withdrawPayment();
                  }}>
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

  //Single Screen Styles
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
    height: 40, // Match other input heights
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
  btnContainer: {
    width: '100%',
    paddingHorizontal: '10%',
    paddingVertical: 10,
    justifyContent: 'center',
    height: 55,
  },
  btnItem: {
    height: '100%',
    width: '30%',
    backgroundColor: '#144272',
    alignSelf: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
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
