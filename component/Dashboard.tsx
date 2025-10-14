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
  icon: any;
  screen: string;
}

type RootStackParamList = {
  Login: undefined;
};

type DashboardNavigationProp = NavigationProp<RootStackParamList>;

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
      icon: require('../assets/users.png'),
      screen: 'Customer',
    },
    {
      title: 'Suppliers',
      icon: require('../assets/truck.png'),
      screen: 'Suppliers',
    },
    {
      title: 'Employees',
      icon: require('../assets/name-tag.png'),
      screen: 'Employees',
    },
    {
      title: 'Current Stock',
      icon: require('../assets/stock.png'),
      screen: 'Current Stock',
    },
    {
      title: 'Products',
      icon: require('../assets/product.png'),
      screen: 'Products',
    },
    {
      title: 'Sale Invoices',
      icon: require('../assets/receipt.png'),
      screen: 'Invoice List',
    },
    {
      title: 'Purchases',
      icon: require('../assets/purchase.png'),
      screen: 'Purchase List',
    },
    {
      title: 'Expenses',
      icon: require('../assets/payment.png'),
      screen: 'Manage Expenses',
    },
  ];

  const renderStatCard = (item: StatItem, index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.card, {backgroundColor: backgroundColors.light}]}
      onPress={() => {
        navigation.navigate(item.screen as never);
      }}>
      <View style={[styles.iconContainer]}>
        <Image source={item.icon} style={styles.cardIcon} />
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
          <View>
            <Text style={styles.posText}>CapoBiz POS</Text>
            <Text style={styles.posSubText}>Includes all POS features</Text>
          </View>
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
    backgroundColor: backgroundColors.gray,
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
  posText: {
    fontSize: 22,
    fontWeight: '900',
    color: backgroundColors.light,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 5,
  },
  posSubText: {
    fontSize: 16,
    fontWeight: '600',
    color: backgroundColors.light,
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 5,
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
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,1)',
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
    marginTop: '28%',
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
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    width: 36,
    height: 36,
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
