#!/bin/bash

# Script to run a Hydra node using Docker

# Check if Docker is available
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

echo "Starting Hydra node..."

# Run Hydra node in a Docker container
# This assumes you have a basic Hydra setup
docker run \
  -it \
  --name hydra-node \
  -p 4000:4000 \
  ghcr.io/input-output-hk/hydra-node:latest \
  --port 4000 \
  --api-port 4001 \
  --node-id 1 \
  --peer 127.0.0.1:5000 \
  --cardano-node-socket /ipc/node.socket \
  --ledger-genesis /config/genesis/byron.json \
  --ledger-protocol-parameters /config/protocol-parameters.json \
  --network-id 0

echo "Hydra node is running on port 4000"