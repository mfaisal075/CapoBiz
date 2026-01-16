import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  BackHandler,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import RNPrint from 'react-native-print';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../BottomBar';

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
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
};

interface CustomerChequeList {
  id: number;
  sup_name: string;
  cust_name: string;
  chi_number: string;
  chi_amount: string;
  chi_date: string;
  chi_clear_date: string;
}

interface SupplierChequeList {
  id: number;
  cust_name: string;
  sup_name: string;
  chi_number: string;
  chi_amount: string;
  chi_date: string;
  chi_clear_date: string;
}

export default function CustomerAccounts({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState('Due');
  const [custChequeList, setCustChequeList] = useState<CustomerChequeList[]>(
    [],
  );
  const [suppChequeList, setSuppChequeList] = useState<SupplierChequeList[]>(
    [],
  );

  const statusItems = [
    {label: 'Due', value: 'Due'},
    {label: 'Cleared', value: 'Cleared'},
  ];

  const [selectionMode, setSelectionMode] = useState<
    'customers' | 'suppliers' | ''
  >('customers');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

  // Pagination for Customer
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData =
    selectionMode === 'customers' ? custChequeList : suppChequeList;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Handle Print
  const handlePrint = async () => {
    const dataList =
      selectionMode === 'customers' ? custChequeList : suppChequeList;

    if (dataList.length === 0) {
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
    const rows = dataList
      .map(
        (item, index) => `
          <tr>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
              index + 1
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              selectionMode === 'customers' ? item.cust_name : item.sup_name
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.chi_number
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
              item.chi_date,
            ).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.chi_clear_date
                ? new Date(item.chi_clear_date).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Not Cleared'
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.chi_amount
            }</td>
          </tr>`,
      )
      .join('');

    // HTML Template
    const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Cheques Report</title>
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
                ${
                  selectionMode === 'customers'
                    ? 'Customer Cheques'
                    : 'Supplier Cheques'
                }
              </div>
            </div>
    
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div style="font-size:12px; font-weight: bold;">
                Status: ${statusValue}
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
                  <th style="border:1px solid #000; padding:6px;">${
                    selectionMode === 'customers' ? 'Customer' : 'Supplier'
                  }</th>
                  <th style="border:1px solid #000; padding:6px;">Cheque No</th>
                  <th style="border:1px solid #000; padding:6px;">Due Date</th>
                  <th style="border:1px solid #000; padding:6px;">Clearance Date</th>
                  <th style="border:1px solid #000; padding:6px;">Amount</th>
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

  // Customers Cheque List
  const fetchCustomerChequeList = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchcheques`, {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
        status: statusValue,
      });
      setCustChequeList(res.data.cheques);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSupplierChequeList = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchsuppliercheques`, {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
        status: statusValue,
      });
      setSuppChequeList(res.data.cheques);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Customers Total
  const calculateCustChequeTotal = () => {
    let totalAmount = 0;

    custChequeList.forEach(cust => {
      const amount = parseFloat(cust.chi_amount) || 0;
      totalAmount += amount;
    });

    return {
      totalSale: totalAmount.toFixed(2),
    };
  };

  // Calculate Supplier Total
  const calculateSuppChequeTotal = () => {
    let totalAmount = 0;

    suppChequeList.forEach(supp => {
      const amount = parseFloat(supp.chi_amount) || 0;
      totalAmount += amount;
    });

    return {
      totalSale: totalAmount.toFixed(2),
    };
  };

  const totals =
    selectionMode === 'customers'
      ? calculateCustChequeTotal()
      : calculateSuppChequeTotal();

  useEffect(() => {
    fetchCustomerChequeList();
    fetchSupplierChequeList();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [startDate, endDate, statusValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectionMode, startDate, endDate, statusValue]);

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
            <Text style={styles.headerTitle}>Cheque List</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={26} color={THEME.white} />
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
            onPress={() => setSelectionMode('customers')}>
            <RadioButton
              value="customers"
              status={selectionMode === 'customers' ? 'checked' : 'unchecked'}
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>Customers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setSelectionMode('suppliers')}>
            <RadioButton
              value="suppliers"
              status={selectionMode === 'suppliers' ? 'checked' : 'unchecked'}
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>Suppliers</Text>
          </TouchableOpacity>
        </View>

        {/* Date Inputs */}
        <View style={styles.filterRow}>
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
            testID="startDatePicker"
            value={startDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onStartDateChange}
          />
        )}
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

        {/* Dropdown */}
        <View style={{zIndex: 3000, marginTop: 10}}>
          <DropDownPicker
            items={statusItems}
            open={statusOpen}
            setOpen={setStatusOpen}
            value={statusValue}
            setValue={setStatusValue}
            placeholder="Select Status"
            placeholderStyle={{color: THEME.textGray}}
            textStyle={{color: THEME.textDark}}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={20} color={THEME.textDark} />
            )}
            ArrowDownIconComponent={() => (
              <Icon name="chevron-down" size={20} color={THEME.textDark} />
            )}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode="SCROLLVIEW"
            listItemLabelStyle={{color: THEME.textDark, fontWeight: '500'}}
            labelStyle={{color: THEME.textDark, fontSize: 13}}
          />
        </View>
      </View>

      {/* Summary Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: THEME.primary}]}>
            {formatNumber(totals.totalSale)}
          </Text>
          <Text style={styles.statLabel}>Total Cheque Amount</Text>
        </View>
      </View>

      {/* --- LIST DATA --- */}
      <View style={styles.listContainer}>
        <FlatList
          data={paginatedData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => {
            const name =
              selectionMode === 'customers' ? item.cust_name : item.sup_name;
            const initials = getInitials(name);
            const chequeDate = new Date(item.chi_date)
              .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
              .replace(/ /g, '-');

            const clearDate = item.chi_clear_date
              ? new Date(item.chi_clear_date)
                  .toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                  .replace(/ /g, '-')
              : 'Not Cleared';

            return (
              <View style={styles.cardRow}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.dateLabelList}>
                    #{item.chi_number} • {chequeDate}
                  </Text>
                  <Text style={[styles.dateLabelList, {marginBottom: 0}]}>
                    {statusValue === 'Cleared'
                      ? `Cleared: ${clearDate}`
                      : `Due: ${chequeDate}`}
                  </Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  <Text style={[styles.detailText, {color: THEME.primary}]}>
                    {formatNumber(item.chi_amount)}
                  </Text>
                </View>
              </View>
            );
          }}
          contentContainerStyle={{paddingBottom: 160}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Icon name="checkbook" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>No cheques found.</Text>
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
    paddingBottom: 20,
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 80,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: THEME.primary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.white,
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  iconBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },

  // --- FILTER SECTION ---
  filterSection: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: -80,
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
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 5,
  },
  radioText: {
    color: THEME.textDark,
    marginLeft: 2,
    fontWeight: '500',
    fontSize: 13,
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
    marginBottom: 10,
    marginTop: 0,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  dateText: {
    fontSize: 13,
    color: THEME.textDark,
    marginLeft: 8,
    fontWeight: '500',
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
    paddingVertical: 12,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: THEME.textGray,
  },

  // --- LIST & CARDS ---
  listContainer: {
    flex: 1,
    marginTop: 0,
    paddingHorizontal: 16,
  },
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 2,
    flex: 1,
  },
  dateLabelList: {
    fontSize: 12,
    color: THEME.textGray,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '700',
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
