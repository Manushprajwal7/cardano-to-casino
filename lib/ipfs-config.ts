// IPFS Configuration
export const IPFS_CONFIG = {
  // Infura IPFS settings
  INFURA_PROJECT_ID: process.env.INFURA_IPFS_PROJECT_ID || "",
  INFURA_PROJECT_SECRET: process.env.INFURA_IPFS_PROJECT_SECRET || "",

  // Pinata settings
  PINATA_JWT: process.env.PINATA_JWT || "",
  PINATA_GATEWAY: process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud",

  // IPFS Gateway for viewing content
  IPFS_GATEWAY: process.env.IPFS_GATEWAY || "https://ipfs.io",

  // Storage provider preference
  PROVIDER: process.env.IPFS_PROVIDER || "infura", // 'infura', 'pinata', or 'local'

  // Max payload size (1MB)
  MAX_PAYLOAD_SIZE: 1024 * 1024,
};
