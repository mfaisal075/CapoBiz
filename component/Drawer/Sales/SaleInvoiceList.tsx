import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {useDrawer} from '../../DrawerContext';
import {FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import DropDownPicker from 'react-native-dropdown-picker';

interface InvoiceList {
  id: number;
  sal_date: string;
  sal_order_total: string;
  sal_invoice_no: string;
  sal_payment_method: string;
  slcust_name: string;
  name: string;
}

interface SingleInvoice {
  config: {
    bus_name: string;
    bus_address: string;
    bus_contact1: string;
  };
  sale: {
    cust_name: string;
    name: string;
    slcust_address: string;
    sal_builty_contact: string;
    sal_builty_address: string;
    contact: string;
    sal_change_amount: string;
    created_at: string;
    sal_freight_exp: string;
    sal_labr_exp: string;
    sal_discount: string;
    sal_payment_amount: string;
    sal_total_amount: string;
    sal_order_total: string;
    note: string;
  };
  prev_balance: string;
}

interface InvoiceSaleDetails {
  prod_name: string;
  sald_qty: string;
  sald_fretail_price: string;
  sald_total_fretailprice: string;
  ums_name: string;
}

interface Users {
  id: number;
  name: string;
}

export default function SaleInvoiceList() {
  const {openDrawer} = useDrawer();
  const [userOpen, setUserOpen] = useState(false);
  const [userValue, setUserValue] = useState('');
  const [invcList, setInvcList] = useState<InvoiceList[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [invoiceData, setInvoiceData] = useState<SingleInvoice | null>(null);
  const [selectedInvc, setSelectedInvc] = useState('');
  const [invcSaleDetails, setInvcSaleDetails] = useState<InvoiceSaleDetails[]>(
    [],
  );
  const [users, setUsers] = useState<Users[]>([]);
  const transformedUsers = users.map(user => ({
    label: user.name,
    value: user.id.toString(),
  }));

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = invcList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = invcList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Fetch Sale Invoice List
  const fetchinvcLisr = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/getinvoices`, {
        from,
        to,
      });

      setInvcList(res.data.inv_data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Invoice
  const singleInvc = async (inv: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/invoiceprint`, {
        invoice: inv,
      });

      setInvoiceData(res.data);
      setInvcSaleDetails(res.data.saledetail);
    } catch (error) {
      console.log();
    }
  };

  // Fetch Users List Dropdown
  const fetchUserDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchusersdropdown`);
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchinvcLisr();
    fetchUserDropdown();
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
              Invoice List
            </Text>
          </View>
        </View>

        <View style={styles.dropDownContainer}>
          <View
            style={{
              width: '100%',
              height: 38,
            }}>
            <DropDownPicker
              items={transformedUsers}
              open={userOpen}
              setOpen={setUserOpen}
              value={userValue}
              setValue={setUserValue}
              placeholder="Select User"
              placeholderStyle={{color: 'white'}}
              textStyle={{color: 'white'}}
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
              style={[styles.dropdown]}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: '100%',
                marginTop: 8,
                zIndex: 1000,
              }}
              labelStyle={{color: 'white'}}
              listItemLabelStyle={{color: '#144272'}}
              listMode="SCROLLVIEW"
            />
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

        {/* FlatList */}
        <FlatList
          data={currentData}
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
                    {item.sal_invoice_no}
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible('View');
                      singleInvc(item.sal_invoice_no);
                      setSelectedInvc(item.sal_invoice_no);
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
                      {new Date(item.sal_date)
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
                    <Text style={styles.text}>Invoiced By:</Text>
                    <Text style={styles.text}>{item.name}</Text>
                  </View>
                  <View style={styles.rowt}>
                    <Text style={styles.text}>Payment Method:</Text>
                    <Text style={styles.text}>{item.sal_payment_method}</Text>
                  </View>
                  <View style={styles.rowt}>
                    <Text style={styles.text}>Total Amount:</Text>
                    <Text style={styles.text}>{item.sal_order_total}</Text>
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
                marginTop: 20,
              }}>
              No record present in the database for this Date range!
            </Text>
          }
        />

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 15,
              marginTop: 5,
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

        {/* Invoice Modal */}
        <Modal
          visible={modalVisible === 'View'}
          animationType="slide"
          transparent={true}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.title}>Sale Invoice :</Text>
              <ScrollView>
                <Text style={styles.shopName}>
                  {invoiceData?.config.bus_name}
                </Text>
                <Text style={styles.shopAddress}>
                  {invoiceData?.config?.bus_address}
                </Text>
                <Text style={styles.phone}>
                  {invoiceData?.config?.bus_contact1}
                </Text>

                <View style={styles.modalRow}>
                  <Text>Receipt#: {selectedInvc}</Text>
                  <Text>
                    {invoiceData?.sale.created_at
                      ? new Date(
                          invoiceData.sale.created_at,
                        ).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : ''}
                  </Text>
                </View>

                <Text>Cashier: {invoiceData?.sale?.name}</Text>
                <Text>
                  Builty Contact #: {invoiceData?.sale?.sal_builty_contact}
                </Text>
                <Text>
                  Builty Address: {invoiceData?.sale?.sal_builty_address}
                </Text>
                <Text>Customer: {invoiceData?.sale?.cust_name}</Text>
                <Text>Contact #: {invoiceData?.sale?.contact}</Text>
                <Text>Address: {invoiceData?.sale?.slcust_address}</Text>

                <View style={styles.tableHeader}>
                  <Text style={styles.cell}>Description</Text>
                  <Text style={styles.cell}>Qty</Text>
                  <Text style={styles.cell}>UOM</Text>
                  <Text style={styles.cell}>Price</Text>
                  <Text style={styles.cell}>Total</Text>
                </View>

                <FlatList
                  data={invcSaleDetails}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({item, index}) => (
                    <View style={styles.tableRow}>
                      <Text style={styles.cell}>{item.prod_name}</Text>
                      <Text style={styles.cell}>{item.sald_qty}</Text>
                      <Text style={styles.cell}>{item.ums_name}</Text>
                      <Text style={styles.cell}>
                        {parseFloat(item.sald_fretail_price).toFixed(2)}
                      </Text>
                      <Text style={styles.cell}>
                        {parseFloat(item.sald_total_fretailprice).toFixed(2)}
                      </Text>
                    </View>
                  )}
                  scrollEnabled={false}
                />

                <View style={styles.totalRow}>
                  <Text style={{fontWeight: 'bold'}}>Total Items</Text>
                  <Text>{invcSaleDetails.length}</Text>
                  <Text>
                    {invcSaleDetails
                      .reduce(
                        (sum, item) =>
                          sum + parseFloat(item.sald_total_fretailprice || '0'),
                        0,
                      )
                      .toFixed(2)}
                  </Text>
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Freight: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_freight_exp}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Labour: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_labr_exp}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>T.Order </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_order_total}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Discount: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_discount}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Pre.Bal: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.prev_balance}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Payable: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_total_amount}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Paid: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_payment_amount}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Balance: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_change_amount}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Note: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.note ?? 'NILL'}
                  </Text>
                </View>

                <Text style={styles.footerText}>
                  Software Developed with love by{'\n'}TechnicMentors
                </Text>

                <Text style={styles.printIcon}>🖨 Print</Text>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setModalVisible('');
                    setInvoiceData(null);
                    setInvcSaleDetails([]);
                    setSelectedInvc('');
                  }}>
                  <Text style={styles.closeText}>Close</Text>
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
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 25,
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
  centeredView: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    maxHeight: '80%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shopAddress: {
    textAlign: 'center',
    fontWeight: '600',
  },
  phone: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableHeader: {
    flexDirection: 'row',
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  footerText: {
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  printIcon: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#6666cc',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bottomRow: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    marginTop: 10,
  },
  bottomRowTxt: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropDownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
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
});
