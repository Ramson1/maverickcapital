import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
  bsc,
  avalanche,
  fantom,
  cronos,
  polygonZkEvm,
} from "wagmi/chains";
import type { Chain } from "@rainbow-me/rainbowkit";

// Custom chain definitions for additional networks
const zkSync = {
  id: 324,
  name: "zkSync Era",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: { default: { http: ["https://mainnet.era.zksync.io"] } },
  blockExplorers: { default: { name: "zkSync Explorer", url: "https://explorer.zksync.io" } },
} as const satisfies Chain;

const linea = {
  id: 59144,
  name: "Linea",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: { default: { http: ["https://rpc.linea.build"] } },
  blockExplorers: { default: { name: "LineaScan", url: "https://lineascan.build" } },
} as const satisfies Chain;

const scroll = {
  id: 534352,
  name: "Scroll",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: { default: { http: ["https://rpc.scroll.io"] } },
  blockExplorers: { default: { name: "ScrollScan", url: "https://scrollscan.com" } },
} as const satisfies Chain;

const allChains = [
  mainnet,
  sepolia,
  polygon,
  optimism,
  arbitrum,
  base,
  bsc,
  avalanche,
  fantom,
  cronos,
  polygonZkEvm,
  zkSync,
  linea,
  scroll,
];

// Build transport map for all chains
function buildTransports() {
  const transports: Record<number, ReturnType<typeof http>> = {};
  for (const chain of allChains) {
    transports[chain.id] = http();
  }
  return transports;
}

export const config = getDefaultConfig({
  appName: "Maverick Capital",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo-project-id",
  chains: allChains as unknown as readonly [typeof mainnet, ...typeof mainnet[]],
  transports: buildTransports(),
  ssr: true,
  // Prevent WalletConnect from eagerly connecting on page load
  // This stops the WebSocket errors when WC isn't being used
  multiInjectedProviderDiscovery: true,
  appDescription: "Maverick Capital - Professional Investment & Trading Platform",
  appUrl: typeof window !== "undefined" ? window.location.origin : "https://maverickcapital.io",
  appIcon: typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "/logo.png",
});
