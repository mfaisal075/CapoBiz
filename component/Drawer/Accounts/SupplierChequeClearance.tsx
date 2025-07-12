import {
  ImageBackground,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Image} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';

interface Suppliers {
  id: number;
  sup_name: string;
  sup_company_name: string;
}

interface ChequeData {
  sup_name: string;
  chi_sup_id: 1;
  id: 2;
  chi_number: string;
  chi_amount: string;
  chi_status: string;
  chi_payment_method: string;
  chi_date: string;
}

const SupplierChequeClearance = () => {
  const {openDrawer} = useDrawer();
  const [suppDropdown, setSuppDropdown] = useState<Suppliers[]>([]);
  const transformedSupp = suppDropdown.map(supp => ({
    label: `${supp.sup_name}_${supp.sup_company_name}`,
    value: supp.id.toString(),
  }));
  const [Open, setOpen] = useState(false);
  const [suppValue, setSuppValue] = useState<string | ''>('');
  const [chequeData, setChequeData] = useState<ChequeData[]>([]);
  const [loadchequeData, setLoadChequeData] = useState<ChequeData | null>(null);
  const [clearanceDate, setClearanceDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState<string>('');
  const [modalVisible, setModalVisible] = useState('');

  // Fetch Supplier dropdown
  const fetchSuppDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadsuppliers`);
      setSuppDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Cheque Info
  const fetchChequeInfo = async () => {
    if (suppValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchsuppchequeinfo`, {
          supp_id: suppValue,
        });
        setChequeData(res.data.chque_info);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Cheque Clearance
  const clearCheque = async () => {
    if (!loadchequeData || !clearanceDate) {
      console.log('No cheque data or clearance date selected');
      return;
    }
    if (!note.trim()) {
      console.log('Note cannot be empty');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/clearsuppcheque`, {
        info_id: loadchequeData.id,
        supp_id: suppValue,
        amount: loadchequeData.chi_amount,
        supp_clear_date: clearanceDate.toISOString().split('T')[0],
        clear_note: note,
        pay_type: loadchequeData.chi_payment_method,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Cheque Cleared',
          text2: 'Cheque has been cleared successfully.',
          visibilityTime: 3000,
        });
        console.log('Cheque cleared successfully');
        setModalVisible('');
        setLoadChequeData(null);
        setClearanceDate(null);
        setNote('');
        fetchChequeInfo();
      } else {
        console.log('Failed to clear cheque:', data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSuppDropdown();
    fetchChequeInfo();
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
              Cheque Clearance
            </Text>
          </View>
        </View>

        <ScrollView
          style={{
            flex: 1,
          }}>
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

          <View style={{paddingBottom: 30}}>
            <View style={{marginTop: 20}}>
              {chequeData.length === 0 ? (
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
                chequeData.map((item, index) => (
                  <View key={item.id} style={{padding: 5}}>
                    <View style={styles.table}>
                      <View style={styles.tablehead}>
                        <Text
                          style={{
                            color: '#144272',
                            fontWeight: 'bold',
                            marginLeft: 5,
                          }}>
                          {item.sup_name}
                        </Text>
                        <TouchableOpacity
                          style={{paddingHorizontal: 10, paddingVertical: 2}}
                          onPress={() => {
                            setLoadChequeData(item);
                            setClearanceDate(new Date(item.chi_date));
                          }}>
                          <Icon
                            name="clipboard-text"
                            size={25}
                            color={'#144272'}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.infoRow}>
                        {[
                          {
                            label: 'Date:',
                            value: new Date(item.chi_date)
                              .toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                              .replace(/\//g, '-'),
                          },
                          {
                            label: 'Cheque Number:',
                            value: item.chi_number,
                          },
                          {
                            label: 'Amount:',
                            value: item.chi_amount,
                          },
                          {
                            label: 'Status:',
                            value: item.chi_status,
                          },
                          {
                            label: 'Payment Method:',
                            value: item.chi_payment_method,
                          },
                        ].map(
                          (
                            field: {
                              label: string;
                              value: number | string;
                            },
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

          <View style={styles.row}>
            <Text
              style={[
                styles.productinput,
                {backgroundColor: 'gray', color: '#F0F0EC'},
              ]}>
              {loadchequeData?.chi_number
                ? loadchequeData.chi_number
                : 'Cheque Number'}
            </Text>
            <Text
              style={[
                styles.productinput,
                {backgroundColor: 'gray', color: '#F0F0EC'},
              ]}>
              {loadchequeData?.chi_amount
                ? loadchequeData?.chi_amount
                : 'Cheque Amount'}
            </Text>
          </View>

          {/* Date Fields Section */}
          <View style={styles.row}>
            <View style={{width: '100%'}}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateInput}>
                <Text style={{color: 'white'}}>
                  {loadchequeData?.chi_date
                    ? new Date(loadchequeData.chi_date).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={clearanceDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setClearanceDate(selectedDate);
                }
              }}
              themeVariant="dark"
              style={{backgroundColor: '#144272'}}
            />
          )}

          <View style={styles.row}>
            <TextInput
              style={[
                styles.productinput,
                {height: 75, textAlignVertical: 'top', width: '100%'},
              ]}
              value={note}
              placeholder="Note"
              placeholderTextColor={'#f0f0ec'}
              onChangeText={t => setNote(t)}
              numberOfLines={3}
              multiline
            />
          </View>

          <View style={styles.row}>
            <Text
              style={[
                styles.productinput,
                {backgroundColor: 'gray', color: '#F0F0EC', width: '100%'},
              ]}>
              {loadchequeData?.chi_payment_method
                ? loadchequeData?.chi_payment_method
                : 'Payment Method'}
            </Text>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => {
                setModalVisible('confirmation');
              }}>
              <Text style={styles.submitBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Confirmation Modal */}
        <Modal
          visible={modalVisible === 'confirmation'}
          onDismiss={() => setModalVisible('')}
          transparent
          animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <View
              style={{
                backgroundColor: 'white',
                padding: 25,
                borderRadius: 10,
                width: '80%',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderColor: '#d0e2f2',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 15,
                }}>
                <Icon name="information-outline" size={60} color="#d0e2f2" />
              </View>

              <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 8}}>
                Are you sure?
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#555',
                  marginBottom: 20,
                  textAlign: 'center',
                }}>
                Do you really want to clear this cheque!
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                <TouchableOpacity
                  onPress={() => setModalVisible('')}
                  style={{
                    flex: 1,
                    backgroundColor: '#ff6b6b',
                    padding: 10,
                    borderRadius: 5,
                    marginRight: 10,
                    alignItems: 'center',
                  }}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    clearCheque();
                    setModalVisible('');
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#28a745',
                    padding: 10,
                    borderRadius: 5,
                    marginLeft: 10,
                    alignItems: 'center',
                  }}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SupplierChequeClearance;

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
  row: {
    width: '100%',
    marginTop: 10,
    paddingHorizontal: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    alignItems: 'center',
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
    marginBottom: 10,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#144272',
    textAlign: 'center',
  },
});
