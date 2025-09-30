import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';

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
  const [selectedProd, setSelectedProd] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState('');

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

  // Activate Product
  const activateProd = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/activateProduct/${selectedProd}`,
      );

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Activated!',
          text2: 'Product has been activated successfully.',
          visibilityTime: 1500,
        });
        fetchProds();
        setModalVisible('');
        setSelectedProd(null);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `${error}`,
      });
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
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Deleted Products</Text>
          </View>

          <TouchableOpacity
            onPress={() => {}}
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}>
            <Icon name="plus" size={24} color="transparent" />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Header Row with Avatar + Product Name */}
                <View style={styles.headerRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.prod_name?.charAt(0) || 'P'}
                    </Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.prod_name}</Text>
                    <Text style={styles.subText}>
                      {item.pcat_name || 'No category'}
                    </Text>
                  </View>

                  {/* Status Icon (Tick for deleted products) */}
                  <TouchableOpacity
                    style={styles.actionRow}
                    onPress={() => {
                      setModalVisible('Activate');
                      setSelectedProd(item.id);
                    }}>
                    <Icon
                      style={styles.actionIcon}
                      name="check-circle"
                      size={25}
                      color={'green'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Info Section */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Icon
                        name="barcode"
                        size={16}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.infoText}>Barcode:</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {item.prod_UPC_EAN || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Icon
                        name="cash"
                        size={16}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.infoText}>Cost:</Text>
                    </View>
                    <Text style={styles.infoValue}>{item.prod_costprice}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Icon
                        name="tag-outline"
                        size={16}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.infoText}>Retail Price:</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {item.prod_retailprice}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Icon
                        name="cube-outline"
                        size={16}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.infoText}>Quantity:</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {item?.prod_qty ?? '0'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Icon
                        name="calendar-clock"
                        size={16}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.infoText}>Expiry:</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {item?.prod_expirydate ?? 'No expiry date'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No Deleted Product found.
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 130}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Activate Modal */}
        <Modal
          visible={modalVisible === 'Activate'}
          transparent
          animationType="fade">
          <View style={styles.activateModalOverlay}>
            <View style={styles.deleteModalContainer}>
              <View style={styles.delAnim}>
                <LottieView
                  style={{flex: 1}}
                  source={require('../../../assets/warning.json')}
                  autoPlay
                  loop={false}
                />
              </View>

              {/* Title */}
              <Text style={styles.deleteModalTitle}>Are you sure?</Text>

              {/* Subtitle */}
              <Text style={styles.deleteModalMessage}>
                Do you really want to activate this product ?
              </Text>

              {/* Buttons */}
              <View style={styles.deleteModalActions}>
                <TouchableOpacity
                  style={[styles.deleteModalBtn, {backgroundColor: '#e0e0e0'}]}
                  onPress={() => setModalVisible('')}>
                  <Text style={[styles.deleteModalBtnText, {color: '#144272'}]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteModalBtn, {backgroundColor: 'green'}]}>
                  <Text
                    style={styles.deleteModalBtnText}
                    onPress={activateProd}>
                    Yes, Activate it!
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => prev - 1)}
              style={[
                styles.pageButton,
                currentPage === 1 && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === 1 && styles.pageButtonTextDisabled,
                ]}>
                Prev
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                Page <Text style={styles.pageCurrent}>{currentPage}</Text> of{' '}
                {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(prev => prev + 1)}
              style={[
                styles.pageButton,
                currentPage === totalPages && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === totalPages && styles.pageButtonTextDisabled,
                ]}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  background: {
    flex: 1,
  },

  // Flat List styling
  listContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
    marginHorizontal: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionIcon: {
    tintColor: '#144272',
    width: 25,
    height: 25,
    marginHorizontal: 4,
  },
  infoBox: {
    marginTop: 10,
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    color: '#144272',
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    color: '#333',
    fontSize: 13,
  },

  //Delete Modal
  deleteModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    width: '100%',
    alignSelf: 'center',
  },
  deleteModalIcon: {
    width: 60,
    height: 60,
    tintColor: '#144272',
    marginBottom: 15,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 8,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  deleteModalBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteModalBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  delAnim: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  activateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  // Pagination Component
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#144272',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: -2},
    elevation: 6,
  },
  pageButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  pageButtonDisabled: {
    backgroundColor: '#ddd',
  },
  pageButtonText: {
    color: '#144272',
    fontWeight: '600',
    fontSize: 14,
  },
  pageButtonTextDisabled: {
    color: '#777',
  },
  pageIndicator: {
    paddingHorizontal: 10,
  },
  pageIndicatorText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  pageCurrent: {
    fontWeight: '700',
    color: '#FFD166',
  },
});
