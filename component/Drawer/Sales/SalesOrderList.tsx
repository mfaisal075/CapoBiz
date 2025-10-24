import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDrawer} from '../../DrawerContext';
import {useUser} from '../../CTX/UserContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import DropDownPicker from 'react-native-dropdown-picker';
import backgroundColors from '../../Colors';

interface Orders {
  id: number;
  salord_invoice_no: string;
  salord_date: string;
  salord_partial_status: string;
  order_total: string;
  salord_cust_id: number;
  cust_name: string;
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

interface InvoiceState {
  id: number;
  sald_prod_name: string;
  sald_invoice_no: string;
  sald_qty: string;
  sald_retail_price: string;
  sald_total_fretailprice: string;
}

export default function SalesOrderList() {
  const {token, bussName, bussAddress, bussContact} = useUser();
  const {openDrawer} = useDrawer();
  const [saleOrders, setSaleOrders] = useState<Orders[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [invcDetails, setInvcDetails] = useState<InvoiceDetails | null>(null);
  const [invcOrders, setInvcOrders] = useState<InvoiceOrders[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [status, setStatus] = useState('Sale Order');
  const [invoiceState, setInvoiceState] = useState<InvoiceState[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = saleOrders.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = saleOrders.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Status Dropdown
  const statusDropdown = [
    {label: 'Pending', value: 'Sale Order'},
    {label: 'Completed', value: 'Completed'},
  ];

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

  // Fetch Sale Order List
  const fetchSaleOrderList = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.get(
        `${BASE_URL}/fetchorderlist?from=${from}&to=${to}&status=${status}&_token=${token}`,
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
      setInvoiceState(res.data.saleinvoicedetail);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSaleOrderList();
  }, [startDate, endDate, status]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Sale Order List</Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <View style={styles.dateInputWrapper}>
            <Text style={styles.dateLabel}>From:</Text>
            <TouchableOpacity
              style={styles.dateInputBox}
              onPress={() => setShowStartDatePicker(true)}>
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString('en-GB')}
              </Text>
              <Icon name="calendar" size={20} color="#144272" />
            </TouchableOpacity>
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
          </View>

          <View style={styles.dateInputWrapper}>
            <Text style={styles.dateLabel}>To:</Text>
            <TouchableOpacity
              style={styles.dateInputBox}
              onPress={() => setShowEndDatePicker(true)}>
              <Text style={styles.dateText}>
                {endDate.toLocaleDateString('en-GB')}
              </Text>
              <Icon name="calendar" size={20} color="#144272" />
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                testID="endDatePicker"
                value={endDate}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onEndDateChange}
              />
            )}
          </View>
        </View>

