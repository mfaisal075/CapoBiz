import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Animated,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import {useDrawer} from '../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import {useUser} from '../CTX/UserContext';
import RNPrint from 'react-native-print';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../Colors';

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
  const {bussName, bussAddress, bussContact} = useUser();
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

  // Cart Animation
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<string | null>('');
  const [uomItems, setUomItems] = useState<{label: string; value: string}[]>(
    [],
  );
  const [Open, setOpen] = useState(false);
  const [currentVal, setCurrentVal] = useState<string | ''>('');
  const [currentLabour, setCurrentLabour] = useState<string | null>('');
  const {openDrawer} = useDrawer();
  const [discountType, setDiscountType] = React.useState<'cash' | 'percent'>(
    'cash',
  );

  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  // Cart animation effect
  const animateCartIcon = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
      const formData = new FormData();
      formData.append('search_name', selectedProduct.value);
      formData.append('prod_id', selectedProduct.prod_id);
      formData.append('qty', selectedProduct.prod_qty);
      formData.append('uom', currentValue);
      formData.append('qty', quantity);
      formData.append('unitprice', price);

      console.log(formData);

      const res = await axios.post(`${BASE_URL}/addtocart`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
        animateCartIcon(); // Add animation when item is added
        setSearchTerm('');
        setQuantity('');
        setPrice('');
        setShowResults(false);
        setSelectedProduct(null);
        setProdName('');
        setProdStock('');
        setCurrentValue('');
      } else if (res.status === 200 && data.status === 100) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Product has been expired!',
          visibilityTime: 3000,
        });
      } else if (res.status === 200 && data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'The require quantity is not available!',
          visibilityTime: 3000,
        });
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'The require quantity is not available anymore!',
          visibilityTime: 3000,
        });
      } else if (res.status === 200 && data.status === 203) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Quantity should be greater than 0!',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCustDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchdropcustomer`);
      setCustDropdown(res.data.customers);
    } catch (error) {
      console.log(error);
    }
  };

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

  const saleCheckout = async () => {
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

    const paidValue = Number(paid);
    const orderTotalValue = Number(orderTotal);
    const discountAmountValue = Number(discountAmount);
    const prevBalanceValue = Number(prevBalance);

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
      const payload = {
        cust_id: selectedCust.id,
        order_total: orderTotalValue,
        net_payable: netPayable,
        discount_amount: discountAmountValue,
        payment_amount: paidValue,
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
        sale_tax: 0.0,
        note: note || '',
        holdinput: '',
      };

      const res = await axios.post(`${BASE_URL}/salecheckout`, payload);
      const data = res.data;
      console.log(res.status);
      console.log(res.data.status);

      if (res.status === 200 && data.status === 200) {
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
        console.log(res.data);

        singleInvc(res.data.invoice_no);
        setModalVisible('View');

        // Reset states
        setSelectedCust(null);
        setBuilty(initialBuiltyAddress);
        setCurrentLabour('');
        setSearchTerm('');
        setCartItems([]);
        setOrderTotal('');
        setDiscount('');
        setPrevBalance('');
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
        setNote('');
        setCustData(initialCustomersData);
      } else if (res.status === 200 && data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: "Payment Amount' cannot be less than 'Net Payables",
          visibilityTime: 3000,
        });
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'For the transaction please add some product in cart.',
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Checkout failed',
          text2: data.message || 'Please check your data',
        });
      }
    } catch (error: any) {
      console.error('Checkout error:', error.response?.data || error.message);

      Toast.show({
        type: 'error',
        text1: 'Sale checkout failed',
        text2: error.response?.data?.message || 'Please try again.',
      });
    }
  };

  // Print Receipt
  const printReceipt = async () => {
    try {
      // Generate HTML content for the receipt
      const htmlContent = generateReceiptHTML();

      // Print the receipt
      await RNPrint.print({
        html: htmlContent,
      });

      Toast.show({
        type: 'success',
        text1: 'Receipt printed successfully',
      });
    } catch (error) {
      console.error('Failed to print receipt:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to print receipt',
      });
    }
  };

  const generateReceiptHTML = () => {
    if (!invoiceData) return '';

    const itemsHTML = invcSaleDetails
      .map(
        item => `
    <tr>
      <td style="padding: 4px; border-bottom: 1px dotted #ccc; font-size: 12px;">${
        item.prod_name
      }</td>
      <td style="padding: 4px; border-bottom: 1px dotted #ccc; text-align: center; font-size: 12px;">${
        item.sald_qty
      }</td>
      <td style="padding: 4px; border-bottom: 1px dotted #ccc; text-align: center; font-size: 12px;">${
        item.ums_name
      }</td>
      <td style="padding: 4px; border-bottom: 1px dotted #ccc; text-align: right; font-size: 12px;">${parseFloat(
        item.sald_fretail_price,
      ).toFixed(2)}</td>
      <td style="padding: 4px; border-bottom: 1px dotted #ccc; text-align: right; font-size: 12px;">${parseFloat(
        item.sald_total_fretailprice,
      ).toFixed(2)}</td>
    </tr>
  `,
      )
      .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt ${selectedInvc}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 14px; margin: 0; padding: 10px; }
        .header { text-align: center; margin-bottom: 15px; }
        .shop-name { font-weight: bold; font-size: 18px; }
        .shop-address { font-size: 14px; }
        .shop-phone { font-weight: bold; font-size: 14px; }
        .receipt-info { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .customer-details { margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th { text-align: left; padding: 6px; border-bottom: 2px solid #000; font-size: 12px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .total-row { border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; font-style: italic; font-size: 12px; }
        .thank-you { text-align: center; margin-top: 15px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="shop-name">${invoiceData.config.bus_name}</div>
        <div class="shop-address">${invoiceData.config.bus_address}</div>
        <div class="shop-phone">${invoiceData.config.bus_contact1}</div>
      </div>
      
      <div class="receipt-info">
        <div>Receipt: ${selectedInvc}</div>
        <div>${new Date(invoiceData.sale.created_at).toLocaleDateString(
          'en-GB',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          },
        )}</div>
      </div>
      
      <div class="customer-details">
        <div>Cashier: ${invoiceData.sale.name}</div>
        <div>Customer: ${invoiceData.sale.cust_name}</div>
        <div>Contact: ${invoiceData.sale.contact}</div>
        <div>Address: ${invoiceData.sale.slcust_address}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>UOM</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
      
      <div class="summary">
        <div class="summary-row">
          <span>Total Items:</span>
          <span>${invcSaleDetails.length}</span>
        </div>
        <div class="summary-row">
          <span>Freight:</span>
          <span>Rs. ${invoiceData.sale.sal_freight_exp}</span>
        </div>
        <div class="summary-row">
          <span>Labour:</span>
          <span>Rs. ${invoiceData.sale.sal_labr_exp}</span>
        </div>
        <div class="summary-row">
          <span>Order Total:</span>
          <span>Rs. ${invoiceData.sale.sal_order_total}</span>
        </div>
        <div class="summary-row">
          <span>Discount:</span>
          <span>Rs. ${invoiceData.sale.sal_discount}</span>
        </div>
        <div class="summary-row">
          <span>Previous Balance:</span>
          <span>Rs. ${invoiceData.prev_balance}</span>
        </div>
        <div class="summary-row total-row">
          <span>Net Payable:</span>
          <span>Rs. ${invoiceData.sale.sal_total_amount}</span>
        </div>
        <div class="summary-row">
          <span>Paid:</span>
          <span>Rs. ${invoiceData.sale.sal_payment_amount}</span>
        </div>
        <div class="summary-row">
          <span>Balance:</span>
          <span>Rs. ${invoiceData.sale.sal_change_amount}</span>
        </div>
        <div class="summary-row">
          <span>Note:</span>
          <span>${invoiceData.sale.note || 'NILL'}</span>
        </div>
      </div>
      
      <div class="thank-you">Thank you for your business!</div>
      
      <div class="footer">
        Software Developed with love by<br>TechnicMentors
      </div>
    </body>
    </html>
  `;
  };

  useEffect(() => {
    fetchCustDropdown();
    fetchCustData();
    loadCartItems();

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

    const calculatedNetPayable =
      Number(orderTotal) - calculatedDiscount + prevBalance;
    setNetPayable(Number(calculatedNetPayable));

    const paidValue = parseFloat(paid) || 0;
    const calculatedBalance = Number(calculatedNetPayable) - paidValue;
    setBalance(calculatedBalance);
    if (cartItems.length === 0) {
      setOrderTotal('0');
      setDiscount('');
      setDiscountAmount(0);
      setPaid('');
      setNetPayable(Number(prevBalance || 0)); // Only previous balance remains
      setBalance(Number(prevBalance || 0));
    }
  }, [
    currentVal,
    orderTotal,
    prevBalance,
    discount,
    discountType,
    paid,
    cartItems.length,
  ]);

  // Enhanced Cart Item Component
  const CartItemComponent = ({item}: {item: CartItem}) => (
    <View style={styles.cartItemContainer}>
      <View style={styles.cartItemLeft}>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product_name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.unitPrice}>Rs. {item.cost_price}</Text>
            {Number(item.discount) > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{item.discount}%</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cartItemRight}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={() => minusCart(item.prod_id)}
            style={styles.quantityBtn}>
            <Icon name="remove" size={18} color="#144272" />
          </TouchableOpacity>

          <Text style={styles.quantityValue}>{item.qty}</Text>

          <TouchableOpacity
            onPress={() => plusCart(item.prod_id)}
            style={styles.quantityBtn}>
            <Icon name="add" size={18} color="#144272" />
          </TouchableOpacity>
        </View>

        <Text style={styles.itemTotal}>
          Rs. {(Number(item.fretail_price) * Number(item.qty)).toFixed(2)}
        </Text>

        <TouchableOpacity
          onPress={() => removeFromCart(item.prod_id)}
          style={styles.deleteBtn}>
          <Icon name="delete" size={20} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[backgroundColors.primary, backgroundColors.secondary]}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Point of Sale</Text>
            <Text style={styles.headerSubtitle}>Professional POS System</Text>
          </View>

          <TouchableOpacity
            disabled
            onPress={toggleModal}
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}>
            <Icon name="more-vert" size={24} color="transparent" />
          </TouchableOpacity>
        </View>

        {/* Search Results Overlay */}
        {searchTerm.length > 0 && showResults && searchResults.length > 0 && (
          <View style={styles.searchResultsOverlay}>
            <FlatList
              data={searchResults}
              keyExtractor={item => item.prod_id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => {
                    setSearchTerm(item.value);
                    setProdName(item.prod_name);
                    setSelectedProduct(item);

                    const uomOptions = [
                      {label: item.ums_name, value: item.prod_ums_id},
                    ];

                    if (item.prod_have_sub_uom === 'Y' && item.prod_sub_uom) {
                      uomOptions.push({
                        label: item.prod_sub_uom,
                        value: item.prod_ums_id,
                      });
                    }

                    setProdStock(item.prod_qty);
                    setUomItems(uomOptions);
                    setCurrentValue(item.prod_ums_id);
                    setQuantity('1');
                    setPrice(item.prod_price);
                    setShowResults(false);
                  }}>
                  <Text style={styles.searchResultText} numberOfLines={1}>
                    {item.label.replace(/\n/g, ' ')}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <ScrollView
          style={styles.mainContent}
          showsVerticalScrollIndicator={false}>
          {/* Product Search Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="search" size={24} color="white" />
              <Text style={styles.cardTitle}>Product Search</Text>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholderTextColor="rgba(255,255,255,0.7)"
                placeholder="Search by name or barcode..."
                value={searchTerm}
                onChangeText={handleSearch}
              />
            </View>

            <View style={styles.productInfoRow}>
              <View style={styles.productInfoItem}>
                <Text style={styles.label}>Product</Text>
                <Text style={styles.value}>{prodName || 'N/A'}</Text>
              </View>
              <View style={styles.productInfoItem}>
                <Text style={styles.label}>Stock</Text>
                <Text style={styles.value}>{prodStock || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.productControls}>
              <View style={styles.productControlItem}>
                <Text style={styles.label}>Unit</Text>
                <DropDownPicker
                  open={isOpen}
                  value={currentValue}
                  items={uomItems}
                  setOpen={setIsOpen}
                  setValue={setCurrentValue}
                  placeholder="UOM"
                  style={styles.modernDropdown}
                  dropDownContainerStyle={styles.modernDropdownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.dropdownPlaceholder}
                  onChangeValue={value => {
                    if (selectedProduct) {
                      if (value === selectedProduct.ums_name) {
                        setPrice(selectedProduct.prod_price);
                      } else if (value === selectedProduct.prod_sub_uom) {
                        setPrice(selectedProduct.prod_sub_price);
                      }
                    }
                  }}
                  ArrowUpIconComponent={() => (
                    <Icon name="keyboard-arrow-up" size={25} color="#fff" />
                  )}
                  ArrowDownIconComponent={() => (
                    <Icon name="keyboard-arrow-down" size={25} color="#fff" />
                  )}
                  listMode="SCROLLVIEW"
                  labelStyle={{color: '#fff'}}
                  listItemLabelStyle={{color: '#144272'}}
                />
              </View>

              <View style={styles.productControlItem}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.quantityInput}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  placeholder="Qty"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>

              <View style={styles.productControlItem}>
                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  placeholder="Unit Price"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={handleAddToCart}>
              <Icon name="add-shopping-cart" size={20} color="#144272" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>

          {/* Customer Selection Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="person" size={24} color="white" />
              <Text style={styles.cardTitle}>Customer Information</Text>
            </View>

            <View style={styles.customerSelectRow}>
              <View style={styles.customerDropdownContainer}>
                <DropDownPicker
                  items={transformedCust}
                  open={Open}
                  setOpen={setOpen}
                  value={currentVal}
                  setValue={setCurrentVal}
                  placeholder="Select Customer"
                  style={styles.modernDropdown}
                  dropDownContainerStyle={[
                    styles.modernDropdownContainer,
                    {maxHeight: 150, zIndex: 3000},
                  ]}
                  ArrowUpIconComponent={() => (
                    <Icon name="keyboard-arrow-up" size={25} color="#fff" />
                  )}
                  ArrowDownIconComponent={() => (
                    <Icon name="keyboard-arrow-down" size={25} color="#fff" />
                  )}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.dropdownPlaceholder}
                  listMode="SCROLLVIEW"
                  labelStyle={{color: '#fff'}}
                  listItemLabelStyle={{color: '#144272'}}
                />
              </View>
            </View>

            <View style={styles.customerInfoGrid}>
              <View style={styles.customerInfoItem}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{custData?.name || 'N/A'}</Text>
              </View>
              <View style={styles.customerInfoItem}>
                <Text style={styles.label}>Contact:</Text>
                <Text style={styles.value}>{custData?.contact || 'N/A'}</Text>
              </View>
              <View style={styles.customerInfoItem}>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{custData?.address || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Order Summary Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="receipt" size={24} color="white" />
              <Text style={styles.cardTitle}>Order Summary</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order Total:</Text>
              <Text style={styles.summaryValue}>
                Rs. {Number(orderTotal || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.discountSection}>
              <View style={styles.discountInputContainer}>
                <TextInput
                  style={styles.discountInput}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  placeholder="Discount"
                  keyboardType="numeric"
                  value={discount}
                  onChangeText={setDiscount}
                />
                <View style={styles.discountTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.discountTypeBtn,
                      discountType === 'cash' && styles.discountTypeBtnActive,
                    ]}
                    onPress={() => setDiscountType('cash')}>
                    <Text
                      style={[
                        styles.discountTypeText,
                        discountType === 'cash' &&
                          styles.discountTypeTextActive,
                      ]}>
                      Rs
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.discountTypeBtn,
                      discountType === 'percent' &&
                        styles.discountTypeBtnActive,
                    ]}
                    onPress={() => setDiscountType('percent')}>
                    <Text
                      style={[
                        styles.discountTypeText,
                        discountType === 'percent' &&
                          styles.discountTypeTextActive,
                      ]}>
                      %
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.discountAmount}>
                -Rs. {discountAmount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Previous Balance:</Text>
              <Text style={styles.summaryValue}>
                Rs. {Number(prevBalance || 0).toFixed(2)}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.netPayableRow]}>
              <Text style={styles.netPayableLabel}>Net Payable:</Text>
              <Text style={styles.netPayableValue}>
                Rs. {netPayable.toFixed(2)}
              </Text>
            </View>

            <View style={styles.paymentSection}>
              <View style={styles.paidInputContainer}>
                <Text style={styles.label}>Amount Paid</Text>
                <TextInput
                  ref={paidInputRef}
                  style={styles.paidInput}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={paid}
                  onChangeText={setPaid}
                />
              </View>

              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <Text
                  style={[
                    styles.balanceValue,
                    balance < 0
                      ? styles.negativeBalance
                      : styles.positiveBalance,
                  ]}>
                  Rs. {balance.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.noteSection}>
              <Text style={styles.label}>Note (Optional)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Add a note..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.checkoutBtn} onPress={saleCheckout}>
              <Icon name="shopping-cart-checkout" size={20} color="white" />
              <Text style={styles.checkoutBtnText}>Complete Sale</Text>
            </TouchableOpacity>
          </View>

          <View style={{height: 100}} />
        </ScrollView>

        {/* Floating Cart Button */}
        <Animated.View
          style={[
            styles.floatingCartContainer,
            {
              transform: [
                {
                  scale: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}>
          <TouchableOpacity
            style={styles.floatingCartBtn}
            onPress={() => setModalVisible('Cart')}>
            <Icon name="shopping-cart" size={24} color="white" />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Cart Modal */}
        <Modal
          visible={modalVisible === 'Cart'}
          animationType="slide"
          transparent={false}>
          <SafeAreaView style={styles.cartModalContainer}>
            <View style={styles.cartModalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={styles.cartModalCloseBtn}>
                <Icon name="arrow-back" size={24} color="#144272" />
              </TouchableOpacity>
              <Text style={styles.cartModalTitle}>Shopping Cart</Text>
              <Text style={styles.cartItemCount}>{cartItems.length} items</Text>
            </View>

            {cartItems.length === 0 ? (
              <View style={styles.emptyCartContainer}>
                <Icon name="shopping-cart" size={80} color="#ccc" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <Text style={styles.emptyCartSubtext}>
                  Add some products to get started
                </Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={cartItems}
                  keyExtractor={item => item.prod_id.toString()}
                  renderItem={({item}) => <CartItemComponent item={item} />}
                  style={styles.cartList}
                  contentContainerStyle={styles.cartListContent}
                />

                <View style={styles.cartSummaryContainer}>
                  <View style={styles.cartTotalRow}>
                    <Text style={styles.cartTotalLabel}>Total Amount:</Text>
                    <Text style={styles.cartTotalValue}>
                      Rs. {Number(orderTotal || 0).toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.proceedBtn}
                    onPress={() => setModalVisible('')}>
                    <Text style={styles.proceedBtnText}>
                      Proceed to Checkout
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </SafeAreaView>
        </Modal>

        {/* Invoice Modal */}
        <Modal
          visible={modalVisible === 'View'}
          animationType="slide"
          transparent={true}>
          <View style={styles.invoiceModalOverlay}>
            <View style={styles.invoiceModalContainer}>
              <View style={styles.invoiceHeader}>
                <Text style={styles.invoiceTitle}>Sale Invoice</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setInvoiceData(null);
                    setInvcSaleDetails([]);
                    setSelectedInvc('');
                  }}
                  style={styles.invoiceCloseBtn}>
                  <Icon name="close" size={24} color="#144272" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.invoiceContent}>
                <Text style={styles.shopName}>{bussName ?? 'N/A'}</Text>
                <Text style={styles.shopAddress}>{bussAddress ?? 'N/A'}</Text>
                <Text style={styles.phone}>{bussContact ?? 'N/A'}</Text>

                <View style={styles.invoiceInfoRow}>
                  <Text style={styles.receiptNumber}>
                    Receipt#: {selectedInvc}
                  </Text>
                  <Text style={styles.invoiceDate}>
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

                <View style={styles.customerDetails}>
                  <Text style={styles.customerDetailText}>
                    Cashier: {invoiceData?.sale?.name}
                  </Text>
                  <Text style={styles.customerDetailText}>
                    Customer: {invoiceData?.sale?.cust_name}
                  </Text>
                  <Text style={styles.customerDetailText}>
                    Contact: {invoiceData?.sale?.contact}
                  </Text>
                  <Text style={styles.customerDetailText}>
                    Address: {invoiceData?.sale?.slcust_address}
                  </Text>
                  <Text style={styles.customerDetailText}>
                    Builty Contact: {invoiceData?.sale?.sal_builty_contact}
                  </Text>
                  <Text style={styles.customerDetailText}>
                    Builty Address: {invoiceData?.sale?.sal_builty_address}
                  </Text>
                </View>

                <View style={styles.invoiceTableHeader}>
                  <Text style={[styles.invoiceCell, styles.descriptionCell]}>
                    Description
                  </Text>
                  <Text style={[styles.invoiceCell, styles.qtyCell]}>Qty</Text>
                  <Text style={[styles.invoiceCell, styles.uomCell]}>UOM</Text>
                  <Text style={[styles.invoiceCell, styles.priceCell]}>
                    Price
                  </Text>
                  <Text style={[styles.invoiceCell, styles.totalCell]}>
                    Total
                  </Text>
                </View>

                <FlatList
                  data={invcSaleDetails}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({item}) => (
                    <View style={styles.invoiceTableRow}>
                      <Text
                        style={[styles.invoiceCell, styles.descriptionCell]}>
                        {item.prod_name}
                      </Text>
                      <Text style={[styles.invoiceCell, styles.qtyCell]}>
                        {item.sald_qty}
                      </Text>
                      <Text style={[styles.invoiceCell, styles.uomCell]}>
                        {item.ums_name}
                      </Text>
                      <Text style={[styles.invoiceCell, styles.priceCell]}>
                        {parseFloat(item.sald_fretail_price).toFixed(2)}
                      </Text>
                      <Text style={[styles.invoiceCell, styles.totalCell]}>
                        {parseFloat(item.sald_total_fretailprice).toFixed(2)}
                      </Text>
                    </View>
                  )}
                  scrollEnabled={false}
                />

                <View style={styles.invoiceSummarySection}>
                  <View style={styles.invoiceSummaryRow}>
                    <Text style={styles.summaryLabelText}>Total Items:</Text>
                    <Text style={styles.summaryValueText}>
                      {invcSaleDetails.length}
                    </Text>
                  </View>
                  <View style={styles.invoiceSummaryRow}>
                    <Text style={styles.summaryLabelText}>Freight:</Text>
                    <Text style={styles.summaryValueText}>
                      Rs. {invoiceData?.sale?.sal_freight_exp}
                    </Text>
                  </View>
                  <View style={styles.invoiceSummaryRow}>
                    <Text style={styles.summaryLabelText}>Labour:</Text>
                    <Text style={styles.summaryValueText}>
                      Rs. {invoiceData?.sale?.sal_labr_exp}
                    </Text>
                  </View>
                  <View style={styles.invoiceSummaryRow}>
                    <Text style={styles.summaryLabelText}>Order Total:</Text>
                    <Text style={styles.summaryValueText}>
                      Rs. {invoiceData?.sale?.sal_order_total}
                    </Text>
                  </View>
                  <View style={styles.invoiceSummaryRow}>
                    <Text style={styles.summaryLabelText}>Discount:</Text>
                    <Text style={styles.summaryValueText}>
                      Rs. {invoiceData?.sale?.sal_discount}
                    </Text>
                  </View>
                  <View style={styles.invoiceSummaryRow}>
                    <Text style={styles.summaryLabelText}>
                      Previous Balance:
                    </Text>
                    <Text style={styles.summaryValueText}>
                      Rs. {invoiceData?.prev_balance}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.invoiceSummaryRow,
                      styles.netPayableInvoiceRow,
                    ]}>
                    <Text style={styles.netPayableLabelInvoice}>
                      Net Payable:
                    </Text>
                    <Text style={styles.netPayableValueInvoice}>
                      Rs. {invoiceData?.sale?.sal_total_amount}
                    </Text>
                  </View>
                  <View style={styles.invoiceSummaryRow}>
                    <Text style={styles.summaryLabelText}>Paid:</Text>
                    <Text style={styles.summaryValueText}>
                      Rs. {invoiceData?.sale?.sal_payment_amount}
                    </Text>
                  </View>
                  <View style={styles.invoiceSummaryRow}>
                    <Text style={styles.summaryLabelText}>Balance:</Text>
                    <Text style={styles.summaryValueText}>
                      Rs. {invoiceData?.sale?.sal_change_amount}
                    </Text>
                  </View>
                  <View style={styles.invoiceSummaryRow}>
                    <Text style={styles.summaryLabelText}>Note:</Text>
                    <Text style={styles.summaryValueText}>
                      {invoiceData?.sale?.note || 'NILL'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.footerText}>
                  Software Developed with love by{'\n'}TechnicMentors
                </Text>

                <TouchableOpacity
                  style={styles.printBtn}
                  onPress={printReceipt}>
                  <Icon name="print" size={20} color="white" />
                  <Text style={styles.printBtnText}>Print Invoice</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Toast />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  gradientBackground: {
    flex: 1,
  },

  // Header Styles
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
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: 15,
  },

  // Card Styles
  card: {
    backgroundColor: 'rgba(15, 45, 78, 0.9)',
    borderRadius: 15,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  addProductBtn: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Search Results
  searchResultsOverlay: {
    position: 'absolute',
    top: 180,
    left: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    zIndex: 1000,
    elevation: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    color: '#144272',
    fontSize: 14,
  },

  // Product Information
  productInfoRow: {
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
  },
  productInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: 'white',
    fontSize: 14,
    fontWeight: '300',
  },
  infoInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  disabledInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.7)',
  },

  // Product Controls
  productControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productControlItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    textAlign: 'center',
  },
  priceInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Modern Dropdown
  modernDropdown: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minHeight: 42,
  },
  modernDropdownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    zIndex: 1000,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },

  // Add to Cart Button
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  addToCartText: {
    color: '#144272',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Customer Selection
  customerSelectRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  customerDropdownContainer: {
    flex: 1,
  },
  addCustomerBtn: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Customer Info Grid
  customerInfoGrid: {
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
  },
  customerInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  fullWidthItem: {
    marginBottom: 15,
  },

  // Order Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Discount Section
  discountSection: {
    marginBottom: 15,
  },
  discountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  discountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
  },
  discountTypeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 2,
  },
  discountTypeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  discountTypeBtnActive: {
    backgroundColor: 'white',
  },
  discountTypeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  discountTypeTextActive: {
    color: '#144272',
  },
  discountAmount: {
    color: '#FF5252',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },

  // Net Payable
  netPayableRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    paddingTop: 10,
    marginTop: 10,
  },
  netPayableLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  netPayableValue: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Payment Section
  paymentSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 10,
  },
  paidInputContainer: {
    width: '60%',
  },
  paidInput: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  balanceContainer: {
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveBalance: {
    color: '#4CAF50',
  },
  negativeBalance: {
    color: '#FF5252',
  },

  // Note Section
  noteSection: {
    marginBottom: 20,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 80,
  },

  // Checkout Button
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Floating Cart
  floatingCartContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  floatingCartBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#144272',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5252',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Cart Modal
  cartModalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  cartModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cartModalCloseBtn: {
    padding: 5,
  },
  cartModalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#144272',
    textAlign: 'center',
  },
  cartItemCount: {
    fontSize: 14,
    color: '#666',
  },

  // Empty Cart
  emptyCartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyCartText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptyCartSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },

  // Cart List
  cartList: {
    flex: 1,
  },
  cartListContent: {
    paddingVertical: 10,
  },

  // Cart Item Component
  cartItemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartItemLeft: {
    flex: 1,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitPrice: {
    fontSize: 14,
    color: '#666',
  },
  discountBadge: {
    backgroundColor: '#FF5252',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cartItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityValue: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#144272',
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  deleteBtn: {
    padding: 5,
  },

  // Cart Summary
  cartSummaryContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cartTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#144272',
  },
  cartTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  proceedBtn: {
    backgroundColor: '#144272',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  proceedBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Invoice Modal Styles
  invoiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  invoiceModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#144272',
  },
  invoiceCloseBtn: {
    padding: 5,
  },
  invoiceContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  shopName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#144272',
    marginBottom: 5,
  },
  shopAddress: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 5,
  },
  phone: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 15,
  },
  invoiceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  receiptNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#144272',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#666',
  },
  customerDetails: {
    marginBottom: 15,
  },
  customerDetailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  invoiceTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  invoiceTableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  invoiceCell: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  descriptionCell: {
    flex: 2,
    textAlign: 'left',
  },
  qtyCell: {
    flex: 1,
  },
  uomCell: {
    flex: 1,
  },
  priceCell: {
    flex: 1,
  },
  totalCell: {
    flex: 1,
    fontWeight: 'bold',
  },
  invoiceSummarySection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  invoiceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabelText: {
    fontSize: 14,
    color: '#333',
  },
  summaryValueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  netPayableInvoiceRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 8,
  },
  netPayableLabelInvoice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#144272',
  },
  netPayableValueInvoice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
    fontSize: 12,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#144272',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  printBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
