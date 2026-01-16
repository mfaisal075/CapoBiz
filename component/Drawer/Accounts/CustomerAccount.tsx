import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  BackHandler,
  StatusBar,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {RadioButton} from 'react-native-paper';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BASE_URL from '../../BASE_URL';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomBar from '../../BottomBar';

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  primarySoft: 'rgba(42, 101, 43, 0.1)',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textDark: '#1F2937',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  shadow: '#000',
  info: '#3B82F6',
};

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
  const ITEMS_PER_PAGE = 10;

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

  // Calculate All Customer Totals
  const calculateTotals = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    allCustAccount.forEach(item => {
      const receivables = parseFloat(item.custac_total_bill_amount) || 0;
      const received = parseFloat(item.custac_paid_amount) || 0;

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
          style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}>
          <Icon
            name="chevron-left"
            size={24}
            color={currentPage === 1 ? '#ccc' : THEME.white}
          />
        </TouchableOpacity>

        <View style={styles.pageInfo}>
          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.pageBtn,
            currentPage === totalPages && styles.pageBtnDisabled,
          ]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}>
          <Icon
            name="chevron-right"
            size={24}
            color={currentPage === totalPages ? '#ccc' : THEME.white}
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

    const backKey = () => {
      navigation.navigate('Dashboard' as never);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [customerVal, fromDate, toDate]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Customer Account</Text>
            <View style={{width: 24}} />
          </View>
        </LinearGradient>

        {/* Floating Segment Control (Replaces Search Bar) */}
        <View style={styles.floatingSegmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              selectedTab === 'Single' && styles.segmentBtnActive,
            ]}
            onPress={() => setSelectedTab('Single')}>
            <Text
              style={[
                styles.segmentText,
                selectedTab === 'Single' && styles.segmentTextActive,
              ]}>
              Single Customer
            </Text>
          </TouchableOpacity>
          <View style={styles.segmentDivider} />
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              selectedTab === 'All' && styles.segmentBtnActive,
            ]}
            onPress={() => setSelectedTab('All')}>
            <Text
              style={[
                styles.segmentText,
                selectedTab === 'All' && styles.segmentTextActive,
              ]}>
              All Customer
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}>
        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: THEME.primary}]}
            onPress={() => {
              closeDrawer();
              navigation.navigate('AddCustomerPayment' as never);
            }}>
            <Icon name="cash-plus" size={20} color="white" />
            <Text style={styles.actionBtnText}>Add Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: THEME.danger}]}
            onPress={() => {
              closeDrawer();
              navigation.navigate('ChequeClearance' as never);
            }}>
            <Icon name="bank-remove" size={20} color="white" />
            <Text style={styles.actionBtnText}>Clearance</Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'Single' ? (
          <>
            {/* Filter Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Filter Options</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Customer</Text>
                <DropDownPicker
                  items={transformedCust}
                  open={Open}
                  value={customerVal}
                  setValue={setCustomerVal}
                  setOpen={setOpen}
                  placeholder="Select Customer"
                  placeholderStyle={{color: '#999'}}
                  textStyle={{color: THEME.textDark}}
                  style={styles.dropdown}
                  dropDownContainerStyle={[styles.dropdownContainer]}
                  listMode="SCROLLVIEW"
                  searchable
                />
              </View>

              {custData && (
                <View style={styles.customerInfoBox}>
                  <Text style={styles.custInfoTitle}>{custData.cust_name}</Text>
                  <Text style={styles.custInfoSub}>
                    {custData.cust_fathername} | {custData.cust_address}
                  </Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date Range</Text>
                <View style={styles.dateRow}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker('from')}
                    style={styles.dateInput}>
                    <Icon name="calendar" size={20} color={THEME.primary} />
                    <Text style={styles.dateText}>
                      {fromDate ? fromDate.toLocaleDateString() : 'From Date'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker('to')}
                    style={styles.dateInput}>
                    <Icon name="calendar" size={20} color={THEME.primary} />
                    <Text style={styles.dateText}>
                      {toDate ? toDate.toLocaleDateString() : 'To Date'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>View Type</Text>
                <View style={styles.radioRow}>
                  <TouchableOpacity
                    style={[
                      styles.radioChip,
                      selectedOption === 'withoutDetails' &&
                        styles.radioChipActive,
                    ]}
                    onPress={() => setSelectedOption('withoutDetails')}>
                    <Text
                      style={[
                        styles.radioLabel,
                        selectedOption === 'withoutDetails' &&
                          styles.radioLabelActive,
                      ]}>
                      Summary
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.radioChip,
                      selectedOption === 'withDetails' &&
                        styles.radioChipActive,
                    ]}
                    onPress={() => setSelectedOption('withDetails')}>
                    <Text
                      style={[
                        styles.radioLabel,
                        selectedOption === 'withDetails' &&
                          styles.radioLabelActive,
                      ]}>
                      Detailed
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Transaction List */}
            <View style={styles.listSection}>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderTitle}>Transactions</Text>
                <Text style={styles.listHeaderCount}>
                  {selectedOption === 'withoutDetails'
                    ? accountDetailsWithout.length
                    : accountDetailsWith.length}
                </Text>
              </View>

              {selectedOption === 'withoutDetails' ? (
                accountDetailsWithout.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Icon name="receipt" size={48} color={THEME.textLight} />
                    <Text style={styles.emptyText}>No transactions found.</Text>
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
                            <View style={styles.invoiceBadge}>
                              <Icon
                                name="file-document-outline"
                                size={14}
                                color={THEME.primary}
                              />
                              <Text style={styles.invoiceText}>
                                {item.custac_invoice_no}
                              </Text>
                            </View>
                            <Text style={styles.dateTextList}>
                              {new Date(item.custac_date).toLocaleDateString(
                                'en-GB',
                              )}
                            </Text>
                          </View>

                          <View style={styles.divider} />

                          <View style={styles.statsRow}>
                            <View style={styles.statCol}>
                              <Text style={styles.statLabel}>Payable</Text>
                              <Text style={styles.statValue}>
                                {item.custac_total_bill_amount}
                              </Text>
                            </View>
                            <View style={styles.statColCenter}>
                              <Text style={styles.statLabel}>Paid</Text>
                              <Text
                                style={[
                                  styles.statValue,
                                  {color: THEME.success},
                                ]}>
                                {item.custac_paid_amount}
                              </Text>
                            </View>
                            <View style={styles.statColRight}>
                              <Text style={styles.statLabel}>Balance</Text>
                              <Text
                                style={[
                                  styles.statValue,
                                  {color: THEME.danger},
                                ]}>
                                {item.custac_balance}
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
                  <Icon name="receipt" size={48} color={THEME.textLight} />
                  <Text style={styles.emptyText}>No transactions found.</Text>
                </View>
              ) : (
                <>
                  <FlatList
                    data={getPaginatedData(accountDetailsWith, currentPageWith)}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    renderItem={({item}) => (
                      <View style={styles.transactionCard}>
                        <View style={styles.transactionHeader}>
                          <View style={styles.invoiceBadge}>
                            <Icon
                              name="file-document-outline"
                              size={14}
                              color={THEME.primary}
                            />
                            <Text style={styles.invoiceText}>
                              {item.custac_invoice_no}
                            </Text>
                          </View>
                          <Text style={styles.dateTextList}>
                            {new Date(item.custac_date).toLocaleDateString(
                              'en-GB',
                            )}
                          </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.statsRow}>
                          <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Payable</Text>
                            <Text style={styles.statValue}>
                              {item.custac_total_bill_amount}
                            </Text>
                          </View>
                          <View style={styles.statColCenter}>
                            <Text style={styles.statLabel}>Paid</Text>
                            <Text
                              style={[
                                styles.statValue,
                                {color: THEME.success},
                              ]}>
                              {item.custac_paid_amount}
                            </Text>
                          </View>
                          <View style={styles.statColRight}>
                            <Text style={styles.statLabel}>Balance</Text>
                            <Text
                              style={[styles.statValue, {color: THEME.danger}]}>
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
            </View>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Account Summary</Text>
              </View>
              <View style={styles.summaryBody}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryItemLabel}>Unpaid Cheques</Text>
                  <Text style={styles.summaryItemValue}>
                    {chequeCount || '0'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryItemLabel}>
                    Unpaid Cheque Amount
                  </Text>
                  <Text style={styles.summaryItemValue}>
                    {parseFloat(chequeAmount || '0').toFixed(2)}
                  </Text>
                </View>

                {(() => {
                  const {netReceivables, totalReceivables, totalReceived} =
                    calculateWithoutTotals();
                  return (
                    <>
                      <View style={styles.summaryDivider} />
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryItemLabel}>
                          Total Receivables
                        </Text>
                        <Text style={styles.summaryItemValue}>
                          {totalReceivables}
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryItemLabel}>
                          Total Received
                        </Text>
                        <Text style={styles.summaryItemValue}>
                          {totalReceived}
                        </Text>
                      </View>
                      <View style={styles.summaryTotalRow}>
                        <Text style={styles.summaryTotalLabel}>
                          Net Receivables
                        </Text>
                        <Text style={styles.summaryTotalValue}>
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
            {/* All Customers List */}
            <View style={styles.listSection}>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderTitle}>All Accounts</Text>
              </View>

              {allCustAccount.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon
                    name="account-group"
                    size={48}
                    color={THEME.textLight}
                  />
                  <Text style={styles.emptyText}>
                    No customer accounts found.
                  </Text>
                </View>
              ) : (
                <>
                  <FlatList
                    data={getPaginatedData(allCustAccount, currentPageAll)}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={false}
                    renderItem={({item}) => (
                      <View style={styles.transactionCard}>
                        <View style={styles.cardHeaderSimple}>
                          <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                              {item.cust_name.substring(0, 2).toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.customerName}>
                            {item.cust_name}
                          </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.statsRow}>
                          <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Total Bill</Text>
                            <Text style={styles.statValue}>
                              {item.custac_total_bill_amount}
                            </Text>
                          </View>
                          <View style={styles.statColCenter}>
                            <Text style={styles.statLabel}>Paid</Text>
                            <Text
                              style={[
                                styles.statValue,
                                {color: THEME.success},
                              ]}>
                              {item.custac_paid_amount}
                            </Text>
                          </View>
                          <View style={styles.statColRight}>
                            <Text style={styles.statLabel}>Balance</Text>
                            <Text
                              style={[styles.statValue, {color: THEME.danger}]}>
                              {item.custac_balance}
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
            </View>

            {/* Overall Totals */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Overall Summary</Text>
              </View>
              {(() => {
                const {netReceivables, totalReceivables, totalReceived} =
                  calculateTotals();
                return (
                  <View style={styles.summaryBody}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryItemLabel}>
                        Total Receivables
                      </Text>
                      <Text style={styles.summaryItemValue}>
                        {totalReceivables}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryItemLabel}>
                        Total Received
                      </Text>
                      <Text style={styles.summaryItemValue}>
                        {totalReceived}
                      </Text>
                    </View>
                    <View style={styles.summaryTotalRow}>
                      <Text style={styles.summaryTotalLabel}>
                        Net Receivables
                      </Text>
                      <Text style={styles.summaryTotalValue}>
                        {netReceivables}
                      </Text>
                    </View>
                  </View>
                );
              })()}
            </View>
          </>
        )}
      </ScrollView>

      {/* Date Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={
            showDatePicker === 'from'
              ? fromDate || new Date()
              : toDate || new Date()
          }
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  // --- HEADER ---
  headerWrapper: {
    marginBottom: 20,
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 40, // Extra space for floating segment
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },

  // --- FLOATING SEGMENT ---
  floatingSegmentContainer: {
    position: 'absolute',
    bottom: -24,
    left: 20,
    right: 20,
    backgroundColor: THEME.white,
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  segmentBtn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: THEME.primaryLight,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textGray,
  },
  segmentTextActive: {
    color: THEME.primary,
    fontWeight: '700',
  },
  segmentDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#eee',
    marginHorizontal: 4,
  },

  // --- CONTENT ---
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 2,
    gap: 5,
  },
  actionBtnText: {
    color: 'white', // Keeping 'white' string as THEME.white might be string too but consistency with local file usage
    fontWeight: '600',
    fontSize: 13,
  },

  // Card Styles
  card: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textGray,
    marginBottom: 6,
  },
  dropdown: {
    borderColor: THEME.border,
    borderRadius: 10,
    minHeight: 45,
  },
  dropdownContainer: {
    borderColor: THEME.border,
  },
  customerInfoBox: {
    marginTop: -4,
    marginBottom: 12,
    backgroundColor: THEME.primaryLight,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: THEME.primary,
  },
  custInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.primary,
  },
  custInfoSub: {
    fontSize: 12,
    color: THEME.textGray,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    backgroundColor: THEME.white,
  },
  dateText: {
    fontSize: 13,
    color: THEME.textDark,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 10,
  },
  radioChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  radioChipActive: {
    backgroundColor: THEME.primaryLight,
    borderColor: THEME.primary,
  },
  radioLabel: {
    fontSize: 13,
    color: THEME.textGray,
    fontWeight: '600',
  },
  radioLabelActive: {
    color: THEME.primary,
  },

  // Transaction List Styles
  listSection: {
    marginBottom: 20,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  listHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textGray,
    textTransform: 'uppercase',
  },
  listHeaderCount: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.primary,
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 10,
    color: THEME.textGray,
    fontSize: 14,
  },

  // Transaction Card
  transactionCard: {
    backgroundColor: THEME.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  invoiceText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.primary,
  },
  dateTextList: {
    fontSize: 12,
    color: THEME.textGray,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
  },
  statColCenter: {
    flex: 1,
    alignItems: 'center',
  },
  statColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 11,
    color: THEME.textGray,
    marginBottom: 2,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textDark,
  },

  // All Customer specific styles
  cardHeaderSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.primary,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  summaryHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    textTransform: 'uppercase',
  },
  summaryBody: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemLabel: {
    fontSize: 13,
    color: THEME.textGray,
  },
  summaryItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: THEME.primaryLight,
    padding: 10,
    borderRadius: 8,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.primary,
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.primary,
  },

  // Pagination Controls
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
    gap: 16,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pageBtnDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  pageInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pageText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textDark,
  },
});
