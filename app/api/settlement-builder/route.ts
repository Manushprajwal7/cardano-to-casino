import { NextRequest } from "next/server";
import { settlementsStorage } from "../settlements/route";

// In-memory storage for fee configuration (in production, this would be in a database)
const feeConfigStorage = new Map();

// Initialize with default fee configuration
if (!feeConfigStorage.has("default")) {
  feeConfigStorage.set("default", {
    feePercentage: 1.0, // 1%
    lastUpdated: new Date().toISOString(),
    updatedBy: "system",
    minFee: 0.5, // Minimum fee in ADA
    maxFee: 100.0, // Maximum fee in ADA
  });
}

// Function to get current fee configuration
function getCurrentFeeConfig() {
  return (
    feeConfigStorage.get("default") || {
      feePercentage: 1.0,
      minFee: 0.5,
      maxFee: 100.0,
    }
  );
}

// Function to calculate fee and payout
function calculateFeeAndPayout(amount: number): {
  fee: number;
  payout: number;
} {
  const config = getCurrentFeeConfig();
  let fee = amount * (config.feePercentage / 100);

  // Apply minimum and maximum fee constraints
  if (fee < config.minFee) {
    fee = config.minFee;
  } else if (fee > config.maxFee) {
    fee = config.maxFee;
  }

  const payout = amount - fee;
  return { fee, payout };
}

// Function to create proper metadata structure
function createTransactionMetadata(
  sessionIds: string[],
  selectedSettlements: any[],
  totalAmt: number,
  calculatedFee: number,
  calculatedPayout: number
) {
  const timestamp = new Date().toISOString();

  // Create metadata structure following Cardano standards
  return {
    "674": {
      msg: [`Settlement for ${sessionIds.length} session(s)`],
    },
    "721": {
      SettlementData: {
        sessionId: sessionIds.length === 1 ? sessionIds[0] : undefined,
        sessionIds: sessionIds,
        merkleRoots: selectedSettlements.map((s: any) => s.merkleRoot),
        totalAmount: totalAmt.toFixed(2),
        fee: calculatedFee.toFixed(2),
        payout: calculatedPayout.toFixed(2),
        timestamp: timestamp,
        feePercentage: "1%",
        platform: "Cardano Casino Platform",
        version: "1.0",
        batchId: `BATCH-${Date.now()}`,
      },
    },
  };
}

// Function to process batch settlements (for handling 100+ sessions)
function processBatchSettlements(sessionIds: string[], walletAddress: string) {
  // Split large batches into smaller chunks (e.g., 20 sessions per transaction)
  const BATCH_SIZE = 20; // Process 20 sessions per transaction

  if (sessionIds.length <= BATCH_SIZE) {
    // Single transaction
    return null; // Will be handled by regular submit flow
  }

  // Split into batches
  const batches = [];
  for (let i = 0; i < sessionIds.length; i += BATCH_SIZE) {
    batches.push(sessionIds.slice(i, i + BATCH_SIZE));
  }

  return batches;
}

// Function to create batch transactions
function createBatchTransactions(
  batches: string[][],
  walletAddress: string,
  allSettlements: any[]
) {
  const batchTransactions = [];

  for (let i = 0; i < batches.length; i++) {
    const batchSessionIds = batches[i];
    const batchSettlements = batchSessionIds
      .map((id) => allSettlements.find((s) => s.settlementId === id))
      .filter(Boolean);

    // Calculate totals for this batch
    const totalAmt = batchSettlements.reduce(
      (sum: number, settlement: any) =>
        sum + parseFloat(settlement.amount || 0),
      0
    );

    const { fee: calculatedFee, payout: calculatedPayout } =
      calculateFeeAndPayout(totalAmt);

    // Create metadata for this batch
    const txMetadata = createTransactionMetadata(
      batchSessionIds,
      batchSettlements,
      totalAmt,
      calculatedFee,
      calculatedPayout
    );

    // Create transaction for this batch
    const transaction = {
      batchId: i + 1,
      totalBatches: batches.length,
      inputs: batchSettlements.map((s: any) => ({
        sessionId: s.settlementId,
        amount: parseFloat(s.amount),
        merkleRoot: s.merkleRoot,
      })),
      outputs: [
        {
          address: walletAddress, // Operator payout address
          amount: calculatedPayout,
        },
        {
          address:
            process.env.PLATFORM_TREASURY_ADDRESS || "addr1_platform_treasury", // Platform treasury
          amount: calculatedFee,
        },
      ],
      metadata: txMetadata,
      message: `Batch transaction ${i + 1} of ${batches.length}`,
      sessionIds: batchSessionIds,
      totalAmount: totalAmt.toFixed(2),
      fee: calculatedFee.toFixed(2),
      payout: calculatedPayout.toFixed(2),
      timestamp: new Date().toISOString(),
    };

    batchTransactions.push(transaction);
  }

  return batchTransactions;
}

