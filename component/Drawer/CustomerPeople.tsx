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
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface EditCustomer {
  id: number;
  cust_area_id: number;
  cust_type_id: number;
  cust_sup_id: number;
  cust_name: string;
  cust_fathername: string;
  cust_contact: string;
  cust_sec_contact: string;
  cust_third_contact: string;
  cust_contact_person_one: string;
  cust_contact_person_two: string;
  cust_cnic: string;
  cust_email: string;
  cust_address: string;
  cust_payment_type: string;
  cust_opening_balance: string;
  cust_transaction_type: string;
  updated_at: string;
}

const initialEditCustomer: EditCustomer = {
  id: 0,
  cust_area_id: 0,
  cust_type_id: 0,
  cust_sup_id: 0,
  cust_name: '',
  cust_fathername: '',
  cust_contact: '',
  cust_sec_contact: '',
  cust_third_contact: '',
  cust_contact_person_one: '',
  cust_contact_person_two: '',
  cust_cnic: '',
  cust_email: '',
  cust_address: '',
  cust_payment_type: '',
  cust_opening_balance: '',
  cust_transaction_type: '',
  updated_at: '',
};

interface Customers {
  id: number;
  cust_image: string;
  cust_email: string;
  cust_cnic: string;
  cust_name: string;
  cust_contact: string;
  cust_address: string;
  custtyp_name: string;
  area_name: string;
}

interface CustomersData {
  cust: {
    id: number;
    cust_area_id: string;
    cust_type_id: string;
    cust_sup_id: string;
    cust_name: string;
    cust_fathername: string;
    cust_contact: string;
    cust_sec_contact: string;
    cust_third_contact: string;
    cust_contact_person_one: string;
    cust_contact_person_two: string;
    cust_cnic: string;
    cust_email: string;
    cust_address: string;
    cust_image: string;
    cust_status: string;
    cust_payment_type: string;
    cust_opening_balance: string;
    cust_transaction_type: string;
    created_at: string;
    updated_at: string;
  };
  type: {
    id: number;
    custtyp_name: string;
    custtyp_status: string;
    created_at: string;
    updated_at: string;
  };
  area: {
    id: number;
    area_name: string;
    area_status: string;
    created_at: string;
    updated_at: string;
  };
}

interface AddCustomer {
  name: string;
  father_name: string;
  contact: string;
  email: string;
  contact_person_one: string;
  sec_contact: string;
  contact_person_two: string;
  third_contact: string;
  cnic: string;
  address: string;
  opening_balance: string;
  transfer_type: string;
  transaction_type: string;
}

const initialAddCustomer: AddCustomer = {
  name: '',
  father_name: '',
  contact: '',
  email: '',
  contact_person_one: '',
  sec_contact: '',
  contact_person_two: '',
  third_contact: '',
  cnic: '',
  address: '',
  opening_balance: '',
  transfer_type: '',
  transaction_type: '',
};

interface TypeData {
  id: string;
  custtyp_name: string;
  custtyp_status: string;
  created_at: string;
  updated_at: string;
}

interface AreaData {
  id: string;
  area_name: string;
  area_status: string;
  created_at: string;
  updated_at: string;
}

