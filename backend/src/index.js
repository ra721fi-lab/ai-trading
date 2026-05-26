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
    });
  } catch (err) {
    console.error('❌ Failed to start AI Trading backend server:', err.message);
    process.exit(1);
  }
};

startServer();
