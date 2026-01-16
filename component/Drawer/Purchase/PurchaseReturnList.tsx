import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  BackHandler,
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
import RNPrint from 'react-native-print';
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

interface PurchaseReturn {
  prchr_return_invoice_no: string;
  prchr_return_amount: string;
  created_at: string;
  prchr_prch_invoice: string;
}

interface ReturnData {
  config: {
    bus_name: string;
    bus_address: string;
    bus_contact1: string;
  };
  returndata: {
    prchr_return_invoice_no: string;
    prchr_return_date: string;
    prchr_return_amount: string;
    sup_name: string;
    sup_company_name: string;
  };
}

interface ReturnDetails {
  id: number;
  prchrd_prod_name: string;
  prchrd_return_qty: string;
  prchrd_price: string;
  prchrd_total_price: string;
  sup_name: string;
  sup_contact: string;
  sup_company_name: string;
  sup_address: string;
  created_at: string;
}

export default function PurchaseReturnList({navigation}: any) {
  const {openDrawer} = useDrawer();
  const [purchaseReturnList, setPurchaseReturnList] = useState<
    PurchaseReturn[]
  >([]);
  const [modalVisible, setModalVisible] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [returnData, setReturnData] = useState<ReturnData | null>(null);
  const [returnDetails, setReturnDetails] = useState<ReturnDetails[]>([]);
  const [selectedInvc, setSelectedInvc] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = purchaseReturnList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = purchaseReturnList.slice(
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

  // Fetch Purchase Return List
  const fetchOrders = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/getpurchasereturnlist`, {
        from,
        to,
      });
      // The API returns inv_data
      setPurchaseReturnList(res.data.inv_data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Return Details
  const fetchReturnDetails = async (invoiceNo: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/purchasereturndetail`, {
        invoice: invoiceNo,
      });

      setReturnData(res.data);
      setReturnDetails(res.data.return_detail);
      setSelectedInvc(invoiceNo);
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
  }, [startDate, endDate]);

  const calculateTotal = () => {
    if (!returnDetails || returnDetails.length === 0) return 0;
    return returnDetails.reduce((total, item) => {
      const itemTotal = parseFloat(item.prchrd_total_price) || 0;
      return total + itemTotal;
    }, 0);
  };

  const calculateTotalQty = () => {
    if (!returnDetails || returnDetails.length === 0) return 0;
    return returnDetails.reduce((qty, item) => {
      return qty + (parseFloat(item.prchrd_return_qty) || 0);
    }, 0);
  };

  const printReceipt = async () => {
    if (!returnData || returnDetails.length === 0) return;

    const totalQty = calculateTotalQty();
    const totalAmount = calculateTotal();

    const html = `
      <html>
      <head>
        <style>
          body { font-family: Helvetica, Arial, sans-serif; padding: 20px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 20px; font-size: 14px; }
          .title-section { margin-bottom: 20px; }
          .invoice-no { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
          .title { font-size: 16px; font-weight: bold; text-decoration: underline; }
          .date-section { text-align: right; margin-bottom: 15px; }
          .supplier-section { margin-bottom: 20px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { text-align: left; border-bottom: 1px solid #ddd; padding: 8px; font-weight: bold; background-color: #f8f8f8; }
          td { padding: 8px; border-bottom: 1px solid #eee; }
          .text-right { text-align: right; }
          .footer { text-align: right; font-size: 14px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">Point of Sale System</div>
        
        <div class="title-section">
          <div class="invoice-no">${selectedInvc}</div>
          <div class="title">Purchase Return Detail</div>
        </div>

        <div class="date-section">
          Date: ${new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>

        <div class="supplier-section">
          <div>Supplier: ${returnDetails[0]?.sup_name || 'N/A'}</div>
          <div>Company Name: ${
            returnDetails[0]?.sup_company_name || 'N/A'
          }</div>
          <div>Contact: ${returnDetails[0]?.sup_contact || 'N/A'}</div>
          <div>Address: ${returnDetails[0]?.sup_address || 'N/A'}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 10%;">Sr.#</th>
              <th style="width: 35%;">Product Name</th>
              <th style="width: 15%;">Return Qty</th>
              <th class="text-right" style="width: 20%;">Price</th>
              <th class="text-right" style="width: 20%;">Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${returnDetails
              .map(
                (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.prchrd_prod_name}</td>
                <td>${item.prchrd_return_qty}</td>
                <td class="text-right">${parseFloat(item.prchrd_price).toFixed(
                  2,
                )}</td>
                <td class="text-right">${parseFloat(
                  item.prchrd_total_price,
                ).toFixed(2)}</td>
              </tr>
            `,
              )
              .join('')}
            <tr>
              <td colspan="2" style="font-weight: bold;">Total Qty</td>
              <td style="font-weight: bold;">${totalQty}</td>
              <td></td>
              <td class="text-right" style="font-weight: bold;">${totalAmount.toFixed(
                2,
              )}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          Return Total : ${totalAmount.toFixed(2)}
        </div>
      </body>
      </html>
    `;

    try {
      await RNPrint.print({html});
    } catch (error) {
      console.error(error);
    }
  };

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
            <Text style={styles.headerTitle}>Purchase Return List</Text>
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
          value={startDate}
          mode="date"
          display="default"
          onChange={onStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={onEndDateChange}
        />
      )}

      {/* --- CONTENT LIST --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>RETURN LIST</Text>
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
                fetchReturnDetails(item.prchr_return_invoice_no);
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
                  <Text style={styles.nameText}>
                    {item.prchr_return_invoice_no}
                  </Text>
                  <Text style={styles.amountText}>
                    {item.prchr_return_amount}
                  </Text>
                </View>

                <View style={styles.iconTextRow}>
                  <Icon
                    name="calendar-month"
                    size={14}
                    color={THEME.textGray}
                  />
                  <Text style={styles.subText}>
                    {new Date(item.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <View style={[styles.iconTextRow, {marginTop: 4}]}>
                  <Text style={[styles.subText, {fontSize: 11}]}>
                    Purchase Invoice#: {item.prchr_prch_invoice || 'N/A'}
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
              <Text style={styles.emptyText}>No return records found</Text>
            </View>
          }
        />
      </View>
      <BottomBar />

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
                  <Text style={styles.modalTitle}>Return Invoice</Text>
                  <Text style={styles.modalSubtitle}>Transaction Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setReturnData(null);
                  setReturnDetails([]);
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
                  {returnData?.config?.bus_name || 'N/A'}
                </Text>
                <Text style={styles.companyDetails}>
                  {returnData?.config?.bus_address || 'N/A'}
                </Text>
                <Text style={styles.companyDetails}>
                  {returnData?.config?.bus_contact1 || 'Contact: N/A'}
                </Text>
              </View>

              {/* Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Invoice #</Text>
                  <Text style={styles.detailValue}>
                    {selectedInvc || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>
                    {returnDetails[0]?.created_at
                      ? new Date(
                          returnDetails[0].created_at,
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
                    {returnDetails[0]?.sup_name || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Company</Text>
                  <Text style={styles.detailValue}>
                    {returnDetails[0]?.sup_company_name || 'N/A'}
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
                    Total
                  </Text>
                </View>

                {returnDetails.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={[styles.itemText, {flex: 2}]}>
                      {item.prchrd_prod_name}
                    </Text>
                    <Text
                      style={[styles.itemText, {flex: 1, textAlign: 'center'}]}>
                      {item.prchrd_return_qty}
                    </Text>
                    <Text
                      style={[styles.itemText, {flex: 1, textAlign: 'right'}]}>
                      {parseFloat(item.prchrd_total_price).toLocaleString()}
                    </Text>
                  </View>
                ))}

                <View style={styles.itemsFooter}>
                  <Text style={styles.itemsFooterLabel}>Total Return</Text>
                  <Text style={styles.itemsFooterValue}>
                    {calculateTotal().toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={printReceipt}
                  style={styles.printButton}>
                  <Icon name="printer" size={16} color={THEME.white} />
                  <Text style={styles.printButtonText}>Print Details</Text>
                </TouchableOpacity>

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
    paddingBottom: 40,
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
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: THEME.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  modalSubtitle: {
    fontSize: 12,
    color: THEME.textGray,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  invoiceSection: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: THEME.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  companyName: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  companyDetails: {
    fontSize: 13,
    color: THEME.textGray,
    marginBottom: 2,
    textAlign: 'center',
    lineHeight: 18,
  },
  detailsGrid: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  detailLabel: {
    fontSize: 13,
    color: THEME.textGray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: THEME.textDark,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  itemsTableContainer: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textGray,
    padding: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemsHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textGray,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  itemText: {
    fontSize: 13,
    color: THEME.textDark,
  },
  itemsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  itemsFooterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
  },
  itemsFooterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.primary,
  },
  modalFooter: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 10,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 16,
    gap: 8,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  printButtonText: {
    color: THEME.white,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 12,
    color: THEME.textDark,
    fontWeight: '600',
    marginBottom: 4,
  },
  developerText: {
    fontSize: 11,
    color: THEME.textGray,
  },
});
