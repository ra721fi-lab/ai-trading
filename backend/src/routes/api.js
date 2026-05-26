const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, Trade, Strategy, AIAnalysis, Setting, DailyMission } = require('../models/Schemas');
const binanceService = require('../services/binance');
const aiEngine = require('../services/aiEngine');
const notifierService = require('../services/notifier');

const JWT_SECRET = process.env.JWT_SECRET || 'super-cyberpunk-neon-secret-key-rafi-2026';

// Middleware to protect API routes
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token tidak valid.' });
  }
};

// ==========================================
// 1. AI MARKET SCANNER
// ==========================================
router.get('/scanner', authenticateToken, async (req, res) => {
  try {
    const tickers = await binanceService.getMarketTickers();
    
    // Parse dynamic user scanner configurations from query parameters
    const { rsiOversold, rsiOverbought, emaShort, emaLong } = req.query;
    const scanParams = {
      rsiOversold: rsiOversold ? parseInt(rsiOversold) : 35,
      rsiOverbought: rsiOverbought ? parseInt(rsiOverbought) : 65,
      emaShort: emaShort ? parseInt(emaShort) : 20,
      emaLong: emaLong ? parseInt(emaLong) : 50
    };

    // Fetch historical candles in parallel for calculating indicators
    const pairCandlesMap = {};
    await Promise.all(
      tickers.map(async (ticker) => {
        const candles = await binanceService.getKlines(ticker.symbol, '15m', 80);
        pairCandlesMap[ticker.symbol] = candles;
      })
    );

    const scannerResults = aiEngine.scanMarkets(tickers, pairCandlesMap, scanParams);

    // Get User Settings to dispatch real notifications if needed
    const settings = await Setting.findOne({ where: { UserId: req.userId } });
    if (settings) {
      // Trigger notification for high confidence (> 80%) setups (limit to top 1 to prevent spam)
      const topSignal = scannerResults.find(sig => sig.confidenceScore >= 80);
      if (topSignal) {
        if (settings.telegramToken && settings.telegramChatId) {
          await notifierService.sendTelegramAlert(settings.telegramToken, settings.telegramChatId, topSignal);
        }
        if (settings.discordWebhook) {
          await notifierService.sendDiscordAlert(settings.discordWebhook, topSignal);
        }
      }
    }

    res.status(200).json({ results: scannerResults });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. STRATEGIES CRUD
// ==========================================
router.get('/strategies', authenticateToken, async (req, res) => {
  try {
    const list = await Strategy.findAll({ where: { UserId: req.userId } });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/strategies', authenticateToken, async (req, res) => {
  try {
    const { name, timeframe, entryConditions, exitConditions, stopLoss, takeProfit, riskReward, maxLoss } = req.body;
    const item = await Strategy.create({
      name,
      timeframe,
      entryConditions: typeof entryConditions === 'string' ? entryConditions : JSON.stringify(entryConditions),
      exitConditions: typeof exitConditions === 'string' ? exitConditions : JSON.stringify(exitConditions),
      stopLoss,
      takeProfit,
      riskReward,
      maxLoss,
      UserId: req.userId
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/strategies/:id', authenticateToken, async (req, res) => {
  try {
    await Strategy.destroy({ where: { id: req.params.id, UserId: req.userId } });
    res.status(200).json({ message: 'Strategi berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Match Strategy Live Tickers
router.get('/strategies/match/:id', authenticateToken, async (req, res) => {
  try {
    const strategy = await Strategy.findOne({ where: { id: req.params.id, UserId: req.userId } });
    if (!strategy) return res.status(404).json({ error: 'Strategi tidak ditemukan.' });

    const tickers = await binanceService.getMarketTickers();
    const pairCandlesMap = {};
    await Promise.all(
      tickers.map(async (ticker) => {
        const candles = await binanceService.getKlines(ticker.symbol, strategy.timeframe, 60);
        pairCandlesMap[ticker.symbol] = candles;
      })
    );

    const matchedPairs = aiEngine.matchCustomStrategy(tickers, pairCandlesMap, strategy);
    res.status(200).json({ matches: matchedPairs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. TRADING JOURNAL & PAPER TRADING
// ==========================================
router.get('/trades', authenticateToken, async (req, res) => {
  try {
    const trades = await Trade.findAll({
      where: { UserId: req.userId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place Paper Trade / Create Manual Log
router.post('/trades', authenticateToken, async (req, res) => {
  try {
    const { pair, type, entryPrice, amount, reason, emotion, notes, isPaperTrading } = req.body;

    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });

    // If virtual paper trade, check balance
    if (isPaperTrading) {
      const requiredBalance = entryPrice * amount;
      if (type === 'BUY' && user.balance < requiredBalance) {
        return res.status(400).json({ error: 'Virtual balance tidak mencukupi untuk melakukan paper trade.' });
      }
      
      if (type === 'BUY') {
        user.balance -= requiredBalance;
        await user.save();
      }
    }

    const trade = await Trade.create({
      pair,
      type,
      entryPrice,
      amount,
      reason,
      emotion: emotion || 'Calm',
      notes,
      status: 'OPEN',
      UserId: req.userId
    });

    res.status(201).json({ trade, newBalance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Close Active Trade
router.put('/trades/close/:id', authenticateToken, async (req, res) => {
  try {
    const { exitPrice, exitReason, emotion, mistakes, notes } = req.body;
    
    const trade = await Trade.findOne({ where: { id: req.params.id, UserId: req.userId } });
    if (!trade) return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });

    if (trade.status === 'CLOSED') {
      return res.status(400).json({ error: 'Transaksi sudah berstatus CLOSED.' });
    }

    // Calculate PnL
    let profitLoss = 0.0;
    if (trade.type === 'BUY') {
      profitLoss = (exitPrice - trade.entryPrice) * trade.amount;
    } else {
      // SHORT Sell exit
      profitLoss = (trade.entryPrice - exitPrice) * trade.amount;
    }

    trade.exitPrice = exitPrice;
    trade.exitReason = exitReason;
    trade.emotion = emotion || trade.emotion;
    trade.mistakes = typeof mistakes === 'string' ? mistakes : JSON.stringify(mistakes || []);
    trade.notes = notes || trade.notes;
    trade.profitLoss = profitLoss;
    trade.status = 'CLOSED';
    await trade.save();

    // If Paper Trade, return cash to user balance
    const user = await User.findByPk(req.userId);
    if (user) {
      if (trade.type === 'BUY') {
        // Return cost value + profit/loss
        const costValue = trade.entryPrice * trade.amount;
        user.balance += (costValue + profitLoss);
      } else {
        // Short Sell settles: return profit/loss to balance
        user.balance += profitLoss;
      }
      await user.save();
    }

    res.status(200).json({ trade, newBalance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Trade Entry
router.delete('/trades/:id', authenticateToken, async (req, res) => {
  try {
    await Trade.destroy({ where: { id: req.params.id, UserId: req.userId } });
    res.status(200).json({ message: 'Log trading berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. AI EVALUATION
// ==========================================
router.get('/evaluate', authenticateToken, async (req, res) => {
  try {
    const trades = await Trade.findAll({ where: { UserId: req.userId } });
    
    // Core AI evaluations evaluation engine logic run
    const evaluation = aiEngine.evaluateJournal(trades);

    // Save evaluation stats to database
    await AIAnalysis.create({
      winrate: evaluation.winrate,
      accuracyScore: evaluation.accuracyScore,
      disciplineScore: evaluation.disciplineScore,
      riskScore: evaluation.riskScore,
      keyPitfalls: JSON.stringify(evaluation.keyPitfalls),
      setupStrengths: JSON.stringify(evaluation.setupStrengths),
      mentorFeedback: evaluation.mentorFeedback,
      recommendations: JSON.stringify(evaluation.recommendations),
      UserId: req.userId
    });

    res.status(200).json(evaluation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch past analyses
router.get('/evaluate/history', authenticateToken, async (req, res) => {
  try {
    const history = await AIAnalysis.findAll({
      where: { UserId: req.userId },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.status(200).json(history.map(item => ({
      ...item.toJSON(),
      keyPitfalls: JSON.parse(item.keyPitfalls || '[]'),
      setupStrengths: JSON.parse(item.setupStrengths || '[]'),
      recommendations: JSON.parse(item.recommendations || '[]')
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. BACKTESTING SIMULATOR
// ==========================================
router.post('/backtest', authenticateToken, async (req, res) => {
  try {
    const { symbol, timeframe, rsiLower, rsiUpper, emaPeriodShort, emaPeriodLong } = req.body;

    const candles = await binanceService.getKlines(symbol, timeframe, 150);
    if (!candles || candles.length < 50) {
      return res.status(400).json({ error: 'Gagal memuat korelasi candlesticks untuk backtesting.' });
    }

    // Run custom rule-based backtesting simulator
    const closes = candles.map(c => c.close);
    const emaShortArr = aiEngine.scanMarkets ? 
      indicatorsEngine = require('../services/indicators').calculateEMA(closes, parseInt(emaPeriodShort || 20)) : [];
    const emaLongArr = require('../services/indicators').calculateEMA(closes, parseInt(emaPeriodLong || 50));
    const rsiArr = require('../services/indicators').calculateRSI(closes, 14);

    let balance = 10000.0;
    let activePosition = null;
    const trades = [];

    // Simulate candles chronological flow
    for (let i = 50; i < candles.length; i++) {
      const candle = candles[i];
      const rsi = rsiArr[i];
      const emaShort = emaShortArr[i];
      const emaLong = emaLongArr[i];
      const prevEmaShort = emaShortArr[i - 1];
      const prevEmaLong = emaLongArr[i - 1];

      // Entry Check: Golden Cross & RSI oversold triggers buy
      const isGoldenCross = emaShort > emaLong && prevEmaShort <= prevEmaLong;
      const isRsiOversold = rsi < parseInt(rsiLower || 30);

      if (!activePosition) {
        if (isGoldenCross || isRsiOversold) {
          activePosition = {
            entryPrice: candle.close,
            time: candle.time,
            amount: balance / candle.close
          };
        }
      } else {
        // Exit Check: Death Cross or RSI overbought triggers sell
        const isDeathCross = emaShort < emaLong && prevEmaShort >= prevEmaLong;
        const isRsiOverbought = rsi > parseInt(rsiUpper || 70);

        if (isDeathCross || isRsiOverbought) {
          const exitPrice = candle.close;
          const pnl = (exitPrice - activePosition.entryPrice) * activePosition.amount;
          balance += pnl;

          trades.push({
            entryPrice: activePosition.entryPrice,
            exitPrice,
            profitLoss: pnl,
            profitPercent: (pnl / (activePosition.entryPrice * activePosition.amount)) * 100,
            entryTime: activePosition.time,
            exitTime: candle.time
          });

          activePosition = null;
        }
      }
    }

    // Force close active position at current price
    if (activePosition) {
      const exitPrice = candles[candles.length - 1].close;
      const pnl = (exitPrice - activePosition.entryPrice) * activePosition.amount;
      balance += pnl;
      trades.push({
        entryPrice: activePosition.entryPrice,
        exitPrice,
        profitLoss: pnl,
        profitPercent: (pnl / (activePosition.entryPrice * activePosition.amount)) * 100,
        entryTime: activePosition.time,
        exitTime: candles[candles.length - 1].time
      });
    }

    const wins = trades.filter(t => t.profitLoss > 0).length;
    const netProfit = balance - 10000.0;
    const winrate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;

    res.status(200).json({
      symbol,
      timeframe,
      initialBalance: 10000.0,
      finalBalance: balance,
      netProfit,
      winrate,
      totalTrades: trades.length,
      trades
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. AI PERSONAL ASSISTANT & CHAT
// ==========================================
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Load trader profile to make chat replies dynamic and deeply personal
    const trades = await Trade.findAll({ where: { UserId: req.userId } });
    const stats = aiEngine.evaluateJournal(trades);

    let chatResponse = "";

    const userMsg = message.toLowerCase();

    // Check user queries to generate customized responses
    if (userMsg.includes('strategi') || userMsg.includes('rekomendasi')) {
      chatResponse = `Berdasarkan histori trading Anda, Anda memiliki winrate sebesar **${stats.winrate}%** dengan tingkat disiplin **${stats.disciplineScore}/100**. Rekomendasi utama saya: \n\n` +
        `1. ${stats.recommendations[0] || 'Pertahankan ketelitian sebelum entry.'}\n` +
        `2. ${stats.recommendations[1] || 'Jaga R:R minimum 1:2.'}\n\n` +
        `Fokuslah pada pasangan koin yang saat ini memiliki volume tinggi seperti **BTCUSDT** atau **SOLUSDT** menggunakan strategi breakout terkonfirmasi EMA Crossover.`;
    } else if (userMsg.includes('kesalahan') || userMsg.includes('pitfall') || userMsg.includes('emosi')) {
      if (stats.keyPitfalls.length > 0) {
        chatResponse = `Saya mendeteksi kelemahan psikologis dalam jurnal Anda: **${stats.keyPitfalls.join(', ')}**.\n\n` +
          `Saran personal saya: \n${stats.mentorFeedback}\n\n` +
          `Jadikan evaluasi ini pedoman utama Anda. Jangan melakukan trading jika emosi Anda tidak seimbang.`;
      } else {
        chatResponse = `Luar biasa! Saya tidak menemukan kebiasaan buruk yang dominan pada data trading Anda belakangan ini. Nilai disiplin Anda mencapai **${stats.disciplineScore}/100**. Pertahankan psikologi sehat ini.`;
      }
    } else if (userMsg.includes('prediksi') || userMsg.includes('koin potensial') || userMsg.includes('sinyal')) {
      chatResponse = `Pemindai AI Scanners saya mendeteksi potensi tinggi pada beberapa koin saat ini. Masuk ke menu **Scanner** untuk melihat sinyal BUY/SELL real-time lengkap dengan tingkat akurasi (Confidence Score) masing-masing koin!`;
    } else {
      chatResponse = `Halo! Saya adalah AI Trading Mentor Anda. Berdasarkan audit portofolio Anda, tingkat akurasi setup Anda berada pada skor **${stats.accuracyScore}%** dengan disiplin manajemen risiko **${stats.riskScore}%**.\n\n` +
        `Ada yang ingin Anda tanyakan seputar strategi, kesalahan psikologis trading Anda, atau sinyal koin potensial hari ini?`;
    }

    res.status(200).json({ response: chatResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. DAILY TRADING MISSIONS
// ==========================================
router.get('/missions', authenticateToken, async (req, res) => {
  try {
    let missions = await DailyMission.findAll({ where: { UserId: req.userId, date: new Date().toISOString().split('T')[0] } });
    
    // Create new daily missions if none exist for today
    if (missions.length === 0) {
      const defaultMissions = [
        { title: "Manajemen Risiko Disiplin", description: "Pasang Stop Loss pada setiap transaksi yang Anda lakukan hari ini.", rewardPts: 100 },
        { title: "Log Jurnal Detail", description: "Catat minimal 1 transaksi lengkap dengan alasan entry dan emosi saat eksekusi.", rewardPts: 150 },
        { title: "Detoks Overtrading", description: "Jangan melakukan lebih dari 3 kali entry di pasar hari ini.", rewardPts: 200 }
      ];

      const created = [];
      for (let item of defaultMissions) {
        const m = await DailyMission.create({
          ...item,
          UserId: req.userId,
          date: new Date().toISOString().split('T')[0]
        });
        created.push(m);
      }
      missions = created;
    }
    
    res.status(200).json(missions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/missions/complete/:id', authenticateToken, async (req, res) => {
  try {
    const mission = await DailyMission.findOne({ where: { id: req.params.id, UserId: req.userId } });
    if (!mission) return res.status(404).json({ error: 'Misi tidak ditemukan.' });

    mission.completed = true;
    await mission.save();

    res.status(200).json({ message: 'Misi berhasil diselesaikan!', mission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. SETTINGS API
// ==========================================
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    let setting = await Setting.findOne({ where: { UserId: req.userId } });
    if (!setting) {
      setting = await Setting.create({ UserId: req.userId });
    }
    res.status(200).json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { telegramToken, telegramChatId, discordWebhook, emailAlerts, pushNotifications } = req.body;
    let setting = await Setting.findOne({ where: { UserId: req.userId } });
    
    if (!setting) {
      setting = await Setting.create({ UserId: req.userId });
    }

    setting.telegramToken = telegramToken;
    setting.telegramChatId = telegramChatId;
    setting.discordWebhook = discordWebhook;
    setting.emailAlerts = emailAlerts !== undefined ? emailAlerts : setting.emailAlerts;
    setting.pushNotifications = pushNotifications !== undefined ? pushNotifications : setting.pushNotifications;
    
    await setting.save();
    res.status(200).json({ message: 'Pengaturan berhasil disimpan!', settings: setting });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
