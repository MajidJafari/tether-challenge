const CryptoDataService = require('./services/crypto-data.service');
const StorageService = require('./services/data-storage.service');
const SchedulerService = require('./services/scheduler.service');
const config = require('./configs/app.config');

const cryptoDataService = new CryptoDataService(config);
const storageService = new StorageService(config.dbPath);

const fetchAndStoreTask = async () => {
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
    const { params, url, method, headers } = error.config ?? {};
    console.error({
      title: 'Failed to fetch or store data:',
      message: error.message,
      request: {
        headers,
        params,
        method,
        url,
      },
      response: error.response?.data ?? {},
    });
  }
};

const run = async () => {
  await storageService.init();

  try {
    const scheduler = new SchedulerService(fetchAndStoreTask);
    scheduler.start(config.schedulerCron);
    await scheduler.executeNow(); // For demonstration, manually trigger the task on-demand

    setTimeout(() => scheduler.stop(), 120000); // Stop after 2 minutes (For demonstration purposes only)
  } catch (error) {
    console.error('Initialization error:', error.message);
  }
};

run();
