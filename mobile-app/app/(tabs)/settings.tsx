// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Moon, Sun, Bell, Trash2, Info, MessageCircle } from 'lucide-react-native';
// import { useApp } from '@/context/AppContext';

// export default function SettingsScreen() {
//   const { darkMode, toggleDarkMode, notificationsEnabled, toggleNotifications, resetAllData, isDarkMode } = useApp();

//   const handleResetData = () => {
//     Alert.alert(
//       'Reset All Data',
//       'Are you sure you want to delete all subjects and attendance data? This action cannot be undone.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Reset', 
//           style: 'destructive',
//           onPress: resetAllData 
//         },
//       ]
//     );
//   };

//   const handleFeedback = () => {
//     Alert.alert('Feedback', 'Feedback feature coming soon!');
//   };

//   const handleAbout = () => {
//     Alert.alert(
//       'About Should I Bunk',
//       'Version 1.0.1\n\nHelping people to manage attendance responsibly to do something productive other than just attending classes/work.\n\nDeveloped with ❤️ by side_end.dev.'
//     );
//   };

//   return (
//     <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
//       <View style={[styles.header, isDarkMode && styles.darkHeader]}>
//         <Text style={[styles.title, isDarkMode && styles.darkText]}>Settings</Text>
//       </View>

//       <View style={styles.content}>
//         <View style={styles.section}>
//           <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Appearance</Text>
          
//           <View style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}>
//             <View style={styles.settingLeft}>
//               {isDarkMode ? (
//                 <Moon size={20} color={isDarkMode ? '#FFFFFF' : '#374151'} />
//               ) : (
//                 <Sun size={20} color="#374151" />
//               )}
//               <Text style={[styles.settingText, isDarkMode && styles.darkText]}>
//                 Dark Mode
//               </Text>
//             </View>
//             <Switch
//               value={darkMode}
//               onValueChange={toggleDarkMode}
//               trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
//               thumbColor={isDarkMode ? '#FFFFFF' : '#F9FAFB'}
//             />
//           </View>
//         </View>







//         <View style={styles.section}>
//           <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Notifications</Text>
          
//           <View style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}>
//             <View style={styles.settingLeft}>
//               <Bell size={20} color={isDarkMode ? '#FFFFFF' : '#374151'} />
//               <Text style={[styles.settingText, isDarkMode && styles.darkText]}>
//                 Low Attendance Reminders
//               </Text>
//             </View>
//             <Switch
//               value={notificationsEnabled}
//               onValueChange={toggleNotifications}
//               trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
//               thumbColor={notificationsEnabled ? '#FFFFFF' : '#F9FAFB'}
//             />
//           </View>
//         </View>








//         <View style={styles.section}>
//           <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Data</Text>
          
//           <TouchableOpacity 
//             style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
//             onPress={handleResetData}
//           >
//             <View style={styles.settingLeft}>
//               <Trash2 size={20} color="#EF4444" />
//               <Text style={[styles.settingText, styles.dangerText]}>
//                 Reset All Data
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.section}>
//           <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Support</Text>
          
