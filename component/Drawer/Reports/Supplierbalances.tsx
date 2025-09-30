import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RadioButton} from 'react-native-paper';
import RNPrint from 'react-native-print';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';

type TabType = 'receivables' | 'payables' | 'balances';

interface Suppliers {
  id: number;
  sup_name: string;
}

interface AllSupplierData {
  sup_name: string;
  sup_address: string;
  sup_contact: string;
  supac_balance: number;
  Balance: number;
}

interface SingleSupplierData {
  sup_name: string;
  Balance: number;
  supac_total_bill_amount: number;
  supac_paid_amount: number;
}

export default function SupplierBalances() {
  const [selectedTab, setSelectedTab] = useState<TabType>('receivables');
  const [suppOpen, setSuppOpen] = useState(false);
  const [suppValue, setSuppValue] = useState('');
  const [suppDropdown, setSuppDropdown] = useState<Suppliers[]>([]);
  const transformedSuppliers = suppDropdown.map(supp => ({
    label: supp.sup_name,
    value: supp.id.toString(),
  }));
  const [allSuppData, setAllSuppData] = useState<AllSupplierData[]>([]);
  const [singleSuppData, setSingleSuppData] = useState<SingleSupplierData[]>(
    [],
  );
  const [selectionMode, setSelectionMode] = useState<
    'allSuppliers' | 'singleSupplier' | ''
  >('allSuppliers');

  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData =
    selectionMode === 'allSuppliers' ? allSuppData : singleSuppData;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Handle Print
  const handlePrint = async () => {
    const dataList =
      selectionMode === 'allSuppliers' ? allSuppData : singleSuppData;

    if (dataList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    const dateStr = new Date().toLocaleDateString();
    const tabTitle = selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1);

    // Build HTML table rows
    const rows = dataList
      .map((item: any, index) => {
        if (selectionMode === 'allSuppliers') {
          const balance =
            selectedTab === 'receivables' ? item.supac_balance : item.Balance;
          return `
            <tr>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${
                index + 1
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.sup_name
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                balance?.toFixed(2) || '0.00'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.sup_contact || '--'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.sup_address || '--'
              }</td>
            </tr>`;
        } else {
          return `
            <tr>
              <td style="border:1px solid #000; padding:4px; text-align:center;">${
                index + 1
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.sup_name
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.supac_total_bill_amount?.toFixed(2) || '0.00'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.supac_paid_amount?.toFixed(2) || '0.00'
              }</td>
              <td style="border:1px solid #000; padding:4px;">${
                item.Balance?.toFixed(2) || '0.00'
              }</td>
            </tr>`;
        }
      })
      .join('');

    const headers =
      selectionMode === 'allSuppliers'
        ? `<tr style="background:#f0f0f0;">
           <th style="border:1px solid #000; padding:6px;">Sr#</th>
           <th style="border:1px solid #000; padding:6px;">Supplier Name</th>
           <th style="border:1px solid #000; padding:6px;">Balance</th>
           <th style="border:1px solid #000; padding:6px;">Contact</th>
           <th style="border:1px solid #000; padding:6px;">Address</th>
         </tr>`
        : `<tr style="background:#f0f0f0;">
           <th style="border:1px solid #000; padding:6px;">Sr#</th>
           <th style="border:1px solid #000; padding:6px;">Supplier Name</th>
           <th style="border:1px solid #000; padding:6px;">Total Bill</th>
           <th style="border:1px solid #000; padding:6px;">Paid Amount</th>
           <th style="border:1px solid #000; padding:6px;">Balance</th>
         </tr>`;

    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Supplier ${tabTitle} Report</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="font-size:12px;">Date: ${dateStr}</div>
            <div style="text-align:center; flex:1; font-size:16px; font-weight:bold;">Point of Sale System</div>
          </div>
            
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:18px; font-weight:bold;">${bussName}</div>
            <div style="font-size:14px;">${bussAddress}</div>
            <div style="font-size:14px; font-weight:bold; text-decoration:underline;">
              Supplier ${tabTitle} Report
            </div>
          </div>
            
          <table style="border-collapse:collapse; width:100%; font-size:12px;">
            <thead>
              ${headers}
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    await RNPrint.print({html});
  };

  // Fetch Supplier Dropdown
  const fetchSuppDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchsuppliersdropdown`);
      setSuppDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Supplier Receiveable, Payable & Balance
  const fetchAllSuppData = async () => {
    try {
      if (selectedTab === 'receivables') {
        const res = await axios.post(`${BASE_URL}/fetchsupplier_receiveable`, {
          supp_id: suppValue,
        });
        setAllSuppData(res.data.allsupplierpayables || []);
      } else if (selectedTab === 'payables') {
        const res = await axios.post(`${BASE_URL}/fetchsupplier_payable`, {
          supp_id: suppValue,
        });
        setAllSuppData(res.data.allsupplierpayables || []);
      } else if (selectedTab === 'balances') {
        const res = await axios.post(`${BASE_URL}/fetchsupplierbalance`, {
          supp_id: suppValue,
        });
        setAllSuppData(res.data.allsupplierpayables || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Single Supplier Receivable, Payable, Balance
  const fetchSingleSuppData = async () => {
    try {
      if (selectedTab === 'receivables') {
        const res = await axios.post(`${BASE_URL}/singlesupplier_receiveable`, {
          supp_id: suppValue,
        });
        setSingleSuppData(res.data.supplier_payable || []);
      } else if (selectedTab === 'payables') {
        const res = await axios.post(`${BASE_URL}/singlesupplier_payable`, {
          supp_id: suppValue,
        });
        setSingleSuppData(res.data.supplier_payable || []);
      } else if (selectedTab === 'balances') {
        const res = await axios.post(`${BASE_URL}/singlesupplierbalance`, {
          supp_id: suppValue,
        });
        setSingleSuppData(res.data.supplier_payable || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Amount
  const calculateTotalAmount = () => {
    let totalAmount = 0;

    allSuppData.forEach(item => {
      const amount = item.supac_balance || item.Balance || 0;
      totalAmount += amount;
    });

    return {
      totalAmount: Number(totalAmount).toFixed(2),
    };
  };

  const totals = calculateTotalAmount();

  useEffect(() => {
    fetchSuppDropdown();
    fetchAllSuppData();
    fetchSingleSuppData();
    setCurrentPage(1); // Reset to first page when data changes
  }, [suppValue, selectedTab, selectionMode]);

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

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Supplier Balances</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} onPress={handlePrint}>
            <Icon name="printer" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterContainer}>
          {/* Toggle Tabs */}
          <View style={styles.toggleRow}>
            {(['receivables', 'payables', 'balances'] as TabType[]).map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[
                  styles.toggleButton,
                  selectedTab === tab && styles.activeButton,
                ]}>
                <Text
                  style={[
                    styles.toggleText,
                    selectedTab === tab && styles.activeText,
                  ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Radio Buttons */}
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSelectionMode('allSuppliers');
                setSuppValue('');
              }}>
              <RadioButton
                value="allSuppliers"
                status={
                  selectionMode === 'allSuppliers' ? 'checked' : 'unchecked'
                }
                color="#144272"
                uncheckedColor="#666"
              />
              <Text style={styles.radioText}>All Suppliers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => {
                setSelectionMode('singleSupplier');
              }}>
              <RadioButton
                value="singleSupplier"
                status={
                  selectionMode === 'singleSupplier' ? 'checked' : 'unchecked'
                }
                color="#144272"
                uncheckedColor="#666"
              />
              <Text style={styles.radioText}>Single Supplier</Text>
            </TouchableOpacity>
          </View>

          {/* Dropdown */}
          <View style={styles.dropdownRow}>
            <View style={styles.dropdownWrapper}>
              <DropDownPicker
                items={transformedSuppliers}
                open={suppOpen}
                setOpen={setSuppOpen}
                value={suppValue}
                setValue={setSuppValue}
                placeholder="Select Supplier"
                disabled={selectionMode === 'allSuppliers'}
                placeholderStyle={{color: '#666'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="chevron-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="chevron-down" size={18} color="#144272" />
                )}
                style={[
                  styles.dropdown,
                  selectionMode === 'allSuppliers' && styles.dropdownDisabled,
                ]}
                dropDownContainerStyle={styles.dropDownContainer}
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>
          </View>
        </View>

        {/* Summary Cards */}
        {selectionMode === 'allSuppliers' && (
          <View style={styles.summaryContainer}>
            <View style={styles.innerSummaryCtx}>
              <Text style={styles.summaryLabel}>
                Total{' '}
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}:
              </Text>
              <Text style={styles.summaryValue}>{totals.totalAmount}</Text>
            </View>
          </View>
        )}

        <View style={styles.listContainer}>
          <FlatList<AllSupplierData | SingleSupplierData>
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              const isAllSuppliers = selectionMode === 'allSuppliers';
              const allSupplierItem = item as AllSupplierData;
              const singleSupplierItem = item as SingleSupplierData;

              return (
                <View style={styles.card}>
                  {/* Header Row */}
                  <View style={styles.headerRow}>
                    <View style={styles.avatarBox}>
                      <Text style={styles.avatarText}>
                        {(isAllSuppliers
                          ? allSupplierItem.sup_name
                          : singleSupplierItem.sup_name
                        )?.charAt(0) || 'S'}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.supplierName}>
                        {isAllSuppliers
                          ? allSupplierItem.sup_name
                          : singleSupplierItem.sup_name}
                      </Text>
                    </View>
                  </View>

                  {/* Info Section */}
                  <View style={styles.infoBox}>
                    {isAllSuppliers ? (
                      <>
                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="cash"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>Balance</Text>
                          </View>
                          <Text style={styles.valueText}>
                            Rs.{' '}
                            {selectedTab === 'receivables'
                              ? allSupplierItem.supac_balance?.toFixed(2) ||
                                '0.00'
                              : allSupplierItem.Balance?.toFixed(2) || '0.00'}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="phone"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>Contact</Text>
                          </View>
                          <Text style={styles.valueText}>
                            {allSupplierItem.sup_contact || '--'}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="map-marker"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>Address</Text>
                          </View>
                          <Text style={[styles.valueText, {maxWidth: '60%'}]}>
                            {allSupplierItem.sup_address || '--'}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="receipt"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>
                              Total Bill Amount
                            </Text>
                          </View>
                          <Text style={styles.valueText}>
                            Rs.{' '}
                            {singleSupplierItem.supac_total_bill_amount?.toFixed(
                              2,
                            ) || '0.00'}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="cash-check"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>Paid Amount</Text>
                          </View>
                          <Text style={styles.valueText}>
                            Rs.{' '}
                            {singleSupplierItem.supac_paid_amount?.toFixed(2) ||
                              '0.00'}
                          </Text>
                        </View>

                        <View style={styles.infoRow}>
                          <View style={styles.labelRow}>
                            <Icon
                              name="cash-minus"
                              size={18}
                              color="#144272"
                              style={styles.infoIcon}
                            />
                            <Text style={styles.labelText}>Balance</Text>
                          </View>
                          <Text style={styles.valueText}>
                            Rs.{' '}
                            {singleSupplierItem.Balance?.toFixed(2) || '0.00'}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-hard-hat" size={48} color="#666" />
                <Text style={styles.emptyText}>No suppliers found.</Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 70}}
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

        <Toast />
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

  // Filter Container
  filterContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
    zIndex: 1000,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  toggleButton: {
    flex: 1,
    padding: 8,
    borderColor: '#144272',
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  activeButton: {
    backgroundColor: '#144272',
  },
  toggleText: {
    textAlign: 'center',
    color: '#144272',
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    marginBottom: 15,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: '#144272',
    marginLeft: -5,
    fontWeight: '500',
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#144272',
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  dropdownDisabled: {
    backgroundColor: '#9a9a9a48',
    borderColor: '#ccc',
  },
  dropDownContainer: {
    backgroundColor: '#fff',
    borderColor: '#144272',
  },

  //Summary Container Styling
  summaryContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    paddingVertical: 10,
  },
  innerSummaryCtx: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#144272',
    fontWeight: 'bold',
  },

  // Flat List Styling
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    zIndex: 1000,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#144272',
    flexWrap: 'wrap',
  },
  infoBox: {
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    flex: 1,
  },
  infoIcon: {
    marginRight: 6,
  },
  labelText: {
    fontSize: 13,
    color: '#144272',
    fontWeight: '600',
  },
  valueText: {
    fontSize: 13,
    color: '#333',
    maxWidth: '50%',
    textAlign: 'right',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },

  // Pagination Styling
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
    paddingVertical: 8,
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
    alignItems: 'center',
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
});
