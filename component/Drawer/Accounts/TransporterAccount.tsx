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
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
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

interface Transporter {
  id: number;
  trans_name: string;
  trans_cnic: string;
  trans_address: string;
}

interface AllTransporterData {
  trans_name: string;
  transac_total_bill_amount: string;
  transac_paid_amount: string;
  transac_balance: string;
}

interface SingleAccountDetails {
  id: number;
  transac_trans_id: number;
  transac_invoice_no: string;
  transac_date: string;
  transac_total_bill_amount: string;
  transac_paid_amount: string;
  transac_balance: string;
  transac_payment_type: string;
  transac_payment_method: string;
}

export default function TransporterAccount() {
  const {openDrawer, closeDrawer} = useDrawer();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('Single');
  const [Open, setOpen] = useState(false);
  const [transValue, setTransValue] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [transDropdown, setTransDropdown] = useState<Transporter[]>([]);
  const transformedTrans = transDropdown.map(trans => ({
    label: trans.trans_name,
    value: trans.id.toString(),
  }));
  const [transData, setTransData] = useState<Transporter | null>(null);
  const [allTransData, setAllTransData] = useState<AllTransporterData[]>([]);
  const [singleAccDetails, setSingleAccDetails] = useState<
    SingleAccountDetails[]
  >([]);
  const [selectedOption, setSelectedOption] = useState<
    'withoutDetails' | 'withDetails'
  >('withoutDetails');

  // Pagination states
  const [currentPageSingle, setCurrentPageSingle] = useState(1);
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

  // Fetch Transporter dropdown
  const fetchTransDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchtransportersdropdown`);
      setTransDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Transporter Data
  const getTransData = async () => {
    if (transValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchtransporterdata`, {
          id: transValue,
        });
        setTransData({
          id: res.data.transporter.id,
          trans_address: res.data.transporter.trans_address,
          trans_cnic: res.data.transporter.trans_cnic,
          trans_name: res.data.transporter.trans_name,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Fetch All Transporter Data
  const fetchAllTransporterData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/alltransporteraccount`);
      setAllTransData(res.data.supp);
      setCurrentPageAll(1);
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

  // Calculate All Transporter Totals
  const calculateAllTransTotals = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    allTransData.forEach(trans => {
      const receivables = parseFloat(trans.transac_total_bill_amount) || 0;
      const received = parseFloat(trans.transac_paid_amount) || 0;

      totalReceivables += receivables;
      totalReceived += received;
    });

    return {
      totalReceivables: totalReceivables.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      netReceivables: (totalReceivables - totalReceived).toFixed(2),
    };
  };

  // Fetch Single Transporter Details
  const fetchTransportDetails = async () => {
    try {
      const from = fromDate?.toISOString().split('T')[0];
      const to = toDate?.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/singletransporteraccount`, {
        transporter_id: transData?.id,
        from,
        to,
      });
      setSingleAccDetails(res.data.account);
      setCurrentPageSingle(1);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Single Transporter Totals
  const calculateSingleTransTotals = () => {
    let totalReceivables = 0;
    let totalReceived = 0;

    singleAccDetails.forEach(trans => {
      const receivables = parseFloat(trans.transac_total_bill_amount) || 0;
      const received = parseFloat(trans.transac_paid_amount) || 0;

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
            color={currentPage === 1 ? '#ccc' : '#fff'}
          />
        </TouchableOpacity>

        <View style={styles.pageInfo}>
          <Text style={styles.pageText}>
            {currentPage} <Text style={{color: '#999'}}>/</Text> {totalPages}
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
            color={currentPage === totalPages ? '#ccc' : '#fff'}
          />
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    fetchTransDropdown();
    getTransData();
    fetchAllTransporterData();
    fetchTransportDetails();

    const backKey = () => {
      navigation.navigate('Dashboard' as never);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [transValue, fromDate, toDate]);

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
            <Text style={styles.headerTitle}>Transporter Account</Text>
            <View style={{width: 24}} />
          </View>
        </LinearGradient>

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
              Single Transporter
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
              All Transporters
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
              navigation.navigate('TransporterAddPayment' as never);
            }}>
            <Icon name="cash-plus" size={20} color="white" />
            <Text style={styles.actionBtnText}>Add Payment</Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'Single' ? (
          <>
            {/* Filter Card */}
            <View style={styles.filterCard}>
              <Text style={styles.cardTitle}>Filter Options</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Transporter</Text>
                <DropDownPicker
                  items={transformedTrans}
                  open={Open}
                  value={transValue}
                  setValue={setTransValue}
                  setOpen={setOpen}
                  placeholder="Select Transporter"
                  placeholderStyle={{color: '#999'}}
                  textStyle={{color: THEME.textDark}}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                  searchable
                  zIndex={3000}
                  zIndexInverse={1000}
                />
              </View>

              {transData && (
                <View style={styles.customerInfoBox}>
                  <Text style={styles.custInfoTitle}>
                    {transData.trans_name}
                  </Text>
                  <Text style={styles.custInfoSub}>
                    {transData.trans_cnic} | {transData.trans_address}
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date Range</Text>
                <View style={styles.dateRow}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker('from')}
                    style={styles.dateInput}>
                    <Icon
                      name="calendar-range"
                      size={20}
                      color={THEME.primary}
                    />
                    <Text style={styles.dateText}>
                      {fromDate ? fromDate.toLocaleDateString() : 'From Date'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker('to')}
                    style={styles.dateInput}>
                    <Icon
                      name="calendar-range"
                      size={20}
                      color={THEME.primary}
                    />
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

            {/* Transaction Table */}
            {/* Transaction List (Card Based) */}
            <View style={styles.listSection}>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderTitle}>TRANSACTIONS</Text>
                <View>
                  <Text style={styles.listHeaderCount}>
                    {singleAccDetails.length}
                  </Text>
                </View>
              </View>

              {singleAccDetails.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="receipt" size={36} color={THEME.textGray} />
                  <Text style={styles.emptyText}>No transactions found.</Text>
                </View>
              ) : (
                <>
                  {getPaginatedData(singleAccDetails, currentPageSingle).map(
                    (item: any) => (
                      <View key={item.id} style={styles.transactionCard}>
                        <View style={styles.transactionHeader}>
                          <View style={styles.invoiceBadge}>
                            <Icon
                              name="file-document-outline"
                              size={14}
                              color={THEME.primary}
                            />
                            <Text style={styles.invoiceText}>
                              {item.transac_invoice_no}
                            </Text>
                          </View>
                          <Text style={styles.dateTextList}>
                            {new Date(item.transac_date).toLocaleDateString(
                              'en-GB',
                            )}
                          </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statsRow}>
                          <View style={styles.statCol}>
                            <Text style={styles.statLabel}>PAYABLE</Text>
                            <Text
                              style={[
                                styles.statValue,
                                {color: THEME.primary},
                              ]}>
                              {formatNumber(item.transac_total_bill_amount)}
                            </Text>
                          </View>
                          <View style={styles.statColCenter}>
                            <Text style={styles.statLabel}>PAID</Text>
                            <Text
                              style={[
                                styles.statValue,
                                {color: THEME.success},
                              ]}>
                              {formatNumber(item.transac_paid_amount)}
                            </Text>
                          </View>
                          <View style={styles.statColRight}>
                            <Text style={styles.statLabel}>BALANCE</Text>
                            <Text
                              style={[styles.statValue, {color: THEME.danger}]}>
                              {formatNumber(item.transac_balance)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ),
                  )}
                  <PaginationControls
                    currentPage={currentPageSingle}
                    totalPages={getTotalPages(singleAccDetails.length)}
                    onPageChange={setCurrentPageSingle}
                  />
                </>
              )}
            </View>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Account Summary</Text>
              {(() => {
                const {netReceivables, totalReceivables, totalReceived} =
                  calculateSingleTransTotals();
                return (
                  <>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Payables</Text>
                      <Text style={styles.summaryValue}>
                        {formatNumber(totalReceivables)}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Paid</Text>
                      <Text style={styles.summaryValue}>
                        {formatNumber(totalReceived)}
                      </Text>
                    </View>
                    <View style={[styles.summaryRow, {marginTop: 5}]}>
                      <Text
                        style={[
                          styles.summaryLabel,
                          {color: THEME.primary, fontWeight: '700'},
                        ]}>
                        Net Payables
                      </Text>
                      <Text
                        style={[
                          styles.summaryValue,
                          {
                            color: THEME.primary,
                            fontWeight: '700',
                            fontSize: 16,
                          },
                        ]}>
                        {formatNumber(netReceivables)}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </View>
          </>
        ) : (
          <>
            {/* All Transporters Table */}
            {/* All Transporters List (Card Based) */}
            <View style={styles.listSection}>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderTitle}>ALL TRANSPORTERS</Text>
                <View>
                  <Text style={styles.listHeaderCount}>
                    {allTransData.length}
                  </Text>
                </View>
              </View>

              {allTransData.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="account-group" size={36} color={THEME.textGray} />
                  <Text style={styles.emptyText}>
                    No transporter accounts found.
                  </Text>
                </View>
              ) : (
                <>
                  {getPaginatedData(allTransData, currentPageAll).map(
                    (item: any, index: number) => (
                      <View key={index} style={styles.transactionCard}>
                        <View style={styles.cardHeaderSimple}>
                          <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                              {item.trans_name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.customerName}>
                            {item.trans_name}
                          </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statsRow}>
                          <View style={styles.statCol}>
                            <Text style={styles.statLabel}>BILL</Text>
                            <Text
                              style={[
                                styles.statValue,
                                {color: THEME.primary},
                              ]}>
                              {formatNumber(item.transac_total_bill_amount)}
                            </Text>
                          </View>
                          <View style={styles.statColCenter}>
                            <Text style={styles.statLabel}>PAID</Text>
                            <Text
                              style={[
                                styles.statValue,
                                {color: THEME.success},
                              ]}>
                              {formatNumber(item.transac_paid_amount)}
                            </Text>
                          </View>
                          <View style={styles.statColRight}>
                            <Text style={styles.statLabel}>BALANCE</Text>
                            <Text
                              style={[styles.statValue, {color: THEME.danger}]}>
                              {formatNumber(item.transac_balance)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ),
                  )}
                  <PaginationControls
                    currentPage={currentPageAll}
                    totalPages={getTotalPages(allTransData.length)}
                    onPageChange={setCurrentPageAll}
                  />
                </>
              )}
            </View>

            {/* All Transporters Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Overall Summary</Text>
              {(() => {
                const {totalReceivables, totalReceived, netReceivables} =
                  calculateAllTransTotals();
                return (
                  <>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Payables</Text>
                      <Text style={styles.summaryValue}>
                        {formatNumber(totalReceivables)}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Paid</Text>
                      <Text style={styles.summaryValue}>
                        {formatNumber(totalReceived)}
                      </Text>
                    </View>
                    <View style={[styles.summaryRow, {marginTop: 5}]}>
                      <Text
                        style={[
                          styles.summaryLabel,
                          {color: THEME.primary, fontWeight: '700'},
                        ]}>
                        Net Payables
                      </Text>
                      <Text
                        style={[
                          styles.summaryValue,
                          {
                            color: THEME.primary,
                            fontWeight: '700',
                            fontSize: 16,
                          },
                        ]}>
                        {formatNumber(netReceivables)}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </View>
          </>
        )}

        <View style={{height: 50}} />

        {showDatePicker && (
          <DateTimePicker
            value={
              showDatePicker === 'from'
                ? fromDate ?? new Date()
                : toDate ?? new Date()
            }
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}
      </ScrollView>
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