// Helper function to validate session eligibility
function validateSessionForSettlement(session: any): {
  valid: boolean;
  reason?: string;
} {
  // Check if session is completed
  if (session.status !== "completed") {
    return { valid: false, reason: "Session is not completed" };
  }

  // Check if already settled
  if (session.txHash) {
    return { valid: false, reason: "Session already settled" };
  }

  // Check if has merkle root
  if (!session.merkleRoot) {
    return { valid: false, reason: "Session missing Merkle root" };
  }

  // Check if has valid amount
  if (!session.amount || isNaN(parseFloat(session.amount))) {
    return { valid: false, reason: "Session has invalid amount" };
  }

  return { valid: true };
}

export async function GET(request: NextRequest) {
  try {
    // Get all settlements that are eligible for settlement
    const allSettlements = Array.from(settlementsStorage.values());
    const pendingSettlements = allSettlements.filter((settlement: any) => {
      const validation = validateSessionForSettlement(settlement);
      return validation.valid;
    });

    // Map to the required format
    const eligibleSettlements = pendingSettlements.map((settlement: any) => ({
      sessionId: settlement.settlementId,
      merkleRoot: settlement.merkleRoot,
      amount: parseFloat(settlement.amount),
      operatorAddress: settlement.playerWallet,
    }));

    return Response.json(eligibleSettlements);
  } catch (error) {
    console.error("Error fetching pending settlements:", error);
    return Response.json(
      { error: "Failed to fetch pending settlements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionIds, walletAddress, signature } = body;

    // Security check - in production, this would check user roles
    // For now, we'll assume all requests are from authorized users

    switch (action) {
      case "preview":
        if (!sessionIds || !Array.isArray(sessionIds)) {
          return Response.json(
            { error: "sessionIds array is required" },
            { status: 400 }
          );
        }

        // Get and validate the settlements
        const settlements = sessionIds
          .map((id: string) => settlementsStorage.get(id))
          .filter(Boolean);

        // Validate all sessions
        for (const settlement of settlements) {
          const validation = validateSessionForSettlement(settlement);
          if (!validation.valid) {
            return Response.json(
              {
                error: `Session ${settlement.settlementId} is not eligible for settlement`,
                reason: validation.reason,
              },
              { status: 400 }
            );
          }
        }

        // Calculate totals
        const totalAmount = settlements.reduce(
          (sum: number, settlement: any) =>
            sum + parseFloat(settlement.amount || 0),
          0
        );

        const { fee, payout } = calculateFeeAndPayout(totalAmount);

        // Create metadata preview
        const metadataPreview = {
          sessionIds: sessionIds,
          totalAmount: totalAmount.toFixed(2),
          fee: `${fee.toFixed(2)} (1%)`,
          payout: payout.toFixed(2),
          timestamp: new Date().toISOString(),
          merkleRoots: settlements.map((s: any) => s.merkleRoot),
        };

        return Response.json({
          totalAmount: totalAmount.toFixed(2),
          fee: fee.toFixed(2),
          payout: payout.toFixed(2),
          metadataPreview,
        });

      case "submit":
        if (!sessionIds || !Array.isArray(sessionIds)) {
          return Response.json(
            { error: "sessionIds array is required" },
            { status: 400 }
          );
        }

        if (!walletAddress) {
          return Response.json(
            { error: "walletAddress is required" },
            { status: 400 }
          );
        }

        // Get all settlements for batch processing
        const allSettlements = sessionIds
          .map((id: string) => settlementsStorage.get(id))
          .filter(Boolean);

        // Check for batch processing
        const batches = processBatchSettlements(sessionIds, walletAddress);

        if (batches && batches.length > 1) {
          // Create batch transactions
          const batchTransactions = createBatchTransactions(
            batches,
            walletAddress,
            allSettlements
          );

          // Return batch information for client-side handling
          return Response.json({
            batchInfo: {
              totalSessions: sessionIds.length,
              batchCount: batches.length,
              batchSize: 20,
              message:
                "Large batch detected - split into multiple transactions",
            },
            batchTransactions: batchTransactions,
            message: "Batch processing required - multiple transactions needed",
          });
        }

        // Get and validate the settlements (for single transaction)
        const selectedSettlements = allSettlements;

        // Validate all sessions
        for (const settlement of selectedSettlements) {
          const validation = validateSessionForSettlement(settlement);
          if (!validation.valid) {
            return Response.json(
              {
                error: `Session ${settlement.settlementId} is not eligible for settlement`,
                reason: validation.reason,
              },
              { status: 400 }
            );
          }
        }

        // Verify all settlements have merkle roots
        const missingMerkleRoots = selectedSettlements.filter(
          (s: any) => !s.merkleRoot
        );

        if (missingMerkleRoots.length > 0) {
          return Response.json(
            {
              error: "All selected settlements must have computed Merkle roots",
              missingRoots: missingMerkleRoots.map((s: any) => s.settlementId),
            },
            { status: 400 }
          );
        }

        // Calculate totals
        const totalAmt = selectedSettlements.reduce(
          (sum: number, settlement: any) =>
            sum + parseFloat(settlement.amount || 0),
          0
        );

        const { fee: calculatedFee, payout: calculatedPayout } =
          calculateFeeAndPayout(totalAmt);

        // Create proper metadata structure for the transaction
        const txMetadata = createTransactionMetadata(
          sessionIds,
          selectedSettlements,
          totalAmt,
          calculatedFee,
          calculatedPayout
        );

        // Return transaction data that would be used by Lucid
        const unsignedTx = {
          inputs: selectedSettlements.map((s: any) => ({
            sessionId: s.settlementId,
            amount: parseFloat(s.amount),
            merkleRoot: s.merkleRoot,
          })),
          outputs: [
            {
              address: walletAddress, // Operator payout address
              amount: calculatedPayout,
            },
            {
              address:
                process.env.PLATFORM_TREASURY_ADDRESS ||
                "addr1_platform_treasury", // Platform treasury
              amount: calculatedFee,
            },
          ],
          metadata: txMetadata,
          message: "Unsigned transaction - ready for wallet signature",
          sessionIds: sessionIds,
          totalAmount: totalAmt.toFixed(2),
          fee: calculatedFee.toFixed(2),
          payout: calculatedPayout.toFixed(2),
          timestamp: new Date().toISOString(),
        };

        return Response.json({
          unsignedTx,
          message: "Transaction assembled - ready for signing",
        });

      case "finalize":
        // This would be called after the transaction is signed and submitted
        if (!sessionIds || !Array.isArray(sessionIds)) {
          return Response.json(
            { error: "sessionIds array is required" },
            { status: 400 }
          );
        }

        const txHash = body.txHash;
        if (!txHash) {
          return Response.json(
            { error: "txHash is required" },
            { status: 400 }
          );
        }

        // Validate all sessions exist
        for (const id of sessionIds) {
          if (!settlementsStorage.has(id)) {
            return Response.json(
              { error: `Session ${id} not found` },
              { status: 404 }
            );
          }
        }

        // Update all settlements with the transaction hash
        sessionIds.forEach((id: string) => {
          const settlement = settlementsStorage.get(id);
          if (settlement) {
            settlementsStorage.set(id, {
              ...settlement,
              txHash: txHash,
              status: "settled",
              settledAt: new Date().toISOString(),
            });
          }
        });

        return Response.json({
          message: "Settlements updated successfully",
          txHash: txHash,
        });

      case "getFeeConfig":
        // Admin-only endpoint to get current fee configuration
        // In production, this would check user permissions
        return Response.json(getCurrentFeeConfig());

      case "updateFeeConfig":
        // Admin-only endpoint to update fee configuration
        // In production, this would check user permissions
        const { feePercentage, minFee, maxFee } = body;

        if (
          feePercentage === undefined ||
          minFee === undefined ||
          maxFee === undefined
        ) {
          return Response.json(
            { error: "feePercentage, minFee, and maxFee are required" },
            { status: 400 }
          );
        }

        // Validate fee percentage (0-100%)
        if (feePercentage < 0 || feePercentage > 100) {
          return Response.json(
            { error: "feePercentage must be between 0 and 100" },
            { status: 400 }
          );
        }

        // Validate min/max fees
        if (minFee < 0 || maxFee < 0 || minFee > maxFee) {
          return Response.json(
            { error: "Invalid minFee or maxFee values" },
            { status: 400 }
          );
        }

        // Update fee configuration
        feeConfigStorage.set("default", {
          feePercentage,
          minFee,
          maxFee,
          lastUpdated: new Date().toISOString(),
          updatedBy: "admin", // Would come from auth in real implementation
        });

        return Response.json({
          message: "Fee configuration updated successfully",
          config: getCurrentFeeConfig(),
        });

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Settlement builder error:", error);
    return Response.json(
      { error: "Failed to process settlement builder request" },
      { status: 500 }
    );
  }
}
