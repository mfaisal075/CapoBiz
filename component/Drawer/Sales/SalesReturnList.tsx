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
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Returns {
  salr_return_invoice_no: string;
  salr_return_amount: string;
  created_at: string;
}

interface InvoiceDetails {
  prod_name: string;
  salrd_prod_name: string;
  salr_cust_id: string;
  created_at: string;
  cust_name: string;
  cust_contact: string;
  cust_fathername: string;
  cust_address: string;
  salrd_return_qty: string;
  salrd_price: string;
  salrd_total_price: string;
}

export default function SalesReturnList() {
  const {openDrawer} = useDrawer();
  const [saleReturns, setSaleReturns] = useState<Returns[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState('');
  const [invcDetails, setInvcDetails] = useState<InvoiceDetails[]>([]);

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

  // Fetch Sale Returns List
  const fetchSaleReturnList = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/getsalereturnlist`, {
        from,
        to,
      });

      setSaleReturns(res.data.inv_data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get single Sale Return
  const getOrderInvoice = async (inv: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/salereturndetail`, {
        invoice: inv,
      });
      setInvcDetails(res.data.return_detail);
      console.log(invcDetails);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSaleReturnList();
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
              Return List
            </Text>
          </View>
        </View>

        <ScrollView
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

          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.exportBtn}>
              <Text style={styles.exportText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn}>
              <Text style={styles.exportText}>Export CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn}>
              <Text style={styles.exportText}>Export Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn}>
              <Text style={styles.exportText}>Print</Text>
            </TouchableOpacity>
          </View>

          <View>
            <FlatList
              data={saleReturns}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              renderItem={({item}) => (
                <ScrollView
                  style={{
                    padding: 5,
                  }}>
                  <View style={styles.table}>
                    <View style={styles.tablehead}>
                      <Text
                        style={{
                          color: '#144272',
                          fontWeight: 'bold',
                          marginLeft: 5,
                          marginTop: 5,
                        }}>
                        {item.salr_return_invoice_no}
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}>
                        <TouchableOpacity
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 5,
                            marginRight: 10,
                          }}
                          onPress={() => {
                            setModalVisible('View');
                            getOrderInvoice(item.salr_return_invoice_no);
                          }}>
                          <Icon name="receipt" size={18} color="#144272" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Date:</Text>
                        <Text style={styles.text}>
                          {new Date(item.created_at)
                            .toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                            .replace(/ /g, '-')}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          Return Amount:
                        </Text>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          {item.salr_return_amount}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
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
        </ScrollView>

        {/* View Modal */}
        <Modal
          visible={modalVisible === 'View'}
          transparent
          animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text style={styles.title}>Return Receipt</Text>
              <Text style={styles.subtitle}>Sale Return Detail</Text>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Invoice No: </Text>
                <Text style={styles.modalValue}>{'In'}</Text>
                <Text style={[styles.modalLabel, {marginLeft: 20}]}>
                  Date:{' '}
                </Text>
                <Text style={styles.modalValue}>
                  {new Date(invcDetails[0]?.created_at)
                    .toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                    .replace(/ /g, '-')}
                </Text>
              </View>

              <View style={{marginTop: 10}}>
                <Text style={styles.info}>
                  Customer: {invcDetails[0]?.cust_name}
                </Text>
                <Text style={styles.info}>
                  Father Name: {invcDetails[0]?.cust_fathername}
                </Text>
                <Text style={styles.info}>
                  Contact: {invcDetails[0]?.cust_contact}
                </Text>
                <Text style={styles.info}>
                  Address: {invcDetails[0]?.cust_address}
                </Text>
              </View>

              <View style={styles.tableHeader}>
                <Text style={[styles.cell, {flex: 0.5}]}>Sr#</Text>
                <Text style={[styles.cell, {flex: 2}]}>Product Name</Text>
                <Text style={styles.cell}>Return Qty</Text>
                <Text style={styles.cell}>Price</Text>
                <Text style={styles.cell}>Total Price</Text>
              </View>

              <FlatList
                data={invcDetails}
                keyExtractor={(item, index) => index.toString()}
                style={{maxHeight: 200}}
                renderItem={({item, index}) => (
                  <View style={styles.tableRow}>
                    <Text style={[styles.cell, {flex: 0.5}]}>{index + 1}</Text>
                    <Text style={[styles.cell, {flex: 2}]}>
                      {item.prod_name}
                    </Text>
                    <Text style={styles.cell}>{item?.salrd_return_qty}</Text>
                    <Text style={styles.cell}>
                      {Number(item?.salrd_price).toFixed(2)}
                    </Text>
                    <Text style={styles.cell}>{item?.salrd_total_price}</Text>
                  </View>
                )}
              />

              <View style={styles.tableRow}>
                <Text style={[styles.cell, {flex: 2, fontWeight: 'bold'}]}>
                  Total Qty
                </Text>
                <Text style={[styles.cell]}></Text>
                <Text style={[styles.cell, {fontWeight: 'bold'}]}>
                  {invcDetails[0]?.salrd_return_qty}
                </Text>
                <Text style={[styles.cell]}></Text>
                <Text style={[styles.cell, {fontWeight: 'bold'}]}>
                  {Number(invcDetails[0]?.salrd_total_price).toFixed(2)}
                </Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Return Total:</Text>
                <Text style={styles.totalValue}>
                  {Number(invcDetails[0]?.salrd_total_price).toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                }}
                style={styles.closeButton}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
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
  lastrow: {
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderBottomEndRadius: 10,
    borderBottomLeftRadius: 10,
  },
  card: {
    borderColor: '#144272',
    backgroundColor: 'white',
    height: 'auto',
    borderRadius: 12,
    elevation: 15,
    marginBottom: 5,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  exportBtn: {
    backgroundColor: '#144272',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  exportText: {
    color: 'white',
    fontWeight: 'bold',
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

  // Modal Styling
  overlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#144272',
    marginVertical: 5,
    textDecorationLine: 'underline',
  },
  modalRow: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  modalLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  modalValue: {
    color: '#144272',
  },
  info: {
    marginTop: 2,
    color: '#333',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginTop: 10,
    paddingBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#444',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    paddingTop: 5,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  closeButton: {
    backgroundColor: '#665df5',
    padding: 8,
    borderRadius: 5,
    marginTop: 15,
    alignItems: 'center',
  },
});
