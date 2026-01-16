import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  BackHandler,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useUser} from '../../CTX/UserContext';
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
  success: '#10B981',
  warning: '#F59E0B',
};

// --- HELPER: Get Initials ---
const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

type Product = {
  id: number;
  prod_name: string;
  pcat_name: string;
  prod_qty: string;
  prod_reorder_qty: string;
  prod_costprice: string;
  prod_retailprice: string;
};

interface Categories {
  id: number;
  pcat_name: string;
}

export default function ReOrderProductStock({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {token} = useUser();
  const [loading, setLoading] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>('');
  const [categories, setCategories] = useState<Categories[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [masterData, setMasterData] = useState<Product[]>([]);

  const transformedCat = categories.map(cat => ({
    label: cat.pcat_name,
    value: cat.id.toString(),
  }));

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Filter for reorder condition
  const filteredProducts = filteredData.filter(
    item =>
      Number(item.prod_reorder_qty) >= Number(item.prod_qty) &&
      Number(item.prod_reorder_qty) > 0,
  );

  const totalRecords = filteredProducts.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = filteredProducts.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Fetch Category Dropdown
  const fetchCatDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcategories`);
      setCategories(res.data.cat);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProd = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/loadreorder?cat_id=${
          currentCategory || ''
        }&_token=${token}`,
      );

      const prodData = res.data.stock;
      setFilteredData(prodData);
      setMasterData(prodData);
      setCurrentPage(1);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Search Filter
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
    fetchProd();
    fetchCatDropdown();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );
    return () => backHandler.remove();
  }, [currentCategory]);

  const renderItem = ({item}: {item: Product}) => {
    return (
      <View style={styles.cardRow}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.prod_name)}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.prod_name}
          </Text>

          {/* Row 1: Stock | Reorder Level */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="package-variant" size={14} color={THEME.danger} />
              <Text
                style={[
                  styles.detailText,
                  {color: THEME.danger, fontWeight: 'bold'},
                ]}>
                Quantity: {item.prod_qty}
              </Text>
            </View>
            <View style={styles.detailSeparator} />
            <View style={styles.detailItem}>
              <Icon
                name="alert-circle-outline"
                size={14}
                color={THEME.warning}
              />
              <Text style={[styles.detailText, {fontWeight: 'bold'}]}>
                Reorder: {item.prod_reorder_qty}
              </Text>
            </View>
          </View>

          {/* Row 2: Category | Cost Price */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="shape-outline" size={14} color={THEME.textLight} />
              <Text style={styles.subText}>{item.pcat_name || 'General'}</Text>
            </View>
            <View style={styles.detailSeparator} />
            <View style={styles.detailItem}>
              <Text style={[styles.subText, {marginLeft: 0, fontSize: 11}]}>
                Cost: {item.prod_costprice}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
            <Text style={styles.headerTitle}>Reorder Products</Text>
            <View style={{width: 40}} />
          </View>
        </LinearGradient>

        {/* Floating Search */}
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

      {/* Category Filter */}
      <View
        style={{
          zIndex: 2000,
          width: '94%',
          alignSelf: 'center',
          marginTop: 10,
          marginBottom: 5,
        }}>
        <DropDownPicker
          items={transformedCat}
          open={categoryOpen}
          setOpen={setCategoryOpen}
          value={currentCategory}
          setValue={setCurrentCategory}
          placeholder="Filter by Category"
          placeholderStyle={{color: THEME.textGray}}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode="SCROLLVIEW"
          searchable
          searchTextInputStyle={styles.dropdownSearchInput}
          searchContainerStyle={styles.dropdownSearchContainer}
        />
      </View>

      {/* --- CONTENT --- */}
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.centerContent}>
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
                <View style={styles.centerContent}>
                  <Icon name="package-variant" size={60} color="#D1D5DB" />
                  <Text style={styles.emptyText}>
                    No products found for reordering
                  </Text>
                </View>
              }
            />
          </>
        )}
      </View>

      {/* --- PAGINATION --- */}
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
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- Header ---
  headerWrapper: {
    marginBottom: 20,
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 40,
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
  // --- Floating Search ---
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
  // --- List & Cards ---
  listContainer: {
    flex: 1,
    paddingTop: 10,
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
    marginTop: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: THEME.textDark,
    marginLeft: 4,
  },
  subText: {
    fontSize: 12,
    color: THEME.textGray,
    marginLeft: 4,
  },
  detailSeparator: {
    width: 1,
    height: 12,
    backgroundColor: THEME.border,
    marginHorizontal: 8,
  },
  // --- Pagination ---
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
  // --- Dropdown ---
  dropdown: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    minHeight: 48,
  },
  dropdownContainer: {
    borderColor: THEME.border,
    borderRadius: 12,
  },
  dropdownSearchInput: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownSearchContainer: {
    borderBottomColor: '#transparent',
  },
  // Common
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});
