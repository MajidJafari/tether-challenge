const { filterByPairs } = require('../utils/filter.utils');

class CryptoController {
  constructor(storageService, cryptoDataService) {
    this.storageService = storageService;
    this.cryptoDataService = cryptoDataService;
  }

  async getLatestPrices(req) {
    const { pairs } = req;
    let latestPrices = await this.storageService.getLatestPrices();

    if (!latestPrices || latestPrices.length === 0) {
      console.warn(
        'Latest prices not found in storage. Fetching directly from API...',
      );
      latestPrices = await this.cryptoDataService.fetchTopCryptos();
    }

    latestPrices = filterByPairs(latestPrices, pairs);

    return Buffer.from(JSON.stringify(latestPrices || []));
  }

  async getHistoricalPrices(req) {
    const { pairs, from, to } = req;
    let historicalPrices =
      (await this.storageService.getHistoricalPrices(from, to)) ?? [];

    historicalPrices = filterByPairs(historicalPrices, pairs);

    console.log({ historicalPrices });

    return Buffer.from(JSON.stringify(historicalPrices || []));
  }
}

module.exports = CryptoController;
