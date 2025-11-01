import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
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
import backgroundColors from '../../Colors';

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

export default function CustomerAccounts() {
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
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  // Pagination for Customer
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData = custChequeList;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedDataCust = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Pagination For Suppliers
  const [currentPageSingle, setCurrentPageSingle] = useState(1);
  const recordsPerPageSingle = 10;

  const currentDataSingle = suppChequeList;
  const totalRecordsSingle = currentDataSingle.length;
  const totalPagesSinyle = Math.ceil(totalRecordsSingle / recordsPerPageSingle);

  // Slice data for pagination
  const paginatedDataSupp = currentDataSingle.slice(
    (currentPageSingle - 1) * recordsPerPageSingle,
    currentPageSingle * recordsPerPageSingle,
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
  }, [startDate, endDate, statusValue]);

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
              source={require('../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Cheque List</Text>
          </View>

          <TouchableOpacity style={[styles.headerBtn]} onPress={handlePrint}>
            <Icon name="printer" size={24} color="#fff" />
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
            items={statusItems}
            open={statusOpen}
            setOpen={setStatusOpen}
            value={statusValue}
            setValue={setStatusValue}
            placeholder="Select Status"
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
            style={[styles.dropdown]}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode="FLATLIST"
            listItemLabelStyle={{
              color: backgroundColors.dark,
              fontWeight: '500',
            }}
            labelStyle={{
              color: backgroundColors.dark,
              fontSize: 16,
            }}
          />

          {/* Radio Buttons */}
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSelectionMode('customers');
              }}>
              <RadioButton
                value="customers"
                status={selectionMode === 'customers' ? 'checked' : 'unchecked'}
                color={backgroundColors.primary}
                uncheckedColor={backgroundColors.dark}
              />
              <Text style={styles.radioText}>Customers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSelectionMode('suppliers');
              }}>
              <RadioButton
                value="suppliers"
                status={selectionMode === 'suppliers' ? 'checked' : 'unchecked'}
                color={backgroundColors.primary}
                uncheckedColor={backgroundColors.dark}
              />
              <Text style={styles.radioText}>Suppliers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total Cheque Amount: </Text>
            <Text style={styles.summaryValue}>{totals.totalSale}</Text>
          </View>
        </View>

        {selectionMode === 'customers' && (
          <View style={styles.listContainer}>
            <FlatList
              data={paginatedDataCust}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View style={styles.card}>
                  {/* Avatar + Name + Actions */}
                  <View style={styles.row}>
                    <View>
                      <Text style={styles.name}>{item.cust_name}</Text>
                      <Text style={styles.subText}>
                        <Text style={{fontWeight: '600'}}>Due Date: </Text>
                        {new Date(item.chi_date)
                          .toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')}
                      </Text>
                    </View>

                    <View style={[{alignSelf: 'flex-start', marginTop: 22}]}>
                      <Text style={[styles.subText, {verticalAlign: 'top'}]}>
                        <Text style={{fontWeight: '600'}}>
                          Clearance Date:{' '}
                        </Text>
                        {item.chi_clear_date
                          ? new Date(item.chi_clear_date)
                              .toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                              .replace(/ /g, '-')
                          : 'Not Cleared'}
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
                      <Text style={{fontWeight: '600'}}>Cheque No#: </Text>
                      {item.chi_number ?? '0'}
                    </Text>
                    <Text style={styles.subText}>
                      <Text style={{fontWeight: '600'}}>Amount: </Text>
                      {formatNumber(item.chi_amount) ?? '0'}
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

        {selectionMode === 'suppliers' && (
          <View style={styles.listContainer}>
            <FlatList
              data={paginatedDataSupp}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View style={styles.card}>
                  {/* Avatar + Name + Actions */}
                  <View style={styles.row}>
                    <View>
                      <Text style={styles.name}>{item.sup_name}</Text>
                      <Text style={styles.subText}>
                        <Text style={{fontWeight: '600'}}>Due Date: </Text>
                        {new Date(item.chi_date)
                          .toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')}
                      </Text>
                    </View>

                    <View style={[{alignSelf: 'flex-start', marginTop: 22}]}>
                      <Text style={[styles.subText, {verticalAlign: 'top'}]}>
                        <Text style={{fontWeight: '600'}}>
                          Clearance Date:{' '}
                        </Text>
                        {item.chi_clear_date
                          ? new Date(item.chi_clear_date)
                              .toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                              .replace(/ /g, '-')
                          : 'Not Cleared'}
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
                      <Text style={{fontWeight: '600'}}>Cheque No#: </Text>
                      {item.chi_number ?? '0'}
                    </Text>
                    <Text style={styles.subText}>
                      <Text style={{fontWeight: '600'}}>Amount: </Text>
                      {formatNumber(item.chi_amount) ?? '0'}
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

        {/* Pagination Controls */}
        {selectionMode === 'customers' && totalRecords > 0 && (
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

        {selectionMode === 'suppliers' && totalRecordsSingle > 0 && (
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
    width: '60%',
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
    borderColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    maxHeight: 75,
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
});
