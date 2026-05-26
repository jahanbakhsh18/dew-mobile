import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

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

    if (parentValue && parentFilterField) {
      const filtered = dropdownData[cacheKey].filter((item: any) => item[parentFilterField] === parentValue);
      setFilteredOptions(filtered);

      if (selectedValue && !filtered.find((opt: { Id: string | number; }) => opt.Id === selectedValue)) {
        onValueChange('');
      }
    } else {
      setFilteredOptions(dropdownData[cacheKey]);
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
        <Text style={styles.arrow}>{loading ? '⏳' : '▼'}</Text>
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
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
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
                  {selectedValue === item.Id && (<Text style={styles.checkmark}>✓</Text>)}
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
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  requiredStar: {
    color: '#ef4444',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  arrow: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#f3f4f6',
  },
  disabledContainer: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  disabledText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  errorBorder: {
    borderColor: '#ef4444',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    flex: 1,
  },
  retryText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '85%',
    maxHeight: height * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '500',
    padding: 4,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  selectedOption: {
    backgroundColor: '#eef2ff',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedOptionText: {
    color: '#6366f1',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 16,
    color: '#6366f1',
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 20,
  },
});