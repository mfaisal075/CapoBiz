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
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useUser} from '../../../CTX/UserContext';
import RNPrint from 'react-native-print';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../../BottomBar';

const {width} = Dimensions.get('window');

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  primarySoft: 'rgba(42, 101, 43, 0.1)',
  accent: '#4CAF50',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  danger: '#EF4444',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
};

interface TypeDropDown {
  id: number;
  custtyp_name: string;
}

interface TypeWiseList {
  id: string;
  cust_name: string;
  cust_contact: string;
  cust_cnic: string;
  cust_email: string;
  custtyp_name: string;
}

export default function TypeWiseCustomer({navigation}: any) {
  const {token, bussName, bussAddress} = useUser();
  const {openDrawer} = useDrawer();

  // Dropdown State
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeValue, setTypeValue] = useState('');
  const [typeDropdown, setTypeDropdown] = useState<TypeDropDown[]>([]);
  const transformedType = typeDropdown.map(type => ({
    label: type.custtyp_name,
    value: type.id.toString(),
  }));

  const [typeList, setTypeList] = useState<TypeWiseList[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = typeList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = typeList.slice(
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

  const handlePrint = async () => {
    if (typeList.length === 0) {
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
    const rows = typeList
      .map(
        (item, index) => `
      <tr>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
          index + 1
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.cust_name
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.cust_cnic
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.cust_contact
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.cust_email
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.custtyp_name
        }</td>
      </tr>`,
      )
      .join('');

    // HTML Template
    const html = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Customer Report</title>
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
            Customer Type Report
          </div>
        </div>

        <table style="border-collapse:collapse; width:100%; font-size:12px;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="border:1px solid #000; padding:6px;">Sr#</th>
              <th style="border:1px solid #000; padding:6px;">Customer Name</th>
              <th style="border:1px solid #000; padding:6px;">CNIC</th>
              <th style="border:1px solid #000; padding:6px;">Contact</th>
              <th style="border:1px solid #000; padding:6px;">Email</th>
              <th style="border:1px solid #000; padding:6px;">Type</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `;

    try {
      await RNPrint.print({html});
    } catch (error) {
      console.log('Print error:', error);
      Toast.show({
        type: 'error',
        text1: 'Printing not supported on this device/emulator.',
        visibilityTime: 2000,
      });
    }
  };

  // Fetch Type dropdown
  const fetchTypeDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchtypedata`);
      setTypeDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Type Wise List
  const fetchTypeList = async () => {
    if (typeValue) {
      try {
        const res = await axios.get(
          `${BASE_URL}/fetchcusttypereport?type=${typeValue}&_token=${token}`,
        );
        setTypeList(res.data.type);
        setCurrentPage(1); // Reset pagination on new fetch
      } catch (error) {
        console.log(error);
      }
    } else {
      setTypeList([]);
    }
  };

  useEffect(() => {
    fetchTypeDropdown();

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

  useEffect(() => {
    fetchTypeList();
  }, [typeValue]);

  return (
    <View style={styles.container}>
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
            <Text style={styles.headerTitle}>Type Wise Customer</Text>
            <TouchableOpacity onPress={handlePrint} style={styles.iconBtn}>
              <Icon name="printer" size={24} color={THEME.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Floating Search/Dropdown Area */}
        <View style={styles.floatingSearchContainer}>
          <Icon
            name="tag-outline"
            size={22}
            color={THEME.primary}
            style={styles.searchIcon}
          />
          <DropDownPicker
            items={transformedType}
            open={typeOpen}
            setOpen={setTypeOpen}
            value={typeValue}
            setValue={setTypeValue}
            placeholder="Select Customer Type"
            placeholderStyle={{color: THEME.textGray, fontSize: 15}}
            textStyle={{color: THEME.textDark}}
            style={styles.floatingDropdown}
            dropDownContainerStyle={styles.floatingDropdownList}
            listItemLabelStyle={{color: THEME.textDark}}
            searchable
            searchPlaceholder="Search Type..."
            searchTextInputStyle={{
              borderWidth: 0,
              borderBottomWidth: 1,
              borderColor: '#eee',
              color: THEME.textDark,
            }}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={20} color={THEME.textGray} />
            )}
            ArrowDownIconComponent={() => (
              <Icon name="chevron-down" size={20} color={THEME.textGray} />
            )}
          />
        </View>
      </View>

      {/* --- LIST CONTENT --- */}
      <View style={styles.listContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeaderLabel}>CUSTOMER LIST</Text>
          <Text style={styles.tableHeaderCount}>{totalRecords} Found</Text>
        </View>

        <FlatList
          data={currentData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <View style={styles.cardRow}>
              {/* Left Side: Avatar + Name/Phone */}
              <View style={styles.leftContent}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {getInitials(item.cust_name)}
                  </Text>
                </View>

                <View style={styles.infoWrapper}>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {item.cust_name}
                  </Text>

                  <View style={styles.phoneRow}>
                    <Icon name="phone" size={14} color={THEME.textGray} />
                    <Text style={styles.phoneText} numberOfLines={1}>
                      {item.cust_contact || 'No Contact'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Right Side: Type Badge */}
              <View style={styles.locationBadge}>
                <Icon name="tag-outline" size={12} color={THEME.primary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.custtyp_name || 'No Type'}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={{paddingBottom: 160}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Icon name="account-group" size={60} color="#D1D5DB" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // --- HEADER ---
  headerWrapper: {
    zIndex: 9999, // Ensure dropdown comes out on top
    backgroundColor: THEME.background,
    paddingBottom: 25, // Add padding to allow space for floating dropdown
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },

  // Floating Dropdown (Styled like search bar)
  floatingSearchContainer: {
    position: 'absolute',
    top: 120,
    left: 12,
    right: 12,
    backgroundColor: THEME.white,
    borderRadius: 12,
    justifyContent: 'center', // Center vertically
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    height: 54,
    zIndex: 9999,
  },
  searchIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 10,
  },
  floatingDropdown: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    minHeight: 50,
    paddingLeft: 40, // Make room for the absolute icon
  },
  floatingDropdownList: {
    borderWidth: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: -4,
    borderRadius: 12,
  },

  // --- LIST & CARDS ---
  listContainer: {
    flex: 1,
    marginTop: 10, // Reduced top margin
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
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
  infoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 13,
    color: THEME.textGray,
    fontWeight: '500',
    marginLeft: 4,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: '35%',
  },
  locationText: {
    fontSize: 11,
    color: THEME.primary,
    fontWeight: '600',
    marginLeft: 4,
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
