import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {RadioButton} from 'react-native-paper';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../../Colors';

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
  const [selectedTab, setSelectedTab] = useState('Single');
  const {openDrawer, closeDrawer} = useDrawer();
  const navigation = useNavigation();
  const [Open, setOpen] = useState(false);
  const [transValue, setTransValue] = useState<string | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'from' | 'to' | null>(
    null,
  );
  const [selectedOption, setSelectedOption] = useState<
    'withoutDetails' | 'withDetails'
  >('withoutDetails');
  const [allTransData, setAllTransData] = useState<AllTransporterData[]>([]);
  const [transDropdown, setTransDropdown] = useState<Transporter[]>([]);
  const [transData, setTransData] = useState<Transporter | null>(null);
  const [singleAccDetails, setSingleAccDetails] = useState<
    SingleAccountDetails[]
  >([]);

  // Pagination states
  const [currentPageAll, setCurrentPageAll] = useState(1);
  const [currentPageSingle, setCurrentPageSingle] = useState(1);
  const [itemsPerPage] = useState(5);

  const transformedTrans = transDropdown.map(trans => ({
    label: trans.trans_name,
    value: trans.id.toString(),
  }));

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

  // Fetch Transporter dropdown
  const fetchCustDropdown = async () => {
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

  //Fetch All Transporter Data
  const fetchAllTransporterData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/alltransporteraccount`);
      setAllTransData(res.data.supp);
    } catch (error) {
      console.log(error);
    }
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
    } catch (error) {
      console.log(error);
    }
  };

  // Pagination helpers for All Transporters
  const paginateAllTransporters = () => {
    const startIndex = (currentPageAll - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allTransData.slice(startIndex, endIndex);
  };

  const totalPagesAll = Math.ceil(allTransData.length / itemsPerPage);

  // Pagination helpers for Single Transporter
  const paginateSingleTransporter = () => {
    const startIndex = (currentPageSingle - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return singleAccDetails.slice(startIndex, endIndex);
  };

  const totalPagesSingle = Math.ceil(singleAccDetails.length / itemsPerPage);

  // Pagination controls component
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
            currentPage === 1 && styles.disabledBtn,
          ]}
          onPress={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}>
          <Icon
            name="chevron-left"
            size={20}
            color={
              currentPage === 1 ? 'rgba(0,0,0,0.3)' : backgroundColors.dark
            }
          />
        </TouchableOpacity>

        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            {currentPage} of {totalPages}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.paginationBtn,
            currentPage === totalPages && styles.disabledBtn,
          ]}
          onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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
    getTransData();
    fetchAllTransporterData();
    fetchTransportDetails();
  }, [transValue, fromDate, toDate]);

  useEffect(() => {
    setCurrentPageSingle(1); // Reset pagination when switching between detail types
  }, [selectedOption]);

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
            <Text style={styles.headerTitle}>Transporter Account</Text>
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
                Single Transporter
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
                All Transporters
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View
            style={[
              styles.toggleBtnContainer,
              {
                marginVertical: 4,
                justifyContent: 'flex-end',
                alignSelf: 'flex-end',
              },
            ]}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {backgroundColor: backgroundColors.primary},
              ]}
              onPress={() => {
                closeDrawer();
                navigation.navigate('TransporterAddPayment' as never);
              }}>
              <Icon name="payment" size={18} color="white" />
              <Text style={styles.actionBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {selectedTab === 'Single' ? (
            <>
              {/* Single Transporter Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Transporter Information</Text>

                <View style={styles.dropdownRow}>
                  <Icon
                    name="person"
                    size={28}
                    color={backgroundColors.dark}
                    style={styles.personIcon}
                  />
                  <DropDownPicker
                    items={transformedTrans}
                    open={Open}
                    value={transValue}
                    setValue={setTransValue}
                    setOpen={setOpen}
                    placeholder="Choose transporter..."
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

                {transData && (
                  <View style={styles.transporterInfo}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Transporter Name:</Text>
                      <Text style={styles.infoValue}>
                        {transData.trans_name}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>CNIC:</Text>
                      <Text style={styles.infoValue}>
                        {transData.trans_cnic}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Address:</Text>
                      <Text style={styles.infoValue}>
                        {transData.trans_address}
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
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    themeVariant="dark"
                    style={{backgroundColor: '#144272'}}
                  />
                )}
              </View>

              {/* Account Details Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Details</Text>

                {singleAccDetails.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Icon name="receipt" size={40} color="rgba(0,0,0,0.5)" />
                    <Text style={styles.emptyStateText}>
                      No transactions found
                    </Text>
                  </View>
                ) : (
                  <>
                    <FlatList
                      data={paginateSingleTransporter()}
                      keyExtractor={item => item.id.toString()}
                      scrollEnabled={false}
                      renderItem={({item}) => (
                        <View style={styles.transactionCard}>
                          <View style={styles.transactionHeader}>
                            <Text style={styles.invoiceNumber}>
                              {item.transac_invoice_no}
                            </Text>
                            <Text style={styles.transactionDate}>
                              {new Date(item.transac_date)
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
                                {formatNumber(item.transac_total_bill_amount)}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Paid:</Text>
                              <Text style={styles.detailValue}>
                                {formatNumber(item.transac_paid_amount)}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Balance:</Text>
                              <Text style={styles.detailValue}>
                                {formatNumber(item.transac_balance)}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Type:</Text>
                              <Text style={styles.detailValue}>
                                {item.transac_payment_type}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Method:</Text>
                              <Text style={styles.detailValue}>
                                {item.transac_payment_method}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    />

                    <PaginationControls
                      currentPage={currentPageSingle}
                      totalPages={totalPagesSingle}
                      onPageChange={setCurrentPageSingle}
                    />
                  </>
                )}

                {/* Summary Section */}
                <View style={styles.summarySection}>
                  {(() => {
                    const {netReceivables, totalReceivables, totalReceived} =
                      calculateSingleTransTotals();
                    return (
                      <>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>
                            Total Payables:
                          </Text>
                          <Text style={styles.summaryValue}>
                            {formatNumber(totalReceivables)}
                          </Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Total Paid:</Text>
                          <Text style={styles.summaryValue}>
                            {formatNumber(totalReceived)}
                          </Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                          <Text
                            style={[styles.summaryLabel, styles.totalLabel]}>
                            Net Payables:
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
          ) : (
            <>
              {/* All Transporters Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  All Transporter Accounts
                </Text>

                {allTransData.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Icon name="people" size={40} color="rgba(0,0,0,0.5)" />
                    <Text style={styles.emptyStateText}>
                      No transporter accounts found
                    </Text>
                  </View>
                ) : (
                  <>
                    <FlatList
                      data={paginateAllTransporters()}
                      keyExtractor={(item, index) => index.toString()}
                      scrollEnabled={false}
                      renderItem={({item}) => (
                        <View style={styles.transporterAccountCard}>
                          <Text style={styles.transporterName}>
                            {item.trans_name}
                          </Text>
                          <View style={styles.accountDetails}>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>
                                Bill Amount:
                              </Text>
                              <Text style={styles.detailValue}>
                                {formatNumber(item.transac_total_bill_amount)}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>
                                Paid Amount:
                              </Text>
                              <Text style={styles.detailValue}>
                                {formatNumber(item.transac_paid_amount)}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Balance:</Text>
                              <Text style={styles.detailValue}>
                                {formatNumber(item.transac_balance)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    />

                    <PaginationControls
                      currentPage={currentPageAll}
                      totalPages={totalPagesAll}
                      onPageChange={setCurrentPageAll}
                    />
                  </>
                )}

                {/* All Transporters Summary */}
                <View style={styles.summarySection}>
                  {(() => {
                    const {totalReceivables, totalReceived, netReceivables} =
                      calculateAllTransTotals();
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
    fontSize: 14,
  },
  actionBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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
  transporterInfo: {
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
  transporterAccountCard: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  transporterName: {
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
    color: 'rgba(0,0,0,0.8)',
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
  disabledBtn: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderColor: 'rgba(0,0,0,0.05)',
  },
  pageIndicator: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  pageText: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '600',
  },
});
