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
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import Modal from 'react-native-modal';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';

interface UMOs {
  id: number;
  ums_name: string;
}

export default function UOMProducts() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [umos, setUmos] = useState<UMOs[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [editUmo, setEditUmo] = useState('');
  const [selectedUmo, setSelectedUmo] = useState<number | null>(null);
  const [umoName, setUmoName] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = umos.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = umos.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Fetch UMOs
  const fetchUoms = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchuoms`);

      setUmos(res.data.uom);
    } catch (error) {
      console.log(error);
    }
  };

  // Update Umo
  const updateUmo = async () => {
    if (!editUmo) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a UOM name',
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/updateuom`, {
        uom_id: selectedUmo,
        ums_name: editUmo.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'UOM has been Updated successfully',
          visibilityTime: 1500,
        });

        setEditUmo('');
        setModalVisible('');
        setSelectedUmo(null);
        fetchUoms();
      }
    } catch (error) {}
  };

  // Delete Umo
  const deleteUmo = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/uomdelete`, {
        id: selectedUmo,
      });

      const data = res.data;

      if (res.status === 200 && data.status) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'UOM has been deleted successfully.',
          visibilityTime: 1500,
        });
        setSelectedUmo(null);
        setModalVisible('');
        fetchUoms();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Add Umo
  const addUmo = async () => {
    if (!umoName) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a UOM name',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/adduom`, {
        uom_name: umoName,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'UOM has been added successfully',
          visibilityTime: 1500,
        });

        fetchUoms();
        setUmoName('');
        setModalVisible('');
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchUoms();
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
              UOMs
            </Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible('Add')}>
            <Image
              style={{
                tintColor: 'white',
                width: 18,
                height: 18,
                alignSelf: 'center',
                marginRight: 5,
              }}
              source={require('../../../assets/add.png')}
            />
          </TouchableOpacity>
        </View>

        <View>
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
                        color: 'white',
                        fontWeight: 'bold',
                        marginLeft: 5,
                        marginTop: 5,
                      }}>
                      {item.ums_name}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          setModalVisible('Edit');
                          const fetchSignleUmo = async (id: number) => {
                            try {
                              const res = await axios.get(
                                `${BASE_URL}/edituom?id=${id}&_token=${token}`,
                              );
                              setEditUmo(res.data.ums_name);
                              setSelectedUmo(res.data.id);
                            } catch (error) {
                              console.log(error);
                            }
                          };

                          fetchSignleUmo(item.id);
                        }}>
                        <Image
                          style={{
                            tintColor: 'white',
                            width: 15,
                            height: 15,
                            alignSelf: 'center',
                            marginTop: 8,
                          }}
                          source={require('../../../assets/edit.png')}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setModalVisible('Delete');
                          setSelectedUmo(item.id);
                        }}>
                        <Image
                          style={{
                            tintColor: 'white',
                            width: 15,
                            height: 15,
                            alignSelf: 'center',
                            marginRight: 5,
                            marginTop: 8,
                          }}
                          source={require('../../../assets/delete.png')}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>No Umo found.</Text>
              </View>
            }
          />
        </View>

        {/*Delete Umo*/}
        <Modal isVisible={modalVisible === 'Delete'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 220,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/info.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Are you sure?
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              You won't be able to revert this record!
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setSelectedUmo(null);
                }}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 100,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={deleteUmo}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 100,
                    height: 30,
                    padding: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Yes, delete it
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*Edit Umos*/}
        <Modal isVisible={modalVisible === 'Edit'}>
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 135,
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
                Edit UOM
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setEditUmo('');
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="UOM Name"
                value={editUmo}
                onChangeText={t => setEditUmo(t)}
              />
            </View>
            <TouchableOpacity onPress={updateUmo}>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#144272',
                  borderRadius: 10,
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Update UOM
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*Add Umo*/}
        <Modal isVisible={modalVisible === 'Add'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 135,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
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
                Add New UOM
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setUmoName('');
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="UOM Name"
                value={umoName}
                onChangeText={t => setUmoName(t)}
              />
            </View>
            <TouchableOpacity onPress={addUmo}>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#144272',
                  borderRadius: 10,
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add UOM
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 12,
              position: 'absolute',
              bottom: 5,
              left: 100,
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
    color: '#000',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
  },
});
