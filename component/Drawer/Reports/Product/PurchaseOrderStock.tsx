import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BASE_URL from '../../../BASE_URL';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import RNPrint from 'react-native-print';
import {useUser} from '../../../CTX/UserContext';
import {RadioButton} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../../BottomBar';

const {width} = Dimensions.get('window');

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  accent: '#4CAF50',
  background: '#F0F2F5',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  danger: '#EF4444',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
};

interface CompletedList {
  id: number;
  pord_invoice_no: string;
  pord_order_date: string;
  pord_order_total: string;
  pord_status: string;
  sup_name: string;
  pordd_prod_name: string;
  pordd_partial_qty: string;
  pordd_cost_price: string;
  pordd_total_cost: string;
  pordd_invoice_no: string;
}

export default function PurchaseOrderStock({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
  const [open, setOpen] = useState(false);
  const [statusVal, setStatusVal] = useState('');
  const [completedList, setCompletedList] = useState<CompletedList[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = completedList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = completedList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Helper: Get Initials
  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const categoryItems = [
    {label: 'Completed', value: 'Completed'},
    {label: 'Pending', value: 'Pending'},
  ];

  // Details Status Item
  const detailOrder = [
    {label: 'Purchase Ordered', value: 'Purchase Ordered'},
    {label: 'Purchased', value: 'Purchased'},
    {label: 'Pending', value: 'Purchase Order'},
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

  const [selectionMode, setSelectionMode] = useState<
    'purchaseOrder' | 'purchaseOrderDetails' | ''
  >('purchaseOrder');

  // Handle Print
  const handlePrint = async () => {
    if (completedList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    // Get current date
    const dateStr = new Date().toLocaleDateString();

    // Build HTML table rows based on selection mode
    let rows = '';
    let tableHeaders = '';

    if (selectionMode === 'purchaseOrder') {
      // Purchase Order Mode Headers
      tableHeaders = `
      <tr style="background:#f0f0f0;">
        <th style="border:1px solid #000; padding:6px;">Sr#</th>
        <th style="border:1px solid #000; padding:6px;">Invoice No</th>
        <th style="border:1px solid #000; padding:6px;">Supplier Name</th>
        <th style="border:1px solid #000; padding:6px;">Order Total</th>
        <th style="border:1px solid #000; padding:6px;">Status</th>
        <th style="border:1px solid #000; padding:6px;">Order Date</th>
      </tr>
    `;

      // Purchase Order Mode Rows
      rows = completedList
        .map(
          (item, index) => `
      <tr>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
          index + 1
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.pord_invoice_no
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.sup_name
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.pord_order_total
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          statusVal === 'Pending' ? 'Pending' : 'Completed'
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
          item.pord_order_date,
        ).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}</td>
      </tr>`,
        )
        .join('');
    } else {
      // Purchase Order Details Mode Headers
      tableHeaders = `
      <tr style="background:#f0f0f0;">
        <th style="border:1px solid #000; padding:6px;">Sr#</th>
        <th style="border:1px solid #000; padding:6px;">Invoice No</th>
        <th style="border:1px solid #000; padding:6px;">Product Name</th>
        <th style="border:1px solid #000; padding:6px;">Date</th>
        <th style="border:1px solid #000; padding:6px;">Quantity</th>
        <th style="border:1px solid #000; padding:6px;">Booking Rate</th>
        <th style="border:1px solid #000; padding:6px;">Booking Value</th>
        <th style="border:1px solid #000; padding:6px;">Status</th>
      </tr>
    `;

      // Purchase Order Details Mode Rows
      rows = completedList
        .map(
          (item, index) => `
      <tr>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
          index + 1
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.pordd_invoice_no
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.pordd_prod_name
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
          item.pord_order_date,
        ).toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
          item.pordd_partial_qty
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:right;">${
          item.pordd_cost_price
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:right;">${
          item.pordd_total_cost
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          statusVal === 'Purchase Ordered'
            ? 'Purchase Ordered'
            : statusVal === 'Purchased'
            ? 'Purchased'
            : statusVal === 'Purchase Order'
            ? 'Pending'
            : ''
        }</td>
      </tr>`,
        )
        .join('');
    }

    // Determine report title based on selection mode
    const reportTitle =
      selectionMode === 'purchaseOrder'
        ? 'Purchase Order Report'
        : 'Purchase Order Details Report';

    // HTML Template
    const html = `
    <html>
      <head>
          <meta charset="utf-8">
          <title>${reportTitle}</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="font-size:12px;">Date: ${dateStr}</div>
            <div style="text-align:center; flex:1; font-size:16px; font-weight:bold;">Point of Sale System</div>
        </div>
            
        <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:18px; font-weight:bold;">${bussName}</div>
            <div style="font-size:14px;">${bussAddress}</div>
            <div style="font-size:14px; font-weight:bold; text-decoration:underline;">
                ${reportTitle}
            </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="font-size:12px; font-weight: bold;">
            Report Type: ${
              selectionMode === 'purchaseOrder'
                ? 'Purchase Order'
                : 'Purchase Order Details'
            }
          </div>
          <div style="font-size:12px; font-weight: bold;">Status: ${statusVal}</div>
          <div style="display:flex; justify-content:space-between; gap: 20px;">
            <div style="font-size:12px;">
              <span style="font-weight: bold;">From:</span> ${startDate.toLocaleDateString(
                'en-US',
                {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                },
              )}
            </div>
            <div style="font-size:12px;">
              <span style="font-weight: bold;">To:</span> ${endDate.toLocaleDateString(
                'en-US',
                {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                },
              )}
            </div>
          </div>
        </div>
            
        <table style="border-collapse:collapse; width:100%; font-size:12px;">
          <thead>
            ${tableHeaders}
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div style="margin-top:20px; text-align:right; font-size:14px; font-weight:bold;">
          Total: ${totals.total}
        </div>
      </body>
    </html>
  `;

    await RNPrint.print({html});
  };

  // Fetch Completed/Pending List
  const fetchCompletedList = async () => {
    if (statusVal) {
      try {
        const from = startDate.toISOString().split('T')[0];
        const to = endDate.toISOString().split('T')[0];
        const res = await axios.post(`${BASE_URL}/fetch_purchaseorder_report`, {
          from,
          to,
          status: selectionMode === 'purchaseOrder' ? statusVal : '',
          purchaseorder:
            selectionMode === 'purchaseOrder'
              ? 'Purchase Order'
              : 'Purchase Order Detail',
          detailstatus:
            selectionMode === 'purchaseOrder' ? 'Purchase Order' : statusVal,
        });
        setCompletedList(res.data.purchaseorder);

        setCurrentPage(1); // Reset to first page when data changes
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Calculate Data Wise Total Return
  const calculateOrderTotal = () => {
    const total = completedList.reduce((sum, item) => {
      return (
        sum +
        parseFloat(
          selectionMode === 'purchaseOrder'
            ? item.pord_order_total
            : item.pordd_total_cost || '0',
        )
      );
    }, 0);

    return {
      total: total.toFixed(2),
    };
  };

  const totals = calculateOrderTotal();

  useEffect(() => {
    fetchCompletedList();
  }, [statusVal, endDate, startDate, selectionMode]);

  useEffect(() => {
    setCurrentPage(1);

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [selectionMode, statusVal]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Purchase Order Stock</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* --- FILTER SECTION --- */}
      <View style={styles.filterSection}>
        {/* Radio Buttons */}
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => {
              setSelectionMode('purchaseOrder');
              setStatusVal('');
              setCompletedList([]);
            }}>
            <RadioButton
              value="purchaseOrder"
              status={
                selectionMode === 'purchaseOrder' ? 'checked' : 'unchecked'
              }
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>Purchase Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => {
              setSelectionMode('purchaseOrderDetails');
              setStatusVal('');
              setCompletedList([]);
            }}>
            <RadioButton
              value="purchaseOrderDetails"
              status={
                selectionMode === 'purchaseOrderDetails'
                  ? 'checked'
                  : 'unchecked'
              }
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>Purchase Order Details</Text>
          </TouchableOpacity>
        </View>

        {/* Dropdown */}
        <View style={{zIndex: 2000, marginBottom: 10}}>
          <DropDownPicker
            items={
              selectionMode === 'purchaseOrder' ? categoryItems : detailOrder
            }
            open={open}
            setOpen={setOpen}
            value={statusVal}
            setValue={setStatusVal}
            placeholder="Select Status"
            placeholderStyle={{color: THEME.textGray}}
            textStyle={{color: THEME.textDark}}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={18} color={THEME.textDark} />
            )}
            ArrowDownIconComponent={() => (
              <Icon name="chevron-down" size={18} color={THEME.textDark} />
            )}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode="SCROLLVIEW"
            listItemLabelStyle={{
              color: THEME.textDark,
              fontWeight: '500',
            }}
            labelStyle={{
              color: THEME.textDark,
              fontSize: 14,
            }}
          />
        </View>

        {/* Date Row */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartDatePicker(true)}>
            <Icon name="calendar" size={20} color={THEME.primary} />
            <Text style={styles.dateText}>
              {startDate.toLocaleDateString('en-GB')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.dateSeparator}>to</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndDatePicker(true)}>
            <Icon name="calendar" size={20} color={THEME.primary} />
            <Text style={styles.dateText}>
              {endDate.toLocaleDateString('en-GB')}
            </Text>
          </TouchableOpacity>
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
          <Text style={styles.tableHeaderLabel}>ORDER LIST</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={[
                styles.tableHeaderLabel,
                {marginRight: 10, color: THEME.primary},
              ]}>
              Total: {totals.total}
            </Text>
            <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
          </View>
        </View>

        <FlatList
          data={paginatedData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => {
            const isPO = selectionMode === 'purchaseOrder';
            const title = isPO ? item.sup_name : item.pordd_prod_name;
            const subTitle = isPO
              ? item.pord_invoice_no
              : item.pordd_invoice_no;
            const date = item.pord_order_date;
            const status = isPO
              ? statusVal === 'Pending'
                ? 'Pending'
                : 'Completed'
              : statusVal === 'Purchase Order'
              ? 'Pending'
              : statusVal;
            const totalCost = isPO
              ? item.pord_order_total
              : item.pordd_total_cost;
            const qty = isPO ? null : item.pordd_partial_qty;

            return (
              <View style={styles.cardRow}>
                {/* Avatar Section */}
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{getInitials(title)}</Text>
                </View>

                {/* Info Section */}
                <View style={styles.infoContainer}>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {title}
                  </Text>

                  {/* Row 1: Cost | Status */}
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailText}>Total: {totalCost}</Text>
                    </View>
                    <View style={styles.detailSeparator} />
                    <View style={styles.detailItem}>
                      <Text
                        style={[
                          styles.detailText,
                          {
                            color:
                              status === 'Pending' ? '#F59E0B' : THEME.primary,
                            fontWeight: 'bold',
                          },
                        ]}>
                        {status}
                      </Text>
                    </View>
                    {qty && (
                      <>
                        <View style={styles.detailSeparator} />
                        <View style={styles.detailItem}>
                          <Text style={styles.detailText}>Qty: {qty}</Text>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Row 2: Invoice | Date */}
                  <View style={[styles.detailRow, {marginTop: 4}]}>
                    <View style={styles.detailItem}>
                      <Icon name="receipt" size={12} color={THEME.textLight} />
                      <Text style={styles.subText} numberOfLines={1}>
                        {subTitle}
                      </Text>
                    </View>
                    <View style={styles.detailSeparator} />
                    <View style={styles.detailItem}>
                      <Icon name="calendar" size={12} color={THEME.textLight} />
                      <Text style={styles.subText}>
                        {new Date(date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
          contentContainerStyle={{paddingBottom: 160}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Icon name="package-variant" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>No records found.</Text>
            </View>
          }
        />
      </View>

      {/* --- PAGINATION (Bottom Floating) --- */}
      {totalRecords > 0 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={[styles.pageBtn, currentPage === 1 && styles.disabledBtn]}>
            <Icon name="chevron-left" size={24} color={THEME.white} />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() =>
              setCurrentPage(prev => Math.min(prev + 1, totalPages))
            }
            style={[
              styles.pageBtn,
              currentPage === totalPages && styles.disabledBtn,
            ]}>
            <Icon name="chevron-right" size={24} color={THEME.white} />
          </TouchableOpacity>
        </View>
      )}
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- HEADER ---
  headerWrapper: {
    zIndex: 999,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 90,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: THEME.primary,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
  },

  // --- FILTER SECTION ---
  filterSection: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginTop: -70,
    marginHorizontal: 16,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    zIndex: 1000,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: THEME.textDark,
    marginLeft: 5,
    fontWeight: '500',
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: THEME.white,
    borderColor: THEME.border,
    borderRadius: 8,
    minHeight: 45,
  },
  dropDownContainer: {
    borderColor: THEME.border,
    backgroundColor: THEME.white,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.white,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateText: {
    fontSize: 14,
    color: THEME.textDark,
    marginLeft: 8,
    fontWeight: '600',
  },
  dateSeparator: {
    marginHorizontal: 10,
    color: THEME.textGray,
    fontWeight: '600',
    fontSize: 14,
  },

  // --- LIST & CARDS ---
  listContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 15,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  tableHeaderLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textGray,
    letterSpacing: 1,
  },
  tableHeaderCount: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '700',
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(42, 101, 43, 0.1)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailSeparator: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  detailText: {
    fontSize: 12,
    color: THEME.textGray,
    fontWeight: '500',
  },
  subText: {
    fontSize: 12,
    color: THEME.textGray,
    marginLeft: 3,
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    color: THEME.textGray,
    fontSize: 16,
  },

  // --- PAGINATION ---
  paginationContainer: {
    position: 'absolute',
    bottom: 100,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.3,
  },
  pageText: {
    color: THEME.white,
    fontWeight: '700',
    marginHorizontal: 15,
    fontSize: 14,
  },
});
