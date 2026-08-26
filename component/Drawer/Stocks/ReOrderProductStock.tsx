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
import RNPrint from 'react-native-print';
import Toast from 'react-native-toast-message';

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
  const {token, bussName, bussAddress} = useUser();
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

  const printReorder = async () => {
    try {
      setLoading(true);

      const endpoint = `${BASE_URL}/fetchreorder?cat_id=${
        currentCategory || ''
      }&_token=${token}`;

      const res = await axios.get(endpoint);
      if (res.data && res.data.output) {
        const reportTitle = 'Reorder Products Report';

        const htmlContent = `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
              <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 { margin: 0; color: #111; font-size: 24px; text-transform: uppercase; }
                .header p { margin: 5px 0 0 0; color: #555; font-size: 14px; }
                h2 { text-align: center; color: #333; margin-bottom: 20px; font-size: 18px; text-decoration: underline; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #e5e7eb; padding: 10px 8px; text-align: left; }
                thead td, th { background-color: #f9fafb; font-weight: bold; color: #374151; }
                tbody tr:nth-child(even) { background-color: #fdfdfd; }
                .footer { margin-top: 20px; padding-top: 10px; font-weight: bold; font-size: 14px; text-align: left; border-top: 1px solid #e5e7eb; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${bussName || 'Business Name'}</h1>
                <p>${bussAddress || 'Business Address'}</p>
              </div>
              <h2>${reportTitle}</h2>
              ${res.data.output}
              <div class="footer">
                Total Products: ${res.data.total !== undefined ? res.data.total : totalRecords}
              </div>
            </body>
          </html>
        `;
        await RNPrint.print({html: htmlContent});
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No data available to print.',
        });
      }
    } catch (error) {
      console.log('Print error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to generate print document.',
      });
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
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.prod_name)}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.prod_name}
          </Text>
          <View style={styles.iconTextRow}>
            <Icon name="package-variant" size={14} color={THEME.danger} />
            <Text style={[styles.subText, {color: THEME.danger}]} numberOfLines={1}>
              Qty: {item.prod_qty} | Reorder: {item.prod_reorder_qty}
            </Text>
          </View>
          <View style={styles.iconTextRow}>
            <Icon name="cash" size={14} color={THEME.textGray} />
            <Text style={styles.subText} numberOfLines={1}>
              Cost: {item.prod_costprice}
            </Text>
          </View>
        </View>

        {/* Right Section (Badge & Arrow) */}
        <View style={styles.rightSection}>
          <View style={styles.areaBadge}>
            <Text style={styles.areaBadgeText} numberOfLines={1}>
              {item.pcat_name || 'General'}
            </Text>
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
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity onPress={printReorder} style={styles.iconBtn}>
                <Icon name="printer" size={22} color={THEME.white} />
              </TouchableOpacity>
            </View>
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
      <Toast />
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
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '94%',
    alignSelf: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: THEME.primarySoft,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.primary,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    flexShrink: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaBadge: {
    backgroundColor: THEME.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  areaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    maxWidth: 80,
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
