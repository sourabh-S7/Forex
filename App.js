import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TradeProvider } from './src/context/TradeContext';
import AddTradeScreen from './src/screens/AddTradeScreen';
import StatsScreen from './src/screens/StatsScreen';
import TradeHistoryScreen from './src/screens/TradeHistoryScreen';
import NotificationScreen from './src/services/Notifications';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000003" />
      <TradeProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarShowLabel: false,
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                const iconSize = focused ? 30 : 26;
                
                if (route.name === 'Stats') {
                  // Trading charts and analytics
                  iconName = focused ? 'trending-up' : 'bar-chart-outline';
                } else if (route.name === 'Add Trade') {
                  // Adding trades
                  iconName = focused ? 'add' : 'add-circle-outline';
                } else if (route.name === 'History') {
                  // Trade history and records
                  iconName = focused ? 'receipt' : 'document-text-outline';
                } else if (route.name === 'Notifications') {
                  // Alerts and notifications
                  iconName = focused ? 'megaphone' : 'notifications-outline';
                }
                return <Ionicons name={iconName} size={iconSize} color={color} />;
              },
              tabBarActiveTintColor: '#3B82F6',
              tabBarInactiveTintColor: '#64748B',
              tabBarStyle: {
                backgroundColor: '#000003',
                borderTopWidth: 1,
                borderTopColor: '#1F2937',
                paddingBottom: 15,
                paddingTop: 15,
                height: 85,
                elevation: 15,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: -3,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.5,
              },
              tabBarItemStyle: {
                paddingVertical: 5,
              },
              headerStyle: {
                backgroundColor: '#1F2937',
              },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}
          >
            <Tab.Screen name="Stats" component={StatsScreen} />
            <Tab.Screen name="Add Trade" component={AddTradeScreen} />
            <Tab.Screen name="History" component={TradeHistoryScreen} />
            <Tab.Screen name="Notifications" component={NotificationScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </TradeProvider>
    </SafeAreaProvider>
  );
}