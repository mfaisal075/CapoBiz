import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
  StatusBar,
  Dimensions,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import RNPrint from 'react-native-print';
import {useUser} from '../../../CTX/UserContext';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../../BottomBar';

const {width} = Dimensions.get('window');

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  primarySoft: 'rgba(42, 101, 43, 0.1)',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  accent: '#4CAF50',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textDark: '#1F2937',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  danger: '#EF4444',
  rowHover: '#F9FAFB',
};

interface AllProductList {
  id: number;
  prod_name: string;
  prod_UPC_EAN: string;
  prod_costprice: string;
  prod_retailprice: string;
  prod_qty: string;
  prod_reorder_qty: string;
  pcat_name: string;
  ums_name: string;
  prod_sub_uom: string;
  prod_sub_qty: string;
}

interface Category {
  id: number;
  pcat_name: string;
}

export default function ListofItems({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {bussAddress, bussName} = useUser();
  const [allProductsList, setAllProductsList] = useState<AllProductList[]>([]);
  const [categoryWiseList, setCategoryWiseList] = useState<AllProductList[]>(
    [],
  );
  const [categoryDropdown, setCategoryDropdown] = useState<Category[]>([]);

  const transformedCategory = categoryDropdown.map(cat => ({
    label: cat.pcat_name,
    value: cat.id.toString(),
  }));

  const [catOpen, setCatOpen] = useState(false);
  const [catValue, setCatValue] = useState('');
  const [selectionMode, setSelectionMode] = useState<
    'allproducts' | 'categorywiseproduct' | ''
  >('allproducts');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const currentData =
    selectionMode === 'allproducts' ? allProductsList : categoryWiseList;
  const totalRecords = currentData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const paginatedData = currentData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Helper: Get Initials
  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Handle Print (All Products)
  const handlePrint = async () => {
    if (
      selectionMode === 'allproducts'
        ? allProductsList.length === 0
        : categoryWiseList.length === 0
    ) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    // Get current date
    const dateStr = new Date().toLocaleDateString();

    // Build HTML table rows
    const rows = (
      selectionMode === 'allproducts' ? allProductsList : categoryWiseList
    )
      .map(
        (item, index) => `
      <tr>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
          index + 1
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.prod_name
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.prod_UPC_EAN
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.pcat_name
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.ums_name
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.prod_sub_uom
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.prod_qty
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.prod_reorder_qty
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.prod_costprice
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.prod_retailprice
        }</td>
      </tr>`,
      )
      .join('');

    // HTML Template
    const html = `
                <html>
                  <head>
                    <meta charset="utf-8">
                    <title>Product Report</title>
                  </head>
                  <body style="font-family: Arial, sans-serif; padding:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                      <div style="font-size:12px;">Date: ${dateStr}</div>
                      <div style="text-align:center; flex:1; font-size:16px; font-weight:bold;">Point of Sale System</div>
                    </div>
            
                    <div style="text-align:center; margin-bottom:20px;">
                      <div style="font-size:18px; font-weight:bold;">${bussName}</div>
                      <div style="font-size:14px;">${bussAddress}</div>
                      <div style="font-size:14px; font-weight:bold; text-decoration:underline;">
                        Product List
                      </div>
                    </div>
            
                    <table style="border-collapse:collapse; width:100%; font-size:12px;">
                      <thead>
                        <tr style="background:#f0f0f0;">
                          <th style="border:1px solid #000; padding:6px;">Sr#</th>
                          <th style="border:1px solid #000; padding:6px;">Product</th>
                          <th style="border:1px solid #000; padding:6px;">Barcode</th>
                          <th style="border:1px solid #000; padding:6px;">Category</th>
                          <th style="border:1px solid #000; padding:6px;">UMO</th>
                          <th style="border:1px solid #000; padding:6px;">Sub UMO</th>
                          <th style="border:1px solid #000; padding:6px;">Qty</th>
                          <th style="border:1px solid #000; padding:6px;">Reorder Qty</th>
                          <th style="border:1px solid #000; padding:6px;">Cost Price</th>
                          <th style="border:1px solid #000; padding:6px;">Sale Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rows}
                      </tbody>
                    </table>
                  </body>
                </html>
              `;

    await RNPrint.print({html});
  };

  // Fetch All Product List
  const fetchAllProdList = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchproducts`);
      setAllProductsList(res.data.products);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Category Dropdown
  const fetchCatDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcategories`);
      setCategoryDropdown(res.data.cat);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Category Wise Product List
  const fetchCatWiseList = async () => {
    if (catValue) {
      try {
        const res = await axios.post(`${BASE_URL}/fetchproducts`, {
          category: catValue,
        });
        setCategoryWiseList(res.data.products);
        setCurrentPage(1); // Reset to first page on category change
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    fetchAllProdList();
    fetchCatDropdown();
  }, []);

  useEffect(() => {
    fetchCatWiseList();
  }, [catValue]);

  useEffect(() => {
    setCurrentPage(1);

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, [selectionMode]);

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
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={openDrawer}>
              <Icon name="menu" size={28} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>List of Items</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.printBtn}>
              <Icon name="printer" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Filter Section (Reverted to Previous Style) */}
      <View style={styles.filterContainer}>
        {/* Radio Buttons */}
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => {
              setSelectionMode('allproducts');
              setCatValue('');
            }}>
            <RadioButton
              value="allproducts"
              status={selectionMode === 'allproducts' ? 'checked' : 'unchecked'}
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>All Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => {
              setSelectionMode('categorywiseproduct');
              setCatValue('');
            }}>
            <RadioButton
              value="categorywiseproduct"
              status={
                selectionMode === 'categorywiseproduct'
                  ? 'checked'
                  : 'unchecked'
              }
              color={THEME.primary}
              uncheckedColor={THEME.textGray}
            />
            <Text style={styles.radioText}>Category Wise</Text>
          </TouchableOpacity>
        </View>

        {/* Dropdown */}
        <DropDownPicker
          items={transformedCategory}
          open={catOpen}
          setOpen={setCatOpen}
          value={catValue}
          setValue={setCatValue}
          placeholder="Select Category"
          disabled={selectionMode === 'allproducts'}
          placeholderStyle={{color: THEME.textGray}}
          textStyle={{color: THEME.textDark}}
          ArrowUpIconComponent={() => (
            <Icon name="chevron-up" size={18} color={THEME.textDark} />
          )}
          ArrowDownIconComponent={() => (
            <Icon name="chevron-down" size={18} color={THEME.textDark} />
          )}
          style={[
            styles.dropdown,
            selectionMode === 'allproducts' && styles.dropdownDisabled,
          ]}
          dropDownContainerStyle={styles.dropDownContainer}
          listMode="FLATLIST"
          flatListProps={{
            nestedScrollEnabled: true,
          }}
          maxHeight={200}
          listItemLabelStyle={{
            color: THEME.textDark,
            fontWeight: '500',
          }}
          labelStyle={{
            color: THEME.textDark,
            fontSize: 14,
          }}
          searchable
          searchTextInputStyle={{
            borderWidth: 0,
            width: '100%',
            color: THEME.textDark,
          }}
          searchContainerStyle={{
            borderColor: THEME.border,
          }}
        />
      </View>

      {/* --- CONTENT LIST --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>PRODUCT LIST</Text>
          <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
        </View>

        <FlatList
          data={paginatedData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <View style={styles.cardRow}>
              {/* Left Side: Avatar + Name + Subtitle */}
              <View style={styles.leftContent}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {getInitials(item.prod_name)}
                  </Text>
                </View>

                <View style={styles.infoWrapper}>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {item.prod_name}
                  </Text>

                  <View style={styles.detailRow}>
                    <Icon name="barcode" size={12} color={THEME.textGray} />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {item.prod_UPC_EAN || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Right Side: Badges & Price */}
              <View style={styles.rightContent}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText} numberOfLines={1}>
                    {item.pcat_name || 'General'}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Price: </Text>
                  <Text style={styles.priceValue}>{item.prod_retailprice}</Text>
                </View>
                <View style={styles.qtyRow}>
                  <Text style={styles.qtyLabel}>Qty: </Text>
                  <Text
                    style={[
                      styles.qtyValue,
                      parseInt(item.prod_qty) < 10 && {color: THEME.danger},
                    ]}>
                    {item.prod_qty}
                  </Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={{paddingBottom: 160}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Icon name="package-variant" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>No records found!</Text>
            </View>
          }
        />
      </View>

      {/* --- PAGINATION (Bottom Floating) --- */}
      {totalRecords > 0 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={[styles.pageBtn, currentPage === 1 && styles.disabledBtn]}>
            <Icon name="chevron-left" size={24} color={THEME.white} />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() =>
              setCurrentPage(prev => Math.min(prev + 1, totalPages))
            }
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
  // --- HEADER ---
  headerWrapper: {
    zIndex: 999,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 90, // Reverted to 90 to allow overlap
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30, // Reverted radius
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: THEME.primary,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  printBtn: {
    padding: 5,
  },

  // --- FILTER SECTION (Reverted Styles) ---
  filterContainer: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginTop: -70,
    marginHorizontal: 16,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    zIndex: 1000,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: THEME.textDark,
    marginLeft: -2,
    fontWeight: '500',
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    height: 45,
  },
  dropdownDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.7,
  },
  dropDownContainer: {
    backgroundColor: THEME.white,
    borderColor: THEME.border,
    borderRadius: 10,
  },

  // --- LIST & CARDS ---
  listContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 15,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  tableHeaderLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textGray,
    letterSpacing: 1,
  },
  tableHeaderCount: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '700',
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(42, 101, 43, 0.1)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: THEME.textGray,
    fontWeight: '500',
    marginLeft: 4,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  categoryBadge: {
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: THEME.primary,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: THEME.textLight,
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textDark,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyLabel: {
    fontSize: 11,
    color: THEME.textLight,
  },
  qtyValue: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textDark,
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    color: THEME.textGray,
    fontSize: 16,
  },

  // --- PAGINATION ---
  paginationContainer: {
    position: 'absolute',
    bottom: 100,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.3,
  },
  pageText: {
    color: THEME.white,
    fontWeight: '700',
    marginHorizontal: 15,
    fontSize: 14,
  },
});
