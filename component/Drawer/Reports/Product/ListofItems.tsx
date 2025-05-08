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
import React, {useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';

type Product = {
  sr: number;
  Product: string;
  Barcode: number;
  Category: string;
  UOM: string;
  SubUom: string;
  Quantity: number;
  ReorderedQTY: number;
  CostPrice: number;
  SalePrice: number;
};

type InfoType = {
  [key: string]: Product[];
};

export default function ListofItems() {
  const {openDrawer} = useDrawer();

  const Info: InfoType = {
    'Select Category': [
      {
        sr: 1,
        Product: 'string',
        Barcode: 34,
        Category: 'oil',
        UOM: 'string',
        SubUom: 'string',
        Quantity: 667,
        ReorderedQTY: 99,
        CostPrice: 88,
        SalePrice: 99,
      },
    ],
    Chocolate: [
      {
        sr: 1,
        Product: 'string',
        Barcode: 34,
        Category: 'oil',
        UOM: 'string',
        SubUom: 'string',
        Quantity: 667,
        ReorderedQTY: 99,
        CostPrice: 88,
        SalePrice: 9,
      },
      {
        sr: 2,
        Product: 'string',
        Barcode: 34,
        Category: 'oil',
        UOM: 'string',
        SubUom: 'string',
        Quantity: 667,
        ReorderedQTY: 99,
        CostPrice: 88,
        SalePrice: 9,
      },
    ],
    Jelly: [
      {
        sr: 1,
        Product: 'string',
        Barcode: 34,
        Category: 'oil',
        UOM: 'string',
        SubUom: 'string',
        Quantity: 667,
        ReorderedQTY: 99,
        CostPrice: 88,
        SalePrice: 99,
      },
    ],
    Oil: [
      {
        sr: 1,
        Product: 'string',
        Barcode: 34,
        Category: 'oil',
        UOM: 'string',
        SubUom: 'string',
        Quantity: 667,
        ReorderedQTY: 99,
        CostPrice: 88,
        SalePrice: 99.0,
      },
    ],
    Flour: [
      {
        sr: 1,
        Product: 'string',
        Barcode: 34,
        Category: 'oil',
        UOM: 'string',
        SubUom: 'string',
        Quantity: 667,
        ReorderedQTY: 99,
        CostPrice: 88,
        SalePrice: 99,
      },
    ],
    'Murree Brwerry': [
      {
        sr: 1,
        Product: 'string',
        Barcode: 34,
        Category: 'oil',
        UOM: 'string',
        SubUom: 'string',
        Quantity: 667,
        ReorderedQTY: 99,
        CostPrice: 88,
        SalePrice: 99,
      },
      {
        sr: 2,
        Product: 'string',
        Barcode: 34,
        Category: 'oil',
        UOM: 'string',
        SubUom: 'string',
        Quantity: 667,
        ReorderedQTY: 99,
        CostPrice: 88,
        SalePrice: 99,
      },
      {
        sr: 3,
        Product: 'string',
        Barcode: 34,
        Category: 'oil',
        UOM: 'string',
        SubUom: 'string',
        Quantity: 667,
        ReorderedQTY: 99,
        CostPrice: 88,
        SalePrice: 99,
      },
    ],
  };

  const [category, setCategory] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<string>('Select Category');

  const categoryItems = [
    {label: 'Select Category', value: 'Select Category'},
    {label: 'Chocolate', value: 'Chocolate'},
    {label: 'Jelly', value: 'Jelly'},
    {label: 'Oil', value: 'Oil'},
    {label: 'Flour', value: 'Flour'},
    {label: 'Murree Brwerry', value: 'Murree Brwerry'},
  ];

 
  const [selectionMode, setSelectionMode] = useState<
    'allproducts' | 'categorywiseproduct' | ''
  >('');

  const totalProducts =
    selectionMode === 'allproducts'
      ? Object.values(Info).reduce((acc, list) => acc + list.length, 0)
      : Info[currentCategory]?.length || 0;

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
        </View>

        <DropDownPicker
          items={categoryItems}
          open={category}
          setOpen={setCategory}
          value={currentCategory}
          setValue={setCurrentCategory}
          placeholder="Select Category"
          disabled={selectionMode === 'allproducts'} // Disable dropdown
          placeholderStyle={{color: 'white'}}
          textStyle={{color: 'white'}}
          arrowIconStyle={{tintColor: 'white'}}
          style={[
            styles.dropdown,
            {borderColor: 'white', width: '88%', alignSelf: 'center'},
          ]}
          dropDownContainerStyle={{
            backgroundColor: 'white',
            borderColor: '#144272',
            width: '88%',
            marginLeft: 22,
          }}
          labelStyle={{color: 'white'}}
          listItemLabelStyle={{color: '#144272'}}
        />

        <View style={[styles.row, {marginTop: -6, marginLeft: 20}]}>
          <RadioButton
            value="allproducts"
            status={selectionMode === 'allproducts' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => {
              setSelectionMode('allproducts');
              setCurrentCategory('Select Category');
            }}
          />
          <Text style={{color: 'white', marginTop: 7, marginLeft: -5}}>
            All Products
          </Text>
          <RadioButton
            value="categorywiseproduct"
            color="white"
            uncheckedColor="white"
            status={
              selectionMode === 'categorywiseproduct' ? 'checked' : 'unchecked'
            }
            onPress={() => {
              setSelectionMode('categorywiseproduct');
              setCurrentCategory('');
            }}
          />
          <Text style={{color: 'white', marginTop: 7, marginLeft: -5}}>
            Category Wise Products
          </Text>
        </View>

        <ScrollView>
          {(selectionMode === 'allproducts' ||
            (selectionMode === 'categorywiseproduct' && currentCategory)) && (
            <FlatList
              data={
                selectionMode === 'allproducts'
                  ? Info['Select Category']
                  : Info[currentCategory] || []
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
                        {item.Product}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>BarCode:</Text>
                        <Text style={styles.text}>{item.Barcode}</Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Category:</Text>
                        <Text style={styles.text}>{item.Category}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>UOM:</Text>
                        <Text style={styles.text}>{item.UOM}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>SubUOM:</Text>
                        <Text style={styles.text}>{item.SubUom}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Quantity:</Text>
                        <Text style={styles.text}>{item.Quantity}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Reordered Quantity:</Text>
                        <Text style={styles.text}>{item.ReorderedQTY}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Cost Price:</Text>
                        <Text style={styles.text}>{item.CostPrice}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 5,
                        }}>
                        <Text style={styles.text}>Sale Price:</Text>
                        <Text style={styles.text}>{item.SalePrice}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            />
          )}

          {selectionMode === 'categorywiseproduct' && !currentCategory && (
            <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
              Please select a category to view items.
            </Text>
          )}
        </ScrollView>

        {selectionMode !== '' && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total Products:</Text>
            <Text style={styles.totalText}>{totalProducts}</Text>
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
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
