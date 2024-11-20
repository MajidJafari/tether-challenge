const RPC = require('@hyperswarm/rpc');
const DHT = require('hyperdht');

class RpcClient {
  constructor(serverPublicKey, bootstrapNodes) {
    this.serverPublicKey = Buffer.from(serverPublicKey, 'hex');
    this.dht = new DHT({ bootstrap: bootstrapNodes });
    this.rpc = new RPC({ dht: this.dht });
    this.token = null;
  }

  /**
   * Fetch the latest prices for specific cryptocurrency pairs.
   * @param {string[]} pairs - Array of cryptocurrency symbols (e.g., ['btc', 'eth']).
   * @returns {Promise<Object>} Latest prices.
   */
  async getLatestPrices(pairs) {
    try {
      const payload = { pairs };
      return this.request('getLatestPrices', payload);
    } catch (error) {
      console.error('Error fetching latest prices:', error.message);
      throw error;
    }
  }

  /**
   * Fetch historical prices for specific cryptocurrency pairs within a time range.
   * @param {string[]} pairs - Array of cryptocurrency symbols (e.g., ['btc', 'eth']).
   * @param {number} from - Start timestamp.
   * @param {number} to - End timestamp.
   * @returns {Promise<Object[]>} Historical prices.
   */
  async getHistoricalPrices(pairs, from, to) {
    try {
      const payload = { pairs, from, to };
      return this.request('getHistoricalPrices', payload);
    } catch (error) {
      console.error('Error fetching historical prices:', error.message);
      throw error;
    }
  }

  /**
   * Trigger the pipeline on-demand.
   * @returns {Promise<Object>} Response from the server.
   */
  async executePipeline() {
    try {
      return this.request('executePipeline', {});
    } catch (error) {
      console.error('Error triggering pipeline:', error.message);
      throw error;
    }
  }

  async authenticate(username, password) {
    const payload = { username, password };
    const response = await this.rpc.request(
      this.serverPublicKey,
      'login',
      Buffer.from(JSON.stringify(payload)),
    );
    const result = JSON.parse(response.toString('utf-8'));
    this.token = result.token;
    console.log('Authentication successful. Token:', this.token);
  }

  async request(route, payload) {
    if (!this.token) {
      await this.authenticate();
    }

    const response = await this.rpc.request(
      this.serverPublicKey,
      route,
      Buffer.from(JSON.stringify({ ...payload, token: this.token })),
    );
    return JSON.parse(response.toString('utf-8'));
  }

  async close() {
    await this.rpc.destroy();
    await this.dht.destroy();
    console.log('Client resources cleaned up.');
  }
}

module.exports = RpcClient;
