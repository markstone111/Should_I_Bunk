// mobile-app/utils/NotificationService.ts

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { TimetableSlot } from '@/types/attendance';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  /**
   * Request push notification permissions safely
   */
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return false;
      }

      // Android requires a default channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Should I Bunk Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B82F6',
        });
      }

      return true;
    } catch (error) {
      console.warn('Notification permission error:', error);
      return false;
    }
  }

  /**
   * Schedules a daily morning briefing at given hour:minute (e.g. 8:00 AM)
   */
  static async scheduleDailyBriefing(
    hour: number = 8,
    minute: number = 0,
    classesCount: number,
    safeBunks: number,
    dangerCount: number
  ) {
    if (Platform.OS === 'web') return;

    try {
      // Cancel previous briefing
      await this.cancelNotificationWithIdentifier('daily-morning-briefing');

      let body = `You have ${classesCount} classes scheduled today.`;
      if (dangerCount > 0) {
        body += ` ⚠️ ${dangerCount} subject(s) in danger zone!`;
      } else {
        body += ` Safe bunks available: ${safeBunks}.`;
      }

      await Notifications.scheduleNotificationAsync({
        identifier: 'daily-morning-briefing',
        content: {
          title: '☀️ Good Morning • Should I Bunk?',
          body,
          sound: true,
          data: { type: 'morning_briefing' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    } catch (error) {
      console.warn('Failed to schedule morning briefing:', error);
    }
  }

  /**
   * Send an immediate high-priority alert if attendance drops below target
   */
  static async sendDangerZoneAlert(
    subjectName: string,
    currentPercentage: number,
    targetPercentage: number
  ) {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Danger Zone Triggered!',
          body: `Your attendance in "${subjectName}" dropped to ${currentPercentage}% (Target: ${targetPercentage}%). Bunking is strictly prohibited!`,
          sound: true,
          data: { type: 'danger_alert', subjectName },
        },
        trigger: null, // send immediately
      });
    } catch (error) {
      console.warn('Failed to send danger alert:', error);
    }
  }

  /**
   * Schedules a reminder 10 minutes before a specific class begins
   */
  static async scheduleClassReminder(
    slot: TimetableSlot,
    subjectName: string,
    safeBunks: number
  ) {
    if (Platform.OS === 'web') return;

    try {
      const [startHourStr, startMinStr] = slot.startTime.split(':');
      const startHour = parseInt(startHourStr, 10);
      const startMin = parseInt(startMinStr, 10);

      if (isNaN(startHour) || isNaN(startMin)) return;

      // 10 minutes before
      let reminderHour = startHour;
      let reminderMin = startMin - 10;
      if (reminderMin < 0) {
        reminderHour -= 1;
        reminderMin += 60;
      }
      if (reminderHour < 0) reminderHour = 23;

      const bufferMsg =
        safeBunks > 0
          ? `Safe buffer: ${safeBunks} bunks available ✅`
          : `Zero buffer: Attend to maintain % ⚠️`;

      await Notifications.scheduleNotificationAsync({
        identifier: `class-reminder-${slot.id}`,
        content: {
          title: `🔔 Upcoming: ${subjectName} (${slot.type.toUpperCase()})`,
          body: `Class starts in 10 minutes at ${slot.startTime}. ${bufferMsg}`,
          sound: true,
          data: { type: 'class_reminder', slotId: slot.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: slot.dayOfWeek === 7 ? 1 : slot.dayOfWeek + 1, // Expo weekday 1=Sun, 2=Mon...
          hour: reminderHour,
          minute: reminderMin,
        },
      });
    } catch (error) {
      console.warn('Failed to schedule class reminder:', error);
    }
  }

  /**
   * Cancel specific notification by identifier
   */
  static async cancelNotificationWithIdentifier(identifier: string) {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAll() {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      // ignore
    }
  }
}
