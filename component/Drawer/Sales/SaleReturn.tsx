import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import Modal from 'react-native-modal';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';

export default function SaleReturn() {
  const {openDrawer} = useDrawer();
  const [selectedOption, setSelectedOption] = useState<'with' | 'without'>(
    'with',
  );
  const [close, setclose] = useState(false);

  const toggleclosebtn = () => {
    setclose(!close);
  };
  const Info = [
    {
      ItemName: 'abc',
      SoldQTY: '1',
      ReturnQty: '4',
      ReturnSubQty: '4',
      TransactionQTY: 4,
      Price: '4',
      totalPrice: '200',
      total: '555',
    },

    {
      ItemName: 'abc',
      SoldQTY: '1',
      ReturnQty: '4',
      ReturnSubQty: '4',
      TransactionQTY: 4,
      Price: '4',
      totalPrice: '200',
      total: '555',
    },
    {
      ItemName: 'abc',
      SoldQTY: '1',
      ReturnQty: '4',
      ReturnSubQty: '4',
      TransactionQTY: 4,
      Price: '4',
      totalPrice: '200',
      total: '555',
    },
    {
      ItemName: 'abc',
      SoldQTY: '1',
      ReturnQty: '4',
      ReturnSubQty: '4',
      TransactionQTY: 4,
      Price: '4',
      totalPrice: '200',
      total: '555',
    },
  ];

  const without = [
    {
      ProductName: 'abc',
      returnQTY: '3',
      returnSubQTY: '3',
      SubQTYPrice: '3',
      Price: '1',
      totalPrice: '9',
      totals: '22',
    },
    {
      ProductName: 'abc',
      returnQTY: '3',
      returnSubQTY: '3',
      SubQTYPrice: '3',
      Price: '1',
      totalPrice: '9',
      totals: '22',
    },
    {
      ProductName: 'abc',
      returnQTY: '3',
      returnSubQTY: '3',
      SubQTYPrice: '3',
      Price: '1',
      totalPrice: '9',
      totals: '22',
    },
    {
      ProductName: 'abc',
      returnQTY: '3',
      returnSubQTY: '3',
      SubQTYPrice: '3',
      Price: '1',
      totalPrice: '9',
      totals: '22',
    },
  ];
  const total = Info.reduce((acc, item) => acc + parseFloat(item.total), 0);

  Info.forEach(item => {
    const qty = parseFloat(item.SoldQTY);
    const Price = parseFloat(item.Price);
    item.total = (qty * Price).toString();
  });

  const totals = without.reduce(
    (acc, item) => acc + parseFloat(item.totals),
    0,
  );

  without.forEach(item => {
    const qty = parseFloat(item.returnQTY);
    const Price = parseFloat(item.Price);
    item.totals = (qty * Price).toString();
  });
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <ScrollView
          style={{
            marginBottom: 10,
          }}>
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
                Sale Return
              </Text>
            </View>

            <Text style={{color: 'white'}}>NEW INV</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => setSelectedOption('with')}>
              <View style={styles.addButton}>
                <Text
                  style={{
                    color: '#144272',
                    textAlign: 'center',
                  }}>
                  Return With Invoice
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelectedOption('without')}>
              <View style={styles.addButton}>
                <Text
                  style={{
                    color: '#144272',
                    textAlign: 'center',
                  }}>
                  Return Without Invoice
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View>
            {selectedOption === 'with' ? (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}>
                  <TextInput
                    style={[styles.input, {width: 310}]}
                    placeholderTextColor={'white'}
                    placeholder="Search Invoice..."
                  />
                  <TouchableOpacity>
                    <Image
                      style={{
                        tintColor: 'white',
                        width: 20,
                        height: 17,
                        alignSelf: 'center',
                        marginLeft: 5,
                        marginTop: 18,
                      }}
                      source={require('../../../assets/search.png')}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={[
                    styles.row,
                    {marginLeft: 14, marginRight: 10, marginTop: -2},
                  ]}>
                  <Text style={[styles.inputSmall, {color: 'white'}]}>
                    Name:
                  </Text>
                  <Text style={[styles.inputSmall, {color: 'white'}]}>
                    Father Name:
                  </Text>
                  <Text style={[styles.inputSmall, {color: 'white'}]}>
                    Address:
                  </Text>
                </View>
                <View>
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
                                {item.ItemName}
                              </Text>

                              <Image
                                style={{
                                  tintColor: '#144272',
                                  width: 15,
                                  height: 15,
                                  alignSelf: 'center',
                                  marginRight: 5,
                                }}
                                source={require('../../../assets/show.png')}
                              />
                            </View>

                            <View style={styles.infoRow}>
                              <View style={styles.rowt}>
                                <Text style={styles.txt}>Sold Quantity:</Text>
                                <Text style={styles.txt}>{item.SoldQTY}</Text>
                              </View>
                              <View style={styles.rowt}>
                                <Text style={styles.txt}>Return Quantity:</Text>
                                <Text style={styles.txt}>{item.ReturnQty}</Text>
                              </View>
                              <View style={styles.rowt}>
                                <Text style={styles.txt}>
                                  Return Sub Quantity:
                                </Text>
                                <Text style={styles.txt}>
                                  {item.ReturnSubQty}
                                </Text>
                              </View>
                              <View style={styles.rowt}>
                                <Text style={styles.txt}>
                                  Transaction Quantity:
                                </Text>
                                <Text style={styles.txt}>
                                  {item.TransactionQTY}
                                </Text>
                              </View>
                              <View style={styles.rowt}>
                                <Text style={styles.txt}>Price:</Text>
                                <Text style={styles.txt}>{item.Price}</Text>
                              </View>
                              <View style={[styles.rowt, {marginBottom: 5}]}>
                                <Text style={styles.txt}>Total Price:</Text>
                                <Text style={styles.txt}>
                                  {item.totalPrice}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </ScrollView>
                      )}
                    />
                  </View>
                </View>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>Total:</Text>
                  <Text style={styles.totalText}>{total}</Text>
                </View>
                <TouchableOpacity onPress={toggleclosebtn}>
                  <View style={styles.completeButton}>
                    <Text
                      style={{
                        textAlign: 'center',
                        padding: 5,
                        color: '#144272',
                      }}>
                      Complete
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}>
                  <TextInput
                    style={[styles.input, {width: 310}]}
                    placeholderTextColor={'white'}
                    placeholder="Search Product..."
                  />
                  <TouchableOpacity>
                    <Image
                      style={{
                        tintColor: 'white',
                        width: 20,
                        height: 17,
                        alignSelf: 'center',
                        marginLeft: 5,
                        marginTop: 18,
                      }}
                      source={require('../../../assets/search.png')}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={[
                    styles.row,
                    {
                      alignItems: 'center',
                      marginLeft: 14,
                      marginRight: 10,
                      marginTop: -2,
                    },
                  ]}>
                  <TextInput
                    style={styles.inputSmall}
                    placeholderTextColor={'white'}
                    placeholder="Quantity"
                  />

                  <TextInput
                    style={styles.inputSmall}
                    placeholderTextColor={'white'}
                    placeholder="Sub Quantity"
                  />
                </View>

                <FlatList
                  data={without}
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
                            {item.ProductName}
                          </Text>

                          <Image
                            style={{
                              tintColor: '#144272',
                              width: 15,
                              height: 15,
                              alignSelf: 'center',
                              marginRight: 5,
                            }}
                            source={require('../../../assets/show.png')}
                          />
                        </View>

                        <View style={styles.infoRow}>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>Return Quantity:</Text>
                            <Text style={styles.txt}>{item.returnQTY}</Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>Return Sub Quantity:</Text>
                            <Text style={styles.txt}>{item.returnSubQTY}</Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>Sub Quantity Price:</Text>
                            <Text style={styles.txt}>{item.SubQTYPrice}</Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={styles.txt}>Price:</Text>
                            <Text style={styles.txt}>{item.Price}</Text>
                          </View>
                          <View style={styles.rowt}>
                            <Text style={[styles.txt, {marginBottom: 5}]}>
                              Total Price:
                            </Text>
                            <Text style={[styles.txt, {marginBottom: 5}]}>
                              {item.totalPrice}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  )}
                />
                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>Total:</Text>
                  <Text style={styles.totalText}>{totals}</Text>
                </View>
                <TouchableOpacity onPress={toggleclosebtn}>
                  <View style={styles.completeButton}>
                    <Text
                      style={{
                        textAlign: 'center',
                        padding: 5,
                        color: '#144272',
                      }}>
                      Complete
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        <Modal isVisible={close}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Added
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Product has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setclose(!close)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
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
  section: {
    borderColor: 'white',
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
    margin: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    width: 160,
    height: 30,
  },
  completeButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: 80,
    alignSelf: 'center',
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
  text: {
    marginLeft: 15,
    color: '#144272',
    marginRight: 15,
  },
  value: {
    marginLeft: 15,
    color: '#144272',
    marginRight: 15,
  },
  infoRow: {
    marginTop: 5,
  },
  productinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 'auto',
    width: 314,
    borderRadius: 10,
  },
  tablehead: {
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 10,
    borderTopLeftRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalContainer: {
    padding: 5,
    borderTopWidth: 1,
    borderTopColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'static',
    bottom: 0,
    left: 0,
    right: 0,
    marginTop: 5,
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  txt: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
});
