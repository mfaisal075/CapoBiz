import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Animated,
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
  const bounceAnim = useRef(new Animated.Value(0)).current;

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
    } catch (error) {
      console.log(error);
    }
  };

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

  useEffect(() => {
    fetchCustDropdown();
    getCustData();
    fetchAllCustAccounts();
    fetchCustWithoutDetails();
    fetchCustWithDetails();
  }, [customerVal, fromDate, toDate]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Customer Account</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}
            onPress={() => {}}
            disabled>
            <Icon name="account-balance" size={24} color="transparent" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} nestedScrollEnabled>
          {/* Toggle Buttons */}
          <View style={styles.toggleBtnContainer}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'Single' && {backgroundColor: '#D0F4DE'},
              ]}
              onPress={() => setSelectedTab('Single')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  selectedTab === 'Single' && {color: '#144272'},
                ]}>
                Single Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                selectedTab === 'All' && {backgroundColor: '#D0F4DE'},
              ]}
              onPress={() => setSelectedTab('All')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  selectedTab === 'All' && {color: '#144272'},
                ]}>
                All Customer
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={[styles.toggleBtnContainer, {marginVertical: 5}]}>
            <TouchableOpacity
              style={[styles.actionBtn, {backgroundColor: '#144272'}]}
              onPress={() => {
                closeDrawer();
                navigation.navigate('AddCustomerPayment' as never);
              }}>
              <Icon name="payment" size={16} color="white" />
              <Text style={styles.actionBtnText}>Add Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, {backgroundColor: '#144272'}]}
              onPress={() => {
                closeDrawer();
                navigation.navigate('ChequeClearance' as never);
              }}>
              <Icon name="account-balance-wallet" size={16} color="white" />
              <Text style={styles.actionBtnText}>Cheque Clearance</Text>
            </TouchableOpacity>
          </View>

          {selectedTab === 'Single' ? (
            <>
              {/* Single Customer Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Information</Text>

                <View style={styles.dropdownRow}>
                  <Text style={styles.inputLabel}>Select Customer</Text>
                  <DropDownPicker
                    items={transformedCust}
                    open={Open}
                    value={customerVal}
                    setValue={setCustomerVal}
                    setOpen={setOpen}
                    placeholder="Choose customer..."
                    placeholderStyle={styles.dropdownPlaceholder}
                    textStyle={styles.dropdownText}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    ArrowUpIconComponent={() => (
                      <Icon name="keyboard-arrow-up" size={18} color="#fff" />
                    )}
                    ArrowDownIconComponent={() => (
                      <Icon name="keyboard-arrow-down" size={18} color="#fff" />
                    )}
                    listMode="SCROLLVIEW"
                    listItemLabelStyle={{color: '#144272'}}
                  />
                </View>

                {custData && (
                  <View style={styles.customerInfo}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Customer Name:</Text>
                      <Text style={styles.infoValue}>{custData.cust_name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Father Name:</Text>
                      <Text style={styles.infoValue}>
                        {custData.cust_fathername}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Address:</Text>
                      <Text style={styles.infoValue}>
                        {custData.cust_address}
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
                      <Icon name="event" size={20} color="white" />
                      <Text style={styles.dateText}>
                        {fromDate ? fromDate.toLocaleDateString() : 'From Date'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker('to')}
                      style={styles.dateInput}>
                      <Icon name="event" size={20} color="white" />
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
                  <Text style={styles.inputLabel}>Account View</Text>
                  <RadioButton.Group
                    onValueChange={value =>
                      setSelectedOption(
                        value as 'withoutDetails' | 'withDetails',
                      )
                    }
                    value={selectedOption}>
                    <View style={styles.radioRow}>
                      <View style={styles.radioOption}>
                        <RadioButton.Android
                          value="withoutDetails"
                          color="#D0F4DE"
                          uncheckedColor="white"
                        />
                        <Text style={styles.radioLabel}>Without Details</Text>
                      </View>
                      <View style={styles.radioOption}>
                        <RadioButton.Android
                          value="withDetails"
                          color="#D0F4DE"
                          uncheckedColor="white"
                        />
                        <Text style={styles.radioLabel}>With Details</Text>
                      </View>
                    </View>
                  </RadioButton.Group>
                </View>
              </View>

              {/* Account Details Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {selectedOption === 'withoutDetails'
                    ? 'Account Summary'
                    : 'Detailed Transactions'}
                </Text>

                {selectedOption === 'withoutDetails' ? (
                  accountDetailsWithout.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Icon
                        name="receipt"
                        size={40}
                        color="rgba(255,255,255,0.5)"
                      />
                      <Text style={styles.emptyStateText}>
                        No transactions found
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={accountDetailsWithout}
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
                  )
                ) : accountDetailsWith.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Icon
                      name="receipt"
                      size={40}
                      color="rgba(255,255,255,0.5)"
                    />
                    <Text style={styles.emptyStateText}>
                      No detailed transactions found
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={accountDetailsWith}
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
                    <Icon
                      name="people"
                      size={40}
                      color="rgba(255,255,255,0.5)"
                    />
                    <Text style={styles.emptyStateText}>
                      No customer accounts found
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={allCustAccount}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={false}
                    renderItem={({item}) => (
                      <View style={styles.customerAccountCard}>
                        <Text style={styles.customerName}>
                          {item.cust_name}
                        </Text>
                        <View style={styles.accountDetails}>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Bill Amount:</Text>
                            <Text style={styles.detailValue}>
                              {item.custac_total_bill_amount}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Paid Amount:</Text>
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
          )}
        </ScrollView>
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
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  toggleBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  toggleBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  toggleBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  dropdownRow: {
    marginBottom: 16,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  dropdown: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minHeight: 40,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    marginTop: 2,
    maxHeight: 200,
  },
  dropdownText: {
    color: 'white',
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  customerInfo: {
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  infoValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  dateSection: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  accountTypeSection: {
    marginBottom: 16,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDate: {
    color: 'rgba(255,255,255,0.7)',
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
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  detailValue: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  customerAccountCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  customerName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  accountDetails: {
    marginTop: 4,
  },
  summarySection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
