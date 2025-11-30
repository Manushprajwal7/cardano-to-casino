import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { settlementsStorage } from "../settlements/route";

// Simple Blake2b implementation for demo purposes
// In production, you would use a proper Blake2b library
function blake2b(data: Buffer): Buffer {
  // For demo purposes, we'll use SHA256 as a substitute
  // In a real implementation, you would use a proper Blake2b library
  return createHash("sha256").update(data).digest();
}

// Helper function to canonicalize JSON
function canonicalizeJSON(obj: any): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalizeJSON).join(",") + "]";
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(
    (key) => JSON.stringify(key) + ":" + canonicalizeJSON(obj[key])
  );

  return "{" + pairs.join(",") + "}";
}

// Helper function to compute leaf hash (Blake2b)
function computeLeafHash(payload: any): string {
  const canonicalPayload = canonicalizeJSON(payload);
  const payloadBuffer = Buffer.from(canonicalPayload, "utf8");
  const prefixedPayload = Buffer.concat([
    Buffer.from([0x00]), // Domain separation byte for leaf
    payloadBuffer,
  ]);
  return blake2b(prefixedPayload).toString("hex");
}

// Helper function to compute node hash (Blake2b)
function computeNodeHash(left: string, right: string): string {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  const concatenated = Buffer.concat([
    Buffer.from([0x01]), // Domain separation byte for node
    leftBuffer,
    rightBuffer,
  ]);
  return blake2b(concatenated).toString("hex");
}

// Mock proof cache database (in production, this would be a real database)
const proofCacheDB = new Map();

// Initialize with some mock data
if (proofCacheDB.size === 0) {
  // Mock proof data for demonstration
  proofCacheDB.set("0xf3c4a5b2e1d9c8f4a7b6e2d1c9f8a7b6c5d4e3f2", {
    sessionId: "SES-001",
    merkleRoot: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
    txHash: "7f192ffa95992f888b06353688ab9b1df32be4ede5c6476bc86a8369ee640b13",
    logEntries: [
      {
        id: 1,
        hash: "0xf3c4a5b2e1d9c8f4a7b6e2d1c9f8a7b6c5d4e3f2",
        data: "Game event: Player bet 10 ADA",
      },
      {
        id: 2,
        hash: "0xa1b2c3d4e5f67890123456789012345678901234",
        data: "Game event: Player won 15 ADA",
      },
    ],
  });
}

// Mock DB-Sync indexer data (in production, this would connect to a real DB-Sync instance)
const dbSyncData = new Map();

