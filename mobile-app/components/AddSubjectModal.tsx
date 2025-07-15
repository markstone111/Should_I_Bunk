import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Plus } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';

interface AddSubjectModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddSubjectModal({ visible, onClose }: AddSubjectModalProps) {
  const { addSubject, isDarkMode } = useApp();
  const [subjectName, setSubjectName] = useState('');

  const handleAdd = () => {
    if (subjectName.trim()) {
      const newSubject = {
        id: Date.now().toString(),
        name: subjectName.trim(),
        attendance: [],
        totalClasses: 0,
        attendedClasses: 0,
        importance: 'Medium',
        hasUpcomingTest: false,
        professorStrictness: 'Medium',
      };
      addSubject(newSubject);
      setSubjectName('');
      onClose();
    }
  };

  const handleCancel = () => {
    setSubjectName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={[styles.modal, isDarkMode && styles.darkModal]}>
            <View style={styles.header}>
              <Text style={[styles.title, isDarkMode && styles.darkText]}>
                Add Subject
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <X size={24} color={isDarkMode ? '#FFFFFF' : '#374151'} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>
                Subject Name
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  isDarkMode && styles.darkInput,
                  isDarkMode && { color: '#FFFFFF' }
                ]}
                placeholder="Enter subject name..."
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                value={subjectName}
                onChangeText={setSubjectName}
                autoFocus
                maxLength={50}
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.button, 
                    styles.addButton,
                    !subjectName.trim() && styles.disabledButton
                  ]} 
                  onPress={handleAdd}
                  disabled={!subjectName.trim()}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add Subject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  darkModal: {
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  darkText: {
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
  },
  darkInput: {
    borderColor: '#374151',
    backgroundColor: '#111827',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});