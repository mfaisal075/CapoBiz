import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Image,
  BackHandler,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
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

interface ResetPassword {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initialResetPassword: ResetPassword = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function PasswordReset() {
  const navigation = useNavigation();
  const {openDrawer} = useDrawer();
  const [from, setForm] = useState<ResetPassword>(initialResetPassword);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onChange = (field: keyof ResetPassword, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetPassword = async () => {
    if (!from.oldPassword || !from.newPassword || !from.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'All fields are required!',
        visibilityTime: 2500,
      });
      return;
    }

    if (from.newPassword !== from.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'New password and confirm password do not match!',
        visibilityTime: 2500,
      });
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/updatepassword`, {
        password: from.newPassword,
      });

      const data = response.data;

      console.log('Response: ', data);

      if (response.status == 200 && data.status) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Password has been Updated successfully!',
        });

        setForm(initialResetPassword);
        setIsModalVisible(true);
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update password. Please try again.',
        visibilityTime: 2500,
      });
    }
  };

  useEffect(() => {
    const backKey = () => {
      navigation.navigate('Dashboard' as never);
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
            <Text style={styles.headerTitle}>Password Reset</Text>
            <View style={{width: 40}} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Header Section */}
          <View style={styles.headerRow}>
            <View style={styles.avatarBox}>
              <Icon name="lock-reset" size={28} color={THEME.primary} />
            </View>
            <View style={styles.headerTxtContainer}>
              <Text style={styles.productName}>Reset Your Password</Text>
              <Text style={styles.subText}>
                Enter your current and new password
              </Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.infoBox}>
            <View style={styles.inputContainer}>
              <Text style={styles.labelText}>Current Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholderTextColor={THEME.textLight}
                  placeholder="Enter current password"
                  secureTextEntry
                  value={from.oldPassword}
                  onChangeText={text => onChange('oldPassword', text)}
                />
                <Icon
                  name="lock-outline"
                  size={20}
                  color={THEME.textGray}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.labelText}>New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholderTextColor={THEME.textLight}
                  placeholder="Enter new password"
                  secureTextEntry
                  value={from.newPassword}
                  onChangeText={text => onChange('newPassword', text)}
                />
                <Icon
                  name="lock-plus"
                  size={20}
                  color={THEME.textGray}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.labelText}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholderTextColor={THEME.textLight}
                  placeholder="Confirm new password"
                  secureTextEntry
                  value={from.confirmPassword}
                  onChangeText={text => onChange('confirmPassword', text)}
                />
                <Icon
                  name="lock-check"
                  size={20}
                  color={THEME.textGray}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleResetPassword}>
              <LinearGradient
                colors={[THEME.gradientStart, THEME.gradientEnd]}
                style={styles.submitBtnGradient}>
                <Icon name="key-change" size={20} color="white" />
                <Text style={styles.submitText}>Update Password</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContainer}>
            <View style={styles.animContainer}>
              <LottieView
                style={{flex: 1}}
                source={require('../../../assets/success.json')}
                autoPlay
                loop={false}
              />
            </View>

            <Text style={styles.successModalTitle}>Password Updated!</Text>
            <Text style={styles.successModalMessage}>
              Your password has been updated successfully
            </Text>

            <View style={styles.successModalActions}>
              <TouchableOpacity
                style={[styles.successModalBtn, {backgroundColor: '#F3F4F6'}]}
                onPress={() => {
                  setTimeout(() => {
                    setIsModalVisible(false);
                    navigation.navigate('Login' as never);
                  }, 500);
                }}>
                <Text
                  style={[styles.successModalBtnText, {color: THEME.textDark}]}>
                  Close
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.successModalBtn,
                  {backgroundColor: THEME.primary},
                ]}
                onPress={() => {
                  setTimeout(() => {
                    setIsModalVisible(false);
                    navigation.navigate('Login' as never);
                  }, 500);
                }}>
                <Text style={[styles.successModalBtnText, {color: 'white'}]}>
                  Login Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

  // List Container
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // Card Styling
  card: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 20,
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTxtContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.textDark,
  },
  subText: {
    fontSize: 13,
    color: THEME.textGray,
    marginTop: 4,
  },

  // Info Box Styling
  infoBox: {
    backgroundColor: THEME.white,
  },
  inputContainer: {
    marginBottom: 10,
  },
  labelText: {
    fontSize: 14,
    color: THEME.textDark,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    backgroundColor: THEME.background,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.textDark,
  },
  inputIcon: {
    marginLeft: 8,
  },

  // Submit Button
  submitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: THEME.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Modal Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  successModalContainer: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  animContainer: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  successModalMessage: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  successModalActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 15,
  },
  successModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successModalBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
