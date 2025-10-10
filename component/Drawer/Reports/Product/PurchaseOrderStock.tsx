import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
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
import backgroundColors from '../../../Colors';
import LinearGradient from 'react-native-linear-gradient';

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

export default function PurchaseOrderStock() {
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
    let total = 0;

    completedList.forEach(data => {
      const returnAmount = parseFloat(data.pord_order_total) || 0;

      total += returnAmount;
    });

    return {
      total: total.toFixed(2),
    };
  };

  const totals = calculateOrderTotal();

  useEffect(() => {
    fetchCompletedList();
  }, [statusVal, endDate, startDate, selectionMode]);

  useEffect(() => {
    setCurrentPage(1); // Reset pagination when selection mode or filters change
  }, [selectionMode, statusVal]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[backgroundColors.primary, backgroundColors.secondary]}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Purchase Order Report</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} onPress={handlePrint}>
            <Icon name="printer" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterContainer}>
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
                color="#144272"
                uncheckedColor="#666"
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
                color="#144272"
                uncheckedColor="#666"
              />
              <Text style={styles.radioText}>Purchase Order Details</Text>
            </TouchableOpacity>
          </View>

          {/* Dropdown */}
          <DropDownPicker
            items={
              selectionMode === 'purchaseOrder' ? categoryItems : detailOrder
            }
            open={open}
            setOpen={setOpen}
            value={statusVal}
            setValue={setStatusVal}
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
            listMode="MODAL"
          />

          {/* Date Pickers */}
          <View style={styles.dateContainer}>
            <View style={styles.datePicker}>
              <Text style={styles.dateLabel}>From:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}>
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString()}
                </Text>
                <Icon name="calendar" size={18} color="#144272" />
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

            <View style={styles.datePicker}>
              <Text style={styles.dateLabel}>To:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}>
                <Text style={styles.dateText}>
                  {endDate.toLocaleDateString()}
                </Text>
                <Icon name="calendar" size={18} color="#144272" />
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
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total: </Text>
            <Text style={styles.summaryValue}>{totals.total}</Text>
          </View>
        </View>

        {/* Order List */}
        <View style={styles.listContainer}>
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) =>
              selectionMode === 'purchaseOrder' ? (
                <View style={styles.card}>
                  {/* Header Row */}
                  <View style={styles.row}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {item.sup_name?.charAt(0) || 'S'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.name}>{item.sup_name}</Text>
                      <Text style={styles.subText}>
                        <Icon name="file-document" size={12} color="#666" />{' '}
                        Invoice: {item.pord_invoice_no}
                      </Text>
                      <Text style={styles.subText}>
                        <Icon name="currency-usd" size={12} color="#666" />{' '}
                        Total: {item.pord_order_total}
                      </Text>
                      <Text style={styles.subText}>
                        <Icon name="calendar" size={12} color="#666" />{' '}
                        {new Date(item.pord_order_date).toLocaleDateString(
                          'en-US',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          },
                        )}
                      </Text>
                      {statusVal !== '' && (
                        <Text style={styles.subText}>
                          <Icon
                            name="information-outline"
                            size={12}
                            color="#666"
                          />{' '}
                          {statusVal === 'Pending' ? 'Pending' : 'Completed'}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.card}>
                  {/* Header Row */}
                  <View style={styles.row}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {item.pordd_prod_name?.charAt(0) || 'P'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.name}>{item.pordd_prod_name}</Text>
                      <Text style={styles.subText}>
                        <Icon name="file-document" size={12} color="#666" />{' '}
                        Invoice: {item.pordd_invoice_no}
                      </Text>
                      <Text style={styles.subText}>
                        <Icon name="calendar" size={12} color="#666" />{' '}
                        {new Date(item.pord_order_date).toLocaleDateString(
                          'en-US',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          },
                        )}
                      </Text>
                      <Text style={styles.subText}>
                        <Icon name="cube-outline" size={12} color="#666" /> Qty:{' '}
                        {item.pordd_partial_qty}
                      </Text>
                      <Text style={styles.subText}>
                        <Icon name="percent" size={12} color="#666" /> Rate:{' '}
                        {item.pordd_cost_price}
                      </Text>
                      <Text style={styles.subText}>
                        <Icon name="cash-multiple" size={12} color="#666" />{' '}
                        Value: {item.pordd_total_cost}
                      </Text>
                      {statusVal !== '' && (
                        <Text style={styles.subText}>
                          <Icon
                            name="information-outline"
                            size={12}
                            color="#666"
                          />{' '}
                          {statusVal === 'Purchase Ordered'
                            ? 'Purchase Ordered'
                            : statusVal === 'Purchased'
                            ? 'Purchased'
                            : statusVal === 'Purchase Order'
                            ? 'Pending'
                            : ''}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              )
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="clipboard-list-outline" size={48} color="#666" />
                <Text style={styles.emptyText}>No purchase orders found.</Text>
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
              <Text style={styles.totalText}>Total: {totalRecords} orders</Text>
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
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientBackground: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
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

  // Filter Container
  filterContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
    zIndex: 1000,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: '#144272',
    marginLeft: -5,
    fontWeight: '500',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#144272',
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  dropDownContainer: {
    backgroundColor: '#fff',
    borderColor: '#144272',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePicker: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    color: '#144272',
    fontWeight: '600',
    marginBottom: 5,
    fontSize: 14,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  dateText: {
    color: '#144272',
    fontSize: 14,
    fontWeight: '500',
  },

  // Summary Container
  summaryContainer: {
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
  },
  innerSummaryCtx: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    color: '#144272',
    fontWeight: 'bold',
  },

  // FlatList Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
    paddingVertical: '75%',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginTop: 8,
    width: '96%',
    alignSelf: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Pagination Styling
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
    backgroundColor: backgroundColors.secondary,
    paddingVertical: 8,
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
    alignItems: 'center',
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
});