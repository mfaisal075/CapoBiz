import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';
import {Checkbox} from 'react-native-paper';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useUser} from '../../CTX/UserContext';

interface Customers {
  id: number;
  cust_name: string;
  cust_fathername: string;
}

interface Supplier {
  id: number;
  sup_name: string;
  sup_company_name: string;
}

interface ProductDetails {
  name: string;
  barCode: string;
  costPrice: string;
  salePrice: string;
  qty: string;
}

const initialProductDetails: ProductDetails = {
  barCode: '',
  costPrice: '',
  name: '',
  qty: '',
  salePrice: '',
};

interface CartItem {
  id: number;
  tmptrd_qty: string;
  tmptrd_cost_price: string;
  tmptrd_sale_price: string;
  tmptrd_sub_total: string;
  prod_name: string;
}

interface SelectedCustomer {
  name: string;
  fatherName: string;
  address: string;
}

const initialSelectedCust: SelectedCustomer = {
  address: '',
  fatherName: '',
  name: '',
};

interface SelectedSupplier {
  name: string;
  compnayName: string;
  address: string;
}

const initialSelectedSup: SelectedSupplier = {
  address: '',
  compnayName: '',
  name: '',
};

interface CheckoutDetails {
  costtotal: string;
  saletotal: string;
  profitandloss: string;
  payable: string;
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

interface SupplierArea {
  id: string;
  area_name: string;
}

export default function Trade() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [prodDetails, setProdDetails] = useState<ProductDetails>(
    initialProductDetails,
  );
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [custData, setCustData] = useState<Customers[]>([]);
  const transformedCust = custData.map(cust => ({
    label: cust.cust_name,
    value: cust.id.toString(),
  }));
  const [supData, setSupData] = useState<Supplier[]>([]);
  const transformedSup = supData.map(sup => ({
    label: `${sup.sup_name}_${sup.sup_company_name}`,
    value: sup.id.toString(),
  }));
  const [supOpen, setSupOpen] = useState(false);
  const [supValue, setSupValue] = useState('');
  const [custOpen, setCustOpen] = useState(false);
  const [custValue, setCustValue] = useState('');
  const [selectedCust, setSelectedCust] =
    useState<SelectedCustomer>(initialSelectedCust);
  const [selectedSup, setSelectedSup] =
    useState<SelectedSupplier>(initialSelectedSup);
  const [checkoutDetails, setCheckoutDetails] =
    useState<CheckoutDetails | null>(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [modalVisible, setModalVisible] = useState('');
  const [addForm, setAddForm] = useState<AddCustomer>(initialAddCustomer);
  const [types, setTypes] = useState<TypeData[]>([]);
  const [areaData, setAreaData] = useState<AreaData[]>([]);
  const [custType, setCustType] = useState<string | null>('');
  const [custTypeOpen, setCustTypeOpen] = useState(false);
  const transformedTypes = types.map(item => ({
    label: item.custtyp_name,
    value: item.id,
  }));
  const [custArea, setCustArea] = useState<string | null>('');
  const [custAreaOpen, setCustAreaOpen] = useState(false);
  const transformedAreas = areaData.map(item => ({
    label: item.area_name,
    value: item.id,
  }));
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [supAddForm, setSupAddForm] = useState<AddSupplier>(initialAddSupplier);
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaValue, setAreaValue] = useState('');

