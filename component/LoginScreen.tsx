import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Keychain from 'react-native-keychain';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import BASE_URL from './BASE_URL';

const {width, height} = Dimensions.get('window');

// --- Theme Constants (Green Palette) ---
const COLORS = {
  primary: '#2A652B', // Green from Splash
  primaryDark: '#2A652B',
  background: '#57B959', // Overall background matches primary
  white: '#FFFFFF',
  inputBg: '#F3F4F6',
  text: '#1F2937',
  textLight: '#9CA3AF',
  error: '#EF4444',
};

const LoginScreen = () => {
  const navigation = useNavigation();

  // --- State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // --- Animation Values ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  // --- Animation Effect ---
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Username and Password are required.');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/userlogin`, {
        email: email, // Changed from user_name to email as per original Login logic
        password,
      });

      const data = response.data;

      // CSRF handling
      const xsrfToken = response.headers['set-cookie']
        ?.find(cookie => cookie.includes('XSRF-TOKEN'))
        ?.split('=')[1]
        ?.split(';')[0];

      if (xsrfToken) {
        axios.defaults.headers.common['X-XSRF-TOKEN'] = xsrfToken;
      }

      if (response.status === 200 && data.status === 200) {
        // Success
        navigation.reset({
          index: 0,
          routes: [{name: 'Dashboard'}],
        } as any);

        // Save credentials securely
        try {
          await Keychain.setGenericPassword(email, password, {
            accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
          });
        } catch (keychainError) {
          console.warn('Could not save credentials to keychain', keychainError);
        }
      } else {
        setErrorMessage('Invalid credentials or login failed.');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error(error);
      let errorMsg = 'An error occurred. Please try again.';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setLoading(true);
      const credentials = await Keychain.getGenericPassword();

      if (credentials) {
        setEmail(credentials.username);
        setPassword(credentials.password);

        // Auto-login with retrieved credentials
        const response = await axios.post(`${BASE_URL}/userlogin`, {
          email: credentials.username,
          password: credentials.password,
        });

        const data = response.data;
        const xsrfToken = response.headers['set-cookie']
          ?.find(cookie => cookie.includes('XSRF-TOKEN'))
          ?.split('=')[1]
          ?.split(';')[0];

        if (xsrfToken) {
          axios.defaults.headers.common['X-XSRF-TOKEN'] = xsrfToken;
        }

        if (response.status === 200 && data.status === 200) {
          navigation.reset({
            index: 0,
            routes: [{name: 'Dashboard'}],
          } as any);
        } else {
          setErrorMessage(
            'Biometric authentication was successful but login failed. Please ensure your credentials are up to date in Biometric Settings.',
          );
          setShowErrorModal(true);
        }
      } else {
        setErrorMessage(
          'Biometric login is not enabled. Please enable it from: Sidebar > Configuration > Biometric',
        );
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error('Biometric login error:', error);
      // Don't show modal for user cancellation
      if (error.message && error.message.indexOf('User canceled') === -1) {
        setErrorMessage('Biometric authentication failed or was cancelled.');
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* --- Background Decor (Circles) --- */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <View style={styles.scrollContent}>
          {/* --- Top Section: Logo --- */}
          <Animated.View style={[styles.logoSection, {opacity: logoAnim}]}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* --- Center Card: Login Form --- */}
          <Animated.View
            style={[
              styles.centerCard,
              {
                opacity: fadeAnim,
                transform: [{translateY: slideAnim}],
              },
            ]}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Welcome Back!</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to your account
              </Text>
            </View>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>USERNAME</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'email' && styles.inputFocused,
                ]}>
                <Icon
                  name="person-outline"
                  size={20}
                  color={
                    focusedInput === 'email'
                      ? COLORS.primaryDark
                      : COLORS.textLight
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Email"
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'pass' && styles.inputFocused,
                ]}>
                <Icon
                  name="lock-closed-outline"
                  size={20}
                  color={
                    focusedInput === 'pass'
                      ? COLORS.primaryDark
                      : COLORS.textLight
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput('pass')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}>
                  <Icon
                    name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textLight}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer Links */}
            <View style={styles.footerLinks}>
              <TouchableOpacity style={styles.rememberMe}>
                <View style={styles.checkbox} />
                <Text style={styles.footerText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={loading}>
              {loading ? (
                <Text style={styles.loginButtonText}>LOGGING IN...</Text>
              ) : (
                <Text style={styles.loginButtonText}>LOGIN</Text>
              )}
            </TouchableOpacity>

            {/* Biometric / Divider (Visual Only) */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <TouchableOpacity
                style={styles.biometricBtn}
                onPress={handleBiometricLogin}
                disabled={loading}>
                <Icon
                  name="finger-print-outline"
                  size={24}
                  color={COLORS.primaryDark}
                />
              </TouchableOpacity>
              <View style={styles.dividerLine} />
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      {/* --- Error Modal --- */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.errorIconContainer}>
              <Icon name="alert-circle" size={32} color={COLORS.error} />
            </View>
            <Text style={styles.modalTitle}>Login Failed</Text>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowErrorModal(false)}>
              <Text style={styles.modalButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  // Background Decor
  bgCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bgCircle2: {
    position: 'absolute',
    top: height * 0.15,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '150%', // Adjusted for CapoBiz logo
    height: '150%',
    tintColor: COLORS.white, // Tinting the logo green
  },

  // Center Card
  centerCard: {
    backgroundColor: COLORS.white,
    width: width * 0.92,
    borderRadius: 25,
    paddingHorizontal: 25,
    paddingVertical: 35,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  welcomeContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },

  // Inputs
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 6,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    height: 56,
    paddingHorizontal: 16,
  },
  inputFocused: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: '100%',
  },

  // Footer Actions
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 5,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    borderRadius: 4,
    marginRight: 8,
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 13,
    fontWeight: '500',
  },
  forgotPassword: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Button
  loginButton: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 25,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Divider / Biometric
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  biometricBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },

  // Bottom Nav
  bottomNav: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 12,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
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
    color: COLORS.text,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 12,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoginScreen;
