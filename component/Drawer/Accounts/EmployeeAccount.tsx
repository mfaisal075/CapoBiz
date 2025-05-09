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
import React, {useState} from 'react';
import {ImageBackground} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';

export default function EmployeeAccount() {
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
      label: 'Haroon',
      value: 'Haroon',
    },
    {label: 'Fakhar', value: 'Fakhar'},
    {label: 'Naeem', value: 'Naeem'},
    {label: 'Asghar', value: 'Asghar'},
  ];

  const Info = [
    {
      'Sr#': 1,
      'Invoice #': 'EP-1',
      'Total Earnings': 5000.0,
      'Total WithDraw': 2000.0,
      Balance: 3000.0,
      'Prev Balance': 0.0,
      Total: 3000.0,
      Date: '09-May-2025',
    },
    {
      'Sr#': 2,
      'Invoice #': 'EP-2',
      'Total Earnings': 7000.0,
      'Total WithDraw': 4500.0,
      Balance: 2500.0,
      'Prev Balance': 3000.0,
      Total: 5500.0,
      Date: '10-May-2025',
    },
    {
      'Sr#': 3,
      'Invoice #': 'EP-3',
      'Total Earnings': 3000.0,
      'Total WithDraw': 6000.0,
      Balance: -3000.0,
      'Prev Balance': 5500.0,
      Total: 2500.0,
      Date: '11-May-2025',
    },
    {
      'Sr#': 4,
      'Invoice #': 'EP-4',
      'Total Earnings': 10000.0,
      'Total WithDraw': 3000.0,
      Balance: 7000.0,
      'Prev Balance': 2500.0,
      Total: 9500.0,
      Date: '12-May-2025',
    },
    {
      'Sr#': 5,
      'Invoice #': 'EP-5',
      'Total Earnings': 2000.0,
      'Total WithDraw': 8000.0,
      Balance: -6000.0,
      'Prev Balance': 9500.0,
      Total: 3500.0,
      Date: '13-May-2025',
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

          {/* Invoices Cards */}
          <View style={{paddingBottom: 30}}>
            <View style={{marginTop: 20}}>
              {Info.map((item, index) => (
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
                        {item['Invoice #']}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      {[
                        {
                          label: 'Total Earning:',
                          value: item['Total Earnings'],
                        },
                        {
                          label: 'Total WithDraw:',
                          value: item['Total WithDraw'],
                        },
                        {label: 'Balance:', value: item.Balance},
                        {
                          label: 'Prev Balance:',
                          value: item['Prev Balance'],
                        },
                        {label: 'Total:', value: item.Total},
                        {label: 'Date:', value: item.Date},
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

          {/* Last Component */}
          <View
            style={{
              width: '100%',
              paddingVertical: 20,
              paddingHorizontal: 10,
            }}>
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
              <Text style={[styles.text, {fontWeight: 'bold'}]}>47203.00</Text>
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
              <Text style={[styles.text, {fontWeight: 'bold'}]}>47203.00</Text>
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
              <Text style={[styles.text, {fontWeight: 'bold'}]}>0.00</Text>
            </View>

            <View style={styles.btnContainer}>
              <TouchableOpacity style={styles.btnItem}>
                <Text style={styles.btnText}>View Details</Text>
              </TouchableOpacity>
            </View>
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
                      Added By <Text style={{color: 'red'}}>*</Text>
                    </Text>
                    <TextInput style={styles.productinput} />
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

  //Single Screen Styles
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
