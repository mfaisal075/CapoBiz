import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  Image,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {RadioButton} from 'react-native-paper';
import {useDrawer} from '../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BASE_URL from '../../BASE_URL';
import axios from 'axios';
import backgroundColors from '../../Colors';

interface Customers {
  id: number;
  cust_name: string;
  cust_fathername: string;
  cust_address: string;
}

interface CustomersAccounts {
  cust_name: string;
  custac_total_bill_amount: string;
  custac_paid_amount: string;
  custac_balance: string;
}

interface DetailsWithout {
  id: string;
  custac_invoice_no: string;
  custac_date: string;
  custac_total_bill_amount: string;
  custac_paid_amount: string;
  custac_balance: string;
  custac_payment_type: string;
  custac_payment_method: string;
}

interface DetailsWith {
  id: string;
  custac_invoice_no: string;
  custac_date: string;
  custac_total_bill_amount: string;
  custac_paid_amount: string;
  custac_balance: string;
}

export default function CustomerAccount() {
  const {openDrawer, closeDrawer} = useDrawer();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('Single');
  const [Open, setOpen] = useState(false);
  const [customerVal, setCustomerVal] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [custDropdown, setCustDropdown] = useState<Customers[]>([]);
  const transformedCust = custDropdown.map(cust => ({
    label: `${cust.cust_name} s/o ${cust.cust_fathername} | ${cust.cust_address}`,
    value: cust.id.toString(),
  }));
  const [custData, setCustData] = useState<Customers | null>(null);
  const [allCustAccount, setAllCustAccount] = useState<CustomersAccounts[]>([]);
  const [accountDetailsWithout, setAccountDetailsWithout] = useState<
    DetailsWithout[]
  >([]);
  const [accountDetailsWith, setAccountDetailsWith] = useState<DetailsWith[]>(
    [],
  );
  const [chequeCount, setChequeCount] = useState('');
  const [chequeAmount, setChequeAmount] = useState('');
  const [selectedOption, setSelectedOption] = useState<
    'withoutDetails' | 'withDetails'
  >('withoutDetails');

  // Pagination states
  const [currentPageWithout, setCurrentPageWithout] = useState(1);
  const [currentPageWith, setCurrentPageWith] = useState(1);
  const [currentPageAll, setCurrentPageAll] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(null);
      return;
    }

    if (selectedDate) {
      if (showDatePicker === 'from') {
        setFromDate(selectedDate);
      } else if (showDatePicker === 'to') {
        setToDate(selectedDate);
      }
    }
    setShowDatePicker(null);
  };

  // Pagination helper functions
  const getPaginatedData = (data: any[], currentPage: number) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength: number) => {
    return Math.ceil(dataLength / ITEMS_PER_PAGE);
  };

  // Fetch Customer dropdown
  const fetchCustDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchdropcustomer`);
      setCustDropdown(res.data.customers);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Customet Data
  const getCustData = async () => {
    if (customerVal) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchcustdata`, {
          id: customerVal,
        });
        setCustData({
          cust_address: res.data.customer.cust_address,
          cust_fathername: res.data.customer.cust_fathername,
          cust_name: res.data.customer.cust_name,
          id: res.data.customer.id,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Fetch All Customer
  const fetchAllCustAccounts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/allcustomeraccount`);
      setAllCustAccount(res.data.cust);
      setCurrentPageAll(1); // Reset to first page on data fetch
    } catch (error) {
      console.log(error);
    }
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

  //Calculate Totals
  const calculateTotals = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    allCustAccount.forEach(account => {
      const receivable = parseFloat(account.custac_total_bill_amount) || 0;
      const received = parseFloat(account.custac_paid_amount) || 0;

      totalReceivables += receivable;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  // Fetch Single Customer Without Details
  const fetchCustWithoutDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.post(
        `${BASE_URL}/singlecustomeraccountwithoutdetail`,
        {
          customer_id: customerVal,
          from,
          to,
        },
      );
      setAccountDetailsWithout(res.data.cust);
      setChequeCount(res.data.no_of_chqs);
      setChequeAmount(res.data.chq[0]?.chi_amount || 0);
      setCurrentPageWithout(1); // Reset to first page on data fetch
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Single Customer With Details
  const fetchCustWithDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/singlecustomeraccount`, {
        customer_id: customerVal,
        from,
        to,
      });
      setAccountDetailsWith(res.data.cust);
      setCurrentPageWith(1); // Reset to first page on data fetch
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate With Details Totals
  const calculateWithoutTotals = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    accountDetailsWith.forEach(invc => {
      const receivables = parseFloat(invc.custac_total_bill_amount) || 0;
      const received = parseFloat(invc.custac_paid_amount) || 0;

      totalReceivables += receivables;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  // Pagination Component
  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationBtn,
            currentPage === 1 && styles.paginationBtnDisabled,
          ]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}>
          <Icon
            name="chevron-left"
            size={20}
            color={
              currentPage === 1 ? 'rgba(0,0,0,0.3)' : backgroundColors.dark
            }
          />
        </TouchableOpacity>

        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Page {currentPage} of {totalPages}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.paginationBtn,
            currentPage === totalPages && styles.paginationBtnDisabled,
          ]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}>
          <Icon
            name="chevron-right"
            size={20}
            color={
              currentPage === totalPages
                ? 'rgba(0,0,0,0.3)'
                : backgroundColors.dark
            }
          />
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    fetchCustDropdown();
    getCustData();
    fetchAllCustAccounts();
    fetchCustWithoutDetails();
    fetchCustWithDetails();
  }, [customerVal, fromDate, toDate]);

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
            <Text style={styles.headerTitle}>Customer Account</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} nestedScrollEnabled>
          {/* Toggle Buttons */}
          <View style={styles.toggleBtnContainer}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'Single' && {
                  backgroundColor: backgroundColors.primary,
                },
              ]}
              onPress={() => setSelectedTab('Single')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  selectedTab === 'Single' && {color: backgroundColors.light},
                ]}>
                Single Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'All' && {
                  backgroundColor: backgroundColors.primary,
                },
              ]}
              onPress={() => setSelectedTab('All')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  selectedTab === 'All' && {color: backgroundColors.light},
                ]}>
                All Customer
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View
            style={[
              styles.toggleBtnContainer,
              {
                justifyContent: 'flex-end',
                marginVertical: 4,
              },
            ]}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {backgroundColor: backgroundColors.primary},
              ]}
              onPress={() => {
                closeDrawer();
                navigation.navigate('AddCustomerPayment' as never);
              }}>
              <Icon name="payment" size={16} color="white" />
              <Text style={styles.actionBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {backgroundColor: backgroundColors.danger},
              ]}
              onPress={() => {
                closeDrawer();
                navigation.navigate('ChequeClearance' as never);
              }}>
              <Icon name="account-balance-wallet" size={16} color="white" />
              <Text style={styles.actionBtnText}>-</Text>
            </TouchableOpacity>
          </View>

          {selectedTab === 'Single' ? (
            <>
              {/* Single Customer Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Information</Text>

                <View style={styles.dropdownRow}>
                  <Icon
                    name="person"
                    size={28}
                    color={backgroundColors.dark}
                    style={styles.personIcon}
                  />
                  <DropDownPicker
                    items={transformedCust}
                    open={Open}
                    value={customerVal}
                    setValue={setCustomerVal}
                    setOpen={setOpen}
                    placeholder="Select Customer"
                    placeholderStyle={styles.dropdownPlaceholder}
                    textStyle={styles.dropdownText}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    ArrowUpIconComponent={() => (
                      <Icon
                        name="keyboard-arrow-up"
                        size={18}
                        color={backgroundColors.dark}
                      />
                    )}
                    ArrowDownIconComponent={() => (
                      <Icon
                        name="keyboard-arrow-down"
                        size={18}
                        color={backgroundColors.dark}
                      />
                    )}
                    listMode="SCROLLVIEW"
                    listItemLabelStyle={{
                      color: backgroundColors.dark,
                      fontWeight: '500',
                    }}
                    labelStyle={{
                      color: backgroundColors.dark,
                      marginLeft: 30,
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

                {custData && (
                  <View style={styles.customerInfo}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Customer Name:</Text>
                      <Text style={styles.infoValue}>
                        {custData.cust_name ?? 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Father Name:</Text>
                      <Text style={styles.infoValue}>
                        {custData.cust_fathername ?? 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Address:</Text>
                      <Text style={styles.infoValue}>
                        {custData.cust_address ?? 'N/A'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Date Range Section */}
                <View style={styles.dateSection}>
                  <Text style={styles.inputLabel}>Date Range</Text>
                  <View style={styles.dateRow}>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker('from')}
                      style={styles.dateInput}>
                      <Icon
                        name="event"
                        size={20}
                        color={backgroundColors.dark}
                      />
                      <Text style={styles.dateText}>
                        {fromDate ? fromDate.toLocaleDateString() : 'From Date'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker('to')}
                      style={styles.dateInput}>
                      <Icon
                        name="event"
                        size={20}
                        color={backgroundColors.dark}
                      />
                      <Text style={styles.dateText}>
                        {toDate ? toDate.toLocaleDateString() : 'To Date'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={
                      showDatePicker === 'from'
                        ? fromDate ?? new Date()
                        : toDate ?? new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}

                {/* Account Type Selection */}
                <View style={styles.accountTypeSection}>
                  <Text style={styles.inputLabel}>Account</Text>
                  <RadioButton.Group
                    onValueChange={value =>
                      setSelectedOption(
                        value as 'withoutDetails' | 'withDetails',
                      )
                    }
                    value={selectedOption}>
                    <View style={styles.radioRow}>
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setSelectedOption('withoutDetails')}>
                        <RadioButton.Android
                          value="withoutDetails"
                          color={backgroundColors.primary}
                          uncheckedColor={backgroundColors.dark}
                        />
                        <Text style={styles.radioLabel}>Without Details</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setSelectedOption('withDetails')}>
                        <RadioButton.Android
                          value="withDetails"
                          color={backgroundColors.primary}
                          uncheckedColor={backgroundColors.dark}
                        />
                        <Text style={styles.radioLabel}>With Details</Text>
                      </TouchableOpacity>
                    </View>
                  </RadioButton.Group>
                </View>
              </View>

              {/* Account Details Section */}
              <View style={[styles.section, {marginBottom: 20}]}>
                <Text style={styles.sectionTitle}>
                  {selectedOption === 'withoutDetails'
                    ? 'Account Summary'
                    : 'Detailed Transactions'}
                </Text>

                {selectedOption === 'withoutDetails' ? (
                  accountDetailsWithout.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Icon name="receipt" size={40} color="rgba(0,0,0,0.5)" />
                      <Text style={styles.emptyStateText}>
                        No transactions found
                      </Text>
                    </View>
                  ) : (
                    <>
                      <FlatList
                        data={getPaginatedData(
                          accountDetailsWithout,
                          currentPageWithout,
                        )}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        renderItem={({item}) => (
                          <View style={styles.transactionCard}>
                            <View style={styles.transactionHeader}>
                              <Text style={styles.invoiceNumber}>
                                {item.custac_invoice_no}
                              </Text>
                              <Text style={styles.transactionDate}>
                                {new Date(item.custac_date)
                                  .toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                  .replace(/ /g, '-')}
                              </Text>
                            </View>

                            <View style={styles.transactionDetails}>
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Payable:</Text>
                                <Text style={styles.detailValue}>
                                  {item.custac_total_bill_amount}
                                </Text>
                              </View>
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Paid:</Text>
                                <Text style={styles.detailValue}>
                                  {item.custac_paid_amount}
                                </Text>
                              </View>
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Balance:</Text>
                                <Text style={styles.detailValue}>
                                  {item.custac_balance}
                                </Text>
                              </View>
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Type:</Text>
                                <Text style={styles.detailValue}>
                                  {item.custac_payment_type}
                                </Text>
                              </View>
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Method:</Text>
                                <Text style={styles.detailValue}>
                                  {item.custac_payment_method}
                                </Text>
                              </View>
                            </View>
                          </View>
                        )}
                      />
                      <PaginationControls
                        currentPage={currentPageWithout}
                        totalPages={getTotalPages(accountDetailsWithout.length)}
                        onPageChange={setCurrentPageWithout}
                      />
                    </>
                  )
                ) : accountDetailsWith.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Icon name="receipt" size={40} color="rgba(0,0,0,0.5)" />
                    <Text style={styles.emptyStateText}>
                      No detailed transactions found
                    </Text>
                  </View>
                ) : (
                  <>
                    <FlatList
                      data={getPaginatedData(
                        accountDetailsWith,
                        currentPageWith,
                      )}
                      keyExtractor={item => item.id}
                      scrollEnabled={false}
                      renderItem={({item}) => (
                        <View style={styles.transactionCard}>
                          <View style={styles.transactionHeader}>
                            <Text style={styles.invoiceNumber}>
                              {item.custac_invoice_no}
                            </Text>
                            <Text style={styles.transactionDate}>
                              {new Date(item.custac_date).toLocaleDateString(
                                'en-GB',
                              )}
                            </Text>
                          </View>

                          <View style={styles.transactionDetails}>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Payable:</Text>
                              <Text style={styles.detailValue}>
                                {item.custac_total_bill_amount}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Paid:</Text>
                              <Text style={styles.detailValue}>
                                {item.custac_paid_amount}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Balance:</Text>
                              <Text style={styles.detailValue}>
                                {item.custac_balance}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    />
                    <PaginationControls
                      currentPage={currentPageWith}
                      totalPages={getTotalPages(accountDetailsWith.length)}
                      onPageChange={setCurrentPageWith}
                    />
                  </>
                )}

                {/* Summary Section */}
                <View style={styles.summarySection}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Unpaid Cheques:</Text>
                    <Text style={styles.summaryValue}>
                      {chequeCount || '0'}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      Unpaid Cheque Amount:
                    </Text>
                    <Text style={styles.summaryValue}>
                      {parseFloat(chequeAmount || '0').toFixed(2)}
                    </Text>
                  </View>
                  {(() => {
                    const {netReceivables, totalReceivables, totalReceived} =
                      calculateWithoutTotals();
                    return (
                      <>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>
                            Total Receivables:
                          </Text>
                          <Text style={styles.summaryValue}>
                            {totalReceivables}
                          </Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>
                            Total Received:
                          </Text>
                          <Text style={styles.summaryValue}>
                            {totalReceived}
                          </Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                          <Text
                            style={[styles.summaryLabel, styles.totalLabel]}>
                            Net Receivables:
                          </Text>
                          <Text
                            style={[styles.summaryValue, styles.totalValue]}>
                            {netReceivables}
                          </Text>
                        </View>
                      </>
                    );
                  })()}
                </View>
              </View>
            </>
          ) : (
            <>
              {/* All Customers Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>All Customer Accounts</Text>

                {allCustAccount.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Icon name="people" size={40} color="rgba(0,0,0,0.5)" />
                    <Text style={styles.emptyStateText}>
                      No customer accounts found
                    </Text>
                  </View>
                ) : (
                  <>
                    <FlatList
                      data={getPaginatedData(allCustAccount, currentPageAll)}
                      keyExtractor={(item, index) => index.toString()}
                      scrollEnabled={false}
                      renderItem={({item}) => (
                        <View style={styles.customerAccountCard}>
                          <Text style={styles.customerName}>
                            {item.cust_name}
                          </Text>
                          <View style={styles.accountDetails}>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>
                                Bill Amount:
                              </Text>
                              <Text style={styles.detailValue}>
                                {formatNumber(item.custac_total_bill_amount)}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>
                                Paid Amount:
                              </Text>
                              <Text style={styles.detailValue}>
                                {formatNumber(item.custac_paid_amount)}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Balance:</Text>
                              <Text style={styles.detailValue}>
                                {formatNumber(item.custac_balance)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    />
                    <PaginationControls
                      currentPage={currentPageAll}
                      totalPages={getTotalPages(allCustAccount.length)}
                      onPageChange={setCurrentPageAll}
                    />
                  </>
                )}

                {/* All Customers Summary */}
                <View style={styles.summarySection}>
                  {(() => {
                    const {totalReceivables, totalReceived, netReceivables} =
                      calculateTotals();
                    return (
                      <>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>
                            Total Receivables:
                          </Text>
                          <Text style={styles.summaryValue}>
                            {formatNumber(totalReceivables)}
                          </Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>
                            Total Received:
                          </Text>
                          <Text style={styles.summaryValue}>
                            {formatNumber(totalReceived)}
                          </Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                          <Text
                            style={[styles.summaryLabel, styles.totalLabel]}>
                            Net Receivables:
                          </Text>
                          <Text
                            style={[styles.summaryValue, styles.totalValue]}>
                            {formatNumber(netReceivables)}
                          </Text>
                        </View>
                      </>
                    );
                  })()}
                </View>
              </View>
            </>
          )}
        </ScrollView>
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

  scrollContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  toggleBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  toggleBtn: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: backgroundColors.light,
    borderColor: backgroundColors.gray,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  toggleBtnText: {
    color: backgroundColors.dark,
    fontWeight: '600',
    fontSize: 16,
  },
  actionBtn: {
    width: '15%',
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    marginLeft: 4,
  },
  section: {
    backgroundColor: backgroundColors.light,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginVertical: 8,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.dark,
    marginBottom: 16,
  },
  dropdownRow: {
    marginBottom: 16,
  },
  inputLabel: {
    color: 'rgba(0,0,0,0.8)',
    fontSize: 14,
    marginBottom: 6,
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
    elevation: 10,
    height: 48,
    marginBottom: 4,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    maxHeight: 200,
  },
  dropdownText: {
    color: 'white',
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: 'rgba(0,0,0,0.7)',
    marginLeft: 30,
    fontSize: 16,
  },
  personIcon: {
    position: 'absolute',
    zIndex: 10000,
    top: 7,
    left: 6,
  },
  customerInfo: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    color: backgroundColors.dark,
    fontSize: 14,
  },
  dateSection: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
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
    elevation: 10,
    height: 48,
  },
  dateText: {
    color: backgroundColors.dark,
    fontSize: 14,
    marginLeft: 8,
  },
  accountTypeSection: {
    marginBottom: 16,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '75%',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceNumber: {
    color: backgroundColors.dark,
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDate: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 12,
  },
  transactionDetails: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    color: backgroundColors.dark,
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    color: backgroundColors.dark,
    fontSize: 12,
  },
  customerAccountCard: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  customerName: {
    color: backgroundColors.dark,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  accountDetails: {
    marginTop: 4,
  },
  summarySection: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryValue: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '400',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.2)',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    color: backgroundColors.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: backgroundColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Pagination Styles
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  paginationBtn: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  paginationBtnDisabled: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderColor: 'rgba(0,0,0,0.05)',
  },
  paginationInfo: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  paginationText: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '600',
  },
});
