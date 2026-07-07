import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Spacing, ModalStyles } from '../globalStyles';

const { height } = Dimensions.get('window');

interface DropdownProps {
  cacheKey: string;
  url: string;
  selectedValue?: string | number;
  onValueChange: (value: string | number, item?: any) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  parentValue: string | number;
  parentFilterField: string;
  style?: object;
}

export const Dropdown: React.FC<DropdownProps> = ({
  cacheKey,
  url,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  label,
  error: externalError,
  disabled = false,
  required = false,
  parentValue,
  parentFilterField,
  style,
}) => {
  const { isAuthenticated, dropdownData, getDropdownOptions } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [filteredOptions, setFilteredOptions] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      loadOptions();
    }
  }, [cacheKey, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const options = dropdownData[cacheKey] || [];

    if (parentValue && parentFilterField) {
      const filtered = options.filter((item: any) => item[parentFilterField] === parentValue);
      setFilteredOptions(filtered);

      if (selectedValue && !filtered.find((opt: { Id: string | number; }) => opt.Id === selectedValue)) {
        onValueChange('');
      }
    } else {
      setFilteredOptions(options);
    }
  }, [parentValue, isAuthenticated]);

  const loadOptions = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setLocalError(null);
    try {
      const dropDownOptions = await getDropdownOptions(cacheKey, url);
      setFilteredOptions(dropDownOptions);
    } catch (error: any) {
      setLocalError(error.message || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedLabel = () => {
    const selected = filteredOptions.find(opt => opt.Id === selectedValue);
    return selected ? selected.Name : placeholder;
  };

  const handleSelect = (option: any) => {
    onValueChange(option.Id, option.Id);
    setIsModalVisible(false);
  };

  const displayError = externalError || localError;

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, style]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.disabledContainer}>
          <Text style={styles.disabledText}>Please login to continue</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredStar}>*</Text>}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.dropdownButton,
          disabled && styles.disabledButton,
          displayError && styles.errorBorder,
        ]}
        onPress={() => !disabled && filteredOptions?.length > 0 && setIsModalVisible(true)}
        disabled={disabled || filteredOptions?.length === 0}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownButtonText, !selectedValue && styles.placeholderText]} numberOfLines={1}>
          {loading ? 'Loading...' : getSelectedLabel()}
        </Text>
        {loading ? (
          <Text style={styles.arrow}>⏳</Text>
        ) : (
          <Icon name="expand-more" size={20} color={Colors.secondary} />
        )}
      </TouchableOpacity>

      {displayError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{displayError}</Text>
          <TouchableOpacity onPress={loadOptions}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={ModalStyles.overlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Icon name="close" size={18} color={Colors.secondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.Id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionItem, selectedValue === item.Id && styles.selectedOption]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[styles.optionText, selectedValue === item.Id && styles.selectedOptionText]}>
                    {item.Name}
                  </Text>
                  {selectedValue === item.Id && (
                    <Icon name="check" size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  requiredStar: {
    color: Colors.danger,
    marginLeft: Spacing.xs,
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  placeholderText: {
    color: Colors.secondary,
  },
  arrow: {
    fontSize: 14,
    color: Colors.secondary,
    marginLeft: Spacing.sm,
  },
  disabledButton: {
    backgroundColor: Colors.lightGray,
  },
  disabledContainer: {
    backgroundColor: Colors.lightGray,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Spacing.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
  },
  disabledText: {
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'center',
  },
  errorBorder: {
    borderColor: Colors.danger,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    flex: 1,
  },
  retryText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: Spacing.sm,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.xl,
    width: '85%',
    maxHeight: height * 0.7,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
  },
  selectedOption: {
    backgroundColor: Colors.primaryTint,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginLeft: Spacing.xl,
  },
});