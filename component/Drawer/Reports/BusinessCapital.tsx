import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useState} from 'react';
import Modal from 'react-native-modal';

export default function BusinessCapital() {
  const {openDrawer} = useDrawer();
  const [btnproduct, setbtnproduct] = useState(false);

  const togglebtnproduct = () => {
    setbtnproduct(!btnproduct);
  };
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
              <Text style={[{color: 'white'}]}>0000</Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>Cash In Hand:</Text>
              <Text style={[{color: 'white'}]}>0000</Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={{color: 'white'}}>Customer Receivables:</Text>
              <Text style={[{color: 'white'}]}>0000</Text>
            </View>

            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>Customer Payables:</Text>{' '}
              <Text style={[{color: 'white'}]}>0000</Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>Supplier Receivables:</Text>
              <Text style={[{color: 'white'}]}>0000</Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>Supplier Payables:</Text>
              <Text style={[{color: 'white'}]}>0000</Text>
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
              <Text style={[{color: '#144272', fontWeight: 'bold'}]}>0000</Text>
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
