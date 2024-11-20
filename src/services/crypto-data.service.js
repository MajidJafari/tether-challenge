// src/services/CryptoDataService.js
const axios = require('axios');
const { calculateAveragePrice } = require('../utils/price.utils');
const { validateAndCleanData } = require('../utils/validation.utils');
const { isNil } = require('../utils/helpers.utils');

class CryptoDataService {
  constructor(config) {
    this.apiBaseUrl = config.coingeckoApiUrl;
    this.defaultCurrency = config.defaultCurrency;
    this.cryptoLimit = config.cryptoLimit;
    this.exchangeLimit = config.exchangeLimit;
  }

  async fetchTopCryptos() {
    const topCryptos = await this.fetchTopCryptoList();
    const prices = await Promise.all(
      topCryptos.map(async (crypto) => {
        const tickers = await this.fetchTickers(crypto.id);
        return this.calculateAveragePriceFromTickers(tickers, crypto);
      }),
    );

    return validateAndCleanData(prices);
  }

  async fetchTopCryptoList() {
    const response = await axios.get(`${this.apiBaseUrl}/coins/markets`, {
      params: {
        vs_currency: this.defaultCurrency,
        order: 'market_cap_desc',
        per_page: this.cryptoLimit,
        page: 1,
      },
    });

    return response.data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
    }));
  }

  async fetchTickers(cryptoId) {
    const response = await axios.get(
      `${this.apiBaseUrl}/coins/${cryptoId}/tickers`,
    );
    return response.data.tickers || [];
  }

  calculateAveragePriceFromTickers(tickers, crypto) {
    const topExchanges = tickers.slice(0, this.exchangeLimit);

    const prices = topExchanges
      .map((ticker) => parseFloat(ticker.last || 0))
      .filter(Boolean);

    return {
      symbol: crypto.symbol,
      name: crypto.name,
      averagePrice: calculateAveragePrice(prices),
      exchanges: topExchanges
        .filter((ticker) => !isNaN(+ticker.last) && isNil(ticker.last))
        .map((ticker) => ticker.market.name),
    };
  }

  async getHistoricalPrices(pairs, from, to) {
    if (!pairs || pairs.length === 0) {
      throw new Error('Pairs array cannot be empty.');
    }

    if (!from || !to || from >= to) {
      throw new Error('Invalid time range.');
    }

    const results = [];

    for (const pair of pairs) {
      try {
        // Replace with the actual endpoint for fetching historical prices from the API
        const response = await this.apiClient.get(
          `/coins/${pair}/market_chart/range`,
          {
            params: {
              vs_currency: this.defaultCurrency,
              from: Math.floor(from / 1000),
              to: Math.floor(to / 1000),
            },
          },
        );

        if (response.data && response.data.prices) {
          results.push({
            symbol: pair,
            historicalPrices: response.data.prices.map(
              ([timestamp, price]) => ({
                timestamp,
                price,
              }),
            ),
          });
        }
      } catch (error) {
        console.error(
          `Failed to fetch historical prices for ${pair}:`,
          error.message,
        );
        results.push({ symbol: pair, error: 'Failed to fetch data.' });
      }
    }

    return results;
  }
}

module.exports = CryptoDataService;
