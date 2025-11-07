declare module 'web3' {
  export class Web3 {
    constructor(provider?: string);
    eth: {
      Contract: any;
      getAccounts(): Promise<string[]>;
      getBalance(address: string): Promise<string>;
    };
  }
}

declare module '@solana/web3.js' {
  export class Connection {
    constructor(endpoint: string, commitment?: string);
    getBalance(publicKey: string): Promise<number>;
  }
}