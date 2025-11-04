
export const blockchainConfig = {
  polygon: {
    rpcEndpoints: [
      process.env.POLYGON_RPC_ENDPOINT,
      process.env.POLYGON_RPC_URL,
      process.env.MATIC_RPC_URL,
      process.env.POLYGON_API_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.POLYGON_API_KEY}` : null,
      process.env.ALCHEMY_API_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` : null,
      process.env.ALCHEMY_ALL_NETWORKS_API_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ALL_NETWORKS_API_KEY}` : null,
      'https://polygon-rpc.com', // Public fallback #1
      'https://rpc-mainnet.matic.network', // Public fallback #2
      'https://rpc-mainnet.maticvigil.com', // Public fallback #3
      'https://polygon-mainnet.public.blastapi.io', // Public fallback #4
      'https://polygon.llamarpc.com' // Public fallback #5
    ].filter(Boolean),
    chainId: 137,
    name: 'Polygon Mainnet'
  },
  solana: {
    rpcEndpoints: [
      process.env.SOLANA_RPC_URL,
      process.env.SOLANA_RPC,
      process.env.SOLANA_RPC_ENDPOINT,
      process.env.SOL_RPC_URL,
      process.env.SOLANA_API_KEY ? `https://solana-mainnet.g.alchemy.com/v2/${process.env.SOLANA_API_KEY}` : null,
      process.env.ALCHEMY_ALL_NETWORKS_API_KEY ? `https://solana-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ALL_NETWORKS_API_KEY}` : null,
      'https://api.mainnet-beta.solana.com', // Public fallback #1
      'https://solana-api.projectserum.com', // Public fallback #2
      'https://rpc.ankr.com/solana', // Public fallback #3
      'https://solana-mainnet.rpc.extrnode.com' // Public fallback #4
    ].filter(Boolean),
    name: 'Solana Mainnet'
  }
};

export function getActivePolygonRPC(): string {
  const endpoints = blockchainConfig.polygon.rpcEndpoints;
  console.log(`[Polygon] Available endpoints: ${endpoints.length}`);
  const activeEndpoint = endpoints[0] || 'https://polygon-rpc.com';
  console.log(`[Polygon] Using RPC: ${activeEndpoint.substring(0, 50)}...`);
  return activeEndpoint;
}

export function getActiveSolanaRPC(): string {
  const endpoints = blockchainConfig.solana.rpcEndpoints;
  console.log(`[Solana] Available endpoints: ${endpoints.length}`);
  const activeEndpoint = endpoints[0] || 'https://api.mainnet-beta.solana.com';
  console.log(`[Solana] Using RPC: ${activeEndpoint.substring(0, 50)}...`);
  return activeEndpoint;
}
