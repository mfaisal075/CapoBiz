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
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ExpiredList {
  prod_name: string;
  prod_expirydate: string;
  prod_UPC_EAN: string;
  prod_qty: string;
  prod_reorder_qty: string;
  prod_costprice: string;
  prod_fretailprice: string;
  created_at: string;
  ums_name: string;
  pcat_name: string;
}

export default function ExpireProducts() {
  const {openDrawer} = useDrawer();
  const [expiredList, setExpiredList] = useState<ExpiredList[]>([]);

  // Fetch Expired List
  const fetchExpiredList = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchexpire`);
      setExpiredList(res.data.products);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchExpiredList();
  }, []);

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

        <FlatList
          data={expiredList}
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
                    {item.prod_name}
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
                    <Text style={styles.text}>{item.prod_UPC_EAN}</Text>
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
                      {item.pcat_name}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={[styles.value, {marginBottom: 5}]}>UOM:</Text>
                    <Text style={[styles.value, {marginBottom: 5}]}>
                      {item.ums_name}
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
                      {item.prod_qty}
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
                      {item.prod_reorder_qty}
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
                      {item.prod_costprice}
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
                      {item.prod_fretailprice}
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
                      {new Date(item.created_at)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .replace(/ /g, '-')}
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
                      {new Date(item.prod_expirydate)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .replace(/ /g, '-')}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 20}}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>
                No record found.
              </Text>
            </View>
          }
        />

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Expired Products:</Text>
          <Text style={styles.totalText}>{expiredList.length ?? '0'}</Text>
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
    paddingHorizontal: 15,
    paddingVertical: 20,
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
