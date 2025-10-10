import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import BASE_URL from './BASE_URL';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from './Colors';
import LottieView from 'lottie-react-native';

const {height, width} = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);

  // Animation refs
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(40)).current;
  const emailOpacity = useRef(new Animated.Value(0)).current;
  const passwordOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const emailTranslate = useRef(new Animated.Value(20)).current;
  const passwordTranslate = useRef(new Animated.Value(20)).current;
  const buttonTranslate = useRef(new Animated.Value(20)).current;
  const lottieAnim = useRef<LottieView>(null);

  const managePasswordVisibility = () => {
    setHidePassword(!hidePassword);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please enter both username and password.',
        autoHide: true,
        visibilityTime: 2500,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/userlogin`, {
        email: username,
        password,
      });

      const data = response.data;

      // Get CSRF token from response headers
      const xsrfToken = response.headers['set-cookie']
        ?.find(cookie => cookie.includes('XSRF-TOKEN'))
        ?.split('=')[1]
        ?.split(';')[0];

      if (xsrfToken) {
        axios.defaults.headers.common['X-XSRF-TOKEN'] = xsrfToken;
      } else {
        console.log('XSRF Token not found');
      }

      if (response.status === 200 && data.status === 200) {
        navigation.navigate('Dashboard' as never);
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'You have logged in successfully!',
          autoHide: true,
          visibilityTime: 2500,
        });
      } else if (response.status === 200 && data.status === 202) {
        Toast.show({
          type: 'error',
          text1: 'Login failed',
          text2: 'Invalid username or password',
          autoHide: true,
          visibilityTime: 2500,
        });
        console.log('Login failed:', data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Unexpected response',
          text2: 'Unexpected response from the server',
          autoHide: true,
          visibilityTime: 2500,
        });
        console.log('Unexpected response:', data);
      }

      console.log('Response: ', data);
    } catch (error: any) {
      console.log('Error: ', error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;

        if (status === 401) {
          Toast.show({
            type: 'error',
            text1: 'Login failed',
            text2: 'Invalid username or password',
            autoHide: true,
            visibilityTime: 2500,
          });
        } else if (status >= 500) {
          Toast.show({
            type: 'error',
            text1: 'Server Error',
            text2: 'Please try again later',
            autoHide: true,
            visibilityTime: 2500,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Login Error',
            text2: 'Something went wrong. Please try again.',
            autoHide: true,
            visibilityTime: 2500,
          });
        }
      } else if (error.request) {
        // Network error
        Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: 'Please check your internet connection',
          autoHide: true,
          visibilityTime: 2500,
        });
      } else {
        // Other error
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Something went wrong. Please try again.',
          autoHide: true,
          visibilityTime: 2500,
        });
      }
    } finally {
      setLoading(false);
    }
  };
  // --- End of handleLogin function ---

  useEffect(() => {
    lottieAnim.current?.play();
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(emailOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(emailTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(passwordOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(passwordTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#2A652B', '#57B959']}
      style={styles.gradientBackground}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.animationContainer}>
          <LottieView
            ref={lottieAnim}
            source={require('../assets/white_cart.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
            resizeMode="contain"
          />
        </View>

        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: formOpacity,
              transform: [{translateY: formTranslateY}],
            },
          ]}>
          <Text style={styles.title}>CapoBiz POS</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <Animated.View
            style={{
              opacity: emailOpacity,
              transform: [{translateY: emailTranslate}],
            }}>
            <View style={styles.inputContainer}>
              <Image
                style={styles.inputIcon}
                source={require('../assets/user.png')}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Email or Username"
                placeholderTextColor="#E0E0E0"
                onChangeText={setUsername}
                value={username}
                editable={!loading}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: passwordOpacity,
              transform: [{translateY: passwordTranslate}],
            }}>
            <View style={styles.inputContainer}>
              <Image
                style={styles.inputIcon}
                source={require('../assets/padlock.png')}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="#E0E0E0"
                secureTextEntry={hidePassword}
                onChangeText={setPassword}
                value={password}
                editable={!loading}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={managePasswordVisibility}
                disabled={loading}
                style={styles.visibilityToggle}>
                <Image
                  style={styles.visibilityIcon}
                  source={
                    hidePassword
                      ? require('../assets/hide.png')
                      : require('../assets/show.png')
                  }
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Animated.View
            style={{
              opacity: buttonOpacity,
              transform: [{translateY: buttonTranslate}],
            }}>
            <TouchableOpacity
              onPress={handleLogin}
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#144272" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
      <Toast />
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    flex: 0.65, // Takes up more space
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: width * 0.4, // Responsive width
    height: '100%',
  },
  formContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: backgroundColors.light,
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: backgroundColors.gray,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassmorphism effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputIcon: {
    width: 22,
    height: 22,
    tintColor: backgroundColors.light,
    marginRight: 15,
  },
  textInput: {
    flex: 1,
    color: backgroundColors.light,
    fontSize: 16,
    paddingVertical: 0,
  },
  visibilityToggle: {
    padding: 5,
  },
  visibilityIcon: {
    width: 22,
    height: 22,
    tintColor: backgroundColors.light,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: backgroundColors.light,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: backgroundColors.light,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: backgroundColors.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: backgroundColors.primary, // Using a dark color from your original palette
    fontSize: 18,
    fontWeight: '700',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
});
