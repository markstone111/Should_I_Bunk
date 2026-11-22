// mobile-app/components/SubjectListItem.tsx

import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Trash2, Edit3, Archive, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { Subject } from '@/types/attendance';
import { calculateSubjectStats } from '@/utils/attendanceCalculator';

interface SubjectItemProps {
  subject: Subject;
  onPress: (subjectId: string) => void;
  onEdit: (subject: Subject) => void;
}

export const SubjectListItem: React.FC<SubjectItemProps> = ({ subject, onPress, onEdit }) => {
  const { isDarkMode, deleteSubject, archiveSubject, unarchiveSubject } = useApp();
  const stats = calculateSubjectStats(subject);

  const handleDelete = () => {
    Alert.alert(
      'Delete Subject',
      `Are you sure you want to permanently delete "${subject.name}" and all its records?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSubject(subject.id),
        },
      ]
    );
  };

  const handleToggleArchive = () => {
    if (subject.isArchived) {
      unarchiveSubject(subject.id);
    } else {
      Alert.alert(
        'Archive Subject',
        `Archive "${subject.name}"? It will be hidden from the active timetable and statistics.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Archive', onPress: () => archiveSubject(subject.id) },
        ]
      );
    }
  };

  // Color coding by safety tier
  const percentageColor =
    stats.status === 'safe' ? '#10B981' : stats.status === 'warning' ? '#F59E0B' : '#EF4444';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.card, isDarkMode && styles.darkCard]}
      onPress={() => onPress(subject.id)}
    >
      {/* Accent Color Strip */}
      <View style={[styles.colorStrip, { backgroundColor: subject.color || '#3B82F6' }]} />

      <View style={styles.cardContent}>
        {/* Header row: Name + Code + Percentage */}
        <View style={styles.headerRow}>
          <View style={styles.titleArea}>
            <Text
              style={[styles.name, isDarkMode && styles.darkText]}
              numberOfLines={1}
              textBreakStrategy="simple"
            >
              {subject.name}{' '}
            </Text>
            {subject.code ? (
              <Text
                style={[styles.code, isDarkMode && styles.darkSubText]}
                textBreakStrategy="simple"
              >
                {subject.code}{' '}
              </Text>
            ) : null}
          </View>

          <View style={styles.percentageBadge}>
            <Text
              style={[styles.percentageValue, { color: percentageColor }]}
              textBreakStrategy="simple"
            >
              {stats.percentage}%{' '}
            </Text>
            <Text
              style={[styles.targetLabel, isDarkMode && styles.darkSubText]}
              textBreakStrategy="simple"
            >
              Target: {stats.targetPercentage}%{' '}
            </Text>
          </View>
        </View>

        {/* Attendance stats counts */}
        <View style={styles.statsRow}>
          <Text
            style={[styles.statsText, isDarkMode && styles.darkSubText]}
            textBreakStrategy="simple"
          >
            {stats.attendedClasses} / {stats.totalClasses} attended{' '}
          </Text>

          {/* Buffer or Deficit Badge */}
          {stats.status === 'safe' ? (
            <View style={styles.bufferBadgeSafe}>
              <CheckCircle2 size={12} color="#10B981" />
              <Text style={styles.bufferTextSafe} textBreakStrategy="simple">
                {stats.safeBunks > 0 ? `Can bunk ${stats.safeBunks}` : 'On track'}{' '}
              </Text>
            </View>
          ) : (
            <View style={styles.bufferBadgeDanger}>
              <AlertCircle size={12} color="#EF4444" />
              <Text style={styles.bufferTextDanger} textBreakStrategy="simple">
                Attend next {stats.classesToAttend}{' '}
              </Text>
            </View>
          )}
        </View>

        {/* Action icons row */}
        <View style={styles.actionRow}>
          <View style={styles.metaTags}>
            <Text style={[styles.tag, isDarkMode && styles.darkTag]}>
              Strictness: {subject.professorStrictness}
            </Text>
            {subject.hasUpcomingTest && (
              <Text style={styles.testTag}>Upcoming Test</Text>
            )}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onEdit(subject);
              }}
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Edit3 size={17} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleToggleArchive();
              }}
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Archive size={17} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={17} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SubjectListItem;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  darkCard: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  colorStrip: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleArea: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  code: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  percentageBadge: {
    alignItems: 'flex-end',
    minWidth: 80,
    flexShrink: 0,
    paddingLeft: 6,
  },
  percentageValue: {
    fontSize: 18,
    fontWeight: '800',
    includeFontPadding: false,
  },
  targetLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    includeFontPadding: false,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  bufferBadgeSafe: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  bufferTextSafe: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  bufferBadgeDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  bufferTextDanger: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 11,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  darkTag: {
    backgroundColor: '#0F172A',
    color: '#94A3B8',
  },
  testTag: {
    fontSize: 11,
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  darkText: {
    color: '#F8FAFC',
  },
  darkSubText: {
    color: '#94A3B8',
  },
});
