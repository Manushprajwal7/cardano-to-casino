import { NextRequest } from "next/server";
import { createHash } from "crypto";
import {
  uploadToIPFS,
  isIPFSConfigured,
  getIPFSGatewayURL,
} from "@/lib/ipfs-service";

// In-memory storage for settlements (in production, this would be a database)
export const settlementsStorage = new Map();

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

// Helper function to compute leaf hash
function computeLeafHash(payload: any): string {
  const canonicalPayload = canonicalizeJSON(payload);
  const payloadBuffer = Buffer.from(canonicalPayload, "utf8");
  const prefixedPayload = Buffer.concat([
    Buffer.from([0x00]), // Domain separation byte for leaf
    payloadBuffer,
  ]);
  return createHash("sha256").update(prefixedPayload).digest("hex");
}

// Helper function to compute node hash
function computeNodeHash(left: string, right: string): string {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  const concatenated = Buffer.concat([
    Buffer.from([0x01]), // Domain separation byte for node
    leftBuffer,
    rightBuffer,
  ]);
  return createHash("sha256").update(concatenated).digest("hex");
}

// Helper function to build Merkle tree
function buildMerkleTree(leaves: string[]): {
  root: string;
  proofs: Record<number, { hash: string; position: "left" | "right" }[]>;
} {
  if (leaves.length === 0) {
    throw new Error("Cannot build Merkle tree with zero leaves");
  }

  if (leaves.length === 1) {
    return { root: leaves[0], proofs: { 0: [] } };
  }

  let currentLevel = [...leaves];
  const proofMap: Record<
    number,
    { hash: string; position: "left" | "right" }[]
  > = {};

  // Initialize proof arrays for each leaf
  for (let i = 0; i < leaves.length; i++) {
    proofMap[i] = [];
  }

  const treeLevels: string[][] = [currentLevel];

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right =
        i + 1 < currentLevel.length ? currentLevel[i + 1] : currentLevel[i]; // Duplicate if odd

      const parent = computeNodeHash(left, right);
      nextLevel.push(parent);

      // Update proofs for all leaves
      for (let j = 0; j < treeLevels[0].length; j++) {
        // Determine if this leaf needs this node in its proof
        const leafIndex = j;
        const currentNodeIndex = Math.floor(i / 2);
        const levelSize = currentLevel.length;

        // Check if this leaf needs the sibling of the current node in its proof
        const siblingIndex = i % 2 === 0 ? i + 1 : i - 1;
        const siblingExists = siblingIndex < currentLevel.length;

        if (siblingExists) {
          const siblingHash = currentLevel[siblingIndex];
          const position = i % 2 === 0 ? "right" : "left";

          // Check if this leaf is in the subtree that needs this proof element
          const subtreeSize = Math.pow(2, treeLevels.length);
          const subtreeStartIndex =
            Math.floor(leafIndex / subtreeSize) * subtreeSize;

          if (
            leafIndex >= subtreeStartIndex &&
            leafIndex < subtreeStartIndex + subtreeSize
          ) {
            proofMap[leafIndex].push({ hash: siblingHash, position });
          }
        }
      }
    }

    treeLevels.push(nextLevel);
    currentLevel = nextLevel;
  }

  // Convert proofs to the correct format
  const finalProofs: Record<
    number,
    { hash: string; position: "left" | "right" }[]
  > = {};
  for (let i = 0; i < leaves.length; i++) {
    finalProofs[i] = proofMap[i];
  }

  return { root: currentLevel[0], proofs: finalProofs };
}

