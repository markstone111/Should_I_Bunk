// mobile-app/app/subject/[id].tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  MinusCircle,
  Check,
  Sliders,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  ChevronRight,
} from 'lucide-react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { useApp } from '@/context/AppContext';
import { DropdownPicker } from '@/components/DropdownPicker';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { PredictionService } from '@/utils/PredictionService';
import { calculateSubjectStats, getRecordsForDate } from '@/utils/attendanceCalculator';
import {
  AttendanceRecord,
  AttendanceStatus,
  ClassType,
  DetailedPredictionResult,
} from '@/types/attendance';

export default function SubjectScreen() {
  const { id } = useLocalSearchParams();
  const {
    subjects,
    updateSubject,
    recordAttendance,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    quickCycleAttendance,
    isDarkMode,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [predictionResult, setPredictionResult] = useState<DetailedPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal for adding a custom session
  const [isAddSessionModalVisible, setIsAddSessionModalVisible] = useState(false);
  const [newSessionType, setNewSessionType] = useState<ClassType>('lecture');
  const [newSessionTime, setNewSessionTime] = useState('');
  const [newSessionWeight, setNewSessionWeight] = useState('1');

  const subject = subjects.find((s) => s.id === id);

  if (!subject) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
            Subject not found or has been removed.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const stats = calculateSubjectStats(subject);
  const recordsForSelectedDate = getRecordsForDate(subject, selectedDate);

  // Calendar marked dates builder
  const getMarkedDates = () => {
    const marked: Record<string, any> = {};

    // Group records by date to determine dominant status
    const dateMap = new Map<string, AttendanceRecord[]>();
    for (const r of subject.attendanceRecords || []) {
      const list = dateMap.get(r.date) || [];
      list.push(r);
      dateMap.set(r.date, list);
    }

    dateMap.forEach((records, date) => {
      const hasAbsent = records.some((r) => r.status === 'absent');
      const hasDuty = records.some((r) => r.status === 'duty_leave');
      const hasPresent = records.some((r) => r.status === 'present');
      const hasCancelled = records.every((r) => r.status === 'cancelled');

      let color = '#10B981'; // Green (all present)
      if (hasAbsent) {
        color = '#EF4444'; // Red if missed any class
      } else if (hasDuty) {
        color = '#3B82F6'; // Blue for duty leave
      } else if (hasCancelled) {
        color = '#94A3B8'; // Grey for cancelled
      }

      marked[date] = {
        selected: true,
        selectedColor: color,
        selectedTextColor: '#FFFFFF',
        dots: records.length > 1 ? [{ key: 'multi', color: '#FFFFFF' }] : undefined,
      };
    });

    // Highlight selected date with a border / ring
    const existing = marked[selectedDate] || {};
    marked[selectedDate] = {
      ...existing,
      selected: true,
      selectedColor: existing.selectedColor || '#E2E8F0',
      selectedTextColor: existing.selectedTextColor || (isDarkMode ? '#F8FAFC' : '#0F172A'),
      marked: true,
    };

    return marked;
  };

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    // If no session exists on this date yet, quickly add default 1st lecture
    const existing = (subject.attendanceRecords || []).filter((r) => r.date === day.dateString);
    if (existing.length === 0) {
      quickCycleAttendance(subject.id, day.dateString, 0);
    }
  };

  const handleAddCustomSession = () => {
    const weightNum = Math.max(1, parseInt(newSessionWeight, 10) || 1);
    const existingCount = recordsForSelectedDate.length;

    recordAttendance(subject.id, {
      date: selectedDate,
      slotIndex: existingCount,
      timeSlot: newSessionTime.trim() || undefined,
      type: newSessionType,
      weight: weightNum,
      status: 'present',
    });

    setNewSessionTime('');
    setNewSessionType('lecture');
    setNewSessionWeight('1');
    setIsAddSessionModalVisible(false);
  };

  const cycleStatus = (record: AttendanceRecord) => {
    const nextStatusMap: Record<AttendanceStatus, AttendanceStatus> = {
      present: 'absent',
      absent: 'duty_leave',
      duty_leave: 'cancelled',
      cancelled: 'present',
    };
    updateAttendanceRecord(subject.id, record.id, {
      status: nextStatusMap[record.status],
    });
  };

  const handlePrediction = async () => {
    setLoading(true);
    try {
      const result = PredictionService.evaluate(subject);
      setPredictionResult(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate bunk prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Top Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft size={22} color={isDarkMode ? '#F8FAFC' : '#1E293B'} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.title, isDarkMode && styles.darkText]} numberOfLines={1}>
            {subject.name}
          </Text>
          {subject.code ? (
            <Text
              style={[styles.headerSub, isDarkMode && styles.darkSubText]}
              textBreakStrategy="simple"
            >
              {subject.code} • Target {subject.targetPercentage}%{' '}
            </Text>
          ) : (
            <Text
              style={[styles.headerSub, isDarkMode && styles.darkSubText]}
              textBreakStrategy="simple"
            >
              Target {subject.targetPercentage}%{' '}
            </Text>
          )}
        </View>

        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Statistics Banner */}
        <View style={[styles.statsCard, isDarkMode && styles.darkStatsCard]}>
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text
                style={[
                  styles.statBig,
                  {
                    color:
                      stats.status === 'safe'
                        ? '#10B981'
                        : stats.status === 'warning'
                        ? '#F59E0B'
                        : '#EF4444',
                  },
                ]}
              >
                {stats.percentage}%
              </Text>
              <Text style={[styles.statLabel, isDarkMode && styles.darkSubText]}>
                Current Attendance
              </Text>
            </View>

            <View style={styles.statCol}>
              <Text style={[styles.statBig, isDarkMode && styles.darkText]}>
                {stats.attendedClasses}/{stats.totalClasses}
              </Text>
              <Text style={[styles.statLabel, isDarkMode && styles.darkSubText]}>
                Classes Attended
              </Text>
            </View>

            <View style={styles.statCol}>
              <Text
                style={[
                  styles.statBig,
                  { color: stats.status === 'safe' ? '#3B82F6' : '#EF4444' },
                ]}
              >
                {stats.status === 'safe' ? `+${stats.safeBunks}` : `-${stats.classesToAttend}`}
              </Text>
              <Text style={[styles.statLabel, isDarkMode && styles.darkSubText]}>
                {stats.status === 'safe' ? 'Bunks Left' : 'Classes Needed'}
              </Text>
            </View>
          </View>
        </View>

        {/* Interactive What-If Simulator Launcher Banner */}
        <TouchableOpacity
          style={[styles.simulatorBanner, isDarkMode && styles.darkSimulatorBanner]}
          onPress={() =>
            router.push({
              pathname: '/simulator/[id]',
              params: { id: subject.id },
            } as any)
          }
          activeOpacity={0.8}
        >
          <View style={styles.simulatorBannerLeft}>
            <View style={styles.simulatorIconWrap}>
              <Sliders size={20} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.simulatorTitleRow}>
                <Text
                  style={[styles.simulatorBannerTitle, isDarkMode && styles.darkText]}
                  textBreakStrategy="simple"
                >
                  What-If Bunk Simulator{' '}
                </Text>
              </View>
              <Text
                style={[styles.simulatorBannerSub, isDarkMode && styles.darkSubText]}
                textBreakStrategy="simple"
              >
                Simulate missed classes, recovery ladders & end-of-term forecast{' '}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={isDarkMode ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>

        {/* Calendar Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CalendarIcon size={18} color="#3B82F6" />
            <Text
              style={[styles.sectionTitle, isDarkMode && styles.darkText]}
              textBreakStrategy="simple"
            >
              Attendance Calendar{' '}
            </Text>
          </View>
          <Text
            style={[styles.instructionText, isDarkMode && styles.darkSubText]}
            textBreakStrategy="simple"
          >
            Tap any date to select or cycle attendance.{' '}
          </Text>

          <RNCalendar
            onDayPress={handleDayPress}
            markedDates={getMarkedDates()}
            theme={{
              selectedDayBackgroundColor: '#3B82F6',
              todayTextColor: '#3B82F6',
              arrowColor: '#3B82F6',
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              calendarBackground: isDarkMode ? '#1E293B' : '#FFFFFF',
              textSectionTitleColor: isDarkMode ? '#94A3B8' : '#64748B',
              dayTextColor: isDarkMode ? '#F8FAFC' : '#0F172A',
              monthTextColor: isDarkMode ? '#F8FAFC' : '#0F172A',
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 14,
              textMonthFontSize: 15,
            }}
          />

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text
                style={[styles.legendText, isDarkMode && styles.darkSubText]}
                textBreakStrategy="simple"
              >
                Present{' '}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text
                style={[styles.legendText, isDarkMode && styles.darkSubText]}
                textBreakStrategy="simple"
              >
                Absent{' '}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text
                style={[styles.legendText, isDarkMode && styles.darkSubText]}
                textBreakStrategy="simple"
              >
                Duty Leave (OD){' '}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#94A3B8' }]} />
              <Text
                style={[styles.legendText, isDarkMode && styles.darkSubText]}
                textBreakStrategy="simple"
              >
                Cancelled{' '}
              </Text>
            </View>
          </View>
        </View>

        {/* Selected Date Session Manager (Solves multiple classes per day!) */}
        <View style={styles.section}>
          <View style={styles.dateHeaderRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text
                style={[styles.sectionTitle, isDarkMode && styles.darkText]}
                textBreakStrategy="simple"
              >
                Classes on {selectedDate}{' '}
              </Text>
              <Text
                style={[styles.subLabel, isDarkMode && styles.darkSubText]}
                textBreakStrategy="simple"
              >
                Tap status to cycle • Add multiple periods/labs{' '}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addSlotBtn}
              onPress={() => setIsAddSessionModalVisible(true)}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addSlotBtnText}>Add Slot</Text>
            </TouchableOpacity>
          </View>

          {recordsForSelectedDate.length > 0 ? (
            recordsForSelectedDate.map((record, index) => {
              const statusColor =
                record.status === 'present'
                  ? '#10B981'
                  : record.status === 'absent'
                  ? '#EF4444'
                  : record.status === 'duty_leave'
                  ? '#3B82F6'
                  : '#64748B';

              return (
                <View
                  key={record.id}
                  style={[styles.sessionCard, isDarkMode && styles.darkSessionCard]}
                >
                  <View style={styles.sessionLeft}>
                    <View style={styles.sessionHeader}>
                      <Text style={[styles.sessionIndexText, isDarkMode && styles.darkText]}>
                        Class #{index + 1}
                      </Text>
                      <View style={styles.sessionTypeTag}>
                        <Text style={styles.sessionTypeTagText}>
                          {record.type.toUpperCase()}
                          {record.weight > 1 ? ` (${record.weight}x)` : ''}
                        </Text>
                      </View>
                    </View>
                    {record.timeSlot ? (
                      <View style={styles.timeRow}>
                        <Clock size={12} color="#64748B" />
                        <Text style={styles.timeText}>{record.timeSlot}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.sessionRight}>
                    <TouchableOpacity
                      style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}
                      onPress={() => cycleStatus(record)}
                    >
                      <Text
                        style={[styles.statusBadgeText, { color: statusColor }]}
                        textBreakStrategy="simple"
                      >
                        {record.status === 'present'
                          ? 'Present'
                          : record.status === 'absent'
                          ? 'Absent'
                          : record.status === 'duty_leave'
                          ? 'Duty (OD)'
                          : 'Cancelled'}{' '}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.delSlotBtn}
                      onPress={() => deleteAttendanceRecord(subject.id, record.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={[styles.emptyDateBox, isDarkMode && styles.darkEmptyDateBox]}>
              <Text style={[styles.emptyDateText, isDarkMode && styles.darkSubText]}>
                No classes recorded for {selectedDate}. Tap "+ Add Slot" to log a period.
              </Text>
            </View>
          )}
        </View>

        {/* Prediction Factors */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Prediction Factors & Settings
          </Text>

          <DropdownPicker
            label="Class Importance / Weight"
            value={subject.importance}
            options={['Low', 'Medium', 'High']}
            onValueChange={(value) => updateSubject({ ...subject, importance: value as any })}
          />

          <ToggleSwitch
            label="Upcoming Test or Assignment"
            value={subject.hasUpcomingTest}
            onValueChange={(value) => updateSubject({ ...subject, hasUpcomingTest: value })}
          />

          <DropdownPicker
            label="Professor Strictness"
            value={subject.professorStrictness}
            options={['Low', 'Medium', 'High']}
            onValueChange={(value) =>
              updateSubject({ ...subject, professorStrictness: value as any })
            }
          />
        </View>

        {/* Bunk Analysis Button */}
        <TouchableOpacity
          style={styles.predictButton}
          onPress={handlePrediction}
          disabled={loading || stats.totalClasses === 0}
        >
          <Text style={styles.predictButtonText}>
            {loading ? 'Evaluating Risk Matrix...' : 'Should I Bunk This Subject?'}
          </Text>
        </TouchableOpacity>

        {/* Prediction Result Display */}
        {predictionResult && (() => {
          const isSafe = predictionResult.safeToBunk;
          const verdict = predictionResult.verdict;
          const verdictColor =
            verdict === 'SAFE_TO_BUNK'
              ? '#10B981'
              : verdict === 'CAUTION_BORDERLINE'
              ? '#F59E0B'
              : '#EF4444';

          const verdictLabel =
            verdict === 'SAFE_TO_BUNK'
              ? 'Safe to Bunk'
              : verdict === 'CAUTION_BORDERLINE'
              ? 'Caution (Borderline)'
              : verdict === 'DO_NOT_BUNK'
              ? 'Do Not Bunk'
              : 'Critical Deficit';

          return (
            <View style={[styles.resultCard, isDarkMode && styles.darkResultCard]}>
              {/* Verdict Header Badge */}
              <View style={styles.verdictHeader}>
                <View style={[styles.verdictBadge, { backgroundColor: verdictColor + '20' }]}>
                  {isSafe ? (
                    <ShieldCheck size={16} color={verdictColor} />
                  ) : (
                    <ShieldAlert size={16} color={verdictColor} />
                  )}
                  <Text style={[styles.verdictBadgeText, { color: verdictColor }]}>
                    {verdictLabel}
                  </Text>
                </View>

                <Text style={[styles.scoreValue, { color: verdictColor }]}>
                  {predictionResult.safetyScore}
                  <Text style={styles.scoreMax}>/100</Text>
                </Text>
              </View>

              {/* Safety Score Meter Bar */}
              <View style={styles.scoreMeterTrack}>
                <View
                  style={[
                    styles.scoreMeterFill,
                    {
                      width: `${Math.min(100, Math.max(5, predictionResult.safetyScore))}%`,
                      backgroundColor: verdictColor,
                    },
                  ]}
                />
              </View>

              {/* Headline & Advice */}
              <Text style={[styles.resultHeadline, isDarkMode && styles.darkText]}>
                {predictionResult.headline}
              </Text>
              <Text style={[styles.resultAdvice, isDarkMode && styles.darkSubText]}>
                {predictionResult.tacticalAdvice}
              </Text>

              {/* Projection Comparison Box */}
              <View style={[styles.projectionBox, isDarkMode && styles.darkProjectionBox]}>
                <View style={styles.projectionCol}>
                  <Text style={styles.projectionColLabel}>Current</Text>
                  <Text style={[styles.projectionColVal, isDarkMode && styles.darkText]}>
                    {predictionResult.currentPercentage}%
                  </Text>
                  <Text style={styles.projectionColSub}>
                    Buffer: {predictionResult.currentBuffer}
                  </Text>
                </View>

                <View style={styles.projectionArrowWrap}>
                  <TrendingDown size={18} color="#EF4444" />
                </View>

                <View style={styles.projectionCol}>
                  <Text style={styles.projectionColLabel}>If Missed</Text>
                  <Text
                    style={[
                      styles.projectionColVal,
                      {
                        color:
                          predictionResult.projectedPercentageAfterBunk >= subject.targetPercentage
                            ? '#10B981'
                            : '#EF4444',
                      },
                    ]}
                  >
                    {predictionResult.projectedPercentageAfterBunk}%
                  </Text>
                  <Text style={styles.projectionColSub}>
                    Buffer: {predictionResult.projectedBufferAfterBunk}
                  </Text>
                </View>
              </View>

              {/* Risk Factors List */}
              {predictionResult.riskFactors && predictionResult.riskFactors.length > 0 && (
                <View style={styles.riskFactorsContainer}>
                  <Text style={[styles.riskFactorsTitle, isDarkMode && styles.darkText]}>
                    Risk Factors Analyzed:
                  </Text>
                  {predictionResult.riskFactors.map((rf, idx) => (
                    <View key={idx} style={styles.riskFactorRow}>
                      <View
                        style={[
                          styles.riskFactorDot,
                          {
                            backgroundColor:
                              rf.impact === 'positive'
                                ? '#10B981'
                                : rf.impact === 'negative'
                                ? '#EF4444'
                                : '#64748B',
                          },
                        ]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.riskFactorName, isDarkMode && styles.darkText]}>
                          {rf.name}
                        </Text>
                        <Text style={[styles.riskFactorDesc, isDarkMode && styles.darkSubText]}>
                          {rf.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Launch Simulator Button */}
              <TouchableOpacity
                style={styles.openSimulatorButton}
                onPress={() =>
                  router.push({
                    pathname: '/simulator/[id]',
                    params: { id: subject.id },
                  } as any)
                }
                activeOpacity={0.8}
              >
                <Sliders size={16} color="#FFFFFF" />
                <Text style={styles.openSimulatorButtonText}>
                  Explore In What-If Simulator
                </Text>
              </TouchableOpacity>
            </View>
          );
        })()}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Custom Session Modal */}
      <Modal
        visible={isAddSessionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddSessionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, isDarkMode && styles.darkModalBox]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Add Class Slot on {selectedDate}
            </Text>

            <DropdownPicker
              label="Session Type"
              value={
                newSessionType === 'lab'
                  ? 'Laboratory'
                  : newSessionType === 'tutorial'
                  ? 'Tutorial'
                  : 'Lecture'
              }
              options={['Lecture', 'Laboratory', 'Tutorial']}
              onValueChange={(val) => {
                if (val === 'Laboratory') {
                  setNewSessionType('lab');
                  setNewSessionWeight('2');
                } else if (val === 'Tutorial') {
                  setNewSessionType('tutorial');
                  setNewSessionWeight('1');
                } else {
                  setNewSessionType('lecture');
                  setNewSessionWeight('1');
                }
              }}
            />

            <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
              Time Slot (Optional)
            </Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="e.g. 09:00 - 10:00"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              value={newSessionTime}
              onChangeText={setNewSessionTime}
            />

            <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
              Attendance Weight (Credits)
            </Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="1"
              keyboardType="numeric"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              value={newSessionWeight}
              onChangeText={setNewSessionWeight}
              maxLength={2}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setIsAddSessionModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn]}
                onPress={handleAddCustomSession}
              >
                <Check size={16} color="#FFFFFF" />
                <Text style={styles.modalSaveBtnText}>Add Class</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  darkHeader: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkStatsCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  simulatorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  darkSimulatorBanner: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F640',
  },
  simulatorBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  simulatorIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simulatorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  simulatorBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  simulatorBannerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
  },
  statBig: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  subLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  instructionText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
    paddingRight: 8,
    includeFontPadding: false,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addSlotBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkSessionCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  sessionLeft: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionIndexText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sessionTypeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sessionTypeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  delSlotBtn: {
    padding: 6,
  },
  emptyDateBox: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  darkEmptyDateBox: {
    backgroundColor: '#1E293B',
  },
  emptyDateText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  predictButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
  },
  predictButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  darkResultCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  verdictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verdictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  verdictBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
  },
  scoreMeterTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  scoreMeterFill: {
    height: '100%',
    borderRadius: 4,
  },
  resultHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  resultAdvice: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 14,
  },
  projectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  darkProjectionBox: {
    backgroundColor: '#0F172A',
  },
  projectionCol: {
    alignItems: 'center',
  },
  projectionColLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  projectionColVal: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  projectionColSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  projectionArrowWrap: {
    paddingHorizontal: 8,
  },
  riskFactorsContainer: {
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  riskFactorsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  riskFactorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  riskFactorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  riskFactorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  riskFactorDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  openSimulatorButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  openSimulatorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  darkModalBox: {
    backgroundColor: '#1E293B',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 14,
  },
  darkInput: {
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modalCancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  modalCancelBtnText: {
    color: '#475569',
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: '#3B82F6',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  darkText: {
    color: '#F8FAFC',
  },
  darkSubText: {
    color: '#94A3B8',
  },
});
