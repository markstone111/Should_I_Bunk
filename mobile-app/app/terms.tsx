import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';

export default function TermsScreen() {
  const [accepted, setAccepted] = useState(false);

  const handleContinue = () => {
    if (accepted) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Terms & Conditions</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Terms of Service</Text>
        <Text style={styles.text}>
          Welcome to Should I Bunk! By using this app, you agree to the following terms:
          {'\n\n'}
          1. This app is designed to help students manage their attendance responsibly.
          {'\n\n'}
          2. The predictions provided are based on statistical models and should be used as guidance only.
          {'\n\n'}
          3. Users are responsible for their academic decisions and attendance choices.
          {'\n\n'}
          4. We do not store personal academic data on external servers.
          {'\n\n'}
          5. The app is provided "as is" without warranties of any kind.
        </Text>

        <Text style={styles.sectionTitle}>Privacy Policy</Text>
        <Text style={styles.text}>
          Your privacy is important to us:
          {'\n\n'}
          1. All attendance data is stored locally on your device.
          {'\n\n'}
          2. We do not collect or share personal information.
          {'\n\n'}
          3. Anonymous usage statistics may be collected to improve the app.
          {'\n\n'}
          4. No third-party tracking or advertising networks are used.
          {'\n\n'}
          5. You can delete all data at any time from the Settings screen.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.checkbox} 
          onPress={() => setAccepted(!accepted)}
        >
          <View style={[styles.checkboxInner, accepted && styles.checkboxChecked]}>
            {accepted && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
          </View>
          <Text style={styles.checkboxText}>
            I agree to the Terms & Conditions and Privacy Policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.continueButton, !accepted && styles.disabledButton]} 
          onPress={handleContinue}
          disabled={!accepted}
        >
          <Text style={[styles.continueButtonText, !accepted && styles.disabledButtonText]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
});