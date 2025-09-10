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
import {useUser} from '../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import Toast from 'react-native-toast-message';

interface ShowSupplierData {
  id: number;
  sup_area_id: string;
  sup_name: string;
  sup_company_name: string;
  sup_agancy_name: string;
  sup_address: string;
  sup_contact: string;
  sup_sec_contact: string;
  sup_third_contact: string;
  sup_email: string;
  sup_image: string;
  sup_payment_type: string;
  sup_transaction_type: string;
  sup_opening_balance: string;
}

interface SupplierData {
  id: number;
  sup_name: string;
  sup_company_name: string;
  sup_agancy_name: string;
  sup_contact: string;
  area_name: string;
}

interface EditSupplier {
  id: number;
  sup_area_id: string;
  sup_name: string;
  sup_company_name: string;
  sup_agancy_name: string;
  sup_address: string;
  sup_contact: string;
  sup_sec_contact: string;
  sup_third_contact: string;
  sup_email: string;
}

const initialEditSupplier: EditSupplier = {
  id: 0,
  sup_address: '',
  sup_agancy_name: '',
  sup_area_id: '',
  sup_company_name: '',
  sup_contact: '',
  sup_email: '',
  sup_name: '',
  sup_sec_contact: '',
  sup_third_contact: '',
};

interface AreaDropDown {
  id: string;
  area_name: string;
}

interface AddSupplier {
  alsocust: string;
  comp_name: string;
  agencyname: string;
  supp_name: string;
  contact: string;
  sec_contact: string;
  third_contact: string;
  email: string;
  address: string;
  supp_area: string;
  opening_balancechechboc: string;
  opening_balance: string;
  transfer_type: string;
  transaction_type: string;
}

const initialAddSupplier: AddSupplier = {
  address: '',
  agencyname: '',
  alsocust: '',
  comp_name: '',
  contact: '',
  email: '',
  opening_balance: '',
  opening_balancechechboc: '',
  sec_contact: '',
  supp_area: '',
  supp_name: '',
  third_contact: '',
  transfer_type: '',
  transaction_type: '',
};

