@echo off
setlocal

REM Script to run the mock Hydra server for development

echo Starting mock Hydra server...
echo The server will run on port 4000
echo Press Ctrl+C to stop the server
echo.

node scripts/mock-hydra-server.js

echo.
echo Mock Hydra server stopped