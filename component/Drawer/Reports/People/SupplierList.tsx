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

interface SupplierList {
  id: number;
  sup_name: string;
  sup_company_name: string;
  sup_address: string;
  sup_contact: string;
  sup_email: string;
}

export default function SupplierList() {
  const {openDrawer} = useDrawer();
  const [supplierList, setSupplierList] = useState<SupplierList[]>([]);

  // Fetch Supplier List
  const fetchSuplierList = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchsuppliers`);
      setSupplierList(res.data.suppliers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSuplierList();
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
              Supplier List
            </Text>
          </View>

          <TouchableOpacity>
            <Icon name="printer" size={30} color={'#fff'} />
          </TouchableOpacity>
        </View>

        <ScrollView>
          <View>
            <FlatList
              data={supplierList}
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
                        {item.sup_name}
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
                        <Text style={styles.text}>Company:</Text>
                        <Text style={styles.text}>{item.sup_company_name}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Contact:</Text>
                        <Text style={styles.text}>{item.sup_contact}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          Email:
                        </Text>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          {item.sup_email}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          style={[
                            styles.value,
                            {marginBottom: 5, marginTop: -5},
                          ]}>
                          Address:
                        </Text>
                        <Text
                          style={[
                            styles.value,
                            {marginBottom: 5, marginTop: -5},
                          ]}>
                          {item.sup_address}
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
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Supplier:</Text>
          <Text style={styles.totalText}>{supplierList.length}</Text>
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
