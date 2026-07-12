import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Spacing, Typography, ModalStyles, Buttons } from '../globalStyles';

const { width } = Dimensions.get('window');

interface PopupProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const Popup: React.FC<PopupProps> = ({ visible, onClose, title, message }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={ModalStyles.overlay}>
        <View style={styles.popupContainer}>
          <View style={ModalStyles.container}>
            <Text style={Typography.headline}>{title}</Text>
            <Text style={[Typography.body, styles.message]}>{message}</Text>
            <TouchableOpacity style={Buttons.primary} onPress={onClose}>
              <Text style={Typography.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  popupContainer: {
    width: width * 0.8
  },
  message: {
    marginBottom: Spacing.xxl,
    textAlign: 'center',
  },
});

export default Popup;