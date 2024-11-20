const { validateAndCleanData } = require('../../src/utils/validation.utils');

describe('validateAndCleanData', () => {
  it('should validate and clean valid records', () => {
    const data = [
      {
        symbol: 'btc',
        name: 'Bitcoin',
        averagePrice: 60000,
        exchanges: ['Binance', 'Coinbase Pro'],
      },
      {
        symbol: 'eth',
        name: 'Ethereum',
        averagePrice: 4000,
        exchanges: ['Binance'],
      },
    ];

    const result = validateAndCleanData(data);
    expect(result).toEqual(data); // Expect the valid data to remain unchanged
  });

  it('should filter out invalid records', () => {
    const data = [
      {
        symbol: 'btc',
        name: 'Bitcoin',
        averagePrice: 60000,
        exchanges: ['Binance'],
      }, // Valid
      {
        symbol: 'eth',
        name: 'Ethereum',
        averagePrice: null,
        exchanges: ['Binance'],
      }, // Invalid
      { name: 'Litecoin', averagePrice: 300, exchanges: ['Binance'] }, // Missing symbol
    ];

    const result = validateAndCleanData(data);
    expect(result).toEqual([
      {
        symbol: 'btc',
        name: 'Bitcoin',
        averagePrice: 60000,
        exchanges: ['Binance'],
      },
    ]);
  });

  it('should return an empty array for completely invalid data', () => {
    const data = [
      { name: 'Invalid Coin', averagePrice: null },
      { symbol: 'ltc', name: 'Litecoin', exchanges: [] },
    ];

    const result = validateAndCleanData(data);
    expect(result).toEqual([]);
  });
});
