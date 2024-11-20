const RpcClient = require('./rpc/client.rpc');

const run = async () => {
  const serverPublicKey =
    '50e76edc99d97c4362f4b543bbc55a56c411237094088fe2901973980f718348';
  const bootstrapNodes = [{ host: '127.0.0.1', port: 30001 }];

  const client = new RpcClient(serverPublicKey, bootstrapNodes);

  await client.authenticate('admin', 'password');

  try {
    console.log('Fetching latest prices for BTC and ETH...');
    const latestPrices = await client.getLatestPrices(['btc', 'eth']);
    console.log('Latest Prices:', latestPrices);

    console.log('Fetching historical prices for BTC from 1 hour ago to now...');
    const from = Date.now() - 3600 * 1000; // 1 hour ago
    const to = Date.now();
    const historicalPrices = await client.getHistoricalPrices(
      ['btc'],
      from,
      to,
    );
    console.log('Historical Prices:', historicalPrices);

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
