import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useUser} from '../../CTX/UserContext';

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
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <ScrollView
          style={{
            marginBottom: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 5,
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity onPress={openDrawer}>
              <Image
                source={require('../../../assets/menu.png')}
                style={{width: 30, height: 30, tintColor: 'white'}}
              />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 22,
                  fontWeight: 'bold',
                }}>
                Cash Close
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white', fontWeight: 'bold'}]}>User:</Text>
              <Text style={[{color: 'white'}]}>{userName ?? ''}</Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white', fontWeight: 'bold'}]}>
                Cash In Hand:
              </Text>
              <Text style={[{color: 'white'}]}>
                {cashClose?.cash_in_hand ?? '0.00'}
              </Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white', fontWeight: 'bold'}]}>
                Total Sales:
              </Text>
              <Text style={[{color: 'white'}]}>
                {cashClose?.sales_total ?? '0.00'}
              </Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white', fontWeight: 'bold'}]}>
                Total Return:
              </Text>
              <Text style={[{color: 'white'}]}>
                {cashClose?.return_amount ?? '0.00'}
              </Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white', fontWeight: 'bold'}]}>
                Closing Amount:
              </Text>
              <Text style={[{color: 'white'}]}>
                {cashClose?.closing_amount ?? '0.00'}
              </Text>
            </View>

            <TouchableOpacity onPress={cashRegister}>
              <View
                style={{
                  width: '100%',
                  height: 38,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  marginTop: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#144272',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  Close
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    borderColor: 'white',
    height: 'auto',
    borderRadius: 12,
    elevation: 15,
    marginBottom: -13,
    padding: 10,
    justifyContent: 'center',
  },
  inputSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
