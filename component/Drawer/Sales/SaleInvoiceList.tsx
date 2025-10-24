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
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import DropDownPicker from 'react-native-dropdown-picker';
import backgroundColors from '../../Colors';
import Toast from 'react-native-toast-message';
import RNPrint from 'react-native-print';

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
        user_id: userValue,
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
    fetchUserDropdown();
  }, [startDate, endDate, userValue]);

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
            <Text style={styles.headerTitle}>Invoice List</Text>
          </View>
        </View>

        {/* Date Selection */}
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

        {/* User Filter */}
        <View style={{marginHorizontal: 12, marginVertical: 4}}>
          <DropDownPicker
            items={transformedUsers}
            open={userOpen}
            setOpen={setUserOpen}
            value={userValue}
            setValue={setUserValue}
            placeholder="Select User"
            placeholderStyle={{color: '#666'}}
            textStyle={{color: backgroundColors.dark}}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={18} color={backgroundColors.dark} />
            )}
            ArrowDownIconComponent={() => (
              <Icon
                name="chevron-down"
                size={18}
                color={backgroundColors.dark}
              />
            )}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            searchable
            searchTextInputStyle={{
              borderWidth: 0,
              width: '100%',
            }}
            searchContainerStyle={{
              borderColor: backgroundColors.gray,
            }}
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
                  singleInvc(item.sal_invoice_no);
                  setSelectedInvc(item.sal_invoice_no);
                }}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>{item.sal_invoice_no}</Text>
                    <Text style={styles.subText}>
                      <Icon name="cash-multiple" size={12} color="#666" />{' '}
                      {item.sal_order_total}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="account" size={12} color="#666" />{' '}
                      {item.slcust_name || 'N/A'}
                    </Text>
                  </View>

                  <View style={{alignSelf: 'flex-start'}}>
                    <Text style={[styles.subText, {fontWeight: '700'}]}>
                      <Icon name="calendar" size={12} color="#666" />{' '}
                      {new Date(item.sal_date).toLocaleDateString('en-US', {
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
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              {/* Company Info Card */}
              <View style={styles.companyCard}>
                <View style={styles.companyHeader}>
                  <Text style={styles.companyName}>
                    {invoiceData?.config?.bus_name || 'N/A'}
                  </Text>
                </View>
                <Text style={styles.companyAddress}>
                  {invoiceData?.config?.bus_address || 'N/A'}
                </Text>
                <Text style={styles.companyContact}>
                  {invoiceData?.config?.bus_contact1 || 'Contact: N/A'}
                </Text>
              </View>

              {/* Order Info Grid */}
              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Receipt#:</Text>
                  <Text style={styles.infoValue}>{selectedInvc ?? 'N/A'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Date:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.created_at
                      ? new Date(invoiceData?.sale.created_at)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Maker:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.name ?? 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Customer:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.cust_name ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Contact:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.contact ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.slcust_address ?? 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Order Table Section */}
              <View style={styles.tableSection}>
                <View style={styles.tableContainer}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.col1]}>
                      Item
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col2]}>
                      Qty
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col3]}>
                      UOM
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
                    data={invcSaleDetails}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({item, index}) => (
                      <View style={[styles.tableRow]}>
                        <Text style={[styles.tableCell, styles.col1]}>
                          {item.prod_name}
                        </Text>
                        <Text style={[styles.tableCell, styles.col2]}>
                          {item.sald_qty}
                        </Text>
                        <Text style={[styles.tableCell, styles.col3]}>
                          {item.ums_name}
                        </Text>
                        <Text style={[styles.tableCell, styles.col4]}>
                          {Number(item.sald_fretail_price).toLocaleString()}
                        </Text>
                        <Text style={[styles.tableCell, styles.col5]}>
                          {Number(
                            item.sald_total_fretailprice,
                          ).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    scrollEnabled={false}
                    ListFooterComponent={
                      <View
                        style={{
                          borderTopWidth: 1.5,
                          borderTopColor: backgroundColors.dark,
                          flexDirection: 'row',
                          paddingVertical: 2.5,
                        }}>
                        <Text
                          style={[
                            styles.tableHeaderText,
                            {flex: 0.2, textAlign: 'left'},
                          ]}>
                          Total Items
                        </Text>
                        <Text style={[styles.tableCell, {flex: 0.15}]}>
                          {invcSaleDetails.length}
                        </Text>
                        <Text style={[styles.tableHeaderText, {flex: 0.2}]}>
                          Subtotals
                        </Text>
                        <View style={{flex: 0.2}} />
                        <Text style={[styles.tableCell, {flex: 0.2}]}>
                          {invoiceData?.sale?.sal_order_total}
                        </Text>
                      </View>
                    }
                  />
                </View>
              </View>

              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Total Order:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_order_total ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Discount:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_discount ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Previous Bal.:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.prev_balance ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Payable:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_total_amount ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Paid:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_payment_amount ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Balance:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_change_amount ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Note:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.note ?? 'N/A'}
                  </Text>
                </View>
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

                <TouchableOpacity style={styles.printBtn} onPress={printReceipt}>
                  <Icon
                    name="printer"
                    size={20}
                    color={backgroundColors.light}
                  />
                  <Text style={styles.printBtnText}>Print</Text>
                </TouchableOpacity>
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
    color: backgroundColors.light,
    fontWeight: '600',
    fontSize: 14,
  },
  pageButtonTextDisabled: {
    color: backgroundColors.dark,
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
    marginBottom: 5,
  },
  dateInputWrapper: {
    flex: 0.48,
  },
  dateLabel: {
    fontSize: 14,
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
    borderWidth: 1.5,
    borderColor: backgroundColors.gray,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    height: 48,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
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
    borderTopColor: '#F0F0F0',
  },
  thankYou: {
    fontSize: 16,
    color: backgroundColors.primary,
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
    color: backgroundColors.dark,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
  },
  printBtn: {
    backgroundColor: backgroundColors.primary,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignSelf: 'center',
    gap: 5,
    marginVertical: 5,
    borderRadius: 10,
  },
  printBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    textAlign: 'left',
  },
  col2: {
    flex: 0.15, // Product
  },
  col3: {
    flex: 0.22, // Qty
  },
  col4: {
    flex: 0.18, // Price
  },
  col5: {
    flex: 0.2, // Total
  },

  // ================= NEW CHECKOUT MODAL STYLES =================
  checkoutModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 8,
    backgroundColor: backgroundColors.light,
  },
  checkoutModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: backgroundColors.dark,
    textAlign: 'center',
    flex: 1,
    marginRight: 24, // Adjust for the back button
  },
  checkoutScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  checkoutSection: {
    marginBottom: 5,
  },
  checkoutSectionTitle: {
    fontSize: 14,
    color: backgroundColors.dark,
    marginBottom: 8,
    fontWeight: '500',
  },
  checkoutCard: {
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: backgroundColors.dark,
  },
  supplierPhone: {
    fontSize: 14,
    color: 'gray',
  },
  amountContainer: {
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutFooter: {
    padding: 20,
    backgroundColor: backgroundColors.light,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  completePurchaseBtn: {
    backgroundColor: backgroundColors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  completePurchaseBtnText: {
    color: backgroundColors.light,
    fontSize: 18,
    fontWeight: 'bold',
  },
  personIcon: {
    position: 'absolute',
    zIndex: 10000,
    top: 7,
    left: 6,
  },

  // Dropdown
  dropdown: {
    backgroundColor: backgroundColors.light,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
    marginBottom: 4,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    maxHeight: 200,
  },
});