export default function SupplierPeople() {
  const {openDrawer} = useDrawer();
  const {token} = useUser();
  const [supplierData, setSupplierData] = useState<SupplierData[] | []>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [showSupplierData, setShowSupplierData] = useState<
    ShowSupplierData[] | []
  >([]);
  const [editForm, setEditForm] = useState<EditSupplier>(initialEditSupplier);
  const [areaDropdown, setAreaDropdown] = useState<AreaDropDown[] | []>([]);
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaValue, setAreaValue] = useState<string | null>('');
  const transformedAreas = areaDropdown.map(item => ({
    label: item.area_name,
    value: item.id,
  }));
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [addForm, setAddForm] = useState<AddSupplier>(initialAddSupplier);
  const [enableBal, setEnableBal] = useState<string[]>([]);
  const [viewModalArea, setViewModalArea] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = supplierData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = supplierData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const handleEditInputChange = (
    field: keyof EditSupplier,
    value: string | number,
  ) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddInputChange = (field: keyof AddSupplier, value: string) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  const [customer, setcustomer] = useState(false);

  const togglecustomer = () => {
    setcustomer(!customer);
  };

  const [area, setArea] = useState('');
  const [areaModal, setAreaModal] = useState(false);

  const togglearea = () => {
    setAreaModal(!areaModal);
  };

  const [paymentType, setpaymentType] = useState(false);
  const [current, setcurrentpaymentType] = useState<string | null>('');
  const paymentTypeItem = [
    {label: 'Payable', value: 'payable'},
    {label: 'Recievable', value: 'recievable'},
  ];

  const [isModalV, setModalV] = useState(false);
  const tglModal = async (id: number) => {
    setSelectedSupplier(id);
    setModalV(!isModalV);
  };
  const [edit, setedit] = useState(false);

  const toggleedit = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editsupplier?id=%20${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEditForm(res.data);
      setedit(!edit);
      setSelectedSupplier(id);
      setAreaOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const [view, setview] = useState(false);

  const toggleview = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/suppliersshow?id=${id}&_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = Array.isArray(res.data.supp)
        ? res.data.supp
        : [res.data.supp];

      setViewModalArea(res.data.area.area_name);
      setShowSupplierData(data);
      setview(!view);
    } catch (error) {
      console.log(error);
    }
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

  // Add Supplier
  const handleAddSupplier = async () => {
    if (
      !addForm.comp_name ||
      !addForm.supp_name ||
      !addForm.contact ||
      !addForm.address
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
      const res = await axios.post(`${BASE_URL}/addsupplier`, {
        comp_name: addForm.comp_name.trim(),
        agencyname: addForm.agencyname,
        supp_name: addForm.supp_name.trim(),
        contact: addForm.contact,
        sec_contact: addForm.sec_contact,
        third_contact: addForm.third_contact,
        email: addForm.email.trim(),
        address: addForm.address.trim(),
        supp_area: areaValue,
        ...(enableBal.includes('on') && {opening_balancechechboc: 'on'}),
        ...(enableBal.includes('on') && {
          opening_balance: addForm.opening_balancechechboc,
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
          text2: 'Supplier has been Added successfully',
          visibilityTime: 1500,
        });
        setAddForm(initialAddSupplier);
        setSelectedOptions([]);
        setAreaValue('');
        setEnableBal([]);
        setcurrentpaymentType('');
        handleFetchData();
        setcustomer(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/supplierdelete`, {
        id: selectedSupplier,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Supplier has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setSelectedSupplier(null);
        setModalV(false);
        handleFetchData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update Suuplier
  const handleUpdateSupplier = async () => {
    if (
      !editForm.sup_address ||
      !editForm.sup_name ||
      !editForm.sup_address ||
      !editForm.sup_contact
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
      const res = await axios.post(`${BASE_URL}/updatesupplier`, {
        supp_id: selectedSupplier,
        comp_name: editForm.sup_company_name.trim(),
        agencyname: editForm.sup_agancy_name,
        supp_name: editForm.sup_name.trim(),
        contact: editForm.sup_contact,
        sec_contact: editForm.sup_sec_contact,
        third_contact: editForm.sup_third_contact,
        email: editForm.sup_email,
        address: editForm.sup_address.trim(),
        supp_area: areaValue,
        ...(selectedOptions.includes('on') && {alsocust: 'on'}),
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Supplier has been Updated successfully!',
          visibilityTime: 1500,
        });

        setEditForm(initialEditSupplier);
        setAreaValue(null);
        setSelectedSupplier(null);
        setAreaOpen(false);
        handleFetchData();
        setedit(false);
      }
    } catch (error) {
      console.log(error);
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

  // Fetch User Data
  const handleFetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchsuppliersdata`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSupplierData(res.data.supp);
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
              Suppliers
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
              <View
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
                      <Text style={styles.text}>Company:</Text>
                      <Text style={styles.text}>{item.sup_company_name}</Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.value}>Agency:</Text>
                      <Text style={styles.value}>
                        {item.sup_agancy_name || '--'}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.value}>Contact:</Text>
                      <Text style={styles.value}>{item.sup_contact}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        Area:
                      </Text>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        {item.area_name || '--'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        </View>

        {/*Add Supplier Modal*/}
        <Modal isVisible={customer}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: '80%',
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
                Add New Supplier
              </Text>
              <TouchableOpacity onPress={() => setcustomer(!customer)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.row,
                {marginLeft: 7, marginRight: 10, justifyContent: 'flex-start'},
              ]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
                activeOpacity={0.7}
                onPress={() => {
                  const newOptions = selectedOptions.includes('on')
                    ? selectedOptions.filter(opt => opt !== 'on')
                    : [...selectedOptions, 'on'];
                  setSelectedOptions(newOptions);
                }}>
                <Checkbox.Android
                  status={
                    selectedOptions.includes('on') ? 'checked' : 'unchecked'
                  }
                  color="#144272"
                  uncheckedColor="#144272"
                />
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Also a Customer
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Company Name"
                value={addForm.comp_name}
                onChangeText={text => handleAddInputChange('comp_name', text)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Agency Name"
                value={addForm.address}
                onChangeText={text => handleAddInputChange('agencyname', text)}
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Supplier Name"
                value={addForm.supp_name}
                onChangeText={text => handleAddInputChange('supp_name', text)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 1"
                keyboardType="numeric"
                value={addForm.contact}
                onChangeText={text => handleAddInputChange('contact', text)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 2"
                keyboardType="numeric"
                value={addForm.sec_contact}
                onChangeText={text => handleAddInputChange('sec_contact', text)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 3"
                keyboardType="numeric"
                value={addForm.third_contact}
                onChangeText={text =>
                  handleAddInputChange('third_contact', text)
                }
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Address"
                value={addForm.address}
                onChangeText={text => handleAddInputChange('address', text)}
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
                placeholder="Select Supplier Area"
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
                    width: 265,
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                  zIndex: 1000,
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
                {marginLeft: 7, marginRight: 10, marginTop: -1},
              ]}>
              <TextInput
                style={[
                  styles.productinput,
                  {
                    color: '#144272',
                    backgroundColor: enableBal.includes('on')
                      ? 'white'
                      : '#e0e0e0',
                  },
                ]}
                placeholder="Balance"
                editable={enableBal.includes('on')}
                value={addForm.opening_balance}
                onChangeText={text =>
                  handleAddInputChange('opening_balance', text)
                }
              />
            </View>
            <TouchableOpacity onPress={handleAddSupplier}>
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
                  Add Supplier
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/*supplier area*/}
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
                onChangeText={text => setArea(text)}
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
                  setSelectedSupplier(null);
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

              <TouchableOpacity onPress={handleDeleteSupplier}>
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
              maxHeight: '60%',
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
                Edit Supplier
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setedit(!edit);
                  setEditForm(initialEditSupplier);
                  setAreaOpen(!areaOpen);
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
            <View
              style={[
                styles.row,
                {marginLeft: 7, marginRight: 10, justifyContent: 'flex-start'},
              ]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
                activeOpacity={0.7}
                onPress={() => {
                  const newOptions = selectedOptions.includes('on')
                    ? selectedOptions.filter(opt => opt !== 'on')
                    : [...selectedOptions, 'on'];
                  setSelectedOptions(newOptions);
                }}>
                <Checkbox.Android
                  status={
                    selectedOptions.includes('on') ? 'checked' : 'unchecked'
                  }
                  color="#144272"
                  uncheckedColor="#144272"
                />
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Also a Customer
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Company Name"
                value={editForm.sup_company_name}
                onChangeText={text =>
                  handleEditInputChange('sup_company_name', text)
                }
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Agency Name"
                value={editForm.sup_agancy_name}
                onChangeText={text =>
                  handleEditInputChange('sup_agancy_name', text)
                }
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Email"
                value={editForm.sup_email}
                onChangeText={text => handleEditInputChange('sup_email', text)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 1"
                value={editForm.sup_contact}
                onChangeText={text =>
                  handleEditInputChange('sup_contact', text)
                }
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 2"
                value={editForm.sup_sec_contact}
                onChangeText={text =>
                  handleEditInputChange('sup_sec_contact', text)
                }
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 3"
                value={editForm.sup_third_contact}
                onChangeText={text =>
                  handleEditInputChange('sup_third_contact', text)
                }
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Address"
                value={editForm.sup_address}
                onChangeText={text =>
                  handleEditInputChange('sup_address', text)
                }
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
                placeholder="Select Supplier Area"
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
              <TouchableOpacity onPress={handleUpdateSupplier}>
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
                    Update Supplier
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
              maxHeight: '75%',
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
                Supplier's Detail
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setview(!view);
                  setShowSupplierData([]);
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

            <ScrollView>
              {showSupplierData.map(item => (
                <View style={styles.table}>
                  <View style={[styles.cardContainer]}>
                    <View style={{alignItems: 'center', marginBottom: 16}}>
                      {item.sup_image ? (
                        <Image
                          source={{uri: item.sup_image}}
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
                      <Text style={styles.labl}>Company Name:</Text>
                      <Text style={styles.valu}>
                        {item.sup_company_name ?? 'Nill'}
                      </Text>

                      <Text style={styles.labl}>Agency Name:</Text>
                      <Text style={styles.valu}>
                        {item.sup_agancy_name ?? 'Nill'}
                      </Text>

                      <Text style={styles.labl}>Supplier Name:</Text>
                      <Text style={styles.valu}>{item.sup_name}</Text>

                      <Text style={styles.labl}>Contact 1:</Text>
                      <Text style={styles.valu}>
                        {item.sup_contact ?? 'Nill'}
                      </Text>

                      <Text style={styles.labl}>Contact 2:</Text>
                      <Text style={styles.valu}>
                        {item.sup_sec_contact ?? 'Nill'}
                      </Text>

                      <Text style={styles.labl}>Contact 3:</Text>
                      <Text style={styles.valu}>
                        {item.sup_third_contact ?? 'Nill'}
                      </Text>

                      <Text style={styles.labl}>Email:</Text>
                      <Text style={styles.valu}>
                        {item.sup_email ?? 'Nill'}
                      </Text>

                      <Text style={styles.labl}>Supplier Area:</Text>
                      <Text style={styles.valu}>{viewModalArea ?? 'Nill'}</Text>

                      <Text style={styles.labl}>Address:</Text>
                      <Text style={styles.valu}>
                        {item.sup_address ?? 'Nill'}
                      </Text>

                      <Text style={styles.labl}>Opening Balance:</Text>
                      <Text style={styles.valu}>
                        {item.sup_opening_balance ?? 'Nill'}
                      </Text>

                      <Text style={styles.labl}>Payment Type:</Text>
                      <Text style={styles.valu}>
                        {item.sup_payment_type ?? 'Nill'}
                      </Text>

                      <Text style={styles.labl}>Transaction Type:</Text>
                      <Text style={styles.valu}>
                        {item.sup_transaction_type ?? 'Nill'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
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
  },
  productinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
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
