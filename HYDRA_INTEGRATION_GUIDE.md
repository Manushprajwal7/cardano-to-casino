# Hydra Integration Guide

This guide explains how to use the Hydra integration components in your React application.

## Architecture Overview

The Hydra integration consists of:

1. **HydraProvider** - Context provider that manages Hydra state globally
2. **useHydra** - Custom hook for interacting with Hydra heads
3. **useHydraContext** - Hook to access Hydra context in components
4. **HydraStatusIndicator** - Component for displaying Hydra connection status

## Getting Started

The HydraProvider is already integrated into the application's Providers component, so Hydra functionality is available throughout the app.

## Using Hydra in Components

### 1. Accessing Hydra Context

To use Hydra in any component, import and use the `useHydraContext` hook:

```tsx
import { useHydraContext } from "@/components/hydra/hydra-provider";

export default function MyComponent() {
  const {
    isConnected,
    isReady,
    status,
    error,
    connect,
    submitTransaction,
    commitUtxos,
    contest,
    close,
    refreshStatus,
  } = useHydraContext();

  // Use the Hydra functions and state as needed
}
```

### 2. Displaying Hydra Status

Use the `HydraStatusIndicator` component to show Hydra connection status:

```tsx
import { HydraStatusIndicator } from "@/components/hydra/hydra-status-indicator";

export default function MyComponent() {
  return (
    <div>
      <HydraStatusIndicator />
      {/* Shows: Hydra: Connected */}

      <HydraStatusIndicator showLabels={false} />
      {/* Shows only the badge without "Hydra:" label */}
    </div>
  );
}
```

## Available Functions

### connect()

Initialize connection to the Hydra head.

### submitTransaction(lucid, inputs, outputs, options)

Submit a transaction to the Hydra head.

### commitUtxos(utxos, wallet)

Commit UTxOs to the Hydra head.

### contest(transaction, wallet)

Contest a transaction in the Hydra head.

### close()

Close the Hydra head and commit to L1.

### refreshStatus()

Manually refresh the Hydra head status.

## Configuration

The Hydra integration is configured with the following defaults:

- Host: localhost
- Port: 4000
- Network ID: 0 (Preprod)
- Auto-refresh interval: 5000ms

These can be customized in the `HydraProvider` component.

## Example Implementation

See the `/sessions` and `/settlements` pages for examples of how Hydra is integrated into real components.
