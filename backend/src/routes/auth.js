const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Setting } = require('../models/Schemas');

const JWT_SECRET = process.env.JWT_SECRET || 'super-cyberpunk-neon-secret-key-rafi-2026';

// Register User
router.post('/register', async (expressReq, expressRes) => {
  try {
    const { username, email, password } = expressReq.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return expressRes.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return expressRes.status(400).json({ error: 'Username sudah digunakan.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    // Create Default Settings
    await Setting.create({
      UserId: user.id
    });

    // Generate Token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    expressRes.status(201).json({
      message: 'Registrasi berhasil!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (err) {
    expressRes.status(500).json({ error: err.message });
  }
});

// Login User
router.post('/login', async (expressReq, expressRes) => {
  try {
    const { email, password } = expressReq.body;

    // Check User
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return expressRes.status(400).json({ error: 'Email atau password salah.' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return expressRes.status(400).json({ error: 'Email atau password salah.' });
    }

    // Generate Token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    expressRes.status(200).json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (err) {
    expressRes.status(500).json({ error: err.message });
  }
});

// Verify Token / Get Profile
router.get('/profile', async (expressReq, expressRes) => {
  try {
    const authHeader = expressReq.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return expressRes.status(401).json({ error: 'Token tidak valid atau tidak ditemukan.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return expressRes.status(404).json({ error: 'User tidak ditemukan.' });
    }

    expressRes.status(200).json({ user });
  } catch (err) {
    expressRes.status(401).json({ error: 'Sesi habis, silakan login kembali.' });
  }
});

// Reset Virtual Balance for Paper Trading
router.post('/reset-balance', async (expressReq, expressRes) => {
  try {
    const authHeader = expressReq.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return expressRes.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return expressRes.status(404).json({ error: 'User tidak ditemukan' });
    }

    user.balance = 10000.0;
    await user.save();

    expressRes.status(200).json({ message: 'Balance berhasil di-reset!', balance: user.balance });
  } catch (err) {
    expressRes.status(500).json({ error: err.message });
  }
});

module.exports = router;
