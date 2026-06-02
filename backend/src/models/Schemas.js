const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  balance: {
    type: DataTypes.FLOAT,
    defaultValue: 10000.0 // Default Paper Trading Balance ($10,000 USD)
  }
});

// Trade Model (acts as Trading History and detailed Journal)
const Trade = sequelize.define('Trade', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  pair: {
    type: DataTypes.STRING,
    allowNull: false // e.g. BTCUSDT, ETHUSDT
  },
  type: {
    type: DataTypes.ENUM('BUY', 'SELL'),
    allowNull: false
  },
  entryPrice: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  exitPrice: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  leverage: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  profitLoss: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'CLOSED'),
    defaultValue: 'OPEN'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true // "RSI oversold & EMA golden cross"
  },
  emotion: {
    type: DataTypes.STRING,
    defaultValue: 'Calm' // Calm, Fear, Greed, Revenge, FOMO, Excitement
  },
  mistakes: {
    type: DataTypes.TEXT, // Saved as JSON string (array of mistakes: e.g., ["FOMO Entry", "Moved Stop Loss"])
    defaultValue: '[]'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  exitReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  chartScreenshot: {
    type: DataTypes.TEXT, // Base64 or mock URL
    allowNull: true
  },
  timeframe: {
    type: DataTypes.STRING,
    defaultValue: '15m'
  }
});

// Strategy Model
const Strategy = sequelize.define('Strategy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timeframe: {
    type: DataTypes.STRING,
    defaultValue: '15m'
  },
  entryConditions: {
    type: DataTypes.TEXT, // Saved as JSON string e.g. { rsi: { operator: '<', value: 30 }, macd: 'bullish_cross' }
    allowNull: false
  },
  exitConditions: {
    type: DataTypes.TEXT, // Saved as JSON string e.g. { rsi: { operator: '>', value: 70 } }
    allowNull: true
  },
  stopLoss: {
    type: DataTypes.FLOAT, // Percentage e.g. 2%
    allowNull: true
  },
  takeProfit: {
    type: DataTypes.FLOAT, // Percentage e.g. 6%
    allowNull: true
  },
  riskReward: {
    type: DataTypes.STRING,
    defaultValue: '1:3'
  },
  maxLoss: {
    type: DataTypes.FLOAT, // USD value
    allowNull: true
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// AI Analysis Model (for evaluations & personal trader advisor)
const AIAnalysis = sequelize.define('AIAnalysis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  winrate: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  accuracyScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0 // 0 - 100
  },
  disciplineScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0 // 0 - 100 based on strategy adherence
  },
  riskScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0 // 0 - 100 based on stop loss presence/execution
  },
  keyPitfalls: {
    type: DataTypes.TEXT, // JSON array of pitfall strings e.g. ["Overtrading", "FOMO"]
    defaultValue: '[]'
  },
  setupStrengths: {
    type: DataTypes.TEXT, // JSON array of strengths e.g. ["EMA Crossover breakout matches well"]
    defaultValue: '[]'
  },
  mentorFeedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recommendations: {
    type: DataTypes.TEXT, // JSON array of steps e.g. ["Wait for candle close before entry", "Maintain a 1:2 R:R"]
    defaultValue: '[]'
  }
});

// Settings Model
const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  telegramToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  telegramChatId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  discordWebhook: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailAlerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pushNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Daily Mission Model (gamification)
const DailyMission = sequelize.define('DailyMission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rewardPts: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
});

// Set up relationships
User.hasMany(Trade, { onDelete: 'CASCADE' });
Trade.belongsTo(User);

User.hasMany(Strategy, { onDelete: 'CASCADE' });
Strategy.belongsTo(User);

User.hasMany(AIAnalysis, { onDelete: 'CASCADE' });
AIAnalysis.belongsTo(User);

User.hasOne(Setting, { onDelete: 'CASCADE' });
Setting.belongsTo(User);

User.hasMany(DailyMission, { onDelete: 'CASCADE' });
DailyMission.belongsTo(User);

module.exports = {
  User,
  Trade,
  Strategy,
  AIAnalysis,
  Setting,
  DailyMission,
  sequelize
};
