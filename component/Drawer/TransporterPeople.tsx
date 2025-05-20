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
import {Checkbox} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import Toast from 'react-native-toast-message';

interface Transporter {
  id: number;
  trans_name: string;
  trans_cnic: string;
  trans_address: string;
  trans_contact: string;
  trans_email: string;
}

interface ViewTransporter {
  trans_name: string;
  trans_cnic: string;
  trans_address: string;
  trans_contact: string;
  trans_email: string;
  trans_contact_person_one: string;
  trans_contact_person_two: string;
  trans_sec_contact: string;
  trans_third_contact: string;
  trans_image: string;
  trans_opening_balance: string;
  trans_payment_type: string;
  trans_transaction_type: string;
}

interface EditForm {
  trans_name: string;
  trans_email: string;
  trans_address: string;
  trans_contact: string;
  trans_contact_person_one: string;
  trans_contact_person_two: string;
  trans_cnic: string;
  trans_sec_contact: string;
  trans_third_contact: string;
}

const initialEditForm: EditForm = {
  trans_name: '',
  trans_email: '',
  trans_address: '',
  trans_contact: '',
  trans_contact_person_one: '',
  trans_contact_person_two: '',
  trans_cnic: '',
  trans_sec_contact: '',
  trans_third_contact: '',
};

interface AddForm {
  trans_name: string;
  cnic: string;
  contact: string;
  email: string;
  contact_person_one: string;
  sec_contact: string;
  contact_person_two: string;
  third_contact: string;
  address: string;
  opening_balancechechboc: string;
  opening_balance: string;
  transfer_type: string;
  transaction_type: string;
}

const initialAddForm: AddForm = {
  trans_name: '',
  cnic: '',
  contact: '',
  email: '',
  contact_person_one: '',
  sec_contact: '',
  contact_person_two: '',
  third_contact: '',
  address: '',
  opening_balancechechboc: '',
  opening_balance: '',
  transfer_type: '',
  transaction_type: '',
};

