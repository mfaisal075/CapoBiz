import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


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
}

interface Category {
  id: number;
  pcat_name: string;
}

export default function ListofItems() {
  const {openDrawer} = useDrawer();
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

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../../../assets/menu.png')}
              style={{width: 30, height: 30, tintColor: 'white'}}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={{color: 'white', fontSize: 22, fontWeight: 'bold'}}>
              List of Items
            </Text>
          </View>

          <TouchableOpacity>
            <Icon name="printer" size={30} color={'#fff'} />
          </TouchableOpacity>
        </View>

        <DropDownPicker
          items={transformedCategory}
          open={catOpen}
          setOpen={setCatOpen}
          value={catValue}
          setValue={setCatValue}
          placeholder="Select Category"
          disabled={selectionMode === 'allproducts'}
          placeholderStyle={{color: 'white'}}
          textStyle={{color: 'white'}}
          ArrowUpIconComponent={() => (
            <Text>
              <Icon name="chevron-up" size={15} color="white" />
            </Text>
          )}
          ArrowDownIconComponent={() => (
            <Text>
              <Icon name="chevron-down" size={15} color="white" />
            </Text>
          )}
          style={[
            styles.dropdown,
            selectionMode === 'allproducts' && {backgroundColor: 'gray'},
          ]}
          dropDownContainerStyle={{
            backgroundColor: 'white',
            borderColor: '#144272',
            width: '90%',
            alignSelf: 'center',
            marginTop: 8,
          }}
          labelStyle={{color: 'white', fontWeight: 'bold'}}
          listItemLabelStyle={{color: '#144272'}}
          listMode="SCROLLVIEW"
        />

        <View style={[styles.row, {marginTop: -6, marginLeft: 20}]}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 20,
            }}
            onPress={() => {
              setSelectionMode('allproducts');
              setCatValue('');
            }}>
            <RadioButton
              value="allproducts"
              status={selectionMode === 'allproducts' ? 'checked' : 'unchecked'}
              color="white"
              uncheckedColor="white"
              onPress={() => {
                setSelectionMode('allproducts');
                setCatValue('');
              }}
            />
            <Text style={{color: 'white', marginLeft: -5}}>All Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
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
              color="white"
              uncheckedColor="white"
              onPress={() => {
                setSelectionMode('categorywiseproduct');
                setCatValue('');
              }}
            />
            <Text style={{color: 'white', marginLeft: -5}}>
              Category Wise Products
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView>
          <FlatList
            data={
              selectionMode === 'allproducts'
                ? allProductsList
                : categoryWiseList
            }
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
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
                      <Text style={styles.text}>BarCode:</Text>
                      <Text style={styles.text}>{item.prod_UPC_EAN}</Text>
                    </View>

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
                      <Text style={styles.text}>UOM:</Text>
                      <Text style={styles.text}>{item.ums_name}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>SubUOM:</Text>
                      <Text style={styles.text}>{item.prod_sub_uom}</Text>
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
                      <Text style={styles.text}>Reordered Quantity:</Text>
                      <Text style={styles.text}>
                        {item.prod_reorder_qty ?? 'NILL'}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Cost Price:</Text>
                      <Text style={styles.text}>{item.prod_costprice}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}>
                      <Text style={styles.text}>Sale Price:</Text>
                      <Text style={styles.text}>{item.prod_retailprice}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  No record found.
                </Text>
              </View>
            }
            scrollEnabled={false}
          />
        </ScrollView>

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Products:</Text>
          <Text style={styles.totalText}>
            {selectionMode === 'allproducts' && allProductsList.length}
            {selectionMode === 'categorywiseproduct' && categoryWiseList.length}
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
    minHeight: 38,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '90%',
    alignSelf: 'center',
  },
  totalContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
