import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../../Colors';

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

  // Fetch Cash close
  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/poscashregister`);
      setCashClose(res.data);
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[backgroundColors.primary, backgroundColors.secondary]}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Cash Close</Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: 'transparent'}]}
            onPress={() => {}}
            disabled>
            <Icon name="account-balance-wallet" size={24} color="transparent" />
          </TouchableOpacity>
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
                    color="#fff"
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
                    color="#fff"
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Cash In Hand:</Text>
                </View>
                <Text style={styles.summaryValue}>
                  PKR {cashClose?.cash_in_hand ?? '0.00'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelContainer}>
                  <Icon
                    name="trending-up"
                    size={20}
                    color="#fff"
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Total Sales:</Text>
                </View>
                <Text style={styles.summaryValue}>
                  PKR {cashClose?.sales_total ?? '0.00'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelContainer}>
                  <Icon
                    name="trending-down"
                    size={20}
                    color="#fff"
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Total Return:</Text>
                </View>
                <Text style={styles.summaryValue}>
                  PKR {cashClose?.return_amount ?? '0.00'}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <View style={styles.summaryLabelContainer}>
                  <Icon
                    name="account-balance"
                    size={20}
                    color="#4CAF50"
                    style={styles.summaryIcon}
                  />
                  <Text style={[styles.summaryLabel, styles.totalLabel]}>
                    Closing Amount:
                  </Text>
                </View>
                <Text style={[styles.summaryValue, styles.totalValue]}>
                  PKR {cashClose?.closing_amount ?? '0.00'}
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
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: 'rgba(15, 45, 78, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
