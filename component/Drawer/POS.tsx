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
  ToastAndroid,
  BackHandler,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useDrawer} from '../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import {useUser} from '../CTX/UserContext';
import RNPrint from 'react-native-print';
import backgroundColors from '../Colors';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import BottomBar from '../BottomBar';

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F0F2F5',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  shadow: '#000',
  cardBackground: '#FFFFFF',
  lightGreen: '#E8F5E9',
  darkGreen: '#1B5E20',
};

const {width, height} = Dimensions.get('window');

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

interface CartItem {
  product_name: string;
  prod_id: number;
  retail_price: string;
  fretail_price: string;
  cost_price: string;
  qty: string;
  discount: string;
  uom_id: string;
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
interface UOM {
  id: string;
  ums_name: string;
}

interface CustomerDetails {
  name: string;
  contact: string;
  address: string;
}

const initialCustDetails: CustomerDetails = {
  name: '',
  address: '',
  contact: '',
};

export default function POS({navigation}: any) {
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
  const [cashReg, setCashReg] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [warningTitle, setWarningTitle] = useState('Warning');
  const [custDetails, setCustDetails] =
    useState<CustomerDetails>(initialCustDetails);

  // Customer Details On Change
  const custOnChange = (field: keyof CustomerDetails, value: string) => {
    setCustDetails(prev => ({
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
  const [currentVal, setCurrentVal] = useState<string | ''>('1');
  const [currentLabour, setCurrentLabour] = useState<string | null>('');
  const {openDrawer} = useDrawer();
  const [discountType, setDiscountType] = React.useState<'cash' | 'percent'>(
    'cash',
  );
  const [uom, setUom] = useState<UOM[]>([]);
  const [showCashRegister, setShowCashRegister] = useState(false);

  // Check Cash Close
  const checkCashClose = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/chkclose`);
      if (res.data.status === 404) {
        setShowCashRegister(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleWarningOk = () => {
    setShowCashRegister(false);
    navigation.navigate('Dashboard');
  };

  //Open Register
  const openRegister = async () => {
    // Check if amount is empty
    if (!cashReg || cashReg.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'Please enter cash in hand amount.',
      });
      return;
    }

    // Check if amount is valid
    const amount = parseFloat(cashReg);
    if (isNaN(amount) || amount <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'Please enter a valid amount greater than 0.',
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/openregister`, {
        cash_in_hand: cashReg,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Cash register opened successfully!',
        });

        setCashReg('');
        setShowCashRegister(false);
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'Failed to open cash register. Please try again.',
      });
    }
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
      formData.append('search_name', String(selectedProduct.value));
      formData.append('prod_id', String(selectedProduct.prod_id));
      // formData.append('qty', String(selectedProduct.prod_qty));
      formData.append('uom', String(currentValue));
      formData.append('qty', String(quantity));
      formData.append('unitprice', String(price));

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
        setSearchTerm('');
        setQuantity('');
        setPrice('');
        setShowResults(false);
        setSelectedProduct(null);
        setProdName('');
        setProdStock('');
        setCurrentValue('');
      } else if (res.status === 200 && data.status == 100) {
        setWarningTitle('Warning!');
        setWarningMessage('Product has been expired!');
        setShowWarningModal(true);
      } else if (res.status === 200 && data.status == 201) {
        setWarningTitle('Warning!');
        setWarningMessage('The require quantity is not available!');
        setShowWarningModal(true);
      } else if (res.status === 200 && data.status == 202) {
        setWarningTitle('Warning!');
        setWarningMessage('Product not found!');
        setShowWarningModal(true);
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
      ToastAndroid.show('Please select a customer', 5000);
      Toast.show({
        type: 'error',
        text1: 'Please select a customer',
      });
      return;
    }

