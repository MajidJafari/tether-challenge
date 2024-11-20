require('dotenv').config();

module.exports = {
  coingeckoApiUrl:
    process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'btc',
  cryptoLimit: parseInt(process.env.DEFAULT_CRYPTO_LIMIT, 10) || 5,
  exchangeLimit: parseInt(process.env.DEFAULT_EXCHANGE_LIMIT, 10) || 3,
  dbPath: process.env.DB_PATH || './db/crypto-data',
  schedulerCron: process.env.SCHEDULER_CRON_STRING || '*/30 * * * * *',
  dhtPort: parseInt(process.env.DHT_PORT, 10) || 30001,
  dhtHost: process.env.DHT_HOST || '127.0.0.1',
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  rateLimitNumber: parseInt(process.env.RATE_LIMIT_NUMBER, 10) || 10,
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000,
};
