import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Switch,
  StatusBar,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  BackHandler,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Keychain from 'react-native-keychain';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import BottomBar from '../../BottomBar';
import {useDrawer} from '../../DrawerContext';

const {width} = Dimensions.get('window');

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textDark: '#1F2937',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  danger: '#EF4444',
  success: '#10B981',
};

export default function BiometricScreen() {
  const navigation = useNavigation();
  const {openDrawer} = useDrawer();

  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Refined Error State
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkBiometricStatus();

    const backAction = () => {
      navigation.navigate('Dashboard' as never);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const checkBiometricStatus = async () => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        setIsBiometricEnabled(true);
      }
    } catch (error) {
      console.error('Error checking biometric status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleToggleChanged = (value: boolean) => {
    if (value) {
      setShowVerification(true);
      setIsBiometricEnabled(true);
    } else {
      // Disable biometric login
      disableBiometrics();
    }
  };

  const disableBiometrics = async () => {
    try {
      await Keychain.resetGenericPassword();
      setIsBiometricEnabled(false);
      setShowVerification(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Biometric login disabled.',
      });
    } catch (error) {
      console.error('Error disabling biometrics:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to disable biometric login.',
      });
    }
  };

  const handleEnableBiometrics = async () => {
    let hasError = false;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/userlogin`, {
        email: email,
        password: password,
      });

      if (response.status === 200 && response.data.status === 200) {
        // Correct credentials, save to keychain
        await Keychain.setGenericPassword(email, password, {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        });

        setIsBiometricEnabled(true);
        setShowVerification(false);
        setEmail('');
        setPassword('');

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Biometric login enabled successfully!',
        });
      } else {
        setErrorMessage(
          'Invalid email or password. Please check your credentials and try again.',
        );
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error('Error enabling biometrics:', error);
      setErrorMessage(
        error.response?.data?.message ||
          'Authentication failed. Please check your internet connection and try again.',
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Biometric Settings</Text>
            <View style={{width: 40}} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{paddingBottom: 100}}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Icon name="fingerprint" size={28} color={THEME.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Biometric Login</Text>
              <Text style={styles.subtitle}>
                Enable fingerprint or FaceID for quick access
              </Text>
            </View>
            <Switch
              trackColor={{false: '#D1D5DB', true: THEME.primaryLight}}
              thumbColor={isBiometricEnabled ? THEME.primary : '#F3F4F6'}
              ios_backgroundColor="#D1D5DB"
              onValueChange={handleToggleChanged}
              value={isBiometricEnabled}
            />
          </View>

          {showVerification && (
            <View style={styles.verificationSection}>
              <View style={styles.divider} />
              <Text style={styles.verificationTitle}>Verify Your Account</Text>
              <Text style={styles.verificationSubtitle}>
                Please enter your email and password to enable biometric login.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    emailError ? styles.inputError : null,
                  ]}>
                  <Icon
                    name="email-outline"
                    size={20}
                    color={emailError ? THEME.danger : THEME.textGray}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={THEME.textLight}
                    value={email}
                    onChangeText={text => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    passwordError ? styles.inputError : null,
                  ]}>
                  <Icon
                    name="lock-outline"
                    size={20}
                    color={passwordError ? THEME.danger : THEME.textGray}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={THEME.textLight}
                    secureTextEntry
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                  />
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.enableBtn}
                onPress={handleEnableBiometrics}
                disabled={loading}>
                <LinearGradient
                  colors={[THEME.gradientStart, THEME.gradientEnd]}
                  style={styles.btnGradient}>
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Icon
                        name="shield-check-outline"
                        size={20}
                        color="white"
                      />
                      <Text style={styles.btnText}>Verify & Enable</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowVerification(false);
                  setIsBiometricEnabled(false);
                }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Icon
            name="information-outline"
            size={24}
            color={THEME.primary}
            style={{marginRight: 12}}
          />
          <Text style={styles.infoText}>
            Your credentials are stored securely in your device's keychain and
            are only used for biometric authentication.
          </Text>
        </View>
      </ScrollView>

      <BottomBar />
      <Toast />

      {/* --- Error Modal --- */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.errorIconContainer}>
              <Icon name="alert-circle" size={32} color={THEME.danger} />
            </View>
            <Text style={styles.modalTitle}>Verification Failed</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowErrorModal(false)}>
              <Text style={styles.modalButtonText}>Try Again</Text>
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
    backgroundColor: THEME.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerWrapper: {
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.textGray,
    marginTop: 2,
  },
  verificationSection: {
    marginTop: 20,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.border,
    marginBottom: 20,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 14,
    color: THEME.textGray,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: THEME.textDark,
  },
  enableBtn: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: THEME.textGray,
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: THEME.primaryLight,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: THEME.primary,
    lineHeight: 18,
    fontWeight: '500',
  },
  // Refined Error Styles
  inputError: {
    borderColor: THEME.danger,
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: THEME.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: THEME.white,
    width: width * 0.85,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
  },
  errorIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#FEE2E2',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.textDark,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: THEME.textGray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: THEME.danger,
    paddingVertical: 12,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: THEME.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
