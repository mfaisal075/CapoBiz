import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {RadioButton} from 'react-native-paper';
import {useDrawer} from '../../DrawerContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BASE_URL from '../../BASE_URL';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../BottomBar';

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F0F2F5',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  shadow: '#000',
};

interface Suppliers {
  id: number;
  sup_name: string;
  sup_company_name: string;
  sup_address: string;
}

interface SuppliersAccounts {
  sup_name: string;
  supac_total_bill_amount: string;
  supac_paid_amount: string;
  supac_balance: string;
}

interface DetailsWithout {
  id: string;
  supac_invoice_no: string;
  supac_date: string;
  supac_total_bill_amount: string;
  supac_paid_amount: string;
  supac_balance: string;
  supac_payment_type: string;
  supac_payment_method: string;
}

interface DetailsWith {
  id: string;
  supac_invoice_no: string;
  supac_date: string;
  supac_total_bill_amount: string;
  supac_paid_amount: string;
  supac_balance: string;
}

export default function SupplierAccount() {
  const {openDrawer, closeDrawer} = useDrawer();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('Single');
  const [Open, setOpen] = useState(false);
  const [suppValue, setSuppValue] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [suppDropdown, setSuppDropdown] = useState<Suppliers[]>([]);
  const transformedSupp = suppDropdown.map(sup => ({
    label: `${sup.sup_name}_${sup.sup_company_name}`,
    value: sup.id.toString(),
  }));
  const [suppData, setSuppData] = useState<Suppliers | null>(null);
  const [allSuppAccount, setAllSuppAccount] = useState<SuppliersAccounts[]>([]);
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

  // Fetch Supplier dropdown
  const fetchSuppDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadsuppliers`);
      setSuppDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Supplier Data
  const getSuppData = async () => {
    if (suppValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchsuppdata`, {
          id: suppValue,
        });
        setSuppData({
          sup_address: res.data.supplier.sup_address,
          sup_company_name: res.data.supplier.sup_company_name,
          sup_name: res.data.supplier.sup_name,
          id: res.data.supplier.id,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Fetch All Supplier
  const fetchAllSuppAccounts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/allsupplieraccount`);
      setAllSuppAccount(res.data.supp);
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

    allSuppAccount.forEach(account => {
      const receivable = parseFloat(account.supac_total_bill_amount) || 0;
      const received = parseFloat(account.supac_paid_amount) || 0;

      totalReceivables += receivable;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  // Fetch Single Supplier Without Details
  const fetchSuppWithoutDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.post(
        `${BASE_URL}/singlesupplieraccountwithoutdetail`,
        {
          supplier_id: suppValue,
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

  // Fetch Single Supplier With Details
  const fetchSuppWithDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/singlesupplieraccount`, {
        supplier_id: suppValue,
        from,
        to,
      });
      setAccountDetailsWith(res.data.account);
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
      const receivables = parseFloat(invc.supac_total_bill_amount) || 0;
      const received = parseFloat(invc.supac_paid_amount) || 0;

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
    fetchSuppDropdown();
    getSuppData();
    fetchAllSuppAccounts();
    fetchSuppWithoutDetails();
    fetchSuppWithDetails();

    const backKey = () => {
      navigation.navigate('Dashboard' as never);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [suppValue, fromDate, toDate]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Supplier Account</Text>
            <View style={{width: 24}} />
          </View>
        </LinearGradient>

        {/* Floating Segment Control */}
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
              Single Supplier
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
              All Suppliers
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
              navigation.navigate('SupplierAddPayment' as never);
            }}>
            <Icon name="cash-plus" size={20} color="white" />
            <Text style={styles.actionBtnText}>Add Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: THEME.danger}]}
            onPress={() => {
              closeDrawer();
              navigation.navigate('SupplierChequeClearance' as never);
            }}>
            <Icon name="bank-remove" size={20} color="white" />
            <Text style={styles.actionBtnText}>Clearance</Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'Single' ? (
          <>
            {/* Filter Card */}
            <View style={styles.filterCard}>
              <Text style={styles.cardTitle}>Filter Options</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Supplier</Text>
                <DropDownPicker
                  items={transformedSupp}
                  open={Open}
                  value={suppValue}
                  setValue={setSuppValue}
                  setOpen={setOpen}
                  placeholder="Select Supplier"
                  placeholderStyle={{color: '#999'}}
                  textStyle={{color: THEME.textDark}}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                  searchable
                />
              </View>

              {suppData && (
                <View style={styles.customerInfoBox}>
                  <Text style={styles.custInfoTitle}>{suppData.sup_name}</Text>
                  <Text style={styles.custInfoSub}>
                    {suppData.sup_company_name} | {suppData.sup_address}
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
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

              <View style={styles.inputGroup}>
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
                  <View style={styles.emptyContainer}>
                    <Icon name="receipt" size={48} color="#ccc" />
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
                                {item.supac_invoice_no}
                              </Text>
                            </View>
                            <Text style={styles.dateTextList}>
                              {new Date(item.supac_date).toLocaleDateString(
                                'en-GB',
                              )}
                            </Text>
                          </View>

                          <View style={styles.divider} />

                          <View style={styles.statsRow}>
                            <View style={styles.statCol}>
                              <Text style={styles.statLabel}>Payable</Text>
                              <Text style={styles.statValue}>
                                {item.supac_total_bill_amount}
                              </Text>
                            </View>
                            <View style={styles.statColCenter}>
                              <Text style={styles.statLabel}>Paid</Text>
                              <Text
                                style={[
                                  styles.statValue,
                                  {color: THEME.success},
                                ]}>
                                {item.supac_paid_amount}
                              </Text>
                            </View>
                            <View style={styles.statColRight}>
                              <Text style={styles.statLabel}>Balance</Text>
                              <Text
                                style={[
                                  styles.statValue,
                                  {color: THEME.danger},
                                ]}>
                                {item.supac_balance}
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
                <View style={styles.emptyContainer}>
                  <Icon name="receipt" size={48} color="#ccc" />
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
                              {item.supac_invoice_no}
                            </Text>
                          </View>
                          <Text style={styles.dateTextList}>
                            {new Date(item.supac_date).toLocaleDateString(
                              'en-GB',
                            )}
                          </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.statsRow}>
                          <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Payable</Text>
                            <Text style={styles.statValue}>
                              {item.supac_total_bill_amount}
                            </Text>
                          </View>
                          <View style={styles.statColCenter}>
                            <Text style={styles.statLabel}>Paid</Text>
                            <Text
                              style={[
                                styles.statValue,
                                {color: THEME.success},
                              ]}>
                              {item.supac_paid_amount}
                            </Text>
                          </View>
                          <View style={styles.statColRight}>
                            <Text style={styles.statLabel}>Balance</Text>
                            <Text
                              style={[styles.statValue, {color: THEME.danger}]}>
                              {item.supac_balance}
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
                <Text style={styles.cardTitle}>Account Summary</Text>
              </View>
              <View style={styles.summaryBody}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Unpaid Cheques</Text>
                  <Text style={styles.summaryValue}>{chequeCount || '0'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Unpaid Cheque Amount</Text>
                  <Text style={styles.summaryValue}>
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
                        <Text style={styles.summaryLabel}>
                          Total Receivables
                        </Text>
                        <Text style={styles.summaryValue}>
                          {totalReceivables}
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Received</Text>
                        <Text style={styles.summaryValue}>{totalReceived}</Text>
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
            {/* All Suppliers List */}
            <View style={styles.listSection}>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderTitle}>All Accounts</Text>
              </View>

              {allSuppAccount.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="account-group-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>
                    No supplier accounts found.
                  </Text>
                </View>
              ) : (
                <>
                  <FlatList
                    data={getPaginatedData(allSuppAccount, currentPageAll)}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={false}
                    renderItem={({item}) => (
                      <View style={styles.transactionCard}>
                        <View style={styles.cardHeaderSimple}>
                          <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                              {item.sup_name.substring(0, 2).toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.customerName}>
                            {item.sup_name}
                          </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.statsRow}>
                          <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Bill Amount</Text>
                            <Text style={styles.statValue}>
                              {formatNumber(item.supac_total_bill_amount)}
                            </Text>
                          </View>
                          <View style={styles.statColCenter}>
                            <Text style={styles.statLabel}>Paid</Text>
                            <Text
                              style={[
                                styles.statValue,
                                {color: THEME.success},
                              ]}>
                              {formatNumber(item.supac_paid_amount)}
                            </Text>
                          </View>
                          <View style={styles.statColRight}>
                            <Text style={styles.statLabel}>Balance</Text>
                            <Text
                              style={[styles.statValue, {color: THEME.danger}]}>
                              {formatNumber(item.supac_balance)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  />
                  <PaginationControls
                    currentPage={currentPageAll}
                    totalPages={getTotalPages(allSuppAccount.length)}
                    onPageChange={setCurrentPageAll}
                  />
                </>
              )}
            </View>

            {/* All Suppliers Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.cardTitle}>Overall Summary</Text>
              </View>
              {(() => {
                const {totalReceivables, totalReceived, netReceivables} =
                  calculateTotals();
                return (
                  <View style={styles.summaryBody}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Receivables</Text>
                      <Text style={styles.summaryValue}>
                        {formatNumber(totalReceivables)}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Received</Text>
                      <Text style={styles.summaryValue}>
                        {formatNumber(totalReceived)}
                      </Text>
                    </View>
                    <View style={styles.summaryTotalRow}>
                      <Text style={styles.summaryTotalLabel}>
                        Net Receivables
                      </Text>
                      <Text style={styles.summaryTotalValue}>
                        {formatNumber(netReceivables)}
                      </Text>
                    </View>
                  </View>
                );
              })()}
            </View>
          </>
        )}
        <View style={{height: 100}} />
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
  headerTop: {
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
  menuBtn: {
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
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },

  // Card Styles
  filterCard: {
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    textTransform: 'uppercase',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  inputGroup: {
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
  emptyContainer: {
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

  // Transaction Card (New)
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
  summaryBody: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: THEME.textGray,
  },
  summaryValue: {
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

  // All Supplier specific styles
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
