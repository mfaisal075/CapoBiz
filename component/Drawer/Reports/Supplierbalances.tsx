import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import RadioForm from 'react-native-simple-radio-button';
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type TabType = 'receivables' | 'payables' | 'balances';

type CustomerData = {
  id: string;
  Supplier?: string;
  Contact?: number;

  Address?: string;

  TotalBillAmount?: number;
  Paidamount?: number;
  Balance?: number;
};

const customers = [
  'Naeem s/o NILL',
  'walk_in_customer s/o Nill | NILL',
  'Khalid s/o | NILL',
  'a s/o | NILL',
  'Asif Ali Zardari s/o NILL',
];

const mockData: Record<TabType, {all: CustomerData[]; single: CustomerData[]}> =
  {
    receivables: {
      all: [
        {
          id: '1',
          Supplier: 'n',
          Contact: 1200,
          Balance: 2,
          Address: 'hhh',
        },
      ],
      single: [{id: '1', TotalBillAmount: 23, Paidamount: 1200, Balance: 88}],
    },
    payables: {
      all: [
        {
          id: '1',
          Supplier: 'n',
          Contact: 1200,
          Balance: 2,
          Address: 'hhh',
        },
      ],
      single: [{id: '1', TotalBillAmount: 23, Paidamount: 1200, Balance: 88}],
    },
    balances: {
      all: [
        {
          id: '1',
          Supplier: 'n',
          Contact: 1200,
          Balance: 2,
          Address: 'hhh',
        },
      ],
      single: [{id: '1', TotalBillAmount: 23, Paidamount: 1200, Balance: 88}],
    },
  };

interface Suppliers {
  id: number;
  sup_name: string;
}

interface AllSupplierData {
  sup_name: string;
  sup_address: string;
  sup_contact: string;
  supac_balance: number;
}

interface SingleSupplierData {
  sup_name: string;
  Balance: number;
  supac_total_bill_amount: number;
  supac_paid_amount: number;
}

