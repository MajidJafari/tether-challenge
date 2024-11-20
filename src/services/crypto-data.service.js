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

    const data = validateAndCleanData(prices);

    // Ensure that data is optimized to store for large data set
    return data.map((item) => ({
      symbol: item.symbol,
      averagePrice: item.averagePrice,
    }));
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
}

module.exports = CryptoDataService;
