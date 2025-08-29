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

interface BusinessDetails {
  id: number;
  bus_name: string;
  bus_name_ur: string;
  bus_contact1: string;
  bus_language: string;
  bus_email: string;
}

interface EditBusiness {
  id: number;
  bus_name: string;
  bus_name_ur: string;
  bus_address: string;
  bus_address_ur: string;
  bus_contact1: string;
  bus_contact2: string;
  bus_contact3: string;
  bus_email: string;
}

const initialEditBusiness: EditBusiness = {
  id: 0,
  bus_address: '',
  bus_address_ur: '',
  bus_contact1: '',
  bus_contact2: '',
  bus_contact3: '',
  bus_email: '',
  bus_name: '',
  bus_name_ur: '',
};

export default function BusinessVariables() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [busDetails, setBusDetails] = useState<BusinessDetails[]>([]);
  const [editBus, setEditBus] = useState<EditBusiness>(initialEditBusiness);
  const [modal, setModal] = useState('');
  const [selectedBus, setSelectedBus] = useState<number | null>(null);

  // Edit OnChange
  const editOnChange = (field: keyof EditBusiness, value: string) => {
    setEditBus(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const [isModalV, setModalV] = useState(false);
  const tglModal = () => {
    setModalV(!isModalV);
  };

  {
    /*edit*/
  }
  const [edit, setedit] = useState(false);

  const toggleedit = () => {
    setedit(!edit);
  };

  const [btncustomeraditarea, setbtncustomereditarea] = useState(false);

  const togglebtncustomereditarea = () => {
    setbtncustomereditarea(!btncustomeraditarea);
  };

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcomp`);
      setBusDetails(res.data.comp);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Business Details to Edit it
  const editBusiness = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editcomp?id=${id}&_token=${token}`,
      );
      setEditBus({
        id: res.data.id,
        bus_address: res.data.bus_address,
        bus_address_ur: res.data.bus_address_ur,
        bus_contact1: res.data.bus_contact1,
        bus_contact2: res.data.bus_contact2,
        bus_contact3: res.data.bus_contact3,
        bus_email: res.data.bus_email,
        bus_name: res.data.bus_name,
        bus_name_ur: res.data.bus_name_ur,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Update Business Details
  const updateBusiness = async () => {
    if (
      !editBus.bus_name.trim() ||
      !editBus.bus_name_ur.trim() ||
      !editBus.bus_address.trim() ||
      !editBus.bus_address_ur.trim() ||
      !editBus.bus_contact1.trim() ||
      !editBus.bus_email.trim()
    ) {
      Toast.show({
        type: 'error',
        text1: 'Please fill all required fields.',
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/updatecomp`,
        {
          comp_id: editBus.id,
          comp_name: editBus.bus_name,
          comp_urdu_name: editBus.bus_name_ur,
          comp_address: editBus.bus_address,
          comp_urdu_address: editBus.bus_address_ur,
          comp_cont1: editBus.bus_contact1,
          comp_cont2: editBus.bus_contact2,
          comp_cont3: editBus.bus_contact3,
          comp_email: editBus.bus_email,
          logo: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Response:', res.status, res.data);

      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Company has been updated successfully',
          visibilityTime: 1500,
        });

        setEditBus(initialEditBusiness);
        setModal('');
        fetchBusinesses();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update failed!',
          text2: res.data?.message || 'Unexpected response',
        });
      }
    } catch (error: any) {
      console.log('Update error:', error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: error.response?.data?.message || 'Something went wrong',
      });
    }
  };

  // Delete Business Details
  const delBusiness = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/compdelete`, {
        id: selectedBus,
      });

      const data = res.data;

      if (res.status === 200 && data.statsu === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted',
          text2: 'Company has been deleted successfully.',
          visibilityTime: 1500,
        });

        setSelectedBus(null);
        fetchBusinesses();
        setModal('');
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchBusinesses();
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
              Business Variables
            </Text>
          </View>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Export Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Print</Text>
          </TouchableOpacity>
        </View>

        <View>
          <FlatList
            data={busDetails}
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
                      {item.bus_name}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          setModal('Edit');
                          editBusiness(item.id);
                        }}>
                        <Image
                          style={{
                            tintColor: '#144272',
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
                          setModal('Delete');
                          setSelectedBus(item.id);
                        }}>
                        <Image
                          style={{
                            tintColor: '#144272',
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

                  <View style={styles.infoRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Urdu Name:</Text>
                      <Text style={styles.text}>{item.bus_name_ur}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Contact:</Text>
                      <Text style={styles.text}>{item.bus_contact1}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Email:</Text>
                      <Text style={styles.text}>{item.bus_email ?? '--'}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        Language:
                      </Text>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        {item.bus_language}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
            ListEmptyComponent={
              <View
                style={{
                  height: 300,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#fff',
                  }}>
                  No data found in the database!
                </Text>
              </View>
            }
          />
        </View>

        {/*delete*/}
        <Modal isVisible={modal === 'Delete'}>
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
              <TouchableOpacity onPress={() => setModal('')}>
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

              <TouchableOpacity onPress={delBusiness}>
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

        {/*Edit Modal*/}
        <Modal isVisible={modal === 'Edit'}>
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 320,
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
                Update Company
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModal('');
                  setEditBus(initialEditBusiness);
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

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Name"
                value={editBus.bus_name}
                onChangeText={t => editOnChange('bus_name', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Urdu Name"
                value={editBus.bus_name_ur}
                onChangeText={t => editOnChange('bus_name_ur', t)}
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Address"
                value={editBus.bus_address}
                onChangeText={t => editOnChange('bus_address', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Urdu Address"
                value={editBus.bus_address_ur}
                onChangeText={t => editOnChange('bus_address_ur', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 1"
                keyboardType="numeric"
                maxLength={11}
                value={editBus.bus_contact1}
                onChangeText={t => editOnChange('bus_contact1', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 2"
                maxLength={11}
                keyboardType="numeric"
                value={editBus.bus_contact2}
                onChangeText={t => editOnChange('bus_contact2', t)}
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 3"
                keyboardType="numeric"
                maxLength={11}
                value={editBus.bus_contact3}
                onChangeText={t => editOnChange('bus_contact3', t)}
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={[
                  styles.productinput,
                  {color: '#000', backgroundColor: '#c2bfbfff'},
                ]}
                placeholderTextColor="#144272"
                placeholder="Business Email"
                value={editBus.bus_email}
                editable={false}
              />
            </View>

            <TouchableOpacity onPress={updateBusiness}>
              <View
                style={{
                  backgroundColor: '#144272',
                  height: 30,
                  width: 140,
                  margin: 10,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Update Company
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>
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

  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    color: 'white',
  },
  inputSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
    marginLeft: 10,
    marginRight: 10,
  },

  productinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  exportBtn: {
    backgroundColor: '#144272',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  exportText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
