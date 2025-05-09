import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import {RadioButton} from 'react-native-paper';
import Modal from 'react-native-modal';

export default function SaleInvoice() {
  const {openDrawer} = useDrawer();

  const [Type, setType] = React.useState<'English' | 'string'>('English');

  const [Urdu, setUrdu] = React.useState<'Urdu' | 'Urdu'>('Urdu');

  const [Quantity, setQuantity] = React.useState<'Quantity' | 'Quantity'>(
    'Quantity',
  );

  const [UnitPrice, setUnitPrice] = React.useState<'UnitPrice' | 'UnitPrice'>(
    'UnitPrice',
  );

  const [ReceiptSize, setReceiptSize] = React.useState<
    'ReceiptSize' | 'ReceiptSize'
  >('ReceiptSize');

  const [A4, setA4] = React.useState<'A4' | 'A4'>('A4');

  const [A5, setA5] = React.useState<'A5' | 'A5'>('A5');

  const [btncustomeraditarea, setbtncustomereditarea] = useState(false);

  const togglebtncustomereditarea = () => {
    setbtncustomereditarea(!btncustomeraditarea);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
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
              style={{
                width: 30,
                height: 30,
                tintColor: 'white',
              }}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text
              style={{
                color: 'white',
                fontSize: 22,
                fontWeight: 'bold',
              }}>
              Sale Invoice
            </Text>
          </View>
        </View>

        <Text
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 18,
            marginLeft: 15,
            marginTop: 10,
          }}>
          Invoice Language
        </Text>
        <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
          <RadioButton
            value="English"
            status={Type === 'English' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => setType('English')}
          />
          <Text
            style={{
              color: 'white',
              marginTop: 7,
              marginLeft: -10,
            }}>
            English
          </Text>

          <RadioButton
            value="Urdu"
            status={Urdu === 'Urdu' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => setUrdu('Urdu')}
          />
          <Text
            style={{
              color: 'white',
              marginTop: 7,
              marginLeft: -10,
            }}>
            Urdu
          </Text>
        </View>

        <Text
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 18,
            marginLeft: 15,
            marginTop: 10,
          }}>
          Make Fields Editable
        </Text>
        <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
          <RadioButton
            value="Quantity"
            status={Quantity === 'Quantity' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => setQuantity('Quantity')}
          />
          <Text
            style={{
              color: 'white',
              marginTop: 7,
              marginLeft: -10,
            }}>
            Quantity
          </Text>

          <RadioButton
            value="UnitPrice"
            status={UnitPrice === 'UnitPrice' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => setUnitPrice('UnitPrice')}
          />
          <Text
            style={{
              color: 'white',
              marginTop: 7,
              marginLeft: -10,
            }}>
            Unit Price
          </Text>
        </View>

        <Text
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 18,
            marginLeft: 15,
            marginTop: 10,
          }}>
          Invoice Size
        </Text>
        <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
          <RadioButton
            value="A4"
            status={A4 === 'A4' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => setA4('A4')}
          />
          <Text
            style={{
              color: 'white',
              marginTop: 7,
              marginLeft: -10,
            }}>
            A4
          </Text>

          <RadioButton
            value="A5"
            status={A5 === 'A5' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => setA5('A5')}
          />
          <Text
            style={{
              color: 'white',
              marginTop: 7,
              marginLeft: -10,
            }}>
            A5
          </Text>

          <RadioButton
            value="ReceiptSize"
            status={ReceiptSize === 'ReceiptSize' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => setReceiptSize('ReceiptSize')}
          />
          <Text
            style={{
              color: 'white',
              marginTop: 7,
              marginLeft: -10,
            }}>
            Receipt Size
          </Text>
        </View>

        <Text
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 18,

            marginTop: 10,
            marginLeft: 15,
          }}>
          Invoice Logo
        </Text>
        <TouchableOpacity>
          <View
            style={[
              styles.row,
              {
                marginLeft: 11,
                backgroundColor: 'white',
                borderRadius: 10,
                width: 110,
              },
            ]}>
            <Text
              style={[
                styles.productinput,
                {color: '#144272', textAlign: 'center'},
              ]}>
              Choose Logo
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={togglebtncustomereditarea}>
          <View
            style={{
              backgroundColor: 'white',
              height: 30,
              width: 295,
              marginTop: 10,
              borderRadius: 10,
              marginLeft: 15,
              justifyContent: 'center',alignSelf:'center'
            }}>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Save
            </Text>
          </View>
        </TouchableOpacity>
        {/*btn*/}
        <Modal isVisible={btncustomeraditarea}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 230,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Added
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Configuration has been saved successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => setbtncustomereditarea(!btncustomeraditarea)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  productinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
