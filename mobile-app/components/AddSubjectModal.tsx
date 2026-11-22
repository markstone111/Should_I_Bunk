// mobile-app/components/AddSubjectModal.tsx

import React, { useState } from 'react';
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
import { X, Plus, Sparkles, Check } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { DropdownPicker } from '@/components/DropdownPicker';
import { ImportanceLevel, StrictnessLevel, AttendanceMethod } from '@/types/attendance';

interface AddSubjectModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddSubjectModal({ visible, onClose }: AddSubjectModalProps) {
  const { addSubject, isDarkMode, globalTargetPercentage } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [targetPercentage, setTargetPercentage] = useState(
    (globalTargetPercentage || 75).toString()
  );
  const [importance, setImportance] = useState<ImportanceLevel>('Medium');
  const [strictness, setStrictness] = useState<StrictnessLevel>('Medium');
  const [method, setMethod] = useState<AttendanceMethod>('roll_call');

  // Mid-semester setup
  const [isMidSemester, setIsMidSemester] = useState(false);
  const [initialTotal, setInitialTotal] = useState('');
  const [initialAttended, setInitialAttended] = useState('');

  const resetForm = () => {
    setName('');
    setCode('');
    setTargetPercentage((globalTargetPercentage || 75).toString());
    setImportance('Medium');
    setStrictness('Medium');
    setMethod('roll_call');
    setIsMidSemester(false);
    setInitialTotal('');
    setInitialAttended('');
  };

  const handleAdd = () => {
    if (!name.trim()) return;

    const target = Math.min(100, Math.max(1, parseInt(targetPercentage, 10) || 75));
    const total = isMidSemester ? parseInt(initialTotal, 10) || 0 : 0;
    const attended = isMidSemester ? Math.min(total, parseInt(initialAttended, 10) || 0) : 0;

    addSubject({
      name: name.trim(),
      code: code.trim(),
      targetPercentage: target,
      importance,
      professorStrictness: strictness,
      attendanceMethod: method,
      initialTotal: total,
      initialAttended: attended,
    });

    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <BlurView intensity={25} style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <View style={[styles.modal, isDarkMode && styles.darkModal]}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Sparkles size={20} color="#3B82F6" />
                <Text style={[styles.title, isDarkMode && styles.darkText]}>Add Subject</Text>
              </View>
              <TouchableOpacity onPress={handleCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={22} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Subject Name */}
              <Text style={[styles.label, isDarkMode && styles.darkText]}>
                Subject Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="e.g. Operating Systems"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                value={name}
                onChangeText={setName}
                autoFocus
                maxLength={60}
              />

              {/* Code & Target in 2 columns */}
              <View style={styles.row}>
                <View style={styles.halfCol}>
                  <Text style={[styles.label, isDarkMode && styles.darkText]}>Subject Code</Text>
                  <TextInput
                    style={[styles.input, isDarkMode && styles.darkInput]}
                    placeholder="e.g. CS-301"
                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                    value={code}
                    onChangeText={setCode}
                    maxLength={15}
                  />
                </View>

                <View style={styles.halfCol}>
                  <Text style={[styles.label, isDarkMode && styles.darkText]}>Target %</Text>
                  <TextInput
                    style={[styles.input, isDarkMode && styles.darkInput]}
                    placeholder="75"
                    keyboardType="numeric"
                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                    value={targetPercentage}
                    onChangeText={setTargetPercentage}
                    maxLength={3}
                  />
                </View>
              </View>

              {/* Dropdowns */}
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

              {/* Mid-semester toggle */}
              <TouchableOpacity
                style={[styles.toggleCard, isDarkMode && styles.darkToggleCard]}
                onPress={() => setIsMidSemester(!isMidSemester)}
              >
                <View style={[styles.checkbox, isMidSemester && styles.checkboxActive]}>
                  {isMidSemester && <Check size={14} color="#FFFFFF" />}
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleTitle, isDarkMode && styles.darkText]}>
                    Already in Mid-Semester?
                  </Text>
                  <Text style={[styles.toggleSubtitle, isDarkMode && styles.darkSubText]}>
                    Enter current past attendance counts
                  </Text>
                </View>
              </TouchableOpacity>

              {isMidSemester && (
                <View style={styles.row}>
                  <View style={styles.halfCol}>
                    <Text style={[styles.label, isDarkMode && styles.darkText]}>Total Classes Held</Text>
                    <TextInput
                      style={[styles.input, isDarkMode && styles.darkInput]}
                      placeholder="e.g. 24"
                      keyboardType="numeric"
                      placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                      value={initialTotal}
                      onChangeText={setInitialTotal}
                      maxLength={4}
                    />
                  </View>

                  <View style={styles.halfCol}>
                    <Text style={[styles.label, isDarkMode && styles.darkText]}>Classes Attended</Text>
                    <TextInput
                      style={[styles.input, isDarkMode && styles.darkInput]}
                      placeholder="e.g. 19"
                      keyboardType="numeric"
                      placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                      value={initialAttended}
                      onChangeText={setInitialAttended}
                      maxLength={4}
                    />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.addButton, !name.trim() && styles.disabledButton]}
                onPress={handleAdd}
                disabled={!name.trim()}
              >
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Create Subject</Text>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
  },
  required: {
    color: '#EF4444',
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
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  darkToggleCard: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#64748B',
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
  addButton: {
    backgroundColor: '#3B82F6',
  },
  addButtonText: {
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
  darkSubText: {
    color: '#94A3B8',
  },
});
