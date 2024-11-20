const CryptoDataService = require('./services/crypto-data.service');
const config = require('./configs/app.config');

(async () => {
  const cryptoDataService = new CryptoDataService(config);

  try {
    const topCryptos = await cryptoDataService.fetchTopCryptos();
    console.log('Top Cryptocurrencies with Average Prices:', topCryptos);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();