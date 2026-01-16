import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  BackHandler,
  StatusBar,
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
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../BottomBar';

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F0F2F5',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  shadow: '#000',
};

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
  pord_status: string;
}

interface FinalizedInvc {
  id: number;
  prchd_invoice_no: string;
  prchd_prod_name: string;
  prchd_qty: string;
  prchd_cost_price: string;
  prchd_total_cost: string;
}

export default function PurchaseOrderList({navigation}: any) {
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

  // Get single order details
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

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [startDate, endDate, status]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      {/* --- MODERN HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Purchase Orders</Text>
            <View style={{width: 40}} />
          </View>
        </LinearGradient>

        {/* Floating Filter Card (Replaces Search) */}
        <View style={styles.floatingFilterContainer}>
          {/* Row 1: Date Range */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartDatePicker(true)}>
              <Icon name="calendar" size={16} color={THEME.primary} />
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString('en-GB')}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dateSeparator}>-</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndDatePicker(true)}>
              <Icon name="calendar" size={16} color={THEME.primary} />
              <Text style={styles.dateText}>
                {endDate.toLocaleDateString('en-GB')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Row 2: Status */}
          <View style={styles.filterRow}>
            <DropDownPicker
              items={statusDropdown}
              open={statusOpen}
              setOpen={setStatusOpen}
              value={status}
              setValue={setStatus}
              placeholder="Select Status"
              style={styles.compactDropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownList}
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>
        </View>
      </View>

      {/* Date Pickers */}
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

      {/* --- CONTENT LIST --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>ORDER LIST</Text>
          <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
        </View>

        <FlatList
          data={currentData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.cardRow}
              onPress={() => {
                setModalVisible('View');
                getSingleOrder(item.id);
              }}>
              {/* Icon Section */}
              <View
                style={[
                  styles.avatarContainer,
                  {
                    backgroundColor:
                      status === 'Purchase Order' ? '#FEF3C7' : '#D1FAE5',
                  },
                ]}>
                <Icon
                  name={
                    status === 'Purchase Order'
                      ? 'clock-outline'
                      : 'check-circle-outline'
                  }
                  size={24}
                  color={
                    status === 'Purchase Order' ? THEME.warning : THEME.success
                  }
                />
              </View>

              {/* Info Section */}
              <View style={styles.infoContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.nameText}>{item.pord_invoice_no}</Text>
                  <Text style={styles.amountText}>{item.pord_order_total}</Text>
                </View>

                <View style={styles.iconTextRow}>
                  <Icon name="domain" size={14} color={THEME.textGray} />
                  <Text style={styles.subText} numberOfLines={1}>
                    {item.sup_name}
                  </Text>
                </View>
                <View style={styles.iconTextRow}>
                  <Icon
                    name="calendar-month"
                    size={14}
                    color={THEME.textGray}
                  />
                  <Text style={styles.subText}>
                    {new Date(item.pord_order_date).toLocaleDateString(
                      'en-GB',
                      {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      },
                    )}
                  </Text>
                </View>
              </View>

              {/* Arrow */}
              <Icon
                name="chevron-right"
                size={22}
                color={THEME.primary}
                style={{marginLeft: 6}}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={{paddingBottom: 160}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="clipboard-text-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      </View>

      {/* --- PAGINATION (Bottom Floating) --- */}
      {totalRecords > 0 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(prev => prev - 1)}
            style={[styles.pageBtn, currentPage === 1 && styles.disabledBtn]}>
            <Icon name="chevron-left" size={24} color={THEME.white} />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage(prev => prev + 1)}
            style={[
              styles.pageBtn,
              currentPage === totalPages && styles.disabledBtn,
            ]}>
            <Icon name="chevron-right" size={24} color={THEME.white} />
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
                  <Icon name="receipt" size={24} color={THEME.primary} />
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
                  <View style={styles.modalTableHeader}>
                    <Text style={[styles.modalTableHeaderText, styles.col1]}>
                      Invoice #
                    </Text>
                    <Text style={[styles.modalTableHeaderText, styles.col2]}>
                      Product
                    </Text>
                    <Text style={[styles.modalTableHeaderText, styles.col3]}>
                      Qty
                    </Text>
                    <Text style={[styles.modalTableHeaderText, styles.col4]}>
                      Price
                    </Text>
                    <Text style={[styles.modalTableHeaderText, styles.col5]}>
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
                      <View style={[styles.modalTableRow]}>
                        <Text
                          style={[styles.modalTableCell, styles.col1]}
                          numberOfLines={2}>
                          {item.pordd_invoice_no}
                        </Text>
                        <Text
                          style={[styles.modalTableCell, styles.col2]}
                          numberOfLines={2}>
                          {item.pordd_prod_name}
                        </Text>
                        <Text style={[styles.modalTableCell, styles.col3]}>
                          {item.pordd_partial_qty}
                        </Text>
                        <Text style={[styles.modalTableCell, styles.col4]}>
                          {Number(item.pordd_cost_price).toLocaleString()}
                        </Text>
                        <Text style={[styles.modalTableCell, styles.col5]}>
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
                      <View style={styles.modalTableHeader}>
                        <Text
                          style={[styles.modalTableHeaderText, styles.col1]}>
                          Invoice #
                        </Text>
                        <Text
                          style={[styles.modalTableHeaderText, styles.col2]}>
                          Product
                        </Text>
                        <Text
                          style={[styles.modalTableHeaderText, styles.col3]}>
                          Qty
                        </Text>
                        <Text
                          style={[styles.modalTableHeaderText, styles.col4]}>
                          Price
                        </Text>
                        <Text
                          style={[styles.modalTableHeaderText, styles.col5]}>
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
                          <View style={[styles.modalTableRow]}>
                            <Text
                              style={[styles.modalTableCell, styles.col1]}
                              numberOfLines={2}>
                              {item.prchd_invoice_no}
                            </Text>
                            <Text
                              style={[styles.modalTableCell, styles.col2]}
                              numberOfLines={2}>
                              {item.prchd_prod_name}
                            </Text>
                            <Text style={[styles.modalTableCell, styles.col3]}>
                              {item.prchd_qty}
                            </Text>
                            <Text style={[styles.modalTableCell, styles.col4]}>
                              {Number(item.prchd_cost_price).toLocaleString()}
                            </Text>
                            <Text style={[styles.modalTableCell, styles.col5]}>
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
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- Header ---
  headerWrapper: {
    marginBottom: 20,
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 70, // Extra space for floating filter
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },

  // --- Floating Filter ---
  floatingFilterContainer: {
    position: 'absolute',
    bottom: -50,
    left: 12,
    right: 12,
    backgroundColor: THEME.white,
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    gap: 10,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 1,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 13,
    color: THEME.textDark,
    marginLeft: 6,
    fontWeight: '500',
  },
  dateSeparator: {
    marginHorizontal: 8,
    color: THEME.textGray,
    fontWeight: 'bold',
  },
  compactDropdown: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    height: 40,
    borderRadius: 8,
    minHeight: 40,
  },
  dropdownList: {
    backgroundColor: THEME.white,
    borderColor: THEME.border,
  },
  dropdownText: {
    fontSize: 13,
    color: THEME.textDark,
  },

  // --- List & Cards ---
  listContainer: {
    flex: 1,
    paddingTop: 55, // Space for floating filter
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  tableHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textGray,
    letterSpacing: 0.5,
  },
  tableHeaderCount: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.primary,
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    width: '94%',
    alignSelf: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#222',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.primary,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  subText: {
    fontSize: 12,
    color: THEME.textGray,
    marginLeft: 4,
    flexShrink: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: THEME.textGray,
    fontSize: 16,
    fontWeight: '500',
  },

  // --- Pagination ---
  paginationContainer: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: THEME.primary,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  pageBtn: {
    padding: 5,
  },
  disabledBtn: {
    opacity: 0.3,
  },
  pageText: {
    color: THEME.white,
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 15,
  },

  // --- View Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: THEME.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  modalSubtitle: {
    fontSize: 12,
    color: THEME.textGray,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  modalContent: {
    padding: 12,
  },
  companyCard: {
    backgroundColor: THEME.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  companyHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 4,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.primary,
    textTransform: 'uppercase',
  },
  companyAddress: {
    fontSize: 13,
    color: THEME.textGray,
    lineHeight: 18,
  },
  orderInfoGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: THEME.white,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 11,
    color: THEME.textGray,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  // Table Styling
  tableSection: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 8,
    marginTop: 5,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableContainer: {
    overflow: 'hidden',
  },
  modalTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalTableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textGray,
  },
  modalTableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTableCell: {
    fontSize: 12,
    color: THEME.textDark,
  },
  col1: {flex: 2},
  col2: {flex: 3},
  col3: {flex: 1, textAlign: 'center'},
  col4: {flex: 1.5, textAlign: 'right'},
  col5: {flex: 2, textAlign: 'right'},

  // Totals
  totalsSection: {
    backgroundColor: THEME.white,
    padding: 10,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: THEME.textGray,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  pendingTotalRow: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 0,
  },
  pendingLabel: {
    color: THEME.danger,
    fontWeight: '600',
  },
  pendingValue: {
    color: THEME.danger,
    fontSize: 18,
  },
  modalFooter: {
    marginBottom: 10,
  },
  invoiceState: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 10,
  },
  footerText: {
    textAlign: 'center',
    color: THEME.textGray,
    fontStyle: 'italic',
    marginTop: 10,
  },
});
