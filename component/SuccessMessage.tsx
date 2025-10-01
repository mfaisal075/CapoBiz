import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';

interface SuccessMessageProps {
  visible: boolean;
  message: string;
  onHide?: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
}

const {width} = Dimensions.get('window');

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  visible,
  message,
  onHide,
  type = 'success',
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          animation: require('../assets/success.json'),
          title: 'Success!',
        };
      case 'error':
        return {
          backgroundColor: '#f44336',
          animation: require('../assets/warning.json'),
          title: 'Error!',
        };
      case 'warning':
        return {
          backgroundColor: '#ff9800',
          animation: require('../assets/warning.json'),
          title: 'Warning!',
        };
      case 'info':
        return {
          backgroundColor: '#2196F3',
          animation: require('../assets/info.json'),
          title: 'Info',
        };
      default:
        return {
          backgroundColor: '#4CAF50',
          animation: require('../assets/success.json'),
          title: 'Success!',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Animation */}
          <View style={styles.animContainer}>
            <LottieView
              style={{flex: 1}}
              source={config.animation}
              autoPlay
              loop={false}
            />
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>{config.title}</Text>

          {/* Message */}
          <Text style={styles.modalMessage}>{message}</Text>

          {/* OK Button */}
          <TouchableOpacity
            style={[styles.modalBtn, {backgroundColor: config.backgroundColor}]}
            onPress={onHide}>
            <Text style={styles.modalBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    width: width - 80,
  },
  animContainer: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default SuccessMessage;