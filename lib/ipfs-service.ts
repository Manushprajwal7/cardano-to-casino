// Note: We're using dynamic imports to avoid issues with Electron dependencies in browser environments
import { IPFS_CONFIG } from "./ipfs-config";

// Initialize IPFS clients based on configuration
let ipfsClient: any = null;
let pinataClient: any = null;

// Only run on server-side
const isServer = typeof window === 'undefined';

// Initialize IPFS client for Infura
async function initializeInfuraClient() {
  if (!isServer) return; // Skip in browser
  
  if (IPFS_CONFIG.INFURA_PROJECT_ID && IPFS_CONFIG.INFURA_PROJECT_SECRET) {
    try {
      // Dynamic import to avoid SSR issues
      const { create } = await import("ipfs-http-client");
      
      // Create auth header in a browser-compatible way
      const auth = btoa(`${IPFS_CONFIG.INFURA_PROJECT_ID}:${IPFS_CONFIG.INFURA_PROJECT_SECRET}`);
      
      ipfsClient = create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
        headers: {
          authorization: `Basic ${auth}`
        },
      });
    } catch (error) {
      console.warn("Failed to initialize Infura IPFS client:", error);
    }
  }
}

// Initialize Pinata client
function initializePinataClient() {
  if (!isServer) return; // Skip in browser
  
  if (IPFS_CONFIG.PINATA_JWT) {
    try {
      // We'll use the JWT token directly with fetch API instead of the SDK
      // to avoid Electron dependency issues
      pinataClient = {
        pinJSONToIPFS: async (json: any, options: any = {}) => {
          const response = await fetch(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${IPFS_CONFIG.PINATA_JWT}`
              },
              body: JSON.stringify({
                pinataContent: json,
                pinataMetadata: options.pinataMetadata || {},
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Pinata API error: ${response.status}`);
          }

          return await response.json();
        },
      };
    } catch (error) {
      console.warn("Pinata client initialization failed:", error);
    }
  }
}

// Initialize clients
if (typeof window !== "undefined" || process.env.NEXT_RUNTIME === "nodejs") {
  initializePinataClient();
  // Only initialize Infura in server environment to avoid Electron issues
  if (process.env.NEXT_RUNTIME === "nodejs") {
    initializeInfuraClient();
  }
}

/**
 * Upload content to IPFS using the configured provider
 * @param content The content to upload (string or buffer)
 * @param options Upload options (name, keyvalues, etc.)
 * @returns The CID of the uploaded content
 */
export async function uploadToIPFS(
  content: string | Buffer,
  options: any = {}
) {
  // Validate content size
  const contentSize = Buffer.byteLength(content, "utf8");
  if (contentSize > IPFS_CONFIG.MAX_PAYLOAD_SIZE) {
    throw new Error(
      `Content too large. Maximum size is ${IPFS_CONFIG.MAX_PAYLOAD_SIZE} bytes`
    );
  }

  // Try Pinata first if configured
  if (pinataClient && IPFS_CONFIG.PROVIDER === "pinata") {
    try {
      const jsonData =
        typeof content === "string" ? JSON.parse(content) : content;
      const result = await pinataClient.pinJSONToIPFS(jsonData, options);
      return result.IpfsHash || result.cid;
    } catch (error) {
      console.warn("Pinata upload failed, falling back:", error);
    }
  }

  // Fall back to Infura IPFS if configured and available
  if (ipfsClient) {
    try {
      const { path } = await ipfsClient.add({
        content: typeof content === "string" ? content : content.toString(),
      });
      return path;
    } catch (error) {
      console.warn("Infura IPFS upload failed:", error);
    }
  }

  // If no IPFS provider is configured, throw an error
  throw new Error(
    "No IPFS provider configured. Please set INFURA_IPFS_PROJECT_ID and INFURA_IPFS_PROJECT_SECRET or PINATA_JWT."
  );
}

/**
 * Generate IPFS gateway URL for a CID
 * @param cid The CID of the content
 * @returns The gateway URL
 */
export function getIPFSGatewayURL(cid: string): string {
  if (IPFS_CONFIG.PROVIDER === "pinata" && IPFS_CONFIG.PINATA_GATEWAY) {
    return `${IPFS_CONFIG.PINATA_GATEWAY}/ipfs/${cid}`;
  }
  return `${IPFS_CONFIG.IPFS_GATEWAY}/ipfs/${cid}`;
}

/**
 * Check if IPFS providers are configured
 * @returns True if at least one provider is configured
 */
export function isIPFSConfigured(): boolean {
  return !!(
    (ipfsClient || pinataClient) &&
    (IPFS_CONFIG.INFURA_PROJECT_ID || IPFS_CONFIG.PINATA_JWT)
  );
}
