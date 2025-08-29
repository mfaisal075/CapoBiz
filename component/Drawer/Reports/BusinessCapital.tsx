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

interface Capital {
  stockvalue: number;
  cashinhand: string;
  customerReceiveable: number;
  customerPayable: number;
  supplierReceiveable: number;
  supplierPayable: number;
  business_capital: number;
}

export default function BusinessCapital() {
  const {openDrawer} = useDrawer();
  const [capital, setCapital] = useState<Capital | null>(null);

  // Fetch Capital
  const fetchCapital = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchcapital`);
      setCapital(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCapital();
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
                Business Capital
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>Current Stock Value:</Text>
              <Text style={[{color: 'white'}]}>
                {capital?.stockvalue.toFixed(2) ?? '0.00'}
              </Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>Cash In Hand:</Text>
              <Text style={[{color: 'white'}]}>
                {capital?.cashinhand ?? '0.00'}
              </Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={{color: 'white'}}>Customer Receivables:</Text>
              <Text style={[{color: 'white'}]}>
                {capital?.customerReceiveable.toFixed(2) ?? '0.00'}
              </Text>
            </View>

            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>Customer Payables:</Text>
              <Text style={[{color: 'white'}]}>
                {capital?.customerPayable.toFixed(2) ?? '0.00'}
              </Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>Supplier Receivables:</Text>
              <Text style={[{color: 'white'}]}>
                {capital?.supplierReceiveable.toFixed(2) ?? '0.00'}
              </Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>Supplier Payables:</Text>
              <Text style={[{color: 'white'}]}>
                {capital?.supplierPayable.toFixed(2) ?? '0.00'}
              </Text>
            </View>

            <View style={[styles.inputSmall, {backgroundColor: 'white'}]}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#144272',

                  fontWeight: 'bold',
                  fontSize: 15,
                }}>
                Business Capital:
              </Text>
              <Text style={[{color: '#144272', fontWeight: 'bold'}]}>
                {capital?.business_capital.toFixed(2) ?? '0.00'}
              </Text>
            </View>
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
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    color: 'white',
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
  addButton: {
    marginLeft: 4,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    width: 100,
  },
});
