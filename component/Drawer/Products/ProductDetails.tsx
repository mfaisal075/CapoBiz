import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useUser} from '../../CTX/UserContext';
import {SafeAreaView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import backgroundColors from '../../Colors';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {Modal} from 'react-native';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import {Checkbox} from 'react-native-paper';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';

interface Product {
  pro: {
    id: number;
    prod_name: string;
    prod_generic_name: string;
    prod_manage_stock: string;
    pct_code: string;
    prod_UPC_EAN: string;
    prod_sup_id: string;
    prod_type: string;
    prod_image: string;
    prod_pcat_id: string;
    prod_ums_id: string;
    prod_costprice: string;
    prod_retailprice: string;
    prod_discount: string;
    prod_fretailprice: string;
    prod_expirydate: string;
    prod_have_sub_uom: string;
    prod_sub_uom: string;
    prod_master_uom: string;
    prod_sub_price: string;
    prod_qty: string;
    prod_sub_qty: string;
    prod_reorder_qty: string;
    prod_equivalent: string;
    prod_f_equivalent: string;
  };
  uom: {
    id: number;
    ums_name: string;
  };
  cat: {
    id: number;
    pcat_name: string;
  };
  supp: {
    id: string;
    sup_area_id: string;
    sup_name: string;
    sup_company_name: string;
    sup_agancy_name: string;
    sup_address: string;
    sup_contact: string;
    sup_sec_contact: string;
    sup_third_contact: string;
    sup_email: string;
    sup_is_customer: string;
    sup_image: string;
    sup_payment_type: string;
    sup_transaction_type: string;
    sup_opening_balance: string;
    sup_status: string;
  };
}

interface EditProduct {
  id: number;
  prod_name: string;
  prod_generic_name: string;
  pct_code: string;
  prod_UPC_EAN: string;
  prod_inventory: string;
  prod_sup_id: string;
  prod_status: string;
  prod_type: string;
  prod_manage_stock: string;
  prod_image: string;
  prod_pcat_id: string;
  prod_ums_id: string;
  prod_costprice: string;
  prod_retailprice: string;
  prod_discount: string;
  prod_fretailprice: string;
  prod_expirydate: Date;
  prod_have_sub_uom: string;
  prod_sub_uom: string;
  prod_master_uom: string;
  prod_sub_price: string;
  prod_qty: string;
  prod_sub_qty: string;
  prod_reorder_qty: string;
  prod_equivalent: string;
  prod_f_equivalent: string;
  created_at: string;
  updated_at: string;
}

const initialEditProduct: EditProduct = {
  id: 0,
  prod_name: '',
  prod_generic_name: '',
  pct_code: '',
  prod_UPC_EAN: '',
  prod_inventory: '',
  prod_sup_id: '',
  prod_status: '',
  prod_type: '',
  prod_manage_stock: '',
  prod_image: '',
  prod_pcat_id: '',
  prod_ums_id: '',
  prod_costprice: '',
  prod_retailprice: '',
  prod_discount: '',
  prod_fretailprice: '',
  prod_expirydate: new Date(),
  prod_have_sub_uom: '',
  prod_sub_uom: '',
  prod_master_uom: '',
  prod_sub_price: '',
  prod_qty: '',
  prod_sub_qty: '',
  prod_reorder_qty: '',
  prod_equivalent: '',
  prod_f_equivalent: '',
  created_at: '',
  updated_at: '',
};

interface Categories {
  id: number;
  pcat_name: string;
}

interface UOM {
  id: number;
  ums_name: string;
}

interface Suppliers {
  id: string;
  sup_name: string;
  sup_company_name: string;
}

const ProductDetails = ({navigation, route}: any) => {
  const {id} = route.params;
  const {token} = useUser();
  const [modalVisible, setModalVisible] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<EditProduct>(initialEditProduct);
  const [genBarCode, setGenBarCode] = useState<string[]>([]);
  const [editCatValue, setEditCatValue] = useState<string | null>('');
  const [editUomValue, setEditUomValue] = useState<string | null>('');
  const [supplier, setSupplier] = useState<string[]>([]);
  const [editSupValue, setEditSupValue] = useState<string | null>('');
  const [expiry, setExpiry] = useState<string[]>([]);
  const [barCode, setBarCode] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [catItems, setCatItems] = useState<Categories[]>([]);
  const transformedCat = catItems.map(cat => ({
    label: cat.pcat_name,
    value: String(cat.id),
  }));
  const [editCatOpen, setEditCatOpen] = useState(false);
  const [uomItems, setUomItems] = useState<UOM[]>([]);
  const transformedUom = uomItems.map(cat => ({
    label: cat.ums_name,
    value: cat.ums_name,
  }));
  const [editUomOpen, setEditUomOpen] = useState(false);
  const [supItems, setSupItems] = useState<Suppliers[]>([]);
  const transformedSup = supItems.map(sup => ({
    label: `${sup.sup_name}_${sup.sup_company_name}`,
    value: String(sup.id),
  }));
  const [editSupOpen, setEditSupOpen] = useState(false);

  //Edit Form OnChange
  const editOnChnage = (field: keyof EditProduct, value: string | Date) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const editOnDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || editForm.prod_expirydate;
    setShowStartDatePicker(false);
    editOnChnage('prod_expirydate', currentDate);
  };

  //Get product details
  const fetchProdDetails = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/productsshow?id=${id}&_token=${token}`,
      );
      setProduct(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Categories
  const fetchCatgories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcombocat`);
      setCatItems(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch UOM
  const fetchUom = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcombouom`);
      setUomItems(res.data);
    } catch (error) {
      console.log();
    }
  };

  // Fetch Suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadsuppliers`);
      setSupItems(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Product
  const delProduct = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/productdelete`, {
        id: id,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Product has been deleted successfully!',
          visibilityTime: 1500,
        });
        setModalVisible('');
        navigation.navigate('Products');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Bar Code
  const getBarCode = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/auto_gen_barcode`);
      setBarCode(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get data to Update
  const getEditData = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/editproduct?id=${id}&_token=${token}`,
      );
      setEditForm(res.data.pro);
      setEditCatValue(
        res.data.pro.prod_pcat_id ? String(res.data.pro.prod_pcat_id) : '',
      );
      setEditUomValue(
        res.data.uom.ums_name ? String(res.data.uom.ums_name) : '',
      );
      setEditSupValue(
        res.data.pro.prod_sup_id ? String(res.data.pro.prod_sup_id) : '',
      );
    } catch (error) {
      console.log(error);
    }
  };

  // Edit Product
  const updateProduct = async () => {
    if (!(editForm.prod_name ?? '').trim()) {
      Toast.show({
        type: 'error',
        text1: 'Product Name is required',
        visibilityTime: 1500,
      });
      return;
    }

    if (!genBarCode.includes('on') && !(editForm.prod_UPC_EAN ?? '').trim()) {
      Toast.show({
        type: 'error',
        text1: 'Barcode is required',
        visibilityTime: 1500,
      });
      return;
    }

    if (!editCatValue) {
      Toast.show({
        type: 'error',
        text1: 'Category is required',
        visibilityTime: 1500,
      });
      return;
    }

    if (!editUomValue) {
      Toast.show({
        type: 'error',
        text1: 'UOM is required',
        visibilityTime: 1500,
      });
      return;
    }

    if (!(editForm.prod_costprice ?? '').trim()) {
      Toast.show({
        type: 'error',
        text1: 'Cost Price is required',
        visibilityTime: 1500,
      });
      return;
    }

    if (!(editForm.prod_retailprice ?? '').trim()) {
      Toast.show({
        type: 'error',
        text1: 'Retail Price is required',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/updateproduct`, {
        pro_id: editForm.id,
        product_name: (editForm.prod_name ?? '').trim(),
        generic_name: (editForm.prod_generic_name ?? '').trim(),
        ...(genBarCode.includes('on') && {autobarcode: 'on'}),
        upc_ean: (editForm.prod_UPC_EAN ?? '').trim(),
        ...(expiry.includes('on') && {apply_expiry: 'on'}),
        expiry_date: editForm.prod_expirydate,
        cat_id: editCatValue,
        uom_id: editUomValue,
        cost_price: (editForm.prod_costprice ?? '').trim(),
        retail_price: (editForm.prod_retailprice ?? '').trim(),
        discount: (editForm.prod_discount ?? '').trim(),
        final_price: editForm.prod_fretailprice,
        ...(supplier.includes('on') && {supplier: 'on'}),
        supp_id: editSupValue,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Updated!',
          text2: 'Product has been updated successfully!',
          visibilityTime: 1500,
        });
        setModalVisible('');
        setEditForm(initialEditProduct);
        setGenBarCode([]);
        setEditCatValue('');
        setEditUomValue('');
        setSupplier([]);
        setEditSupValue('');
        setExpiry([]);
        setBarCode('');
        fetchProdDetails();

        setTimeout(() => {
          setModalVisible('Success');
        }, 500);
      } else if (res.status === 200 && data.status === 102) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This Barcode Already exist!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 101) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This product name already exists!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 206) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'In sub uom sale price should be greater!',
          visibilityTime: 200,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProdDetails();
    fetchCatgories();
    fetchUom();
    fetchSuppliers();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Products');
            }}>
            <Icon
              name="chevron-left"
              size={28}
              color={backgroundColors.light}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerBtn]}
          onPress={() => setModalVisible('DeleteProd')}>
          <Icon name="delete" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Details */}
      <ScrollView
        style={styles.detailsContainer}
        showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarBox}>
          <Image
            source={require('../../../assets/product.png')}
            style={styles.avatar}
          />
          <Text style={styles.custName}>{product?.pro.prod_name}</Text>
        </View>

        {/* Inner Details */}
        <View style={styles.innerDetails}>
          <View style={styles.innerHeader}>
            <Text style={styles.headerText}>Product Details</Text>
            <TouchableOpacity
              style={{flexDirection: 'row', gap: 5}}
              onPress={() => {
                getEditData();
                setModalVisible('Edit');
              }}>
              <Text style={styles.editText}>Edit</Text>
              <Icon
                name="square-edit-outline"
                size={18}
                color={backgroundColors.dark}
              />
            </TouchableOpacity>
          </View>

          {/* Details */}
          <View style={styles.detailsView}>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Product Name</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_name ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Second Name</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_generic_name ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>UPC_EAN</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_UPC_EAN ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Expiry Date</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_expirydate
                  ? new Date(product.pro.prod_expirydate).toLocaleDateString(
                      'en-US',
                      {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      },
                    )
                  : '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Reorder</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_reorder_qty ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>
                {product?.cat?.pcat_name ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>UOM</Text>
              <Text style={styles.value}>{product?.uom?.ums_name ?? '--'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Sub UOM</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_sub_uom ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Master UOM</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_master_uom ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Sub to Master UOM Equivalent</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_equivalent ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Sub UOM Price</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_sub_price ?? '--'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Manage Stock</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_manage_stock === 'Y' ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Opening Quantity</Text>
              <Text style={styles.value}>{product?.pro?.prod_qty ?? '0'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Cost Price</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_costprice ?? '0'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Retail Price</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_retailprice ?? '0'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Discount(%)</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_discount ?? '0'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Final Price</Text>
              <Text style={styles.value}>
                {product?.pro?.prod_fretailprice ?? '0'}
              </Text>
            </View>
            <View style={[styles.detailsRow, {borderBottomWidth: 0}]}>
              <Text style={styles.label}>Supplier Name</Text>
              <Text style={styles.value}>
                {product?.supp?.sup_name ?? '--'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/*Delete Modal*/}
      <Modal
        visible={modalVisible === 'DeleteProd'}
        transparent
        animationType="fade">
        <View style={styles.addModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.delAnim}>
              <LottieView
                style={{flex: 1}}
                source={require('../../../assets/warning.json')}
                autoPlay
                loop={false}
              />
            </View>

            {/* Title */}
            <Text style={styles.deleteModalTitle}>Are you sure?</Text>

            {/* Subtitle */}
            <Text style={styles.deleteModalMessage}>
              You won’t be able to revert this record!
            </Text>

            {/* Buttons */}
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.deleteModalBtn, {backgroundColor: '#e0e0e0'}]}
                onPress={() => setModalVisible('')}>
                <Text style={[styles.deleteModalBtnText, {color: '#144272'}]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteModalBtn, {backgroundColor: '#d9534f'}]}
                onPress={delProduct}>
                <Text style={styles.deleteModalBtnText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/*Edit Product Modal*/}
      <Modal
        visible={modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.editProductModalOverlay}>
          <ScrollView style={styles.editProductModalContainer}>
            <View style={styles.editProductHeader}>
              <Text style={styles.editProductTitle}>Update Product</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setEditForm(initialEditProduct);
                  setGenBarCode([]);
                  setEditCatValue('');
                  setEditUomValue('');
                  setSupplier([]);
                  setEditSupValue('');
                  setExpiry([]);
                  setBarCode('');
                }}
                style={styles.editProductCloseBtn}>
                <Icon name="close" size={20} color="#144272" />
              </TouchableOpacity>
            </View>

            <View style={styles.editProductForm}>
              {/* Product Name and Generic Name */}

              <View style={styles.editProductField}>
                <Text style={styles.editProductLabel}>Product Name *</Text>
                <TextInput
                  style={styles.editProductInput}
                  placeholderTextColor="#999"
                  placeholder="Enter product name"
                  value={editForm.prod_name}
                  onChangeText={t => editOnChnage('prod_name', t)}
                />
              </View>
              <View style={styles.editProductField}>
                <Text style={styles.editProductLabel}>Generic Name</Text>
                <TextInput
                  style={styles.editProductInput}
                  placeholderTextColor="#999"
                  placeholder="Enter generic name"
                  value={editForm.prod_generic_name}
                  onChangeText={t => editOnChnage('prod_generic_name', t)}
                />
              </View>

              {/* Auto Barcode Generation */}
              <View style={styles.editProductField}>
                <TouchableOpacity
                  style={styles.editProductCheckboxRow}
                  activeOpacity={0.7}
                  onPress={async () => {
                    const newOptions = genBarCode.includes('on')
                      ? genBarCode.filter(opt => opt !== 'on')
                      : [...genBarCode, 'on'];
                    setGenBarCode(newOptions);
                    if (!genBarCode.includes('on')) {
                      await getBarCode();
                      editOnChnage(
                        'prod_UPC_EAN',
                        typeof barCode === 'string' ? barCode : String(barCode),
                      );
                    } else {
                      editOnChnage('prod_UPC_EAN', '');
                    }
                  }}>
                  <Checkbox.Android
                    status={genBarCode.includes('on') ? 'checked' : 'unchecked'}
                    color={backgroundColors.primary}
                    uncheckedColor={backgroundColors.dark}
                  />
                  <Text style={styles.editProductCheckboxText}>
                    Generate Auto BarCode
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.editProductField}>
                <Text style={styles.editProductLabel}>Barcode/UPC *</Text>
                <TextInput
                  style={[
                    styles.editProductInput,
                    genBarCode.includes('on') &&
                      styles.editProductDisabledInput,
                  ]}
                  placeholderTextColor="#999"
                  placeholder="Enter or generate barcode"
                  keyboardType="numeric"
                  value={
                    genBarCode.includes('on')
                      ? typeof barCode === 'string'
                        ? barCode
                        : String(barCode)
                      : editForm.prod_UPC_EAN
                  }
                  editable={!genBarCode.includes('on')}
                  onChangeText={t => {
                    if (!genBarCode.includes('on'))
                      editOnChnage('prod_UPC_EAN', t);
                  }}
                />
              </View>

              {/* Expiry Settings */}
              <View style={styles.editProductField}>
                <TouchableOpacity
                  style={styles.editProductCheckboxRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    const newOptions = expiry.includes('on')
                      ? expiry.filter(opt => opt !== 'on')
                      : [...expiry, 'on'];
                    setExpiry(newOptions);
                  }}>
                  <Checkbox.Android
                    status={expiry.includes('on') ? 'checked' : 'unchecked'}
                    color="#144272"
                    uncheckedColor="#144272"
                  />
                  <Text style={styles.editProductCheckboxText}>
                    Apply Expiry Date
                  </Text>
                </TouchableOpacity>
              </View>

              {expiry.includes('on') && (
                <View style={styles.editProductField}>
                  <Text style={styles.editProductLabel}>Expiry Date</Text>
                  <TouchableOpacity
                    style={[
                      styles.editProductDatePicker,
                      !expiry.includes('on') && styles.editProductDisabledInput,
                    ]}
                    onPress={() => {
                      if (expiry.includes('on')) setShowStartDatePicker(true);
                    }}
                    disabled={!expiry.includes('on')}>
                    <Text style={styles.editProductDateText}>
                      {editForm.prod_expirydate
                        ? new Date(
                            editForm.prod_expirydate,
                          ).toLocaleDateString?.() ||
                          new Date().toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </Text>
                    <Icon name="calendar-month" size={20} color="#144272" />
                    {showStartDatePicker && expiry.includes('on') && (
                      <DateTimePicker
                        testID="startDatePicker"
                        value={
                          editForm.prod_expirydate
                            ? new Date(editForm.prod_expirydate)
                            : new Date()
                        }
                        mode="date"
                        is24Hour={true}
                        display="default"
                        onChange={editOnDateChange}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Category and UOM */}
              <View style={styles.editProductField}>
                <Text style={styles.editProductLabel}>Category *</Text>
                <View style={styles.editProductDropdownContainer}>
                  <DropDownPicker
                    items={transformedCat}
                    open={editCatOpen}
                    setOpen={setEditCatOpen}
                    value={editCatValue}
                    setValue={setEditCatValue}
                    placeholder="Select category"
                    placeholderStyle={styles.editProductDropdownPlaceholder}
                    textStyle={styles.editProductDropdownText}
                    ArrowUpIconComponent={() => (
                      <Icon name="chevron-up" size={18} color="#144272" />
                    )}
                    ArrowDownIconComponent={() => (
                      <Icon name="chevron-down" size={18} color="#144272" />
                    )}
                    style={styles.editProductDropdown}
                    dropDownContainerStyle={styles.editProductDropdownList}
                    labelStyle={styles.editProductDropdownText}
                    listItemLabelStyle={styles.editProductDropdownText}
                    listMode="SCROLLVIEW"
                  />
                </View>
              </View>

              <View style={styles.editProductField}>
                <View style={styles.editProductDropdownField}>
                  <Text style={styles.editProductLabel}>Unit of Measure *</Text>
                  <View style={styles.editProductDropdownContainer}>
                    <DropDownPicker
                      items={transformedUom}
                      open={editUomOpen}
                      setOpen={setEditUomOpen}
                      value={editUomValue}
                      setValue={setEditUomValue}
                      placeholder="Select UOM"
                      placeholderStyle={styles.editProductDropdownPlaceholder}
                      textStyle={styles.editProductDropdownText}
                      ArrowUpIconComponent={() => (
                        <Icon name="chevron-up" size={18} color="#144272" />
                      )}
                      ArrowDownIconComponent={() => (
                        <Icon name="chevron-down" size={18} color="#144272" />
                      )}
                      style={[styles.editProductDropdown, {zIndex: 999}]}
                      dropDownContainerStyle={styles.editProductDropdownList}
                      labelStyle={styles.editProductDropdownText}
                      listItemLabelStyle={styles.editProductDropdownText}
                      listMode="SCROLLVIEW"
                    />
                  </View>
                </View>
              </View>

              {/* Pricing */}
              <View style={styles.editProductField}>
                <Text style={styles.editProductLabel}>Cost Price *</Text>
                <TextInput
                  style={styles.editProductInput}
                  placeholderTextColor="#999"
                  placeholder="Enter cost price"
                  value={editForm.prod_costprice}
                  keyboardType="numeric"
                  onChangeText={t => {
                    editOnChnage('prod_costprice', t);
                    // Calculate final price if possible
                    const cost = parseFloat(t) || 0;
                    const retail = parseFloat(editForm.prod_retailprice) || 0;
                    const discount = parseFloat(editForm.prod_discount) || 0;
                    const final =
                      retail > 0
                        ? (retail - (retail * discount) / 100).toFixed(2)
                        : (cost - (cost * discount) / 100).toFixed(2);
                    setEditForm(prev => ({
                      ...prev,
                      prod_fretailprice: isNaN(Number(final)) ? '' : final,
                    }));
                  }}
                />
              </View>
              <View style={styles.editProductField}>
                <Text style={styles.editProductLabel}>Retail Price *</Text>
                <TextInput
                  style={styles.editProductInput}
                  placeholderTextColor="#999"
                  placeholder="Enter retail price"
                  value={editForm.prod_retailprice}
                  keyboardType="numeric"
                  onChangeText={t => {
                    editOnChnage('prod_retailprice', t);
                    // Calculate final price if possible
                    const cost = parseFloat(editForm.prod_costprice) || 0;
                    const retail = parseFloat(t) || 0;
                    const discount = parseFloat(editForm.prod_discount) || 0;
                    const final =
                      retail > 0
                        ? (retail - (retail * discount) / 100).toFixed(2)
                        : (cost - (cost * discount) / 100).toFixed(2);
                    setEditForm(prev => ({
                      ...prev,
                      prod_fretailprice: isNaN(Number(final)) ? '' : final,
                    }));
                  }}
                />
              </View>

              <View style={styles.editProductField}>
                <Text style={styles.editProductLabel}>Discount (%)</Text>
                <TextInput
                  style={styles.editProductInput}
                  placeholderTextColor="#999"
                  placeholder="Enter discount percentage"
                  value={editForm.prod_discount}
                  keyboardType="numeric"
                  onChangeText={t => {
                    editOnChnage('prod_discount', t);
                    // Calculate final price if possible
                    const cost = parseFloat(editForm.prod_costprice) || 0;
                    const retail = parseFloat(editForm.prod_retailprice) || 0;
                    const discount = parseFloat(t) || 0;
                    const final =
                      retail > 0
                        ? (retail - (retail * discount) / 100).toFixed(2)
                        : (cost - (cost * discount) / 100).toFixed(2);
                    setEditForm(prev => ({
                      ...prev,
                      prod_fretailprice: isNaN(Number(final)) ? '' : final,
                    }));
                  }}
                />
              </View>
              <View style={styles.editProductField}>
                <Text style={styles.editProductLabel}>Final Price</Text>
                <TextInput
                  style={[
                    styles.editProductInput,
                    styles.editProductDisabledInput,
                  ]}
                  placeholder="Calculated automatically"
                  value={editForm.prod_fretailprice || '0.00'}
                  editable={false}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Supplier Section */}
              <View style={styles.editProductField}>
                <TouchableOpacity
                  style={styles.editProductCheckboxRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    const newOptions = supplier.includes('on')
                      ? supplier.filter(opt => opt !== 'on')
                      : [...supplier, 'on'];
                    setSupplier(newOptions);
                  }}>
                  <Checkbox.Android
                    status={supplier.includes('on') ? 'checked' : 'unchecked'}
                    color="#144272"
                    uncheckedColor="#144272"
                  />
                  <Text style={styles.editProductCheckboxText}>
                    Enable Supplier
                  </Text>
                </TouchableOpacity>
              </View>

              {supplier.includes('on') && (
                <View style={styles.editProductDropdownRow}>
                  <View style={styles.editProductDropdownField}>
                    <Text style={styles.editProductLabel}>Supplier</Text>
                    <DropDownPicker
                      items={transformedSup}
                      open={editSupOpen}
                      setOpen={setEditSupOpen}
                      value={editSupValue}
                      setValue={setEditSupValue}
                      placeholder="Select supplier"
                      placeholderStyle={styles.editProductDropdownPlaceholder}
                      textStyle={styles.editProductDropdownText}
                      ArrowUpIconComponent={() => (
                        <Icon name="chevron-up" size={18} color="#144272" />
                      )}
                      ArrowDownIconComponent={() => (
                        <Icon name="chevron-down" size={18} color="#144272" />
                      )}
                      style={styles.editProductDropdown}
                      dropDownContainerStyle={styles.editProductDropdownList}
                      labelStyle={styles.editProductDropdownText}
                      listItemLabelStyle={styles.editProductDropdownText}
                      listMode="SCROLLVIEW"
                      disabled={!supplier.includes('on')}
                    />
                  </View>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.editProductSubmitBtn}
                onPress={updateProduct}>
                <Icon name="package-variant-closed" size={20} color="white" />
                <Text style={styles.editProductSubmitText}>Update Product</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Toast />
        </View>
      </Modal>

      {/*Success*/}
      <Modal
        visible={modalVisible === 'Success'}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.delAnim}>
              <LottieView
                style={{flex: 1}}
                source={require('../../../assets/success.json')}
                autoPlay
                duration={2500}
                loop={false}
              />
            </View>

            {/* Title */}
            <Text style={styles.deleteModalTitle}>Updated!</Text>

            {/* Subtitle */}
            <Text style={styles.deleteModalMessage}>
              Product record has been updated successfully!
            </Text>

            {/* Buttons */}
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[
                  styles.deleteModalBtn,
                  {backgroundColor: backgroundColors.success},
                ]}
                onPress={() => {
                  setModalVisible('');
                }}>
                <Text style={styles.deleteModalBtnText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductDetails;

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
  headerCenter: {
    flex: 1,
    gap: 10,
    flexDirection: 'row',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
  },

  // Details container
  detailsContainer: {
    flex: 1,
    paddingHorizontal: '3%',
  },
  avatarBox: {
    marginVertical: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    height: 100,
    width: 100,
  },
  custName: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 10,
    color: backgroundColors.primary,
  },

  // Inner Details
  innerDetails: {
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  innerHeader: {
    width: '100%',
    height: 50,
    borderBottomColor: backgroundColors.primary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: backgroundColors.dark,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
  },
  detailsView: {
    flex: 1,
  },
  detailsRow: {
    alignItems: 'baseline',
    paddingVertical: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: backgroundColors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.primary,
  },
  value: {
    fontSize: 16,
    color: backgroundColors.dark,
  },

  //Delete Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  deleteModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    width: '100%',
    alignSelf: 'center',
  },
  deleteModalIcon: {
    width: 60,
    height: 60,
    tintColor: '#144272',
    marginBottom: 15,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 8,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  deleteModalBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteModalBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  delAnim: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  addModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  // Edit Product Modal Styles
  editProductModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  editProductModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  editProductHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editProductTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.primary,
  },
  editProductCloseBtn: {
    padding: 5,
  },
  editProductForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  editProductField: {
    flex: 1,
    marginBottom: 5,
  },
  editProductLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginBottom: 5,
  },
  editProductInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  editProductDisabledInput: {
    backgroundColor: '#e0e0e0',
    color: '#888',
  },
  editProductCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  editProductCheckboxText: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
    marginLeft: 8,
  },
  editProductDatePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  editProductDateText: {
    fontSize: 14,
    color: '#333',
  },
  editProductDropdownRow: {
    marginBottom: 15,
  },
  editProductDropdownField: {
    flex: 1,
  },
  editProductDropdownContainer: {
    position: 'relative',
  },
  editProductDropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 42,
    zIndex: 999,
  },
  editProductDropdownList: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    zIndex: 1000,
    maxHeight: 160,
  },
  editProductDropdownText: {
    color: '#333',
    fontSize: 14,
  },
  editProductDropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  editProductDropdownAddBtn: {
    position: 'absolute',
    right: 35,
    top: 31,
    backgroundColor: 'transparent',
    padding: 5,
    zIndex: 1001,
  },
  editProductSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  editProductSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
