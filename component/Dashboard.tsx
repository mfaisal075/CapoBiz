import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {useDrawer} from './DrawerContext';
import {useUser} from './CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from './BASE_URL';
import dayjs from 'dayjs';
import BottomBar from './BottomBar';

import LinearGradient from 'react-native-linear-gradient';
import {fetchStockAndNotify} from './NotificationService';

const {width} = Dimensions.get('window');

// --- MODERN THEME (Deep Earthy Green & Gold Accents) ---
const THEME = {
  primary: '#1A5D1A', // Deep Forest Green
  primaryDark: '#0D3B0D',
  primaryLight: '#E3F2E3',
  secondary: '#FFC107', // Gold/Amber for accents
  accent: '#2E7D32',
  background: '#F8F9FA', // Very light gray, almost white
  surface: '#FFFFFF',
  textMain: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  danger: '#EF4444',
  success: '#10B981',
  border: '#E5E7EB',
  purple: '#8B5CF6',
  orange: '#F97316',
  blue: '#3B82F6',
  cyan: '#06B6D4',
};

// --- INTERFACES ---
interface StatItem {
  title: string;
  icon: string; // Changed from 'any' to 'string' for vector icon name
  screen: string;
  count?: string | number;
  type?: 'money' | 'count';
  color: string;
}

type RootStackParamList = {
  Login: undefined;
  'Point of Sale': undefined;
};

type DashboardNavigationProp = NavigationProp<RootStackParamList>;

interface Counts {
  customer: number;
  suppliers: number;
  employees: number;
  product: number;
  currentstockqty: number;
  currentstocksubqty: number;
  expenseamount: number;
  sale: number;
  purchase: number;
  current_month_sale: number;
}

