import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrades } from '../context/TradeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function StatsScreen() {
  const { trades } = useTrades();

  // Use the same calculation logic as TradeHistoryScreen
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
      pipValue = 0.01;
    } else if (upperInstrument.includes('XAU') || upperInstrument.includes('GOLD')) {
      pipValue = 0.1;
    } else if (upperInstrument.includes('XAG') || upperInstrument.includes('SILVER')) {
      pipValue = 0.001;
    } else if (upperInstrument.includes('BTC') || upperInstrument.includes('ETH')) {
      pipValue = 1.0;
    } else {
      pipValue = 0.0001;
    }
    
    return Math.round(actualDiff / pipValue * 10) / 10;
  };

  const getPipValuePerLot = (instrument) => {
    if (!instrument) return 10;
    
    const upperInstrument = instrument.toUpperCase();
    
    if (upperInstrument.match(/^(EUR|GBP|AUD|NZD)USD$/)) {
      return 10;
    }
    
    if (upperInstrument.match(/^USD(CHF|CAD)$/)) {
      return 10;
    }
    
    if (upperInstrument.includes('JPY')) {
      return 9.3;
    }
    
    if (upperInstrument.includes('XAU') || upperInstrument.includes('GOLD')) {
      return 10;
    }
    
    if (upperInstrument.includes('XAG') || upperInstrument.includes('SILVER')) {
      return 50;
    }
    
    if (upperInstrument.includes('BTC') || upperInstrument.includes('ETH')) {
      return 10;
    }
    
    return 10;
  };

  const calculatePnL = (instrument, entryPrice, exitPrice, tradeType, lotSize) => {
    if (!exitPrice || !entryPrice || !lotSize || !instrument) return 0;
    
    const pips = calculatePips(instrument, entryPrice, exitPrice, tradeType);
    const lots = parseFloat(lotSize);
    const pipValuePerLot = getPipValuePerLot(instrument);
    
    return Math.round(pips * pipValuePerLot * lots * 100) / 100;
  };

  // Calculate comprehensive stats
  const calculateStats = () => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        totalPnL: 0,
        totalPips: 0,
        winRate: 0,
        winningTrades: 0,
        losingTrades: 0,
        avgWin: 0,
        avgLoss: 0,
        bestTrade: 0,
        worstTrade: 0,
        profitFactor: 0,
        avgPips: 0,
        grossProfit: 0,
        grossLoss: 0
      };
    }

    let totalPnL = 0;
    let totalPips = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let bestTrade = 0;
    let worstTrade = 0;
    let totalWinningPnL = 0;
    let totalLosingPnL = 0;

    trades.forEach(trade => {
      const pnl = calculatePnL(trade.instrument, trade.entryPrice, trade.exitPrice, trade.tradeType, trade.lotSize);
      const pips = calculatePips(trade.instrument, trade.entryPrice, trade.exitPrice, trade.tradeType);
      
      totalPnL += pnl;
      totalPips += pips;

      if (pnl >= 0) {
        winningTrades++;
        grossProfit += pnl;
        totalWinningPnL += pnl;
        if (pnl > bestTrade) bestTrade = pnl;
      } else {
        losingTrades++;
        grossLoss += Math.abs(pnl);
        totalLosingPnL += pnl;
        if (pnl < worstTrade) worstTrade = pnl;
      }
    });

    const winRate = (winningTrades / trades.length) * 100;
    const avgWin = winningTrades > 0 ? totalWinningPnL / winningTrades : 0;
    const avgLoss = losingTrades > 0 ? totalLosingPnL / losingTrades : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;
    const avgPips = totalPips / trades.length;

    return {
      totalTrades: trades.length,
      totalPnL,
      totalPips,
      winRate,
      winningTrades,
      losingTrades,
      avgWin,
      avgLoss,
      bestTrade,
      worstTrade,
      profitFactor,
      avgPips,
      grossProfit,
      grossLoss
    };
  };

  const stats = calculateStats();

  const StatCard = ({ title, value, icon, color = 'blue', subtitle, isMainCard = false }) => (
    <View className={`${isMainCard ? 'mb-8' : 'mb-6'} rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden`}>
      <LinearGradient
        colors={isMainCard ? 
          (stats.totalPnL >= 0 ? ['#065F46', '#059669', '#10B981'] : ['#7F1D1D', '#DC2626', '#EF4444']) :
          ['#1E293B', '#334155', '#475569']
        }
        className="p-6"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className={`w-12 h-12 ${
            color === 'green' ? 'bg-green-600' : 
            color === 'red' ? 'bg-red-600' : 
            color === 'yellow' ? 'bg-yellow-600' :
            color === 'purple' ? 'bg-purple-600' :
            'bg-blue-600'
          } rounded-xl items-center justify-center`}>
            <Ionicons name={icon} size={24} color="#FFFFFF" />
          </View>
          <Text className="text-sm text-slate-300 uppercase tracking-wide font-bold">
            {title}
          </Text>
        </View>
        
        <Text className={`${isMainCard ? 'text-4xl' : 'text-3xl'} font-black mb-2 text-white tracking-tight`}>
          {value}
        </Text>
        
        {subtitle && (
          <Text className="text-lg text-slate-200 font-semibold">
            {subtitle}
          </Text>
        )}
      </LinearGradient>
    </View>
  );

  const QuickStatCard = ({ title, value, icon, color }) => (
    <View className="flex-1 bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-xl">
      <View className="items-center">
        <View className={`w-10 h-10 ${
          color === 'green' ? 'bg-green-600' : 
          color === 'red' ? 'bg-red-600' : 
          'bg-blue-600'
        } rounded-xl items-center justify-center mb-3`}>
          <Ionicons name={icon} size={20} color="#FFFFFF" />
        </View>
        <Text className="text-xs text-slate-400 uppercase tracking-wide font-bold mb-1">
          {title}
        </Text>
        <Text className="text-xl font-black text-white">
          {value}
        </Text>
      </View>
    </View>
  );

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatPercentage = (percentage) => `${percentage.toFixed(1)}%`;

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
            <View className="flex-row items-center">
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8', '#1E40AF']}
                className="w-2 h-12 rounded-full mr-4"
              />
              <View className="flex-1">
                <Text className="text-3xl font-black text-white mb-1 tracking-tight">
                  Analytics
                </Text>
                <Text className="text-blue-300 text-lg font-medium">
                  Your trading performance
                </Text>
              </View>
            </View>
          </View>

          <View className="px-6">
            {stats.totalTrades > 0 ? (
              <>
                {/* Quick Stats Row */}
                <View className="flex-row justify-between mb-8 gap-4">
                  <QuickStatCard
                    title="Total Trades"
                    value={stats.totalTrades}
                    icon="trending-up"
                    color="blue"
                  />
                  <QuickStatCard
                    title="Win Rate"
                    value={formatPercentage(stats.winRate)}
                    icon="trophy"
                    color={stats.winRate >= 50 ? 'green' : 'red'}
                  />
                </View>

                {/* Main P&L Card */}
                <StatCard
                  title="Total P&L"
                  value={formatCurrency(stats.totalPnL)}
                  icon={stats.totalPnL >= 0 ? 'trending-up' : 'trending-down'}
                  color={stats.totalPnL >= 0 ? 'green' : 'red'}
                  subtitle={`${stats.totalPips > 0 ? '+' : ''}${stats.totalPips.toFixed(1)} pips total`}
                  isMainCard={true}
                />

                {/* Detailed Stats in Grid */}
                <View className="flex-row justify-between mb-6 gap-4">
                  <View className="flex-1">
                    <StatCard
                      title="Winning Trades"
                      value={stats.winningTrades.toString()}
                      icon="checkmark-circle"
                      color="green"
                      subtitle={`Avg: ${formatCurrency(stats.avgWin)}`}
                    />
                  </View>
                  <View className="flex-1">
                    <StatCard
                      title="Losing Trades"
                      value={stats.losingTrades.toString()}
                      icon="close-circle"
                      color="red"
                      subtitle={`Avg: ${formatCurrency(Math.abs(stats.avgLoss))}`}
                    />
                  </View>
                </View>

                <View className="flex-row justify-between mb-6 gap-4">
                  <View className="flex-1">
                    <StatCard
                      title="Profit Factor"
                      value={stats.profitFactor.toFixed(2)}
                      icon="calculator"
                      color={stats.profitFactor >= 1 ? 'green' : 'red'}
                      subtitle="Gross Profit / Gross Loss"
                    />
                  </View>
                  <View className="flex-1">
                    <StatCard
                      title="Average Pips"
                      value={`${stats.avgPips > 0 ? '+' : ''}${stats.avgPips.toFixed(1)}`}
                      icon="analytics"
                      color={stats.avgPips >= 0 ? 'green' : 'red'}
                      subtitle="Per trade movement"
                    />
                  </View>
                </View>

                <StatCard
                  title="Best Trade"
                  value={formatCurrency(stats.bestTrade)}
                  icon="star"
                  color="green"
                  subtitle="Highest single trade profit"
                />

                <StatCard
                  title="Worst Trade"
                  value={formatCurrency(stats.worstTrade)}
                  icon="warning"
                  color="red"
                  subtitle="Largest single trade loss"
                />

                {/* Performance Summary Card */}
                <View className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl mb-8">
                  <View className="p-6">
                    <View className="flex-row items-center mb-6">
                      <View className="w-12 h-12 bg-purple-600 rounded-xl items-center justify-center mr-4">
                        <Ionicons name="bar-chart" size={24} color="#FFFFFF" />
                      </View>
                      <Text className="text-xl font-bold text-white">Performance Metrics</Text>
                    </View>
                    
                    <View className="space-y-4">
                      <View className="flex-row justify-between items-center py-4 border-b border-slate-700/50">
                        <Text className="text-slate-300 font-semibold">Risk/Reward Ratio</Text>
                        <Text className="text-white font-bold text-lg">
                          {stats.avgLoss < 0 ? `1:${(stats.avgWin / Math.abs(stats.avgLoss)).toFixed(2)}` : 'N/A'}
                        </Text>
                      </View>
                      
                      <View className="flex-row justify-between items-center py-4 border-b border-slate-700/50">
                        <Text className="text-slate-300 font-semibold">Expectancy</Text>
                        <Text className={`font-bold text-lg ${
                          (stats.totalPnL / stats.totalTrades) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(stats.totalPnL / stats.totalTrades)}
                        </Text>
                      </View>
                      
                      <View className="flex-row justify-between items-center py-4 border-b border-slate-700/50">
                        <Text className="text-slate-300 font-semibold">Gross Profit</Text>
                        <Text className="text-green-400 font-bold text-lg">
                          {formatCurrency(stats.grossProfit)}
                        </Text>
                      </View>
                      
                      <View className="flex-row justify-between items-center py-4">
                        <Text className="text-slate-300 font-semibold">Gross Loss</Text>
                        <Text className="text-red-400 font-bold text-lg">
                          {formatCurrency(stats.grossLoss)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              /* Empty State */
              <View className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl p-12 items-center">
                <View className="w-16 h-16 bg-slate-700 rounded-2xl items-center justify-center mb-6">
                  <Ionicons name="analytics-outline" size={32} color="#64748B" />
                </View>
                <Text className="text-2xl font-black text-white mb-3">No Data Yet</Text>
                <Text className="text-slate-400 text-center text-lg leading-7 font-medium">
                  Start logging your trades to see detailed statistics and performance metrics.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}