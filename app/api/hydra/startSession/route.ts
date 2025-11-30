import { NextRequest } from "next/server";

// Ephemeral in-memory store for Hydra Heads (mock)
export const hydraHeads = new Map<string, { status: string; startedAt: string; tableId?: string }>();

function generateHeadId() {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `HEAD-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) || {};
    const tableId = body.tableId as string | undefined;

    const headId = generateHeadId();
    const startedAt = new Date().toISOString();

    hydraHeads.set(headId, { status: "open", startedAt, tableId });

    return Response.json({ headId, status: "open", startedAt, tableId });
  } catch (error) {
    console.error("Hydra startSession error:", error);
    return Response.json(
      { error: "Failed to start Hydra session" },
      { status: 500 }
    );
  }
}