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
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';

interface Products {
  id: number;
  prod_name: string;
  prod_UPC_EAN: string;
  pcat_name: string;
  prod_costprice: string;
  prod_retailprice: string;
  prod_qty: string;
  prod_expirydate: string;
}

export default function DeletedProducts() {
  const {openDrawer} = useDrawer();
  const [delProducts, setDelProducts] = useState<Products[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = delProducts.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = delProducts.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Fetch Deleted Products
  const fetchProds = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchDeletedProducts`);
      setDelProducts(res.data.deletedProducts);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProds();
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
            marginBottom: 15,
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
              Deleted Products
            </Text>
          </View>
        </View>

        <FlatList
          data={currentData}
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
                    }}>
                    <Image
                      style={{
                        tintColor: '#144272',
                        width: 15,
                        height: 15,
                        alignSelf: 'center',
                        marginRight: 5,
                        marginTop: 2,
                      }}
                      source={require('../../../assets/tick.png')}
                    />
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Barcode:</Text>
                    <Text style={styles.text}>{item.prod_UPC_EAN}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Category:</Text>
                    <Text style={styles.text}>{item.pcat_name}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Cost:</Text>
                    <Text style={styles.text}>{item.prod_costprice}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Retail Price:</Text>
                    <Text style={styles.text}>{item.prod_retailprice}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Quantity:</Text>
                    <Text style={styles.text}>{item?.prod_qty ?? '0'}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={[styles.value, {marginBottom: 5}]}>
                      Expiry:
                    </Text>
                    <Text style={[styles.value, {marginBottom: 5}]}>
                      {item?.prod_expirydate ?? 'No expiry date'}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 20}}>
              <Text style={{color: '#fff', fontSize: 14}}>
                No Deleted Product found.
              </Text>
            </View>
          }
        />

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => prev - 1)}
              style={{
                marginHorizontal: 10,
                opacity: currentPage === 1 ? 0.5 : 1,
              }}>
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                Prev
              </Text>
            </TouchableOpacity>

            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
              Page {currentPage} of {totalPages}
            </Text>

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(prev => prev + 1)}
              style={{
                marginHorizontal: 10,
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}>
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                Next
              </Text>
            </TouchableOpacity>
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
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 5,
    borderTopLeftRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
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
});
