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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import Modal from 'react-native-modal';
import {Checkbox} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  const [category, setCategory] = useState('');
  const [subModalVisible, setSubModalVisible] = useState('');
  const [uomName, setUomName] = useState('');

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

  const [btnuom, setbtnuom] = useState(false);

  const [edit, setedit] = useState(false);

  const toggleeditcategory = () => {
    setedit(!edit);
  };

  const [editbtncategory, seteditbtncategory] = useState(false);

  const toggleeditbtncategory = () => {
    seteditbtncategory(!editbtncategory);
  };

  const [uomd, setuomd] = useState(false);

  const toggleedituom = () => {
    setuomd(!uomd);
  };

  const [btnedituom, setbtnedituom] = useState(false);

  const togglebtnedituom = () => {
    setbtnedituom(!btnedituom);
  };
  const [btneditproduct, setbtneditproduct] = useState(false);

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
    if (!genBarCode.includes('on') && !addForm.autobarcode.trim()) {
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
    if (
      !manageStock.includes('on') &&
      addForm.opening_qty.trim() !== '' &&
      addForm.reorder_qty.trim() !== ''
    ) {
      const openingQty = parseFloat(addForm.opening_qty);
      const reorderQty = parseFloat(addForm.reorder_qty);
      if (!isNaN(openingQty) && !isNaN(reorderQty) && openingQty < reorderQty) {
        Toast.show({
          type: 'error',
          text1: 'Opening quantity cannot be less than reorder quantity!',
          visibilityTime: 1500,
        });
        return;
      }
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
        ...(manageStock.includes('on') && {opening_qty: addForm.opening_qty}),
        ...(manageStock.includes('on') && {reorder_qty: addForm.reorder_qty}),
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
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Edit Product
  const updateProduct = async () => {
    if (!editForm.prod_name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Product Name is required',
        visibilityTime: 1500,
      });
      return;
    }
    if (!genBarCode.includes('on') && !editForm.prod_UPC_EAN.trim()) {
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
      editForm.prod_qty.trim() !== '' &&
      editForm.prod_reorder_qty.trim() !== ''
    ) {
      const openingQty = parseFloat(editForm.prod_qty);
      const reorderQty = parseFloat(editForm.prod_reorder_qty);
      if (!isNaN(openingQty) && !isNaN(reorderQty) && openingQty < reorderQty) {
        Toast.show({
          type: 'error',
          text1: 'Opening quantity cannot be less than reorder quantity!',
          visibilityTime: 1500,
        });
        return;
      }
    }
    if (!editForm.prod_costprice.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Cost Price is required',
        visibilityTime: 1500,
      });
      return;
    }
    if (!editForm.prod_retailprice.trim()) {
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
      if (!editForm.prod_equivalent.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Equivalence is required',
          visibilityTime: 1500,
        });
        return;
      }
      if (!editForm.prod_sub_price.trim()) {
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
        product_name: editForm.prod_name.trim(),
        generic_name: editForm.prod_generic_name.trim(),
        ...(genBarCode.includes('on') && {autobarcode: 'on'}),
        upc_ean: editForm.prod_UPC_EAN,
        ...(expiry.includes('on') && {apply_expiry: 'on'}),
        expiry_date: editForm.prod_expirydate,
        cat_id: editCatValue,
        uom_id: editUomValue,
        cost_price: editForm.prod_costprice,
        retail_price: editForm.prod_retailprice,
        discount: editForm.prod_discount,
        final_price: editForm.prod_fretailprice,
        ...(subUom.includes('on') && {have_sub_uom: 'on'}),
        sub_uom: editSubUmoValue,
        equivalent: editForm.prod_equivalent,
        sub_price: editForm.prod_sub_price,
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
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Add Category
  const addCategory = async () => {
    if (!category) {
      Toast.show({
        type: 'error',
        text1: 'Category name is required',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/addcategory`,
        {
          cat_name: category.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = res.data;
      console.log(res.data);

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Category has been added successfully!',
          visibilityTime: 1500,
        });
        setSubModalVisible('');
        setCategory('');
        fetchCatgories();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Add Category
  const addUom = async () => {
    if (!uomName) {
      Toast.show({
        type: 'error',
        text1: 'UOM name is required',
        visibilityTime: 1500,
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/adduom`,
        {
          uom_name: uomName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = res.data;
      console.log(res.data);

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'UOM has been added successfully!',
          visibilityTime: 1500,
        });
        setSubModalVisible('');
        setUomName('');
        fetchUom();
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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
            justifyContent: 'space-between',
            marginBottom: 15,
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
              Products
            </Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible('AddProd')}>
            <Image
              style={{
                tintColor: 'white',
                width: 18,
                height: 18,
                alignSelf: 'center',
                marginRight: 5,
              }}
              source={require('../../../assets/add.png')}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={currentData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <ScrollView
              style={{
                padding: 5,
              }}>
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
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
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
                      <Image
                        style={{
                          tintColor: '#144272',
                          width: 15,
                          height: 15,
                          alignSelf: 'center',
                          marginRight: 5,
                          marginTop: 9,
                        }}
                        source={require('../../../assets/show.png')}
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
                      <Image
                        style={{
                          tintColor: '#144272',
                          width: 15,
                          height: 15,
                          alignSelf: 'center',
                          marginTop: 8,
                        }}
                        source={require('../../../assets/edit.png')}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('DeleteProd');
                        setSelectedProd(item.id);
                      }}>
                      <Image
                        style={{
                          tintColor: '#144272',
                          width: 15,
                          height: 15,
                          alignSelf: 'center',
                          marginRight: 5,
                          marginTop: 8,
                        }}
                        source={require('../../../assets/delete.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Barcode:</Text>
                    <Text style={styles.text}>{item.prod_UPC_EAN}</Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Category:</Text>
                    <Text style={styles.text}>{item.pcat_name}</Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Cost:</Text>
                    <Text style={styles.text}>{item.prod_costprice}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Retail Price:</Text>
                    <Text style={styles.text}>{item.prod_retailprice}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Quantity:</Text>
                    <Text style={styles.text}>{item.prod_qty}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={[styles.value, {marginBottom: 5}]}>
                      Expiry :
                    </Text>
                    <Text style={[styles.value, {marginBottom: 5}]}>
                      {item.prod_expirydate ?? 'No expiry date'}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 20}}>
              <Text style={{color: '#fff', fontSize: 14}}>
                No Product found.
              </Text>
            </View>
          }
        />

        {/*Delete Modal*/}
        <Modal isVisible={modalVisible === 'DeleteProd'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 220,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/info.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Are you sure?
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              You won't be able to revert this record!
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setSelectedProd(null);
                }}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 100,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  delProduct();
                }}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 100,
                    height: 30,
                    padding: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Yes, delete it
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*View Product Modal*/}
        <Modal isVisible={modalVisible === 'ViewProd'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 500,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Product's Detail
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setViewProd([]);
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={viewProd}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <ScrollView
                  style={{
                    padding: 5,
                  }}>
                  <View style={styles.table}>
                    <View style={[styles.cardContainer]}>
                      <View style={{alignItems: 'center', marginBottom: 16}}>
                        {item.pro.prod_image ? (
                          <Image
                            source={{uri: item.pro.prod_image}}
                            style={styles.customerImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.noImageText}>
                            No Image Provided
                          </Text>
                        )}
                      </View>

                      <View style={styles.infoGrid}>
                        <Text style={styles.labl}>Product Name:</Text>
                        <Text style={styles.valu}>{item.pro.prod_name}</Text>
                        <Text style={styles.labl}>Second Name:</Text>
                        <Text style={styles.valu}>
                          {item.pro.prod_generic_name ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>UPC_EAN:</Text>
                        <Text style={styles.valu}>
                          {item.pro.prod_UPC_EAN ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>Expiry Date:</Text>
                        <Text style={styles.valu}>
                          {item.pro.prod_expirydate ?? 'No expiry date'}
                        </Text>
                        <Text style={styles.labl}>Reorder:</Text>
                        <Text style={styles.valu}>
                          {item.pro.prod_reorder_qty ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>Category:</Text>
                        <Text style={styles.valu}>
                          {item.cat.pcat_name ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>UOM:</Text>
                        <Text style={styles.valu}>
                          {item.uom.ums_name ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>Sub UOM:</Text>
                        <Text style={styles.valu}>
                          {item.pro.prod_sub_uom ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>Master UOM:</Text>
                        <Text style={styles.valu}>
                          {item.pro.prod_master_uom ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>
                          Sub To Master UOM Equivalent:
                        </Text>
                        <Text style={styles.valu}>
                          {item.pro.prod_master_uom ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>Sub UOM Price:</Text>
                        <Text style={styles.valu}>
                          {item.pro.prod_sub_uom ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>Manage Stock:</Text>
                        <Text style={styles.valu}>
                          {item.pro.prod_manage_stock ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>Opening Quantity:</Text>
                        <Text style={styles.valu}>
                          {item.pro.prod_qty ?? '0'}
                        </Text>
                        <Text style={styles.labl}>Cost Price:</Text>
                        <Text style={styles.valu}>
                          {item.pro.prod_costprice ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>Retail Price:</Text>
                        <Text style={styles.valu}>
                          {item.pro.prod_retailprice ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>Discount(%):</Text>
                        <Text style={styles.valu}>
                          {item.pro.prod_discount ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>Final Price:</Text>
                        <Text style={styles.valu}>
                          {item.pro?.prod_fretailprice ?? 'N/A'}
                        </Text>
                        <Text style={styles.labl}>Supplier Name:</Text>
                        <Text style={styles.valu}>
                          {item.supp?.sup_name ?? 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
            />
          </View>
        </Modal>

        {/*Add Product*/}
        <Modal isVisible={modalVisible === 'AddProd'}>
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 600,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Add New Product
              </Text>
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
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Product Name"
                value={addForm.product_name}
                onChangeText={t => onChnage('product_name', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Second Name"
                value={addForm.generic_name}
                onChangeText={t => onChnage('generic_name', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
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
                      typeof barCode === 'string' ? barCode : String(barCode),
                    );
                  } else {
                    onChnage('upc_ean', '');
                  }
                }}>
                <Checkbox.Android
                  status={genBarCode.includes('on') ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                />
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Generate Auto BarCode
                </Text>
              </TouchableOpacity>

              <TextInput
                style={[
                  styles.productinput,
                  genBarCode.includes('on') && {
                    backgroundColor: '#b0b0b0',
                    color: '#f5f5f5',
                  },
                ]}
                placeholderTextColor={
                  genBarCode.includes('on') ? '#f5f5f5' : '#144272'
                }
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

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
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
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Apply Expiry
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  width: '53%',
                  borderRightWidth: 1,
                  borderLeftWidth: 1,
                  borderRadius: 5,
                  borderColor: '#144272',
                  marginLeft: hp('2%'),
                  height: 30,
                  opacity: expiry.includes('on') ? 1 : 0.5,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 5,
                    borderColor: '#144272',
                  }}>
                  <Text style={{marginLeft: 10, color: '#144272'}}>
                    {`${startDate.toLocaleDateString()}`}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (expiry.includes('on')) setShowStartDatePicker(true);
                    }}
                    disabled={!expiry.includes('on')}>
                    <Image
                      style={{
                        height: 20,
                        width: 20,
                        resizeMode: 'stretch',
                        alignItems: 'center',
                        marginLeft: 55,
                        tintColor: '#144272',
                        opacity: expiry.includes('on') ? 1 : 0.5,
                      }}
                      source={require('../../../assets/calendar.png')}
                    />
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
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={transformedCat}
                open={catOpen}
                setOpen={setCatOpen}
                value={catValue}
                setValue={setCatValue}
                placeholder="Select Category"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#144272" />
                )}
                style={[styles.dropdown, {borderColor: '#144272', width: 265}]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                  zIndex: 1000,
                  marginTop: 8,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />
              <TouchableOpacity onPress={() => setSubModalVisible('AddCat')}>
                <Image
                  style={{
                    tintColor: '#144272',
                    width: 22,
                    height: 17,
                    alignSelf: 'center',
                    marginLeft: -26,
                    marginTop: 17,
                  }}
                  source={require('../../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={transformedUom}
                open={uomOpen}
                setOpen={setUomOpen}
                value={uomValue}
                setValue={setUomValue}
                placeholder="Select UOM"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#144272" />
                )}
                style={[
                  styles.dropdown,
                  {borderColor: '#144272', width: 265, zIndex: 999},
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                  marginTop: 8,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />
              <TouchableOpacity onPress={() => setSubModalVisible('AddUom')}>
                <Image
                  style={{
                    tintColor: '#144272',
                    width: 22,
                    height: 17,
                    alignSelf: 'center',
                    marginLeft: -26,
                    marginTop: 17,
                  }}
                  source={require('../../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.row,
                {marginLeft: 10, marginRight: 10, marginTop: -8},
              ]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
                activeOpacity={0.7}
                onPress={() => {
                  const newOptions = manageStock.includes('on')
                    ? manageStock.filter(opt => opt !== 'on')
                    : [...manageStock, 'on'];
                  setManageStock(newOptions);
                }}>
                <Checkbox.Android
                  status={manageStock.includes('on') ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                />
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Don't Manage Stock
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={[
                  styles.productinput,
                  manageStock.includes('on') && {
                    backgroundColor: '#b0b0b0',
                    color: '#f5f5f5',
                  },
                ]}
                placeholderTextColor={
                  manageStock.includes('on') ? '#f5f5f5' : '#144272'
                }
                placeholder="Opening Quantity"
                value={manageStock.includes('on') ? '0' : addForm.opening_qty}
                editable={!manageStock.includes('on')}
                onChangeText={t => {
                  if (!manageStock.includes('on')) onChnage('opening_qty', t);
                }}
                keyboardType="number-pad"
              />
              <TextInput
                style={[
                  styles.productinput,
                  manageStock.includes('on') && {
                    backgroundColor: '#b0b0b0',
                    color: '#f5f5f5',
                  },
                ]}
                placeholderTextColor={
                  manageStock.includes('on') ? '#f5f5f5' : '#144272'
                }
                placeholder="Re Order Level"
                value={manageStock.includes('on') ? '0' : addForm.reorder_qty}
                editable={!manageStock.includes('on')}
                onChangeText={t => {
                  if (!manageStock.includes('on')) onChnage('reorder_qty', t);
                }}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Cost Price"
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
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Retail Price"
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

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Discount"
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
              <TextInput
                style={[
                  styles.productinput,
                  {color: '#f5f5f5', backgroundColor: '#b0b0b0'},
                ]}
                placeholder="Final Price"
                value={addForm.final_price || '0.00'}
                editable={false}
                placeholderTextColor="#f5f5f5"
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
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
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Enable Supplier
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
                opacity: supplier.includes('on') ? 1 : 0.5,
              }}>
              <DropDownPicker
                items={transformedSup}
                open={supOpen}
                setOpen={setSupOpen}
                value={supValue}
                setValue={setSupValue}
                placeholder="Select Supplier"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#144272" />
                )}
                style={[
                  styles.dropdown,
                  {
                    width: '100%',
                    borderColor: '#144272',
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '100%',
                  marginTop: 8,
                  zIndex: 1000,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
                disabled={!supplier.includes('on')}
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
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
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Have Sub UOM?
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
                opacity: subUom.includes('on') ? 1 : 0.5,
              }}>
              <DropDownPicker
                items={transformedUom}
                open={subUmoOpen}
                setOpen={setSubUmoOpen}
                value={subUmoValue}
                setValue={setSubUmoValue}
                placeholder="Select Sub UOM"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#144272" />
                )}
                style={[
                  styles.dropdown,
                  {
                    borderColor: '#144272',
                    width: '100%',
                    alignSelf: 'center',
                    zIndex: 999,
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '100%',
                  marginTop: 8,
                  maxHeight: 150,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
                disabled={!subUom.includes('on')}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <Text
                style={[
                  styles.productinput,
                  {color: '#144272', marginBottom: 8},
                ]}>
                Master UOM:
              </Text>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={[
                  styles.productinput,
                  !subUom.includes('on') && {
                    backgroundColor: '#b0b0b0',
                    color: '#f5f5f5',
                  },
                ]}
                placeholderTextColor={
                  !subUom.includes('on') ? '#f5f5f5' : '#144272'
                }
                placeholder="Equivalence"
                keyboardType="number-pad"
                value={addForm.equivalent}
                editable={subUom.includes('on')}
                onChangeText={t => {
                  if (subUom.includes('on')) onChnage('equivalent', t);
                }}
              />
              <TextInput
                style={[
                  styles.productinput,
                  !subUom.includes('on') && {
                    backgroundColor: '#b0b0b0',
                    color: '#f5f5f5',
                  },
                ]}
                placeholderTextColor={
                  !subUom.includes('on') ? '#f5f5f5' : '#144272'
                }
                placeholder="Sale Price"
                keyboardType="number-pad"
                value={addForm.sub_price}
                editable={subUom.includes('on')}
                onChangeText={t => {
                  if (subUom.includes('on')) onChnage('sub_price', t);
                }}
              />
            </View>

            <TouchableOpacity onPress={addProduct}>
              <View
                style={{
                  backgroundColor: '#144272',
                  paddingVertical: 10,
                  paddingHorizontal: 8,
                  margin: 10,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add Product
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*Add Category*/}
        <Modal isVisible={subModalVisible === 'AddCat'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 135,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Add New Category
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSubModalVisible('');
                  setCategory('');
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="Category Name"
                value={category}
                onChangeText={t => setCategory(t)}
              />
            </View>
            <TouchableOpacity onPress={addCategory}>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#144272',
                  height: 30,
                  borderRadius: 10,
                  width: 100,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add Category
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Add UOM */}
        <Modal isVisible={subModalVisible === 'AddUom'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 135,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Add New UOM
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSubModalVisible('');
                  setUomName('');
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="UOM Name"
                value={uomName}
                onChangeText={t => setUomName(t)}
              />
            </View>
            <TouchableOpacity onPress={addUom}>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#144272',
                  height: 30,
                  borderRadius: 10,
                  width: 100,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add UOM
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/*Add btn uom*/}
        <Modal isVisible={btnuom}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Added
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              UOM has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setbtnuom(!btnuom)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*Edit Product*/}
        <Modal isVisible={modalVisible === 'EditProd'}>
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 500,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Update Product
              </Text>
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
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Product Name"
                value={editForm.prod_name}
                onChangeText={t => editOnChnage('prod_name', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Second Name"
                value={editForm.prod_generic_name}
                onChangeText={t => editOnChnage('prod_generic_name', t)}
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
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
                  color="#144272"
                  uncheckedColor="#144272"
                />
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Generate Auto BarCode
                </Text>
              </TouchableOpacity>

              <TextInput
                style={[
                  styles.productinput,
                  genBarCode.includes('on') && {
                    backgroundColor: '#b0b0b0',
                    color: '#f5f5f5',
                  },
                ]}
                placeholderTextColor={
                  genBarCode.includes('on') ? '#f5f5f5' : '#144272'
                }
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

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
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
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Apply Expiry
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  width: '53%',
                  borderRightWidth: 1,
                  borderLeftWidth: 1,
                  borderRadius: 5,
                  borderColor: '#144272',
                  marginLeft: hp('2%'),
                  height: 30,
                  opacity: expiry.includes('on') ? 1 : 0.5,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 5,
                    borderColor: '#144272',
                  }}>
                  <Text style={{marginLeft: 10, color: '#144272'}}>
                    {editForm.prod_expirydate
                      ? new Date(
                          editForm.prod_expirydate,
                        ).toLocaleDateString?.() ||
                        new Date().toLocaleDateString()
                      : new Date().toLocaleDateString()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (expiry.includes('on')) setShowStartDatePicker(true);
                    }}
                    disabled={!expiry.includes('on')}>
                    <Image
                      style={{
                        height: 20,
                        width: 20,
                        resizeMode: 'stretch',
                        alignItems: 'center',
                        marginLeft: 55,
                        tintColor: '#144272',
                        opacity: expiry.includes('on') ? 1 : 0.5,
                      }}
                      source={require('../../../assets/calendar.png')}
                    />
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
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={transformedCat}
                open={editCatOpen}
                setOpen={setEditCatOpen}
                value={editCatValue}
                setValue={setEditCatValue}
                placeholder="Select Category"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#144272" />
                )}
                style={[styles.dropdown, {borderColor: '#144272', width: 265}]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                  zIndex: 1000,
                  marginTop: 8,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />
              <TouchableOpacity onPress={toggleeditcategory}>
                <Image
                  style={{
                    tintColor: '#144272',
                    width: 22,
                    height: 17,
                    alignSelf: 'center',
                    marginLeft: -26,
                    marginTop: 17,
                  }}
                  source={require('../../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={transformedUom}
                open={editUomOpen}
                setOpen={setEditUomOpen}
                value={editUomValue}
                setValue={setEditUomValue}
                placeholder="Select UOM"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#144272" />
                )}
                style={[
                  styles.dropdown,
                  {borderColor: '#144272', width: 265, zIndex: 999},
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                  marginTop: 8,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />
              <TouchableOpacity onPress={toggleedituom}>
                <Image
                  style={{
                    tintColor: '#144272',
                    width: 22,
                    height: 17,
                    alignSelf: 'center',
                    marginLeft: -26,
                    marginTop: 17,
                  }}
                  source={require('../../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.row,
                {marginLeft: 10, marginRight: 10, marginTop: -8},
              ]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
                activeOpacity={0.7}
                onPress={() => {
                  const newOptions = manageStock.includes('on')
                    ? manageStock.filter(opt => opt !== 'on')
                    : [...manageStock, 'on'];
                  setManageStock(newOptions);
                }}>
                <Checkbox.Android
                  status={manageStock.includes('on') ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                />
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Don't Manage Stock
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={[
                  styles.productinput,
                  manageStock.includes('on') && {
                    backgroundColor: '#b0b0b0',
                    color: '#f5f5f5',
                  },
                ]}
                placeholderTextColor={
                  manageStock.includes('on') ? '#f5f5f5' : '#144272'
                }
                placeholder="Opening Quantity"
                value={manageStock.includes('on') ? '0' : editForm.prod_qty}
                editable={!manageStock.includes('on')}
                onChangeText={t => {
                  if (!manageStock.includes('on')) editOnChnage('prod_qty', t);
                }}
                keyboardType="number-pad"
              />
              <TextInput
                style={[
                  styles.productinput,
                  manageStock.includes('on') && {
                    backgroundColor: '#b0b0b0',
                    color: '#f5f5f5',
                  },
                ]}
                placeholderTextColor={
                  manageStock.includes('on') ? '#f5f5f5' : '#144272'
                }
                placeholder="Re Order Level"
                value={
                  manageStock.includes('on') ? '0' : editForm.prod_reorder_qty
                }
                editable={!manageStock.includes('on')}
                onChangeText={t => {
                  if (!manageStock.includes('on'))
                    editOnChnage('prod_reorder_qty', t);
                }}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Cost Price"
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
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Retail Price"
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

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Discount"
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
              <TextInput
                style={[
                  styles.productinput,
                  {color: '#f5f5f5', backgroundColor: '#b0b0b0'},
                ]}
                placeholder="Final Price"
                value={addForm.final_price || '0.00'}
                editable={false}
                placeholderTextColor="#f5f5f5"
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
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
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Enable Supplier
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
                opacity: supplier.includes('on') ? 1 : 0.5,
              }}>
              <DropDownPicker
                items={transformedSup}
                open={editSupOpen}
                setOpen={setEditSupOpen}
                value={editSupValue}
                setValue={setEditSupValue}
                placeholder="Select Supplier"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#144272" />
                )}
                style={[
                  styles.dropdown,
                  {
                    width: '100%',
                    borderColor: '#144272',
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '100%',
                  marginTop: 8,
                  zIndex: 1000,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
                disabled={!supplier.includes('on')}
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
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
                <Text style={{color: '#144272', marginLeft: 8}}>
                  Have Sub UOM?
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
                opacity: subUom.includes('on') ? 1 : 0.5,
              }}>
              <DropDownPicker
                items={transformedUom}
                open={editSubUmoOpen}
                setOpen={setEditSubUmoOpen}
                value={editSubUmoValue}
                setValue={setEditSubUmoValue}
                placeholder="Select Sub UOM"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#144272" />
                )}
                style={[
                  styles.dropdown,
                  {
                    borderColor: '#144272',
                    width: '100%',
                    alignSelf: 'center',
                    zIndex: 999,
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '100%',
                  marginTop: 8,
                  maxHeight: 150,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
                disabled={!subUom.includes('on')}
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <Text
                style={[
                  styles.productinput,
                  {color: '#144272', marginBottom: 8},
                ]}>
                Master UOM:
              </Text>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={[
                  styles.productinput,
                  !subUom.includes('on') && {
                    backgroundColor: '#b0b0b0',
                    color: '#f5f5f5',
                  },
                ]}
                placeholderTextColor={
                  !subUom.includes('on') ? '#f5f5f5' : '#144272'
                }
                placeholder="Equivalence"
                keyboardType="number-pad"
                value={editForm.prod_equivalent}
                editable={subUom.includes('on')}
                onChangeText={t => {
                  if (subUom.includes('on')) editOnChnage('prod_equivalent', t);
                }}
              />
              <TextInput
                style={[
                  styles.productinput,
                  !subUom.includes('on') && {
                    backgroundColor: '#b0b0b0',
                    color: '#f5f5f5',
                  },
                ]}
                placeholderTextColor={
                  !subUom.includes('on') ? '#f5f5f5' : '#144272'
                }
                placeholder="Sale Price"
                keyboardType="number-pad"
                value={editForm.prod_sub_price}
                editable={subUom.includes('on')}
                onChangeText={t => {
                  if (subUom.includes('on')) editOnChnage('prod_sub_price', t);
                }}
              />
            </View>

            <TouchableOpacity onPress={updateProduct}>
              <View
                style={{
                  backgroundColor: '#144272',
                  height: 30,
                  width: 290,
                  margin: 10,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Update Product
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*add category modal*/}
        <Modal isVisible={edit}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 135,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Add New Category
              </Text>
              <TouchableOpacity onPress={() => setedit(!edit)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="Category Name"
              />
            </View>
            <TouchableOpacity onPress={toggleeditbtncategory}>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#144272',
                  height: 30,
                  borderRadius: 10,
                  width: 100,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add Category
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/*Add btn category*/}
        <Modal isVisible={editbtncategory}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Added
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Category has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => seteditbtncategory(!editbtncategory)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*uom*/}
        <Modal isVisible={uomd}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 135,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Add New UOM
              </Text>
              <TouchableOpacity onPress={() => setuomd(!uomd)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="UOM Name"
              />
            </View>
            <TouchableOpacity onPress={togglebtnedituom}>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#144272',
                  height: 30,
                  borderRadius: 10,
                  width: 100,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add UOM
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/*Add btn uom*/}
        <Modal isVisible={btnedituom}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Added
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              UOM has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setbtnedituom(!btnedituom)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*edit product btn*/}
        <Modal isVisible={btneditproduct}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Updated
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Product has been updated successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => setbtneditproduct(!btneditproduct)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingVertical: 10,
              width: '100%',
            }}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => prev - 1)}
              style={{
                marginHorizontal: 10,
                opacity: currentPage === 1 ? 0.5 : 1,
              }}>
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                Prev
              </Text>
            </TouchableOpacity>

            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
              Page {currentPage} of {totalPages}
            </Text>

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(prev => prev + 1)}
              style={{
                marginHorizontal: 10,
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}>
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
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
  background: {
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 5,
    borderTopLeftRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  value: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: 285,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
    marginLeft: 10,
    marginRight: 10,
  },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    color: '#000',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
  },
  productinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
  },
  cardContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    paddingBottom: 24,
    marginBottom: 40,
  },
  customerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#144272',
  },
  noImageText: {
    color: '#144272',
    fontStyle: 'italic',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  labl: {
    width: '68%',
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 4,
  },
  valu: {
    width: '68%',
    marginBottom: 8,
    color: '#144272',
  },
});
