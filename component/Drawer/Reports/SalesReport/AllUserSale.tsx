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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../../CTX/UserContext';
import RNPrint from 'react-native-print';
import backgroundColors from '../../../Colors';

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

export default function AllUserSale() {
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
        .map(
          (item, index) => `
      <tr>
        <td style="border:1px solid #000; padding:4px; text-align:center;">${
          index + 1
        }</td>
        <td style="border:1px solid #000; padding:4px;">${
          item.sal_invoice_no
        }</td>
        <td style="border:1px solid #000; padding:4px;">${item.cust_name}</td>
        <td style="border:1px solid #000; padding:4px;">${new Date(
          item.sal_date,
        ).toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}</td>
        <td style="border:1px solid #000; padding:4px;">${
          item.cust_contact || 'N/A'
        }</td>
        <td style="border:1px solid #000; padding:4px;">${
          item.cust_address || 'N/A'
        }</td>
        <td style="border:1px solid #000; padding:4px;">${
          item.sal_total_amount
        }</td>
      </tr>`,
        )
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
        ? `
      <tr style="background:#f0f0f0;">
        <th style="border:1px solid #000; padding:6px;">Sr#</th>
        <th style="border:1px solid #000; padding:6px;">Invoice</th>
        <th style="border:1px solid #000; padding:6px;">Customer</th>
        <th style="border:1px solid #000; padding:6px;">Date</th>
        <th style="border:1px solid #000; padding:6px;">Contact</th>
        <th style="border:1px solid #000; padding:6px;">Address</th>
        <th style="border:1px solid #000; padding:6px;">Sale</th>
      </tr>`
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
  }, [startDate, endDate, userValue, prodValue, catValue]);

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
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>All User Sales</Text>
          </View>

          <TouchableOpacity style={[styles.headerBtn]} onPress={handlePrint}>
            <Icon name="printer" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterContainer}>
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
                status={
                  selectionMode === 'salereport' ? 'checked' : 'unchecked'
                }
                color={backgroundColors.primary}
                uncheckedColor={backgroundColors.dark}
              />
              <Text style={styles.radioText}>Sale Report</Text>
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
                status={
                  selectionMode === 'saleSummary' ? 'checked' : 'unchecked'
                }
                color={backgroundColors.primary}
                uncheckedColor={backgroundColors.dark}
              />
              <Text style={styles.radioText}>Sale Summary</Text>
            </TouchableOpacity>
          </View>

          {/* Dropdowns */}
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
            style={[
              styles.dropdown,
              (selectionMode === 'salereport' ||
                selectionMode === 'saleSummary') &&
                styles.dropdownDisabled,
            ]}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode="MODAL"
            listItemLabelStyle={{
              color: backgroundColors.dark,
              fontWeight: '500',
            }}
            labelStyle={{
              color: backgroundColors.dark,
              fontSize: 16,
            }}
            searchable
            searchTextInputStyle={{
              borderWidth: 0,
              width: '100%',
            }}
            searchContainerStyle={{
              borderColor: backgroundColors.gray,
            }}
          />

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
            style={[
              styles.dropdown,
              (selectionMode === 'salereport' ||
                selectionMode === 'saleSummary') &&
                styles.dropdownDisabled,
            ]}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode="MODAL"
            listItemLabelStyle={{
              color: backgroundColors.dark,
              fontWeight: '500',
            }}
            labelStyle={{
              color: backgroundColors.dark,
              fontSize: 16,
            }}
            searchable
            searchTextInputStyle={{
              borderWidth: 0,
              width: '100%',
            }}
            searchContainerStyle={{
              borderColor: backgroundColors.gray,
            }}
          />

          <DropDownPicker
            items={transformedUsers}
            open={userOpen}
            setOpen={setUserOpen}
            value={userValue}
            setValue={setUserValue}
            placeholder="Select User"
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
            style={[styles.dropdown, {zIndex: 1000}]}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode="MODAL"
            listItemLabelStyle={{
              color: backgroundColors.dark,
              fontWeight: '500',
            }}
            labelStyle={{
              color: backgroundColors.dark,
              fontSize: 16,
            }}
            searchable
            searchTextInputStyle={{
              borderWidth: 0,
              width: '100%',
            }}
            searchContainerStyle={{
              borderColor: backgroundColors.gray,
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

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          {selectionMode === 'salereport' && (
            <>
              {(() => {
                const {totalProfit, totalSale} = calculateTotalSalesProfit();
                return (
                  <>
                    <View style={styles.innerSummaryCtx}>
                      <Text style={styles.summaryLabel}>Total Sales:</Text>
                      <Text style={styles.summaryValue}>
                        {formatNumber(totalSale)}
                      </Text>
                    </View>
                    <View style={styles.innerSummaryCtx}>
                      <Text style={styles.summaryLabel}>Total Profit:</Text>
                      <Text style={styles.summaryValue}>
                        {formatNumber(totalProfit)}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </>
          )}

          {selectionMode === 'detailedsalereport' && (
            <>
              {(() => {
                const {totalProfit, totalSale} = calculateDetailedSalesProfit();
                return (
                  <>
                    <View style={styles.innerSummaryCtx}>
                      <Text style={styles.summaryLabel}>Total Sales:</Text>
                      <Text style={styles.summaryValue}>
                        {formatNumber(totalSale)}
                      </Text>
                    </View>
                    <View style={styles.innerSummaryCtx}>
                      <Text style={styles.summaryLabel}>Total Profit:</Text>
                      <Text style={styles.summaryValue}>
                        {formatNumber(totalProfit)}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </>
          )}

          {selectionMode === 'saleSummary' && (
            <>
              {(() => {
                const {totalSale} = calculateTotalSales();
                return (
                  <View style={styles.innerSummaryCtx}>
                    <Text style={styles.summaryLabel}>Total Sales:</Text>
                    <Text style={styles.summaryValue}>
                      {formatNumber(totalSale)}
                    </Text>
                  </View>
                );
              })()}
            </>
          )}
        </View>

        {/* Sale Report List */}
        {selectionMode === 'salereport' && (
          <View style={styles.listContainer}>
            <FlatList
              data={paginatedSalesData}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({item}) => (
                <View style={styles.card}>
                  {/* Avatar + Name + Actions */}
                  <View style={styles.row}>
                    <View>
                      <Text style={styles.name}>{item.cust_name}</Text>
                      <Text style={styles.subText}>
                        <Text style={{fontWeight: '600'}}>Invoice#: </Text>
                        {item.sal_invoice_no}
                      </Text>
                    </View>

                    <View style={[{alignSelf: 'flex-start', marginTop: 22}]}>
                      <Text
                        style={[
                          styles.subText,
                          {fontWeight: '700', verticalAlign: 'top'},
                        ]}>
                        <Icon name="calendar" size={12} color="#666" />{' '}
                        {new Date(item.sal_date)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-') || 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 5,
                    }}>
                    <Text style={styles.subText}>
                      <Text style={{fontWeight: '600'}}>Order Total: </Text>
                      {formatNumber(item.sal_order_total) ?? '0'}
                    </Text>
                    <Text style={styles.subText}>
                      <Text style={{fontWeight: '600'}}>Discount: </Text>
                      {formatNumber(item.sal_discount) ?? '0'}
                    </Text>
                    <Text style={styles.subText}>
                      <Text style={{fontWeight: '600'}}>Net Payable: </Text>
                      {formatNumber(item.sal_total_amount) ?? '0'}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="chart-line" size={48} color="#666" />
                  <Text style={styles.emptyText}>
                    No detailed sale records found.
                  </Text>
                </View>
              }
              contentContainerStyle={{paddingBottom: 90}}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Sale Summary List */}
        {selectionMode === 'saleSummary' && (
          <View style={styles.listContainer}>
            <FlatList
              data={paginatedSummaryData}
              keyExtractor={(item, index) =>
                `${item.sald_prod_id}-summary-${index}`
              }
              renderItem={({item}) => (
                <View style={styles.card}>
                  {/* Avatar + Name + Actions */}
                  <View style={styles.row}>
                    <View>
                      <Text style={styles.name}>{item.sald_prod_name}</Text>
                      <Text style={styles.subText}>
                        <Text style={{fontWeight: '600'}}>Invoice#: </Text>
                        {item.total_qty}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 4,
                    }}>
                    <Text style={styles.subText}>
                      <Text style={{fontWeight: '600'}}>Sale Value: </Text>
                      {formatNumber(item.total_sale_value) ?? '0'}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="chart-pie" size={48} color="#666" />
                  <Text style={styles.emptyText}>
                    No summary records found.
                  </Text>
                </View>
              }
              contentContainerStyle={{paddingBottom: 90}}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Pagination Controls for Sale Report */}
        {selectionMode === 'salereport' && totalRecords > 0 && (
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

        {/* Pagination Controls for Sale Summary */}
        {selectionMode === 'saleSummary' && totalRecordsSummary > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPageSummary === 1}
              onPress={() =>
                setCurrentPageSummary(prev => Math.max(prev - 1, 1))
              }
              style={[
                styles.pageButton,
                currentPageSummary === 1 && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPageSummary === 1 && styles.pageButtonTextDisabled,
                ]}>
                Prev
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                Page{' '}
                <Text style={styles.pageCurrent}>{currentPageSummary}</Text> of{' '}
                {totalPagesSummary}
              </Text>
              <Text style={styles.totalText}>
                Total: {totalRecordsSummary} records
              </Text>
            </View>

            <TouchableOpacity
              disabled={currentPageSummary === totalPagesSummary}
              onPress={() =>
                setCurrentPageSummary(prev =>
                  Math.min(prev + 1, totalPagesSummary),
                )
              }
              style={[
                styles.pageButton,
                currentPageSummary === totalPagesSummary &&
                  styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPageSummary === totalPagesSummary &&
                    styles.pageButtonTextDisabled,
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
    marginBottom: 4,
    marginHorizontal: 12,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    elevation: 6,
    height: 48,
  },
  dateText: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '500',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 6,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: backgroundColors.dark,
    marginLeft: -5,
    fontWeight: '500',
  },
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
    elevation: 4,
    height: 48,
    marginBottom: 10,
  },
  dropdownDisabled: {
    backgroundColor: '#dfdfdfff',
    borderColor: '#ccc',
  },
  dropDownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    maxHeight: 200,
  },

  // Summary Container
  summaryContainer: {
    marginHorizontal: 12,
    backgroundColor: backgroundColors.light,
    borderRadius: 14,
    marginVertical: 5,
    padding: 10,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
    marginBottom: 4,
  },
  innerSummaryCtx: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: backgroundColors.dark,
    fontWeight: 'bold',
  },

  // FlatList Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: '3%',
    marginTop: 4,
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
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: backgroundColors.dark,
    marginTop: 2,
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
    color: backgroundColors.light,
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
