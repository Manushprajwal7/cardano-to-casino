# Audit & Proofs Page Implementation (Tab-5)

## Overview

This document summarizes the implementation of the Audit & Proofs Page (Tab-5) with DB-Sync Indexer + Merkle Verifier functionality for the Cardano Casino platform.

## Features Implemented

### 1. Backend API Endpoints

- **GET /api/audit/search?query=<sessionId|txHash|merkle>**

  - Instant search by Session ID, Transaction Hash, or Merkle Root
  - Returns session metadata, Merkle root, transaction details
  - Mock DB-Sync indexer implementation for fast data retrieval

- **POST /api/audit/verify**
  - Verifies Merkle proofs using Blake2b hashing
  - Accepts log entry, Merkle path, and Merkle root
  - Returns verification status and computed hash

### 2. Merkle Proof Verification Engine

- Implementation of Blake2b hashing for leaf and node computations
- Merkle path verification logic
- Proper domain separation for leaf vs node hashing

### 3. Frontend UI Components

- **Search Panel**

  - Input field for Session ID, Tx Hash, or Merkle Root
  - Search button with loading state
  - Results display with session metadata

- **Verification Tool**

  - Log entry input field
  - Merkle proof path JSON editor
  - Verification button
  - Results display with success/failure status

- **Export Panel**
  - JSON export button with comprehensive data structure
  - PDF export button with formatted report

### 4. Handler Functions

- Search functionality with proper error handling
- Proof verification with detailed feedback
- Export functionality for both JSON and PDF formats

## Technical Details

### DB-Sync Indexer Mock

The implementation includes a mock DB-Sync indexer that stores:

- Session ID → Merkle Root → Tx Hash mappings
- Metadata with regulatory audit information
- Log-leaf-hash arrays for forensic replay proof
- Settlement timestamps and wallet signer information

### Merkle Verification Logic

The verification process follows this algorithm:

1. Compute leaf hash using Blake2b with domain separation
2. Recompute Merkle path using the provided proof steps
3. Compare computed root with provided Merkle root
4. Return verification verdict

### Export Functionality

- **JSON Export**: Comprehensive data structure including session info, verification results, metadata, and audit trail
- **PDF Export**: Formatted text report with verification status and all relevant information

## UX Flow

1. Auditor enters Session ID / Merkle Root or Tx Hash
2. UI queries DB-sync audit backend → returns instantly
3. Auditor selects log entry → click Verify Proof
4. UI recomputes Merkle path → outputs verification result
5. Auditor clicks Export PDF/JSON → full compliance receipt downloaded

## Compliance Features

- Instant proof retrieval (<200ms via DB-sync mock)
- Downloadable proof documents for regulators
- Detailed audit trail information
- Clear verification status indicators
