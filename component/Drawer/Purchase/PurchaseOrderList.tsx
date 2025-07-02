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
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useDrawer} from '../../DrawerContext';
import {useUser} from '../../CTX/UserContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';

interface OrderList {
  id: number;
  pord_invoice_no: string;
  pord_order_date: string;
  partial_status: string;
  pord_order_total: string;
  pord_status: string;
  pord_sup_id: number;
}

interface SingleOrder {
  purchase: {
    id: number;
    pord_invoice_no: string;
    pord_order_date: string;
    pord_order_total: string;
  };
  purchase_details: {
    id: string;
    pordd_prod_name: string;
    pordd_invoice_no: string;
    pordd_partial_qty: string;
    pordd_total_cost: string;
  };
  ordertotal: string;
  pendingtotal: string;
  supplier: {
    sup_name: string;
  };
  makeruser: {
    name: string;
  };
}

interface InvoiceOrders {
  id: number;
  pordd_prod_name: string;
  pordd_invoice_no: string;
  pordd_partial_qty: string;
  pordd_cost_price: string;
  pordd_total_cost: string;
  pordd_status: string;
}

export default function PurchaseOrderList() {
  const {token} = useUser();
  const [orderList, setOrderList] = useState<OrderList[]>([]);
  const {openDrawer} = useDrawer();
  const [modalVisible, setModalVisible] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SingleOrder[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<InvoiceOrders[]>([]);

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
  const [status, setStatus] = useState<string | null>('Purchase Order');
  const orderStatus = [
    {label: 'Pending', value: 'Purchase Order'},
    {label: 'Complete', value: 'Completed'},
  ];

  // Fetch Order List
  const fetchOrders = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.get(
        `${BASE_URL}/fetchpurchaseorderlist?from=${from}&to=${to}&status=${status}&_token=${token}`,
      );

      setOrderList(res.data.pucrhaseorders);
    } catch (error) {
      console.log(error);
    }
  };

  // Get single order details (moved outside render)
  const getSingleOrder = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/purchaseorderinvoice?id=${id}&_token=${token}`,
      );
      setInvoiceOrder(res.data.purchase_details);
      setSelectedOrder([res.data]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [startDate, endDate, status]);
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
              Purchase Order List
            </Text>
          </View>
        </View>

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
            items={orderStatus}
            open={issupplier}
            setOpen={setissupplier}
            value={status}
            setValue={setStatus}
            placeholder="Status"
            placeholderStyle={{color: 'white'}}
            textStyle={{color: 'white'}}
            ArrowUpIconComponent={() => (
              <Icon name="keyboard-arrow-up" size={18} color="#fff" />
            )}
            ArrowDownIconComponent={() => (
              <Icon name="keyboard-arrow-down" size={18} color="#fff" />
            )}
            style={styles.dropdown}
            dropDownContainerStyle={{
              backgroundColor: 'white',
              borderColor: 'white',
              width: '100%',
              marginTop: 0,
            }}
            labelStyle={{color: 'white'}}
            listItemLabelStyle={{color: '#144272'}}
            listMode="SCROLLVIEW"
          />
        </View>

        {/* FlatList */}
        <FlatList
          data={orderList}
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
                    {item.pord_invoice_no}
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible('View');
                      getSingleOrder(item.id);
                    }}>
                    <Icon
                      name="remove-red-eye"
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
                      {new Date(item.pord_order_date)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .replace(/ /g, '-')}
                    </Text>
                  </View>
                  <View style={styles.rowt}>
                    <Text style={styles.text}>Supplier:</Text>
                    <Text style={styles.text}>{item.pord_sup_id}</Text>
                  </View>
                  <View style={styles.rowt}>
                    <Text style={styles.text}>Order Total:</Text>
                    <Text style={styles.text}>{item.pord_order_total}</Text>
                  </View>
                  <View style={styles.rowt}>
                    <Text style={styles.text}>Order Status:</Text>
                    <Text style={styles.text}>
                      {item.partial_status === 'Purchase Order'
                        ? 'Pending'
                        : ''}
                    </Text>
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
              <Text style={styles.modalHeaderText}>
                Pucrhase Order Invoice Details
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setSelectedOrder([]);
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
                Supplier: {selectedOrder[0]?.supplier?.sup_name ?? 'N/A'}
              </Text>
              <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                Maker User: {selectedOrder[0]?.makeruser?.name ?? 'N/A'}
              </Text>
            </View>

            <View
              style={[
                styles.othDetails,
                {flexDirection: 'row-reverse', marginTop: 5},
              ]}>
              <View>
                <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                  Invoice#{' '}
                  {selectedOrder[0]?.purchase?.pord_invoice_no ?? 'N/A'}
                </Text>
                <Text style={[styles.modalHeaderText, {fontSize: 12}]}>
                  Purchase Order Date:{' '}
                  {selectedOrder[0]?.purchase?.pord_order_date ?? 'N/A'}
                </Text>
              </View>
            </View>

            {/* Modal Body */}
            <FlatList
              data={invoiceOrder}
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
                    style={[styles.headerText, {color: 'white', fontSize: 12}]}>
                    Invoice#
                  </Text>
                  <Text
                    style={[styles.headerText, {color: 'white', fontSize: 12}]}>
                    Product
                  </Text>
                  <Text
                    style={[styles.headerText, {color: 'white', fontSize: 12}]}>
                    QTY
                  </Text>
                  <Text
                    style={[styles.headerText, {color: 'white', fontSize: 12}]}>
                    Purchase Price
                  </Text>
                  <Text
                    style={[styles.headerText, {color: 'white', fontSize: 12}]}>
                    Sub Total
                  </Text>
                  <Text
                    style={[styles.headerText, {color: 'white', fontSize: 12}]}>
                    Status
                  </Text>
                </View>
              }
              renderItem={({item}) => (
                <View style={styles.lineItem}>
                  <Text style={styles.itemText}>{item.pordd_invoice_no}</Text>
                  <Text style={styles.itemText}>{item.pordd_prod_name}</Text>
                  <Text style={styles.itemText}>{item.pordd_partial_qty}</Text>
                  <Text style={styles.itemText}>
                    {Number(item.pordd_cost_price).toLocaleString()}
                  </Text>
                  <Text style={styles.itemText}>
                    {Number(item.pordd_total_cost).toLocaleString()}
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
                Order Total:{' '}
                <Text style={{fontWeight: '100'}}>
                  {selectedOrder[0]?.ordertotal ?? 'N/A'}
                </Text>
              </Text>
              <Text
                style={[
                  styles.modalHeaderText,
                  {fontSize: 14, textAlign: 'center'},
                ]}>
                Pending Total:{' '}
                <Text style={{fontWeight: '100'}}>
                  {selectedOrder[0]?.pendingtotal ?? 'N/A'}
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
