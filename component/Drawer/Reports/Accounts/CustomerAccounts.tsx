import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Linking,
  Share,
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
import LinearGradient from 'react-native-linear-gradient';
import {StatusBar} from 'react-native';
import BottomBar from '../../../BottomBar';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {sendReportToWhatsApp} from '../../../WhatsAppService';

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
  cust_contact: string;
}

export default function CustomerAccounts({navigation}: any) {
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

  // Helper: Get Initials
  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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

  // Helper: Get Report HTML
  const getReportHTML = (dataList: AllCustomerList[]) => {
    const custName =
      custDropdown.find(cust => cust.id.toString() === custValue)?.cust_name ||
      'Customer';

    const dateStr = new Date().toLocaleDateString();

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

    return `
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

    const html = getReportHTML(dataList);

    await RNPrint.print({html});
  };

  // Handle Share Report
  const handleShare = async () => {
    if (selectionMode !== 'singlecustomers' || !custValue) {
      Toast.show({
        type: 'error',
        text1: 'Please select a customer first.',
        visibilityTime: 2000,
      });
      return;
    }

    if (singleCustList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to share.',
        visibilityTime: 2000,
      });
      return;
    }

    const selectedCustomer = custDropdown.find(
      cust => cust.id.toString() === custValue,
    );

    if (!selectedCustomer?.cust_contact) {
      Toast.show({
        type: 'error',
        text1: 'Customer contact number not found.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      // 1. Generate HTML
      const html = getReportHTML(singleCustList);

      // 2. Convert HTML to PDF
      const options = {
        html: html,
        fileName: `Customer_Report_${Date.now()}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('PDF Generated:', file.filePath);

      // 3. Send to WhatsApp
      // Clean phone number: remove '+', spaces, etc. and ensure 92 prefix
      let phone = selectedCustomer.cust_contact.replace(/\D/g, '');
      if (phone.startsWith('0')) {
        phone = '92' + phone.substring(1);
      } else if (!phone.startsWith('92')) {
        phone = '92' + phone;
      }

      await sendReportToWhatsApp(phone, `file://${file.filePath}`);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Failed to generate or send report.',
        visibilityTime: 2000,
      });
    }
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
  }, [selectionMode]);

  // Calculate totals based on current selection
  const totals =
    selectionMode === 'allcustomers'
      ? calculateAllCustTotal()
      : calculateSingleCustTotal();

  function formatNumber(num: number | string): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0';

    const abs = Math.abs(n);

    if (abs >= 10000000) {
      return (n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 2) + 'Cr';
    } else if (abs >= 100000) {
      return (n / 100000).toFixed(n % 100000 === 0 ? 0 : 2) + 'L';
    } else if (abs >= 1000) {
      return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 2) + 'K';
    } else {
      return n.toString();
    }
  }

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
            <Text style={styles.headerTitle}>Customer Accounts</Text>
            <View style={{flexDirection: 'row', gap: 10}}>
              {selectionMode === 'singlecustomers' && custValue ? (
                <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                  <Icon name="share-variant" size={24} color={THEME.white} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
                  <Icon name="printer" size={24} color={THEME.white} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* --- FILTER SECTION --- */}
      <View style={styles.filterSection}>
        {/* Dropdown */}
        <View style={{marginBottom: 10}}>
          <DropDownPicker
            items={transformedCust}
            open={open}
            setOpen={setOpen}
            value={custValue}
            setValue={setCustValue}
            placeholder="Select Customer"
            disabled={selectionMode === 'allcustomers'}
            placeholderStyle={{color: '#666'}}
            textStyle={{color: THEME.textDark}}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={18} color={THEME.textDark} />
            )}
            ArrowDownIconComponent={() => (
              <Icon name="chevron-down" size={18} color={THEME.textDark} />
            )}
            style={[
              styles.dropdown,
              selectionMode === 'allcustomers' && styles.dropdownDisabled,
            ]}
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
            searchable
            searchTextInputStyle={{
              borderWidth: 0,
              width: '100%',
              color: THEME.textDark,
            }}
            searchContainerStyle={{
              borderColor: THEME.border,
              paddingVertical: 3,
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
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
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
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>Single Customer</Text>
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

      {/* --- STATS SECTION --- */}
      <View style={styles.statsContainer}>
        {/* Total Receivables */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: '#1976D2'}]}>
            {formatNumber(totals.totalReceivables)}
          </Text>
          <Text style={styles.statLabel}>Total Receivables</Text>
        </View>

        <View style={styles.statDivider} />

        {/* Total Received */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: '#388E3C'}]}>
            {formatNumber(totals.totalReceived)}
          </Text>
          <Text style={styles.statLabel}>Total Received</Text>
        </View>

        <View style={styles.statDivider} />

        {/* Net Receivables */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: '#F57C00'}]}>
            {formatNumber(totals.netReceivables)}
          </Text>
          <Text style={styles.statLabel}>Net Receivables</Text>
        </View>
      </View>

      {/* Unpaid Cheques Banner (Only for Single Customer) */}
      {selectionMode === 'singlecustomers' && (
        <View style={styles.warningBanner}>
          <Icon name="alert-circle-outline" size={20} color="#D32F2F" />
          <Text style={styles.warningText}>
            Unpaid Cheques:{' '}
            <Text style={{fontWeight: 'bold'}}>{unpaidChqAmount ?? '0'}</Text>
          </Text>
        </View>
      )}

      {/* --- LIST CONTENT --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>CUSTOMER LIST</Text>
          <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
        </View>

        <FlatList
          data={paginatedData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => {
            const isAll = selectionMode === 'allcustomers';
            const title = isAll ? item.cust_name : item.custac_invoice_no;
            const subTitle = isAll
              ? null
              : new Date(item.created_at).toLocaleDateString();
            const date = item.created_at;

            const total = item.custac_total_bill_amount;
            const paid = item.custac_paid_amount;
            const balance = item.custac_balance;

            return (
              <View style={styles.cardRow}>
                {/* Avatar Section */}
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{getInitials(title)}</Text>
                </View>

                {/* Info Section */}
                <View style={styles.infoContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.nameText} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={styles.dateLabelList}>
                      {new Date(date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  {/* Stats Row */}
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Total: </Text>
                      <Text style={styles.detailText}>
                        {formatNumber(total)}
                      </Text>
                    </View>
                    <View style={styles.detailSeparator} />
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Paid: </Text>
                      <Text style={[styles.detailText, {color: THEME.primary}]}>
                        {formatNumber(paid)}
                      </Text>
                    </View>
                    <View style={styles.detailSeparator} />
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Bal: </Text>
                      <Text
                        style={[
                          styles.detailText,
                          {
                            color:
                              parseFloat(balance) > 0
                                ? '#F57C00'
                                : THEME.textGray,
                          },
                        ]}>
                        {formatNumber(balance)}
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
              <Icon name="account-group" size={48} color="#D1D5DB" />
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
    marginTop: 5,
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
  dropdownDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.7,
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

  // --- STATS SECTION ---
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: THEME.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: THEME.textGray,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: THEME.border,
    alignSelf: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    justifyContent: 'center',
  },
  warningText: {
    color: '#D32F2F',
    marginLeft: 8,
    fontSize: 14,
  },

  // --- LIST & CARDS ---
  listContainer: {
    flex: 1,
    marginTop: 5,
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
    flex: 1,
  },
  dateLabelList: {
    fontSize: 12,
    color: THEME.textGray,
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
  detailLabel: {
    fontSize: 12,
    color: THEME.textGray,
    marginRight: 2,
  },
  detailText: {
    fontSize: 12,
    color: THEME.textDark,
    fontWeight: '600',
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
