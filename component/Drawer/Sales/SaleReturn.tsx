import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
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
          search_invoice: product.value, // use passed product
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

      const item = res.data[0]; // ✅ pick the first object

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
        invoice_no: selectedProduct.value,
        cust_id: null, // check if API really expects null
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
  }, []);

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
              Sale Return
            </Text>
          </View>
        </View>

        {/* Main Content Container */}
        <View style={styles.mainContent}>
          {/* Toggle Buttons */}
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => setSelectedOption('with')}>
              <View
                style={[
                  styles.toggleButton,
                  selectedOption === 'with'
                    ? styles.selectedButton
                    : styles.unselectedButton,
                ]}>
                <Text
                  style={[
                    styles.toggleButtonText,
                    selectedOption === 'with'
                      ? styles.selectedText
                      : styles.unselectedText,
                  ]}>
                  Return With Invoice
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelectedOption('without')}>
              <View
                style={[
                  styles.toggleButton,
                  selectedOption === 'without'
                    ? styles.selectedButton
                    : styles.unselectedButton,
                ]}>
                <Text
                  style={[
                    styles.toggleButtonText,
                    selectedOption === 'without'
                      ? styles.selectedText
                      : styles.unselectedText,
                  ]}>
                  Return Without Invoice
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* NEW INV Badge */}
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderColor: '#fff',
              marginHorizontal: 8,
              width: '30%',
              backgroundColor: 'gray',
              marginVertical: 5,
            }}>
            <Text style={{color: '#fff'}}>NEW INV</Text>
          </View>

          {/* Content Based on Selected Option */}
          <View style={styles.contentContainer}>
            {selectedOption === 'with' ? (
              <>
                {/* Search Input */}
                <View style={{paddingHorizontal: 10}}>
                  <TextInput
                    style={[styles.input, {width: '100%'}]}
                    placeholderTextColor={'white'}
                    placeholder="Search Invoice..."
                    value={searchTerm}
                    onChangeText={handleSearch}
                  />

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
                              setShowResults(false);
                              setSelectedProduct(item);
                              addInvoice(item);
                              getInvoiceCart();
                              fetchCartItems();
                            }}>
                            <Text style={styles.resultText}>{item.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                </View>

                {/* Customer Details */}
                <View
                  style={{
                    paddingHorizontal: 10,
                    marginVertical: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                    {cartDetails.name ? cartDetails.name : 'Name'}
                  </Text>
                  <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                    {cartDetails.fatherName
                      ? cartDetails.fatherName
                      : 'Father Name'}
                  </Text>
                </View>

                <View style={{paddingHorizontal: 10}}>
                  <Text
                    style={[
                      styles.inputSmall,
                      {width: '100%', backgroundColor: 'gray'},
                    ]}>
                    {cartDetails.address ? cartDetails.address : 'Address'}
                  </Text>
                </View>

                {/* Cart Items List */}
                <View style={styles.cartListContainer}>
                  <FlatList
                    data={cartItems}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{paddingBottom: 20}}
                    renderItem={({item}) => (
                      <View style={{padding: 5}}>
                        <View style={styles.table}>
                          <View style={styles.tablehead}>
                            <Text
                              style={{
                                color: '#144272',
                                fontWeight: 'bold',
                                marginLeft: 5,
                                marginTop: 5,
                              }}>
                              {item.product_name}
                            </Text>

                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <TouchableOpacity
                                onPress={() => {
                                  getEditData(item.prod_id);
                                  setModal('Edit');
                                }}>
                                <Icon
                                  name="edit"
                                  size={20}
                                  color="#144272"
                                  style={{
                                    alignSelf: 'center',
                                    marginRight: 10,
                                  }}
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => {
                                  delCartItem(item.prod_id);
                                }}>
                                <Icon
                                  name="delete"
                                  size={20}
                                  color="#B22222"
                                  style={{
                                    alignSelf: 'center',
                                    marginRight: 5,
                                  }}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View style={styles.infoRow}>
                            <View style={styles.rowt}>
                              <Text style={styles.txt}>Sold Quantity:</Text>
                              <Text style={styles.txt}>{item.sold_qty}</Text>
                            </View>
                            <View style={styles.rowt}>
                              <Text style={styles.txt}>Return Quantity:</Text>
                              <Text style={styles.txt}>{item.return_qty}</Text>
                            </View>
                            <View style={styles.rowt}>
                              <Text style={styles.txt}>
                                Return Sub Quantity:
                              </Text>
                              <Text style={styles.txt}>
                                {item.return_subqty}
                              </Text>
                            </View>
                            <View style={styles.rowt}>
                              <Text style={styles.txt}>Price:</Text>
                              <Text style={styles.txt}>{item.price}</Text>
                            </View>
                            <View style={[styles.rowt, {marginBottom: 5}]}>
                              <Text style={styles.txt}>Total Price:</Text>
                              <Text style={styles.txt}>
                                {item.return_qty * parseFloat(item.price)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Cart is empty.</Text>
                      </View>
                    }
                  />
                </View>
              </>
            ) : (
              <>
                {/* Search Product Without Invoice */}
                <View style={{paddingHorizontal: 10}}>
                  <TextInput
                    style={[styles.input, {width: '100%'}]}
                    placeholderTextColor={'white'}
                    placeholder="Search Product..."
                    value={searchTermWithout}
                    onChangeText={handleSearchWithout}
                  />

                  {searchTermWithout.length > 0 &&
                    showResultsWithout &&
                    searchResultsWithout.length > 0 && (
                      <View style={[styles.resultsContainer, {marginHorizontal: 10}]}>
                        {searchResultsWithout.map((item: any) => (
                          <TouchableOpacity
                            key={item.prod_id}
                            style={styles.resultItem}
                            onPress={() => {
                              setSearchTermWithout(item.value);
                              setShowResultsWithout(false);
                              setSelectedProductWithout(item);
                              fetchCartItemsWithout();
                            }}>
                            <Text style={styles.resultText}>{item.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                </View>

                {/* Quantity Inputs */}
                <View
                  style={{
                    paddingHorizontal: 10,
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    marginVertical: 10,
                  }}>
                  <TextInput
                    style={styles.inputSmall}
                    placeholderTextColor={'white'}
                    placeholder="Quantity"
                    keyboardType="numeric"
                    value={qty}
                    onChangeText={t => setQty(t)}
                  />

                  <TextInput
                    style={styles.inputSmall}
                    placeholderTextColor={'white'}
                    placeholder="Sub Quantity"
                    keyboardType="numeric"
                    value={subQty}
                    onChangeText={t => setSubQty(t)}
                  />
                </View>

                {/* Add Button */}
                <View style={{paddingHorizontal: 10}}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddToCart}>
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {/* Cart Items List Without Invoice */}
                <View style={styles.cartListContainer}>
                  <FlatList
                    data={cartItemsWithout}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{paddingBottom: 20}}
                    renderItem={({item}) => (
                      <View style={{padding: 5}}>
                        <View style={styles.table}>
                          <View style={styles.tablehead}>
                            <Text
                              style={{
                                color: '#144272',
                                fontWeight: 'bold',
                                marginLeft: 5,
                                marginTop: 5,
                              }}>
                              {item.product_name}
                            </Text>

                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <TouchableOpacity
                                onPress={() => {
                                  delCartItemWithout(item.prod_id);
                                }}>
                                <Icon
                                  name="delete"
                                  size={20}
                                  color="#B22222"
                                  style={{
                                    alignSelf: 'center',
                                    marginRight: 5,
                                  }}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View style={styles.infoRow}>
                            <View style={styles.rowt}>
                              <Text style={styles.txt}>Return Quantity:</Text>
                              <Text style={styles.txt}>{item.return_qty}</Text>
                            </View>
                            <View style={styles.rowt}>
                              <Text style={styles.txt}>Return Sub Quantity:</Text>
                              <Text style={styles.txt}>{item.return_subqty}</Text>
                            </View>
                            <View style={styles.rowt}>
                              <Text style={styles.txt}>Sub Quantity Price:</Text>
                              <Text style={styles.txt}>{item.sub_price}</Text>
                            </View>
                            <View style={styles.rowt}>
                              <Text style={styles.txt}>Price:</Text>
                              <Text style={styles.txt}>{item.price}</Text>
                            </View>
                            <View style={styles.rowt}>
                              <Text style={[styles.txt, {marginBottom: 5}]}>
                                Total Price:
                              </Text>
                              <Text style={[styles.txt, {marginBottom: 5}]}>
                                {(
                                  parseFloat(item.sub_price) +
                                  parseFloat(item.price)
                                ).toFixed(2)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Cart is empty.</Text>
                      </View>
                    }
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* Bottom Section - Total and Complete Button */}
        <View style={styles.bottomSection}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total: {selectedOption === 'with' ? orderTotal : orderTotalWithout.toFixed(2)}
            </Text>
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={selectedOption === 'with' ? completeSaleReturn : completeSaleReturnWithout}>
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Edit Modal With Invoice */}
        <Modal
          visible={modal === 'Edit'}
          transparent={true}
          animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.editModalView}>
              <View
                style={[
                  styles.header,
                  {borderBottomColor: '#144272', borderBottomWidth: 0.8},
                ]}>
                <Text style={styles.headerText}>Return with Invoice</Text>
                <TouchableOpacity onPress={() => setModal('')}>
                  <Text style={[styles.closeText, {color: '#000'}]}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.editLabel}>Item name</Text>
              <TextInput
                style={[styles.editInput, styles.disabledInput]}
                value={editForm.product_name}
                editable={false}
              />

              <Text style={styles.editLabel}>
                Sold Quantity <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.editInput, styles.disabledInput]}
                value={editForm.sold_qty}
                editable={false}
              />

              <Text style={styles.editLabel}>Return Quantity</Text>
              <TextInput
                style={styles.editInput}
                keyboardType="numeric"
                value={editForm.return_qty ? String(editForm.return_qty) : ''}
                onChangeText={t => editOnChange('return_qty', t)}
              />

              <Text style={styles.editLabel}>Return Sub Quantity</Text>
              <TextInput
                style={[styles.editInput, styles.disabledInput]}
                value={
                  editForm.return_subqty ? String(editForm.return_subqty) : '0'
                }
                editable={false}
              />

              <Text style={styles.editLabel}>Price</Text>
              <TextInput
                style={[styles.editInput, styles.disabledInput]}
                value={editForm.price}
                editable={false}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  updateCartItem();
                }}>
                <Text style={styles.buttonText}>Update Cart</Text>
              </TouchableOpacity>
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
  mainContent: {
    flex: 1,
    paddingBottom: 80, // Space for bottom section
  },
  contentContainer: {
    flex: 1,
  },
  cartListContainer: {
    flex: 1,
    marginTop: 10,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopColor: '#fff',
    borderTopWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  completeButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  completeButtonText: {
    color: '#144272',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    height: 300,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    color: 'white',
    height: 38,
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    width: '46%',
    color: '#fff',
    height: 38,
  },
  addButton: {
    marginBottom: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    height: 38,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#144272',
  },
  infoRow: {
    marginTop: 5,
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 'auto',
    width: 314,
    borderRadius: 10,
  },
  tablehead: {
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 10,
    borderTopLeftRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txt: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  toggleButton: {
    margin: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 30,
    borderWidth: 1,
    borderColor: 'white',
  },
  selectedButton: {
    backgroundColor: 'white',
    borderColor: '#144272',
  },
  unselectedButton: {
    backgroundColor: 'transparent',
  },
  toggleButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  selectedText: {
    color: '#144272',
  },
  unselectedText: {
    color: 'white',
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
    maxHeight: 200,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  resultText: {
    color: '#144272',
  },
  //Edit Modal Styling
  overlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalView: {
    width: '85%',
    height: 'auto',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editCloseText: {
    fontSize: 20,
    color: '#888',
  },
  editTitle: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
  },
  editLabel: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  required: {
    color: 'red',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
    fontSize: 14,
  },
  disabledInput: {
    backgroundColor: '#f2f2f2',
    color: '#999',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});