export default function CustomerPeople() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [custData, setCustData] = useState<Customers[]>([]);
  const [selectedCust, setSelectedCust] = useState<CustomersData[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [addForm, setAddForm] = useState<AddCustomer>(initialAddCustomer);
  const [types, setTypes] = useState<TypeData[]>([]);
  const [areaData, setAreaData] = useState<AreaData[]>([]);
  const [enableBal, setEnableBal] = useState<string[]>([]);
  const [editForm, setEditForm] = useState<EditCustomer>(initialEditCustomer);
  const [custTypeName, setCustTypeName] = useState('');
  const [custAreaName, setCustAreaName] = useState('');
  const [modalVisible, setModalVisible] = useState('');

  // Add Customer Form On Change
  const onChange = (field: keyof AddCustomer, value: string) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add Customer Form On Change
  const editOnChange = (field: keyof EditCustomer, value: string | number) => {
    setEditForm(prev => ({
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

  const [customerType, setcustomerType] = useState(false);
  const [custType, setCustType] = useState<string | null>('');
  const [addcustomer, setaddcustomer] = useState(false);
  const [btncustomer, setbtncustomer] = useState(false);

  const togglebtncustomer = () => {
    setbtncustomer(!btncustomer);
  };

  const [area, setarea] = useState(false);
  const [customerArea, setcustomerArea] = useState(false);
  const [custArea, setCustArea] = useState<string | null>('');
  const [areabtn, setareabtn] = useState(false);

  const toggleareabtn = () => {
    setareabtn(!areabtn);
  };

  const [paymentType, setpaymentType] = useState(false);
  const [current, setcurrentpaymentType] = useState<string | null>('');
  const paymentTypeItem = [
    {label: 'Payable', value: 'payable'},
    {label: 'Recievable', value: 'recievable'},
  ];

  const [isModalV, setModalV] = useState(false);
  const tglModal = () => {
    setModalV(!isModalV);
  };

  {
    /*edit*/
  }
  const [edit, setedit] = useState(false);

  const toggleedit = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editcustomer?id=${id}&_token=${token}`,
      );
      setEditForm(res.data);
      setCurrentEdit(res.data.cust_type_id);
      setCustEditArea(res.data.cust_area_id);
      setedit(!edit);
    } catch (error) {
      console.log(error);
    }
  };

  const [editType, setEditType] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<string | null>('');
  const [customereditArea, setcustomereditArea] = useState(false);
  const [custEditArea, setCustEditArea] = useState<string | null>('');

  const [view, setview] = useState(false);

  const toggleview = () => {
    setview(!view);
  };

  // Fetch Customer
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcustomersdata`);
      setCustData(res.data.cust);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Customer
  const delCustomer = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/customerdelete`, {
        id: selectedCustomer,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Customer has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setSelectedCustomer(null);
        tglModal();
        fetchCustomers();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Type
  const fetchType = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchtypedata`);
      setTypes(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const transformedTypes = types.map(item => ({
    label: item.custtyp_name,
    value: item.id,
  }));

  // Fetch Area
  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchareadata`);
      setAreaData(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const transformedAreas = areaData.map(item => ({
    label: item.area_name,
    value: item.id,
  }));

  // Add Customer
  const addCustomer = async () => {
    if (
      !addForm.name.trim() ||
      !addForm.father_name.trim() ||
      !addForm.contact.trim() ||
      !addForm.email.trim() ||
      !addForm.address.trim() ||
      !addForm.cnic.trim() ||
      !custType ||
      !custArea
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all required fields.',
        visibilityTime: 2000,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/addcustomer`, {
        cust_name: addForm.name.trim(),
        fathername: addForm.father_name.trim(),
        contact: addForm.contact.trim(),
        email: addForm.email.trim(),
        contact_person_one: addForm.contact_person_one,
        sec_contact: addForm.sec_contact,
        contact_person_two: addForm.contact_person_two,
        third_contact: addForm.third_contact,
        cnic: addForm.cnic.trim(),
        address: addForm.address.trim(),
        cust_type: custType,
        cust_area: custArea,
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
          text2: 'Customer has been Added successfully',
          visibilityTime: 1500,
        });
        fetchCustomers();
        setAddForm(initialAddCustomer);
        setCustArea('');
        setCustType('');
        setEnableBal([]);
        setcurrentpaymentType('');
        setcustomer(!customer);
      }
    } catch (error) {
      console.log();
    }
  };

  // Edit Customer
  const editCustomer = async () => {
    if (
      !editForm.cust_name.trim() ||
      !editForm.cust_contact.trim() ||
      !editForm.cust_email.trim() ||
      !editForm.cust_address.trim() ||
      !editForm.cust_cnic.trim() ||
      !currentEdit ||
      !custEditArea
    ) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all required fields.',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/updatecustomer`, {
        cust_id: editForm.id,
        cust_name: editForm.cust_name.trim(),
        fathername: editForm.cust_fathername.trim(),
        email: editForm.cust_email.trim(),
        contact: editForm.cust_contact.trim(),
        contact_person_one: editForm.cust_contact_person_one,
        sec_contact: editForm.cust_sec_contact,
        contact_person_two: editForm.cust_contact_person_two,
        third_contact: editForm.cust_third_contact,
        cnic: editForm.cust_cnic,
        address: editForm.cust_address,
        cust_type: currentEdit,
        cust_area: custEditArea,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Customer record has been Updated successfully',
          visibilityTime: 1500,
        });
        fetchCustomers();
        setEditForm(initialEditCustomer);
        setCurrentEdit('');
        setCustEditArea('');
        setedit(!edit);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Add Type
  const addType = async () => {
    if (!custTypeName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all required fields.',
        visibilityTime: 2000,
      });
    }

    try {
      const res = await axios.post(`${BASE_URL}/addtype`, {
        custtyp_name: custTypeName.trim(),
      });

      const data = res.data;
      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Customer type has been Added successfully',
          visibilityTime: 1500,
        });
        setCustTypeName('');
        setModalVisible('');
        fetchType();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Add Area
  const addArea = async () => {
    if (!custAreaName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all required fields.',
        visibilityTime: 2000,
      });
    }

    try {
      const res = await axios.post(`${BASE_URL}/addarea`, {
        area_name: custAreaName.trim(),
      });

      const data = res.data;
      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Customer Area has been Added successfully',
          visibilityTime: 1500,
        });
        setCustAreaName('');
        setModalVisible('');
        fetchAreas();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchType();
    fetchAreas();
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
              Customers
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
            data={custData}
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
                      {item.cust_name}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          toggleview();
                          const fetchDetails = async (id: number) => {
                            try {
                              const res = await axios.get(
                                `${BASE_URL}/custshow?id=${id}&_token=${token}`,
                              );
                              setSelectedCust([res.data]);
                            } catch (error) {
                              console.log(error);
                            }
                          };

                          fetchDetails(item.id);
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

                      <TouchableOpacity
                        onPress={() => {
                          tglModal();
                          setSelectedCustomer(item.id);
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
                      <Text style={styles.text}>{item.cust_contact}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        Address:
                      </Text>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        {item.cust_address}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No customers found.
                </Text>
              </View>
            }
          />
        </View>

        {/*Add Customer Modal*/}
        <Modal isVisible={customer}>
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
                Add New Customer
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

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Customer Name"
                value={addForm.name}
                onChangeText={t => onChange('name', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Father Name"
                value={addForm.father_name}
                onChangeText={t => onChange('father_name', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Email"
                value={addForm.email}
                onChangeText={t => onChange('email', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Address"
                value={addForm.address}
                onChangeText={t => onChange('address', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact"
                value={addForm.contact}
                keyboardType="phone-pad"
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  onChange('contact', cleaned);
                }}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="CNIC"
                keyboardType="numeric"
                maxLength={15}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 5 digits
                  if (cleaned.length > 5) {
                    cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                  }
                  // Insert another dash after 7 more digits (total 13 digits: 5-7-1)
                  if (cleaned.length > 13) {
                    cleaned =
                      cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                  }
                  // Limit to 15 characters (including dashes)
                  if (cleaned.length > 15) {
                    cleaned = cleaned.slice(0, 15);
                  }
                  onChange('cnic', cleaned);
                }}
                value={addForm.cnic}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person 1"
                value={addForm.contact_person_one}
                keyboardType="phone-pad"
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  onChange('contact_person_one', cleaned);
                }}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person 2"
                value={addForm.contact_person_two}
                keyboardType="phone-pad"
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  onChange('contact_person_two', cleaned);
                }}
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 1"
                value={addForm.sec_contact}
                keyboardType="phone-pad"
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  onChange('sec_contact', cleaned);
                }}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 2"
                value={addForm.third_contact}
                keyboardType="phone-pad"
                maxLength={12}
                onChangeText={t => {
                  // Remove all non-digits and non-dash
                  let cleaned = t.replace(/[^0-9-]/g, '');
                  // Remove existing dashes for formatting
                  cleaned = cleaned.replace(/-/g, '');
                  // Insert dash after 4 digits
                  if (cleaned.length > 4) {
                    cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                  }
                  // Limit to 12 characters (including dash)
                  if (cleaned.length > 12) {
                    cleaned = cleaned.slice(0, 12);
                  }
                  onChange('third_contact', cleaned);
                }}
              />
            </View>

            {/* Customer Type Dropdown - moved above Customer Area */}
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={transformedTypes}
                open={customerType}
                setOpen={setcustomerType}
                value={custType}
                setValue={setCustType}
                placeholder="Select Customer Type"
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
                listMode="SCROLLVIEW"
              />
              <TouchableOpacity onPress={() => setModalVisible('Add Type')}>
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

            {/* Customer Area Dropdown */}
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={transformedAreas}
                open={customerArea}
                setOpen={setcustomerArea}
                value={custArea}
                setValue={setCustArea}
                placeholder="Select Customer Area"
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
                    zIndex: 999,
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                  marginTop: 8,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />
              <TouchableOpacity onPress={() => setModalVisible('Area')}>
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

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Opening balance"
                keyboardType="numeric"
                value={addForm.opening_balance}
                onChangeText={t => onChange('opening_balance', t)}
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
                listMode="SCROLLVIEW"
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
                    backgroundColor:
                      current === 'recievable'
                        ? 'gray'
                        : current === 'payable'
                        ? 'gray'
                        : enableBal.includes('on')
                        ? 'gray'
                        : '#e0e0e0',
                  },
                ]}
                placeholder={
                  current === 'recievable'
                    ? 'Debit Amount'
                    : current === 'payable'
                    ? 'Credit Amount'
                    : 'Balance'
                }
                editable={
                  current === 'recievable'
                    ? false
                    : current === 'payable'
                    ? false
                    : enableBal.includes('on')
                }
              />
            </View>

            <TouchableOpacity onPress={addCustomer}>
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
                  Add Customer
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*add customer type*/}
        <Modal isVisible={addcustomer}>
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
                Add New Type
              </Text>
              <TouchableOpacity onPress={() => setaddcustomer(!addcustomer)}>
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
                placeholder="Type Name"
              />
            </View>
            <TouchableOpacity onPress={togglebtncustomer}>
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
                  Add Type
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
        {/*add type btn*/}
        <Modal isVisible={btncustomer}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Added
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Type has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setbtncustomer(!btncustomer)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*customer area*/}
        <Modal isVisible={area}>
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
              <TouchableOpacity onPress={() => setarea(!area)}>
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
              />
            </View>
            <TouchableOpacity onPress={toggleareabtn}>
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

        {/*add area btn*/}
        <Modal isVisible={areabtn}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Added
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Area has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setareabtn(!areabtn)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
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
              <TouchableOpacity onPress={() => setModalV(!isModalV)}>
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

              <TouchableOpacity onPress={() => delCustomer()}>
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
              maxHeight: 550,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <ScrollView
              contentContainerStyle={{paddingBottom: 80}}
              style={{flex: 1}}>
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
                  Edit Customer
                </Text>
                <TouchableOpacity onPress={() => setedit(!edit)}>
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
                  placeholder="Customer Name"
                  value={editForm.cust_name}
                  onChangeText={t => editOnChange('cust_name', t)}
                />
                <TextInput
                  style={styles.productinput}
                  placeholderTextColor={'#144272'}
                  placeholder="Father Name"
                  value={editForm.cust_fathername}
                  onChangeText={t => editOnChange('cust_fathername', t)}
                />
              </View>

              <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
                <TextInput
                  style={styles.productinput}
                  placeholderTextColor={'#144272'}
                  placeholder="Email"
                  value={editForm.cust_email}
                  onChangeText={t => editOnChange('cust_email', t)}
                />
                <TextInput
                  style={styles.productinput}
                  placeholderTextColor={'#144272'}
                  placeholder="Address"
                  value={editForm.cust_address}
                  onChangeText={t => editOnChange('cust_address', t)}
                />
              </View>

              <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
                <TextInput
                  style={styles.productinput}
                  placeholderTextColor={'#144272'}
                  placeholder="Contact"
                  value={editForm.cust_contact}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => {
                    // Remove all non-digits and non-dash
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    // Remove existing dashes for formatting
                    cleaned = cleaned.replace(/-/g, '');
                    // Insert dash after 4 digits
                    if (cleaned.length > 4) {
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    }
                    // Limit to 12 characters (including dash)
                    if (cleaned.length > 12) {
                      cleaned = cleaned.slice(0, 12);
                    }
                    editOnChange('cust_contact', cleaned);
                  }}
                />
                <TextInput
                  style={styles.productinput}
                  placeholderTextColor={'#144272'}
                  placeholder="CNIC"
                  keyboardType="numeric"
                  maxLength={15}
                  value={editForm.cust_cnic}
                  onChangeText={t => {
                    // Remove all non-digits and non-dash
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    // Remove existing dashes for formatting
                    cleaned = cleaned.replace(/-/g, '');
                    // Insert dash after 5 digits
                    if (cleaned.length > 5) {
                      cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
                    }
                    // Insert another dash after 7 more digits (total 13 digits: 5-7-1)
                    if (cleaned.length > 13) {
                      cleaned =
                        cleaned.slice(0, 13) + '-' + cleaned.slice(13, 14);
                    }
                    // Limit to 15 characters (including dashes)
                    if (cleaned.length > 15) {
                      cleaned = cleaned.slice(0, 15);
                    }
                    editOnChange('cust_cnic', cleaned);
                  }}
                />
              </View>

              <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
                <TextInput
                  style={styles.productinput}
                  placeholderTextColor={'#144272'}
                  placeholder="Contact Person 1"
                  value={editForm.cust_contact_person_one}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => {
                    // Remove all non-digits and non-dash
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    // Remove existing dashes for formatting
                    cleaned = cleaned.replace(/-/g, '');
                    // Insert dash after 4 digits
                    if (cleaned.length > 4) {
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    }
                    // Limit to 12 characters (including dash)
                    if (cleaned.length > 12) {
                      cleaned = cleaned.slice(0, 12);
                    }
                    editOnChange('cust_contact_person_one', cleaned);
                  }}
                />
                <TextInput
                  style={styles.productinput}
                  placeholderTextColor={'#144272'}
                  placeholder="Contact Person 2"
                  value={editForm.cust_contact_person_two}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => {
                    // Remove all non-digits and non-dash
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    // Remove existing dashes for formatting
                    cleaned = cleaned.replace(/-/g, '');
                    // Insert dash after 4 digits
                    if (cleaned.length > 4) {
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    }
                    // Limit to 12 characters (including dash)
                    if (cleaned.length > 12) {
                      cleaned = cleaned.slice(0, 12);
                    }
                    editOnChange('cust_contact_person_two', cleaned);
                  }}
                />
              </View>

              <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
                <TextInput
                  style={styles.productinput}
                  placeholderTextColor={'#144272'}
                  placeholder="Contact 1"
                  value={editForm.cust_sec_contact}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => {
                    // Remove all non-digits and non-dash
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    // Remove existing dashes for formatting
                    cleaned = cleaned.replace(/-/g, '');
                    // Insert dash after 4 digits
                    if (cleaned.length > 4) {
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    }
                    // Limit to 12 characters (including dash)
                    if (cleaned.length > 12) {
                      cleaned = cleaned.slice(0, 12);
                    }
                    editOnChange('cust_sec_contact', cleaned);
                  }}
                />
                <TextInput
                  style={styles.productinput}
                  placeholderTextColor={'#144272'}
                  placeholder="Contact 2"
                  value={editForm.cust_third_contact}
                  keyboardType="phone-pad"
                  maxLength={12}
                  onChangeText={t => {
                    // Remove all non-digits and non-dash
                    let cleaned = t.replace(/[^0-9-]/g, '');
                    // Remove existing dashes for formatting
                    cleaned = cleaned.replace(/-/g, '');
                    // Insert dash after 4 digits
                    if (cleaned.length > 4) {
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    }
                    // Limit to 12 characters (including dash)
                    if (cleaned.length > 12) {
                      cleaned = cleaned.slice(0, 12);
                    }
                    editOnChange('cust_third_contact', cleaned);
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  marginLeft: 10,
                  marginRight: 10,
                }}>
                <DropDownPicker
                  items={transformedTypes}
                  open={editType}
                  setOpen={setEditType}
                  value={currentEdit}
                  setValue={setCurrentEdit}
                  placeholder="Select Customer Type"
                  placeholderStyle={{color: '#144272'}}
                  textStyle={{color: '#144272'}}
                  ArrowUpIconComponent={() => (
                    <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                  )}
                  ArrowDownIconComponent={() => (
                    <Icon
                      name="keyboard-arrow-down"
                      size={18}
                      color="#144272"
                    />
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
                    marginTop: 8,
                    zIndex: 1000,
                  }}
                  labelStyle={{color: '#144272'}}
                  listItemLabelStyle={{color: '#144272'}}
                  listMode="SCROLLVIEW"
                />
                <TouchableOpacity onPress={() => setModalVisible('Add Type')}>
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
                style={{
                  flexDirection: 'row',
                  marginLeft: 10,
                  marginRight: 10,
                }}>
                <DropDownPicker
                  items={transformedAreas}
                  open={customereditArea}
                  setOpen={setcustomereditArea}
                  value={custEditArea}
                  setValue={setCustEditArea}
                  placeholder="Select Customer Area"
                  placeholderStyle={{color: '#144272'}}
                  textStyle={{color: '#144272'}}
                  ArrowUpIconComponent={() => (
                    <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                  )}
                  ArrowDownIconComponent={() => (
                    <Icon
                      name="keyboard-arrow-down"
                      size={18}
                      color="#144272"
                    />
                  )}
                  style={[
                    styles.dropdown,
                    {
                      borderColor: '#144272',
                      width: 265,
                      zIndex: 999,
                    },
                  ]}
                  dropDownContainerStyle={{
                    backgroundColor: 'white',
                    borderColor: '#144272',
                    width: 265,
                    marginTop: 8,
                  }}
                  labelStyle={{color: '#144272'}}
                  listItemLabelStyle={{color: '#144272'}}
                  listMode="SCROLLVIEW"
                />
                <TouchableOpacity onPress={() => setModalVisible('Area')}>
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
            </ScrollView>

            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'white',
                paddingVertical: 10,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                alignItems: 'center',
              }}>
              <TouchableOpacity onPress={editCustomer}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    height: 35,
                    paddingHorizontal: 24,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignSelf: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Update Customer
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*Add Customer Type*/}
        <Modal isVisible={modalVisible === 'Add Type'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 150,
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
                Add New Type
              </Text>
              <TouchableOpacity onPress={() => setModalVisible('')}>
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
                placeholder="Type Name"
                value={custTypeName}
                onChangeText={t => setCustTypeName(t)}
              />
            </View>
            <TouchableOpacity onPress={addType}>
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
                  Add Type
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/*Customer Area*/}
        <Modal isVisible={modalVisible === 'Area'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 150,
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
                  setModalVisible('');
                  setCustAreaName('');
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
                value={custAreaName}
                onChangeText={t => setCustAreaName(t)}
              />
            </View>
            <TouchableOpacity onPress={addArea}>
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

        {/*view modal*/}
        <Modal isVisible={view}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 600,
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
                Customer's Detail
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setview(!view);
                  setSelectedCust([]);
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

            <View>
              <FlatList
                data={selectedCust}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <ScrollView
                    style={{
                      padding: 5,
                    }}>
                    <View style={styles.table}>
                      <View style={[styles.cardContainer]}>
                        <View style={{alignItems: 'center', marginBottom: 16}}>
                          {item.cust.cust_image ? (
                            <Image
                              source={{uri: item.cust.cust_image}}
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
                          <Text style={styles.labl}>Customer Name:</Text>
                          <Text style={styles.valu}>{item.cust.cust_name}</Text>

                          <Text style={styles.labl}>Father Name:</Text>
                          <Text style={styles.valu}>
                            {item.cust.cust_fathername ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Email:</Text>
                          <Text style={styles.valu}>
                            {item.cust.cust_email ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Customer Contact:</Text>
                          <Text style={styles.valu}>
                            {item.cust.cust_contact ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Contact Person One:</Text>
                          <Text style={styles.valu}>
                            {item.cust.cust_contact_person_one ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Contact Person Two:</Text>
                          <Text style={styles.valu}>
                            {item.cust.cust_contact_person_two ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Contact Number One:</Text>
                          <Text style={styles.valu}>
                            {item.cust.cust_sec_contact ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Contact Number Two:</Text>
                          <Text style={styles.valu}>
                            {item.cust.cust_third_contact ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>CNIC:</Text>
                          <Text style={styles.valu}>
                            {item.cust.cust_cnic ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Address:</Text>
                          <Text style={styles.valu}>
                            {item.cust.cust_address ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Customer Area:</Text>
                          <Text style={styles.valu}>
                            {item.area.area_name ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Customer Type:</Text>
                          <Text style={styles.valu}>
                            {item.type.custtyp_name ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Opening Balance:</Text>
                          <Text style={styles.valu}>
                            {item.cust.cust_opening_balance ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Payment Type:</Text>
                          <Text style={styles.valu}>
                            {item.cust.cust_payment_type ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Transaction Type:</Text>
                          <Text style={styles.valu}>
                            {item.cust.cust_transaction_type ?? 'N/A'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                )}
              />
            </View>
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
    color: '#000',
  },
  productinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
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
