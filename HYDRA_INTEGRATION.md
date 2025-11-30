# Hydra Integration for Cardano Casino Integrity SaaS

This document explains how to integrate and use Hydra head protocols in the Cardano Casino Integrity SaaS application.

## Overview

Hydra is a layer 2 scaling solution for Cardano that enables near-instant and low-cost transactions. This integration provides:

1. **Fast Settlements**: Near-instant transaction finality for casino settlements
2. **Low Fees**: Significantly reduced transaction costs compared to Layer 1
3. **Privacy**: Off-chain transaction processing with on-chain finality
4. **Scalability**: Ability to process thousands of transactions per second

## Installation

The Hydra integration is already set up in this project with the following structure:

```
lib/
├── hydra-utils.ts          # Core Hydra utilities
hooks/
├── use-hydra.ts            # React hook for Hydra integration
components/
├── hydra/
    └── HydraDemo.tsx       # Demo component
config/
├── sessions/               # Session configuration
├── settlements/            # Settlement configuration
└── base.yaml              # Base configuration
```

## Configuration Structure

### Base Configuration (`config/base.yaml`)

```yaml
app:
  name: "Cardano Casino Integrity SaaS"
  version: "1.0.0"
  environment: ${oc.env:NODE_ENV,development}

cardano:
  network: "preprod"
  blockfrost_project_id: ${oc.env:BLOCKFROST_PROJECT_ID}
  platform_fee_address: "addr_test1..."
```

### Session Configuration

Located in `config/sessions/` with operators, game types, and environments.

### Settlement Configuration

Located in `config/settlements/` with fee structures, networks, and currencies.

## Core Components

### 1. Hydra Utilities (`lib/hydra-utils.ts`)

Provides core functionality for working with Hydra heads:

- `initHydraConfig()`: Initialize Hydra configuration
- `buildHydraTransaction()`: Build Hydra transactions
- `submitHydraTransaction()`: Submit transactions to Hydra head
- `commitToHydra()`: Commit UTxOs to Hydra head
- `contestTransaction()`: Contest transactions in Hydra head
- `closeHydraHead()`: Close Hydra head and distribute funds
- `getHydraHeadStatus()`: Get Hydra head status

### 2. React Hook (`hooks/use-hydra.ts`)

Provides a simple React interface for Hydra integration:

```typescript
import { useHydra } from "@/hooks/use-hydra";

function MyComponent() {
  const hydra = useHydra({
    host: "localhost",
    port: 4000,
    networkId: 0, // Preprod
    autoRefreshInterval: 5000, // Refresh every 5 seconds
  });

  // Connect to Hydra head
  useEffect(() => {
    hydra.connect();
  }, [hydra]);

  // Submit transaction
  const handleSubmit = async () => {
    const txId = await hydra.submitTransaction(lucid, inputs, outputs);
  };

  return (
    <div>
      <p>Connected: {hydra.isConnected ? "Yes" : "No"}</p>
      <p>Status: {JSON.stringify(hydra.status)}</p>
    </div>
  );
}
```

### 3. Demo Component (`components/hydra/HydraDemo.tsx`)

A ready-to-use component demonstrating Hydra integration features.

## Usage Examples

### Setting Up a Hydra Head

1. Start a Hydra node:

```bash
hydra-node --port 4000 --api-port 4001 --ledger-genesis-byron config/genesis/byron.json
```

2. Initialize the Hydra head with participants

3. Use the React hook to connect:

```typescript
const hydra = useHydra({
  host: "localhost",
  port: 4000,
});

useEffect(() => {
  hydra.connect();
}, [hydra]);
```

### Committing UTxOs

```typescript
const handleCommit = async () => {
  if (wallet) {
    const utxos = await wallet.getUtxos();
    const commits = await hydra.commitUtxos(
      utxos.slice(0, 1),
      wallet as unknown as Wallet
    );
  }
};
```

### Submitting Transactions

```typescript
const handleSubmit = async () => {
  const txId = await hydra.submitTransaction(lucidInstance, inputs, [
    {
      address: recipientAddress,
      value: { lovelace: "1000000" },
    },
  ]);
};
```

## Session Management

Sessions are configured in `config/sessions/` with the following structure:

- **Operators**: Specific configurations per casino operator
- **Game Types**: Game-specific validation rules and schemas
- **Environments**: Environment-specific settings (dev, staging, prod)

Example session configuration:

```yaml
sessions:
  auto_close_after_hours: 24
  max_log_entries: 100000
  merkle_tree:
    algorithm: "sha256"
    encoding: "hex"
```

## Settlement Processing

Settlements are configured in `config/settlements/` with fee structures, network settings, and currency support.

Example settlement configuration:

```yaml
settlements:
  transaction:
    timeout_minutes: 30
    max_retries: 3
    confirmation_blocks: 6
```

## Security Considerations

1. **Private Keys**: Never expose private keys in client-side code
2. **Validation**: Always validate transactions before submission
3. **Contestation**: Implement proper contestation mechanisms for disputes
4. **Monitoring**: Monitor Hydra head status and participant behavior

## Troubleshooting

### Common Issues

1. **Connection Failed**: Ensure Hydra node is running and accessible
2. **Commit Failed**: Verify UTxOs are valid and not already spent
3. **Transaction Rejected**: Check transaction validity and funds availability

### Debugging

Enable debug logging by setting the appropriate log level in configuration files.

## Future Enhancements

1. **Multi-party Computation**: Enhanced privacy for sensitive data
2. **Automated Settlements**: Scheduled settlement processing
3. **Advanced Analytics**: Real-time monitoring and reporting
4. **Cross-chain Integration**: Support for other blockchain networks

## References

- [Hydra Head Protocol Documentation](https://hydra.family/head-protocol/)
- [Cardano Documentation](https://docs.cardano.org/)
- [Lucid Documentation](https://github.com/spacebudz/lucid)
