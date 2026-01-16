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
import BottomBar from '../../../BottomBar';
import {Dimensions, StatusBar, BackHandler} from 'react-native';

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

export default function SupplierAccounts({navigation}: any) {
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

  // Helper: Get Initials
  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

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

  const totals =
    selectionMode === 'allsuppliers'
      ? calculateAllSupTotal()
      : calculateSingleCustTotal();

  useEffect(() => {
    fetchSupDropdown();
    fetchAllSupList();
    fetchSingleCustList();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [startDate, endDate, supValue]);

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
            <Text style={styles.headerTitle}>Supplier Accounts</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* --- FILTER SECTION --- */}
      <View style={styles.filterSection}>
        {/* Dropdown */}
        <View style={{marginBottom: 10}}>
          <DropDownPicker
            items={transformedSup}
            open={open}
            setOpen={setOpen}
            value={supValue}
            setValue={setSupValue}
            placeholder="Select Supplier"
            disabled={selectionMode === 'allsuppliers'}
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
              selectionMode === 'allsuppliers' && styles.dropdownDisabled,
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
              setSelectionMode('allsuppliers');
              setSupValue('');
            }}>
            <RadioButton
              value="allsuppliers"
              status={
                selectionMode === 'allsuppliers' ? 'checked' : 'unchecked'
              }
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>All Suppliers</Text>
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
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>Single Supplier</Text>
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
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: '#1976D2'}]}>
            {formatNumber(totals.totalReceivables)}
          </Text>
          <Text style={styles.statLabel}>Total Receivables</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: '#388E3C'}]}>
            {formatNumber(totals.totalReceived)}
          </Text>
          <Text style={styles.statLabel}>Total Paid</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: '#F57C00'}]}>
            {formatNumber(totals.netReceivables)}
          </Text>
          <Text style={styles.statLabel}>Net Receivables</Text>
        </View>
      </View>

      {/* Unpaid Cheques Banner (Only for Single Supplier) */}
      {selectionMode === 'singlesupplier' && (
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
          <Text style={styles.tableHeaderLabel}>SUPPLIER LIST</Text>
          <Text style={styles.tableHeaderCount}>
            {selectionMode === 'allsuppliers'
              ? totalRecords
              : totalRecordsSingle}{' '}
            Found
          </Text>
        </View>

        <FlatList
          data={
            selectionMode === 'allsuppliers'
              ? paginatedData
              : paginatedDataSingle
          }
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => {
            const isAll = selectionMode === 'allsuppliers';
            const nameOrInvoice = isAll
              ? (item as AllSupplierList).sup_name
              : (item as SingleSupplierList).supac_invoice_no;
            const detailDate = isAll
              ? (item as AllSupplierList).supac_date
              : (item as SingleSupplierList).supac_date;

            const total = item.supac_total_bill_amount;
            const paid = item.supac_paid_amount;
            const balance = item.supac_balance;

            return (
              <View style={styles.cardRow}>
                {/* Avatar Section */}
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {getInitials(nameOrInvoice)}
                  </Text>
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
                      {nameOrInvoice}
                    </Text>
                    <Text style={styles.dateLabelList}>
                      {new Date(detailDate).toLocaleDateString('en-GB', {
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 160}}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Icon name="account-group" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No records found.</Text>
            </View>
          }
        />
      </View>

      {/* --- PAGINATION --- */}
      {(selectionMode === 'singlesupplier'
        ? totalRecordsSingle
        : totalRecords) > 0 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={
              (selectionMode === 'singlesupplier'
                ? currentPageSingle
                : currentPage) === 1
            }
            onPress={() =>
              selectionMode === 'singlesupplier'
                ? setCurrentPageSingle(prev => prev - 1)
                : setCurrentPage(prev => prev - 1)
            }
            style={[
              styles.pageBtn,
              (selectionMode === 'singlesupplier'
                ? currentPageSingle
                : currentPage) === 1 && styles.disabledBtn,
            ]}>
            <Icon name="chevron-left" size={24} color={THEME.white} />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            {selectionMode === 'singlesupplier'
              ? currentPageSingle
              : currentPage}{' '}
            /{' '}
            {selectionMode === 'singlesupplier' ? totalPagesSinyle : totalPages}
          </Text>

          <TouchableOpacity
            disabled={
              (selectionMode === 'singlesupplier'
                ? currentPageSingle
                : currentPage) ===
              (selectionMode === 'singlesupplier'
                ? totalPagesSinyle
                : totalPages)
            }
            onPress={() =>
              selectionMode === 'singlesupplier'
                ? setCurrentPageSingle(prev => prev + 1)
                : setCurrentPage(prev => prev + 1)
            }
            style={[
              styles.pageBtn,
              (selectionMode === 'singlesupplier'
                ? currentPageSingle
                : currentPage) ===
                (selectionMode === 'singlesupplier'
                  ? totalPagesSinyle
                  : totalPages) && styles.disabledBtn,
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
