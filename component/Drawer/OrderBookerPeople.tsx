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
import {useDrawer} from '../DrawerContext';
import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import Toast from 'react-native-toast-message';

interface OrderBooker {
  id: number;
  name: string;
  cnic: string;
  contact: string;
  email: string;
}

interface ViewOrderBooker {
  name: string;
  cnic: string;
  area: string;
  contact: string;
  email: string;
  pic: string;
}

interface AreaDropDown {
  id: string;
  area_name: string;
}

interface EditForm {
  name: string;
  email: string;
  contact: string;
  cnic: string;
  areas: Array<string>;
}

const initialEditForm: EditForm = {
  name: '',
  email: '',
  contact: '',
  cnic: '',
  areas: [],
};

interface AddForm {
  name: string;
  cnic: string;
  contact1: string;
  email: string;
  password: string;
  confirmPassword: string;
  area: Array<string>;
}

const initialAddForm: AddForm = {
  name: '',
  cnic: '',
  contact1: '',
  email: '',
  confirmPassword: '',
  password: '',
  area: [],
};

export default function OrderBookerPeople() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [orderBooker, setOrderBooker] = useState<OrderBooker[]>([]);
  const [viewOrderBooker, setViewOrderBooker] = useState<ViewOrderBooker[]>([]);
  const [areaDropdown, setAreaDropdown] = useState<AreaDropDown[] | []>([]);
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaValue, setAreaValue] = useState<string[] | null>(null);
  const transformedAreas = areaDropdown.map(item => ({
    label: item.area_name,
    value: item.id,
  }));
  const [editForm, setEditForm] = useState<EditForm>(initialEditForm);
  const [selectedOB, setSelectedOB] = useState<number | null>(null);
  const [addForm, setAddForm] = useState<AddForm>(initialAddForm);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = orderBooker.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = orderBooker.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const handleEditInputChange = (
    field: keyof EditForm,
    value: string | Array<string>,
  ) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddInputChange = (
    field: keyof AddForm,
    value: string | Array<string>,
  ) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  {
    /*customer*/
  }
  const [customer, setcustomer] = useState(false);

  const togglecustomer = () => {
    setcustomer(!customer);
  };

  const [areaModal, setAreaModal] = useState(false);
  const [area, setArea] = useState('');

  const togglearea = () => {
    setAreaModal(!areaModal);
  };
  const [isModalV, setModalV] = useState(false);
  const tglModal = (id: number) => {
    setSelectedOB(id);
    setModalV(!isModalV);
  };

  {
    /*edit*/
  }
  const [edit, setedit] = useState(false);

  const toggleedit = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editorderbooker?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setedit(!edit);
      setEditForm(res.data);
      setSelectedOB(id);
    } catch (error) {
      console.log(error);
    }
  };

  const [view, setview] = useState(false);

  // View Modal
  const toggleview = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/vieworderbooker?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = Array.isArray(res.data) ? res.data : [res.data];
      setViewOrderBooker(data);
      setview(!view);
    } catch (error) {
      console.log(error);
    }
    setview(!view);
  };

  // Add Area
  const handleAddArea = async () => {
    if (!area) {
      Toast.show({
        type: 'error',
        text1: 'Missing Field',
        text2: 'Area field is missing!',
        visibilityTime: 1500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/addarea`, {
        area_name: area.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Area has been Added successfully',
          visibilityTime: 1500,
        });

        setAreaModal(false);
        handleFetchAreas();
        setArea('');
      }
    } catch (error) {}
  };

  // Add OrderBooker
  const handleAddOB = async () => {
    if (
      !addForm.contact1 ||
      !addForm.name ||
      !addForm.cnic ||
      !addForm.password ||
      !addForm.confirmPassword ||
      !addForm.email ||
      !areaValue ||
      areaValue.length === 0
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all fields and select a role before updating.',
        visibilityTime: 1500,
      });
      return;
    }

    if (addForm.password !== addForm.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'New password and confirm password do not match!',
        visibilityTime: 2500,
      });
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', addForm.name.trim());
      formData.append('cnic', addForm.cnic);
      formData.append('contact1', addForm.contact1);
      formData.append('email', addForm.email);
      formData.append('password', addForm.password);
      formData.append('confirmPassword', addForm.confirmPassword);
      if (areaValue) {
        areaValue.forEach((areaId: string) => {
          formData.append('areas[]', areaId);
        });
      }
      const res = await axios.post(`${BASE_URL}/orderbookestore`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'OrderBooker has been Added successfully',
          visibilityTime: 1500,
        });

        setAddForm(initialAddForm);
        setAreaValue([]);
        handleFetchData();
        setcustomer(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Delete OrderBooker
  const handleDeleteOB = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/deleteorderbooker`, {
        id: selectedOB,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'OrderBooker has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setSelectedOB(null);
        handleFetchData();
        setModalV(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update OrderBooker
  const handleUpdateOB = async () => {
    if (
      !editForm.name.trim() ||
      !editForm.cnic.trim() ||
      !editForm.contact.trim() ||
      !editForm.email.trim() ||
      !areaValue ||
      areaValue.length === 0
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all fields and select an area before updating.',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const formData = new FormData();

      formData.append('booker_id', selectedOB);
      formData.append('name', editForm.name.trim());
      formData.append('cnic', editForm.cnic);
      formData.append('contact1', editForm.contact);
      formData.append('email', editForm.email);

      // Append each area like areas[]
      areaValue.forEach(areaId => {
        formData.append('areas[]', areaId);
      });

      const res = await axios.post(`${BASE_URL}/updateorderbooker`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'OrderBooker has been Updated successfully!',
          visibilityTime: 1500,
        });

        setEditForm(initialEditForm);
        setSelectedOB(null);
        handleFetchData();
        setedit(false);
      }
    } catch (error: any) {
      console.log('Update error:', error.response?.data || error.message);
    }
  };

  // Fetch Area Data
  const handleFetchAreas = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchareadata`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAreaDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Data
  const handleFetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchorderbooker`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrderBooker(res.data.orderbooker);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleFetchData();
    handleFetchAreas();
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
              Order Booker
            </Text>
          </View>
          <TouchableOpacity onPress={togglecustomer}>
            <Image
              style={{
                tintColor: 'white',
                width: 18,
                height: 18,
                alignSelf: 'center',
                marginRight: 5,
              }}
              source={require('../../assets/add.png')}
            />
          </TouchableOpacity>
        </View>

        <View>
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
                      {item.name}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      <TouchableOpacity onPress={() => toggleview(item.id)}>
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
                      <TouchableOpacity onPress={() => toggleedit(item.id)}>
                        <Image
                          style={{
                            tintColor: '#144272',
                            width: 15,
                            height: 15,
                            alignSelf: 'center',
                            marginTop: 8,
                          }}
                          source={require('../../assets/edit.png')}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => tglModal(item.id)}>
                        <Image
                          style={{
                            tintColor: '#144272',
                            width: 15,
                            height: 15,
                            alignSelf: 'center',
                            marginRight: 5,
                            marginTop: 8,
                          }}
                          source={require('../../assets/delete.png')}
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
                      <Text style={styles.text}>Contact:</Text>
                      <Text style={styles.text}>{item.contact}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>CNIC:</Text>
                      <Text style={styles.text}>{item.cnic}</Text>
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
                        {item.email ?? '--'}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 60,
                }}>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 18}}>
                  No record present in the database!
                </Text>
              </View>
            }
          />
        </View>

        {/*order booker add*/}
        <Modal isVisible={customer}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: '55%',
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
                Add Order Booker
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setcustomer(!customer);
                  setAreaValue([]);
                  setAddForm(initialAddForm);
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

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Name"
                value={addForm.name}
                onChangeText={t => handleAddInputChange('name', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Email"
                value={addForm.email}
                onChangeText={t => handleAddInputChange('email', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 1"
                maxLength={12}
                keyboardType="number-pad"
                value={addForm.contact1}
                onChangeText={t => handleAddInputChange('contact1', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="CNIC"
                keyboardType="numeric"
                maxLength={15}
                value={addForm.cnic}
                onChangeText={t => handleAddInputChange('cnic', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Password"
                secureTextEntry
                value={addForm.password}
                onChangeText={t => handleAddInputChange('password', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Confirm Password"
                secureTextEntry
                value={addForm.confirmPassword}
                onChangeText={t => handleAddInputChange('confirmPassword', t)}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={transformedAreas}
                open={areaOpen}
                setOpen={setAreaOpen}
                value={areaValue}
                setValue={setAreaValue}
                multiple={true}
                mode="BADGE"
                placeholder="Select Order Booker Area"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#144272" />
                )}
                style={[
                  styles.dropdown,
                  {
                    borderColor: '#144272',
                    width: '85%',
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '85%',
                  marginTop: 8,
                  maxHeight: 120,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
              />
              <TouchableOpacity onPress={togglearea}>
                <Image
                  style={{
                    tintColor: '#144272',
                    width: 22,
                    height: 17,
                    alignSelf: 'center',
                    marginLeft: -26,
                    marginTop: 17,
                  }}
                  source={require('../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={{flex: 1, justifyContent: 'flex-end'}}>
              <TouchableOpacity onPress={handleAddOB}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    height: 30,
                    width: 130,
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
                    Add Order Booker
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*Add Area*/}
        <Modal isVisible={areaModal}>
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
                Add New Area
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setAreaModal(!areaModal);
                  setArea('');
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
            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="Area Name"
                value={area}
                onChangeText={t => setArea(t)}
              />
            </View>
            <TouchableOpacity onPress={handleAddArea}>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#144272',
                  height: 30,
                  borderRadius: 10,
                  width: 100,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add Area
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/*delete*/}
        <Modal isVisible={isModalV}>
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
              source={require('../../assets/info.png')}
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
                  setModalV(!isModalV);
                  setSelectedOB(null);
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

              <TouchableOpacity onPress={handleDeleteOB}>
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

        {/*edit*/}
        <Modal isVisible={edit}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: '50%',
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
                Edit Order Booker
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setedit(!edit);
                  setEditForm(initialEditForm);
                  setSelectedOB(null);
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

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Name"
                value={editForm.name}
                onChangeText={t => handleEditInputChange('name', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Email"
                value={editForm.email}
                onChangeText={t => handleEditInputChange('email', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact"
                keyboardType="number-pad"
                maxLength={12}
                value={editForm.contact}
                onChangeText={t => handleEditInputChange('contact', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="CNIC"
                keyboardType="numeric"
                maxLength={15}
                value={editForm.cnic}
                onChangeText={t => handleEditInputChange('cnic', t)}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={transformedAreas}
                open={areaOpen}
                setOpen={setAreaOpen}
                value={areaValue}
                setValue={setAreaValue}
                multiple={true}
                mode="BADGE"
                placeholder="Select Order Booker Area"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#144272" />
                )}
                style={[
                  styles.dropdown,
                  {
                    borderColor: '#144272',
                    width: '85%',
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '85%',
                  maxHeight: 120,
                  marginTop: 8,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
              />
              <TouchableOpacity onPress={togglearea}>
                <Image
                  style={{
                    tintColor: '#144272',
                    width: 22,
                    height: 17,
                    alignSelf: 'center',
                    marginLeft: -26,
                    marginTop: 17,
                  }}
                  source={require('../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={{flex: 1, justifyContent: 'flex-end'}}>
              <TouchableOpacity onPress={handleUpdateOB}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    height: 30,
                    width: 150,
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
                    Update Order Booker
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*view modal*/}
        <Modal isVisible={view}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 412,
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
                Order Booker's Detail
              </Text>
              <TouchableOpacity onPress={() => setview(!view)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View>
                {viewOrderBooker.map(item => (
                  <View style={styles.table}>
                    <View style={[styles.cardContainer]}>
                      <View style={{alignItems: 'center', marginBottom: 16}}>
                        {item.pic ? (
                          <Image
                            source={{uri: item.pic}}
                            style={styles.customerImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.noImageText}>
                            No Image Provided
                          </Text>
                        )}
                      </View>

                      <View style={styles.infoGrid}>
                        <Text style={styles.labl}>Name:</Text>
                        <Text style={styles.valu}>{item.name}</Text>

                        <Text style={styles.labl}>Email:</Text>
                        <Text style={styles.valu}>{item.email}</Text>

                        <Text style={styles.labl}>Contact:</Text>
                        <Text style={styles.valu}>{item.contact}</Text>

                        <Text style={styles.labl}>CNIC:</Text>
                        <Text style={styles.valu}>{item.cnic}</Text>

                        <Text style={styles.labl}>Order Booker Area:</Text>
                        <Text style={styles.valu}>{item.area}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
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
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: 285,
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
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    color: '#144272',
  },
  productinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    color: '#144272',
    borderRadius: 6,
    padding: 8,
    height: 40,
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
  customerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#144272',
  },
  noImageText: {
    color: '#144272',
    fontStyle: 'italic',
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
