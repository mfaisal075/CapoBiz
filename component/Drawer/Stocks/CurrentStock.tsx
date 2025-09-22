import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useEffect, useState, useMemo} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Product = {
  prod_name: string;
  prod_expirydate: string;
  prod_UPC_EAN: string;
  prod_qty: string;
  prod_costprice: string;
  prod_fretailprice: string;
  prod_f_equivalent: string;
  prod_equivalent: string;
  prod_sub_qty: string;
  prod_sub_uom: string;
  pcat_name: string;
  ums_name: string;
};

interface Categories {
  id: number;
  pcat_name: string;
}

export default function CurrentStock() {
  const {openDrawer} = useDrawer();
  const [stockProducts, setStockProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Categories[]>([]);
  const [category, setCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalRecords = stockProducts.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const currentData = stockProducts.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const transformedCat = categories.map(cat => ({
    label: cat.pcat_name,
    value: cat.id.toString(),
  }));

  // Totals
  const {totalCost, totalRetail} = useMemo(() => {
    return stockProducts.reduce(
      (totals, item) => {
        const qty = parseFloat(item.prod_qty) || 0;
        const costPrice = parseFloat(item.prod_costprice) || 0;
        const retailPrice = parseFloat(item.prod_fretailprice) || 0;

        totals.totalCost += qty * costPrice;
        totals.totalRetail += qty * retailPrice;
        return totals;
      },
      {totalCost: 0, totalRetail: 0},
    );
  }, [stockProducts]);

  // Fetch Category Dropdown
  const fetchCatDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcategories`);
      setCategories(res.data.cat);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Products
  const fetchStock = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/loadstock`, {
        cat_id: currentCategory,
      });
      setStockProducts(res.data.stock);
      setCurrentPage(1);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStock();
    fetchCatDropdown();
  }, [currentCategory]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Current Stock</Text>
          </View>
          <View style={[styles.headerBtn, {backgroundColor: 'transparent'}]}>
            <Icon name="mail" size={24} color="transparent" />
          </View>
        </View>

        {/* Filter */}
        <View style={{paddingHorizontal: 15, marginVertical: 8}}>
          <DropDownPicker
            items={transformedCat}
            open={category}
            setOpen={setCategory}
            value={currentCategory}
            setValue={setCurrentCategory}
            placeholder="Select Category"
            placeholderStyle={{color: '#666'}}
            textStyle={{color: '#144272'}}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={18} color="#144272" />
            )}
            ArrowDownIconComponent={() => (
              <Icon name="chevron-down" size={18} color="#144272" />
            )}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
          />
        </View>

        {/* Product List */}
        <FlatList
          data={currentData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => {
            const qty = parseFloat(item.prod_qty) || 0;
            const subQty = parseFloat(item.prod_sub_qty) || '';
            const costPrice = parseFloat(item.prod_costprice) || 0;
            const retailPrice = parseFloat(item.prod_fretailprice) || 0;
            const itemTotalCost = qty * costPrice;
            const itemTotalRetail = qty * retailPrice;

            return (
              <View style={styles.card}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.prod_name?.charAt(0) || 'P'}
                    </Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.prod_name}</Text>
                    <Text style={styles.subText}>
                      {item.pcat_name || 'No category'}
                    </Text>
                  </View>
                </View>

                {/* Info */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Icon
                        name="cube-outline"
                        size={16}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.infoText}>Quantity:</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {`${qty}${subQty ? `-${subQty}` : ''}`}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Icon
                        name="cash"
                        size={16}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.infoText}>Cost Price:</Text>
                    </View>
                    <Text style={styles.infoValue}>{costPrice.toFixed(2)}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Icon
                        name="calculator"
                        size={16}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.infoText}>Total Cost:</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {itemTotalCost.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Icon
                        name="tag-outline"
                        size={16}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.infoText}>Retail Price:</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {retailPrice.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Icon
                        name="cash-multiple"
                        size={16}
                        color="#144272"
                        style={styles.infoIcon}
                      />
                      <Text style={styles.infoText}>Total Retail:</Text>
                    </View>
                    <Text style={styles.infoValue}>
                      {itemTotalRetail.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 20}}>
              <Text style={{color: '#fff', fontSize: 14}}>No Stock found.</Text>
            </View>
          }
          contentContainerStyle={{paddingBottom: 70}}
        />

        {/* Bottom Bar: Totals + Pagination */}
        {totalRecords > 0 && (
          <View style={styles.bottomBar}>
            {/* Totals */}
            <View>
              <Text style={styles.totalText}>
                Total Cost: {totalCost.toFixed(2)}
              </Text>
              <Text style={styles.totalText}>
                Total Retail: {totalRetail.toFixed(2)}
              </Text>
            </View>

            {/* Pagination */}
            <View style={styles.paginationRow}>
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

              <Text style={styles.pageIndicator}>
                <Text style={styles.pageCurrent}>{currentPage}</Text> /{' '}
                {totalPages}
              </Text>

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

  // Dropdown
  dropdown: {
    borderWidth: 1,
    borderColor: '#144272',
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  dropDownContainer: {
    backgroundColor: '#fff',
    borderColor: '#144272',
  },

  // Card
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
    marginHorizontal: 10,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#666',
  },
  infoBox: {
    marginTop: 10,
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoText: {
    color: '#144272',
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    color: '#333',
    fontSize: 13,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 6,
  },

  // Bottom bar (Totals + Pagination)
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#144272',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  paginationRow: {
    width: '55%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  pageButton: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  pageButtonDisabled: {
    backgroundColor: '#ddd',
  },
  pageButtonText: {
    color: '#144272',
    fontWeight: '600',
  },
  pageButtonTextDisabled: {
    color: '#777',
  },
  pageIndicator: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  pageCurrent: {
    fontWeight: '700',
    color: '#FFD166',
  },
});
