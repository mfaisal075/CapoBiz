import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useState} from 'react';
import Modal from 'react-native-modal';
import {TextInput} from 'react-native-gesture-handler';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';

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
  const [btnproduct, setbtnproduct] = useState(false);
  const [from, setForm] = useState<ResetPassword>(initialResetPassword);

  const onChange = (field: keyof ResetPassword, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglebtnproduct = () => {
    setbtnproduct(!btnproduct);
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

        setTimeout(() => {
          navigation.navigate('Login' as never);
        }, 1500);
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
                Password Reset
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <TextInput
              style={styles.input}
              placeholderTextColor={'white'}
              placeholder="Old Password"
              value={from.oldPassword}
              onChangeText={text => onChange('oldPassword', text)}
            />
            <TextInput
              style={styles.input}
              placeholderTextColor={'white'}
              placeholder="New Password"
              value={from.newPassword}
              onChangeText={text => onChange('newPassword', text)}
            />

            <TextInput
              style={styles.input}
              placeholderTextColor={'white'}
              placeholder="Confirm Password"
              value={from.confirmPassword}
              onChangeText={text => onChange('confirmPassword', text)}
            />

            <TouchableOpacity onPress={handleResetPassword}>
              <View
                style={{
                  width: 340,
                  height: 30,
                  backgroundColor: 'white',
                  borderRadius: 15,
                  marginTop: 10,
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#144272',
                    marginTop: 5,
                  }}>
                  Update Password
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Modal isVisible={btnproduct}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
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
              Updated
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Password has been updated successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setbtnproduct(!btnproduct)}>
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
  section: {
    borderColor: 'white',
    height: 'auto',
    borderRadius: 12,
    elevation: 15,
    padding: 10,
    justifyContent: 'center',
    alignSelf: 'center',
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
