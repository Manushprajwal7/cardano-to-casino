# Hydra Setup and Running Instructions

This document explains how to set up and run a Hydra node for your Cardano Casino application.

## Prerequisites

1. Node.js installed
2. Docker Desktop (optional, for running official Hydra node)

## Running Hydra Node

### Option 1: Using Mock Hydra Server (Development)

For development purposes, you can use the mock Hydra server:

```cmd
node scripts/mock-hydra-server.js
```

This will start a mock server on port 4000 that simulates Hydra node behavior.

### Option 2: Using Docker (Production)

If you have Docker properly configured:

```cmd
docker run -it --name hydra-node -p 4000:4000 ghcr.io/input-output-hk/hydra-node:latest --port 4000 --api-port 4001 --node-id 1 --peer 127.0.0.1:5000 --cardano-node-socket /ipc/node.socket --ledger-genesis /config/genesis/byron.json --ledger-protocol-parameters /config/protocol-parameters.json --network-id 0
```

## Configuration

The Hydra node will run on:

- WebSocket port: 4000
- API port: 4001

These ports match the default configuration used in your React components.

## Connecting to Hydra

Once the Hydra node is running, your React application should automatically connect to it since the integration is already set up to use localhost:4000.

## Troubleshooting

1. If you get connection errors, make sure:

   - The Hydra node is running
   - Ports 4000 and 4001 are not blocked by firewall
   - No other process is using these ports

2. If you need to stop the mock server, press Ctrl+C in the terminal

3. To view logs from the mock server, check the terminal where it's running

4. For Docker:

   ```cmd
   docker stop hydra-node
   docker rm hydra-node
   ```

5. To view Docker logs:
   ```cmd
   docker logs hydra-node
   ```
