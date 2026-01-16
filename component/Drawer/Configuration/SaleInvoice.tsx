import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  BackHandler,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from '../../BottomBar';

const {width} = Dimensions.get('window');

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  primarySoft: 'rgba(42, 101, 43, 0.1)',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  accent: '#4CAF50',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textDark: '#1F2937',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  danger: '#EF4444',
  border: '#E5E7EB',
  rowHover: '#F9FAFB',
};

export default function SaleInvoice({navigation}: any) {
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
  useEffect(() => {
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

  // Custom Radio Button Component
  const CustomRadioButton = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.radioOption, selected && styles.selectedOption]}
      activeOpacity={0.7}>
      <View
        style={[styles.radioCircle, selected && {borderColor: THEME.primary}]}>
        {selected && <View style={styles.radioInnerCircle} />}
      </View>
      <Text style={[styles.radioText, selected && styles.selectedText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Custom Checkbox Component
  const CustomCheckbox = ({
    label,
    checked,
    onPress,
  }: {
    label: string;
    checked: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.checkboxOption, checked && styles.selectedOption]}
      activeOpacity={0.7}>
      <View
        style={[
          styles.checkboxBox,
          checked && {
            backgroundColor: THEME.primary,
            borderColor: THEME.primary,
          },
        ]}>
        {checked && <Icon name="check" size={14} color="white" />}
      </View>
      <Text style={[styles.checkboxText, checked && styles.selectedText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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
            <Text style={styles.headerTitle}>Configure Sale Invoice</Text>
            <View style={{width: 40}} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}>
        {/* Invoice Language Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconBox}>
              <Icon name="translate" size={20} color={THEME.primary} />
            </View>
            <Text style={styles.sectionTitle}>Invoice Language</Text>
          </View>

          <View style={styles.radioGroup}>
            <CustomRadioButton
              label="English"
              selected={selectedLang === 'English'}
              onPress={() => setSelectedLang('English')}
            />
            <CustomRadioButton
              label="Urdu"
              selected={selectedLang === 'Urdu'}
              onPress={() => setSelectedLang('Urdu')}
            />
          </View>
        </View>

        {/* Make Fields Editable Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconBox}>
              <Icon
                name="pencil-box-multiple"
                size={20}
                color={THEME.primary}
              />
            </View>
            <Text style={styles.sectionTitle}>Make Fields Editable</Text>
          </View>

          <View style={styles.checkboxGroup}>
            <CustomCheckbox
              label="Quantity"
              checked={selectedOptions.includes('qty_pos')}
              onPress={() => {
                const newOptions = selectedOptions.includes('qty_pos')
                  ? selectedOptions.filter(opt => opt !== 'qty_pos')
                  : [...selectedOptions, 'qty_pos'];
                setSelectedOptions(newOptions);
              }}
            />
            <CustomCheckbox
              label="Unit Price"
              checked={selectedOptions.includes('price_pos')}
              onPress={() => {
                const newOptions = selectedOptions.includes('price_pos')
                  ? selectedOptions.filter(opt => opt !== 'price_pos')
                  : [...selectedOptions, 'price_pos'];
                setSelectedOptions(newOptions);
              }}
            />
          </View>
        </View>

        {/* Invoice Size Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconBox}>
              <Icon name="format-size" size={20} color={THEME.primary} />
            </View>
            <Text style={styles.sectionTitle}>Invoice Size</Text>
          </View>

          <View style={styles.radioGroup}>
            <CustomRadioButton
              label="A4"
              selected={invoiceSize === 'A4'}
              onPress={() => setInvoiceSize('A4')}
            />
            <CustomRadioButton
              label="A5"
              selected={invoiceSize === 'A5'}
              onPress={() => setInvoiceSize('A5')}
            />
            <CustomRadioButton
              label="Receipt"
              selected={invoiceSize === 'receipt'}
              onPress={() => setInvoiceSize('receipt')}
            />
          </View>
        </View>

        {/* Show Builty Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconBox}>
              <Icon name="file-document" size={20} color={THEME.primary} />
            </View>
            <Text style={styles.sectionTitle}>Show Builty Section</Text>
          </View>

          <View style={styles.radioGroup}>
            <CustomRadioButton
              label="Yes"
              selected={showBuilty === 'Y'}
              onPress={() => setShowBuilty('Y')}
            />
            <CustomRadioButton
              label="No"
              selected={showBuilty === 'N'}
              onPress={() => setShowBuilty('N')}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleAddInvoice}
          activeOpacity={0.8}>
          <LinearGradient
            colors={[THEME.gradientStart, THEME.gradientEnd]}
            style={styles.saveButtonGradient}>
            <Icon name="content-save" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={{height: 20}} />
      </ScrollView>
      <Toast />
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
    marginBottom: 10,
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

  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.background,
  },
  selectedOption: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primaryLight,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME.textGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.primary,
  },
  radioText: {
    fontSize: 14,
    color: THEME.textGray,
    fontWeight: '600',
  },
  selectedText: {
    color: THEME.primary,
    fontWeight: '700',
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.background,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: THEME.textGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxText: {
    fontSize: 14,
    color: THEME.textGray,
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 12,
    marginTop: 10,
    shadowColor: THEME.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  saveButtonText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
