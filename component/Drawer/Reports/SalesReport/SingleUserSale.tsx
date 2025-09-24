import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
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
import RNPrint from 'react-native-print';
import Toast from 'react-native-toast-message';
import {useUser} from '../../../CTX/UserContext';

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
}

interface SaleSummary {
  sald_prod_id: number;
  sald_prod_name: string;
  total_qty: number;
  total_sale_value: number;
}

export default function SingleUserSale() {
  const {openDrawer} = useDrawer();
  const {bussAddress, bussName} = useUser();
  const [prodOpen, setProdOpen] = useState(false);
  const [prodValue, setProdValue] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [catValue, setCatValue] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const [userValue, setUserValue] = useState('');
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
  const [salesReport, setSalesReport] = useState<SalesReport[]>([]);
  const [salesDetailedRep, setSalesDetailedRep] = useState<SalesReport[]>([]);

  const [selectionMode, setSelectionMode] = useState<
    'salereport' | 'detailedsalereport' | 'saleSummary' | ''
  >('salereport');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [salesSummary, setSalesSummary] = useState<SaleSummary[]>([]);

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

  // Handle Print
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
            item.sal_total_amount
          }</td>
          <td style="border:1px solid #000; padding:4px;">${
            item.sal_profit
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
          <td style="border:1px solid #000; padding:4px;">${
            item.sal_profit
          }</td>
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
          <th style="border:1px solid #000; padding:6px;">Sale</th>
          <th style="border:1px solid #000; padding:6px;">Profit</th>
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
      const res = await axios.post(`${BASE_URL}/fetchsinglesales`, {
        from,
        to,
        category: catValue,
        product: prodValue,
        user: userValue,
      });
      setSalesReport(res.data.sales);
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
      const res = await axios.post(`${BASE_URL}/fetchsinglesaledetails`, {
        from,
        to,
        category: catValue,
        product: prodValue,
        user: userValue,
      });
      setSalesDetailedRep(res.data.sales);
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

  // Fetch Sales Reports
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
      setSalesSummary(res.data.salesummary);
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
    fetchCatDropdown();
    fetchProdDropdown();
    fetchDetailedSales();
    fetchUserDropdown();
    fetchSalesSummary();
    fetchSales();
  }, [startDate, endDate, catValue, prodValue, userValue]);

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
            <Text style={styles.headerTitle}>Single User Sales</Text>
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
                color="#144272"
                uncheckedColor="#666"
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
                  selectionMode === 'detailedsalereport'
                    ? 'checked'
                    : 'unchecked'
                }
                color="#144272"
                uncheckedColor="#666"
              />
              <Text style={styles.radioText}>Detailed Report</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.radioContainerSingle}>
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
                color="#144272"
                uncheckedColor="#666"
              />
              <Text style={styles.radioText}>Sale Summary</Text>
            </TouchableOpacity>
          </View>

          {/* Dropdowns */}
          <View style={styles.dropdownRow}>
            <View style={styles.dropdownContainer}>
              <DropDownPicker
                items={transformedCategory}
                open={catOpen}
                setOpen={setCatOpen}
                value={catValue}
                setValue={setCatValue}
                placeholder="Select Category"
                disabled={
                  selectionMode === 'salereport' ||
                  selectionMode === 'saleSummary'
                }
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
                  (selectionMode === 'salereport' ||
                    selectionMode === 'saleSummary') &&
                    styles.dropdownDisabled,
                ]}
                dropDownContainerStyle={styles.dropDownContainer}
              />
            </View>

            <View style={styles.dropdownContainer}>
              <DropDownPicker
                items={transformedProd}
                open={prodOpen}
                setOpen={setProdOpen}
                value={prodValue}
                setValue={setProdValue}
                placeholder="Select Product"
                disabled={
                  selectionMode === 'salereport' ||
                  selectionMode === 'saleSummary'
                }
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
                  (selectionMode === 'salereport' ||
                    selectionMode === 'saleSummary') &&
                    styles.dropdownDisabled,
                ]}
                dropDownContainerStyle={styles.dropDownContainer}
              />
            </View>
          </View>

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
              <Icon name="chevron-up" size={18} color="#144272" />
            )}
            ArrowDownIconComponent={() => (
              <Icon name="chevron-down" size={18} color="#144272" />
            )}
            style={[styles.dropdown, {zIndex: 1000}]}
            dropDownContainerStyle={styles.dropDownContainer}
          />
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
                      <Text style={styles.summaryValue}>{totalSale}</Text>
                    </View>
                    <View style={styles.innerSummaryCtx}>
                      <Text style={styles.summaryLabel}>Total Profit:</Text>
                      <Text style={styles.summaryValue}>{totalProfit}</Text>
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
                      <Text style={styles.summaryValue}>{totalSale}</Text>
                    </View>
                    <View style={styles.innerSummaryCtx}>
                      <Text style={styles.summaryLabel}>Total Profit:</Text>
                      <Text style={styles.summaryValue}>{totalProfit}</Text>
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
                    <Text style={styles.summaryValue}>{totalSale}</Text>
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
                  <View style={styles.headerRow}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {item.cust_name?.charAt(0) || 'C'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.productName}>{item.cust_name}</Text>
                      <Text style={styles.subText}>
                        Invoice: {item.sal_invoice_no}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoBox}>
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
                        {new Date(item.sal_date).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon
                          name="receipt"
                          size={18}
                          color="#144272"
                          style={styles.infoIcon}
                        />
                        <Text style={styles.labelText}>Order Total</Text>
                      </View>
                      <Text style={styles.valueText}>
                        {item.sal_order_total}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon
                          name="percent"
                          size={18}
                          color="#144272"
                          style={styles.infoIcon}
                        />
                        <Text style={styles.labelText}>Discount</Text>
                      </View>
                      <Text style={styles.valueText}>{item.sal_discount}</Text>
                    </View>

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
                        {item.sal_total_amount}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon
                          name="trending-up"
                          size={18}
                          color="#144272"
                          style={styles.infoIcon}
                        />
                        <Text style={styles.labelText}>Profit</Text>
                      </View>
                      <Text style={styles.valueText}>{item.sal_profit}</Text>
                    </View>
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
              contentContainerStyle={{paddingBottom: 70}}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Detailed Sale Report List */}
        {selectionMode === 'detailedsalereport' && (
          <View style={styles.listContainer}>
            <FlatList
              data={paginatedDetailedData}
              keyExtractor={(item, index) => `${item.id}-detailed-${index}`}
              renderItem={({item}) => (
                <View style={styles.card}>
                  <View style={styles.headerRow}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {item.cust_name?.charAt(0) || 'C'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.productName}>{item.cust_name}</Text>
                      <Text style={styles.subText}>
                        Invoice: {item.sal_invoice_no}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoBox}>
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
                        {new Date(item.sal_date).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon
                          name="currency-usd"
                          size={18}
                          color="#144272"
                          style={styles.infoIcon}
                        />
                        <Text style={styles.labelText}>Sale</Text>
                      </View>
                      <Text style={styles.valueText}>
                        {item.sal_total_amount}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon
                          name="trending-up"
                          size={18}
                          color="#144272"
                          style={styles.infoIcon}
                        />
                        <Text style={styles.labelText}>Profit</Text>
                      </View>
                      <Text style={styles.valueText}>{item.sal_profit}</Text>
                    </View>
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
              contentContainerStyle={{paddingBottom: 70}}
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
                  <View style={styles.headerRow}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {item.sald_prod_name?.charAt(0) || 'P'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.productName}>
                        {item.sald_prod_name}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon
                          name="package-variant-closed"
                          size={18}
                          color="#144272"
                          style={styles.infoIcon}
                        />
                        <Text style={styles.labelText}>Quantity</Text>
                      </View>
                      <Text style={styles.valueText}>{item.total_qty}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon
                          name="currency-usd"
                          size={18}
                          color="#144272"
                          style={styles.infoIcon}
                        />
                        <Text style={styles.labelText}>Sale Value</Text>
                      </View>
                      <Text style={styles.valueText}>
                        {item.total_sale_value}
                      </Text>
                    </View>
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
              contentContainerStyle={{paddingBottom: 70}}
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

        {/* Pagination Controls for Detailed Report */}
        {selectionMode === 'detailedsalereport' && totalRecordsDetailed > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPageDetailed === 1}
              onPress={() =>
                setCurrentPageDetailed(prev => Math.max(prev - 1, 1))
              }
              style={[
                styles.pageButton,
                currentPageDetailed === 1 && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPageDetailed === 1 && styles.pageButtonTextDisabled,
                ]}>
                Prev
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                Page{' '}
                <Text style={styles.pageCurrent}>{currentPageDetailed}</Text> of{' '}
                {totalPagesDetailed}
              </Text>
              <Text style={styles.totalText}>
                Total: {totalRecordsDetailed} records
              </Text>
            </View>

            <TouchableOpacity
              disabled={currentPageDetailed === totalPagesDetailed}
              onPress={() =>
                setCurrentPageDetailed(prev =>
                  Math.min(prev + 1, totalPagesDetailed),
                )
              }
              style={[
                styles.pageButton,
                currentPageDetailed === totalPagesDetailed &&
                  styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPageDetailed === totalPagesDetailed &&
                    styles.pageButtonTextDisabled,
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
    width: '75%',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  radioContainerSingle: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dropdownContainer: {
    width: '48%',
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

  // Summary Container Styling
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

  // Flat List Styling
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
    zIndex: 1000,
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
  productName: {
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
    maxWidth: '50%',
    textAlign: 'right',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
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