//           <TouchableOpacity 
//             style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
//             onPress={handleFeedback}
//           >
//             <View style={styles.settingLeft}>
//               <MessageCircle size={20} color={isDarkMode ? '#FFFFFF' : '#374151'} />
//               <Text style={[styles.settingText, isDarkMode && styles.darkText]}>
//                 Feedback / Help
//               </Text>
//             </View>
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
//             onPress={handleAbout}
//           >
//             <View style={styles.settingLeft}>
//               <Info size={20} color={isDarkMode ? '#FFFFFF' : '#374151'} />
//               <Text style={[styles.settingText, isDarkMode && styles.darkText]}>
//                 About
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   darkContainer: {
//     backgroundColor: '#111827',
//   },
//   header: {
//     padding: 20,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   darkHeader: {
//     backgroundColor: '#1F2937',
//     borderBottomColor: '#374151',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     textAlign: 'center',
//   },
//   darkText: {
//     color: '#FFFFFF',
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   section: {
//     marginBottom: 30,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 15,
//   },
//   settingItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   darkSettingItem: {
//     backgroundColor: '#1F2937',
//     borderColor: '#374151',
//   },
//   settingLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   settingText: {
//     fontSize: 16,
//     color: '#374151',
//     marginLeft: 12,
//   },
//   dangerText: {
//     color: '#EF4444',
//   },
// });





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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Moon,
  Sun,
  Bell,
  Trash2,
  Info,
  MessageCircle,
} from 'lucide-react-native';
import { useApp } from '@/context/AppContext';

export default function SettingsScreen() {
  const {
    darkMode,
    toggleDarkMode,
    notificationsEnabled,
    toggleNotifications,
    resetAllData,
    isDarkMode,
  } = useApp();

  const [modalVisible, setModalVisible] = useState(false); // ✅
  const [aboutModalVisible, setAboutModalVisible] = useState(false);


  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to delete all subjects and attendance data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetAllData,
        },
      ]
    );
  };

  const handleFeedback = () => {
    setModalVisible(true); // ✅ Open modal instead of alert
  };

  // const handleAbout = () => {
  //   Alert.alert(
  //     'About Should I Bunk',
  //     'Version 1.0.1\n\nHelping people to manage attendance responsibly to do something productive other than just attending classes/work.\n\nDeveloped with ❤️ by side_end.dev.'
  //   );
  // };

  const handleAbout = () => {
  setAboutModalVisible(true);
  };


  const handleSendEmail = () => {
    Linking.openURL('mailto:nikunjnehu@gmail.com?subject=Should I Bunk Feedback');
  };

  const [showDarkModeCard, setShowDarkModeCard] = useState(false);

  

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Settings
        </Text>
      </View>

      <View style={styles.content}>
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Appearance
          </Text>

          <View style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}>
            <View style={styles.settingLeft}>
              {isDarkMode ? (
                <Moon size={20} color="#FFFFFF" />
              ) : (
                <Sun size={20} color="#374151" />
              )}
              <Text style={[styles.settingText, isDarkMode && styles.darkText]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={() => {
                toggleDarkMode();
                setShowDarkModeCard(true);
                setTimeout(() => setShowDarkModeCard(false), 2000); // auto hide after 2s
              }}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={isDarkMode ? '#FFFFFF' : '#F9FAFB'}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Notifications
          </Text>

          <View
            style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
          >
            <View style={styles.settingLeft}>
              <Bell size={20} color={isDarkMode ? '#FFFFFF' : '#374151'} />
              <Text style={[styles.settingText, isDarkMode && styles.darkText]}>
                Low Attendance Reminders
              </Text>
            </View>
            <Switch
            
              // value={notificationsEnabled}
              // onValueChange={toggleNotifications}

              value={false} // will be implemented later
              onValueChange={() => {}}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#F9FAFB'}
            />
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Data
          </Text>

          <TouchableOpacity
            style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
            onPress={handleResetData}
          >
            <View style={styles.settingLeft}>
              <Trash2 size={20} color="#EF4444" />
              <Text style={[styles.settingText, styles.dangerText]}>
                Reset All Data
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Support
          </Text>

          <TouchableOpacity
            style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
            onPress={handleFeedback}
          >
            <View style={styles.settingLeft}>
              <MessageCircle
                size={20}
                color={isDarkMode ? '#FFFFFF' : '#374151'}
              />
              <Text style={[styles.settingText, isDarkMode && styles.darkText]}>
                Feedback / Help
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}
            onPress={handleAbout}
          >
            <View style={styles.settingLeft}>
              <Info size={20} color={isDarkMode ? '#FFFFFF' : '#374151'} />
              <Text style={[styles.settingText, isDarkMode && styles.darkText]}>
                About
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ✅ Feedback / Help Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDarkMode && styles.darkModalCard]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Help
            </Text>
            <Text style={[styles.modalText, isDarkMode && styles.darkText]}>
                {`👉 How to use Should I Bunk:
              • Add Subjects: Tap the ➕ icon to add each subject you want to track.
              • Mark Attendance Daily: Open a subject and tap calendar dates to mark yourself present or absent.
              • View Attendance Details: See your attendance %, total classes, and attended classes.
              • Set Class Importance: Choose Low, Medium, or High importance for each subject.
              • Add Professor Strictness: Pick how strict the professor is — Low, Medium, or High.
              • Note Upcoming Tests: Toggle 'Upcoming Test' to Yes if you have one coming.
              • Tap “Should I Bunk?”: Get a smart prediction if it’s safe to bunk today.
              • Get Reminders: Enable Low Attendance Reminders in Settings.
              • Export Reports: Use Export Reports to share subject-wise attendance.
                
              ❓ FAQ:
              • Is my data saved online?
                No — your data stays on your device only.
              • How accurate is the prediction?
                It’s an estimate based on your inputs — use common sense!
              • Can I edit attendance later?
                Yes — open the calendar and update any date.n
              • What if my college has surprise tests?
                Toggle Upcoming Test to Yes to be safer.
              • Can I reset everything?
                Yes — use Reset All Data in Settings.
              • How do I give feedback?
                Tap Send Feedback Email in this section anytime!
                `}
              </Text>


            <Text
              style={[
                styles.modalTitle,
                { marginTop: 20 },
                isDarkMode && styles.darkText,
              ]}
            >
              Feedback
            </Text>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={handleSendEmail}
            >
              <Text style={styles.feedbackButtonText}>Send Feedback Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={aboutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAboutModalVisible(false)}
>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDarkMode && styles.darkModalCard]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              About Should I Bunk
            </Text>
            <Text style={[styles.modalText, isDarkMode && styles.darkText]}>
              Version 1.0.0{'\n\n'}
              Should I Bunk help people to manage attendance responsibly and smartly to do something productive other than just attending classes/work.{'\n\n'}
              Developed with ❤️ by side_end.dev.
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
    {showDarkModeCard && (
      <View style={[styles.toastCard, isDarkMode && styles.darkToastCard]}>
        <Text style={[styles.toastText, isDarkMode && styles.darkText]}>
          it will remain in dark mode bro 😑 as we devs loves it
        </Text>
      </View>
      )}  
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  darkText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  darkSettingItem: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  dangerText: {
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  darkModalCard: {
    backgroundColor: '#1F2937',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#374151',
  },
  feedbackButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  feedbackButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 15,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  toastCard: {
  position: 'absolute',
  bottom: 40,
  left: 20,
  right: 20,
  backgroundColor: '#FFFFFF',
  padding: 16,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  alignItems: 'center',
},
darkToastCard: {
  backgroundColor: '#1F2937',
  borderColor: '#374151',
},
toastText: {
  color: '#374151',
  fontSize: 14,
  textAlign: 'center',
},

});
