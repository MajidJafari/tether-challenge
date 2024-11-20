# Tether Test Challenge

## Functional Requirements:

- Data Collection
  - The data should be collected from coingecko public api
  - Collected data should include prices for top 5 crypto currencies (determined by coingecko) against USDt
  - Prices should be fetched from top 3 exchanges (determined by coingecko) and should calculate average price
- Data Preprocessing and Transformation
  - Ensure you store minimal data considering that dataset might grow large
  - Make sure you store necessary info about exchanges from which price is calculated
  - Handle data quality issues
- Data storage
  - The data should be stored using [Hypercore/Hyperbee databases](https://docs.pears.com/building-blocks/hypercore)
- Scheduling and Automation:
  - Implement a scheduling mechanism to run the data pipeline at regular intervals e.g. every 30s
  - Ensure the pipeline can be executed both on-demand and as a scheduled task
- Data exposure
  - Processed/stored data should be exposed via [Hypersawrm RPC](https://www.npmjs.com/package/@hyperswarm/rpc)
  - RPC methods should include:
    - getLatestPrices (pairs: string[])
    - getHistoricalPrices (pairs: string[], from: number, to: number)
  - Write a simple client demostrating an example for getting prices

## Additional Features:

- Unit Tests: For most important services, unit tests added.
- Authentication: JWT mechanism with fixed username and password login added.
- Rate Limit: App In-memory rate limiter added

## How to run

1. Execute the `npm run server`command in your CLI to run the server.
2. Copy the public key from "RPC server is listening on public key:" when you run the server
3. Paste the value from step 3 and replace it with current value of `serverPublicKey` in `src/client.js`.
3. Execute the `npm run client`command in your CLI to run the client.

## Improvements:
- Use Redis for caching and storing rate limiting information
- Validation: A validation mechanism beings as middleware can make this project more fault tolerant
- Pagination: Add pagination for handling large set of data for client