        {/* Status Filter */}
        <View style={{paddingHorizontal: 15, marginTop: 4}}>
          <DropDownPicker
            items={statusDropdown}
            open={statusOpen}
            setOpen={setStatusOpen}
            value={status}
            setValue={setStatus}
            placeholder="Select Status"
            placeholderStyle={{color: '#666'}}
            textStyle={{color: '#144272'}}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={18} color="#144272" />
            )}
            ArrowDownIconComponent={() => (
              <Icon name="chevron-down" size={18} color="#144272" />
            )}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
          />
        </View>

        {/* Flatlist */}
        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  setModalVisible('View');
                  getOrderInvoice(item.id);
                }}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>
                      {item.salord_invoice_no} | {item.cust_name}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="cash-multiple" size={12} color="#666" />{' '}
                      {item.order_total}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="account" size={12} color="#666" />{' '}
                      {item.cust_name || 'N/A'}
                    </Text>
                  </View>

                  <View style={{alignSelf: 'flex-start'}}>
                    <Text style={[styles.subText, {fontWeight: '700'}]}>
                      <Icon name="calendar" size={12} color="#666" />{' '}
                      {new Date(item.salord_date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-group" size={48} color="#666" />
                <Text style={styles.emptyText}>No record found.</Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 90}}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      {/* Pagination Controls */}
      {totalRecords > 0 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(prev => prev - 1)}
            style={[
              styles.pageButton,
              currentPage === 1 && styles.pageButtonDisabled,
            ]}>
            <Text
              style={[
                styles.pageButtonText,
                currentPage === 1 && styles.pageButtonTextDisabled,
              ]}>
              Prev
            </Text>
          </TouchableOpacity>

          <View style={styles.pageIndicator}>
            <Text style={styles.pageIndicatorText}>
              Page <Text style={styles.pageCurrent}>{currentPage}</Text> of{' '}
              {totalPages}
            </Text>
            <Text style={styles.totalText}>Total: {totalRecords} records</Text>
          </View>

          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage(prev => prev + 1)}
            style={[
              styles.pageButton,
              currentPage === totalPages && styles.pageButtonDisabled,
            ]}>
            <Text
              style={[
                styles.pageButtonText,
                currentPage === totalPages && styles.pageButtonTextDisabled,
              ]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* View Modal */}
      <Modal
        visible={modalVisible === 'View'}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.invoiceIconContainer}>
                  <Icon name="receipt" size={24} color="#144272" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Sales Order</Text>
                  <Text style={styles.modalSubtitle}>Invoice Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setInvcDetails(null);
                  setInvcOrders([]);
                }}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              {/* Company Info Card */}
              <View style={styles.companyCard}>
                <View style={styles.companyHeader}>
                  <Text style={styles.companyName}>{bussName || 'N/A'}</Text>
                </View>
                <Text style={styles.companyAddress}>
                  {bussAddress || 'N/A'}
                </Text>
                <Text style={styles.companyContact}>
                  {bussContact || 'N/A'}
                </Text>
              </View>

              {/* Order Info Grid */}
              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Invoice #:</Text>
                  <Text style={styles.infoValue}>
                    {invcDetails?.orderrecord?.salord_invoice_no ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Invoice Date:</Text>
                  <Text style={styles.infoValue}>
                    {invcDetails?.orderrecord?.salord_date
                      ? new Date(invcDetails.orderrecord.salord_date)
                          .toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Customer:</Text>
                  <Text style={styles.infoValue}>
                    {invcDetails?.customer?.cust_name ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Maker User:</Text>
                  <Text style={styles.infoValue}>
                    {invcDetails?.usermaker?.name ?? 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Order Table Section */}
              <View style={styles.tableSection}>
                <Text style={styles.sectionTitle}>Invoice Items</Text>

                {/* Table Container */}
                <View style={styles.tableContainer}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.col1]}>
                      Invoice#
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col2]}>
                      Product
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col3]}>
                      QTY
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col4]}>
                      Price
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col5]}>
                      Sub Total
                    </Text>
                  </View>

                  {/* Table Rows */}
                  <FlatList
                    data={invcOrders}
                    keyExtractor={(item, index) =>
                      item?.id ? item.id.toString() : index.toString()
                    }
                    renderItem={({item, index}) => (
                      <View style={[styles.tableRow]}>
                        <Text
                          style={[styles.tableCell, styles.col1]}
                          numberOfLines={2}>
                          {item.salordd_invoice_no}
                        </Text>
                        <Text style={[styles.tableCell, styles.col2]}>
                          {item.prod_name}
                        </Text>
                        <Text style={[styles.tableCell, styles.col3]}>
                          {item.salordd_partial_qty}
                        </Text>
                        <Text style={[styles.tableCell, styles.col4]}>
                          {item.salordd_retail_price}
                        </Text>
                        <Text style={[styles.tableCell, styles.col5]}>
                          {Number(item.salordd_sub_total).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    scrollEnabled={false}
                  />
                </View>
              </View>

              <View style={styles.orderInfoGrid}>
                <View
                  style={[
                    styles.infoCard,
                    {
                      justifyContent: 'flex-end',
                      width: '100%',
                      marginBottom: 6,
                    },
                  ]}>
                  <Text style={styles.infoLabel}>Total Amount: </Text>
                  <Text style={styles.infoValue}>
                    {invcDetails?.total ?? 'N/A'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.infoCard,
                    {
                      justifyContent: 'flex-end',
                      width: '100%',
                      marginBottom: 6,
                    },
                  ]}>
                  <Text style={styles.infoLabel}>Pending Amount: </Text>
                  <Text style={styles.infoValue}>
                    {invcDetails?.pendingtotal ?? 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Invoice Section */}
              <View style={styles.tableSection}>
                <Text style={styles.sectionTitle}>Invoice State</Text>

                {/* Table Container */}
                {invoiceState.length > 0 ? (
                  <View style={styles.tableContainer}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderText, styles.col1]}>
                        Invoice#
                      </Text>
                      <Text style={[styles.tableHeaderText, styles.col2]}>
                        Product
                      </Text>
                      <Text style={[styles.tableHeaderText, styles.col3]}>
                        QTY
                      </Text>
                      <Text style={[styles.tableHeaderText, styles.col4]}>
                        Price
                      </Text>
                      <Text style={[styles.tableHeaderText, styles.col5]}>
                        Sub Total
                      </Text>
                    </View>

                    {/* Table Rows */}
                    <FlatList
                      data={invoiceState}
                      keyExtractor={(item, index) =>
                        item?.id ? item.id.toString() : index.toString()
                      }
                      renderItem={({item, index}) => (
                        <View style={[styles.tableRow]}>
                          <Text
                            style={[styles.tableCell, styles.col1]}
                            numberOfLines={2}>
                            {item.sald_invoice_no}
                          </Text>
                          <Text style={[styles.tableCell, styles.col2]}>
                            {item.sald_prod_name}
                          </Text>
                          <Text style={[styles.tableCell, styles.col3]}>
                            {item.sald_qty}
                          </Text>
                          <Text style={[styles.tableCell, styles.col4]}>
                            {Number(item.sald_retail_price).toLocaleString()}
                          </Text>
                          <Text style={[styles.tableCell, styles.col5]}>
                            {Number(
                              item.sald_total_fretailprice,
                            ).toLocaleString()}
                          </Text>
                        </View>
                      )}
                      scrollEnabled={false}
                    />
                  </View>
                ) : (
                  <Text style={styles.footerText}>
                    No Finalized Record Found..!
                  </Text>
                )}
              </View>

              {/* Footer */}
              <View style={styles.modalFooter}>
                <Text style={styles.thankYou}>Thank you for your visit</Text>
                <View style={styles.developerInfo}>
                  <Text style={styles.developerText}>
                    Software Developed with ❤️ by
                  </Text>
                  <Text style={styles.companyContact}>
                    Technic Mentors | +923111122144
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: backgroundColors.primary,
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  menuIcon: {
    width: 28,
    height: 28,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gradientBackground: {
    flex: 1,
  },

  // Pagination Component
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: backgroundColors.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: -2},
    elevation: 6,
  },
  pageButton: {
    backgroundColor: backgroundColors.info,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  pageButtonDisabled: {
    backgroundColor: '#ddd',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  pageButtonTextDisabled: {
    color: '#777',
  },
  pageIndicator: {
    paddingHorizontal: 10,
  },
  pageIndicatorText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  pageCurrent: {
    fontWeight: '700',
    color: '#FFD166',
  },
  totalText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },

  // FlatList Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: '3%',
  },
  card: {
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    width: '96%',
    alignSelf: 'center',
    marginTop: 60,
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Date Fields
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 15,
    marginBottom: 4,
  },
  dateInputWrapper: {
    flex: 0.48,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 6,
    marginLeft: 4,
  },
  dateInputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 66, 114, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    height: 46,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#144272',
  },

  // Dropdown
  dropdown: {
    backgroundColor: backgroundColors.light,
    borderWidth: 0.2,
    borderColor: backgroundColors.dark,
    borderRadius: 8,
    minHeight: 48,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  dropDownContainer: {
    backgroundColor: '#fff',
    borderColor: '#144272',
  },

  // Modal stying
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FAFBFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#2a652b24',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: backgroundColors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Company Card
  companyCard: {
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: backgroundColors.dark,
    borderStyle: 'dotted',
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#144272',
  },
  companyAddress: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },

  // Info Grid
  orderInfoGrid: {
    marginTop: 10,
    borderBottomColor: backgroundColors.dark,
    borderBottomWidth: 2,
    borderStyle: 'dotted',
    marginHorizontal: 20,
  },
  infoCard: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: backgroundColors.dark,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '400',
  },

  // Items Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  // Totals Section
  totalsSection: {
    marginHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '400',
  },

  // Footer
  modalFooter: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    marginTop: 5,
    borderTopColor: '#F0F0F0',
  },
  thankYou: {
    fontSize: 16,
    color: '#144272',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  developerInfo: {
    alignItems: 'center',
  },
  developerText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  companyContact: {
    fontSize: 12,
    color: '#144272',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
  },

  // Table Section
  tableSection: {
    marginTop: 20,
    marginHorizontal: 20,
    borderBottomWidth: 2,
    borderColor: backgroundColors.dark,
    borderStyle: 'dotted',
  },
  tableContainer: {
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomColor: backgroundColors.dark,
    borderBottomWidth: 1.5,
    paddingBottom: 5,
  },
  tableHeaderText: {
    color: backgroundColors.dark,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12,
    color: backgroundColors.dark,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Column widths
  col1: {
    flex: 0.15,
  },
  col2: {
    flex: 0.25, // Product
  },
  col3: {
    flex: 0.2, // Qty
  },
  col4: {
    flex: 0.15, // Price
  },
  col5: {
    flex: 0.2, // Total
  },
});
