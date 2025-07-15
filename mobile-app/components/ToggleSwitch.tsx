import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useApp } from '@/context/AppContext';

interface ToggleSwitchProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleSwitch({ label, value, onValueChange }: ToggleSwitchProps) {
  const { isDarkMode } = useApp();

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.label, isDarkMode && styles.darkText]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
        thumbColor={value ? '#FFFFFF' : (isDarkMode ? '#374151' : '#F9FAFB')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  darkContainer: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  darkText: {
    color: '#FFFFFF',
  },
});
