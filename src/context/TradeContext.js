import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TradeContext = createContext();

export const useTrades = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTrades must be used within a TradeProvider');
  }
  return context;
};

export const TradeProvider = ({ children }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const storedTrades = await AsyncStorage.getItem('forexTrades');
      if (storedTrades) {
        setTrades(JSON.parse(storedTrades));
      }
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTrades = async (newTrades) => {
    try {
      await AsyncStorage.setItem('forexTrades', JSON.stringify(newTrades));
      setTrades(newTrades);
    } catch (error) {
      console.error('Error saving trades:', error);
    }
  };

  const addTrade = async (trade) => {
    const newTrade = {
      id: Date.now().toString(),
      ...trade,
      createdAt: new Date().toISOString(),
    };
    const updatedTrades = [...trades, newTrade];
    await saveTrades(updatedTrades);
  };

  const deleteTrade = async (tradeId) => {
    const updatedTrades = trades.filter(trade => trade.id !== tradeId);
    await saveTrades(updatedTrades);
  };

  const calculateStats = () => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        bestTrade: 0,
        worstTrade: 0,
        totalPips: 0,
        avgPips: 0,
      };
    }

    const winningTrades = trades.filter(trade => trade.pnl > 0);
    const losingTrades = trades.filter(trade => trade.pnl < 0);
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalWins = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
    const totalPips = trades.reduce((sum, trade) => sum + trade.pips, 0);

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: trades.length > 0 ? (winningTrades.length / trades.length * 100) : 0,
      totalPnL,
      avgWin: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
      avgLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : 0,
      bestTrade: trades.length > 0 ? Math.max(...trades.map(t => t.pnl)) : 0,
      worstTrade: trades.length > 0 ? Math.min(...trades.map(t => t.pnl)) : 0,
      totalPips,
      avgPips: trades.length > 0 ? totalPips / trades.length : 0,
    };
  };

  return (
    <TradeContext.Provider
      value={{
        trades,
        loading,
        addTrade,
        deleteTrade,
        calculateStats,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
};
