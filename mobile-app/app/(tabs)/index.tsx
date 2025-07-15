import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Menu, Plus, Search } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { DrawerLayout } from '@/components/DrawerLayout';
import { AddSubjectModal } from '@/components/AddSubjectModal';

export default function HomeScreen() {
  const { subjects, isDarkMode } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const renderSubject = ({ item }) => (
    <TouchableOpacity
      style={[styles.subjectCard, isDarkMode && styles.darkSubjectCard]}
      onPress={() => router.push(`/subject/${item.id}`)}
    >
      <View style={styles.subjectHeader}>
        <Text style={[styles.subjectName, isDarkMode && styles.darkText]}>
          {item.name}
        </Text>
        <Text style={styles.attendancePercentage}>
          {item.totalClasses > 0 
            ? `${Math.round((item.attendedClasses / item.totalClasses) * 100)}%`
            : '0%'
          }
        </Text>
      </View>
      <Text style={[styles.subjectStats, isDarkMode && styles.darkSubText]}>
        {item.attendedClasses}/{item.totalClasses} classes attended
      </Text>
    </TouchableOpacity>
  );

  return (
    <DrawerLayout
      isOpen={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
    >
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={[styles.header, isDarkMode && styles.darkHeader]}>
          <TouchableOpacity onPress={() => setIsDrawerOpen(true)}>
            <Menu size={24} color={isDarkMode ? '#FFFFFF' : '#374151'} />
          </TouchableOpacity>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            Should I Bunk?
          </Text>
          <TouchableOpacity onPress={() => setIsAddModalVisible(true)}>
            <Plus size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {subjects.length > 0 ? (
          <View style={styles.content}>
            <View style={[styles.searchContainer, isDarkMode && styles.darkSearchContainer]}>
              <Search size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <TextInput
                style={[styles.searchInput, isDarkMode && { color: '#FFFFFF' }]}
                placeholder="Search subjects..."
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredSubjects}
              renderItem={renderSubject}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, isDarkMode && styles.darkSubText]}>
              No subjects added yet.{'\n'}Tap + to add one!
            </Text>
          </View>
        )}






        <View style={[styles.adBanner, isDarkMode && styles.darkAdBanner]}>
          <Text style={[styles.adText, isDarkMode && styles.darkSubText]}>
            Ad Banner Placeholder
          </Text>
        </View>





        <AddSubjectModal
          visible={isAddModalVisible}
          onClose={() => setIsAddModalVisible(false)}
        />
      </SafeAreaView>
    </DrawerLayout>
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
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  darkSearchContainer: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#374151',
  },
  listContainer: {
    paddingBottom: 20,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  darkSubjectCard: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  attendancePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  subjectStats: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  adBanner: {
    height: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  darkAdBanner: {
    backgroundColor: '#1F2937',
    borderTopColor: '#374151',
  },
  adText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
