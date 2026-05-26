const indicatorsEngine = require('./indicators');
const binanceService = require('./binance');

// Personal Mentor Professional Trader Sayings & Quotes
const MENTOR_SAYINGS = {
  fomo: [
    "“Pasar selalu ada besok. Mengejar harga yang sudah naik tinggi adalah resep instan untuk rugi. Disiplin adalah menunggu setup Anda terbentuk sempurna.”",
    "“FOMO (Fear Of Missing Out) adalah musuh terbesar trader ritel. Professional trader mencari entry berisiko rendah di area support, bukan memburu candle hijau besar.”",
    "“Anda terlalu sering masuk pasar karena takut kehilangan momentum. Ingat, tidak trading juga merupakan sebuah posisi trading (aman dalam cash).”"
  ],
  revenge: [
    "“Kemarahan setelah loss adalah sinyal kuat untuk mematikan komputer. Mencoba 'balas dendam' pada pasar hanya akan melipatgandakan kerugian Anda.”",
    "“Market tidak peduli dengan kerugian Anda. Ketika Anda mengalami loss, evaluasi setup Anda secara objektif, jangan langsung masuk kembali dengan emosi.”",
    "“Revenge trading menunjukkan hilangnya kontrol diri. Skor disiplin Anda merosot karena trading emosional pasca-loss. Batasi max-loss harian Anda!”"
  ],
  overtrading: [
    "“Lebih baik 1 trade berkualitas dengan R:R 1:3 daripada 10 trade acak di tengah market sideways. Kurangi frekuensi trading Anda!”",
    "“Overtrading menghabiskan modal dan fokus mental Anda. Fokuslah hanya pada setup probabilitas tinggi saat volume pasar sedang mendukung.”",
    "“Anda terlalu aktif di saat market sedang konsolidasi/sideways. Belajarlah untuk sabar menunggu breakout terkonfirmasi.”"
  ],
  excellent: [
    "“Kerja bagus! Risk management Anda sangat disiplin minggu ini. Menjaga stop-loss tetap ketat adalah rahasia profitabilitas jangka panjang.”",
    "“Konsistensi setup Anda luar biasa. Pertahankan kesabaran ini, dan biarkan hukum probabilitas bekerja untuk portofolio Anda.”",
    "“Risk-reward ratio Anda berjalan sangat sehat. Anda membiarkan pemenang berlari (let profits run) dan memotong kerugian dengan cepat.”"
  ]
};

