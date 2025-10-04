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

  // POS Dashboard Stats (static for now)
  const stats: StatItem[] = [
    {
      title: 'Customers',
      value: dashboadData?.customer ?? 0,
      icon: 'account-group',
      color: '#3B82F6',
      lightColor: '#EFF6FF',
    },
    {
      title: 'Suppliers',
      value: dashboadData?.suppliers ?? 0,
      icon: 'truck',
      color: '#10B981',
      lightColor: '#ECFDF5',
    },
    {
      title: 'Employees',
      value: dashboadData?.employees ?? 0,
      icon: 'account-tie',
      color: '#8B5CF6',
      lightColor: '#F3E8FF',
    },
    {
      title: 'Current Stock',
      value: `${dashboadData?.currentstockqty ?? 0} - ${
        dashboadData?.currentstocksubqty ?? 0
      }`,
      icon: 'warehouse',
      color: '#F59E0B',
      lightColor: '#FFFBEB',
    },
    {
      title: 'Products',
      value: dashboadData?.product ?? 0,
      icon: 'package-variant',
      color: '#6366F1',
      lightColor: '#EEF2FF',
    },
    {
      title: 'Sale Invoices',
      value: dashboadData?.sale ?? 0,
      icon: 'file-document',
      color: '#EF4444',
      lightColor: '#FEE2E2',
    },
    {
      title: 'Purchases',
      value: dashboadData?.purchase ?? 0,
      icon: 'cart-arrow-down',
      color: '#06B6D4',
      lightColor: '#ECFEFF',
    },
    {
      title: 'Expenses',
      value: `Rs. ${dashboadData?.expenseamount ?? 0}`,
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
          <Text style={styles.headerSubtitle}>Main Store • Online</Text>
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.statusSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {userName || 'Manager'}!
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
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
