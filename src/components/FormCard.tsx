import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import SamplePopup from './SamplePopup';

const { width } = Dimensions.get('window');

interface FormCardProps {
  title: string;
  description: string;
  icon?: string;
  onPress?: () => void;
}

const FormCard: React.FC<FormCardProps> = ({ title, description, onPress }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setModalVisible(true);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardAction}>Tap to open →</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <SamplePopup
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={title}
        message={`This is a sample form for: ${description}`}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cardAction: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default FormCard;