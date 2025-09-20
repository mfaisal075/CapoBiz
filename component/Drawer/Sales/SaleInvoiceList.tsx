import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import DropDownPicker from 'react-native-dropdown-picker';

interface InvoiceList {
  id: number;
  sal_date: string;
  sal_order_total: string;
  sal_invoice_no: string;
  sal_payment_method: string;
  slcust_name: string;
  name: string;
}

interface SingleInvoice {
  config: {
    bus_name: string;
    bus_address: string;
    bus_contact1: string;
  };
  sale: {
    cust_name: string;
    name: string;
    slcust_address: string;
    sal_builty_contact: string;
    sal_builty_address: string;
    contact: string;
    sal_change_amount: string;
    created_at: string;
    sal_freight_exp: string;
    sal_labr_exp: string;
    sal_discount: string;
    sal_payment_amount: string;
    sal_total_amount: string;
    sal_order_total: string;
    note: string;
  };
  prev_balance: string;
}

interface InvoiceSaleDetails {
  prod_name: string;
  sald_qty: string;
  sald_fretail_price: string;
  sald_total_fretailprice: string;
  ums_name: string;
}

interface Users {
  id: number;
  name: string;
}

export default function SaleInvoiceList() {
  const {openDrawer} = useDrawer();
  const [userOpen, setUserOpen] = useState(false);
  const [userValue, setUserValue] = useState('');
  const [invcList, setInvcList] = useState<InvoiceList[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [invoiceData, setInvoiceData] = useState<SingleInvoice | null>(null);
  const [selectedInvc, setSelectedInvc] = useState('');
  const [invcSaleDetails, setInvcSaleDetails] = useState<InvoiceSaleDetails[]>(
    [],
  );
  const [users, setUsers] = useState<Users[]>([]);
  const transformedUsers = users.map(user => ({
    label: user.name,
    value: user.id.toString(),
  }));

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

  const totalRecords = invcList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = invcList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Fetch Sale Invoice List
  const fetchinvcLisr = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/getinvoices`, {
        from,
        to,
        user_id: userValue,
      });

      setInvcList(res.data.inv_data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Invoice
  const singleInvc = async (inv: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/invoiceprint`, {
        invoice: inv,
      });

      setInvoiceData(res.data);
      setInvcSaleDetails(res.data.saledetail);
    } catch (error) {
      console.log();
    }
  };

  // Fetch Users List Dropdown
  const fetchUserDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchusersdropdown`);
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchinvcLisr();
    fetchUserDropdown();
  }, [startDate, endDate, userValue]);

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
            <Text style={styles.headerTitle}>Invoice List</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}
            onPress={() => {}}
            disabled>
            <Icon name="mail" size={24} color="transparent" />
          </TouchableOpacity>
        </View>

        {/* Date Selection */}
        <View style={styles.dateContainer}>
          <View style={styles.dateInputWrapper}>
            <Text style={styles.dateLabel}>From Date</Text>
            <TouchableOpacity
              style={styles.dateInputBox}
              onPress={() => setShowStartDatePicker(true)}>
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString('en-GB')}
              </Text>
              <Icon name="calendar" size={20} color="#144272" />
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

          <View style={styles.dateInputWrapper}>
            <Text style={styles.dateLabel}>To Date</Text>
            <TouchableOpacity
              style={styles.dateInputBox}
              onPress={() => setShowEndDatePicker(true)}>
              <Text style={styles.dateText}>
                {endDate.toLocaleDateString('en-GB')}
              </Text>
              <Icon name="calendar" size={20} color="#144272" />
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

        {/* User Filter */}
        <View style={{paddingHorizontal: 15, marginVertical: 8}}>
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
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
          />
        </View>

        {/* Flatlist */}
        <View>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              return (
                <View style={styles.card}>
                  {/* Header Row */}
                  <View style={styles.headerRow}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {item.sal_invoice_no?.charAt(0) || 'I'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.name}>{item.sal_invoice_no}</Text>
                      <Text style={styles.subText}>
                        {new Date(item.sal_date).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>

                    {/* View Action */}
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('View');
                        singleInvc(item.sal_invoice_no);
                        setSelectedInvc(item.sal_invoice_no);
                      }}>
                      <Icon
                        name="receipt"
                        size={20}
                        color={'#144272'}
                        style={{marginLeft: 10}}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Info Section */}
                  <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon name="account" size={16} color="#144272" />
                        <Text style={styles.infoText}>Customer:</Text>
                      </View>
                      <Text style={styles.infoValue}>
                        {item.slcust_name || 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon name="account-tie" size={16} color="#144272" />
                        <Text style={styles.infoText}>Invoiced By:</Text>
                      </View>
                      <Text style={styles.infoValue}>{item.name || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon name="cash-multiple" size={16} color="#144272" />
                        <Text style={styles.infoText}>Total Amount:</Text>
                      </View>
                      <Text style={styles.infoValue}>
                        {item.sal_order_total}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon name="credit-card" size={16} color="#144272" />
                        <Text style={styles.infoText}>Payment Method:</Text>
                      </View>
                      <Text style={styles.infoValue}>
                        {item.sal_payment_method}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No record present in the database for this Date range!
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 280, paddingTop: 10}}
          />
        </View>
      </ImageBackground>

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

      {/* View Modal */}
      <Modal
        visible={modalVisible === 'View'}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.invoiceIconContainer}>
                  <Icon name="receipt" size={24} color="#144272" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Sale Invoice</Text>
                  <Text style={styles.modalSubtitle}>Invoice Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setInvoiceData(null);
                  setInvcSaleDetails([]);
                  setSelectedInvc('');
                }}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              {/* Company Info Card */}
              <View style={styles.companyCard}>
                <View style={styles.companyHeader}>
                  <Text style={styles.companyName}>
                    {invoiceData?.config.bus_name || 'N/A'}
                  </Text>
                </View>
                <Text style={styles.companyAddress}>
                  {invoiceData?.config?.bus_address || 'N/A'}
                </Text>
                <Text style={styles.companyContact}>
                  {invoiceData?.config?.bus_contact1 || 'N/A'}
                </Text>
              </View>

              {/* Order Info Grid */}
              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Invoice #</Text>
                  <Text style={styles.infoValue}>{selectedInvc || 'N/A'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.created_at
                      ? new Date(
                          invoiceData.sale.created_at,
                        ).toLocaleDateString('en-GB')
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Customer</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.cust_name || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Cashier</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.name || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Contact</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.contact || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Builty Contact</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_builty_contact || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Order Table Section */}
              <View style={styles.tableSection}>
                <Text style={styles.sectionTitle}>Invoice Items</Text>

                {/* Table Container */}
                <View style={styles.tableContainer}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.col2]}>
                      Product
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col3]}>
                      Quantity
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col6]}>
                      UMO
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col4]}>
                      Price
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col5]}>
                      Total
                    </Text>
                  </View>

                  {/* Table Rows */}
                  <FlatList
                    data={invcSaleDetails}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item, index}) => (
                      <View
                        style={[
                          styles.tableRow,
                          index % 2 === 0
                            ? styles.tableRowEven
                            : styles.tableRowOdd,
                        ]}>
                        <Text
                          style={[styles.tableCell, styles.col2]}
                          numberOfLines={2}>
                          {item.prod_name}
                        </Text>
                        <Text style={[styles.tableCell, styles.col3]}>
                          {item.sald_qty}
                        </Text>
                        <Text style={[styles.tableCell, styles.col6]}>
                          {item.ums_name}
                        </Text>
                        <Text style={[styles.tableCell, styles.col4]}>
                          {parseFloat(item.sald_fretail_price || '0').toFixed(
                            2,
                          )}
                        </Text>
                        <Text style={[styles.tableCell, styles.col5]}>
                          {parseFloat(
                            item.sald_total_fretailprice || '0',
                          ).toFixed(2)}
                        </Text>
                      </View>
                    )}
                    scrollEnabled={false}
                  />
                </View>
              </View>

              {/* Invoice Totals */}
              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Order Total:</Text>
                  <Text style={styles.totalValue}>
                    PKR {invoiceData?.sale?.sal_order_total || 'N/A'}
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Freight:</Text>
                  <Text style={styles.totalValue}>
                    PKR {invoiceData?.sale?.sal_freight_exp || '0.00'}
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Labour:</Text>
                  <Text style={styles.totalValue}>
                    PKR {invoiceData?.sale?.sal_labr_exp || '0.00'}
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Discount:</Text>
                  <Text style={styles.totalValue}>
                    PKR {invoiceData?.sale?.sal_discount || '0.00'}
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Previous Balance:</Text>
                  <Text style={styles.totalValue}>
                    PKR {invoiceData?.prev_balance || '0.00'}
                  </Text>
                </View>

                <View style={[styles.totalRow, styles.pendingTotalRow]}>
                  <Text style={[styles.totalLabel, styles.pendingLabel]}>
                    Total Payable:
                  </Text>
                  <Text style={[styles.totalValue, styles.pendingValue]}>
                    PKR {invoiceData?.sale?.sal_total_amount || 'N/A'}
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Paid Amount:</Text>
                  <Text style={styles.totalValue}>
                    PKR {invoiceData?.sale?.sal_payment_amount || '0.00'}
                  </Text>
                </View>

                <View style={[styles.totalRow, styles.pendingTotalRow]}>
                  <Text style={[styles.totalLabel, styles.pendingLabel]}>
                    Balance:
                  </Text>
                  <Text style={[styles.totalValue, styles.pendingValue]}>
                    PKR {invoiceData?.sale?.sal_change_amount || '0.00'}
                  </Text>
                </View>
              </View>

              {/* Note Section */}
              {invoiceData?.sale?.note && (
                <View style={styles.noteSection}>
                  <Text style={styles.noteLabel}>Note:</Text>
                  <Text style={styles.noteText}>{invoiceData.sale.note}</Text>
                </View>
              )}

              {/* Footer */}
              <View style={styles.modalFooter}>
                <Text style={styles.thankYou}>Thank you for your visit</Text>
                <View style={styles.developerInfo}>
                  <Text style={styles.developerText}>
                    Software Developed with ❤️ by
                  </Text>
                  <Text style={styles.companyContact}>
                    Technic Mentors | +923111122144
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Pagination Component
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
    paddingVertical: 6,
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
    paddingHorizontal: 10,
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

  // Flatlist styling
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
    marginHorizontal: 10,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#666',
  },
  infoBox: {
    marginTop: 10,
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoText: {
    color: '#144272',
    fontSize: 13,
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Date Fields
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  dateInputWrapper: {
    flex: 0.48,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginLeft: 4,
  },
  dateInputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 66, 114, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    height: 48,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#144272',
  },

  // Modal stying
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FAFBFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Company Card
  companyCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'flex-start',
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#144272',
  },
  companyAddress: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    textAlign: 'center',
  },

  // Info Grid
  orderInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  infoCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    margin: '1%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },

  // Totals Section
  totalsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pendingTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  pendingLabel: {
    color: '#C62828',
  },
  pendingValue: {
    color: '#C62828',
    fontSize: 18,
  },

  // Footer
  modalFooter: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  thankYou: {
    fontSize: 16,
    color: '#144272',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  developerInfo: {
    alignItems: 'center',
  },
  developerText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  companyContact: {
    fontSize: 12,
    color: '#144272',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
  },

  // Table Section
  tableSection: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#144272',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 11,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#FAFAFA',
  },
  tableRowOdd: {
    backgroundColor: 'white',
  },
  tableCell: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 2,
  },

  // Column widths
  col2: {
    flex: 0.3, // Product
  },
  col3: {
    flex: 0.2, // Qty
  },
  col4: {
    flex: 0.2, // Price
  },
  col5: {
    flex: 0.2, // Total
  },
  col6: {
    flex: 0.3,
  },

  // Note Section
  noteSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },

  // Dropdown
  dropdown: {
    borderWidth: 1,
    borderColor: '#144272',
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  dropDownContainer: {
    backgroundColor: '#fff',
    borderColor: '#144272',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
});
