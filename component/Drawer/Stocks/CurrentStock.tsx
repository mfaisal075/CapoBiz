import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useEffect, useState, useMemo} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  const transformedCat = categories.map(cat => ({
    label: cat.pcat_name,
    value: cat.id.toString(),
  }));

  // Calculate totals using useMemo for better performance
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

  const [category, setCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');

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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
            justifyContent: 'space-between',
            marginBottom: 15,
          }}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../../assets/menu.png')}
              style={{width: 30, height: 30, tintColor: 'white'}}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={{color: 'white', fontSize: 22, fontWeight: 'bold'}}>
              Current Stock
            </Text>
          </View>
        </View>

        <DropDownPicker
          items={transformedCat}
          open={category}
          setOpen={setCategory}
          value={currentCategory}
          setValue={setCurrentCategory}
          placeholder="Select Category"
          placeholderStyle={{color: 'white'}}
          textStyle={{color: 'white'}}
          ArrowUpIconComponent={() => (
            <Icon name="keyboard-arrow-up" size={18} color="#fff" />
          )}
          ArrowDownIconComponent={() => (
            <Icon name="keyboard-arrow-down" size={18} color="#fff" />
          )}
          style={[
            styles.dropdown,
            {borderColor: 'white', width: '88%', alignSelf: 'center'},
          ]}
          dropDownContainerStyle={{
            backgroundColor: 'white',
            borderColor: '#144272',
            width: '88.5%',
            marginLeft: 22,
            marginTop: 8,
          }}
          labelStyle={{color: 'white'}}
          listItemLabelStyle={{color: '#144272'}}
        />

        <FlatList
          data={stockProducts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => {
            // Calculate per-item totals
            const qty = parseFloat(item.prod_qty) || 0;
            const costPrice = parseFloat(item.prod_costprice) || 0;
            const retailPrice = parseFloat(item.prod_fretailprice) || 0;

            const itemTotalCost = qty * costPrice;
            const itemTotalRetail = qty * retailPrice;

            return (
              <View style={{padding: 5}}>
                <View style={styles.table}>
                  <View style={styles.tablehead}>
                    <Text
                      style={{
                        color: '#144272',
                        fontWeight: 'bold',
                        marginLeft: 5,
                        marginTop: 5,
                      }}>
                      {item.prod_name}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Category:</Text>
                      <Text style={styles.text}>{item.pcat_name}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Quantity:</Text>
                      <Text style={styles.text}>{qty.toFixed(2)}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Cost Price:</Text>
                      <Text style={styles.text}>{costPrice.toFixed(2)}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Total Cost:</Text>
                      <Text style={styles.text}>
                        {itemTotalCost.toFixed(2)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Retail Price:</Text>
                      <Text style={styles.text}>{retailPrice.toFixed(2)}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}>
                      <Text style={styles.text}>Total Retail:</Text>
                      <Text style={styles.text}>
                        {itemTotalRetail.toFixed(2)}
                      </Text>
                    </View>
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
        />

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>
            Total Cost: {totalCost.toFixed(2)}
          </Text>
          <Text style={styles.totalText}>
            Total Retail: {totalRetail.toFixed(2)}
          </Text>
        </View>
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
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 'auto',
    width: 314,
    borderRadius: 5,
  },
  tablehead: {
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 5,
    borderTopLeftRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  exportBtn: {
    backgroundColor: '#144272',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  exportText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: 285,
  },
  totalContainer: {
    padding: 7,
    borderTopWidth: 1,
    borderTopColor: 'white',
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
