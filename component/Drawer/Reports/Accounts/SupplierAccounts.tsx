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
import {RadioButton} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../../CTX/UserContext';
import RNPrint from 'react-native-print';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../../../Colors';

interface Supplier {
  id: number;
  sup_name: string;
  sup_company_name: string;
}

interface AllSupplierList {
  sup_name: string;
  supac_total_bill_amount: string;
  supac_paid_amount: string;
  supac_balance: string;
  supac_date: string;
  supac_invoice_no: string;
}

interface SingleSupplierList {
  id: number;
  supac_invoice_no: string;
  sup_name: string;
  supac_date: string;
  supac_total_bill_amount: string;
  supac_paid_amount: string;
  supac_balance: string;
}

export default function SupplierAccounts() {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
  const [open, setOpen] = useState(false);
  const [supValue, setSupValue] = useState('');
  const [supDropdown, setSupDropdown] = useState<Supplier[]>([]);
  const transformedSup = supDropdown.map(sup => ({
    label: `${sup.sup_name} | ${sup.sup_company_name}`,
    value: sup.id.toString(),
  }));
  const [allSupList, setAllSupList] = useState<AllSupplierList[]>([]);
  const [singleSupList, setSingleSupList] = useState<SingleSupplierList[]>([]);
  const [unpaidChqAmount, setUnpaidChqAmount] = useState('');

  const [selectionMode, setSelectionMode] = useState<
    'allsuppliers' | 'singlesupplier' | ''
  >('allsuppliers');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData = allSupList;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Pagination For Single
  const [currentPageSingle, setCurrentPageSingle] = useState(1);
  const recordsPerPageSingle = 10;

  const currentDataSingle = singleSupList;
  const totalRecordsSingle = currentDataSingle.length;
  const totalPagesSinyle = Math.ceil(totalRecordsSingle / recordsPerPageSingle);

  // Slice data for pagination
  const paginatedDataSingle = currentDataSingle.slice(
    (currentPageSingle - 1) * recordsPerPageSingle,
    currentPageSingle * recordsPerPageSingle,
  );

  const handlePrint = async () => {
    const dataList =
      selectionMode === 'allsuppliers' ? allSupList : singleSupList;

    if (dataList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const supName =
      supDropdown.find(sup => sup.id.toString() === supValue)?.sup_name ||
      'Customer';

    // Get current date
    const dateStr = new Date().toLocaleDateString();

    // Build HTML table rows
    const rows = dataList
      .map(
        (item, index) => `
      <tr>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
          index + 1
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          selectionMode === 'allsuppliers'
            ? item.sup_name
            : item.supac_invoice_no
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.supac_total_bill_amount
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.supac_paid_amount
        }</td>
        ${
          selectionMode === 'singlesupplier' &&
          `<td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
            item.supac_date,
          ).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}</td>`
        }
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.supac_balance
        }</td>
      </tr>`,
      )
      .join('');

    // HTML Template
    const html = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Customer Accounts Report</title>
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
            Supplier Account
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="font-size:12px; font-weight: bold;">
            Supplier: ${
              selectionMode === 'allsuppliers' ? 'All Supplier' : supName
            }
          </div>
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
              ${
                selectionMode === 'allsuppliers'
                  ? '<th style="border:1px solid #000; padding:6px;">Supplier</th>'
                  : '<th style="border:1px solid #000; padding:6px;">Invoice</th>'
              }
              <th style="border:1px solid #000; padding:6px;">Total Bil Amount</th>
              <th style="border:1px solid #000; padding:6px;">Total Paid Amount</th>
              ${
                selectionMode === 'singlesupplier' &&
                '<th style="border:1px solid #000; padding:6px;">Date</th>'
              }
              <th style="border:1px solid #000; padding:6px;">Balance</th>
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

  // Fetch Supplier dropdown
  const fetchSupDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchsuppliersdropdown`);
      setSupDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch All Aupplier List
  const fetchAllSupList = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchsuppaccount`, {
        from,
        to,
      });
      setAllSupList(res.data.account);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate All Supplier Totals
  const calculateAllSupTotal = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    allSupList.forEach(sup => {
      const receivable = parseFloat(sup.supac_total_bill_amount) || 0;
      const received = parseFloat(sup.supac_paid_amount) || 0;

      totalReceivables += receivable;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  // Fetch Single Customer List
  const fetchSingleCustList = async () => {
    if (supValue) {
      try {
        const from = startDate.toISOString().split('T')[0];
        const to = endDate.toISOString().split('T')[0];
        const res = await axios.post(`${BASE_URL}/fetchsinglesuppaccount`, {
          supplier_id: supValue,
          from,
          to,
        });
        setSingleSupList(res.data.account);
        setUnpaidChqAmount(res.data.chq[0]?.chi_amount);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Calculate Single Customer Totals
  const calculateSingleCustTotal = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    singleSupList.forEach(sup => {
      const receivable = parseFloat(sup.supac_total_bill_amount) || 0;
      const received = parseFloat(sup.supac_paid_amount) || 0;

      totalReceivables += receivable;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  const totals =
    selectionMode === 'allsuppliers'
      ? calculateAllSupTotal()
      : calculateSingleCustTotal();

  useEffect(() => {
    fetchSupDropdown();
    fetchAllSupList();
    fetchSingleCustList();
  }, [startDate, endDate, supValue]);

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
            <Text style={styles.headerTitle}>Supplier Accounts</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} onPress={handlePrint}>
            <Icon name="printer" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterContainer}>
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

          {/* Radio Buttons */}
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSelectionMode('allsuppliers');
                setSupValue('');
              }}>
              <RadioButton
                value="allsuppliers"
                status={
                  selectionMode === 'allsuppliers' ? 'checked' : 'unchecked'
                }
                color="#144272"
                uncheckedColor="#666"
              />
              <Text style={styles.radioText}>All Supplier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSelectionMode('singlesupplier');
              }}>
              <RadioButton
                value="singlesupplier"
                status={
                  selectionMode === 'singlesupplier' ? 'checked' : 'unchecked'
                }
                color="#144272"
                uncheckedColor="#666"
              />
              <Text style={styles.radioText}>Single Supplier</Text>
            </TouchableOpacity>
          </View>

          {/* Dropdown */}
          <DropDownPicker
            items={transformedSup}
            open={open}
            setOpen={setOpen}
            value={supValue}
            setValue={setSupValue}
            placeholder="Select Supplier"
            disabled={selectionMode === 'allsuppliers'}
            placeholderStyle={{color: '#666'}}
            textStyle={{color: '#144272'}}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={18} color="#144272" />
            )}
            ArrowDownIconComponent={() => (
              <Icon name="chevron-down" size={18} color="#144272" />
            )}
            style={[
              styles.dropdown,
              selectionMode === 'allsuppliers' && styles.dropdownDisabled,
            ]}
            dropDownContainerStyle={styles.dropDownContainer}
          />
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total Receivables: </Text>
            <Text style={styles.summaryValue}>{totals.totalReceivables}</Text>
          </View>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total Received: </Text>
            <Text style={styles.summaryValue}>{totals.totalReceived}</Text>
          </View>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Net Receivables: </Text>
            <Text style={styles.summaryValue}>{totals.netReceivables}</Text>
          </View>
          {selectionMode === 'singlesupplier' && (
            <View style={styles.innerSummaryCtx}>
              <Text style={styles.summaryLabel}>Unpaid Cheques Amount: </Text>
              <Text style={styles.summaryValue}>{unpaidChqAmount ?? '0'}</Text>
            </View>
          )}
        </View>

        {selectionMode === 'allsuppliers' && (
          <View style={styles.listContainer}>
            <FlatList
              data={paginatedData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View style={styles.card}>
                  {/* Avatar + Name + Actions */}
                  <View style={styles.row}>
                    <View>
                      <Text style={styles.name}>{item.sup_name}</Text>
                      <Text style={styles.subText}>
                        <Icon name="cash" size={12} color="#666" />{' '}
                        {item.supac_paid_amount ?? '0'}
                      </Text>
                      <Text style={styles.subText}>
                        <Icon name="cash-multiple" size={12} color="#666" />{' '}
                        {item.supac_total_bill_amount ?? '0'}
                      </Text>
                      <Text style={styles.subText}>
                        <Icon name="wallet" size={12} color="#666" />{' '}
                        {item.supac_balance ?? '0'}
                      </Text>
                    </View>
                  </View>
                </View>
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
        )}

        {selectionMode === 'singlesupplier' && (
          <View style={styles.listContainer}>
            <FlatList
              data={paginatedDataSingle}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View style={styles.card}>
                  {/* Avatar + Name + Actions */}
                  <View style={styles.row}>
                    <View>
                      <Text style={styles.name}>{item.supac_invoice_no}</Text>
                      <Text style={styles.subText}>
                        <Icon name="cash" size={12} color="#666" />{' '}
                        {item.supac_paid_amount ?? '0'}
                      </Text>
                      <Text style={styles.subText}>
                        <Icon name="cash-multiple" size={12} color="#666" />{' '}
                        {item.supac_total_bill_amount ?? '0'}
                      </Text>
                      <Text style={styles.subText}>
                        <Icon name="wallet" size={12} color="#666" />{' '}
                        {item.supac_balance ?? '0'}
                      </Text>
                    </View>

                    <View style={{alignSelf: 'flex-start'}}>
                      <Text
                        style={[
                          styles.subText,
                          {fontWeight: '700', verticalAlign: 'top'},
                        ]}>
                        <Icon name="calendar" size={12} color="#666" />{' '}
                        {new Date(item.supac_date).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }) || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
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
        )}

        {/* Pagination Controls */}
        {selectionMode === 'allsuppliers' && totalRecords > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
              onPress={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))
              }
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

        {selectionMode === 'singlesupplier' && totalRecordsSingle > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPageSingle === 1}
              onPress={() =>
                setCurrentPageSingle(prev => Math.max(prev - 1, 1))
              }
              style={[
                styles.pageButton,
                currentPageSingle === 1 && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPageSingle === 1 && styles.pageButtonTextDisabled,
                ]}>
                Prev
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                Page <Text style={styles.pageCurrent}>{currentPageSingle}</Text>{' '}
                of {totalPagesSinyle}
              </Text>
              <Text style={styles.totalText}>
                Total: {totalRecordsSingle} records
              </Text>
            </View>

            <TouchableOpacity
              disabled={currentPageSingle === totalPagesSinyle}
              onPress={() =>
                setCurrentPageSingle(prev =>
                  Math.min(prev + 1, totalPagesSinyle),
                )
              }
              style={[
                styles.pageButton,
                currentPageSingle === totalPagesSinyle &&
                  styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPageSingle === totalPagesSinyle &&
                    styles.pageButtonTextDisabled,
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

  // Filter Container
  filterContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
    zIndex: 1000,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '75%',
    marginBottom: 10,
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
  },
  dropdownDisabled: {
    backgroundColor: '#9a9a9a48',
    borderColor: '#ccc',
  },
  dropDownContainer: {
    backgroundColor: '#fff',
    borderColor: '#144272',
    zIndex: 3000,
  },

  //Summary Container Styling
  summaryContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    paddingVertical: 10,
  },
  innerSummaryCtx: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    paddingVertical: '60%',
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '96%',
    alignSelf: 'center',
    marginTop: 8,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
