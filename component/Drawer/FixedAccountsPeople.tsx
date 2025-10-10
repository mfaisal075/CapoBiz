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
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../Colors';
import {Avatar} from 'react-native-paper';

interface Profiles {
  id: number;
  fixprf_business_account_name: string;
  fixprf_title: string;
  fixprf_mobile: string;
  fixprf_business_address: string;
}

interface ViewProfile {
  expenseprofile: {
    id: number;
    fixprf_area_id: number;
    fixprf_business_account_name: string;
    fixprf_title: string;
    fixprf_business_address: string;
    fixprf_tehsil: string;
    fixprf_district: string;
    fixprf_mobile: string;
    fixprf_status: string;
  };
  area: string;
}

interface Areas {
  id: number;
  area_name: string;
}

export default function FixedAccountsPeople() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [profiles, setProfiles] = useState<Profiles[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [viewProfile, setViewProfile] = useState<ViewProfile | null>(null);
  const [areas, setAreas] = useState<Areas[]>([]);

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

  // Fetch Areas
  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchareas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAreas(res.data.area);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchAreas();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[backgroundColors.primary, backgroundColors.secondary]}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
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
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.fixprf_business_account_name?.charAt(0) || 'F'}
                    </Text>
                  </View>

                  <View style={{flex: 1}}>
                    <Text style={styles.name}>
                      {item.fixprf_business_account_name}
                    </Text>
                    {/* small details inline */}
                    <Text style={styles.subText}>
                      <Icon name="phone" size={12} color="#666" />{' '}
                      {item.fixprf_mobile || 'No contact'}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="briefcase" size={12} color="#666" />{' '}
                      {item.fixprf_title || 'No title'}
                    </Text>
                  </View>

                  {/* Actions on right */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('View');
                        const fetchProfileData = async (id: number) => {
                          try {
                            const res = await axios.get(
                              `${BASE_URL}/expenseprofileshow?id=${id}&_token=${token}`,
                            );
                            setViewProfile(res.data);
                          } catch (error) {
                            console.log(error);
                          }
                        };
                        fetchProfileData(item.id);
                      }}>
                      <Icon name="eye" size={20} color={'#144272'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-group" size={48} color="#666" />
                <Text style={styles.emptyText}>No record found.</Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 90}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Expense Profile View Modal */}
        <Modal
          visible={modalVisible === 'View'}
          transparent
          animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ScrollView contentContainerStyle={styles.modalContent}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>Customer Details</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible('');
                      setViewProfile(null);
                    }}
                    style={styles.closeBtn}>
                    <Icon name="close" size={22} color="#144272" />
                  </TouchableOpacity>
                </View>

                <View style={styles.customerDetailsWrapper}>
                  {/* Info Fields */}
                  <View style={styles.modalInfoBox}>
                    {[
                      {
                        label: 'Name',
                        value:
                          viewProfile?.expenseprofile
                            .fixprf_business_account_name,
                      },
                      {
                        label: 'Title',
                        value: viewProfile?.expenseprofile.fixprf_title,
                      },
                      {
                        label: 'Contact',
                        value: viewProfile?.expenseprofile.fixprf_mobile,
                      },
                      {
                        label: 'Area',
                        value: `${
                          areas.find(
                            area =>
                              area.id.toString() ===
                              String(
                                viewProfile?.expenseprofile.fixprf_area_id,
                              ),
                          )?.area_name || 'N/A'
                        }`,
                      },
                      {
                        label: 'District',
                        value: viewProfile?.expenseprofile.fixprf_district,
                      },
                      {
                        label: 'Tehsil',
                        value: viewProfile?.expenseprofile.fixprf_tehsil,
                      },
                      {
                        label: 'Address',
                        value:
                          viewProfile?.expenseprofile.fixprf_business_address,
                      },
                    ].map((item, index) => (
                      <View key={index} style={styles.modalInfoRow}>
                        <Text style={styles.infoLabel}>{item.label}</Text>
                        <Text style={styles.infoValue}>
                          {item.value || 'N/A'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
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
              <Text style={styles.totalText}>
                Total: {totalRecords} records
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
      </LinearGradient>
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
  gradientBackground: {
    flex: 1,
  },

  // FlatList Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '96%',
    alignSelf: 'center',
    marginTop: 8,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Pagination Component
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: backgroundColors.primary,
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
    backgroundColor: backgroundColors.secondary,
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
    color: '#fff',
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
  totalText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },

  // Modal Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  modalHeaderTitle: {
    color: '#144272',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  customerDetailsWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  customerImageWrapper: {
    marginBottom: 16,
  },
  customerImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#144272',
  },
  customerNoImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  customerNoImageText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  modalInfoBox: {
    width: '100%',
    marginTop: 10,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 12,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
  },
  infoValue: {
    fontSize: 14,
    color: '#555',
    flexShrink: 1,
    textAlign: 'right',
  },
});
