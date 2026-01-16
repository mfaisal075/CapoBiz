import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
  Dimensions,
  StatusBar,
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

interface Employee {
  id: number;
  emp_name: string;
}

interface AllEmployeeList {
  emp_name: string;
  empac_earning: string;
  empac_withdraw_amount: string;
  empac_balance: string;
  empac_invoice_no: string;
  empac_date: string;
  empac_processed_by: string;
  pre_balance: number;
}

interface SingleEmployeeList {
  id: number;
  emp_name: string;
  empac_invoice_no: string;
  empac_date: string;
  empac_earning: string;
  empac_withdraw_amount: string;
  empac_balance: string;
  empac_processed_by: string;
  pre_balance: number;
}

export default function EmployeeAccounts({navigation}: any) {
  const {openDrawer} = useDrawer();
  const [open, setOpen] = useState(false);
  const {bussName, bussAddress} = useUser();
  const [empValue, setEmpValue] = useState('');
  const [employeeDropdown, setEmployeeDropdown] = useState<Employee[]>([]);
  const transformedEmp = employeeDropdown.map(emp => ({
    label: emp.emp_name,
    value: emp.id.toString(),
  }));
  const [allEmployeeList, setAllEmployeeList] = useState<AllEmployeeList[]>([]);
  const [singleEmployeeList, setSingleEmployeeList] = useState<
    SingleEmployeeList[]
  >([]);

  const [selectionMode, setSelectionMode] = useState<
    'allemployees' | 'singleemployee' | ''
  >('allemployees');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

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

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData = allEmployeeList;
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

  const currentDataSingle = singleEmployeeList;
  const totalRecordsSingle = currentDataSingle.length;
  const totalPagesSinyle = Math.ceil(totalRecordsSingle / recordsPerPageSingle);

  // Slice data for pagination
  const paginatedDataSingle = currentDataSingle.slice(
    (currentPageSingle - 1) * recordsPerPageSingle,
    currentPageSingle * recordsPerPageSingle,
  );

  const handlePrint = async () => {
    const dataList =
      selectionMode === 'allemployees' ? allEmployeeList : singleEmployeeList;

    if (dataList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const empName =
      employeeDropdown.find(emp => emp.id.toString() === empValue)?.emp_name ||
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
            selectionMode === 'allemployees'
              ? item.emp_name
              : item.empac_invoice_no
          }</td>
          <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
            item.empac_earning
          }</td>
          <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
            item.empac_withdraw_amount
          }</td>
          ${
            selectionMode === 'singleemployee' &&
            `</td>
          <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
            parseFloat(item.empac_earning) -
            parseFloat(item.empac_withdraw_amount)
          }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.empac_processed_by
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
              item.empac_date,
            ).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}</td>`
          }
          ${
            selectionMode === 'singleemployee' &&
            `<td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.empac_balance}</td>`
          }
          <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
            item.empac_balance
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
              Employee Account
            </div>
          </div>
  
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="font-size:12px; font-weight: bold;">
              Employee: ${
                selectionMode === 'allemployees' ? 'All Employee' : empName
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
                  selectionMode === 'allemployees'
                    ? '<th style="border:1px solid #000; padding:6px;">Transporter</th>'
                    : '<th style="border:1px solid #000; padding:6px;">Invoice</th>'
                }
                <th style="border:1px solid #000; padding:6px;">Total Earnings</th>
                <th style="border:1px solid #000; padding:6px;">Total Withdraw</th>
                ${
                  selectionMode === 'singleemployee' &&
                  `
                  <th style="border:1px solid #000; padding:6px;">Total</th>
                  <th style="border:1px solid #000; padding:6px;">Processed By</th>
                  <th style="border:1px solid #000; padding:6px;">Date</th>
                  <th style="border:1px solid #000; padding:6px;">Pre Balance</th>
                  `
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

  // Fetch Employee dropdown
  const fetchEmployeeDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchemployeedropdown`);
      setEmployeeDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch All Employee List
  const fetchAllEmployeeList = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchempaccount`, {
        from,
        to,
      });
      setAllEmployeeList(res.data.account);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate All Employee Totals
  const calculateAllEmployeeTotal = () => {
    let totalEarnings = 0;
    let totalWithdraw = 0;

    allEmployeeList.forEach(emp => {
      const earning = parseFloat(emp.empac_earning) || 0;
      const withdraw = parseFloat(emp.empac_withdraw_amount) || 0;

      totalEarnings += earning;
      totalWithdraw += withdraw;
    });

    return {
      totalEarnings: totalEarnings.toFixed(2),
      totalWithdraw: totalWithdraw.toFixed(2),
      netBalance: (totalEarnings - totalWithdraw).toFixed(2),
    };
  };

  // Calculate Single Employee Totals
  const calculateSingleEmployeeTotal = () => {
    let totalEarnings = 0;
    let totalWithdraw = 0;

    singleEmployeeList.forEach(emp => {
      const earning = parseFloat(emp.empac_earning) || 0;
      const withdraw = parseFloat(emp.empac_withdraw_amount) || 0;

      totalEarnings += earning;
      totalWithdraw += withdraw;
    });

    return {
      totalEarnings: totalEarnings.toFixed(2),
      totalWithdraw: totalWithdraw.toFixed(2),
      netBalance: (totalEarnings - totalWithdraw).toFixed(2),
    };
  };

  // Fetch Single Employee List
  const fetchSingleEmployeeList = async () => {
    if (empValue) {
      try {
        const from = startDate.toISOString().split('T')[0];
        const to = endDate.toISOString().split('T')[0];
        const res = await axios.post(`${BASE_URL}/fetchsingleempaccount`, {
          emp_id: empValue,
          from,
          to,
        });
        setSingleEmployeeList(res.data.account);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const totals =
    selectionMode === 'allemployees'
      ? calculateAllEmployeeTotal()
      : calculateSingleEmployeeTotal();

  useEffect(() => {
    fetchAllEmployeeList();
    fetchEmployeeDropdown();
    fetchSingleEmployeeList();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [startDate, endDate, empValue]);

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
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={26} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Employee Accounts</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={26} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* --- FILTER SECTION --- */}
      <View style={styles.filterSection}>
        {/* Dropdown */}
        <DropDownPicker
          items={transformedEmp}
          open={open}
          setOpen={setOpen}
          value={empValue}
          setValue={setEmpValue}
          placeholder="Select Employee"
          disabled={selectionMode === 'allemployees'}
          placeholderStyle={{color: THEME.textGray}}
          textStyle={{color: THEME.textDark}}
          ArrowUpIconComponent={() => (
            <Icon name="chevron-up" size={20} color={THEME.textDark} />
          )}
          ArrowDownIconComponent={() => (
            <Icon name="chevron-down" size={20} color={THEME.textDark} />
          )}
          style={[
            styles.dropdown,
            selectionMode === 'allemployees' && styles.dropdownDisabled,
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
            fontWeight: '500',
          }}
          searchable
          searchPlaceholder="Search employee..."
          searchTextInputStyle={{
            borderWidth: 0,
            borderColor: 'transparent',
          }}
          searchContainerStyle={{
            borderBottomColor: THEME.border,
            borderBottomWidth: 1,
            paddingVertical: 10,
          }}
        />

        {/* Date Inputs */}
        <View style={[styles.filterRow, {marginTop: 10}]}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartDatePicker(true)}>
            <Icon name="calendar" size={20} color={THEME.primary} />
            <Text style={styles.dateText}>
              {startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateSeparator}>to</Text>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndDatePicker(true)}>
            <Icon name="calendar" size={20} color={THEME.primary} />
            <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>

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

        {/* Radio Buttons */}
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => {
              setSelectionMode('allemployees');
              setEmpValue('');
              setSingleEmployeeList([]);
            }}>
            <RadioButton
              value="allemployees"
              status={
                selectionMode === 'allemployees' ? 'checked' : 'unchecked'
              }
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>All Employees</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => {
              setSelectionMode('singleemployee');
            }}>
            <RadioButton
              value="singleemployee"
              status={
                selectionMode === 'singleemployee' ? 'checked' : 'unchecked'
              }
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>Single Employee</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- STATS SECTION --- */}
      <View style={styles.statsContainer}>
        {/* Total Earnings */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: '#1976D2'}]}>
            {formatNumber(totals.totalEarnings)}
          </Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </View>

        <View style={styles.statDivider} />

        {/* Total Withdraw */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: '#388E3C'}]}>
            {formatNumber(totals.totalWithdraw)}
          </Text>
          <Text style={styles.statLabel}>Total Withdraw</Text>
        </View>

        <View style={styles.statDivider} />

        {/* Net Balance */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: '#F57C00'}]}>
            {formatNumber(totals.netBalance)}
          </Text>
          <Text style={styles.statLabel}>Net Balance</Text>
        </View>
      </View>

      {/* --- LIST CONTENT --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>EMPLOYEE LIST</Text>
          <Text style={styles.tableHeaderCount}>
            {selectionMode === 'allemployees'
              ? totalRecords
              : totalRecordsSingle}{' '}
            Found
          </Text>
        </View>

        <FlatList
          data={
            selectionMode === 'allemployees'
              ? paginatedData
              : paginatedDataSingle
          }
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => {
            const nameOrInvoice =
              selectionMode === 'allemployees'
                ? (item as AllEmployeeList).emp_name
                : (item as SingleEmployeeList).empac_invoice_no;
            const earning = item.empac_earning;
            const withdraw = item.empac_withdraw_amount;
            const balance = item.empac_balance;
            const date =
              selectionMode === 'singleemployee'
                ? (item as SingleEmployeeList).empac_date
                : null;

            const initials =
              selectionMode === 'allemployees'
                ? getInitials(nameOrInvoice)
                : '#';

            return (
              <View style={styles.cardRow}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {nameOrInvoice}
                  </Text>
                  {date && (
                    <Text style={styles.dateLabelList}>
                      {new Date(date).toLocaleDateString()}
                    </Text>
                  )}

                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Earn:</Text>
                      <Text style={[styles.detailText, {color: THEME.primary}]}>
                        {formatNumber(earning) ?? '0'}
                      </Text>
                    </View>

                    <View style={styles.detailSeparator} />

                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>With:</Text>
                      <Text style={[styles.detailText, {color: '#388E3C'}]}>
                        {formatNumber(withdraw) ?? '0'}
                      </Text>
                    </View>

                    <View style={styles.detailSeparator} />

                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Bal:</Text>
                      <Text style={[styles.detailText, {color: '#D32F2F'}]}>
                        {formatNumber(balance) ?? '0'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Arrow icon (optional) */}
                <Icon name="chevron-right" size={20} color="#D1D5DB" />
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Icon name="account-search-outline" size={60} color="#E5E7EB" />
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 160}}
        />
      </View>

      {/* --- PAGINATION --- */}
      {(selectionMode === 'allemployees' ? totalRecords : totalRecordsSingle) >
        0 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={
              (selectionMode === 'allemployees'
                ? currentPage
                : currentPageSingle) === 1
            }
            onPress={() =>
              selectionMode === 'allemployees'
                ? setCurrentPage(prev => prev - 1)
                : setCurrentPageSingle(prev => prev - 1)
            }
            style={[
              styles.pageBtn,
              (selectionMode === 'allemployees'
                ? currentPage
                : currentPageSingle) === 1 && styles.disabledBtn,
            ]}>
            <Icon name="chevron-left" size={24} color={THEME.white} />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            {selectionMode === 'allemployees' ? currentPage : currentPageSingle}{' '}
            / {selectionMode === 'allemployees' ? totalPages : totalPagesSinyle}
          </Text>

          <TouchableOpacity
            disabled={
              (selectionMode === 'allemployees'
                ? currentPage
                : currentPageSingle) ===
              (selectionMode === 'allemployees' ? totalPages : totalPagesSinyle)
            }
            onPress={() =>
              selectionMode === 'allemployees'
                ? setCurrentPage(prev => prev + 1)
                : setCurrentPageSingle(prev => prev + 1)
            }
            style={[
              styles.pageBtn,
              (selectionMode === 'allemployees'
                ? currentPage
                : currentPageSingle) ===
                (selectionMode === 'allemployees'
                  ? totalPages
                  : totalPagesSinyle) && styles.disabledBtn,
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
