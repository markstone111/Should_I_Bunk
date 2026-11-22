// mobile-app/app/simulator/[id].tsx

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Minus,
  Sliders,
} from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { calculateSubjectStats } from '@/utils/attendanceCalculator';
import {
  simulateBunkLadder,
  simulateRecoveryLadder,
  simulateSemesterForecast,
} from '@/utils/simulationEngine';

export default function SimulatorScreen() {
  const { id } = useLocalSearchParams();
  const { subjects, isDarkMode } = useApp();

  const [activeTab, setActiveTab] = useState<'bunks' | 'recovery' | 'forecast'>('bunks');
  const [bunkCount, setBunkCount] = useState<number>(1);
  const [attendCount, setAttendCount] = useState<number>(3);
  const [remainingClasses, setRemainingClasses] = useState<number>(20);

  const subject = subjects.find((s) => s.id === id);

  if (!subject) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, isDarkMode && styles.darkText]}>Subject not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Return to Subject</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const stats = calculateSubjectStats(subject);
  const target = subject.targetPercentage || 75;

  // Ladders
  const bunkLadder = useMemo(() => simulateBunkLadder(subject, 8), [subject]);
  const recoveryLadder = useMemo(() => simulateRecoveryLadder(subject, 12), [subject]);
  const forecast = useMemo(
    () => simulateSemesterForecast(subject, remainingClasses, bunkCount),
    [subject, remainingClasses, bunkCount]
  );

  // Selected projections
  const currentBunkPoint =
    bunkLadder.find((p) => p.bunksCount === bunkCount) || bunkLadder[0];
  const currentRecoveryPoint =
    recoveryLadder.find((p) => p.classesAttendedCount === attendCount) || recoveryLadder[0];

  // Dynamic projection based on active tab
  const activeProjectedPct =
    activeTab === 'bunks'
      ? currentBunkPoint.projectedPercentage
      : activeTab === 'recovery'
      ? currentRecoveryPoint.projectedPercentage
      : forecast.plannedCasePercentage;

  const pctDiff = Math.round((activeProjectedPct - target) * 10) / 10;
  const isSafe = activeProjectedPct >= target;
  const isWarning = !isSafe && activeProjectedPct >= target - 5;
  const statusColor = isSafe ? '#10B981' : isWarning ? '#F59E0B' : '#EF4444';

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color={isDarkMode ? '#F8FAFC' : '#1E293B'} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <View style={styles.headerRow}>
            <Sliders size={16} color="#3B82F6" />
            <Text
              style={[styles.headerTitle, isDarkMode && styles.darkText]}
              textBreakStrategy="simple"
            >
              What-If Simulator{' '}
            </Text>
          </View>
          <Text
            style={[styles.headerSub, isDarkMode && styles.darkSubText]}
            textBreakStrategy="simple"
          >
            {subject.name} • Target {target}%{' '}
          </Text>
        </View>

        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Dynamic Live Projected Percentage Hero Card */}
        <View style={[styles.heroCard, isDarkMode && styles.darkHeroCard]}>
          <View style={styles.heroTopRow}>
            <Text
              style={[styles.heroSubtitle, isDarkMode && styles.darkSubText]}
              textBreakStrategy="simple"
            >
              {activeTab === 'bunks'
                ? `Projected After ${bunkCount} Bunk(s)`
                : activeTab === 'recovery'
                ? `Projected After Attending ${attendCount} Class(es)`
                : `End-of-Semester Forecast`}{' '}
            </Text>

            <View style={[styles.pillBadge, { backgroundColor: statusColor + '20' }]}>
              <Text
                style={[styles.pillBadgeText, { color: statusColor }]}
                textBreakStrategy="simple"
              >
                {pctDiff >= 0 ? `+${pctDiff}% Above Target` : `${pctDiff}% Deficit`}{' '}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.heroPct, { color: statusColor }]}
            textBreakStrategy="simple"
          >
            {activeProjectedPct}%{' '}
          </Text>

          <View style={styles.baselineRow}>
            <Text
              style={[styles.baselineText, isDarkMode && styles.darkSubText]}
              textBreakStrategy="simple"
            >
              Current: <Text style={{ fontWeight: '700' }}>{stats.percentage}%</Text> ({stats.attendedClasses}/{stats.totalClasses} classes){' '}
            </Text>

            <Text
              style={[styles.baselineText, isDarkMode && styles.darkSubText]}
              textBreakStrategy="simple"
            >
              Target: <Text style={{ fontWeight: '700' }}>{target}%</Text>{' '}
            </Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabSelector, isDarkMode && styles.darkTabSelector]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'bunks' && styles.activeTabBtn]}
            onPress={() => setActiveTab('bunks')}
          >
            <TrendingDown
              size={15}
              color={activeTab === 'bunks' ? '#FFFFFF' : isDarkMode ? '#94A3B8' : '#64748B'}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'bunks' && styles.activeTabBtnText,
                isDarkMode && activeTab !== 'bunks' && styles.darkSubText,
              ]}
            >
              Simulate Bunks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'recovery' && styles.activeTabBtn]}
            onPress={() => setActiveTab('recovery')}
          >
            <TrendingUp
              size={15}
              color={activeTab === 'recovery' ? '#FFFFFF' : isDarkMode ? '#94A3B8' : '#64748B'}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'recovery' && styles.activeTabBtnText,
                isDarkMode && activeTab !== 'recovery' && styles.darkSubText,
              ]}
            >
              Recovery Path
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'forecast' && styles.activeTabBtn]}
            onPress={() => setActiveTab('forecast')}
          >
            <Calendar
              size={15}
              color={activeTab === 'forecast' ? '#FFFFFF' : isDarkMode ? '#94A3B8' : '#64748B'}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'forecast' && styles.activeTabBtnText,
                isDarkMode && activeTab !== 'forecast' && styles.darkSubText,
              ]}
            >
              Forecast
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: SIMULATE BUNKS */}
        {activeTab === 'bunks' && (
          <View style={styles.sectionWrap}>
            {/* Stepper Card */}
            <View style={[styles.stepperCard, isDarkMode && styles.darkCard]}>
              <Text style={[styles.stepperTitle, isDarkMode && styles.darkText]}>
                How many classes do you want to miss?
              </Text>

              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={[styles.stepBtn, bunkCount <= 0 && styles.disabledStepBtn]}
                  onPress={() => setBunkCount((c) => Math.max(0, c - 1))}
                  disabled={bunkCount <= 0}
                >
                  <Minus size={20} color="#3B82F6" />
                </TouchableOpacity>

                <View style={styles.stepValueWrap}>
                  <Text style={[styles.stepValue, isDarkMode && styles.darkText]}>
                    {bunkCount}
                  </Text>
                  <Text style={styles.stepUnit}>bunk{bunkCount === 1 ? '' : 's'}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.stepBtn, bunkCount >= 10 && styles.disabledStepBtn]}
                  onPress={() => setBunkCount((c) => Math.min(10, c + 1))}
                  disabled={bunkCount >= 10}
                >
                  <Plus size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>

              {/* Quick Preset Chips */}
              <View style={styles.presetsRow}>
                {[1, 2, 3, 4].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.presetChip,
                      bunkCount === num && styles.activePresetChip,
                      isDarkMode && styles.darkPresetChip,
                    ]}
                    onPress={() => setBunkCount(num)}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        bunkCount === num && styles.activePresetText,
                        isDarkMode && bunkCount !== num && styles.darkSubText,
                      ]}
                    >
                      +{num} {num === 4 ? 'Trip' : 'Class'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Status Outcome Message */}
              <View
                style={[
                  styles.outcomeBanner,
                  isSafe ? styles.outcomeSafe : isWarning ? styles.outcomeWarning : styles.outcomeDanger,
                ]}
              >
                {isSafe ? (
                  <CheckCircle2 size={18} color="#059669" />
                ) : (
                  <AlertTriangle size={18} color="#DC2626" />
                )}
                <Text
                  style={[
                    styles.outcomeText,
                    { color: isSafe ? '#065F46' : isWarning ? '#92400E' : '#991B1B' },
                  ]}
                >
                  {isSafe
                    ? `Safe to bunk! After ${bunkCount} absence(s), you will have ${currentBunkPoint.bufferRemaining} safe bunk(s) remaining.`
                    : `Dangerous! After ${bunkCount} absence(s), your attendance falls to ${currentBunkPoint.projectedPercentage}%. You will need to attend ${currentBunkPoint.classesToRecover} consecutive class(es) to recover.`}
                </Text>
              </View>
            </View>

            {/* Projection Step Ladder Table */}
            <View style={[styles.ladderCard, isDarkMode && styles.darkCard]}>
              <Text style={[styles.ladderTitle, isDarkMode && styles.darkText]}>
                Consecutive Bunk Trajectory
              </Text>
              <Text style={[styles.ladderSub, isDarkMode && styles.darkSubText]}>
                Exact drop curve per missed class:
              </Text>

              {bunkLadder.map((point) => {
                const isSelected = point.bunksCount === bunkCount;
                const pointSafe = point.projectedPercentage >= target;
                const pointColor = pointSafe ? '#10B981' : point.projectedPercentage >= target - 5 ? '#F59E0B' : '#EF4444';

                return (
                  <TouchableOpacity
                    key={point.bunksCount}
                    style={[
                      styles.ladderRow,
                      isSelected && styles.ladderRowSelected,
                      isDarkMode && isSelected && styles.darkLadderRowSelected,
                    ]}
                    onPress={() => setBunkCount(point.bunksCount)}
                  >
                    <View style={styles.ladderColLeft}>
                      <Text style={[styles.ladderBunkNum, isDarkMode && styles.darkText]}>
                        {point.bunksCount === 0 ? 'Current Baseline' : `+${point.bunksCount} Bunk${point.bunksCount > 1 ? 's' : ''}`}
                      </Text>
                      <Text style={[styles.ladderClassesTotal, isDarkMode && styles.darkSubText]}>
                        ({point.attendedClasses}/{point.totalClasses} classes)
                      </Text>
                    </View>

                    <View style={styles.ladderColRight}>
                      <Text style={[styles.ladderPct, { color: pointColor }]}>
                        {point.projectedPercentage}%
                      </Text>
                      <View style={[styles.ladderBadge, { backgroundColor: pointColor + '20' }]}>
                        <Text style={[styles.ladderBadgeText, { color: pointColor }]}>
                          {pointSafe ? `${point.bufferRemaining} Buffer` : `Deficit: ${point.classesToRecover} needed`}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 2: RECOVERY PATH */}
        {activeTab === 'recovery' && (
          <View style={styles.sectionWrap}>
            {/* Stepper Card */}
            <View style={[styles.stepperCard, isDarkMode && styles.darkCard]}>
              <Text style={[styles.stepperTitle, isDarkMode && styles.darkText]}>
                How many classes can you attend?
              </Text>

              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={[styles.stepBtn, attendCount <= 0 && styles.disabledStepBtn]}
                  onPress={() => setAttendCount((c) => Math.max(0, c - 1))}
                  disabled={attendCount <= 0}
                >
                  <Minus size={20} color="#10B981" />
                </TouchableOpacity>

                <View style={styles.stepValueWrap}>
                  <Text style={[styles.stepValue, isDarkMode && styles.darkText]}>
                    +{attendCount}
                  </Text>
                  <Text style={styles.stepUnit}>attended</Text>
                </View>

                <TouchableOpacity
                  style={[styles.stepBtn, attendCount >= 20 && styles.disabledStepBtn]}
                  onPress={() => setAttendCount((c) => Math.min(20, c + 1))}
                  disabled={attendCount >= 20}
                >
                  <Plus size={20} color="#10B981" />
                </TouchableOpacity>
              </View>

              {/* Quick Presets */}
              <View style={styles.presetsRow}>
                {[2, 5, 8, 12].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.presetChip,
                      attendCount === num && styles.activePresetChip,
                      isDarkMode && styles.darkPresetChip,
                    ]}
                    onPress={() => setAttendCount(num)}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        attendCount === num && styles.activePresetText,
                        isDarkMode && attendCount !== num && styles.darkSubText,
                      ]}
                    >
                      +{num} Classes
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Status Outcome Message */}
              <View
                style={[
                  styles.outcomeBanner,
                  currentRecoveryPoint.isTargetReached ? styles.outcomeSafe : styles.outcomeWarning,
                ]}
              >
                {currentRecoveryPoint.isTargetReached ? (
                  <CheckCircle2 size={18} color="#059669" />
                ) : (
                  <AlertTriangle size={18} color="#D97706" />
                )}
                <Text
                  style={[
                    styles.outcomeText,
                    {
                      color: currentRecoveryPoint.isTargetReached ? '#065F46' : '#92400E',
                    },
                  ]}
                >
                  {currentRecoveryPoint.isTargetReached
                    ? `Target reached! Attending ${attendCount} classes brings you to ${currentRecoveryPoint.projectedPercentage}% with a ${currentRecoveryPoint.bufferAchieved}-class buffer.`
                    : `Climbing up! Attending ${attendCount} classes raises attendance to ${currentRecoveryPoint.projectedPercentage}%, but you need more to cross ${target}%.`}
                </Text>
              </View>
            </View>

            {/* Recovery Ladder Table */}
            <View style={[styles.ladderCard, isDarkMode && styles.darkCard]}>
              <Text style={[styles.ladderTitle, isDarkMode && styles.darkText]}>
                Recovery Climbing Trajectory
              </Text>
              <Text style={[styles.ladderSub, isDarkMode && styles.darkSubText]}>
                Progress per attended class:
              </Text>

              {recoveryLadder.map((point) => {
                const isSelected = point.classesAttendedCount === attendCount;
                const pointColor = point.isTargetReached ? '#10B981' : '#F59E0B';

                return (
                  <TouchableOpacity
                    key={point.classesAttendedCount}
                    style={[
                      styles.ladderRow,
                      isSelected && styles.ladderRowSelected,
                      isDarkMode && isSelected && styles.darkLadderRowSelected,
                    ]}
                    onPress={() => setAttendCount(point.classesAttendedCount)}
                  >
                    <View style={styles.ladderColLeft}>
                      <Text style={[styles.ladderBunkNum, isDarkMode && styles.darkText]}>
                        {point.classesAttendedCount === 0
                          ? 'Current Baseline'
                          : `+${point.classesAttendedCount} Attended`}
                      </Text>
                      <Text style={[styles.ladderClassesTotal, isDarkMode && styles.darkSubText]}>
                        ({point.attendedClasses}/{point.totalClasses})
                      </Text>
                    </View>

                    <View style={styles.ladderColRight}>
                      <Text style={[styles.ladderPct, { color: pointColor }]}>
                        {point.projectedPercentage}%
                      </Text>
                      <View style={[styles.ladderBadge, { backgroundColor: pointColor + '20' }]}>
                        <Text style={[styles.ladderBadgeText, { color: pointColor }]}>
                          {point.isTargetReached
                            ? `Buffer: +${point.bufferAchieved}`
                            : 'Below Target'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 3: SEMESTER FORECAST */}
        {activeTab === 'forecast' && (
          <View style={styles.sectionWrap}>
            {/* Input remaining classes */}
            <View style={[styles.stepperCard, isDarkMode && styles.darkCard]}>
              <Text style={[styles.stepperTitle, isDarkMode && styles.darkText]}>
                Estimated Classes Remaining in Term
              </Text>

              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={[styles.stepBtn, remainingClasses <= 5 && styles.disabledStepBtn]}
                  onPress={() => setRemainingClasses((r) => Math.max(5, r - 5))}
                  disabled={remainingClasses <= 5}
                >
                  <Minus size={20} color="#3B82F6" />
                </TouchableOpacity>

                <View style={styles.stepValueWrap}>
                  <Text style={[styles.stepValue, isDarkMode && styles.darkText]}>
                    {remainingClasses}
                  </Text>
                  <Text style={styles.stepUnit}>classes left</Text>
                </View>

                <TouchableOpacity
                  style={[styles.stepBtn, remainingClasses >= 60 && styles.disabledStepBtn]}
                  onPress={() => setRemainingClasses((r) => Math.min(60, r + 5))}
                  disabled={remainingClasses >= 60}
                >
                  <Plus size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>

              {/* Presets */}
              <View style={styles.presetsRow}>
                {[10, 20, 30, 45].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.presetChip,
                      remainingClasses === num && styles.activePresetChip,
                      isDarkMode && styles.darkPresetChip,
                    ]}
                    onPress={() => setRemainingClasses(num)}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        remainingClasses === num && styles.activePresetText,
                        isDarkMode && remainingClasses !== num && styles.darkSubText,
                      ]}
                    >
                      {num} Classes
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* High Impact Forecast Cards */}
            <View style={styles.forecastGrid}>
              {/* Best Case */}
              <View style={[styles.forecastCard, isDarkMode && styles.darkCard]}>
                <View style={styles.forecastCardHeader}>
                  <TrendingUp size={18} color="#10B981" />
                  <Text style={styles.forecastCardLabel}>Best Case (100% Attend)</Text>
                </View>
                <Text style={[styles.forecastBigValue, { color: '#10B981' }]}>
                  {forecast.bestCasePercentage}%
                </Text>
                <Text style={[styles.forecastSub, isDarkMode && styles.darkSubText]}>
                  If you attend all {remainingClasses} remaining classes without missing any.
                </Text>
              </View>

              {/* Worst Case */}
              <View style={[styles.forecastCard, isDarkMode && styles.darkCard]}>
                <View style={styles.forecastCardHeader}>
                  <TrendingDown size={18} color="#EF4444" />
                  <Text style={styles.forecastCardLabel}>Worst Case (Bunk All)</Text>
                </View>
                <Text style={[styles.forecastBigValue, { color: '#EF4444' }]}>
                  {forecast.worstCasePercentage}%
                </Text>
                <Text style={[styles.forecastSub, isDarkMode && styles.darkSubText]}>
                  If you miss every remaining class until final exams.
                </Text>
              </View>

              {/* Total Bunk Budget for the semester */}
              <View
                style={[
                  styles.forecastCard,
                  styles.budgetCard,
                  isDarkMode && styles.darkCard,
                ]}
              >
                <View style={styles.forecastCardHeader}>
                  <ShieldCheck size={20} color="#3B82F6" />
                  <Text style={[styles.forecastCardLabel, { color: '#2563EB', fontWeight: '700' }]}>
                    Semester Bunk Budget
                  </Text>
                </View>
                <Text style={[styles.forecastBigValue, { color: '#2563EB' }]}>
                  {forecast.maxBunksAllowedInRemaining} Bunks Max
                </Text>
                <Text style={[styles.forecastSub, isDarkMode && styles.darkSubText]}>
                  You can safely skip up to {forecast.maxBunksAllowedInRemaining} out of {remainingClasses} remaining classes and still maintain your {target}% requirement!
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  darkHeroCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  heroTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroPct: {
    fontSize: 48,
    fontWeight: '900',
    marginVertical: 4,
    letterSpacing: -1,
  },
  baselineRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  baselineText: {
    fontSize: 11,
    color: '#64748B',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  darkTabSelector: {
    backgroundColor: '#1E293B',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  activeTabBtn: {
    backgroundColor: '#3B82F6',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  activeTabBtnText: {
    color: '#FFFFFF',
  },
  sectionWrap: {
    flex: 1,
  },
  stepperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  darkCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  stepperTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 14,
  },
  stepperControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 14,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledStepBtn: {
    opacity: 0.4,
  },
  stepValueWrap: {
    alignItems: 'center',
    minWidth: 90,
  },
  stepValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
  },
  stepUnit: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -2,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  darkPresetChip: {
    backgroundColor: '#0F172A',
  },
  activePresetChip: {
    backgroundColor: '#3B82F6',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  activePresetText: {
    color: '#FFFFFF',
  },
  outcomeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  outcomeSafe: {
    backgroundColor: '#ECFDF5',
  },
  outcomeWarning: {
    backgroundColor: '#FEF3C7',
  },
  outcomeDanger: {
    backgroundColor: '#FEF2F2',
  },
  outcomeText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
  ladderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ladderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  ladderSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
  },
  ladderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  ladderRowSelected: {
    backgroundColor: '#EFF6FF',
  },
  darkLadderRowSelected: {
    backgroundColor: '#1E3A8A',
  },
  ladderColLeft: {
    flex: 1,
  },
  ladderBunkNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  ladderClassesTotal: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  ladderColRight: {
    alignItems: 'flex-end',
  },
  ladderPct: {
    fontSize: 14,
    fontWeight: '800',
  },
  ladderBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  ladderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  forecastGrid: {
    gap: 12,
  },
  forecastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  budgetCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F0F9FF',
  },
  forecastCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  forecastCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  forecastBigValue: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  forecastSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
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
  backBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
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
