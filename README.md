# Cardano Casino Audit Platform

🏛 Cardano-to-Casino Auditing & Settlement Platform

A next-generation Next.js application designed to bring provable fairness, trust, and financial accountability to casinos using the Cardano blockchain.
By verifying casino sessions, generating cryptographic proofs, and executing secure settlements on Cardano. Each payout includes a 1% settlement fee, creating a transparent and scalable revenue stream. Fast audits, proof exports, and trust — powered end-to-end by Cardano.

## 🚀 Features

- **Session Management**: Track and manage casino gaming sessions.
- **Settlement Engine**: Build and execute batch settlements for multiple sessions.
- **Audit & Proofs**: Verify game integrity using Merkle Tree proofs and Blake2b hashing.
- **IPFS Integration**: Store and retrieve audit trails and metadata using Pinata or Infura.
- **Analytics Dashboard**: Real-time monitoring of settlement performance and treasury status.

## 🛠️ Cardano Tools & Implementation

This project leverages the following Cardano ecosystem tools:

### 1. Lucid Evolution (`@lucid-evolution/lucid`)
Used for advanced transaction building and submission.
- **Implementation**: `lib/lucid-utils.ts`
- **Key Functions**:
  - `initLucid()`: Initializes the Lucid instance with Blockfrost provider.
  - `buildSettlementTransaction()`: Constructs complex transactions with multiple outputs and metadata.
  - `submitTransaction()`: Signs and submits transactions to the network.
- **Note**: Implemented with dynamic imports to ensure compatibility with Next.js server-side rendering (avoiding WASM issues).

### 2. Blockfrost
Primary data provider for blockchain queries.
- **Implementation**: Integrated via Lucid and direct API calls in `app/api/blockfrost/*`.
- **Usage**: Fetching transaction history, protocol parameters, and asset information.

### 3. Mesh SDK (`@meshsdk/core`, `@meshsdk/react`)
Used for wallet connection and UI interactions.
- **Usage**: Provides React hooks and components for connecting user wallets (Nami, Eternal, etc.).

### 4. IPFS (Pinata & Infura)
Decentralized storage for audit logs and session metadata.
- **Implementation**: `lib/ipfs-service.ts`
- **Strategy**: Dual-provider setup with Pinata (JWT auth) as primary and Infura as fallback. Handles dynamic imports to support both browser and server environments.

## 📂 Folder Structure

```
├── app/                        # Next.js App Router
│   ├── api/                    # Backend API Routes
│   │   ├── audit/              # Audit verification endpoints
│   │   ├── blockfrost/         # Blockfrost proxy endpoints
│   │   ├── sessions/           # Session management APIs
│   │   └── settlements/        # Settlement builder APIs
│   ├── audit/                  # Audit & Proofs UI
│   ├── dashboard/              # Main Analytics Dashboard
│   ├── settlements/            # Settlement Management UI
│   └── ...                     # Other feature routes
├── components/                 # React UI Components
│   ├── ui/                     # Reusable UI elements (shadcn/ui)
│   └── ...                     # Feature-specific components
├── lib/                        # Core Utilities & Logic
│   ├── lucid-utils.ts          # Cardano transaction logic
│   ├── ipfs-service.ts         # IPFS storage service
│   ├── export-utils.ts         # Data export utilities
│   └── ...
├── public/                     # Static assets
└── ...
```

## 🚦 Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create a `.env` file with the following keys:
    ```env
    NEXT_PUBLIC_BLOCKFROST_API_KEY=your_key_here
    NEXT_PUBLIC_BLOCKFROST_URL=https://cardano-preview.blockfrost.io/api/v0
    PINATA_JWT=your_pinata_jwt
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```
    *Note: The build script is configured to use Webpack (`next build --webpack`) to ensure compatibility with custom WASM configurations.*
