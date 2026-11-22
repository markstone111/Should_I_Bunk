// mobile-app/components/AddTimetableSlotModal.tsx

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
import { X, Plus, Calendar, Clock, MapPin } from 'lucide-react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useApp } from '@/context/AppContext';
import { DropdownPicker } from '@/components/DropdownPicker';
import { ClassType, DAYS_OF_WEEK } from '@/types/attendance';

interface AddTimetableSlotModalProps {
  visible: boolean;
  initialDay?: number;
  onClose: () => void;
}

export function AddTimetableSlotModal({
  visible,
  initialDay = 1,
  onClose,
}: AddTimetableSlotModalProps) {
  const { subjects, addTimetableSlot, isDarkMode } = useApp();
  const activeSubjects = subjects.filter((s) => !s.isArchived);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    activeSubjects[0]?.id || ''
  );
  const [dayOfWeek, setDayOfWeek] = useState<number>(initialDay);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [classType, setClassType] = useState<ClassType>('lecture');
  const [room, setRoom] = useState('');
  const [iosPickerTarget, setIosPickerTarget] = useState<'start' | 'end' | null>(null);

  const selectedSubject = activeSubjects.find((s) => s.id === selectedSubjectId);

  const openTimePicker = (mode: 'start' | 'end') => {
    const currentTime = mode === 'start' ? startTime : endTime;
    const parts = currentTime.split(':');
    const hours = parseInt(parts[0], 10) || (mode === 'start' ? 9 : 10);
    const minutes = parseInt(parts[1], 10) || 0;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (event.type === 'set' && selectedDate) {
            const h = selectedDate.getHours().toString().padStart(2, '0');
            const m = selectedDate.getMinutes().toString().padStart(2, '0');
            const formatted = `${h}:${m}`;
            if (mode === 'start') {
              setStartTime(formatted);
              const endH = ((selectedDate.getHours() + 1) % 24).toString().padStart(2, '0');
              setEndTime(`${endH}:${m}`);
            } else {
              setEndTime(formatted);
            }
          }
        },
        mode: 'time',
        is24Hour: true,
      });
    } else {
      setIosPickerTarget(mode);
    }
  };

  const handleSave = () => {
    if (!selectedSubjectId || !startTime.trim()) return;

    addTimetableSlot({
      subjectId: selectedSubjectId,
      dayOfWeek,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      type: classType,
      room: room.trim() || undefined,
    });

    setRoom('');
    onClose();
  };

  const dayName = DAYS_OF_WEEK.find((d) => d.id === dayOfWeek)?.name || 'Monday';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={25} style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <View style={[styles.modal, isDarkMode && styles.darkModal]}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Clock size={20} color="#3B82F6" />
                <Text style={[styles.title, isDarkMode && styles.darkText]}>
                  Add Class to Timetable
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={22} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Select Subject */}
              <DropdownPicker
                label="Select Subject"
                value={selectedSubject?.name || 'Select a subject'}
                options={activeSubjects.map((s) => s.name)}
                onValueChange={(val) => {
                  const found = activeSubjects.find((s) => s.name === val);
                  if (found) setSelectedSubjectId(found.id);
                }}
              />

              {/* Day of the week picker */}
              <DropdownPicker
                label="Day of the Week"
                value={dayName}
                options={DAYS_OF_WEEK.map((d) => d.name)}
                onValueChange={(val) => {
                  const found = DAYS_OF_WEEK.find((d) => d.name === val);
                  if (found) setDayOfWeek(found.id);
                }}
              />

              {/* Time Slots (Start Time & End Time using Native Time Picker) */}
              <View style={styles.row}>
                <View style={styles.halfCol}>
                  <Text style={[styles.label, isDarkMode && styles.darkText]} textBreakStrategy="simple">
                    Start Time{' '}
                  </Text>
                  <TouchableOpacity
                    style={[styles.timePickerBtn, isDarkMode && styles.darkTimePickerBtn]}
                    onPress={() => openTimePicker('start')}
                    activeOpacity={0.7}
                  >
                    <Clock size={16} color="#3B82F6" />
                    <Text
                      style={[styles.timePickerText, isDarkMode && styles.darkText]}
                      textBreakStrategy="simple"
                    >
                      {startTime}{' '}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.halfCol}>
                  <Text style={[styles.label, isDarkMode && styles.darkText]} textBreakStrategy="simple">
                    End Time{' '}
                  </Text>
                  <TouchableOpacity
                    style={[styles.timePickerBtn, isDarkMode && styles.darkTimePickerBtn]}
                    onPress={() => openTimePicker('end')}
                    activeOpacity={0.7}
                  >
                    <Clock size={16} color="#3B82F6" />
                    <Text
                      style={[styles.timePickerText, isDarkMode && styles.darkText]}
                      textBreakStrategy="simple"
                    >
                      {endTime}{' '}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* iOS DateTimePicker Fallback */}
              {Platform.OS === 'ios' && iosPickerTarget && (
                <DateTimePicker
                  value={(() => {
                    const t = iosPickerTarget === 'start' ? startTime : endTime;
                    const parts = t.split(':');
                    const h = parseInt(parts[0], 10) || (iosPickerTarget === 'start' ? 9 : 10);
                    const m = parseInt(parts[1], 10) || 0;
                    const d = new Date();
                    d.setHours(h, m, 0, 0);
                    return d;
                  })()}
                  mode="time"
                  is24Hour={true}
                  display="spinner"
                  onChange={(_e, selectedDate) => {
                    setIosPickerTarget(null);
                    if (selectedDate) {
                      const h = selectedDate.getHours().toString().padStart(2, '0');
                      const m = selectedDate.getMinutes().toString().padStart(2, '0');
                      if (iosPickerTarget === 'start') {
                        setStartTime(`${h}:${m}`);
                      } else {
                        setEndTime(`${h}:${m}`);
                      }
                    }
                  }}
                />
              )}

              {/* Class Type */}
              <DropdownPicker
                label="Class Type"
                value={
                  classType === 'lab'
                    ? 'Laboratory (Lab)'
                    : classType === 'tutorial'
                    ? 'Tutorial'
                    : 'Theory Lecture'
                }
                options={['Theory Lecture', 'Laboratory (Lab)', 'Tutorial']}
                onValueChange={(val) => {
                  if (val === 'Laboratory (Lab)') setClassType('lab');
                  else if (val === 'Tutorial') setClassType('tutorial');
                  else setClassType('lecture');
                }}
              />

              {/* Room / Location */}
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Room / Hall (Optional)</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="e.g. Hall 402 or Lab 3"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                value={room}
                onChangeText={setRoom}
                maxLength={30}
              />
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  (!selectedSubjectId || !startTime.trim()) && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={!selectedSubjectId || !startTime.trim()}
              >
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Add to Timetable</Text>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 13,
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
  timePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  darkTimePickerBtn: {
    borderColor: '#334155',
    backgroundColor: '#0F172A',
  },
  timePickerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
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
