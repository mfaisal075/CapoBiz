import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  SafeAreaView,
  Image,
  FlatList,
} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';

export default function OrderTablePOS() {
  const navigation = useNavigation();
  const Info = [
    {
      ItemName: 'abc',
      QTY: '1',
      Retail: 'A',
      Discount: '123',
      UnitPrice: '2500',
      totalPrice: '200',
    },
    {
      ItemName: 'xyz',
      QTY: '2',
      Retail: 'B',
      Discount: '50',
      UnitPrice: '1500',
      totalPrice: '250',
    },
    {
      ItemName: 'pqr',
      QTY: '3',
      Retail: 'C',
      Discount: '75',
      UnitPrice: '3000',
      totalPrice: '400',
    },
    {
      ItemName: 'abc',
      QTY: '1',
      Retail: 'A',
      Discount: '123',
      UnitPrice: '2500',
      totalPrice: '200',
    },
    {
      ItemName: 'xyz',
      QTY: '2',
      Retail: 'B',
      Discount: '50',
      UnitPrice: '1500',
      totalPrice: '250',
    },
    {
      ItemName: 'pqr',
      QTY: '3',
      Retail: 'C',
      Discount: '75',
      UnitPrice: '3000',
      totalPrice: '400',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/screen.jpg')}
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
            <TouchableOpacity
              onPress={() => navigation.navigate('Point of Sale' as never)}>
              <Image
                source={require('../assets/backarrow.png')}
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
                Orders
              </Text>
            </View>
          </View>

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
                      source={require('../assets/show.png')}
                    />
                  </View>

                  <View style={styles.infoRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Qty:</Text>
                      <Text style={styles.text}>{item.QTY}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.value}>Retail:</Text>
                      <Text style={styles.value}>{item.Retail}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.value}>Discount:</Text>

                      <Text style={styles.value}>{item.Discount}</Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        Unit Price:
                      </Text>

                      <Text style={[styles.value, {marginBottom: 5}]}>
                        {item.UnitPrice}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.lastrow}>
                    <Text
                      style={{
                        color: '#144272',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginTop: 5,
                        marginLeft: 5,
                      }}>
                      Total Price:
                    </Text>
                    <Text
                      style={{
                        color: '#144272',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginTop: 5,
                        marginRight: 5,
                      }}>
                      {item.totalPrice}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          />
        </ScrollView>
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
    height: 143,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
