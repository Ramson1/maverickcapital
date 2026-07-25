"use client";

import { useState, useEffect, useCallback } from "react";
import TronWeb from "tronweb";

const TRON_STORAGE_KEY = "mc_tron_address";

// Extend Window type for TronLink
declare global {
  interface Window {
    tronWeb?: any;
    tronLink?: any;
  }
}

export function useTronWeb() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tronWebInstance, setTronWebInstance] = useState<any>(null);

  // Check for TronLink on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.tronWeb) {
      const saved = localStorage.getItem(TRON_STORAGE_KEY);
      if (saved) {
        setAddress(saved);
        setTronWebInstance(window.tronWeb);
      }
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      // Check if TronLink is installed
      if (typeof window === "undefined" || !window.tronLink) {
        setError("TronLink wallet not found. Please install the TronLink browser extension.");
        setConnecting(false);
        return;
      }

      // Request connection via TronLink
      await window.tronLink.request({ method: "tron_requestAccounts" });

      // Get the address after connection
      const addr = window.tronWeb.defaultAddress.base58;
      setAddress(addr);
      localStorage.setItem(TRON_STORAGE_KEY, addr);
      setTronWebInstance(window.tronWeb);

      // Fetch TRX balance
      const bal = await window.tronWeb.trx.getBalance(addr);
      setBalance((bal / 1e6).toFixed(6));
    } catch (err) {
      console.error("TronWeb connect error:", err);
      setError("Failed to connect TronLink. Please try again.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const getTRC20Balance = useCallback(
    async (contractAddress: string) => {
      if (!tronWebInstance || !address) return "0";
      try {
        const contract = await tronWebInstance.contract().at(contractAddress);
        const bal = await contract.balanceOf(address).call();
        const decimals = await contract.decimals().call();
        return (Number(bal) / Math.pow(10, Number(decimals))).toString();
      } catch (err) {
        console.error("Failed to get TRC20 balance:", err);
        return "0";
      }
    },
    [tronWebInstance, address]
  );

  const sendTRX = useCallback(
    async (to: string, amount: number) => {
      if (!tronWebInstance) throw new Error("TronWeb not connected");
      const tx = await tronWebInstance.transactionBuilder.sendTrx(to, amount * 1e6, address);
      const signed = await tronWebInstance.trx.sign(tx);
      return await tronWebInstance.trx.sendRawTransaction(signed);
    },
    [tronWebInstance, address]
  );

  const sendTRC20 = useCallback(
    async (contractAddress: string, to: string, amount: string) => {
      if (!tronWebInstance) throw new Error("TronWeb not connected");
      const contract = await tronWebInstance.contract().at(contractAddress);
      const decimals = await contract.decimals().call();
      const adjustedAmount = Math.floor(Number(amount) * Math.pow(10, Number(decimals)));
      return await contract.transfer(to, adjustedAmount).send({
        feeLimit: 100000000,
        from: address,
      });
    },
    [tronWebInstance, address]
  );

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
    setError(null);
    setTronWebInstance(null);
    localStorage.removeItem(TRON_STORAGE_KEY);
  }, []);

  return {
    address,
    balance,
    connecting,
    error,
    connect,
    disconnect,
    getTRC20Balance,
    sendTRX,
    sendTRC20,
  };
}
