import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';

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
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [allTrades, setAllTrades] = useState<AllTrades[]>([]);
  const [singleTradeDetails, setSingleTradeDetails] =
    useState<TradeDetails | null>(null);
  const [modalTradeDetails, setModalTradeDetails] = useState<
    ModalTradeDetails[]
  >([]);
  const [modalVisible, setModalVisible] = useState('');
  {
    /*view modal*/
  }
  const ViewModal = [
    {
      Invoice: 'TD-1',
      Date: '11 - 3 - 25',
      Supplier: 'ali',
      CustomerName: 'Naeem',
      TotalCost: 55,
      TotalSale: 99,
      Profit: 399.0,
      OrderTotal: 599.0,
      Product: 'Sufi',
      QTY: 22,
      CostPrice: 200.0,
      SalePrice: 599.0,
      SubTotal: 599.0,
    },
  ];

  const [view, setview] = useState(false);

  const toggleview = () => {
    setview(!view);
  };

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
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../../assets/menu.png')}
              style={{
                width: 30,
                height: 30,
                tintColor: 'white',
              }}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text
              style={{
                color: 'white',
                fontSize: 22,
                fontWeight: 'bold',
              }}>
              Trading List
            </Text>
          </View>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Export Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Print</Text>
          </TouchableOpacity>
        </View>

        <View>
          <FlatList
            data={allTrades}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <ScrollView
                style={{
                  padding: 5,
                }}>
                <View style={styles.table}>
                  <View style={styles.tablehead}>
                    <Text
                      style={{
                        color: '#144272',
                        fontWeight: 'bold',
                        marginLeft: 5,
                        marginTop: 5,
                      }}>
                      {item.trad_invoice_no}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          setModalVisible('View');
                          fetchSingleTrade(item.id);
                        }}>
                        <Image
                          style={{
                            tintColor: '#144272',
                            width: 15,
                            height: 15,
                            alignSelf: 'center',
                            marginRight: 5,
                            marginTop: 9,
                          }}
                          source={require('../../../assets/show.png')}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Supplier Name:</Text>
                      <Text style={styles.text}>{item.sup_name}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        Customer Name:
                      </Text>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        {item.cust_name}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        Date:
                      </Text>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        {new Date(item.trad_date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        Reference:
                      </Text>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        {item.trad_ref_no}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        Total Cost:
                      </Text>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        {item.trad_total_cost}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        Total Sale:
                      </Text>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        {item.trad_total_sale}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        Profit:
                      </Text>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        {item.trad_profit}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        Trade Total:
                      </Text>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        {item.trad_payable}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
          />
        </View>

        {/*view modal*/}
        <Modal
          visible={modalVisible === 'View'}
          transparent
          animationType="slide">
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 16,
                width: '95%',
                maxHeight: '90%',
              }}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text
                  style={{fontSize: 18, fontWeight: 'bold', color: '#144272'}}>
                  Trading Detail
                </Text>
                <TouchableOpacity onPress={() => setModalVisible('')}>
                  <Image
                    source={require('../../../assets/cross.png')}
                    style={{width: 20, height: 20}}
                  />
                </TouchableOpacity>
              </View>

              {singleTradeDetails && (
                <View style={{marginVertical: 10}}>
                  <Text style={{fontWeight: 'bold', color: '#144272'}}>
                    TD-{singleTradeDetails.trade.trad_invoice_no}
                  </Text>
                  <Text>
                    Supplier:{' '}
                    <Text style={{color: '#144272'}}>
                      {singleTradeDetails.supplier.sup_name}
                    </Text>
                  </Text>
                  <Text>
                    Customer:{' '}
                    <Text style={{color: '#144272'}}>
                      {singleTradeDetails.customer.cust_name}
                    </Text>
                  </Text>
                  <Text>
                    Date:{' '}
                    <Text style={{color: '#144272'}}>
                      {new Date(
                        singleTradeDetails.trade.trad_date,
                      ).toLocaleDateString('en-GB')}
                    </Text>
                  </Text>
                </View>
              )}

              {/* Table Header */}
              <View
                style={{
                  flexDirection: 'row',
                  borderBottomWidth: 1,
                  borderColor: '#ccc',
                  paddingBottom: 5,
                }}>
                <Text style={{flex: 0.8, fontWeight: 'bold'}}>Sr#</Text>
                <Text style={{flex: 2, fontWeight: 'bold'}}>Product</Text>
                <Text style={{flex: 1.2, fontWeight: 'bold'}}>Cost Price</Text>
                <Text style={{flex: 1.2, fontWeight: 'bold'}}>Sale Price</Text>
                <Text style={{flex: 1, fontWeight: 'bold'}}>QTY</Text>
                <Text style={{flex: 1.4, fontWeight: 'bold'}}>Subtotal</Text>
              </View>

              {/* FlatList */}
              <FlatList
                data={modalTradeDetails}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingVertical: 5,
                      borderBottomWidth: 0.5,
                      borderColor: '#eee',
                    }}>
                    <Text style={{flex: 0.8}}>{index + 1}</Text>
                    <Text style={{flex: 2}}>{item.prod_name}</Text>
                    <Text style={{flex: 1.2}}>{item.tradd_cost_price}</Text>
                    <Text style={{flex: 1.2}}>{item.tradd_sale_price}</Text>
                    <Text style={{flex: 1}}>{item.tradd_qty}</Text>
                    <Text style={{flex: 1.4}}>{item.tradd_sub_total}</Text>
                  </View>
                )}
              />

              {/* Totals */}
              {singleTradeDetails && (
                <View style={{marginTop: 15}}>
                  <Text>
                    Total Cost: {singleTradeDetails.trade.trad_total_cost}
                  </Text>
                  <Text>
                    Total Sale: {singleTradeDetails.trade.trad_total_sale}
                  </Text>
                  <Text>Profit: {singleTradeDetails.trade.trad_profit}</Text>
                  <Text>
                    Order Total: {singleTradeDetails.trade.trad_payable}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={{
                  backgroundColor: '#6C63FF',
                  padding: 10,
                  borderRadius: 5,
                  marginTop: 15,
                  alignSelf: 'flex-end',
                }}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 'auto',
    width: 314,
    borderRadius: 5,
  },
  tablehead: {
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 5,
    borderTopLeftRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  value: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },
  lastrow: {
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderBottomEndRadius: 10,
    borderBottomLeftRadius: 10,
  },
  card: {
    borderColor: '#144272',
    backgroundColor: 'white',
    height: 'auto',
    borderRadius: 12,
    elevation: 15,
    marginBottom: 5,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    color: 'white',
  },
  inputSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  addButton: {
    marginLeft: 8,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    width: 60,
  },
  completeButton: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 320,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: 285,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
    marginLeft: 10,
    marginRight: 10,
  },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
  },
  productinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
  },
  cardContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    paddingBottom: 24,
    marginBottom: 40,
  },
  customerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#144272',
  },
  noImageText: {
    color: '#144272',
    fontStyle: 'italic',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  labl: {
    width: '68%',
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 4,
  },
  valu: {
    width: '68%',
    marginBottom: 8,
    color: '#144272',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  exportBtn: {
    backgroundColor: '#144272',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  exportText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
