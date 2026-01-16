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
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPrint from 'react-native-print';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../BottomBar';

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
  danger: '#EF4444',
  success: '#10B981',
  info: '#3B82F6',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
};

interface Category {
  id: number;
  expc_name: string;
}

interface ExpanseData {
  id: number;
  exp_date: string;
  expc_name: string;
  exp_addedby: string;
  exp_desc: string;
  exp_amount: string;
}

interface CategoryWiseExpanseData {
  id: number;
  exp_amount: string;
  exp_addedby: string;
  exp_desc: string;
  exp_date: string;
  expc_name: string;
}

export default function ExpenseReport({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {bussAddress, bussName} = useUser();
  const [categoryDropdown, setCategoryDropdown] = useState<Category[]>([]);
  const transformedCategory = categoryDropdown.map(cat => ({
    label: cat.expc_name,
    value: cat.id.toString(),
  }));
  const [catOpen, setCatOpen] = useState(false);
  const [catValue, setCatValue] = useState('');
  const [expanseData, setExpanseData] = useState<ExpanseData[]>([]);
  const [cateWiseexpanseData, setCateWiseExpanseData] = useState<
    CategoryWiseExpanseData[]
  >([]);

  const [selectionMode, setSelectionMode] = useState<
    'allExpenses' | 'categoryWiseExpenses'
  >('allExpenses');

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

  // Pagination All Expenses
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData = expanseData;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Pagination Category Wise
  const [currentPageSingle, setCurrentPageSingle] = useState(1);
  const recordsPerPageSingle = 10;

  const currentDataSingle = cateWiseexpanseData;
  const totalRecordsSingle = currentDataSingle.length;
  const totalPagesSinyle = Math.ceil(totalRecordsSingle / recordsPerPageSingle);

  const paginatedDataCategory = currentDataSingle.slice(
    (currentPageSingle - 1) * recordsPerPageSingle,
    currentPageSingle * recordsPerPageSingle,
  );

  // Handle Print
  const handlePrint = async () => {
    const dataList =
      selectionMode === 'allExpenses' ? expanseData : cateWiseexpanseData;

    if (dataList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const catName =
      categoryDropdown.find(cat => cat.id.toString() === catValue)?.expc_name ||
      'Customer';

    const dateStr = new Date().toLocaleDateString();

    const rows = dataList
      .map(
        (item, index) => `
          <tr>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${
              index + 1
            }</td>
            <td style="border:1px solid #000; padding:4px;">${new Date(
              item.exp_date,
            ).toLocaleDateString()}</td>
            ${
              selectionMode === 'allExpenses'
                ? `<td style="border:1px solid #000; padding:4px;">${
                    (item as ExpanseData).expc_name
                  }</td>`
                : ''
            }
            <td style="border:1px solid #000; padding:4px;">${
              item.exp_addedby
            }</td>
            <td style="border:1px solid #000; padding:4px;">${
              item.exp_desc
            }</td>
            <td style="border:1px solid #000; padding:4px; text-align:right;">${
              item.exp_amount
            }</td>
          </tr>`,
      )
      .join('');

    const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Expense Report</title>
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
                Expense List
              </div>
            </div>
    
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div style="font-size:12px; font-weight: bold;">
                Category: ${
                  selectionMode === 'allExpenses' ? 'All Categories' : catName
                }
              </div>
              <div style="display:flex; justify-content:space-between; width: 35%; gap: 20px;">
                <div style="font-size:12px;">
                  <span style="font-weight: bold;">From:</span> ${startDate.toLocaleDateString()}
                </div>
                <div style="font-size:12px;">
                  <span style="font-weight: bold;">To:</span> ${endDate.toLocaleDateString()}
                </div>
              </div>
            </div>
              
            <table style="border-collapse:collapse; width:100%; font-size:12px;">
              <thead>
                <tr style="background:#f0f0f0;">
                  <th style="border:1px solid #000; padding:6px;">Sr#</th>
                  <th style="border:1px solid #000; padding:6px;">Date</th>
                  ${
                    selectionMode === 'allExpenses'
                      ? '<th style="border:1px solid #000; padding:6px;">Category</th>'
                      : ''
                  }
                  <th style="border:1px solid #000; padding:6px;">Added By</th>
                  <th style="border:1px solid #000; padding:6px;">Note</th>
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

    try {
      await RNPrint.print({html});
    } catch (error) {
      console.log('Print Error:', error);
    }
  };

  const fetchExpanseCatDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchexpensecategorydropdown`);
      setCategoryDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchExpanses = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchexpense`, {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
        cat_id: catValue,
      });
      setExpanseData(res.data.expense);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCateWiseExpanses = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchcatexpense`, {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
        cat_id: catValue,
      });
      setCateWiseExpanseData(res.data.expense);
    } catch (error) {
      console.log(error);
    }
  };

  const calculateTotal = (data: any[]) => {
    return data
      .reduce((sum, item) => sum + (parseFloat(item.exp_amount) || 0), 0)
      .toFixed(2);
  };

  const totals = {
    totalExpanse:
      selectionMode === 'allExpenses'
        ? calculateTotal(expanseData)
        : calculateTotal(cateWiseexpanseData),
  };

  useEffect(() => {
    fetchExpanseCatDropdown();
    fetchCateWiseExpanses();
    fetchExpanses();
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('Dashboard');
        return true;
      },
    );
    return () => backHandler.remove();
  }, [startDate, endDate, catValue]);

  function formatNumber(num: number | string): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '0';
    return n.toLocaleString();
  }

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Render Card Item
  const renderCard = (item: ExpanseData | CategoryWiseExpanseData) => {
    const rowData = item as ExpanseData; // flexible cast
    const categoryName = rowData.expc_name || 'Category';

    return (
      <View style={styles.cardRow}>
        {/* Avatar / Icon */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(categoryName)}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {categoryName}
          </Text>
          <View style={styles.detailRow}>
            <Text style={styles.dateLabel}>
              {new Date(rowData.exp_date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
            {rowData.exp_addedby ? (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.addedByText} numberOfLines={1}>
                  {rowData.exp_addedby}
                </Text>
              </>
            ) : null}
          </View>
          {rowData.exp_desc ? (
            <Text style={styles.noteText} numberOfLines={1}>
              {rowData.exp_desc}
            </Text>
          ) : null}
        </View>

        {/* Amount */}
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.amountText}>
            {formatNumber(rowData.exp_amount)}
          </Text>
        </View>
      </View>
    );
  };

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
            <Text style={styles.headerTitle}>Expense Report</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* --- FILTER SECTION --- */}
      <View style={styles.filterSection}>
        {/* Radio Mode Selection */}
        <View style={styles.radioRow}>
          <TouchableOpacity
            style={styles.radioBtn}
            onPress={() => {
              setSelectionMode('allExpenses');
              setCatValue('');
            }}>
            <RadioButton.Android
              value="allExpenses"
              status={selectionMode === 'allExpenses' ? 'checked' : 'unchecked'}
              color={THEME.primary}
              onPress={() => {
                setSelectionMode('allExpenses');
                setCatValue('');
              }}
            />
            <Text style={styles.radioLabel}>All Expenses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioBtn}
            onPress={() => setSelectionMode('categoryWiseExpenses')}>
            <RadioButton.Android
              value="categoryWiseExpenses"
              status={
                selectionMode === 'categoryWiseExpenses'
                  ? 'checked'
                  : 'unchecked'
              }
              color={THEME.primary}
              onPress={() => setSelectionMode('categoryWiseExpenses')}
            />
            <Text style={styles.radioLabel}>Category Wise</Text>
          </TouchableOpacity>
        </View>

        {/* Dropdown for Category */}
        <View style={{zIndex: 2000, marginBottom: 12}}>
          <Text style={styles.inputLabel}>Select Category</Text>
          <DropDownPicker
            items={transformedCategory}
            open={catOpen}
            setOpen={setCatOpen}
            value={catValue}
            setValue={setCatValue}
            placeholder="Select Category"
            disabled={selectionMode === 'allExpenses'}
            style={[
              styles.dropdown,
              selectionMode === 'allExpenses' && styles.dropdownDisabled,
            ]}
            dropDownContainerStyle={styles.dropdownContainer}
            listMode="MODAL"
            theme="LIGHT"
          />
        </View>

        {/* Dates */}
        <View style={styles.filterRow}>
          {/* Start Date */}
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartDatePicker(true)}>
            <Icon name="calendar" size={20} color={THEME.primary} />
            <Text style={styles.dateText}>
              {startDate.toLocaleDateString('en-GB')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateSeparator}>to</Text>

          {/* End Date */}
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndDatePicker(true)}>
            <Icon name="calendar" size={20} color={THEME.primary} />
            <Text style={styles.dateText}>
              {endDate.toLocaleDateString('en-GB')}
            </Text>
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
      </View>

      <View style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={{paddingBottom: 150}}
          showsVerticalScrollIndicator={false}>
          {/* --- STATS SECTION --- */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Expense Amount</Text>
              <Text style={styles.statValue}>
                {formatNumber(totals.totalExpanse)}
              </Text>
            </View>
          </View>

          {/* --- LIST SECTION --- */}
          <View style={styles.listContainer}>
            {selectionMode === 'allExpenses' ? (
              <FlatList
                data={paginatedData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => renderCard(item)}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon
                      name="clipboard-text-outline"
                      size={50}
                      color={THEME.textGray}
                    />
                    <Text style={styles.emptyText}>No expenses found.</Text>
                  </View>
                }
              />
            ) : (
              <FlatList
                data={paginatedDataCategory}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => renderCard(item)}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon name="cash-remove" size={60} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No expenses found.</Text>
                  </View>
                }
              />
            )}
          </View>
        </ScrollView>

        {/* --- PAGINATION (Bottom Floating) --- */}
        {(selectionMode === 'allExpenses' ? totalRecords : totalRecordsSingle) >
          0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={
                (selectionMode === 'allExpenses'
                  ? currentPage
                  : currentPageSingle) === 1
              }
              onPress={() =>
                selectionMode === 'allExpenses'
                  ? setCurrentPage(prev => Math.max(prev - 1, 1))
                  : setCurrentPageSingle(prev => Math.max(prev - 1, 1))
              }
              style={[
                styles.pageBtn,
                (selectionMode === 'allExpenses'
                  ? currentPage
                  : currentPageSingle) === 1 && styles.pageBtnDisabled,
              ]}>
              <Icon name="chevron-left" size={24} color={THEME.white} />
            </TouchableOpacity>

            <Text style={styles.pageInfoText}>
              {selectionMode === 'allExpenses'
                ? currentPage
                : currentPageSingle}
              {' / '}
              {selectionMode === 'allExpenses' ? totalPages : totalPagesSinyle}
            </Text>

            <TouchableOpacity
              disabled={
                selectionMode === 'allExpenses'
                  ? currentPage === totalPages
                  : currentPageSingle === totalPagesSinyle
              }
              onPress={() =>
                selectionMode === 'allExpenses'
                  ? setCurrentPage(p => p + 1)
                  : setCurrentPageSingle(p => p + 1)
              }
              style={[
                styles.pageBtn,
                (selectionMode === 'allExpenses'
                  ? currentPage === totalPages
                  : currentPageSingle === totalPagesSinyle) &&
                  styles.pageBtnDisabled,
              ]}>
              <Icon name="chevron-right" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Toast />
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
    paddingBottom: 60,
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
    padding: 10,
    marginTop: -40,
    marginHorizontal: 16,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    zIndex: 1000,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
    gap: 16,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 14,
    color: THEME.textDark,
    marginLeft: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textGray,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dropdown: {
    borderColor: THEME.border,
    borderRadius: 8,
    minHeight: 44,
  },
  dropdownDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  dropdownContainer: {
    borderColor: THEME.border,
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

  // --- STATS ---
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: THEME.textGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },

  // --- LIST / CARD ---
  listContainer: {
    paddingHorizontal: 0, // removed padding as card width is controlled
    marginTop: 5,
  },
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '94%',
    alignSelf: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#222',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.primary,
    letterSpacing: 0.5,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 11,
    color: THEME.textGray,
    fontWeight: '500',
  },
  dotSeparator: {
    marginHorizontal: 4,
    color: THEME.textGray,
    fontSize: 10,
  },
  addedByText: {
    fontSize: 11,
    color: THEME.textGray,
    maxWidth: 100,
  },
  noteText: {
    fontSize: 11,
    color: THEME.textGray,
    fontStyle: 'italic',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.danger, // Kept red for expense
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: THEME.textGray,
    textAlign: 'center',
  },

  // --- PAGINATION ---
  paginationContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primary,
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 4},
  },
  pageBtn: {
    padding: 5,
  },
  pageBtnDisabled: {
    backgroundColor: 'transparent',
    opacity: 0.3,
  },
  pageInfo: {
    marginHorizontal: 0,
    backgroundColor: 'transparent',
  },
  pageInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.white,
    marginHorizontal: 15,
  },
});
