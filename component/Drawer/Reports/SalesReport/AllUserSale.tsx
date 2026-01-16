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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../../CTX/UserContext';
import RNPrint from 'react-native-print';
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

interface ProductDropdown {
  id: number;
  prod_name: string;
}

interface Category {
  id: number;
  pcat_name: string;
}

interface Users {
  id: number;
  name: string;
}

interface SalesReport {
  id: number;
  sal_date: string;
  sal_order_total: string;
  sal_discount: string;
  sal_invoice_no: string;
  sal_profit: string;
  cust_name: string;
  sal_total_amount: string;
  cust_contact: string;
  cust_address: string;
}

interface SaleSummary {
  sald_prod_id: number;
  sald_prod_name: string;
  total_qty: number;
  total_sale_value: number;
}

interface SaleDetail {
  sald_prod_name: string;
  sald_qty: string;
  sald_cost_price: string;
  sald_retail_price: string;
  sald_fretail_price: string;
  sald_total_fretailprice: string;
  pcat_name: string;
  ums_name: string;
}

export default function AllUserSale({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
  const [prodDropdown, setProdDropdown] = useState<ProductDropdown[]>([]);
  const transformedProd = prodDropdown.map(prod => ({
    label: prod.prod_name,
    value: prod.id.toString(),
  }));
  const [categoryDropdown, setCategoryDropdown] = useState<Category[]>([]);
  const transformedCategory = categoryDropdown.map(cat => ({
    label: cat.pcat_name,
    value: cat.id.toString(),
  }));
  const [usersDropdown, setUsersDropdown] = useState<Users[]>([]);
  const transformedUsers = usersDropdown.map(user => ({
    label: user.name,
    value: user.id.toString(),
  }));
  const [prodOpen, setProdOpen] = useState(false);
  const [prodValue, setProdValue] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [catValue, setCatValue] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const [userValue, setUserValue] = useState('');
  const [salesReport, setSalesReport] = useState<SalesReport[]>([]);
  const [salesDetailedRep, setSalesDetailedRep] = useState<SalesReport[]>([]);
  const [salesSummary, setSalesSummary] = useState<SaleSummary[]>([]);
  const [saleDetails, setSaleDetails] = useState<Record<string, SaleDetail[]>>(
    {},
  );

  const [selectionMode, setSelectionMode] = useState<
    'salereport' | 'detailedsalereport' | 'saleSummary' | ''
  >('salereport');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Pagination for Sale Report
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData = salesReport;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const paginatedSalesData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Pagination for Detailed Report
  const [currentPageDetailed, setCurrentPageDetailed] = useState(1);
  const recordsPerPageDetailed = 10;

  const currentDataDetailed = salesDetailedRep;
  const totalRecordsDetailed = currentDataDetailed.length;
  const totalPagesDetailed = Math.ceil(
    totalRecordsDetailed / recordsPerPageDetailed,
  );

  const paginatedDetailedData = currentDataDetailed.slice(
    (currentPageDetailed - 1) * recordsPerPageDetailed,
    currentPageDetailed * recordsPerPageDetailed,
  );

  // Pagination for Sale Summary
  const [currentPageSummary, setCurrentPageSummary] = useState(1);
  const recordsPerPageSummary = 10;

  const currentDataSummary = salesSummary;
  const totalRecordsSummary = currentDataSummary.length;
  const totalPagesSummary = Math.ceil(
    totalRecordsSummary / recordsPerPageSummary,
  );

  const paginatedSummaryData = currentDataSummary.slice(
    (currentPageSummary - 1) * recordsPerPageSummary,
    currentPageSummary * recordsPerPageSummary,
  );

  const handlePrint = async () => {
    let dataList: any[] = [];
    let reportTitle = '';

    if (selectionMode === 'salereport') {
      dataList = salesReport;
      reportTitle = 'Sales Report';
    } else if (selectionMode === 'detailedsalereport') {
      dataList = salesDetailedRep;
      reportTitle = 'Detailed Sales Report';
    } else if (selectionMode === 'saleSummary') {
      dataList = salesSummary;
      reportTitle = 'Sales Summary Report';
    }

    if (dataList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const dateStr = new Date().toLocaleDateString();
    const userText = userValue
      ? usersDropdown.find(u => u.id.toString() === userValue)?.name ||
        'All Users'
      : 'All Users';
    const categoryText = catValue
      ? categoryDropdown.find(c => c.id.toString() === catValue)?.pcat_name ||
        'All Categories'
      : 'All Categories';
    const productText = prodValue
      ? prodDropdown.find(p => p.id.toString() === prodValue)?.prod_name ||
        'All Products'
      : 'All Products';

    let rows = '';
    if (selectionMode === 'saleSummary') {
      rows = dataList
        .map(
          (item, index) => `
      <tr>
        <td style="border:1px solid #000; padding:4px; text-align:center;">${
          index + 1
        }</td>
        <td style="border:1px solid #000; padding:4px;">${
          item.sald_prod_name
        }</td>
        <td style="border:1px solid #000; padding:4px;">${item.total_qty}</td>
        <td style="border:1px solid #000; padding:4px;">${
          item.total_sale_value
        }</td>
      </tr>`,
        )
        .join('');
    } else if (selectionMode === 'detailedsalereport') {
      rows = dataList
        .map((item, index) => {
          const invoiceNo = item.sal_invoice_no;
          const details = saleDetails[invoiceNo] || [];

          // Main sale row
          let mainRow = `
      <tr>
        <td colspan="7" style="border:1px solid #000; padding:8px 4px; background:#f5f5f5; font-weight:bold;">
          Invoice #: ${item.sal_invoice_no} | Customer: ${
            item.cust_name
          } | Date: ${new Date(item.sal_date).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })} | Contact: ${item.cust_contact || 'N/A'} | Address: ${
            item.cust_address || 'N/A'
          } | Sale: ${item.sal_total_amount}
        </td>
      </tr>`;

          // Details header
          let detailsHeader = `
      <tr style="background:#e8e8e8;">
        <th style="border:1px solid #000; padding:4px; text-align:center;">Sr#</th>
        <th style="border:1px solid #000; padding:4px;">UOM</th>
        <th style="border:1px solid #000; padding:4px;">Product</th>
        <th style="border:1px solid #000; padding:4px;">Qty</th>
        <th style="border:1px solid #000; padding:4px;">Unit Price</th>
        <th style="border:1px solid #000; padding:4px;">Total Price</th>
        <th style="border:1px solid #000; padding:4px;">Category</th>
      </tr>`;

          // Details rows
          let detailsRows = details
            .map(
              (detail, detailIndex) => `
      <tr>
        <td style="border:1px solid #000; padding:4px; text-align:center;">${
          detailIndex + 1
        }</td>
        <td style="border:1px solid #000; padding:4px;">${detail.ums_name}</td>
        <td style="border:1px solid #000; padding:4px;">${
          detail.sald_prod_name
        }</td>
        <td style="border:1px solid #000; padding:4px;">${detail.sald_qty}</td>
        <td style="border:1px solid #000; padding:4px;">${
          detail.sald_fretail_price
        }</td>
        <td style="border:1px solid #000; padding:4px;">${
          detail.sald_total_fretailprice
        }</td>
        <td style="border:1px solid #000; padding:4px;">${detail.pcat_name}</td>
      </tr>`,
            )
            .join('');

          // Spacer row
          let spacerRow = `<tr><td colspan="7" style="padding:8px;"></td></tr>`;

          return mainRow + detailsHeader + detailsRows + spacerRow;
        })
        .join('');
    } else {
      rows = dataList
        .map(
          (item, index) => `
      <tr>
        <td style="border:1px solid #000; padding:4px; text-align:center;">${
          index + 1
        }</td>
        <td style="border:1px solid #000; padding:4px;">${item.cust_name}</td>
        <td style="border:1px solid #000; padding:4px;">${
          item.sal_invoice_no
        }</td>
        <td style="border:1px solid #000; padding:4px;">${new Date(
          item.sal_date,
        ).toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}</td>
        <td style="border:1px solid #000; padding:4px;">${
          item.sal_total_amount
        }</td>
        <td style="border:1px solid #000; padding:4px;">${item.sal_profit}</td>
      </tr>`,
        )
        .join('');
    }

    const headerRow =
      selectionMode === 'saleSummary'
        ? `<tr style="background:#f0f0f0;">
        <th style="border:1px solid #000; padding:6px;">Sr#</th>
        <th style="border:1px solid #000; padding:6px;">Product</th>
        <th style="border:1px solid #000; padding:6px;">Quantity</th>
        <th style="border:1px solid #000; padding:6px;">Sale Value</th>
      </tr>`
        : selectionMode === 'detailedsalereport'
        ? '' // Header is now part of each sale's details
        : `<tr style="background:#f0f0f0;">
        <th style="border:1px solid #000; padding:6px;">Sr#</th>
        <th style="border:1px solid #000; padding:6px;">Customer</th>
        <th style="border:1px solid #000; padding:6px;">Invoice</th>
        <th style="border:1px solid #000; padding:6px;">Date</th>
        <th style="border:1px solid #000; padding:6px;">Total Amount</th>
        <th style="border:1px solid #000; padding:6px;">Profit</th>
      </tr>`;

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

      <div style="margin-bottom:10px;">
        <div style="font-size:12px; font-weight: bold;">User: ${userText}</div>
        <div style="font-size:12px; font-weight: bold;">Category: ${categoryText}</div>
        <div style="font-size:12px; font-weight: bold;">Product: ${productText}</div>
        <div style="display:flex; justify-content:space-between; width: 35%; gap: 20px; margin-top: 5px;">
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
          ${headerRow}
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

  // Product Dropdown
  const fetchProdDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchproductsdropdown`);
      setProdDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Category Dropdown
  const fetchCatDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcategories`);
      setCategoryDropdown(res.data.cat);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Users Dropdown
  const fetchUserDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchusersdropdown`);
      setUsersDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Sales Reports
  const fetchSales = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchsales`, {
        from,
        to,
        category: catValue,
        product: prodValue,
        user_id: userValue,
      });
      setSalesReport(res.data.sales || []);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Sales and Profit
  const calculateTotalSalesProfit = () => {
    let totalSale = 0;
    let totalProfit = 0;

    salesReport.forEach(sale => {
      const sales = parseFloat(sale.sal_total_amount) || 0;
      const profit = parseFloat(sale.sal_profit) || 0;

      totalSale += sales;
      totalProfit += profit;
    });

    return {
      totalSale: totalSale.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
    };
  };

  // Fetch Detailed Sales Reports
  const fetchDetailedSales = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchsaledetails`, {
        from,
        to,
        category: catValue,
        product: prodValue,
        user_id: userValue,
      });
      setSalesDetailedRep(res.data.sales || []);
      setSaleDetails(res.data.saledetails || {});
      console.log(salesDetailedRep.length);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Detailed Sales and Profit
  const calculateDetailedSalesProfit = () => {
    let totalSale = 0;
    let totalProfit = 0;

    salesDetailedRep.forEach(sale => {
      const sales = parseFloat(sale.sal_total_amount) || 0;
      const profit = parseFloat(sale.sal_profit) || 0;

      totalSale += sales;
      totalProfit += profit;
    });

    return {
      totalSale: totalSale.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
    };
  };

  // Fetch Sales Summary
  const fetchSalesSummary = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchsalesummaryreport`, {
        from,
        to,
        category: catValue,
        product: prodValue,
        user_id: userValue,
      });
      setSalesSummary(res.data.salesummary || []);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Sales
  const calculateTotalSales = () => {
    let totalSale = 0;

    salesSummary.forEach(sale => {
      const sales = sale.total_sale_value || 0;
      totalSale += sales;
    });

    return {
      totalSale: totalSale.toFixed(2),
    };
  };

  useEffect(() => {
    fetchProdDropdown();
    fetchCatDropdown();
    fetchUserDropdown();
  }, []);

  useEffect(() => {
    fetchSales();
    fetchDetailedSales();
    fetchSalesSummary();
    setCurrentPage(1);
    setCurrentPageDetailed(1);
    setCurrentPageSummary(1);

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [startDate, endDate, userValue, prodValue, catValue]);

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
            <Text style={styles.headerTitle}>All User Sales</Text>
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
              setSelectionMode('salereport');
              setCatValue('');
              setUserValue('');
              setProdValue('');
            }}>
            <RadioButton
              value="salereport"
              status={selectionMode === 'salereport' ? 'checked' : 'unchecked'}
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>Sale Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => {
              setSelectionMode('detailedsalereport');
              setCatValue('');
              setUserValue('');
              setProdValue('');
            }}>
            <RadioButton
              value="detailedsalereport"
              status={
                selectionMode === 'detailedsalereport' ? 'checked' : 'unchecked'
              }
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>Detailed Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => {
              setSelectionMode('saleSummary');
              setCatValue('');
              setUserValue('');
              setProdValue('');
            }}>
            <RadioButton
              value="saleSummary"
              status={selectionMode === 'saleSummary' ? 'checked' : 'unchecked'}
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>Summary</Text>
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

        {/* Dropdowns */}
        <View style={{zIndex: 3000, marginTop: 10}}>
          <DropDownPicker
            items={transformedCategory}
            open={catOpen}
            setOpen={setCatOpen}
            value={catValue}
            setValue={setCatValue}
            placeholder="Select Category"
            disabled={
              selectionMode === 'salereport' || selectionMode === 'saleSummary'
            }
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
              (selectionMode === 'salereport' ||
                selectionMode === 'saleSummary') &&
                styles.dropdownDisabled,
            ]}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode="SCROLLVIEW"
            listItemLabelStyle={{color: THEME.textDark, fontWeight: '500'}}
            labelStyle={{color: THEME.textDark, fontSize: 13}}
            searchable
            searchTextInputStyle={{borderWidth: 0}}
            searchContainerStyle={{
              borderBottomColor: THEME.border,
              borderBottomWidth: 1,
            }}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>

        <View style={{zIndex: 2000, marginTop: 10}}>
          <DropDownPicker
            items={transformedProd}
            open={prodOpen}
            setOpen={setProdOpen}
            value={prodValue}
            setValue={setProdValue}
            placeholder="Select Product"
            disabled={
              selectionMode === 'salereport' || selectionMode === 'saleSummary'
            }
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
              (selectionMode === 'salereport' ||
                selectionMode === 'saleSummary') &&
                styles.dropdownDisabled,
            ]}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode="SCROLLVIEW"
            listItemLabelStyle={{color: THEME.textDark, fontWeight: '500'}}
            labelStyle={{color: THEME.textDark, fontSize: 13}}
            searchable
            searchTextInputStyle={{borderWidth: 0}}
            searchContainerStyle={{
              borderBottomColor: THEME.border,
              borderBottomWidth: 1,
            }}
            zIndex={2000}
            zIndexInverse={2000}
          />
        </View>

        <View style={{zIndex: 1000, marginTop: 10}}>
          <DropDownPicker
            items={transformedUsers}
            open={userOpen}
            setOpen={setUserOpen}
            value={userValue}
            setValue={setUserValue}
            placeholder="Select User"
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
            zIndex={1000}
            zIndexInverse={3000}
          />
        </View>
      </View>

      {/* --- STATS SECTION --- */}
      <View style={styles.statsContainer}>
        {selectionMode === 'salereport' ||
        selectionMode === 'detailedsalereport' ? (
          <>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: '#1976D2'}]}>
                {formatNumber(
                  selectionMode === 'salereport'
                    ? calculateTotalSalesProfit().totalSale
                    : calculateDetailedSalesProfit().totalSale,
                )}
              </Text>
              <Text style={styles.statLabel}>Total Sales</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: '#388E3C'}]}>
                {formatNumber(
                  selectionMode === 'salereport'
                    ? calculateTotalSalesProfit().totalProfit
                    : calculateDetailedSalesProfit().totalProfit,
                )}
              </Text>
              <Text style={styles.statLabel}>Total Profit</Text>
            </View>
          </>
        ) : (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: '#1976D2'}]}>
              {formatNumber(calculateTotalSales().totalSale)}
            </Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>
        )}
      </View>

      {/* --- LIST CONTENT --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>
            {selectionMode === 'salereport'
              ? 'SALES REPORT'
              : selectionMode === 'detailedsalereport'
              ? 'DETAILED REPORT'
              : 'SALES SUMMARY'}
          </Text>
          <Text style={styles.tableHeaderCount}>
            {selectionMode === 'salereport'
              ? totalRecords
              : selectionMode === 'detailedsalereport'
              ? totalRecordsDetailed
              : totalRecordsSummary}{' '}
            Found
          </Text>
        </View>

        {selectionMode === 'salereport' && (
          <FlatList
            data={paginatedSalesData}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({item}) => {
              const initials = getInitials(item.cust_name);
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
                        {item.cust_name}
                      </Text>
                      <Text
                        style={[
                          styles.detailText,
                          {color: '#1976D2', fontSize: 13},
                        ]}>
                        {formatNumber(item.sal_total_amount)}
                      </Text>
                    </View>

                    <Text style={styles.dateLabelList}>
                      {new Date(item.sal_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      • {item.sal_invoice_no}
                    </Text>

                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Profit:</Text>
                        <Text style={[styles.detailText, {color: '#388E3C'}]}>
                          {formatNumber(item.sal_profit)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.centerContent}>
                <Icon name="file-document-outline" size={60} color="#E5E7EB" />
                <Text style={styles.emptyText}>No sales found</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 150}}
          />
        )}

        {selectionMode === 'detailedsalereport' && (
          <FlatList
            data={paginatedDetailedData}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({item}) => {
              const invoiceNo = item.sal_invoice_no;
              const details = saleDetails[invoiceNo] || [];
              const initials = getInitials(item.cust_name);

              return (
                <View style={styles.cardRow}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                      <Text style={styles.nameText}>{item.cust_name}</Text>
                      <Text style={styles.dateLabelList}>
                        {new Date(item.sal_date).toLocaleDateString()} •{' '}
                        {invoiceNo}
                      </Text>
                      <Text style={[styles.detailText, {color: '#1976D2'}]}>
                        Total: {formatNumber(item.sal_total_amount)}
                      </Text>
                    </View>
                  </View>

                  {/* Divider */}
                  <View
                    style={{
                      height: 1,
                      backgroundColor: '#E5E7EB',
                      marginBottom: 10,
                    }}
                  />

                  {/* Details */}
                  {details.map((detail, dIndex) => (
                    <View
                      key={dIndex}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                        backgroundColor: '#F9FAFB',
                        padding: 8,
                        borderRadius: 8,
                      }}>
                      <View style={{flex: 1}}>
                        <Text
                          style={[styles.detailText, {color: THEME.textDark}]}>
                          {detail.sald_prod_name}
                        </Text>
                        <Text style={[styles.detailLabel, {fontSize: 11}]}>
                          Qty: {detail.sald_qty}
                        </Text>
                      </View>
                      <View style={{alignItems: 'flex-end'}}>
                        <Text
                          style={[styles.detailText, {color: THEME.textDark}]}>
                          {formatNumber(detail.sald_total_fretailprice)}
                        </Text>
                        <Text style={[styles.detailLabel, {fontSize: 11}]}>
                          @ {formatNumber(detail.sald_fretail_price)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              );
            }}
            contentContainerStyle={{paddingBottom: 150}}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.centerContent}>
                <Icon name="file-remove-outline" size={80} color="#E5E7EB" />
                <Text style={styles.emptyText}>No sales found!</Text>
              </View>
            }
          />
        )}

        {selectionMode === 'saleSummary' && (
          <FlatList
            data={paginatedSummaryData}
            keyExtractor={(item, index) =>
              `${item.sald_prod_id}-summary-${index}`
            }
            renderItem={({item}) => {
              const initials = getInitials(item.sald_prod_name);
              return (
                <View style={styles.cardRow}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.nameText}>{item.sald_prod_name}</Text>
                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Qty:</Text>
                        <Text
                          style={[styles.detailText, {color: THEME.textDark}]}>
                          {item.total_qty}
                        </Text>
                      </View>
                      <View style={styles.detailSeparator} />
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Total Value:</Text>
                        <Text style={[styles.detailText, {color: '#1976D2'}]}>
                          {formatNumber(item.total_sale_value)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.centerContent}>
                <Icon name="file-document-outline" size={60} color="#E5E7EB" />
                <Text style={styles.emptyText}>No summary found</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 150}}
          />
        )}
      </View>

      {/* --- PAGINATION --- */}
      {(selectionMode === 'salereport' && totalRecords > 0) ||
      (selectionMode === 'detailedsalereport' && totalRecordsDetailed > 0) ||
      (selectionMode === 'saleSummary' && totalRecordsSummary > 0) ? (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={
              selectionMode === 'salereport'
                ? currentPage === 1
                : selectionMode === 'detailedsalereport'
                ? currentPageDetailed === 1
                : currentPageSummary === 1
            }
            onPress={() => {
              if (selectionMode === 'salereport')
                setCurrentPage(prev => prev - 1);
              else if (selectionMode === 'detailedsalereport')
                setCurrentPageDetailed(prev => prev - 1);
              else setCurrentPageSummary(prev => prev - 1);
            }}
            style={[
              styles.pageBtn,
              (selectionMode === 'salereport'
                ? currentPage === 1
                : selectionMode === 'detailedsalereport'
                ? currentPageDetailed === 1
                : currentPageSummary === 1) && styles.disabledBtn,
            ]}>
            <Icon name="chevron-left" size={24} color={THEME.white} />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            {selectionMode === 'salereport'
              ? currentPage
              : selectionMode === 'detailedsalereport'
              ? currentPageDetailed
              : currentPageSummary}{' '}
            /{' '}
            {selectionMode === 'salereport'
              ? totalPages
              : selectionMode === 'detailedsalereport'
              ? totalPagesDetailed
              : totalPagesSummary}
          </Text>

          <TouchableOpacity
            disabled={
              selectionMode === 'salereport'
                ? currentPage === totalPages
                : selectionMode === 'detailedsalereport'
                ? currentPageDetailed === totalPagesDetailed
                : currentPageSummary === totalPagesSummary
            }
            onPress={() => {
              if (selectionMode === 'salereport')
                setCurrentPage(prev => prev + 1);
              else if (selectionMode === 'detailedsalereport')
                setCurrentPageDetailed(prev => prev + 1);
              else setCurrentPageSummary(prev => prev + 1);
            }}
            style={[
              styles.pageBtn,
              (selectionMode === 'salereport'
                ? currentPage === totalPages
                : selectionMode === 'detailedsalereport'
                ? currentPageDetailed === totalPagesDetailed
                : currentPageSummary === totalPagesSummary) &&
                styles.disabledBtn,
            ]}>
            <Icon name="chevron-right" size={24} color={THEME.white} />
          </TouchableOpacity>
        </View>
      ) : null}
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
    paddingVertical: 6,
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
    marginBottom: 2,
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
