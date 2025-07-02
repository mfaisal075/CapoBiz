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
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {useDrawer} from '../../DrawerContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';

interface Orders {
  id: number;
  salord_invoice_no: string;
  salord_date: string;
  salord_partial_status: string;
  order_total: string;
  salord_cust_id: number;
}

interface InvoiceDetails {
  total: string;
  pendingtotal: string;
  customer: {
    cust_name: string;
  };
  usermaker: {
    name: string;
  };
  orderrecord: {
    salord_invoice_no: string;
    salord_date: string;
  };
}

interface InvoiceOrders {
  id: number;
  salordd_invoice_no: string;
  salordd_partial_qty: string;
  prod_name: string;
  salordd_retail_price: string;
  salordd_sub_total: string;
}

export default function SalesOrderList() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [saleOrders, setSaleOrders] = useState<Orders[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [invcDetails, setInvcDetails] = useState<InvoiceDetails | null>(null);
  const [invcOrders, setInvcOrders] = useState<InvoiceOrders[]>([]);

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
  const [issupplier, setissupplier] = useState(false);
  const [currentsupplier, setCurrentsupplier] = useState<string | null>(
    'Sale Order',
  );
  const supplierItem = [
    {label: 'Pending', value: 'Sale Order'},
    {label: 'Complete', value: 'Complete'},
  ];

  // Fetch Sale Order List
  const fetchSaleOrderList = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.get(
        `${BASE_URL}/fetchorderlist?from=${from}&to=${to}&status=${currentsupplier}&_token=${token}`,
      );

      setSaleOrders(res.data.orderlis);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Sale Order Invoice
  const getOrderInvoice = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/orderwiseinvc?id=${id}&_token=${token}`,
      );
      setInvcDetails(res.data);
      setInvcOrders(res.data.orderdetail);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSaleOrderList();
  }, [currentsupplier, startDate, endDate]);

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
              Order List
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

          <View style={styles.dropdownContainer}>
            <DropDownPicker
              items={supplierItem}
              open={issupplier}
              setOpen={setissupplier}
              value={currentsupplier}
              setValue={setCurrentsupplier}
              placeholder="Status"
              placeholderStyle={{color: 'white'}}
              textStyle={{color: 'white'}}
              ArrowUpIconComponent={() => (
                <Icon name="keyboard-arrow-up" size={18} color="#fff" />
              )}
              ArrowDownIconComponent={() => (
                <Icon name="keyboard-arrow-down" size={18} color="#fff" />
              )}
              style={[styles.dropdown]}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: 'white',
                width: '100%',
              }}
              labelStyle={{color: 'white'}}
              listItemLabelStyle={{color: '#144272'}}
              listMode="SCROLLVIEW"
            />
          </View>

          <FlatList
            data={saleOrders}
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
                      {item.salord_invoice_no}
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
                        getOrderInvoice(item.id);
                      }}>
                      <Icon name="receipt" size={18} color="#144272" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.rowt}>
                      <Text style={styles.text}>Date:</Text>
                      <Text style={styles.text}>
                        {' '}
                        {new Date(item.salord_date)
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
                      <Text style={styles.text}>{item.salord_cust_id}</Text>
                    </View>
                    <View style={styles.rowt}>
                      <Text style={styles.text}>Order Amount:</Text>
                      <Text style={styles.text}>{item.order_total}</Text>
                    </View>
                    <View style={styles.rowt}>
                      <Text style={styles.text}>Status:</Text>
                      <Text style={styles.text}>
                        {currentsupplier === 'Sale Order'
                          ? 'Pending'
                          : 'Completed'}
                      </Text>
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
                }}>
                No record present in the database for this Date range!
              </Text>
            }
          />
        </ScrollView>

        {/* View Modal */}
        <Modal
          visible={modalVisible === 'View'}
          animationType="slide"
          transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderText}>
                  Pucrhase Order Invoice Details
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    // setSelectedOrder([]);
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
              </View>

              <View style={styles.othDetails}>
                <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                  Customer: {invcDetails?.customer.cust_name}
                </Text>
                <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                  Maker User: {invcDetails?.usermaker.name}
                </Text>
              </View>

              <View
                style={[
                  styles.othDetails,
                  {flexDirection: 'row-reverse', marginTop: 5},
                ]}>
                <View>
                  <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                    Invoice# {invcDetails?.orderrecord.salord_invoice_no}
                  </Text>
                  <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                    Purchase Order Date: {invcDetails?.orderrecord.salord_date}
                  </Text>
                </View>
              </View>

              {/* Modal Body */}
              <FlatList
                data={invcOrders}
                keyExtractor={(item, index) =>
                  item?.id ? item.id.toString() : index.toString()
                }
                ListHeaderComponent={
                  <View
                    style={[
                      styles.lineItem,
                      {backgroundColor: '#144272', alignItems: 'center'},
                    ]}>
                    <Text
                      style={[
                        styles.headerText,
                        {color: 'white', fontSize: 12},
                      ]}>
                      Invoice#
                    </Text>
                    <Text
                      style={[
                        styles.headerText,
                        {color: 'white', fontSize: 12},
                      ]}>
                      Product
                    </Text>
                    <Text
                      style={[
                        styles.headerText,
                        {color: 'white', fontSize: 12},
                      ]}>
                      QTY
                    </Text>
                    <Text
                      style={[
                        styles.headerText,
                        {color: 'white', fontSize: 12},
                      ]}>
                      Price
                    </Text>
                    <Text
                      style={[
                        styles.headerText,
                        {color: 'white', fontSize: 12},
                      ]}>
                      Sub Total
                    </Text>
                    <Text
                      style={[
                        styles.headerText,
                        {color: 'white', fontSize: 12},
                      ]}>
                      Status
                    </Text>
                  </View>
                }
                renderItem={({item}) => (
                  <View style={styles.lineItem}>
                    <Text style={styles.itemText}>
                      {item.salordd_invoice_no}
                    </Text>
                    <Text style={styles.itemText}>{item.prod_name}</Text>
                    <Text style={styles.itemText}>
                      {item.salordd_partial_qty}
                    </Text>
                    <Text style={styles.itemText}>
                      {Number(item.salordd_retail_price).toLocaleString()}
                    </Text>
                    <Text style={styles.itemText}>
                      {Number(item.salordd_sub_total).toLocaleString()}
                    </Text>
                    <View style={[styles.itemText, {alignItems: 'center'}]}>
                      <View
                        style={{
                          backgroundColor: '#f44336',
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 12,
                          alignSelf: 'center',
                        }}>
                        <Text style={{color: 'white', fontSize: 8}}>
                          Pending Order
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              />

              <View
                style={[styles.othDetails, {marginTop: 20, marginBottom: 10}]}>
                <Text
                  style={[
                    styles.modalHeaderText,
                    {fontSize: 14, textAlign: 'center'},
                  ]}>
                  Total Amount:{' '}
                  <Text style={{fontWeight: '100'}}>
                    {invcDetails?.total ?? 'N/A'}
                  </Text>
                </Text>
                <Text
                  style={[
                    styles.modalHeaderText,
                    {fontSize: 14, textAlign: 'center'},
                  ]}>
                  Pending Total:{' '}
                  <Text style={{fontWeight: '100'}}>
                    {invcDetails?.pendingtotal ?? 'N/A'}
                  </Text>
                </Text>
              </View>

              <View style={styles.othDetails}>
                <Text style={styles.simpText}>Invoice State</Text>
                <Text
                  style={[
                    styles.simpText,
                    {textAlign: 'center', marginBottom: 10},
                  ]}>
                  No Finalized Record Found..!
                </Text>
                <Text style={[styles.simpText, {textAlign: 'center'}]}>
                  Thank you for your visit
                </Text>
                <Text
                  style={[
                    styles.simpText,
                    {textAlign: 'center', fontWeight: 'bold'},
                  ]}>
                  Software Developed with love by
                </Text>
                <Text
                  style={[
                    styles.simpText,
                    {textAlign: 'center', marginBottom: 10},
                  ]}>
                  Technic Mentors | +923111122144
                </Text>
              </View>
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
  dropdownContainer: {
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 38,
    borderRadius: 6,
    padding: 8,
    backgroundColor: 'transparent',
    width: '100%',
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

  //Modal Styling
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
  modalBody: {
    padding: 15,
  },
  orderSummary: {
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  lineItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderBottomWidth: 1,
    paddingBottom: 5,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderTotals: {
    marginTop: 15,
    borderTopWidth: 1,
    paddingTop: 10,
    borderColor: '#ccc',
    alignItems: 'flex-end',
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#144272',
    marginBottom: 5,
  },
  details: {
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  othDetails: {
    width: '100%',
    paddingHorizontal: 10,
  },
  itemText: {
    flex: 1,
    textAlign: 'center',
    color: '#555',
    fontSize: 12,
    paddingHorizontal: 2,
  },
  simpText: {
    fontSize: 14,
    color: '#000',
    marginTop: 10,
  },
});
