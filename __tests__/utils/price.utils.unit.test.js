const { calculateAveragePrice } = require('../../src/utils/price.utils.js');

describe('calculateAveragePrice', () => {
  it('should return the correct average for valid prices', () => {
    const prices = [100, 200, 300];
    const average = calculateAveragePrice(prices);
    expect(average).toBe(200);
  });

  it('should return 0 if no prices are provided', () => {
    const prices = [];
    const average = calculateAveragePrice(prices);
    expect(average).toBe(0);
  });

  it('should handle single price input correctly', () => {
    const prices = [150];
    const average = calculateAveragePrice(prices);
    expect(average).toBe(150);
  });
});
