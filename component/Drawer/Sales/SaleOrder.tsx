import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Modal,
  Image,
  StatusBar,
  BackHandler,
} from 'react-native';
import BottomBar from '../../BottomBar';
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';
import LinearGradient from 'react-native-linear-gradient';
import RNPrint from 'react-native-print';

// THEME
const THEME = {
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  white: '#FFFFFF',
  background: '#F8F9FA',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  shadow: 'rgba(0, 0, 0, 0.1)',
  primaryDark: '#143D15',
  rowHover: '#F9FAFB',
};

interface Customers {
  id: number;
  cust_name: string;
  cust_contact: string;
  cust_address: string;
}

interface CartItem {
  prod_id: number;
  prod_name: string;
  prod_retail_price: string;
  prod_cost_price: string;
  prod_discount: string;
  prod_ums_id: string;
  prod_qty: string;
  prod_unit_price: string;
}

interface InvoiceData {
  config: {
    id: number;
    bus_name: string;
    bus_address: string;
    bus_contact1: string;
  };
  order: {
    id: number;
    salordd_invoice_no: string;
    cust_name: string;
    cust_address: string;
    cust_contact: string;
    created_at: string;
  };
}

interface OrderDetails {
  id: number;
  prod_name: string;
  salordd_partial_qty: string;
  salordd_sub_total: string;
}

interface EditForm {
  prod_id: number;
  editProdName: string;
  editProdPrice: string;
  editProdQty: string;
}

const initialEditFrom: EditForm = {
  prod_id: 0,
  editProdName: '',
  editProdPrice: '',
  editProdQty: '',
};

