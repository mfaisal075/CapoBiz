import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CartDetails {
  name: string;
  fatherName: string;
  address: string;
}

const initialCartDetails: CartDetails = {
  address: '',
  fatherName: '',
  name: '',
};

interface CartItems {
  prod_id: number;
  sold_qty: string;
  product_name: string;
  return_qty: number;
  return_subqty: number;
  price: string;
}

interface EditForm {
  prod_id: number;
  product_name: string;
  sold_qty: string;
  return_qty: number;
  return_subqty: number;
  price: string;
  uom_id: number;
  sub_uom: any;
}

const initialEditFrom: EditForm = {
  prod_id: 0,
  price: '',
  product_name: '',
  return_qty: 0,
  return_subqty: 0,
  sold_qty: '',
  uom_id: 0,
  sub_uom: null,
};

interface CartItemsWithout {
  prod_id: number;
  product_name: string;
  uom_id: number;
  sub_uom: string;
  return_qty: string;
  return_subqty: string;
  sub_price: string;
  price: string;
}

export default function SaleReturn() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartDetails, setCartDetails] =
    useState<CartDetails>(initialCartDetails);
  const [searchTermWithout, setSearchTermWithout] = useState('');
  const [searchResultsWithout, setSearchResultsWithout] = useState<any[]>([]);
  const [showResultsWithout, setShowResultsWithout] = useState(false);
  const [selectedProductWithout, setSelectedProductWithout] =
    useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<'with' | 'without'>(
    'with',
  );
  const [qty, setQty] = useState('');
  const [subQty, setSubQty] = useState('');
  const [cartItems, setCartItems] = useState<CartItems[]>([]);
  const [cartItemsWithout, setCartItemsWithout] = useState<CartItemsWithout[]>(
    [],
  );
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [orderTotalWithout, setOrderTotalWithout] = useState<number>(0);
  const [modal, setModal] = useState('');
  const [editForm, setEditForm] = useState<EditForm>(initialEditFrom);

  // Cart Animation
  const bounceAnim = useRef(new Animated.Value(0)).current;

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

  const editOnChange = (field: keyof EditForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle Search With
  const handleSearch = async (text: string) => {
    setSearchTerm(text);
    if (text.length > 0) {
      try {
        const response = await axios.post(`${BASE_URL}/srinvautocomplete`, {
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

  // Add Invoice to Cart
  const addInvoice = async (product: any) => {
    if (!product) {
      Toast.show({
        type: 'error',
        text1: 'Please select a product first',
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/addtoinvoicecart`,
        {
          search_invoice: product.value,
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
        setShowResults(false);
        getInvoiceCart();
        fetchCartItems();
        animateCartIcon();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Get Invoice Cart
  const getInvoiceCart = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadinvoicereturncart`);
      setCartDetails({
        address: res.data?.address,
        fatherName: res.data?.fathername,
        name: res.data?.cust_name,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Handle Search Without
  const handleSearchWithout = async (text: string) => {
    setSearchTermWithout(text);
    if (text.length > 0) {
      try {
        const response = await axios.post(`${BASE_URL}/autocomplete`, {
          term: text,
        });
        setSearchResultsWithout(response.data);
        setShowResultsWithout(true);
      } catch (error) {
        console.error('Search failed:', error);
        setShowResultsWithout(false);
      }
    } else {
      setShowResultsWithout(false);
    }
  };

  // Add Item to cart (Without)
  const handleAddToCart = async () => {
    if (!selectedProductWithout) {
      Toast.show({
        type: 'error',
        text1: 'Please select a product first',
      });
      return;
    }

    if (!qty) {
      Toast.show({
        type: 'error',
        text1: 'Please enter quantity',
      });
      return;
    }

    if (!subQty) {
      Toast.show({
        type: 'error',
        text1: 'Please enter sub quantity',
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addtoreturncart`, {
        search_name: selectedProductWithout.value,
        prod_id: selectedProductWithout.prod_id,
        return_qty: qty,
        return_subqty: subQty,
      });

      const data = res.data;

      if (data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Product added to cart successfully!',
        });
        setSearchTermWithout('');
        setShowResultsWithout(false);
        setQty('');
        setSubQty('');
        fetchCartItemsWithout();
        animateCartIcon();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Cart Items
  const fetchCartItems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadinvoicereturncart`);

      if (res.data.cartsession) {
        const cartItems = Object.values(res.data.cartsession).map(
          (item: any) => ({
            ...item,
            total: (item.return_qty * parseFloat(item.price)).toString(),
          }),
        );

        setCartItems(cartItems);

        if (res.data.order_total) {
          setOrderTotal(parseFloat(res.data.order_total));
        }
      } else {
        setCartItems([]);
        setOrderTotal(0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Cart Items (Without)
  const fetchCartItemsWithout = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadreturncart`);

      if (res.data.cartsession) {
        const cartItems = Object.values(res.data.cartsession).map(
          (item: any) => ({
            ...item,
            total: (item.return_qty * parseFloat(item.price)).toString(),
          }),
        );

        setCartItemsWithout(cartItems);

        if (res.data.order_total) {
          setOrderTotalWithout(parseFloat(res.data.order_total));
        }
      } else {
        setCartItemsWithout([]);
        setOrderTotalWithout(0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Edit Cart Item
  const getEditData = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editsalewithinvoicereturn?pid=${id}&_token=${token}`,
      );

      const item = res.data[0];

      setEditForm({
        price: item.price,
        prod_id: item.prod_id,
        sold_qty: item.sold_qty,
        product_name: item.product_name,
        return_qty: item.return_qty ?? 0,
        return_subqty: item.return_subqty ?? 0,
        uom_id: item.uom_id,
        sub_uom: item.sub_uom,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const updateCartItem = async () => {
    if (editForm.return_qty > parseFloat(editForm.sold_qty)) {
      Toast.show({
        type: 'error',
        text1: 'Warning',
        text2: 'Return Quantity cannot be greater than sold quantity.',
        visibilityTime: 1500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/updatesalewithinvoicereturn`, {
        pro_id: editForm.prod_id,
        product_name: editForm.product_name,
        sold_qty: editForm.sold_qty,
        uom_id: editForm.uom_id,
        sub_uom: editForm.sub_uom,
        return_qty: editForm.return_qty,
        return_subqty: editForm.return_subqty,
        price: editForm.price,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Return Order Updated Successfully!',
          visibilityTime: 1500,
        });
        setEditForm(initialEditFrom);
        setModal('');
        fetchCartItems();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Cart Item
  const delCartItem = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/removesaleinvoicereturn?id=${id}&_token=${token}`,
      );

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Cart item removed successfully!',
          visibilityTime: 1500,
        });
        fetchCartItems();
        setOrderTotal(0);
        setCartDetails(initialCartDetails);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Cart Item (Without)
  const delCartItemWithout = async (id: any) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/removesalereturn?id=${id}&_token=${token}`,
      );

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Cart item removed successfully!',
          visibilityTime: 1500,
        });
        fetchCartItemsWithout();
        setOrderTotalWithout(0);
        emptyCartWithoutInv();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Empty Cart
  const emptyCart = async () => {
    try {
      await axios.get(`${BASE_URL}/emptyinvoicecart`);
    } catch (error) {
      console.log(error);
    }
  };

  // Empty Cart (Without Invoice)
  const emptyCartWithoutInv = async () => {
    try {
      await axios.get(`${BASE_URL}/emptyreturncart`);
    } catch (error) {
      console.log(error);
    }
  };

  // Complete Sale Return
  const completeSaleReturn = async () => {
    if (orderTotal === 0) {
      Toast.show({
        type: 'error',
        text1: 'Warning',
        text2: 'Please Add some quantity to return!',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/productinvoicereturn`, {
        invoice_no: selectedProduct?.value,
        cust_id: null,
        sale_return: orderTotal,
      });

      const data = res.data;

      if (data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Product has been returned successfully!',
          visibilityTime: 1500,
        });
        fetchCartItems();
        setCartDetails(initialCartDetails);
        setOrderTotal(0);
        emptyCart();
      } else if (data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning',
          text2: 'Please Add some quantity to return!',
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while returning product!',
        visibilityTime: 2000,
      });
    }
  };

  // Complete Sale Return Without Invoice
  const completeSaleReturnWithout = async () => {
    if (orderTotalWithout === 0) {
      Toast.show({
        type: 'error',
        text1: 'Warning',
        text2: 'Please Add some quantity to return!',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/productreturn`, {
        sale_return: orderTotalWithout,
      });

      const data = res.data;

      if (data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Product has been returned successfully!',
          visibilityTime: 1500,
        });
        fetchCartItemsWithout();
        setOrderTotalWithout(0);
        emptyCartWithoutInv();
      } else if (data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Warning',
          text2: 'Please Add some quantity to return!',
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while returning product!',
        visibilityTime: 2000,
      });
    }
  };

  useEffect(() => {
    emptyCart();
    emptyCartWithoutInv();
    fetchCartItems();
    fetchCartItemsWithout();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Sale Return</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}
            onPress={() => {}}
            disabled>
            <Icon name="shopping-cart" size={24} color="transparent" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled>
          {/* Toggle Section */}
          <View style={styles.section}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedOption === 'with' && styles.toggleButtonActive,
                ]}
                onPress={() => setSelectedOption('with')}>
                <Text
                  style={[
                    styles.toggleButtonText,
                    selectedOption === 'with' && styles.toggleButtonTextActive,
                  ]}>
                  Return With Invoice
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedOption === 'without' && styles.toggleButtonActive,
                ]}
                onPress={() => setSelectedOption('without')}>
                <Text
                  style={[
                    styles.toggleButtonText,
                    selectedOption === 'without' &&
                      styles.toggleButtonTextActive,
                  ]}>
                  Return Without Invoice
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.newInvoiceBadge}>
              <Text style={styles.newInvoiceText}>NEW INV</Text>
            </View>
          </View>

          {selectedOption === 'with' ? (
            <View>
              {/* Search Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search Invoice</Text>

                <View style={styles.searchContainer}>
                  <View style={styles.searchInputWrapper}>
                    <Icon
                      name="search"
                      size={20}
                      color="rgba(255,255,255,0.7)"
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholderTextColor="rgba(255,255,255,0.7)"
                      placeholder="Search Invoice..."
                      value={searchTerm}
                      onChangeText={handleSearch}
                    />
                    <TouchableOpacity
                      onPress={() => addInvoice(selectedProduct)}>
                      <Icon name="add" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Customer Details */}
                {(cartDetails.name ||
                  cartDetails.fatherName ||
                  cartDetails.address) && (
                  <View style={styles.customerDetailsContainer}>
                    <Text style={styles.customerDetailsTitle}>
                      Customer Details
                    </Text>
                    <View style={styles.customerInfo}>
                      <View style={styles.customerCard}>
                        <Text style={styles.customerLabel}>Customer Name</Text>
                        <Text style={styles.customerValue}>
                          {cartDetails.name || 'Not specified'}
                        </Text>
                      </View>
                      <View style={styles.customerCard}>
                        <Text style={styles.customerLabel}>Father Name</Text>
                        <Text style={styles.customerValue}>
                          {cartDetails.fatherName || 'Not specified'}
                        </Text>
                      </View>
                      <View style={styles.customerCard}>
                        <Text style={styles.customerLabel}>Address</Text>
                        <Text style={styles.customerValue}>
                          {cartDetails.address || 'Not specified'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Cart Items */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Return Items</Text>

                {cartItems.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Icon
                      name="receipt"
                      size={40}
                      color="rgba(255,255,255,0.5)"
                    />
                    <Text style={styles.emptyText}>
                      No items added for return
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={cartItems}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={false}
                    renderItem={({item}) => (
                      <View style={styles.withCartItemContainer}>
                        <View style={styles.withCartItemHeader}>
                          <Text
                            style={styles.withCartProductName}
                            numberOfLines={2}>
                            {item.product_name}
                          </Text>
                          <View style={styles.itemActions}>
                            <TouchableOpacity
                              onPress={() => {
                                getEditData(item.prod_id);
                                setModal('Edit');
                              }}
                              style={styles.actionBtn}>
                              <Icon name="edit" size={20} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => delCartItem(item.prod_id)}
                              style={styles.actionBtn}>
                              <Icon name="delete" size={20} color="#FF5252" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.withCartItemDetails}>
                          <View style={styles.withDetailRow}>
                            <Text style={styles.withDetailLabel}>
                              Sold Qty:
                            </Text>
                            <Text style={styles.detailValue}>
                              {item.sold_qty}
                            </Text>
                          </View>
                          <View style={styles.withDetailRow}>
                            <Text style={styles.withDetailLabel}>
                              Return Qty:
                            </Text>
                            <Text style={styles.detailValue}>
                              {item.return_qty}
                            </Text>
                          </View>
                          <View style={styles.withDetailRow}>
                            <Text style={styles.withDetailLabel}>
                              Return Sub Qty:
                            </Text>
                            <Text style={styles.detailValue}>
                              {item.return_subqty}
                            </Text>
                          </View>
                          <View style={styles.withDetailRow}>
                            <Text style={styles.withDetailLabel}>Price:</Text>
                            <Text style={styles.detailValue}>
                              PKR {item.price}
                            </Text>
                          </View>
                          <View style={styles.withDetailRow}>
                            <Text style={styles.withDetailLabel}>Total:</Text>
                            <Text style={styles.detailValue}>
                              PKR{' '}
                              {(
                                item.return_qty * parseFloat(item.price)
                              ).toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  />
                )}

                {cartItems.length > 0 && (
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>
                      PKR {orderTotal.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Complete Button */}
              <TouchableOpacity
                style={[
                  styles.checkoutBtn,
                  cartItems.length === 0 && styles.checkoutBtnDisabled,
                ]}
                onPress={completeSaleReturn}
                disabled={cartItems.length === 0}>
                <Icon name="shopping-cart-checkout" size={20} color="white" />
                <Text style={styles.checkoutBtnText}>Complete Return</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* Search Section Without Invoice */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search Product</Text>

                <View style={styles.searchContainer}>
                  <View style={styles.searchInputWrapper}>
                    <Icon
                      name="search"
                      size={20}
                      color="rgba(255,255,255,0.7)"
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholderTextColor="rgba(255,255,255,0.7)"
                      placeholder="Search Product..."
                      value={searchTermWithout}
                      onChangeText={handleSearchWithout}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Quantity</Text>
                    <TextInput
                      style={styles.input}
                      placeholderTextColor="rgba(255,255,255,0.7)"
                      placeholder="Enter quantity"
                      value={qty}
                      onChangeText={setQty}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Sub Quantity</Text>
                    <TextInput
                      style={styles.input}
                      placeholderTextColor="rgba(255,255,255,0.7)"
                      placeholder="Enter sub quantity"
                      value={subQty}
                      onChangeText={setSubQty}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={handleAddToCart}>
                  <Icon
                    name="add"
                    size={20}
                    color="#144272"
                    style={{marginRight: 8}}
                  />
                  <Text style={styles.addToCartText}>Add Product</Text>
                </TouchableOpacity>
              </View>

              {/* Complete Button Without Invoice */}
              <TouchableOpacity
                style={[
                  styles.checkoutBtn,
                  cartItemsWithout.length === 0 && styles.checkoutBtnDisabled,
                ]}
                onPress={completeSaleReturnWithout}
                disabled={cartItemsWithout.length === 0}>
                <Icon name="shopping-cart-checkout" size={20} color="white" />
                <Text style={styles.checkoutBtnText}>Complete Return</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{height: 100}} />
        </ScrollView>

        {/* Search Results Overlay */}
        {searchTerm.length > 0 && showResults && searchResults.length > 0 && (
          <View style={styles.searchResultsOverlay}>
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  key={item.prod_id}
                  style={styles.resultItem}
                  onPress={() => {
                    setSearchTerm(item.value);
                    setSelectedProduct(item);
                    setShowResults(false);
                    getInvoiceCart();
                    fetchCartItems();
                  }}>
                  <Text style={styles.resultText}>
                    {item.label.replace(/\n/g, ' ')}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Search Results Overlay Without */}
        {searchTermWithout.length > 0 &&
          showResultsWithout &&
          searchResultsWithout.length > 0 && (
            <View style={styles.searchResultsOverlay}>
              <FlatList
                data={searchResultsWithout}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity
                    key={item.prod_id}
                    style={styles.resultItem}
                    onPress={() => {
                      setSearchTermWithout(item.value);
                      setSelectedProductWithout(item);
                      setShowResultsWithout(false);
                      fetchCartItemsWithout();
                    }}>
                    <Text style={styles.resultText}>
                      {item.label.replace(/\n/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

        {/* Floating Cart Button */}
        {selectedOption === 'without' && (
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
              onPress={() => setModal('Cart')}>
              <Icon name="shopping-cart" size={24} color="white" />
              {cartItemsWithout.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartItemsWithout.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Cart Modal */}
        <Modal
          visible={modal === 'Cart'}
          animationType="slide"
          transparent={false}>
          <SafeAreaView style={styles.cartModalContainer}>
            {/* Header */}
            <View style={styles.cartModalHeader}>
              <TouchableOpacity
                onPress={() => setModal('')}
                style={styles.cartModalCloseBtn}>
                <Icon name="arrow-back" size={24} color="#144272" />
              </TouchableOpacity>
              <Text style={styles.cartModalTitle}>Shopping Cart</Text>
              <Text style={styles.cartItemCount}>
                {cartItemsWithout.length} items
              </Text>
            </View>

            {/* Empty Cart */}
            {cartItemsWithout.length === 0 ? (
              <View style={styles.emptyCartContainer}>
                <Icon name="shopping-cart" size={80} color="#ccc" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <Text style={styles.emptyCartSubtext}>
                  Add some products to get started
                </Text>
              </View>
            ) : (
              <>
                {/* Cart List */}
                <FlatList
                  data={cartItemsWithout}
                  keyExtractor={item => item.prod_id.toString()}
                  style={styles.cartList}
                  contentContainerStyle={styles.cartListContent}
                  renderItem={({item}) => (
                    <View style={styles.cartItemContainer}>
                      <View style={styles.cartItemHeader}>
                        <Text style={styles.cartProductName} numberOfLines={2}>
                          {item.product_name}
                        </Text>
                        <Text style={styles.quantityValue}>
                          {item.return_qty}
                        </Text>
                      </View>

                      <View style={styles.cartItemDetails}>
                        <Text style={styles.detailText}>PKR {item.price}</Text>
                        <Text style={styles.detailTextPrice}>
                          PKR{' '}
                          {(
                            parseFloat(item.sub_price) + parseFloat(item.price)
                          ).toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.cartItemDetails}>
                        <Text style={styles.detailText}>
                          Sub Price: PKR {item.sub_price}
                        </Text>
                        <TouchableOpacity
                          onPress={() => delCartItemWithout(item.prod_id)}
                          style={styles.deleteBtn}>
                          <Icon name="delete" size={20} color="#FF5252" />
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
                      PKR {orderTotalWithout.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.proceedBtn}
                    onPress={() => {
                      setModal('');
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

        {/* Edit Modal With Invoice */}
        <Modal
          visible={modal === 'Edit'}
          transparent={true}
          animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.editModalView}>
              <View style={styles.editModalHeader}>
                <Text style={styles.editModalTitle}>Edit Return Item</Text>
                <TouchableOpacity onPress={() => setModal('')}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.editModalContent}>
                <View style={styles.editFormGroup}>
                  <Text style={styles.editLabel}>Item Name</Text>
                  <TextInput
                    style={[styles.editInput, styles.disabledInput]}
                    value={editForm.product_name}
                    editable={false}
                  />
                </View>

                <View style={styles.editFormGroup}>
                  <Text style={styles.editLabel}>
                    Sold Quantity <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.editInput, styles.disabledInput]}
                    value={editForm.sold_qty}
                    editable={false}
                  />
                </View>

                <View style={styles.editFormGroup}>
                  <Text style={styles.editLabel}>Return Quantity</Text>
                  <TextInput
                    style={styles.editInput}
                    keyboardType="numeric"
                    value={
                      editForm.return_qty ? String(editForm.return_qty) : ''
                    }
                    onChangeText={t => editOnChange('return_qty', t)}
                    placeholder="Enter return quantity"
                  />
                </View>

                <View style={styles.editFormGroup}>
                  <Text style={styles.editLabel}>Return Sub Quantity</Text>
                  <TextInput
                    style={[styles.editInput, styles.disabledInput]}
                    value={
                      editForm.return_subqty
                        ? String(editForm.return_subqty)
                        : '0'
                    }
                    editable={false}
                  />
                </View>

                <View style={styles.editFormGroup}>
                  <Text style={styles.editLabel}>Price</Text>
                  <TextInput
                    style={[styles.editInput, styles.disabledInput]}
                    value={editForm.price}
                    editable={false}
                  />
                </View>

                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={updateCartItem}>
                  <Icon
                    name="update"
                    size={20}
                    color="white"
                    style={{marginRight: 8}}
                  />
                  <Text style={styles.updateButtonText}>Update Cart</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Toast />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  background: {
    flex: 1,
  },
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
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  toggleButtonActive: {
    backgroundColor: 'white',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  toggleButtonTextActive: {
    color: '#144272',
  },
  newInvoiceBadge: {
    alignSelf: 'flex-end',
    backgroundColor: 'gray',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  newInvoiceText: {
    color: 'white',
    fontSize: 12,
  },
  searchContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 12,
  },
  customerDetailsContainer: {
    marginTop: 16,
  },
  customerDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  customerInfo: {
    marginTop: 8,
  },
  customerCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  customerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  customerValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    width: '48%',
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 16,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addToCartText: {
    color: '#144272',
    fontSize: 16,
    fontWeight: 'bold',
  },
  withCartItemContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  withCartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  withCartProductName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  itemActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  withCartItemDetails: {
    marginTop: 8,
  },
  withDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  withDetailLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  detailValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  totalLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 10,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 16,
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutBtnDisabled: {
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
  },
  checkoutBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  searchResultsOverlay: {
    position: 'absolute',
    top: 340,
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
    color: '#144272',
    fontSize: 14,
  },
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
  cartList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cartListContent: {},
  cartItemContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cartProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
    flex: 1,
  },
  quantityValue: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#144272',
    minWidth: 30,
    textAlign: 'center',
  },
  cartItemDetails: {
    marginTop: 4,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 2,
  },
  detailTextPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  deleteBtn: {
    padding: 5,
  },
  cartSummaryContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Edit Modal Styling
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#144272',
  },
  editModalContent: {
    padding: 20,
  },
  editFormGroup: {
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  required: {
    color: '#FF5252',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
