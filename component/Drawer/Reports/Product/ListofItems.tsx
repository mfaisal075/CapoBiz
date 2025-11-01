import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
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
      <View style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>List of Items</Text>
          </View>

          <TouchableOpacity style={[styles.headerBtn]} onPress={handlePrint}>
            <Icon name="printer" size={24} color="#fff" />
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
                color={backgroundColors.primary}
                uncheckedColor={backgroundColors.dark}
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
                color={backgroundColors.primary}
                uncheckedColor={backgroundColors.dark}
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
              <Icon name="chevron-up" size={18} color={backgroundColors.dark} />
            )}
            ArrowDownIconComponent={() => (
              <Icon
                name="chevron-down"
                size={18}
                color={backgroundColors.dark}
              />
            )}
            style={[
              styles.dropdown,
              selectionMode === 'allproducts' && styles.dropdownDisabled,
            ]}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode="MODAL"
            listItemLabelStyle={{
              color: backgroundColors.dark,
              fontWeight: '500',
            }}
            labelStyle={{
              color: backgroundColors.dark,
              fontSize: 16,
            }}
            searchable
            searchTextInputStyle={{
              borderWidth: 0,
              width: '100%',
            }}
            searchContainerStyle={{
              borderColor: backgroundColors.gray,
            }}
          />
        </View>

        {/* Product List */}
        <View style={styles.listContainer}>
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View style={styles.avatarBox}>
                    <Image
                      source={require('../../../../assets/product.png')}
                      style={styles.avatar}
                    />
                  </View>

                  <View style={{flex: 1}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.name}>{item.prod_name}</Text>
                      <View style={styles.catBadge}>
                        <Text style={styles.badgeText}>{item.pcat_name}</Text>
                      </View>
                    </View>
                    {/* small details inline */}
                    <Text style={styles.subText}>
                      <Text style={styles.label}>Cost Price: </Text>
                      {item.prod_costprice} |{' '}
                      <Text style={styles.label}>Retail Price: </Text>
                      {item.prod_retailprice}
                    </Text>
                    <Text style={styles.subText}>
                      <Text style={styles.label}>QTY: </Text>
                      {item.prod_sub_qty
                        ? `${item.prod_qty} - ${item.prod_sub_qty}`
                        : item.prod_qty}
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

  // Filter Container
  filterContainer: {
    backgroundColor: backgroundColors.light,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginTop: 10,
    marginHorizontal: 12,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: backgroundColors.dark,
    marginLeft: -5,
    fontWeight: '500',
  },

  // Dropdown
  dropdown: {
    backgroundColor: backgroundColors.light,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
  },
  dropdownDisabled: {
    backgroundColor: '#dfdfdfff',
    borderColor: '#ccc',
  },
  dropDownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    maxHeight: 200,
  },

  // FlatList Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: '3%',
    marginTop: 10,
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
    height: 45,
    width: 45,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
  },
  catBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: backgroundColors.primary,
  },
  badgeText: {
    fontSize: 12,
    color: backgroundColors.primary,
    fontWeight: '500',
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: backgroundColors.dark,
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
    backgroundColor: backgroundColors.info,
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
