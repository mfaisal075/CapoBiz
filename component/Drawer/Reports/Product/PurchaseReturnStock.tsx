import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
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
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import Toast from 'react-native-toast-message';
import RNPrint from 'react-native-print';
import {useUser} from '../../../CTX/UserContext';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../../../Colors';

interface StockInList {
  stkm_invoice_no: string;
  stkm_total_cost: string;
  stkm_cost_price: string;
  stkm_qty: string;
  created_at: string;
  sup_name: string;
  sup_company_name: string;
  prod_name: string;
  ums_name: string;
}

export default function PurchaseReturnStock() {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
  const [open, setOpen] = useState(false);
  const [statusVal, setStatusVal] = useState('Stock In');
  const [stockInList, setStockInList] = useState<StockInList[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = stockInList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = stockInList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const categoryItems = [
    {label: 'Stock In', value: 'Stock In'},
    {label: 'Stock Out', value: 'Stock Out'},
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

  // Handle Print
  const handlePrint = async () => {
    if (stockInList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    // Get current date
    const dateStr = new Date().toLocaleDateString();

    // Build HTML table rows
    const rows = stockInList
      .map(
        (item, index) => `
      <tr>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
          index + 1
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.stkm_invoice_no
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.prod_name
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.ums_name
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.stkm_qty
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.stkm_cost_price
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.stkm_total_cost
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.sup_company_name
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.sup_name
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
          item.created_at,
        ).toLocaleDateString('en-UC', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}</td>
      </tr>`,
      )
      .join('');

    // HTML Template
    const html = `
            <html>
              <head>
                  <meta charset="utf-8">
                  <title>Customer Report</title>
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
                        Stock Movment
                    </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                  <div style="font-size:12px; font-weight: bold;">Status: ${statusVal}</div>
                  <div style="display:flex; justify-content:space-between; width: 35%; gap: 20px;">
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
                      <tr style="background:#f0f0f0;">
                        <th style="border:1px solid #000; padding:6px;">Sr#</th>
                        <th style="border:1px solid #000; padding:6px;">Invoice</th>
                        <th style="border:1px solid #000; padding:6px;">Product</th>
                        <th style="border:1px solid #000; padding:6px;">UMO</th>
                        <th style="border:1px solid #000; padding:6px;">Qty</th>
                        <th style="border:1px solid #000; padding:6px;">Price</th>
                        <th style="border:1px solid #000; padding:6px;">Total Price</th>
                        <th style="border:1px solid #000; padding:6px;">Company</th>
                        <th style="border:1px solid #000; padding:6px;">Supplier</th>
                        <th style="border:1px solid #000; padding:6px;">Entry Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows}
                    </tbody>
                  </table>
                </body>
              </html>
            `;

    await RNPrint.print({html});
  };

  // Fetch StockIn/StockOut List
  const fetchStockInList = async () => {
    if (statusVal) {
      try {
        const from = startDate.toISOString().split('T')[0];
        const to = endDate.toISOString().split('T')[0];
        const res = await axios.post(`${BASE_URL}/fetchstock`, {
          from,
          to,
          status: statusVal,
        });
        setStockInList(res.data.pucrhase);
        setCurrentPage(1); // Reset to first page when data changes
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    fetchStockInList();
  }, [statusVal, startDate, endDate]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Stock Movement</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} onPress={handlePrint}>
            <Icon name="printer" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterContainer}>
          {/* Dropdown */}
          <DropDownPicker
            items={categoryItems}
            open={open}
            setOpen={setOpen}
            value={statusVal}
            setValue={setStatusVal}
            placeholder="Select Type"
            placeholderStyle={{color: '#666'}}
            textStyle={{color: '#144272'}}
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
            dropDownContainerStyle={styles.dropDownContainer}
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

        {/* Stock List */}
        <View style={styles.listContainer}>
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
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
                      <Text style={styles.name}>{item.prod_name}</Text>
                      <View style={styles.catBadge}>
                        <Text style={styles.badgeText}>{statusVal}</Text>
                      </View>
                    </View>
                    {/* small details inline */}
                    <Text style={styles.subText}>
                      <Text style={styles.label}>Invoice: </Text>
                      {item.stkm_invoice_no} |{' '}
                      <Text style={styles.label}>QTY: </Text>
                      {item.stkm_qty}
                    </Text>
                    <Text style={styles.subText}>
                      <Text style={styles.label}>Date: </Text>
                      {new Date(item.created_at)
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
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="package-variant" size={48} color="#666" />
                <Text style={styles.emptyText}>No products found.</Text>
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
    maxHeight: 200,
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
