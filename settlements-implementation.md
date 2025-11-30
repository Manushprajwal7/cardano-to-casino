# Settlements Page Implementation

## Overview

This document describes the implementation of the Settlements page with Merkle Proof Engine and Lucid Metadata Reader. The implementation includes both backend API routes and frontend UI components for managing and verifying settlement sessions.

## Backend Implementation

### API Routes

#### 1. Settlements Listing

- **Endpoint**: `GET /api/settlements`
- **Description**: Returns a list of all settlements
- **Response**: Array of settlement objects with metadata

#### 2. Individual Settlement Operations

- **Endpoint**: `GET /api/settlements/[id]`
- **Description**: Retrieves detailed information about a specific settlement
- **Response**: Settlement object with metadata, Merkle root, and IPFS CID

- **Endpoint**: `POST /api/settlements/[id]`
- **Description**: Performs various actions on a settlement based on the action parameter
- **Actions**:
  - `recompute`: Recompute Merkle tree from IPFS data
  - `generate-proof`: Generate Merkle proof for a specific leaf
  - `attach-signature`: Attach operator signature to settlement
  - `verify-onchain`: Verify Merkle root against on-chain data

### Merkle Tree Implementation

#### Hashing Functions

- **Leaf Hash**: `sha256(0x00 || canonicalized_payload)`
- **Node Hash**: `sha256(0x01 || left_node || right_node)`
- **Canonicalization**: Deterministic JSON key sorting and whitespace removal

#### Tree Construction

- For odd number of nodes, duplicate the rightmost node
- Store proofs as array of `{hash, position: 'left' | 'right'}` from leaf to root
- Cache computed Merkle roots and proofs for performance

### On-chain Verification

#### Blockfrost Integration

- Direct API calls to Blockfrost service
- Fetch transaction metadata using transaction hash
- Extract Merkle root from metadata label (commonly label 674 or 721)
- Compare on-chain root with database root

#### Verification Process

1. User clicks "Verify Against On-Chain"
2. Frontend calls GET `/api/settlements/:id` to ensure Merkle root exists
3. Call POST `/api/settlements/:id/verify-onchain` with transaction hash
4. Server uses Blockfrost to read transaction metadata
5. Extract on-chain Merkle root and compare with database root
6. Return verification result with block information

## Frontend Implementation

### Main Settlements Page

- **Route**: `/settlements`
- **Components**:
  - Settlements table with filtering capabilities
  - Search functionality
  - Status badges for quick visual identification
  - Action buttons for viewing details

### Settlement Details Page

- **Route**: `/settlements/[id]`
- **Components**:

#### Session Summary Card

- Displays session ID, operator, timestamp, status
- Shows Merkle root with copy button
- IPFS CID with link to gateway
- Transaction hash with link to Blockfrost explorer

#### Log Viewer

- Collapsible list of session events
- Shows timestamp, event type, and raw payload
- Download JSON button

#### Merkle Tree Visualizer

- Graphical representation of Merkle tree
- Clickable nodes to expand/collapse
- Copy buttons for hashes
- Recompute Merkle root button

#### Proof Inspector/Generator

- Input for leaf index
- Display of leaf hash, proof array, and computed Merkle root
- Verify Against On-Chain button
- Verification result display (success/failure)

#### Actions

- Recompute Merkle Root
- Attach Operator Signature
- Mark Session as Verified
- View Raw Metadata

## Security Considerations

- Auth-guarded endpoints (would be role-based in production)
- Input validation for all API parameters
- Size limits on IPFS payload (1MB maximum)
- Error handling for API failures

## Performance Optimizations

- Caching of computed Merkle roots and proofs
- Lazy loading of session data
- Efficient tree construction algorithms
- Minimal data transfer through API endpoints

## Future Improvements

- Integration with Lucid library for more advanced Cardano interactions
- Real IPFS integration for production use
- Database storage instead of in-memory storage
- Enhanced error handling and logging
- Additional metadata validation
