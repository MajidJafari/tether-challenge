const RpcClient = require('./rpc/client.rpc');

const run = async () => {
  const serverPublicKey =
    '90a56f00adc8f8ad72f4eff3fe12b3b5f2eda304e4fe16b960f328b9850db9f3';
  const bootstrapNodes = [{ host: '127.0.0.1', port: 30001 }];

  const client = new RpcClient(serverPublicKey, bootstrapNodes);

  // Authenticate the client
  await client.authenticate('admin', 'password');

  try {
    // Get latest prices
    console.log('Fetching latest prices for BTC and ETH...');
    const latestPrices = await client.getLatestPrices(['btc', 'eth']);
    console.log('Latest Prices:', latestPrices);

    // Get historical prices
    console.log('Fetching historical prices for BTC from 1 hour ago to now...');
    const from = Date.now() - 3600 * 1000; // 1 hour ago
    const to = Date.now();
    const historicalPrices = await client.getHistoricalPrices(
      ['btc'],
      from,
      to,
    );
    console.log('Historical Prices:', historicalPrices);

    // Trigger pipeline on-demand
    console.log('Triggering pipeline on-demand...');
    const pipelineResponse = await client.executePipeline();
    console.log('Pipeline Response:', pipelineResponse);
  } catch (error) {
    console.error('Client error:', error.message);
  } finally {
    await client.close();
  }
};

run();
