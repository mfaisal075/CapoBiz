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
import {useUser} from '../../CTX/UserContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../../Colors';

interface AllTrades {
  id: number;
  trad_invoice_no: string;
  trad_date: string;
  sup_name: string;
  cust_name: string;
  trad_ref_no: string;
  trad_total_cost: string;
  trad_total_sale: string;
  trad_payable: string;
  trad_profit: string;
}

interface TradeDetails {
  supplier: {
    sup_name: string;
  };
  customer: {
    cust_name: string;
  };
  trade: {
    trad_invoice_no: string;
    trad_date: string;
    trad_total_cost: string;
    trad_total_sale: string;
    trad_payable: string;
    trad_profit: string;
  };
}

interface ModalTradeDetails {
  id: number;
  prod_name: string;
  tradd_cost_price: string;
  tradd_sale_price: string;
  tradd_qty: string;
  tradd_sub_total: string;
}

export default function TradingList() {
  const {token, bussAddress, bussName} = useUser();
  const {openDrawer} = useDrawer();
  const [allTrades, setAllTrades] = useState<AllTrades[]>([]);
  const [singleTradeDetails, setSingleTradeDetails] =
    useState<TradeDetails | null>(null);
  const [modalTradeDetails, setModalTradeDetails] = useState<
    ModalTradeDetails[]
  >([]);
  const [modalVisible, setModalVisible] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = allTrades.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = allTrades.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Fetch All Trade
  const fetchAllTrades = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchalltrade`);
      setAllTrades(res.data.detail);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Single Trade
  const fetchSingleTrade = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/showtrade?id=${id}&_token=${token}`,
      );
      setSingleTradeDetails(res.data);
      setModalTradeDetails(res.data.traddetail);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllTrades();
  }, []);

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
            <Text style={styles.headerTitle}>Trading List</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}
            onPress={() => {}}
            disabled>
            <Icon name="mail" size={24} color="transparent" />
          </TouchableOpacity>
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
                  fetchSingleTrade(item.id);
                }}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>{item.trad_invoice_no}</Text>
                    <Text style={styles.subText}>
                      <Icon name="account-circle" size={12} color="#666" />{' '}
                      {item.cust_name}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="truck" size={12} color="#666" />{' '}
                      {item.sup_name}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="cash-plus" size={12} color="#666" />{' '}
                      {item.trad_profit}
                    </Text>
                  </View>

                  <View style={{alignSelf: 'flex-start'}}>
                    <Text style={[styles.subText, {fontWeight: '700'}]}>
                      <Icon name="calendar" size={12} color="#666" />{' '}
                      {new Date(item.trad_date).toLocaleDateString('en-US', {
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
                  <Icon name="swap-horizontal" size={24} color="#144272" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Trade</Text>
                  <Text style={styles.modalSubtitle}>Transaction Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setSingleTradeDetails(null);
                  setModalTradeDetails([]);
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

              {/* Trade Info Grid */}
              {singleTradeDetails && (
                <View style={styles.orderInfoGrid}>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Supplier</Text>
                    <Text style={styles.infoSecValue}>
                      {singleTradeDetails.supplier?.sup_name ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Customer</Text>
                    <Text style={styles.infoSecValue}>
                      {singleTradeDetails.customer?.cust_name ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Invoice #</Text>
                    <Text style={styles.infoSecValue}>
                      {singleTradeDetails.trade?.trad_invoice_no ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Trade Date</Text>
                    <Text style={styles.infoSecValue}>
                      {singleTradeDetails.trade?.trad_date
                        ? new Date(
                            singleTradeDetails.trade.trad_date,
                          ).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Trade Table Section */}
              <View style={styles.tableSection}>
                <Text style={styles.sectionTitle}>Trade Items</Text>

                {/* Table Container */}
                <View style={styles.tableContainer}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.col1]}>
                      Sr#
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col2]}>
                      Product
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col3]}>
                      Cost
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col4]}>
                      Sale
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col5]}>
                      Qty
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col6]}>
                      Sub Total
                    </Text>
                  </View>

                  {/* Table Rows */}
                  <FlatList
                    data={modalTradeDetails}
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
                          numberOfLines={1}>
                          {index + 1}
                        </Text>
                        <Text
                          style={[styles.tableCell, styles.col2]}
                          numberOfLines={2}>
                          {item.prod_name}
                        </Text>
                        <Text style={[styles.tableCell, styles.col3]}>
                          {Number(item.tradd_cost_price).toLocaleString()}
                        </Text>
                        <Text style={[styles.tableCell, styles.col4]}>
                          {Number(item.tradd_sale_price).toLocaleString()}
                        </Text>
                        <Text style={[styles.tableCell, styles.col5]}>
                          {item.tradd_qty}
                        </Text>
                        <Text style={[styles.tableCell, styles.col6]}>
                          {Number(item.tradd_sub_total).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    scrollEnabled={false}
                  />
                </View>
              </View>

              {/* Trade Totals */}
              {singleTradeDetails && (
                <View style={styles.totalsSection}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Cost:</Text>
                    <Text style={styles.totalValue}>
                      PKR {singleTradeDetails.trade?.trad_total_cost ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Sale:</Text>
                    <Text style={styles.totalValue}>
                      PKR {singleTradeDetails.trade?.trad_total_sale ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={[styles.totalRow, styles.profitTotalRow]}>
                    <Text style={[styles.totalLabel, styles.profitLabel]}>
                      Profit:
                    </Text>
                    <Text style={[styles.totalValue, styles.profitValue]}>
                      PKR {singleTradeDetails.trade?.trad_profit ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={[styles.totalRow, styles.finalTotalRow]}>
                    <Text style={[styles.totalLabel, styles.finalLabel]}>
                      Trade Total:
                    </Text>
                    <Text style={[styles.totalValue, styles.finalValue]}>
                      PKR {singleTradeDetails.trade?.trad_payable ?? 'N/A'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Footer */}
              <View style={styles.modalFooter}>
                <Text style={styles.invoiceState}>Trade Completed</Text>
                <Text style={styles.footerText}>
                  Transaction successfully processed
                </Text>
                <Text style={styles.thankYou}>Thank you for your business</Text>
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
    marginTop: 8,
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
    alignSelf: 'center',
    paddingVertical: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '96%',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  infoSecValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },

  // Table Section
  tableSection: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
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
  col1: {
    flex: 0.1, // Sr#
  },
  col2: {
    flex: 0.3, // Product
  },
  col3: {
    flex: 0.15, // Cost
  },
  col4: {
    flex: 0.15, // Sale
  },
  col5: {
    flex: 0.1, // Qty
  },
  col6: {
    flex: 0.2, // Sub Total
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
  profitTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginTop: 4,
  },
  finalTotalRow: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
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
  profitLabel: {
    color: '#10B981',
  },
  profitValue: {
    color: '#10B981',
    fontSize: 18,
  },
  finalLabel: {
    color: '#144272',
    fontSize: 18,
  },
  finalValue: {
    color: '#144272',
    fontSize: 20,
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
  invoiceState: {
    fontSize: 16,
    color: '#144272',
    fontWeight: '600',
    marginBottom: 8,
  },
});
