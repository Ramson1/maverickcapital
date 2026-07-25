"use client";

import { useAccount, useDisconnect, useBalance } from "wagmi";
import { useTronWeb } from "./useTronWeb";

export function useWallet() {
  // Ethereum (via wagmi)
  const ethAccount = useAccount();
  const { disconnect: ethDisconnect } = useDisconnect();
  const { data: ethBalance } = useBalance({ address: ethAccount.address });

  // Tron (via TronWeb)
  const tron = useTronWeb();

  return {
    // Ethereum
    ethAddress: ethAccount.address?.toString() || null,
    ethConnected: ethAccount.isConnected,
    ethConnecting: ethAccount.isConnecting,
    ethBalance: ethBalance ? `${Number(ethBalance.value) / Math.pow(10, ethBalance.decimals)}` : "0",
    ethDisconnect: ethDisconnect,

    // Tron
    tronAddress: tron.address,
    tronConnected: !!tron.address,
    tronConnecting: tron.connecting,
    tronBalance: tron.balance,
    tronConnect: tron.connect,
    tronDisconnect: tron.disconnect,
    getTRC20Balance: tron.getTRC20Balance,
    sendTRX: tron.sendTRX,
    sendTRC20: tron.sendTRC20,

    // Combined
    anyConnected: ethAccount.isConnected || !!tron.address,
  };
}
