import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import SamplePopup from './SamplePopup';
import { Colors, Spacing, Typography, Shadows } from '../globalStyles';

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
          <Text style={Typography.headline}>{title}</Text>
          <Text style={Typography.body}>{description}</Text>
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

// Local styles – all values now reference global constants
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    ...Shadows.card,
  },
  cardContent: {
    padding: Spacing.xl,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
  },
  cardAction: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default FormCard;