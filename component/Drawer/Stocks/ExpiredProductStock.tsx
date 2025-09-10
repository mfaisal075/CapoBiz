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
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';

type Product = {
  pcat_name: string;
  prod_name: string;
  prod_qty: string;
  prod_costprice: string;
  prod_fretailprice: string;
};

interface Categories {
  id: number;
  pcat_name: string;
}

export default function ExpiredProductStock() {
  const {openDrawer} = useDrawer();
  const [exProducts, setExProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [categories, setCategories] = useState<Categories[]>([]);
  const transformedCat = categories.map(cat => ({
    label: cat.pcat_name,
    value: cat.id.toString(),
  }));

  const categoryItems = [
    {label: 'Select Category', value: 'Select Category'},
    {label: 'Chocolate', value: 'Chocolate'},
    {label: 'Jelly', value: 'Jelly'},
    {label: 'Oil', value: 'Oil'},
    {label: 'Flour', value: 'Flour'},
    {label: 'Murree Brwerry', value: 'Murree Brwerry'},
  ];

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
  const fetchExpireProd = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/loadexpired`, {
        cat_id: '',
      });

      setExProducts(res.data.stock);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchExpireProd();
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
              Expired Products
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
          style={[styles.dropdown]}
          dropDownContainerStyle={{
            backgroundColor: 'white',
            borderColor: '#144272',
            width: '90%',
            alignSelf: 'center',
          }}
          labelStyle={{color: 'white'}}
          listItemLabelStyle={{color: '#144272'}}
        />

        <FlatList
          data={exProducts}
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
                      <Text style={styles.text}>{item.prod_qty}</Text>
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
              <Text style={{color: '#fff', fontSize: 14}}>
                No Product found.
              </Text>
            </View>
          }
        />
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
    minHeight: 38,
    borderRadius: 6,
    padding: 8,
    backgroundColor: 'transparent',
    width: '90%',
    alignSelf: 'center',
    marginBottom: 12
  },
});
