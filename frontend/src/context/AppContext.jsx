import React, { createContext, useState, useEffect, useRef } from 'react';
import { translations } from './translations';

export const AppContext = createContext();

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE = isLocal 
  ? 'http://localhost:5000/api' 
  : (import.meta.env.VITE_API_URL || '/api');
const WS_BASE = isLocal 
  ? 'ws://localhost:5000' 
  : (import.meta.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/socket.io/`);

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('rafi_trading_token') || null);
  const [language, setLanguage] = useState(localStorage.getItem('rafi_trading_lang') || 'id');

  useEffect(() => {
    localStorage.setItem('rafi_trading_lang', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['id']?.[key] || key;
  };

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('rafi_trading_user')) || null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Real-time market state
  const [tickers, setTickers] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  
  // App lists
  const [strategies, setStrategies] = useState([]);
  const [trades, setTrades] = useState([]);
  const [missions, setMissions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [evalData, setEvalData] = useState(null);
  const [scannerResults, setScannerResults] = useState([]);
  
  // UI States
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const wsRef = useRef(null);

  // Sync token and user in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('rafi_trading_token', token);
    } else {
      localStorage.removeItem('rafi_trading_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('rafi_trading_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rafi_trading_user');
    }
  }, [user]);

  // Connect to backend WebSockets for live tickers
  useEffect(() => {
    let interval;
    const connectWS = () => {
      try {
        const ws = new WebSocket(WS_BASE);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'MARKET_DATA') {
            setTickers(data.tickers || []);
            if (data.alerts && data.alerts.length > 0) {
              setLiveAlerts(prev => [data.alerts[0], ...prev].slice(0, 8)); // keep top 8
            }
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Try reconnecting in 5s
          setTimeout(connectWS, 5000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        setWsConnected(false);
      }
    };

    connectWS();

    // Fallback Mock pricing interval when backend server is not active
    interval = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        // Mock prices so the terminal looks alive offline
        const mockPairs = [
          'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 
          'DOGEUSDT', 'XRPUSDT', 'ADAUSDT', 'AVAXUSDT', 
          'NEARUSDT', 'LINKUSDT', 'DOTUSDT', 'MATICUSDT'
        ];
        const basePrices = {
          BTCUSDT: 77250, ETHUSDT: 3850, SOLUSDT: 185, BNBUSDT: 620,
          DOGEUSDT: 0.16, XRPUSDT: 0.58, ADAUSDT: 0.48, AVAXUSDT: 38,
          NEARUSDT: 6.8, LINKUSDT: 18.2, DOTUSDT: 7.2, MATICUSDT: 0.72
        };
        
        const tickData = mockPairs.map((symbol, idx) => {
          const rand = Math.sin(Date.now() / 15000 + idx) * 0.004 + (Math.random() - 0.5) * 0.002;
          const price = basePrices[symbol] * (1 + rand);
          const changePercent = Math.sin(Date.now() / 80000 + idx) * 4.2;
          return {
            symbol,
            price,
            changePercent,
            high: price * 1.015,
            low: price * 0.985,
            volume: 4500000 + (Math.cos(idx) * 1500000)
          };
        });

        setTickers(tickData);

        // Random whale/breakout alert mock generator
        if (Math.random() > 0.82) {
          const randomPair = mockPairs[Math.floor(Math.random() * mockPairs.length)];
          const randomPrice = basePrices[randomPair];
          const newAlert = {
            symbol: randomPair,
            type: Math.random() > 0.5 ? 'BREAKOUT_UP' : 'WHALE_MOVEMENT',
            price: randomPrice * (1 + (Math.random() - 0.5) * 0.02),
            change: (Math.random() - 0.5) * 8,
            timestamp: Date.now()
          };
          setLiveAlerts(prev => [newAlert, ...prev].slice(0, 8));
        }
      }
    }, 2500);

    return () => {
      if (wsRef.current) wsRef.current.close();
      clearInterval(interval);
    };
  }, []);

  // Fetch standard data on login
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      // Offline fallback defaults for test users
      setStrategies(getOfflineStrategies());
      setTrades(getOfflineTrades());
      setMissions(getOfflineMissions());
      setSettings({
        telegramToken: '',
        telegramChatId: '',
        discordWebhook: '',
        emailAlerts: false,
        pushNotifications: true
      });
      setEvalData(getOfflineEval(getOfflineTrades()));
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStrategies(),
        loadTrades(),
        loadMissions(),
        loadSettings(),
        loadEvaluation()
      ]);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Helper fetch wrapper
  const _fetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };
    try {
      const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error occurred');
      return data;
    } catch (err) {
      // console.warn(`API fetch fail to ${url}. Using offline operations.`);
      throw err;
    }
  };

  // ==========================================
  // API CLIENT METHODS
  // ==========================================
  
  // AUTH ROUTINES
  const registerUser = async (username, email, password) => {
    setLoading(true);
    try {
      const data = await _fetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      });
      setToken(data.token);
      setUser(data.user);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const data = await _fetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setToken(data.token);
      setUser(data.user);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('rafi_trading_token');
    localStorage.removeItem('rafi_trading_user');
    setStrategies(getOfflineStrategies());
    setTrades(getOfflineTrades());
  };

  // STRATEGIES API
  const loadStrategies = async () => {
    try {
      const data = await _fetch('/strategies');
      setStrategies(data);
    } catch (err) {
      setStrategies(getOfflineStrategies());
    }
  };

  const addStrategy = async (strat) => {
    try {
      if (token) {
        const item = await _fetch('/strategies', {
          method: 'POST',
          body: JSON.stringify(strat)
        });
        setStrategies(prev => [item, ...prev]);
        return item;
      } else {
        const newItem = {
          id: 'mock-' + Math.random(),
          ...strat,
          entryConditions: JSON.stringify(strat.entryConditions),
          exitConditions: JSON.stringify(strat.exitConditions || {}),
          createdAt: new Date().toISOString()
        };
        setStrategies(prev => [newItem, ...prev]);
        return newItem;
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteStrategy = async (id) => {
    try {
      if (token) {
        await _fetch(`/strategies/${id}`, { method: 'DELETE' });
      }
      setStrategies(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      throw err;
    }
  };

  // SCANNER FETCH
  const runLiveScanner = async (scanParams) => {
    const oRsiLower = scanParams?.rsiOversold || 35;
    const oRsiUpper = scanParams?.rsiOverbought || 65;
    const eShort = scanParams?.emaShort || 20;
    const eLong = scanParams?.emaLong || 50;

    try {
      setLoading(true);
      if (token) {
        try {
          // If live API is connected, we can send params in query to backend or simulate them
          const data = await _fetch(`/scanner?rsiOversold=${oRsiLower}&rsiOverbought=${oRsiUpper}&emaShort=${eShort}&emaLong=${eLong}`);
          setScannerResults(data.results || []);
          setLoading(false);
          return;
        } catch (apiErr) {
          // Fall back to offline simulation on API failure
        }
      }

      // Offline Scanning logic simulation
      const baseTickers = tickers.length > 0 ? tickers : [
        { symbol: 'BTCUSDT', price: 77250, changePercent: 2.5, volume: 5200000 },
        { symbol: 'ETHUSDT', price: 3850, changePercent: 1.8, volume: 3100000 },
        { symbol: 'SOLUSDT', price: 185, changePercent: 4.2, volume: 1600000 },
        { symbol: 'BNBUSDT', price: 620, changePercent: -0.5, volume: 850000 },
        { symbol: 'DOGEUSDT', price: 0.16, changePercent: 8.5, volume: 450000 },
        { symbol: 'XRPUSDT', price: 0.58, changePercent: 1.1, volume: 380000 }
      ];

      const mockedScanner = baseTickers.map(t => {
        // Generate an RSI value close to trigger threshold to make tests interactive
        const rsi = Math.random() > 0.5 ? 
          (oRsiLower - 5 + Math.floor(Math.random() * 10)) : 
          (oRsiUpper - 5 + Math.floor(Math.random() * 10));
          
        const stochK = 10 + Math.floor(Math.random() * 80);
        const stochD = Math.max(0, Math.min(100, stochK + (Math.random() > 0.5 ? 3 : -3)));
        const emaTrend = Math.random() > 0.45 ? 'BULL' : 'BEAR';

        const tags = [];
        if (rsi < oRsiLower) {
          tags.push(`Oversold (RSI < ${oRsiLower})`);
        } else if (rsi > oRsiUpper) {
          tags.push(`Overbought (RSI > ${oRsiUpper})`);
        }
        
        // Add requested EMA 13/21 and StochRSI (5,3,3) indicators into tag results
        tags.push(emaTrend === 'BULL' ? 'EMA 13/21 BULL' : 'EMA 13/21 BEAR');
        
        if (stochK < 20) {
          tags.push(`StochRSI Oversold (${stochK})`);
        } else if (stochK > 80) {
          tags.push(`StochRSI Overbought (${stochK})`);
        }
        
        if (Math.random() > 0.5) tags.push(`EMA ${eShort} Cross EMA ${eLong}`);
        if (Math.random() > 0.7) tags.push('Volume Naik');
        if (Math.random() > 0.85) tags.push('Whale Activity');
        
        if (tags.length === 0) tags.push('Volume Stabil');

        const conf = 45 + Math.floor(Math.random() * 45);

        return {
          symbol: t.symbol,
          price: t.price,
          changePercent: t.changePercent,
          volume: t.volume,
          tags,
          confidenceScore: conf,
          recommendedAction: conf > 65 ? 'BUY' : (conf < 40 ? 'SELL' : 'HOLD'),
          indicators: {
            rsi,
            support: t.price * 0.96,
            resistance: t.price * 1.04,
            ema20: t.price * 0.99,
            ema50: t.price * 0.97,
            stochRsi: { k: stochK, d: stochD },
            emaTrend13_21: emaTrend
          }
        };
      }).sort((a,b) => b.confidenceScore - a.confidenceScore);

      setScannerResults(mockedScanner);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  // JOURNAL TRADES API
  const loadTrades = async () => {
    try {
      const data = await _fetch('/trades');
      setTrades(data);
    } catch (err) {
      setTrades(getOfflineTrades());
    }
  };

  const openTrade = async (tradeData) => {
    try {
      if (token) {
        const data = await _fetch('/trades', {
          method: 'POST',
          body: JSON.stringify({ ...tradeData, isPaperTrading: true })
        });
        setTrades(prev => [data.trade, ...prev]);
        if (data.newBalance !== undefined) {
          setUser(prev => ({ ...prev, balance: data.newBalance }));
        }
        return data.trade;
      } else {
        const newTrade = {
          id: 'trade-' + Math.random(),
          ...tradeData,
          status: 'OPEN',
          profitLoss: 0.0,
          createdAt: new Date().toISOString()
        };
        setTrades(prev => [newTrade, ...prev]);
        
        // deduct local balance
        if (user) {
          const cost = tradeData.entryPrice * tradeData.amount;
          setUser(prev => ({ ...prev, balance: prev.balance - cost }));
        }
        return newTrade;
      }
    } catch (err) {
      throw err;
    }
  };

  const closeTrade = async (id, closeData) => {
    try {
      if (token) {
        const data = await _fetch(`/trades/close/${id}`, {
          method: 'PUT',
          body: JSON.stringify(closeData)
        });
        setTrades(prev => prev.map(t => t.id === id ? data.trade : t));
        if (data.newBalance !== undefined) {
          setUser(prev => ({ ...prev, balance: data.newBalance }));
        }
        loadEvaluation(); // reload metrics
        return data.trade;
      } else {
        const target = trades.find(t => t.id === id);
        if (!target) return;
        
        let pnl = 0.0;
        if (target.type === 'BUY') {
          pnl = (closeData.exitPrice - target.entryPrice) * target.amount;
        } else {
          pnl = (target.entryPrice - closeData.exitPrice) * target.amount;
        }

        const closedTrade = {
          ...target,
          ...closeData,
          profitLoss: pnl,
          status: 'CLOSED',
          mistakes: JSON.stringify(closeData.mistakes || [])
        };

        setTrades(prev => prev.map(t => t.id === id ? closedTrade : t));
        
        // settle local balance
        if (user) {
          const cost = target.entryPrice * target.amount;
          setUser(prev => ({
            ...prev,
            balance: target.type === 'BUY' ? (prev.balance + cost + pnl) : (prev.balance + pnl)
          }));
        }

        // Trigger local re-eval
        setTimeout(() => {
          setEvalData(getOfflineEval([closedTrade, ...trades.filter(t => t.id !== id)]));
        }, 300);

        return closedTrade;
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteTrade = async (id) => {
    try {
      if (token) {
        await _fetch(`/trades/${id}`, { method: 'DELETE' });
      }
      setTrades(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      throw err;
    }
  };

  // EVALUATIONS API
  const loadEvaluation = async () => {
    try {
      const data = await _fetch('/evaluate');
      setEvalData(data);
    } catch (err) {
      setEvalData(getOfflineEval(trades));
    }
  };

  // BACKTEST SIMULATOR API
  const runBacktestSim = async (params) => {
    try {
      setLoading(true);
      if (token) {
        const data = await _fetch('/backtest', {
          method: 'POST',
          body: JSON.stringify(params)
        });
        setLoading(false);
        return data;
      } else {
        // Local offline backtest calculation simulations
        await new Promise(r => setTimeout(r, 1200)); // fake network loading
        
        const tradesSim = [];
        let balance = 10000.0;
        const totalSim = 15 + Math.floor(Math.random() * 12);
        
        for (let i = 0; i < totalSim; i++) {
          const win = Math.random() > 0.45;
          const pnlPercent = win ? (1.5 + Math.random() * 8.5) : -(1.0 + Math.random() * 3.5);
          const pnl = (10000.0 * 0.1) * (pnlPercent / 100);
          balance += pnl;
          tradesSim.push({
            entryPrice: 65000 * (1 + (Math.random() - 0.5) * 0.05),
            exitPrice: 65000 * (1 + (Math.random() - 0.5) * 0.05),
            profitLoss: pnl,
            profitPercent: pnlPercent,
            entryTime: Date.now() - (totalSim - i) * 24 * 3600 * 1000,
            exitTime: Date.now() - (totalSim - i) * 24 * 3600 * 1000 + 4 * 3600 * 1000
          });
        }
        
        setLoading(false);
        return {
          symbol: params.symbol,
          timeframe: params.timeframe,
          initialBalance: 10000.0,
          finalBalance: balance,
          netProfit: balance - 10000.0,
          winrate: Math.round((tradesSim.filter(t => t.profitLoss > 0).length / tradesSim.length) * 100),
          totalTrades: tradesSim.length,
          trades: tradesSim
        };
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // CHAT ASSISTANT
  const sendChatMessage = async (msg) => {
    try {
      if (token) {
        const data = await _fetch('/chat', {
          method: 'POST',
          body: JSON.stringify({ message: msg })
        });
        return data.response;
      } else {
        // Offline assistant chatbot logic
        await new Promise(r => setTimeout(r, 600));
        const lowercaseMsg = msg.toLowerCase();
        
        if (lowercaseMsg.includes('strategi') || lowercaseMsg.includes('rekomendasi')) {
          return `Mentor: "Berdasarkan analisis saya, portofolio Anda memiliki winrate sebesar **${evalData?.winrate || 62}%**. Rekomendasi utama: fokuslah pada setup breakout dengan support volume tinggi. Hindari entry di pasar sideways!"`;
        } else if (lowercaseMsg.includes('kesalahan') || lowercaseMsg.includes('pitfall') || lowercaseMsg.includes('emosi')) {
          return `Mentor: "Psikologi Anda cukup stabil, namun waspadai FOMO saat harga memompa kencang. Pasang stop loss secara disiplin dan batasi target trading harian Anda."`;
        } else {
          return `Mentor: "Halo! Saya adalah personal AI Trading Mentor Anda. Saya siap membantu Anda menganalisa strategi, mengaudit emosi trading Anda (FOMO/Revenge), atau mengarahkan setup trading terbaik hari ini. Apa yang sedang Anda hadapi saat ini di market?"`;
        }
      }
    } catch (err) {
      throw err;
    }
  };

  // DAILY MISSIONS
  const loadMissions = async () => {
    try {
      const data = await _fetch('/missions');
      setMissions(data);
    } catch (err) {
      setMissions(getOfflineMissions());
    }
  };

  const completeMission = async (id) => {
    try {
      if (token) {
        await _fetch(`/missions/complete/${id}`, { method: 'POST' });
      }
      setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));
    } catch (err) {
      throw err;
    }
  };

  // SETTINGS API
  const loadSettings = async () => {
    try {
      const data = await _fetch('/settings');
      setSettings(data);
    } catch (err) {
      setSettings({
        telegramToken: '',
        telegramChatId: '',
        discordWebhook: '',
        emailAlerts: false,
        pushNotifications: true
      });
    }
  };

  const saveSettings = async (data) => {
    try {
      if (token) {
        const item = await _fetch('/settings', {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        setSettings(item.settings);
        return item;
      } else {
        setSettings(data);
        return data;
      }
    } catch (err) {
      throw err;
    }
  };

  // RESET virtual balance
  const resetBalance = async (amount) => {
    try {
      if (token) {
        const data = await _fetch('/auth/reset-balance', { 
          method: 'POST',
          body: amount !== undefined ? JSON.stringify({ amount: parseFloat(amount) }) : undefined
        });
        setUser(prev => ({ ...prev, balance: data.balance }));
      } else {
        setUser(prev => ({ ...prev, balance: amount !== undefined ? parseFloat(amount) : 10000.0 }));
      }
    } catch (err) {
      throw err;
    }
  };

  // Vocal text-to-speech speaker assistant
  const speakAI = (text) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any running speech
    window.speechSynthesis.cancel();
    
    // Strip markdown formatting for cleaner speech synthesis
    const cleanText = text.replace(/[*#`_\-]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Prioritize Indonesian localized voice, fallback to any available
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
    if (indVoice) {
      utterance.voice = indVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsVoiceActive(true);
    utterance.onend = () => setIsVoiceActive(false);
    utterance.onerror = () => setIsVoiceActive(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <AppContext.Provider value={{
      token, setToken,
      user, setUser,
      activeTab, setActiveTab,
      loading, setLoading,
      error, setError,
      tickers,
      liveAlerts,
      wsConnected,
      strategies, setStrategies,
      addStrategy, deleteStrategy,
      trades, setTrades,
      openTrade, closeTrade, deleteTrade,
      missions,
      completeMission,
      settings, saveSettings,
      evalData, loadEvaluation,
      scannerResults, runLiveScanner,
      runBacktestSim,
      sendChatMessage,
      resetBalance,
      logoutUser,
      speakAI,
      isVoiceActive,
      registerUser,
      loginUser,
      language, setLanguage, t
    }}>
      {children}
    </AppContext.Provider>
  );
};

