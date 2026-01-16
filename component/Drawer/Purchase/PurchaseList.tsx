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
  BackHandler,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../BottomBar';

const {width} = Dimensions.get('window');

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
  error: '#EF4444',
  warning: '#F59E0B',
  shadow: '#000',
};

interface PurchaseList {
  prch_invoice_no: string;
  prch_date: string;
  prch_order_total: string;
  prch_paid_amount: string;
  prch_balance: string;
  sup_name: string;
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
  prch_trans_id: string;
}

interface Transporter {
  id: number;
  trans_name: string;
}

export default function PurchaseList({navigation}: any) {
  const {openDrawer} = useDrawer();
  const [purchaseList, setPurchaseList] = useState<PurchaseList[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [invcData, setInvcData] = useState<InvoiceData | null>(null);
  const [invcDetails, setInvcDetails] = useState<InvoicePurchaseDetails[]>([]);
  const [trans, setTrans] = useState<Transporter[]>([]);

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

  // Fetch Transporter
  const fetchTransporters = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchTransportersdata`);
      setTrans(res.data.transporter);
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
    fetchTransporters();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [startDate, endDate]);

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
            <Text style={styles.headerTitle}>Purchase List</Text>
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
          <Text style={styles.tableHeaderLabel}>PURCHASE LIST</Text>
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
                fetchIncv(item.prch_invoice_no);
              }}>
              {/* Icon Section */}
              <View style={styles.avatarContainer}>
                <Icon
                  name="file-document-outline"
                  size={24}
                  color={THEME.primary}
                />
              </View>

              {/* Info Section */}
              <View style={styles.infoContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.nameText}>{item.prch_invoice_no}</Text>
                  <Text style={styles.amountText}>{item.prch_order_total}</Text>
                </View>

                <View style={styles.iconTextRow}>
                  <Icon name="domain" size={14} color={THEME.textGray} />
                  <Text style={styles.subText} numberOfLines={1}>
                    {item.sup_name || 'N/A'}
                  </Text>
                </View>

                <View style={styles.iconTextRow}>
                  <Icon
                    name="calendar-month"
                    size={14}
                    color={THEME.textGray}
                  />
                  <Text style={styles.subText}>
                    {new Date(item.prch_date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 4,
                  }}>
                  <Text style={[styles.subText, {color: THEME.success}]}>
                    Paid: {item.prch_paid_amount}
                  </Text>
                  <Text
                    style={[
                      styles.subText,
                      {
                        color:
                          parseFloat(item.prch_balance) > 0
                            ? THEME.danger
                            : THEME.success,
                        fontWeight: '700',
                        textAlign: 'right',
                      },
                    ]}>
                    Bal: {item.prch_balance}
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
              <Text style={styles.emptyText}>No purchase records found</Text>
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
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconContainer}>
                  <Icon name="receipt" size={24} color={THEME.primary} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Purchase Invoice</Text>
                  <Text style={styles.modalSubtitle}>Transaction Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setInvcData(null);
                  setInvcDetails([]);
                }}
                style={styles.closeButton}>
                <Icon name="close" size={20} color={THEME.textGray} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              {/* Company Info */}
              <View style={styles.invoiceSection}>
                <Text style={styles.companyName}>
                  {invcData?.config?.bus_name || 'N/A'}
                </Text>
                <Text style={styles.companyDetails}>
                  {invcData?.config?.bus_address || 'N/A'}
                </Text>
                <Text style={styles.companyDetails}>
                  {invcData?.config?.bus_contact1 || 'Contact: N/A'}
                </Text>
              </View>

              {/* Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Invoice #</Text>
                  <Text style={styles.detailValue}>
                    {invcData?.purchasedata?.prch_invoice_no ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>
                    {invcData?.purchasedata?.prch_date
                      ? new Date(
                          invcData.purchasedata.prch_date,
                        ).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Supplier</Text>
                  <Text style={styles.detailValue}>
                    {invcDetails[0]?.sup_name ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Company</Text>
                  <Text style={styles.detailValue}>
                    {invcDetails[0]?.sup_company_name ?? 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Items Table */}
              <View style={styles.itemsTableContainer}>
                <Text style={styles.sectionHeader}>Items</Text>
                <View style={styles.itemsHeader}>
                  <Text style={[styles.itemsHeaderText, {flex: 2}]}>
                    Product
                  </Text>
                  <Text
                    style={[
                      styles.itemsHeaderText,
                      {flex: 1, textAlign: 'center'},
                    ]}>
                    Qty
                  </Text>
                  <Text
                    style={[
                      styles.itemsHeaderText,
                      {flex: 1, textAlign: 'right'},
                    ]}>
                    Cost
                  </Text>
                  <Text
                    style={[
                      styles.itemsHeaderText,
                      {flex: 1, textAlign: 'right'},
                    ]}>
                    Total
                  </Text>
                </View>

                {invcDetails.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={[styles.itemText, {flex: 2}]}>
                      {item.prchd_prod_name}
                    </Text>
                    <Text
                      style={[styles.itemText, {flex: 1, textAlign: 'center'}]}>
                      {item.prchd_qty}
                    </Text>
                    <Text
                      style={[styles.itemText, {flex: 1, textAlign: 'right'}]}>
                      {item.prchd_cost_price}
                    </Text>
                    <Text
                      style={[styles.itemText, {flex: 1, textAlign: 'right'}]}>
                      {Number(item.prchd_total_cost).toLocaleString()}
                    </Text>
                  </View>
                ))}

                <View style={styles.itemsFooter}>
                  <Text style={styles.itemsFooterLabel}>Total</Text>
                  <Text style={styles.itemsFooterValue}>
                    {invcDetails
                      .reduce(
                        (sum, item) =>
                          sum + parseFloat(item.prchd_total_cost || '0'),
                        0,
                      )
                      .toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Summary Cards */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Order</Text>
                  <Text style={styles.summaryValue}>
                    {invcData?.purchasedata?.prch_order_total ?? '0'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Freight</Text>
                  <Text style={styles.summaryValue}>
                    {parseFloat(
                      invcData?.purchasedata?.prch_freight_charges || '0',
                    ).toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Grand Total</Text>
                  <Text style={styles.totalValue}>
                    {invcData?.purchasedata?.prch_total_purchase ?? '0'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Paid Amount</Text>
                  <Text style={[styles.summaryValue, {color: THEME.primary}]}>
                    {invcData?.purchasedata?.prch_paid_amount ?? '0'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Balance</Text>
                  <Text style={[styles.summaryValue, {color: THEME.error}]}>
                    {invcData?.purchasedata?.prch_balance ?? '0'}
                  </Text>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <Text style={styles.footerText}>
                  Thank you for your business
                </Text>
                <Text style={styles.developerText}>
                  Powered by Technic Mentors
                </Text>
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
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 30,
    paddingBottom: 40, // Extra space for floating search
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
    bottom: -40,
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

  // --- List & Cards ---
  listContainer: {
    flex: 1,
    paddingTop: 35, // Space for floating filter
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
    backgroundColor: '#E0F2F1', // Light shade matches primary
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
    gap: 4,
  },
  subText: {
    fontSize: 12,
    color: THEME.textGray,
    flex: 1,
  },

  // --- Pagination ---
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

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: THEME.textGray,
    fontWeight: '500',
  },

  // Modal
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
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
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: THEME.primaryLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },
  modalSubtitle: {
    fontSize: 13,
    color: THEME.textGray,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
  },

  // Invoice Details
  invoiceSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.white,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 13,
    color: THEME.textGray,
    textAlign: 'center',
  },

  detailsGrid: {
    padding: 20,
    backgroundColor: THEME.white,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: THEME.textGray,
  },
  detailValue: {
    fontSize: 13,
    color: THEME.textDark,
    fontWeight: '600',
  },

  // Items Table
  itemsTableContainer: {
    backgroundColor: THEME.white,
    padding: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 15,
  },
  itemsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  itemsHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textGray,
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemText: {
    fontSize: 13,
    color: THEME.textDark,
  },
  itemsFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  itemsFooterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
  },
  itemsFooterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.primary,
  },

  // Summary
  summaryContainer: {
    backgroundColor: THEME.white,
    padding: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: THEME.textGray,
  },
  summaryValue: {
    fontSize: 14,
    color: THEME.textDark,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
  },

  modalFooter: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
    marginBottom: 4,
  },
  developerText: {
    fontSize: 12,
    color: THEME.textGray,
  },
});
