const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Production PostgreSQL (e.g. Supabase, Neon)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Crucial for connection authorization on free Supabase/Neon
      }
    },
    define: {
      timestamps: true
    }
  });
} else {
  // Local SQLite
  const dbPath = process.env.DATABASE_PATH || './trading_tools.sqlite';
  const dbDir = path.dirname(path.resolve(dbPath));

  // Ensure database directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
    define: {
      timestamps: true
    }
  });
}

module.exports = sequelize;