  // Add Supplier Form onChange
  const handleAddInputChange = (field: keyof AddSupplier, value: string) => {
    setSupAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add Customer Form On Change
  const onChange = (field: keyof AddCustomer, value: string) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Product Details onChange
  const detailsOnChange = (field: keyof ProductDetails, value: string) => {
    setProdDetails(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const [orderDate, setorderDate] = useState(new Date());
  const [showorderDatePicker, setShoworderDatePicker] = useState(false);

  const onorderDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || orderDate;
    setShoworderDatePicker(false);
    setorderDate(currentDate);
  };

  // Handle Search
  const handleSearch = async (text: string) => {
    setSearchTerm(text);
    if (text.length > 0) {
      try {
        const response = await axios.post(`${BASE_URL}/autocomplete`, {
          term: text,
        });
        setSearchResults(response.data);
        setShowResults(true);
        console.log(response.data);
      } catch (error) {
        console.error('Search failed:', error);
        setShowResults(false);
      }
    } else {
      setShowResults(false);
    }
  };

  // Handle Store Product
  const handleStore = async () => {
    if (!selectedProduct) {
      Toast.show({
        type: 'error',
        text1: 'Select Product First',
      });
      return;
    }

    if (!prodDetails.qty || !prodDetails.salePrice || !prodDetails.costPrice) {
      Toast.show({
        type: 'error',
        text1: 'Please enter quantity, sale price, and cost price',
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/temp_store`, {
        search_name: selectedProduct.value,
        prod_id: selectedProduct.prod_id,
        cond_type: 'Add',
        cost_price: prodDetails.costPrice,
        sale_price: prodDetails.salePrice,
        qty: prodDetails.qty,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Product has been added successfully',
          visibilityTime: 1500,
        });

        setProdDetails(initialProductDetails);
        setSelectedProduct([]);
        setSearchTerm('');
        fetchCartItems();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Cart Items
  const fetchCartItems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/temp_loadproductcart`);
      setCartItems(res.data.cart);
      setCheckoutDetails(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Handle Delete Item from the Cart
  const handleDelete = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/deletetemptrade?id=${id}&_token=${token}`,
      );

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Product has been deleted successfully.',
          visibilityTime: 1500,
        });

        fetchCartItems();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Customer Dropdown
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcustomersdata`);
      setCustData(res.data.cust);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Supplier Dropdown
  const fetchSupplier = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadsuppliers`);
      setSupData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Customer Data
  const fetchCustData = async () => {
    if (custValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchcustdata`, {
          id: custValue,
        });

        setSelectedCust({
          address: res.data.customer.cust_address,
          fatherName: res.data.customer.cust_fathername,
          name: res.data.customer.cust_name,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Fetch Customer Data
  const fetchSupData = async () => {
    if (supValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchsuppdata`, {
          id: supValue,
        });

        setSelectedSup({
          address: res.data.supplier.sup_address,
          compnayName: res.data.supplier.sup_company_name,
          name: res.data.supplier.sup_name,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Handle Checkout
  const handleCheckout = async () => {
    if (!supValue) {
      Toast.show({
        type: 'error',
        text1: 'Please select a supplier',
        visibilityTime: 1500,
      });
      return;
    }
    if (!custValue) {
      Toast.show({
        type: 'error',
        text1: 'Please select a customer',
        visibilityTime: 1500,
      });
      return;
    }
    if (!refNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a reference number',
        visibilityTime: 1500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/checkouttrade`, {
        invoice_no: '',
        ref_no: refNumber.trim(),
        supplier_id: supValue,
        customer_id: custValue,
        cost_price: checkoutDetails?.costtotal,
        totalsale_price: checkoutDetails?.saletotal,
        profit_amount: checkoutDetails?.profitandloss,
        payable: checkoutDetails?.payable,
        paid: paidAmount,
        date: orderDate.toISOString().split('T')[0],
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Checkout successfully',
          visibilityTime: 1500,
        });

        setCheckoutDetails(null);
        await axios.post(`${BASE_URL}/clearCart`);
        fetchCartItems();
        setPaidAmount('');
        setRefNumber('');
        setSupValue('');
        setCustValue('');
      } else if (res.status === 200 && data.status === 409) {
        Toast.show({
          type: 'info',
          text1: 'Warning!',
          text2: 'Paid amount should equal to payable amount!',
          visibilityTime: 1500,
        });
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

  // Fetch Area
  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchareadata`);
      setAreaData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Customer
  const addCustomer = async () => {
    if (
      !addForm.name.trim() ||
      !addForm.contact.trim() ||
      !addForm.address.trim()
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
        sec_contact: addForm.sec_contact,
        third_contact: addForm.third_contact,
        cnic: addForm.cnic.trim(),
        address: addForm.address.trim(),
        cust_type: custType,
        cust_area: custArea,
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
        setModalVisible('');
      }
    } catch (error) {
      console.log();
    }
  };

  // Fetch Supplier Dropdown Area
  const handleFetchAreas = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchareadata`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAreaData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Supplier
  const handleAddSupplier = async () => {
    if (
      !supAddForm.comp_name ||
      !supAddForm.supp_name ||
      !supAddForm.contact ||
      !supAddForm.address
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
        comp_name: supAddForm.comp_name.trim(),
        agencyname: supAddForm.agencyname,
        supp_name: supAddForm.supp_name.trim(),
        contact: supAddForm.contact,
        sec_contact: supAddForm.sec_contact,
        third_contact: supAddForm.third_contact,
        email: supAddForm.email.trim(),
        address: supAddForm.address.trim(),
        supp_area: areaValue,
        alsocust: selectedOptions.includes('on') ? 'on' : '',
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Supplier has been Added successfully',
          visibilityTime: 1500,
        });
        setSupAddForm(initialAddSupplier);
        setSelectedOptions([]);
        setAreaValue('');
        fetchSupplier();
        setModalVisible('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCartItems();
    fetchCustomers();
    fetchSupplier();
    fetchAreas();
    handleFetchAreas();
    fetchCustData();
    fetchSupData();
    fetchType();
  }, [custValue, supValue]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Topbar */}
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
              style={{width: 30, height: 30, tintColor: 'white'}}
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text
              style={{
                color: 'white',
                fontSize: 22,
                fontWeight: 'bold',
              }}>
              Trading
            </Text>
          </View>
        </View>

        <ScrollView
          style={{
            marginBottom: 10,
          }}>
          <View style={styles.section}>
            <View style={styles.row}>
              <TextInput
                style={[styles.input]}
                placeholderTextColor={'white'}
                placeholder="Search Product..."
                value={searchTerm}
                onChangeText={handleSearch}
              />

              {/* Search Result Container */}
              {searchTerm.length > 0 &&
                showResults &&
                searchResults.length > 0 && (
                  <View style={styles.resultsContainer}>
                    {searchResults.map((item: any) => (
                      <TouchableOpacity
                        key={item.prod_id}
                        style={styles.resultItem}
                        onPress={() => {
                          setSearchTerm(item.value);
                          setProdDetails({
                            barCode: item.value,
                            costPrice: item.prod_costprice,
                            name: item.prod_name,
                            qty: '',
                            salePrice: item.prod_price,
                          });
                          setSelectedProduct(item);
                          setShowResults(false);
                        }}>
                        <Text style={styles.resultText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
            </View>

            <View style={styles.row}>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                {prodDetails.name ? prodDetails.name : 'Item Name'}
              </Text>

              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                {prodDetails.barCode ? prodDetails.barCode : 'BarCode'}
              </Text>
            </View>

            <View style={styles.row}>
              <TextInput
                style={styles.inputSmall}
                placeholderTextColor={'white'}
                placeholder="Sale Price"
                keyboardType="numeric"
                value={prodDetails.salePrice}
                onChangeText={t => detailsOnChange('salePrice', t)}
              />
              <TextInput
                style={styles.inputSmall}
                placeholderTextColor={'white'}
                placeholder="Cost Price"
                keyboardType="numeric"
                value={prodDetails.costPrice}
                onChangeText={t => detailsOnChange('costPrice', t)}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholderTextColor={'white'}
                placeholder="Quantity"
                keyboardType="numeric"
                value={prodDetails.qty}
                onChangeText={t => detailsOnChange('qty', t)}
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleStore}>
              <Text
                style={{
                  color: '#144272',
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}>
                Submit
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                Invoice No
              </Text>

              <TextInput
                style={styles.inputSmall}
                placeholder="Reference No"
                placeholderTextColor={'white'}
                value={refNumber}
                onChangeText={t => setRefNumber(t)}
              />
            </View>

            <View style={styles.row}>
              <DropDownPicker
                items={transformedSup}
                open={supOpen}
                setOpen={setSupOpen}
                value={supValue}
                setValue={setSupValue}
                placeholder="Select Supplier"
                placeholderStyle={{color: 'white'}}
                textStyle={{color: 'white'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#fff" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#fff" />
                )}
                style={[styles.dropdown]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '90%',
                  marginTop: 8,
                  maxHeight: 130,
                }}
                labelStyle={{color: 'white'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />

              <TouchableOpacity
                onPress={() => {
                  setModalVisible('AddSupplier');
                }}
                style={{marginLeft: -19}}>
                <Image
                  style={{
                    tintColor: 'white',
                    width: 18,
                    height: 18,
                    alignSelf: 'center',
                  }}
                  source={require('../../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                {selectedSup.name ? selectedSup.name : 'Supplier Name'}
              </Text>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                {selectedSup.compnayName
                  ? selectedSup.compnayName
                  : 'Company Name'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.input, {backgroundColor: 'gray'}]}>
                {selectedSup.address ? selectedSup.address : 'Address'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.row}>
              <DropDownPicker
                items={transformedCust}
                open={custOpen}
                setOpen={setCustOpen}
                value={custValue}
                setValue={setCustValue}
                placeholder="Select Customer"
                placeholderStyle={{color: 'white'}}
                textStyle={{color: 'white'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#fff" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#fff" />
                )}
                style={styles.dropdown}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '90%',
                  marginTop: 8,
                  maxHeight: 130,
                }}
                labelStyle={{color: 'white'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('AddCustomer');
                }}
                style={{marginLeft: -19}}>
                <Image
                  style={{
                    tintColor: 'white',
                    width: 18,
                    height: 18,
                    alignSelf: 'center',
                  }}
                  source={require('../../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                {selectedCust.name ? selectedCust.name : 'Customer Name'}
              </Text>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                {selectedCust.fatherName
                  ? selectedCust.fatherName
                  : 'Father Name'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.input, {backgroundColor: 'gray'}]}>
                {selectedCust.address ? selectedCust.address : 'Address'}
              </Text>
            </View>
          </View>

          <View>
            <FlatList
              data={cartItems}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
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
                        {item.prod_name}
                      </Text>

                      <TouchableOpacity onPress={() => handleDelete(item.id)}>
                        <Icon
                          name="delete"
                          size={20}
                          color="#e57373"
                          style={{
                            marginRight: 10,
                            marginTop: 5,
                            alignSelf: 'center',
                          }}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.rowt}>
                        <Text style={styles.text}>Cost Price:</Text>
                        <Text style={styles.text}>
                          {item.tmptrd_cost_price}
                        </Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={styles.text}>Sale Price:</Text>
                        <Text style={styles.text}>
                          {item.tmptrd_sale_price}
                        </Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={styles.text}>Quantity:</Text>
                        <Text style={styles.text}>{item.tmptrd_qty}</Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={[styles.text, {marginBottom: 5}]}>
                          SubTotal:
                        </Text>
                        <Text style={[styles.text, {marginBottom: 5}]}>
                          {item.tmptrd_sub_total}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
              ListEmptyComponent={
                <View
                  style={{
                    height: 100,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 16,
                    }}>
                    No items found in cart.
                  </Text>
                </View>
              }
            />
          </View>

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                Cost Price: {checkoutDetails?.costtotal ?? '0.00'}
              </Text>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                Sale Price: {checkoutDetails?.saletotal ?? '0.00'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                <Text style={{fontWeight: 'bold'}}>Profit/Loss:</Text>{' '}
                {checkoutDetails?.profitandloss ?? '0.00'}
              </Text>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                Payable: {checkoutDetails?.payable ?? '0.00'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.row}>
              <TextInput
                style={styles.inputSmall}
                placeholder="Paid"
                placeholderTextColor={'white'}
                keyboardType="numeric"
                value={paidAmount}
                onChangeText={t => setPaidAmount(t)}
              />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  width: '46%',
                  borderRightWidth: 1,
                  borderLeftWidth: 1,
                  borderRadius: 5,
                  borderColor: 'white',
                  height: 38,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 5,
                    borderColor: 'white',
                    paddingHorizontal: 10,
                  }}>
                  <Text style={{color: 'white'}}>
                    {`${orderDate.toLocaleDateString()}`}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setShoworderDatePicker(true)}
                    style={{padding: 5, marginLeft: 35}}>
                    <Icon name="calendar-today" size={22} color="white" />
                  </TouchableOpacity>
                  {showorderDatePicker && (
                    <DateTimePicker
                      testID="startDatePicker"
                      value={orderDate}
                      mode="date"
                      is24Hour={true}
                      display="default"
                      onChange={onorderDateChange}
                    />
                  )}
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              handleCheckout();
            }}>
            <View
              style={{
                width: '90%',
                height: 38,
                backgroundColor: 'white',
                borderRadius: 10,
                alignSelf: 'center',
                justifyContent: 'center',
                marginTop: 15,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#144272',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}>
                Check Out
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/*Add Customer Modal*/}
        <Modal isVisible={modalVisible === 'AddCustomer'}>
          <ScrollView
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
                Add New Customer
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setAddForm(initialAddCustomer);
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

            <View style={[styles.row, {paddingHorizontal: 10}]}>
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

            <View style={[styles.row, {paddingHorizontal: 10}]}>
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

            <View style={[styles.row, {paddingHorizontal: 10}]}>
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

            <View style={[styles.row, {paddingHorizontal: 10}]}>
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
                paddingHorizontal: 10,
              }}>
              <DropDownPicker
                items={transformedTypes}
                open={custTypeOpen}
                setOpen={setCustTypeOpen}
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
                  {borderColor: '#144272', width: '100%'},
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '100%',
                  zIndex: 1000,
                  marginTop: 8,
                  maxHeight: 120,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />
            </View>

            {/* Customer Area Dropdown */}
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 10,
              }}>
              <DropDownPicker
                items={transformedAreas}
                open={custAreaOpen}
                setOpen={setCustAreaOpen}
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
                    width: '100%',
                    zIndex: 999,
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '100%',
                  marginTop: 8,
                  maxHeight: 120,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
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

        {/*Add Supplier Modal*/}
        <Modal isVisible={modalVisible === 'AddSupplier'}>
          <ScrollView
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
                Add New Supplier
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setSupAddForm(initialAddSupplier);
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

            <View style={[styles.row, {paddingHorizontal: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Company Name"
                value={supAddForm.comp_name}
                onChangeText={text => handleAddInputChange('comp_name', text)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Agency Name"
                value={supAddForm.agencyname}
                onChangeText={text => handleAddInputChange('agencyname', text)}
              />
            </View>

            <View style={[styles.row, {paddingHorizontal: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Supplier Name"
                value={supAddForm.supp_name}
                onChangeText={text => handleAddInputChange('supp_name', text)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 1"
                keyboardType="numeric"
                value={supAddForm.contact}
                onChangeText={text => handleAddInputChange('contact', text)}
              />
            </View>

            <View style={[styles.row, {paddingHorizontal: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 2"
                keyboardType="numeric"
                value={supAddForm.sec_contact}
                onChangeText={text => handleAddInputChange('sec_contact', text)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 3"
                keyboardType="numeric"
                value={supAddForm.third_contact}
                onChangeText={text =>
                  handleAddInputChange('third_contact', text)
                }
              />
            </View>

            <View style={[styles.row, {paddingHorizontal: 10}]}>
              <TextInput
                style={[styles.productinput, {width: '100%'}]}
                placeholderTextColor={'#144272'}
                placeholder="Address"
                value={supAddForm.address}
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
                    width: '100%',
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '100%',
                  zIndex: 1000,
                  marginTop: 8,
                  maxHeight: 130,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
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
  section: {
    borderColor: 'white',
    height: 'auto',
    borderRadius: 12,
    elevation: 15,
    padding: 10,
    paddingHorizontal: 15,
  },
  row: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    color: 'white',
    height: 38,
    width: '100%',
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    height: 38,
    width: '46%',
    color: '#fff',
  },
  addButton: {
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
    width: '100%',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 38,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '90%',
  },
  productinput: {
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
    height: 38,
    width: '46%',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  rowt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    backgroundColor: 'white',
  },
  infoRow: {
    marginTop: 5,
  },
  resultsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 5,
    zIndex: 100,
    elevation: 10,
    maxHeight: 'auto',
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  resultText: {
    color: '#144272',
  },
});
