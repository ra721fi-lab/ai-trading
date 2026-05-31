const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const { sequelize } = require('./models/Schemas');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const binanceService = require('./services/binance');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware Pipeline
app.use(helmet());
app.use(cors({ origin: '*' })); // Enable global cross-origin sharing for developers
app.use(express.json());

// API Rate Limiting to prevent brute forces
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: { error: 'Terlalu banyak request dari IP Anda. Silakan coba lagi nanti.' }
});
app.use('/api/', apiLimiter);

// Bind Route Controllers
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Root path test route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Futuristic AI Trading Tools Backend by Rafi',
    status: 'ONLINE',
    time: new Date()
  });
});

// Setup HTTP Server
const server = http.createServer(app);

// Setup WebSocket Server for Live Real-Time terminal broadcasts
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  // console.log('Client connected to AI Trading Real-time Websocket Engine');
  
  // Immediately send initial message
  ws.send(JSON.stringify({ type: 'STATUS', message: 'WebSocket Connected to Rafi AI Engine' }));

  // Periodically stream live prices and scanner signals
  const interval = setInterval(async () => {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        const tickers = await binanceService.getMarketTickers();
        
        // Mock some live whale alerts or breakouts for the UX
        const activeAlerts = tickers
          .filter(t => Math.abs(t.changePercent) > 2)
          .map(t => ({
            symbol: t.symbol,
            type: t.changePercent > 0 ? 'BREAKOUT_UP' : 'BREAKOUT_DOWN',
            price: t.price,
            change: t.changePercent,
            volume: t.volume,
            timestamp: Date.now()
          }));

        ws.send(JSON.stringify({
          type: 'MARKET_DATA',
          tickers,
          alerts: activeAlerts.slice(0, 3)
        }));
      }
    } catch (err) {
      console.error('WS stream error:', err.message);
    }
  }, 3000); // Send updates every 3 seconds!

  ws.on('close', () => {
    clearInterval(interval);
    // console.log('Client disconnected from WebSocket');
  });
});

// Sync Database and Launch Server
const startServer = async () => {
  try {
    // Sync SQLite schemas (alter: true handles automatic columns update without wiping data)
    await sequelize.sync({ alter: true });
    console.log('✔ SQLite Database synced successfully.');

    server.listen(PORT, () => {
      console.log(`🚀 Server fully operational on port ${PORT}`);
      console.log(`🔌 WebSocket server active on ws://localhost:${PORT}`);
      
      // Launch 24/7 Autonomous Background Scanner Daemon
      startBackgroundScanner();
    });
  } catch (err) {
    console.error('❌ Failed to start AI Trading backend server:', err.message);
    process.exit(1);
  }
};

/**
 * Autonomous 24/7 Background Scanner Daemon
 * Periodically scans the market and dispatches high-confidence signals to users via Telegram/Discord
 */
const startBackgroundScanner = () => {
  console.log('🚀 Autonomous 24/7 AI Market Scanner Daemon initialized.');
  
  // Track last sent signal timestamps per user/symbol to prevent duplicate spamming
  const lastAlertsCache = new Map();

  setInterval(async () => {
    try {
      const { Setting } = require('./models/Schemas');
      const settingsList = await Setting.findAll();
      
      // Find all users who have active Telegram or Discord integrations
      const activeSettings = settingsList.filter(s => 
        (s.telegramToken && s.telegramChatId) || s.discordWebhook
      );

      if (activeSettings.length === 0) return;

      const tickers = await binanceService.getMarketTickers();
      const pairCandlesMap = {};
      
      // Fetch 15m candles in parallel for scanning
      await Promise.all(
        tickers.map(async (ticker) => {
          try {
            const candles = await binanceService.getKlines(ticker.symbol, '15m', 80);
            pairCandlesMap[ticker.symbol] = candles;
          } catch (e) {}
        })
      );

      const aiEngine = require('./services/aiEngine');
      const notifierService = require('./services/notifier');

      for (const settings of activeSettings) {
        // Run scanner with default standard scanner parameters
        const scanParams = {
          rsiOversold: 35,
          rsiOverbought: 65,
          emaShort: 20,
          emaLong: 50
        };

        const scannerResults = aiEngine.scanMarkets(tickers, pairCandlesMap, scanParams);
        
        // Find high confidence signals (>= 80%)
        const highConfSignals = scannerResults.filter(sig => sig.confidenceScore >= 80);
        
        for (const signal of highConfSignals) {
          const cacheKey = `${settings.UserId}_${signal.symbol}_${signal.recommendedAction}`;
          const lastSentTime = lastAlertsCache.get(cacheKey) || 0;
          const now = Date.now();

          // Only send the same alert once every 2 hours to avoid chat spam
          if (now - lastSentTime > 2 * 60 * 60 * 1000) {
            if (settings.telegramToken && settings.telegramChatId) {
              await notifierService.sendTelegramAlert(settings.telegramToken, settings.telegramChatId, signal);
            }
            if (settings.discordWebhook) {
              await notifierService.sendDiscordAlert(settings.discordWebhook, signal);
            }
            lastAlertsCache.set(cacheKey, now);
            console.log(`[AUTONOMOUS ALERT] Dispatched signal for ${signal.symbol} to User ${settings.UserId}`);
          }
        }
      }
    } catch (err) {
      console.error('Autonomous Background Scanner Error:', err.message);
    }
  }, 2 * 60 * 1000); // Check every 2 minutes for maximum reactivity!
};

startServer();
