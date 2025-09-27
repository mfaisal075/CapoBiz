import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPrint from 'react-native-print';
import {useUser} from '../../../CTX/UserContext';
import Toast from 'react-native-toast-message';

interface Users {
  id: number;
  name: string;
}

interface SaleReturnData {
  prod_name: string;
  salrd_invoice_no: string;
  salrd_return_qty: string;
  salrd_profit: string;
  salrd_price: string;
  salrd_total_price: string;
  created_at: string;
}

interface SaleData {
  id: number;
  sal_date: string;
  sal_order_total: string;
  sal_discount: string;
  sal_invoice_no: string;
  sal_total_amount: string;
  sal_profit: string;
  cust_name: string;
}

export default function SaleSaleReturnReport() {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
  const [usersDropdown, setUsersDropdown] = useState<Users[]>([]);
  const transformedUsers = usersDropdown.map(user => ({
    label: user.name,
    value: user.id.toString(),
  }));
  const [userOpen, setUserOpen] = useState(false);
  const [userValue, setUserValue] = useState('');
  const [saleReturnData, setSaleReturnData] = useState<SaleReturnData[]>([]);
  const [saleData, setSaleData] = useState<SaleData[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'sales' | 'returns'>('sales');

  // Handle Print
  const handlePrint = async () => {
    if (saleData.length === 0 && saleReturnData.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const userName =
      usersDropdown.find(user => user.id.toString() === userValue)?.name ||
      'Customer';

    // Get current date
    const dateStr = new Date().toLocaleDateString();

    // Build Sale HTML table rows
    const saleRows = saleData
      .map(
        (item, index) => `
          <tr>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
              index + 1
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.sal_invoice_no
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.cust_name
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
              item.sal_date,
            ).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.sal_order_total
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.sal_discount
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.sal_total_amount
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.sal_profit
            }</td>
          </tr>`,
      )
      .join('');

    // Build Sale Return HTML table rows
    const returnRows = saleReturnData
      .map(
        (item, index) => `
          <tr>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
              index + 1
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.salrd_invoice_no
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.prod_name
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
              item.created_at,
            ).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.salrd_return_qty
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.salrd_price
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.salrd_total_price
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.salrd_profit
            }</td>
          </tr>`,
      )
      .join('');

    // HTML Template
    const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Sale & Sale Return Report</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div style="font-size:12px;">Date: ${dateStr}</div>
              <div style="text-align:center; flex:1; font-size:16px; font-weight:bold;">Point of Sale System</div>
            </div>
              
            <div style="text-align:center; margin-bottom:20px;">
              <div style="font-size:18px; font-weight:bold;">${bussName}</div>
              <div style="font-size:14px;">${bussAddress}</div>
              <div style="font-size:14px; font-weight:bold; text-decoration:underline; margin-top:20px;">
                Sale Profit
              </div>
            </div>
    
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div style="font-size:12px; font-weight: bold;">
                Product: ${userValue === '' ? 'All Products' : userName}
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
                  <th style="border:1px solid #000; padding:6px;">Customer</th>
                  <th style="border:1px solid #000; padding:6px;">Date</th>
                  <th style="border:1px solid #000; padding:6px;">Order Total</th>
                  <th style="border:1px solid #000; padding:6px;">Discount</th>
                  <th style="border:1px solid #000; padding:6px;">Total Amount</th>
                  <th style="border:1px solid #000; padding:6px;">Profit</th>
                </tr>
              </thead>
              <tbody>
                ${saleRows}
              </tbody>
            </table>

            <div style="text-align:center; margin-bottom:20px; margin-top:20px;">
              <div style="font-size:14px; font-weight:bold; text-decoration:underline;">
                Sale Return
              </div>
            </div>

            <table style="border-collapse:collapse; width:100%; font-size:12px;">
              <thead>
                <tr style="background:#f0f0f0;">
                  <th style="border:1px solid #000; padding:6px;">Sr#</th>
                  <th style="border:1px solid #000; padding:6px;">Invoice No</th>
                  <th style="border:1px solid #000; padding:6px;">Product</th>
                  <th style="border:1px solid #000; padding:6px;">Return Date</th>
                  <th style="border:1px solid #000; padding:6px;">Quantity</th>
                  <th style="border:1px solid #000; padding:6px;">Price</th>
                  <th style="border:1px solid #000; padding:6px;">Total Total</th>
                  <th style="border:1px solid #000; padding:6px;">Profit</th>
                </tr>
              </thead>
              <tbody>
                ${returnRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

    await RNPrint.print({html});
  };

  // Animation for toggle
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

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

  // Fetch Users Dropdown
  const fetchUserDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchusersdropdown`);
      setUsersDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSaleData = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];

      const res = await axios.post(`${BASE_URL}/fetchsalesandreturns`, {
        from,
        to,
        user_id: userValue,
      });
      setSaleReturnData(res.data.sales_return);
      setSaleData(res.data.sales);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Sales
  const calculateTotalSales = () => {
    let totalSale = 0;
    let totalSaleProfit = 0;
    let totalReturn = 0;
    let totalReturnProfit = 0;

    saleData.forEach(sale => {
      const sales = parseFloat(sale.sal_total_amount) || 0;
      const profit = parseFloat(sale.sal_profit) || 0;

      totalSale += sales;
      totalSaleProfit += profit;
    });
    saleReturnData.forEach(sale => {
      const returns = parseFloat(sale.salrd_total_price) || 0;
      const profit = parseFloat(sale.salrd_profit) || 0;

      totalReturn += returns;
      totalReturnProfit += profit;
    });

    return {
      totalSale: totalSale.toFixed(2),
      totalSaleProfit: totalSaleProfit.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      totalReturnProfit: totalReturnProfit.toFixed(2),
      netProfit: (totalSaleProfit - totalReturnProfit).toFixed(2),
    };
  };

  const totals = calculateTotalSales();

  // Handle tab switch with animation
  const handleTabSwitch = (tab: 'sales' | 'returns') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset pagination when switching tabs
    Animated.timing(slideAnim, {
      toValue: tab === 'sales' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Pagination calculations
  const currentData = activeTab === 'sales' ? saleData : saleReturnData;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Render Sale Card
  const renderSaleCard = ({item}: {item: SaleData}) => (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>
            {item.sal_invoice_no?.charAt(0) || 'S'}
          </Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.productName}>{item.sal_invoice_no}</Text>
          <Text style={styles.subText}>Invoice Number</Text>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoBox}>
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
          <Text style={styles.valueText}>{item.sal_order_total || '0'}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.labelRow}>
            <Icon
              name="tag"
              size={18}
              color="#144272"
              style={styles.infoIcon}
            />
            <Text style={styles.labelText}>Discount</Text>
          </View>
          <Text style={styles.valueText}>{item.sal_discount || '0'}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.labelRow}>
            <Icon
              name="cash-multiple"
              size={18}
              color="#144272"
              style={styles.infoIcon}
            />
            <Text style={styles.labelText}>Total Amount</Text>
          </View>
          <Text style={styles.valueText}>{item.sal_total_amount || '0'}</Text>
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
          <Text style={[styles.valueText]}>{item.sal_profit || '0'}</Text>
        </View>
      </View>
    </View>
  );

  // Render Sale Return Card
  const renderSaleReturnCard = ({item}: {item: SaleReturnData}) => (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>
            {item.salrd_invoice_no?.charAt(0) || 'R'}
          </Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.productName}>{item.salrd_invoice_no}</Text>
          <Text style={styles.subText}>Return Invoice</Text>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <View style={styles.labelRow}>
            <Icon
              name="package-variant"
              size={18}
              color="#144272"
              style={styles.infoIcon}
            />
            <Text style={styles.labelText}>Product</Text>
          </View>
          <Text style={styles.valueText}>{item.prod_name}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.labelRow}>
            <Icon
              name="calendar"
              size={18}
              color="#144272"
              style={styles.infoIcon}
            />
            <Text style={styles.labelText}>Return Date</Text>
          </View>
          <Text style={styles.valueText}>
            {new Date(item.created_at).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.labelRow}>
            <Icon
              name="pound-box"
              size={18}
              color="#144272"
              style={styles.infoIcon}
            />
            <Text style={styles.labelText}>Quantity</Text>
          </View>
          <Text style={styles.valueText}>{item.salrd_return_qty || '0'}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.labelRow}>
            <Icon
              name="cash"
              size={18}
              color="#144272"
              style={styles.infoIcon}
            />
            <Text style={styles.labelText}>Price</Text>
          </View>
          <Text style={styles.valueText}>{item.salrd_price || '0'}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.labelRow}>
            <Icon
              name="cash-multiple"
              size={18}
              color="#144272"
              style={styles.infoIcon}
            />
            <Text style={styles.labelText}>Total Price</Text>
          </View>
          <Text style={styles.valueText}>{item.salrd_total_price || '0'}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.labelRow}>
            <Icon
              name="trending-down"
              size={18}
              color="#144272"
              style={styles.infoIcon}
            />
            <Text style={styles.labelText}>Profit</Text>
          </View>
          <Text style={[styles.valueText]}>{item.salrd_profit || '0'}</Text>
        </View>
      </View>
    </View>
  );

  useEffect(() => {
    fetchUserDropdown();
    fetchSaleData();
  }, [startDate, endDate, userValue]);

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
            <Text style={styles.headerTitle}>Sale & Sale Return Report</Text>
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

          {/* Dropdown */}
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
            style={[styles.dropdown]}
            dropDownContainerStyle={styles.dropDownContainer}
          />
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total Sale: </Text>
            <Text style={styles.summaryValue}>{totals.totalSale}</Text>
          </View>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total Sale Profit: </Text>
            <Text style={styles.summaryValue}>{totals.totalSaleProfit}</Text>
          </View>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total Return: </Text>
            <Text style={styles.summaryValue}>{totals.totalReturn}</Text>
          </View>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total Return Profit: </Text>
            <Text style={styles.summaryValue}>{totals.totalReturnProfit}</Text>
          </View>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total Net Profit: </Text>
            <Text style={styles.summaryValue}>{totals.netProfit}</Text>
          </View>
        </View>

        {/* Toggle Button */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleWrapper}>
            <Animated.View
              style={[
                styles.toggleSlider,
                {
                  transform: [
                    {
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 187],
                      }),
                    },
                  ],
                },
              ]}
            />
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeTab === 'sales' && styles.activeToggleButton,
              ]}
              onPress={() => handleTabSwitch('sales')}>
              <Icon
                name="chart-line"
                size={18}
                color={activeTab === 'sales' ? '#ffffff' : '#144272'}
                style={styles.toggleIcon}
              />
              <Text
                style={[
                  styles.toggleText,
                  activeTab === 'sales' && styles.activeToggleText,
                ]}>
                Sales ({saleData.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeTab === 'returns' && styles.activeToggleButton,
              ]}
              onPress={() => handleTabSwitch('returns')}>
              <Icon
                name="keyboard-return"
                size={18}
                color={activeTab === 'returns' ? '#ffffff' : '#144272'}
                style={styles.toggleIcon}
              />
              <Text
                style={[
                  styles.toggleText,
                  activeTab === 'returns' && styles.activeToggleText,
                ]}>
                Returns ({saleReturnData.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List Container */}
        <View style={styles.listContainer}>
          {activeTab === 'sales' ? (
            <FlatList<SaleData>
              data={paginatedData as SaleData[]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderSaleCard}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="chart-line" size={48} color="#666" />
                  <Text style={styles.emptyText}>No sale records found.</Text>
                </View>
              }
              contentContainerStyle={{paddingBottom: 70}}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList<SaleReturnData>
              data={paginatedData as SaleReturnData[]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderSaleReturnCard}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="keyboard-return" size={48} color="#666" />
                  <Text style={styles.emptyText}>No return records found.</Text>
                </View>
              }
              contentContainerStyle={{paddingBottom: 70}}
              showsVerticalScrollIndicator={false}
            />
          )}
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
                Total: {totalRecords}{' '}
                {activeTab === 'sales' ? 'sales' : 'returns'}
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
    width: '48%',
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
  dropdown: {
    borderWidth: 1,
    borderColor: '#144272',
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
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

  // Toggle Button Styling
  toggleContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  toggleWrapper: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    flexDirection: 'row',
    height: 50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  toggleSlider: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: '50%',
    height: 46,
    backgroundColor: '#144272',
    borderRadius: 23,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    zIndex: 1,
  },
  activeToggleButton: {},
  toggleIcon: {
    marginRight: 6,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
  },
  activeToggleText: {
    color: '#ffffff',
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
  profitText: {
    color: '#2e7d32',
    fontWeight: '700',
  },
  returnProfitText: {
    color: '#d32f2f',
    fontWeight: '700',
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
