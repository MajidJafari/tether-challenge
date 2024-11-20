const CryptoDataService = require('./services/crypto-data.service');
const StorageService = require('./services/data-storage.service');
const config = require('./configs/app.config');

const run = async () => {
  const cryptoDataService = new CryptoDataService(config);
  const storageService = new StorageService(config.dbPath);

  try {
    const topCryptos = await cryptoDataService.fetchTopCryptos();

    if (!topCryptos || topCryptos.length === 0) {
      console.warn('No valid cryptocurrency data to save');
      return;
    }

    const timestamp = Date.now();
    await storageService.saveData(`prices:${timestamp}`, topCryptos);

    console.log(
      'Data fetched, cleaned, and stored at:',
      new Date(timestamp).toISOString(),
    );
    console.log('Top Cryptocurrencies with Average Prices:', topCryptos);
  } catch (error) {
    console.error(
      'Failed to fetch or store data:',
      error.message,
      error.response?.data?.error,
      `Params: ${JSON.stringify(error.request?.params)}`,
    );
  }
};

run();
