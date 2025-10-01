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

interface PurchaseList {
  prch_invoice_no: string;
  prch_date: string;
  prch_order_total: string;
  prch_paid_amount: string;
  prch_balance: string;
}

interface InvoiceData {
  config: {
    bus_name: string;
    bus_address: string;
    bus_contact1: string;
  };
  purchasedata: {
    prch_invoice_no: string;
    prch_po_number: string;
    prch_date: string;
    prch_builty_no: string;
    prch_vehicle_no: string;
    prch_freight_charges: string;
    prch_total_purchase: string;
    prch_order_total: string;
    prch_trans_id: number;
    prch_sup_id: number;
    prch_balance: string;
    prch_paid_amount: string;
  };
}

interface InvoicePurchaseDetails {
  id: number;
  prchd_prod_name: string;
  prchd_qty: string;
  prchd_cost_price: string;
  prchd_total_cost: string;
  sup_name: string;
  sup_company_name: string;
  prch_trans_id: string;
}

interface Transporter {
  id: number;
  trans_name: string;
}

export default function PurchaseList() {
  const {openDrawer} = useDrawer();
  const [purchaseList, setPurchaseList] = useState<PurchaseList[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [invcData, setInvcData] = useState<InvoiceData | null>(null);
  const [invcDetails, setInvcDetails] = useState<InvoicePurchaseDetails[]>([]);
  const [trans, setTrans] = useState<Transporter[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = purchaseList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = purchaseList.slice(
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

  // Fetch Purchase Invoices
  const fetchInvoices = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/getpurchaseinvoices`, {
        from,
        to,
      });

      setPurchaseList(res.data.inv_data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Transporter
  const fetchTransporters = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchTransportersdata`);
      setTrans(res.data.transporter);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Invoice
  const fetchIncv = async (invc: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/purchase_invoiceprint`, {
        invoice: invc,
      });
      setInvcData(res.data);
      setInvcDetails(res.data.detail);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchTransporters();
  }, [startDate, endDate]);

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
            <Text style={styles.headerTitle}>Purchase Invoices List</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}
            onPress={() => {}}
            disabled>
            <Icon name="mail" size={24} color="transparent" />
          </TouchableOpacity>
        </View>

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

        {/* Flatlist */}
        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => `${item.prch_invoice_no}_${index}`}
            renderItem={({item}) => {
              return (
                <View style={styles.card}>
                  {/* Header Row */}
                  <View style={styles.headerRow}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {item.prch_invoice_no?.charAt(0) || 'P'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.name}>{item.prch_invoice_no}</Text>
                      <Text style={styles.subText}>
                        {new Date(item.prch_date).toLocaleDateString('en-US', {
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
                        fetchIncv(item.prch_invoice_no);
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
                        <Icon name="cash-multiple" size={16} color="#144272" />
                        <Text style={styles.infoText}>Order Total:</Text>
                      </View>
                      <Text style={styles.infoValue}>
                        {item.prch_order_total}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon name="cash-check" size={16} color="#144272" />
                        <Text style={styles.infoText}>Paid Amount:</Text>
                      </View>
                      <Text style={styles.infoValue}>
                        {item.prch_paid_amount}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.labelRow}>
                        <Icon name="wallet" size={16} color="#144272" />
                        <Text style={styles.infoText}>Balance:</Text>
                      </View>
                      <Text style={styles.infoValue}>{item.prch_balance}</Text>
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
            contentContainerStyle={{paddingBottom: 110, paddingTop: 10}}
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
            <Text style={styles.totalText}>Total: {totalRecords} records</Text>
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
                  <Text style={styles.modalTitle}>Purchase Invoice</Text>
                  <Text style={styles.modalSubtitle}>Invoice Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setInvcData(null);
                  setInvcDetails([]);
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
                    {invcData?.config?.bus_name || 'N/A'}
                  </Text>
                </View>
                <Text style={styles.companyAddress}>
                  {invcData?.config?.bus_address || 'N/A'}
                </Text>
                <Text style={styles.companyContact}>
                  {invcData?.config?.bus_contact1 || 'Contact: N/A'}
                </Text>
              </View>

              {/* Order Info Grid */}
              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Invoice #</Text>
                  <Text style={styles.infoValue}>
                    {invcData?.purchasedata?.prch_invoice_no ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Invoice Date</Text>
                  <Text style={styles.infoValue}>
                    {invcData?.purchasedata?.prch_date
                      ? new Date(
                          invcData.purchasedata.prch_date,
                        ).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>PO Reference</Text>
                  <Text style={styles.infoValue}>
                    {invcData?.purchasedata?.prch_po_number ?? '--'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Company</Text>
                  <Text style={styles.infoValue}>
                    {invcDetails[0]?.sup_company_name ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Supplier</Text>
                  <Text style={styles.infoValue}>
                    {invcDetails[0]?.sup_name ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Transporter</Text>
                  <Text style={styles.infoValue}>
                    {invcDetails[0]?.prch_trans_id !== null
                      ? trans.find(
                          tran =>
                            tran.id.toString() ===
                            invcDetails[0]?.prch_trans_id?.toString(),
                        )?.trans_name ?? 'N/A'
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Builty #</Text>
                  <Text style={styles.infoValue}>
                    {invcData?.purchasedata?.prch_builty_no ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Vehicle #</Text>
                  <Text style={styles.infoValue}>
                    {invcData?.purchasedata?.prch_vehicle_no ?? 'N/A'}
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
                      Product
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col2]}>
                      Cost Price
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col3]}>
                      Qty
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col4]}>
                      Total
                    </Text>
                  </View>

                  {/* Table Rows */}
                  <FlatList
                    data={invcDetails}
                    keyExtractor={(item, index) =>
                      item?.id ? item.id.toString() : index.toString()
                    }
                    renderItem={({item, index}) => (
                      <View
                        style={[
                          styles.tableRow,
                          index % 2 === 0
                            ? styles.tableRowEven
                            : styles.tableRowOdd,
                        ]}>
                        <Text
                          style={[styles.tableCell, styles.col1]}
                          numberOfLines={2}>
                          {item.prchd_prod_name}
                        </Text>
                        <Text style={[styles.tableCell, styles.col2]}>
                          {Number(item.prchd_cost_price).toLocaleString()}
                        </Text>
                        <Text style={[styles.tableCell, styles.col3]}>
                          {item.prchd_qty}
                        </Text>
                        <Text style={[styles.tableCell, styles.col4]}>
                          {Number(item.prchd_total_cost).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    scrollEnabled={false}
                  />
                </View>
              </View>

              {/* Order Totals */}
              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Order Total:</Text>
                  <Text style={styles.totalValue}>
                    PKR{' '}
                    {invcData?.purchasedata?.prch_order_total
                      ? invcData.purchasedata.prch_order_total
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Freight Charges:</Text>
                  <Text style={styles.totalValue}>
                    PKR{' '}
                    {invcData?.purchasedata?.prch_freight_charges
                      ? invcData.purchasedata.prch_freight_charges
                      : '0'}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Purchase:</Text>
                  <Text style={styles.totalValue}>
                    PKR{' '}
                    {invcData?.purchasedata?.prch_total_purchase
                      ? invcData.purchasedata.prch_total_purchase
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Paid Amount:</Text>
                  <Text style={styles.totalValue}>
                    PKR{' '}
                    {invcData?.purchasedata?.prch_paid_amount
                      ? invcData.purchasedata.prch_paid_amount
                      : 'N/A'}
                  </Text>
                </View>
                <View style={[styles.totalRow, styles.pendingTotalRow]}>
                  <Text style={[styles.totalLabel, styles.pendingLabel]}>
                    Balance:
                  </Text>
                  <Text style={[styles.totalValue, styles.pendingValue]}>
                    PKR{' '}
                    {invcData?.purchasedata?.prch_balance
                      ? invcData.purchasedata.prch_balance
                      : 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.modalFooter}>
                <Text style={styles.invoiceState}>Invoice State</Text>
                <Text style={styles.footerText}>
                  Purchase Invoice Generated Successfully
                </Text>
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
  totalText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },

  // Flatlist styling
  listContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
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
  infoValue: {
    fontSize: 13,
    color: '#1A1A1A',
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
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#144272',
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
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
    marginBottom: 4,
  },
  companyContact: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
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

  // Table Section
  tableSection: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
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
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tableRowEven: {
    backgroundColor: '#FAFAFA',
  },
  tableRowOdd: {
    backgroundColor: '#FFFFFF',
  },
  tableCell: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  col1: {
    flex: 2,
    textAlign: 'left',
  },
  col2: {
    flex: 1.2,
  },
  col3: {
    flex: 1,
  },
  col4: {
    flex: 1.4,
  },

  // Totals Section
  totalsSection: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: 'white',
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
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#144272',
  },
  pendingTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 10,
    marginTop: 10,
  },
  pendingLabel: {
    color: '#D90429',
  },
  pendingValue: {
    color: '#D90429',
  },

  // Footer Section
  modalFooter: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  invoiceState: {
    fontSize: 14,
    fontWeight: '700',
    color: '#144272',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  thankYou: {
    fontSize: 13,
    color: '#144272',
    fontWeight: '600',
    marginBottom: 12,
  },
  developerInfo: {
    alignItems: 'center',
  },
  developerText: {
    fontSize: 12,
    color: '#888',
  },
});