// ==========================================
// OFFLINE FALLBACK MOCK DATA GENERATORS
// ==========================================
function getOfflineStrategies() {
  return [
    {
      id: 'strat-1',
      name: 'RSI Oversold Breakout',
      timeframe: '15m',
      entryConditions: '{"rsi": {"operator": "<", "value": 30}, "volumeSurge": true}',
      exitConditions: '{"rsi": {"operator": ">", "value": 70}}',
      stopLoss: 2,
      takeProfit: 6,
      riskReward: '1:3',
      active: true
    },
    {
      id: 'strat-2',
      name: 'EMA Cross & MACD confirmation',
      timeframe: '1h',
      entryConditions: '{"emaCross": "bullish", "macdCross": "bullish"}',
      exitConditions: '{"emaCross": "bearish"}',
      stopLoss: 1.5,
      takeProfit: 5,
      riskReward: '1:3.3',
      active: true
    }
  ];
}

function getOfflineTrades() {
  return [
    {
      id: 't-1',
      pair: 'BTCUSDT',
      type: 'BUY',
      entryPrice: 66400,
      exitPrice: 68100,
      amount: 0.15,
      profitLoss: 255.0,
      status: 'CLOSED',
      reason: 'RSI oversold pada support regional 15m',
      emotion: 'Calm',
      mistakes: '[]',
      notes: 'Entry disiplin di area demand. Mengikuti setup dengan patuh.',
      exitReason: 'Menyentuh target take profit EMA resistance',
      timeframe: '15m',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 't-2',
      pair: 'SOLUSDT',
      type: 'BUY',
      entryPrice: 168.5,
      exitPrice: 161.2,
      amount: 15.0,
      profitLoss: -109.5,
      status: 'CLOSED',
      reason: 'Membeli saat breakout kencang',
      emotion: 'FOMO',
      mistakes: '["FOMO Entry", "Moved Stop Loss"]',
      notes: 'Terlambat entry karena melihat candle hijau besar. Menggeser stop loss ke bawah hingga tersapu market.',
      exitReason: 'Kena stop loss manual',
      timeframe: '5m',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 't-3',
      pair: 'ETHUSDT',
      type: 'BUY',
      entryPrice: 3410,
      exitPrice: 3495,
      amount: 0.8,
      profitLoss: 68.0,
      status: 'CLOSED',
      reason: 'EMA 20 golden cross EMA 50',
      emotion: 'Calm',
      mistakes: '[]',
      notes: 'Setup breakout EMA cross berjalan rapi.',
      exitReason: 'Take profit parsial',
      timeframe: '1h',
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
    }
  ];
}

