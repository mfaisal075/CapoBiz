import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import BASE_URL from './BASE_URL';
import Toast from 'react-native-toast-message';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const managePasswordVisibility = () => {
    setHidePassword(!hidePassword);
  };

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(40)).current;
  const emailOpacity = useRef(new Animated.Value(0)).current;
  const passwordOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const emailTranslate = useRef(new Animated.Value(20)).current;
  const passwordTranslate = useRef(new Animated.Value(20)).current;
  const buttonTranslate = useRef(new Animated.Value(20)).current;

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

    try {
      const response = await axios.post(
        `${BASE_URL}/userlogin`,
        {
          email: username,
          password,
        },
        {
          withCredentials: true,
        },
      );

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
      } else if (data.status === 202) {
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

      console.log('Reponse: ', data);
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(emailOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(emailTranslate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(passwordOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(passwordTranslate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 600);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 900);
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: formOpacity,
              transform: [{translateY: formTranslateY}],
            },
          ]}>
          <Text style={styles.title}>Welcome Back</Text>

          <Animated.View
            style={{
              opacity: emailOpacity,
              transform: [{translateY: emailTranslate}],
            }}>
            <View style={styles.input}>
              <Image
                style={{
                  width: 20,
                  height: 20,
                  tintColor: '#144272',
                  alignSelf: 'center',
                }}
                source={require('../assets/user.png')}
              />
              <TextInput
                style={{flex: 1, color: '#144272'}}
                placeholder="Username"
                placeholderTextColor="#144272"
                onChangeText={text => setUsername(text)}
                value={username}
              />
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: passwordOpacity,
              transform: [{translateY: passwordTranslate}],
            }}>
            <View
              style={[
                styles.input,
                {flexDirection: 'row', alignItems: 'center'},
              ]}>
              <Image
                style={{
                  width: 20,
                  height: 20,
                  tintColor: '#144272',
                  marginRight: 10,
                }}
                source={require('../assets/padlock.png')}
              />

              <TextInput
                style={{flex: 1, color: '#144272'}}
                placeholder="Password"
                placeholderTextColor="#144272"
                secureTextEntry={hidePassword}
                onChangeText={setPassword}
                value={password}
              />

              <TouchableOpacity onPress={managePasswordVisibility}>
                <Image
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: '#144272',
                  }}
                  source={
                    hidePassword
                      ? require('../assets/hide.png')
                      : require('../assets/show.png')
                  }
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: buttonOpacity,
              transform: [{translateY: buttonTranslate}],
            }}>
            <TouchableOpacity
              onPress={() => {
                // navigation.navigate('Dashboard' as never);
                handleLogin();
              }}
              style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ImageBackground>
    </View>
  );
};

export default LoginScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: '#144272',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
    flexDirection: 'row',
  },
  loginButton: {
    backgroundColor: '#144272',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
