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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import backgroundColors from '../../Colors';
import Toast from 'react-native-toast-message';
import RNPrint from 'react-native-print';
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

export default function SaleInvoiceList({navigation}: any) {
  const {openDrawer} = useDrawer();
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

  const generateReceiptHTML = () => {
    if (!invoiceData) return '';

    const itemsHTML = invcSaleDetails
      .map(
        item => `
    <tr>
      <td style="padding: 8px 4px; font-size: 13px;">${item.prod_name}</td>
      <td style="padding: 8px 4px; text-align: center; font-size: 13px;">${
        item.sald_qty
      }</td>
      <td style="padding: 8px 4px; text-align: center; font-size: 13px;">${
        item.ums_name
      }</td>
      <td style="padding: 8px 4px; text-align: right; font-size: 13px;">${parseFloat(
        item.sald_fretail_price,
      ).toFixed(2)}</td>
      <td style="padding: 8px 4px; text-align: right; font-size: 13px;">${parseFloat(
        item.sald_total_fretailprice,
      ).toFixed(2)}</td>
    </tr>
  `,
      )
      .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt ${selectedInvc}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          font-size: 14px; 
          margin: 0; 
          padding: 20px; 
          max-width: 400px;
          margin: 0 auto;
        }
        .header { 
          text-align: center; 
          margin-bottom: 20px; 
          padding-bottom: 15px;
          border-bottom: 2px dashed #000;
        }
        .shop-name { 
          font-weight: bold; 
          font-size: 24px;
          margin-bottom: 8px;
        }
        .shop-address { 
          font-size: 14px;
          margin: 5px 0;
        }
        .shop-phone { 
          font-size: 14px;
          margin: 5px 0;
        }
        .divider {
          border-bottom: 2px dashed #000;
          margin: 15px 0;
        }
        .receipt-info { 
          display: flex; 
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 13px;
        }
        .customer-details { 
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 2px dashed #000;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 13px;
        }
        .detail-label {
          font-weight: 600;
        }
        table { 
          width: 100%; 
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th { 
          text-align: center;
          padding: 8px 4px;
          border-bottom: 2px dashed #000;
          font-size: 13px;
          font-weight: 600;
        }
        th:first-child,
        td:first-child {
          text-align: left;
        }
        th:last-child,
        td:last-child {
          text-align: right;
        }
        .table-footer {
          border-top: 2px dashed #000;
          padding-top: 10px;
        }
        .summary { 
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px dashed #000;
        }
        .summary-row { 
          display: flex; 
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .summary-label {
          font-weight: 400;
        }
        .summary-value {
          text-align: right;
        }
        .total-row { 
          border-top: 2px solid #000;
          padding-top: 8px;
          margin-top: 8px;
          font-weight: bold;
          font-size: 14px;
        }
        .footer { 
          text-align: center;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px dashed #000;
        }
        .thank-you { 
          text-align: center;
          margin: 20px 0 15px 0;
          font-weight: bold;
          font-size: 16px;
        }
        .developer-info {
          font-size: 12px;
          text-align: center;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="shop-name">${invoiceData.config.bus_name}</div>
        <div class="shop-address">${invoiceData.config.bus_address}</div>
        <div class="shop-phone">${invoiceData.config.bus_contact1}</div>
      </div>
      
      <div class="receipt-info">
        <span><strong>Receipt#:</strong> ${selectedInvc}</span>
      </div>
      <div class="receipt-info">
        <span><strong>Date:</strong> ${new Date(
          invoiceData.sale.created_at,
        ).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}</span>
      </div>
      <div class="receipt-info">
        <span><strong>Maker:</strong> ${invoiceData.sale.name}</span>
      </div>
      
      <div class="divider"></div>
      
      <div class="customer-details">
        <div class="detail-row">
          <span class="detail-label">Customer:</span>
          <span>${invoiceData.sale.cust_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Contact#:</span>
          <span>${invoiceData.sale.contact || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Address:</span>
          <span>${invoiceData.sale.slcust_address || 'NILL'}</span>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>UOM</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
      
      <div class="table-footer">
        <div class="summary-row">
          <span class="summary-label"><strong>Total Items</strong></span>
          <span class="summary-value">${invcSaleDetails.length}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label"></span>
          <span class="summary-value"><strong>Subtotal ${
            invoiceData.sale.sal_order_total
          }</strong></span>
        </div>
      </div>
      
      <div class="summary">
        <div class="summary-row">
          <span class="summary-label">Order Total:</span>
          <span class="summary-value">${invoiceData.sale.sal_order_total}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Discount:</span>
          <span class="summary-value">${invoiceData.sale.sal_discount}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Previous Balance:</span>
          <span class="summary-value">${invoiceData.prev_balance}</span>
        </div>
        <div class="summary-row total-row">
          <span class="summary-label">Payable:</span>
          <span class="summary-value">${
            invoiceData.sale.sal_total_amount
          }</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Paid:</span>
          <span class="summary-value">${
            invoiceData.sale.sal_payment_amount
          }</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Balance:</span>
          <span class="summary-value">${
            invoiceData.sale.sal_change_amount
          }</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Note:</span>
          <span class="summary-value">${invoiceData.sale.note || 'NILL'}</span>
        </div>
      </div>
      
      <div class="footer">
        <div class="thank-you">Software Developed</div>
        <div class="developer-info">
          <div>with love by</div>
          <div style="margin-top: 5px;"><strong>Technic Mentors</strong></div>
        </div>
      </div>
    </body>
    </html>
  `;
  };

  // Print Receipt
  const printReceipt = async () => {
    try {
      // Generate HTML content for the receipt
      const htmlContent = generateReceiptHTML();

      // Print the receipt
      await RNPrint.print({
        html: htmlContent,
      });

      Toast.show({
        type: 'success',
        text1: 'Receipt printed successfully',
      });
    } catch (error) {
      console.error('Failed to print receipt:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to print receipt',
      });
    }
  };

  useEffect(() => {
    fetchinvcLisr();

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
            <Text style={styles.headerTitle}>Sale Invoice List</Text>
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

      {/* Table Header */}
      {/* --- CONTENT LIST --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>INVOICE LIST</Text>
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
                singleInvc(item.sal_invoice_no);
                setSelectedInvc(item.sal_invoice_no);
              }}>
              {/* Icon Section */}
              <View style={styles.avatarContainer}>
                <Icon name="receipt" size={24} color={THEME.primary} />
              </View>

              {/* Info Section */}
              <View style={styles.infoContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.nameText}>{item.sal_invoice_no}</Text>
                  <Text style={styles.amountText}>{item.sal_order_total}</Text>
                </View>

                <View style={[styles.iconTextRow, {marginTop: 6}]}>
                  <Icon name="account" size={14} color={THEME.textGray} />
                  <Text style={styles.subText} numberOfLines={1}>
                    {item.slcust_name || 'N/A'}
                  </Text>
                </View>

                <View style={styles.iconTextRow}>
                  <Icon
                    name="calendar-month"
                    size={14}
                    color={THEME.textGray}
                  />
                  <Text style={styles.subText}>
                    {new Date(item.sal_date).toLocaleDateString('en-GB', {
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
              <Text style={styles.emptyText}>No invoices found</Text>
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
                  <Text style={styles.modalTitle}>Sale Invoice</Text>
                  <Text style={styles.modalSubtitle}>Invoice Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setInvoiceData(null);
                  setInvcSaleDetails([]);
                  setSelectedInvc('');
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
                  {invoiceData?.config?.bus_name || 'N/A'}
                </Text>
                <Text style={styles.companyDetails}>
                  {invoiceData?.config?.bus_address || 'N/A'}
                </Text>
                <Text style={styles.companyDetails}>
                  {invoiceData?.config?.bus_contact1 || 'Contact: N/A'}
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
                    {invoiceData?.sale.created_at
                      ? new Date(
                          invoiceData.sale.created_at,
                        ).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Customer</Text>
                  <Text style={styles.detailValue}>
                    {invoiceData?.sale?.cust_name || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Contact</Text>
                  <Text style={styles.detailValue}>
                    {invoiceData?.sale?.contact || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Maker</Text>
                  <Text style={styles.detailValue}>
                    {invoiceData?.sale?.name || 'N/A'}
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

                {invcSaleDetails.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={[styles.itemText, {flex: 2}]}>
                      {item.prod_name}
                    </Text>
                    <Text
                      style={[styles.itemText, {flex: 1, textAlign: 'center'}]}>
                      {item.sald_qty}
                    </Text>
                    <Text
                      style={[styles.itemText, {flex: 1, textAlign: 'right'}]}>
                      {parseFloat(
                        item.sald_total_fretailprice,
                      ).toLocaleString()}
                    </Text>
                  </View>
                ))}

                <View style={styles.itemsFooter}>
                  <Text style={styles.itemsFooterLabel}>Total Amount</Text>
                  <Text style={styles.itemsFooterValue}>
                    {invoiceData?.sale?.sal_order_total || '0'}
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
  // Re-adding col styles that might be used in the table section
  col1: {flex: 2},
  col2: {flex: 0.7, textAlign: 'center'},
  col3: {flex: 0.8, textAlign: 'center'},
  col4: {flex: 1, textAlign: 'right'},
  col5: {flex: 1.3, textAlign: 'right'},

  // Summary Container Styles (New)
  summaryContainer: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: THEME.textGray,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.primary,
  },
});
