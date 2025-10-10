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
import {ScrollView} from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import {useDrawer} from './DrawerContext';
import {useUser} from './CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from './BASE_URL';
import backgroundColors from './Colors';
import dayjs from 'dayjs';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

// Type definitions
interface StatItem {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  lightColor: string;
}

type RootStackParamList = {
  Login: undefined;
};

type DashboardNavigationProp = NavigationProp<RootStackParamList>;

interface DashboardData {
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
  const [dashboadData, setDashboadData] = useState<DashboardData | null>(null);
  const [date, setDate] = useState(dayjs());

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dashboaddata`);
      setDashboadData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();

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

        setBussName(bus.data?.businessdata?.bus_name ?? '');
        setBussAddress(bus.data?.businessdata?.bus_address ?? '');
        setBussContact(bus.data?.businessdata?.bus_contact1 ?? '');
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserData();
  }, []);

  // Number format
  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'B';
    }
    if (num >= 100000) {
      return (num / 100000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }

    return num.toString();
  };

  // POS Dashboard Stats (static for now)
  const stats: StatItem[] = [
    {
      title: 'Customers',
      value: formatNumber(dashboadData?.customer ?? 0),
      icon: 'account-group',
      color: '#3B82F6',
      lightColor: '#EFF6FF',
    },
    {
      title: 'Suppliers',
      value: formatNumber(dashboadData?.suppliers ?? 0),
      icon: 'truck',
      color: '#10B981',
      lightColor: '#ECFDF5',
    },
    {
      title: 'Employees',
      value: formatNumber(dashboadData?.employees ?? 0),
      icon: 'account-tie',
      color: '#8B5CF6',
      lightColor: '#F3E8FF',
    },
    {
      title: 'Current Stock',
      value: `${formatNumber(
        dashboadData?.currentstockqty ?? 0,
      )} - ${formatNumber(dashboadData?.currentstocksubqty ?? 0)}`,
      icon: 'warehouse',
      color: '#F59E0B',
      lightColor: '#FFFBEB',
    },
    {
      title: 'Products',
      value: formatNumber(dashboadData?.product ?? 0),
      icon: 'package-variant',
      color: '#6366F1',
      lightColor: '#EEF2FF',
    },
    {
      title: 'Sale Invoices',
      value: formatNumber(dashboadData?.sale ?? 0),
      icon: 'file-document',
      color: '#EF4444',
      lightColor: '#FEE2E2',
    },
    {
      title: 'Purchases',
      value: formatNumber(dashboadData?.purchase ?? 0),
      icon: 'cart-arrow-down',
      color: '#06B6D4',
      lightColor: '#ECFEFF',
    },
    {
      title: 'Expenses',
      value: `Rs. ${formatNumber(dashboadData?.expenseamount ?? 0)}`,
      icon: 'cash-multiple',
      color: '#D97706',
      lightColor: '#FEF3C7',
    },
  ];

  const renderStatCard = (item: StatItem, index: number) => (
    <View key={index} style={[styles.card, {backgroundColor: item.lightColor}]}>
      <View style={[styles.iconContainer, {backgroundColor: item.color}]}>
        <Icon name={item.icon} size={20} color="white" />
      </View>
      <Text style={styles.cardValue}>{item.value}</Text>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.innerHeader}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerButton}>
            <View style={styles.profileBadge}>
              <Image
                source={require('../assets/menu.png')}
                style={styles.headerIcon}
                tintColor="white"
              />
            </View>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>CapoBiz POS</Text>
          </View>

          <TouchableOpacity onPress={toggleModal} style={styles.headerButton}>
            <View style={styles.profileBadge}>
              <Image
                source={require('../assets/user.png')}
                style={styles.headerIcon}
                tintColor="white"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcome}>
          <Icon
            name="account"
            size={30}
            color={backgroundColors.dark}
            style={{
              backgroundColor: backgroundColors.light,
              padding: 10,
              borderRadius: 12,
            }}
          />

          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.welcomeText}>{userName || 'Manager'}!</Text>
          </View>
        </View>

        {/* Timer Section */}
        <View style={styles.timerSection}>
          <Image source={require('../assets/clock.png')} style={styles.clock} />
          <Text style={styles.time}>{date.format('hh:mm:ss')}</Text>
        </View>

        {/* Container */}
        <LinearGradient
          colors={[
            backgroundColors.light,
            backgroundColors.secondary,
            backgroundColors.primary,
          ]}
          style={styles.posContainer}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <Image
            source={require('../assets/pos-terminal.png')}
            style={styles.pos}
          />
          {/* <View>
            <Text>CapoBiz POS</Text>
            <Text>Includes all POS features</Text>
          </View> */}
        </LinearGradient>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Dashboard Stats */}
        <View style={styles.statsGrid}>
          {stats.map((item, index) => renderStatCard(item, index))}
        </View>
      </ScrollView>

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
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: '30%',
    backgroundColor: backgroundColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  innerHeader: {
    height: '20%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: '4%',
  },
  timerSection: {
    height: '23%',
    backgroundColor: backgroundColors.light,
    borderRadius: 15,
    marginTop: '4%',
    paddingHorizontal: '5%',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: backgroundColors.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
    color: backgroundColors.primary,
    marginLeft: '10%',
  },
  clock: {
    height: 45,
    width: 45,
  },
  posContainer: {
    height: '63%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: backgroundColors.light,
    marginTop: '4%',
    borderRadius: 15,
    paddingHorizontal: '5%',
    shadowColor: backgroundColors.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
  },
  pos: {
    height: 125,
    width: 125,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusSection: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: backgroundColors.light,
  },
  dateText: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: '25%',
  },
  card: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 20,
    height: 20,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  cardTitle: {
    fontSize: 13,
    color: '#6B7280',
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
