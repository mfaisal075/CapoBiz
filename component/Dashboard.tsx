import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import Modal from 'react-native-modal';
import {useDrawer} from './DrawerContext';
import {useUser} from './CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from './BASE_URL';
import backgroundColors from './Colors';
import dayjs from 'dayjs';

const {width} = Dimensions.get('window');

// Type definitions
interface StatItem {
  title: string;
  icon: any;
  screen: string;
  count?: string | number;
}

type RootStackParamList = {
  Login: undefined;
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
    setInterval(() => {
      setDate(dayjs());
    }, 1000 * 1);

    const fetchUserData = async () => {
      try {
        // Only proceed with the second request if login was successful
        const res = await axios.get(`${BASE_URL}/poscashregister`);

        setUserName(res.data?.authenticated_user?.name ?? '');
        setUserEmail(res.data?.authenticated_user?.email ?? '');

        // Getting bussiness details
        const bus = await axios.get(`${BASE_URL}/dashboaddata`);
        setCount(bus.data);

        setBussName(bus.data?.businessdata?.bus_name ?? '');
        setBussAddress(bus.data?.businessdata?.bus_address ?? '');
        setBussContact(bus.data?.businessdata?.bus_contact1 ?? '');
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserData();
  }, []);

  function formatNumber(num: number): string {
    if (num >= 100000) {
      return (num / 100000).toFixed(num % 100000 === 0 ? 0 : 2) + 'L';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 2) + 'K';
    } else {
      return num.toString();
    }
  }

  // POS Dashboard Stats (static for now)
  const stats: StatItem[] = [
    {
      title: 'Customers',
      icon: require('../assets/users.png'),
      screen: 'Customer',
      count: count?.customer,
    },
    {
      title: 'Suppliers',
      icon: require('../assets/truck.png'),
      screen: 'Suppliers',
      count: count?.suppliers,
    },
    {
      title: 'Employees',
      icon: require('../assets/name-tag.png'),
      screen: 'Employees',
      count: count?.employees,
    },
    {
      title: 'Current Stock',
      icon: require('../assets/stock.png'),
      screen: 'Current Stock',
      count: `${formatNumber(Number(count?.currentstockqty))} - ${formatNumber(
        Number(count?.currentstocksubqty),
      )}`,
    },
    {
      title: 'Products',
      icon: require('../assets/product.png'),
      screen: 'Products',
      count: count?.product,
    },
    {
      title: 'Sale Invoices',
      icon: require('../assets/receipt.png'),
      screen: 'Invoice List',
      count: count?.sale,
    },
    {
      title: 'Purchases',
      icon: require('../assets/purchase.png'),
      screen: 'Purchase List',
      count: count?.purchase,
    },
    {
      title: 'Expenses',
      icon: require('../assets/payment.png'),
      screen: 'Manage Expenses',
      count: formatNumber(Number(count?.expenseamount)),
    },
  ];

  const renderStatCard = (item: StatItem, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.card,
        {backgroundColor: backgroundColors.light},
        // Apply special styling to first two cards
        index < 2 && styles.overlappingCard,
      ]}
      onPress={() => {
        navigation.navigate(item.screen as never);
      }}>
      <View style={[styles.iconContainer]}>
        <Image source={item.icon} style={styles.cardIcon} />
        <Text style={styles.count}>{item.count}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.innerHeader}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerButton}>
            <View>
              <Image
                source={require('../assets/menu.png')}
                style={styles.menuIcon}
                tintColor="white"
              />
            </View>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>CapoBiz POS</Text>
          </View>

          <TouchableOpacity onPress={toggleModal} style={styles.headerButton}>
            <View style={styles.profileBadge}>
              <Icon name="account" size={28} color={backgroundColors.dark} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Timer Section */}
        <View style={styles.timerSection}>
          <Text style={styles.time}>{date.format('hh:mm:ss')}</Text>
        </View>
      </View>

      <View style={{zIndex: 1000}}>
        {/* Dashboard Stats */}
        <View style={styles.statsGrid}>
          {stats.map((item, index) => renderStatCard(item, index))}
        </View>
      </View>

      {/* User Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        backdropOpacity={0.4}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        style={styles.modalStyle}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.userAvatarContainer}>
              <Image
                style={styles.userAvatar}
                source={require('../assets/user.png')}
                tintColor="#1E40AF"
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userName ?? 'Store Manager'}</Text>
              <Text style={styles.userEmail}>
                {userEmail ?? 'manager@capobiz.com'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.gray,
  },
  header: {
    height: '20%',
    backgroundColor: backgroundColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 999,
  },
  innerHeader: {
    height: '20%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerSection: {
    marginTop: '5%',
    paddingHorizontal: '2%',
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
    color: backgroundColors.light,
    textAlign: 'right',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 28,
    height: 28,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: -40,
  },
  card: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  overlappingCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: 80,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardIcon: {
    width: 36,
    height: 36,
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
  },
  cardTitle: {
    fontSize: 16,
    color: backgroundColors.dark,
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalStyle: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: 260,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  userAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  userAvatar: {
    width: 24,
    height: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
