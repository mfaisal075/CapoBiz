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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import RNPrint from 'react-native-print';
import {useUser} from '../../../CTX/UserContext';
import Toast from 'react-native-toast-message';

interface EmployeeInfo {
  sr: number;
  invoice: number;
  customer: string;
  date: string;
  orderTable: number;
  discount: number;
  totalAmount: number;
  paid: number;
  balance: number;
  profit: number;
}

interface InfoObject {
  [key: string]: EmployeeInfo[];

  Chocolate: EmployeeInfo[];
  Oil: EmployeeInfo[];
  Flour: EmployeeInfo[];
  Jelly: EmployeeInfo[];
  'Murree Brwerry': EmployeeInfo[];

  'Chilli Milli': EmployeeInfo[];
  Cup: EmployeeInfo[];
  'Flour E': EmployeeInfo[];
  'Pizza Jelly': EmployeeInfo[];
  'Kunafa Bar': EmployeeInfo[];
}

interface Category {
  id: number;
  pcat_name: string;
}

interface ProductDropdown {
  id: number;
  prod_name: string;
}

interface Users {
  id: number;
  name: string;
}

interface DailyReports {
  id: number;
  sal_date: string;
  sal_order_total: string;
  sal_discount: string;
  sal_invoice_no: string;
  sal_total_amount: string;
  sal_payment_amount: string;
  sal_change_amount: string;
  cust_name: string;
  sal_profit: string;
}

interface DailyDetailedReports {
  id: number;
  sal_invoice_no: string;
  cust_name: string;
  cust_contact: string;
  cust_address: string;
  sal_date: string;
  sal_total_amount: string;
  sal_profit: string;
  sal_payment_amount: string;
  sal_order_total: string;
  sal_discount: string;
  sal_change_amount: string;
}

