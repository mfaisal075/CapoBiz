import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import {Checkbox} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import backgroundColors from '../../Colors';

interface Products {
  id: number;
  prod_name: string;
  prod_UPC_EAN: string;
  prod_costprice: string;
  prod_retailprice: string;
  prod_sub_qty: string;
  prod_expirydate: string;
  prod_qty: string;
  pcat_name: string;
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

export default function CustomerPeople({navigation}: any) {
  const [modalVisible, setModalVisible] = useState('');
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Products[]>([]);
  const [masterData, setMasterData] = useState<Products[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = filteredData.slice(
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

  // Fetch Products
  const fetchPrducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchproductlist`);

      const prodData = res.data.product;

      setFilteredData(prodData);
      setMasterData(prodData);
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

  // Search Filter
  const searchFilter = (text: string) => {
    if (text) {
      const newData = masterData.filter(item => {
        const itemData = item.prod_name
          ? item.prod_name.toLocaleUpperCase()
          : ''.toLocaleLowerCase();
        const textData = text.toLocaleUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredData(newData);
      setSearchQuery(text);
    } else {
      setFilteredData(masterData);
      setSearchQuery(text);
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
      <View style={styles.gradientBackground}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Products</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible('AddProd')}
            style={[styles.headerBtn]}>
            <Text style={styles.addBtnText}>Add</Text>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Filter */}
        <View style={styles.searchFilter}>
          <Icon name="magnify" size={36} color={backgroundColors.dark} />
          <TextInput
            placeholder="Search by product name"
            style={styles.search}
            value={searchQuery}
            onChangeText={text => searchFilter(text)}
          />
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  navigation.navigate('ProductDetails', {
                    id: item.id,
                  });
                }}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View style={styles.avatarBox}>
                    <Image
                      source={require('../../../assets/product.png')}
                      style={styles.avatar}
                    />
                  </View>

                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.prod_name}</Text>
                    <Text style={styles.subText}>{`${
                      item.prod_retailprice
                    } PKR  -  ${
                      item.prod_sub_qty
                        ? `(${item.prod_qty} - ${item.prod_sub_qty})`
                        : `${item.prod_qty}`
                    } PC`}</Text>
                  </View>

                  {/* Actions on right */}
                  <View style={styles.actionRow}>
                    <Icon
                      name="chevron-right"
                      size={28}
                      color={backgroundColors.dark}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-group" size={48} color="#666" />
                <Text style={styles.emptyText}>No record found.</Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 90}}
            showsVerticalScrollIndicator={false}
          />
        </View>

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
                      color={backgroundColors.primary}
                      uncheckedColor={backgroundColors.dark}
                    />
                    <Text style={styles.addProductCheckboxText}>
                      Generate Auto BarCode
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.addProductField}>
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
                <View style={styles.addProductField}>
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
                      color={backgroundColors.primary}
                      uncheckedColor={backgroundColors.dark}
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
                <View style={styles.addProductField}>
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

                <View style={styles.addProductField}>
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
                <View style={styles.addProductField}>
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
                      color={backgroundColors.primary}
                      uncheckedColor={backgroundColors.dark}
                    />
                    <Text style={styles.addProductCheckboxText}>
                      Don't Manage Stock
                    </Text>
                  </TouchableOpacity>
                </View>

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

                {/* Pricing */}
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

                {/* Supplier Section */}
                <View style={styles.addProductField}>
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
                      color={backgroundColors.primary}
                      uncheckedColor={backgroundColors.dark}
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
                      color={backgroundColors.primary}
                      uncheckedColor={backgroundColors.dark}
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
                    </View>
                    <View style={styles.addProductRow}>
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
              <Text style={styles.totalText}>
                Total: {totalRecords} records
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
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.light,
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

  // Search Filter
  searchFilter: {
    width: '94%',
    alignSelf: 'center',
    height: 48,
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  search: {
    height: '100%',
    fontSize: 14,
    color: backgroundColors.dark,
    width: '100%',
  },

  // FlatList Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: '3%',
  },
  card: {
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    height: 40,
    width: 40,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    width: '96%',
    alignSelf: 'center',
    marginTop: 60,
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Pagination Component
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: backgroundColors.primary,
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
    backgroundColor: backgroundColors.info,
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
    color: '#fff',
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
  totalText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
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
    color: backgroundColors.primary,
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
    marginBottom: 5,
  },
  addProductFullRow: {
    marginBottom: 15,
  },
  addProductLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
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
    color: backgroundColors.dark,
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
    backgroundColor: backgroundColors.primary,
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
});
