const axios = require('axios');
const CryptoDataService = require('../../src/services/crypto-data.service');
const config = require('../../src/configs/app.config');
jest.mock('axios');

describe('CryptoDataService', () => {
  let cryptoDataService;

  beforeEach(() => {
    cryptoDataService = new CryptoDataService(config);
    jest.clearAllMocks();
  });

  describe('fetchTopCryptoList', () => {
    it('should fetch top cryptocurrencies correctly', async () => {
      const mockResponse = {
        data: [
          { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
          { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
        ],
      };
      axios.get.mockResolvedValue(mockResponse);

      const result = await cryptoDataService.fetchTopCryptoList();

      expect(axios.get).toHaveBeenCalledWith(
        `${cryptoDataService.apiBaseUrl}/coins/markets`,
        {
          params: {
            vs_currency: 'btc',
            order: 'market_cap_desc',
            per_page: 5,
            page: 1,
          },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error if the API request fails', async () => {
      axios.get.mockRejectedValue(new Error('API error'));

      await expect(cryptoDataService.fetchTopCryptoList()).rejects.toThrow(
        'API error',
      );
    });
  });

  describe('fetchTickers', () => {
    it('should fetch tickers for a cryptocurrency correctly', async () => {
      const mockResponse = {
        data: {
          tickers: [
            { market: { name: 'Binance' }, last: 60000 },
            { market: { name: 'Coinbase Pro' }, last: 60500 },
          ],
        },
      };
      axios.get.mockResolvedValue(mockResponse);

      const result = await cryptoDataService.fetchTickers('bitcoin');

      expect(axios.get).toHaveBeenCalledWith(
        `${cryptoDataService.apiBaseUrl}/coins/bitcoin/tickers`,
      );
      expect(result).toEqual(mockResponse.data.tickers);
    });

    it('should throw an error if the API request fails', async () => {
      axios.get.mockRejectedValue(new Error('API error'));

      await expect(cryptoDataService.fetchTickers('bitcoin')).rejects.toThrow(
        'API error',
      );
    });
  });

  describe('calculateAveragePriceFromTickers', () => {
    it('should calculate the average price and return cleaned data', () => {
      const tickers = [
        { market: { name: 'Binance' }, last: 60000 },
        { market: { name: 'Coinbase Pro' }, last: 60500 },
        { market: { name: 'Kraken' }, last: 59500 },
      ];

      const crypto = { symbol: 'btc', name: 'Bitcoin' };

      const result = cryptoDataService.calculateAveragePriceFromTickers(
        tickers,
        crypto,
      );

      expect(result).toEqual({
        symbol: 'btc',
        name: 'Bitcoin',
        averagePrice: 60000,
        exchanges: ['Binance', 'Coinbase Pro', 'Kraken'],
      });
    });

    it('should handle invalid or missing prices gracefully', () => {
      const tickers = [
        { market: { name: 'Binance' }, last: 60000 },
        { market: { name: 'Coinbase Pro' }, last: null }, // Invalid price
        { market: { name: 'Kraken' } }, // Missing price
      ];

      const crypto = { symbol: 'btc', name: 'Bitcoin' };

      const result = cryptoDataService.calculateAveragePriceFromTickers(
        tickers,
        crypto,
      );

      expect(result).toEqual({
        symbol: 'btc',
        name: 'Bitcoin',
        averagePrice: 60000,
        exchanges: ['Binance'],
      });
    });
  });

  describe('fetchTopCryptos', () => {
    it('should fetch and preprocess cryptocurrency data', async () => {
      const mockCryptoList = [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
      ];

      const mockTickers = [
        { market: { name: 'Binance' }, last: 60000 },
        { market: { name: 'Coinbase Pro' }, last: 60500 },
        { market: { name: 'Kraken' }, last: 59500 },
      ];

      axios.get
        .mockResolvedValueOnce({ data: mockCryptoList })
        .mockResolvedValueOnce({ data: { tickers: mockTickers } })
        .mockResolvedValueOnce({ data: { tickers: mockTickers } });

      const result = await cryptoDataService.fetchTopCryptos();

      expect(result).toEqual([
        {
          symbol: 'btc',
          name: 'Bitcoin',
          averagePrice: 60000,
          exchanges: ['Binance', 'Coinbase Pro', 'Kraken'],
        },
        {
          symbol: 'eth',
          name: 'Ethereum',
          averagePrice: 60000,
          exchanges: ['Binance', 'Coinbase Pro', 'Kraken'],
        },
      ]);
    });

    it('should handle invalid tickers gracefully during preprocessing', async () => {
      const mockCryptoList = [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
      ];
      const mockTickers = [
        { market: { name: 'Binance' }, last: 60000 },
        { market: { name: 'Coinbase Pro' }, last: 'null' }, // Invalid price
        { market: { name: 'Kraken' } }, // Missing price
      ];

      axios.get
        .mockResolvedValueOnce({ data: mockCryptoList })
        .mockResolvedValueOnce({ data: { tickers: mockTickers } });

      const result = await cryptoDataService.fetchTopCryptos();

      expect(result).toEqual([
        {
          symbol: 'btc',
          name: 'Bitcoin',
          averagePrice: 60000,
          exchanges: ['Binance'],
        },
      ]);
    });
  });
});
