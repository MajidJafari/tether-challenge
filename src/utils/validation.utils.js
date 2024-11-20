function validateAndCleanRecord(record) {
  if (!record.symbol || typeof record.symbol !== 'string') {
    console.warn('Skipping record with invalid symbol:', record);
    return null;
  }
  if (!record.averagePrice || typeof record.averagePrice !== 'number') {
    console.warn('Skipping record with invalid average price:', record);
    return null;
  }
  if (!Array.isArray(record.exchanges) || record.exchanges.length === 0) {
    console.warn('Skipping record with missing or invalid exchanges:', record);
    return null;
  }

  return {
    symbol: record.symbol,
    name: record.name,
    averagePrice: record.averagePrice,
    exchanges: record.exchanges,
  };
}

function validateAndCleanData(data) {
  return data.map(validateAndCleanRecord).filter(Boolean);
}

module.exports = { validateAndCleanData };
