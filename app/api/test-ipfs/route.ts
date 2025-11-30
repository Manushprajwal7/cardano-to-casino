import { NextRequest } from "next/server";
import { uploadToIPFS, isIPFSConfigured } from "@/lib/ipfs-service";

export async function GET(request: NextRequest) {
  try {
    // Check if IPFS is configured
    const configured = isIPFSConfigured();

    if (!configured) {
      return Response.json({
        success: false,
        message:
          "IPFS is not configured. Please set INFURA_IPFS_PROJECT_ID and INFURA_IPFS_PROJECT_SECRET or PINATA_JWT in your environment variables.",
      });
    }

    // Test data to upload
    const testData = {
      message: "Hello from Cardano Casino Integrity!",
      timestamp: new Date().toISOString(),
      test: true,
    };

    // Upload to IPFS
    const cid = await uploadToIPFS(JSON.stringify(testData), {
      pinataMetadata: {
        name: "test-upload",
        keyvalues: {
          timestamp: new Date().toISOString(),
          purpose: "testing",
        },
      },
    });

    return Response.json({
      success: true,
      cid: cid,
      message: "Successfully uploaded to IPFS",
      data: testData,
    });
  } catch (error) {
    console.error("IPFS test error:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
