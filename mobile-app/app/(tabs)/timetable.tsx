// mobile-app/app/(tabs)/timetable.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Calendar,
} from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { AddTimetableSlotModal } from '@/components/AddTimetableSlotModal';
import { DAYS_OF_WEEK, TimetableSlot } from '@/types/attendance';

export default function TimetableScreen() {
  const { subjects, timetableSlots, deleteTimetableSlot, isDarkMode } = useApp();

  // Default to today's day of week (1 = Mon ... 7 = Sun)
  const currentDay = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(currentDay);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // Filter slots for the currently selected day
  const slotsForDay = timetableSlots
    .filter((slot) => slot.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleDeleteSlot = (slot: TimetableSlot) => {
    const subject = subjects.find((s) => s.id === slot.subjectId);
    Alert.alert(
      'Remove Class Slot',
      `Remove ${subject?.name || 'this class'} at ${slot.startTime} from the timetable?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteTimetableSlot(slot.id),
        },
      ]
    );
  };

  const renderSlot = ({ item }: { item: TimetableSlot }) => {
    const subject = subjects.find((s) => s.id === item.subjectId);
    const subjectColor = subject?.color || '#3B82F6';

    return (
      <View style={[styles.slotCard, isDarkMode && styles.darkSlotCard]}>
        <View style={[styles.colorStrip, { backgroundColor: subjectColor }]} />

        <View style={styles.cardContent}>
          <View style={styles.timeRow}>
            <View style={styles.timeBadge}>
              <Clock size={13} color="#3B82F6" />
              <Text style={styles.timeText}>
                {item.startTime} - {item.endTime}
              </Text>
            </View>

            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {item.type.toUpperCase()}
                {item.type === 'lab' ? ' (2x)' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.mainInfo}>
            <Text style={[styles.subjectName, isDarkMode && styles.darkText]} numberOfLines={1}>
              {subject?.name || 'Unknown Subject'}
            </Text>
            {subject?.code ? (
              <Text style={[styles.subjectCode, isDarkMode && styles.darkSubText]}>
                {subject.code}
              </Text>
            ) : null}
          </View>

          <View style={styles.bottomRow}>
            {item.room ? (
              <View style={styles.roomBadge}>
                <MapPin size={12} color="#64748B" />
                <Text style={styles.roomText}>{item.room}</Text>
              </View>
            ) : (
              <View />
            )}

            <TouchableOpacity
              onPress={() => handleDeleteSlot(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.deleteButton}
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const selectedDayObj = DAYS_OF_WEEK.find((d) => d.id === selectedDay);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <View style={styles.headerTitleWrap}>
          <CalendarDays size={22} color="#3B82F6" />
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
            Weekly Timetable
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setIsAddModalVisible(true)}
          disabled={subjects.filter((s) => !s.isArchived).length === 0}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Slot</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Day Selector Pills */}
      <View style={styles.daySelectorContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={DAYS_OF_WEEK}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.dayList}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedDay;
            const isCurrent = item.id === currentDay;
            const slotCount = timetableSlots.filter((s) => s.dayOfWeek === item.id).length;

            return (
              <TouchableOpacity
                style={[
                  styles.dayPill,
                  isDarkMode && styles.darkDayPill,
                  isSelected && styles.selectedDayPill,
                ]}
                onPress={() => setSelectedDay(item.id)}
              >
                <Text
                  style={[
                    styles.dayPillText,
                    isDarkMode && styles.darkSubText,
                    isSelected && styles.selectedDayPillText,
                  ]}
                >
                  {item.short}
                </Text>
                {slotCount > 0 && (
                  <View
                    style={[
                      styles.countBadge,
                      isSelected && styles.selectedCountBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.countText,
                        isSelected && styles.selectedCountText,
                      ]}
                    >
                      {slotCount}
                    </Text>
                  </View>
                )}
                {isCurrent && <View style={styles.todayIndicator} />}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Schedule List */}
      <View style={styles.content}>
        <View style={styles.dayHeader}>
          <Text style={[styles.dayTitle, isDarkMode && styles.darkText]}>
            {selectedDayObj?.name} Schedule
          </Text>
          <Text style={[styles.dayCount, isDarkMode && styles.darkSubText]}>
            {slotsForDay.length} class{slotsForDay.length === 1 ? '' : 'es'}
          </Text>
        </View>

        {slotsForDay.length > 0 ? (
          <FlatList
            data={slotsForDay}
            renderItem={renderSlot}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.slotsList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={isDarkMode ? '#334155' : '#CBD5E1'} />
            <Text style={[styles.emptyTitle, isDarkMode && styles.darkText]}>
              No classes on {selectedDayObj?.name}
            </Text>
            <Text style={[styles.emptySub, isDarkMode && styles.darkSubText]}>
              Tap the "+ Add Slot" button above to add lectures or labs to this day.
            </Text>
          </View>
        )}
      </View>

      {/* Add Slot Modal */}
      <AddTimetableSlotModal
        visible={isAddModalVisible}
        initialDay={selectedDay}
        onClose={() => setIsAddModalVisible(false)}
      />
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
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  daySelectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dayList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayPill: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    position: 'relative',
    minWidth: 54,
  },
  darkDayPill: {
    backgroundColor: '#1E293B',
  },
  selectedDayPill: {
    backgroundColor: '#3B82F6',
  },
  dayPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  selectedDayPillText: {
    color: '#FFFFFF',
  },
  countBadge: {
    marginTop: 4,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  selectedCountBadge: {
    backgroundColor: '#1D4ED8',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  selectedCountText: {
    color: '#FFFFFF',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  dayCount: {
    fontSize: 13,
    color: '#64748B',
  },
  slotsList: {
    paddingBottom: 24,
  },
  slotCard: {
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
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  darkSlotCard: {
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
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  mainInfo: {
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subjectCode: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomText: {
    fontSize: 12,
    color: '#64748B',
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
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
  },
  emptySub: {
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
