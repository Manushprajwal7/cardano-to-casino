# Dashboard Feature Implementation Documentation

## Overview

This document outlines the complete implementation of the Dashboard feature in the Cardano Casino Integrity platform. The Dashboard provides real-time analytics and monitoring of blockchain activity, settlement flows, fee metrics, recent transactions, and network health using Blockfrost API integration.

## Architecture

The Dashboard feature consists of:

1. **Frontend Pages**:

   - Main dashboard page (`/dashboard`)

2. **Components**:

   - KPI cards for key metrics
   - Settlement chart for ADA volume visualization
   - Fees chart for platform revenue visualization
   - Recent activity table for transaction history
   - System status widgets for network health
   - Mempool feed for real-time transaction monitoring

3. **API Routes**:

   - Blockfrost metrics endpoint (`/api/blockfrost/metrics`)
   - Blockfrost health endpoint (`/api/blockfrost/health`)
   - Blockfrost transactions endpoint (`/api/blockfrost/transactions`)
   - Generic Blockfrost endpoint (`/api/blockfrost`)

4. **Services**:
   - Cache manager for performance optimization

## Frontend Implementation

### Dashboard Page (`app/dashboard/page.tsx`)

The main dashboard page displays comprehensive analytics with the following features:

- Responsive grid layout with KPI cards, charts, and tables
- Auto-refresh functionality every 15 seconds
- Manual refresh button as fallback
- Loading states and error handling
- Wallet connection status in the header
- Explorer links for transactions

The dashboard is organized into several sections:

1. **Header**: Title, description, and refresh controls
2. **KPI Cards**: Key metrics display (Total ADA Settled, Total Settlements, Active Players, Platform Fee)
3. **Charts Section**: ADA Volume Over Time and Platform Fee Revenue charts
4. **Activity Section**: Recent settlements table and system status widgets
5. **Mempool Feed**: Real-time transaction monitoring

## Components

### KPI Card (`components/dashboard/kpi-card.tsx`)

Displays key performance indicators with:

- Title and value display
- Trend indicators (up/down arrows)
- Percentage change visualization
- Loading skeletons for initial load
- Responsive design for all screen sizes

### Settlement Chart (`components/dashboard/settlement-chart.tsx`)

Visualizes ADA volume over time with:

- Responsive container with proper sizing
- Recharts AreaChart implementation
- Custom tooltips with formatted values
- Gradient fills for visual appeal
- Axis formatting for ADA values
- Loading states and empty data handling

### Fees Chart (`components/dashboard/fees-chart.tsx`)

Visualizes platform fee revenue with:

- Responsive container with proper sizing
- Recharts BarChart implementation
- Custom tooltips with formatted values
- Gradient fills for visual appeal
- Axis formatting for ADA values
- Loading states and empty data handling

### Recent Activity Table (`components/dashboard/recent-activity-table.tsx`)

Displays recent settlement transactions with:

- Transaction hash column with explorer links
- Timestamp column with relative time display
- Amount column with ADA formatting
- Status column with visual indicators
- Pagination controls
- Loading skeletons for initial load

### System Status Widgets (`components/dashboard/system-status.tsx`)

Shows network health metrics with:

- Block height widget with current value
- Slot height widget with current value
- Mempool transactions widget with count
- Epoch progress widget with percentage
- Last updated timestamp
- Loading states for all widgets

### Mempool Feed (`components/dashboard/mempool-feed.tsx`)

Real-time transaction monitoring with:

- Collapsible panel design
- Auto-updating transaction list
- Transaction hash display with truncation
- Time ago formatting for timestamps
- ADA amount display
- Loading skeletons for initial load
- Scrollable container for many transactions

## API Implementation

### Blockfrost Metrics (`app/api/blockfrost/metrics/route.ts`)

Provides aggregated dashboard metrics:

- GET endpoint for retrieving key metrics:
  - Total ADA volume (last 24 hours)
  - Total settlements count
  - Active players count
  - Platform fee revenue
- Implements caching with 30-second expiration
- Integrates with Blockfrost API for:
  - Latest transactions
  - Network metrics
  - Address activity

### Blockfrost Health (`app/api/blockfrost/health/route.ts`)

Provides network health information:

- GET endpoint for retrieving system status:
  - Current block height
  - Current slot height
  - Mempool transaction count
  - Current epoch and progress
- Implements caching with 30-second expiration
- Integrates with Blockfrost API for network data

### Blockfrost Transactions (`app/api/blockfrost/transactions/route.ts`)

Provides recent transaction data:

- GET endpoint for retrieving latest transactions:
  - Paginated transaction list
  - Transaction details (hash, amounts, timestamps)
- Implements caching with 30-second expiration
- Integrates with Blockfrost API for transaction data

### Generic Blockfrost Endpoint (`app/api/blockfrost/route.ts`)

Generic proxy for Blockfrost API calls:

- GET endpoint with endpoint parameter:
  - Routes requests to appropriate Blockfrost endpoints
  - Handles authentication with API key
  - Implements basic caching
- Supports various Blockfrost endpoints dynamically

## Services

### Cache Manager (`lib/cache-utils.ts`)

Utility service for caching API responses:

- In-memory caching with TTL support
- Extensible design for Redis integration
- Get and set operations with expiration
- Automatic cleanup of expired entries

## Data Structure

### Dashboard Metrics

```json
{
  "totalAdaVolume24h": "number",
  "totalSettlements": "number",
  "activePlayers24h": "number",
  "platformFeeRevenue24h": "number"
}
```

### Network Health Data

```json
{
  "currentBlockHeight": "number",
  "currentSlotHeight": "number",
  "mempoolTransactions": "number",
  "currentEpoch": "number",
  "epochProgress": "number"
}
```

### Transaction Data

```json
{
  "hash": "string",
  "amounts": [
    {
      "unit": "string",
      "quantity": "string"
    }
  ],
  "fee": "string",
  "timestamp": "number"
}
```

## Blockfrost Integration

The dashboard integrates with Blockfrost API for real-time blockchain data:

1. **API Key Configuration**: Uses environment variable `BLOCKFROST_API_KEY`
2. **Network Detection**: Automatically detects preprod/mainnet based on API key prefix
3. **Endpoint Mapping**: Maps to appropriate network endpoints
4. **Error Handling**: Graceful fallback to mock data on API errors
5. **Rate Limiting**: Implements caching to reduce API calls

### Supported Endpoints

- `/blocks/latest` - Latest block information
- `/network` - Network metrics
- `/txs` - Latest transactions
- `/addresses/{address}/transactions` - Address transactions

## Performance Considerations

- Caching layer reduces API calls and improves response times
- Auto-refresh interval balances real-time data with performance
- Loading skeletons provide immediate visual feedback
- Responsive design works on all device sizes
- Efficient data fetching minimizes bandwidth usage

## Security Considerations

- Blockfrost API key is stored securely in environment variables
- Client-side code doesn't expose sensitive credentials
- Data validation on all API responses
- Rate limiting prevents API abuse

## Future Enhancements

- WebSocket integration for real-time updates
- Advanced filtering and sorting options
- Export functionality for dashboard data
- Custom dashboard layouts and widgets
- Historical data comparison and trends
- Alerting system for network anomalies
- Multi-network support (different Cardano networks)
