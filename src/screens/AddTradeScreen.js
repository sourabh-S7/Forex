import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useTrades } from '../context/TradeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Major forex pairs
const FOREX_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'CHF/JPY', 'EUR/CHF', 'AUD/JPY', 'GBP/CHF',
  'XAU/USD', 'XAG/USD', 'WTI/USD', 'BTC/USD', 'ETH/USD'
];

const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'];

export default function AddTradeScreen() {
  const { addTrade } = useTrades();
  const [formData, setFormData] = useState({
    instrument: '',
    tradeType: 'buy',
    entryPrice: '',
    exitPrice: '',
    stopLoss: '',
    lotSize: '',
    timeframe: 'H1',
    entryDate: new Date().toISOString().split('T')[0],
    entryTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
    notes: '',
    strategy: '',
  });

  const handleSubmit = async () => {
    if (!formData.instrument || !formData.entryPrice || !formData.lotSize) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const trade = {
      ...formData,
      entryPrice: parseFloat(formData.entryPrice),
      exitPrice: formData.exitPrice ? parseFloat(formData.exitPrice) : null,
      stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
      lotSize: parseFloat(formData.lotSize),
    };

    try {
      await addTrade(trade);
      Alert.alert('Success', 'Trade added successfully!');
      setFormData({
        instrument: '',
        tradeType: 'buy',
        entryPrice: '',
        exitPrice: '',
        stopLoss: '',
        lotSize: '',
        timeframe: 'H1',
        entryDate: new Date().toISOString().split('T')[0],
        entryTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
        notes: '',
        strategy: '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to add trade');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <LinearGradient
        colors={['#020617', '#0f172a', '#1e293b']}
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView 
            className="flex-1 px-6" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {/* Header Section */}
            <View className="mb-8 pt-4">
              <View className="flex-row items-center justify-center">
                <LinearGradient
                  colors={['#3B82F6', '#1D4ED8', '#1E40AF']}
                  className="w-2 h-12 rounded-full mr-4"
                />
                <View className="flex-1">
                  <Text className="text-3xl font-black text-white mb-1 tracking-tight">
                    Forex
                  </Text>
                  <Text className="text-blue-300 text-lg font-medium">
                    Log your forex trades
                  </Text>
                </View>
              </View>
            </View>

            {/* Currency Pair Section */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-blue-600 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="trending-up" size={24} color="#FFFFFF" />
                </View>
                <Text className="text-xl font-bold text-white">Currency Pair</Text>
              </View>
              
              <View className="rounded-2xl border-2 border-blue-500/30 shadow-xl overflow-hidden">
                <View className="bg-slate-800/80 backdrop-blur-sm rounded-2xl">
                  <Picker
                    selectedValue={formData.instrument}
                    onValueChange={(value) => setFormData({ ...formData, instrument: value })}
                    style={{ 
                      height: 60, 
                      color: '#F1F5F9',
                      backgroundColor: 'transparent'
                    }}
                    dropdownIconColor="#3B82F6"
                    itemStyle={{
                      backgroundColor: '#1e293b',
                      color: '#F1F5F9',
                      fontSize: 18,
                      fontWeight: '600'
                    }}
                  >
                    <Picker.Item label="Select Currency Pair" value="" style={{ color: '#64748B' }} />
                    {FOREX_PAIRS.map(pair => (
                      <Picker.Item 
                        key={pair} 
                        label={pair} 
                        value={pair} 
                        style={{ 
                          color: '#F1F5F9',
                          backgroundColor: '#1e293b',
                          fontSize: 18,
                          fontWeight: '600'
                        }} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            {/* Trade Direction & Timeframe */}
            <View className="flex-row mb-6 gap-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-blue-600 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="swap-horizontal" size={24} color="#FFFFFF" />
                  </View>
                  <Text className="text-xl font-bold text-white">Direction</Text>
                </View>
                
                <View className="rounded-2xl border-2 border-blue-500/30 shadow-xl overflow-hidden">
                  <View className="bg-slate-800/80 backdrop-blur-sm rounded-2xl">
                    <Picker
                      selectedValue={formData.tradeType}
                      onValueChange={(value) => setFormData({ ...formData, tradeType: value })}
                      style={{ 
                        height: 60, 
                        color: '#F1F5F9',
                        backgroundColor: 'transparent'
                      }}
                      dropdownIconColor="#3B82F6"
                    >
                      <Picker.Item 
                        label="📈 Buy" 
                        value="buy" 
                        style={{ 
                          color: '#10B981',
                          backgroundColor: '#1e293b',
                          fontSize: 18,
                          fontWeight: '600'
                        }} 
                      />
                      <Picker.Item 
                        label="📉 Sell" 
                        value="sell" 
                        style={{ 
                          color: '#EF4444',
                          backgroundColor: '#1e293b',
                          fontSize: 18,
                          fontWeight: '600'
                        }} 
                      />
                    </Picker>
                  </View>
                </View>
              </View>
              
              <View className="flex-1">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-blue-600 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="time" size={24} color="#FFFFFF" />
                  </View>
                  <Text className="text-xl font-bold text-white">Timeframe</Text>
                </View>
                
                <View className="rounded-2xl border-2 border-blue-500/30 shadow-xl overflow-hidden">
                  <View className="bg-slate-800/80 backdrop-blur-sm rounded-2xl">
                    <Picker
                      selectedValue={formData.timeframe}
                      onValueChange={(value) => setFormData({ ...formData, timeframe: value })}
                      style={{ 
                        height: 60, 
                        color: '#F1F5F9',
                        backgroundColor: 'transparent'
                      }}
                      dropdownIconColor="#3B82F6"
                    >
                      {TIMEFRAMES.map(tf => (
                        <Picker.Item 
                          key={tf} 
                          label={tf} 
                          value={tf} 
                          style={{ 
                            color: '#F1F5F9',
                            backgroundColor: '#1e293b',
                            fontSize: 18,
                            fontWeight: '600'
                          }} 
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            {/* Entry Price & Exit Price */}
            <View className="flex-row mb-6 gap-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-blue-600 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="enter" size={24} color="#FFFFFF" />
                  </View>
                  <Text className="text-xl font-bold text-white">Entry Price</Text>
                </View>
                
                <View className="rounded-2xl border-2 border-blue-500/30 shadow-xl overflow-hidden">
                  <TextInput
                    className="px-6 py-5 text-white text-xl font-bold bg-slate-800/80 backdrop-blur-sm rounded-2xl"
                    placeholder="1.1234"
                    value={formData.entryPrice}
                    onChangeText={(text) => setFormData({ ...formData, entryPrice: text })}
                    keyboardType="numeric"
                    placeholderTextColor="#64748B"
                    style={{ 
                      textAlign: 'center',
                      letterSpacing: 1
                    }}
                  />
                </View>
              </View>
              
              <View className="flex-1">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-green-600 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="exit" size={24} color="#FFFFFF" />
                  </View>
                  <Text className="text-xl font-bold text-white">Exit Price</Text>
                </View>
                
                <View className="rounded-2xl border-2 border-green-500/30 shadow-xl overflow-hidden">
                  <TextInput
                    className="px-6 py-5 text-white text-xl font-bold bg-slate-800/80 backdrop-blur-sm rounded-2xl"
                    placeholder="1.1300"
                    value={formData.exitPrice}
                    onChangeText={(text) => setFormData({ ...formData, exitPrice: text })}
                    keyboardType="numeric"
                    placeholderTextColor="#64748B"
                    style={{ 
                      textAlign: 'center',
                      letterSpacing: 1
                    }}
                  />
                </View>
              </View>
            </View>
            
            {/* Stop Loss */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-red-600 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="shield" size={24} color="#FFFFFF" />
                </View>
                <Text className="text-xl font-bold text-white">Stop Loss</Text>
              </View>
              
              <View className="rounded-2xl border-2 border-red-500/30 shadow-xl overflow-hidden">
                <TextInput
                  className="px-6 py-5 text-white text-xl font-bold bg-slate-800/80 backdrop-blur-sm rounded-2xl"
                  placeholder="1.1200"
                  value={formData.stopLoss}
                  onChangeText={(text) => setFormData({ ...formData, stopLoss: text })}
                  keyboardType="numeric"
                  placeholderTextColor="#64748B"
                  style={{ 
                    textAlign: 'center',
                    letterSpacing: 1
                  }}
                />
              </View>
            </View>

            {/* Lot Size */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-blue-600 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="resize" size={24} color="#FFFFFF" />
                </View>
                <Text className="text-xl font-bold text-white">Lot Size</Text>
              </View>
              
              <View className="rounded-2xl border-2 border-blue-500/30 shadow-xl overflow-hidden">
                <TextInput
                  className="px-8 py-6 text-white text-2xl font-black bg-slate-800/80 backdrop-blur-sm rounded-2xl"
                  placeholder="0.10"
                  value={formData.lotSize}
                  onChangeText={(text) => setFormData({ ...formData, lotSize: text })}
                  keyboardType="numeric"
                  placeholderTextColor="#64748B"
                  style={{ 
                    textAlign: 'center',
                    letterSpacing: 2
                  }}
                />
              </View>
            </View>

            {/* Entry Date & Time */}
            <View className="flex-row mb-6 gap-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-blue-600 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="calendar" size={24} color="#FFFFFF" />
                  </View>
                  <Text className="text-xl font-bold text-white">Date</Text>
                </View>
                
                <View className="rounded-2xl border-2 border-blue-500/30 shadow-xl overflow-hidden">
                  <TextInput
                    className="px-6 py-5 text-white text-lg font-bold bg-slate-800/80 backdrop-blur-sm rounded-2xl"
                    placeholder="YYYY-MM-DD"
                    value={formData.entryDate}
                    onChangeText={(text) => setFormData({ ...formData, entryDate: text })}
                    placeholderTextColor="#64748B"
                    style={{ 
                      textAlign: 'center',
                      letterSpacing: 1
                    }}
                  />
                </View>
              </View>
              
              <View className="flex-1">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-blue-600 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="time" size={24} color="#FFFFFF" />
                  </View>
                  <Text className="text-xl font-bold text-white">Time</Text>
                </View>
                
                <View className="rounded-2xl border-2 border-blue-500/30 shadow-xl overflow-hidden">
                  <TextInput
                    className="px-6 py-5 text-white text-lg font-bold bg-slate-800/80 backdrop-blur-sm rounded-2xl"
                    placeholder="HH:MM"
                    value={formData.entryTime}
                    onChangeText={(text) => setFormData({ ...formData, entryTime: text })}
                    placeholderTextColor="#64748B"
                    style={{ 
                      textAlign: 'center',
                      letterSpacing: 2
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Strategy */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-blue-600 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="bulb" size={24} color="#FFFFFF" />
                </View>
                <Text className="text-xl font-bold text-white">Trading Strategy</Text>
              </View>
              
              <View className="rounded-2xl border-2 border-blue-500/30 shadow-xl overflow-hidden">
                <TextInput
                  className="px-6 py-6 text-white text-lg font-semibold bg-slate-800/80 backdrop-blur-sm rounded-2xl"
                  placeholder="e.g., Support/Resistance, Trend Following, Breakout"
                  value={formData.strategy}
                  onChangeText={(text) => setFormData({ ...formData, strategy: text })}
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            {/* Notes */}
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-blue-600 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="document-text" size={24} color="#FFFFFF" />
                </View>
                <Text className="text-xl font-bold text-white">Trade Notes</Text>
              </View>
              
              <View className="rounded-2xl border-2 border-blue-500/30 shadow-xl overflow-hidden">
                <TextInput
                  className="px-6 py-6 text-white text-lg font-medium bg-slate-800/80 backdrop-blur-sm rounded-2xl"
                  placeholder="Market analysis, trade rationale, lessons learned, key observations..."
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#64748B"
                  style={{ minHeight: 120 }}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="shadow-2xl mb-4"
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1D4ED8', '#3B82F6', '#60A5FA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl py-7 px-8 border-2 border-blue-400/30"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="add-circle" size={28} color="#FFFFFF" />
                  <Text className="text-white text-center text-2xl font-black ml-4 tracking-wide">
                    Add Trade
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}