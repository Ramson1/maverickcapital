// Window extensions for detecting various wallet providers
export interface WindowExtensions {
  ethereum?: {
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
    isBraveWallet?: boolean;
    isRainbow?: boolean;
    isTrustWallet?: boolean;
    isBinance?: boolean;
    isOkxWallet?: boolean;
    isBybitWallet?: boolean;
    isTokenPocket?: boolean;
    isSafePal?: boolean;
    isCryptoCom?: boolean;
    isGateWallet?: boolean;
    isPhantom?: boolean;
    [key: string]: unknown;
  };
  coinbaseWalletExtension?: unknown;
  trustWallet?: unknown;
  BinanceChain?: unknown;
  okxwallet?: unknown;
  bybitWallet?: unknown;
  tokenpocket?: unknown;
  safepal?: unknown;
  deficonnectProvider?: unknown;
  phantom?: {
    ethereum?: unknown;
    solana?: unknown;
  };
  TronWeb?: unknown;
  tronLink?: unknown;
}

// TronWeb instance types
export interface TronWebInstance {
  trx: {
    getBalance: (address: string) => Promise<number>;
  };
  contract: () => {
    at: (contractAddress: string) => Promise<{
      balanceOf: (address: string) => {
        call: () => Promise<{
          toNumber: () => number;
        }>;
      };
    }>;
  };
  defaultAddress?: {
    base58?: string;
  };
}

export interface TronWindowExtensions {
  TronWeb?: TronWebInstance;
  tronLink?: {
    tronWeb: TronWebInstance & {
      defaultAddress: {
        base58: string;
      };
    };
  };
}

// Detected wallet interface for wallet auto-detection
export interface DetectedWallet {
  name: string;
  icon?: string;
  installed: boolean;
  type: "injected" | "browser_extension" | "walletconnect" | "exchange" | "tron";
  connector?: unknown;
}
