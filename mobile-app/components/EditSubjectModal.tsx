// mobile-app/components/EditSubjectModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Check } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { DropdownPicker } from '@/components/DropdownPicker';
import { Subject, ImportanceLevel, StrictnessLevel, AttendanceMethod } from '@/types/attendance';

interface EditSubjectModalProps {
  visible: boolean;
  subject: Subject | null;
  onClose: () => void;
}

export function EditSubjectModal({ visible, subject, onClose }: EditSubjectModalProps) {
  const { updateSubject, isDarkMode } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [targetPercentage, setTargetPercentage] = useState('75');
  const [importance, setImportance] = useState<ImportanceLevel>('Medium');
  const [strictness, setStrictness] = useState<StrictnessLevel>('Medium');
  const [method, setMethod] = useState<AttendanceMethod>('roll_call');

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setCode(subject.code || '');
      setTargetPercentage((subject.targetPercentage || 75).toString());
      setImportance(subject.importance || 'Medium');
      setStrictness(subject.professorStrictness || 'Medium');
      setMethod(subject.attendanceMethod || 'roll_call');
    }
  }, [subject]);

  const handleSave = () => {
    if (!subject || !name.trim()) return;

    const target = Math.min(100, Math.max(1, parseInt(targetPercentage, 10) || 75));

    updateSubject({
      ...subject,
      name: name.trim(),
      code: code.trim(),
      targetPercentage: target,
      importance,
      professorStrictness: strictness,
      attendanceMethod: method,
    });

    onClose();
  };

  if (!subject) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={25} style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <View style={[styles.modal, isDarkMode && styles.darkModal]}>
            <View style={styles.header}>
              <Text style={[styles.title, isDarkMode && styles.darkText]}>Edit Subject</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={22} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Subject Name</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                value={name}
                onChangeText={setName}
                maxLength={60}
              />

              <View style={styles.row}>
                <View style={styles.halfCol}>
                  <Text style={[styles.label, isDarkMode && styles.darkText]}>Subject Code</Text>
                  <TextInput
                    style={[styles.input, isDarkMode && styles.darkInput]}
                    value={code}
                    onChangeText={setCode}
                    maxLength={15}
                  />
                </View>

                <View style={styles.halfCol}>
                  <Text style={[styles.label, isDarkMode && styles.darkText]}>Target %</Text>
                  <TextInput
                    style={[styles.input, isDarkMode && styles.darkInput]}
                    keyboardType="numeric"
                    value={targetPercentage}
                    onChangeText={setTargetPercentage}
                    maxLength={3}
                  />
                </View>
              </View>

              <DropdownPicker
                label="Professor Strictness"
                value={strictness}
                options={['Low', 'Medium', 'High']}
                onValueChange={(val) => setStrictness(val as StrictnessLevel)}
              />

              <DropdownPicker
                label="Class Importance / Weight"
                value={importance}
                options={['Low', 'Medium', 'High']}
                onValueChange={(val) => setImportance(val as ImportanceLevel)}
              />

              <DropdownPicker
                label="Attendance Method"
                value={
                  method === 'roll_call'
                    ? 'Roll Call'
                    : method === 'biometric'
                    ? 'Biometric / RFID'
                    : method === 'qr_code'
                    ? 'QR Code Scan'
                    : 'Attendance Sheet'
                }
                options={['Roll Call', 'Biometric / RFID', 'QR Code Scan', 'Attendance Sheet']}
                onValueChange={(val) => {
                  if (val === 'Biometric / RFID') setMethod('biometric');
                  else if (val === 'QR Code Scan') setMethod('qr_code');
                  else if (val === 'Attendance Sheet') setMethod('sheet');
                  else setMethod('roll_call');
                }}
              />
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton, !name.trim() && styles.disabledButton]}
                onPress={handleSave}
                disabled={!name.trim()}
              >
                <Check size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  keyboardContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 460,
    maxHeight: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  darkModal: {
    backgroundColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  darkInput: {
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  darkText: {
    color: '#F8FAFC',
  },
});