    if (!cartItems.length) {
      ToastAndroid.show('Cart is empty', 5000);
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
      ToastAndroid.show(
        paidValue < 0
          ? 'Paid amount cannot be negative'
          : 'Please enter a valid paid amount',
        5000,
      );
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
      ToastAndroid.show('Order total is invalid', 5000);
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
        builty_contact:
          currentVal === '1' ? custDetails.contact : builty.builtyCont,
        builty_address:
          currentVal === '1' ? custDetails.address : builty.builtyAdd,
        freight_exp: Number(builty.freight) || 0,
        labour_exp: Number(builty.labourExpanse) || 0,
        cust_contact:
          currentVal === '1' ? custDetails.contact : selectedCust.cust_contact,
        cust_name:
          currentVal === '1' ? custDetails.name : selectedCust.cust_name,
        cust_address:
          currentVal === '1' ? custDetails.address : selectedCust.cust_address,
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
        setCustDetails(initialCustDetails);
        setCustData(initialCustomersData);
      } else if (res.status === 200 && data.status === 201) {
        ToastAndroid.show(
          "Payment Amount' cannot be less than 'Net Payables",
          5000,
        );
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: "Payment Amount' cannot be less than 'Net Payables",
          visibilityTime: 3000,
        });
      } else if (res.status === 200 && data.status === 202) {
        ToastAndroid.show(
          'For the transaction please add some product in cart.',
          5000,
        );
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'For the transaction please add some product in cart.',
          visibilityTime: 3000,
        });
      } else {
        ToastAndroid.show('Checkout failed', 5000);
        Toast.show({
          type: 'error',
          text1: 'Checkout failed',
          text2: data.message || 'Please check your data',
        });
      }
    } catch (error: any) {
      console.error('Checkout error:', error.response?.data || error.message);
      ToastAndroid.show('Please try again.', 5000);
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
      <td style="padding: 8px 4px; font-size: 13px;">${item.prod_name}</td>
      <td style="padding: 8px 4px; text-align: center; font-size: 13px;">${
        item.sald_qty
      }</td>
      <td style="padding: 8px 4px; text-align: center; font-size: 13px;">${
        item.ums_name
      }</td>
      <td style="padding: 8px 4px; text-align: right; font-size: 13px;">${parseFloat(
        item.sald_fretail_price,
      ).toFixed(2)}</td>
      <td style="padding: 8px 4px; text-align: right; font-size: 13px;">${parseFloat(
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
        body { 
          font-family: Arial, sans-serif; 
          font-size: 14px; 
          margin: 0; 
          padding: 20px; 
          max-width: 400px;
          margin: 0 auto;
        }
        .header { 
          text-align: center; 
          margin-bottom: 20px; 
          padding-bottom: 15px;
          border-bottom: 2px dashed #000;
        }
        .shop-name { 
          font-weight: bold; 
          font-size: 24px;
          margin-bottom: 8px;
        }
        .shop-address { 
          font-size: 14px;
          margin: 5px 0;
        }
        .shop-phone { 
          font-size: 14px;
          margin: 5px 0;
        }
        .divider {
          border-bottom: 2px dashed #000;
          margin: 15px 0;
        }
        .receipt-info { 
          display: flex; 
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 13px;
        }
        .customer-details { 
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 2px dashed #000;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 13px;
        }
        .detail-label {
          font-weight: 600;
        }
        table { 
          width: 100%; 
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th { 
          text-align: center;
          padding: 8px 4px;
          border-bottom: 2px dashed #000;
          font-size: 13px;
          font-weight: 600;
        }
        th:first-child,
        td:first-child {
          text-align: left;
        }
        th:last-child,
        td:last-child {
          text-align: right;
        }
        .table-footer {
          border-top: 2px dashed #000;
          padding-top: 10px;
        }
        .summary { 
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px dashed #000;
        }
        .summary-row { 
          display: flex; 
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .summary-label {
          font-weight: 400;
        }
        .summary-value {
          text-align: right;
        }
        .total-row { 
          border-top: 2px solid #000;
          padding-top: 8px;
          margin-top: 8px;
          font-weight: bold;
          font-size: 14px;
        }
        .footer { 
          text-align: center;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px dashed #000;
        }
        .thank-you { 
          text-align: center;
          margin: 20px 0 15px 0;
          font-weight: bold;
          font-size: 16px;
        }
        .developer-info {
          font-size: 12px;
          text-align: center;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="shop-name">${invoiceData.config.bus_name}</div>
        <div class="shop-address">${invoiceData.config.bus_address}</div>
        <div class="shop-phone">${invoiceData.config.bus_contact1}</div>
      </div>
      
      <div class="receipt-info">
        <span><strong>Receipt#:</strong> ${selectedInvc}</span>
      </div>
      <div class="receipt-info">
        <span><strong>Date:</strong> ${new Date(
          invoiceData.sale.created_at,
        ).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}</span>
      </div>
      <div class="receipt-info">
        <span><strong>Maker:</strong> ${invoiceData.sale.name}</span>
      </div>
      
      <div class="divider"></div>
      
      <div class="customer-details">
        <div class="detail-row">
          <span class="detail-label">Customer:</span>
          <span>${invoiceData.sale.cust_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Contact#:</span>
          <span>${invoiceData.sale.contact || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Address:</span>
          <span>${invoiceData.sale.slcust_address || 'NILL'}</span>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Item</th>
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
      
      <div class="table-footer">
        <div class="summary-row">
          <span class="summary-label"><strong>Total Items</strong></span>
          <span class="summary-value">${invcSaleDetails.length}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label"></span>
          <span class="summary-value"><strong>Subtotal ${
            invoiceData.sale.sal_order_total
          }</strong></span>
        </div>
      </div>
      
      <div class="summary">
        <div class="summary-row">
          <span class="summary-label">Order Total:</span>
          <span class="summary-value">${invoiceData.sale.sal_order_total}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Discount:</span>
          <span class="summary-value">${invoiceData.sale.sal_discount}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Previous Balance:</span>
          <span class="summary-value">${invoiceData.prev_balance}</span>
        </div>
        <div class="summary-row total-row">
          <span class="summary-label">Payable:</span>
          <span class="summary-value">${
            invoiceData.sale.sal_total_amount
          }</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Paid:</span>
          <span class="summary-value">${
            invoiceData.sale.sal_payment_amount
          }</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Balance:</span>
          <span class="summary-value">${
            invoiceData.sale.sal_change_amount
          }</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Note:</span>
          <span class="summary-value">${invoiceData.sale.note || 'NILL'}</span>
        </div>
      </div>
      
      <div class="footer">
        <div class="thank-you">Software Developed</div>
        <div class="developer-info">
          <div>with love by</div>
          <div style="margin-top: 5px;"><strong>Technic Mentors</strong></div>
        </div>
      </div>
    </body>
    </html>
  `;
  };

  // Fetch UMOs
  const fetchUoms = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchuoms`);
      const uomData = res.data.uom;
      setUom(uomData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkCashClose();
    fetchCustDropdown();
    fetchCustData();
    fetchUoms();

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

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [
    currentVal,
    orderTotal,
    prevBalance,
    discount,
    discountType,
    paid,
    cartItems.length,
    cartItems.length,
  ]);

  // Auto-Empty Cart on Focus - Ensures cart is empty when navigating from any other screen
  useFocusEffect(
    useCallback(() => {
      const emptyCartOnFocus = async () => {
        try {
          // First, empty the cart
          await axios.get(`${BASE_URL}/emptycart`);
          // Then load cart items (which will be empty now)
          await loadCartItems();
          // Reset cart-related states
          setCartItems([]);
          setOrderTotal('0');
          setDiscount('');
          setDiscountAmount(0);
          setPaid('');
          setNetPayable(Number(prevBalance || 0));
          setBalance(Number(prevBalance || 0));
        } catch (error) {
          console.log('Error emptying cart on focus:', error);
        }
      };

      emptyCartOnFocus();

      return () => {
        // Optional: Cleanup if needed when losing focus
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContent}>
          <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
            <Icon name="menu" size={24} color={THEME.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Point of Sale</Text>
          <View style={{width: 24}} />
        </LinearGradient>

        <View style={styles.floatingSearchContainer}>
          <Icon name="search" size={22} color={THEME.primary} />
          <TextInput
            style={styles.floatingSearchInput}
            placeholderTextColor={THEME.textGray}
            placeholder="Search by name or barcode..."
            value={searchTerm}
            onChangeText={handleSearch}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchTerm('');
                setShowResults(false);
              }}>
              <Icon name="cancel" size={18} color={THEME.textGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 100}}>
        {/* Selected Product Form */}
        {selectedProduct && (
          <View style={styles.productInfoCard}>
            <View style={styles.productInfoHeader}>
              <Text style={styles.selectedProductName}>
                {prodName || 'N/A'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedProduct(null);
                  setProdName('');
                  setProdStock('');
                  setPrice('');
                  setQuantity('');
                  setUomItems([]);
                  setSearchTerm('');
                }}>
                <Icon name="close" size={20} color={THEME.textGray} />
              </TouchableOpacity>
            </View>

            <View style={styles.stockBadge}>
              <Icon name="inventory" size={14} color={THEME.white} />
              <Text style={styles.stockText}>Stock: {prodStock || 'N/A'}</Text>
            </View>

            {/* Redesigned Input Layout */}
            <View style={{marginBottom: 8, marginTop: 12}}>
              <Text style={[styles.controlLabel, {marginBottom: 0}]}>UOM</Text>
              <DropDownPicker
                open={isOpen}
                value={currentValue}
                items={uomItems}
                setOpen={setIsOpen}
                setValue={setCurrentValue}
                placeholder="Select UOM"
                placeholderStyle={styles.dropdownPlaceholder}
                style={[styles.modernDropdown, {minHeight: 40}]}
                dropDownContainerStyle={styles.modernDropdownContainer}
                textStyle={styles.dropdownText}
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
                  <Icon
                    name="keyboard-arrow-up"
                    size={18}
                    color={THEME.primary}
                  />
                )}
                ArrowDownIconComponent={() => (
                  <Icon
                    name="keyboard-arrow-down"
                    size={18}
                    color={THEME.primary}
                  />
                )}
                listMode="SCROLLVIEW"
              />
            </View>

            <View style={styles.qtyPriceRow}>
              <View style={styles.compactInputWrapper}>
                <Text style={styles.controlLabel}>Quantity</Text>
                <TextInput
                  style={styles.compactInput}
                  placeholderTextColor={THEME.textGray}
                  placeholder="Qty"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                  maxLength={6}
                />
              </View>

              <View style={styles.compactInputWrapper}>
                <Text style={styles.controlLabel}>Unit Price</Text>
                <TextInput
                  style={styles.compactInput}
                  placeholderTextColor={THEME.textGray}
                  placeholder="Price"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  maxLength={9}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.compactAddBtn}
              onPress={handleAddToCart}>
              <Icon name="add-shopping-cart" size={18} color={THEME.white} />
              <Text style={styles.compactAddBtnText}>ADD TO CART</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cart Items List (Inline) */}
        {cartItems.length > 0 ? (
          <View style={styles.cartPreviewCard}>
            <View style={styles.cartPreviewHeader}>
              <Text style={styles.cartPreviewTitle}>
                Cart Items ({cartItems.length})
              </Text>
            </View>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                {/* Top: Name & Delete */}
                <View style={styles.itemCardHeader}>
                  <View style={{flex: 1, marginRight: 12}}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.product_name}
                    </Text>
                    <View
                      style={[styles.itemBadge, {backgroundColor: '#f3f4f6'}]}>
                      <Text
                        style={[styles.itemBadgeText, {color: THEME.textGray}]}>
                        Qty: {item.qty}
                      </Text>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row', gap: 5}}>
                    <TouchableOpacity
                      onPress={() => minusCart(item.prod_id)}
                      style={[
                        styles.itemDeleteBtn,
                        {backgroundColor: '#E0F2F1'},
                      ]}>
                      <Icon name="remove" size={18} color={THEME.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => plusCart(item.prod_id)}
                      style={[
                        styles.itemDeleteBtn,
                        {backgroundColor: '#E0F2F1'},
                      ]}>
                      <Icon name="add" size={18} color={THEME.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.prod_id)}
                      style={styles.itemDeleteBtn}>
                      <Icon name="delete" size={18} color={THEME.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.itemDivider} />

                {/* Bottom: Totals */}
                <View style={styles.itemCardFooter}>
                  <View>
                    <Text style={styles.itemLabel}>Unit Price</Text>
                    <Text style={styles.itemValue}>{item.fretail_price}</Text>
                  </View>

                  <View style={styles.totalContainer}>
                    <Text style={[styles.itemLabel, {textAlign: 'right'}]}>
                      Subtotal
                    </Text>
                    <Text style={styles.itemTotalValue}>
                      {(Number(item.qty) * Number(item.fretail_price)).toFixed(
                        2,
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            <View style={[styles.summaryRow, {padding: 12}]}>
              <Text style={styles.summaryLabel}>Total Payable:</Text>
              <Text style={styles.summaryValue}>
                {Number(orderTotal).toFixed(2)}
              </Text>
            </View>
          </View>
        ) : (
          !selectedProduct && (
            <View style={styles.emptyCartContainer}>
              <Icon name="shopping-cart" size={48} color={THEME.textGray} />
              <Text style={styles.emptyCartText}>
                Search product to add to cart
              </Text>
            </View>
          )
        )}
      </ScrollView>

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
                  setCurrentValue(item.ums_name);
                  setQuantity('1');
                  setPrice(item.prod_price);
                  setShowResults(false);
                }}>
                <Text style={styles.searchResultText} numberOfLines={1}>
                  {item.label.replace(/\n/g, ' ')}
                </Text>
                <Text style={styles.searchResultSubtext}>
                  Stock: {item.prod_qty} • {item.prod_price}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Floating Billing Button */}
      {cartItems.length > 0 && (
        <TouchableOpacity
          style={styles.floatingBillingBtn}
          onPress={() => setModalVisible('CustomerDetails')}>
          <LinearGradient
            colors={[THEME.gradientStart, THEME.gradientEnd]}
            style={styles.floatingBtnGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <View style={styles.floatingBtnContent}>
              <Icon name="receipt" size={24} color={THEME.white} />
              <View style={styles.floatingBtnTextContainer}>
                <Text style={styles.floatingBtnTitle}>Proceed to Bill</Text>
                <Text style={styles.floatingBtnSubtitle}>
                  {Number(orderTotal || 0).toFixed(2)}
                </Text>
              </View>
              <Icon name="arrow-forward" size={24} color={THEME.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Customer Details Modal */}
      <Modal
        visible={modalVisible === 'CustomerDetails'}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.checkoutModalContainer}>
            {/* Header */}
            <View style={styles.checkoutModalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={styles.headerBtn}>
                <Icon name="arrow-back" size={24} color={THEME.textDark} />
              </TouchableOpacity>
              <View style={styles.checkoutHeaderCenter}>
                <Text style={styles.checkoutModalTitle}>Customer Details</Text>
                <Text style={styles.checkoutModalSubtitle}>Step 1 of 2</Text>
              </View>
            </View>

            <ScrollView
              style={styles.checkoutScrollView}
              showsVerticalScrollIndicator={false}>
              {/* Customer Selection */}
              <View style={styles.checkoutSection}>
                <View style={[styles.sectionHeader, {marginTop: 10}]}>
                  <Icon name="person" size={20} color={THEME.primary} />
                  <Text style={styles.sectionTitle}>Select Customer</Text>
                </View>
                <View style={styles.customerSelectContainer}>
                  <DropDownPicker
                    items={transformedCust}
                    open={Open}
                    setOpen={setOpen}
                    value={currentVal}
                    setValue={setCurrentVal}
                    placeholder="Select Customer"
                    placeholderStyle={styles.dropdownPlaceholder}
                    style={styles.checkoutDropdown}
                    dropDownContainerStyle={styles.checkoutDropdownContainer}
                    textStyle={styles.dropdownText}
                    ArrowUpIconComponent={() => (
                      <Icon
                        name="keyboard-arrow-up"
                        size={18}
                        color={THEME.primary}
                      />
                    )}
                    ArrowDownIconComponent={() => (
                      <Icon
                        name="keyboard-arrow-down"
                        size={18}
                        color={THEME.primary}
                      />
                    )}
                    listMode="SCROLLVIEW"
                    searchable
                  />
                </View>

                {currentVal === '1' ? (
                  <View style={styles.guestCustomerForm}>
                    <View style={styles.formRow}>
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Name *</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="Enter name"
                          placeholderTextColor={THEME.textGray}
                          value={custDetails.name}
                          onChangeText={t => custOnChange('name', t)}
                        />
                      </View>
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Contact *</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="Phone number"
                          placeholderTextColor={THEME.textGray}
                          keyboardType="phone-pad"
                          value={custDetails.contact}
                          onChangeText={t => custOnChange('contact', t)}
                        />
                      </View>
                    </View>
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Address</Text>
                      <TextInput
                        style={[styles.formInput, styles.textArea]}
                        placeholder="Enter address"
                        placeholderTextColor={THEME.textGray}
                        value={custDetails.address}
                        onChangeText={t => custOnChange('address', t)}
                        multiline
                        numberOfLines={2}
                      />
                    </View>
                  </View>
                ) : (
                  selectedCust && (
                    <View style={styles.customerInfoCard}>
                      <View style={styles.customerAvatar}>
                        <Icon name="person" size={24} color={THEME.white} />
                      </View>
                      <View style={styles.customerDetails}>
                        <Text style={styles.customerName}>
                          {selectedCust.cust_name}
                        </Text>
                        <Text style={styles.customerContact}>
                          {selectedCust.cust_contact ?? 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.prevBalanceBadge}>
                        <Text style={styles.prevBalanceText}>
                          Prev. Bal: {prevBalance}
                        </Text>
                      </View>
                    </View>
                  )
                )}
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.checkoutFooter}>
              <TouchableOpacity
                style={styles.completePurchaseBtn}
                onPress={() => {
                  if (!currentVal) {
                    ToastAndroid.show('Please select a customer', 3000);
                    return;
                  }
                  if (
                    currentVal === '1' &&
                    (!custDetails.name || !custDetails.contact)
                  ) {
                    ToastAndroid.show(
                      'Please fill required customer details',
                      3000,
                    );
                    return;
                  }
                  setModalVisible('Billing');
                }}>
                <LinearGradient
                  colors={[THEME.gradientStart, THEME.gradientEnd]}
                  style={styles.completeBtnGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}>
                  <Text style={styles.completePurchaseBtnText}>
                    Proceed to Billing
                  </Text>
                  <Icon
                    name="arrow-forward"
                    size={24}
                    color={THEME.white}
                    style={{marginLeft: 8}}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Billing confirmation Modal */}
      <Modal
        visible={modalVisible === 'Billing'}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.checkoutModalContainer}>
            {/* Header */}
            <View style={styles.checkoutModalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible('CustomerDetails')}
                style={styles.headerBtn}>
                <Icon name="arrow-back" size={24} color={THEME.textDark} />
              </TouchableOpacity>
              <View style={styles.checkoutHeaderCenter}>
                <Text style={styles.checkoutModalTitle}>Billing</Text>
                <Text style={styles.checkoutModalSubtitle}>Step 2 of 2</Text>
              </View>
            </View>

            <ScrollView
              style={styles.checkoutScrollView}
              showsVerticalScrollIndicator={false}>
              {/* Order Summary */}
              <View style={styles.checkoutSection}>
                <View style={styles.sectionHeader}>
                  <Icon name="receipt" size={20} color={THEME.primary} />
                  <Text style={styles.sectionTitle}>Order Summary</Text>
                </View>
                <View style={styles.orderSummaryCard}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Subtotal</Text>
                    <Text style={styles.summaryItemValue}>
                      {Number(orderTotal || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>
                      Previous Balance
                    </Text>
                    <Text style={styles.summaryItemValue}>
                      {Number(prevBalance || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Total Payable</Text>
                    <Text style={styles.summaryItemValue}>
                      {netPayable.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Discount Section */}
              <View style={styles.checkoutSection}>
                <View style={styles.sectionHeader}>
                  <Icon name="discount" size={20} color={THEME.primary} />
                  <Text style={styles.sectionTitle}>Discount</Text>
                </View>
                <View style={styles.discountContainer}>
                  <View style={styles.discountInputRow}>
                    <TextInput
                      style={styles.discountInput}
                      placeholder="Enter discount"
                      placeholderTextColor={THEME.textGray}
                      keyboardType="numeric"
                      value={discount}
                      onChangeText={setDiscount}
                    />
                    <View style={styles.discountTypeToggle}>
                      <TouchableOpacity
                        style={[
                          styles.discountTypeBtn,
                          discountType === 'cash' &&
                            styles.activeDiscountTypeBtn,
                        ]}
                        onPress={() => setDiscountType('cash')}>
                        <Text
                          style={[
                            styles.discountTypeText,
                            discountType === 'cash' &&
                              styles.activeDiscountTypeText,
                          ]}>
                          Rs
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.discountTypeBtn,
                          discountType === 'percent' &&
                            styles.activeDiscountTypeBtn,
                        ]}
                        onPress={() => setDiscountType('percent')}>
                        <Text
                          style={[
                            styles.discountTypeText,
                            discountType === 'percent' &&
                              styles.activeDiscountTypeText,
                          ]}>
                          %
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {discountAmount > 0 && (
                    <Text style={styles.discountAppliedText}>
                      Discount Applied: {discountAmount.toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Payment Section */}
              <View style={styles.checkoutSection}>
                <View style={styles.sectionHeader}>
                  <Icon name="payments" size={20} color={THEME.primary} />
                  <Text style={styles.sectionTitle}>Payment</Text>
                </View>
                <View style={styles.paymentContainer}>
                  <View style={styles.paidInputContainer}>
                    <Text style={styles.paidInputLabel}>Amount Paid</Text>
                    <View style={styles.paidInputWrapper}>
                      <TextInput
                        ref={paidInputRef}
                        style={styles.paidInput}
                        placeholder="Enter amount"
                        placeholderTextColor={THEME.textGray}
                        keyboardType="numeric"
                        value={paid}
                        onChangeText={setPaid}
                      />
                    </View>
                  </View>
                  <View style={styles.balanceDisplay}>
                    <Text style={styles.balanceLabel}>Balance</Text>
                    <Text
                      style={[
                        styles.balanceValue,
                        balance > 0
                          ? styles.positiveBalance
                          : styles.negativeBalance,
                      ]}>
                      {balance.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Note Section */}
              <View style={styles.checkoutSection}>
                <View style={styles.sectionHeader}>
                  <Icon name="notes" size={20} color={THEME.primary} />
                  <Text style={styles.sectionTitle}>Additional Notes</Text>
                </View>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Add any notes (optional)"
                  placeholderTextColor={THEME.textGray}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Items Preview */}
              <View style={[styles.checkoutSection, {marginBottom: 180}]}>
                <View style={styles.sectionHeader}>
                  <Icon name="list" size={20} color={THEME.primary} />
                  <Text style={styles.sectionTitle}>
                    Items ({cartItems.length})
                  </Text>
                </View>
                <View style={styles.itemsPreview}>
                  {cartItems.slice(0, 3).map((item, index) => (
                    <View key={index} style={styles.previewItem}>
                      <Text style={styles.previewItemName} numberOfLines={1}>
                        {item.product_name}
                      </Text>
                      <Text style={styles.previewItemDetails}>
                        {item.qty} × {item.fretail_price}
                      </Text>
                    </View>
                  ))}
                  {cartItems.length > 3 && (
                    <Text style={styles.moreItemsPreviewText}>
                      +{cartItems.length - 3} more items
                    </Text>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.checkoutFooter}>
              <View style={styles.footerSummary}>
                <Text style={styles.footerTotalLabel}>Total Payable</Text>
                <Text style={styles.footerTotalValue}>
                  {netPayable.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.completePurchaseBtn}
                onPress={saleCheckout}>
                <LinearGradient
                  colors={[THEME.gradientStart, THEME.gradientEnd]}
                  style={styles.completeBtnGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}>
                  <Icon name="check-circle" size={24} color={THEME.white} />
                  <Text style={styles.completePurchaseBtnText}>
                    Complete Purchase
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Invoice Modal - Keep existing */}
      <Modal
        visible={modalVisible === 'View'}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.invoiceIconContainer}>
                  <Icon name="receipt" size={24} color={THEME.primary} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Sale Invoice</Text>
                  <Text style={styles.modalSubtitle}>Invoice Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setInvoiceData(null);
                  setInvcSaleDetails([]);
                  setSelectedInvc('');
                }}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              {/* Company Info Card */}
              <View style={styles.companyCard}>
                <View style={styles.companyHeader}>
                  <Text style={styles.companyName}>{bussName || 'N/A'}</Text>
                </View>
                <Text style={styles.companyAddress}>
                  {bussAddress || 'N/A'}
                </Text>
                <Text style={styles.companyContact}>
                  {bussContact || 'Contact: N/A'}
                </Text>
              </View>

              {/* Order Info Grid */}
              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Receipt#:</Text>
                  <Text style={styles.infoValue}>{selectedInvc ?? 'N/A'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Date:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.created_at
                      ? new Date(invoiceData?.sale.created_at)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Maker:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.name ?? 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Customer:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.cust_name ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Contact:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.contact ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.slcust_address ?? 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Order Table Section */}
              <View style={styles.tableContainer}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.col1]}>
                    Item
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.col2]}>Qty</Text>
                  <Text style={[styles.tableHeaderText, styles.col3]}>UOM</Text>
                  <Text style={[styles.tableHeaderText, styles.col4]}>
                    Price
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.col5]}>
                    Total
                  </Text>
                </View>

                {/* Table Rows */}
                <FlatList
                  data={invcSaleDetails}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({item, index}) => (
                    <View style={[styles.tableRow]}>
                      <Text style={[styles.tableCell, styles.col1]}>
                        {item.prod_name}
                      </Text>
                      <Text style={[styles.tableCell, styles.col2]}>
                        {item.sald_qty}
                      </Text>
                      <Text style={[styles.tableCell, styles.col3]}>
                        {item.ums_name}
                      </Text>
                      <Text style={[styles.tableCell, styles.col4]}>
                        {Number(item.sald_fretail_price).toLocaleString()}
                      </Text>
                      <Text style={[styles.tableCell, styles.col5]}>
                        {Number(item.sald_total_fretailprice).toLocaleString()}
                      </Text>
                    </View>
                  )}
                  scrollEnabled={false}
                  ListFooterComponent={
                    <View
                      style={{
                        borderTopWidth: 1.5,
                        borderTopColor: backgroundColors.dark,
                        flexDirection: 'row',
                        paddingVertical: 5,
                        paddingHorizontal: 8,
                      }}>
                      <Text
                        style={[
                          styles.tableHeaderText,
                          {flex: 0.2, textAlign: 'left'},
                        ]}>
                        Total Items
                      </Text>
                      <Text style={[styles.tableCell, {flex: 0.15}]}>
                        {invcSaleDetails.length}
                      </Text>
                      <Text style={[styles.tableHeaderText, {flex: 0.2}]}>
                        Subtotals
                      </Text>
                      <View style={{flex: 0.2}} />
                      <Text
                        style={[
                          styles.tableCell,
                          {flex: 0.15, textAlign: 'right'},
                        ]}>
                        {invoiceData?.sale?.sal_order_total}
                      </Text>
                    </View>
                  }
                />
              </View>

              <View style={[styles.orderInfoGrid, {marginBottom: 160}]}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Total Order:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_order_total ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Discount:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_discount ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Previous Bal.:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.prev_balance ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Payable:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_total_amount ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Paid:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_payment_amount ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Balance:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_change_amount ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Note:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.note ?? 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.modalFooter}>
                <Text style={styles.thankYou}>Thank you for your visit</Text>
                <View style={styles.developerInfo}>
                  <Text style={styles.developerText}>
                    Software Developed with ❤️ by
                  </Text>
                  <Text style={styles.companyContact}>
                    Technic Mentors | +923111122144
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.printBtn}
                  onPress={printReceipt}>
                  <Icon name="print" size={20} color={backgroundColors.light} />
                  <Text style={styles.printBtnText}>Print</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Warning Modal */}
      <Modal
        visible={showWarningModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWarningModal(false)}>
        <View style={styles.warningModalOverlay}>
          <View style={styles.warningModalContainer}>
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../../assets/Alert.json')}
                autoPlay
                loop={false}
                style={styles.lottieAnimation}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.warningTitle}>{warningTitle}</Text>
            <Text style={styles.warningMessage}>{warningMessage}</Text>
            <TouchableOpacity
              style={styles.warningBtn}
              onPress={() => setShowWarningModal(false)}>
              <Text style={styles.warningBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cash Register Modal - Keep existing */}
      <Modal
        visible={showCashRegister}
        transparent={true}
        animationType="fade"
        onRequestClose={handleWarningOk}>
        <View style={styles.cashModalOverlay}>
          <View style={styles.cashModalContainer}>
            <View style={styles.cashModalHeader}>
              <Text style={styles.modalHeaderTitle}>Cash Register</Text>
            </View>

            <View style={{padding: 20}}>
              <Text
                style={{
                  fontSize: 14,
                  color: backgroundColors.dark,
                  marginBottom: 8,
                  fontWeight: '500',
                }}>
                Cash In Hand *
              </Text>

              <View style={[styles.inputContainer, {marginTop: 0}]}>
                <TextInput
                  style={styles.infoInput}
                  placeholder="Enter cash in hand"
                  placeholderTextColor="rgba(0,0,0,0.7)"
                  keyboardType="numeric"
                  maxLength={11}
                  value={cashReg}
                  onChangeText={t => setCashReg(t)}
                />
              </View>

              <TouchableOpacity
                style={[styles.completePurchaseBtn, {marginTop: 20}]}
                onPress={openRegister}>
                <Text style={styles.completePurchaseBtnText}>Confirm</Text>
                <LinearGradient
                  colors={[THEME.gradientStart, THEME.gradientEnd]}
                  style={styles.completeBtnGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}>
                  <Text style={styles.completePurchaseBtnText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  gradientBackground: {
    flex: 1,
  },

  iconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  productInfoCard: {
    backgroundColor: THEME.lightGreen,
    borderRadius: 12,
    padding: 10,
  },
  productInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  selectedProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textDark,
    flex: 1,
    marginRight: 12,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderRadius: 20,
  },
  stockText: {
    color: THEME.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  controlsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  controlGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  controlLabel: {
    fontSize: 12,
    color: THEME.textGray,
    marginBottom: 8,
    fontWeight: '500',
  },
  modernDropdown: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    minHeight: 44,
  },
  modernDropdownContainer: {
    backgroundColor: THEME.white,
    borderColor: THEME.border,
    borderRadius: 8,
  },
  dropdownPlaceholder: {
    color: THEME.textGray,
    fontSize: 14,
  },
  dropdownText: {
    color: THEME.textDark,
    fontSize: 14,
  },
  quantityInputWrapper: {
    backgroundColor: THEME.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  quantityInput: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: THEME.textDark,
    fontSize: 14,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  currencySymbol: {
    paddingHorizontal: 12,
    color: THEME.textGray,
    fontSize: 14,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    color: THEME.textDark,
    fontSize: 14,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: THEME.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: THEME.textDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: THEME.textDark,
    fontSize: 16,
    paddingVertical: 14,
  },
  cartFullView: {
    marginBottom: 100,
  },
  cartHeaderCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartHeaderText: {
    marginLeft: 12,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  cartSubtitle: {
    fontSize: 14,
    color: THEME.textGray,
    marginTop: 2,
  },
  clearCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearCartText: {
    color: THEME.danger,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyCartContainer: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textGray,
    marginTop: 20,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  backToProductsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backToProductsText: {
    color: THEME.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  floatingBillingBtn: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    left: 20,
    borderRadius: 16,
    shadowColor: THEME.shadow,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  floatingBtnGradient: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  floatingBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floatingBtnTextContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  floatingBtnTitle: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  floatingBtnSubtitle: {
    color: THEME.white,
    fontSize: 14,
    opacity: 0.9,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  checkoutModalContainer: {
    backgroundColor: THEME.background,
    height: '100%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: THEME.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  checkoutModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 8,
    backgroundColor: THEME.white,
  },
  checkoutCloseBtn: {
    padding: 8,
  },
  checkoutHeaderCenter: {
    flex: 1,
    marginLeft: 16,
  },
  checkoutModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  checkoutModalSubtitle: {
    fontSize: 14,
    color: THEME.textGray,
    marginTop: 2,
  },
  checkoutScrollView: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  checkoutSection: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginLeft: 8,
  },
  customerSelectContainer: {
    marginBottom: 8,
  },
  checkoutDropdown: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    minHeight: 52,
  },
  checkoutDropdownContainer: {
    backgroundColor: THEME.white,
    borderColor: THEME.border,
    borderRadius: 12,
  },
  guestCustomerForm: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  formLabel: {
    fontSize: 12,
    color: THEME.textGray,
    marginBottom: 8,
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: THEME.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.textDark,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  customerInfoCard: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerDetails: {
    flex: 1,
    marginLeft: 16,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  customerContact: {
    fontSize: 14,
    color: THEME.textGray,
    marginTop: 2,
  },
  customerAddress: {
    fontSize: 12,
    color: THEME.textGray,
    marginTop: 2,
  },
  prevBalanceBadge: {
    backgroundColor: THEME.lightGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  prevBalanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.primary,
  },
  orderSummaryCard: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryItemLabel: {
    fontSize: 14,
    color: THEME.textGray,
  },
  summaryItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
  },
  discountContainer: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 16,
  },
  discountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountInput: {
    flex: 1,
    backgroundColor: THEME.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.textDark,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  discountTypeToggle: {
    flexDirection: 'row',
    backgroundColor: THEME.background,
    borderRadius: 8,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  discountTypeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeDiscountTypeBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 8,
  },
  discountTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textGray,
  },
  activeDiscountTypeText: {
    color: THEME.white,
  },
  discountAppliedText: {
    fontSize: 12,
    color: THEME.success,
    marginTop: 8,
    fontWeight: '600',
  },
  paymentContainer: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 16,
  },
  paidInputContainer: {
    marginBottom: 16,
  },
  paidInputLabel: {
    fontSize: 12,
    color: THEME.textGray,
    marginBottom: 8,
    fontWeight: '500',
  },
  paidInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  paidInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textDark,
  },
  balanceDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  positiveBalance: {
    color: THEME.success,
  },
  negativeBalance: {
    color: THEME.danger,
  },
  noteInput: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: THEME.textDark,
    borderWidth: 1,
    borderColor: THEME.border,
    minHeight: 80,
  },
  itemsPreview: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 16,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  previewItemName: {
    fontSize: 14,
    color: THEME.textDark,
    flex: 1,
    marginRight: 12,
  },
  previewItemDetails: {
    fontSize: 14,
    color: THEME.textGray,
    fontWeight: '500',
  },
  moreItemsPreviewText: {
    textAlign: 'center',
    color: THEME.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  checkoutFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.white,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    padding: 12,
  },
  footerSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  footerTotalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  completePurchaseBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  completeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  completePurchaseBtnText: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  searchResultsOverlay: {
    position: 'absolute',
    top: 170,
    left: 16,
    right: 16,
    backgroundColor: THEME.white,
    borderRadius: 12,
    zIndex: 1000,
    maxHeight: 300,
    shadowColor: THEME.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    padding: 12, // Reduced padding
  },
  searchResultItem: {
    padding: 12, // Reduced padding
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  searchResultText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
    marginBottom: 4,
  },
  searchResultSubtext: {
    fontSize: 12,
    color: THEME.textGray,
  },
  // Keep existing styles for other modals
  modalContainer: {
    backgroundColor: '#FAFBFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
  },
  cashModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 15,
    width: '95%',
    maxWidth: 400,
    shadowColor: THEME.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cashModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    justifyContent: 'space-between',
  },
  // Invoice Modal Styles
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  modalSubtitle: {
    fontSize: 14,
    color: THEME.textGray,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 100,
  },
  companyCard: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: THEME.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  companyHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 12,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 2,
  },
  companyContact: {
    fontSize: 12,
    color: THEME.textGray,
    textAlign: 'center',
  },
  orderInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: THEME.background,
    padding: 12,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 11,
    color: THEME.textGray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textDark,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: THEME.background,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.textGray,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  tableCell: {
    fontSize: 11,
    color: THEME.textDark,
  },
  col1: {flex: 0.3},
  col2: {flex: 0.1},
  col3: {flex: 0.2},
  col4: {flex: 0.2},
  col5: {flex: 0.2},
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.white,
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    alignItems: 'center',
  },
  thankYou: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 4,
  },
  developerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  developerText: {
    fontSize: 10,
    color: THEME.textGray,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: '100%',
  },
  printBtnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  inputContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  infoInput: {
    backgroundColor: THEME.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: THEME.textDark,
    borderWidth: 1,
    borderColor: THEME.border,
  },

  // --- NEW COMPACT INPUT STYLES ---
  qtyPriceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    zIndex: 1000,
  },
  compactInputWrapper: {
    flex: 1,
  },
  compactInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8, // reduced vertical padding
    fontSize: 14,
    color: THEME.textDark,
  },
  compactAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignSelf: 'stretch',
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  compactAddBtnText: {
    color: THEME.white,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },

  // --- New Styles from SaleOrder.tsx ---
  headerContainer: {
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 30,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    color: THEME.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  floatingSearchContainer: {
    position: 'absolute',
    bottom: -24,
    left: 20,
    right: 20,
    backgroundColor: THEME.white,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    zIndex: 200,
  },
  floatingSearchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: THEME.textDark,
  },
  mainContent: {
    paddingTop: 40, // Space for floating search
    paddingHorizontal: 16,
  },

  // Cart Preview Card (Unified)
  cartPreviewCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cartPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cartPreviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
    marginBottom: 6,
    lineHeight: 20,
  },
  itemBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 11,
    color: THEME.textGray,
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  itemTotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },

  // Warning Modal Styles
  warningModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningModalContainer: {
    width: '90%',
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  animationContainer: {
    width: 120,
    height: 120,
    marginBottom: 6,
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  warningMessage: {
    fontSize: 16,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  warningBtn: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  warningBtnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '600',
  },

  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.primary,
  },
});
