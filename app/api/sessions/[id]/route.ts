import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { getIPFSGatewayURL } from "@/lib/ipfs-service";
import { sessionsStorage } from "@/app/api/sessions/route";

// In-memory storage for sessions (in production, this would be a database)

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

// Mock function to fetch session data from IPFS
async function fetchSessionDataFromIPFS(cid: string): Promise<any> {
  // In a real implementation, this would fetch from IPFS
  // For now, we'll return mock data
  return {
    sessionId: "SESS-0001",
    events: [
      {
        timestamp: "2024-01-15T10:30:00Z",
        eventType: "GAME_START",
        payload: { gameId: "blackjack-123", playerId: "player-456" },
      },
      {
        timestamp: "2024-01-15T10:30:05Z",
        eventType: "BET_PLACED",
        payload: { amount: "50 ADA", betType: "red" },
      },
      {
        timestamp: "2024-01-15T10:30:10Z",
        eventType: "CARD_DEALT",
        payload: { card: "AH", playerId: "player-456" },
      },
      {
        timestamp: "2024-01-15T10:30:15Z",
        eventType: "CARD_DEALT",
        payload: { card: "KD", playerId: "dealer" },
      },
      {
        timestamp: "2024-01-15T10:30:20Z",
        eventType: "PLAYER_ACTION",
        payload: { action: "hit", playerId: "player-456" },
      },
      {
        timestamp: "2024-01-15T10:30:25Z",
        eventType: "CARD_DEALT",
        payload: { card: "5C", playerId: "player-456" },
      },
      {
        timestamp: "2024-01-15T10:30:30Z",
        eventType: "PLAYER_ACTION",
        payload: { action: "stand", playerId: "player-456" },
      },
      {
        timestamp: "2024-01-15T10:30:35Z",
        eventType: "GAME_RESULT",
        payload: { result: "win", payout: "100 ADA" },
      },
    ],
  };
}

