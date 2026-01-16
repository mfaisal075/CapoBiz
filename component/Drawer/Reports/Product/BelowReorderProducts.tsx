import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import {useUser} from '../../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import RNPrint from 'react-native-print';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../../BottomBar';

const {width} = Dimensions.get('window');

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
  border: '#E5E7EB',
  danger: '#EF4444',
  rowHover: '#F9FAFB',
};

interface ReOrderList {
  prod_name: string;
  prod_UPC_EAN: string;
  prod_qty: string;
  prod_reorder_qty: string;
  prod_costprice: string;
  prod_fretailprice: string; // This corresponds to 'Sale Price' in the logic
  created_at: string;
  ums_name: string;
  pcat_name: string;
}

export default function BelowReorderProducts({navigation}: any) {
  const {openDrawer} = useDrawer();
  const {bussName, bussAddress} = useUser();
  const [reOrderList, setReOrderList] = useState<ReOrderList[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = reOrderList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = reOrderList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  // Helper: Get Initials
  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Handle Print
  const handlePrint = async () => {
    if (reOrderList.length === 0) {
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
    const rows = reOrderList
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
          item.prod_qty
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.prod_reorder_qty
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.prod_costprice
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.prod_fretailprice
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${new Date(
          item.created_at,
        ).toLocaleDateString('en-UC', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}</td>
      </tr>`,
      )
      .join('');

    // HTML Template
    const html = `
          <html>
            <head>
                <meta charset="utf-8">
                <title>Reorder Level Products</title>
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
                      Reorder Level Products
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
                      <th style="border:1px solid #000; padding:6px;">Qty</th>
                      <th style="border:1px solid #000; padding:6px;">Reorder Qty</th>
                      <th style="border:1px solid #000; padding:6px;">Cost Price</th>
                      <th style="border:1px solid #000; padding:6px;">Sale Price</th>
                      <th style="border:1px solid #000; padding:6px;">Entry Date</th>
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

  // Fetch Re-Ordered List
  const fetchReOrderList = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchreorder`);
      setReOrderList(res.data.products);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchReOrderList();

    const backKey = () => {
      navigation.navigate('Dashboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, []);

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
            <Text style={styles.headerTitle}>Reorder Level Products</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* --- CONTENT LIST --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>PRODUCT LIST</Text>
          <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
        </View>

        <FlatList
          data={currentData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <View style={styles.cardRow}>
              {/* Avatar Section */}
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {getInitials(item.prod_name)}
                </Text>
              </View>

              {/* Info Section */}
              <View style={styles.infoContainer}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {item.prod_name}
                </Text>

                {/* Row 1: Cost | Retail */}
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailText}>
                      Cost: {item.prod_costprice}
                    </Text>
                  </View>
                  <View style={styles.detailSeparator} />
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailText, {color: THEME.primary}]}>
                      Retail: {item.prod_fretailprice}
                    </Text>
                  </View>
                </View>

                {/* Row 2: Category | Qty | Reorder */}
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Icon
                      name="shape-outline"
                      size={14}
                      color={THEME.textLight}
                    />
                    <Text style={styles.subText} numberOfLines={1}>
                      {item.pcat_name || 'General'}
                    </Text>
                  </View>

                  <View style={styles.detailSeparator} />
                  <View style={styles.detailItem}>
                    <Text
                      style={[
                        styles.subText,
                        {color: THEME.danger, fontWeight: '700'},
                      ]}>
                      Qty: {item.prod_qty}
                    </Text>
                  </View>

                  <View style={styles.detailSeparator} />
                  <View style={styles.detailItem}>
                    <Text style={styles.subText}>
                      Reorder: {item.prod_reorder_qty}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={{paddingBottom: 160}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Icon name="cube-off-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>No records found.</Text>
            </View>
          }
        />
      </View>

      {/* --- PAGINATION (Bottom Floating) --- */}
      {totalRecords > 0 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={[styles.pageBtn, currentPage === 1 && styles.disabledBtn]}>
            <Icon name="chevron-left" size={24} color={THEME.white} />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() =>
              setCurrentPage(prev => Math.min(prev + 1, totalPages))
            }
            style={[
              styles.pageBtn,
              currentPage === totalPages && styles.disabledBtn,
            ]}>
            <Icon name="chevron-right" size={24} color={THEME.white} />
          </TouchableOpacity>
        </View>
      )}
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- HEADER ---
  headerWrapper: {
    zIndex: 999,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: THEME.primary,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
  },

  // --- LIST & CARDS ---
  listContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 15,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  tableHeaderLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textGray,
    letterSpacing: 1,
  },
  tableHeaderCount: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '700',
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardRow: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(42, 101, 43, 0.1)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailSeparator: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  detailText: {
    fontSize: 12,
    color: THEME.textGray,
    fontWeight: '500',
  },
  subText: {
    fontSize: 12,
    color: THEME.textGray,
    marginLeft: 3,
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    color: THEME.textGray,
    fontSize: 16,
  },

  // --- PAGINATION ---
  paginationContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: THEME.primary,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.3,
  },
  pageText: {
    color: THEME.white,
    fontWeight: '700',
    marginHorizontal: 15,
    fontSize: 14,
  },
});
