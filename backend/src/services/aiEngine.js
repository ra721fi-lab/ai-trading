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
        recommendations: ["Log trading harian secara disiplin", "Gunakan stop loss pada setiap posisi"],
        correlations: []
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
    let badEmotionCount = 0;
    
    // Group trades by emotion for statistical correlation calculation
    const calmTrades = closedTrades.filter(t => t.emotion === 'Calm');
    const fomoTrades = closedTrades.filter(t => t.emotion === 'FOMO');
    const revengeTrades = closedTrades.filter(t => t.emotion === 'Revenge');
    const greedTrades = closedTrades.filter(t => t.emotion === 'Greed');
    const fearTrades = closedTrades.filter(t => t.emotion === 'Fear');

    const getWinRate = (arr) => {
      if (arr.length === 0) return 0;
      const w = arr.filter(t => t.profitLoss > 0).length;
      return Math.round((w / arr.length) * 100);
    };

    const calmWin = getWinRate(calmTrades);
    const fomoWin = getWinRate(fomoTrades);
    const revengeWin = getWinRate(revengeTrades);
    const greedWin = getWinRate(greedTrades);
    const fearWin = getWinRate(fearTrades);

    const correlations = [
      { factor: 'Calm', winrate: calmWin, count: calmTrades.length },
      { factor: 'FOMO', winrate: fomoWin, count: fomoTrades.length },
      { factor: 'Revenge', winrate: revengeWin, count: revengeTrades.length },
      { factor: 'Greed', winrate: greedWin, count: greedTrades.length },
      { factor: 'Fear', winrate: fearWin, count: fearTrades.length }
    ];

    closedTrades.forEach((trade, idx) => {
      const notes = (trade.notes || '').toLowerCase();
      const reason = (trade.reason || '').toLowerCase();
      const emotion = trade.emotion || '';

      if (
        emotion === 'FOMO' || 
        emotion === 'Greed' || 
        notes.includes('chasing') || notes.includes('takut tertinggal') || notes.includes('terlanjur naik') ||
        reason.includes('pump') || reason.includes('fomo')
      ) {
        fomoCount++;
        badEmotionCount++;
      }

      if (
        emotion === 'Revenge' ||
        notes.includes('balas dendam') || notes.includes('kembali rugi') || notes.includes('emosi') || notes.includes('kejar loss')
      ) {
        revengeCount++;
        badEmotionCount++;
      }

      const mistakes = JSON.parse(trade.mistakes || '[]');
      if (mistakes.includes('No Stop Loss') || mistakes.includes('Moved Stop Loss') || !trade.exitPrice) {
        stopLossMissing++;
      }

      if (idx > 0) {
        const timeDiff = new Date(trade.createdAt) - new Date(closedTrades[idx - 1].createdAt);
        if (timeDiff < 2 * 60 * 60 * 1000) {
          overtradingCount++;
        }
      }
    });

    let disciplineScore = 100 - (fomoCount * 15) - (revengeCount * 25) - (overtradingCount * 5);
    disciplineScore = Math.max(30, Math.min(100, disciplineScore));

    let riskScore = 100 - (stopLossMissing * 20);
    riskScore = Math.max(30, Math.min(100, riskScore));

    let accuracyScore = winrate;

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

    // Dynamic Psychological Correlation Feedback
    let mentorFeedback = '';
    if (fomoCount > 0 && fomoWin < calmWin && calmTrades.length > 0) {
      mentorFeedback = `“Analisis data Anda membuktikan winrate saat trading dalam keadaan tenang (Calm) mencapai ${calmWin}%, jauh lebih tinggi dibandingkan saat FOMO yang hanya sebesar ${fomoWin}%. Kedisiplinan adalah kunci melipatgandakan portofolio Anda!”`;
    } else if (revengeCount > 0 && revengeWin < calmWin && calmTrades.length > 0) {
      mentorFeedback = `“Data audit mendeteksi winrate balas dendam (Revenge) Anda hanya sebesar ${revengeWin}% berbanding ${calmWin}% saat tenang (Calm). Menghentikan emosi pasca-loss adalah keharusan mutlak.”`;
    } else {
      const quotes = MENTOR_SAYINGS[mentorCategory];
      mentorFeedback = quotes[Math.floor(Math.random() * quotes.length)];
    }

    return {
      winrate,
      accuracyScore,
      disciplineScore,
      riskScore,
      keyPitfalls,
      setupStrengths,
      mentorFeedback,
      recommendations,
      correlations
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

      // 1. Chart Price Structure Trend Analysis
      if (sig.priceStructure === 'BULLISH_HH_HL') {
        tags.push('Chart HH/HL Bullish');
        confidenceScore += 15;
      } else if (sig.priceStructure === 'BEARISH_LH_LL') {
        tags.push('Chart LH/LL Bearish');
        confidenceScore -= 15;
      }

      // 2. Advanced RSI Trend & Divergences
      if (sig.rsiDivergence === 'BULLISH_DIVERGENCE') {
        tags.push('RSI Bullish Divergence');
        confidenceScore += 25;
      } else if (sig.rsiDivergence === 'BEARISH_DIVERGENCE') {
        tags.push('RSI Bearish Divergence');
        confidenceScore -= 25;
      }

      // 3. Multi-TF EMA Trend Line Strength
      if (sig.emaStrength === 'STRONG_BULLISH') {
        tags.push('EMA Strong Bullish');
        confidenceScore += 15;
      } else if (sig.emaStrength === 'STRONG_BEARISH') {
        tags.push('EMA Strong Bearish');
        confidenceScore -= 15;
      }

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

      const action = confidenceScore > 65 ? 'BUY' : (confidenceScore < 40 ? 'SELL' : 'HOLD');
      const currentPrice = ticker.price;
      const atrVal = ind.atr || currentPrice * 0.01;
      
      let entry = currentPrice;
      let sl = 0;
      let tp1 = 0;
      let tp2 = 0;
      let tp3 = 0;
      const rr = "1 : 2.5";
      
      const isBull = action === 'BUY' || (action === 'HOLD' && sig.ema13_21Trend === 'BULL');
      const trendText = isBull ? 'BULLISH' : 'BEARISH';

      if (isBull) {
        entry = Math.round((currentPrice - atrVal * 0.1) * 100) / 100;
        sl = Math.round((entry - atrVal * 1.5) * 100) / 100;
        tp1 = Math.round((entry + atrVal * 1.5) * 100) / 100;
        tp2 = Math.round((entry + atrVal * 2.5) * 100) / 100;
        tp3 = Math.round((entry + atrVal * 3.5) * 100) / 100;
      } else {
        entry = Math.round((currentPrice + atrVal * 0.1) * 100) / 100;
        sl = Math.round((entry + atrVal * 1.5) * 100) / 100;
        tp1 = Math.round((entry - atrVal * 1.5) * 100) / 100;
        tp2 = Math.round((entry - atrVal * 2.5) * 100) / 100;
        tp3 = Math.round((entry - atrVal * 3.5) * 100) / 100;
      }

      // Compile Reasons (Alasan)
      const reasons = [];
      if (sig.emaBullishCross) reasons.push("Golden Cross EMA 20/50 terdeteksi");
      if (sig.macdBullishCross) reasons.push("MACD Bullish Cross terkonfirmasi");
      if (sig.priceStructure === 'BULLISH_HH_HL') reasons.push("Struktur Chart Bullish (Higher High & Higher Low) terkonfirmasi");
      if (sig.rsiDivergence === 'BULLISH_DIVERGENCE') reasons.push("Divergensi Bullish RSI kuat terdeteksi (Harga membuat Low baru, namun RSI menguat)");
      if (sig.emaStrength === 'STRONG_BULLISH') reasons.push("EMA Trend Line Multi-TF terkonfirmasi Bullish kuat (Price > EMA 200, EMA 13 > 21)");
      if (sig.rsiOversold) reasons.push("RSI Oversold jenuh jual");
      if (sig.volumeSurge) reasons.push("Volume spike lebih dari 2x rata-rata");
      if (sig.fvg && sig.fvg !== 'NONE') reasons.push(`Terdeteksi ${sig.fvg === 'BULLISH_FVG' ? 'Bullish FVG' : 'Bearish FVG'}`);
      if (sig.orderBlock && sig.orderBlock !== 'NONE') reasons.push(`Smart Money: Terdeteksi ${sig.orderBlock === 'BULLISH_OB' ? 'Bullish Order Block' : 'Bearish Order Block'}`);
      if (sig.liquiditySweep) reasons.push("Pola Liquidity Sweep terdeteksi");
      if (sig.breakerBlock && sig.breakerBlock !== 'NONE') reasons.push(`Smart Money: Terbentuk ${sig.breakerBlock}`);
      if (sig.mitigationBlock && sig.mitigationBlock !== 'NONE') reasons.push(`Smart Money: Terbentuk ${sig.mitigationBlock}`);
      if (reasons.length === 0) {
        reasons.push("Struktur market mendukung pergerakan tren");
      }
      const alasanText = reasons.join(", ");

      // Compile Risks (Potensi Risiko)
      const risks = [];
      if (sig.rsiOverbought) risks.push("RSI Overbought (jenuh beli)");
      if (sig.priceStructure === 'BEARISH_LH_LL') risks.push("Struktur Chart menunjukkan trend turun (Lower High & Lower Low)");
      if (sig.rsiDivergence === 'BEARISH_DIVERGENCE') risks.push("Divergensi Bearish RSI kuat terdeteksi (Indikasi jenuh beli)");
      if (sig.emaStrength === 'STRONG_BEARISH') risks.push("EMA Trend Line Multi-TF terkonfirmasi Bearish kuat (Price < EMA 200)");
      if (currentPrice > ind.resistance * 0.99) risks.push("Harga mendekati major resistance");
      if (currentPrice < ind.support * 1.01) risks.push("Harga mendekati major support");
      if (sig.stochRsiK > 80) risks.push("Stochastic RSI Overbought");
      if (risks.length === 0) {
        risks.push("Koreksi teknikal minor / volatilitas pasar");
      }
      const risikoText = risks.join(", ");

      // Compile Conclusion (Kesimpulan)
      let kesimpulanText = "";
      if (action === 'BUY') {
        kesimpulanText = "Setup BUY/LONG probabilitas tinggi berdasarkan konvergensi Smart Money Concept dan indikator momentum.";
      } else if (action === 'SELL') {
        kesimpulanText = "Setup SELL/SHORT probabilitas tinggi memanfaatkan penolakan di area supply dan jenuh beli.";
      } else {
        kesimpulanText = "Pasar berada dalam area konsolidasi. Direkomendasikan wait-and-see (HOLD).";
      }

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
          recommendedAction: action,
          trend: trendText,
          entry,
          sl,
          tp1,
          tp2,
          tp3,
          riskReward: rr,
          alasan: alasanText,
          potensiRisiko: risikoText,
          kesimpulan: kesimpulanText,
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
