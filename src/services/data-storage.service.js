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
        uniqueData.set(item.symbol, {
          symbol: item.symbol,
          name: item.name,
          averagePrice: item.averagePrice,
          exchanges: item.exchanges,
        });
      }
    });

    return Array.from(uniqueData.values());
  }

  async getLatestPrices() {
    const results = [];
    const stream = this.db.createReadStream({
      gt: 'prices:',
      reverse: true,
      limit: 1,
    });
    for await (const { value } of stream) {
      results.push(value);
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
    for await (const { key, value } of this.db.createReadStream({
      gte: `prices:${from}`,
      lte: `prices:${to}`,
    })) {
      results.push(value);
    }
    return results;
  }
}

module.exports = StorageService;