export default function SingleUserDailySales() {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
  const [prodOpen, setProdOpen] = useState(false);
  const [prodValue, setProdValue] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [catValue, setCatValue] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const [userValue, setUserValue] = useState('');
  const [dailyReports, setDailyReports] = useState<DailyReports[]>([]);
  const [dailyDetailedReports, setDailyDetailedReports] = useState<
    DailyDetailedReports[]
  >([]);

  const [categoryDropdown, setCategoryDropdown] = useState<Category[]>([]);
  const transformedCategory = categoryDropdown.map(cat => ({
    label: cat.pcat_name,
    value: cat.id.toString(),
  }));
  const [prodDropdown, setProdDropdown] = useState<ProductDropdown[]>([]);
  const transformedProd = prodDropdown.map(prod => ({
    label: prod.prod_name,
    value: prod.id.toString(),
  }));
  const [userDropdown, setUserDropdown] = useState<Users[]>([]);
  const transformedUsers = userDropdown.map(user => ({
    label: user.name,
    value: user.id.toString(),
  }));

  const [selectionMode, setSelectionMode] = useState<
    'salereport' | 'detailedsalereport' | ''
  >('salereport');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData = dailyReports;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Pagination For Daily Detailed Reports
  const [currentPageSingle, setCurrentPageSingle] = useState(1);
  const recordsPerPageSingle = 10;

  const currentDataSingle = dailyDetailedReports;
  const totalRecordsSingle = currentDataSingle.length;
  const totalPagesSinyle = Math.ceil(totalRecordsSingle / recordsPerPageSingle);

  // Slice data for pagination
  const paginatedDataDetailed = currentDataSingle.slice(
    (currentPageSingle - 1) * recordsPerPageSingle,
    currentPageSingle * recordsPerPageSingle,
  );

  // Report Print
  const handlePrint = async () => {
    const dataList =
      selectionMode === 'salereport' ? dailyReports : dailyDetailedReports;

    if (dataList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const userName =
      userDropdown.find(user => user.id.toString() === userValue)?.name ||
      'User';

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
              ${
                selectionMode === 'detailedsalereport' &&
                `<td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_total_amount}</td>`
              }
              ${
                selectionMode === 'salereport' &&
                `<td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_order_total}</td>
                <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_discount}</td>
                <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_total_amount}</td>
                <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_payment_amount}</td>
                <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_change_amount}</td>`
              }
              <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
                item.sal_profit
              }</td>
            </tr>`,
      )
      .join('');

    // HTML Template
    const html = `
          <html>
            <head>
              <meta charset="utf-8">
              <title>Daily Sales</title>
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
                    selectionMode === 'salereport'
                      ? 'Daily Sales'
                      : 'Daily Sale Detail'
                  }
                </div>
              </div>
      
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div style="font-size:12px; font-weight: bold;">
                  User: ${userName ? userName : 'All Users'}
                </div>
              </div>
                
              <table style="border-collapse:collapse; width:100%; font-size:12px;">
                <thead>
                  <tr style="background:#f0f0f0;">
                    <th style="border:1px solid #000; padding:6px;">Sr#</th>
                    <th style="border:1px solid #000; padding:6px;">Invoice#</th>
                    <th style="border:1px solid #000; padding:6px;">Customer</th>
                    <th style="border:1px solid #000; padding:6px;">Date</th>
                    ${
                      selectionMode === 'detailedsalereport' &&
                      `<th style="border:1px solid #000; padding:6px;">Sale</th>`
                    }
                    ${
                      selectionMode === 'salereport' &&
                      `<th style="border:1px solid #000; padding:6px;">Order Total</th>
                    <th style="border:1px solid #000; padding:6px;">Discount</th>
                    <th style="border:1px solid #000; padding:6px;">Total Amount</th>
                    <th style="border:1px solid #000; padding:6px;">Paid</th>
                    <th style="border:1px solid #000; padding:6px;">Balance</th>`
                    }
                    <th style="border:1px solid #000; padding:6px;">Profit</th>
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

  // Fetch Category Dropdown
  const fetchCatDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcombocat`);
      setCategoryDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
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

  // Fetch User Dropdown
  const fetchUserDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchusersdropdown`);
      setUserDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  //Fetch Daily Sale Report
  const fetchDailyReport = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchsingledailysales`, {
        user: userValue,
        category: catValue,
        product: prodValue,
      });
      setDailyReports(res.data.sales);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Daily Detailed Sale Report
  const fetchDailyDetailedReport = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchsingledailysaledetails`, {
        user: userValue,
        category: catValue,
        product: prodValue,
      });
      setDailyDetailedReports(res.data.sales);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Sales
  const calculateDailyTotals = () => {
    let totalSale = 0;
    let totalProfit = 0;
    let totalReceived = 0;

    dailyReports.forEach(sale => {
      const sales = parseFloat(sale.sal_total_amount) || 0;
      const profit = parseFloat(sale.sal_profit) || 0;
      const received = parseFloat(sale.sal_payment_amount) || 0;

      totalSale += sales;
      totalProfit += profit;
      totalReceived += received;
    });

    return {
      totalSale: totalSale.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      totalCreditSale: (totalSale - totalReceived).toFixed(2),
    };
  };

  // Calculate Total Sales
  const calculateDailyDailtedTotals = () => {
    let totalSale = 0;
    let totalProfit = 0;
    let totalReceived = 0;

    dailyDetailedReports.forEach(sale => {
      const sales = parseFloat(sale.sal_total_amount) || 0;
      const profit = parseFloat(sale.sal_profit) || 0;
      const received = parseFloat(sale.sal_payment_amount) || 0;

      totalSale += sales;
      totalProfit += profit;
      totalReceived += received;
    });

    return {
      totalSale: totalSale.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      totalCreditSale: (totalSale - totalReceived).toFixed(2),
    };
  };

  const totals =
    selectionMode === 'salereport'
      ? calculateDailyTotals()
      : calculateDailyDailtedTotals();

  useEffect(() => {
    fetchCatDropdown();
    fetchProdDropdown();
    fetchUserDropdown();
    fetchDailyReport();
    fetchDailyDetailedReport();
  }, [userValue, catValue, prodValue]);

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
            <Text style={styles.headerTitle}>Daily Sale</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} onPress={handlePrint}>
            <Icon name="printer" size={24} color="white" />
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
              <Text style={styles.radioText}>Daily Sale Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSelectionMode('detailedsalereport');
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
              <Text style={styles.radioText}>Detailed Daily Sale Report</Text>
            </TouchableOpacity>
          </View>

          {/* Dropdown */}
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{width: '48%'}}>
              <DropDownPicker
                items={transformedCategory}
                open={catOpen}
                setOpen={setCatOpen}
                value={catValue}
                setValue={setCatValue}
                placeholder="Select Category"
                disabled={selectionMode === 'salereport'}
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
                  selectionMode === 'salereport' && styles.dropdownDisabled,
                ]}
                dropDownContainerStyle={styles.dropDownContainer}
              />
            </View>

            <View style={{width: '48%'}}>
              <DropDownPicker
                items={transformedProd}
                open={prodOpen}
                setOpen={setProdOpen}
                value={prodValue}
                setValue={setProdValue}
                placeholder="Select Product"
                disabled={selectionMode === 'salereport'}
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
                  {zIndex: 1000},
                  selectionMode === 'salereport' && styles.dropdownDisabled,
                ]}
                dropDownContainerStyle={styles.dropDownContainer}
              />
            </View>
          </View>

          <View style={{width: '100%'}}>
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
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total Sales: </Text>
            <Text style={styles.summaryValue}>{totals.totalSale}</Text>
          </View>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total Sale Profit: </Text>
            <Text style={styles.summaryValue}>{totals.totalProfit}</Text>
          </View>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total Received: </Text>
            <Text style={styles.summaryValue}>{totals.totalReceived}</Text>
          </View>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total Credit Sale: </Text>
            <Text style={styles.summaryValue}>{totals.totalCreditSale}</Text>
          </View>
        </View>

        {selectionMode === 'salereport' && (
          <View style={styles.listContainer}>
            <FlatList
              data={paginatedData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View style={styles.card}>
                  {/* Header Row */}
                  <View style={styles.headerRow}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {item.cust_name?.charAt(0) || 'C'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.productName}>{item.cust_name}</Text>
                      <Text style={styles.invcName}>{item.sal_invoice_no}</Text>
                    </View>
                  </View>

                  {/* Info Section */}
                  <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon
                          name="receipt"
                          size={18}
                          color="#144272"
                          style={styles.infoIcon}
                        />
                        <Text style={styles.labelText}>Invoice</Text>
                      </View>
                      <Text style={styles.valueText}>
                        {item.sal_invoice_no}
                      </Text>
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
                          name="cart"
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
                          name="sale"
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
                          name="cash-multiple"
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
                          name="check-decagram"
                          size={18}
                          color="#144272"
                          style={styles.infoIcon}
                        />
                        <Text style={styles.labelText}>Paid</Text>
                      </View>
                      <Text style={styles.valueText}>
                        {item.sal_payment_amount}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon
                          name="wallet"
                          size={18}
                          color="#144272"
                          style={styles.infoIcon}
                        />
                        <Text style={styles.labelText}>Balance</Text>
                      </View>
                      <Text style={styles.valueText}>
                        {item.sal_change_amount}
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
                  <Icon name="account-group" size={48} color="#666" />
                  <Text style={styles.emptyText}>No record found.</Text>
                </View>
              }
              contentContainerStyle={{paddingBottom: 70}}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {selectionMode === 'detailedsalereport' && (
          <View style={styles.listContainer}>
            <FlatList
              data={paginatedDataDetailed}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View style={styles.card}>
                  {/* Header Row */}
                  <View style={styles.headerRow}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {item.cust_name?.charAt(0) || 'C'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.productName}>
                        {item.sal_invoice_no}
                      </Text>
                      <Text style={styles.invcName}>{item.cust_name}</Text>
                    </View>
                  </View>

                  {/* Info Section */}
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
                          name="cash-multiple"
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
                  <Icon name="account-group" size={48} color="#666" />
                  <Text style={styles.emptyText}>No record found.</Text>
                </View>
              }
              contentContainerStyle={{paddingBottom: 70}}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Pagination Controls */}
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

        {selectionMode === 'detailedsalereport' && totalRecordsSingle > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPageSingle === 1}
              onPress={() =>
                setCurrentPageSingle(prev => Math.max(prev - 1, 1))
              }
              style={[
                styles.pageButton,
                currentPageSingle === 1 && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPageSingle === 1 && styles.pageButtonTextDisabled,
                ]}>
                Prev
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                Page <Text style={styles.pageCurrent}>{currentPageSingle}</Text>{' '}
                of {totalPagesSinyle}
              </Text>
              <Text style={styles.totalText}>
                Total: {totalRecordsSingle} records
              </Text>
            </View>

            <TouchableOpacity
              disabled={currentPageSingle === totalPagesSinyle}
              onPress={() =>
                setCurrentPageSingle(prev =>
                  Math.min(prev + 1, totalPagesSinyle),
                )
              }
              style={[
                styles.pageButton,
                currentPageSingle === totalPagesSinyle &&
                  styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPageSingle === totalPagesSinyle &&
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
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
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
  dropdown: {
    borderWidth: 1,
    borderColor: '#144272',
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
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
  invcName: {
    fontSize: 12,
    color: 'gray',
    flexWrap: 'wrap',
  },
});
