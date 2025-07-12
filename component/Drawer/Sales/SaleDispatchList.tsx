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
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BASE_URL from '../../BASE_URL';
import axios from 'axios';
import {useUser} from '../../CTX/UserContext';

interface DispatchList {
  id: number;
  disp_date: string;
  disp_order_total: string;
  disp_invoice_no: string;
  slcust_name: string;
}

interface DispatchDataItem {
  dispd_trans_id: string;
  created_at?: string;
  dispd_disp_no: string;
  dispd_freight_exp?: string;
}

interface Transporter {
  id: number | string;
  trans_name: string;
}

interface SaleDetailItem {
  sald_prod_name: string;
  sald_disp_qty: string | number;
  sald_sub_uom: string;
}

interface SingleInvoice {
  sale: {
    id: number;
    disp_date: string;
    disp_invoice_no: string;
    disp_builty_contact: string;
    disp_builty_address: string;
  };
  cust: {
    slcust_name: string;
    slcust_contact: string;
    slcust_address: string;
  };
  dispatchdata?: DispatchDataItem[];
  transporters?: Transporter[];
  sale_detail?: SaleDetailItem[];
}

export default function SaleDispatchList() {
  const {openDrawer} = useDrawer();
  const {token} = useUser();
  const navigation = useNavigation();
  const [dispList, setDispList] = useState<DispatchList[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [invoiceData, setInvoiceData] = useState<SingleInvoice | null>(null);

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

  // Fetch Sale Dispatch List
  const fetchDispatchList = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.get(
        `${BASE_URL}/fetchdispatch?from=${from}&to=${to}&_token=${token}`,
      );

      setDispList(res.data.dispatch);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Item
  const singleRecord = async (inv: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/viewdispatchdetail`, {
        invoice: inv,
      });

      setInvoiceData(res.data);

      // setInvcSaleDetails(res.data.saledetail);
    } catch (error) {
      console.log();
    }
  };

  useEffect(() => {
    fetchDispatchList();
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
              Dispatch List
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

          {/* FlatList */}
          <FlatList
            data={dispList}
            keyExtractor={item => item.id.toString()}
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
                      {item.disp_invoice_no}
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('View');
                        singleRecord(item.disp_invoice_no);
                        // setSelectedInvc(item.sal_invoice_no);
                      }}>
                      <Icon
                        name="receipt"
                        size={20}
                        color="#144272"
                        style={{
                          alignSelf: 'center',
                          marginRight: 5,
                        }}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.rowt}>
                      <Text style={styles.text}>Date:</Text>
                      <Text style={styles.text}>
                        {' '}
                        {new Date(item.disp_date)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')}
                      </Text>
                    </View>
                    <View style={styles.rowt}>
                      <Text style={styles.text}>Customer:</Text>
                      <Text style={styles.text}>{item.slcust_name}</Text>
                    </View>

                    <View style={styles.rowt}>
                      <Text style={styles.text}>Total Amount:</Text>
                      <Text style={styles.text}>{item.disp_order_total}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text
                style={{
                  flex: 1,
                  color: 'white',
                  textAlign: 'center',
                  justifyContent: 'center',
                  marginTop: 20,
                }}>
                No record present in the database for this Date range!
              </Text>
            }
          />
        </ScrollView>

        {/* View Modal */}
        <Modal
          visible={modalVisible === 'View'}
          transparent={true}
          animationType="slide">
          <View style={styles.modalWrapper}>
            <View style={styles.modalContainer}>
              <Text style={styles.title}>Sale Dispatch Invoice :</Text>

              <ScrollView>
                <View style={styles.rowRight}>
                  <Text style={styles.smallText}> Print</Text>
                  <Icon name="print" size={18} color="blue" />
                </View>

                <Text style={styles.invoice}>
                  {invoiceData?.sale.disp_invoice_no}
                </Text>

                <Text style={styles.sectionTitle}>Sale Details</Text>
                <View style={styles.modalRow}>
                  <Text style={styles.modalText}>
                    Customer: {invoiceData?.cust.slcust_name}
                  </Text>
                  <Text style={styles.modalText}>
                    Date:{' '}
                    {invoiceData?.sale.disp_date
                      ? new Date(invoiceData.sale.disp_date)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                          .replace(/\//g, '-')
                      : ''}
                  </Text>
                </View>

                <Text style={styles.modalText}>
                  Contact: {invoiceData?.cust.slcust_contact}
                </Text>
                <Text style={styles.modalText}>
                  Address: {invoiceData?.cust.slcust_address}
                </Text>
                <Text style={styles.modalText}>
                  Builty Contact#: {invoiceData?.sale.disp_builty_contact}
                </Text>
                <Text style={styles.modalText}>
                  Builty Address: {invoiceData?.sale.disp_builty_address}
                </Text>

                <Text style={styles.sectionTitle}>Dispatched Detail</Text>

                {invoiceData?.dispatchdata
                  ?.filter(dispatchItem => !!dispatchItem.dispd_disp_no)
                  .map((dispatchItem, index) => {
                    const transporter = invoiceData.transporters?.find(
                      t => t.id.toString() === dispatchItem.dispd_trans_id,
                    );

                    return (
                      <View key={index}>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.cell, {flex: 2}]}>
                            Date:{' '}
                            {dispatchItem.created_at
                              ? new Date(
                                  dispatchItem.created_at,
                                ).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : ''}
                          </Text>
                          <Text style={styles.cell}>
                            Invoice#: {dispatchItem.dispd_disp_no}
                          </Text>
                          <Text style={styles.cell}>
                            Freight: {dispatchItem.dispd_freight_exp || '0.00'}
                          </Text>
                          <Text style={styles.cell}>
                            Transporter: {transporter?.trans_name || 'N/A'}
                          </Text>
                        </View>

                        {/* Table Headers */}
                        <View style={styles.tableRow}>
                          <Text style={[styles.cell, {flex: 1}]}>Product</Text>
                          <Text style={[styles.cell, {flex: 1}]}>
                            Dispatch Qty
                          </Text>
                        </View>

                        {/* Products (Optional: Filter by disp_invoice_no) */}
                        {invoiceData?.sale_detail?.map((detail, i) => (
                          <View key={i} style={styles.tableRow}>
                            <Text style={[styles.cell, {flex: 1}]}>
                              {detail.sald_prod_name}
                            </Text>
                            <Text style={[styles.cell, {flex: 1}]}>1</Text>
                          </View>
                        ))}
                      </View>
                    );
                  })}

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible('')}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
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
  dateContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    alignItems: 'center',
    marginTop: 20,
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

  // View Modal Styling
  modalWrapper: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '90%',
    elevation: 5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  rowRight: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
  },
  smallText: {
    fontSize: 12,
    color: 'blue',
    fontWeight: 'bold',
  },
  invoice: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  modalText: {
    marginTop: 4,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    marginTop: 10,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderColor: '#ccc',
    fontSize: 13,
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: '#7f5af0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
