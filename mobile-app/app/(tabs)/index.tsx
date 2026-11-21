// mobile-app/app/(tabs)/index.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Menu,
  Plus,
  Search,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Archive,
  BookOpen,
  CalendarDays,
  Clock,
  Check,
  X,
  MinusCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { DrawerLayout } from '@/components/DrawerLayout';
import { AddSubjectModal } from '@/components/AddSubjectModal';
import { EditSubjectModal } from '@/components/EditSubjectModal';
import { SubjectListItem } from '@/components/SubjectListItem';
import { Subject, TodayClassItem, AttendanceStatus } from '@/types/attendance';

export default function HomeScreen() {
  const {
    subjects,
    todayClasses,
    quickMarkTodaySlot,
    isDarkMode,
    overallStats,
  } = useApp();

  const [mainView, setMainView] = useState<'today' | 'subjects'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Filter subjects for the All Subjects view
  const displayedSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.code && subject.code.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesArchive = activeTab === 'archived' ? subject.isArchived : !subject.isArchived;

    return matchesSearch && matchesArchive;
  });

  const renderSubject = ({ item }: { item: Subject }) => (
    <SubjectListItem
      subject={item}
      onPress={(id) => router.push(`/subject/${id}`)}
      onEdit={(subj) => setEditingSubject(subj)}
    />
  );

  const renderTodayClass = (item: TodayClassItem) => {
    const { slot, subject, stats, todayRecord } = item;
    const subjectColor = subject.color || '#3B82F6';
    const isMarked = Boolean(todayRecord);

    return (
      <View
        key={slot.id}
        style={[styles.todayCard, isDarkMode && styles.darkTodayCard]}
      >
        <View style={[styles.colorStrip, { backgroundColor: subjectColor }]} />

        <View style={styles.todayCardContent}>
          {/* Header: Time & Type */}
          <View style={styles.todayCardHeader}>
            <View style={styles.timeWrap}>
              <Clock size={13} color="#2563EB" />
              <Text style={styles.timeText}>
                {slot.startTime} - {slot.endTime}
              </Text>
            </View>

            <View style={styles.typeTag}>
              <Text style={styles.typeTagText}>
                {slot.type.toUpperCase()}
                {slot.type === 'lab' ? ' (2x Weight)' : ''}
              </Text>
            </View>
          </View>

          {/* Subject title & course code */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push(`/subject/${subject.id}`)}
          >
            <Text style={[styles.todaySubjectName, isDarkMode && styles.darkText]} numberOfLines={1}>
              {subject.name}
            </Text>
            {subject.code ? (
              <Text style={[styles.todaySubjectCode, isDarkMode && styles.darkSubText]}>
                {subject.code} {slot.room ? `• ${slot.room}` : ''}
              </Text>
            ) : null}
          </TouchableOpacity>

          {/* Buffer Indicator */}
          <View style={styles.todayBufferRow}>
            <Text style={[styles.attendanceSnapshot, isDarkMode && styles.darkSubText]}>
              Current: <Text style={{ fontWeight: '700', color: stats.status === 'safe' ? '#10B981' : '#EF4444' }}>{stats.percentage}%</Text> (Target: {stats.targetPercentage}%)
            </Text>

            {stats.status === 'safe' ? (
              <View style={styles.bufferPillSafe}>
                <ShieldCheck size={12} color="#059669" />
                <Text style={styles.bufferPillTextSafe}>
                  {stats.safeBunks > 0 ? `${stats.safeBunks} Safe Bunks` : 'On track'}
                </Text>
              </View>
            ) : (
              <View style={styles.bufferPillDanger}>
                <AlertTriangle size={12} color="#DC2626" />
                <Text style={styles.bufferPillTextDanger}>
                  Zero Buffer! Must Attend
                </Text>
              </View>
            )}
          </View>

          {/* Action Row: 1-Tap Attendance or Status Chip */}
          <View style={styles.actionRow}>
            {isMarked ? (
              <View style={styles.markedContainer}>
                <View
                  style={[
                    styles.markedBadge,
                    todayRecord?.status === 'present'
                      ? styles.badgePresent
                      : todayRecord?.status === 'absent'
                      ? styles.badgeAbsent
                      : todayRecord?.status === 'duty_leave'
                      ? styles.badgeDuty
                      : styles.badgeCancelled,
                  ]}
                >
                  <Text style={styles.markedBadgeText}>
                    {todayRecord?.status === 'present'
                      ? '✓ Marked Present'
                      : todayRecord?.status === 'absent'
                      ? '✗ Marked Bunked'
                      : todayRecord?.status === 'duty_leave'
                      ? '🎖️ Marked Duty (OD)'
                      : '🚫 Marked Cancelled'}
                  </Text>
                </View>

                {/* Quick Undo / Cycle */}
                <TouchableOpacity
                  style={styles.undoBtn}
                  onPress={() => quickMarkTodaySlot(slot, todayRecord?.status === 'present' ? 'absent' : 'present')}
                >
                  <RotateCcw size={13} color="#64748B" />
                  <Text style={styles.undoBtnText}>Switch</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.quickMarkButtons}>
                <TouchableOpacity
                  style={[styles.quickMarkBtn, styles.btnAttend]}
                  onPress={() => quickMarkTodaySlot(slot, 'present')}
                >
                  <Check size={14} color="#FFFFFF" />
                  <Text style={styles.btnAttendText}>Attended</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickMarkBtn, styles.btnBunk]}
                  onPress={() => quickMarkTodaySlot(slot, 'absent')}
                >
                  <X size={14} color="#FFFFFF" />
                  <Text style={styles.btnBunkText}>Bunked</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickMarkBtn, styles.btnCancel]}
                  onPress={() => quickMarkTodaySlot(slot, 'cancelled')}
                >
                  <MinusCircle size={14} color="#64748B" />
                  <Text style={styles.btnCancelText}>Cancelled</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <DrawerLayout isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        {/* Header */}
        <View style={[styles.header, isDarkMode && styles.darkHeader]}>
          <TouchableOpacity
            onPress={() => setIsDrawerOpen(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Menu size={24} color={isDarkMode ? '#F8FAFC' : '#1E293B'} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.title, isDarkMode && styles.darkText]}>Should I Bunk?</Text>
            <Text style={[styles.subtitle, isDarkMode && styles.darkSubText]}>
              v2.0 • Attendance Commander
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Plus size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Semester Overview Dashboard Card */}
          {subjects.length > 0 && (
            <View style={[styles.dashboardCard, isDarkMode && styles.darkDashboardCard]}>
              <View style={styles.dashboardHeader}>
                <Text style={[styles.dashboardTitle, isDarkMode && styles.darkText]}>
                  Semester Health
                </Text>
                <View
                  style={[
                    styles.healthBadge,
                    overallStats.overallPercentage >= 75
                      ? styles.badgeGreen
                      : overallStats.overallPercentage >= 70
                      ? styles.badgeAmber
                      : styles.badgeRed,
                  ]}
                >
                  <Text style={styles.healthBadgeText}>
                    {overallStats.overallPercentage >= 75
                      ? 'Safe Zone'
                      : overallStats.overallPercentage >= 70
                      ? 'Warning'
                      : 'Critical'}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text
                    style={[
                      styles.statNumber,
                      {
                        color:
                          overallStats.overallPercentage >= 75
                            ? '#10B981'
                            : overallStats.overallPercentage >= 70
                            ? '#F59E0B'
                            : '#EF4444',
                      },
                    ]}
                  >
                    {overallStats.overallPercentage}%
                  </Text>
                  <Text style={[styles.statSub, isDarkMode && styles.darkSubText]}>
                    Overall ({overallStats.attendedClasses}/{overallStats.totalClasses})
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <View style={styles.rowInline}>
                    <ShieldCheck size={16} color="#3B82F6" />
                    <Text style={[styles.statNumber, { color: '#3B82F6', marginLeft: 4 }]}>
                      {overallStats.totalSafeBunksAvailable}
                    </Text>
                  </View>
                  <Text style={[styles.statSub, isDarkMode && styles.darkSubText]}>
                    Safe Bunk Buffer
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <View style={styles.rowInline}>
                    <AlertTriangle
                      size={16}
                      color={overallStats.dangerSubjectsCount > 0 ? '#EF4444' : '#10B981'}
                    />
                    <Text
                      style={[
                        styles.statNumber,
                        {
                          color: overallStats.dangerSubjectsCount > 0 ? '#EF4444' : '#10B981',
                          marginLeft: 4,
                        },
                      ]}
                    >
                      {overallStats.dangerSubjectsCount}
                    </Text>
                  </View>
                  <Text style={[styles.statSub, isDarkMode && styles.darkSubText]}>
                    In Danger Zone
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Primary View Switcher: Today's Classes vs All Subjects */}
          <View style={[styles.viewSwitcher, isDarkMode && styles.darkViewSwitcher]}>
            <TouchableOpacity
              style={[styles.switchOption, mainView === 'today' && styles.activeSwitchOption]}
              onPress={() => setMainView('today')}
            >
              <CalendarDays
                size={16}
                color={mainView === 'today' ? '#FFFFFF' : isDarkMode ? '#94A3B8' : '#64748B'}
              />
              <Text
                style={[
                  styles.switchOptionText,
                  mainView === 'today' && styles.activeSwitchOptionText,
                  isDarkMode && mainView !== 'today' && styles.darkSubText,
                ]}
              >
                Today's Classes ({todayClasses.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchOption, mainView === 'subjects' && styles.activeSwitchOption]}
              onPress={() => setMainView('subjects')}
            >
              <BookOpen
                size={16}
                color={mainView === 'subjects' ? '#FFFFFF' : isDarkMode ? '#94A3B8' : '#64748B'}
              />
              <Text
                style={[
                  styles.switchOptionText,
                  mainView === 'subjects' && styles.activeSwitchOptionText,
                  isDarkMode && mainView !== 'subjects' && styles.darkSubText,
                ]}
              >
                All Subjects ({subjects.filter((s) => !s.isArchived).length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* VIEW 1: TODAY'S CLASSES */}
          {mainView === 'today' ? (
            <View style={styles.sectionWrap}>
              <View style={styles.todayDateBanner}>
                <Text style={[styles.todayDateTitle, isDarkMode && styles.darkText]}>
                  {todayDateFormatted}
                </Text>
                <Text style={[styles.todayDateSub, isDarkMode && styles.darkSubText]}>
                  {todayClasses.length > 0
                    ? `${todayClasses.length} class${todayClasses.length === 1 ? '' : 'es'} scheduled today`
                    : 'No classes scheduled today'}
                </Text>
              </View>

              {todayClasses.length > 0 ? (
                todayClasses.map(renderTodayClass)
              ) : (
                <View style={[styles.emptyScheduleBox, isDarkMode && styles.darkEmptyScheduleBox]}>
                  <Sparkles size={40} color="#3B82F6" />
                  <Text style={[styles.emptyScheduleTitle, isDarkMode && styles.darkText]}>
                    No classes for today!
                  </Text>
                  <Text style={[styles.emptyScheduleSub, isDarkMode && styles.darkSubText]}>
                    Enjoy your day off or configure your weekly schedule in the Timetable tab.
                  </Text>
                  <TouchableOpacity
                    style={styles.goToTimetableBtn}
                    onPress={() => router.push('/timetable' as any)}
                  >
                    <CalendarDays size={16} color="#FFFFFF" />
                    <Text style={styles.goToTimetableBtnText}>Open Timetable</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            /* VIEW 2: ALL SUBJECTS */
            <View style={styles.sectionWrap}>
              {/* Search Bar */}
              <View style={[styles.searchBar, isDarkMode && styles.darkSearchBar]}>
                <Search size={18} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                <TextInput
                  style={[styles.searchInput, isDarkMode && { color: '#F8FAFC' }]}
                  placeholder="Search subjects or course codes..."
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Tabs: Active vs Archived */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                  onPress={() => setActiveTab('active')}
                >
                  <BookOpen
                    size={16}
                    color={activeTab === 'active' ? '#3B82F6' : isDarkMode ? '#94A3B8' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'active' && styles.activeTabText,
                      isDarkMode && activeTab !== 'active' && styles.darkSubText,
                    ]}
                  >
                    Active ({subjects.filter((s) => !s.isArchived).length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tab, activeTab === 'archived' && styles.activeTab]}
                  onPress={() => setActiveTab('archived')}
                >
                  <Archive
                    size={16}
                    color={activeTab === 'archived' ? '#3B82F6' : isDarkMode ? '#94A3B8' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'archived' && styles.activeTabText,
                      isDarkMode && activeTab !== 'archived' && styles.darkSubText,
                    ]}
                  >
                    Archived ({subjects.filter((s) => s.isArchived).length})
                  </Text>
                </TouchableOpacity>
              </View>

              {displayedSubjects.length > 0 ? (
                displayedSubjects.map((item) => (
                  <SubjectListItem
                    key={item.id}
                    subject={item}
                    onPress={(id) => router.push(`/subject/${id}`)}
                    onEdit={(subj) => setEditingSubject(subj)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Flame size={48} color={isDarkMode ? '#334155' : '#CBD5E1'} />
                  <Text style={[styles.emptyTitle, isDarkMode && styles.darkText]}>
                    {searchQuery
                      ? 'No matching subjects found'
                      : activeTab === 'archived'
                      ? 'No archived subjects'
                      : 'No subjects added yet!'}
                  </Text>
                  <Text style={[styles.emptySubtitle, isDarkMode && styles.darkSubText]}>
                    {searchQuery
                      ? 'Try searching with a different name or course code'
                      : 'Tap the + button above to add your first subject.'}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Add Subject Modal */}
        <AddSubjectModal
          visible={isAddModalVisible}
          onClose={() => setIsAddModalVisible(false)}
        />

        {/* Edit Subject Modal */}
        <EditSubjectModal
          visible={Boolean(editingSubject)}
          subject={editingSubject}
          onClose={() => setEditingSubject(null)}
        />
      </SafeAreaView>
    </DrawerLayout>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  darkHeader: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scrollContent: {
    padding: 16,
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  darkDashboardCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dashboardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeGreen: {
    backgroundColor: '#DCFCE7',
  },
  badgeAmber: {
    backgroundColor: '#FEF3C7',
  },
  badgeRed: {
    backgroundColor: '#FEE2E2',
  },
  healthBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  statSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  darkViewSwitcher: {
    backgroundColor: '#1E293B',
  },
  switchOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  activeSwitchOption: {
    backgroundColor: '#3B82F6',
  },
  switchOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  activeSwitchOptionText: {
    color: '#FFFFFF',
  },
  sectionWrap: {
    flex: 1,
  },
  todayDateBanner: {
    marginBottom: 12,
  },
  todayDateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  todayDateSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  todayCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  darkTodayCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  colorStrip: {
    width: 6,
  },
  todayCardContent: {
    flex: 1,
    padding: 14,
  },
  todayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  typeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  todaySubjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  todaySubjectCode: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  todayBufferRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  attendanceSnapshot: {
    fontSize: 12,
    color: '#475569',
  },
  bufferPillSafe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bufferPillTextSafe: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  bufferPillDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bufferPillTextDanger: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  actionRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quickMarkButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickMarkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  btnAttend: {
    backgroundColor: '#10B981',
  },
  btnAttendText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  btnBunk: {
    backgroundColor: '#EF4444',
  },
  btnBunkText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  btnCancel: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnCancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 12,
  },
  markedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgePresent: {
    backgroundColor: '#DCFCE7',
  },
  badgeAbsent: {
    backgroundColor: '#FEE2E2',
  },
  badgeDuty: {
    backgroundColor: '#DBEAFE',
  },
  badgeCancelled: {
    backgroundColor: '#F1F5F9',
  },
  markedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  undoBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyScheduleBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  darkEmptyScheduleBox: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  emptyScheduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptyScheduleSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 16,
  },
  goToTimetableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  goToTimetableBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  darkSearchBar: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#2563EB',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 14,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
  darkText: {
    color: '#F8FAFC',
  },
  darkSubText: {
    color: '#94A3B8',
  },
});
