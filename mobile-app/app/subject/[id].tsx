import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { useApp } from '@/context/AppContext';
import { DropdownPicker } from '@/components/DropdownPicker';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { PredictionService } from '@/utils/PredictionService';

export default function SubjectScreen() {
  const { id } = useLocalSearchParams();
  const { subjects, updateSubject, isDarkMode } = useApp();
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const subject = subjects.find(s => s.id === id);

  if (!subject) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
          Subject not found
        </Text>
      </SafeAreaView>
    );
  }

  const attendancePercentage = subject.totalClasses > 0 
    ? Math.round((subject.attendedClasses / subject.totalClasses) * 100)
    : 0;

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    const existingAttendance = subject.attendance.find(a => a.date === dateString);
    
    let newAttendance;
    let newTotalClasses = subject.totalClasses;
    let newAttendedClasses = subject.attendedClasses;

    if (existingAttendance) {
      // Three-state cycle: present → absent → unmarked
      if (existingAttendance.present) {
        // Present se Absent (keep in total classes, but mark as absent)
        newAttendedClasses -= 1;
        newAttendance = subject.attendance.map(a => 
          a.date === dateString ? { ...a, present: false } : a
        );
      } else {
        // Absent Se Unmarked (remove from total classes and attendance)
        newTotalClasses -= 1;
        newAttendance = subject.attendance.filter(a => a.date !== dateString);
      }
    } else {
      // Unmarked Se Present (add to total classes and mark as present)
      newTotalClasses += 1;
      newAttendedClasses += 1;
      newAttendance = [...subject.attendance, { date: dateString, present: true }];
    }

    const updatedSubject = {
      ...subject,
      attendance: newAttendance,
      totalClasses: newTotalClasses,
      attendedClasses: newAttendedClasses,
    };

    updateSubject(updatedSubject);
  };

  const getMarkedDates = () => {
    const marked = {};
    subject.attendance.forEach(a => {
      marked[a.date] = {
        selected: true,
        selectedColor: a.present ? '#10B981' : '#EF4444',
        selectedTextColor: '#FFFFFF',
      };
    });
    return marked;
  };

  const handlePrediction = async () => {
    setLoading(true);
    try {
      const result = await PredictionService.predict({
        attendance_percentage: attendancePercentage,
        total_classes: subject.totalClasses,
        classes_attended: subject.attendedClasses,
        class_importance: subject.importance,
        upcoming_test: subject.hasUpcomingTest,
        professor_strictness: subject.professorStrictness,
      });
      setPredictionResult(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDarkMode ? '#FFFFFF' : '#374151'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          {subject.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Attendance Calendar
          </Text>
          <Text style={[styles.instructionText, isDarkMode && styles.darkSubText]}>
            Tap dates to cycle: Unmarked → Present → Absent → Unmarked
          </Text>
          <RNCalendar
            onDayPress={handleDayPress}
            markedDates={getMarkedDates()}
            theme={{
              selectedDayBackgroundColor: '#3B82F6',
              todayTextColor: '#3B82F6',
              arrowColor: '#3B82F6',
              backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
              calendarBackground: isDarkMode ? '#1F2937' : '#FFFFFF',
              textSectionTitleColor: isDarkMode ? '#FFFFFF' : '#2d4150',
              dayTextColor: isDarkMode ? '#FFFFFF' : '#2d4150',
              monthTextColor: isDarkMode ? '#FFFFFF' : '#2d4150',
              indicatorColor: isDarkMode ? '#FFFFFF' : '#2d4150',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
            }}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.legendText, isDarkMode && styles.darkSubText]}>
                Present
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.legendText, isDarkMode && styles.darkSubText]}>
                Absent
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#9CA3AF' }]} />
              <Text style={[styles.legendText, isDarkMode && styles.darkSubText]}>
                Unmarked
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Statistics
          </Text>
          <View style={[styles.statsContainer, isDarkMode && styles.darkStatsContainer]}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{attendancePercentage}%</Text>
              <Text style={[styles.statLabel, isDarkMode && styles.darkSubText]}>
                Attendance
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{subject.totalClasses}</Text>
              <Text style={[styles.statLabel, isDarkMode && styles.darkSubText]}>
                Total Classes
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{subject.attendedClasses}</Text>
              <Text style={[styles.statLabel, isDarkMode && styles.darkSubText]}>
                Attended
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Prediction Factors
          </Text>
          
          <DropdownPicker
            label="Class Importance"
            value={subject.importance}
            options={['Low', 'Medium', 'High']}
            onValueChange={(value) => updateSubject({ ...subject, importance: value })}
          />

          <ToggleSwitch
            label="Upcoming Test"
            value={subject.hasUpcomingTest}
            onValueChange={(value) => updateSubject({ ...subject, hasUpcomingTest: value })}
          />

          <DropdownPicker
            label="Professor Strictness"
            value={subject.professorStrictness}
            options={['Low', 'Medium', 'High']}
            onValueChange={(value) => updateSubject({ ...subject, professorStrictness: value })}
          />
        </View>

        <TouchableOpacity 
          style={styles.predictButton} 
          onPress={handlePrediction}
          disabled={loading || subject.totalClasses === 0}
        >
          <Text style={styles.predictButtonText}>
            {loading ? 'Analyzing...' : 'Should I Bunk?'}
          </Text>
        </TouchableOpacity>

        {predictionResult && (
          <View style={[styles.resultContainer, isDarkMode && styles.darkResultContainer]}>
            <Text style={[styles.resultTitle, isDarkMode && styles.darkText]}>
              {predictionResult.safe_to_bunk ? '✅ Safe to Bunk' : '❌ Better Attend'}
            </Text>
            <Text style={styles.resultPercentage}>
              Confidence: {Math.round(predictionResult.probability * 100)}%
            </Text>
            <Text style={[styles.resultAdvice, isDarkMode && styles.darkSubText]}>
              {predictionResult.advice}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  darkHeader: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSubText: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  darkStatsContainer: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  predictButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  predictButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  darkResultContainer: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  resultPercentage: {
    fontSize: 16,
    color: '#3B82F6',
    marginBottom: 15,
  },
  resultAdvice: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
