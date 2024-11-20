const Hypercore = require('hypercore');
const Hyperbee = require('hyperbee');

class StorageService {
  constructor(dbPath) {
    this.core = new Hypercore(dbPath);
    this.db = new Hyperbee(this.core, {
      keyEncoding: 'utf-8',
      valueEncoding: 'json',
    });
  }

  async init() {
    await this.db.ready();
    console.log('Database initialized.');
  }

  async saveData(key, data) {
    if (!key || !data) {
      throw new Error('Key and data are required for saving to the database.');
    }

    const cleanedData = this.cleanData(data);
    await this.db.put(key, cleanedData);
  }

  cleanData(data) {
    const uniqueData = new Map();

    data.forEach((item) => {
      if (!uniqueData.has(item.symbol)) {
        // Ensure that data is optimized to store for large data set
        uniqueData.set(item.symbol, {
          symbol: item.symbol,
          averagePrice: item.averagePrice,
        });
      }
    });

    return Array.from(uniqueData.values());
  }

  async getLatestPrices() {
    const results = [];
    const stream = this.db.createReadStream();
    for await (const { key, value } of stream) {
      if (key.startsWith('prices')) {
        results.push(value.data);
      }
    }
    return results;
  }

  async getHistoricalPrices(from, to) {
    if (!from || !to) {
      throw new Error(
        'Both "from" and "to" keys are required for range queries.',
      );
    }

    const results = [];
    const stream = this.db.createReadStream();
    for await (const { key, value } of stream) {
      const [fixedPart, timestamp] = key.split(':');
      if (fixedPart === 'prices' && timestamp >= from && timestamp <= to) {
        results.push(Buffer.from(value.data));
      }
    }
    return results;
  }

  async deleteAllKeys() {
    const stream = this.db.createReadStream();
    for await (const { key } of stream) {
      await this.db.del(key);
      console.log(`Deleted key: ${key}`);
    }
  }
}

module.exports = StorageService;
