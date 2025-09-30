import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Profiles {
  id: number;
  fixprf_business_account_name: string;
  fixprf_title: string;
  fixprf_mobile: string;
  fixprf_business_address: string;
}

interface ViewProfile {
  id: number;
  fixprf_area_id: number;
  fixprf_business_account_name: string;
  fixprf_title: string;
  fixprf_business_address: string;
  fixprf_tehsil: string;
  fixprf_district: string;
  fixprf_mobile: string;
  fixprf_status: string;
}

export default function FixedAccountsPeople() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [profiles, setProfiles] = useState<Profiles[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [viewProfile, setViewProfile] = useState<ViewProfile[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = profiles.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = profiles.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Fetch Expense Profiles
  const fetchProfiles = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchexpenseprofiles`);
      setProfiles(res.data.expenseprofiles);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Fixed Accounts</Text>
          </View>

          <TouchableOpacity
            onPress={() => {}}
            disabled
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
                {/* Header Row (Avatar + Name + Actions) */}
                <View style={styles.headerRow}>
                  {/* Avatar */}
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.fixprf_business_account_name?.charAt(0) || 'U'}
                    </Text>
                  </View>

                  {/* Name + Title */}
                  <View style={{flex: 1}}>
                    <Text style={styles.name}>
                      {item.fixprf_business_account_name || 'N/A'}
                    </Text>
                    <Text style={styles.subText}>
                      {item.fixprf_title || 'No title'}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionRow}>
                    {/* View */}
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('ViewProfile');
                        const fetchProfileData = async (id: number) => {
                          try {
                            const res = await axios.get(
                              `${BASE_URL}/expenseprofileshow?id=${id}&_token=${token}`,
                            );
                            setViewProfile([res.data.expenseprofile]);
                          } catch (error) {
                            console.log(error);
                          }
                        };
                        fetchProfileData(item.id);
                      }}>
                      <Icon
                        style={styles.actionIcon}
                        name="eye"
                        size={20}
                        color={'#144272'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="phone"
                        size={18}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Mobile</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.fixprf_mobile || '--'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="map-marker"
                        size={18}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Address</Text>
                    </View>
                    <Text
                      style={styles.valueText}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {item.fixprf_business_address || '--'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No Account found.
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 110}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Expense Profile View Modal */}
        <Modal
          visible={modalVisible === 'ViewProfile'}
          transparent
          animationType="slide">
          <View style={styles.addCustomerModalOverlay}>
            <ScrollView style={styles.addCustomerModalContainer}>
              {/* Header */}
              <View style={styles.addCustomerHeader}>
                <Text style={styles.addCustomerTitle}>
                  Expense Profile Details
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setViewProfile([]);
                  }}
                  style={styles.addCustomerCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {viewProfile.length > 0 && (
                <View style={styles.customerDetailsWrapper}>
                  {/* Optional Profile Image */}
                  <View style={styles.customerImageWrapper}>
                    <View style={styles.customerNoImage}>
                      <Icon name="account" size={40} color="#999" />
                      <Text style={styles.customerNoImageText}>No Image</Text>
                    </View>
                  </View>

                  {/* Info Fields */}
                  <View style={styles.customerInfoBox}>
                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Name</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProfile[0]?.fixprf_business_account_name ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Title</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProfile[0]?.fixprf_title ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Contact</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProfile[0]?.fixprf_mobile ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Area</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProfile[0]?.fixprf_area_id ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>District</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProfile[0]?.fixprf_district ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Tehsil</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProfile[0]?.fixprf_tehsil ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Address</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProfile[0]?.fixprf_business_address ?? 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
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

  // FlatList Styling
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
    gap: 10,
  },
  actionIcon: {
    tintColor: '#144272',
    width: 20,
    height: 20,
    marginHorizontal: 4,
  },
  infoBox: {
    marginTop: 10,
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 10,
  },
  infoText: {
    flex: 1,
    color: '#333',
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  infoIcon: {
    width: 18,
    height: 18,
    tintColor: '#144272',
    marginRight: 6,
  },
  labelText: {
    fontSize: 13,
    color: '#144272',
    fontWeight: '600',
  },
  valueText: {
    fontSize: 13,
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
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

  addCustomerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCustomerModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '95%',
    maxHeight: '85%',
    padding: 15,
    elevation: 5,
  },
  addCustomerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  addCustomerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#144272',
  },
  addCustomerCloseBtn: {
    padding: 5,
  },
  customerDetailsWrapper: {
    alignItems: 'center',
  },
  customerImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  customerNoImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerNoImageText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  customerInfoBox: {
    width: '100%',
  },
  customerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  customerInfoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#144272',
  },
  customerInfoValue: {
    fontSize: 14,
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
