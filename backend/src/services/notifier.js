const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)).catch(() => {});

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

    const message = `🚀 *AI TRADING SIGNAL: ${signal.symbol}* 🚀\n\n` +
      `▪️ *Action:* ${signal.recommendedAction === 'BUY' ? '🟢 BUY / LONG' : '🔴 SELL / SHORT'}\n` +
      `▪️ *Current Price:* $${signal.price}\n` +
      `▪️ *Confidence Score:* ${signal.confidenceScore}%\n` +
      `▪️ *Signals:* ${signal.tags.join(', ')}\n` +
      `▪️ *Technical Status:*\n` +
      `   - RSI: ${signal.indicators.rsi}\n` +
      `   - support: $${signal.indicators.support}\n` +
      `   - resistance: $${signal.indicators.resistance}\n\n` +
      `⚡ *Tools AI Trading by Rafi* ⚡`;

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
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
      const response = await fetch(webhookUrl, {
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
