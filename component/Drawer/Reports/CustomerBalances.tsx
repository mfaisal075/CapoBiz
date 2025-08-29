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
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RadioButton} from 'react-native-paper';

type TabType = 'receivables' | 'payables' | 'balances';

interface Customer {
  id: number;
  cust_name: string;
  cust_fathername: string;
}

interface Areas {
  id: number;
  area_name: string;
}

interface AllCustomersReceivable {
  cust_name: string;
  cust_address: string;
  cust_contact: string;
  cust_sec_contact: string;
  cust_third_contact: string;
  custac_balance: number;
  Balance: number;
}

interface SingleCustomersReceivable {
  cust_name: string;
  custac_total_bill_amount: number;
  custac_paid_amount: number;
  custac_balance: number;
}

export default function CustomerBalances() {
  const [selectedTab, setSelectedTab] = useState<TabType>('receivables');
  const [custOpen, setCustOpen] = useState(false);
  const [custValue, setCustValue] = useState('');
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaValue, setAreaValue] = useState('');
  const [custDropdown, setCustDropdown] = useState<Customer[]>([]);
  const transformedCustomer = custDropdown.map(cust => ({
    label: `${cust.cust_name} | ${cust.cust_fathername}`,
    value: cust.id.toString(),
  }));
  const [areaDropdown, setAreaDropdown] = useState<Areas[]>([]);
  const transformedAreas = areaDropdown.map(area => ({
    label: area.area_name,
    value: area.id.toString(),
  }));
  const [custReceivable, setCustReceivable] = useState<
    AllCustomersReceivable[]
  >([]);

  const [singleCustReceivable, setSingleCustReceivable] = useState<
    SingleCustomersReceivable[]
  >([]);

  const [selectionMode, setSelectionMode] = useState<
    'allCustomers' | 'singleCustomer' | ''
  >('allCustomers');

  const {openDrawer} = useDrawer();

  // Fetch Customer Dropdown
  const fetchCustDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcustomersdropdown`);
      setCustDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Area Dropdown
  const fetchAreaDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchareadata`);
      setAreaDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // All Customer Receivables, Payables
  const fetchAllCustData = async () => {
    try {
      if (selectedTab === 'receivables') {
        const res = await axios.post(`${BASE_URL}/fetchallreceivale`, {
          cust_id: custValue,
          area_id: areaValue,
        });
        setCustReceivable(res.data.allcustomerreceiveable);
      } else if (selectedTab === 'payables') {
        const res = await axios.post(`${BASE_URL}/fetchallpayables`, {
          cust_id: custValue,
          payarea_id: areaValue,
        });
        setCustReceivable(res.data.allcustomerpayables);
      } else if (selectedTab === 'balances') {
        const res = await axios.post(`${BASE_URL}/fetchbalances`, {
          cust_id: custValue,
          balarea_id: areaValue,
        });
        setCustReceivable(res.data.allcustomerbalance);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Single Customer Receivables
  const fetchSingleCustData = async () => {
    try {
      if (selectedTab === 'receivables') {
        const res = await axios.post(`${BASE_URL}/fetchcustreceivable`, {
          cust_id: custValue,
          area_id: areaValue,
        });
        setSingleCustReceivable(res.data.customer_receiveable);
      } else if (selectedTab === 'payables') {
        const res = await axios.post(`${BASE_URL}/singlepayable`, {
          cust_id: custValue,
          payarea_id: areaValue,
        });
        setSingleCustReceivable(res.data.customer_receiveable);
      } else if (selectedTab === 'balances') {
        const res = await axios.post(`${BASE_URL}/fetchcustbalances`, {
          cust_id: custValue,
          balarea_id: areaValue,
        });
        setSingleCustReceivable(res.data.customer_receiveable);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Total Receivable
  const calculateTotalReceivable = () => {
    let totalReceivable = 0;

    custReceivable.forEach(receivable => {
      const receivableAmount = receivable.custac_balance || 0;

      totalReceivable += receivableAmount;
    });

    return {
      totalReceivable: totalReceivable.toFixed(2),
    };
  };

  useEffect(() => {
    fetchCustDropdown();
    fetchAreaDropdown();
    fetchAllCustData();
    fetchSingleCustData();
  }, [custValue, areaValue]);

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
          <Text style={styles.headerTitle}>Customer Balances</Text>
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
            items={transformedCustomer}
            open={custOpen}
            setOpen={setCustOpen}
            value={custValue}
            setValue={setCustValue}
            placeholder="Select Customer"
            disabled={selectionMode === 'allCustomers'}
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
              selectionMode === 'allCustomers' && {
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

        <View style={styles.dropDownContainer}>
          <DropDownPicker
            items={transformedAreas}
            open={areaOpen}
            setOpen={setAreaOpen}
            value={areaValue}
            setValue={setAreaValue}
            placeholder="Select Area"
            disabled={selectionMode === 'singleCustomer'}
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
              {
                zIndex: 999,
              },
              selectionMode === 'singleCustomer' && {
                backgroundColor: 'gray',
              },
            ]}
            dropDownContainerStyle={{
              backgroundColor: 'white',
              borderColor: '#144272',
              width: '100%',
              marginTop: 8,
            }}
            labelStyle={{color: 'white'}}
            listItemLabelStyle={{color: '#144272'}}
          />
        </View>

        <View style={{width: '90%', alignSelf: 'center', marginTop: 10}}>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={() => {
              setSelectionMode('allCustomers');
              setAreaValue('');
            }}>
            <RadioButton
              value="allCustomers"
              color="white"
              uncheckedColor="white"
              status={
                selectionMode === 'allCustomers' ? 'checked' : 'unchecked'
              }
              onPress={() => {
                setSelectionMode('allCustomers');
                setAreaValue('');
              }}
            />
            <Text
              style={{
                color: 'white',
              }}>
              All Customer Receivables
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={() => {
              setSelectionMode('singleCustomer');
              setCustValue('');
            }}>
            <RadioButton
              value="singleCustomer"
              color="white"
              uncheckedColor="white"
              status={
                selectionMode === 'singleCustomer' ? 'checked' : 'unchecked'
              }
              onPress={() => {
                setSelectionMode('singleCustomer');
                setCustValue('');
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

        {selectionMode === 'allCustomers' && (
          <FlatList
            data={custReceivable}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{paddingBottom: 50}}
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
                    {item.cust_name}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.row}>
                    <Text style={styles.text}>Balance:</Text>
                    <Text style={styles.text}>
                      {selectedTab === 'receivables' &&
                        item.custac_balance.toFixed(2)}
                      {selectedTab === 'payables' || selectedTab === 'balances'
                        ? item.Balance.toFixed(2)
                        : '0.00'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.text}>Contact 1:</Text>
                    <Text style={styles.text}>{item.cust_contact ?? '--'}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.text}>Contact 2:</Text>
                    <Text style={styles.text}>
                      {item.cust_sec_contact ?? '--'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.text}>Contact 3:</Text>
                    <Text style={styles.text}>
                      {item.cust_third_contact ?? '--'}
                    </Text>
                  </View>
                  <View style={[styles.row]}>
                    <Text style={styles.text}>Address:</Text>
                    <Text
                      style={[styles.text, {textAlign: 'right', width: '70%'}]}>
                      {item.cust_address ?? '--'}
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
        {selectionMode === 'singleCustomer' && (
          <FlatList
            data={singleCustReceivable}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{paddingBottom: 50}}
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
                    {item.cust_name}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.row}>
                    <Text style={styles.text}>Total Bill Amount:</Text>
                    <Text style={styles.text}>
                      {item.custac_total_bill_amount.toFixed(2) ?? '0.00'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.text}>Paid Amount:</Text>
                    <Text style={styles.text}>
                      {item.custac_paid_amount.toFixed(2) ?? '--'}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.text}>Balance:</Text>
                    <Text style={styles.text}>
                      {item.custac_balance.toFixed(2) ?? '--'}
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

        {selectionMode === 'allCustomers' && selectedTab === 'receivables' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{custReceivable.length}</Text>
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
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 38,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '100%',
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
