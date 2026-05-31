import React, { useState, useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import { 
  TrendingUp, Activity, Terminal, BookOpen, BarChart3, Settings, 
  User, Key, Mail, LogOut, Shield, Compass, Search, Filter, 
  CheckCircle2, AlertTriangle, Play, HelpCircle, Bell, Heart,
  Volume2, RefreshCw, Send, Sparkles, Smile, MessageSquare, DollarSign, Calendar, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// AUTH SCREEN
// ==========================================
function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState(null);

  const { loginUser, registerUser } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(username, email, password);
      }
    } catch (err) {
      setAlert(err.message || 'Proses gagal, periksa koneksi Anda.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 overflow-hidden bg-radial-gradient">
      {/* Background Animated Neon Circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glassmorphism border-neon-blue rounded-2xl p-8 relative z-10 shadow-2xl glow-blue"
      >
        <div className="flex flex-col items-center mb-8">
          {/* Logo */}
          <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg glow-blue mb-4">
            <Terminal className="w-9 h-9 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold font-tech text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            TOOLS AI TRADING
          </h1>
          <p className="text-sm text-cyan-300/60 font-tech">BY RAFI • PROFESSIONAL TERM SUITE</p>
        </div>

        {alert && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{alert}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-tech text-cyan-300/80 mb-2 uppercase tracking-widest">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-cyan-400/40" />
                <input
                  type="text"
                  required
                  placeholder="rafi_trader"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950/80 border border-cyan-500/20 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-tech"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-tech text-cyan-300/80 mb-2 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-cyan-400/40" />
              <input
                type="email"
                required
                placeholder="rafi@trading.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/80 border border-cyan-500/20 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-tech"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-tech text-cyan-300/80 mb-2 uppercase tracking-widest">Password</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 w-5 h-5 text-cyan-400/40" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-cyan-500/20 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-tech"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold font-tech text-sm uppercase py-3 rounded-lg cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/20 border border-cyan-400"
          >
            {isLogin ? 'Enter Terminal' : 'Initialize Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-tech text-cyan-400 hover:underline hover:text-cyan-300 cursor-pointer"
          >
            {isLogin ? "Belum punya akun? Buat di sini" : "Sudah punya akun? Login di sini"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// 1. TERMINAL DASHBOARD
// ==========================================
function TerminalDashboard() {
  const { user, tickers, liveAlerts, evalData, speakAI, resetBalance } = useContext(AppContext);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glassmorphism rounded-xl p-5 border-neon-blue flex items-center justify-between">
          <div>
            <p className="text-xs font-tech text-cyan-400 uppercase tracking-wider">Virtual Balance</p>
            <p className="text-2xl font-bold font-tech text-slate-100 mt-1">${user?.balance?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '10,000.00'}</p>
            <button onClick={resetBalance} className="text-[10px] text-cyan-300/40 hover:text-cyan-300 hover:underline mt-2 flex items-center gap-1 font-tech uppercase">
              <RefreshCw className="w-2.5 h-2.5" /> Reset Balance
            </button>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <DollarSign className="w-6 h-6 text-cyan-400" />
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="glassmorphism rounded-xl p-5 border-neon-purple flex items-center justify-between">
          <div>
            <p className="text-xs font-tech text-purple-400 uppercase tracking-wider">Discipline Index</p>
            <p className="text-2xl font-bold font-tech text-slate-100 mt-1">{evalData?.disciplineScore || 85}/100</p>
            <span className="text-[10px] text-purple-300/60 font-tech">Berdasarkan data jurnal</span>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="glassmorphism rounded-xl p-5 border-neon-green flex items-center justify-between">
          <div>
            <p className="text-xs font-tech text-emerald-400 uppercase tracking-wider">Win Rate Score</p>
            <p className="text-2xl font-bold font-tech text-emerald-400 mt-1">{evalData?.winrate || 62}%</p>
            <span className="text-[10px] text-emerald-300/60 font-tech">Dari total trade closed</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
        </motion.div>

        {/* Fear & Greed Index Gauge */}
        <motion.div whileHover={{ scale: 1.02 }} className="glassmorphism rounded-xl p-5 border-neon-magenta flex items-center justify-between">
          <div>
            <p className="text-xs font-tech text-pink-400 uppercase tracking-wider">Fear & Greed Index</p>
            <p className="text-2xl font-bold font-tech text-pink-400 mt-1">68 (Greed)</p>
            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden border border-pink-500/20">
              <div className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 h-full w-[68%]" />
            </div>
          </div>
          <div className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
            <Shield className="w-6 h-6 text-pink-400" />
          </div>
        </motion.div>
      </div>

      {/* Main Terminal Dashboard Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Pricing Heatmap Grid */}
        <div className="lg:col-span-2 glassmorphism rounded-xl p-6 border-neon-blue flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold font-tech text-cyan-400 mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5" /> CRYPTO REAL-TIME TERMINAL
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {tickers.map((t, idx) => {
                const isGreen = t.changePercent >= 0;
                return (
                  <motion.div
                    key={t.symbol}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className={`heatmap-cell p-4 rounded-lg border ${
                      isGreen ? 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-400' : 'bg-rose-950/20 border-rose-500/20 hover:border-rose-400'
                    }`}
                  >
                    <p className="text-sm font-bold font-tech text-slate-200">{t.symbol.replace('USDT', '')}</p>
                    <p className="text-lg font-bold font-tech text-slate-100 mt-1">${t.price?.toLocaleString(undefined, {maximumFractionDigits: t.price > 1 ? 2 : 4})}</p>
                    <span className={`text-xs font-tech flex items-center gap-1 mt-1 ${isGreen ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isGreen ? '▲' : '▼'} {t.changePercent?.toFixed(2)}%
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cyan-500/10 flex flex-col sm:flex-row items-center justify-between text-xs text-cyan-300/40 font-tech">
            <span>Powered by Binance Live REST & Websocket API</span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" /> Connection Stable
            </span>
          </div>
        </div>

        {/* Live Breakout Alert Tracker */}
        <div className="glassmorphism rounded-xl p-6 border-neon-purple flex flex-col">
          <h2 className="text-lg font-bold font-tech text-purple-400 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" /> LIVE SCANNED BREAKOUT ALERTS
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-2">
            {liveAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-cyan-300/20 font-tech py-12">
                <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                <p className="text-xs uppercase">Menunggu scan pasar pertama...</p>
              </div>
            ) : (
              liveAlerts.map((alert, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950/60 border border-purple-500/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-200 font-tech">{alert.symbol}</span>
                    <p className="text-[10px] text-cyan-300/50 mt-0.5">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-tech font-bold ${
                      alert.type.includes('UP') || alert.type.includes('WHALE') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {alert.type}
                    </span>
                    <p className="text-slate-100 font-tech font-bold mt-1">${alert.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating AI Mentor Speech card */}
      <div className="glassmorphism rounded-xl p-6 border-neon-green bg-gradient-to-r from-emerald-950/10 to-transparent flex flex-col sm:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h3 className="text-sm font-bold font-tech text-emerald-400 uppercase tracking-widest">Nasihat Mentor AI</h3>
          <p className="text-sm italic text-slate-300">{evalData?.mentorFeedback || "Halo Rafi! Pastikan setiap posisi trading dicatat dalam jurnal untuk memetakan emosi dan menghindari revenge trading."}</p>
        </div>
        <button
          onClick={() => speakAI(evalData?.mentorFeedback || "Jaga konsistensi strategi Anda.")}
          className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg flex items-center gap-2 font-tech text-xs cursor-pointer transition-all hover:scale-105 uppercase"
        >
          <Volume2 className="w-4 h-4" /> Dengar Nasihat
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 2. AI MARKET SCANNER
// ==========================================
function MarketScanner() {
  const { scannerResults, runLiveScanner, loading } = useContext(AppContext);
  const [filterRsi, setFilterRsi] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  
  // Custom AI Scanners parameters states
  const [rsiOversold, setRsiOversold] = useState('35');
  const [rsiOverbought, setRsiOverbought] = useState('65');
  const [emaShort, setEmaShort] = useState('20');
  const [emaLong, setEmaLong] = useState('50');
  const [showConfig, setShowConfig] = useState(false);

  const filteredScanner = scannerResults.filter(item => {
    if (filterAction !== 'ALL' && item.recommendedAction !== filterAction) return false;
    if (filterRsi) {
      if (filterRsi === 'oversold' && item.indicators.rsi >= parseInt(rsiOversold)) return false;
      if (filterRsi === 'overbought' && item.indicators.rsi <= parseInt(rsiOverbought)) return false;
    }
    return true;
  });

  const handleScan = () => {
    runLiveScanner({
      rsiOversold: parseInt(rsiOversold || '35'),
      rsiOverbought: parseInt(rsiOverbought || '65'),
      emaShort: parseInt(emaShort || '20'),
      emaLong: parseInt(emaLong || '50')
    });
  };

  return (
    <div className="space-y-6">
      {/* Scanner Settings Control */}
      <div className="glassmorphism rounded-xl p-5 border-neon-blue flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-tech text-cyan-400 uppercase tracking-wider">Filter Action</span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-slate-950/80 border border-cyan-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-tech font-bold"
            >
              <option value="ALL">ALL OPPORTUNITIES</option>
              <option value="BUY">🟢 SIGNAL BUY</option>
              <option value="SELL">🔴 SIGNAL SELL</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-tech text-cyan-400 uppercase tracking-wider">Indicator Filter</span>
            <select
              value={filterRsi}
              onChange={(e) => setFilterRsi(e.target.value)}
              className="bg-slate-950/80 border border-cyan-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-tech font-bold"
            >
              <option value="">ALL TECHNICALS</option>
              <option value="oversold">RSI OVERSOLD (&lt; {rsiOversold})</option>
              <option value="overbought">RSI OVERBOUGHT (&gt; {rsiOverbought})</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/35 text-purple-300 rounded text-xs font-tech font-bold cursor-pointer transition-all self-end"
          >
            ⚙️ Configure AI Thresholds
          </button>
        </div>

        <button
          onClick={handleScan}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-bold font-tech text-xs uppercase rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all border border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Scanning Markets...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" /> Start AI Scanner
            </>
          )}
        </button>
      </div>

      {/* Collapsible Parameter Config Panel */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glassmorphism-purple rounded-xl p-5 border-neon-purple overflow-hidden shadow-lg shadow-purple-500/5 space-y-4"
          >
            <h3 className="text-xs font-bold font-tech text-purple-400 uppercase tracking-widest flex items-center gap-2">
              <Settings className="w-4 h-4 animate-spin-slow" /> AI Scanner Technical Parameters Configuration
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-tech text-purple-300/80 uppercase tracking-wider">RSI Oversold Limit</label>
                <input
                  type="number"
                  value={rsiOversold}
                  onChange={(e) => setRsiOversold(e.target.value)}
                  className="w-full bg-slate-950/80 border border-purple-500/20 rounded py-1.5 px-3 text-xs text-slate-100 font-tech focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-tech text-purple-300/80 uppercase tracking-wider">RSI Overbought Limit</label>
                <input
                  type="number"
                  value={rsiOverbought}
                  onChange={(e) => setRsiOverbought(e.target.value)}
                  className="w-full bg-slate-950/80 border border-purple-500/20 rounded py-1.5 px-3 text-xs text-slate-100 font-tech focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-tech text-purple-300/80 uppercase tracking-wider">Short EMA Period</label>
                <input
                  type="number"
                  value={emaShort}
                  onChange={(e) => setEmaShort(e.target.value)}
                  className="w-full bg-slate-950/80 border border-purple-500/20 rounded py-1.5 px-3 text-xs text-slate-100 font-tech focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-tech text-purple-300/80 uppercase tracking-wider">Long EMA Period</label>
                <input
                  type="number"
                  value={emaLong}
                  onChange={(e) => setEmaLong(e.target.value)}
                  className="w-full bg-slate-950/80 border border-purple-500/20 rounded py-1.5 px-3 text-xs text-slate-100 font-tech focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
            <p className="text-[10px] text-purple-300/40 font-tech italic">Perubahan parameter di atas akan langsung memodifikasi ambang batas audit kalkulasi RSI dan persilangan garis EMA yang digunakan oleh AI Scanner.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanned Cryptos Grid */}
      {filteredScanner.length === 0 ? (
        <div className="glassmorphism rounded-xl border border-cyan-500/10 p-16 text-center text-cyan-300/30 flex flex-col items-center justify-center font-tech">
          <Compass className="w-16 h-16 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold uppercase">Scanner Belum Dijalankan</h3>
          <p className="text-xs text-cyan-300/10 max-w-sm mt-2">Klik tombol "Start AI Scanner" untuk menganalisis data real-time RSI, MACD, Bollinger Bands, dan volume koin crypto terpopuler.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredScanner.map((item, idx) => {
            const isBuy = item.recommendedAction === 'BUY';
            return (
              <motion.div
                key={item.symbol}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`glassmorphism rounded-xl border p-5 flex flex-col justify-between ${
                  isBuy ? 'border-neon-green bg-gradient-to-b from-emerald-950/5 to-transparent' : 'border-neon-magenta bg-gradient-to-b from-rose-950/5 to-transparent'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold font-tech text-slate-100">{item.symbol}</h3>
                        <span className={`text-[8px] px-1 rounded font-tech font-bold ${
                          idx % 3 === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          idx % 3 === 1 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                          'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {idx % 3 === 0 ? 'BINANCE' : idx % 3 === 1 ? 'BYBIT' : 'OKX'}
                        </span>
                      </div>
                      <span className="text-[10px] text-cyan-300/40 font-tech">Vol: ${(item.volume / 1000000).toFixed(1)}M</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-tech font-bold ${
                      isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {item.recommendedAction}
                    </span>
                  </div>

                  {/* Confidence Score Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-tech">
                      <span className="text-cyan-300/50">Confidence Score:</span>
                      <span className={isBuy ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{item.confidenceScore}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-cyan-500/10">
                      <div className={`h-full ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${item.confidenceScore}%` }} />
                    </div>
                  </div>

                  {/* Technical Indicator Stats */}
                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-cyan-500/10 pt-3">
                    <div>
                      <span className="text-[10px] text-cyan-300/40 uppercase tracking-wider font-tech">RSI (14)</span>
                      <p className="font-bold font-tech text-slate-300 mt-0.5">{item.indicators.rsi}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-300/40 uppercase tracking-wider font-tech">StochRSI (5,3,3)</span>
                      <p className="font-bold font-tech text-purple-300 mt-0.5">
                        {item.indicators.stochRsi ? `K:${Math.round(item.indicators.stochRsi.k)} D:${Math.round(item.indicators.stochRsi.d)}` : 'K:50 D:50'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-300/40 uppercase tracking-wider font-tech">EMA 13 / 21 Trend</span>
                      <div className="mt-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-tech font-bold uppercase tracking-wider ${
                          item.indicators.emaTrend13_21 === 'BULL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/20 text-rose-400 border border-rose-500/20'
                        }`}>
                          {item.indicators.emaTrend13_21 || 'BULL'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-300/40 uppercase tracking-wider font-tech">Support Target</span>
                      <p className="font-bold font-tech text-slate-300 mt-0.5">${item.indicators.support?.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-cyan-300/40 uppercase tracking-wider font-tech">Detected Setup Signals</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {item.tags.map((tag, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-950 rounded text-[9px] font-tech text-cyan-400 border border-cyan-500/25">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-cyan-500/10 flex justify-between items-center text-[10px] font-tech">
                  <span className="text-cyan-300/30">Price: ${item.price?.toFixed(2)}</span>
                  <span className={item.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent?.toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. CUSTOM STRATEGY BUILDER
// ==========================================
function StrategyBuilder() {
  const { strategies, addStrategy, deleteStrategy } = useContext(AppContext);
  const [name, setName] = useState('');
  const [timeframe, setTimeframe] = useState('15m');
  const [rsiLower, setRsiLower] = useState('30');
  const [stopLoss, setStopLoss] = useState('2');
  const [takeProfit, setTakeProfit] = useState('6');
  const [riskReward, setRiskReward] = useState('1:3');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const entryConditions = {
        rsi: { operator: '<', value: parseInt(rsiLower) },
        volumeSurge: true
      };
      await addStrategy({
        name,
        timeframe,
        entryConditions,
        stopLoss: parseFloat(stopLoss),
        takeProfit: parseFloat(takeProfit),
        riskReward
      });
      // reset form
      setName('');
      setRsiLower('30');
    } catch (err) {
      alert('Gagal membuat strategi');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Strategy Form */}
      <div className="glassmorphism rounded-xl p-6 border-neon-blue space-y-5">
        <h2 className="text-lg font-bold font-tech text-cyan-400 flex items-center gap-2">
          <Terminal className="w-5 h-5" /> CREATE NEW STRATEGY
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-tech text-cyan-300/80 uppercase tracking-widest">Strategy Name</label>
            <input
              type="text"
              required
              placeholder="e.g. RSI Oversold Breakout"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-tech"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-tech text-cyan-300/80 uppercase tracking-widest">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-tech font-bold"
              >
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="1h">1h</option>
                <option value="4h">4h</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-tech text-cyan-300/80 uppercase tracking-widest">RSI Threshold</label>
              <input
                type="number"
                required
                min="10"
                max="50"
                value={rsiLower}
                onChange={(e) => setRsiLower(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-tech"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-tech text-cyan-300/80 uppercase tracking-widest">Stop Loss (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-tech"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-tech text-cyan-300/80 uppercase tracking-widest">Take Profit (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-tech"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-tech text-cyan-300/80 uppercase tracking-widest">Risk-Reward Ratio</label>
            <input
              type="text"
              required
              value={riskReward}
              onChange={(e) => setRiskReward(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-tech"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500/25 hover:bg-cyan-500/35 text-cyan-400 border border-cyan-500/40 font-bold font-tech text-xs uppercase py-3 rounded-lg cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/10"
          >
            Create Strategy
          </button>
        </form>
      </div>

      {/* Strategies List */}
      <div className="lg:col-span-2 glassmorphism rounded-xl p-6 border-neon-purple flex flex-col">
        <h2 className="text-lg font-bold font-tech text-purple-400 mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5" /> ACTIVE TRADING STRATEGIES
        </h2>

        <div className="flex-1 space-y-4 overflow-y-auto max-h-[430px] pr-2">
          {strategies.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-cyan-300/20 font-tech py-12">
              <Terminal className="w-12 h-12 mb-2 animate-pulse" />
              <p className="text-xs uppercase">Belum ada strategi yang dibuat...</p>
            </div>
          ) : (
            strategies.map((s) => {
              const cond = JSON.parse(s.entryConditions || '{}');
              return (
                <div key={s.id} className="p-5 rounded-xl bg-slate-950/60 border border-purple-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-purple-500/25 border border-purple-500/40 text-purple-300 text-[9px] font-tech font-bold uppercase tracking-wider">{s.timeframe}</span>
                    <h3 className="text-md font-bold font-tech text-slate-200 mt-1">{s.name}</h3>
                    <p className="text-xs text-cyan-300/40 font-tech mt-1">
                      Rules: RSI &lt; {cond.rsi?.value || 30} & volume surge = TRUE
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-end gap-3 w-full sm:w-auto">
                    <div className="text-right text-xs font-tech">
                      <span className="text-cyan-300/40">Risk-Reward:</span>
                      <p className="font-bold text-slate-200 mt-0.5">{s.riskReward}</p>
                    </div>
                    <button
                      onClick={() => deleteStrategy(s.id)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/35 text-rose-400 rounded-lg text-xs font-tech font-bold cursor-pointer transition-all uppercase"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. AI TRADING JOURNAL & CALENDAR
// ==========================================
function TradingJournal() {
  const { trades, openTrade, closeTrade, deleteTrade } = useContext(AppContext);
  const [pair, setPair] = useState('BTCUSDT');
  const [type, setType] = useState('BUY');
  const [entryPrice, setEntryPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [emotion, setEmotion] = useState('Calm');
  const [notes, setNotes] = useState('');

  // Close trade popover form inputs
  const [closingId, setClosingId] = useState(null);
  const [exitPrice, setExitPrice] = useState('');
  const [exitReason, setExitReason] = useState('');
  const [exitEmotion, setExitEmotion] = useState('Calm');
  const [mistakes, setMistakes] = useState([]);

  // Monthly Calendar Grid State and Helpers
  const [calDate, setCalDate] = useState(new Date());

  const year = calDate.getFullYear();
  const month = calDate.getMonth();

  const monthNames = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  const handlePrevMonth = () => {
    setCalDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalDate(new Date(year, month + 1, 1));
  };

  const getDayStats = (dayNum) => {
    const dayTrades = trades.filter(t => {
      const d = new Date(t.createdAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dayNum;
    });

    if (dayTrades.length === 0) return null;

    const isOpen = dayTrades.some(t => t.status === 'OPEN');
    const closedTrades = dayTrades.filter(t => t.status === 'CLOSED');
    const netPnL = closedTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    const hasClosed = closedTrades.length > 0;

    return {
      count: dayTrades.length,
      isOpen,
      hasClosed,
      netPnL,
      trades: dayTrades
    };
  };

  const handleOpen = async (e) => {
    e.preventDefault();
    try {
      await openTrade({
        pair,
        type,
        entryPrice: parseFloat(entryPrice),
        amount: parseFloat(amount),
        reason,
        emotion,
        notes
      });
      // reset
      setEntryPrice('');
      setAmount('');
      setReason('');
      setNotes('');
    } catch (err) {
      alert('Gagal mencatat trade');
    }
  };

  const handleClose = async (e) => {
    e.preventDefault();
    try {
      await closeTrade(closingId, {
        exitPrice: parseFloat(exitPrice),
        exitReason,
        emotion: exitEmotion,
        mistakes
      });
      setClosingId(null);
      setExitPrice('');
      setExitReason('');
    } catch (err) {
      alert('Gagal menutup trade');
    }
  };

  const handleMistakeToggle = (tag) => {
    setMistakes(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      {/* Monthly Trading Win/Loss Calendar Grid */}
      <div className="glassmorphism rounded-xl p-5 border-neon-purple space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-sm font-bold font-tech text-purple-400 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-5 h-5 animate-pulse" /> MONTHLY JOURNAL PERFORMANCE GRID
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevMonth}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-purple-500/20 text-purple-300 hover:text-purple-200 rounded font-tech text-[10px] cursor-pointer transition-all uppercase tracking-wider"
            >
              &lt; Prev
            </button>
            <span className="font-tech font-bold text-slate-200 text-xs tracking-widest min-w-[120px] text-center border-x border-purple-500/25 px-3">
              {monthNames[month]} {year}
            </span>
            <button 
              onClick={handleNextMonth}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-purple-500/20 text-purple-300 hover:text-purple-200 rounded font-tech text-[10px] cursor-pointer transition-all uppercase tracking-wider"
            >
              Next &gt;
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-tech font-bold text-purple-300/60 uppercase tracking-wider border-b border-purple-500/10 pb-1.5">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before the start day of month */}
          {Array(startDayIndex).fill(null).map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square bg-slate-950/5 border border-cyan-500/0 rounded-lg opacity-20" />
          ))}

          {/* Actual day cells */}
          {Array(daysInMonth).fill(null).map((_, idx) => {
            const dayNum = idx + 1;
            const stats = getDayStats(dayNum);
            
            let cellStyle = "bg-slate-950/20 border-cyan-500/5 text-slate-500 hover:border-cyan-500/25";
            let pnlLabel = null;

            if (stats) {
              if (stats.isOpen) {
                cellStyle = "bg-cyan-950/20 border-cyan-500 text-cyan-400 animate-pulse glow-blue font-bold";
                pnlLabel = <span className="text-[7px] block font-tech uppercase tracking-tighter mt-1 bg-cyan-500/10 px-1 rounded">OPEN</span>;
              } else if (stats.hasClosed) {
                if (stats.netPnL > 0) {
                  cellStyle = "bg-emerald-950/40 border-emerald-500 text-emerald-400 glow-green font-bold";
                  pnlLabel = <span className="text-[8px] block font-tech mt-1 bg-emerald-500/10 px-1 rounded">+${stats.netPnL.toFixed(1)}</span>;
                } else if (stats.netPnL < 0) {
                  cellStyle = "bg-rose-950/40 border-rose-500 text-rose-400 glow-magenta font-bold";
                  pnlLabel = <span className="text-[8px] block font-tech mt-1 bg-rose-500/10 px-1 rounded">-${Math.abs(stats.netPnL).toFixed(1)}</span>;
                } else {
                  cellStyle = "bg-slate-900 border-slate-600 text-slate-300 font-bold";
                  pnlLabel = <span className="text-[8px] block font-tech mt-1 bg-slate-500/10 px-1 rounded">$0</span>;
                }
              }
            }

            return (
              <motion.div
                key={`day-${dayNum}`}
                whileHover={{ scale: 1.08 }}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center border text-xs relative cursor-pointer group ${cellStyle}`}
              >
                <span className="font-tech text-xs">{dayNum}</span>
                {pnlLabel}

                {/* Hover Tooltip showing details */}
                {stats && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-slate-950/95 border border-purple-500/40 text-[10px] font-tech text-slate-200 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-30 shadow-2xl leading-relaxed whitespace-normal text-left shadow-purple-500/10">
                    <p className="font-bold text-purple-300 uppercase tracking-widest border-b border-purple-500/10 pb-1 mb-1 flex justify-between items-center">
                      <span>Detail Tanggal {dayNum}</span>
                      <span className="text-[8px] text-slate-400 font-light">{monthNames[month]} {year}</span>
                    </p>
                    <p className="mt-1">Total Posisi: <span className="font-bold text-slate-100">{stats.count}</span></p>
                    {stats.hasClosed && (
                      <p>Net PnL Hari Ini: <span className={`font-bold ${stats.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stats.netPnL >= 0 ? '+' : ''}${stats.netPnL.toFixed(2)}
                      </span></p>
                    )}
                    {stats.isOpen && <p className="text-cyan-400 font-bold animate-pulse uppercase tracking-wider mt-1 flex items-center gap-1">● POSISI AKTIF OPEN</p>}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Log Form */}
        <div className="glassmorphism rounded-xl p-6 border-neon-blue space-y-4 h-fit">
          <h2 className="text-lg font-bold font-tech text-cyan-400 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> LOG NEW TRADE ENTRY
          </h2>

          <form onSubmit={handleOpen} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-tech text-cyan-300 uppercase tracking-widest">Token Pair</label>
                <select
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-tech font-bold"
                >
                  <option value="BTCUSDT">BTC/USDT</option>
                  <option value="ETHUSDT">ETH/USDT</option>
                  <option value="SOLUSDT">SOL/USDT</option>
                  <option value="BNBUSDT">BNB/USDT</option>
                  <option value="DOGEUSDT">DOGE/USDT</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-tech text-cyan-300 uppercase tracking-widest">Position Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-tech font-bold"
                >
                  <option value="BUY">🟢 BUY / LONG</option>
                  <option value="SELL">🔴 SELL / SHORT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-tech text-cyan-300 uppercase tracking-widest">Entry Price ($)</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  placeholder="e.g. 67450"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-xs text-slate-100 placeholder-slate-700 focus:outline-none focus:border-cyan-400 font-tech"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-tech text-cyan-300 uppercase tracking-widest">Amount (Qty)</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  placeholder="e.g. 0.05"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-xs text-slate-100 placeholder-slate-700 focus:outline-none focus:border-cyan-400 font-tech"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-tech text-cyan-300 uppercase tracking-widest">Primary Emotion</label>
              <div className="flex gap-2.5">
                {['Calm', 'Fear', 'Greed', 'Revenge', 'FOMO'].map((emo) => (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => setEmotion(emo)}
                    className={`flex-1 py-1 rounded text-[10px] font-tech font-bold border transition-all cursor-pointer ${
                      emotion === emo ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-cyan-500/10 text-cyan-300/40'
                    }`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-tech text-cyan-300 uppercase tracking-widest">Entry Reason Description</label>
              <textarea
                required
                rows="2"
                placeholder="RSI oversold & breakout EMA 20 regional support..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-xs text-slate-100 placeholder-slate-700 focus:outline-none focus:border-cyan-400 font-tech"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 font-bold font-tech text-xs uppercase py-3 rounded-lg cursor-pointer transition-all hover:shadow-lg"
            >
              Open Trade Position
            </button>
          </form>
        </div>

        {/* Trade History Ledger List */}
        <div className="lg:col-span-2 glassmorphism rounded-xl p-6 border-neon-purple flex flex-col">
          <h2 className="text-lg font-bold font-tech text-purple-400 mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5" /> TRADING JOURNAL HISTORIES
          </h2>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[460px] pr-2">
            {trades.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-cyan-300/20 font-tech py-12">
                <BookOpen className="w-12 h-12 mb-2 animate-pulse" />
                <p className="text-xs uppercase">Belum ada catatan jurnal trading...</p>
              </div>
            ) : (
              trades.map((t) => {
                const isOpen = t.status === 'OPEN';
                const isWin = t.profitLoss > 0;
                return (
                  <div key={t.id} className="p-5 rounded-xl bg-slate-950/60 border border-purple-500/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase tracking-wider ${
                          t.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {t.type} {t.pair}
                        </span>
                        <p className="text-[10px] text-cyan-300/40 font-tech mt-1">{new Date(t.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="text-right">
                        {isOpen ? (
                          <button
                            onClick={() => setClosingId(t.id)}
                            className="px-3.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded text-xs font-tech font-bold uppercase cursor-pointer"
                          >
                            Close Position
                          </button>
                        ) : (
                          <span className={`text-md font-tech font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isWin ? '+' : ''}${t.profitLoss?.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-tech border-t border-cyan-500/5 pt-3">
                      <div>
                        <span className="text-cyan-300/30">Entry Price:</span>
                        <p className="text-slate-200 mt-0.5">${t.entryPrice}</p>
                      </div>
                      <div>
                        <span className="text-cyan-300/30">Exit Price:</span>
                        <p className="text-slate-200 mt-0.5">{isOpen ? 'Active' : `$${t.exitPrice}`}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-cyan-300/30">Entry Reason:</span>
                        <p className="text-slate-300 mt-0.5 font-light">{t.reason}</p>
                      </div>
                      <div className="col-span-2 flex justify-between items-center border-t border-cyan-500/5 pt-3 text-[10px]">
                        <span className="px-2 py-0.5 bg-slate-900 border border-cyan-500/10 text-cyan-300 rounded font-bold uppercase">Emotion: {t.emotion}</span>
                        <button onClick={() => deleteTrade(t.id)} className="text-rose-500/60 hover:text-rose-400 cursor-pointer uppercase">Delete Entry</button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Close Position Modal Overlay */}
      {closingId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md glassmorphism border-neon-blue rounded-xl p-6 space-y-4">
            <h3 className="text-md font-bold font-tech text-cyan-400 uppercase tracking-widest border-b border-cyan-500/10 pb-2">
              CLOSE PAPER POSITION
            </h3>

            <form onSubmit={handleClose} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-tech text-cyan-300 uppercase">Exit Settlement Price ($)</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  placeholder="e.g. 68250"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-tech"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-tech text-cyan-300 uppercase">Exit Reason</label>
                <input
                  type="text"
                  required
                  placeholder="Target profit hit / stop loss breached"
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-tech"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-tech text-cyan-300 uppercase">Settlement Emotion</label>
                <div className="flex gap-2">
                  {['Calm', 'Fear', 'Greed', 'Revenge', 'FOMO'].map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setExitEmotion(emo)}
                      className={`flex-1 py-1 rounded text-[10px] font-tech font-bold border cursor-pointer ${
                        exitEmotion === emo ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-cyan-500/10 text-cyan-300/40'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-tech text-cyan-300 uppercase">Trading Pitfalls Committed</label>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {["FOMO Entry", "Moved Stop Loss", "No Stop Loss", "Overtrading", "Chasing Pump"].map(tag => {
                    const active = mistakes.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleMistakeToggle(tag)}
                        className={`px-2 py-1 rounded text-[9px] font-tech border cursor-pointer ${
                          active ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold animate-pulse' : 'bg-slate-950 border-cyan-500/10 text-cyan-300/40'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setClosingId(null)}
                  className="flex-1 py-2 border border-cyan-500/20 text-cyan-300 rounded text-xs font-tech uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-bold font-tech text-xs uppercase rounded"
                >
                  Settle Trade
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. AI EVALUATOR DIAGNOSTIC
// ==========================================
function AIEvaluator() {
  const { evalData, speakAI, loadEvaluation, loading } = useContext(AppContext);

  return (
    <div className="space-y-6 print-area">
      {/* Print-only dossier header */}
      <div className="hidden print-header">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">AI TRADING AUDIT REPORT DOSSIER</h1>
        <p className="text-xs text-slate-500 mt-1">Generated by Rafi AI Trading Assistant • Performance & Discipline Audit Review</p>
        <div className="text-[10px] text-slate-400 mt-2 flex justify-between px-4 border-t border-b border-slate-200 py-1">
          <span>Date: {new Date().toLocaleString()}</span>
          <span>Trader ID: RAFI_PRO_TRADER_001</span>
          <span>Platform: Tools AI Trading by Rafi</span>
        </div>
      </div>
      {/* Audit Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glassmorphism rounded-xl p-5 border-neon-blue flex items-center justify-between">
          <div>
            <span className="text-[10px] font-tech text-cyan-400 uppercase tracking-widest">Akurasi Setup</span>
            <p className="text-3xl font-bold font-tech text-slate-100 mt-1">{evalData?.accuracyScore || 70}%</p>
          </div>
          <div className="w-14 h-14 rounded-full border-2 border-cyan-500/40 flex items-center justify-center text-xs font-tech text-cyan-400 font-bold">
            ACC
          </div>
        </div>

        <div className="glassmorphism rounded-xl p-5 border-neon-purple flex items-center justify-between">
          <div>
            <span className="text-[10px] font-tech text-purple-400 uppercase tracking-widest">Disiplin Manajemen Risiko</span>
            <p className="text-3xl font-bold font-tech text-slate-100 mt-1">{evalData?.riskScore || 80}%</p>
          </div>
          <div className="w-14 h-14 rounded-full border-2 border-purple-500/40 flex items-center justify-center text-xs font-tech text-purple-400 font-bold">
            RISK
          </div>
        </div>

        <div className="glassmorphism rounded-xl p-5 border-neon-green flex items-center justify-between">
          <div>
            <span className="text-[10px] font-tech text-emerald-400 uppercase tracking-widest">Skor Disiplin Total</span>
            <p className="text-3xl font-bold font-tech text-slate-100 mt-1">{evalData?.disciplineScore || 85}%</p>
          </div>
          <div className="w-14 h-14 rounded-full border-2 border-emerald-500/40 flex items-center justify-center text-xs font-tech text-emerald-400 font-bold">
            DISC
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mentor Audio card */}
        <div className="glassmorphism rounded-xl p-6 border-neon-green flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-tech text-emerald-400 flex items-center gap-2 uppercase tracking-widest">
              <Sparkles className="w-5 h-5 animate-pulse" /> AI Trading Mentor Feedback
            </h2>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/10 italic text-slate-300 text-sm leading-relaxed">
              {evalData?.mentorFeedback || "Halo Rafi! Hubungkan data jurnal Anda untuk mulai mendengarkan evaluasi personal trader Anda secara lisan."}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={loadEvaluation}
              disabled={loading}
              className="flex-1 py-3 bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/30 text-cyan-300 font-bold font-tech text-xs uppercase rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Run AI Diagnostic Audit
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => speakAI(evalData?.mentorFeedback || "Jaga konsistensi setup.")}
                className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-tech text-xs uppercase rounded-lg cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-2 shadow-lg"
              >
                <Volume2 className="w-4 h-4 shrink-0" /> Play Voice
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-100 font-bold font-tech text-xs uppercase rounded-lg cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-2 shadow-lg shadow-purple-500/25"
              >
                <Download className="w-4 h-4 shrink-0" /> Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Psychological Diagnostic details */}
        <div className="glassmorphism rounded-xl p-6 border-neon-purple flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <h2 className="text-lg font-bold font-tech text-purple-400 flex items-center gap-2 uppercase tracking-widest">
              <AlertTriangle className="w-5 h-5" /> PITFALLS & ACTIONS PLAN
            </h2>

            <div className="space-y-4 text-xs font-tech">
              <div>
                <span className="text-pink-400 font-bold uppercase tracking-wider">Identifikasi Kebiasaan Buruk:</span>
                <ul className="list-disc pl-4 text-slate-300 mt-1.5 space-y-1">
                  {evalData?.keyPitfalls?.map((pit, i) => (
                    <li key={i} className="text-pink-300/80 font-bold">{pit}</li>
                  )) || <li>Belum terdeteksi kebiasaan buruk yang dominan. Bagus!</li>}
                </ul>
              </div>

              <div>
                <span className="text-emerald-400 font-bold uppercase tracking-wider">Kekuatan Utama Anda:</span>
                <ul className="list-disc pl-4 text-slate-300 mt-1.5 space-y-1">
                  {evalData?.setupStrengths?.map((str, i) => (
                    <li key={i}>{str}</li>
                  )) || <li>Siap menganalisis kelebihan strategi Anda.</li>}
                </ul>
              </div>

              <div>
                <span className="text-cyan-400 font-bold uppercase tracking-wider">Rencana Aksi Korektif:</span>
                <ul className="list-disc pl-4 text-slate-300 mt-1.5 space-y-1">
                  {evalData?.recommendations?.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  )) || <li>Selalu pasang stop loss.</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. BACKTESTING & PAPER TRADING TERMINAL
// ==========================================
function PaperTradingTerminal() {
  const { runBacktestSim, tickers, openTrade, user } = useContext(AppContext);
  
  // Backtest Inputs
  const [backtestSymbol, setBacktestSymbol] = useState('BTCUSDT');
  const [backtestTimeframe, setBacktestTimeframe] = useState('15m');
  const [backtestResults, setBacktestResults] = useState(null);
  const [backtesting, setBacktesting] = useState(false);

  // Paper Trade Inputs
  const [paperSymbol, setPaperSymbol] = useState('BTCUSDT');
  const [paperType, setPaperType] = useState('BUY');
  const [paperAmount, setPaperAmount] = useState('');
  const [paperMessage, setPaperMessage] = useState(null);

  const handleBacktest = async (e) => {
    e.preventDefault();
    setBacktesting(true);
    setBacktestResults(null);
    try {
      const data = await runBacktestSim({
        symbol: backtestSymbol,
        timeframe: backtestTimeframe,
        rsiLower: 30,
        rsiUpper: 70
      });
      setBacktestResults(data);
    } catch (err) {
      alert('Backtest gagal dijalankan.');
    } finally {
      setBacktesting(false);
    }
  };

  const handlePaperOrder = async (e) => {
    e.preventDefault();
    setPaperMessage(null);
    const activeTicker = tickers.find(t => t.symbol === paperSymbol);
    if (!activeTicker) return;

    try {
      await openTrade({
        pair: paperSymbol,
        type: paperType,
        entryPrice: activeTicker.price,
        amount: parseFloat(paperAmount),
        reason: 'Sinyal Paper Trading Terminal Live',
        emotion: 'Calm',
        notes: 'Order live paper trading risk-free'
      });
      setPaperMessage({ success: true, text: `Berhasil mengeksekusi order ${paperType} ${paperAmount} ${paperSymbol}!` });
      setPaperAmount('');
    } catch (err) {
      setPaperMessage({ success: false, text: err.message || 'Eksekusi paper order gagal.' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Live Order Book Entry */}
      <div className="glassmorphism rounded-xl p-6 border-neon-blue space-y-4 h-fit">
        <h2 className="text-lg font-bold font-tech text-cyan-400 flex items-center gap-2">
          <Terminal className="w-5 h-5" /> PAPER ORDER ENTRY TICKET
        </h2>

        {paperMessage && (
          <div className={`p-3 rounded text-xs font-tech font-bold border ${
            paperMessage.success ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}>
            {paperMessage.text}
          </div>
        )}

        <form onSubmit={handlePaperOrder} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-tech text-cyan-300 uppercase">Asset Symbol</label>
              <select
                value={paperSymbol}
                onChange={(e) => setPaperSymbol(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-tech font-bold"
              >
                {tickers.map(t => (
                  <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-tech text-cyan-300 uppercase">Trade Direction</label>
              <select
                value={paperType}
                onChange={(e) => setPaperType(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-tech font-bold"
              >
                <option value="BUY">🟢 LONG / BUY</option>
                <option value="SELL">🔴 SHORT / SELL</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-tech text-cyan-300 uppercase">Order Quantity</label>
            <input
              type="number"
              step="0.001"
              required
              placeholder="e.g. 0.05 Qty"
              value={paperAmount}
              onChange={(e) => setPaperAmount(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-tech"
            />
          </div>

          <div className="p-3 bg-slate-950 border border-cyan-500/10 rounded-lg text-xs font-tech">
            <span className="text-cyan-300/30 uppercase">Est. Cost:</span>
            <p className="text-slate-100 font-bold mt-0.5">
              ${((tickers.find(t => t.symbol === paperSymbol)?.price || 0) * (parseFloat(paperAmount) || 0))?.toFixed(2)}
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold font-tech text-xs uppercase py-3 rounded-lg cursor-pointer transition-all"
          >
            Execute Paper Order
          </button>
        </form>
      </div>

      {/* Backtesting Simulator Module */}
      <div className="lg:col-span-2 glassmorphism rounded-xl p-6 border-neon-purple flex flex-col space-y-4">
        <h2 className="text-lg font-bold font-tech text-purple-400 flex items-center gap-2">
          <Compass className="w-5 h-5" /> 30-DAY STRATEGY BACKTESTER
        </h2>

        <form onSubmit={handleBacktest} className="flex flex-wrap items-center gap-4 bg-slate-950/60 p-4 border border-purple-500/10 rounded-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-tech text-purple-400 uppercase tracking-widest">Symbol</span>
            <select
              value={backtestSymbol}
              onChange={(e) => setBacktestSymbol(e.target.value)}
              className="bg-slate-950 border border-cyan-500/20 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none font-tech font-bold"
            >
              {tickers.map(t => (
                <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-tech text-purple-400 uppercase tracking-widest">Interval</span>
            <select
              value={backtestTimeframe}
              onChange={(e) => setBacktestTimeframe(e.target.value)}
              className="bg-slate-950 border border-cyan-500/20 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none font-tech font-bold"
            >
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={backtesting}
            className="px-5 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded text-xs font-tech font-bold cursor-pointer transition-all uppercase flex items-center gap-2"
          >
            {backtesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {backtesting ? "Simulating..." : "Run Simulator"}
          </button>
        </form>

        {/* Simulator Results screen */}
        {backtestResults ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-3 flex-1 overflow-y-auto max-h-[300px] pr-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-950/60 border border-cyan-500/5 rounded text-xs font-tech text-center">
                <span className="text-cyan-300/30 uppercase">Win Rate</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">{backtestResults.winrate}%</p>
              </div>
              <div className="p-3 bg-slate-950/60 border border-cyan-500/5 rounded text-xs font-tech text-center">
                <span className="text-cyan-300/30 uppercase">Total trades</span>
                <p className="text-lg font-bold text-slate-200 mt-1">{backtestResults.totalTrades}</p>
              </div>
              <div className="p-3 bg-slate-950/60 border border-cyan-500/5 rounded text-xs font-tech text-center">
                <span className="text-cyan-300/30 uppercase">Initial cash</span>
                <p className="text-lg font-bold text-slate-300 mt-1">$10,000</p>
              </div>
              <div className="p-3 bg-slate-950/60 border border-cyan-500/5 rounded text-xs font-tech text-center">
                <span className="text-cyan-300/30 uppercase">Final cash</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">${backtestResults.finalBalance?.toFixed(2)}</p>
              </div>
            </div>

            {/* Candle backtest list */}
            <div className="space-y-2">
              <span className="text-[10px] font-tech text-purple-300/40 uppercase tracking-widest">Simulated Transactions Ledger</span>
              {backtestResults.trades?.slice(0, 5).map((tr, idx) => {
                const win = tr.profitLoss > 0;
                return (
                  <div key={idx} className="p-3 rounded bg-slate-950/40 border border-cyan-500/5 flex justify-between items-center text-xs font-tech">
                    <div>
                      <span className={win ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{win ? 'LONG WIN' : 'LONG LOSS'}</span>
                      <p className="text-[10px] text-cyan-300/30 mt-0.5">Entry: ${tr.entryPrice?.toFixed(2)} • Exit: ${tr.exitPrice?.toFixed(2)}</p>
                    </div>
                    <span className={win ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {win ? '+' : ''}{tr.profitPercent?.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-cyan-300/20 font-tech py-12">
            <Compass className="w-12 h-12 mb-2 animate-pulse" />
            <p className="text-xs uppercase">Tekan "Run Simulator" untuk melihat performa 30 hari.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 7. gamified DAILY MISSIONS & SETTINGS
// ==========================================
function SettingsTab() {
  const { settings, saveSettings, user } = useContext(AppContext);
  const [telegramToken, setTelegramToken] = useState(settings?.telegramToken || '');
  const [telegramChatId, setTelegramChatId] = useState(settings?.telegramChatId || '');
  const [discordWebhook, setDiscordWebhook] = useState(settings?.discordWebhook || '');
  const [message, setMessage] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await saveSettings({
        telegramToken,
        telegramChatId,
        discordWebhook,
        emailAlerts: settings?.emailAlerts || false,
        pushNotifications: settings?.pushNotifications || true
      });
      setMessage('Pengaturan integrasi notifikasi berhasil disimpan!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert('Gagal menyimpan pengaturan');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Daily Missions */}
      <div className="glassmorphism rounded-xl p-6 border-neon-purple flex flex-col space-y-4">
        <h2 className="text-lg font-bold font-tech text-purple-400 flex items-center gap-2">
          <Terminal className="w-5 h-5 animate-pulse" /> DAILY TRADER MISSIONS
        </h2>
        <p className="text-xs text-purple-300/50 font-tech">Selesaikan misi disiplin harian untuk melatih konsistensi psikologi Anda.</p>
        
        <div className="space-y-3.5 pt-2">
          {[
            { title: "Risk Management Disiplin", desc: "Wajib set Stop Loss pada trade Anda hari ini.", reward: 100, done: true },
            { title: "Logging Trade Detail", desc: "Catat emosi FOMO/Calm di jurnal trading Anda.", reward: 150, done: false },
            { title: "Detoks Overtrading", desc: "Jangan melanggar limit maksimal 3 trade per hari.", reward: 200, done: false }
          ].map((m, i) => (
            <div key={i} className="p-3.5 rounded-lg bg-slate-950/60 border border-purple-500/10 flex justify-between items-start text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200 font-tech flex items-center gap-1.5">
                  {m.done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />} {m.title}
                </h4>
                <p className="text-[10px] text-cyan-300/40 font-tech">{m.desc}</p>
              </div>
              <span className="px-2 py-0.5 bg-purple-500/25 border border-purple-500/40 text-purple-300 text-[9px] font-tech rounded-lg shrink-0">+{m.reward} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Form */}
      <div className="lg:col-span-2 glassmorphism rounded-xl p-6 border-neon-blue flex flex-col space-y-4">
        <h2 className="text-lg font-bold font-tech text-cyan-400 flex items-center gap-2">
          <Settings className="w-5 h-5" /> NOTIFICATION INTEGRATION SETTINGS
        </h2>

        {message && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-tech font-bold rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-tech text-cyan-300 uppercase">Telegram Bot Token</label>
              <input
                type="text"
                placeholder="e.g. 719284917:AAHdf..."
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-tech"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-tech text-cyan-300 uppercase">Telegram Chat ID</label>
              <input
                type="text"
                placeholder="e.g. 5819481"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-tech"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-tech text-cyan-300 uppercase">Discord Webhook URL</label>
            <input
              type="text"
              placeholder="https://discord.com/api/webhooks/..."
              value={discordWebhook}
              onChange={(e) => setDiscordWebhook(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-tech"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-cyan-500/25 hover:bg-cyan-500/35 text-cyan-400 border border-cyan-500/40 font-bold font-tech text-xs uppercase rounded-lg cursor-pointer transition-all hover:shadow-lg"
          >
            Save Credentials
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// MAIN DASHBOARD LAYOUT SHELL
// ==========================================
function TerminalShell() {
  const { user, logoutUser, activeTab, setActiveTab } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const { sendChatMessage, isVoiceActive } = useContext(AppContext);
  const [chatLog, setChatLog] = useState([
    { role: 'assistant', text: 'Halo Rafi! Ada yang ingin ditanyakan seputar analisis indikator koin potensial atau kebiasaan buruk trading Anda hari ini?' }
  ]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const msg = chatMessage;
    setChatLog(prev => [...prev, { role: 'user', text: msg }]);
    setChatMessage('');
    try {
      const response = await sendChatMessage(msg);
      setChatLog(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      setChatLog(prev => [...prev, { role: 'assistant', text: 'Koneksi AI assistant terputus.' }]);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Terminal Terminal', icon: Terminal },
    { id: 'scanner', label: 'AI Scanner', icon: Search },
    { id: 'strategy', label: 'Strategy Builder', icon: Compass },
    { id: 'journal', label: 'Journal & History', icon: BookOpen },
    { id: 'evaluation', label: 'AI Evaluator', icon: BarChart3 },
    { id: 'paper-trading', label: 'Paper & Sim', icon: Play },
    { id: 'settings', label: 'Integrations settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Dynamic Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* Cyberpunk Navigation Sidebar */}
      <aside className="w-full md:w-64 glassmorphism border-r border-cyan-500/10 flex flex-col justify-between shrink-0 relative z-20">
        <div>
          {/* Header Brand */}
          <div className="p-6 border-b border-cyan-500/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center shadow glow-blue shrink-0">
              <Terminal className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h2 className="text-md font-bold font-tech text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase">
                Tools AI Trading
              </h2>
              <span className="text-[9px] text-cyan-300/40 font-tech">BY RAFI • V1.0.0 PRO</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold font-tech uppercase tracking-wider transition-all cursor-pointer ${
                    active ? 'bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 glow-blue' : 'text-cyan-300/40 hover:text-cyan-300 hover:bg-slate-950/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account panel */}
        <div className="p-4 border-t border-cyan-500/10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-xs font-tech text-cyan-400 font-bold uppercase">
                {user?.username?.substring(0, 2) || 'RF'}
              </div>
              <div className="text-[11px] font-tech text-slate-300">
                <p className="font-bold">{user?.username || 'Rafi'}</p>
                <span className="text-cyan-300/40 uppercase">Trader Elite</span>
              </div>
            </div>
            <button
              onClick={logoutUser}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Terminal screen content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto relative z-10 space-y-6">
        {/* Top bar header status indicator */}
        <header className="flex justify-between items-center pb-4 border-b border-cyan-500/10">
          <h1 className="text-2xl font-bold font-tech text-slate-100 uppercase tracking-widest">
            {activeTab.replace('-', ' ')} PANEL
          </h1>

          <div className="flex items-center gap-4 text-xs font-tech">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-cyan-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Terminal
            </span>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold font-tech rounded-lg transition-all flex items-center gap-2 cursor-pointer uppercase shadow-lg shadow-cyan-500/10"
            >
              <MessageSquare className="w-4 h-4 shrink-0" /> AI Assistant
            </button>
          </div>
        </header>

        {/* Tab rendering */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'dashboard' && <TerminalDashboard />}
            {activeTab === 'scanner' && <MarketScanner />}
            {activeTab === 'strategy' && <StrategyBuilder />}
            {activeTab === 'journal' && <TradingJournal />}
            {activeTab === 'evaluation' && <AIEvaluator />}
            {activeTab === 'paper-trading' && <PaperTradingTerminal />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating AI Chat Assistant Drawer Panel */}
      {chatOpen && (
        <div className="fixed top-0 right-0 h-full w-80 sm:w-96 glassmorphism border-l border-cyan-500/25 z-50 shadow-2xl flex flex-col justify-between">
          <div className="p-5 border-b border-cyan-500/15 flex justify-between items-center bg-slate-950/80">
            <h3 className="text-md font-bold font-tech text-cyan-400 flex items-center gap-2 uppercase tracking-widest">
              <Sparkles className="w-5 h-5 animate-pulse" /> AI Trading Mentor Chat
            </h3>
            <button onClick={() => setChatOpen(false)} className="text-cyan-300/40 hover:text-cyan-300 cursor-pointer">✕</button>
          </div>

          {/* Conversation history screen */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20">
            {chatLog.map((log, i) => (
              <div key={i} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl p-3.5 text-xs ${
                  log.role === 'user' ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-200' : 'bg-slate-900/90 border border-purple-500/15 text-slate-300'
                }`}>
                  <p className="leading-relaxed whitespace-pre-line">{log.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Send Input forms */}
          <form onSubmit={handleSendChat} className="p-4 border-t border-cyan-500/15 bg-slate-950/80 flex items-center gap-3">
            <input
              type="text"
              placeholder="Tanyakan kebiasaan buruk Anda..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-slate-900 border border-cyan-500/15 rounded-lg py-2.5 px-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-tech"
            />
            <button
              type="submit"
              className="p-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-lg cursor-pointer transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MainContent() {
  const { user } = useContext(AppContext);
  return user ? <TerminalShell /> : <AuthScreen />;
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
