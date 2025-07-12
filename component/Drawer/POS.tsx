import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
import {RadioButton} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import {useUser} from '../CTX/UserContext';

interface Customers {
  id: number;
  cust_name: string;
  cust_fathername: string;
  cust_address: string;
}

interface CustomersData {
  name: string;
  contact: string;
  address: string;
}

const initialCustomersData: CustomersData = {
  address: '',
  contact: '',
  name: '',
};

interface Labour {
  id: number;
  labr_name: string;
}

interface CartItem {
  product_name: string;
  prod_id: number;
  retail_price: string;
  fretail_price: string;
  cost_price: string;
  qty: string;
  discount: string;
}

interface BuiltyAddress {
  builtyAdd: string;
  builtyCont: string;
  freight: string;
  labourExpanse: string;
}

const initialBuiltyAddress: BuiltyAddress = {
  builtyAdd: '',
  builtyCont: '',
  freight: '',
  labourExpanse: '',
};

interface SingleInvoice {
  config: {
    bus_name: string;
    bus_address: string;
    bus_contact1: string;
  };
  sale: {
    cust_name: string;
    name: string;
    slcust_address: string;
    sal_builty_contact: string;
    sal_builty_address: string;
    contact: string;
    sal_change_amount: string;
    created_at: string;
    sal_freight_exp: string;
    sal_labr_exp: string;
    sal_discount: string;
    sal_payment_amount: string;
    sal_total_amount: string;
    sal_order_total: string;
    note: string;
  };
  prev_balance: string;
}

interface InvoiceSaleDetails {
  prod_name: string;
  sald_qty: string;
  sald_fretail_price: string;
  sald_total_fretailprice: string;
  ums_name: string;
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

export default function POS() {
  const {token} = useUser();
  const paidInputRef = React.useRef<TextInput>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodName, setProdName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [custDropdown, setCustDropdown] = useState<Customers[]>([]);
  const transformedCust = custDropdown.map(cust => ({
    label: `${cust.cust_name} s/o ${cust.cust_fathername} | ${cust.cust_address}`,
    value: cust.id.toString(),
  }));
  const [custData, setCustData] = useState<CustomersData>(initialCustomersData);
  const [labDropdown, setLabDropdown] = useState<Labour[]>([]);
  const transformedLab = labDropdown.map(lab => ({
    label: lab.labr_name,
    value: lab.id.toString(),
  }));
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [builty, setBuilty] = useState<BuiltyAddress>(initialBuiltyAddress);
  const [orderTotal, setOrderTotal] = useState('');
  const [discount, setDiscount] = useState('');
  const [prevBalance, setPrevBalance] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paid, setPaid] = useState('');
  const [netPayable, setNetPayable] = useState(0);
  const [balance, setBalance] = useState(0);
  const [selectedCust, setSelectedCust] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState('');
  const [note, setNote] = useState('');
  const [invoiceData, setInvoiceData] = useState<SingleInvoice | null>(null);
  const [selectedInvc, setSelectedInvc] = useState('');
  const [invcSaleDetails, setInvcSaleDetails] = useState<InvoiceSaleDetails[]>(
    [],
  );
  const [addForm, setAddForm] = useState<AddCustomer>(initialAddCustomer);
  const [custTypeOpen, setCustTypeOpen] = useState(false);
  const [custType, setCustType] = useState<string | null>('');
  const [types, setTypes] = useState<TypeData[]>([]);
  const transformedTypes = types.map(item => ({
    label: item.custtyp_name,
    value: item.id,
  }));
  const [areaData, setAreaData] = useState<AreaData[]>([]);
  const [custArea, setCustArea] = useState<string | null>('');
  const [custAreaOpen, setCustAreaOpen] = useState(false);
  const transformedAreas = areaData.map(item => ({
    label: item.area_name,
    value: item.id,
  }));

