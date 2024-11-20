// src/services/CryptoDataService.js
const axios = require('axios');
const { calculateAveragePrice } = require('../utils/price.utils');

class CryptoDataService {
  constructor(config) {
    this.apiBaseUrl = config.coingeckoApiUrl;
    this.defaultCurrency = config.defaultCurrency;
    this.cryptoLimit = config.cryptoLimit;
    this.exchangeLimit = config.exchangeLimit;
  }

  /**
   * Fetches top cryptocurrencies and their average prices from top exchanges.
   * @returns {Promise<Object[]>} Array of cryptocurrency data with average prices.
   */
  async fetchTopCryptos() {
    const topCryptos = await this.fetchTopCryptoList();
    const prices = await Promise.all(
      topCryptos.map(async (crypto) => {
        const tickers = await this.fetchTickers(crypto.id);
        return this.calculateAveragePriceFromTickers(tickers, crypto);
      }),
    );

    return prices;
  }

  /**
   * Fetches the top cryptocurrencies based on market cap.
   * @returns {Promise<Object[]>} Array of top cryptocurrency objects.
   */
  async fetchTopCryptoList() {
    const params = {
      vs_currency: this.defaultCurrency,
      order: 'market_cap_desc',
      per_page: this.cryptoLimit,
      page: 1,
    };
    try {
      const response = await axios.get(`${this.apiBaseUrl}/coins/markets`, {
        params
      });

      return response.data.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
      }));
    } catch (error) {
      console.error(
        'Error fetching top cryptocurrencies:',
        error.message,
        error.response?.data?.error,
        `Params: ${JSON.stringify(params)}`
      );
      throw error;
    }
  }

  /**
   * Fetches tickers for a specific cryptocurrency.
   * @param {string} cryptoId - Cryptocurrency ID.
   * @returns {Promise<Object[]>} Array of tickers.
   */
  async fetchTickers(cryptoId) {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/coins/${cryptoId}/tickers`,
      );
      return response.data.tickers || [];
    } catch (error) {
      console.error(
        `Error fetching tickers for ${cryptoId}:`,
        error.message,
        error.response?.data?.error,
      );
      throw error;
    }
  }

  /**
   * Calculates the average price from tickers of the top exchanges.
   * @param {Object[]} tickers - Array of ticker data.
   * @param {Object} crypto - Cryptocurrency data (symbol and name).
   * @returns {Object} Cryptocurrency data with average price.
   */
  calculateAveragePriceFromTickers(tickers, crypto) {
    const topExchanges = tickers.slice(0, this.exchangeLimit);
    const prices = topExchanges
      .map((ticker) => parseFloat(ticker.last || 0))
      .filter(Boolean);

    return {
      symbol: crypto.symbol,
      name: crypto.name,
      averagePrice: calculateAveragePrice(prices),
      exchanges: topExchanges.map((ticker) => ticker.market.name),
    };
  }
}

module.exports = CryptoDataService;
