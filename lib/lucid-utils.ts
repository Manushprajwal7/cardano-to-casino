// Utility functions for Lucid wallet integration

/**
 * Initialize Lucid with Blockfrost provider
 * @returns Lucid instance
 */
export async function initLucid(): Promise<any | null> {
  try {
    // Dynamically import Lucid to avoid WASM issues during server-side rendering
    const { Lucid, Blockfrost } = await import("@lucid-evolution/lucid");

    // Get Blockfrost API key from environment variables
    const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
    const blockfrostUrl =
      process.env.NEXT_PUBLIC_BLOCKFROST_URL ||
      "https://cardano-preview.blockfrost.io/api/v0";

    if (!blockfrostApiKey) {
      console.error("Blockfrost API key not found in environment variables");
      return null;
    }

    // Initialize Lucid with Blockfrost provider
    const lucid = await Lucid(
      new Blockfrost(blockfrostUrl, blockfrostApiKey),
      "Preview" // Network (Preview, Preprod, or Mainnet)
    );

    return lucid;
  } catch (error) {
    console.error("Error initializing Lucid:", error);
    return null;
  }
}

/**
 * Build and sign a settlement transaction
 * @param lucid - Lucid instance
 * @param inputs - Transaction inputs (session data)
 * @param outputs - Transaction outputs (payout addresses and amounts)
 * @param metadata - Transaction metadata
 * @returns Signed transaction CBOR or null if failed
 */
export async function buildSettlementTransaction(
  lucid: any,
  inputs: any[],
  outputs: { address: string; amount: number }[],
  metadata: any
): Promise<string | null> {
  try {
    // Start building the transaction
    let tx = lucid.newTx();

    // Add outputs
    for (const output of outputs) {
      tx = tx.payToAddress(output.address, {
        lovelace: BigInt(Math.round(output.amount * 1000000)),
      });
    }

    // Add metadata
    if (metadata) {
      tx = tx.attachMetadata(674, metadata["674"]);
      tx = tx.attachMetadata(721, metadata["721"]);
    }

    // Complete the transaction
    const completedTx = await tx.complete();

    // Sign the transaction
    const signedTx = await completedTx.sign.withWallet().complete();

    // Return the signed transaction as CBOR
    return signedTx;
  } catch (error) {
    console.error("Error building settlement transaction:", error);
    return null;
  }
}

/**
 * Submit a signed transaction to the network
 * @param lucid - Lucid instance
 * @param signedTx - Signed transaction CBOR
 * @returns Transaction hash or null if submission failed
 */
export async function submitTransaction(
  lucid: any,
  signedTx: string
): Promise<string | null> {
  try {
    // Submit the transaction
    const txHash = await lucid.submitTx(signedTx);
    return txHash;
  } catch (error) {
    console.error("Error submitting transaction:", error);
    return null;
  }
}