  // Add Customer Form On Change
  const onChange = (field: keyof AddCustomer, value: string) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const builtyOnChange = (field: keyof BuiltyAddress, value: string) => {
    setBuilty(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<string | null>('');
  const [uomItems, setUomItems] = useState<{label: string; value: string}[]>(
    [],
  );

  const [Open, setOpen] = useState(false);
  const [currentVal, setCurrentVal] = useState<string | null>('');

  const [Labour, setLabour] = useState(false);
  const [currentLabour, setCurrentLabour] = useState<string | null>('');

  const {openDrawer} = useDrawer();
  const [discountType, setDiscountType] = React.useState<'cash' | 'percent'>(
    'cash',
  );

  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const [addproduct, setaddproduct] = useState(false);

  const toggleproduct = () => {
    setaddproduct(!addproduct);
  };

  {
    /*customer*/
  }
  const [customer, setcustomer] = useState(false);

  const togglecustomer = () => {
    setcustomer(!customer);
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
      } catch (error) {
        console.error('Search failed:', error);
        setShowResults(false);
      }
    } else {
      setShowResults(false);
    }
  };

  // Fetch Selected Item's UMO
  const handleAddToCart = async () => {
    if (!selectedProduct) {
      Toast.show({
        type: 'error',
        text1: 'Please select a product first',
      });
      return;
    }

    if (!quantity) {
      Toast.show({
        type: 'error',
        text1: 'Please enter quantity',
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addtocart`, {
        search_name: selectedProduct.value,
        prod_id: selectedProduct.prod_id,
        qty: quantity,
        uom: currentValue,
        unitprice: price,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Product added successfully to the cart.',
          visibilityTime: 1500,
        });
        loadCartItems();
        setSearchTerm('');
        setQuantity('');
        setPrice('');
        setShowResults(false);
        setSelectedProduct(null);
        setProdName('');
        setProdStock('');
        setCurrentValue('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Customer dropdown
  const fetchCustDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchdropcustomer`);
      setCustDropdown(res.data.customers);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Customer Data
  const fetchCustData = async () => {
    if (currentVal) {
      try {
        const res = await axios.get(
          `${BASE_URL}/fetchcustinfo?id=${currentVal}&_token=%7B%7Bcsrf_token()%7D%7D`,
        );

        setCustData({
          name: res.data.cust_name,
          contact: res.data.cust_contact,
          address: res.data.cust_address,
        });

        setBuilty({
          builtyCont: res.data.cust_contact,
          builtyAdd: res.data.cust_address,
          freight: '0',
          labourExpanse: '0',
        });

        setSelectedCust(res.data);

        fetchPrevBal(res.data.id);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Fetch Labour Dropdown
  const fetchLabDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchlaboursdropdown`);
      setLabDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Cart Plus Minus function
  const plusCart = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/plusincart?id=${id}&_token=${token}`,
      );
      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        loadCartItems();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const minusCart = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/minusfromcart?id=${id}&_token=${token}`,
      );
      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        loadCartItems();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Remove from the cart
  const removeFromCart = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/removefromcart?id=${id}&_token=%7B%7Bcsrf_token()%7D%7D`,
      );
      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        loadCartItems();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Cart Items
  const loadCartItems = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/loadcart?freight=${builty.freight}&labour=${builty.labourExpanse}&_token=%7B%7Bcsrf_token()%7D%7D`,
      );

      const cartItems = Object.values(res.data.cartsession).map(
        (item: any) => ({
          ...item,
          total: (
            parseFloat(item.fretail_price) * parseFloat(item.qty)
          ).toString(),
        }),
      );

      setCartItems(cartItems);

      if (res.data.order_total) {
        setOrderTotal(res.data.order_total);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Previous Data
  const fetchPrevBal = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/loadpreviousbalance?cust_id=${id}&_token=${token}`,
      );
      setPrevBalance(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Invoice
  const singleInvc = async (inv: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/invoiceprint`, {
        invoice: inv,
      });

      setInvoiceData(res.data);
      setInvcSaleDetails(res.data.saledetail);
    } catch (error) {
      console.log();
    }
  };

  // Sales Checkout
  const saleCheckout = async () => {
    // Enhanced validation

    if (!selectedCust) {
      Toast.show({
        type: 'error',
        text1: 'Please select a customer',
      });
      return;
    }

    if (!cartItems.length) {
      Toast.show({
        type: 'error',
        text1: 'Cart is empty',
      });
      return;
    }

    // Convert values to numbers for validation
    const paidValue = Number(paid);
    const orderTotalValue = Number(orderTotal);
    const discountAmountValue = Number(discountAmount);
    const prevBalanceValue = Number(prevBalance);

    // Enhanced number validation
    if (isNaN(paidValue) || paidValue < 0) {
      Toast.show({
        type: 'error',
        text1:
          paidValue < 0
            ? 'Paid amount cannot be negative'
            : 'Please enter a valid paid amount',
      });
      return;
    }

    if (isNaN(orderTotalValue) || orderTotalValue <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Order total is invalid',
      });
      return;
    }

    try {
      // Prepare payload with proper data types
      const payload = {
        cust_id: selectedCust.id,
        order_total: orderTotalValue,
        net_payable: netPayable,
        discount_amount: discountAmountValue,
        payment_amount: paidValue, // Use numeric value
        builty_contact: builty.builtyCont,
        builty_address: builty.builtyAdd,
        freight_exp: Number(builty.freight) || 0,
        labour_exp: Number(builty.labourExpanse) || 0,
        cust_contact: selectedCust.cust_contact,
        cust_name: selectedCust.cust_name,
        cust_address: selectedCust.cust_address,
        labour_id: currentLabour,
        prev_balance: prevBalanceValue,
        payment_method: 'Cash',
        sale_tax: 0.0, // Send as number instead of string
        note: note || '', // Ensure it's never undefined
        holdinput: '',
      };

      const res = await axios.post(`${BASE_URL}/salecheckout`, payload);

      const data = res.data;

      if (res.status === 200 && data.status) {
        Toast.show({
          type: 'success',
          text1: 'Sale completed successfully',
        });

        try {
          await axios.get(`${BASE_URL}/emptycart`);
        } catch (err) {
          console.log('Failed to empty cart:', err);
        }

        setSelectedInvc(res.data.invoice_no);
        singleInvc(res.data.invoice_no);
        setModalVisible('View');

        // Reset states
        setSelectedCust(null);
        setBuilty(initialBuiltyAddress);
        setCurrentLabour('');
        setSearchTerm('');
        setCartItems([]);
        setOrderTotal(''); // Reset to number instead of string
        setDiscount('');
        setPrevBalance(''); // Reset to number instead of string
        setDiscountAmount(0);
        setPaid('');
        setNetPayable(0);
        setBalance(0);
        setProdName('');
        setProdStock('');
        setSelectedProduct(null);
        setQuantity('');
        setPrice('');
        setUomItems([]);
        setCurrentVal('');
        setNote(''); // Reset note if exists
      } else {
        // Handle backend validation errors
        Toast.show({
          type: 'error',
          text1: 'Checkout failed',
          text2: data.message || 'Please check your data',
        });
      }
    } catch (error: any) {
      // Enhanced error logging
      console.error('Checkout error:', error.response?.data || error.message);

      Toast.show({
        type: 'error',
        text1: 'Sale checkout failed',
        text2: error.response?.data?.message || 'Please try again.',
      });
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

  // Fetch Type
  const fetchType = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchtypedata`);
      setTypes(res.data);
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
        fetchCustDropdown();
        setAddForm(initialAddCustomer);
        setCustArea('');
        setCustType('');
        setModalVisible('');
      }
    } catch (error) {
      console.log();
    }
  };

  useEffect(() => {
    fetchCustDropdown();
    fetchCustData();
    fetchLabDropdown();
    fetchType();
    loadCartItems();
    fetchAreas();

    const discountValue = parseFloat(discount) || 0;
    let calculatedDiscount = 0;
    if (discountType === 'cash') {
      calculatedDiscount = Math.min(discountValue, Number(orderTotal));
    } else {
      calculatedDiscount = Math.min(
        (discountValue / 100) * Number(orderTotal),
        Number(orderTotal),
      );
    }
    setDiscountAmount(calculatedDiscount);

    // Calculate net payable (order total - discount + previous balance)
    const calculatedNetPayable =
      Number(orderTotal) - calculatedDiscount + prevBalance;
    setNetPayable(Number(calculatedNetPayable));

    // Parse paid value (default to 0 if invalid)
    const paidValue = parseFloat(paid) || 0;

    // Calculate balance (net payable - paid amount)
    const calculatedBalance = Number(calculatedNetPayable) - paidValue;
    setBalance(calculatedBalance);
  }, [currentVal, orderTotal, prevBalance, discount, discountType, paid]);

  // Add this CartItemComponent in your POS component
  const CartItemComponent = ({item}: {item: CartItem}) => (
    <View style={styles.cartItemContainer}>
      <View style={styles.details}>
        <Text style={styles.name}>{item.product_name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>Price {item.retail_price}</Text>
          {Number(item.discount) > 0 && (
            <Text style={styles.discount}>-{item.discount}%</Text>
          )}
        </View>
        <Text style={styles.unitPrice}>Unit: Rs. {item.cost_price}</Text>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          onPress={() => {
            minusCart(item.prod_id);
          }}
          style={styles.quantityButton}>
          <Text style={styles.quantityText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.quantity}>{item.qty}</Text>

        <TouchableOpacity
          onPress={() => {
            plusCart(item.prod_id);
          }}
          style={styles.quantityButton}>
          <Text style={styles.quantityText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            removeFromCart(item.prod_id);
          }}
          style={styles.deleteButton}>
          <Icon name="delete" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.total}>
        Rs. {Number(item.fretail_price) * Number(item.qty)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/screen.jpg')}
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
              POS
            </Text>
          </View>
          <TouchableOpacity onPress={toggleModal}>
            <Image
              source={require('../../assets/dots.png')}
              style={{
                width: 22,
                height: 22,
                tintColor: 'white',
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Search Result Container */}
        {searchTerm.length > 0 && showResults && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            {searchResults.map((item: any) => (
              <TouchableOpacity
                key={item.prod_id}
                style={styles.resultItem}
                onPress={() => {
                  setSearchTerm(item.value);
                  setProdName(item.prod_name);
                  setSelectedProduct(item);
                  // Prepare UOM options
                  const uomOptions = [
                    {label: item.ums_name, value: item.ums_name},
                  ];

                  if (item.prod_have_sub_uom === 'Y' && item.prod_sub_uom) {
                    uomOptions.push({
                      label: item.prod_sub_uom,
                      value: item.prod_sub_uom,
                    });
                  }
                  setProdStock(item.prod_qty);
                  setUomItems(uomOptions);
                  setCurrentValue(item.ums_name); // Default to main UOM
                  setQuantity('1');
                  setPrice(item.prod_price);
                  setShowResults(false);
                }}>
                <Text style={styles.resultText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView
          style={{
            marginBottom: 10,
          }}>
          <View
            style={{
              padding: 12,
            }}>
            <View style={styles.section}>
              <Text style={styles.label}>Search Product By Name/Barcode</Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <TextInput
                  style={[styles.input]}
                  placeholderTextColor={'white'}
                  placeholder="Search Product..."
                  value={searchTerm}
                  onChangeText={handleSearch}
                />

                <TouchableOpacity onPress={toggleproduct}>
                  <Image
                    style={{
                      tintColor: 'white',
                      width: 22,
                      height: 17,
                      alignSelf: 'center',
                      marginLeft: 5,
                      marginTop: 18,
                    }}
                    source={require('../../assets/add.png')}
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.row, {alignItems: 'center'}]}>
                <TextInput
                  style={[styles.inputSmall, {backgroundColor: 'gray'}]}
                  placeholderTextColor={'white'}
                  placeholder="Product"
                  value={prodName}
                  onChangeText={t => setProdName(t)}
                  editable={false}
                />

                <TextInput
                  style={[styles.inputSmall, {backgroundColor: 'gray'}]}
                  placeholderTextColor={'white'}
                  placeholder="Stock"
                  value={prodStock}
                  onChangeText={t => setProdStock(t)}
                  editable={false}
                />
              </View>

              <View style={styles.row}>
                <DropDownPicker
                  open={isOpen}
                  value={currentValue}
                  items={uomItems}
                  setOpen={setIsOpen}
                  setValue={setCurrentValue}
                  placeholder="UOM"
                  placeholderStyle={{color: 'white'}}
                  textStyle={{color: 'white'}}
                  ArrowUpIconComponent={() => (
                    <Icon name="keyboard-arrow-up" size={18} color="white" />
                  )}
                  ArrowDownIconComponent={() => (
                    <Icon name="keyboard-arrow-down" size={18} color="white" />
                  )}
                  style={[styles.dropdown]}
                  dropDownContainerStyle={{
                    backgroundColor: 'white',
                    borderColor: '#144272',
                    width: '100%',
                  }}
                  labelStyle={{color: 'white'}}
                  listMode="SCROLLVIEW"
                  listItemLabelStyle={{color: '#144272'}}
                  onChangeValue={value => {
                    if (selectedProduct) {
                      if (value === selectedProduct.ums_name) {
                        setPrice(selectedProduct.prod_price);
                      } else if (value === selectedProduct.prod_sub_uom) {
                        setPrice(selectedProduct.prod_sub_price);
                      }
                    }
                  }}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={styles.inputSmall}
                  placeholderTextColor={'white'}
                  placeholder="Quantity"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={t => setQuantity(t)}
                />
                <TextInput
                  style={styles.inputSmall}
                  placeholderTextColor={'white'}
                  placeholder="Unit Price"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={t => setPrice(t)}
                />
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddToCart}>
                  <Text
                    style={{
                      color: '#144272',
                      fontSize: 14,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Customer</Text>

              <View
                style={{
                  flexDirection: 'row',
                }}>
                <DropDownPicker
                  items={transformedCust}
                  open={Open}
                  setOpen={setOpen}
                  value={currentVal}
                  setValue={setCurrentVal}
                  placeholder="Select Customer"
                  placeholderStyle={{color: 'white'}}
                  textStyle={{color: 'white'}}
                  ArrowUpIconComponent={() => (
                    <Icon name="keyboard-arrow-up" size={18} color="#fff" />
                  )}
                  ArrowDownIconComponent={() => (
                    <Icon name="keyboard-arrow-down" size={18} color="#fff" />
                  )}
                  style={[styles.dropdown, {width: '90%'}]}
                  dropDownContainerStyle={{
                    backgroundColor: 'white',
                    borderColor: '#144272',
                    width: '90%',
                    maxHeight: 120,
                    marginTop: 8,
                  }}
                  labelStyle={{color: 'white'}}
                  listItemLabelStyle={{color: '#144272'}}
                  listMode="SCROLLVIEW"
                />
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('AddCustomer');
                  }}>
                  <Image
                    style={{
                      tintColor: 'white',
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

              <View style={styles.row}>
                <TextInput
                  style={[styles.inputSmall, {backgroundColor: 'gray'}]}
                  placeholderTextColor={'white'}
                  placeholder="Name"
                  value={custData.name}
                  onChangeText={t => setCustData(prev => ({...prev, name: t}))}
                  editable={false}
                />
                <TextInput
                  style={[styles.inputSmall, {backgroundColor: 'gray'}]}
                  placeholderTextColor={'white'}
                  placeholder="Contact#"
                  keyboardType="phone-pad"
                  value={custData.contact}
                  onChangeText={t =>
                    setCustData(prev => ({...prev, contact: t}))
                  }
                  editable={false}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[
                    styles.inputSmall,
                    {backgroundColor: 'gray', width: '100%'},
                  ]}
                  placeholderTextColor={'white'}
                  placeholder="Address"
                  editable={false}
                  value={custData.address}
                  onChangeText={t =>
                    setCustData(prev => ({...prev, address: t}))
                  }
                />
              </View>
            </View>

            <View style={[styles.section, {marginBottom: 10}]}>
              <Text style={styles.label}>Builty Address</Text>

              <View style={styles.row}>
                <DropDownPicker
                  items={transformedLab}
                  open={Labour}
                  setOpen={setLabour}
                  value={currentLabour}
                  setValue={setCurrentLabour}
                  placeholder="Select Labour"
                  placeholderStyle={{color: 'white'}}
                  textStyle={{color: currentVal ? 'white' : 'white'}}
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
                    width: '100%',
                    marginTop: 8,
                    maxHeight: 130,
                  }}
                  labelStyle={{color: 'white'}}
                  listItemLabelStyle={{color: '#144272'}}
                  listMode="SCROLLVIEW"
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, {width: '46%'}]}
                  placeholderTextColor={'white'}
                  placeholder="Builty Address"
                  value={builty.builtyAdd}
                  onChangeText={t => builtyOnChange('builtyAdd', t)}
                />
                <TextInput
                  style={styles.inputSmall}
                  placeholderTextColor={'white'}
                  placeholder="Builty Contact#"
                  keyboardType="phone-pad"
                  value={builty.builtyCont}
                  onChangeText={t => builtyOnChange('builtyCont', t)}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={styles.inputSmall}
                  placeholderTextColor={'white'}
                  placeholder="Freight Charges"
                  keyboardType="numeric"
                  value={builty.freight}
                  onChangeText={t => builtyOnChange('freight', t)}
                />
                <TextInput
                  style={styles.inputSmall}
                  placeholder="Labour Expense"
                  keyboardType="numeric"
                  placeholderTextColor="white"
                  value={builty.labourExpanse}
                  onChangeText={t => builtyOnChange('labourExpanse', t)}
                />
              </View>
            </View>

            <View style={[styles.section, {maxHeight: hp('25%')}]}>
              <Text style={styles.label}>Cart Items</Text>
              <FlatList
                data={cartItems}
                keyExtractor={item => item.prod_id.toString()}
                renderItem={({item}) => <CartItemComponent item={item} />}
                ListEmptyComponent={
                  <Text style={{color: 'white', textAlign: 'center'}}>
                    Your cart is empty
                  </Text>
                }
                scrollEnabled={false}
              />
            </View>

            <ScrollView style={styles.section}>
              <Text style={styles.label}>Order Summary</Text>

              <Text style={{color: 'white', fontSize: 14, marginVertical: 5}}>
                Order Total: {Number(orderTotal).toFixed(2)}
              </Text>

              <TextInput
                style={styles.input}
                placeholderTextColor={'white'}
                placeholder="Discount"
                keyboardType="numeric"
                value={discount}
                onChangeText={setDiscount}
              />

              <View style={[styles.row, {justifyContent: 'space-around'}]}>
                <View
                  style={{
                    width: '25%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <RadioButton
                    value="cash"
                    status={discountType === 'cash' ? 'checked' : 'unchecked'}
                    color="white"
                    uncheckedColor="white"
                    onPress={() => setDiscountType('cash')}
                  />
                  <Text style={{color: 'white', marginTop: 7}}>Cash</Text>
                </View>

                <View
                  style={{
                    width: '25%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <RadioButton
                    value="percent"
                    color="white"
                    uncheckedColor="white"
                    status={
                      discountType === 'percent' ? 'checked' : 'unchecked'
                    }
                    onPress={() => setDiscountType('percent')}
                  />
                  <Text style={{color: 'white', marginTop: 7}}>%age</Text>
                </View>
              </View>

              <View style={styles.row}>
                <Text
                  style={{
                    color: 'white',
                    marginVertical: 10,
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}>
                  {discountAmount.toFixed(2)}
                </Text>
              </View>

              <Text style={{color: 'white', fontSize: 14, marginVertical: 5}}>
                Pre. Balance: {Number(prevBalance).toFixed(2)}
              </Text>

              <Text style={{color: 'white', fontSize: 14}}>
                Net Payable: {netPayable.toFixed(2)}
              </Text>

              <TextInput
                ref={paidInputRef}
                style={styles.input}
                placeholder="Paid"
                keyboardType="numeric"
                placeholderTextColor={'white'}
                value={paid}
                onChangeText={setPaid}
              />

              <Text style={{color: 'white'}}>
                Balance: {balance.toFixed(2)}
              </Text>

              <View style={styles.row}>
                <TextInput
                  style={[
                    styles.input,
                    {height: 100, textAlignVertical: 'top'},
                  ]}
                  placeholder="Note"
                  placeholderTextColor={'#fff'}
                  value={note}
                  onChangeText={t => setNote(t)}
                  numberOfLines={3}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={styles.completeButton}
                onPress={saleCheckout}>
                <Text
                  style={{
                    color: '#144272',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}>
                  Complete
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ScrollView>

        {/* Invoice Modal */}
        <Modal
          visible={modalVisible === 'View'}
          animationType="slide"
          transparent={true}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.title}>Sale Invoice :</Text>
              <ScrollView>
                <Text style={styles.shopName}>
                  {invoiceData?.config.bus_name}
                </Text>
                <Text style={styles.shopAddress}>
                  {invoiceData?.config?.bus_address}
                </Text>
                <Text style={styles.phone}>
                  {invoiceData?.config?.bus_contact1}
                </Text>

                <View style={styles.modalRow}>
                  <Text>Receipt#: {selectedInvc}</Text>
                  <Text>
                    {invoiceData?.sale.created_at
                      ? new Date(
                          invoiceData.sale.created_at,
                        ).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : ''}
                  </Text>
                </View>

                <Text>Cashier: {invoiceData?.sale?.name}</Text>
                <Text>
                  Builty Contact #: {invoiceData?.sale?.sal_builty_contact}
                </Text>
                <Text>
                  Builty Address: {invoiceData?.sale?.sal_builty_address}
                </Text>
                <Text>Customer: {invoiceData?.sale?.cust_name}</Text>
                <Text>Contact #: {invoiceData?.sale?.contact}</Text>
                <Text>Address: {invoiceData?.sale?.slcust_address}</Text>

                <View style={styles.tableHeader}>
                  <Text style={styles.cell}>Description</Text>
                  <Text style={styles.cell}>Qty</Text>
                  <Text style={styles.cell}>UOM</Text>
                  <Text style={styles.cell}>Price</Text>
                  <Text style={styles.cell}>Total</Text>
                </View>

                <FlatList
                  data={invcSaleDetails}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({item, index}) => (
                    <View style={styles.tableRow}>
                      <Text style={styles.cell}>{item.prod_name}</Text>
                      <Text style={styles.cell}>{item.sald_qty}</Text>
                      <Text style={styles.cell}>{item.ums_name}</Text>
                      <Text style={styles.cell}>
                        {parseFloat(item.sald_fretail_price).toFixed(2)}
                      </Text>
                      <Text style={styles.cell}>
                        {parseFloat(item.sald_total_fretailprice).toFixed(2)}
                      </Text>
                    </View>
                  )}
                  scrollEnabled={false}
                />

                <View style={styles.totalRow}>
                  <Text style={{fontWeight: 'bold'}}>Total Items</Text>
                  <Text>{invcSaleDetails.length}</Text>
                  <Text>
                    {invcSaleDetails
                      .reduce(
                        (sum, item) =>
                          sum + parseFloat(item.sald_total_fretailprice || '0'),
                        0,
                      )
                      .toFixed(2)}
                  </Text>
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Freight: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_freight_exp}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Labour: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_labr_exp}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>T.Order </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_order_total}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Discount: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_discount}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Pre.Bal: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.prev_balance}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Payable: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_total_amount}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Paid: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_payment_amount}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Balance: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.sal_change_amount}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomRowTxt}>Note: </Text>
                  <Text style={styles.bottomRowTxt}>
                    {invoiceData?.sale?.note ?? 'NILL'}
                  </Text>
                </View>

                <Text style={styles.footerText}>
                  Software Developed with love by{'\n'}TechnicMentors
                </Text>

                <Text style={styles.printIcon}>🖨 Print</Text>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setModalVisible('');
                    setInvoiceData(null);
                    setInvcSaleDetails([]);
                    setSelectedInvc('');
                  }}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/*Add Customer Modal*/}
        <Modal
          visible={modalVisible === 'AddCustomer'}
          transparent
          animationType="slide">
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)', // optional dim background
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ScrollView
              style={{
                backgroundColor: 'white',
                width: '95%',
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
                    source={require('../../assets/cross.png')}
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.row, {paddingHorizontal: 10}]}>
                <TextInput
                  style={[styles.inputSmall, {borderColor: '#144272', color: '#144272'}]}
                  placeholderTextColor={'#144272'}
                  placeholder="Customer Name"
                  value={addForm.name}
                  onChangeText={t => onChange('name', t)}
                />
                <TextInput
                  style={[styles.inputSmall, {borderColor: '#144272', color: '#144272'}]}
                  placeholderTextColor={'#144272'}
                  placeholder="Father Name"
                  value={addForm.father_name}
                  onChangeText={t => onChange('father_name', t)}
                />
              </View>

              <View style={[styles.row, {paddingHorizontal: 10}]}>
                <TextInput
                  style={[styles.inputSmall, {borderColor: '#144272', color: '#144272'}]}
                  placeholderTextColor={'#144272'}
                  placeholder="Email"
                  value={addForm.email}
                  onChangeText={t => onChange('email', t)}
                />
                <TextInput
                  style={[styles.inputSmall, {borderColor: '#144272', color: '#144272'}]}
                  placeholderTextColor={'#144272'}
                  placeholder="Address"
                  value={addForm.address}
                  onChangeText={t => onChange('address', t)}
                />
              </View>

              <View style={[styles.row, {paddingHorizontal: 10}]}>
                <TextInput
                  style={[styles.inputSmall, {borderColor: '#144272', color: '#144272'}]}
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
                  style={[styles.inputSmall, {borderColor: '#144272', color: '#144272'}]}
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
                  style={[styles.inputSmall, {borderColor: '#144272', color: '#144272'}]}
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
                  style={[styles.inputSmall, {borderColor: '#144272', color: '#144272'}]}
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
                    <Icon
                      name="keyboard-arrow-down"
                      size={18}
                      color="#144272"
                    />
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

              <TouchableOpacity
                onPress={() => {
                  addCustomer();
                }}>
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
  section: {
    borderColor: 'white',
    height: 'auto',
    borderRadius: 12,
    elevation: 15,
    marginBottom: 5,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    color: 'white',
    height: 38,
    width: '90%',
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    color: '#fff',
    height: 38,
    width: '46%',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  addButton: {
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    height: 38,
    marginTop: 10,
  },
  completeButton: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 8,
    width: '90%',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 38,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '100%',
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
  text: {
    marginLeft: 15,
    color: '#144272',
    marginRight: 15,
  },
  value: {
    marginLeft: 15,
    color: '#144272',
    marginRight: 15,
  },
  infoRow: {
    marginTop: 5,
  },
  productinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
  },
  resultsContainer: {
    position: 'absolute',
    top: 135,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 5,
    zIndex: 100,
    elevation: 10,
    maxHeight: 'auto',
    marginHorizontal: 20,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  resultText: {
    color: '#144272',
  },

  // Cart component styling
  cartItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  details: {
    flex: 2,
  },
  name: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    color: 'white',
    fontSize: 12,
  },
  discount: {
    color: '#FF5252',
    fontSize: 12,
    marginLeft: 8,
  },
  unitPrice: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  quantityButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: 'white',
    fontSize: 18,
    lineHeight: 20,
  },
  quantity: {
    color: 'white',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  total: {
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },

  // Invoice Modal Styling
  //Modal Styling
  centeredView: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    maxHeight: '80%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shopAddress: {
    textAlign: 'center',
    fontWeight: '600',
  },
  phone: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableHeader: {
    flexDirection: 'row',
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  footerText: {
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  printIcon: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#6666cc',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bottomRow: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    marginTop: 10,
  },
  bottomRowTxt: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