// Mock function to fetch settlement data from IPFS
async function fetchSettlementDataFromIPFS(cid: string): Promise<any> {
  // In a real implementation, this would fetch from IPFS
  // For now, we'll return mock data
  return {
    settlementId: "SETT-0001",
    events: [
      {
        timestamp: "2024-01-15T10:30:00Z",
        eventType: "SETTLEMENT_START",
        payload: { settlementId: "SETT-0001", playerId: "player-456" },
      },
      {
        timestamp: "2024-01-15T10:30:05Z",
        eventType: "AMOUNT_CALCULATED",
        payload: { amount: "150.50 ADA", currency: "ADA" },
      },
      {
        timestamp: "2024-01-15T10:30:10Z",
        eventType: "TX_SUBMITTED",
        payload: {
          txHash:
            "7f192ffa95992f888b06353688ab9b1df32be4ede5c6476bc86a8369ee640b13",
        },
      },
      {
        timestamp: "2024-01-15T10:30:15Z",
        eventType: "TX_CONFIRMED",
        payload: { blockHeight: 123456, confirmations: 12 },
      },
      {
        timestamp: "2024-01-15T10:30:20Z",
        eventType: "SETTLEMENT_COMPLETED",
        payload: { status: "completed", finalAmount: "150.50 ADA" },
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.settlementId || !body.payload) {
      return Response.json(
        { error: "Missing required fields: settlementId and payload" },
        { status: 400 }
      );
    }

    // Ensure payload is not too large (> 1MB)
    const payloadStr = JSON.stringify(body.payload);
    const payloadSize = Buffer.byteLength(payloadStr, "utf8");
    if (payloadSize > 1024 * 1024) {
      // 1MB limit
      return Response.json(
        { error: "Payload too large. Maximum size is 1MB" },
        { status: 413 }
      );
    }

    // Hash the payload for integrity
    const settlementHash = createHash("sha256")
      .update(payloadStr)
      .digest("hex");

    let cid = "";

    // Upload to IPFS if configured
    if (isIPFSConfigured()) {
      try {
        cid = await uploadToIPFS(payloadStr, {
          pinataMetadata: {
            name: `settlement-${body.settlementId}`,
            keyvalues: {
              settlementId: body.settlementId,
              timestamp: new Date().toISOString(),
              playerWallet: body.playerWallet || "unknown",
              gameType: body.gameType || "unknown",
            },
          },
        });
      } catch (error) {
        console.error("IPFS upload error:", error);
        // Continue with mock CID if IPFS upload fails
        cid = `Qm${settlementHash.substring(0, 44)}`;
      }
    } else {
      // Generate mock CID if IPFS is not configured
      cid = `Qm${settlementHash.substring(0, 44)}`;
    }

    // Store settlement metadata
    const settlementData = {
      settlementId: body.settlementId,
      cid: cid,
      timestamp: new Date().toISOString(),
      settlementHash: settlementHash,
      merkleRoot: null, // Will be computed later
      proofStore: {}, // Will store proofs later
      operatorSignature: null,
      uploadedBy: "user", // Would come from auth in real implementation
      status: "uploaded",
      txHash: body.txHash || null,
      playerWallet: body.playerWallet || "unknown",
      gameType: body.gameType || "unknown",
      amount: body.amount || "0",
      result: body.result || "unknown",
      signature: body.signature || null,
    };

    // Save to storage (in production, this would be a database)
    settlementsStorage.set(body.settlementId, settlementData);

    return Response.json(settlementData);
  } catch (error) {
    console.error("Settlement upload error:", error);
    return Response.json(
      { error: "Failed to process settlement upload" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all settlements (limited to 50 for pagination)
    const settlements = Array.from(settlementsStorage.values()).slice(0, 50);

    return Response.json({
      settlements: settlements,
      total: settlementsStorage.size,
      page: 1,
      pageSize: 50,
    });
  } catch (error) {
    console.error("Settlement listing error:", error);
    return Response.json(
      { error: "Failed to retrieve settlements" },
      { status: 500 }
    );
  }
}

// For simplicity, we're using an in-memory store
// In a real implementation, you would use a database
// We'll initialize with some mock data for demonstration
if (settlementsStorage.size === 0) {
  settlementsStorage.set("SETT-0001", {
    settlementId: "SETT-0001",
    cid: "QmXkf7CJcJd8hQ9Y1Z2vKp7n5X4m8sK2p1qL9nR3tY6uW1",
    timestamp: "2024-01-15T10:30:00Z",
    settlementHash:
      "a1b2c3d4e5f67890123456789012345678901234567890123456789012345678",
    merkleRoot: null,
    proofStore: {},
    operatorSignature: null,
    uploadedBy: "operator-1",
    status: "completed",
    txHash: "7f192ffa95992f888b06353688ab9b1df32be4ede5c6476bc86a8369ee640b13",
    playerWallet: "addr1q8...xyz",
    gameType: "blackjack",
    amount: "150.50",
    result: "completed",
    signature: null,
  });

  settlementsStorage.set("SETT-0002", {
    settlementId: "SETT-0002",
    cid: "QmYkg8B9DcFe1H3j4K5L6M7N8O9P0qR1sT2uV3wX4yZ5a2",
    timestamp: "2024-01-15T11:00:00Z",
    settlementHash:
      "b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
    merkleRoot: null,
    proofStore: {},
    operatorSignature: null,
    uploadedBy: "operator-2",
    status: "pending",
    txHash: null,
    playerWallet: "addr1q9...abc",
    gameType: "roulette",
    amount: "75.25",
    result: "pending",
    signature: null,
  });
}
