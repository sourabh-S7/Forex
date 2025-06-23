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

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <TradeProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Add Trade') {
                  iconName = focused ? 'add-circle' : 'add-circle-outline';
                } else if (route.name === 'Stats') {
                  iconName = focused ? 'analytics' : 'analytics-outline';
                } else if (route.name === 'History') {
                  iconName = focused ? 'list' : 'list-outline';
                } else if (route.name === 'Notifications') {
                  iconName = focused ? 'notifications' : 'notifications-outline';
                }
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#3B82F6',
              tabBarInactiveTintColor: '#6B7280',
              tabBarStyle: {
                backgroundColor: '#000003',
                borderTopWidth: 1,
                borderTopColor: '#000003',
                paddingBottom: 5,
                paddingTop: 5,
                height: 70,
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
            <Tab.Screen name="Add Trade" component={AddTradeScreen} />
            <Tab.Screen name="Stats" component={StatsScreen} />
            <Tab.Screen name="History" component={TradeHistoryScreen} />
            <Tab.Screen name="Notifications" component={NotificationScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </TradeProvider>
    </SafeAreaProvider>
  );
}