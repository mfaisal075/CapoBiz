import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
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
    setCurrentPage(1); // Reset pagination when selection mode or filters change
  }, [selectionMode, statusVal]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Purchase Order Stock</Text>
          </View>

          <TouchableOpacity style={[styles.headerBtn]} onPress={handlePrint}>
            <Icon name="printer" size={24} color="#fff" />
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
                color={backgroundColors.primary}
                uncheckedColor={backgroundColors.dark}
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
                color={backgroundColors.primary}
                uncheckedColor={backgroundColors.dark}
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
            listMode="SCROLLVIEW"
            listItemLabelStyle={{
              color: backgroundColors.dark,
              fontWeight: '500',
            }}
            labelStyle={{
              color: backgroundColors.dark,
              fontSize: 16,
            }}
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
                <Icon name="calendar" size={18} color={backgroundColors.dark} />
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
                <Icon name="calendar" size={18} color={backgroundColors.dark} />
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
            <Text style={styles.summaryLabel}>Net Value: </Text>
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
                  {/* Avatar + Name + Actions */}
                  <View style={styles.row}>
                    <View style={styles.avatarBox}>
                      <Image
                        source={require('../../../../assets/product.png')}
                        style={styles.avatar}
                      />
                    </View>

                    <View style={{flex: 1}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.name}>{item.sup_name}</Text>
                        <View style={styles.catBadge}>
                          <Text style={styles.badgeText}>{statusVal}</Text>
                        </View>
                      </View>
                      {/* small details inline */}
                      <Text style={styles.subText}>
                        <Text style={styles.label}>Invoice: </Text>
                        {item.pord_invoice_no} |{' '}
                        <Text style={styles.label}>Total: </Text>
                        {item.pord_order_total}
                      </Text>
                      <Text style={styles.subText}>
                        <Text style={styles.label}>Date: </Text>
                        {new Date(item.pord_order_date)
                          .toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.card}>
                  {/* Avatar + Name + Actions */}
                  <View style={styles.row}>
                    <View style={styles.avatarBox}>
                      <Image
                        source={require('../../../../assets/product.png')}
                        style={styles.avatar}
                      />
                    </View>

                    <View style={{flex: 1}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.name}>{item.pordd_prod_name}</Text>
                        <View style={styles.catBadge}>
                          <Text style={styles.badgeText}>
                            {statusVal === 'Purchase Order'
                              ? 'Pending'
                              : statusVal}
                          </Text>
                        </View>
                      </View>
                      {/* small details inline */}
                      <Text style={styles.subText}>
                        <Text style={styles.label}>Invoice: </Text>
                        {item.pordd_invoice_no} |{' '}
                        <Text style={styles.label}>QTY: </Text>
                        {item.pordd_partial_qty}
                      </Text>
                      <Text style={styles.subText}>
                        <Text style={styles.label}>Booking Rate: </Text>
                        {item.pordd_cost_price} |{' '}
                        <Text style={styles.label}>Booking Value: </Text>
                        {item.pordd_total_cost}
                      </Text>
                      <Text style={styles.subText}>
                        <Text style={styles.label}>Date: </Text>
                        {new Date(item.pord_order_date)
                          .toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')}
                      </Text>
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
      </View>
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

  // Filter Container
  filterContainer: {
    backgroundColor: backgroundColors.light,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginTop: 10,
    marginHorizontal: 12,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: backgroundColors.dark,
    marginLeft: -5,
    fontWeight: '500',
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
    marginBottom: 6,
  },
  dropDownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    maxHeight: 100,
  },

  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePicker: {
    width: '48%',
  },
  dateLabel: {
    color: backgroundColors.dark,
    fontWeight: '600',
    marginBottom: 5,
    fontSize: 14,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
  },
  dateText: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '500',
  },

  // Summary Container
  summaryContainer: {
    marginHorizontal: 12,
    backgroundColor: backgroundColors.light,
    borderRadius: 14,
    marginVertical: 5,
    padding: 10,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
    marginBottom: 4,
  },
  innerSummaryCtx: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    color: backgroundColors.dark,
    fontWeight: 'bold',
  },

  // FlatList Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: '3%',
    marginTop: 10,
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
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    height: 45,
    width: 45,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
  },
  catBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: backgroundColors.primary,
  },
  badgeText: {
    fontSize: 12,
    color: backgroundColors.primary,
    fontWeight: '500',
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: backgroundColors.dark,
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
    backgroundColor: backgroundColors.info,
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
