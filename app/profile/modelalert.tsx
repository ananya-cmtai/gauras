import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type ModalAlertProps = {
  visible: boolean;
  onClose: () => void;
  messageAlert: string;
};

const ModalAlert: React.FC<ModalAlertProps> = ({ visible, onClose, messageAlert }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.messageText}>
            {messageAlert}
          </Text>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ModalAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
  },
  closeButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    width: '50%',
    marginTop: '5%',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
