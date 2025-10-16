import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import backgroundColors from '../../Colors';

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
  const [categories, setCategories] = useState<Categories[]>([]);
  const [category, setCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [masterData, setMasterData] = useState<Product[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const currentData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const transformedCat = categories.map(cat => ({
    label: cat.pcat_name,
    value: cat.id.toString(),
  }));

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

      const stockData = res.data.stock;
      setFilteredData(stockData);
      setMasterData(stockData);

      setCurrentPage(1);
    } catch (error) {
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
    fetchStock();
    fetchCatDropdown();
  }, [currentCategory]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
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

        {/*Category Filter */}
        <View style={{width: '94%', alignSelf: 'center'}}>
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
              <Icon
                name="chevron-up"
                size={18}
                color={backgroundColors.primary}
              />
            )}
            ArrowDownIconComponent={() => (
              <Icon
                name="chevron-down"
                size={18}
                color={backgroundColors.primary}
              />
            )}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
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

        {/* Product List */}
        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View style={styles.avatarBox}>
                    <Image
                      source={require('../../../assets/products.png')}
                      style={styles.avatar}
                    />
                  </View>

                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.prod_name}</Text>
                    {/* Category */}
                    <Text style={styles.subText}>
                      {item.pcat_name ?? 'No Category'} |{' '}
                      <Text
                        style={[
                          styles.subText,
                          {fontWeight: 'bold', color: backgroundColors.primary},
                        ]}>
                        QTY: {item.prod_qty}
                      </Text>
                    </Text>
                    <Text style={styles.subText}>
                      Cost Price: {item.prod_costprice} | Retail Price:{' '}
                      {item.prod_fretailprice}
                    </Text>
                  </View>
                </View>
              </View>
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

  // Dropdown
  dropdown: {
    borderWidth: 0,
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  dropDownContainer: {
    backgroundColor: '#fff',
    borderColor: 'transparent',
    borderTopWidth: 1,
    marginTop: 5,
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

  //Summary Container Styling
  summaryContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    paddingVertical: 10,
  },
  innerSummaryCtx: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#144272',
    fontWeight: 'bold',
  },
});
