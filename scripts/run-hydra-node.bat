@echo off
setlocal

REM Script to run a Hydra node using Docker on Windows
REM Note: Requires Docker Desktop to be installed and running

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed or not in PATH. Please install Docker Desktop first.
    echo.
    echo For development, you can use the mock server instead:
    echo node scripts/mock-hydra-server.js
    exit /b 1
)

echo Starting Hydra node...
echo.

REM Run Hydra node in a Docker container
docker run ^
  -it ^
  --name hydra-node ^
  -p 4000:4000 ^
  ghcr.io/input-output-hk/hydra-node:latest ^
  --port 4000 ^
  --api-port 4001 ^
  --node-id 1 ^
  --peer 127.0.0.1:5000 ^
  --cardano-node-socket /ipc/node.socket ^
  --ledger-genesis /config/genesis/byron.json ^
  --ledger-protocol-parameters /config/protocol-parameters.json ^
  --network-id 0

echo.
echo Hydra node is running on port 4000