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
      createReadStream: jest.fn().mockImplementation((options) => {
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

        const filteredData = data.filter(({ key }) => {
          const fromCondition = options.gte ? key >= options.gte : true;
          const toCondition = options.lte ? key <= options.lte : true;
          return fromCondition && toCondition;
        });

        return {
          [Symbol.asyncIterator]: async function* () {
            for (const item of filteredData) {
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
        name: 'Bitcoin',
        averagePrice: 60000,
        exchanges: ['Binance'],
      },
      {
        symbol: 'eth',
        name: 'Ethereum',
        averagePrice: 4000,
        exchanges: ['Kraken'],
      },
    ]);
  });

  it('should save cleaned data to the database', async () => {
    const data = [
      {
        symbol: 'btc',
        name: 'Bitcoin',
        averagePrice: 60000,
        exchanges: ['Binance'],
      },
    ];

    const saveSpy = storageService.db.put;

    await storageService.saveData('prices:timestamp', data);
    expect(saveSpy).toHaveBeenCalledWith('prices:timestamp', data);
  });

  it('should retrieve the latest data from the database', async () => {
    const result = await storageService.getLatestPrices();
    expect(result).toEqual({ symbol: 'btc', averagePrice: 60000 });
  });
});
