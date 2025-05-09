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
import React, {useState} from 'react';
import {ImageBackground} from 'react-native';
import {Image} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import {ScrollView} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function FixedAccounts() {
  const {openDrawer} = useDrawer();
  const [Open, setOpen] = useState(false);
  const [customerVal, setCustomerVal] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState('');

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

  const item = [
    {
      label: 'Purchase Account',
      value: 'Purchase',
    },
    {label: 'Freight Account', value: 'Freight'},
    {label: 'Sales Account', value: 'Sales Account'},
    {label: 'Counter Sale', value: 'Counter Sale'},
  ];

  const AccountsInfo = [
    {
      'Sr#': 1,
      Date: '01-May-2025',
      'Invoice#': 'INV-001',
      Account: 'Office Supplies',
      Debit: 5000.0,
      Credit: 0.0,
      Balance: '+5000.00',
      'Pre Balance': 0.0,
      'Net Balance': 5000.0,
    },
    {
      'Sr#': 2,
      Date: '02-May-2025',
      'Invoice#': 'INV-002',
      Account: 'Client Payment',
      Debit: 0.0,
      Credit: 2000.0,
      Balance: '-2000.00',
      'Pre Balance': 5000.0,
      'Net Balance': 3000.0,
    },
    {
      'Sr#': 3,
      Date: '03-May-2025',
      'Invoice#': 'INV-003',
      Account: 'Equipment Purchase',
      Debit: 7000.0,
      Credit: 0.0,
      Balance: '+7000.00',
      'Pre Balance': 3000.0,
      'Net Balance': 10000.0,
    },
    {
      'Sr#': 4,
      Date: '04-May-2025',
      'Invoice#': 'INV-004',
      Account: 'Utility Bills',
      Debit: 0.0,
      Credit: 4500.0,
      Balance: '-4500.00',
      'Pre Balance': 10000.0,
      'Net Balance': 5500.0,
    },
    {
      'Sr#': 5,
      Date: '05-May-2025',
      'Invoice#': 'INV-005',
      Account: 'Consulting Fees',
      Debit: 3000.0,
      Credit: 0.0,
      Balance: '+3000.00',
      'Pre Balance': 5500.0,
      'Net Balance': 8500.0,
    },
  ];

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
              items={item}
              open={Open}
              value={customerVal}
              setValue={setCustomerVal}
              setOpen={setOpen}
              placeholder="Select Customer"
              placeholderStyle={{color: 'white'}}
              textStyle={{color: 'white'}}
              style={styles.dropdown}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: 287,
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
              {AccountsInfo.map((item, index) => (
                <View key={item['Sr#']} style={{padding: 5}}>
                  <View style={styles.table}>
                    <View style={styles.tablehead}>
                      <Text
                        style={{
                          color: '#144272',
                          fontWeight: 'bold',
                          marginLeft: 5,
                          marginTop: 5,
                        }}>
                        {item['Invoice#']}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      {[
                        {label: 'Date:', value: item.Date},
                        {label: 'Account:', value: item.Account},
                        {label: 'Debit:', value: item.Debit},
                        {label: 'Credit:', value: item.Credit},
                        {label: 'Balance:', value: item['Balance']},
                        {label: 'Pre Balance:', value: item['Pre Balance']},
                        {label: 'Net Balance:', value: item['Net Balance']},
                      ].map((field, idx) => (
                        <View
                          key={`${item['Sr#']}-${idx}`}
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
                      ))}
                    </View>
                  </View>
                </View>
              ))}
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
                    <TextInput style={styles.productinput} />
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
                      items={item}
                      open={Open}
                      value={customerVal}
                      setValue={setCustomerVal}
                      setOpen={setOpen}
                      placeholder="Select Customer"
                      placeholderStyle={{color: '#000'}}
                      textStyle={{color: 'white'}}
                      style={[styles.dropdown, {borderColor: '#000'}]}
                      dropDownContainerStyle={{
                        backgroundColor: 'white',
                        borderColor: '#144272',
                        width: 287,
                      }}
                      labelStyle={{color: 'white'}}
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
                          {fromDate ? fromDate.toLocaleDateString() : ''}
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
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Footer Button */}
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.submitButton}>
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
    minHeight: 35,
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
