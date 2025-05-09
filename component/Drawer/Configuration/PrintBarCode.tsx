import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';

export default function PrintBarCode() {
  const {openDrawer} = useDrawer();

  const [category, setcategory] = useState(false);
  const [currentcategory, setCurrentcategory] = useState<string | null>('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const productData = [
    {
      label: 'Kunafa Bar | 836256',
      value: 'Kunafa Bar | 836256',
      name: 'Kunafa Bar',
      barcode: '836256',
      price: 199,
    },
    {
      label: 'Cup | 545454',
      value: 'Cup | 545454',
      name: 'Cup',
      barcode: '545454',
      price: 50,
    },
    {
      label: 'Chilli Milli | 640596',
      value: 'Chilli Milli | 640596',
      name: 'Chilli Milli',
      barcode: '640596',
      price: 599,
    },
    {
      label: 'Pizza Jelly | 790051',
      value: 'Pizza Jelly | 790051',
      name: 'Pizza Jelly',
      barcode: '790051',
      price: 100,
    },
    {
      label: 'Flour E | 351374',
      value: 'Flour E | 351374',
      name: 'Flour E',
      barcode: '351374',
      price: 80,
    },
  ];

  const handleBarcodePress = () => {
    const product = productData.find(p => p.value === currentcategory);
    if (product) {
      setSelectedProduct(product);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../../assets/menu.png')}
              style={styles.menuIcon}
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Print Barcode</Text>
          </View>
        </View>

        <DropDownPicker
          items={productData}
          open={category}
          setOpen={setcategory}
          value={currentcategory}
          setValue={setCurrentcategory}
          placeholder="Select Product"
          placeholderStyle={{color: 'white'}}
          textStyle={{color: 'white'}}
          arrowIconStyle={{tintColor: 'white'}}
          style={[styles.dropdown]}
          dropDownContainerStyle={styles.dropdownContainer}
          labelStyle={{color: 'white'}}
          listItemLabelStyle={{color: '#144272'}}
        />

        <TouchableOpacity onPress={handleBarcodePress}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Barcode</Text>
          </View>
        </TouchableOpacity>

        {selectedProduct && (
          <View style={styles.resultBox}>
            <Image
              source={{
                uri: `https://barcode.tec-it.com/barcode.ashx?data=${selectedProduct.barcode}&code=Code128&translate-esc=false`,
              }}
              style={{width: 200, height: 80,}}
              resizeMode="contain"
            />

            <Text style={styles.resultText}>{selectedProduct.name}</Text>
            <Text style={styles.resultText}>PKR: {selectedProduct.price}</Text>
          </View>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    justifyContent: 'space-between',
  },
  menuIcon: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 22,
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
    width: 300,
    alignSelf: 'center',
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderColor: '#144272',
    width: 300,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: 'white',
    width: 100,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#144272',
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 20,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    width: 300,
  },
  resultText: {
    fontSize: 16,
    marginVertical: 4,
    color: '#144272',
  },
});
