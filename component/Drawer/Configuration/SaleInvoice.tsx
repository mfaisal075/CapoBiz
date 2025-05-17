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
import {RadioButton, Checkbox} from 'react-native-paper';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';

export default function SaleInvoice() {
  const {openDrawer} = useDrawer();
  const [selectedLang, setSelectedLang] = useState<'English' | 'Urdu'>(
    'English',
  );
  const [invoiceSize, setInvoiceSize] = useState<'A4' | 'A5' | 'receipt'>('A4');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showBuilty, setShowBuilty] = useState<'Y' | 'N'>('N');

  const handleAddInvoice = async () => {
    const payload = {
      inv_language: selectedLang,
      size: invoiceSize,
      builtysection: showBuilty,
      ...(selectedOptions.includes('qty_pos') && {qty_pos: 'qty_pos'}),
      ...(selectedOptions.includes('price_pos') && {price_pos: 'price_pos'}),
    };

    try {
      const res = await axios.post(`${BASE_URL}/addinvoicematerial`, payload);

      const data = res.data;
      console.log('Response: ', data);

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Configuration has been saved successfully',
          visibilityTime: 1500,
        });

        setSelectedOptions([]);
        setShowBuilty('N');
        setInvoiceSize('A4');
        setSelectedLang('English');
      }
    } catch (error) {
      console.log(error);
    }
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
          <RadioButton.Group
            onValueChange={value => {
              setSelectedLang(value as 'English' | 'Urdu');
            }}
            value={selectedLang}>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                onPress={() => setSelectedLang('English')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 20,
                }}
                activeOpacity={0.7}>
                <RadioButton.Android
                  value="English"
                  color="#D0F4DE"
                  uncheckedColor="white"
                />
                <Text style={{color: 'white', marginLeft: 8}}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedLang('Urdu')}
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <RadioButton.Android
                  value="Urdu"
                  color="#D0F4DE"
                  uncheckedColor="white"
                />
                <Text style={{color: 'white', marginLeft: 8}}>Urdu</Text>
              </TouchableOpacity>
            </View>
          </RadioButton.Group>
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
        <View
          style={[
            styles.row,
            {marginLeft: 7, marginRight: 10, justifyContent: 'flex-start'},
          ]}>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            activeOpacity={0.7}
            onPress={() => {
              const newOptions = selectedOptions.includes('qty_pos')
                ? selectedOptions.filter(opt => opt !== 'qty_pos')
                : [...selectedOptions, 'qty_pos'];
              setSelectedOptions(newOptions);
            }}>
            <Checkbox.Android
              status={
                selectedOptions.includes('qty_pos') ? 'checked' : 'unchecked'
              }
              color="#D0F4DE"
              uncheckedColor="white"
            />
            <Text style={{color: 'white', marginLeft: 8}}>Quantity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', marginLeft: 20}}
            activeOpacity={0.7}
            onPress={() => {
              const newOptions = selectedOptions.includes('price_pos')
                ? selectedOptions.filter(opt => opt !== 'price_pos')
                : [...selectedOptions, 'price_pos'];
              setSelectedOptions(newOptions);
            }}>
            <Checkbox.Android
              status={
                selectedOptions.includes('price_pos') ? 'checked' : 'unchecked'
              }
              color="#D0F4DE"
              uncheckedColor="white"
            />
            <Text style={{color: 'white', marginLeft: 8}}>Unit Price</Text>
          </TouchableOpacity>
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
          <RadioButton.Group
            onValueChange={value => {
              setInvoiceSize(value as 'A4' | 'A5' | 'receipt');
            }}
            value={invoiceSize}>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                onPress={() => setInvoiceSize('A4')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 20,
                }}>
                <RadioButton.Android
                  value="A4"
                  color="#D0F4DE"
                  uncheckedColor="white"
                />
                <Text style={{color: 'white', marginLeft: 8}}>A4</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setInvoiceSize('A5')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 20,
                }}>
                <RadioButton.Android
                  value="A5"
                  color="#D0F4DE"
                  uncheckedColor="white"
                />
                <Text style={{color: 'white', marginLeft: 8}}>A5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setInvoiceSize('receipt')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 20,
                }}>
                <RadioButton.Android
                  value="receipt"
                  color="#D0F4DE"
                  uncheckedColor="white"
                />
                <Text style={{color: 'white', marginLeft: 8}}>
                  Receipt Size
                </Text>
              </TouchableOpacity>
            </View>
          </RadioButton.Group>
        </View>

        <Text
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 18,

            marginTop: 10,
            marginLeft: 15,
          }}>
          Show Builty Section
        </Text>
        <RadioButton.Group
          onValueChange={value => setShowBuilty(value as 'Y' | 'N')}
          value={showBuilty}>
          <View style={{marginLeft: 7, flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={() => setShowBuilty('Y')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 20,
              }}>
              <RadioButton.Android
                value="Y"
                color="#D0F4DE"
                uncheckedColor="white"
              />
              <Text style={{color: 'white', marginLeft: 8}}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowBuilty('N')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 20,
              }}>
              <RadioButton.Android
                value="N"
                color="#D0F4DE"
                uncheckedColor="white"
              />
              <Text style={{color: 'white', marginLeft: 8}}>No</Text>
            </TouchableOpacity>
          </View>
        </RadioButton.Group>

        <TouchableOpacity onPress={() => handleAddInvoice()}>
          <View
            style={{
              backgroundColor: 'white',
              height: 30,
              width: 295,
              marginTop: 10,
              borderRadius: 10,
              marginLeft: 15,
              justifyContent: 'center',
              alignSelf: 'center',
            }}>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
                fontWeight: 'bold',
              }}>
              Save
            </Text>
          </View>
        </TouchableOpacity>
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
