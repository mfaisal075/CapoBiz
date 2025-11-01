import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import RNPrint from 'react-native-print';
import Toast from 'react-native-toast-message';
import {useUser} from '../../../CTX/UserContext';
import backgroundColors from '../../../Colors';

interface ProductDropdown {
  id: number;
  prod_name: string;
}

interface Category {
  id: number;
  pcat_name: string;
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
  cust_contact: string;
  cust_address: string;
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

export default function DailySaleReport() {
  const {openDrawer} = useDrawer();
  const {bussAddress, bussName} = useUser();
  const [prodOpen, setProdOpen] = useState(false);
  const [prodValue, setProdValue] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [catValue, setCatValue] = useState('');
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
  const [dailyReports, setDailyReports] = useState<DailyReports[]>([]);
  const [dailyDetailedReports, setDailyDetailedReports] = useState<
    DailyDetailedReports[]
  >([]);

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
            ${
              selectionMode === 'detailedsalereport' &&
              `<td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.cust_contact}</td>
              <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.cust_address}</td>`
            }
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
              <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_change_amount}</td>
              <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${item.sal_profit}</td>`
            }
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
                User: All Users
              </div>
            </div>
              
            <table style="border-collapse:collapse; width:100%; font-size:12px;">
              <thead>
                <tr style="background:#f0f0f0;">
                  <th style="border:1px solid #000; padding:6px;">Sr#</th>
                  <th style="border:1px solid #000; padding:6px;">Invoice#</th>
                  <th style="border:1px solid #000; padding:6px;">Customer</th>
                  ${
                    selectionMode === 'detailedsalereport' &&
                    `<th style="border:1px solid #000; padding:6px;">Contact</th>
                    <th style="border:1px solid #000; padding:6px;">Address</th>`
                  }
                  <th style="border:1px solid #000; padding:6px;">Date</th>
                  ${
                    selectionMode === 'detailedsalereport' &&
                    `<th style="border:1px solid #000; padding:6px;">Sale</th>`
                  }
                  ${`<th style="border:1px solid #000; padding:6px;">Order Total</th>
                  <th style="border:1px solid #000; padding:6px;">Discount</th>
                  <th style="border:1px solid #000; padding:6px;">Total Amount</th>
                  <th style="border:1px solid #000; padding:6px;">Paid</th>
                  <th style="border:1px solid #000; padding:6px;">Balance</th>
                  <th style="border:1px solid #000; padding:6px;">Profit</th>`}
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

  // Fetch Category Dropdown
  const fetchCatDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcategories`);
      setCategoryDropdown(res.data.cat);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Daily Report
  const fetchDailyReport = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchdailysales`, {
        category: catValue,
        product: prodValue,
      });
      setDailyReports(res.data.sales);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Daily Detailed Report
  const fetchDailyDetailedReport = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchdailysaledetails`, {
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
    fetchDailyReport();
    fetchDailyDetailedReport();
  }, [catValue, prodValue]);

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
            <Text style={styles.headerTitle}>Daily Sale Report</Text>
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
              <Text style={styles.radioText}>Daily Sale Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.radioButton, {opacity: 0.5}]}
              disabled={true}>
              <RadioButton
                value="detailedsalereport"
                status={'unchecked'}
                color={backgroundColors.primary}
                uncheckedColor={backgroundColors.dark}
                disabled={true}
              />
              <Text style={[styles.radioText, {color: '#999'}]}>
                Detailed Daily Sale Report
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dropdown */}
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
              selectionMode === 'salereport' && styles.dropdownDisabled,
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
            disabled={selectionMode === 'salereport'}
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
              {zIndex: 1000},
              selectionMode === 'salereport' && styles.dropdownDisabled,
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
                      {item.sal_order_total ?? '0'}
                    </Text>
                    <Text style={styles.subText}>
                      <Text style={{fontWeight: '600'}}>Discount: </Text>
                      {item.sal_discount ?? '0'}
                    </Text>
                    <Text style={styles.subText}>
                      <Text style={{fontWeight: '600'}}>Net Payable: </Text>
                      {item.sal_total_amount ?? '0'}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="account-group" size={48} color="#666" />
                  <Text style={styles.emptyText}>No record found.</Text>
                </View>
              }
              contentContainerStyle={{paddingBottom: 90}}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
        {/* {selectionMode === 'detailedsalereport' && (
          <View style={styles.listContainer}>
            <FlatList
              data={paginatedDataDetailed}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View style={styles.card}>
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

                  <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon
                          name="phone"
                          size={18}
                          color="#144272"
                          style={styles.infoIcon}
                        />
                        <Text style={styles.labelText}>Contact</Text>
                      </View>
                      <Text style={styles.valueText}>{item.cust_contact}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon
                          name="map-marker"
                          size={18}
                          color="#144272"
                          style={styles.infoIcon}
                        />
                        <Text style={styles.labelText}>Address</Text>
                      </View>
                      <Text style={styles.valueText}>{item.cust_address}</Text>
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
        )} */}

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

        {/* {selectionMode === 'detailedsalereport' && totalRecordsSingle > 0 && (
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
        )} */}
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
});