function getOfflineMissions() {
  return [
    { id: 'm-1', title: "Manajemen Risiko Disiplin", description: "Pasang Stop Loss pada setiap transaksi paper trading Anda hari ini.", rewardPts: 100, completed: true },
    { id: 'm-2', title: "Log Jurnal Detail", description: "Catat minimal 1 transaksi lengkap dengan alasan entry dan emosi saat eksekusi.", rewardPts: 150, completed: false },
    { id: 'm-3', title: "Detoks Overtrading", description: "Jangan melakukan lebih dari 3 kali entry di pasar hari ini.", rewardPts: 200, completed: false }
  ];
}

function getOfflineEval(tradesList) {
  const closed = tradesList.filter(t => t.status === 'CLOSED');
  if (closed.length === 0) return {
    winrate: 0, accuracyScore: 70, disciplineScore: 85, riskScore: 80,
    keyPitfalls: ["Belum ada data"], setupStrengths: ["Siap menganalisa"],
    mentorFeedback: "Silakan logging trading Anda.", recommendations: ["Disiplin pasang stop loss"]
  };
  
  const wins = closed.filter(t => t.profitLoss > 0).length;
  const winrate = Math.round((wins / closed.length) * 100);
  
  let fomo = 0;
  closed.forEach(t => {
    if (t.emotion === 'FOMO' || t.notes?.toLowerCase().includes('chasing') || t.reason?.toLowerCase().includes('pump')) fomo++;
  });

  const pitfalls = fomo > 0 ? ["FOMO Entry (Mengejar Candle Hijau)"] : [];
  const strengths = fomo === 0 ? ["Manajemen Emosi Sangat Bagus", "Eksekusi Disiplin"] : ["Pencatatan Jurnal Rinci"];
  const advice = fomo > 0 ? 
    "“Anda terlalu sering masuk pasar karena takut kehilangan momentum (FOMO). Professional trader mencari entry berisiko rendah di area support demand, bukan memburu candle hijau besar yang sudah terbang tinggi.”" :
    "“Manajemen risiko Anda berjalan sangat sehat minggu ini. Teruskan konsistensi setup Anda dan biarkan hukum probabilitas bekerja untuk portofolio Anda!”";

  return {
    winrate,
    accuracyScore: winrate,
    disciplineScore: Math.max(40, 100 - (fomo * 25)),
    riskScore: 85,
    keyPitfalls: pitfalls.length > 0 ? pitfalls : ["Tidak ada kebiasaan buruk yang dominan"],
    setupStrengths: strengths,
    mentorFeedback: advice,
    recommendations: fomo > 0 ? 
      ["Gunakan limit order di area support daripada market order saat breakout.", "Terapkan aturan stop-loss otomatis di exchange."] : 
      ["Tingkatkan target risk-to-reward ratio Anda ke 1:3.", "Pertahankan rutinitas logging jurnal harian."]
  };
}

function getMockCandlesFor(symbol) {
  // simple mock klines generator
  const candles = [];
  let price = 100;
  for (let i = 0; i < 50; i++) {
    candles.push({ close: price, high: price * 1.01, low: price * 0.99, volume: 100000 });
    price += (Math.random() - 0.5) * 2;
  }
  return candles;
}
