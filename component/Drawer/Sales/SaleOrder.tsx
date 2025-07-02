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
  Modal,
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
        text1: 'Please Select Supplier First',
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
          type: 'error',
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
      }
    } catch (error) {
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
              Take Order
            </Text>
          </View>
        </View>

        <ScrollView
          style={{
            marginBottom: 10,
            paddingHorizontal: 10,
          }}>
          <View style={styles.section}>
            <TextInput
              style={[styles.input, {width: '100%'}]}
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
                        setProdName(item.prod_name);
                        setSelectedProduct(item);
                        setProdBarCode(item.value);
                        setProdStock(item.prod_qty);
                        setProdQty('');
                        setProdPrice(item.prod_price);
                        setShowResults(false);
                      }}>
                      <Text style={styles.resultText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

            <View style={[styles.row, {alignItems: 'center'}]}>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                {prodName ? prodName : 'Item Name'}
              </Text>

              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                {prodStock ? prodStock : 'Stock'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                {prodBarCode ? prodBarCode : 'BarCode'}
              </Text>

              <TextInput
                style={styles.inputSmall}
                placeholderTextColor={'white'}
                placeholder="Quantity"
                keyboardType="numeric"
                value={prodQty}
                onChangeText={t => setProdQty(t)}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.inputSmall, {width: '46%'}]}
                placeholderTextColor={'white'}
                placeholder="Unit Price"
                keyboardType="numeric"
                value={prodPrice}
                onChangeText={t => setProdPrice(t)}
              />

              <TouchableOpacity
                style={styles.addButton}
                onPress={saleOrderAddToCart}>
                <Text style={styles.addButtonTxt}>Add To Cart</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.row]}>
              <Text style={styles.inputSmall}>Invoice No:</Text>

              <View style={styles.dateInput}>
                <Text style={{color: 'white'}}>
                  {`${orderDate.toLocaleDateString()}`}
                </Text>
                <TouchableOpacity onPress={() => setShoworderDatePicker(true)}>
                  <Image
                    style={{
                      height: 20,
                      width: 20,
                      resizeMode: 'stretch',
                      alignItems: 'center',
                      tintColor: 'white',
                    }}
                    source={require('../../../assets/calendar.png')}
                  />
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
                </TouchableOpacity>
              </View>
            </View>

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
              style={styles.dropdown}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: '100%',
                marginTop: 8,
                maxHeight: 120,
                zIndex: 1000,
              }}
              labelStyle={{color: 'white'}}
              listItemLabelStyle={{color: '#144272'}}
              listMode="SCROLLVIEW"
            />

            <View style={[styles.row, {marginBottom: 5}]}>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                {currentVal
                  ? transformedCust.find(c => c.value === currentVal)?.label ||
                    'Customer Name'
                  : 'Customer Name'}
              </Text>
              <Text style={[styles.inputSmall, {backgroundColor: 'gray'}]}>
                {currentVal
                  ? custData.find(c => c.id.toString() === currentVal)
                      ?.cust_contact || 'Customer Number'
                  : 'Customer Number'}
              </Text>
            </View>

            <View style={[styles.row, {marginBottom: 10}]}>
              <Text
                style={[
                  styles.inputSmall,
                  {width: '100%', backgroundColor: 'gray'},
                ]}>
                {currentVal
                  ? custData.find(c => c.id.toString() === currentVal)
                      ?.cust_address || 'Customer Address'
                  : 'Customer Address'}
              </Text>
            </View>
          </View>

          <View>
            <FlatList
              data={addToCartOrders}
              keyExtractor={item => item.prod_id.toString()}
              scrollEnabled={false}
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
                        {item.prod_name}
                      </Text>

                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity
                          onPress={() => {
                            getEditOrder(item.prod_id.toString());
                            setModalVisible('EditOrder');
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
                            removeAddToCart(item.prod_id);
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
                        <Text style={styles.text}>Quantity:</Text>
                        <Text style={styles.text}>{item.prod_qty}</Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={styles.text}>Purchase Price:</Text>
                        <Text style={styles.text}>{item.prod_unit_price}</Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={styles.text}>Retail Price:</Text>
                        <Text style={styles.text}>
                          {item.prod_retail_price}
                        </Text>
                      </View>
                      <View style={styles.rowt}>
                        <Text style={styles.text}>Total Price:</Text>
                        <Text style={styles.text}>
                          {(
                            parseFloat(item.prod_qty) *
                            parseFloat(item.prod_cost_price)
                          ).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalText}>{orderTotal}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            justifyContent: 'center',
            marginBottom: 1,
          }}>
          <TouchableOpacity onPress={completeOrder}>
            <View
              style={{
                width: 80,
                height: 30,
                backgroundColor: 'white',
                borderRadius: 10,
                marginBottom: 10,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#144272',
                  marginTop: 5,
                  fontWeight: 'bold',
                }}>
                Check Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Invoice Modal */}
        <Modal
          visible={modalVisible === 'ordComplete'}
          animationType="slide"
          transparent={true}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <ScrollView>
                <Text style={styles.title}>Sale Invoice :</Text>

                <Text style={styles.shopName}>
                  {invoiceData?.config?.bus_name}
                </Text>
                <Text style={styles.shopAddress}>
                  {invoiceData?.config?.bus_address}
                </Text>
                <Text style={styles.phone}>
                  {invoiceData?.config?.bus_contact1}
                </Text>

                <View style={styles.modalRow}>
                  <Text>
                    Receipt#: {invoiceData?.order?.salordd_invoice_no}
                  </Text>
                  <Text>
                    {invoiceData?.order?.created_at
                      ? new Date(
                          invoiceData.order.created_at,
                        ).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : ''}
                  </Text>
                </View>

                <Text>Customer: {invoiceData?.order?.cust_name}</Text>
                <Text>Contact #: {invoiceData?.order?.cust_contact}</Text>
                <Text>Address: {invoiceData?.order?.cust_address}</Text>

                <View style={styles.tableHeader}>
                  <Text style={styles.cell}>sr#</Text>
                  <Text style={styles.cell}>Product</Text>
                  <Text style={styles.cell}>Qty</Text>
                  <Text style={styles.cell}>Price</Text>
                </View>

                <FlatList
                  data={orderDetails}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({item, index}) => (
                    <View style={styles.tableRow}>
                      <Text style={styles.cell}>{index + 1}</Text>
                      <Text style={styles.cell}>{item.prod_name}</Text>
                      <Text style={styles.cell}>
                        {item.salordd_partial_qty}
                      </Text>
                      <Text style={styles.cell}>
                        {parseFloat(item.salordd_sub_total).toFixed(2)}
                      </Text>
                    </View>
                  )}
                  scrollEnabled={false}
                />

                <View style={styles.totalRow}>
                  <Text style={{fontWeight: 'bold'}}>Total Items</Text>
                  <Text>{orderDetails.length}</Text>
                  <Text>
                    {orderDetails
                      .reduce(
                        (sum, item) =>
                          sum + parseFloat(item.salordd_sub_total || '0'),
                        0,
                      )
                      .toFixed(2)}
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
                    setOrderDetails([]);
                  }}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
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
              <View
                style={[
                  styles.header,
                  {borderBottomColor: '#144272', borderBottomWidth: 0.8},
                ]}>
                <Text style={styles.headerText}>Order Detail</Text>
                <TouchableOpacity onPress={() => setModalVisible('')}>
                  <Text style={[styles.closeText, {color: '#000'}]}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.editTitle}>Update Order</Text>

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

              <Text style={styles.label}>Unit Price</Text>
              <TextInput
                style={styles.editInput}
                keyboardType="numeric"
                value={editForm.editProdPrice}
                onChangeText={t => editOnChange('editProdPrice', t)}
              />

              <TouchableOpacity style={styles.button} onPress={updateOrder}>
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
  section: {
    borderColor: 'white',
    height: 'auto',
    borderRadius: 12,
    elevation: 15,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
    width: '46%',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    color: '#fff',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  addButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '46%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonTxt: {
    fontSize: 14,
    fontWeight: 'bold',
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
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },
  rowt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalContainer: {
    padding: 7,
    borderTopWidth: 1,
    borderTopColor: 'white',
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    width: '46%',
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderRadius: 6,
    borderColor: '#fff',
    height: 38,
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
  },
  title: {
    fontSize: 16,
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

  //Edit Modal Styling
  overlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalView: {
    width: '85%',
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
