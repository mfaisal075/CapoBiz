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
import {useDrawer} from '../DrawerContext';
import Modal from 'react-native-modal';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';

interface Profiles {
  id: number;
  fixprf_business_account_name: string;
  fixprf_title: string;
  fixprf_mobile: string;
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
              source={require('../../assets/menu.png')}
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
              Fixed Accounts
            </Text>
          </View>
        </View>

        <FlatList
          data={currentData}
          style={{marginBottom: 90}}
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
                    {item.fixprf_business_account_name}
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
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
                      <Image
                        style={{
                          tintColor: '#144272',
                          width: 15,
                          height: 15,
                          alignSelf: 'center',
                          marginRight: 5,
                          marginTop: 9,
                        }}
                        source={require('../../assets/show.png')}
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
                    <Text style={styles.text}>Title:</Text>
                    <Text style={styles.text}>{item.fixprf_title}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={[styles.text, {marginBottom: 5}]}>
                      Contact:
                    </Text>
                    <Text style={[styles.text, {marginBottom: 5}]}>
                      {item.fixprf_mobile}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 20}}>
              <Text style={{color: '#fff', fontSize: 14}}>
                No Account found.
              </Text>
            </View>
          }
        />

        {/*view modal*/}
        <Modal isVisible={modalVisible === 'ViewProfile'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 480,
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
                Expense Profile Detail
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setViewProfile([]);
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={viewProfile}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <ScrollView
                  style={{
                    padding: 5,
                  }}>
                  <View style={styles.table}>
                    <View style={[styles.cardContainer]}>
                      <View style={styles.infoGrid}>
                        <Text style={styles.labl}>Name:</Text>
                        <Text style={styles.valu}>
                          {item.fixprf_business_account_name}
                        </Text>

                        <Text style={styles.labl}>Title:</Text>
                        <Text style={styles.valu}>{item.fixprf_title}</Text>

                        <Text style={styles.labl}>Contact:</Text>
                        <Text style={styles.valu}>{item.fixprf_mobile}</Text>

                        <Text style={styles.labl}>Area:</Text>
                        <Text style={styles.valu}>
                          {item.fixprf_area_id ?? 'N/A'}
                        </Text>

                        <Text style={styles.labl}>District:</Text>
                        <Text style={styles.valu}>
                          {item.fixprf_district ?? 'N/A'}
                        </Text>

                        <Text style={styles.labl}>Tehsil:</Text>
                        <Text style={styles.valu}>
                          {item.fixprf_tehsil ?? 'N/A'}
                        </Text>

                        <Text style={styles.labl}>Address:</Text>
                        <Text style={styles.valu}>
                          {item.fixprf_business_address ?? 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
            />
          </View>
        </Modal>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingVertical: 12,
              position: 'absolute',
              width: '100%',
              bottom: 0,
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
  infoRow: {
    marginTop: 5,
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
});
