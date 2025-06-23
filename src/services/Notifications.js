import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DAYS_OF_WEEK = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 0 },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

export default function NotificationScreen() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]); // Monday to Friday
  const [selectedHour, setSelectedHour] = useState('17'); // 5 PM
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [customMessage, setCustomMessage] = useState('Time to check the markets and plan your trades! 📈');
  const [notificationIds, setNotificationIds] = useState([]);

  useEffect(() => {
    requestPermissions();
    loadSettings();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications to receive trading reminders.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadSettings = async () => {
    // In a real app, you'd load these from AsyncStorage
    // For now, we'll use the default values
  };

  const saveSettings = async () => {
    // In a real app, you'd save these to AsyncStorage
    // For now, we'll just schedule the notifications
  };

  const getNextOccurrence = (dayOfWeek, hour, minute) => {
    const now = new Date();
    const targetDate = new Date();
    
    // Set target time
    targetDate.setHours(hour, minute, 0, 0);
    
    // Calculate days until target day
    const currentDay = now.getDay();
    let daysUntilTarget = dayOfWeek - currentDay;
    
    // If target day is today but time has passed, schedule for next week
    if (daysUntilTarget === 0 && now >= targetDate) {
      daysUntilTarget = 7;
    }
    
    // If target day is in the past this week, schedule for next week
    if (daysUntilTarget < 0) {
      daysUntilTarget += 7;
    }
    
    // Set the target date
    targetDate.setDate(now.getDate() + daysUntilTarget);
    
    return targetDate;
  };

  const scheduleNotifications = async () => {
    try {
      // Cancel existing notifications
      await cancelAllNotifications();

      if (!isEnabled) {
        Alert.alert(
          'Success',
          'All trading reminders have been disabled.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (selectedDays.length === 0) {
        Alert.alert(
          'Error',
          'Please select at least one day for notifications.',
          [{ text: 'OK' }]
        );
        return;
      }

      const newNotificationIds = [];

      for (const dayOfWeek of selectedDays) {
        const targetDate = getNextOccurrence(
          dayOfWeek, 
          parseInt(selectedHour), 
          parseInt(selectedMinute)
        );

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Trading Reminder 📊',
            body: customMessage,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            date: targetDate,
            repeats: true,
            // Use seconds for weekly repeat (7 days = 604800 seconds)
            repeatInterval: 604800,
          },
        });
        newNotificationIds.push(notificationId);
      }

      setNotificationIds(newNotificationIds);
      await saveSettings();
      
      const dayNames = selectedDays
        .map(day => DAYS_OF_WEEK.find(d => d.value === day)?.label)
        .join(', ');
      
      Alert.alert(
        'Success',
        `Trading reminders have been scheduled for ${dayNames} at ${selectedHour}:${selectedMinute}!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      Alert.alert(
        'Error',
        'Failed to schedule notifications. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const cancelAllNotifications = async () => {
    try {
      if (notificationIds.length > 0) {
        for (const id of notificationIds) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }
      setNotificationIds([]);
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  };

  const toggleDay = (dayValue) => {
    setSelectedDays(prev => {
      if (prev.includes(dayValue)) {
        return prev.filter(day => day !== dayValue);
      } else {
        return [...prev, dayValue].sort();
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <LinearGradient
        colors={['#020617', '#0f172a', '#1e293b']}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Header Section */}
          <View className="mb-6 pt-4 px-6">
            <View className="flex-row items-center justify-center">
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8', '#1E3A8A']}
                className="w-2 h-12 rounded-full mr-4"
              />
              <View className="flex-1">
                <Text className="text-3xl font-black text-white mb-1 tracking-tight">
                  Notifications
                </Text>
                <Text className="text-blue-300 text-lg font-medium">
                  Trading reminders & alerts
                </Text>
              </View>
            </View>
          </View>

          {/* Main Settings Container */}
          <View className="mx-6 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl">
            <View className="p-6">
              
              {/* Enable/Disable Toggle */}
              <View className="mb-6">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="notifications" size={20} color="#FFFFFF" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-white">Trading Reminders</Text>
                      <Text className="text-slate-400 text-sm mt-1">
                        Get notified when it's time to trade
                      </Text>
                    </View>
                  </View>
                  <Switch
                    trackColor={{ false: '#374151', true: '#3B82F6' }}
                    thumbColor={isEnabled ? '#60A5FA' : '#9CA3AF'}
                    ios_backgroundColor="#374151"
                    onValueChange={setIsEnabled}
                    value={isEnabled}
                  />
                </View>
              </View>

              {isEnabled && (
                <>
                  {/* Time Selection */}
                  <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="time" size={20} color="#FFFFFF" />
                      </View>
                      <Text className="text-lg font-bold text-white">Notification Time</Text>
                    </View>
                    
                    <View className="flex-row gap-4">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-slate-300 mb-2">Hour</Text>
                        <View className="rounded-xl border border-blue-500/30 shadow-xl overflow-hidden">
                          <View className="bg-slate-800 rounded-xl">
                            <Picker
                              selectedValue={selectedHour}
                              onValueChange={setSelectedHour}
                              style={{ 
                                height: 50, 
                                color: '#F1F5F9',
                                backgroundColor: 'transparent'
                              }}
                              dropdownIconColor="#3B82F6"
                            >
                              {HOURS.map(hour => (
                                <Picker.Item 
                                  key={hour} 
                                  label={`${hour}:00`} 
                                  value={hour}
                                  style={{ 
                                    color: '#F1F5F9',
                                    backgroundColor: '#1e293b',
                                    fontSize: 16,
                                    fontWeight: '600'
                                  }} 
                                />
                              ))}
                            </Picker>
                          </View>
                        </View>
                      </View>
                      
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-slate-300 mb-2">Minute</Text>
                        <View className="rounded-xl border border-blue-500/30 shadow-xl overflow-hidden">
                          <View className="bg-slate-800 rounded-xl">
                            <Picker
                              selectedValue={selectedMinute}
                              onValueChange={setSelectedMinute}
                              style={{ 
                                height: 50, 
                                color: '#F1F5F9',
                                backgroundColor: 'transparent'
                              }}
                              dropdownIconColor="#3B82F6"
                            >
                              {MINUTES.map(minute => (
                                <Picker.Item 
                                  key={minute} 
                                  label={minute} 
                                  value={minute}
                                  style={{ 
                                    color: '#F1F5F9',
                                    backgroundColor: '#1e293b',
                                    fontSize: 16,
                                    fontWeight: '600'
                                  }} 
                                />
                              ))}
                            </Picker>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Days Selection */}
                  <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="calendar" size={20} color="#FFFFFF" />
                      </View>
                      <Text className="text-lg font-bold text-white">Days of the Week</Text>
                    </View>
                    
                    <View className="bg-slate-800/50 rounded-xl p-4 border border-blue-500/20">
                      {DAYS_OF_WEEK.map(day => (
                        <TouchableOpacity
                          key={day.value}
                          className={`flex-row items-center justify-between py-3 px-4 mb-2 rounded-lg ${
                            selectedDays.includes(day.value) 
                              ? 'bg-blue-600/20 border border-blue-500/40' 
                              : 'bg-slate-700/30'
                          }`}
                          onPress={() => toggleDay(day.value)}
                        >
                          <Text className={`font-semibold ${
                            selectedDays.includes(day.value) ? 'text-blue-300' : 'text-slate-300'
                          }`}>
                            {day.label}
                          </Text>
                          {selectedDays.includes(day.value) && (
                            <Ionicons name="checkmark-circle" size={20} color="#60A5FA" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Custom Message */}
                  <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
                      </View>
                      <Text className="text-lg font-bold text-white">Custom Message</Text>
                    </View>
                    
                    <View className="rounded-xl border border-blue-500/30 shadow-xl overflow-hidden">
                      <TextInput
                        className="px-5 py-5 text-white text-base font-medium bg-slate-800 rounded-xl"
                        placeholder="Enter your custom notification message..."
                        value={customMessage}
                        onChangeText={setCustomMessage}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        placeholderTextColor="#64748B"
                        style={{ minHeight: 80 }}
                      />
                    </View>
                  </View>

                  {/* Preview */}
                  <View className="mb-6">
                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="eye" size={20} color="#FFFFFF" />
                      </View>
                      <Text className="text-lg font-bold text-white">Preview</Text>
                    </View>
                    
                    <View className="bg-slate-800/50 rounded-xl p-4 border border-blue-500/20">
                      <Text className="text-blue-300 font-semibold mb-2">📊 Trading Reminder</Text>
                      <Text className="text-slate-300 text-sm mb-3">{customMessage}</Text>
                      <Text className="text-slate-400 text-xs">
                        Scheduled for {selectedHour}:{selectedMinute} on {selectedDays.length} days
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mx-6 mt-6 gap-4">
            {/* Save Settings Button */}
            <TouchableOpacity
              className="shadow-xl"
              onPress={scheduleNotifications}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1D4ED8', '#3B82F6', '#60A5FA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl py-6 px-8 border-2 border-blue-400/30"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="save" size={24} color="#FFFFFF" />
                  <Text className="text-white text-center text-xl font-black ml-3 tracking-wide">
                    Save & Schedule
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}