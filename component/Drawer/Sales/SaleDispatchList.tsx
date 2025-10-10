import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BASE_URL from '../../BASE_URL';
import axios from 'axios';
import {useUser} from '../../CTX/UserContext';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../../Colors';

interface DispatchList {
  id: number;
  disp_date: string;
  disp_order_total: string;
  disp_invoice_no: string;
  slcust_name: string;
}

interface DispatchDataItem {
  dispd_trans_id: string;
  created_at?: string;
  dispd_disp_no: string;
  dispd_freight_exp?: string;
}

interface Transporter {
  id: number | string;
  trans_name: string;
}

interface SaleDetailItem {
  sald_prod_name: string;
  sald_disp_qty: string | number;
  sald_sub_uom: string;
}

interface SingleInvoice {
  sale: {
    id: number;
    disp_date: string;
    disp_invoice_no: string;
    disp_builty_contact: string;
    disp_builty_address: string;
  };
  cust: {
    slcust_name: string;
    slcust_contact: string;
    slcust_address: string;
  };
  dispatchdata?: DispatchDataItem[];
  transporters?: Transporter[];
  sale_detail?: SaleDetailItem[];
}

export default function SaleDispatchList() {
  const {openDrawer} = useDrawer();
  const {token, bussName, bussAddress} = useUser();
  const [dispList, setDispList] = useState<DispatchList[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [invoiceData, setInvoiceData] = useState<SingleInvoice | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<{
    dispatch: DispatchDataItem;
    index: number;
    transporter?: Transporter;
  } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = dispList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = dispList.slice(
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

  // Fetch Sale Dispatch List
  const fetchDispatchList = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.get(
        `${BASE_URL}/fetchdispatch?from=${from}&to=${to}&_token=${token}`,
      );

      setDispList(res.data.dispatch);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Item
  const singleRecord = async (inv: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/viewdispatchdetail`, {
        invoice: inv,
      });

      setInvoiceData(res.data);
    } catch (error) {
      console.log();
    }
  };

  useEffect(() => {
    fetchDispatchList();
  }, [startDate, endDate]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[backgroundColors.primary, backgroundColors.secondary]}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Dispatch List</Text>
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
                  singleRecord(item.disp_invoice_no);
                }}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>{item.disp_invoice_no}</Text>
                    <Text style={styles.subText}>
                      <Icon name="cash-multiple" size={12} color="#666" />{' '}
                      {item.disp_order_total}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="account" size={12} color="#666" />{' '}
                      {item.slcust_name || 'N/A'}
                    </Text>
                  </View>

                  <View style={{alignSelf: 'flex-start'}}>
                    <Text style={[styles.subText, {fontWeight: '700'}]}>
                      <Icon name="calendar" size={12} color="#666" />{' '}
                      {new Date(item.disp_date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
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
      </LinearGradient>

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
                  <Icon name="truck" size={24} color="#144272" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Dispatch</Text>
                  <Text style={styles.modalSubtitle}>Invoice Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setInvoiceData(null);
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
                  <Text style={styles.companyName}>{bussName ?? 'N/A'}</Text>
                </View>
                <Text style={styles.companyAddress}>
                  {bussAddress ?? 'N/A'}
                </Text>
              </View>

              {/* Order Info Grid */}
              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Invoice #</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.disp_invoice_no || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.disp_date
                      ? new Date(invoiceData.sale.disp_date).toLocaleDateString(
                          'en-US',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          },
                        )
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Customer</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.cust.slcust_name || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Contact</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.cust.slcust_contact || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Builty Contact</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.disp_builty_contact || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Builty Address</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.disp_builty_address || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Dispatch Buttons Section */}
              <View style={styles.dispatchButtonsSection}>
                <Text style={styles.sectionTitle}>Dispatches</Text>
                {invoiceData?.dispatchdata
                  ?.filter(dispatchItem => !!dispatchItem.dispd_disp_no)
                  .map((dispatchItem, index) => {
                    const transporter = invoiceData.transporters?.find(
                      t => t.id.toString() === dispatchItem.dispd_trans_id,
                    );

                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.dispatchButton}
                        onPress={() => {
                          setSelectedDispatch({
                            dispatch: dispatchItem,
                            index,
                            transporter,
                          });
                        }}>
                        <View style={styles.dispatchButtonContent}>
                          <View style={styles.dispatchButtonLeft}>
                            <View style={styles.dispatchButtonIcon}>
                              <Icon
                                name="package-variant"
                                size={20}
                                color="#144272"
                              />
                            </View>
                            <View>
                              <Text style={styles.dispatchButtonTitle}>
                                Dispatch #{index + 1}
                              </Text>
                              <Text style={styles.dispatchButtonSubtitle}>
                                {dispatchItem.dispd_disp_no}
                              </Text>
                            </View>
                          </View>
                          <Icon
                            name="chevron-right"
                            size={24}
                            color="#144272"
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
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

      {/* Dispatch Details Popup */}
      <Modal
        visible={selectedDispatch !== null}
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
                  <Icon name="package-variant" size={24} color="#144272" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    Dispatch #{(selectedDispatch?.index ?? 0) + 1}
                  </Text>
                  <Text style={styles.modalSubtitle}>Dispatch Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedDispatch(null)}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              {selectedDispatch && (
                <>
                  {/* Dispatch Info Grid */}
                  <View style={styles.orderInfoGrid}>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Date</Text>
                      <Text style={styles.infoValue}>
                        {selectedDispatch.dispatch.created_at
                          ? new Date(
                              selectedDispatch.dispatch.created_at,
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Dispatch #</Text>
                      <Text style={styles.infoValue}>
                        {selectedDispatch.dispatch.dispd_disp_no || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Freight</Text>
                      <Text style={styles.infoValue}>
                        {selectedDispatch.dispatch.dispd_freight_exp || '0.00'}
                      </Text>
                    </View>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Transporter</Text>
                      <Text style={styles.infoValue}>
                        {selectedDispatch.transporter?.trans_name || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Products Table */}
                  <View style={styles.tableSection}>
                    <Text style={styles.sectionTitle}>Products</Text>

                    <View style={styles.tableContainer}>
                      {/* Table Header */}
                      <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.col2]}>
                          Product
                        </Text>
                        <Text style={[styles.tableHeaderText, styles.col3]}>
                          Qty
                        </Text>
                      </View>

                      {/* Table Rows */}
                      {invoiceData?.sale_detail?.map((detail, i) => (
                        <View
                          key={i}
                          style={[
                            styles.tableRow,
                            i % 2 === 0
                              ? styles.tableRowEven
                              : styles.tableRowOdd,
                          ]}>
                          <Text
                            style={[styles.tableCell, styles.col2]}
                            numberOfLines={2}>
                            {detail.sald_prod_name}
                          </Text>
                          <Text style={[styles.tableCell, styles.col3]}>
                            {detail.sald_disp_qty}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
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
  gradientBackground: {
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
    backgroundColor: backgroundColors.secondary,
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
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    paddingVertical: '70%',
    backgroundColor: '#fff',
    borderRadius: 15,
    alignSelf: 'center',
    width: '96%',
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
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
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

  // Dispatch Section
  dispatchSection: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  dispatchInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  // Table Section
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
    flex: 1, // Product
  },
  col3: {
    flex: 1, // Qty
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

  // Dispatch Details Modal
  dispatchButtonsSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  dispatchButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dispatchButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dispatchButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dispatchButtonIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F4FD',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dispatchButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  dispatchButtonSubtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  tableSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
});
