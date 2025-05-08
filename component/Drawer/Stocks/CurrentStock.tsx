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
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';

type Product = {
  Product: string;
  Category: string;
  Quantity: number;
  CostPrice: number;
  TotalCost: number;
  RetailPrice: number;
  TotalRetail: number;
};

type InfoType = {
  [key: string]: Product[];
};

export default function CurrentStock() {
  const {openDrawer} = useDrawer();

  const Info: InfoType = {
    'Select Category': [
      {
        Product: 'Sufi',
        Category: 'Oil',
        Quantity: 150,
        CostPrice: 120.0,
        TotalCost: 2,
        RetailPrice: 299.0,
        TotalRetail: 5,
      },
      {
        Product: 'Dark Bliss',
        Category: 'Chocolate',
        Quantity: 100,
        CostPrice: 180.0,
        TotalCost: 1,
        RetailPrice: 450.0,
        TotalRetail: 4,
      },
      {
        Product: 'Chilli Milli',
        Category: 'Jelly',
        Quantity: 100,
        CostPrice: 180.0,
        TotalCost: 1,
        RetailPrice: 450.0,
        TotalRetail: 4,
      },
    ],
    Chocolate: [
      {
        Product: 'Choco Delight',
        Category: 'Chocolate',
        Quantity: 150,
        CostPrice: 120.0,
        TotalCost: 2,
        RetailPrice: 299.0,
        TotalRetail: 5,
      },
      {
        Product: 'Dark Bliss',
        Category: 'Chocolate',
        Quantity: 100,
        CostPrice: 180.0,
        TotalCost: 1,
        RetailPrice: 450.0,
        TotalRetail: 4,
      },
    ],
    Jelly: [
      {
        Product: 'Berry Blast',
        Category: 'Jelly',
        Quantity: 180,
        CostPrice: 90.0,
        TotalCost: 4,
        RetailPrice: 250.0,
        TotalRetail: 6,
      },
      {
        Product: 'Fruit Jelly',
        Category: 'Jelly',
        Quantity: 220,
        CostPrice: 100.0,
        TotalCost: 5,
        RetailPrice: 280.0,
        TotalRetail: 7,
      },
    ],
    Oil: [
      {
        Product: 'Sufi',
        Category: 'Oil',
        Quantity: 285,
        CostPrice: 200.0,
        TotalCost: 3,
        RetailPrice: 599.0,
        TotalRetail: 9,
      },
      {
        Product: 'Olive Oil',
        Category: 'Oil',
        Quantity: 150,
        CostPrice: 250.0,
        TotalCost: 5,
        RetailPrice: 700.0,
        TotalRetail: 8,
      },
    ],
    Flour: [
      {
        Product: 'Wheat Flour',
        Category: 'Flour',
        Quantity: 100,
        CostPrice: 50.0,
        TotalCost: 2,
        RetailPrice: 120.0,
        TotalRetail: 4,
      },
      {
        Product: 'Rice Flour',
        Category: 'Flour',
        Quantity: 80,
        CostPrice: 60.0,
        TotalCost: 3,
        RetailPrice: 150.0,
        TotalRetail: 5,
      },
    ],
    'Murree Brwerry': [
      {
        Product: 'Murree Berry Drink',
        Category: 'Murree Brwerry',
        Quantity: 200,
        CostPrice: 150.0,
        TotalCost: 4,
        RetailPrice: 350.0,
        TotalRetail: 7,
      },
    ],
  };

  const totalCost = Object.values(Info)
    .flat()
    .reduce((acc, item) => acc + item.TotalCost, 0);
  const totalRetail = Object.values(Info)
    .flat()
    .reduce((acc, item) => acc + item.TotalRetail, 0);

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

        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Export Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Print</Text>
          </TouchableOpacity>
        </View>

        <DropDownPicker
          items={categoryItems}
          open={category}
          setOpen={setCategory}
          value={currentCategory}
          setValue={setCurrentCategory}
          placeholder="Select Category"
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
            width: '88%',marginLeft:22
          }}
          labelStyle={{color: 'white'}}
          listItemLabelStyle={{color: '#144272'}}
        />

        <ScrollView>
          <FlatList
            data={Info[currentCategory] || []}
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
                      <Text style={styles.text}>Category:</Text>
                      <Text style={styles.text}>{item.Category}</Text>
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
                      <Text style={styles.text}>Cost Price:</Text>
                      <Text style={styles.text}>{item.CostPrice}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Total Cost:</Text>
                      <Text style={styles.text}>{item.TotalCost}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Retail Price:</Text>
                      <Text style={styles.text}>{item.RetailPrice}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}>
                      <Text style={styles.text}>Total Retail:</Text>
                      <Text style={styles.text}>{item.TotalRetail}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        </ScrollView>

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Cost: {totalCost}</Text>
          <Text style={styles.totalText}>Total Retail: {totalRetail}</Text>
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
