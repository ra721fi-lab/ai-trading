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
   * Run full indicator suite on candles array
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
      },
      signals: {
        emaBullishCross: isEmaCrossover,
        macdBullishCross: isMacdCrossover,
        rsiOversold: isOversold,
        rsiOverbought: isOverbought,
        volumeSurge: volumeSurge,
        ema13_21Trend: emaTrend13_21,
        stochRsiK: latestStochK,
        stochRsiD: latestStochD
      }
    };
  }
}

module.exports = new IndicatorsEngine();
