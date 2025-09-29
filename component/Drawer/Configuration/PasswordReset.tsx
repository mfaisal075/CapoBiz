import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useState} from 'react';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

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
            <Text style={styles.headerTitle}>Password Reset</Text>
          </View>

          <View style={styles.headerBtn} />
        </View>

        <ScrollView style={styles.listContainer}>
          <View style={styles.card}>
            {/* Header Section */}
            <View style={styles.headerRow}>
              <View style={styles.avatarBox}>
                <Icon name="lock-reset" size={24} color="white" />
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
                <View style={styles.labelRow}>
                  <Icon
                    name="lock-outline"
                    size={18}
                    color="#144272"
                    style={styles.infoIcon}
                  />
                  <Text style={styles.labelText}>Current Password</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#999"
                  placeholder="Enter current password"
                  secureTextEntry
                  value={from.oldPassword}
                  onChangeText={text => onChange('oldPassword', text)}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Icon
                    name="lock-plus"
                    size={18}
                    color="#144272"
                    style={styles.infoIcon}
                  />
                  <Text style={styles.labelText}>New Password</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#999"
                  placeholder="Enter new password"
                  secureTextEntry
                  value={from.newPassword}
                  onChangeText={text => onChange('newPassword', text)}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Icon
                    name="lock-check"
                    size={18}
                    color="#144272"
                    style={styles.infoIcon}
                  />
                  <Text style={styles.labelText}>Confirm Password</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#999"
                  placeholder="Confirm new password"
                  secureTextEntry
                  value={from.confirmPassword}
                  onChangeText={text => onChange('confirmPassword', text)}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleResetPassword}>
                <Icon name="key-change" size={20} color="white" />
                <Text style={styles.submitText}>Update Password</Text>
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
                  source={require('../../../assets/success.json')} // You can use any success animation
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
                  style={styles.successModalBtn}
                  onPress={() => {
                    setTimeout(() => {
                      setIsModalVisible(false);
                      navigation.navigate('Login' as never);
                    }, 2000);
                  }}>
                  <Text style={styles.successModalBtnText}>Ok</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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

  // List Container
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },

  // Card Styling
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTxtContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Info Box Styling
  infoBox: {
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 6,
  },
  labelText: {
    fontSize: 14,
    color: '#144272',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: 'white',
  },

  // Submit Button
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#144272',
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  submitText: {
    color: 'white',
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
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
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
    color: '#144272',
    marginBottom: 8,
    textAlign: 'center',
  },
  successModalMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  successModalActions: {
    width: '100%',
  },
  successModalBtn: {
    backgroundColor: '#ebd1267f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  successModalBtnText: {
    color: '#144272',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