class AIEngine {
  /**
   * Evaluates user trade journal logs for emotional pitfalls and discipline scoring
   * @param {Array<Object>} trades - List of past closed trades
   * @returns {Object} evaluation report
   */
  evaluateJournal(trades) {
    if (!trades || trades.length === 0) {
      return {
        winrate: 0,
        accuracyScore: 70,
        disciplineScore: 80,
        riskScore: 75,
        keyPitfalls: ["Belum ada histori trading untuk dievaluasi."],
        setupStrengths: ["Siap menganalisa trading pertama Anda."],
        mentorFeedback: "“Halo trader! Saya adalah AI Mentor Anda. Silakan catat trading pertama Anda di Trading Journal, lengkap dengan alasan entry dan emosi yang Anda rasakan. Saya akan menganalisa psikologi dan performa Anda secara mendalam.”",
        recommendations: ["Log trading harian secara disiplin", "Gunakan stop loss pada setiap posisi"]
      };
    }

    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const total = closedTrades.length;
    
    if (total === 0) {
      return this.evaluateJournal([]); // fallback to empty state
    }

    const wins = closedTrades.filter(t => t.profitLoss > 0).length;
    const winrate = Math.round((wins / total) * 100);

    // Track emotional indices
    let fomoCount = 0;
    let revengeCount = 0;
    let overtradingCount = 0;
    let stopLossMissing = 0;
    let badEmotionCount = 0; // Greed, Fear, Revenge, FOMO
    
    // Scan journal notes and text for pitfalls
    closedTrades.forEach((trade, idx) => {
      const notes = (trade.notes || '').toLowerCase();
      const reason = (trade.reason || '').toLowerCase();
      const emotion = trade.emotion || '';

      // FOMO cues
      if (
        emotion === 'FOMO' || 
        emotion === 'Greed' || 
        notes.includes('chasing') || notes.includes('takut tertinggal') || notes.includes('terlanjur naik') ||
        reason.includes('pump') || reason.includes('fomo')
      ) {
        fomoCount++;
        badEmotionCount++;
      }

      // Revenge trading cues
      if (
        emotion === 'Revenge' ||
        notes.includes('balas dendam') || notes.includes('kembali rugi') || notes.includes('emosi') || notes.includes('kejar loss')
      ) {
        revengeCount++;
        badEmotionCount++;
      }

      // Verify stop loss logic
      const mistakes = JSON.parse(trade.mistakes || '[]');
      if (mistakes.includes('No Stop Loss') || mistakes.includes('Moved Stop Loss') || !trade.exitPrice) {
        stopLossMissing++;
      }

      // Check consecutive trades within close timestamps (indicator of overtrading/revenge)
      if (idx > 0) {
        const timeDiff = new Date(trade.createdAt) - new Date(closedTrades[idx - 1].createdAt);
        if (timeDiff < 2 * 60 * 60 * 1000) { // less than 2 hours apart
          overtradingCount++;
        }
      }
    });

    // Score Calculations (Base 100)
    let disciplineScore = 100 - (fomoCount * 15) - (revengeCount * 25) - (overtradingCount * 5);
    disciplineScore = Math.max(30, Math.min(100, disciplineScore));

    let riskScore = 100 - (stopLossMissing * 20);
    riskScore = Math.max(30, Math.min(100, riskScore));

    let accuracyScore = winrate; // base accuracy on trades that ended in profit

    // Pitfalls & Strengths compilation
    const keyPitfalls = [];
    const setupStrengths = [];
    const recommendations = [];
    let mentorCategory = 'excellent';

    if (fomoCount > total * 0.25) {
      keyPitfalls.push("FOMO Entry (Mengejar Candle Hijau)");
      recommendations.push("Gunakan limit order di area support daripada market order saat breakout sedang berjalan.");
      mentorCategory = 'fomo';
    }
    if (revengeCount > total * 0.15) {
      keyPitfalls.push("Revenge Trading (Trading Emosional Pasca-Loss)");
      recommendations.push("Terapkan aturan '2 Consecutive Losses = Stop Trading 24 Jam'.");
      mentorCategory = 'revenge';
    }
    if (overtradingCount > total * 0.3) {
      keyPitfalls.push("Overtrading (Terlalu Banyak Entry / Sideways)");
      recommendations.push("Batasi maksimal 3 trade aktif per hari.");
      mentorCategory = 'overtrading';
    }
    if (stopLossMissing > 0) {
      keyPitfalls.push("Disiplin Stop Loss Rendah");
      recommendations.push("Wajib pasang Stop Loss otomatis di exchange saat melakukan entry.");
    }

    if (keyPitfalls.length === 0) {
      setupStrengths.push("Manajemen Emosi Sangat Bagus");
      setupStrengths.push("Eksekusi Stop Loss Disiplin");
      recommendations.push("Pertahankan jurnal trading ini secara konsisten.");
      recommendations.push("Tingkatkan target R:R menjadi 1:3 pada setup breakout.");
    } else {
      setupStrengths.push("Pencatatan Jurnal Rinci");
      if (winrate > 50) setupStrengths.push("Akurasi Setup Teknikal Baik");
    }

    // Select wise mentor quote
    const quotes = MENTOR_SAYINGS[mentorCategory];
    const mentorFeedback = quotes[Math.floor(Math.random() * quotes.length)];

    return {
      winrate,
      accuracyScore,
      disciplineScore,
      riskScore,
      keyPitfalls,
      setupStrengths,
      mentorFeedback,
      recommendations
    };
  }