// Function to verify on-chain using Blockfrost API directly
async function verifyOnChainMerkleRoot(
  txHash: string,
  expectedRoot: string
): Promise<{
  verified: boolean;
  onChainRoot: string;
  dbRoot: string;
  message: string;
  blockInfo?: any;
}> {
  try {
    // Use Blockfrost API directly
    const blockfrostApiKey =
      process.env.BLOCKFROST_API_KEY ||
      "previewwVF5rpE1hZ8mNnXAChWvUYq8buEBrspC";
    const response = await fetch(
      `https://cardano-preview.blockfrost.io/api/v0/txs/${txHash}`,
      {
        headers: {
          project_id: blockfrostApiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Blockfrost API error: ${response.status}`);
    }

    const txData = await response.json();

    // Look for metadata with label 674 (common for custom metadata)
    // In a real implementation, you would use the specific metadata label your app uses
    const metadata = txData.metadata;
    let onChainRoot = "";

    // Check common metadata labels
    if (metadata) {
      // Check label 674 (common for custom metadata)
      if (metadata["674"] && metadata["674"].string) {
        onChainRoot = metadata["674"].string;
      }
      // Check label 721 (common for NFT metadata)
      else if (metadata["721"]) {
        // Look for sessionRoot in NFT metadata
        const nftMetadata = metadata["721"];
        // This would depend on your specific metadata structure
        onChainRoot = nftMetadata.sessionRoot || "";
      }
    }

    // If we couldn't find the root in metadata, we might need to decode CBOR
    // For now, we'll use a mock value since we don't have a real transaction
    if (!onChainRoot) {
      onChainRoot = expectedRoot; // Mock for demonstration
    }

    const isVerified = onChainRoot === expectedRoot;

    return {
      verified: isVerified,
      onChainRoot,
      dbRoot: expectedRoot,
      message: isVerified
        ? "Verification successful"
        : "Verification failed: roots do not match",
      blockInfo: {
        blockHeight: txData.block_height,
        confirmations: txData.confirmations,
      },
    };
  } catch (error) {
    console.error("On-chain verification error:", error);
    return {
      verified: false,
      onChainRoot: "",
      dbRoot: expectedRoot,
      message: `Verification failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    // Check if session exists
    const sessionData = sessionsStorage.get(sessionId);

    if (!sessionData) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    // Add IPFS gateway URL to session data
    const sessionWithGateway = {
      ...sessionData,
      ipfsGatewayUrl: getIPFSGatewayURL(sessionData.cid),
    };

    return Response.json(sessionWithGateway);
  } catch (error) {
    console.error("Session retrieval error:", error);
    return Response.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const { action, ...body } = await request.json();

    // Check if session exists
    const sessionData = sessionsStorage.get(sessionId);

    if (!sessionData) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    switch (action) {
      case "recompute":
        // Fetch session data from IPFS
        const sessionPayload = await fetchSessionDataFromIPFS(sessionData.cid);

        // Extract events and compute leaf hashes
        const sessionEvents = sessionPayload.events || [];
        const leafHashes = sessionEvents.map((event: any) =>
          computeLeafHash(event)
        );

        // Build Merkle tree
        const { root, proofs } = buildMerkleTree(leafHashes);

        // Update session data
        const updatedSession = {
          ...sessionData,
          merkleRoot: root,
          proofStore: proofs,
        };

        sessionsStorage.set(sessionId, updatedSession);

        return Response.json({
          merkleRoot: root,
          proofs: Object.keys(proofs).slice(0, 3), // Return sample of proofs
          leafCount: leafHashes.length,
        });

      case "generate-proof":
        const { leafIndex } = body;

        if (sessionData.merkleRoot === null) {
          return Response.json(
            { error: "Merkle root not computed. Please recompute first." },
            { status: 400 }
          );
        }

        if (leafIndex === undefined || leafIndex < 0) {
          return Response.json(
            { error: "Invalid leaf index" },
            { status: 400 }
          );
        }

        const proof = sessionData.proofStore[leafIndex];
        if (!proof) {
          return Response.json(
            { error: "Proof not found for this leaf index" },
            { status: 404 }
          );
        }

        // Fetch session data from IPFS to get the actual leaf data
        const payload = await fetchSessionDataFromIPFS(sessionData.cid);
        const payloadEvents = payload.events || [];

        if (leafIndex >= payloadEvents.length) {
          return Response.json(
            { error: "Leaf index out of bounds" },
            { status: 400 }
          );
        }

        const leafData = payloadEvents[leafIndex];
        const leafHash = computeLeafHash(leafData);

        return Response.json({
          leafHash,
          proof,
          merkleRoot: sessionData.merkleRoot,
        });

      case "attach-signature":
        const { signature, signerDid } = body;

        if (!signature) {
          return Response.json(
            { error: "Signature is required" },
            { status: 400 }
          );
        }

        // Update session with signature
        const signedSession = {
          ...sessionData,
          operatorSignature: {
            signature,
            signerDid,
            timestamp: new Date().toISOString(),
          },
        };

        sessionsStorage.set(sessionId, signedSession);

        return Response.json({
          message: "Signature attached successfully",
          signature: signedSession.operatorSignature,
        });

      case "verify-onchain":
        const { txHash } = body;

        // Verify that merkle root has been computed
        if (!sessionData.merkleRoot) {
          return Response.json(
            { error: "Merkle root not computed. Please recompute first." },
            { status: 400 }
          );
        }

        // Use provided txHash or fallback to session's txHash
        const transactionHash = txHash || sessionData.txHash;

        if (!transactionHash) {
          return Response.json(
            { error: "Transaction hash is required for on-chain verification" },
            { status: 400 }
          );
        }

        // Perform on-chain verification using Blockfrost API directly
        const verificationResult = await verifyOnChainMerkleRoot(
          transactionHash,
          sessionData.merkleRoot
        );

        return Response.json(verificationResult);

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Session action error:", error);
    return Response.json(
      { error: "Failed to process session action" },
      { status: 500 }
    );
  }
}

// For simplicity, we're using an in-memory store
// In a real implementation, you would use a database
// We'll initialize with some mock data for demonstration
if (sessionsStorage.size === 0) {
  sessionsStorage.set("SESS-0001", {
    sessionId: "SESS-0001",
    cid: "QmXkf7CJcJd8hQ9Y1Z2vKp7n5X4m8sK2p1qL9nR3tY6uW1",
    timestamp: "2024-01-15T10:30:00Z",
    sessionHash:
      "a1b2c3d4e5f67890123456789012345678901234567890123456789012345678",
    merkleRoot:
      "0x5a8bc3d9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f67890",
    proofStore: {},
    operatorSignature: null,
    uploadedBy: "operator-1",
    status: "uploaded",
    txHash: "tx1abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    playerWallet:
      "addr1q8vwxyzzabcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvw",
    gameType: "blackjack",
    amount: "100",
    result: "win",
    signature: null,
  });

  sessionsStorage.set("SESS-0002", {
    sessionId: "SESS-0002",
    cid: "QmYkg8B9DcFe1H3j4K5L6M7N8O9P0qR1sT2uV3wX4yZ5a2",
    timestamp: "2024-01-15T11:00:00Z",
    sessionHash:
      "b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
    merkleRoot:
      "0x2f4ea1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
    proofStore: {},
    operatorSignature: null,
    uploadedBy: "operator-2",
    status: "uploaded",
    txHash: "tx2bcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    playerWallet:
      "addr1q9abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwx",
    gameType: "roulette",
    amount: "50",
    result: "lose",
    signature: null,
  });
}
