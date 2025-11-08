import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import RNPrint from 'react-native-print';
import Toast from 'react-native-toast-message';
import backgroundColors from '../../Colors';

interface Users {
  id: number;
  name: string;
}

interface CashRegisterData {
  id: number;
  name: string;
  creg_closing_amount: string;
  creg_cash_in_hand: string;
  creg_opening_date: string;
  creg_closing_date: string;
}

export default function CashRegister({navigation}: any) {
  const {token} = useUser();
  const {bussAddress, bussName} = useUser();
  const {openDrawer} = useDrawer();
  const [userOpen, setUserOpen] = useState(false);
  const [userValue, setUserValue] = useState('');
  const [cashRegister, setCashRegister] = useState<CashRegisterData[]>([]);
  const [usersDropdown, setUsersDropdown] = useState<Users[]>([]);
  const transformedUsers = usersDropdown.map(user => ({
    label: user.name,
    value: user.id.toString(),
  }));

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

  const currentData = cashRegister;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Handle Print
  const handlePrint = async () => {
    if (currentData.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const userName =
      usersDropdown.find(user => user.id.toString() === userValue)?.name ||
      'All User';

    // Get current date
    const dateStr = new Date().toLocaleDateString();

    // Build HTML table rows
    const rows = currentData
      .map(
        (item, index) => `
          <tr>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
              index + 1
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.name
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
              item.creg_opening_date,
            ).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
              item.creg_closing_date,
            ).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.creg_cash_in_hand
            }</td>
            <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
              item.creg_closing_amount
            }</td>
          </tr>`,
      )
      .join('');

    // HTML Template
    const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Cash Register</title>
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
                Cash Register
              </div>
            </div>
    
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div style="font-size:12px; font-weight: bold;">
                User: ${userName ? userName : 'All Users'}
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
                  <th style="border:1px solid #000; padding:6px;">User Name</th>
                  <th style="border:1px solid #000; padding:6px;">Opening Date</th>
                  <th style="border:1px solid #000; padding:6px;">Closing Date</th>
                  <th style="border:1px solid #000; padding:6px;">Opening Account</th>
                  <th style="border:1px solid #000; padding:6px;">Closing Account</th>
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

  // Fetch Users Dropdown
  const fetchUsersDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchusers`);
      setUsersDropdown(res.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Cash Register
  const fetchCashRegister = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.get(
        `${BASE_URL}/fetchcashregister?from=${from}&to=${to}&user=${userValue}&_token=${token}`,
      );
      setCashRegister(res.data.cash_register);
    } catch (error) {
      console.log();
    }
  };

  // Calculate Total Closing and Opening Amount
  const calculateClsOpnTotal = () => {
    let totalClosingAmount = 0;
    let totalOpenAmount = 0;

    cashRegister.forEach(cash => {
      const closing = parseFloat(cash.creg_closing_amount) || 0;
      const opening = parseFloat(cash.creg_cash_in_hand) || 0;

      totalClosingAmount += closing;
      totalOpenAmount += opening;
    });

    return {
      totalOpenAmount: totalOpenAmount.toFixed(2),
      totalClosingAmount: totalClosingAmount.toFixed(2),
    };
  };

  const totals = calculateClsOpnTotal();

  useEffect(() => {
    fetchUsersDropdown();
    fetchCashRegister();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [userValue, startDate, endDate]);

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
            <Text style={styles.headerTitle}>Cash Register</Text>
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
            <Text style={styles.summaryLabel}>Total Opening Amount: </Text>
            <Text style={styles.summaryValue}>
              {formatNumber(totals.totalOpenAmount)}
            </Text>
          </View>
          <View style={styles.innerSummaryCtx}>
            <Text style={styles.summaryLabel}>Total Closing Amount: </Text>
            <Text style={styles.summaryValue}>
              {formatNumber(totals.totalClosingAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            style={{marginTop: 10}}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.subText}>
                      <Text style={{fontWeight: '600'}}>Opening Date: </Text>
                      {new Date(item.creg_opening_date)
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
                      <Text style={{fontWeight: '600'}}>Closing Date: </Text>
                      {item.creg_closing_date
                        ? new Date(item.creg_closing_date)
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
                    <Text style={{fontWeight: '600'}}>Opening Amount: </Text>
                    {formatNumber(item.creg_cash_in_hand) ?? '0'}
                  </Text>
                  <Text style={styles.subText}>
                    <Text style={{fontWeight: '600'}}>Closing Amount: </Text>
                    {formatNumber(item.creg_closing_amount) ?? '0'}
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
                Total: {totalRecords} records
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

  // FlatList Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: '3%',
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
    marginTop: 10,
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
});