  /**
   * Scans live crypto pairs to identify specific trade opportunities
   * @param {Array<Object>} tickers - Latest 24h ticker data
   * @param {Object} pairCandlesMap - Object mapping symbols to candle arrays
   */
  scanMarkets(tickers, pairCandlesMap, scanParams) {
    const scannerResults = [];

    tickers.forEach(ticker => {
      const symbol = ticker.symbol;
      const candles = pairCandlesMap[symbol];
      if (!candles || candles.length < 50) return;

      const analysis = indicatorsEngine.analyze(candles, scanParams);
      const ind = analysis.indicators;
      const sig = analysis.signals;
      
      const tags = [];
      let confidenceScore = 50; // base score

      // Check for volume spikes
      if (sig.volumeSurge) {
        tags.push('Volume Naik');
        confidenceScore += 10;
      }

      // Check oversold (trend reversal opportunity)
      if (sig.rsiOversold) {
        tags.push('Oversold (RSI)');
        confidenceScore += 15;
      }
      
      // Check overbought
      if (sig.rsiOverbought) {
        tags.push('Overbought (RSI)');
        confidenceScore -= 10;
      }

      // Check EMA bullish crossover (breakout / momentum)
      if (sig.emaBullishCross) {
        tags.push('EMA Golden Cross');
        confidenceScore += 20;
      }

      // EMA 13 / 21 Trend Crossovers (EMA 13 > 21 = BULL, EMA 13 < 21 = BEAR)
      if (sig.ema13_21Trend === 'BULL') {
        tags.push('EMA 13/21 BULL');
        confidenceScore += 12;
      } else {
        tags.push('EMA 13/21 BEAR');
        confidenceScore -= 12;
      }

      // Stochastic RSI 5,3,3 Signals
      if (sig.stochRsiK < 20) {
        tags.push(`StochRSI Oversold (${Math.round(sig.stochRsiK)})`);
        confidenceScore += 10;
      } else if (sig.stochRsiK > 80) {
        tags.push(`StochRSI Overbought (${Math.round(sig.stochRsiK)})`);
        confidenceScore -= 10;
      }

      // Check MACD momentum crossover
      if (sig.macdBullishCross) {
        tags.push('MACD Bullish Cross');
        confidenceScore += 15;
      }

      // Breakout check (price above resistance)
      if (ticker.price > ind.resistance) {
        tags.push('Resistance Breakout');
        confidenceScore += 15;
      }

      // High Volatility Check
      if (Math.abs(ticker.changePercent) > 5) {
        tags.push('High Volatility');
        confidenceScore += 5;
      }

      // Whale movement mock (large buy volume in last candle)
      const lastCandle = candles[candles.length - 1];
      const avgCandleVolume = candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;
      if (lastCandle.volume > avgCandleVolume * 3) {
        tags.push('Whale Activity');
        confidenceScore += 15;
      }

      // Limit confidence score to standard limits
      confidenceScore = Math.max(10, Math.min(99, confidenceScore));

      // Push to result if conditions are met
      if (tags.length > 0) {
        scannerResults.push({
          symbol,
          price: ticker.price,
          changePercent: ticker.changePercent,
          volume: ticker.volume,
          indicators: ind,
          tags,
          confidenceScore,
          recommendedAction: confidenceScore > 65 ? 'BUY' : (confidenceScore < 40 ? 'SELL' : 'HOLD'),
          timestamp: Date.now()
        });
      }
    });

    // Sort by confidence score descending
    return scannerResults.sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  /**
   * Matches live pairs against a custom strategy criteria
   */
  matchCustomStrategy(tickers, pairCandlesMap, strategy) {
    const matches = [];
    const entryConditions = JSON.parse(strategy.entryConditions || '{}');

    tickers.forEach(ticker => {
      const symbol = ticker.symbol;
      const candles = pairCandlesMap[symbol];
      if (!candles || candles.length < 50) return;

      const analysis = indicatorsEngine.analyze(candles);
      const ind = analysis.indicators;
      const sig = analysis.signals;
      
      let isMatch = true;

      // Evaluate custom strategy conditions dynamically
      if (entryConditions.rsi) {
        const { operator, value } = entryConditions.rsi;
        if (operator === '<' && !(ind.rsi < value)) isMatch = false;
        if (operator === '>' && !(ind.rsi > value)) isMatch = false;
      }

      if (entryConditions.emaCross === 'bullish' && !sig.emaBullishCross) {
        isMatch = false;
      }

      if (entryConditions.macdCross === 'bullish' && !sig.macdBullishCross) {
        isMatch = false;
      }

      if (entryConditions.volumeSurge === true && !sig.volumeSurge) {
        isMatch = false;
      }

      if (isMatch) {
        matches.push({
          symbol,
          price: ticker.price,
          changePercent: ticker.changePercent,
          indicators: ind,
          confidenceScore: 70 + Math.floor(Math.random() * 20), // premium estimation
          matchedStrategy: strategy.name
        });
      }
    });

    return matches;
  }
}

module.exports = new AIEngine();
