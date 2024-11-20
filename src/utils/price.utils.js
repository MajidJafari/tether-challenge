/**
 * Calculates the average price from an array of prices.
 * @param {number[]} prices - Array of prices.
 * @returns {number} Average price.
 */
function calculateAveragePrice(prices) {
  if (!prices.length) return 0;
  const total = prices.reduce((sum, price) => sum + price, 0);
  return total / prices.length;
}

module.exports = { calculateAveragePrice };
