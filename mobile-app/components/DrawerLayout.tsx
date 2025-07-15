import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { FileText, Settings, MessageCircle, X } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';


const { width } = Dimensions.get('window');

interface DrawerLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function DrawerLayout({ isOpen, onClose, children }: DrawerLayoutProps) {
  const { isDarkMode , subjects} = useApp();

  // const handleExportReports = () => {
  //   console.log('Export reports');
  //   onClose();
  // };


const handleExportReports = async () => {
  if (Platform.OS === 'web') {
    window.alert('Exporting reports is only available on mobile.');
    onClose();
    return;
  }

  //CSV header
  const headers = ['Subject', 'Total Classes', 'Classes Attended', 'Attendance %'];
  const rows = [headers.join(',')];

  //Add each subject line, safely escape commas if any in names
  subjects.forEach(subject => {
    const percentage = subject.totalClasses > 0
      ? ((subject.attendedClasses / subject.totalClasses) * 100).toFixed(2)
      : '0.00';
    
    //If the name has commas, wrap in double quotes
    const safeName = subject.name.includes(',') ? `"${subject.name}"` : subject.name;

    rows.push([safeName, subject.totalClasses, subject.attendedClasses, `${percentage}%`].join(','));
  });

  //Combine rows into CSV text
  const csvContent = rows.join('\n');

  //Write to file
  const fileUri = FileSystem.cacheDirectory + 'attendance_report.csv';
  await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

  //Share
  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Attendance Report',
    UTI: 'public.comma-separated-values-text',
  });

  onClose();
};

  // const handleFeedback = () => {
  //   console.log('Feedback');
  //   onClose();
  // };

  return (
    <View style={styles.container}>
      {children}
      
      {isOpen && (
        <>
          <TouchableOpacity style={styles.overlay} onPress={onClose} />
          <View style={[styles.drawer, isDarkMode && styles.darkDrawer]}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, isDarkMode && styles.darkText]}>Menu</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={isDarkMode ? '#FFFFFF' : '#374151'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.drawerContent}>
              <TouchableOpacity style={styles.drawerItem} onPress={handleExportReports}>
                <FileText size={20} color={isDarkMode ? '#FFFFFF' : '#374151'} />
                <Text style={[styles.drawerItemText, isDarkMode && styles.darkText]}>
                  Export Reports
                </Text>
              </TouchableOpacity>
              
              {/* <TouchableOpacity style={styles.drawerItem} onPress={handleFeedback}>
                <MessageCircle size={20} color={isDarkMode ? '#FFFFFF' : '#374151'} />
                <Text style={[styles.drawerItemText, isDarkMode && styles.darkText]}>
                  Feedback / Help
                </Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 1001,
    paddingTop: 50,
  },
  darkDrawer: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  darkText: {
    color: '#FFFFFF',
  },
  drawerContent: {
    flex: 1,
    padding: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 15,
  },
});