export default function Dashboard(): JSX.Element {
  const {userName, userEmail} = useUser();
  const {
    setUserEmail,
    setUserName,
    setBussName,
    setBussAddress,
    setBussContact,
  } = useUser();
  const navigation = useNavigation<DashboardNavigationProp>();
  const [isModalVisible, setModalVisible] = useState(false);
  const {openDrawer} = useDrawer();
  const [date, setDate] = useState(dayjs());
  const [count, setCount] = useState<Counts | null>(null);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(dayjs());
    }, 1000 * 60); // Update every minute is enough

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/poscashregister`);
        setUserName(res.data?.authenticated_user?.name ?? '');
        setUserEmail(res.data?.authenticated_user?.email ?? '');

        const bus = await axios.get(`${BASE_URL}/dashboaddata`);
        setCount(bus.data);
        setBussName(bus.data?.businessdata?.bus_name ?? '');
        setBussAddress(bus.data?.businessdata?.bus_address ?? '');
        setBussContact(bus.data?.businessdata?.bus_contact1 ?? '');
      } catch (error) {
        console.log(error);
      }
    };
    const requestNotificationPermission = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        try {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        } catch (err) {
          console.warn(err);
        }
      }
    };

    fetchUserData();
    requestNotificationPermission();
    fetchStockAndNotify();

    return () => clearInterval(timer);
  }, []);

  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    } else {
      return num.toString();
    }
  }

  // --- STATS DATA ---
  const stats: StatItem[] = [
    {
      title: 'Total Sales',
      icon: 'cash-multiple',
      screen: 'Invoice List',
      count: count?.sale,
      type: 'money',
      color: THEME.success,
    },
    {
      title: 'Purchases',
      icon: 'cart-arrow-down',
      screen: 'Purchase List',
      count: count?.purchase,
      type: 'money',
      color: THEME.blue,
    },
    {
      title: 'Expenses',
      icon: 'wallet-outline',
      screen: 'Manage Expenses',
      count: formatNumber(Number(count?.expenseamount)),
      type: 'money',
      color: THEME.danger,
    },
    {
      title: 'Stock Qty',
      icon: 'package-variant-closed',
      screen: 'Current Stock',
      count: `${formatNumber(Number(count?.currentstockqty))}`,
      type: 'count',
      color: THEME.purple,
    },
    {
      title: 'Customers',
      icon: 'account-group',
      screen: 'Customer',
      count: count?.customer,
      type: 'count',
      color: THEME.orange,
    },
    {
      title: 'Suppliers',
      icon: 'truck-delivery',
      screen: 'Suppliers',
      count: count?.suppliers,
      type: 'count',
      color: THEME.cyan,
    },
    {
      title: 'Employees',
      icon: 'card-account-details-outline',
      screen: 'Employees',
      count: count?.employees,
      type: 'count',
      color: THEME.textSecondary,
    },
    {
      title: 'Products',
      icon: 'cube-outline',
      screen: 'Products',
      count: count?.product,
      type: 'count',
      color: THEME.primary,
    },
    {
      title: 'Reports',
      icon: 'file-chart-outline',
      screen: 'All User Sales', // Navigating to All User Sales as requested
      count: 'View',
      type: 'count',
      color: THEME.secondary,
    },
  ];

  const DashboardCard = ({item}: {item: StatItem}) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.gridItem}
      onPress={() => navigation.navigate(item.screen as never)}>
      <View style={styles.gridIconContainer}>
        <Icon name={item.icon} size={28} color={THEME.primary} />
      </View>
      <Text style={styles.gridLabel} numberOfLines={1}>
        {item.title}
      </Text>
      {/* <Text style={styles.gridCount} numberOfLines={1}>
        {item.count || '0'}
      </Text> */}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.primaryDark}
        translucent={false} // Solid status bar for cleaner look
      />

      {/* --- HEADER --- */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[THEME.primary, THEME.primaryDark]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
              <Icon name="menu" size={26} color={THEME.surface} />
            </TouchableOpacity>

            <View style={styles.brandContainer}>
              <Text style={styles.appTitle}>CapoBiz</Text>
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>POS</Text>
              </View>
            </View>

            <View style={styles.rightActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications' as never)}
                style={styles.notificationBtn}>
                <Icon name="bell-outline" size={30} color={THEME.surface} />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>

              {/* <TouchableOpacity onPress={toggleModal} style={styles.profileBtn}>
                <Text style={styles.profileInitials}>
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </Text>
              </TouchableOpacity> */}
            </View>
          </View>

          <View style={styles.greetingContainer}>
            <View>
              <Text style={styles.greetingSub}>Hello,</Text>
              <Text style={styles.greetingMain}>
                {userName || 'Store Manager'}
              </Text>
            </View>
            <View style={styles.dateBadge}>
              <Icon
                name="calendar"
                size={14}
                color={THEME.surface}
                style={{marginRight: 4}}
              />
              <Text style={styles.dateText}>{date.format('DD MMM, YYYY')}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* --- BODY --- */}
      <View style={styles.bodyContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* --- Stats Overview (Circles) --- */}
          <View style={styles.overviewGrid}>
            {[
              {
                title: 'Customers',
                count: count?.customer || 0,
                icon: 'account-group', // Matches user image
                color: '#1E88E5', // Blue
                screen: 'Customer',
              },
              {
                title: 'Suppliers',
                count: count?.suppliers || 0,
                icon: 'account-multiple', // Use icon that looks like group/suppliers
                color: '#FB8C00', // Orange
                screen: 'Suppliers',
              },
              {
                title: 'Products',
                count: count?.product || 0,
                icon: 'package-variant',
                color: '#E53935', // Redish
                screen: 'Products',
              },
              {
                title: 'ale Invoices', // Typo fix: Sale Invoices
                count: count?.sale || 0, // Using sale count
                icon: 'cart-outline',
                color: '#43A047', // Green
                screen: 'Invoice List',
              },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                style={styles.overviewCard}
                onPress={() => navigation.navigate(item.screen as never)}>
                <View
                  style={[
                    styles.overviewIconBox,
                    {backgroundColor: item.color},
                  ]}>
                  <Icon name={item.icon} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.overviewContent}>
                  <Text style={styles.overviewTitle}>
                    {item.title === 'ale Invoices'
                      ? 'Sale Invoices'
                      : item.title}
                  </Text>
                  <Text style={styles.overviewCount}>
                    {typeof item.count === 'number' ||
                    !isNaN(Number(item.count))
                      ? formatNumber(Number(item.count))
                      : item.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats Grid */}
          <View style={[styles.sectionHeader, {marginTop: 0}]}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
          </View>
          <View style={styles.gridContainer}>
            {stats.map((item, index) => (
              <DashboardCard key={index} item={item} />
            ))}
          </View>

          {/* Recent Sales */}

          <View style={{height: 100}} />
        </ScrollView>

        {/* --- POS FAB BUTTON --- */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.fab}
          onPress={() => navigation.navigate('Point of Sale' as never)}>
          <LinearGradient
            colors={[THEME.primary, THEME.primaryDark]}
            style={styles.fabGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <Icon name="cart" size={28} color={THEME.surface} />
            <Text style={styles.fabText}>POS</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* --- 1. PROFILE MODAL --- */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={toggleModal}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={toggleModal}>
          <View style={styles.profileDropdown}>
            <View style={styles.dropdownHeader}>
              <View style={styles.dropdownAvatar}>
                <Text style={styles.dropdownAvatarText}>
                  {userName?.charAt(0) || 'U'}
                </Text>
              </View>
              <View>
                <Text style={styles.dropdownName}>{userName || 'User'}</Text>
                <Text style={styles.dropdownEmail}>
                  {userEmail || 'user@capobiz.com'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Login')}>
              <Icon name="logout" size={20} color={THEME.danger} />
              <Text style={[styles.menuText, {color: THEME.danger}]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- BOTTOM BAR --- */}
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
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.surface,
    letterSpacing: 0.5,
  },
  brandBadge: {
    backgroundColor: THEME.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
    transform: [{rotate: '-5deg'}],
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.primaryDark,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  notificationBtn: {
    padding: 4,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.secondary,
    borderWidth: 1,
    borderColor: THEME.primary,
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  greetingSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 2,
  },
  greetingMain: {
    color: THEME.surface,
    fontSize: 20,
    fontWeight: '700',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: {
    color: THEME.surface,
    fontSize: 12,
    fontWeight: '600',
  },

  // --- Body ---
  bodyContainer: {
    flex: 1,
    marginTop: -20, // Overlap effect
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 30, // Account for overlap
    paddingBottom: 120, // Increased to prevent content from hiding behind BottomBar
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textMain,
  },

  // --- Stats Section (Circles) ---

  // --- Business Overview (New) ---
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  overviewCard: {
    width: '48%', // 2 columns
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: THEME.textSecondary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  overviewContent: {
    flex: 1,
    justifyContent: 'center',
  },
  overviewTitle: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  overviewCount: {
    fontSize: 15, // Reduced slightly to fit
    fontWeight: 'bold',
    color: THEME.textMain,
  },

  // --- Grid ---
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 32 - 20) / 3, // 3 columns
    aspectRatio: 1,
    backgroundColor: THEME.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    padding: 8,
  },
  gridIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  gridLabel: {
    fontSize: 12,
    color: THEME.textMain,
    fontWeight: '600',
    textAlign: 'center',
  },
  gridCount: {
    fontSize: 10,
    color: THEME.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },

  // --- Transactions ---

  // --- FAB ---
  fab: {
    position: 'absolute',
    bottom: 90, // Adjusted to sit above BottomBar
    right: 20,
    borderRadius: 30,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  fabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.surface,
    marginLeft: 8,
  },

  // --- Modal: Profile ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  profileDropdown: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 70,
    right: 20,
    width: 260,
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dropdownAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.surface,
  },
  dropdownName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textMain,
  },
  dropdownEmail: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
  },
});
