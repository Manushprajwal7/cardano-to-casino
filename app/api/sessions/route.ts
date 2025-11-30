import { NextRequest } from "next/server";
import { createHash } from "crypto";
import {
  uploadToIPFS,
  isIPFSConfigured,
  getIPFSGatewayURL,
} from "@/lib/ipfs-service";

// In-memory storage for sessions (in production, this would be a database)
export const sessionsStorage = new Map();

// Initialize with mock data
if (sessionsStorage.size === 0) {
  // Add mock sessions to storage
  const mockSessions = [
    {
      sessionId: "SESS-0001",
      cid: "QmXkf7CJcJd8hQ9Y1Z2vKp7n5X4m8sK2p1qL9nR3tY6uW1",
      timestamp: "2024-01-15T10:30:00Z",
      sessionHash:
        "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
      merkleRoot:
        "0x5a8bc3d9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f67890",
      proofStore: {},
      operatorSignature: null,
      uploadedBy: "user",
      status: "settled",
      txHash: "tx1abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
      playerWallet:
        "addr1q8vwxyzzabcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvw",
      gameType: "blackjack",
      amount: "100 ADA",
      result: "win",
      signature: null,
    },
    {
      sessionId: "SESS-0002",
      cid: "QmYkg8B9DcFe1H3j4K5L6M7N8O9P0qR1sT2uV3wX4yZ5a2",
      timestamp: "2024-01-15T11:00:00Z",
      sessionHash:
        "f0e9d8c7b6a594837261504321fedcba09876543210987654321098765432109",
      merkleRoot:
        "0x2f4ea1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
      proofStore: {},
      operatorSignature: null,
      uploadedBy: "user",
      status: "closed",
      txHash: "tx2bcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
      playerWallet:
        "addr1q9abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwx",
      gameType: "roulette",
      amount: "50 ADA",
      result: "lose",
      signature: null,
    },
    {
      sessionId: "SESS-0003",
      cid: "QmZlh9C0D1E2F3G4H5I6J7K8L9M0n1o2p3q4r5s6t7u8v9w0x1y2z3",
      timestamp: "2024-01-15T09:15:00Z",
      sessionHash:
        "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      merkleRoot:
        "0x9c1de7f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
      proofStore: {},
      operatorSignature: null,
      uploadedBy: "user",
      status: "open",
      txHash: null,
      playerWallet:
        "addr1qaabcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwx",
      gameType: "poker",
      amount: "200 ADA",
      result: "open",
      signature: null,
    },
  ];

  mockSessions.forEach((session) => {
    sessionsStorage.set(session.sessionId, session);
  });
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
  proofs: Map<number, { hash: string; position: "left" | "right" }[]>;
} {
  if (leaves.length === 0) {
    throw new Error("Cannot build Merkle tree with zero leaves");
  }

  if (leaves.length === 1) {
    const proofs = new Map();
    proofs.set(0, []);
    return { root: leaves[0], proofs };
  }

  let currentLevel = [...leaves];
  const proofMap = new Map<
    number,
    { hash: string; position: "left" | "right" }[]
  >();

  // Initialize proof arrays for each leaf
  for (let i = 0; i < leaves.length; i++) {
    proofMap.set(i, []);
  }

  let levelIndex = 0;
  const treeLevels: string[][] = [currentLevel];

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    const indicesInNextLevel: number[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right =
        i + 1 < currentLevel.length ? currentLevel[i + 1] : currentLevel[i]; // Duplicate if odd

      const parent = computeNodeHash(left, right);
      nextLevel.push(parent);
      indicesInNextLevel.push(Math.floor(i / 2));

      // Update proofs for leaves in the current level
      // Find which original leaves are affected by this node
      const leavesInSubtree = Math.pow(2, levelIndex + 1);
      const startIndex = Math.floor(i / leavesInSubtree) * leavesInSubtree;

      for (
        let j = 0;
        j < leavesInSubtree && startIndex + j < leaves.length;
        j++
      ) {
        const leafIndex = startIndex + j;
        if (leafIndex < leaves.length) {
          const isInLeftHalf = j < leavesInSubtree / 2;
          if ((isInLeftHalf && i + 1 < currentLevel.length) || !isInLeftHalf) {
            const proof = proofMap.get(leafIndex);
            if (proof) {
              if (isInLeftHalf) {
                proof.push({ hash: right, position: "right" });
              } else {
                proof.push({ hash: left, position: "left" });
              }
            }
          }
        }
      }
    }

    treeLevels.push(nextLevel);
    currentLevel = nextLevel;
    levelIndex++;
  }

  return { root: currentLevel[0], proofs: proofMap };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.sessionId || !body.payload) {
      return Response.json(
        { error: "Missing required fields: sessionId and payload" },
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
    const sessionHash = createHash("sha256").update(payloadStr).digest("hex");

    let cid = "";

    // Upload to IPFS if configured
    if (isIPFSConfigured()) {
      try {
        cid = await uploadToIPFS(payloadStr, {
          pinataMetadata: {
            name: `session-${body.sessionId}`,
            keyvalues: {
              sessionId: body.sessionId,
              timestamp: new Date().toISOString(),
              playerWallet: body.playerWallet || "unknown",
              gameType: body.gameType || "unknown",
            },
          },
        });
      } catch (error) {
        console.error("IPFS upload error:", error);
        // Continue with mock CID if IPFS upload fails
        cid = `Qm${sessionHash.substring(0, 44)}`;
      }
    } else {
      // Generate mock CID if IPFS is not configured
      cid = `Qm${sessionHash.substring(0, 44)}`;
    }

    // Store session metadata
    const sessionData = {
      sessionId: body.sessionId,
      cid: cid,
      timestamp: new Date().toISOString(),
      sessionHash: sessionHash,
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
    sessionsStorage.set(body.sessionId, sessionData);

    return Response.json(sessionData);
  } catch (error) {
    console.error("Session upload error:", error);
    return Response.json(
      { error: "Failed to process session upload" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all sessions (limited to 50 for pagination)
    const sessions = Array.from(sessionsStorage.values()).slice(0, 50);

    return Response.json({
      sessions: sessions,
      total: sessionsStorage.size,
      page: 1,
      pageSize: 50,
    });
  } catch (error) {
    console.error("Session listing error:", error);
    return Response.json(
      { error: "Failed to retrieve sessions" },
      { status: 500 }
    );
  }
}
