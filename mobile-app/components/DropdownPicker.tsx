import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';

interface DropdownPickerProps {
  label: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
}

export function DropdownPicker({ label, value, options, onValueChange }: DropdownPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { isDarkMode } = useApp();

  const handleSelect = (option: string) => {
    onValueChange(option);
    setModalVisible(false);
  };

  const renderOption = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.option, item === value && styles.selectedOption]}
      onPress={() => handleSelect(item)}
    >
      <Text style={[styles.optionText, item === value && styles.selectedOptionText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDarkMode && styles.darkText]}>{label}</Text>
      <TouchableOpacity
        style={[styles.picker, isDarkMode && styles.darkPicker]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.pickerText, isDarkMode && styles.darkText]}>{value}</Text>
        <ChevronDown size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>{label}</Text>
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  darkText: {
    color: '#FFFFFF',
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  darkPicker: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  pickerText: {
    fontSize: 16,
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  darkModalContent: {
    backgroundColor: '#1F2937',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  option: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedOption: {
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});