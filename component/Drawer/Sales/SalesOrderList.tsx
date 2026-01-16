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
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
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

export default function SalesOrderList({navigation}: any) {
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
            <Text style={styles.headerTitle}>Sale Orders</Text>
            <View style={{width: 40}} />
          </View>
        </LinearGradient>

        {/* Floating Filter Card */}
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
                getOrderInvoice(item.id);
              }}>
              {/* Icon Section */}
              <View
                style={[
                  styles.avatarContainer,
                  {
                    backgroundColor:
                      status === 'Sale Order' ? '#FEF3C7' : '#D1FAE5',
                  },
                ]}>
                <Icon
                  name={
                    status === 'Sale Order'
                      ? 'clock-outline'
                      : 'check-circle-outline'
                  }
                  size={24}
                  color={
                    status === 'Sale Order' ? THEME.warning : THEME.success
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
                  <Text style={styles.nameText}>{item.salord_invoice_no}</Text>
                  <Text style={styles.amountText}>{item.order_total}</Text>
                </View>

                <View style={styles.iconTextRow}>
                  <Icon name="account" size={14} color={THEME.textGray} />
                  <Text style={styles.subText} numberOfLines={1}>
                    {item.cust_name || 'N/A'}
                  </Text>
                </View>
                <View style={styles.iconTextRow}>
                  <Icon
                    name="calendar-month"
                    size={14}
                    color={THEME.textGray}
                  />
                  <Text style={styles.subText}>
                    {new Date(item.salord_date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
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
          contentContainerStyle={{paddingBottom: 80}}
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
                  <View style={styles.modalTableHeader}>
                    <Text style={[styles.modalTableHeaderText, styles.col1]}>
                      Invoice#
                    </Text>
                    <Text style={[styles.modalTableHeaderText, styles.col2]}>
                      Product
                    </Text>
                    <Text style={[styles.modalTableHeaderText, styles.col3]}>
                      QTY
                    </Text>
                    <Text style={[styles.modalTableHeaderText, styles.col4]}>
                      Price
                    </Text>
                    <Text style={[styles.modalTableHeaderText, styles.col5]}>
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
                      <View style={[styles.modalTableRow]}>
                        <Text
                          style={[styles.modalTableCell, styles.col1]}
                          numberOfLines={2}>
                          {item.salordd_invoice_no}
                        </Text>
                        <Text style={[styles.modalTableCell, styles.col2]}>
                          {item.prod_name}
                        </Text>
                        <Text style={[styles.modalTableCell, styles.col3]}>
                          {item.salordd_partial_qty}
                        </Text>
                        <Text style={[styles.modalTableCell, styles.col4]}>
                          {item.salordd_retail_price}
                        </Text>
                        <Text style={[styles.modalTableCell, styles.col5]}>
                          {Number(item.salordd_sub_total).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    scrollEnabled={false}
                  />
                </View>
              </View>

              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount: </Text>
                  <Text style={styles.totalValue}>
                    {invcDetails?.total ?? 'N/A'}
                  </Text>
                </View>
                <View style={[styles.totalRow, styles.pendingTotalRow]}>
                  <Text style={[styles.totalLabel, styles.pendingLabel]}>
                    Pending Amount:
                  </Text>
                  <Text style={[styles.totalValue, styles.pendingValue]}>
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
                    <View style={styles.modalTableHeader}>
                      <Text style={[styles.modalTableHeaderText, styles.col1]}>
                        Invoice#
                      </Text>
                      <Text style={[styles.modalTableHeaderText, styles.col2]}>
                        Product
                      </Text>
                      <Text style={[styles.modalTableHeaderText, styles.col3]}>
                        QTY
                      </Text>
                      <Text style={[styles.modalTableHeaderText, styles.col4]}>
                        Price
                      </Text>
                      <Text style={[styles.modalTableHeaderText, styles.col5]}>
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
                        <View style={[styles.modalTableRow]}>
                          <Text
                            style={[styles.modalTableCell, styles.col1]}
                            numberOfLines={2}>
                            {item.sald_invoice_no}
                          </Text>
                          <Text style={[styles.modalTableCell, styles.col2]}>
                            {item.sald_prod_name}
                          </Text>
                          <Text style={[styles.modalTableCell, styles.col3]}>
                            {item.sald_qty}
                          </Text>
                          <Text style={[styles.modalTableCell, styles.col4]}>
                            {Number(item.sald_retail_price).toLocaleString()}
                          </Text>
                          <Text style={[styles.modalTableCell, styles.col5]}>
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
    paddingTop: 45, // Space for floating filter
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
    marginTop: 4,
  },
  subText: {
    fontSize: 12,
    color: THEME.textGray,
    marginLeft: 4,
  },

  // --- Pagination ---
  paginationContainer: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  pageBtn: {
    padding: 5,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  pageText: {
    color: THEME.white,
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 15,
  },

  // --- Empty State ---
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#9CA3AF',
  },

  // --- Modal Styles (Preserved/Aligned) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10, // slightly squarish
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
  },

  // Invoice & Company Cards
  companyCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  companyAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  companyContact: {
    fontSize: 13,
    color: '#6B7280',
  },

  orderInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginTop: 10,
  },
  infoCard: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalsSection: {
    backgroundColor: THEME.white,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: THEME.textGray,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
  },
  pendingTotalRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  pendingLabel: {
    color: THEME.danger,
  },
  pendingValue: {
    color: THEME.danger,
  },

  // Modal Tables
  tableSection: {
    marginTop: 10, // margin top for spacing
    marginHorizontal: 16, // container margins
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingBottom: 10,
    overflow: 'hidden', // clips corners
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    margin: 12,
  },
  tableContainer: {
    // No extra styling needed if inside section
  },
  modalTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  modalTableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTableCell: {
    fontSize: 11,
    color: '#1F2937',
  },
  col1: {flex: 1.5, textAlign: 'left'},
  col2: {flex: 2, textAlign: 'left', paddingLeft: 4},
  col3: {flex: 1, textAlign: 'center'},
  col4: {flex: 1.5, textAlign: 'right'},
  col5: {flex: 2, textAlign: 'right'},

  // Footer
  modalFooter: {
    marginTop: 10,
    paddingBottom: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  thankYou: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
    marginBottom: 5,
  },
  developerInfo: {
    alignItems: 'center',
  },
  developerText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  footerText: {
    textAlign: 'center',
    padding: 10,
    color: THEME.textGray,
  },
});
