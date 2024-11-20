# Tether Test Challenge

## Functional Requirements

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

## How to run

Execute the `npm run server`command in your CLI to run the server.

Execute the `npm run client`command in your CLI to run the client.

