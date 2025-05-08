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
import React from 'react';
import {useDrawer} from '../../../DrawerContext';

export default function ExpireProducts() {

  const {openDrawer} = useDrawer();
  const Info = [
    {
      sr: '1',
      Product: 'Sufi',
      Barcode: '0876',
      Category: 'Oil',
      UOM: '12',
      QTY: 1,
      ReorderQTY: 3,
      CostPrice: 66,
      SalePrice: 88,
      EntryDate: '23-9-23',
      ExpiryDate:'25-10-25'
    },
    {
      sr: '2',
      Product: 'Sufi',
      Barcode: '0876',
      Category: 'Oil',
      UOM: '12',
      QTY: 1,
      ReorderQTY: 3,
      CostPrice: 66,
      SalePrice: 88,
      EntryDate: '23-9-23',
      ExpiryDate:'25-10-25'
    },
  ];

  const totalProducts = Info.length;

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../../assets/screen.jpg')}
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
              source={require('../../../../assets/menu.png')}
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
           Expired Products
            </Text>
          </View>
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
                        {item.Product}
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}></View>
                    </View>

                    <View style={styles.infoRow}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>BarCode:</Text>
                        <Text style={styles.text}>{item.Barcode}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          Category:
                        </Text>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          {item.Category}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          UOM:
                        </Text>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          {item.UOM}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          Quantity:
                        </Text>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          {item.QTY}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          Reorder Quantity:
                        </Text>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          {item.ReorderQTY}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          Cost Price:
                        </Text>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          {item.CostPrice}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          Sale Price:
                        </Text>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          {item.SalePrice}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          Entry Date:
                        </Text>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          {item.EntryDate}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          Expiry Date:
                        </Text>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          {item.ExpiryDate}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
            />
          </View>
        </ScrollView>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Expired Products:</Text>
          <Text style={styles.totalText}>{totalProducts}</Text>
        </View>
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

  totalContainer: {
    padding: 7,
    borderTopWidth: 1,
    borderTopColor: 'white',
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
