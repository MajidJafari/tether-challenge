class CryptoController {
  constructor(storageService, cryptoDataService) {
    this.storageService = storageService;
    this.cryptoDataService = cryptoDataService;
  }

  async getLatestPrices(req) {
    const { pairs } = req;
    let latestPrices = await this.storageService.getLatestPrices(pairs);

    if (!latestPrices || latestPrices.length === 0) {
      console.warn(
        'Latest prices not found in storage. Fetching directly from API...',
      );
      const fetchedPrices = await this.cryptoDataService.fetchTopCryptos();
      latestPrices = this.storageService.filterByPairs(
        [{ data: fetchedPrices }],
        pairs,
      );
    }

    return Buffer.from(JSON.stringify(latestPrices || []));
  }

  async getHistoricalPrices(req) {
    const { pairs, from, to } = req;
    let historicalPrices = await this.storageService.getHistoricalPrices(
      pairs,
      from,
      to,
    );

    if (!historicalPrices || historicalPrices.length === 0) {
      console.warn(
        'Historical prices not found in storage. Fetching directly from API...',
      );
      const fetchedPrices = await this.cryptoDataService.fetchTopCryptos();
      historicalPrices = this.storageService.filterByPairs(
        [{ data: fetchedPrices }],
        pairs,
      );
    }

    return Buffer.from(JSON.stringify(historicalPrices || []));
  }
}

module.exports = CryptoController;
