import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
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
import backgroundColors from '../../../Colors';
import LinearGradient from 'react-native-linear-gradient';

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

export default function ListofItems() {
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
                    <title>Customer Report</title>
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
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    fetchAllProdList();
    fetchCatDropdown();
    fetchCatWiseList();
  }, [catValue]);

  useEffect(() => {
    setCurrentPage(1); // Reset pagination when selection mode changes
  }, [selectionMode]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[backgroundColors.primary, backgroundColors.secondary]}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>List of Items</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} onPress={handlePrint}>
            <Icon name="printer" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
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
                status={
                  selectionMode === 'allproducts' ? 'checked' : 'unchecked'
                }
                color="#144272"
                uncheckedColor="#666"
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
                color="#144272"
                uncheckedColor="#666"
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
            placeholderStyle={{color: '#666'}}
            textStyle={{color: '#144272'}}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={18} color="#144272" />
            )}
            ArrowDownIconComponent={() => (
              <Icon name="chevron-down" size={18} color="#144272" />
            )}
            style={[
              styles.dropdown,
              selectionMode === 'allproducts' && styles.dropdownDisabled,
            ]}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode='MODAL'
          />
        </View>

        {/* Product List */}
        <View style={styles.listContainer}>
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Avatar + Name + Details */}
                <View style={styles.row}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.prod_name?.charAt(0) || 'P'}
                    </Text>
                  </View>

                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.prod_name}</Text>
                    {/* Category */}
                    <Text style={styles.subText}>
                      <Icon name="shape" size={12} color="#666" />{' '}
                      {item.pcat_name || 'No category'}
                    </Text>
                    {/* Barcode */}
                    <Text style={styles.subText}>
                      <Icon name="barcode" size={12} color="#666" />{' '}
                      {item.prod_UPC_EAN || 'N/A'}
                    </Text>
                    {/* Quantity */}
                    <Text style={styles.subText}>
                      <Icon name="cube-outline" size={12} color="#666" />{' '}
                      {item.prod_sub_qty
                        ? `${item.prod_qty} - ${item.prod_sub_qty}`
                        : item.prod_qty}
                    </Text>
                    {/* Sale Price */}
                    <Text style={styles.subText}>
                      <Icon name="currency-usd" size={12} color="#666" />{' '}
                      {parseFloat(item.prod_retailprice).toFixed(2) || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="package-variant" size={48} color="#666" />
                <Text style={styles.emptyText}>No products found.</Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 90}}
            showsVerticalScrollIndicator={false}
          />
        </View>

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
                Total: {totalRecords} products
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
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientBackground: {
    flex: 1,
  },

  // Header
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
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Filter Container
  filterContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
    zIndex: 1000,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: '#144272',
    marginLeft: -5,
    fontWeight: '500',
  },

  // Dropdown
  dropdown: {
    borderWidth: 1,
    borderColor: '#144272',
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  dropdownDisabled: {
    backgroundColor: '#9a9a9a48',
    borderColor: '#ccc',
  },
  dropDownContainer: {
    backgroundColor: '#fff',
    borderColor: '#144272',
  },

  // FlatList Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '75%',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginTop: 8,
    width: '96%',
    alignSelf: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Pagination Styling
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
    backgroundColor: backgroundColors.secondary,
    paddingVertical: 8,
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
    alignItems: 'center',
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
});
