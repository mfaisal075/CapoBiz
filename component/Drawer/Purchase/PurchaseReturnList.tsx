import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import backgroundColors from '../../Colors';

interface PurchaseReturn {
  prchr_return_invoice_no: string;
  prchr_return_amount: string;
  created_at: string;
  prchr_prch_invoice: string;
}

interface ReturnData {
  config: {
    bus_name: string;
    bus_address: string;
    bus_contact1: string;
  };
  returndata: {
    prchr_return_invoice_no: string;
    prchr_return_date: string;
    prchr_return_amount: string;
    sup_name: string;
    sup_company_name: string;
  };
}

interface ReturnDetails {
  id: number;
  prchrd_prod_name: string;
  prchrd_return_qty: string;
  prchrd_price: string;
  prchrd_total_price: string;
  sup_name: string;
  sup_contact: string;
  sup_company_name: string;
  sup_address: string;
  created_at: string;
}

export default function PurchaseReturnList() {
  const {openDrawer} = useDrawer();
  const [purchaseReturnList, setPurchaseReturnList] = useState<
    PurchaseReturn[]
  >([]);
  const [modalVisible, setModalVisible] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [returnData, setReturnData] = useState<ReturnData | null>(null);
  const [returnDetails, setReturnDetails] = useState<ReturnDetails[]>([]);
  const [selectedInvc, setSelectedInvc] = useState('');

  // Calculate total from return details
  const calculateTotal = () => {
    if (!returnDetails || returnDetails.length === 0) return 0;

    return returnDetails.reduce((total, item) => {
      const itemTotal = parseFloat(item.prchrd_total_price) || 0;
      return total + itemTotal;
    }, 0);
  };

  const calculateTotalQty = () => {
    if (!returnDetails || returnDetails.length === 0) return 0;

    return returnDetails.reduce((qty, item) => {
      const itemQty = parseFloat(item.prchrd_return_qty) || 0;
      return qty + itemQty;
    }, 0);
  };

  const totalAmount = calculateTotal();
  const totalQty = calculateTotalQty();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = purchaseReturnList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = purchaseReturnList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

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

  // Fetch Purchase Return List
  const fetchOrders = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/getpurchasereturnlist`, {
        from,
        to,
      });

      setPurchaseReturnList(res.data.inv_data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Return Details
  const fetchReturnDetails = async (invoiceNo: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/purchasereturndetail`, {
        invoice: invoiceNo,
      });

      setReturnData(res.data);
      setReturnDetails(res.data.return_detail);
      setSelectedInvc(invoiceNo);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [startDate, endDate]);

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
            <Text style={styles.headerTitle}>Purchase Return List</Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <View style={styles.dateInputWrapper}>
            <Text style={styles.dateLabel}>From:</Text>
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
            <Text style={styles.dateLabel}>To:</Text>
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

        {/* Flatlist */}
        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  setModalVisible('View');
                  fetchReturnDetails(item.prchr_return_invoice_no);
                }}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>
                      {item.prchr_return_invoice_no}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="cash" size={12} color="#666" />{' '}
                      {item.prchr_return_amount}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="receipt" size={12} color="#666" />{' '}
                      {item.prchr_prch_invoice || 'N/A'}
                    </Text>
                  </View>

                  <View style={{alignSelf: 'flex-start'}}>
                    <Text
                      style={[
                        styles.subText,
                        {fontWeight: '700', verticalAlign: 'top'},
                      ]}>
                      <Icon name="calendar" size={12} color="#666" />{' '}
                      {new Date(item.created_at)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .replace(/ /g, '-') || 'N/A'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
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
                  <Text style={styles.modalTitle}>Purchase Return Invoice</Text>
                  <Text style={styles.modalSubtitle}>Return Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setReturnData(null);
                  setReturnDetails([]);
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
                    {returnData?.config?.bus_name || 'N/A'}
                  </Text>
                </View>
                <Text style={styles.companyAddress}>
                  {returnData?.config?.bus_address || 'N/A'}
                </Text>
                <Text style={styles.companyContact}>
                  {returnData?.config?.bus_contact1 || 'Contact: N/A'}
                </Text>
              </View>

              {/* Order Info Grid */}
              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Invoice #</Text>
                  <Text style={styles.infoValue}>{selectedInvc ?? 'N/A'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Invoice Date</Text>
                  <Text style={styles.infoValue}>
                    {returnDetails[0]?.created_at
                      ? new Date(
                          returnDetails[0]?.created_at,
                        ).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Supplier</Text>
                  <Text style={styles.infoValue}>
                    {returnDetails[0]?.sup_name ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Company Name:</Text>
                  <Text style={styles.infoValue}>
                    {returnDetails[0]?.sup_company_name ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Contact</Text>
                  <Text style={styles.infoValue}>
                    {returnDetails[0]?.sup_contact ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>
                    {returnDetails[0]?.sup_address ?? 'N/A'}
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
                    <Text style={[styles.tableHeaderText, styles.col1]}>
                      Sr.#
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col2]}>
                      Product Name
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col3]}>
                      Return QTY
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col4]}>
                      Price
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col5]}>
                      Total Price
                    </Text>
                  </View>

                  {/* Table Rows */}
                  <FlatList
                    data={returnDetails}
                    keyExtractor={(item, index) =>
                      item?.id ? item.id.toString() : index.toString()
                    }
                    renderItem={({item, index}) => (
                      <View style={[styles.tableRow]}>
                        <Text
                          style={[styles.tableCell, styles.col1]}
                          numberOfLines={2}>
                          {index + 1}
                        </Text>
                        <Text style={[styles.tableCell, styles.col2]}>
                          {item.prchrd_prod_name}
                        </Text>
                        <Text style={[styles.tableCell, styles.col3]}>
                          {item.prchrd_return_qty}
                        </Text>
                        <Text style={[styles.tableCell, styles.col4]}>
                          {Number(item.prchrd_price).toLocaleString()}
                        </Text>
                        <Text style={[styles.tableCell, styles.col5]}>
                          {Number(item.prchrd_total_price).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    scrollEnabled={false}
                    ListFooterComponent={
                      <View
                        style={{
                          borderTopWidth: 1.5,
                          borderTopColor: backgroundColors.dark,
                          flexDirection: 'row',
                          paddingVertical: 2.5,
                        }}>
                        <Text
                          style={[
                            styles.tableHeaderText,
                            {flex: 0.35, textAlign: 'left'},
                          ]}>
                          Totals
                        </Text>
                        <Text style={[styles.tableCell, {flex: 0.22}]}>
                          {totalQty}
                        </Text>
                        <Text
                          style={[
                            styles.tableCell,
                            {flex: 0.33, textAlign: 'right'},
                          ]}>
                          {totalAmount}
                        </Text>
                      </View>
                    }
                  />
                </View>
              </View>

              <View style={styles.totalsSection}>
                <Text style={styles.totalLabel}>Total Return: </Text>
                <Text style={styles.totalValue}>{totalAmount}</Text>
              </View>

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

  // Pagination Component
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
    color: '#fff',
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
    color: '#555',
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

  // Date Fields
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 15,
    marginBottom: 10,
  },
  dateInputWrapper: {
    flex: 0.48,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
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
    height: '80%',
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
    backgroundColor: '#2a652b24',
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
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: backgroundColors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Company Card
  companyCard: {
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: backgroundColors.dark,
    borderStyle: 'dotted',
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
  },

  // Info Grid
  orderInfoGrid: {
    marginTop: 10,
    borderBottomColor: backgroundColors.dark,
    borderBottomWidth: 2,
    borderStyle: 'dotted',
    marginHorizontal: 20,
  },
  infoCard: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: backgroundColors.dark,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '400',
  },

  // Items Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  // Totals Section
  totalsSection: {
    marginHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '400',
  },

  // Footer
  modalFooter: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
    borderBottomWidth: 2,
    borderColor: backgroundColors.dark,
    borderStyle: 'dotted',
  },
  tableContainer: {
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomColor: backgroundColors.dark,
    borderBottomWidth: 1.5,
    paddingBottom: 5,
  },
  tableHeaderText: {
    color: backgroundColors.dark,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12,
    color: backgroundColors.dark,
    textAlign: 'center',
  },

  // Column widths
  col1: {
    flex: 0.1,
  },
  col2: {
    flex: 0.25, // Product
  },
  col3: {
    flex: 0.22, // Qty
  },
  col4: {
    flex: 0.18, // Price
  },
  col5: {
    flex: 0.2, // Total
  },
});
