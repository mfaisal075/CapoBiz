import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  StatusBar,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import {BackHandler} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../../Colors';
import BottomBar from '../../BottomBar';

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F0F2F5',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  shadow: '#000',
};

interface CashClose {
  sales_total: string;
  cash_in_hand: string;
  closing_amount: string;
  cheque_total: number;
  return_amount: string;
}

export default function SaleCashClose({navigation}: any) {
  const {userName} = useUser();
  const {openDrawer} = useDrawer();
  const [cashClose, setCashClose] = useState<CashClose | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Fetch Cash close
  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/poscashregister`);
      setCashClose(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Check Cash Close
  const checkCashClose = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/chkclose`);
      if (res.data.status === 404) {
        setShowWarningModal(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const cashRegister = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/closeregister`, {
        user: userName,
        cash_in_hand: cashClose?.cash_in_hand,
        total_sales: cashClose?.sales_total,
        total_cheques: cashClose?.cheque_total,
        total_return: cashClose?.return_amount,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Cash register has been close successfully!',
          visibilityTime: 1500,
        });
      }
      navigation.navigate('Dashboard');
    } catch (error) {
      console.log(error);
    }
  };

  const handleWarningOk = () => {
    setShowWarningModal(false);
    navigation.navigate('Dashboard');
  };

  useEffect(() => {
    checkCashClose();
    fetchData();

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
            <Text style={styles.headerTitle}>Cash Close</Text>
            <View style={{width: 40}} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Cash Summary Section */}
        <View style={styles.contentContainer}>
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Icon name="point-of-sale" size={32} color={THEME.primary} />
              <Text style={styles.cardTitle}>Register Summary</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.labelContainer}>
                <View style={[styles.iconBox, {backgroundColor: '#E3F2FD'}]}>
                  <Icon name="person" size={18} color="#1565C0" />
                </View>
                <Text style={styles.detailLabel}>User</Text>
              </View>
              <Text style={styles.detailValue}>{userName ?? 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.labelContainer}>
                <View style={[styles.iconBox, {backgroundColor: '#FFF3E0'}]}>
                  <Icon
                    name="account-balance-wallet"
                    size={18}
                    color="#EF6C00"
                  />
                </View>
                <Text style={styles.detailLabel}>Cash In Hand</Text>
              </View>
              <Text style={styles.detailValue}>
                {cashClose?.cash_in_hand ?? '0.00'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.labelContainer}>
                <View style={[styles.iconBox, {backgroundColor: '#E8F5E9'}]}>
                  <Icon name="trending-up" size={18} color="#2E7D32" />
                </View>
                <Text style={styles.detailLabel}>Total Sales</Text>
              </View>
              <Text style={styles.detailValue}>
                {cashClose?.sales_total ?? '0.00'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.labelContainer}>
                <View style={[styles.iconBox, {backgroundColor: '#FFEBEE'}]}>
                  <Icon name="trending-down" size={18} color="#C62828" />
                </View>
                <Text style={styles.detailLabel}>Total Return</Text>
              </View>
              <Text style={styles.detailValue}>
                {cashClose?.return_amount ?? '0.00'}
              </Text>
            </View>

            <View style={styles.totalBlock}>
              <Text style={styles.totalLabel}>Closing Amount</Text>
              <Text style={styles.totalValue}>
                {cashClose?.closing_amount ?? '0.00'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={cashRegister}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[THEME.gradientStart, THEME.gradientEnd]}
              style={styles.actionBtnGradient}>
              <Icon name="lock" size={20} color={THEME.white} />
              <Text style={styles.actionBtnText}>Close Register</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      <Toast />

      {/* Warning Modal */}
      <Modal
        visible={showWarningModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleWarningOk}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LottieView
              source={require('../../../assets/warning.json')}
              autoPlay
              loop={false}
              style={styles.warningAnimation}
            />
            <Text style={styles.warningTitle}>Warning!</Text>
            <Text style={styles.warningMessage}>
              Cash register has not been opened yet!
            </Text>
            <TouchableOpacity style={styles.okButton} onPress={handleWarningOk}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 0,
    zIndex: 1,
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

  // --- Content ---
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textGray,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
  },
  totalBlock: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#F3F4F6',
    borderStyle: 'dashed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textDark,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.primary,
  },

  // --- Action Button ---
  actionBtn: {
    borderRadius: 16,
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
  },
  actionBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },

  // --- Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: '85%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  warningAnimation: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.danger,
    marginBottom: 10,
  },
  warningMessage: {
    fontSize: 16,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
    fontWeight: '500',
  },
  okButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 2,
  },
  okButtonText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
