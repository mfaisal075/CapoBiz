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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import {useUser} from '../CTX/UserContext';
import RNPrint from 'react-native-print';
import backgroundColors from '../Colors';
import {Image} from 'react-native';

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
    loadCartItems();
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
            <Text
              style={[
                styles.unitPrice,
                {
                  fontWeight: '500',
                  backgroundColor: '#2a652b38',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  alignSelf: 'flex-start',
                },
              ]}>
              {uom.find(uom => uom.id.toString() === item.uom_id)?.ums_name}
            </Text>

            <Text style={styles.unitPrice}>
              <Text style={{fontWeight: '600'}}>Retail Price:</Text>{' '}
              {item.retail_price}
            </Text>
            <Text style={styles.unitPrice}>
              <Text style={{fontWeight: '600'}}>Discount:</Text> {item.discount}
            </Text>
            <Text style={styles.unitPrice}>
              <Text style={{fontWeight: '600'}}>Unit Price:</Text>{' '}
              {item.fretail_price}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cartItemRight}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={() => minusCart(item.prod_id)}
            style={styles.quantityBtn}>
            <Icon name="remove" size={18} color={backgroundColors.dark} />
          </TouchableOpacity>

          <Text style={styles.quantityValue}>{item.qty}</Text>

          <TouchableOpacity
            onPress={() => plusCart(item.prod_id)}
            style={styles.quantityBtn}>
            <Icon name="add" size={18} color={backgroundColors.dark} />
          </TouchableOpacity>
        </View>

        <Text style={styles.itemTotal}>
          {(Number(item.fretail_price) * Number(item.qty)).toFixed(2)}
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
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Point of Sale</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible('Cart')}
            style={[styles.headerBtn]}>
            <Icon name="add-shopping-cart" size={26} color="#fff" />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
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
              <Text style={styles.cardTitle}>Add to Cart</Text>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <Icon
                  name="search"
                  size={20}
                  color={backgroundColors.dark}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholderTextColor="rgba(0,0,0,0.7)"
                  placeholder="Search by name or barcode..."
                  value={searchTerm}
                  onChangeText={handleSearch}
                />
              </View>
            </View>

            {selectedProduct && (
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
            )}

            <View style={styles.productControlItem}>
              <DropDownPicker
                open={isOpen}
                value={currentValue}
                items={uomItems}
                setOpen={setIsOpen}
                setValue={setCurrentValue}
                placeholder="UOM"
                placeholderStyle={{
                  color: 'rgba(0,0,0,0.7)',
                  fontSize: 16,
                }}
                style={styles.modernDropdown}
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
                    color={backgroundColors.dark}
                  />
                )}
                ArrowDownIconComponent={() => (
                  <Icon
                    name="keyboard-arrow-down"
                    size={18}
                    color={backgroundColors.dark}
                  />
                )}
                listMode="SCROLLVIEW"
                labelStyle={{
                  color: backgroundColors.dark,
                  fontSize: 16,
                }}
                listItemLabelStyle={{color: backgroundColors.dark}}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.quantityInput}
                placeholderTextColor="rgba(0,0,0,0.7)"
                placeholder="Quantity"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.priceInput}
                placeholderTextColor="rgba(0,0,0,0.7)"
                placeholder="Unit Price"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={handleAddToCart}>
              <Icon
                name="add-shopping-cart"
                size={20}
                color={backgroundColors.light}
              />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

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
                      {Number(orderTotal || 0).toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.proceedBtn}
                    onPress={() => setModalVisible('Checkout')}>
                    <Text style={styles.proceedBtnText}>
                      Proceed to Checkout
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </SafeAreaView>
        </Modal>

        {/* Checkout Modal */}
        <Modal
          visible={modalVisible === 'Checkout'}
          animationType="fade"
          transparent={false}>
          <SafeAreaView style={styles.container}>
            <View style={styles.checkoutModalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible('Cart')}
                style={styles.headerBtn}>
                <Icon
                  name="arrow-back"
                  size={24}
                  color={backgroundColors.dark}
                />
              </TouchableOpacity>
              <Text style={styles.checkoutModalTitle}>Checkout</Text>
            </View>

            <ScrollView
              style={styles.checkoutScrollView}
              contentContainerStyle={{paddingBottom: 100}}>
              <View style={styles.checkoutSection}>
                <Text style={styles.checkoutSectionTitle}>Customer *</Text>
                <View>
                  <Icon
                    name="person"
                    size={28}
                    color={backgroundColors.dark}
                    style={styles.personIcon}
                  />
                  <DropDownPicker
                    items={transformedCust}
                    open={Open}
                    setOpen={setOpen}
                    value={currentVal}
                    setValue={setCurrentVal}
                    placeholderStyle={{
                      color: 'rgba(0,0,0,0.7)',
                      marginLeft: 30,
                      fontSize: 16,
                    }}
                    textStyle={{color: 'white'}}
                    ArrowUpIconComponent={() => (
                      <Icon
                        name="keyboard-arrow-up"
                        size={18}
                        color={backgroundColors.dark}
                      />
                    )}
                    ArrowDownIconComponent={() => (
                      <Icon
                        name="keyboard-arrow-down"
                        size={18}
                        color={backgroundColors.dark}
                      />
                    )}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    labelStyle={{
                      color: backgroundColors.dark,
                      marginLeft: 30,
                      fontSize: 16,
                    }}
                    listItemLabelStyle={{color: '#144272'}}
                    listMode="MODAL"
                    searchable
                    searchTextInputStyle={{
                      borderWidth: 0,
                      width: '100%',
                    }}
                    searchContainerStyle={{
                      borderColor: backgroundColors.gray,
                    }}
                  />
                </View>
              </View>

              {/* Supplier Details */}
              {currentVal === '1' ? (
                <View>
                  <View style={[styles.inputContainer, {marginTop: 0}]}>
                    <TextInput
                      style={styles.infoInput}
                      placeholder="Name"
                      placeholderTextColor="rgba(0,0,0,0.7)"
                      value={custDetails.name}
                      onChangeText={t => custOnChange('name', t)}
                    />
                  </View>
                  <View style={[styles.inputContainer, {marginTop: 10}]}>
                    <TextInput
                      style={styles.infoInput}
                      placeholder="Contact"
                      keyboardType="phone-pad"
                      maxLength={12}
                      placeholderTextColor="rgba(0,0,0,0.7)"
                      value={custDetails.contact}
                      onChangeText={t => {
                        let cleaned = t.replace(/[^0-9-]/g, '');
                        cleaned = cleaned.replace(/-/g, '');
                        if (cleaned.length > 4)
                          cleaned =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
                        custOnChange('contact', cleaned);
                      }}
                    />
                  </View>
                  <View style={[styles.inputContainer, {marginVertical: 10}]}>
                    <TextInput
                      style={styles.infoInput}
                      placeholder="Address"
                      placeholderTextColor="rgba(0,0,0,0.7)"
                      value={custDetails.address}
                      onChangeText={t => custOnChange('address', t)}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.checkoutSection}>
                  <View style={styles.checkoutCard}>
                    <Image
                      source={require('../../assets/man.png')}
                      style={styles.avatar}
                    />
                    <View style={{flex: 1}}>
                      <Text style={styles.supplierName}>
                        {custData.name ?? 'N/A'}
                      </Text>
                      <Text style={styles.supplierPhone}>
                        {custData.contact ?? 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.checkoutSection}>
                <Text style={styles.checkoutSectionTitle}>Billing Details</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Order Total:</Text>
                  <Text style={styles.summaryValue}>
                    {Number(orderTotal || 0).toFixed(2)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <View
                    style={[
                      styles.inputContainer,
                      {marginTop: 0, width: '75%'},
                    ]}>
                    <TextInput
                      style={styles.discountInput}
                      placeholderTextColor="rgba(0,0,0,0.7)"
                      placeholder="Discount"
                      keyboardType="numeric"
                      value={discount}
                      onChangeText={setDiscount}
                    />
                  </View>
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
                  {discountAmount.toFixed(2)}
                </Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Previous Balance:</Text>
                  <Text style={styles.summaryValue}>
                    {Number(prevBalance || 0).toFixed(2)}
                  </Text>
                </View>

                <View style={[styles.summaryRow, styles.netPayableRow]}>
                  <Text style={styles.netPayableLabel}>Net Payable:</Text>
                  <Text style={styles.netPayableValue}>
                    {netPayable.toFixed(2)}
                  </Text>
                </View>

                <View style={[styles.inputContainer, {marginTop: 0}]}>
                  <TextInput
                    ref={paidInputRef}
                    style={styles.paidInput}
                    placeholder="Enter paid amount"
                    keyboardType="numeric"
                    placeholderTextColor="rgba(0,0,0,0.7)"
                    value={paid}
                    onChangeText={setPaid}
                  />
                </View>

                <View style={styles.noteSection}>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Add note (Optional)"
                    placeholderTextColor="rgba(0,0,0,0.7)"
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.checkoutSection}>
                <Text style={styles.checkoutSectionTitle}>Balance</Text>
                <View style={styles.amountContainer}>
                  <Text
                    style={[
                      styles.balanceValue,
                      balance < 0
                        ? styles.negativeBalance
                        : styles.positiveBalance,
                    ]}>
                    {balance.toFixed(2)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.checkoutFooter}>
              <TouchableOpacity
                style={styles.completePurchaseBtn}
                onPress={saleCheckout}>
                <Text style={styles.completePurchaseBtnText}>
                  Order Complete
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Invoice Modal */}
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
                    <Icon name="receipt" size={24} color="#144272" />
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
                    <Text style={styles.infoValue}>
                      {selectedInvc ?? 'N/A'}
                    </Text>
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
                <View style={styles.tableSection}>
                  <View style={styles.tableContainer}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderText, styles.col1]}>
                        Item
                      </Text>
                      <Text style={[styles.tableHeaderText, styles.col2]}>
                        Qty
                      </Text>
                      <Text style={[styles.tableHeaderText, styles.col3]}>
                        UOM
                      </Text>
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
                            {Number(
                              item.sald_total_fretailprice,
                            ).toLocaleString()}
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
                            paddingVertical: 2.5,
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
                          <Text style={[styles.tableCell, {flex: 0.2}]}>
                            {invoiceData?.sale?.sal_order_total}
                          </Text>
                        </View>
                      }
                    />
                  </View>
                </View>

                <View style={styles.orderInfoGrid}>
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
                    <Icon
                      name="print"
                      size={20}
                      color={backgroundColors.light}
                    />
                    <Text style={styles.printBtnText}>Print</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Cash Register */}
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
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Toast />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: backgroundColors.primary,
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  menuIcon: {
    width: 28,
    height: 28,
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
  gradientBackground: {
    flex: 1,
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: 12,
    marginTop: 10,
  },

  // Card Styles
  card: {
    backgroundColor: backgroundColors.light,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginVertical: 8,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    color: backgroundColors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  // Search Styles
  searchContainer: {
    marginBottom: 10,
    position: 'relative',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: backgroundColors.dark,
    fontSize: 16,
    paddingVertical: 12,
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
    top: 190,
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
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '600',
  },

  // Product Information
  productInfoRow: {
    marginBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
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
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '400',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    height: 48,
    marginTop: 12,
  },
  infoInput: {
    flex: 1,
    color: backgroundColors.dark,
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Product Controls
  productControlItem: {
    flex: 1,
  },
  quantityInput: {
    flex: 1,
    color: backgroundColors.dark,
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  priceInput: {
    flex: 1,
    color: backgroundColors.dark,
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Modern Dropdown
  modernDropdown: {
    backgroundColor: backgroundColors.light,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
    marginBottom: 4,
  },
  modernDropdownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    maxHeight: 200,
  },
  dropdownText: {
    color: backgroundColors.dark,
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
    backgroundColor: backgroundColors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  addToCartText: {
    color: backgroundColors.light,
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
    color: backgroundColors.dark,
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    color: backgroundColors.dark,
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
    color: backgroundColors.dark,
    fontSize: 14,
  },
  discountTypeContainer: {
    flexDirection: 'row',
    backgroundColor: backgroundColors.gray,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    height: 48,
  },
  discountTypeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  discountTypeBtnActive: {
    backgroundColor: backgroundColors.primary,
  },
  discountTypeText: {
    color: 'rgba(0,0,0,0.8)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  discountTypeTextActive: {
    color: backgroundColors.light,
  },
  discountAmount: {
    color: '#FF5252',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: 5,
  },

  // Net Payable
  netPayableRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.3)',
    paddingTop: 10,
    marginTop: 10,
  },
  netPayableLabel: {
    color: backgroundColors.dark,
    fontSize: 16,
    fontWeight: '500',
  },
  netPayableValue: {
    color: backgroundColors.dark,
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
    flex: 1,
    color: backgroundColors.dark,
    fontSize: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  balanceLabel: {
    color: backgroundColors.dark,
    fontSize: 16,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  positiveBalance: {
    color: backgroundColors.success,
  },
  negativeBalance: {
    color: backgroundColors.danger,
  },

  // Note Section
  noteSection: {
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  noteInput: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: backgroundColors.dark,
    fontSize: 14,
    backgroundColor: backgroundColors.light,
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
    backgroundColor: backgroundColors.gray,
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
    color: backgroundColors.dark,
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
    paddingVertical: 5,
  },

  // Cart Item Component
  cartItemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 10,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: backgroundColors.primary,
    marginBottom: 5,
  },
  priceRow: {
    gap: 5,
  },
  unitPrice: {
    fontSize: 14,
    color: backgroundColors.dark,
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
    borderRadius: 6,
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
    color: backgroundColors.dark,
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: backgroundColors.success,
    marginBottom: 5,
  },
  deleteBtn: {
    padding: 5,
    backgroundColor: '#ff00002b',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 6,
  },

  // Cart Summary
  cartSummaryContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
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
    color: backgroundColors.dark,
  },
  cartTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.success,
  },
  proceedBtn: {
    backgroundColor: backgroundColors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  proceedBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal stying
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FAFBFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.dark,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#2a652b24',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: backgroundColors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Company Card
  companyCard: {
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: backgroundColors.dark,
    borderStyle: 'dotted',
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#144272',
  },
  companyAddress: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },

  // Info Grid
  orderInfoGrid: {
    marginTop: 10,
    borderBottomColor: backgroundColors.dark,
    borderBottomWidth: 2,
    borderStyle: 'dotted',
    marginHorizontal: 20,
  },
  infoCard: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: backgroundColors.dark,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '400',
  },

  // Items Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  // Totals Section
  totalsSection: {
    marginHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '400',
  },

  // Footer
  modalFooter: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  thankYou: {
    fontSize: 16,
    color: backgroundColors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  developerInfo: {
    alignItems: 'center',
  },
  developerText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  companyContact: {
    fontSize: 12,
    color: backgroundColors.dark,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
  },
  printBtn: {
    backgroundColor: backgroundColors.primary,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignSelf: 'center',
    gap: 5,
    marginVertical: 5,
    borderRadius: 10,
  },
  printBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Table Section
  tableSection: {
    marginTop: 20,
    marginHorizontal: 20,
    borderBottomWidth: 2,
    borderColor: backgroundColors.dark,
    borderStyle: 'dotted',
  },
  tableContainer: {
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomColor: backgroundColors.dark,
    borderBottomWidth: 1.5,
    paddingBottom: 5,
  },
  tableHeaderText: {
    color: backgroundColors.dark,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12,
    color: backgroundColors.dark,
    textAlign: 'center',
  },

  // Column widths
  col1: {
    flex: 0.2,
    textAlign: 'left',
  },
  col2: {
    flex: 0.15, // Product
  },
  col3: {
    flex: 0.22, // Qty
  },
  col4: {
    flex: 0.18, // Price
  },
  col5: {
    flex: 0.2, // Total
  },

  // ================= NEW CHECKOUT MODAL STYLES =================
  checkoutModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 8,
    backgroundColor: backgroundColors.light,
  },
  checkoutModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: backgroundColors.dark,
    textAlign: 'center',
    flex: 1,
    marginRight: 24, // Adjust for the back button
  },
  checkoutScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  checkoutSection: {
    marginBottom: 5,
  },
  checkoutSectionTitle: {
    fontSize: 14,
    color: backgroundColors.dark,
    marginBottom: 8,
    fontWeight: '500',
  },
  checkoutCard: {
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: backgroundColors.dark,
  },
  supplierPhone: {
    fontSize: 14,
    color: 'gray',
  },
  amountContainer: {
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutFooter: {
    padding: 20,
    backgroundColor: backgroundColors.light,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  completePurchaseBtn: {
    backgroundColor: backgroundColors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  completePurchaseBtnText: {
    color: backgroundColors.light,
    fontSize: 18,
    fontWeight: 'bold',
  },
  personIcon: {
    position: 'absolute',
    zIndex: 10000,
    top: 7,
    left: 6,
  },
  dropdown: {
    backgroundColor: backgroundColors.light,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
    marginBottom: 4,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    maxHeight: 200,
  },

  // Cash Register Modal
  cashModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashModalContainer: {
    backgroundColor: backgroundColors.light,
    borderRadius: 15,
    width: '95%',
    maxWidth: 400,
    shadowColor: '#000',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: backgroundColors.gray,
  },
});
