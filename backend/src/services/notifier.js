const nativeFetch = typeof globalThis.fetch !== 'undefined' ? globalThis.fetch : null;
const fetchFn = (...args) => {
  if (nativeFetch) return nativeFetch(...args);
  return import('node-fetch').then(({default: f}) => f(...args)).catch(() => {});
};

class NotifierService {
  /**
   * Dispatches trading setup alert to Telegram
   * @param {string} token - Telegram Bot Token
   * @param {string} chatId - Telegram Chat ID
   * @param {Object} signal - Signal details
   */
  async sendTelegramAlert(token, chatId, signal) {
    if (!token || !chatId) {
      // console.log(`[Telegram Mock Alert]: Live setup found! Pair: ${signal.symbol}, Action: ${signal.recommendedAction}, Conf: ${signal.confidenceScore}%`);
      return { success: true, mode: 'mock' };
    }

    const message = `⚡ *TOOLS AI TRADING BY RAFI* ⚡\n\n` +
      `▪️ *Nama Koin:* ${signal.symbol}\n` +
      `▪️ *Harga:* $${signal.price}\n` +
      `▪️ *Trend:* ${signal.trend || 'BULLISH'}\n` +
      `▪️ *Confidence:* ${signal.confidenceScore}%\n` +
      `▪️ *Entry:* $${signal.entry || signal.price}\n` +
      `▪️ *SL:* $${signal.sl}\n` +
      `▪️ *TP1:* $${signal.tp1}\n` +
      `▪️ *TP2:* $${signal.tp2}\n` +
      `▪️ *TP3:* $${signal.tp3}\n` +
      `▪️ *Risk Reward:* ${signal.riskReward || '1 : 2.5'}\n` +
      `▪️ *Alasan:* ${signal.alasan || signal.tags.join(', ')}\n` +
      `▪️ *Potensi Risiko:* ${signal.potensiRisiko}\n` +
      `▪️ *Kesimpulan:* ${signal.kesimpulan}\n\n` +
      `🚀 _Powered by Rafi Pro Trader AI Terminal_ 🚀`;

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetchFn(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      const data = await response.json();
      return { success: data.ok, data };
    } catch (err) {
      console.error(`Telegram Alert Dispatch Failure: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Dispatches trading setup alert to Discord Webhook
   * @param {string} webhookUrl - Discord Webhook URL
   * @param {Object} signal - Signal details
   */
  async sendDiscordAlert(webhookUrl, signal) {
    if (!webhookUrl) {
      // console.log(`[Discord Mock Alert]: Live setup found! Pair: ${signal.symbol}, Action: ${signal.recommendedAction}, Conf: ${signal.confidenceScore}%`);
      return { success: true, mode: 'mock' };
    }

    const embedColor = signal.recommendedAction === 'BUY' ? 3066993 : 15158332; // Green vs Red in decimal
    
    const embedPayload = {
      username: "AI Trading Tools by Rafi",
      avatar_url: "https://crypto.com/images/favicon.png",
      embeds: [{
        title: `🚨 AI TRADING SIGNAL DETECTED: ${signal.symbol} 🚨`,
        description: `Our AI Scanner has detected a premium setup on **${signal.symbol}** with high probability.`,
        color: embedColor,
        fields: [
          { name: "⚡ Action", value: signal.recommendedAction === 'BUY' ? "🟢 BUY / LONG" : "🔴 SELL / SHORT", inline: true },
          { name: "💵 Entry Price", value: `$${signal.price}`, inline: true },
          { name: "🎯 Confidence Score", value: `**${signal.confidenceScore}%**`, inline: true },
          { name: "🏷️ Technical Tags", value: signal.tags.join(', '), inline: false },
          { name: "📊 Key Indicators", value: `📈 RSI: ${signal.indicators.rsi}\n🛡️ Support: $${signal.indicators.support}\n🚧 Resistance: $${signal.indicators.resistance}`, inline: false }
        ],
        footer: {
          text: "AI Trading Terminal by Rafi • Pro Trader Intelligence",
          icon_url: "https://cdn-icons-png.flaticon.com/512/2091/2091665.png"
        },
        timestamp: new Date().toISOString()
      }]
    };

    try {
      const response = await fetchFn(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embedPayload)
      });
      return { success: response.ok };
    } catch (err) {
      console.error(`Discord Alert Dispatch Failure: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new NotifierService();