// Initialize with some mock data
if (dbSyncData.size === 0) {
  // Add more realistic mock data
  dbSyncData.set("SES-001", {
    sessionId: "SES-001",
    merkleRoot: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
    txHash: "7f192ffa95992f888b06353688ab9b1df32be4ede5c6476bc86a8369ee640b13",
    timestamp: "2024-01-15T10:30:00Z",
    walletSigner: "addr1q8f7y5k2v3x9z6n4m1p0l2k3j4h5g6f7d8s9a0",
    metadata: {
      "674": {
        msg: ["Session completion for SES-001"],
      },
      "721": {
        sessionId: "SES-001",
        gameType: "blackjack",
        playerWallet: "addr1q8...xyz",
        amount: "150.50 ADA",
        operator: "Casino A",
        settlementTimestamp: "2024-01-15T10:30:00Z",
      },
    },
  });

  dbSyncData.set(
    "7f192ffa95992f888b06353688ab9b1df32be4ede5c6476bc86a8369ee640b13",
    {
      txHash:
        "7f192ffa95992f888b06353688ab9b1df32be4ede5c6476bc86a8369ee640b13",
      sessionId: "SES-001",
      merkleRoot: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
      timestamp: "2024-01-15T10:30:00Z",
      walletSigner: "addr1q8f7y5k2v3x9z6n4m1p0l2k3j4h5g6f7d8s9a0",
      metadata: {
        "674": {
          msg: ["Session completion for SES-001"],
        },
        "721": {
          sessionId: "SES-001",
          gameType: "blackjack",
          playerWallet: "addr1q8...xyz",
          amount: "150.50 ADA",
          operator: "Casino A",
          settlementTimestamp: "2024-01-15T10:30:00Z",
        },
      },
    }
  );

  dbSyncData.set("0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", {
    merkleRoot: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
    sessionId: "SES-001",
    txHash: "7f192ffa95992f888b06353688ab9b1df32be4ede5c6476bc86a8369ee640b13",
    timestamp: "2024-01-15T10:30:00Z",
    walletSigner: "addr1q8f7y5k2v3x9z6n4m1p0l2k3j4h5g6f7d8s9a0",
    logEntries: [
      {
        id: 1,
        hash: "0xf3c4a5b2e1d9c8f4a7b6e2d1c9f8a7b6c5d4e3f2",
        data: "Game event: Player bet 10 ADA",
      },
      {
        id: 2,
        hash: "0xa1b2c3d4e5f67890123456789012345678901234",
        data: "Game event: Player won 15 ADA",
      },
    ],
  });

  // Add more mock data for different sessions
  dbSyncData.set("SES-002", {
    sessionId: "SES-002",
    merkleRoot: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1",
    txHash: "a1b2c3d4e5f67890123456789012345678901234567890123456789012345678",
    timestamp: "2024-01-15T11:45:00Z",
    walletSigner: "addr1q9g8h7j6k5l4m3n2o1p0q9r8s7t6u5v4w3x2y1",
    metadata: {
      "674": {
        msg: ["Session completion for SES-002"],
      },
      "721": {
        sessionId: "SES-002",
        gameType: "roulette",
        playerWallet: "addr1q9...abc",
        amount: "75.25 ADA",
        operator: "Casino B",
        settlementTimestamp: "2024-01-15T11:45:00Z",
      },
    },
  });

  dbSyncData.set("SES-003", {
    sessionId: "SES-003",
    merkleRoot: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
    txHash: "b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
    timestamp: "2024-01-15T12:30:00Z",
    walletSigner: "addr1q0p9o8i7u6y5t4r3e2w1q0p9o8i7u6y5t4r3e2",
    metadata: {
      "674": {
        msg: ["Session completion for SES-003"],
      },
      "721": {
        sessionId: "SES-003",
        gameType: "slots",
        playerWallet: "addr1q0...def",
        amount: "200.00 ADA",
        operator: "Casino C",
        settlementTimestamp: "2024-01-15T12:30:00Z",
      },
    },
  });
}

// GET /api/audit/search?query=<sessionId|txHash|merkle>
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return Response.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Search in DB-Sync data
    let result = null;

    // Check if query matches any key in our mock DB
    if (dbSyncData.has(query)) {
      result = dbSyncData.get(query);
    } else {
      // Search through all entries for partial matches
      for (const [key, value] of dbSyncData.entries()) {
        if (
          value.sessionId === query ||
          value.txHash === query ||
          value.merkleRoot === query
        ) {
          result = value;
          break;
        }
      }
    }

    if (!result) {
      return Response.json(
        { error: "No matching settlement found" },
        { status: 404 }
      );
    }

    // Add additional audit information
    const auditResult = {
      ...result,
      verified: true, // In a real implementation, this would be determined by checking the proof
      auditTrail: [
        {
          action: "Session Completed",
          timestamp: result.timestamp,
          actor: "System",
        },
        {
          action: "Merkle Root Computed",
          timestamp: result.timestamp,
          actor: "System",
        },
        {
          action: "Transaction Submitted",
          timestamp: result.timestamp,
          actor: result.walletSigner,
        },
      ],
    };

    return Response.json(auditResult);
  } catch (error) {
    console.error("Audit search error:", error);
    return Response.json(
      { error: "Failed to search audit data" },
      { status: 500 }
    );
  }
}

// POST /api/audit/verify
// body: { logEntry, merklePath[], merkleRoot }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logEntry, merklePath, merkleRoot } = body;

    // Validate required fields
    if (!logEntry || !merklePath || !merkleRoot) {
      return Response.json(
        { error: "Missing required fields: logEntry, merklePath, merkleRoot" },
        { status: 400 }
      );
    }

    // Compute the leaf hash
    let hash = computeLeafHash(logEntry);

    // Recompute the Merkle path
    for (const step of merklePath) {
      if (step.direction === "left") {
        hash = computeNodeHash(step.sibling, hash);
      } else {
        hash = computeNodeHash(hash, step.sibling);
      }
    }

    // Compare the computed hash with the provided Merkle root
    const verified = hash === merkleRoot;

    return Response.json({
      verified,
      computedHash: hash,
      message: verified
        ? "On-chain proof is valid & untampered"
        : "Leaf hash or path mismatch = Fraud detected",
    });
  } catch (error) {
    console.error("Audit verification error:", error);
    return Response.json(
      { error: "Failed to verify audit proof" },
      { status: 500 }
    );
  }
}
