const StorageService = require('../../src/services/data-storage.service');

jest.mock('hyperbee', () => {
  return jest.fn().mockImplementation(() => {
    return {
      ready: jest.fn(),
      put: jest.fn(),
      get: jest.fn().mockResolvedValue({
        key: 'prices:timestamp',
        value: { symbol: 'btc', averagePrice: 60000 },
      }),
      createReadStream: jest.fn().mockImplementation(() => {
        const data = [
          {
            key: 'prices:timestamp1',
            value: { symbol: 'btc', averagePrice: 60000 },
          },
          {
            key: 'prices:timestamp2',
            value: { symbol: 'eth', averagePrice: 4000 },
          },
        ];

        return {
          [Symbol.asyncIterator]: async function* () {
            for (const item of data) {
              yield item;
            }
          },
        };
      }),
    };
  });
});

describe('StorageService', () => {
  let storageService;

  beforeEach(async () => {
    storageService = new StorageService('./db/test');
    await storageService.init();
  });

  it('should clean the deduplicated data before saving', async () => {
    const data = [
      {
        symbol: 'btc',
        name: 'Bitcoin',
        averagePrice: 60000,
        exchanges: ['Binance'],
      },
      {
        symbol: 'btc',
        name: 'Bitcoin',
        averagePrice: 60000,
        exchanges: ['Binance'],
      }, // Duplicate
      {
        symbol: 'eth',
        name: 'Ethereum',
        averagePrice: 4000,
        exchanges: ['Kraken'],
      },
    ];

    const cleanedData = storageService.cleanData(data);
    expect(cleanedData).toEqual([
      {
        symbol: 'btc',
        averagePrice: 60000,
      },
      {
        symbol: 'eth',
        averagePrice: 4000,
      },
    ]);
  });

  it('should save cleaned data to the database', async () => {
    const data = [
      {
        symbol: 'btc',
        averagePrice: 60000,
      },
    ];

    const saveSpy = storageService.db.put;

    await storageService.saveData('prices:timestamp', data);
    expect(saveSpy).toHaveBeenCalledWith('prices:timestamp', data);
  });
});
