import {
  BackHandler,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import DropDownPicker from 'react-native-dropdown-picker';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {Checkbox} from 'react-native-paper';
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
  dangerLight: '#FEE2E2',
};

// --- INTERFACES ---
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

// --- HELPER COMPONENT: Detail Row ---
const DetailRow = ({
  label,
  value,
  icon,
  isLast,
}: {
  label: string;
  value: string;
  icon: string;
  isLast?: boolean;
}) => (
  <View style={[styles.detailRow, isLast && {borderBottomWidth: 0}]}>
    <View style={styles.iconBox}>
      <Icon name={icon} size={20} color={THEME.primary} />
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '--'}</Text>
    </View>
  </View>
);

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
  const [loading, setLoading] = useState(false);

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

  // --- API CALLS ---
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

  const fetchProdDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/productsshow?id=${id}&_token=${token}`,
      );
      setProduct(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const delProduct = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/productdelete`, {id: id});
      if (res.status === 200 && res.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Product has been deleted.',
        });
        setModalVisible('');
        navigation.goBack();
      }
    } catch (error) {
      console.log(error);
    }
  };

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
      if (res.data.pro.prod_expirydate) {
        setExpiry(['on']);
        // Parse date properly if string
        editOnChnage('prod_expirydate', new Date(res.data.pro.prod_expirydate));
      }
      setModalVisible('Edit');
    } catch (error) {
      console.log(error);
    }
  };

  const updateProduct = async () => {
    // Validation logic (simplified for brevity, keeping existing)
    if (!(editForm.prod_name ?? '').trim()) {
      Toast.show({type: 'error', text1: 'Product Name is required'});
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
        setEditForm(initialEditProduct);
        setEditCatValue('');
        setEditUomValue('');
        setModalVisible('');
        fetchProdDetails();
        setTimeout(() => setModalVisible('Success'), 500);
      } else {
        // Error handling
        if (data.status === 101)
          Toast.show({type: 'error', text1: 'Name Exists'});
        if (data.status === 102)
          Toast.show({type: 'error', text1: 'Barcode Exists'});
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
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 100}}>
        {/* --- HEADER BACKGROUND --- */}
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          {/* Nav Bar */}
          <SafeAreaView style={styles.navBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.navBtn}>
              <Icon name="arrow-left" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Product Profile</Text>
            <TouchableOpacity
              onPress={() => setModalVisible('Delete')}
              style={styles.navBtn}>
              <Icon name="trash-can-outline" size={22} color={THEME.white} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={require('../../../assets/product.png')}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.editBadge}
                activeOpacity={0.8}
                onPress={() => getEditData()}>
                <Icon name="pencil" size={16} color={THEME.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>
              {product?.pro?.prod_name || 'Loading...'}
            </Text>

            <View style={styles.badgeRow}>
              <View style={styles.capsuleBadge}>
                <Icon name="shape-outline" size={14} color={THEME.white} />
                <Text style={styles.capsuleText}>
                  {product?.cat?.pcat_name || 'Category'}
                </Text>
              </View>
              <View style={styles.capsuleBadge}>
                <Icon name="scale-balance" size={14} color={THEME.white} />
                <Text style={styles.capsuleText}>
                  {product?.uom?.ums_name || 'UOM'}
                </Text>
              </View>
            </View>

            {/* Main Balance Card (Floating) - Using Retail Price as main stat */}
            <View style={styles.balanceCard}>
              <View>
                <Text style={styles.balanceLabel}>Retail Price</Text>
                <Text style={styles.balanceAmount}>
                  Rs. {product?.pro?.prod_retailprice || '0.00'}
                </Text>
              </View>
              <View style={styles.balanceIcon}>
                <Icon name="tag-outline" size={24} color={THEME.white} />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* --- CONTENT CARDS --- */}
        <View style={styles.contentContainer}>
          {/* General Info */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>General Information</Text>
            </View>
            <DetailRow
              icon="tag-text-outline"
              label="Generic Name"
              value={product?.pro?.prod_generic_name!}
            />
            <DetailRow
              icon="barcode"
              label="Barcode / UPC"
              value={product?.pro?.prod_UPC_EAN!}
            />
            <DetailRow
              icon="shape-outline"
              label="Category"
              value={product?.cat?.pcat_name!}
            />
            <DetailRow
              icon="scale-balance"
              label="UOM"
              value={product?.uom?.ums_name!}
              isLast
            />
          </View>

          {/* Pricing Info */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Pricing Details</Text>
            </View>
            <DetailRow
              icon="cash"
              label="Cost Price"
              value={`Rs. ${product?.pro?.prod_costprice || 0}`}
            />
            <DetailRow
              icon="cash-multiple"
              label="Retail Price"
              value={`Rs. ${product?.pro?.prod_retailprice || 0}`}
            />
            <DetailRow
              icon="percent-outline"
              label="Discount"
              value={`${product?.pro?.prod_discount || 0}%`}
            />
            <DetailRow
              icon="currency-usd"
              label="Final Price"
              value={`Rs. ${product?.pro?.prod_fretailprice || 0}`}
              isLast
            />
          </View>

          {/* Stock Info */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Stock Information</Text>
            </View>
            <DetailRow
              icon="package-variant"
              label="Current Stock"
              value={product?.pro?.prod_qty!}
            />
            <DetailRow
              icon="reload"
              label="Reorder Level"
              value={product?.pro?.prod_reorder_qty!}
            />
            <DetailRow
              icon="cog-outline"
              label="Manage Stock"
              value={product?.pro?.prod_manage_stock === 'Y' ? 'Yes' : 'No'}
              isLast
            />
          </View>

          {/* Additional Info */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Additional Details</Text>
            </View>
            <DetailRow
              icon="calendar-month-outline"
              label="Expiry Date"
              value={product?.pro?.prod_expirydate!}
            />
            <DetailRow
              icon="truck-outline"
              label="Supplier"
              value={product?.supp?.sup_name!}
              isLast
            />
          </View>
        </View>
      </ScrollView>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal
        visible={modalVisible === 'Delete'}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.lottieContainer}>
              <LottieView
                source={require('../../../assets/warning.json')}
                autoPlay
                loop={false}
                style={{width: '100%', height: '100%'}}
              />
            </View>
            <Text style={styles.modalTitle}>Delete Product?</Text>
            <Text style={styles.modalText}>
              This action cannot be undone. All data associated with this
              product will be lost.
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible('')}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDelete} onPress={delProduct}>
                <Text style={styles.btnDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- SUCCESS MODAL --- */}
      <Modal
        visible={modalVisible === 'Success'}
        transparent
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.lottieContainer}>
              <LottieView
                source={require('../../../assets/success.json')}
                autoPlay
                loop={false}
                style={{width: '100%', height: '100%'}}
              />
            </View>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalText}>
              Product record updated successfully.
            </Text>
            <TouchableOpacity
              style={[styles.btnPrimary, {width: '100%', marginTop: 15}]}
              onPress={() => setModalVisible('')}>
              <Text style={styles.btnPrimaryText}>OK, Great</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- EDIT PRODUCT MODAL --- */}
      <Modal
        visible={modalVisible === 'Edit'}
        transparent
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Product</Text>
              <TouchableOpacity
                onPress={() => setModalVisible('')}
                style={styles.closeModalBtn}>
                <Icon name="close" size={22} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.editModalBody}
              contentContainerStyle={{paddingBottom: 30}}
              showsVerticalScrollIndicator={false}>
              {/* Fields - simplified layout */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.prod_name}
                  onChangeText={t => editOnChnage('prod_name', t)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Generic Name</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.prod_generic_name}
                  onChangeText={t => editOnChnage('prod_generic_name', t)}
                />
              </View>

              {/* Barcode Logic */}
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
                    editOnChnage('prod_UPC_EAN', String(barCode));
                  }
                }}>
                <Checkbox.Android
                  status={genBarCode.includes('on') ? 'checked' : 'unchecked'}
                  color={THEME.primary}
                />
                <Text style={styles.label}>Auto Generate Barcode</Text>
              </TouchableOpacity>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Barcode / UPC *</Text>
                <TextInput
                  style={styles.input}
                  value={
                    genBarCode.includes('on')
                      ? String(barCode)
                      : editForm.prod_UPC_EAN
                  }
                  editable={!genBarCode.includes('on')}
                  onChangeText={t => editOnChnage('prod_UPC_EAN', t)}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.label}>Cost Price *</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.prod_costprice}
                    onChangeText={t => editOnChnage('prod_costprice', t)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>Retail Price *</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.prod_retailprice}
                    onChangeText={t => editOnChnage('prod_retailprice', t)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Discount (%)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.prod_discount}
                  onChangeText={t => editOnChnage('prod_discount', t)}
                  keyboardType="numeric"
                />
              </View>

              <View style={{zIndex: 2000, marginBottom: 16}}>
                <Text style={styles.label}>Category</Text>
                <DropDownPicker
                  items={transformedCat}
                  open={editCatOpen}
                  setOpen={setEditCatOpen}
                  value={editCatValue}
                  setValue={setEditCatValue}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                />
              </View>

              <View style={{zIndex: 1000, marginBottom: 16}}>
                <Text style={styles.label}>UOM</Text>
                <DropDownPicker
                  items={transformedUom}
                  open={editUomOpen}
                  setOpen={setEditUomOpen}
                  value={editUomValue}
                  setValue={setEditUomValue}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                />
              </View>

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
                <Text style={styles.label}>Apply Expiry</Text>
              </TouchableOpacity>

              {expiry.includes('on') && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowStartDatePicker(true)}>
                    <Text style={{color: THEME.textDark}}>
                      {new Date(editForm.prod_expirydate).toDateString()}
                    </Text>
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={new Date(editForm.prod_expirydate)}
                      mode="date"
                      onChange={editOnDateChange}
                    />
                  )}
                </View>
              )}

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={updateProduct}>
                <Icon
                  name="check-circle-outline"
                  size={20}
                  color="white"
                  style={{marginRight: 8}}
                />
                <Text style={styles.btnPrimaryText}>Update Product</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          <Toast />
        </View>
      </Modal>
      <BottomBar />
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  // --- HEADER & PROFILE ---
  headerContainer: {
    paddingBottom: 30, // Reduced from 40
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? 30 : 0,
    marginBottom: 10,
  },
  navBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  avatarWrapper: {
    marginBottom: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: THEME.white,
    backgroundColor: THEME.white,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: THEME.white,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8, // Reduced from 10
    marginBottom: 12, // Reduced from 16
  },
  capsuleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    gap: 4,
  },
  capsuleText: {
    color: THEME.white,
    fontSize: 12,
    fontWeight: '600',
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
    width: '100%',
    padding: 12, // Reduced from 16
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  balanceAmount: {
    color: THEME.white,
    fontSize: 22,
    fontWeight: '700',
  },
  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- CONTENT SECTION ---
  contentContainer: {
    marginTop: -24, // Pulls content up to overlap header
    paddingHorizontal: 12,
    gap: 10,
  },
  sectionCard: {
    backgroundColor: THEME.white,
    borderRadius: 12, // Slightly tighter radius
    padding: 12, // Reduced padding
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08, // Slightly more visible shadow
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8, // Reduced
    marginBottom: 8, // Reduced
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5, // Reduced from 6
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // Slightly darker than F9FAFB for better separator visibility
  },
  iconBox: {
    width: 32, // Reduced from 36
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Reduced from 12
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: THEME.textGray,
    marginBottom: 0,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: THEME.textDark,
    fontWeight: '600',
  },

  // --- MODALS ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  deleteModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  lottieContainer: {
    width: 100,
    height: 100,
    marginBottom: 15, // Reduced from 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  btnCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textDark,
  },
  btnDelete: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: THEME.dangerLight,
    alignItems: 'center',
  },
  btnDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.danger,
  },
  btnPrimary: {
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // --- EDIT MODAL SPECIFIC ---
  editModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
  },
  closeModalBtn: {
    padding: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  editModalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textGray,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: THEME.textDark,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dropdown: {
    borderColor: THEME.border,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  dropdownContainer: {
    borderColor: THEME.border,
  },
});
