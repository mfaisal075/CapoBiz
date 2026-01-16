import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import RNPrint from 'react-native-print';
import Barcode from 'react-native-barcode-svg';
import BottomBar from '../../BottomBar';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  primarySoft: 'rgba(42, 101, 43, 0.1)',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  accent: '#4CAF50',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textDark: '#1F2937',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  danger: '#EF4444',
  border: '#E5E7EB',
};

interface Products {
  prod_name: string;
  prod_upc_ean: string;
  id: number;
}

export default function PrintBarCode({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {token} = useUser();

  const [category, setcategory] = useState(false);
  const [currentcategory, setCurrentcategory] = useState<string | null>('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [prods, setProds] = useState<Products[]>([]);
  const [dropdownError, setDropdownError] = useState(false);

  const transformedProds = prods.map(prod => ({
    label: `${prod.prod_name} | ${prod.prod_upc_ean}`,
    value: prod.id.toString(),
  }));

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

  // Fetch Data
  const fetchProds = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/searchproducts?_token=${token}`);
      setProds(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePrintNow = async () => {
    if (!selectedProduct) return;

    try {
      const html = `
        <html>
          <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Helvetica', sans-serif; text-align: center; padding: 80px 20px;">
            <div style="font-size: 0; line-height: 0;">
              <img src="https://barcode.tec-it.com/barcode.ashx?data=${selectedProduct.barcode}&code=Code128&translate-esc=false" style="width: 300px; margin-bottom: 5px;" />
            </div>
            <div style="font-size: 24px; font-weight: bold; margin-top: 10px; color: #000;">${selectedProduct.name}</div>
          </body>
        </html>
      `;

      await RNPrint.print({
        html: html,
      });
    } catch (error) {
      console.error('Print failed:', error);
    }
  };

  const handleBarcodePress = () => {
    if (!currentcategory) {
      setDropdownError(true);
      return;
    }
    setDropdownError(false);

    // 1. Check in static productData
    let product: any = productData.find(p => p.value === currentcategory);

    // 2. If not found, check in fetched prods
    if (!product) {
      const foundProd = prods.find(p => p.id.toString() === currentcategory);
      if (foundProd) {
        product = {
          label: `${foundProd.prod_name} | ${foundProd.prod_upc_ean}`,
          value: foundProd.id.toString(),
          name: foundProd.prod_name,
          barcode: foundProd.prod_upc_ean,
          price: '0.00', // Default if price not available in API
        };
      }
    }

    if (product) {
      setSelectedProduct(product);
    }
  };

  useEffect(() => {
    fetchProds();
    const unsubscribe = navigation?.addListener('blur', () => {
      setcategory(false);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Print Barcode</Text>
            <View style={{width: 40}} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}>
        {/* Selection Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconBox}>
              <Icon name="barcode-scan" size={22} color={THEME.primary} />
            </View>
            <Text style={styles.sectionTitle}>Select Product</Text>
          </View>

          <DropDownPicker
            items={transformedProds}
            open={category}
            setOpen={setcategory}
            value={currentcategory}
            setValue={setCurrentcategory}
            placeholder="Search Product..."
            placeholderStyle={{color: THEME.textLight}}
            textStyle={{color: THEME.textDark}}
            arrowIconStyle={{tintColor: THEME.primary} as any}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            labelStyle={{color: THEME.textDark}}
            listItemLabelStyle={{color: THEME.textGray}}
            searchable={true}
            searchPlaceholder="Type product name..."
            searchTextInputStyle={styles.searchInput}
            searchContainerStyle={styles.searchContainer}
            listMode="SCROLLVIEW"
          />

          {dropdownError && (
            <Text style={styles.errorText}>Please select a product</Text>
          )}

          <TouchableOpacity
            style={styles.printButton}
            onPress={handleBarcodePress}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[THEME.gradientStart, THEME.gradientEnd]}
              style={styles.printButtonGradient}>
              <Icon name="printer" size={20} color="white" />
              <Text style={styles.printButtonText}>Generate Barcode</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Result Card */}
        {selectedProduct && (
          <View style={styles.resultCard}>
            <View style={styles.barcodeDisplayContainer}>
              <Barcode
                value={selectedProduct.barcode}
                format="CODE128"
                maxWidth={Dimensions.get('window').width * 0.7}
                height={80}
              />
              <Text style={styles.barcodeIdText}>
                {selectedProduct.barcode}
              </Text>
              <Text style={styles.barcodeProductName}>
                {selectedProduct.name}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePrintNow}>
              <Icon name="printer-pos" size={18} color={THEME.primary} />
              <Text style={styles.actionButtonText}>Print Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- Header ---
  headerWrapper: {
    marginBottom: 10,
    zIndex: 10,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Card Styling
  card: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    zIndex: 2000,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },

  // Dropdown
  dropdown: {
    borderColor: THEME.border,
    borderRadius: 12,
    height: 50,
    backgroundColor: THEME.background,
  },
  dropdownContainer: {
    borderColor: THEME.border,
    borderRadius: 12,
    elevation: 5,
    backgroundColor: THEME.white,
  },
  searchContainer: {
    borderBottomColor: THEME.border,
    padding: 10,
  },
  searchInput: {
    borderColor: THEME.border,
    borderRadius: 8,
  },

  // Buttons
  printButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: THEME.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  printButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  printButtonText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Result Card
  resultCard: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {width: 0, height: 6},
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    zIndex: 1,
  },
  barcodeDisplayContainer: {
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  barcodeIdText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 6,
    letterSpacing: 1,
  },
  barcodeProductName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  barcodePriceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: THEME.primary,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.primary,
    marginLeft: 8,
  },
  errorText: {
    color: THEME.danger,
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
});
