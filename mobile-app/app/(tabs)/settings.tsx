// mobile-app/app/(tabs)/settings.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Moon,
  Sun,
  Bell,
  Trash2,
  Info,
  MessageCircle,
  Shield,
  Clock,
  Sparkles,
  Percent,
} from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { DropdownPicker } from '@/components/DropdownPicker';

export default function SettingsScreen() {
  const {
    darkMode,
    toggleDarkMode,
    notificationsEnabled,
    toggleNotifications,
    globalTargetPercentage,
    setGlobalTargetPercentage,
    resetAllData,
    isDarkMode,
  } = useApp();

  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to delete all subjects, timetable slots, and attendance records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: resetAllData,
        },
      ]
    );
  };

  const handleSendEmail = () => {
    Linking.openURL('mailto:nikunjnehu@gmail.com?subject=Should I Bunk v2 Feedback');
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Appearance</Text>

          <View style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}>
            <View style={styles.settingLeft}>
              {isDarkMode ? <Moon size={20} color="#3B82F6" /> : <Sun size={20} color="#F59E0B" />}
              <View style={styles.settingTextWrap}>
                <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Dark Mode</Text>
                <Text style={[styles.settingSub, isDarkMode && styles.darkSubText]}>
                  {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Smart Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Smart Notifications
          </Text>

          <View style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}>
            <View style={styles.settingLeft}>
              <Bell size={20} color="#3B82F6" />
              <View style={styles.settingTextWrap}>
                <Text style={[styles.settingText, isDarkMode && styles.darkText]}>
                  Smart Attendance Alerts
                </Text>
                <Text style={[styles.settingSub, isDarkMode && styles.darkSubText]}>
                  Morning briefing, pre-class reminders & danger alerts
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          {notificationsEnabled && (
            <View style={[styles.infoBanner, isDarkMode && styles.darkInfoBanner]}>
              <Sparkles size={16} color="#3B82F6" />
              <Text style={[styles.infoBannerText, isDarkMode && styles.darkSubText]}>
                • Daily Briefing at 8:00 AM{'\n'}
                • 10-Minute Pre-Class Alert with Safe Bunk buffer{'\n'}
                • Instant trigger if a bunk drops you below target %
              </Text>
            </View>
          )}
        </View>

        {/* Global Attendance Policy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Default Attendance Target
          </Text>

          <View style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}>
            <View style={styles.settingLeft}>
              <Percent size={20} color="#10B981" />
              <View style={styles.settingTextWrap}>
                <Text style={[styles.settingText, isDarkMode && styles.darkText]}>
                  University Minimum Target
                </Text>
                <Text style={[styles.settingSub, isDarkMode && styles.darkSubText]}>
                  Used for safe buffer calculations (Currently: {globalTargetPercentage}%)
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.pickerWrap}>
            <DropdownPicker
              label="Select Default Percentage Target"
              value={`${globalTargetPercentage}%`}
              options={['65%', '70%', '75%', '80%', '85%', '90%']}
              onValueChange={(val) => {
                const num = parseInt(val.replace('%', ''), 10);
                if (num) setGlobalTargetPercentage(num);
              }}
            />
          </View>
        </View>

        {/* Data & Reset */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Data Management</Text>

          <TouchableOpacity
            style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
            onPress={handleResetData}
          >
            <View style={styles.settingLeft}>
              <Trash2 size={20} color="#EF4444" />
              <View style={styles.settingTextWrap}>
                <Text style={[styles.settingText, styles.dangerText]}>Reset All Data</Text>
                <Text style={[styles.settingSub, isDarkMode && styles.darkSubText]}>
                  Erase all subjects, timetable, and attendance history
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Support & About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>About & Support</Text>

          <TouchableOpacity
            style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
            onPress={() => setHelpModalVisible(true)}
          >
            <View style={styles.settingLeft}>
              <MessageCircle size={20} color={isDarkMode ? '#F8FAFC' : '#334155'} />
              <Text style={[styles.settingText, isDarkMode && styles.darkText]}>
                How It Works & FAQ
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
            onPress={() => setAboutModalVisible(true)}
          >
            <View style={styles.settingLeft}>
              <Info size={20} color={isDarkMode ? '#F8FAFC' : '#334155'} />
              <Text style={[styles.settingText, isDarkMode && styles.darkText]}>About App</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Help / Guide Modal */}
      <Modal
        visible={helpModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDarkMode && styles.darkModalCard]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              How Should I Bunk Works
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
              <Text style={[styles.modalText, isDarkMode && styles.darkSubText]}>
                {`👉 How to use Version 2.0:

• Weekly Timetable:
  Go to the Timetable tab to add your weekly class slots. Once configured, today's classes appear automatically on your Home screen!

• 1-Tap Attendance Marking:
  On the Home screen, tap 'Attended', 'Bunked', or 'Cancelled' directly for any class today.

• Safe Bunk Buffer (B):
  Calculated using exact mathematical formulas. If the buffer is +3, you can miss 3 consecutive classes and still stay above your target percentage.

• Recovery Target (C):
  If your attendance drops below target, the app calculates the exact number of consecutive classes you must attend to climb back into the safe zone.

• Multi-Session Support:
  Open any subject to see its calendar. You can log multiple slots (e.g. morning lecture + afternoon lab) on the same date!

• Duty Leave (OD):
  If you are away on official college duty or sports, mark Duty Leave so your attendance is not penalized.`}
              </Text>
            </ScrollView>

            <TouchableOpacity style={styles.feedbackButton} onPress={handleSendEmail}>
              <Text style={styles.feedbackButtonText}>Send Feedback / Suggestions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setHelpModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={aboutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDarkMode && styles.darkModalCard]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              About Should I Bunk?
            </Text>
            <Text style={[styles.modalText, isDarkMode && styles.darkSubText]}>
              Version 2.0.0{'\n\n'}
              Empowering college students to manage attendance responsibly, avoid debarment, and make the most out of university life.{'\n\n'}
              Developed with ❤️ by Nikunj Maheshwari
            </Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAboutModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  darkSettingItem: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextWrap: {
    marginLeft: 12,
    flex: 1,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  settingSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dangerText: {
    color: '#EF4444',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  darkInfoBanner: {
    backgroundColor: '#172554',
  },
  infoBannerText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
    flex: 1,
  },
  pickerWrap: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 420,
  },
  darkModalCard: {
    backgroundColor: '#1E293B',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 16,
  },
  feedbackButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  closeButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  darkText: {
    color: '#F8FAFC',
  },
  darkSubText: {
    color: '#94A3B8',
  },
});
