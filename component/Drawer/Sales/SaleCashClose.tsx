import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import backgroundColors from '../../Colors';
import LottieView from 'lottie-react-native';

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
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Cash Close</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Cash Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cash Summary</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelContainer}>
                  <Icon
                    name="person"
                    size={20}
                    color={backgroundColors.dark}
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>User:</Text>
                </View>
                <Text style={styles.summaryValue}>{userName ?? 'N/A'}</Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelContainer}>
                  <Icon
                    name="account-balance-wallet"
                    size={20}
                    color={backgroundColors.dark}
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Cash In Hand:</Text>
                </View>
                <Text style={styles.summaryValue}>
                  {cashClose?.cash_in_hand ?? '0.00'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelContainer}>
                  <Icon
                    name="trending-up"
                    size={20}
                    color={backgroundColors.dark}
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Total Sales:</Text>
                </View>
                <Text style={styles.summaryValue}>
                  {cashClose?.sales_total ?? '0.00'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelContainer}>
                  <Icon
                    name="trending-down"
                    size={20}
                    color={backgroundColors.dark}
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Total Return:</Text>
                </View>
                <Text style={styles.summaryValue}>
                  {cashClose?.return_amount ?? '0.00'}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <View style={styles.summaryLabelContainer}>
                  <Icon
                    name="account-balance"
                    size={20}
                    color={backgroundColors.primary}
                    style={styles.summaryIcon}
                  />
                  <Text style={[styles.summaryLabel, styles.totalLabel]}>
                    Closing Amount:
                  </Text>
                </View>
                <Text style={[styles.summaryValue, styles.totalValue]}>
                  {cashClose?.closing_amount ?? '0.00'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={cashRegister}>
              <Icon name="lock" size={20} color="white" />
              <Text style={styles.closeButtonText}>Close Register</Text>
            </TouchableOpacity>
          </View>

          <View style={{height: 100}} />
        </ScrollView>

        <Toast />
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: backgroundColors.primary,
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  menuIcon: {
    width: 28,
    height: 28,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  section: {
    backgroundColor: backgroundColors.light,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginVertical: 8,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: backgroundColors.dark,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryLabel: {
    color: backgroundColors.dark,
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    color: backgroundColors.dark,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.2)',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    color: backgroundColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: backgroundColors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    shadowColor: backgroundColors.dark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonText: {
    color: backgroundColors.light,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: backgroundColors.light,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '95%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  warningAnimation: {
    width: 150,
    height: 150,
  },
  warningTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: backgroundColors.danger,
    marginTop: 10,
    marginBottom: 8,
  },
  warningMessage: {
    fontSize: 16,
    color: backgroundColors.dark,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
    lineHeight: 22,
  },
  okButton: {
    backgroundColor: backgroundColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 120,
  },
  okButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
