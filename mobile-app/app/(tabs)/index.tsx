// mobile-app/app/(tabs)/index.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
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
} from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { DrawerLayout } from '@/components/DrawerLayout';
import { AddSubjectModal } from '@/components/AddSubjectModal';
import { EditSubjectModal } from '@/components/EditSubjectModal';
import { SubjectListItem } from '@/components/SubjectListItem';
import { Subject } from '@/types/attendance';

export default function HomeScreen() {
  const { subjects, isDarkMode, overallStats } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // Filter subjects by search and archive status
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

  return (
    <DrawerLayout isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        {/* Top Header */}
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

        <View style={styles.content}>
          {/* Semester Overview Dashboard Card */}
          {activeTab === 'active' && subjects.length > 0 && (
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
                {/* Overall Attendance */}
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

                {/* Safe Bunks Bank */}
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

                {/* Danger Subjects */}
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
                Active Subjects ({subjects.filter((s) => !s.isArchived).length})
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

          {/* Subjects List */}
          {displayedSubjects.length > 0 ? (
            <FlatList
              data={displayedSubjects}
              renderItem={renderSubject}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
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
  content: {
    flex: 1,
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
  listContainer: {
    paddingBottom: 24,
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
