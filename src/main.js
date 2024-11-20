const DHT = require('hyperdht');
const crypto = require('crypto');
const RpcServer = require('./rpc/server.rpc');
const CryptoDataService = require('./services/crypto-data.service');
const StorageService = require('./services/data-storage.service');
const SchedulerService = require('./services/scheduler.service');
const CryptoController = require('./controllers/crypto.controller');
const PipelineController = require('./controllers/pipeline.controller');
const AuthController = require('./controllers/auth.controller');
const AuthMiddleware = require('./middleware/auth.middleware');
const RateLimitMiddleware = require('./middleware/rate-limit.middleware');
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
    console.log('Top Cryptocurrencies with Average ', topCryptos);
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

const runAndGetServer = async () => {
  // resolved distributed hash table seed for key pair
  let dhtSeed = await storageService.db.get('dht-seed');
  if (!dhtSeed) {
    console.log('DHT seed not found. Generating a new one...');
    dhtSeed = crypto.randomBytes(32);
    await storageService.db.put('dht-seed', dhtSeed);
  } else {
    dhtSeed = Buffer.from(dhtSeed.value);
  }

  // start distributed hash table, it is used for rpc service discovery
  const dht = new DHT({
    bootstrap: [{ host: '127.0.0.1', port: 30001 }],
    keyPair: DHT.keyPair(dhtSeed), // Use the stored or generated seed
  });

  // resolve rpc server seed for key pair
  let rpcSeed = await storageService.db.get('rpc-seed');
  if (!rpcSeed) {
    console.log('RPC seed not found. Generating a new one...');
    rpcSeed = crypto.randomBytes(32);
    await storageService.db.put('rpc-seed', rpcSeed);
  } else {
    rpcSeed = Buffer.from(rpcSeed.value);
  }

  return new RpcServer(dht, rpcSeed);
};

const run = async () => {
  try {
    await storageService.init();
    // Remove all keys from the DB to have fresh run
    await storageService.deleteAllKeys();

    const rpcServer = await runAndGetServer();

    const scheduler = new SchedulerService(fetchAndStoreTask);
    scheduler.start(config.schedulerCron);

    setTimeout(() => scheduler.stop(), 120000); // Stop after 2 minutes (For demonstration purposes only)

    const cryptoController = new CryptoController(
      storageService,
      cryptoDataService,
    );
    const pipelineController = new PipelineController(scheduler);
    const authController = new AuthController(config.jwtSecretKey);

    rpcServer.registerRoute(
      'getLatestPrices',
      cryptoController.getLatestPrices.bind(cryptoController),
    );
    rpcServer.registerRoute(
      'getHistoricalPrices',
      cryptoController.getHistoricalPrices.bind(cryptoController),
    );
    rpcServer.registerRoute(
      'executePipeline',
      pipelineController.executePipeline.bind(pipelineController),
    );
    rpcServer.registerRoute(
      'login',
      authController.login.bind(authController),
      true,
    );

    const authMiddleware = new AuthMiddleware(config.jwtSecretKey);
    rpcServer.use(authMiddleware.validateToken.bind(authMiddleware));

    const rateLimitMiddleware = new RateLimitMiddleware({
      limit: config.rateLimitNumber,
      windowMs: config.rateLimitWindow,
    });
    rpcServer.use(
      rateLimitMiddleware.enforceRateLimit.bind(rateLimitMiddleware),
    );

    await rpcServer.listen();
    console.log('RPC server is up and running.');
  } catch (error) {
    console.error('Initialization error:', error.message);
    process.exit(1);
  }
};

run();