export default function TransporterPeople() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [selectedTransporter, setSelectedTransporter] = useState<number | null>(
    null,
  );
  const [viewTransporters, setViewTransporters] = useState<ViewTransporter[]>(
    [],
  );
  const [editForm, setEditForm] = useState<EditForm>(initialEditForm);
  const [addForm, setAddForm] = useState<AddForm>(initialAddForm);
  const [enableBal, setEnableBal] = useState<string[]>([]);

  const handleEditInputChange = (field: keyof EditForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddInputChange = (field: keyof AddForm, value: string) => {
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

  const [paymentType, setpaymentType] = useState(false);
  const [current, setcurrentpaymentType] = useState<string | null>('');
  const paymentTypeItem = [
    {label: 'Payable', value: 'payable'},
    {label: 'Recievable', value: 'recievable'},
  ];

  const [isModalV, setModalV] = useState(false);

  // Delete Modal
  const tglModal = async (id: number) => {
    setSelectedTransporter(id);
    setModalV(!isModalV);
  };

  {
    /*edit*/
  }
  const [edit, setedit] = useState(false);

  // Edit Modal
  const toggleedit = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editTransporter?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setedit(!edit);
      setEditForm(res.data);
      setSelectedTransporter(id);
    } catch (error) {
      console.log(error);
    }
  };

  const [view, setview] = useState(false);

  // View Modal
  const toggleview = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/showTransporter?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = Array.isArray(res.data) ? res.data : [res.data];
      setViewTransporters(data);
      setview(!view);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Transporter
  const handleAddTrans = async () => {
    if (
      !addForm.address ||
      !addForm.trans_name ||
      !addForm.cnic ||
      !addForm.contact
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all fields and select a role before updating.',
        visibilityTime: 1500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/addTransporter`, {
        trans_name: addForm.trans_name.trim(),
        cnic: addForm.cnic,
        contact: addForm.contact,
        email: addForm.email,
        contact_person_one: addForm.contact_person_one,
        sec_contact: addForm.sec_contact,
        contact_person_two: addForm.contact_person_one,
        third_contact: addForm.third_contact,
        address: addForm.address.trim(),
        ...(enableBal.includes('on') && {opening_balancechechboc: 'on'}),
        ...(enableBal.includes('on') && {
          opening_balance: addForm.opening_balance,
        }),
        ...(enableBal.includes('on') && {transfer_type: current}),
        ...(enableBal.includes('on') && {
          transaction_type:
            current === 'payable'
              ? 'Credit Amount'
              : current === 'recievable'
              ? 'Debit Amount'
              : '',
        }),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Transporter has been Added successfully',
          visibilityTime: 1500,
        });

        setAddForm(initialAddForm);
        setcurrentpaymentType('');
        setEnableBal([]);
        handleFetchData();
        setcustomer(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Transporter
  const handleDeleteTrans = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/Transporterdelete`, {
        id: selectedTransporter,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Transporter has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setSelectedTransporter(null);
        handleFetchData();
        setModalV(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update Transporter
  const handleEditTrans = async () => {
    if (
      !editForm.trans_name ||
      !editForm.trans_cnic ||
      !editForm.trans_contact ||
      !editForm.trans_address
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all fields and select a role before updating.',
        visibilityTime: 1500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/updateTransporter`, {
        transporter_id: selectedTransporter,
        trans_name: editForm.trans_name.trim(),
        cnic: editForm.trans_cnic,
        contact: editForm.trans_contact,
        email: editForm.trans_email,
        contact_person_one: editForm.trans_contact_person_one,
        sec_contact: editForm.trans_sec_contact,
        contact_person_two: editForm.trans_contact_person_two,
        third_contact: editForm.trans_third_contact,
        address: editForm.trans_address.trim(),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Transporter has been Updated successfully!',
          visibilityTime: 1500,
        });

        setEditForm(initialEditForm);
        setSelectedTransporter(null);
        handleFetchData();
        setedit(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Data
  const handleFetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchTransportersdata`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransporters(res.data.transporter);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleFetchData();
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
              Transporter
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
            data={transporters}
            style={{marginBottom: 100}}
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
                      {item.trans_name}
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
                      <Text style={styles.text}>
                        {item.trans_contact ?? '--'}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>CNIC:</Text>
                      <Text style={styles.text}>{item.trans_cnic ?? '--'}</Text>
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
                        {item.trans_email ?? '--'}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
          />
        </View>

        {/*transporter*/}
        <Modal isVisible={customer}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: '70%',
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
                Add New Transporter
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setcustomer(!customer);
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
                placeholder="Transporter Name"
                value={addForm.trans_name}
                onChangeText={t => handleAddInputChange('trans_name', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="CNIC"
                keyboardType="numeric"
                maxLength={15}
                value={addForm.cnic}
                onChangeText={t => handleAddInputChange('cnic', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact"
                maxLength={12}
                keyboardType="number-pad"
                value={addForm.contact}
                onChangeText={t => handleAddInputChange('contact', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Email"
                value={addForm.email}
                onChangeText={t => handleAddInputChange('email', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person 1"
                maxLength={12}
                keyboardType="number-pad"
                value={addForm.contact_person_one}
                onChangeText={t =>
                  handleAddInputChange('contact_person_one', t)
                }
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 1"
                maxLength={12}
                keyboardType="number-pad"
                value={addForm.sec_contact}
                onChangeText={t => handleAddInputChange('sec_contact', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person 2"
                maxLength={12}
                keyboardType="number-pad"
                value={addForm.contact_person_two}
                onChangeText={t =>
                  handleAddInputChange('contact_person_two', t)
                }
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 2"
                maxLength={12}
                keyboardType="number-pad"
                value={addForm.third_contact}
                onChangeText={t => handleAddInputChange('third_contact', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Address"
                value={addForm.address}
                onChangeText={t => handleAddInputChange('address', t)}
              />
            </View>

            <View
              style={[
                styles.row,
                {
                  marginLeft: 7,
                  marginRight: 10,
                  justifyContent: 'flex-start',
                  zIndex: 999,
                },
              ]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
                activeOpacity={0.7}
                onPress={() => {
                  const newOptions = enableBal.includes('on')
                    ? enableBal.filter(opt => opt !== 'on')
                    : [...enableBal, 'on'];
                  setEnableBal(newOptions);
                }}>
                <Checkbox.Android
                  status={enableBal.includes('on') ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                />
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Enable Opening Balance
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.row,
                {marginLeft: 7, marginRight: 10, zIndex: 999},
              ]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Opening balance"
                keyboardType="numeric"
                value={addForm.opening_balance}
                onChangeText={text =>
                  handleAddInputChange('opening_balance', text)
                }
                editable={enableBal.includes('on')}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 8,
                marginRight: 10,
                zIndex: 999,
              }}>
              <DropDownPicker
                items={paymentTypeItem}
                open={paymentType}
                setOpen={setpaymentType}
                value={current}
                setValue={setcurrentpaymentType}
                placeholder="Payment Type"
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
                    width: '100%',
                    marginLeft: 0,
                    height: 40,
                    backgroundColor: enableBal.includes('on')
                      ? 'transparent'
                      : '#e0e0e0',
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '100%',
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                disabled={!enableBal.includes('on')}
              />
            </View>

            <View
              style={[
                styles.row,
                {
                  marginLeft: 7,
                  marginRight: 10,
                  marginTop: -1,
                  backgroundColor: '#e0e0e0', // lighter gray
                  borderRadius: 10,
                },
              ]}>
              <Text
                style={[
                  styles.productinput,
                  {
                    color: '#144272',
                    textAlignVertical: 'center',
                    fontWeight: 'bold',
                  },
                ]}>
                {current === 'payable' ? 'Credit Amount' : 'Debit Amount'}
              </Text>
            </View>

            <View style={{flex: 1, justifyContent: 'flex-end'}}>
              <TouchableOpacity onPress={handleAddTrans}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    height: 30,
                    width: 120,
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
                    Add Transporter
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
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
                  setSelectedTransporter(null);
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

              <TouchableOpacity onPress={handleDeleteTrans}>
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
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: '70%',
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
                Edit Transporter
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setedit(!edit);
                  setEditForm(initialEditForm);
                  setSelectedTransporter(null);
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
                placeholder="Transporter Name"
                value={editForm.trans_name}
                onChangeText={t => handleEditInputChange('trans_name', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="CNIC"
                keyboardType="numeric"
                maxLength={15}
                value={editForm.trans_cnic}
                onChangeText={t => handleEditInputChange('trans_cnic', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact"
                maxLength={12}
                keyboardType="numeric"
                value={editForm.trans_contact}
                onChangeText={t => handleEditInputChange('trans_contact', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Email"
                keyboardType="email-address"
                value={editForm.trans_email}
                onChangeText={t => handleEditInputChange('trans_email', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person 1"
                maxLength={12}
                keyboardType="numeric"
                value={editForm.trans_contact_person_one}
                onChangeText={t =>
                  handleEditInputChange('trans_contact_person_one', t)
                }
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 1"
                maxLength={12}
                keyboardType="numeric"
                value={editForm.trans_sec_contact}
                onChangeText={t =>
                  handleEditInputChange('trans_sec_contact', t)
                }
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person 2"
                maxLength={12}
                keyboardType="numeric"
                value={editForm.trans_contact_person_two}
                onChangeText={t =>
                  handleEditInputChange('trans_contact_person_two', t)
                }
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 2"
                maxLength={12}
                keyboardType="numeric"
                value={editForm.trans_third_contact}
                onChangeText={t =>
                  handleEditInputChange('trans_third_contact', t)
                }
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Address"
                value={editForm.trans_address}
                onChangeText={t => handleEditInputChange('trans_address', t)}
              />
            </View>

            <View style={{flex: 1, justifyContent: 'flex-end'}}>
              <TouchableOpacity onPress={handleEditTrans}>
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
                    Update Transporter
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>

        {/*view modal*/}
        <Modal isVisible={view}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 500,
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
                Transporter 's Detail
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
              {viewTransporters.map(item => (
                <View style={styles.table} key={item.trans_cnic}>
                  <View style={[styles.cardContainer]}>
                    <View style={{alignItems: 'center', marginBottom: 16}}>
                      {item.trans_image ? (
                        <Image
                          source={{uri: item.trans_image}}
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
                      <Text style={styles.labl}>Transporter Name:</Text>
                      <Text style={styles.valu}>{item.trans_name}</Text>

                      <Text style={styles.labl}>Contact:</Text>
                      <Text style={styles.valu}>{item.trans_contact}</Text>

                      <Text style={styles.labl}>CNIC:</Text>
                      <Text style={styles.valu}>{item.trans_cnic}</Text>

                      <Text style={styles.labl}>Email:</Text>
                      <Text style={styles.valu}>{item.trans_email}</Text>

                      <Text style={styles.labl}>Contact 1:</Text>
                      <Text style={styles.valu}>
                        {item.trans_sec_contact ?? 'N/A'}
                      </Text>

                      <Text style={styles.labl}>Contact 2:</Text>
                      <Text style={styles.valu}>
                        {item.trans_third_contact ?? 'N/A'}
                      </Text>

                      <Text style={styles.labl}>Contact Person 1:</Text>
                      <Text style={styles.valu}>
                        {item.trans_contact_person_one ?? 'N/A'}
                      </Text>

                      <Text style={styles.labl}>Contact Person 2:</Text>
                      <Text style={styles.valu}>
                        {item.trans_contact_person_two ?? 'N/A'}
                      </Text>

                      <Text style={styles.labl}>Address:</Text>
                      <Text style={styles.valu}>{item.trans_address}</Text>

                      <Text style={styles.labl}>Opening Balance:</Text>
                      <Text style={styles.valu}>
                        {item.trans_opening_balance ?? 'N/A'}
                      </Text>

                      <Text style={styles.labl}>Payment Type:</Text>
                      <Text style={styles.valu}>
                        {item.trans_payment_type ?? 'N/A'}
                      </Text>

                      <Text style={styles.labl}>Transaction Type:</Text>
                      <Text style={styles.valu}>
                        {item.trans_transaction_type ?? 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
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
  lastrow: {
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderBottomEndRadius: 10,
    borderBottomLeftRadius: 10,
  },
  card: {
    borderColor: '#144272',
    backgroundColor: 'white',
    height: 'auto',
    borderRadius: 12,
    elevation: 15,
    marginBottom: 5,
    padding: 10,
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
  addButton: {
    marginLeft: 8,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    width: 60,
  },
  completeButton: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 320,
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
