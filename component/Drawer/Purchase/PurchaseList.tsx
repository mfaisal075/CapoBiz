import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Modal} from 'react-native';

interface PurchaseList {
  prch_invoice_no: string;
  prch_date: string;
  prch_order_total: string;
  prch_paid_amount: string;
  prch_balance: string;
}

export default function PurchaseList() {
  const {openDrawer} = useDrawer();
  const navigation = useNavigation();
  const [purchaseList, setPurchaseList] = useState<PurchaseList[]>([]);
  const [modalVisible, setModalVisible] = useState('');

  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  // Fetch Purchase Invoices
  const fetchInvoices = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/getpurchaseinvoices`, {
        from,
        to,
      });

      setPurchaseList(res.data.inv_data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [startDate, endDate]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Topbar */}
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
              style={{width: 30, height: 30, tintColor: 'white'}}
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text
              style={{
                color: 'white',
                fontSize: 22,
                fontWeight: 'bold',
              }}>
              Purchase Invoices List
            </Text>
          </View>
        </View>

        <View
          style={{
            marginBottom: 10,
          }}>
          <View style={styles.dateContainer}>
            <View style={styles.dateInput}>
              <Text style={styles.label}>From</Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 5,
                  borderColor: 'white',
                }}>
                <Text style={{marginLeft: 10, color: 'white'}}>
                  {`${startDate.toLocaleDateString()}`}
                </Text>
                <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                  <Image
                    style={{
                      height: 20,
                      width: 20,
                      resizeMode: 'stretch',
                      alignItems: 'center',
                      marginLeft: 35,
                      tintColor: 'white',
                    }}
                    source={require('../../../assets/calendar.png')}
                  />
                  {showStartDatePicker && (
                    <DateTimePicker
                      testID="startDatePicker"
                      value={startDate}
                      mode="date"
                      is24Hour={true}
                      display="default"
                      onChange={onStartDateChange}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dateInput}>
              <Text style={styles.label}>To</Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 5,
                  borderColor: 'white',
                }}>
                <Text
                  style={{
                    marginLeft: 10,
                    color: 'white',
                  }}>
                  {`${endDate.toLocaleDateString()}`}
                </Text>
                <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                  <Image
                    style={{
                      height: 20,
                      width: 20,
                      resizeMode: 'stretch',
                      alignItems: 'center',
                      marginLeft: 35,
                      tintColor: 'white',
                    }}
                    source={require('../../../assets/calendar.png')}
                  />
                  {showEndDatePicker && (
                    <DateTimePicker
                      testID="endDatePicker"
                      value={endDate}
                      mode="date"
                      is24Hour={true}
                      display="default"
                      onChange={onEndDateChange}
                      textColor="white"
                      accentColor="white"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <FlatList
            data={purchaseList}
            keyExtractor={(item, index) => `${item.prch_invoice_no}_${index}`}
            renderItem={({item}) => (
              <View style={{padding: 5}}>
                <View style={styles.table}>
                  <View style={styles.tablehead}>
                    <Text
                      style={{
                        color: '#144272',
                        fontWeight: 'bold',
                        marginLeft: 5,
                        marginTop: 5,
                      }}>
                      {item.prch_invoice_no}
                    </Text>
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 5,
                        marginRight: 10,
                      }}
                      onPress={() => {
                        setModalVisible('View');
                      }}>
                      <Icon name="receipt" size={18} color="#144272" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.rowt}>
                      <Text style={styles.text}>Date:</Text>
                      <Text style={styles.text}>
                        {' '}
                        {new Date(item.prch_date)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')}
                      </Text>
                    </View>
                    <View style={styles.rowt}>
                      <Text style={styles.text}>Order Total:</Text>
                      <Text style={styles.text}>{item.prch_order_total}</Text>
                    </View>
                    <View style={styles.rowt}>
                      <Text style={styles.text}>Paid Amount:</Text>
                      <Text style={styles.text}>{item.prch_paid_amount}</Text>
                    </View>
                    <View style={styles.rowt}>
                      <Text style={styles.text}>Balance:</Text>
                      <Text style={styles.text}>{item.prch_balance}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text
                style={{
                  flex: 1,
                  color: 'white',
                  textAlign: 'center',
                  justifyContent: 'center',
                }}>
                No record present in the database for this Date range!
              </Text>
            }
          />
        </View>
      </ImageBackground>

      {/* View Modal */}
      <Modal
        visible={modalVisible === 'View'}
        animationType="slide"
        transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Purchase Invoice</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                }}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="red" />
              </TouchableOpacity>
            </View>

            <View style={styles.details}>
              <Text style={[styles.modalHeaderText, {fontSize: 20}]}>
                Super Itefaq
              </Text>
              <Text style={styles.modalHeaderText}>
                Mumtaz Market, Gujramwala
              </Text>
              <Text style={styles.modalHeaderText}>0333-1117777</Text>
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            <View style={styles.othDetails}>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                Company: XYZ Company
              </Text>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                Supplier: Javeria Sadique
              </Text>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                Transporter: --
              </Text>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                Invoice#: PU-1
              </Text>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                PO Ref#: PO-1
              </Text>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                Date: 2025-06-17
              </Text>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                Builty#: --
              </Text>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                Vehicle#: --
              </Text>
            </View>
          </View>
        </View>
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
  label: {
    position: 'absolute',
    top: -10,
    left: 14,
    fontSize: 10,
    color: 'white',
    backgroundColor: '#144272',
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    width: '46%',
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderRadius: 5,
    borderColor: 'white',
    height: 38,
  },

  // FlateList Item
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 'auto',
    width: 314,
    borderRadius: 5,
  },
  tablehead: {
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 5,
    borderTopLeftRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },
  rowt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomColor: '#144272',
    borderBottomWidth: 0.8,
  },
  modalHeaderText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  details: {
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#144272',
    marginTop: 10,
    marginBottom: 10,
  },
  othDetails: {
    width: '100%',
    paddingHorizontal: 10,
  },
});
