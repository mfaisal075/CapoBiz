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
  StatusBar,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import {Checkbox} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import BottomBar from '../../BottomBar';

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  primarySoft: 'rgba(42, 101, 43, 0.1)',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textDark: '#1F2937',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  danger: '#EF4444',
};

// --- HELPER: Get Initials ---
const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

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

export default function ProductsProducts({navigation}: any) {
  const {openDrawer} = useDrawer();
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
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
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

  const onChnage = (field: keyof AddProduct, value: string | Date) => {
    setAddForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

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

  const fetchPrducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/fetchproductlist`);
      const prodData = res.data.product || [];
      setFilteredData(prodData);
      setMasterData(prodData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatgories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcombocat`);
      setCatItems(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUom = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcombouom`);
      setUomItems(res.data);
    } catch (error) {
      console.log();
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/loadsuppliers`);
      setSupItems(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getBarCode = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/auto_gen_barcode`);
      setBarCode(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addProduct = async () => {
    if (!addForm.product_name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Product Name is required',
        visibilityTime: 1500,
      });
      return;
    }
    // ... rest of validation same as before ... (omitted for brevity, keep original login details)
    // Simply wrapping validation calls - pasting full implementation from original code below for safety
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

  const searchFilter = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const newData = masterData.filter(item => {
        const itemData = item.prod_name ? item.prod_name.toUpperCase() : '';
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredData(newData);
    } else {
      setFilteredData(masterData);
    }
  };

  useEffect(() => {
    fetchPrducts();
    fetchCatgories();
    fetchUom();
    fetchSuppliers();
    getBarCode();

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

  // --- Render Item (Card) ---
  const renderItem = ({item, index}: {item: Products; index: number}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.cardRow}
        onPress={() => navigation.navigate('ProductDetails', {id: item.id})}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.prod_name)}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.prod_name}
          </Text>

          {/* Row 1: Cost | Retail */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>Cost: {item.prod_costprice}</Text>
            </View>
            <View style={styles.detailSeparator} />
            <View style={styles.detailItem}>
              <Text style={[styles.detailText, {color: THEME.primary}]}>
                Retail: {item.prod_retailprice}
              </Text>
            </View>
          </View>

          {/* Row 2: Category | QTY | Barcode */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="shape-outline" size={14} color={THEME.textLight} />
              <Text style={styles.subText}>{item.pcat_name || 'General'}</Text>
            </View>

            <View style={styles.detailSeparator} />
            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.subText,
                  parseInt(item.prod_qty) < 10 && {color: THEME.danger},
                ]}>
                QTY: {item.prod_qty}
              </Text>
            </View>

            {item.prod_UPC_EAN ? (
              <>
                <View style={styles.detailSeparator} />
                <View style={styles.detailItem}>
                  <Icon name="barcode-scan" size={14} color={THEME.textLight} />
                  <Text style={styles.subText} numberOfLines={1}>
                    {item.prod_UPC_EAN}
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        <Icon
          name="chevron-right"
          size={22}
          color={THEME.primary}
          style={{marginLeft: 6}}
        />
      </TouchableOpacity>
    );
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
            <Text style={styles.headerTitle}>Products</Text>
            <TouchableOpacity
              onPress={() => setModalVisible('AddProd')}
              style={styles.iconBtn}>
              <Icon name="plus" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Floating Search Bar */}
        <View style={styles.floatingSearchContainer}>
          <Icon name="magnify" size={22} color={THEME.primary} />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor={THEME.textLight}
            style={styles.floatingSearchInput}
            value={searchQuery}
            onChangeText={searchFilter}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => searchFilter('')}>
              <Icon name="close-circle" size={18} color={THEME.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* --- CONTENT LIST --- */}
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <LottieView
              source={require('../../../assets/Loading-Dots.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        ) : (
          <>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeaderLabel}>PRODUCT LIST</Text>
              <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
            </View>

            <FlatList
              data={currentData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={{paddingBottom: 160}}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.loadingContainer}>
                  <Icon
                    name="package-variant-closed"
                    size={48}
                    color="#D1D5DB"
                  />
                  <Text style={styles.emptyText}>No products found</Text>
                </View>
              }
            />
          </>
        )}
      </View>

      {/* --- PAGINATION (Floating) --- */}
      {!loading && totalRecords > 0 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(prev => prev - 1)}
            style={[styles.pageBtn, currentPage === 1 && styles.disabledBtn]}>
            <Icon name="chevron-left" size={24} color={THEME.white} />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage(prev => prev + 1)}
            style={[
              styles.pageBtn,
              currentPage === totalPages && styles.disabledBtn,
            ]}>
            <Icon name="chevron-right" size={24} color={THEME.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* --- ADD PRODUCT MODAL (Existing implementation wrapped in Modal) --- */}
      <Modal
        visible={modalVisible === 'AddProd'}
        transparent
        animationType="slide">
        <View style={styles.modalOverlay}>
          {/* Keeping existing modal structure but updated background overlay style */}
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Add New Product</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible('')}
                  style={styles.closeBtn}>
                  <Icon name="close" size={22} color={THEME.textDark} />
                </TouchableOpacity>
              </View>

              {/* --- Form Fields --- */}
              {/* Product Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  value={addForm.product_name}
                  onChangeText={t => onChnage('product_name', t)}
                  placeholder="Enter product name"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Generic Name</Text>
                <TextInput
                  style={styles.input}
                  value={addForm.generic_name}
                  onChangeText={t => onChnage('generic_name', t)}
                  placeholder="Enter generic name"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Barcode & Auto */}
              <TouchableOpacity
                style={styles.checkboxRow}
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
                  color={THEME.primary}
                  uncheckedColor={THEME.textDark}
                />
                <Text style={styles.checkboxLabel}>Generate Auto BarCode</Text>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Barcode / UPC *</Text>
                <TextInput
                  style={[
                    styles.input,
                    genBarCode.includes('on') && {backgroundColor: '#F3F4F6'},
                  ]}
                  value={
                    genBarCode.includes('on')
                      ? String(barCode)
                      : addForm.upc_ean
                  }
                  editable={!genBarCode.includes('on')}
                  onChangeText={t => onChnage('upc_ean', t)}
                  placeholder="Scan or enter barcode"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              {/* Expiry */}
              <TouchableOpacity
                style={styles.checkboxRow}
                activeOpacity={0.7}
                onPress={() => {
                  const newOptions = expiry.includes('on') ? [] : ['on'];
                  setExpiry(newOptions);
                }}>
                <Checkbox.Android
                  status={expiry.includes('on') ? 'checked' : 'unchecked'}
                  color={THEME.primary}
                />
                <Text style={styles.checkboxLabel}>Apply Expiry Date</Text>
              </TouchableOpacity>

              {expiry.includes('on') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowStartDatePicker(true)}>
                    <Text style={{color: THEME.textDark}}>
                      {startDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      onChange={onStartDateChange}
                    />
                  )}
                </View>
              )}

              {/* Cat & UOM */}
              <View style={{zIndex: 3000, marginBottom: 15}}>
                <Text style={styles.label}>Category *</Text>
                <DropDownPicker
                  items={transformedCat}
                  open={catOpen}
                  setOpen={setCatOpen}
                  value={catValue}
                  setValue={setCatValue}
                  placeholder="Select Category"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                />
              </View>
              <View style={{zIndex: 2000, marginBottom: 15}}>
                <Text style={styles.label}>UOM *</Text>
                <DropDownPicker
                  items={transformedUom}
                  open={uomOpen}
                  setOpen={setUomOpen}
                  value={uomValue}
                  setValue={setUomValue}
                  placeholder="Select UOM"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                />
              </View>

              {/* Stock Manage */}
              <TouchableOpacity
                style={styles.checkboxRow}
                activeOpacity={0.7}
                onPress={() => {
                  const newOptions = manageStock.includes('on') ? [] : ['on'];
                  setManageStock(newOptions);
                }}>
                <Checkbox.Android
                  status={manageStock.includes('on') ? 'checked' : 'unchecked'}
                  color={THEME.primary}
                />
                <Text style={styles.checkboxLabel}>Don't Manage Stock</Text>
              </TouchableOpacity>

              {!manageStock.includes('on') && (
                <View style={styles.rowInputs}>
                  <View style={{flex: 1, marginRight: 10}}>
                    <Text style={styles.label}>Opening Qty</Text>
                    <TextInput
                      style={styles.input}
                      value={addForm.opening_qty}
                      onChangeText={t => onChnage('opening_qty', t)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.label}>Reorder Qty</Text>
                    <TextInput
                      style={styles.input}
                      value={addForm.reorder_qty}
                      onChangeText={t => onChnage('reorder_qty', t)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {/* Pricing */}
              <View style={styles.rowInputs}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.label}>Cost Price *</Text>
                  <TextInput
                    style={styles.input}
                    value={addForm.cost_price}
                    onChangeText={t => onChnage('cost_price', t)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>Retail Price *</Text>
                  <TextInput
                    style={styles.input}
                    value={addForm.retail_price}
                    onChangeText={t => onChnage('retail_price', t)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Submit */}
              <TouchableOpacity style={styles.btnPrimary} onPress={addProduct}>
                <Icon
                  name="check-circle-outline"
                  size={20}
                  color="white"
                  style={{marginRight: 8}}
                />
                <Text style={styles.btnText}>Save Product</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Toast />
        </View>
      </Modal>
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- HEADER ---
  headerWrapper: {
    marginBottom: 20,
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 40, // Extra space for floating search
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  // --- SEARCH ---
  floatingSearchContainer: {
    position: 'absolute',
    bottom: -24,
    left: 12,
    right: 12,
    backgroundColor: THEME.white,
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: THEME.textDark,
  },
  // --- LIST ---
  listContainer: {
    flex: 1,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  lottie: {
    width: 100,
    height: 100,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: THEME.textGray,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 14,
  },
  tableHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textGray,
    letterSpacing: 0.5,
  },
  tableHeaderCount: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.primary,
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  // --- CARD ROW ---
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '94%',
    alignSelf: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#222',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.primary,
    letterSpacing: 0.5,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailSeparator: {
    width: 1,
    height: 12,
    backgroundColor: THEME.border,
    marginHorizontal: 8,
  },
  detailText: {
    fontSize: 13,
    color: THEME.textDark,
    marginLeft: 4,
    fontWeight: '500',
  },
  subText: {
    fontSize: 12,
    color: THEME.textLight,
    marginLeft: 4,
  },
  // --- PAGINATION ---
  paginationContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: THEME.primary,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  pageBtn: {
    padding: 8,
  },
  disabledBtn: {
    opacity: 0.3,
  },
  pageText: {
    color: THEME.white,
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 15,
  },
  // --- ADD MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalScroll: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    maxHeight: '90%',
  },
  modalContent: {
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  closeBtn: {
    padding: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    color: THEME.textGray,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: THEME.textDark,
    backgroundColor: '#F9FAFB',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxLabel: {
    color: THEME.textDark,
    marginLeft: 8,
    fontSize: 14,
  },
  dropdown: {
    borderColor: THEME.border,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
  },
  dropdownContainer: {
    borderColor: THEME.border,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  btnPrimary: {
    backgroundColor: THEME.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
