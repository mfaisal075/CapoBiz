import React from 'react';
import {View, Text, Modal, StyleSheet, TouchableOpacity} from 'react-native';
import LottieView from 'lottie-react-native';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
  animationSource: any; // Pass your Lottie file here
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  message,
  animationSource,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <LottieView
            source={animationSource}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '85%',
  },
  lottie: {
    width: 100,
    height: 100,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: '#144272',
  },
  closeBtn: {
    backgroundColor: '#144272',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SuccessModal;
