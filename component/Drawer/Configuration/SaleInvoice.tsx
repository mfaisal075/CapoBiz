import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import {RadioButton, Checkbox} from 'react-native-paper';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Configuration has been saved successfully',
          visibilityTime: 2000,
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Sale Invoice</Text>
          </View>

          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          {/* Invoice Language Section */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="translate" size={20} color="#144272" />
              <Text style={styles.sectionTitle}>Invoice Language</Text>
            </View>

            <RadioButton.Group
              onValueChange={value =>
                setSelectedLang(value as 'English' | 'Urdu')
              }
              value={selectedLang}>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  onPress={() => setSelectedLang('English')}
                  style={styles.radioOption}
                  activeOpacity={0.7}>
                  <RadioButton.Android
                    value="English"
                    color="#144272"
                    uncheckedColor="#666"
                  />
                  <Text style={styles.radioText}>English</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedLang('Urdu')}
                  style={styles.radioOption}
                  activeOpacity={0.7}>
                  <RadioButton.Android
                    value="Urdu"
                    color="#144272"
                    uncheckedColor="#666"
                  />
                  <Text style={styles.radioText}>Urdu</Text>
                </TouchableOpacity>
              </View>
            </RadioButton.Group>
          </View>

          {/* Make Fields Editable Section */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="pencil-box-multiple" size={20} color="#144272" />
              <Text style={styles.sectionTitle}>Make Fields Editable</Text>
            </View>

            <View style={styles.checkboxGroup}>
              <TouchableOpacity
                style={styles.checkboxOption}
                activeOpacity={0.7}
                onPress={() => {
                  const newOptions = selectedOptions.includes('qty_pos')
                    ? selectedOptions.filter(opt => opt !== 'qty_pos')
                    : [...selectedOptions, 'qty_pos'];
                  setSelectedOptions(newOptions);
                }}>
                <Checkbox.Android
                  status={
                    selectedOptions.includes('qty_pos')
                      ? 'checked'
                      : 'unchecked'
                  }
                  color="#144272"
                  uncheckedColor="#666"
                />
                <Text style={styles.checkboxText}>Quantity</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxOption}
                activeOpacity={0.7}
                onPress={() => {
                  const newOptions = selectedOptions.includes('price_pos')
                    ? selectedOptions.filter(opt => opt !== 'price_pos')
                    : [...selectedOptions, 'price_pos'];
                  setSelectedOptions(newOptions);
                }}>
                <Checkbox.Android
                  status={
                    selectedOptions.includes('price_pos')
                      ? 'checked'
                      : 'unchecked'
                  }
                  color="#144272"
                  uncheckedColor="#666"
                />
                <Text style={styles.checkboxText}>Unit Price</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Invoice Size Section */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="format-size" size={20} color="#144272" />
              <Text style={styles.sectionTitle}>Invoice Size</Text>
            </View>

            <RadioButton.Group
              onValueChange={value =>
                setInvoiceSize(value as 'A4' | 'A5' | 'receipt')
              }
              value={invoiceSize}>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  onPress={() => setInvoiceSize('A4')}
                  style={styles.radioOption}
                  activeOpacity={0.7}>
                  <RadioButton.Android
                    value="A4"
                    color="#144272"
                    uncheckedColor="#666"
                  />
                  <Text style={styles.radioText}>A4</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setInvoiceSize('A5')}
                  style={styles.radioOption}
                  activeOpacity={0.7}>
                  <RadioButton.Android
                    value="A5"
                    color="#144272"
                    uncheckedColor="#666"
                  />
                  <Text style={styles.radioText}>A5</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setInvoiceSize('receipt')}
                  style={styles.radioOption}
                  activeOpacity={0.7}>
                  <RadioButton.Android
                    value="receipt"
                    color="#144272"
                    uncheckedColor="#666"
                  />
                  <Text style={styles.radioText}>Receipt Size</Text>
                </TouchableOpacity>
              </View>
            </RadioButton.Group>
          </View>

          {/* Show Builty Section */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="file-document" size={20} color="#144272" />
              <Text style={styles.sectionTitle}>Show Builty Section</Text>
            </View>

            <RadioButton.Group
              onValueChange={value => setShowBuilty(value as 'Y' | 'N')}
              value={showBuilty}>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  onPress={() => setShowBuilty('Y')}
                  style={styles.radioOption}
                  activeOpacity={0.7}>
                  <RadioButton.Android
                    value="Y"
                    color="#144272"
                    uncheckedColor="#666"
                  />
                  <Text style={styles.radioText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowBuilty('N')}
                  style={styles.radioOption}
                  activeOpacity={0.7}>
                  <RadioButton.Android
                    value="N"
                    color="#144272"
                    uncheckedColor="#666"
                  />
                  <Text style={styles.radioText}>No</Text>
                </TouchableOpacity>
              </View>
            </RadioButton.Group>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleAddInvoice}
            activeOpacity={0.8}>
            <Icon name="content-save" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          </TouchableOpacity>
        </ScrollView>
        <Toast />
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#144272',
    marginLeft: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 5,
  },
  radioText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 5,
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#144272',
    borderRadius: 12,
    paddingVertical: 15,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