export default function SupplierBalances() {
  const [selectedTab, setSelectedTab] = useState<TabType>('receivables');
  const [suppDropdown, setSuppDropdown] = useState<Suppliers[]>([]);
  const transformedSuppliers = suppDropdown.map(supp => ({
    label: supp.sup_name,
    value: supp.id.toString(),
  }));
  const [suppOpen, setSuppOpen] = useState(false);
  const [suppValue, setSuppValue] = useState('');
  const [allSuppData, setAllSuppData] = useState<AllSupplierData[]>([]);
  const [singleSuppData, setSingleSuppData] = useState<SingleSupplierData[]>(
    [],
  );

  const [selectionMode, setSelectionMode] = useState<
    'allSuppliers' | 'singleSupplier' | ''
  >('allSuppliers');
  const {openDrawer} = useDrawer();

  // Fetch Customer Dropdown
  const fetchCustDropdown = async () => {
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
        setAllSuppData(res.data.allsupplierpayables);
      } else if (selectedTab === 'payables') {
        const res = await axios.post(`${BASE_URL}/fetchsupplier_payable`, {
          supp_id: suppValue,
        });
        setAllSuppData(res.data.allsupplierpayables);
      } else if (selectedTab === 'balances') {
        const res = await axios.post(`${BASE_URL}/fetchsupplierbalance`, {
          supp_id: suppValue,
        });
        setAllSuppData(res.data.allsupplierpayables);
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
        setSingleSuppData(res.data.supplier_payable);
      } else if (selectedTab === 'payables') {
        const res = await axios.post(`${BASE_URL}/singlesupplier_payable`, {
          supp_id: suppValue,
        });
        setSingleSuppData(res.data.supplier_payable);
      } else if (selectedTab === 'balances') {
        const res = await axios.post(`${BASE_URL}/singlesupplierbalance`, {
          supp_id: suppValue,
        });
        setSingleSuppData(res.data.supplier_payable);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Receivable
  const calculateTotalReceivable = () => {
    let totalReceivable = 0;

    allSuppData.forEach(receivable => {
      const receivableAmount = receivable.supac_balance || 0;

      totalReceivable += receivableAmount;
    });

    return {
      totalReceivable: totalReceivable.toFixed(2),
    };
  };

  // Calculate Total Payable
  const calculateTotalPayable = () => {
    let totalPayable = 0;

    allSuppData.forEach(receivable => {
      const payableAmount = receivable.supac_balance || 0;

      totalPayable += payableAmount;
    });

    return {
      totalPayable: totalPayable.toFixed(2),
    };
  };

  // Calculate Total Balance
  const calculateTotalBalance = () => {
    let totalBalance = 0;

    allSuppData.forEach(balance => {
      const balanceAmount = balance.supac_balance || 0;

      totalBalance += balanceAmount;
    });

    return {
      totalBalance: totalBalance.toFixed(2),
    };
  };

  useEffect(() => {
    fetchCustDropdown();
    fetchSingleSuppData();
    fetchAllSuppData();
  }, [suppValue, selectedTab, selectionMode]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../../assets/menu.png')}
              style={styles.menuIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Supplier Balances</Text>
        </View>

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

        <View style={styles.dropDownContainer}>
          <DropDownPicker
            items={transformedSuppliers}
            open={suppOpen}
            setOpen={setSuppOpen}
            value={suppValue}
            setValue={setSuppValue}
            placeholder="Select Supplier"
            disabled={selectionMode === 'allSuppliers'}
            placeholderStyle={{color: 'white'}}
            textStyle={{color: 'white'}}
            ArrowUpIconComponent={() => (
              <Text>
                <Icon name="chevron-up" size={15} color="white" />
              </Text>
            )}
            ArrowDownIconComponent={() => (
              <Text>
                <Icon name="chevron-down" size={15} color="white" />
              </Text>
            )}
            style={[
              styles.dropdown,
              selectionMode === 'allSuppliers' && {
                backgroundColor: 'gray',
              },
            ]}
            dropDownContainerStyle={{
              backgroundColor: 'white',
              borderColor: '#144272',
              width: '100%',
              marginTop: 8,
              zIndex: 1000,
            }}
            labelStyle={{color: 'white'}}
            listItemLabelStyle={{color: '#144272'}}
          />
        </View>

        <View style={{width: '90%', alignSelf: 'center', marginTop: 10}}>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={() => {
              setSelectionMode('allSuppliers');
              setSuppValue('');
            }}>
            <RadioButton
              value="allSuppliers"
              color="white"
              uncheckedColor="white"
              status={
                selectionMode === 'allSuppliers' ? 'checked' : 'unchecked'
              }
              onPress={() => {
                setSelectionMode('allSuppliers');
                setSuppValue('');
              }}
            />
            <Text
              style={{
                color: 'white',
              }}>
              All Suppliers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={() => {
              setSelectionMode('singleSupplier');
              // setCustValue('');
            }}>
            <RadioButton
              value="singleSupplier"
              color="white"
              uncheckedColor="white"
              status={
                selectionMode === 'singleSupplier' ? 'checked' : 'unchecked'
              }
              onPress={() => {
                setSelectionMode('singleSupplier');
                // setCustValue('');
              }}
            />
            <Text
              style={{
                color: 'white',
              }}>
              Single Customer Receivables
            </Text>
          </TouchableOpacity>
        </View>

        {selectionMode === 'allSuppliers' && (
          <FlatList
            data={allSuppData}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{paddingBottom: 50}}
            style={{marginTop: 10}}
            renderItem={({item}) => (
              <View style={styles.table}>
                <View style={styles.tablehead}>
                  <Text
                    style={{
                      color: '#144272',
                      fontWeight: 'bold',
                      marginLeft: 5,
                      marginTop: 5,
                    }}>
                    {item.sup_name}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.row}>
                    <Text style={styles.text}>Contact:</Text>
                    <Text style={styles.text}>{item.sup_contact}</Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.text}>Balance:</Text>
                    <Text style={styles.text}>{item.supac_balance}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.text}>Address:</Text>
                    <Text style={styles.text}>{item.sup_address}</Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View
                style={{
                  width: '100%',
                  height: 300,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>
                  No data found.
                </Text>
              </View>
            }
          />
        )}
        {selectionMode === 'singleSupplier' && (
          <FlatList
            data={singleSuppData}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{paddingBottom: 50}}
            style={{marginTop: 10}}
            renderItem={({item}) => (
              <View style={styles.table}>
                <View style={styles.tablehead}>
                  <Text
                    style={{
                      color: '#144272',
                      fontWeight: 'bold',
                      marginLeft: 5,
                      marginTop: 5,
                    }}>
                    {item.sup_name}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.row}>
                    <Text style={styles.text}>Total Bill Amount:</Text>
                    <Text style={styles.text}>
                      {item.supac_total_bill_amount.toFixed(2) ?? '0.00'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.text}>Paid Amount:</Text>
                    <Text style={styles.text}>
                      {item.supac_paid_amount.toFixed(2) ?? '--'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.text}>Balance:</Text>
                    <Text style={styles.text}>
                      {item.Balance.toFixed(2) ?? '--'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View
                style={{
                  width: '100%',
                  height: 300,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>
                  No data found.
                </Text>
              </View>
            }
          />
        )}

        {selectionMode === 'allSuppliers' && selectedTab === 'receivables' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{allSuppData.length}</Text>
            </View>
            {(() => {
              const {totalReceivable} = calculateTotalReceivable();

              return (
                <View
                  style={{
                    flexDirection: 'column',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Receivable: </Text>
                    <Text style={styles.totalText}>{totalReceivable}</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        )}
        {selectionMode === 'allSuppliers' && selectedTab === 'payables' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{allSuppData.length}</Text>
            </View>
            {(() => {
              const {totalPayable} = calculateTotalPayable();

              return (
                <View
                  style={{
                    flexDirection: 'column',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Payables : </Text>
                    <Text style={styles.totalText}>{totalPayable}</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        )}
        {selectionMode === 'allSuppliers' && selectedTab === 'balances' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{allSuppData.length}</Text>
            </View>
            {(() => {
              const {totalBalance} = calculateTotalBalance();

              return (
                <View
                  style={{
                    flexDirection: 'column',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Payables : </Text>
                    <Text style={styles.totalText}>{totalBalance}</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        )}
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
    padding: 10,
    justifyContent: 'space-between',
  },
  menuIcon: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  headerTitle: {
    flex: 1,
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 30,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginHorizontal: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 8,
    borderColor: '#144272',
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 5,
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
  form: {
    margin: 12,
    padding: 10,
    borderRadius: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    color: 'white',
  },
  dropdown: {
    marginBottom: 10,
    zIndex: 1000,
    backgroundColor: 'transparent',
    color: 'white',
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
  },
  dropdownContainer: {
    borderColor: 'white',
    backgroundColor: '#fff',
    zIndex: 999,
    color: '#144272',
  },
  radioLabel: {
    fontSize: 14,
    marginBottom: 10,
    color: 'white',
  },
  loadButton: {
    marginTop: 15,
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 6,
  },
  loadButtonText: {
    color: '#144272',
    textAlign: 'center',
    fontWeight: '600',
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 12,
    borderRadius: 5,
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 'auto',
    width: '90%',
    borderRadius: 6,
    marginBottom: 10,
  },
  tablehead: {
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 6,
    borderTopLeftRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
    marginVertical: 2,
  },
  totalContainer: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'white',
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dropDownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
  },
});
