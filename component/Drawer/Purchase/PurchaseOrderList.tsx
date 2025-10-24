import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
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

interface OrderList {
  id: number;
  pord_invoice_no: string;
  pord_order_date: string;
  partial_status: string;
  pord_order_total: string;
  pord_status: string;
  pord_sup_id: number;
  sup_name: string;
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

interface FinalizedInvc {
  id: number;
  prchd_invoice_no: string;
  prchd_prod_name: string;
  prchd_qty: string;
  prchd_cost_price: string;
  prchd_total_cost: string;
}

export default function PurchaseOrderList() {
  const {token, bussName, bussAddress} = useUser();
  const [orderList, setOrderList] = useState<OrderList[]>([]);
  const {openDrawer} = useDrawer();
  const [modalVisible, setModalVisible] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SingleOrder[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<InvoiceOrders[]>([]);
  const [finalizedInvc, setFinalizedInvc] = useState<FinalizedInvc[]>([]);
  const [statusOpen, setStatusOpen] = useState(false);
  const [status, setStatus] = useState('Purchase Order');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = orderList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = orderList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Status Dropdown
  const statusDropdown = [
    {label: 'Pending', value: 'Purchase Order'},
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

  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

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
      setFinalizedInvc(res.data.purchaseinvoicedetail);
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
            <Text style={styles.headerTitle}>Purchase Order List</Text>
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
        <View style={{paddingHorizontal: 10, marginTop: 8}}>
          <DropDownPicker
            items={statusDropdown}
            open={statusOpen}
            setOpen={setStatusOpen}
            value={status}
            setValue={setStatus}
            placeholder="Select Category"
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
                  getSingleOrder(item.id);
                }}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>
                      {item.pord_invoice_no} | {item.sup_name}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="cash" size={12} color={'#666'} />{' '}
                      {item.pord_order_total}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon
                        name="check-circle"
                        size={12}
                        color={
                          status === 'Purchase Order'
                            ? backgroundColors.danger
                            : backgroundColors.success
                        }
                      />{' '}
                      {status === 'Purchase Order' ? 'Pending' : 'Completed'}
                    </Text>
                  </View>

                  <View style={{alignSelf: 'flex-start'}}>
                    <Text
                      style={[
                        styles.subText,
                        {fontWeight: '700', verticalAlign: 'top'},
                      ]}>
                      <Icon name="calendar" size={12} color={'#666'} />{' '}
                      {new Date(item.pord_order_date)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .replace(/ /g, '-') || 'N/A'}
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
              <Text style={styles.totalText}>
                Total: {totalRecords} records
              </Text>
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
      </View>

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
                  <Text style={styles.modalTitle}>Purchase Order</Text>
                  <Text style={styles.modalSubtitle}>Invoice Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setSelectedOrder([]);
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
                  <Text style={styles.companyName}>{bussName ?? 'N/A'}</Text>
                </View>
                <Text style={styles.companyAddress}>
                  {bussAddress ?? 'N/A'}
                </Text>
              </View>

              {/* Order Info Grid */}
              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Invoice #: </Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder[0]?.purchase?.pord_invoice_no ?? 'N/A'}
                  </Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Maker User: </Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder[0]?.makeruser?.name ?? 'N/A'}
                  </Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Order Date: </Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder[0]?.purchase?.pord_order_date
                      ? new Date(selectedOrder[0].purchase.pord_order_date)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')
                      : 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Supplier: </Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder[0]?.supplier?.sup_name ?? 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Order Table Section */}
              <View style={styles.tableSection}>
                {/* Table Container */}
                <View style={styles.tableContainer}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.col1]}>
                      Invoice #
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col2]}>
                      Product
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col3]}>
                      Qty
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col4]}>
                      Price
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col5]}>
                      Total
                    </Text>
                  </View>

                  {/* Table Rows */}
                  <FlatList
                    data={invoiceOrder}
                    keyExtractor={(item, index) =>
                      item?.id ? item.id.toString() : index.toString()
                    }
                    renderItem={({item, index}) => (
                      <View style={[styles.tableRow]}>
                        <Text
                          style={[styles.tableCell, styles.col1]}
                          numberOfLines={2}>
                          {item.pordd_invoice_no}
                        </Text>
                        <Text
                          style={[styles.tableCell, styles.col2]}
                          numberOfLines={2}>
                          {item.pordd_prod_name}
                        </Text>
                        <Text style={[styles.tableCell, styles.col3]}>
                          {item.pordd_partial_qty}
                        </Text>
                        <Text style={[styles.tableCell, styles.col4]}>
                          {Number(item.pordd_cost_price).toLocaleString()}
                        </Text>
                        <Text style={[styles.tableCell, styles.col5]}>
                          {Number(item.pordd_total_cost).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    scrollEnabled={false}
                  />
                </View>
              </View>

              {/* Order Totals */}
              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Order Total:</Text>
                  <Text style={styles.totalValue}>
                    PKR{' '}
                    {selectedOrder[0]?.ordertotal
                      ? selectedOrder[0].ordertotal
                      : 'N/A'}
                  </Text>
                </View>
                <View style={[styles.totalRow, styles.pendingTotalRow]}>
                  <Text style={[styles.totalLabel, styles.pendingLabel]}>
                    Pending Total:
                  </Text>
                  <Text style={[styles.totalValue, styles.pendingValue]}>
                    PKR{' '}
                    {selectedOrder[0]?.pendingtotal
                      ? selectedOrder[0].pendingtotal
                      : 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.modalFooter}>
                <Text style={styles.invoiceState}>Invoice State</Text>
                {finalizedInvc.length > 0 ? (
                  <View
                    style={[
                      styles.tableSection,
                      {marginHorizontal: 0, marginTop: 0, marginBottom: 10},
                    ]}>
                    <View style={styles.tableContainer}>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.col1]}>
                          Invoice #
                        </Text>
                        <Text style={[styles.tableHeaderText, styles.col2]}>
                          Product
                        </Text>
                        <Text style={[styles.tableHeaderText, styles.col3]}>
                          Qty
                        </Text>
                        <Text style={[styles.tableHeaderText, styles.col4]}>
                          Price
                        </Text>
                        <Text style={[styles.tableHeaderText, styles.col5]}>
                          Total
                        </Text>
                      </View>

                      {/* Table Rows */}
                      <FlatList
                        data={finalizedInvc}
                        keyExtractor={(item, index) =>
                          item?.id ? item.id.toString() : index.toString()
                        }
                        renderItem={({item, index}) => (
                          <View style={[styles.tableRow]}>
                            <Text
                              style={[styles.tableCell, styles.col1]}
                              numberOfLines={2}>
                              {item.prchd_invoice_no}
                            </Text>
                            <Text
                              style={[styles.tableCell, styles.col2]}
                              numberOfLines={2}>
                              {item.prchd_prod_name}
                            </Text>
                            <Text style={[styles.tableCell, styles.col3]}>
                              {item.prchd_qty}
                            </Text>
                            <Text style={[styles.tableCell, styles.col4]}>
                              {Number(item.prchd_cost_price).toLocaleString()}
                            </Text>
                            <Text style={[styles.tableCell, styles.col5]}>
                              {Number(item.prchd_total_cost).toLocaleString()}
                            </Text>
                          </View>
                        )}
                        scrollEnabled={false}
                      />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.footerText}>
                    No Finalized Record Found..!
                  </Text>
                )}
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
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.light,
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    paddingHorizontal: 10,
    marginTop: 15,
    marginBottom: 5,
  },
  dateInputWrapper: {
    flex: 0.48,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 8,
    marginLeft: 4,
  },
  dateInputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
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
    elevation: 3,
    height: 48,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#144272',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
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
  itemsSection: {
    flex: 1,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  itemsList: {
    paddingHorizontal: 20,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  itemInvoice: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  itemBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#C62828',
  },
  itemDetails: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemDetailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  itemDetailValue: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  itemTotal: {
    color: '#144272',
    fontSize: 14,
  },

  // Totals Section
  totalsSection: {
    marginTop: 20,
    marginHorizontal: 20,
    borderBottomWidth: 2,
    borderColor: backgroundColors.dark,
    borderStyle: 'dotted',
    paddingBottom: 5,
  },
  totalRow: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingTotalRow: {
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
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
  pendingLabel: {
    color: backgroundColors.dark,
  },
  pendingValue: {
    color: backgroundColors.dark,
    fontSize: 14,
  },

  // Footer
  modalFooter: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
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

  // Column widths
  col1: {
    flex: 0.2,
  },
  col2: {
    flex: 0.25, // Product
  },
  col3: {
    flex: 0.15, // Qty
  },
  col4: {
    flex: 0.2, // Price
  },
  col5: {
    flex: 0.2, // Total
  },

  invoiceState: {
    fontSize: 16,
    color: '#144272',
    fontWeight: '600',
    marginBottom: 8,
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
});
