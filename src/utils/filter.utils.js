function filterByPairs(records, pairs) {
  if (!pairs || pairs.length === 0) {
    return records;
  }

  return records.filter((item) => pairs.includes(item.symbol));
}

module.exports = { filterByPairs };
