import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  BackHandler,
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
import RNPrint from 'react-native-print';
import Toast from 'react-native-toast-message';
import {useUser} from '../../../CTX/UserContext';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../../BottomBar';

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
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
  textLight: '#9CA3AF',
};

interface ProductDropdown {
  id: number;
  prod_name: string;
}

interface DataWiseList {
  prod_name: string;
  salrd_invoice_no: string;
  salrd_return_qty: string;
  salrd_price: string;
  salrd_total_price: string;
  created_at: string;
}

export default function SaleReturnReport({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
  const [prodOpen, setProdOpen] = useState(false);
  const [prodValue, setProdValue] = useState('');
  const [prodDropdown, setProdDropdown] = useState<ProductDropdown[]>([]);
  const transformedProd = prodDropdown.map(prod => ({
    label: prod.prod_name,
    value: prod.id.toString(),
  }));
  const [dataWiseList, setDataWiseList] = useState<DataWiseList[]>([]);
  const [prodWiseList, setProdWiseList] = useState<DataWiseList[]>([]);
  const [selectionMode, setSelectionMode] = useState<
    'dateWise' | 'productWise' | ''
  >('dateWise');
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData =
    selectionMode === 'dateWise' ? dataWiseList : prodWiseList;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Handle Print
  const handlePrint = async () => {
    const dataList = selectionMode === 'dateWise' ? dataWiseList : prodWiseList;

    if (dataList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const prodName =
      prodDropdown.find(prod => prod.id.toString() === prodValue)?.prod_name ||
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
            item.salrd_invoice_no
          }</td>
          <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
            item.created_at,
          ).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}</td>
          <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
            item.prod_name
          }</td>
          <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
            item.salrd_return_qty
          }</td>
          <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
            item.salrd_price
          }</td>
          <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
            item.salrd_total_price
          }</td>
        </tr>`,
      )
      .join('');

    // HTML Template
    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Sale Return Report</title>
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
              Sale Return Report
            </div>
          </div>
  
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="font-size:12px; font-weight: bold;">
              Product: ${
                selectionMode === 'dateWise' ? 'All Products' : prodName
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
                <th style="border:1px solid #000; padding:6px;">Return Date</th>
                <th style="border:1px solid #000; padding:6px;">Product</th>
                <th style="border:1px solid #000; padding:6px;">Quantity</th>
                <th style="border:1px solid #000; padding:6px;">Price</th>
                <th style="border:1px solid #000; padding:6px;">Total Price</th>
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

  // Product Dropdown
  const fetchProdDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchproductsdropdown`);
      setProdDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Data Wise Sales Return
  const fetchDataSaleReturn = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchsalereturn`, {
        from,
        to,
        product: prodValue,
      });
      setDataWiseList(res.data.sales_return);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Data Wise Total Return
  const calculateDataWiseTotal = () => {
    let totalReturn = 0;
    let totalReturnQty = 0;

    dataWiseList.forEach(data => {
      const returnAmount = parseFloat(data.salrd_total_price) || 0;
      const qty = parseFloat(data.salrd_return_qty) || 0;

      totalReturn += returnAmount;
      totalReturnQty += qty;
    });

    return {
      totalReturn: totalReturn.toFixed(2),
      totalReturnQty: totalReturnQty.toFixed(0),
    };
  };

  // Fetch Product Wise Sales Return
  const fetchProductSaleReturn = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchprodsalereturn`, {
        from,
        to,
        product: prodValue,
      });
      setProdWiseList(res.data.sales_return);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Product Wise Total Return
  const calculateProductWiseTotal = () => {
    let totalReturn = 0;
    let totalReturnQty = 0;

    prodWiseList.forEach(data => {
      const returnAmount = parseFloat(data.salrd_total_price) || 0;
      const qty = parseFloat(data.salrd_return_qty) || 0;

      totalReturn += returnAmount;
      totalReturnQty += qty;
    });

    return {
      totalReturn: totalReturn.toFixed(2),
      totalReturnQty: totalReturnQty.toFixed(0),
    };
  };

  const totals =
    selectionMode === 'dateWise'
      ? calculateDataWiseTotal()
      : calculateProductWiseTotal();

  useEffect(() => {
    fetchProdDropdown();
    fetchDataSaleReturn();
    fetchProductSaleReturn();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [startDate, endDate, prodValue]);

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

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
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
            <Text style={styles.headerTitle}>Sale Return Report</Text>
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
            onPress={() => {
              setSelectionMode('dateWise');
              setProdValue('');
            }}>
            <RadioButton
              value="dateWise"
              status={selectionMode === 'dateWise' ? 'checked' : 'unchecked'}
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>Date Wise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => {
              setSelectionMode('productWise');
            }}>
            <RadioButton
              value="productWise"
              status={selectionMode === 'productWise' ? 'checked' : 'unchecked'}
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>Product Wise</Text>
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
        <View style={{marginTop: 5}}>
          <DropDownPicker
            items={transformedProd}
            open={prodOpen}
            setOpen={setProdOpen}
            value={prodValue}
            setValue={setProdValue}
            placeholder="Select Product"
            disabled={selectionMode === 'dateWise'}
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
              selectionMode === 'dateWise' && styles.dropdownDisabled,
            ]}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode="SCROLLVIEW"
            listItemLabelStyle={{
              color: THEME.textDark,
              fontWeight: '500',
            }}
            labelStyle={{
              color: THEME.textDark,
              fontSize: 13,
            }}
            searchable
            searchTextInputStyle={{
              borderWidth: 0,
            }}
            searchContainerStyle={{
              borderBottomColor: THEME.border,
              borderBottomWidth: 1,
              paddingVertical: 3,
            }}
          />
        </View>
      </View>

      {/* --- STATS SECTION --- */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: '#1976D2'}]}>
            {formatNumber(totals.totalReturnQty)}
          </Text>
          <Text style={styles.statLabel}>Total Qty</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: '#D32F2F'}]}>
            {formatNumber(totals.totalReturn)}
          </Text>
          <Text style={styles.statLabel}>Total Return</Text>
        </View>
      </View>

      {/* --- LIST CONTENT --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>SALE RETURNS</Text>
          <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
        </View>

        <FlatList
          data={paginatedData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => {
            const initials = getInitials(item.prod_name);
            return (
              <View style={styles.cardRow}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.nameText} numberOfLines={1}>
                      {item.prod_name}
                    </Text>
                    <Text
                      style={[
                        styles.detailText,
                        {color: '#D32F2F', fontSize: 13},
                      ]}>
                      {formatNumber(item.salrd_total_price)}
                    </Text>
                  </View>

                  <Text style={styles.dateLabelList}>
                    {new Date(item.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    • #{item.salrd_invoice_no}
                  </Text>

                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Qty:</Text>
                      <Text style={styles.detailText}>
                        {item.salrd_return_qty ?? '0'}
                      </Text>
                    </View>
                    <View style={styles.detailSeparator} />
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Price:</Text>
                      <Text style={styles.detailText}>
                        {formatNumber(item.salrd_price)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Icon name="keyboard-return" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>No return records found.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 160}}
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
    paddingVertical: 15,
    paddingHorizontal: 15,
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
    marginBottom: 5,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 10,
    marginTop: 0,
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
    borderWidth: 1,
    borderColor: THEME.border,
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
    paddingVertical: 10,
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
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: THEME.textGray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    height: '60%',
    alignSelf: 'center',
  },

  // --- LIST CONTENT ---
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  tableHeaderLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  tableHeaderCount: {
    fontSize: 14,
    color: THEME.textGray,
    fontWeight: '500',
  },

  // CARD STYLE
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 3},
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: THEME.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  nameText: {
    fontSize: 16, // Reduced slightly if needed
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 2,
    maxWidth: '75%',
  },
  dateLabelList: {
    fontSize: 12,
    color: THEME.textGray,
    marginBottom: 6,
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
    marginRight: 4,
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
