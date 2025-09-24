import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
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
import RNPrint from 'react-native-print';
import {useUser} from '../../../CTX/UserContext';

interface AllCustomerList {
  custac_invoice_no: string;
  custac_payment_method: string;
  created_at: string;
  cust_name: string;
  custac_total_bill_amount: string;
  custac_paid_amount: string;
  custac_balance: string;
}

interface Customers {
  id: number;
  cust_name: string;
  cust_fathername: string;
  cust_address: string;
}

export default function CustomerAccounts() {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
  const [open, setOpen] = useState(false);
  const [custValue, setCustValue] = useState('');
  const [allCustList, setAllCustList] = useState<AllCustomerList[]>([]);
  const [singleCustList, setSingleCustList] = useState<AllCustomerList[]>([]);
  const [custDropdown, setCustDropdown] = useState<Customers[]>([]);
  const transformedCust = custDropdown.map(cust => ({
    label: `${cust.cust_name} s/o ${cust.cust_fathername} | ${cust.cust_address}`,
    value: cust.id.toString(),
  }));
  const [unpaidChqAmount, setUnpaidChqAmount] = useState('');
  const [selectionMode, setSelectionMode] = useState<
    'allcustomers' | 'singlecustomers' | ''
  >('allcustomers');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData =
    selectionMode === 'allcustomers' ? allCustList : singleCustList;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
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

  // Handle Print
  const handlePrint = async () => {
    const dataList =
      selectionMode === 'allcustomers' ? allCustList : singleCustList;

    if (dataList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const custName =
      custDropdown.find(cust => cust.id.toString() === custValue)?.cust_name ||
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
          item.custac_invoice_no
        }</td>
        ${
          selectionMode === 'allcustomers'
            ? `<td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">
                ${item.cust_name}
              </td>`
            : ''
        }
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.custac_total_bill_amount
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.custac_paid_amount
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.custac_balance
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
          item.created_at,
        ).toLocaleDateString('en-US', {
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
            Customer Accounts Report
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="font-size:12px; font-weight: bold;">
            Customer: ${
              selectionMode === 'allcustomers' ? 'All Customers' : custName
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
              <th style="border:1px solid #000; padding:6px;">Invoice No</th>
              ${
                selectionMode === 'allcustomers'
                  ? '<th style="border:1px solid #000; padding:6px;">Customer</th>'
                  : ''
              }
              <th style="border:1px solid #000; padding:6px;">Total Amount</th>
              <th style="border:1px solid #000; padding:6px;">Paid Amount</th>
              <th style="border:1px solid #000; padding:6px;">Balance</th>
              <th style="border:1px solid #000; padding:6px;">Date</th>
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

  // Fetch All Customer List
  const fetchAllCustList = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchcustaccount`, {
        from,
        to,
      });
      setAllCustList(res.data.account);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate All Customer Totals
  const calculateAllCustTotal = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    allCustList.forEach(cust => {
      const receivable = parseFloat(cust.custac_total_bill_amount) || 0;
      const received = parseFloat(cust.custac_paid_amount) || 0;

      totalReceivables += receivable;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  // Fetch Customer dropdown
  const fetchCustDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchdropcustomer`);
      setCustDropdown(res.data.customers);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Single Customer List
  const fetchSingleCustList = async () => {
    if (custValue) {
      try {
        const from = startDate.toISOString().split('T')[0];
        const to = endDate.toISOString().split('T')[0];
        const res = await axios.post(`${BASE_URL}/fetchsinglecustaccount`, {
          customer: custValue,
          from,
          to,
        });
        setSingleCustList(res.data.account);
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

    singleCustList.forEach(cust => {
      const receivable = parseFloat(cust.custac_total_bill_amount) || 0;
      const received = parseFloat(cust.custac_paid_amount) || 0;

      totalReceivables += receivable;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  useEffect(() => {
    fetchAllCustList();
    fetchSingleCustList();
    fetchCustDropdown();
  }, [startDate, endDate, custValue]);

  useEffect(() => {
    setCurrentPage(1); // Reset pagination when selection mode changes
  }, [selectionMode]);

  // Calculate totals based on current selection
  const totals =
    selectionMode === 'allcustomers'
      ? calculateAllCustTotal()
      : calculateSingleCustTotal();

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Customer Accounts</Text>
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
                setSelectionMode('allcustomers');
                setCustValue('');
              }}>
              <RadioButton
                value="allcustomers"
                status={
                  selectionMode === 'allcustomers' ? 'checked' : 'unchecked'
                }
                color="#144272"
                uncheckedColor="#666"
              />
              <Text style={styles.radioText}>All Customers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSelectionMode('singlecustomers');
              }}>
              <RadioButton
                value="singlecustomers"
                status={
                  selectionMode === 'singlecustomers' ? 'checked' : 'unchecked'
                }
                color="#144272"
                uncheckedColor="#666"
              />
              <Text style={styles.radioText}>Single Customer</Text>
            </TouchableOpacity>
          </View>

          {/* Dropdown */}
          <DropDownPicker
            items={transformedCust}
            open={open}
            setOpen={setOpen}
            value={custValue}
            setValue={setCustValue}
            placeholder="Select Customer"
            disabled={selectionMode === 'allcustomers'}
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
              selectionMode === 'allcustomers' && styles.dropdownDisabled,
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
          {selectionMode === 'singlecustomers' && (
            <View style={styles.innerSummaryCtx}>
              <Text style={styles.summaryLabel}>Unpaid Cheques Amount: </Text>
              <Text style={styles.summaryValue}>{unpaidChqAmount ?? '0'}</Text>
            </View>
          )}
        </View>

        {/* Customer List */}
        <View style={styles.listContainer}>
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.cust_name?.charAt(0) || 'C'}
                    </Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.customerName}>
                      {selectionMode === 'allcustomers'
                        ? item.cust_name
                        : custDropdown.find(
                            cust => cust.id.toString() === custValue,
                          )?.cust_name || 'Customer'}
                    </Text>
                    <Text style={styles.subText}>
                      Invoice: {item.custac_invoice_no}
                    </Text>
                  </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="receipt"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Invoice No</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.custac_invoice_no}
                    </Text>
                  </View>

                  {selectionMode === 'allcustomers' && (
                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon
                          name="account"
                          size={18}
                          color="#144272"
                          style={styles.infoIcon}
                        />
                        <Text style={styles.labelText}>Customer</Text>
                      </View>
                      <Text style={styles.valueText}>{item.cust_name}</Text>
                    </View>
                  )}

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="currency-usd"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Total Amount</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.custac_total_bill_amount}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="cash"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Paid Amount</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.custac_paid_amount}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="credit-card"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Payment Method</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.custac_payment_method || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="calendar"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Date</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {new Date(item.created_at)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .replace(/ /g, '-')}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="wallet"
                        size={18}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Balance</Text>
                    </View>
                    <Text style={[styles.valueText, styles.balanceAmount]}>
                      {item.custac_balance}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-group" size={48} color="#666" />
                <Text style={styles.emptyText}>No customer records found.</Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 80}}
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
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
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

  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#144272',
    flexWrap: 'wrap',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  balanceBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  balanceText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    flex: 1,
  },
  infoIcon: {
    marginRight: 6,
  },
  labelText: {
    fontSize: 13,
    color: '#144272',
    fontWeight: '600',
  },
  valueText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  balanceAmount: {
    color: '#E53935',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
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
    backgroundColor: '#144272',
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
    backgroundColor: '#fff',
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
    color: '#144272',
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
