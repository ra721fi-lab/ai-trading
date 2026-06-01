/**
 * Technical Indicators Calculation Engine
 */
class IndicatorsEngine {
  /**
   * Calculate Simple Moving Average (SMA)
   * @param {Array<number>} prices 
   * @param {number} period 
   * @returns {Array<number>}
   */
  calculateSMA(prices, period) {
    const sma = [];
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        sma.push(null);
      } else {
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += prices[i - j];
        }
        sma.push(sum / period);
      }
    }
    return sma;
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   * @param {Array<number>} prices 
   * @param {number} period 
   * @returns {Array<number>}
   */
  calculateEMA(prices, period) {
    const ema = [];
    const k = 2 / (period + 1);
    
    // First value is initialized with SMA
    let sum = 0;
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        sum += prices[i];
        ema.push(null);
      } else if (i === period - 1) {
        sum += prices[i];
        ema.push(sum / period);
      } else {
        const val = prices[i] * k + ema[i - 1] * (1 - k);
        ema.push(val);
      }
    }
    return ema;
  }

  /**
   * Calculate Relative Strength Index (RSI)
   * @param {Array<number>} prices 
   * @param {number} period - default 14
   * @returns {Array<number>}
   */
  calculateRSI(prices, period = 14) {
    const rsi = [];
    if (prices.length <= period) {
      return Array(prices.length).fill(50); // Fallback
    }

    let gains = [];
    let losses = [];
    
    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      gains.push(diff > 0 ? diff : 0);
      losses.push(diff < 0 ? -diff : 0);
    }

    // Initial average gain/loss
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Fill initial period with 50 (neutral) or null
    for (let i = 0; i < period; i++) {
      rsi.push(50);
    }

    // First calculated RSI
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));

    // Wilder's smoothing technique
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      
      rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }

    return rsi;
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   * @param {Array<number>} prices 
   * @returns {Object} { macd: Array, signal: Array, histogram: Array }
   */
  calculateMACD(prices) {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    const macdLine = [];
    for (let i = 0; i < prices.length; i++) {
      if (ema12[i] === null || ema26[i] === null) {
        macdLine.push(null);
      } else {
        macdLine.push(ema12[i] - ema26[i]);
      }
    }

    // Filter valid MACD values to calculate signal line (EMA 9 of MACD)
    const validMacd = macdLine.map(val => val === null ? 0 : val);
    const signalLine = this.calculateEMA(validMacd, 9);
    
    const histogram = [];
    for (let i = 0; i < prices.length; i++) {
      if (macdLine[i] === null || signalLine[i] === null) {
        histogram.push(null);
      } else {
        histogram.push(macdLine[i] - signalLine[i]);
      }
    }

    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram
    };
  }

  /**
   * Calculate Bollinger Bands
   * @param {Array<number>} prices 
   * @param {number} period - default 20
   * @param {number} stdDevMultiplier - default 2
   * @returns {Object} { upper: Array, middle: Array, lower: Array }
   */
  calculateBollingerBands(prices, period = 20, stdDevMultiplier = 2) {
    const middle = this.calculateSMA(prices, period);
    const upper = [];
    const lower = [];

    for (let i = 0; i < prices.length; i++) {
      if (middle[i] === null) {
        upper.push(null);
        lower.push(null);
      } else {
        // Calculate standard deviation
        let sumSqDiff = 0;
        for (let j = 0; j < period; j++) {
          const diff = prices[i - j] - middle[i];
          sumSqDiff += diff * diff;
        }
        const variance = sumSqDiff / period;
        const stdDev = Math.sqrt(variance);

        upper.push(middle[i] + stdDevMultiplier * stdDev);
        lower.push(middle[i] - stdDevMultiplier * stdDev);
      }
    }

    return { upper, middle, lower };
  }

  /**
   * Identifies Local Support and Resistance Pivots
   * @param {Array<Object>} candles - array of objects with high, low, close
   * @returns {Object} { support: Array<number>, resistance: Array<number> }
   */
  calculateSupportResistance(candles) {
    if (candles.length < 20) return { support: [], resistance: [] };
    
    const supports = [];
    const resistances = [];
    
    // Scan peaks and troughs using a 5-candle window
    for (let i = 2; i < candles.length - 2; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      
      // Resistance Pivot Peak
      if (
        high > candles[i-1].high && high > candles[i-2].high &&
        high > candles[i+1].high && high > candles[i+2].high
      ) {
        resistances.push(high);
      }
      
      // Support Pivot Trough
      if (
        low < candles[i-1].low && low < candles[i-2].low &&
        low < candles[i+1].low && low < candles[i+2].low
      ) {
        supports.push(low);
      }
    }

    // Filter and cluster to find strongest regions (keep top 3 unique values)
    const cluster = (arr) => {
      if (arr.length === 0) return [];
      const sorted = [...arr].sort((a, b) => a - b);
      const unique = [];
      let temp = sorted[0];
      
      for (let i = 1; i < sorted.length; i++) {
        // Group points within 0.5% proximity
        if ((sorted[i] - temp) / temp > 0.005) {
          unique.push(temp);
          temp = sorted[i];
        }
      }
      unique.push(temp);
      return unique.slice(-3); // return last 3
    };

    return {
      support: cluster(supports),
      resistance: cluster(resistances)
    };
  }

  /**
   * Calculate Stochastic RSI (StochRSI) with smoothing
   * @param {Array<number>} rsi - 14-period RSI array
   * @param {number} period - StochRSI length (default 5)
   * @param {number} kSmooth - %K smoothing (default 3)
   * @param {number} dSmooth - %D smoothing (default 3)
   */
  calculateStochRSI(rsi, period = 5, kSmooth = 3, dSmooth = 3) {
    const stochRsi = [];
    
    for (let i = 0; i < rsi.length; i++) {
      if (i < period - 1) {
        stochRsi.push(null);
      } else {
        const windowVals = rsi.slice(i - period + 1, i + 1);
        const minRsi = Math.min(...windowVals);
        const maxRsi = Math.max(...windowVals);
        
        const val = (maxRsi === minRsi) ? 0.5 : (rsi[i] - minRsi) / (maxRsi - minRsi);
        stochRsi.push(val);
      }
    }
    
    // Smooth %K
    const k = [];
    for (let i = 0; i < stochRsi.length; i++) {
      if (i < period + kSmooth - 2) {
        k.push(null);
      } else {
        let sum = 0;
        let validCount = 0;
        for (let j = 0; j < kSmooth; j++) {
          if (stochRsi[i - j] !== null) {
            sum += stochRsi[i - j];
            validCount++;
          }
        }
        k.push(validCount > 0 ? (sum / validCount) * 100 : null);
      }
    }
    
    // Smooth %D
    const d = [];
    for (let i = 0; i < k.length; i++) {
      if (i < period + kSmooth + dSmooth - 3) {
        d.push(null);
      } else {
        let sum = 0;
        let validCount = 0;
        for (let j = 0; j < dSmooth; j++) {
          if (k[i - j] !== null) {
            sum += k[i - j];
            validCount++;
          }
        }
        d.push(validCount > 0 ? sum / validCount : null);
      }
    }
    
    return { k, d };
  }

  /**
   * Calculate Average True Range (ATR)
   */
  calculateATR(highs, lows, closes, period = 14) {
    const atr = [];
    const trs = [highs[0] - lows[0]];
    
    for (let i = 1; i < closes.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trs.push(tr);
    }
    
    let sum = 0;
    for (let i = 0; i < trs.length; i++) {
      if (i < period - 1) {
        atr.push(null);
        sum += trs[i];
      } else if (i === period - 1) {
        sum += trs[i];
        atr.push(sum / period);
      } else {
        const val = (atr[i - 1] * (period - 1) + trs[i]) / period;
        atr.push(val);
      }
    }
    return atr;
  }

  /**
   * Calculate Volume Weighted Average Price (VWAP)
   */
  calculateVWAP(highs, lows, closes, volumes) {
    const vwap = [];
    let cumTpVol = 0;
    let cumVol = 0;
    
    for (let i = 0; i < closes.length; i++) {
      const tp = (highs[i] + lows[i] + closes[i]) / 3;
      cumTpVol += tp * volumes[i];
      cumVol += volumes[i];
      
      vwap.push(cumVol > 0 ? cumTpVol / cumVol : tp);
    }
    return vwap;
  }

  /**
   * Detect Advanced Trend directly from Chart Structure, RSI trend & divergences, and EMA trend line crossover weights
   */
  detectAdvancedTrend(candles, rsi, ema13, ema21, emaShort, emaLong, ema200) {
    const count = candles.length;
    const lastPrice = candles[count - 1].close;
    
    // 1. Chart Price Structure (HH/HL vs LH/LL)
    let priceStructure = 'SIDEWAYS';
    const recentCandles = candles.slice(-15);
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);
    
    // Find local highs and lows
    const localHigh1 = Math.max(...highs.slice(0, 7));
    const localHigh2 = Math.max(...highs.slice(7));
    const localLow1 = Math.min(...lows.slice(0, 7));
    const localLow2 = Math.min(...lows.slice(7));
    
    if (localHigh2 > localHigh1 && localLow2 > localLow1) {
      priceStructure = 'BULLISH_HH_HL'; // Higher High & Higher Low
    } else if (localHigh2 < localHigh1 && localLow2 < localLow1) {
      priceStructure = 'BEARISH_LH_LL'; // Lower High & Lower Low
    }

    // 2. RSI Trend & Divergences
    let rsiTrend = 'NEUTRAL';
    const lastRsi = rsi[count - 1];
    const prevRsi = rsi[count - 2];
    const prevRsi2 = rsi[count - 3];
    
    if (lastRsi > 50 && lastRsi > prevRsi && prevRsi > prevRsi2) {
      rsiTrend = 'STRONG_BULLISH';
    } else if (lastRsi > 50) {
      rsiTrend = 'BULLISH';
    } else if (lastRsi < 50 && lastRsi < prevRsi && prevRsi < prevRsi2) {
      rsiTrend = 'STRONG_BEARISH';
    } else if (lastRsi < 50) {
      rsiTrend = 'BEARISH';
    }

    // RSI Divergence Detection
    let rsiDivergence = 'NONE';
    const lastCandleLow = candles[count - 1].low;
    const prevCandleLow = candles[count - 5].low;
    const lastCandleHigh = candles[count - 1].high;
    const prevCandleHigh = candles[count - 5].high;

    const lastCandleRsi = rsi[count - 1];
    const prevCandleRsi = rsi[count - 5];

    if (lastCandleLow < prevCandleLow && lastCandleRsi > prevCandleRsi) {
      rsiDivergence = 'BULLISH_DIVERGENCE'; // Price lower low, RSI higher low
    } else if (lastCandleHigh > prevCandleHigh && lastCandleRsi < prevCandleRsi) {
      rsiDivergence = 'BEARISH_DIVERGENCE'; // Price higher high, RSI lower high
    }

    // 3. EMA Trend Line Crossover Strength
    let emaScore = 0; // -100 to +100
    
    const lastEma13 = ema13[count - 1];
    const lastEma21 = ema21[count - 1];
    const lastEmaShort = emaShort[count - 1]; // EMA 20
    const lastEmaLong = emaLong[count - 1];   // EMA 50
    const lastEma200 = ema200[count - 1] || lastPrice;

    // Short-term: EMA 13 > 21
    if (lastEma13 > lastEma21) emaScore += 30;
    else emaScore -= 30;

    // Medium-term: EMA 20 > 50
    if (lastEmaShort > lastEmaLong) emaScore += 30;
    else emaScore -= 30;

    // Long-term: Price > EMA 200
    if (lastPrice > lastEma200) emaScore += 40;
    else emaScore -= 40;

    let emaStrength = 'SIDEWAYS';
    if (emaScore >= 70) emaStrength = 'STRONG_BULLISH';
    else if (emaScore >= 30) emaStrength = 'BULLISH';
    else if (emaScore <= -70) emaStrength = 'STRONG_BEARISH';
    else if (emaScore <= -30) emaStrength = 'BEARISH';

    // 4. Combined AI Trend Conclusion
    let finalTrend = 'NEUTRAL';
    let trendStrengthPercent = Math.abs(emaScore);
    
    if (emaScore > 0 && lastRsi > 45) {
      finalTrend = 'BULLISH';
    } else if (emaScore < 0 && lastRsi < 55) {
      finalTrend = 'BEARISH';
    }

    return {
      priceStructure,
      rsiTrend,
      rsiDivergence,
      emaScore,
      emaStrength,
      finalTrend,
      trendStrengthPercent
    };
  }

  /**
   * Run full indicator suite on candles array with advanced indicators and SMC concepts
   */
  analyze(candles, scanParams) {
    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const volumes = candles.map(c => c.volume);
    
    const count = candles.length;
    
    const emaShortPeriod = parseInt(scanParams?.emaShort || 20);
    const emaLongPeriod = parseInt(scanParams?.emaLong || 50);
    const rsiLowerThreshold = parseInt(scanParams?.rsiOversold || 35);
    const rsiUpperThreshold = parseInt(scanParams?.rsiOverbought || 65);

    const sma20 = this.calculateSMA(closes, 20);
    const emaShort = this.calculateEMA(closes, emaShortPeriod);
    const emaLong = this.calculateEMA(closes, emaLongPeriod);
    const ema200 = this.calculateEMA(closes, 200);
    
    // EMA 13 / 21 Trend Crossovers (EMA 13 > 21 = BULL; EMA 13 < 21 = BEAR)
    const ema13 = this.calculateEMA(closes, 13);
    const ema21 = this.calculateEMA(closes, 21);
    const isEma13Above21 = ema13[count - 1] > ema21[count - 1];
    const emaTrend13_21 = isEma13Above21 ? 'BULL' : 'BEAR';

    const rsi = this.calculateRSI(closes, 14);
    
    // Stochastic RSI with setting 5, 3, 3
    const stochRsiData = this.calculateStochRSI(rsi, 5, 3, 3);

    const macdData = this.calculateMACD(closes);
    const bbData = this.calculateBollingerBands(closes, 20, 2);
    const pivotSR = this.calculateSupportResistance(candles);
    const atr = this.calculateATR(highs, lows, closes, 14);
    const vwap = this.calculateVWAP(highs, lows, closes, volumes);
    
    // Get latest state values
    const lastPrice = closes[count - 1];
    const prevPrice = closes[count - 2];
    
    // Support/Resistance closest to current price
    const currentSupport = pivotSR.support.filter(val => val < lastPrice).pop() || lastPrice * 0.95;
    const currentResistance = pivotSR.resistance.filter(val => val > lastPrice).shift() || lastPrice * 1.05;

    // Check conditions
    const isEmaCrossover = emaShort[count - 1] > emaLong[count - 1] && emaShort[count - 2] <= emaLong[count - 2];
    const isMacdCrossover = macdData.histogram[count - 1] > 0 && macdData.histogram[count - 2] <= 0;
    const isOversold = rsi[count - 1] < rsiLowerThreshold;
    const isOverbought = rsi[count - 1] > rsiUpperThreshold;
    
    // Volatility standard dev calculation
    const avgVolume = volumes.slice(-20).reduce((a,b)=>a+b,0) / 20;
    const currentVolume = volumes[count - 1];
    const volumeSurge = currentVolume > avgVolume * 2;

    const latestStochK = stochRsiData.k[count - 1] !== null ? Math.round(stochRsiData.k[count - 1] * 100) / 100 : 50.0;
    const latestStochD = stochRsiData.d[count - 1] !== null ? Math.round(stochRsiData.d[count - 1] * 100) / 100 : 50.0;

    // Detect Smart Money Concepts (SMC)
    // 1. Fair Value Gap (FVG) detection in last 3 candles
    let fvgDetected = 'NONE';
    if (highs[count - 3] < lows[count - 1]) {
      fvgDetected = 'BULLISH_FVG';
    } else if (lows[count - 3] > highs[count - 1]) {
      fvgDetected = 'BEARISH_FVG';
    }

    // 2. Order Block (OB) detection in last 5 candles
    let orderBlockDetected = 'NONE';
    const last3BodySize = Math.abs(closes[count - 1] - closes[count - 2]);
    const avgBodySize = closes.slice(-10).reduce((sum, val, idx) => sum + Math.abs(val - (closes[idx - 1] || val)), 0) / 10;
    if (last3BodySize > avgBodySize * 1.5) {
      if (closes[count - 1] > closes[count - 2]) {
        orderBlockDetected = 'BULLISH_OB';
      } else {
        orderBlockDetected = 'BEARISH_OB';
      }
    }

    // 3. Liquidity Sweep detection
    const prevLow = lows[count - 2];
    const isLiquiditySweep = lastPrice > prevLow && lows[count - 1] < prevLow;

    // 4. Breaker and Mitigation Block detection
    const smcBlocks = this.detectSMCBlocks(candles);

    // 5. Liquidation Heatmap Calculation
    const atrVal = atr[count - 1] || lastPrice * 0.01;
    const liquidationHeatmap = this.calculateLiquidationHeatmap(lastPrice, atrVal);

    // 6. Advanced Trend & Momentum analysis (Chart, RSI, EMA weightings)
    const advancedTrend = this.detectAdvancedTrend(candles, rsi, ema13, ema21, emaShort, emaLong, ema200);

    return {
      price: lastPrice,
      indicators: {
        rsi: Math.round(rsi[count - 1] * 100) / 100,
        macd: {
          line: Math.round(macdData.macd[count - 1] * 1000) / 1000,
          signal: Math.round(macdData.signal[count - 1] * 1000) / 1000,
          histogram: Math.round(macdData.histogram[count - 1] * 1000) / 1000
        },
        emaShort: Math.round(emaShort[count - 1] * 100) / 100,
        emaLong: Math.round(emaLong[count - 1] * 100) / 100,
        ema200: Math.round((ema200[count - 1] || lastPrice) * 100) / 100,
        ema13: Math.round(ema13[count - 1] * 100) / 100,
        ema21: Math.round(ema21[count - 1] * 100) / 100,
        emaTrend13_21: emaTrend13_21,
        stochRsi: {
          k: latestStochK,
          d: latestStochD
        },
        sma20: Math.round(sma20[count - 1] * 100) / 100,
        bollingerBands: {
          upper: Math.round(bbData.upper[count - 1] * 100) / 100,
          middle: Math.round(bbData.middle[count - 1] * 100) / 100,
          lower: Math.round(bbData.lower[count - 1] * 100) / 100
        },
        support: Math.round(currentSupport * 100) / 100,
        resistance: Math.round(currentResistance * 100) / 100,
        atr: Math.round(atrVal * 100) / 100,
        vwap: Math.round((vwap[count - 1] || lastPrice) * 100) / 100,
        liquidationHeatmap,
        advancedTrend
      },
      signals: {
        emaBullishCross: isEmaCrossover,
        macdBullishCross: isMacdCrossover,
        rsiOversold: isOversold,
        rsiOverbought: isOverbought,
        volumeSurge: volumeSurge,
        ema13_21Trend: emaTrend13_21,
        stochRsiK: latestStochK,
        stochRsiD: latestStochD,
        fvg: fvgDetected,
        orderBlock: orderBlockDetected,
        liquiditySweep: isLiquiditySweep,
        breakerBlock: smcBlocks.breaker,
        mitigationBlock: smcBlocks.mitigation,
        marketStructureBreak: smcBlocks.bos,
        marketStructureChange: smcBlocks.choch,
        // Advanced signals
        rsiDivergence: advancedTrend.rsiDivergence,
        priceStructure: advancedTrend.priceStructure,
        emaScore: advancedTrend.emaScore,
        emaStrength: advancedTrend.emaStrength,
        finalTrend: advancedTrend.finalTrend,
        trendStrengthPercent: advancedTrend.trendStrengthPercent
      }
    };
  }

  /**
   * Detect Swing Points, Breaker Blocks, and Mitigation Blocks
   * @param {Array<Object>} candles 
   * @returns {Object} { breaker: string, mitigation: string, bos: boolean, choch: boolean }
   */
  detectSMCBlocks(candles) {
    if (candles.length < 20) {
      return { breaker: 'NONE', mitigation: 'NONE', bos: false, choch: false };
    }
    const count = candles.length;
    const lastCandle = candles[count - 1];
    const prevCandle = candles[count - 2];
    
    // Identify swing points with a 5-candle window
    const swingHighs = [];
    const swingLows = [];
    
    for (let i = 2; i < count - 2; i++) {
      if (candles[i].high > candles[i-1].high && candles[i].high > candles[i-2].high &&
          candles[i].high > candles[i+1].high && candles[i].high > candles[i+2].high) {
        swingHighs.push({ index: i, price: candles[i].high, time: candles[i].time });
      }
      if (candles[i].low < candles[i-1].low && candles[i].low < candles[i-2].low &&
          candles[i].low < candles[i+1].low && candles[i].low < candles[i+2].low) {
        swingLows.push({ index: i, price: candles[i].low, time: candles[i].time });
      }
    }
    
    let breaker = 'NONE';
    let mitigation = 'NONE';
    let bos = false;
    let choch = false;
    
    if (swingHighs.length > 0 && swingLows.length > 0) {
      const recentSwingHigh = swingHighs[swingHighs.length - 1];
      const recentSwingLow = swingLows[swingLows.length - 1];
      
      // BOS and CHoCH structure shift detection
      if (lastCandle.close > recentSwingHigh.price && prevCandle.close <= recentSwingHigh.price) {
        bos = true;
        choch = true;
        
        // Bullish structures: Sweep check
        const priorLows = swingLows.filter(l => l.index < recentSwingHigh.index);
        if (priorLows.length > 1) {
          const secondRecentLow = priorLows[priorLows.length - 1];
          const thirdRecentLow = priorLows[priorLows.length - 2];
          if (secondRecentLow.price < thirdRecentLow.price) {
            breaker = 'BULLISH_BREAKER';
          } else {
            mitigation = 'BULLISH_MITIGATION';
          }
        } else {
          breaker = 'BULLISH_BREAKER';
        }
      } else if (lastCandle.close < recentSwingLow.price && prevCandle.close >= recentSwingLow.price) {
        bos = true;
        choch = true;
        
        // Bearish structures
        const priorHighs = swingHighs.filter(h => h.index < recentSwingLow.index);
        if (priorHighs.length > 1) {
          const secondRecentHigh = priorHighs[priorHighs.length - 1];
          const thirdRecentHigh = priorHighs[priorHighs.length - 2];
          if (secondRecentHigh.price > thirdRecentHigh.price) {
            breaker = 'BEARISH_BREAKER';
          } else {
            mitigation = 'BEARISH_MITIGATION';
          }
        } else {
          breaker = 'BEARISH_BREAKER';
        }
      }
    }
    
    return { breaker, mitigation, bos, choch };
  }

  /**
   * Calculate simulated liquidation clusters mapping
   * @param {number} lastPrice 
   * @param {number} atrVal 
   * @returns {Array<Object>}
   */
  calculateLiquidationHeatmap(lastPrice, atrVal) {
    const leverageLevels = [
      { leverage: 100, pct: 0.01, type: 'LONG_100X' },
      { leverage: 50, pct: 0.02, type: 'LONG_50X' },
      { leverage: 25, pct: 0.04, type: 'LONG_25X' },
      { leverage: 10, pct: 0.10, type: 'LONG_10X' },
      { leverage: 100, pct: 0.01, type: 'SHORT_100X' },
      { leverage: 50, pct: 0.02, type: 'SHORT_50X' },
      { leverage: 25, pct: 0.04, type: 'SHORT_25X' },
      { leverage: 10, pct: 0.10, type: 'SHORT_10X' }
    ];
    
    return leverageLevels.map(lvl => {
      const isLong = lvl.type.startsWith('LONG');
      const offset = lastPrice * lvl.pct;
      // Dynamic noise
      const noise = (Math.sin(lastPrice * lvl.leverage) * 0.03) * atrVal;
      const liqPrice = isLong ? lastPrice - offset + noise : lastPrice + offset - noise;
      const volumeIntensity = Math.round(400000 + (100 - lvl.leverage) * 12000 + Math.random() * 250000);
      
      return {
        price: Math.round(liqPrice * 100) / 100,
        volume: volumeIntensity,
        leverage: `${lvl.leverage}x`,
        type: isLong ? 'LONG' : 'SHORT'
      };
    });
  }
}

module.exports = new IndicatorsEngine();
