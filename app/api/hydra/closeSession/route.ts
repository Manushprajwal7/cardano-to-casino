import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { uploadToIPFS, isIPFSConfigured } from "@/lib/ipfs-service";
import { sessionsStorage } from "@/app/api/sessions/route";
import { hydraHeads } from "@/app/api/hydra/startSession/route";

// Helpers copied to keep consistent Merkle approach
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

function computeLeafHash(payload: any): string {
  const canonicalPayload = canonicalizeJSON(payload);
  const payloadBuffer = Buffer.from(canonicalPayload, "utf8");
  const prefixedPayload = Buffer.concat([
    Buffer.from([0x00]),
    payloadBuffer,
  ]);
  return createHash("sha256").update(prefixedPayload).digest("hex");
}

function computeNodeHash(left: string, right: string): string {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  const concatenated = Buffer.concat([
    Buffer.from([0x01]),
    leftBuffer,
    rightBuffer,
  ]);
  return createHash("sha256").update(concatenated).digest("hex");
}

function buildMerkleTree(leaves: string[]): {
  root: string;
} {
  if (leaves.length === 0) {
    throw new Error("Cannot build Merkle tree with zero leaves");
  }
  if (leaves.length === 1) {
    return { root: leaves[0] };
  }
  let currentLevel = [...leaves];
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : currentLevel[i];
      nextLevel.push(computeNodeHash(left, right));
    }
    currentLevel = nextLevel;
  }
  return { root: currentLevel[0] };
}

export async function POST(request: NextRequest) {
  try {
    const { headId, events } = await request.json();

    if (!headId || !Array.isArray(events)) {
      return Response.json(
        { error: "Missing required fields: headId and events[]" },
        { status: 400 }
      );
    }

    // Validate head
    const head = hydraHeads.get(headId);
    if (!head || head.status !== "open") {
      return Response.json(
        { error: "Hydra head not open or not found" },
        { status: 400 }
      );
    }

    // Compute Merkle root from events (use entire event object)
    const leafHashes = events.map((evt: any) => computeLeafHash(evt));
    const { root } = buildMerkleTree(leafHashes);

    // Prepare payload to store
    const payload = {
      headId,
      startedAt: head.startedAt,
      closedAt: new Date().toISOString(),
      events,
      merkleRoot: root,
    };
    const payloadStr = JSON.stringify(payload);

    // Upload to IPFS with fallback mock CID if provider not configured
    let cid = "";
    if (isIPFSConfigured()) {
      try {
        cid = await uploadToIPFS(payloadStr, {
          pinataMetadata: {
            name: `hydra-session-${headId}`,
            keyvalues: {
              headId,
              merkleRoot: root,
              closedAt: new Date().toISOString(),
            },
          },
        });
      } catch (e) {
        console.error("IPFS upload failed, using mock CID:", e);
        cid = `Qm${createHash("sha256").update(payloadStr).digest("hex").substring(0, 44)}`;
      }
    } else {
      cid = `Qm${createHash("sha256").update(payloadStr).digest("hex").substring(0, 44)}`;
    }

    // Mock L1 commit hash (in real impl, submit tx and get hash)
    const txHash = `tx_${createHash("sha256").update(root).digest("hex").substring(0, 32)}`;

    // Mark head as committed
    hydraHeads.set(headId, { ...head, status: "committed" });

    // Persist summary into sessions storage to appear in All Sessions
    const sessionId = headId;
    const sessionSummary = {
      sessionId,
      cid,
      timestamp: new Date().toISOString(),
      sessionHash: createHash("sha256").update(payloadStr).digest("hex"),
      merkleRoot: root,
      proofStore: {},
      operatorSignature: null,
      uploadedBy: "hydra",
      status: "settled",
      txHash,
      playerWallet: "hydra",
      gameType: "hydra",
      amount: `${events.length} events`,
      result: "settled",
      signature: null,
    };
    sessionsStorage.set(sessionId, sessionSummary);

    return Response.json({ headId, merkleRoot: root, cid, txHash });
  } catch (error) {
    console.error("Hydra closeSession error:", error);
    return Response.json(
      { error: "Failed to close Hydra session" },
      { status: 500 }
    );
  }
}