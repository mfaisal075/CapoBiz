import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
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

interface InvoiceData {
  config: {
    bus_name: string;
    bus_address: string;
    bus_contact1: string;
  };
  purchasedata: {
    prch_invoice_no: string;
    prch_po_number: string;
    prch_date: string;
    prch_builty_no: string;
    prch_vehicle_no: string;
    prch_freight_charges: string;
    prch_total_purchase: string;
    prch_order_total: string;
    prch_trans_id: number;
    prch_sup_id: number;
    prch_balance: string;
    prch_paid_amount: string;
  };
}

interface InvoicePurchaseDetails {
  id: number;
  prchd_prod_name: string;
  prchd_qty: string;
  prchd_cost_price: string;
  prchd_total_cost: string;
  sup_name: string;
  sup_company_name: string;
}

export default function PurchaseList() {
  const {openDrawer} = useDrawer();
  const [purchaseList, setPurchaseList] = useState<PurchaseList[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [invcData, setInvcData] = useState<InvoiceData | null>(null);
  const [invcDetails, setInvcDetails] = useState<InvoicePurchaseDetails[]>([]);

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = purchaseList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = purchaseList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

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

  // Fetch Invoice
  const fetchIncv = async (invc: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/purchase_invoiceprint`, {
        invoice: invc,
      });
      setInvcData(res.data);
      setInvcDetails(res.data.detail);
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
            data={currentData}
            keyExtractor={(item, index) => `${item.prch_invoice_no}_${index}`}
            style={{marginBottom: 100,}}
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
                        fetchIncv(item.prch_invoice_no);
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

      {totalRecords > 0 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            paddingBottom: 15,
            paddingTop: 5,
            backgroundColor: '#144272',
          }}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(prev => prev - 1)}
            style={{
              marginHorizontal: 10,
              opacity: currentPage === 1 ? 0.5 : 1,
            }}>
            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
              Prev
            </Text>
          </TouchableOpacity>

          <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage(prev => prev + 1)}
            style={{
              marginHorizontal: 10,
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}>
            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
                {invcData?.config.bus_name}
              </Text>
              <Text style={styles.modalHeaderText}>
                {invcData?.config.bus_address}
              </Text>
              <Text style={styles.modalHeaderText}>
                {invcData?.config.bus_contact1}
              </Text>
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            <View style={styles.othDetails}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                  Receipt#: {invcData?.purchasedata.prch_invoice_no}
                </Text>
                <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                  Date: {invcData?.purchasedata.prch_date}
                </Text>
              </View>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                PO Ref#: {invcData?.purchasedata.prch_po_number ?? '--'}
              </Text>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                Supplier Name: {invcDetails[0]?.sup_name}
              </Text>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                Company: {invcDetails[0]?.sup_company_name}
              </Text>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                Builty#: {invcData?.purchasedata.prch_builty_no}
              </Text>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                Vehicle#: {invcData?.purchasedata.prch_vehicle_no}
              </Text>
            </View>

            {/* Table Header (only once) */}
            <View
              style={{
                flexDirection: 'row',
                paddingVertical: 6,
                borderBottomWidth: 1,
                paddingHorizontal: 5,
                borderColor: '#eee',
                backgroundColor: '#f5f5f5',
              }}>
              <Text style={{flex: 2, fontWeight: 'bold', color: '#144272'}}>
                Product
              </Text>
              <Text style={{flex: 1.5, fontWeight: 'bold', color: '#144272'}}>
                Cost Price
              </Text>
              <Text style={{flex: 1.5, fontWeight: 'bold', color: '#144272'}}>
                Quantity
              </Text>
              <Text style={{flex: 1, fontWeight: 'bold', color: '#144272'}}>
                Total
              </Text>
            </View>

            <FlatList
              data={invcDetails}
              keyExtractor={(item: any, index: number) => index.toString()}
              renderItem={({item}) => (
                <View
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 6,
                    paddingHorizontal: 5,
                    borderBottomWidth: 1,
                    borderColor: '#eee',
                  }}>
                  <Text style={{flex: 2, color: '#333'}}>
                    {item.prchd_prod_name}
                  </Text>
                  <Text style={{flex: 1.5, color: '#333'}}>
                    {item.prchd_cost_price}
                  </Text>
                  <Text style={{flex: 1.5, color: '#333', textAlign: 'center'}}>
                    {item.prchd_qty}
                  </Text>
                  <Text style={{flex: 1, color: '#333'}}>
                    {item.prchd_total_cost}
                  </Text>
                </View>
              )}
              ListFooterComponent={
                <View
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 6,
                    paddingHorizontal: 5,
                    borderBottomWidth: 1,
                    borderColor: '#eee',
                  }}>
                  <Text style={{flex: 2, color: '#333', fontWeight: 'bold'}}>
                    Total
                  </Text>
                  <Text style={{flex: 3}} />
                  <Text style={{flex: 1, color: '#333'}}>
                    {invcData?.purchasedata.prch_order_total}
                  </Text>
                </View>
              }
            />

            <View style={styles.othDetails}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '80%',
                }}>
                <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                  T.Order: {invcData?.purchasedata.prch_order_total}
                </Text>
                <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                  Freight: {invcData?.purchasedata.prch_freight_charges}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '80%',
                }}>
                <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                  T. Purchase: {invcData?.purchasedata.prch_total_purchase}
                </Text>
                <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                  T. Paid: {invcData?.purchasedata.prch_paid_amount}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '80%',
                }}>
                <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                  Balance: {invcData?.purchasedata.prch_balance}
                </Text>
              </View>
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
    width: '90%',
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
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    height: '70%',
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
    marginVertical: 5,
  },
});
