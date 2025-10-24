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
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';
import backgroundColors from '../../Colors';

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

export default function SaleOrder() {
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
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Purchase Return</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible('Cart')}
            style={[styles.headerBtn]}>
            <Icon name="add-shopping-cart" size={26} color="#fff" />
            {addToCartOrders.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {addToCartOrders.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Product Search Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Product</Text>

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

            {/* Product Info Display */}
            {selectedProduct && (
              <View style={styles.productInfoContainer}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Product Name: </Text>
                  <Text style={styles.infoValue}>{prodName || 'N/A'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Stock: </Text>
                  <Text style={styles.infoValue}>{prodStock || '0'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Barcode: </Text>
                  <Text style={styles.infoValue}>{prodBarCode || 'N/A'}</Text>
                </View>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholderTextColor="rgba(0,0,0,0.7)"
                placeholder="Quantity *"
                value={prodQty}
                onChangeText={setProdQty}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholderTextColor="rgba(0,0,0,0.7)"
                placeholder="Unit Price"
                value={prodPrice}
                onChangeText={setProdPrice}
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={saleOrderAddToCart}>
              <Icon
                name="add-shopping-cart"
                size={20}
                color={backgroundColors.light}
                style={{marginRight: 8}}
              />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Search Results Overlay */}
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

        {/* Cart Modal */}
        <Modal
          visible={modalVisible === 'Cart'}
          animationType="fade"
          transparent={false}>
          <SafeAreaView style={styles.cartModalContainer}>
            {/* Header */}
            <View style={styles.cartModalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={styles.cartModalCloseBtn}>
                <Icon name="arrow-back" size={24} color="#144272" />
              </TouchableOpacity>
              <Text style={styles.cartModalTitle}>Shopping Cart</Text>
              <Text style={styles.cartItemCount}>
                {addToCartOrders.length} items
              </Text>
            </View>

            {/* Empty Cart */}
            {addToCartOrders.length === 0 ? (
              <View style={styles.emptyCartContainer}>
                <Icon name="shopping-cart" size={80} color="#ccc" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <Text style={styles.emptyCartSubtext}>
                  Add some products to get started
                </Text>
              </View>
            ) : (
              <>
                {/* List */}
                <FlatList
                  data={addToCartOrders}
                  keyExtractor={item => item.prod_id.toString()}
                  style={styles.cartList}
                  contentContainerStyle={styles.cartListContent}
                  renderItem={({item}) => (
                    <View style={styles.cartItemContainer}>
                      <View style={styles.cartItemHeader}>
                        <Text style={styles.cartProductName} numberOfLines={2}>
                          {item.prod_name}
                        </Text>
                        <Text style={styles.quantityValue}>
                          {item.prod_qty}
                        </Text>
                      </View>

                      <View style={styles.cartItemDetails}>
                        <Text style={styles.detailText}>
                          Unit Price: {item.prod_unit_price}
                        </Text>
                        <Text style={styles.detailTextPrice}>
                          {(
                            parseFloat(item.prod_qty) *
                            parseFloat(item.prod_retail_price)
                          ).toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.cartItemActions}>
                        <TouchableOpacity
                          onPress={() => {
                            getEditOrder(item.prod_id.toString());
                            setModalVisible('EditOrder');
                          }}
                          style={styles.editBtn}>
                          <Icon name="edit" size={18} color="#2196F3" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => removeAddToCart(item.prod_id)}
                          style={styles.deleteBtn}>
                          <Icon name="delete" size={18} color="#FF5252" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />

                {/* Summary Footer */}
                <View style={styles.cartSummaryContainer}>
                  <View style={styles.cartTotalRow}>
                    <Text style={styles.cartTotalLabel}>Total Amount:</Text>
                    <Text style={styles.cartTotalValue}>
                      {orderTotal.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.proceedBtn}
                    onPress={() => {
                      setModalVisible('Checkout');
                    }}>
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
          visible={modalVisible === 'ordComplete'}
          animationType="slide"
          transparent
          presentationStyle="overFullScreen">
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
                    setOrderDetails([]);
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
                    <Text style={styles.companyName}>
                      {invoiceData?.config?.bus_name || 'N/A'}
                    </Text>
                  </View>
                  <Text style={styles.companyAddress}>
                    {invoiceData?.config?.bus_address || 'N/A'}
                  </Text>
                  <Text style={styles.companyContact}>
                    {invoiceData?.config?.bus_contact1 || 'Contact: N/A'}
                  </Text>
                </View>

                {/* Order Info Grid */}
                <View style={styles.orderInfoGrid}>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Invoice #</Text>
                    <Text style={styles.infoValue}>
                      {invoiceData?.order?.salordd_invoice_no ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Invoice Date</Text>
                    <Text style={styles.infoValue}>
                      {invoiceData?.order?.created_at
                        ? new Date(invoiceData.order.created_at)
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
                    <Text style={styles.infoLabel}>Customer</Text>
                    <Text style={styles.infoValue}>
                      {invoiceData?.order?.cust_name ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Contact:</Text>
                    <Text style={styles.infoValue}>
                      {invoiceData?.order?.cust_contact ?? 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>
                      {invoiceData?.order?.cust_address ?? 'N/A'}
                    </Text>
                  </View>
                </View>

                {/* Order Table Section */}
                <View style={styles.tableSection}>
                  <Text style={styles.sectionTitle}>Invoice Items</Text>

                  {/* Table Container */}
                  <View style={styles.tableContainer}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderText, styles.col1]}>
                        Sr.#
                      </Text>
                      <Text style={[styles.tableHeaderText, styles.col2]}>
                        Product
                      </Text>
                      <Text style={[styles.tableHeaderText, styles.col3]}>
                        QTY
                      </Text>
                      <Text style={[styles.tableHeaderText, styles.col4]}>
                        Price
                      </Text>
                    </View>

                    {/* Table Rows */}
                    <FlatList
                      data={orderDetails}
                      keyExtractor={(item, index) =>
                        item?.id ? item.id.toString() : index.toString()
                      }
                      renderItem={({item, index}) => (
                        <View style={[styles.tableRow]}>
                          <Text
                            style={[styles.tableCell, styles.col1]}
                            numberOfLines={2}>
                            {index + 1}
                          </Text>
                          <Text style={[styles.tableCell, styles.col2]}>
                            {item.prod_name}
                          </Text>
                          <Text style={[styles.tableCell, styles.col3]}>
                            {item.salordd_partial_qty}
                          </Text>
                          <Text style={[styles.tableCell, styles.col4]}>
                            {Number(item.salordd_sub_total).toLocaleString()}
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
                              {flex: 0.4, textAlign: 'left'},
                            ]}>
                            Totals
                          </Text>
                          <Text style={[styles.tableCell, {flex: 0.2}]}>
                            {orderDetails.reduce(
                              (sum, item) =>
                                sum +
                                parseFloat(item.salordd_partial_qty || '0'),
                              0,
                            )}
                          </Text>
                          <Text
                            style={[
                              styles.tableCell,
                              {flex: 0.4, textAlign: 'center'},
                            ]}>
                            {orderDetails
                              .reduce(
                                (sum, item) =>
                                  sum +
                                  parseFloat(item.salordd_sub_total || '0'),
                                0,
                              )
                              .toFixed(2)}
                          </Text>
                        </View>
                      }
                    />
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
              />

              <Text style={styles.editLabel}>Unit Price</Text>
              <TextInput
                style={styles.editInput}
                keyboardType="numeric"
                value={editForm.editProdPrice}
                onChangeText={t => editOnChange('editProdPrice', t)}
              />

              <TouchableOpacity
                style={styles.updateButton}
                onPress={updateOrder}>
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
              {/* Return Date */}
              <View style={styles.checkoutSection}>
                <Text style={styles.checkoutSectionTitle}>Order Date</Text>
                <TouchableOpacity
                  onPress={() => setShoworderDatePicker(true)}
                  style={styles.dateInput}>
                  <Icon name="event" size={20} color={backgroundColors.dark} />
                  <Text style={styles.dateText}>
                    {orderDate.toLocaleDateString()}
                  </Text>
                  <Icon
                    name="keyboard-arrow-down"
                    size={20}
                    color={backgroundColors.dark}
                  />
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
                    placeholder="Select Supplier"
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
                  <Text style={styles.amountValue}>
                    {orderTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.checkoutFooter}>
              <TouchableOpacity
                style={styles.completePurchaseBtn}
                onPress={completeOrder}>
                <Text style={styles.completePurchaseBtnText}>
                  Order Complete
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
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

  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
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
  productInfoContainer: {
    marginVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
  },
  inputGroup: {
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
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: backgroundColors.dark,
    fontSize: 16,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addToCartText: {
    color: backgroundColors.light,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
  },
  dateText: {
    flex: 1,
    color: backgroundColors.dark,
    fontSize: 16,
    marginLeft: 8,
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

  // Search Results Overlay
  searchResultsOverlay: {
    position: 'absolute',
    top: 190,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    zIndex: 1000,
    elevation: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 5,
    width: '90%',
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultText: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '600',
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
  cartList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cartListContent: {},
  cartItemContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    marginVertical: 6,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cartProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
    flex: 1,
    marginRight: 10,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#144272',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    minWidth: 50,
    textAlign: 'center',
  },
  cartItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  detailTextPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cartItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
  },
  editBtn: {
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 20,
  },
  emptyCartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  cartSummaryContainer: {
    padding: 20,
    backgroundColor: backgroundColors.light,
    borderTopWidth: 1,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    borderTopColor: '#e0e0e0',
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cartTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#144272',
  },
  cartTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  proceedBtn: {
    backgroundColor: backgroundColors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

  // Modal Styling
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

  // Footer
  modalFooter: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  thankYou: {
    fontSize: 16,
    color: '#144272',
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
    color: '#144272',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
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
    flex: 0.1,
  },
  col2: {
    flex: 0.3, // Product
  },
  col3: {
    flex: 0.2, // Qty
  },
  col4: {
    flex: 0.4, // Price
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
});
