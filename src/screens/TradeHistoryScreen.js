import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrades } from '../context/TradeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TradeHistoryScreen() {
  const { trades, deleteTrade } = useTrades();
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // date, profit, loss, earliest
  const [showSortMenu, setShowSortMenu] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString || '00:00';
  };

  // Improved pip calculation based on currency pair specifications
  const calculatePips = (instrument, entryPrice, exitPrice, tradeType) => {
    if (!exitPrice || !entryPrice || !instrument) return 0;
    
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const priceDiff = exit - entry;
    
    // Adjust for trade direction
    const actualDiff = tradeType === 'buy' ? priceDiff : -priceDiff;
    
    // Determine pip value based on currency pair
    let pipValue;
    const upperInstrument = instrument.toUpperCase();
    
    if (upperInstrument.includes('JPY')) {
      // For JPY pairs (e.g., USD/JPY, EUR/JPY), 1 pip = 0.01
      pipValue = 0.01;
    } else if (upperInstrument.includes('XAU') || upperInstrument.includes('GOLD')) {
      // For Gold, 1 pip = 0.1
      pipValue = 0.1;
    } else if (upperInstrument.includes('XAG') || upperInstrument.includes('SILVER')) {
      // For Silver, 1 pip = 0.001
      pipValue = 0.001;
    } else if (upperInstrument.includes('BTC') || upperInstrument.includes('ETH')) {
      // For major cryptocurrencies, 1 pip = 1.0
      pipValue = 1.0;
    } else {
      // For major currency pairs (e.g., EUR/USD, GBP/USD), 1 pip = 0.0001
      pipValue = 0.0001;
    }
    
    return Math.round(actualDiff / pipValue * 10) / 10; // Round to 1 decimal place
  };

  // Improved P&L calculation with more accurate pip values
  const calculatePnL = (instrument, entryPrice, exitPrice, tradeType, lotSize) => {
    if (!exitPrice || !entryPrice || !lotSize || !instrument) return 0;
    
    const pips = calculatePips(instrument, entryPrice, exitPrice, tradeType);
    const lots = parseFloat(lotSize);
    
    // Get pip value in account currency (assuming USD account)
    const pipValuePerLot = getPipValuePerLot(instrument);
    
    return Math.round(pips * pipValuePerLot * lots * 100) / 100; // Round to 2 decimal places
  };

  // Get pip value per standard lot in USD
  const getPipValuePerLot = (instrument) => {
    if (!instrument) return 10;
    
    const upperInstrument = instrument.toUpperCase();
    
    // Major USD pairs where USD is the quote currency
    if (upperInstrument.match(/^(EUR|GBP|AUD|NZD)USD$/)) {
      return 10; // $10 per pip for 1 standard lot
    }
    
    // USD pairs where USD is the base currency (approximate values)
    if (upperInstrument.match(/^USD(CHF|CAD)$/)) {
      return 10; // Approximate $10 per pip
    }
    
    // JPY pairs
    if (upperInstrument.includes('JPY')) {
      if (upperInstrument.startsWith('USD')) {
        return 9.3; // Approximate value, varies with USD/JPY rate
      } else {
        return 9.3; // Approximate for cross-JPY pairs
      }
    }
    
    // Gold (XAU/USD)
    if (upperInstrument.includes('XAU') || upperInstrument.includes('GOLD')) {
      return 10; // $10 per pip (0.1 movement) for 1 oz
    }
    
    // Silver (XAG/USD)
    if (upperInstrument.includes('XAG') || upperInstrument.includes('SILVER')) {
      return 50; // $50 per pip (0.001 movement) for 5000 oz
    }
    
    // Cryptocurrencies (highly volatile, approximate values)
    if (upperInstrument.includes('BTC')) {
      return 10; // Very approximate, varies greatly
    }
    
    if (upperInstrument.includes('ETH')) {
      return 10; // Very approximate, varies greatly
    }
    
    // Cross currency pairs (approximate)
    if (upperInstrument.match(/^(EUR|GBP|AUD|NZD)(CHF|CAD|JPY)$/)) {
      return 10; // Approximate value
    }
    
    // Default fallback
    return 10;
  };

  const handleDeleteTrade = (tradeId) => {
    Alert.alert(
      'Delete Trade',
      'Are you sure you want to delete this trade? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              // Close modal first to prevent navigation context issues
              setShowModal(false);
              setSelectedTrade(null);
              
              // Delete the trade
              deleteTrade(tradeId);
            } catch (error) {
              console.error('Error deleting trade:', error);
              Alert.alert('Error', 'Failed to delete trade. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getSortedTrades = () => {
    const tradesCopy = [...trades];
    
    switch (sortBy) {
      case 'earliest':
        return tradesCopy.sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));
      case 'profit':
        return tradesCopy.sort((a, b) => {
          const pnlA = calculatePnL(a.instrument, a.entryPrice, a.exitPrice, a.tradeType, a.lotSize);
          const pnlB = calculatePnL(b.instrument, b.entryPrice, b.exitPrice, b.tradeType, b.lotSize);
          return pnlB - pnlA;
        });
      case 'loss':
        return tradesCopy.sort((a, b) => {
          const pnlA = calculatePnL(a.instrument, a.entryPrice, a.exitPrice, a.tradeType, a.lotSize);
          const pnlB = calculatePnL(b.instrument, b.entryPrice, b.exitPrice, b.tradeType, b.lotSize);
          return pnlA - pnlB;
        });
      case 'date':
      default:
        return tradesCopy.sort((a, b) => new Date(b.createdAt || b.entryDate) - new Date(a.createdAt || a.entryDate));
    }
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'earliest': return 'Earliest First';
      case 'profit': return 'Highest Profit';
      case 'loss': return 'Highest Loss';
      case 'date':
      default: return 'Latest First';
    }
  };

  // Calculate win rate and other statistics
  const getTradeStatistics = () => {
    if (trades.length === 0) return { winRate: 0, totalPnL: 0, winCount: 0, lossCount: 0 };
    
    let totalPnL = 0;
    let winCount = 0;
    let lossCount = 0;
    
    trades.forEach(trade => {
      const pnl = calculatePnL(trade.instrument, trade.entryPrice, trade.exitPrice, trade.tradeType, trade.lotSize);
      totalPnL += pnl;
      if (pnl >= 0) {
        winCount++;
      } else {
        lossCount++;
      }
    });
    
    const winRate = (winCount / trades.length) * 100;
    
    return { winRate, totalPnL, winCount, lossCount };
  };

  const TradeCard = ({ trade }) => {
    const pips = calculatePips(trade.instrument, trade.entryPrice, trade.exitPrice, trade.tradeType);
    const pnl = calculatePnL(trade.instrument, trade.entryPrice, trade.exitPrice, trade.tradeType, trade.lotSize);

    return (
      <TouchableOpacity
        className="mb-4"
        onPress={() => {
          setSelectedTrade(trade);
          setShowModal(true);
        }}
        activeOpacity={0.8}
      >
        <View className="bg-slate-900/70 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <LinearGradient
            colors={['#1e293b', '#334155', '#475569']}
            className="p-6"
          >
            {/* Header Row */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className={`w-4 h-4 rounded-full mr-3 shadow-lg ${
                  pnl >= 0 ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <Text className="text-xl font-black text-white tracking-wide">{trade.instrument}</Text>
              </View>
              <View className="flex-row items-center bg-slate-800/50 px-3 py-2 rounded-xl border border-blue-500/30">
                <View className={`w-8 h-8 rounded-lg items-center justify-center mr-2 ${
                  trade.tradeType === 'buy' ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  <Ionicons 
                    name={trade.tradeType === 'buy' ? 'arrow-up' : 'arrow-down'} 
                    size={16} 
                    color="#FFFFFF" 
                  />
                </View>
                <Text className={`text-sm font-bold ${
                  trade.tradeType === 'buy' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {trade.tradeType.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* P&L and Pips Row */}
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <Text className={`text-3xl font-black mb-1 ${
                  pnl >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {pnl >= 0 ? '+$' : '-$'}{Math.abs(pnl).toFixed(2)}
                </Text>
                <Text className="text-blue-300 text-sm font-medium">P&L</Text>
              </View>
              <View className="items-end">
                <Text className={`text-xl font-black mb-1 ${
                  pips >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {pips >= 0 ? '+' : ''}{pips} pips
                </Text>
                <Text className="text-blue-300 text-sm font-medium">Movement</Text>
              </View>
            </View>

            {/* Price Details */}
            <View className="flex-row justify-between mb-5 bg-slate-800/30 rounded-2xl p-4 border border-blue-500/20">
              <View className="flex-1">
                <Text className="text-blue-300 text-sm font-medium mb-1">Entry</Text>
                <Text className="text-white text-lg font-bold">{trade.entryPrice}</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-blue-300 text-sm font-medium mb-1">Exit</Text>
                <Text className="text-white text-lg font-bold">{trade.exitPrice}</Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-blue-300 text-sm font-medium mb-1">Lot Size</Text>
                <Text className="text-white text-lg font-bold">{trade.lotSize}</Text>
              </View>
            </View>

            {/* Additional Trade Info */}
            <View className="flex-row justify-between mb-4 bg-slate-800/20 rounded-xl p-3 border border-slate-600/30">
              <View>
                <Text className="text-blue-300 text-xs font-medium mb-1">Timeframe</Text>
                <Text className="text-white text-sm font-bold">{trade.timeframe || 'N/A'}</Text>
              </View>
              {trade.stopLoss && (
                <View className="items-center">
                  <Text className="text-blue-300 text-xs font-medium mb-1">Stop Loss</Text>
                  <Text className="text-white text-sm font-bold">{trade.stopLoss}</Text>
                </View>
              )}
              <View className="items-end">
                <Text className="text-blue-300 text-xs font-medium mb-1">Result</Text>
                <Text className={`text-sm font-bold ${
                  pnl >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {pnl >= 0 ? 'Win' : 'Loss'}
                </Text>
              </View>
            </View>

            {/* Entry Date and Time Only */}
            <View className="flex-row justify-between items-center pt-4 border-t border-slate-700/50">
              <View>
                <Text className="text-blue-300 text-sm font-medium mb-1">Entry Date</Text>
                <Text className="text-slate-300 text-sm font-semibold">
                  {formatDate(trade.entryDate)} {formatTime(trade.entryTime)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-blue-300 text-sm font-medium mb-1">Risk:Reward</Text>
                <Text className="text-slate-300 text-sm font-semibold">
                  {trade.riskReward || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Strategy Badge */}
            {trade.strategy && (
              <View className="mt-4">
                <View className="bg-blue-600/20 border border-blue-500/30 px-4 py-2 rounded-xl self-start">
                  <Text className="text-sm font-bold text-blue-300">{trade.strategy}</Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  const SortMenu = () => (
    <Modal
      visible={showSortMenu}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSortMenu(false)}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPress={() => setShowSortMenu(false)}
      >
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-slate-900 rounded-2xl p-6 w-full max-w-sm border border-slate-700">
            <Text className="text-xl font-black text-white mb-4 text-center">Sort Trades</Text>
            
            {[
              { key: 'date', label: 'Latest First', icon: 'time' },
              { key: 'earliest', label: 'Earliest First', icon: 'time-outline' },
              { key: 'profit', label: 'Highest Profit', icon: 'trending-up' },
              { key: 'loss', label: 'Highest Loss', icon: 'trending-down' }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                className={`flex-row items-center p-4 rounded-xl mb-2 ${
                  sortBy === option.key ? 'bg-blue-600' : 'bg-slate-800'
                }`}
                onPress={() => {
                  setSortBy(option.key);
                  setShowSortMenu(false);
                }}
              >
                <Ionicons 
                  name={option.icon} 
                  size={20} 
                  color={sortBy === option.key ? '#FFFFFF' : '#64748B'} 
                />
                <Text className={`ml-3 font-bold ${
                  sortBy === option.key ? 'text-white' : 'text-slate-400'
                }`}>
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" className="ml-auto" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const TradeDetailModal = () => {
    if (!selectedTrade) return null;
    
    const pips = calculatePips(selectedTrade.instrument, selectedTrade.entryPrice, selectedTrade.exitPrice, selectedTrade.tradeType);
    const pnl = calculatePnL(selectedTrade.instrument, selectedTrade.entryPrice, selectedTrade.exitPrice, selectedTrade.tradeType, selectedTrade.lotSize);

    return (
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowModal(false);
          setSelectedTrade(null);
        }}
      >
        <SafeAreaView className="flex-1 bg-slate-950">
          <LinearGradient
            colors={['#020617', '#0f172a', '#1e293b']}
            className="flex-1"
          >
            <View className="px-6 py-4">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity 
                  onPress={() => {
                    setShowModal(false);
                    setSelectedTrade(null);
                  }}
                  className="w-10 h-10 bg-slate-800 rounded-xl items-center justify-center border border-slate-700"
                >
                  <Ionicons name="close" size={20} color="#F1F5F9" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-white">Trade Details</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteTrade(selectedTrade.id)}
                  className="w-10 h-10 bg-red-600 rounded-xl items-center justify-center"
                >
                  <Ionicons name="trash" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Trade Summary Card */}
                <View className="bg-slate-900/70 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-slate-700/50 shadow-2xl overflow-hidden">
                  <LinearGradient
                    colors={pnl >= 0 ? 
                      ['#065f46', '#047857', '#059669'] : 
                      ['#991b1b', '#dc2626', '#ef4444']
                    }
                    className="absolute inset-0 opacity-10"
                  />
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-black text-white">{selectedTrade.instrument}</Text>
                    <View className="flex-row items-center bg-slate-800/50 px-3 py-2 rounded-xl border border-blue-500/30">
                      <View className={`w-8 h-8 rounded-lg items-center justify-center mr-2 ${
                        selectedTrade.tradeType === 'buy' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        <Ionicons 
                          name={selectedTrade.tradeType === 'buy' ? 'arrow-up' : 'arrow-down'} 
                          size={16} 
                          color="#FFFFFF" 
                        />
                      </View>
                      <Text className={`text-sm font-bold ${
                        selectedTrade.tradeType === 'buy' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {selectedTrade.tradeType.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className={`text-4xl font-black mb-1 ${
                        pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pnl >= 0 ? '+$' : '-$'}{Math.abs(pnl).toFixed(2)}
                      </Text>
                      <Text className="text-blue-300 text-sm font-medium">Profit & Loss</Text>
                    </View>
                    <View className="items-end">
                      <Text className={`text-2xl font-black mb-1 ${
                        pips >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pips >= 0 ? '+' : ''}{pips} pips
                      </Text>
                      <Text className="text-blue-300 text-sm font-medium">Movement</Text>
                    </View>
                  </View>
                </View>

                {/* Trade Details */}
                <View className="bg-slate-900/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-2xl mb-6">
                  <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="information-circle" size={20} color="#FFFFFF" />
                    </View>
                    <Text className="text-lg font-black text-white">Trade Information</Text>
                  </View>
                  
                  <View className="space-y-4">
                    <View className="flex-row justify-between py-3 border-b border-slate-700/50">
                      <Text className="text-blue-300 font-semibold">Entry Price</Text>
                      <Text className="text-white font-black">{selectedTrade.entryPrice}</Text>
                    </View>
                    
                    <View className="flex-row justify-between py-3 border-b border-slate-700/50">
                      <Text className="text-blue-300 font-semibold">Exit Price</Text>
                      <Text className="text-white font-black">{selectedTrade.exitPrice}</Text>
                    </View>
                    
                    <View className="flex-row justify-between py-3 border-b border-slate-700/50">
                      <Text className="text-blue-300 font-semibold">Lot Size</Text>
                      <Text className="text-white font-black">{selectedTrade.lotSize}</Text>
                    </View>
                    
                    <View className="flex-row justify-between py-3 border-b border-slate-700/50">
                      <Text className="text-blue-300 font-semibold">Timeframe</Text>
                      <Text className="text-white font-black">{selectedTrade.timeframe || 'N/A'}</Text>
                    </View>
                    
                    {selectedTrade.stopLoss && (
                      <View className="flex-row justify-between py-3 border-b border-slate-700/50">
                        <Text className="text-blue-300 font-semibold">Stop Loss</Text>
                        <Text className="text-white font-black">{selectedTrade.stopLoss}</Text>
                      </View>
                    )}
                    
                    <View className="flex-row justify-between py-3 border-b border-slate-700/50">
                      <Text className="text-blue-300 font-semibold">Result</Text>
                      <Text className={`font-black ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? 'Win' : 'Loss'}
                      </Text>
                    </View>
                    
                    <View className="flex-row justify-between py-3 border-b border-slate-700/50">
                      <Text className="text-blue-300 font-semibold">Risk:Reward</Text>
                      <Text className="text-white font-black">{selectedTrade.riskReward || 'N/A'}</Text>
                    </View>
                    
                    <View className="flex-row justify-between py-3">
                      <Text className="text-blue-300 font-semibold">Strategy</Text>
                      <Text className="text-white font-black">{selectedTrade.strategy || 'N/A'}</Text>
                    </View>
                  </View>
                </View>

                {/* Entry Timing Only */}
                <View className="bg-slate-900/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-2xl mb-6">
                  <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="time" size={20} color="#FFFFFF" />
                    </View>
                    <Text className="text-lg font-black text-white">Entry Details</Text>
                  </View>
                  
                  <View className="flex-row justify-between">
                    <View className="flex-1">
                      <Text className="text-blue-300 font-semibold mb-2">Date</Text>
                      <Text className="text-white font-black text-lg">{formatDate(selectedTrade.entryDate)}</Text>
                    </View>
                    <View className="flex-1 items-end">
                      <Text className="text-blue-300 font-semibold mb-2">Time</Text>
                      <Text className="text-white font-black text-lg">{formatTime(selectedTrade.entryTime)}</Text>
                    </View>
                  </View>
                </View>

                {/* Notes */}
                {selectedTrade.notes && (
                  <View className="bg-slate-900/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-2xl mb-6">
                    <View className="flex-row items-center mb-4">
                      <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="document-text" size={20} color="#FFFFFF" />
                      </View>
                      <Text className="text-lg font-black text-white">Notes</Text>
                    </View>
                    <Text className="text-slate-300 leading-6 font-medium">{selectedTrade.notes}</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </LinearGradient>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <LinearGradient
        colors={['#020617', '#0f172a', '#1e293b']}
        className="flex-1"
      >
        <View className="flex-1">
          {/* Header */}
          <View className="mb-6 pt-4 px-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <LinearGradient
                  colors={['#3B82F6', '#1D4ED8', '#1E40AF']}
                  className="w-2 h-12 rounded-full mr-4"
                />
                <View className="flex-1">
                  <Text className="text-3xl font-black text-white mb-1 tracking-tight">
                    History
                  </Text>
                  <Text className="text-blue-300 text-lg font-medium">
                    {trades.length} {trades.length === 1 ? 'trade' : 'trades'} completed
                  </Text>
                </View>
              </View>
              
              {/* Sort Button */}
              {trades.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowSortMenu(true)}
                  className="bg-slate-800/70 border border-blue-500/30 px-4 py-3 rounded-xl flex-row items-center"
                  activeOpacity={0.8}
                >
                  <Ionicons name="funnel" size={18} color="#3B82F6" />
                  <Text className="text-blue-300 font-bold ml-2 text-sm">{getSortLabel()}</Text>
                  <Ionicons name="chevron-down" size={16} color="#3B82F6" className="ml-1" />
                </TouchableOpacity>
              )}
            </View>

          </View>

          {/* Trade List */}
          {trades.length > 0 ? (
            <ScrollView 
              className="flex-1 px-6" 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {getSortedTrades().map((trade) => (
                <TradeCard key={trade.id} trade={trade} />
              ))}
            </ScrollView>
          ) : (
            <View className="flex-1 items-center justify-center px-8">
              <View className="w-20 h-20 bg-slate-800 rounded-full items-center justify-center mb-6 border border-slate-700">
                <Ionicons name="document-text-outline" size={40} color="#64748B" />
              </View>
              <Text className="text-2xl font-black text-white mb-3">No Trades Yet</Text>
              <Text className="text-slate-400 text-center text-lg leading-6 font-medium">
                Your completed trades will appear here once you start logging them.
              </Text>
            </View>
          )}
        </View>

        <TradeDetailModal />
        <SortMenu />
      </LinearGradient>
    </SafeAreaView>
  );
}