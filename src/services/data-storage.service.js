const Hypercore = require('hypercore');
const Hyperbee = require('hyperbee');

class StorageService {
  constructor(dbPath) {
    this.core = new Hypercore(dbPath);
    this.db = new Hyperbee(this.core, { keyEncoding: 'utf-8', valueEncoding: 'json' });
  }

  async init() {
    await this.db.ready();
  }

  async saveData(key, data) {
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

  async getLatestData() {
    const stream = this.db.createReadStream({ gt: 'prices:', reverse: true, limit: 1 });
    for await (const { value } of stream) {
      return value;
    }
    return null;
  }

  async getHistoricalData(from, to) {
    const results = [];
    for await (const { key, value } of this.db.createReadStream({ gte: `prices:${from}`, lte: `prices:${to}` })) {
      results.push({ timestamp: key.split(':')[1], data: value });
    }
    return results;
  }
}

module.exports = StorageService;
