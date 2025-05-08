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
} from 'react-native';
import React, {useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import Modal from 'react-native-modal';

export default function TradingList() {
  
  const {openDrawer} = useDrawer();
  const Info = [
    {
      Invoice: 'TD-1',
      Date: '11 - 3 - 25',
      Supplier: 'ali',
      CustomerName: 'Naeem',
      Reference: 111,
      TotalCost: 55,
      TotalSale: 99,
      Profit: 399.0,
      TradeTotal: 599.0,
    },
  ];

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

        <ScrollView>
          <View>
            <FlatList
              data={Info}
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
                        {item.Invoice}
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}>
                        <TouchableOpacity onPress={toggleview}>
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
                        <Text style={styles.text}>{item.Supplier}</Text>
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
                          {item.CustomerName}
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
                          {item.Date}
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
                          {item.Reference}
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
                          {item.TotalCost}
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
                          {item.TotalSale}
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
                          {item.Profit}
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
                          {item.TradeTotal}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
            />
          </View>
        </ScrollView>
        {/*view modal*/}
        <Modal isVisible={view}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 500,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Trading Detail
              </Text>
              <TouchableOpacity onPress={() => setview(!view)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View>
              <View>
                <FlatList
                  data={ViewModal}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => (
                    <ScrollView
                      style={{
                        padding: 5,
                      }}>
                      <View style={styles.table}>
                        <View style={[styles.cardContainer]}>
                          <View style={styles.infoGrid}>
                            <Text style={styles.labl}>{item.Invoice}</Text>
                            <Text style={styles.labl}>Supplier Name:</Text>
                            <Text style={styles.valu}>{item.Supplier}</Text>

                            <Text style={styles.labl}>Customer Name:</Text>
                            <Text style={styles.valu}>{item.CustomerName}</Text>

                            <Text style={styles.labl}>Date:</Text>
                            <Text style={styles.valu}>{item.Date}</Text>

                            <Text style={styles.labl}>Product:</Text>
                            <Text style={styles.valu}>{item.Product}</Text>

                            <Text style={styles.labl}>Date:</Text>
                            <Text style={styles.valu}>{item.Date}</Text>

                            <Text style={styles.labl}>Cost Price:</Text>
                            <Text style={styles.valu}>{item.CostPrice}</Text>

                            <Text style={styles.labl}>Sale Price:</Text>
                            <Text style={styles.valu}>{item.SalePrice}</Text>

                            <Text style={styles.labl}>Quantity:</Text>
                            <Text style={styles.valu}>{item.QTY}</Text>

                            <Text style={styles.labl}>SubTotal:</Text>
                            <Text style={styles.valu}>{item.SubTotal}</Text>

                            <Text style={styles.labl}>Total Cost:</Text>
                            <Text style={styles.valu}>{item.TotalCost}</Text>

                            <Text style={styles.labl}>Total Sale:</Text>
                            <Text style={styles.valu}>{item.TotalSale}</Text>

                            <Text style={styles.labl}>Profit:</Text>
                            <Text style={styles.valu}>{item.Profit}</Text>

                            <Text style={styles.labl}>Order Total:</Text>
                            <Text style={styles.valu}>{item.OrderTotal}</Text>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  )}
                />
              </View>
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
