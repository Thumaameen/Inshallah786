
export const blockchainConfig = {
  polygon: {
    rpcEndpoints: [
      process.env.POLYGON_RPC_ENDPOINT,
      process.env.POLYGON_RPC_URL,
      process.env.MATIC_RPC_URL,
      process.env.POLYGON_API_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.POLYGON_API_KEY}` : null,
      process.env.ALCHEMY_API_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` : null,
      'https://polygon-rpc.com', // Public fallback
      'https://rpc-mainnet.maticvigil.com',
      'https://polygon-mainnet.public.blastapi.io'
    ].filter(Boolean),
    chainId: 137,
    name: 'Polygon Mainnet'
  },
  solana: {
    rpcEndpoints: [
      process.env.SOLANA_RPC_URL,
      process.env.SOLANA_RPC,
      process.env.SOLANA_RPC_ENDPOINT,
      process.env.SOLANA_API_KEY ? `https://solana-mainnet.g.alchemy.com/v2/${process.env.SOLANA_API_KEY}` : null,
      'https://api.mainnet-beta.solana.com', // Public fallback
      'https://solana-api.projectserum.com'
    ].filter(Boolean),
    name: 'Solana Mainnet'
  }
};

export function getActivePolygonRPC(): string {
  return blockchainConfig.polygon.rpcEndpoints[0] || 'https://polygon-rpc.com';
}

export function getActiveSolanaRPC(): string {
  return blockchainConfig.solana.rpcEndpoints[0] || 'https://api.mainnet-beta.solana.com';
}