export default function SaleOrder({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {token} = useUser();
  const [Open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodBarCode, setProdBarCode] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodQty, setProdQty] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentVal, setCurrentVal] = useState<string | null>('');
  const [custData, setCustData] = useState<Customers[]>([]);
  const transformedCust = custData.map(cust => ({
    label: cust.cust_name,
    value: cust.id.toString(),
  }));
  const [addToCartOrders, setAddToCartOrders] = useState<CartItem[]>([]);
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [orderDate, setorderDate] = useState(new Date());
  const [showorderDatePicker, setShoworderDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState('');
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails[]>([]);
  const [editForm, setEditForm] = useState<EditForm>(initialEditFrom);

  const onorderDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || orderDate;
    setShoworderDatePicker(false);
    setorderDate(currentDate);
  };

  // Edit OnChange
  const editOnChange = (field: keyof EditForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
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

  // Sale Order Add To Cart
  const saleOrderAddToCart = async () => {
    if (!selectedProduct) {
      Toast.show({
        type: 'error',
        text1: 'Please select a product first',
      });
      return;
    }

    if (!prodQty) {
      Toast.show({
        type: 'error',
        text1: 'Please enter quantity',
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/orderstore`,
        {
          search_name: selectedProduct.value,
          product_id: selectedProduct.prod_id,
          qty: prodQty,
          unit_price: prodPrice,
          cond_type: 'Add',
          prod_name: prodName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = res.data;

      if (
        res.status === 200 &&
        data.status === 201 &&
        data.message === 'Product expired'
      ) {
        Toast.show({
          type: 'error',
          text1: 'Warning',
          text2: 'Product expired',
        });
        return;
      }

      if (res.status === 200 && data.status) {
        Toast.show({
          type: 'success',
          text1: 'Product added to cart successfully!',
        });
        setSearchTerm('');
        setProdQty('');
        setProdPrice('');
        setProdBarCode('');
        setShowResults(false);
        setSelectedProduct(null);
        setProdName('');
        setProdStock('');
        fetchAddToCartOrders();
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

  // Fetch Add To Cart Orders
  const fetchAddToCartOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchorder`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      if (res.data.cartsession) {
        // Convert object to array and add calculated total
        const cartItems = Object.values(res.data.cartsession).map(
          (item: any) => ({
            ...item,
            total: (
              parseFloat(item.purchase_qty) * parseFloat(item.cost_price)
            ).toString(),
          }),
        );

        setAddToCartOrders(cartItems);

        // Use server's order_total if available
        if (res.data.order_total) {
          setOrderTotal(parseFloat(res.data.order_total));
        }
      } else {
        setAddToCartOrders([]);
        setOrderTotal(0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Add to cart
  const removeAddToCart = async (id: number) => {
    const res = await axios.get(
      `${BASE_URL}/deleteorder?id=${id}&_token=${token}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = res.data;

    if (res.status === 200 && data.status === 200) {
      Toast.show({
        type: 'success',
        text1: 'Deleted Successfully!',
        visibilityTime: 1500,
      });
      fetchAddToCartOrders();
    }
  };

  // Take Order Invoice
  const takeOrderInvoice = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/takeorderinvoice`);
      setInvoiceData(res.data);
      setOrderDetails(res.data.orderdetail);
    } catch (error) {
      console.log(error);
    }
  };

  //Complete Order
  const completeOrder = async () => {
    if (!currentVal) {
      Toast.show({
        type: 'error',
        text1: 'Please select a customer!',
        visibilityTime: 1500,
      });
      return;
    }
    if (addToCartOrders.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Please add some products to the cart!',
        visibilityTime: 1500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/ordercomplete`, {
        customer_id: currentVal,
        date: orderDate.toISOString().split('T')[0],
        order_total: orderTotal,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Completed',
          text2: 'Order Completed Successfully!',
          visibilityTime: 1500,
        });
        setCurrentVal('');
        setOrderTotal(0);
        setorderDate(new Date());
        setModalVisible('ordComplete');
        await axios.get(`${BASE_URL}/order_emptycart`);
        fetchAddToCartOrders();
        takeOrderInvoice();
      } else if (res.status === 200 && data.status === 400) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Please add Customer!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Please add some product!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to complete order!',
        visibilityTime: 2000,
      });
      console.log(error);
    }
  };

  // Get Order to Edit
  const getEditOrder = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editorder?id=${id}&_token=${token}`,
      );

      setEditForm({
        prod_id: res.data.cart.prod_id,
        editProdName: res.data.cart.prod_name,
        editProdPrice: res.data.cart.prod_retail_price,
        editProdQty: res.data.cart.prod_qty,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Update Order
  const updateOrder = async () => {
    if (!editForm.editProdQty || !editForm.editProdPrice) {
      Toast.show({
        type: 'error',
        text1: 'Please enter quantity and price',
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/updateorder`,
        {
          product_id: editForm.prod_id,
          order_id: editForm.prod_id,
          cond_type: 'Add',
          qty: editForm.editProdQty,
          unit_price: editForm.editProdPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.status === 200 && res.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Order updated successfully!',
          visibilityTime: 1500,
        });
        setModalVisible('');
        fetchAddToCartOrders();
      } else if (res.status === 200 && res.data.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Quantity should not be greater than product!',
          visibilityTime: 1500,
        });
      } else if (res.status === 200 && res.data.status === 400) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Product must be greater than 0!',
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to update order',
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error updating order',
      });
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchAddToCartOrders();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, []);

  const printReceipt = async () => {
    if (!invoiceData || !orderDetails.length) return;

    const totalQty = orderDetails.reduce(
      (sum, item) => sum + parseFloat(item.salordd_partial_qty || '0'),
      0,
    );
    const totalAmount = orderDetails.reduce(
      (sum, item) => sum + parseFloat(item.salordd_sub_total || '0'),
      0,
    );

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = currentDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 20px; font-size: 12px; }
          .top-header { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 10px; }
          .business-header { text-align: center; margin-bottom: 30px; }
          .bus-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
          .bus-address { font-size: 12px; margin-bottom: 3px; }
          .bus-contact { font-size: 12px; }
          
          .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-left { flex: 1; }
          .info-right { text-align: right; }
          .info-row { margin-bottom: 3px; font-size: 12px; font-weight: 600; color: #000; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; border: 2px solid #000; }
          th, td { border: 1px solid #000; padding: 5px 8px; text-align: left; font-size: 11px; }
          th { font-weight: bold; border-bottom: 2px solid #000; }
          
          .footer { text-align: center; margin-top: 50px; font-size: 10px; font-weight: bold; }
          .tech-mentors { text-decoration: underline; margin-top: 2px; }
          
          .bottom-bar { display: flex; justify-content: space-between; margin-top: 100px; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="top-header">
          <div>${formattedDate
            .replace(/ /g, '/')
            .replace(/-/g, '/')}, ${formattedTime}</div>
          <div>Point of Sale System</div>
        </div>
        
        <div class="business-header">
          <div class="bus-name">${invoiceData?.config?.bus_name || ''}</div>
          <div class="bus-address">${
            invoiceData?.config?.bus_address || ''
          }</div>
          <div class="bus-contact">${
            invoiceData?.config?.bus_contact1 || ''
          }</div>
        </div>

        <div class="info-section">
          <div class="info-left">
            <div class="info-row">Receipt#: ${
              invoiceData?.order?.salordd_invoice_no || ''
            }</div>
            <div class="info-row">Customer: ${
              invoiceData?.order?.cust_name || ''
            }</div>
            <div class="info-row">Contact#: ${
              invoiceData?.order?.cust_contact || ''
            }</div>
            <div class="info-row">Address: ${
              invoiceData?.order?.cust_address || ''
            }</div>
          </div>
          <div class="info-right">
             <div class="info-row">${formattedDate}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 10%;">sr#</th>
              <th>Product</th>
              <th style="width: 10%;">Qty</th>
              <th style="width: 20%;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails
              .map(
                (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.prod_name}</td>
                <td>${item.salordd_partial_qty}</td>
                <td>${parseFloat(item.salordd_sub_total).toFixed(2)}</td>
              </tr>
            `,
              )
              .join('')}
            <tr style="font-weight: bold;">
              <td colspan="2">Total Items</td>
              <td>${totalQty}</td>
              <td>${totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div>Software Developed with love by</div>
          <div class="tech-mentors">Technic Mentors</div>
        </div>

        <div class="bottom-bar">
          <div>https://pos.technicmentors.com/orderlist</div>
          <div>1/1</div>
        </div>
      </body>
      </html>
    `;

    try {
      await RNPrint.print({html});
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sale Order</Text>
            <View style={{width: 24}} />
          </View>
        </LinearGradient>

        {/* Floating Search */}
        <View style={styles.floatingSearchContainer}>
          <Icon name="magnify" size={22} color={THEME.primary} />
          <TextInput
            style={styles.floatingSearchInput}
            placeholderTextColor={THEME.textLight}
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
              <Icon name="close-circle" size={18} color={THEME.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}>
        {/* Product Search Section Removed (Moved to Header) */}

        {/* Product Info Display */}
        {/* Product Form Card (Only when product selected) */}
        {selectedProduct && (
          <View style={styles.formCard}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
              <Text style={styles.cardTitle}>Selected Product</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedProduct(null);
                  setProdName('');
                  setProdStock('');
                  setProdBarCode('');
                  setProdPrice('');
                  setProdQty('');
                }}>
                <Icon name="close" size={20} color={THEME.textGray} />
              </TouchableOpacity>
            </View>

            <Text style={styles.selectedProdName}>{prodName || 'N/A'}</Text>
            <View style={{flexDirection: 'row', marginBottom: 5, gap: 10}}>
              <Text style={styles.selectedProdPrice}>Stock: {prodStock}</Text>
              <Text style={styles.selectedProdPrice}>
                Barcode: {prodBarCode}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Price <Text style={{color: THEME.danger}}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholderTextColor={THEME.textLight}
                placeholder="0.00"
                value={prodPrice}
                onChangeText={setProdPrice}
                keyboardType="decimal-pad"
                maxLength={9}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Quantity <Text style={{color: THEME.danger}}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholderTextColor={THEME.textLight}
                placeholder="0"
                value={prodQty}
                onChangeText={setProdQty}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              style={styles.addToCartBtn}
              activeOpacity={0.8}
              onPress={saleOrderAddToCart}>
              <LinearGradient
                colors={[THEME.primary, '#1e4620']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.gradientBtn}>
                <Icon
                  name="cart-plus"
                  size={22}
                  color={THEME.white}
                  style={{marginRight: 8}}
                />
                <Text style={styles.btnText}>ADD TO CART</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Added Items List (Inline) */}
        {addToCartOrders.length > 0 ? (
          <View style={styles.cartPreviewCard}>
            <View style={styles.cartPreviewHeader}>
              <Text style={styles.cartPreviewTitle}>
                Cart Items ({addToCartOrders.length})
              </Text>
            </View>
            {addToCartOrders.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                {/* Top: Name & Delete */}
                <View style={styles.itemCardHeader}>
                  <View style={{flex: 1, marginRight: 12}}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.prod_name}
                    </Text>
                    <View
                      style={[styles.itemBadge, {backgroundColor: '#f3f4f6'}]}>
                      <Text
                        style={[styles.itemBadgeText, {color: THEME.textGray}]}>
                        Qty: {item.prod_qty}
                      </Text>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row', gap: 5}}>
                    <TouchableOpacity
                      onPress={() => {
                        getEditOrder(item.prod_id.toString());
                        setModalVisible('EditOrder');
                      }}
                      style={[
                        styles.itemDeleteBtn,
                        {backgroundColor: '#e3f2fd'},
                      ]}>
                      <Icon name="pencil" size={20} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeAddToCart(item.prod_id)}
                      style={styles.itemDeleteBtn}>
                      <Icon
                        name="delete-outline"
                        size={20}
                        color={THEME.danger}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.itemDivider} />

                {/* Bottom: Totals */}
                <View style={styles.itemCardFooter}>
                  <View>
                    <Text style={styles.itemLabel}>Unit Price</Text>
                    <Text style={styles.itemValue}>{item.prod_unit_price}</Text>
                  </View>

                  <View style={styles.totalContainer}>
                    <Text style={[styles.itemLabel, {textAlign: 'right'}]}>
                      Subtotal
                    </Text>
                    <Text style={styles.itemTotalValue}>
                      {(
                        parseFloat(item.prod_qty) *
                        parseFloat(item.prod_retail_price)
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            <View style={[styles.summaryRow, {padding: 12}]}>
              <Text style={styles.summaryLabel}>Total Payable:</Text>
              <Text style={styles.summaryValue}>{orderTotal.toFixed(2)}</Text>
            </View>
          </View>
        ) : (
          !selectedProduct && (
            <View style={styles.emptyState}>
              <Icon name="cart-outline" size={48} color={THEME.textLight} />
              <Text style={styles.emptyText}>
                Search product to add to cart
              </Text>
            </View>
          )
        )}

        <View style={{height: 100}} />
      </ScrollView>

      {/* --- SEARCH RESULTS OVERLAY --- */}
      {searchTerm.length > 0 && showResults && searchResults.length > 0 && (
        <View style={styles.searchResultsOverlay}>
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => {
                  setSearchTerm(item.value);
                  setProdName(item.prod_name);
                  setSelectedProduct(item);
                  setProdBarCode(item.value);
                  setProdStock(item.prod_qty);
                  setProdQty('');
                  setProdPrice(item.prod_price);
                  setShowResults(false);
                }}>
                <Text style={styles.resultText}>
                  {item.label.replace(/\n/g, ' ')}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* --- PROCEED BUTTON --- */}
      {addToCartOrders.length > 0 && (
        <TouchableOpacity
          style={styles.floatingBillingBtn}
          onPress={() => setModalVisible('Checkout')}>
          <LinearGradient
            colors={[THEME.gradientStart, THEME.gradientEnd]}
            style={styles.floatingBtnGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <View style={styles.floatingBtnContent}>
              <Icon name="arrow-right-circle" size={24} color={THEME.white} />
              <View style={styles.floatingBtnTextContainer}>
                <Text style={styles.floatingBtnTitle}>Proceed to Checkout</Text>
                <Text style={styles.floatingBtnSubtitle}>
                  Total: {orderTotal.toFixed(2)}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={THEME.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Invoice Modal */}
      <Modal
        visible={modalVisible === 'ordComplete'}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconContainer}>
                  <Icon name="receipt" size={24} color={THEME.primary} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Sale Invoice</Text>
                  <Text style={styles.modalSubtitle}>Transaction Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setInvoiceData(null);
                  setOrderDetails([]);
                }}
                style={styles.closeButton}>
                <Icon name="close" size={20} color={THEME.textGray} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              {/* Company Info */}
              <View style={styles.invoiceSection}>
                <Text style={styles.companyName}>
                  {invoiceData?.config?.bus_name || 'N/A'}
                </Text>
                <Text style={styles.companyDetails}>
                  {invoiceData?.config?.bus_address || 'N/A'}
                </Text>
                <Text style={styles.companyDetails}>
                  {invoiceData?.config?.bus_contact1 || 'Contact: N/A'}
                </Text>
              </View>

              {/* Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Invoice #</Text>
                  <Text style={styles.detailValue}>
                    {invoiceData?.order?.salordd_invoice_no || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>
                    {new Date().toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Customer</Text>
                  <Text style={styles.detailValue}>
                    {invoiceData?.order?.cust_name || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Items Table */}
              <View style={styles.itemsTableContainer}>
                <Text style={styles.sectionHeader}>Items</Text>
                <View style={styles.itemsHeader}>
                  <Text style={[styles.itemsHeaderText, {flex: 2}]}>
                    Product
                  </Text>
                  <Text
                    style={[
                      styles.itemsHeaderText,
                      {flex: 1, textAlign: 'center'},
                    ]}>
                    Qty
                  </Text>
                  <Text
                    style={[
                      styles.itemsHeaderText,
                      {flex: 1, textAlign: 'right'},
                    ]}>
                    Total
                  </Text>
                </View>

                {orderDetails.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text
                      style={[styles.itemText, {flex: 2}]}
                      numberOfLines={2}>
                      {item.prod_name}
                    </Text>
                    <Text
                      style={[styles.itemText, {flex: 1, textAlign: 'center'}]}>
                      {item.salordd_partial_qty}
                    </Text>
                    <Text
                      style={[styles.itemText, {flex: 1, textAlign: 'right'}]}>
                      {parseFloat(item.salordd_sub_total).toLocaleString()}
                    </Text>
                  </View>
                ))}

                <View style={styles.itemsFooter}>
                  <Text style={styles.itemsFooterLabel}>Total Amount</Text>
                  <Text style={styles.itemsFooterValue}>
                    {orderDetails
                      .reduce(
                        (sum, item) =>
                          sum + parseFloat(item.salordd_sub_total || '0'),
                        0,
                      )
                      .toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={printReceipt}
                  style={styles.printButton}>
                  <Icon name="printer" size={16} color={THEME.white} />
                  <Text style={styles.printButtonText}>Print Receipt</Text>
                </TouchableOpacity>

                <Text style={styles.footerText}>
                  Thank you for your business
                </Text>
                <Text style={styles.developerText}>
                  Powered by Technic Mentors
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={modalVisible === 'EditOrder'}
        transparent={true}
        animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.editModalView}>
            <View style={styles.editHeader}>
              <Text style={styles.editHeaderText}>Update Order</Text>
              <TouchableOpacity onPress={() => setModalVisible('')}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.editLabel}>Item name</Text>
            <TextInput
              style={[styles.editInput, styles.disabledInput]}
              value={editForm.editProdName}
              editable={false}
            />

            <Text style={styles.editLabel}>
              Quantity <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.editInput}
              keyboardType="numeric"
              value={editForm.editProdQty}
              onChangeText={t => editOnChange('editProdQty', t)}
              maxLength={6}
            />

            <Text style={styles.editLabel}>Unit Price</Text>
            <TextInput
              style={styles.editInput}
              keyboardType="numeric"
              value={editForm.editProdPrice}
              onChangeText={t => editOnChange('editProdPrice', t)}
              maxLength={9}
            />

            <TouchableOpacity style={styles.updateButton} onPress={updateOrder}>
              <Text style={styles.updateButtonText}>Update Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
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
              <Icon name="arrow-left" size={24} color={THEME.textDark} />
            </TouchableOpacity>
            <Text style={styles.checkoutModalTitle}>Checkout</Text>
          </View>

          <ScrollView
            style={styles.checkoutScrollView}
            contentContainerStyle={{paddingBottom: 100}}>
            {/* Return Date */}
            <View style={styles.checkoutSection}>
              <Text style={styles.checkoutSectionTitle}>Order Date</Text>
              <TouchableOpacity
                onPress={() => setShoworderDatePicker(true)}
                style={styles.dateInput}>
                <Icon name="calendar" size={20} color={THEME.textDark} />
                <Text style={styles.dateText}>
                  {orderDate.toLocaleDateString()}
                </Text>
                <Icon name="chevron-down" size={20} color={THEME.textDark} />
              </TouchableOpacity>

              {showorderDatePicker && (
                <DateTimePicker
                  testID="orderDatePicker"
                  value={orderDate}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={onorderDateChange}
                />
              )}
            </View>
            <View style={styles.checkoutSection}>
              <Text style={styles.checkoutSectionTitle}>Customer *</Text>
              <View>
                <Icon
                  name="account"
                  size={20}
                  color={THEME.textGray}
                  style={styles.personIcon}
                />
                <DropDownPicker
                  items={transformedCust}
                  open={Open}
                  setOpen={setOpen}
                  value={currentVal}
                  setValue={setCurrentVal}
                  placeholder="Select Supplier"
                  placeholderStyle={{
                    color: 'rgba(0,0,0,0.7)',
                    marginLeft: 30,
                    fontSize: 16,
                  }}
                  textStyle={{color: 'white'}}
                  ArrowUpIconComponent={() => (
                    <Icon name="chevron-up" size={18} color={THEME.textDark} />
                  )}
                  ArrowDownIconComponent={() => (
                    <Icon
                      name="chevron-down"
                      size={18}
                      color={THEME.textDark}
                    />
                  )}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  labelStyle={{
                    color: THEME.textDark,
                    marginLeft: 30,
                    fontSize: 16,
                  }}
                  listItemLabelStyle={{color: '#144272'}}
                  listMode="SCROLLVIEW"
                  searchable
                  searchTextInputStyle={{
                    borderWidth: 0,
                    width: '100%',
                  }}
                  searchContainerStyle={{
                    borderColor: THEME.border,
                  }}
                />
              </View>
            </View>

            {/* Supplier Details */}
            {currentVal && (
              <View style={styles.checkoutSection}>
                <View style={styles.checkoutCard}>
                  <Image
                    source={require('../../../assets/man.png')}
                    style={styles.avatar}
                  />
                  <View style={{flex: 1}}>
                    <Text style={styles.supplierName}>
                      {transformedCust.find(c => c.value === currentVal)
                        ?.label || 'N/A'}
                    </Text>
                    <Text style={styles.supplierPhone}>
                      {custData.find(c => c.id.toString() === currentVal)
                        ?.cust_contact || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.checkoutSection}>
              <Text style={styles.checkoutSectionTitle}>Total Amount</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.amountValue}>{orderTotal.toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.checkoutFooter}>
            <TouchableOpacity
              style={styles.completePurchaseBtn}
              onPress={completeOrder}>
              <Text style={styles.completePurchaseBtnText}>Order Complete</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
  headerWrapper: {
    marginBottom: 20,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  floatingSearchContainer: {
    position: 'absolute',
    bottom: -25,
    left: 20,
    right: 20,
    backgroundColor: THEME.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  floatingSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: THEME.textDark,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // Card Styles
  formCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: THEME.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  selectedProdName: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.primary,
    marginBottom: 5,
  },
  selectedProdPrice: {
    fontSize: 13,
    color: THEME.textGray,
    marginBottom: 15,
  },
  // Input Styles
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textDark,
    marginBottom: 6,
  },
  input: {
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    color: THEME.textDark,
    fontSize: 14,
  },
  // Button Styles
  addToCartBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  btnText: {
    color: THEME.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Cart List Styles
  cartPreviewCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 16,
  },
  cartPreviewHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  cartPreviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
  },
  itemCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: THEME.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 6,
    lineHeight: 22,
  },
  itemBadge: {
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  itemBadgeText: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '600',
  },
  itemDeleteBtn: {
    padding: 10,
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  itemCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLabel: {
    fontSize: 11,
    color: THEME.textGray,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.textDark,
  },
  totalContainer: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  itemTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    marginTop: 10,
    paddingTop: 10,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: THEME.textGray,
    marginTop: 10,
    textAlign: 'center',
  },
  // Floating Button
  floatingBillingBtn: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    elevation: 5,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  floatingBtnGradient: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  floatingBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floatingBtnTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  floatingBtnTitle: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },
  floatingBtnSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  // Search Overlay
  searchResultsOverlay: {
    position: 'absolute',
    top: 130, // Adjusted based on header height
    left: 20,
    right: 20,
    backgroundColor: THEME.white,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    maxHeight: 250,
    zIndex: 9999,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  resultText: {
    fontSize: 14,
    color: THEME.textDark,
  },
  // Checkout Modal & Others (Keeping existing but updated if needed)

  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    height: 48,
  },
  dateText: {
    flex: 1,
    color: THEME.textDark,
    fontSize: 16,
    marginLeft: 8,
  },

  // Invoice Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: THEME.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  modalSubtitle: {
    fontSize: 12,
    color: THEME.textGray,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  invoiceSection: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: THEME.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  companyName: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  companyDetails: {
    fontSize: 13,
    color: THEME.textGray,
    marginBottom: 2,
    textAlign: 'center',
    lineHeight: 18,
  },
  detailsGrid: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  detailLabel: {
    fontSize: 13,
    color: THEME.textGray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: THEME.textDark,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  itemsTableContainer: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textGray,
    padding: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemsHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textGray,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  itemText: {
    fontSize: 13,
    color: THEME.textDark,
  },
  itemsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  itemsFooterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
  },
  itemsFooterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.primary,
  },
  modalFooter: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 10,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 16,
    gap: 8,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  printButtonText: {
    color: THEME.white,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 12,
    color: THEME.textDark,
    fontWeight: '600',
    marginBottom: 4,
  },
  developerText: {
    fontSize: 11,
    color: THEME.textGray,
  },
  // Edit Modal
  overlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalView: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#144272',
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  required: {
    color: 'red',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  personIcon: {
    position: 'absolute',
    zIndex: 1000,
    top: 14,
    left: 10,
  },
  dropdown: {
    backgroundColor: THEME.white,
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 10,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    height: 48,
    marginBottom: 4,
    paddingLeft: 30,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderColor: THEME.border,
    borderRadius: 10,
    maxHeight: 200,
  },

  // ================= NEW CHECKOUT MODAL STYLES =================
  checkoutModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 8,
    backgroundColor: THEME.white,
  },
  checkoutModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.textDark,
    textAlign: 'center',
    flex: 1,
    marginRight: 24,
  },
  checkoutScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  checkoutSection: {
    marginBottom: 5, // Reduced from 8 or larger
  },
  checkoutSectionTitle: {
    fontSize: 14,
    color: THEME.textDark,
    marginBottom: 4, // Reduced
    fontWeight: '500',
  },
  checkoutCard: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 10, // Reduced padding
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
    marginRight: 10, // Reduced
  },
  supplierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  supplierPhone: {
    fontSize: 14,
    color: 'gray',
  },
  amountContainer: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    paddingVertical: 10, // Reduced
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 5, // Reduced
  },
  amountValue: {
    fontSize: 32, // Slightly smaller
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutFooter: {
    padding: 15, // Reduced
    backgroundColor: THEME.white,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  completePurchaseBtn: {
    backgroundColor: THEME.primary,
    paddingVertical: 12, // Reduced
    borderRadius: 12,
    alignItems: 'center',
  },
  completePurchaseBtnText: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
