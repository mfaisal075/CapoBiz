import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import {Checkbox} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

interface Products {
  id: number;
  prod_name: string;
  prod_UPC_EAN: string;
  prod_costprice: string;
  prod_retailprice: string;
  prod_expirydate: string;
  prod_qty: string;
  pcat_name: string;
}

interface ViewProduct {
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

interface AddProduct {
  product_name: string;
  generic_name: string;
  autobarcode: string;
  upc_ean: string;
  apply_expiry: string;
  expiry_date: Date;
  cat_id: string;
  productuom_id: string;
  opening_qty: string;
  reorder_qty: string;
  cost_price: string;
  retail_price: string;
  discount: string;
  final_price: string;
  supplier: string;
  supp_id: string;
  equivalent: string;
  sub_price: string;
}

const initialAddProduct: AddProduct = {
  apply_expiry: '',
  autobarcode: '',
  cat_id: '',
  cost_price: '',
  discount: '',
  expiry_date: new Date(),
  final_price: '',
  generic_name: '',
  opening_qty: '',
  product_name: '',
  productuom_id: '',
  reorder_qty: '',
  retail_price: '',
  supp_id: '',
  supplier: '',
  upc_ean: '',
  equivalent: '',
  sub_price: '',
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

export default function CustomerPeople() {
  const {token} = useUser();
  const [products, setProducts] = useState<Products[]>([]);
  const [viewProd, setViewProd] = useState<ViewProduct[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [selectedProd, setSelectedProd] = useState<number | null>(null);
  const [addForm, setAddForm] = useState<AddProduct>(initialAddProduct);
  const [genBarCode, setGenBarCode] = useState<string[]>([]);
  const [catItems, setCatItems] = useState<Categories[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [catValue, setCatValue] = useState<string | null>('');
  const [uomItems, setUomItems] = useState<UOM[]>([]);
  const [uomOpen, setUomOpen] = useState(false);
  const [uomValue, setUomValue] = useState<string | null>('');
  const [supplier, setSupplier] = useState<string[]>([]);
  const [supItems, setSupItems] = useState<Suppliers[]>([]);
  const [supOpen, setSupOpen] = useState(false);
  const [supValue, setSupValue] = useState<string | null>('');
  const [subUom, setSubUom] = useState<string[]>([]);
  const [subUmoOpen, setSubUmoOpen] = useState(false);
  const [subUmoValue, setSubUmoValue] = useState<string | null>('');
  const [manageStock, setManageStock] = useState<string[]>([]);
  const [expiry, setExpiry] = useState<string[]>([]);
  const [barCode, setBarCode] = useState('');
  const [editForm, setEditForm] = useState<EditProduct>(initialEditProduct);
  const [editCatOpen, setEditCatOpen] = useState(false);
  const [editCatValue, setEditCatValue] = useState<string | null>('');
  const [editUomOpen, setEditUomOpen] = useState(false);
  const [editUomValue, setEditUomValue] = useState<string | null>('');
  const [editSupOpen, setEditSupOpen] = useState(false);
  const [editSupValue, setEditSupValue] = useState<string | null>('');
  const [editSubUmoOpen, setEditSubUmoOpen] = useState(false);
  const [editSubUmoValue, setEditSubUmoValue] = useState<string | null>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = products.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = products.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const transformedCat = catItems.map(cat => ({
    label: cat.pcat_name,
    value: String(cat.id),
  }));

  const transformedUom = uomItems.map(cat => ({
    label: cat.ums_name,
    value: cat.ums_name,
  }));

  const transformedSup = supItems.map(sup => ({
    label: `${sup.sup_name}_${sup.sup_company_name}`,
    value: String(sup.id),
  }));

  //Add Form OnChange
  const onChnage = (field: keyof AddProduct, value: string | Date) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  //Edit Form OnChange
  const editOnChnage = (field: keyof EditProduct, value: string | Date) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const {openDrawer} = useDrawer();

  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const editOnDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || editForm.prod_expirydate;
    setShowStartDatePicker(false);
    editOnChnage('prod_expirydate', currentDate);
  };

  // Fetch Products
  const fetchPrducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchproductlist`);
      setProducts(res.data.product);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Product
  const delProduct = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/productdelete`, {
        id: selectedProd,
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
        fetchPrducts();
        setSelectedProd(null);
      }
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

  // Fetch Bar Code
  const getBarCode = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/auto_gen_barcode`);
      setBarCode(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Product
  const addProduct = async () => {
    if (!addForm.product_name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Product Name is required',
        visibilityTime: 1500,
      });
      return;
    }

    if (!addForm.upc_ean?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Barcode is required',
        visibilityTime: 1500,
      });
      return;
    }

    if (!catValue) {
      Toast.show({
        type: 'error',
        text1: 'Category is required',
        visibilityTime: 1500,
      });
      return;
    }
    if (!uomValue) {
      Toast.show({
        type: 'error',
        text1: 'UOM is required',
        visibilityTime: 1500,
      });
      return;
    }
    if (!addForm.cost_price.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Cost Price is required',
        visibilityTime: 1500,
      });
      return;
    }
    if (!addForm.retail_price.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Retail Price is required',
        visibilityTime: 1500,
      });
      return;
    }
    if (subUom.includes('on')) {
      if (!subUmoValue) {
        Toast.show({
          type: 'error',
          text1: 'Sub UOM is required',
          visibilityTime: 1500,
        });
        return;
      }
      if (!addForm.equivalent.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Equivalence is required',
          visibilityTime: 1500,
        });
        return;
      }
      if (!addForm.sub_price.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Sale Price is required',
          visibilityTime: 1500,
        });
        return;
      }
    }
    if (addForm.cost_price > addForm.retail_price) {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Sale price should be greater!',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/addproducts`, {
        product_name: addForm.product_name.trim(),
        generic_name: addForm.generic_name.trim(),
        ...(genBarCode.includes('on') && {autobarcode: 'on'}),
        upc_ean: addForm.upc_ean,
        ...(expiry.includes('on') && {apply_expiry: 'on'}),
        expiry_date: startDate.toISOString().split('T')[0],
        cat_id: catValue,
        productuom_id: uomValue,
        ...(!manageStock.includes('on')
          ? {opening_qty: addForm.opening_qty}
          : {}),
        ...(!manageStock.includes('on')
          ? {reorder_qty: addForm.reorder_qty}
          : {}),
        ...(manageStock.includes('on')
          ? {stockmanage: 'N'}
          : {stockmanage: 'Y'}),
        ...(manageStock.includes('on') ? {dont_stock_manage: 'on'} : {}),
        cost_price: addForm.cost_price,
        retail_price: addForm.retail_price,
        discount: addForm.discount,
        final_price: addForm.final_price,
        ...(supplier.includes('on') && {supplier: 'on'}),
        supp_id: supValue,
        ...(subUom.includes('on') && {have_sub_uom: 'on'}),
        sub_uom: subUmoValue,
        equivalent: addForm.equivalent,
        sub_price: addForm.sub_price,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Product has been added successfully!',
          visibilityTime: 1500,
        });
        setModalVisible('');
        setAddForm(initialAddProduct);
        setGenBarCode([]);
        setCatValue('');
        setUomValue('');
        setSupplier([]);
        setSupValue('');
        setSubUom([]);
        setSubUmoValue('');
        setManageStock([]);
        setExpiry([]);
        setBarCode('');
        setStartDate(new Date());
        fetchPrducts();
      } else if (res.status === 200 && data.status === 201) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'Opening quantity cannot be less than reorder quantity!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 101) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This product name already exists!',
          visibilityTime: 2000,
        });
      } else if (res.status === 200 && data.status === 102) {
        Toast.show({
          type: 'error',
          text1: 'Warning!',
          text2: 'This Barcode Already exist!',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `${error}`,
      });

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

    if (
      !manageStock.includes('on') &&
      (editForm.prod_qty ?? '').trim() !== '' &&
      (editForm.prod_reorder_qty ?? '').trim() !== ''
    ) {
      const openingQty = parseFloat(editForm.prod_qty ?? '0');
      const reorderQty = parseFloat(editForm.prod_reorder_qty ?? '0');
      if (!isNaN(openingQty) && !isNaN(reorderQty) && openingQty < reorderQty) {
        Toast.show({
          type: 'error',
          text1: 'Opening quantity cannot be less than reorder quantity!',
          visibilityTime: 1500,
        });
        return;
      }
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

    if (subUom.includes('on')) {
      if (!editSubUmoValue) {
        Toast.show({
          type: 'error',
          text1: 'Sub UOM is required',
          visibilityTime: 1500,
        });
        return;
      }
      if (!(editForm.prod_equivalent ?? '').trim()) {
        Toast.show({
          type: 'error',
          text1: 'Equivalence is required',
          visibilityTime: 1500,
        });
        return;
      }
      if (!(editForm.prod_sub_price ?? '').trim()) {
        Toast.show({
          type: 'error',
          text1: 'Sale Price is required',
          visibilityTime: 1500,
        });
        return;
      }
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
        ...(subUom.includes('on') && {have_sub_uom: 'on'}),
        sub_uom: editSubUmoValue,
        equivalent: (editForm.prod_equivalent ?? '').trim(),
        sub_price: (editForm.prod_sub_price ?? '').trim(),
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
        setSubUom([]);
        setEditSubUmoValue('');
        setManageStock([]);
        setExpiry([]);
        setBarCode('');
        fetchPrducts();
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
    fetchPrducts();
    fetchCatgories();
    fetchUom();
    fetchSuppliers();
    getBarCode();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Products</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setModalVisible('AddProd');
            }}
            style={[styles.headerBtn]}>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={currentData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <View style={styles.card}>
              {/* Header Row */}
              <View style={styles.headerRow}>
                {/* Avatar Circle */}
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>
                    {item.prod_name?.charAt(0) || 'P'}
                  </Text>
                </View>

                {/* Product Info */}
                <View style={{flex: 1}}>
                  <Text style={styles.name}>{item.prod_name}</Text>
                  <Text style={styles.subText}>
                    {item.pcat_name || 'No category'}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible('ViewProd');
                      const fetchSingleProd = async (id: number) => {
                        try {
                          const res = await axios.get(
                            `${BASE_URL}/productsshow?id=${id}&_token=${token}`,
                          );
                          setViewProd([res.data]);
                        } catch (error) {
                          console.log(error);
                        }
                      };
                      fetchSingleProd(item.id);
                    }}>
                    <Icon
                      style={styles.actionIcon}
                      name="eye"
                      size={20}
                      color="#144272"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible('EditProd');
                      const fetchProdData = async (id: number) => {
                        try {
                          const res = await axios.get(
                            `${BASE_URL}/editproduct?id=${id}&_token=${token}`,
                          );
                          setEditForm(res.data.pro);
                          setEditCatValue(
                            res.data.pro.prod_pcat_id
                              ? String(res.data.pro.prod_pcat_id)
                              : '',
                          );
                          setEditUomValue(
                            res.data.uom.ums_name
                              ? String(res.data.uom.ums_name)
                              : '',
                          );
                          setEditSupValue(
                            res.data.pro.prod_sup_id
                              ? String(res.data.pro.prod_sup_id)
                              : '',
                          );
                          setEditSubUmoValue(
                            res.data.pro.prod_sub_uom
                              ? String(res.data.pro.prod_sub_uom)
                              : '',
                          );
                        } catch (error) {
                          console.log(error);
                        }
                      };
                      fetchProdData(item.id);
                    }}>
                    <Icon
                      style={styles.actionIcon}
                      name="pencil"
                      size={20}
                      color="#144272"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible('DeleteProd');
                      setSelectedProd(item.id);
                    }}>
                    <Icon
                      style={styles.actionIcon}
                      name="delete"
                      size={20}
                      color="#144272"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Info Box */}
              <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                  <View style={styles.labelRow}>
                    <Icon
                      name="barcode"
                      size={18}
                      color={'#144272'}
                      style={styles.infoIcon}
                    />
                    <Text style={styles.labelText}>Barcode</Text>
                  </View>
                  <Text style={styles.valueText}>
                    {item.prod_UPC_EAN || 'N/A'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.labelRow}>
                    <Icon
                      name="cash"
                      size={18}
                      color={'#144272'}
                      style={styles.infoIcon}
                    />
                    <Text style={styles.labelText}>Cost</Text>
                  </View>
                  <Text style={styles.valueText}>
                    {item.prod_costprice || '0'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.labelRow}>
                    <Icon
                      name="tag"
                      size={18}
                      color={'#144272'}
                      style={styles.infoIcon}
                    />
                    <Text style={styles.labelText}>Retail</Text>
                  </View>
                  <Text style={styles.valueText}>
                    {item.prod_retailprice || '0'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.labelRow}>
                    <Icon
                      name="cube"
                      size={18}
                      color={'#144272'}
                      style={styles.infoIcon}
                    />
                    <Text style={styles.labelText}>Quantity</Text>
                  </View>
                  <Text style={styles.valueText}>{item.prod_qty || 0}</Text>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.labelRow}>
                    <Icon
                      name="calendar"
                      size={18}
                      color={'#144272'}
                      style={styles.infoIcon}
                    />
                    <Text style={styles.labelText}>Expiry</Text>
                  </View>
                  <Text style={styles.valueText}>
                    {item.prod_expirydate
                      ? new Date(item.prod_expirydate).toLocaleDateString(
                          'en-US',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          },
                        )
                      : 'No expiry'}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 20}}>
              <Text style={{color: '#fff', fontSize: 14}}>
                No products found.
              </Text>
            </View>
          }
          contentContainerStyle={{paddingBottom: 60}}
          showsVerticalScrollIndicator={false}
        />

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

        {/* View Product Modal */}
        <Modal
          visible={modalVisible === 'ViewProd'}
          transparent
          animationType="slide">
          <View style={styles.addProductModalOverlay}>
            <ScrollView style={styles.addProductModalContainer}>
              {/* Header */}
              <View style={styles.addProductHeader}>
                <Text style={styles.addProductTitle}>Product Details</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setViewProd([]);
                  }}
                  style={styles.addProductCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              {viewProd.length > 0 && (
                <View style={styles.customerDetailsWrapper}>
                  {/* Product Image */}
                  <View style={styles.customerImageWrapper}>
                    {viewProd[0]?.pro?.prod_image ? (
                      <Image
                        source={{uri: viewProd[0].pro.prod_image}}
                        style={styles.customerImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.customerNoImage}>
                        <Icon name="package-variant" size={40} color="#999" />
                        <Text style={styles.customerNoImageText}>No Image</Text>
                      </View>
                    )}
                  </View>

                  {/* Info Fields */}
                  <View style={styles.customerInfoBox}>
                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Product Name</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_name ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Second Name</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_generic_name ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>UPC / EAN</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_UPC_EAN ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Expiry Date</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_expirydate ?? 'No expiry date'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Reorder Qty</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_reorder_qty ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Category</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.cat?.pcat_name ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>UOM</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.uom?.ums_name ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Sub UOM</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_sub_uom ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Master UOM</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_master_uom ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Equivalent</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_equivalent ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Sub UOM Price
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_sub_price ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Manage Stock</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_manage_stock ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>
                        Opening Quantity
                      </Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_qty ?? '0'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Cost Price</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_costprice ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Retail Price</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_retailprice ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Discount (%)</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_discount ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Final Price</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.pro?.prod_fretailprice ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.customerInfoRow}>
                      <Text style={styles.customerInfoLabel}>Supplier</Text>
                      <Text style={styles.customerInfoValue}>
                        {viewProd[0]?.supp?.sup_name ?? 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>

        {/*Add Product Modal*/}
        <Modal
          visible={modalVisible === 'AddProd'}
          transparent
          animationType="slide">
          <View style={styles.addProductModalOverlay}>
            <ScrollView style={styles.addProductModalContainer}>
              <View style={styles.addProductHeader}>
                <Text style={styles.addProductTitle}>Add New Product</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible('');
                    setAddForm(initialAddProduct);
                    setGenBarCode([]);
                    setCatValue('');
                    setUomValue('');
                    setSupplier([]);
                    setSupValue('');
                    setSubUom([]);
                    setSubUmoValue('');
                    setManageStock([]);
                    setExpiry([]);
                    setBarCode('');
                    setStartDate(new Date());
                  }}
                  style={styles.addProductCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              <View style={styles.addProductForm}>
                {/* Product Name and Generic Name */}
                <View style={styles.addProductRow}>
                  <View style={styles.addProductField}>
                    <Text style={styles.addProductLabel}>Product Name *</Text>
                    <TextInput
                      style={styles.addProductInput}
                      placeholderTextColor="#999"
                      placeholder="Enter product name"
                      value={addForm.product_name}
                      onChangeText={t => onChnage('product_name', t)}
                    />
                  </View>
                  <View style={styles.addProductField}>
                    <Text style={styles.addProductLabel}>Generic Name</Text>
                    <TextInput
                      style={styles.addProductInput}
                      placeholderTextColor="#999"
                      placeholder="Enter generic name"
                      value={addForm.generic_name}
                      onChangeText={t => onChnage('generic_name', t)}
                    />
                  </View>
                </View>

                {/* Auto Barcode Generation */}
                <View style={styles.addProductFullRow}>
                  <TouchableOpacity
                    style={styles.addProductCheckboxRow}
                    activeOpacity={0.7}
                    onPress={async () => {
                      const newOptions = genBarCode.includes('on')
                        ? genBarCode.filter(opt => opt !== 'on')
                        : [...genBarCode, 'on'];
                      setGenBarCode(newOptions);
                      if (!genBarCode.includes('on')) {
                        await getBarCode();
                        onChnage(
                          'upc_ean',
                          typeof barCode === 'string'
                            ? barCode
                            : String(barCode),
                        );
                      } else {
                        onChnage('upc_ean', '');
                      }
                    }}>
                    <Checkbox.Android
                      status={
                        genBarCode.includes('on') ? 'checked' : 'unchecked'
                      }
                      color="#144272"
                      uncheckedColor="#144272"
                    />
                    <Text style={styles.addProductCheckboxText}>
                      Generate Auto BarCode
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.addProductFullRow}>
                  <Text style={styles.addProductLabel}>Barcode/UPC *</Text>
                  <TextInput
                    style={[
                      styles.addProductInput,
                      genBarCode.includes('on') &&
                        styles.addProductDisabledInput,
                    ]}
                    placeholderTextColor={
                      genBarCode.includes('on') ? '#999' : '#999'
                    }
                    placeholder="Enter or generate barcode"
                    keyboardType="numeric"
                    value={
                      genBarCode.includes('on')
                        ? typeof barCode === 'string'
                          ? barCode
                          : String(barCode)
                        : addForm.upc_ean
                    }
                    editable={!genBarCode.includes('on')}
                    onChangeText={t => {
                      if (!genBarCode.includes('on')) onChnage('upc_ean', t);
                    }}
                  />
                </View>

                {/* Expiry Settings */}
                <View style={styles.addProductFullRow}>
                  <TouchableOpacity
                    style={styles.addProductCheckboxRow}
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
                    <Text style={styles.addProductCheckboxText}>
                      Apply Expiry Date
                    </Text>
                  </TouchableOpacity>
                </View>

                {expiry.includes('on') && (
                  <View style={styles.addProductFullRow}>
                    <Text style={styles.addProductLabel}>Expiry Date</Text>
                    <TouchableOpacity
                      style={[
                        styles.addProductDatePicker,
                        !expiry.includes('on') &&
                          styles.addProductDisabledInput,
                      ]}
                      onPress={() => {
                        if (expiry.includes('on')) setShowStartDatePicker(true);
                      }}
                      disabled={!expiry.includes('on')}>
                      <Text style={styles.addProductDateText}>
                        {startDate.toLocaleDateString()}
                      </Text>
                      <Icon name="calendar-month" size={20} color="#144272" />
                      {showStartDatePicker && expiry.includes('on') && (
                        <DateTimePicker
                          testID="startDatePicker"
                          value={startDate}
                          mode="date"
                          is24Hour={true}
                          display="default"
                          onChange={onStartDateChange}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Category and UOM */}
                <View style={styles.addProductDropdownRow}>
                  <View style={styles.addProductDropdownField}>
                    <Text style={styles.addProductLabel}>Category *</Text>
                    <View style={styles.addProductDropdownContainer}>
                      <DropDownPicker
                        items={transformedCat}
                        open={catOpen}
                        setOpen={setCatOpen}
                        value={catValue}
                        setValue={setCatValue}
                        placeholder="Select category"
                        placeholderStyle={styles.addProductDropdownPlaceholder}
                        textStyle={styles.addProductDropdownText}
                        ArrowUpIconComponent={() => (
                          <Icon name="chevron-up" size={18} color="#144272" />
                        )}
                        ArrowDownIconComponent={() => (
                          <Icon name="chevron-down" size={18} color="#144272" />
                        )}
                        style={styles.addProductDropdown}
                        dropDownContainerStyle={styles.addProductDropdownList}
                        labelStyle={styles.addProductDropdownText}
                        listItemLabelStyle={styles.addProductDropdownText}
                        listMode="SCROLLVIEW"
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.addProductDropdownRow}>
                  <View style={styles.addProductDropdownField}>
                    <Text style={styles.addProductLabel}>
                      Unit of Measure *
                    </Text>
                    <View style={styles.addProductDropdownContainer}>
                      <DropDownPicker
                        items={transformedUom}
                        open={uomOpen}
                        setOpen={setUomOpen}
                        value={uomValue}
                        setValue={setUomValue}
                        placeholder="Select UOM"
                        placeholderStyle={styles.addProductDropdownPlaceholder}
                        textStyle={styles.addProductDropdownText}
                        ArrowUpIconComponent={() => (
                          <Icon name="chevron-up" size={18} color="#144272" />
                        )}
                        ArrowDownIconComponent={() => (
                          <Icon name="chevron-down" size={18} color="#144272" />
                        )}
                        style={[styles.addProductDropdown, {zIndex: 999}]}
                        dropDownContainerStyle={styles.addProductDropdownList}
                        labelStyle={styles.addProductDropdownText}
                        listItemLabelStyle={styles.addProductDropdownText}
                        listMode="SCROLLVIEW"
                      />
                    </View>
                  </View>
                </View>

                {/* Stock Management */}
                <View style={styles.addProductFullRow}>
                  <TouchableOpacity
                    style={styles.addProductCheckboxRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      const newOptions = manageStock.includes('on')
                        ? manageStock.filter(opt => opt !== 'on')
                        : [...manageStock, 'on'];
                      setManageStock(newOptions);
                    }}>
                    <Checkbox.Android
                      status={
                        manageStock.includes('on') ? 'checked' : 'unchecked'
                      }
                      color="#144272"
                      uncheckedColor="#144272"
                    />
                    <Text style={styles.addProductCheckboxText}>
                      Don't Manage Stock
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.addProductRow}>
                  <View style={styles.addProductField}>
                    <Text style={styles.addProductLabel}>Opening Quantity</Text>
                    <TextInput
                      style={[
                        styles.addProductInput,
                        manageStock.includes('on') &&
                          styles.addProductDisabledInput,
                      ]}
                      placeholderTextColor="#999"
                      placeholder="Enter opening quantity"
                      value={
                        manageStock.includes('on') ? '0' : addForm.opening_qty
                      }
                      editable={!manageStock.includes('on')}
                      onChangeText={t => {
                        if (!manageStock.includes('on'))
                          onChnage('opening_qty', t);
                      }}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.addProductField}>
                    <Text style={styles.addProductLabel}>Re-Order Level</Text>
                    <TextInput
                      style={[
                        styles.addProductInput,
                        manageStock.includes('on') &&
                          styles.addProductDisabledInput,
                      ]}
                      placeholderTextColor="#999"
                      placeholder="Enter reorder level"
                      value={
                        manageStock.includes('on') ? '0' : addForm.reorder_qty
                      }
                      editable={!manageStock.includes('on')}
                      onChangeText={t => {
                        if (!manageStock.includes('on'))
                          onChnage('reorder_qty', t);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Pricing */}
                <View style={styles.addProductRow}>
                  <View style={styles.addProductField}>
                    <Text style={styles.addProductLabel}>Cost Price *</Text>
                    <TextInput
                      style={styles.addProductInput}
                      placeholderTextColor="#999"
                      placeholder="Enter cost price"
                      value={addForm.cost_price}
                      keyboardType="numeric"
                      onChangeText={t => {
                        onChnage('cost_price', t);
                        // Calculate final price if possible
                        const cost = parseFloat(t) || 0;
                        const retail = parseFloat(addForm.retail_price) || 0;
                        const discount = parseFloat(addForm.discount) || 0;
                        const final =
                          retail > 0
                            ? (retail - (retail * discount) / 100).toFixed(2)
                            : (cost - (cost * discount) / 100).toFixed(2);
                        setAddForm(prev => ({
                          ...prev,
                          final_price: isNaN(Number(final)) ? '' : final,
                        }));
                      }}
                    />
                  </View>
                  <View style={styles.addProductField}>
                    <Text style={styles.addProductLabel}>Retail Price *</Text>
                    <TextInput
                      style={styles.addProductInput}
                      placeholderTextColor="#999"
                      placeholder="Enter retail price"
                      value={addForm.retail_price}
                      keyboardType="numeric"
                      onChangeText={t => {
                        onChnage('retail_price', t);
                        // Calculate final price if possible
                        const cost = parseFloat(addForm.cost_price) || 0;
                        const retail = parseFloat(t) || 0;
                        const discount = parseFloat(addForm.discount) || 0;
                        const final =
                          retail > 0
                            ? (retail - (retail * discount) / 100).toFixed(2)
                            : (cost - (cost * discount) / 100).toFixed(2);
                        setAddForm(prev => ({
                          ...prev,
                          final_price: isNaN(Number(final)) ? '' : final,
                        }));
                      }}
                    />
                  </View>
                </View>

                <View style={styles.addProductRow}>
                  <View style={styles.addProductField}>
                    <Text style={styles.addProductLabel}>Discount (%)</Text>
                    <TextInput
                      style={styles.addProductInput}
                      placeholderTextColor="#999"
                      placeholder="Enter discount percentage"
                      value={addForm.discount}
                      keyboardType="numeric"
                      onChangeText={t => {
                        onChnage('discount', t);
                        // Calculate final price if possible
                        const cost = parseFloat(addForm.cost_price) || 0;
                        const retail = parseFloat(addForm.retail_price) || 0;
                        const discount = parseFloat(t) || 0;
                        const final =
                          retail > 0
                            ? (retail - (retail * discount) / 100).toFixed(2)
                            : (cost - (cost * discount) / 100).toFixed(2);
                        setAddForm(prev => ({
                          ...prev,
                          final_price: isNaN(Number(final)) ? '' : final,
                        }));
                      }}
                    />
                  </View>
                  <View style={styles.addProductField}>
                    <Text style={styles.addProductLabel}>Final Price</Text>
                    <TextInput
                      style={[
                        styles.addProductInput,
                        styles.addProductDisabledInput,
                      ]}
                      placeholder="Calculated automatically"
                      value={addForm.final_price || '0.00'}
                      editable={false}
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>

                {/* Supplier Section */}
                <View style={styles.addProductFullRow}>
                  <TouchableOpacity
                    style={styles.addProductCheckboxRow}
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
                    <Text style={styles.addProductCheckboxText}>
                      Enable Supplier
                    </Text>
                  </TouchableOpacity>
                </View>

                {supplier.includes('on') && (
                  <View style={styles.addProductDropdownRow}>
                    <View style={styles.addProductDropdownField}>
                      <Text style={styles.addProductLabel}>Supplier</Text>
                      <DropDownPicker
                        items={transformedSup}
                        open={supOpen}
                        setOpen={setSupOpen}
                        value={supValue}
                        setValue={setSupValue}
                        placeholder="Select supplier"
                        placeholderStyle={styles.addProductDropdownPlaceholder}
                        textStyle={styles.addProductDropdownText}
                        ArrowUpIconComponent={() => (
                          <Icon name="chevron-up" size={18} color="#144272" />
                        )}
                        ArrowDownIconComponent={() => (
                          <Icon name="chevron-down" size={18} color="#144272" />
                        )}
                        style={styles.addProductDropdown}
                        dropDownContainerStyle={styles.addProductDropdownList}
                        labelStyle={styles.addProductDropdownText}
                        listItemLabelStyle={styles.addProductDropdownText}
                        listMode="SCROLLVIEW"
                        disabled={!supplier.includes('on')}
                      />
                    </View>
                  </View>
                )}

                {/* Sub UOM Section */}
                <View style={styles.addProductFullRow}>
                  <TouchableOpacity
                    style={styles.addProductCheckboxRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      const newOptions = subUom.includes('on')
                        ? subUom.filter(opt => opt !== 'on')
                        : [...subUom, 'on'];
                      setSubUom(newOptions);
                    }}>
                    <Checkbox.Android
                      status={subUom.includes('on') ? 'checked' : 'unchecked'}
                      color="#144272"
                      uncheckedColor="#144272"
                    />
                    <Text style={styles.addProductCheckboxText}>
                      Have Sub UOM?
                    </Text>
                  </TouchableOpacity>
                </View>

                {subUom.includes('on') && (
                  <>
                    <View style={styles.addProductDropdownRow}>
                      <View style={styles.addProductDropdownField}>
                        <Text style={styles.addProductLabel}>Sub UOM</Text>
                        <DropDownPicker
                          items={transformedUom}
                          open={subUmoOpen}
                          setOpen={setSubUmoOpen}
                          value={subUmoValue}
                          setValue={setSubUmoValue}
                          placeholder="Select sub UOM"
                          placeholderStyle={
                            styles.addProductDropdownPlaceholder
                          }
                          textStyle={styles.addProductDropdownText}
                          ArrowUpIconComponent={() => (
                            <Icon name="chevron-up" size={18} color="#144272" />
                          )}
                          ArrowDownIconComponent={() => (
                            <Icon
                              name="chevron-down"
                              size={18}
                              color="#144272"
                            />
                          )}
                          style={[styles.addProductDropdown, {zIndex: 999}]}
                          dropDownContainerStyle={styles.addProductDropdownList}
                          labelStyle={styles.addProductDropdownText}
                          listItemLabelStyle={styles.addProductDropdownText}
                          listMode="SCROLLVIEW"
                          disabled={!subUom.includes('on')}
                        />
                      </View>
                    </View>

                    <View style={styles.addProductRow}>
                      <View style={styles.addProductField}>
                        <Text style={styles.addProductLabel}>Equivalence</Text>
                        <TextInput
                          style={[
                            styles.addProductInput,
                            !subUom.includes('on') &&
                              styles.addProductDisabledInput,
                          ]}
                          placeholderTextColor="#999"
                          placeholder="Enter equivalence"
                          keyboardType="number-pad"
                          value={addForm.equivalent}
                          editable={subUom.includes('on')}
                          onChangeText={t => {
                            if (subUom.includes('on'))
                              onChnage('equivalent', t);
                          }}
                        />
                      </View>
                      <View style={styles.addProductField}>
                        <Text style={styles.addProductLabel}>
                          Sub UOM Sale Price
                        </Text>
                        <TextInput
                          style={[
                            styles.addProductInput,
                            !subUom.includes('on') &&
                              styles.addProductDisabledInput,
                          ]}
                          placeholderTextColor="#999"
                          placeholder="Enter sale price"
                          keyboardType="number-pad"
                          value={addForm.sub_price}
                          editable={subUom.includes('on')}
                          onChangeText={t => {
                            if (subUom.includes('on')) onChnage('sub_price', t);
                          }}
                        />
                      </View>
                    </View>
                  </>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.addProductSubmitBtn}
                  onPress={addProduct}>
                  <Icon name="package-variant-closed" size={20} color="white" />
                  <Text style={styles.addProductSubmitText}>Add Product</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/*Edit Product Modal*/}
        <Modal
          visible={modalVisible === 'EditProd'}
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
                    setSubUom([]);
                    setEditSubUmoValue('');
                    setManageStock([]);
                    setExpiry([]);
                    setBarCode('');
                  }}
                  style={styles.editProductCloseBtn}>
                  <Icon name="close" size={20} color="#144272" />
                </TouchableOpacity>
              </View>

              <View style={styles.editProductForm}>
                {/* Product Name and Generic Name */}
                <View style={styles.editProductRow}>
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
                </View>

                {/* Auto Barcode Generation */}
                <View style={styles.editProductFullRow}>
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
                          typeof barCode === 'string'
                            ? barCode
                            : String(barCode),
                        );
                      } else {
                        editOnChnage('prod_UPC_EAN', '');
                      }
                    }}>
                    <Checkbox.Android
                      status={
                        genBarCode.includes('on') ? 'checked' : 'unchecked'
                      }
                      color="#144272"
                      uncheckedColor="#144272"
                    />
                    <Text style={styles.editProductCheckboxText}>
                      Generate Auto BarCode
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.editProductFullRow}>
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
                <View style={styles.editProductFullRow}>
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
                  <View style={styles.editProductFullRow}>
                    <Text style={styles.editProductLabel}>Expiry Date</Text>
                    <TouchableOpacity
                      style={[
                        styles.editProductDatePicker,
                        !expiry.includes('on') &&
                          styles.editProductDisabledInput,
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
                <View style={styles.editProductDropdownRow}>
                  <View style={styles.editProductDropdownField}>
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
                </View>

                <View style={styles.editProductDropdownRow}>
                  <View style={styles.editProductDropdownField}>
                    <Text style={styles.editProductLabel}>
                      Unit of Measure *
                    </Text>
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

                {/* Stock Management */}
                <View style={styles.editProductFullRow}>
                  <TouchableOpacity
                    style={styles.editProductCheckboxRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      const newOptions = manageStock.includes('on')
                        ? manageStock.filter(opt => opt !== 'on')
                        : [...manageStock, 'on'];
                      setManageStock(newOptions);
                    }}>
                    <Checkbox.Android
                      status={
                        manageStock.includes('on') ? 'checked' : 'unchecked'
                      }
                      color="#144272"
                      uncheckedColor="#144272"
                    />
                    <Text style={styles.editProductCheckboxText}>
                      Don't Manage Stock
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.editProductRow}>
                  <View style={styles.editProductField}>
                    <Text style={styles.editProductLabel}>
                      Opening Quantity
                    </Text>
                    <TextInput
                      style={[
                        styles.editProductInput,
                        manageStock.includes('on') &&
                          styles.editProductDisabledInput,
                      ]}
                      placeholderTextColor="#999"
                      placeholder="Enter opening quantity"
                      value={
                        manageStock.includes('on') ? '0' : editForm.prod_qty
                      }
                      editable={!manageStock.includes('on')}
                      onChangeText={t => {
                        if (!manageStock.includes('on'))
                          editOnChnage('prod_qty', t);
                      }}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.editProductField}>
                    <Text style={styles.editProductLabel}>Re-Order Level</Text>
                    <TextInput
                      style={[
                        styles.editProductInput,
                        manageStock.includes('on') &&
                          styles.editProductDisabledInput,
                      ]}
                      placeholderTextColor="#999"
                      placeholder="Enter reorder level"
                      value={
                        manageStock.includes('on')
                          ? '0'
                          : editForm.prod_reorder_qty
                      }
                      editable={!manageStock.includes('on')}
                      onChangeText={t => {
                        if (!manageStock.includes('on'))
                          editOnChnage('prod_reorder_qty', t);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Pricing */}
                <View style={styles.editProductRow}>
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
                        const retail =
                          parseFloat(editForm.prod_retailprice) || 0;
                        const discount =
                          parseFloat(editForm.prod_discount) || 0;
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
                        const discount =
                          parseFloat(editForm.prod_discount) || 0;
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
                </View>

                <View style={styles.editProductRow}>
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
                        const retail =
                          parseFloat(editForm.prod_retailprice) || 0;
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
                </View>

                {/* Supplier Section */}
                <View style={styles.editProductFullRow}>
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

                {/* Sub UOM Section */}
                <View style={styles.editProductFullRow}>
                  <TouchableOpacity
                    style={styles.editProductCheckboxRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      const newOptions = subUom.includes('on')
                        ? subUom.filter(opt => opt !== 'on')
                        : [...subUom, 'on'];
                      setSubUom(newOptions);
                    }}>
                    <Checkbox.Android
                      status={subUom.includes('on') ? 'checked' : 'unchecked'}
                      color="#144272"
                      uncheckedColor="#144272"
                    />
                    <Text style={styles.editProductCheckboxText}>
                      Have Sub UOM?
                    </Text>
                  </TouchableOpacity>
                </View>

                {subUom.includes('on') && (
                  <>
                    <View style={styles.editProductDropdownRow}>
                      <View style={styles.editProductDropdownField}>
                        <Text style={styles.editProductLabel}>Sub UOM</Text>
                        <DropDownPicker
                          items={transformedUom}
                          open={editSubUmoOpen}
                          setOpen={setEditSubUmoOpen}
                          value={editSubUmoValue}
                          setValue={setEditSubUmoValue}
                          placeholder="Select sub UOM"
                          placeholderStyle={
                            styles.editProductDropdownPlaceholder
                          }
                          textStyle={styles.editProductDropdownText}
                          ArrowUpIconComponent={() => (
                            <Icon name="chevron-up" size={18} color="#144272" />
                          )}
                          ArrowDownIconComponent={() => (
                            <Icon
                              name="chevron-down"
                              size={18}
                              color="#144272"
                            />
                          )}
                          style={[styles.editProductDropdown, {zIndex: 999}]}
                          dropDownContainerStyle={
                            styles.editProductDropdownList
                          }
                          labelStyle={styles.editProductDropdownText}
                          listItemLabelStyle={styles.editProductDropdownText}
                          listMode="SCROLLVIEW"
                          disabled={!subUom.includes('on')}
                        />
                      </View>
                    </View>

                    <View style={styles.editProductRow}>
                      <View style={styles.editProductField}>
                        <Text style={styles.editProductLabel}>Equivalence</Text>
                        <TextInput
                          style={[
                            styles.editProductInput,
                            !subUom.includes('on') &&
                              styles.editProductDisabledInput,
                          ]}
                          placeholderTextColor="#999"
                          placeholder="Enter equivalence"
                          keyboardType="number-pad"
                          value={editForm.prod_equivalent}
                          editable={subUom.includes('on')}
                          onChangeText={t => {
                            if (subUom.includes('on'))
                              editOnChnage('prod_equivalent', t);
                          }}
                        />
                      </View>
                      <View style={styles.editProductField}>
                        <Text style={styles.editProductLabel}>
                          Sub UOM Sale Price
                        </Text>
                        <TextInput
                          style={[
                            styles.editProductInput,
                            !subUom.includes('on') &&
                              styles.editProductDisabledInput,
                          ]}
                          placeholderTextColor="#999"
                          placeholder="Enter sale price"
                          keyboardType="number-pad"
                          value={editForm.prod_sub_price}
                          editable={subUom.includes('on')}
                          onChangeText={t => {
                            if (subUom.includes('on'))
                              editOnChnage('prod_sub_price', t);
                          }}
                        />
                      </View>
                    </View>
                  </>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.editProductSubmitBtn}
                  onPress={updateProduct}>
                  <Icon name="package-variant-closed" size={20} color="white" />
                  <Text style={styles.editProductSubmitText}>
                    Update Product
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Toast />
          </View>
        </Modal>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => prev - 1)}
              style={[
                styles.pageButton,
                currentPage === 1 && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === 1 && styles.pageButtonTextDisabled,
                ]}>
                Prev
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                Page <Text style={styles.pageCurrent}>{currentPage}</Text> of{' '}
                {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(prev => prev + 1)}
              style={[
                styles.pageButton,
                currentPage === totalPages && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === totalPages && styles.pageButtonTextDisabled,
                ]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  background: {
    flex: 1,
  },

  // FlatList Styling
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
    marginHorizontal: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionIcon: {
    tintColor: '#144272',
    width: 20,
    height: 20,
    marginHorizontal: 4,
  },
  infoBox: {
    marginTop: 10,
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 10,
  },
  infoText: {
    flex: 1,
    color: '#333',
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  infoIcon: {
    width: 18,
    height: 18,
    tintColor: '#144272',
    marginRight: 6,
  },
  labelText: {
    fontSize: 13,
    color: '#144272',
    fontWeight: '600',
  },
  valueText: {
    fontSize: 13,
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
  },

  // Pagination Component
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#144272',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: -2},
    elevation: 6,
  },
  pageButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  pageButtonDisabled: {
    backgroundColor: '#ddd',
  },
  pageButtonText: {
    color: '#144272',
    fontWeight: '600',
    fontSize: 14,
  },
  pageButtonTextDisabled: {
    color: '#777',
  },
  pageIndicator: {
    paddingHorizontal: 10,
  },
  pageIndicatorText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  pageCurrent: {
    fontWeight: '700',
    color: '#FFD166',
  },

  // Add Product Modal Styles
  addProductModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  addProductModalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  addProductHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addProductTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#144272',
  },
  addProductCloseBtn: {
    padding: 5,
  },
  addProductForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  addProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  addProductField: {
    flex: 1,
    marginHorizontal: 5,
  },
  addProductFullRow: {
    marginBottom: 15,
  },
  addProductLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
    marginBottom: 5,
  },
  addProductInput: {
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
  addProductDisabledInput: {
    backgroundColor: '#e0e0e0',
    color: '#888',
  },
  addProductCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addProductCheckboxText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
    marginLeft: 8,
  },
  addProductDatePicker: {
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
  addProductDateText: {
    fontSize: 14,
    color: '#333',
  },
  addProductDropdownRow: {
    marginBottom: 15,
  },
  addProductDropdownField: {
    flex: 1,
  },
  addProductDropdownContainer: {
    position: 'relative',
  },
  addProductDropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 42,
    zIndex: 999,
  },
  addProductDropdownList: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    zIndex: 1000,
    maxHeight: 160,
  },
  addProductDropdownText: {
    color: '#333',
    fontSize: 14,
  },
  addProductDropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  addProductDropdownAddBtn: {
    position: 'absolute',
    right: 35,
    top: 31,
    backgroundColor: 'transparent',
    padding: 5,
    zIndex: 1001,
  },
  addProductSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#144272',
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  addProductSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  //Delete Modal
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
    color: '#144272',
  },
  editProductCloseBtn: {
    padding: 5,
  },
  editProductForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  editProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  editProductField: {
    flex: 1,
    marginHorizontal: 5,
  },
  editProductFullRow: {
    marginBottom: 15,
  },
  editProductLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
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
    color: '#144272',
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
    backgroundColor: '#144272',
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

  // View Modal Styling
  customerDetailsWrapper: {
    padding: 20,
    alignItems: 'center',
  },
  customerImageWrapper: {
    marginBottom: 20,
  },
  customerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#144272',
  },
  customerNoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  customerNoImageText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  customerInfoBox: {
    width: '100%',
    marginTop: 10,
  },
  customerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 6,
  },
  customerInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#144272',
  },
  customerInfoValue: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
    textAlign: 'right',
  },
});
