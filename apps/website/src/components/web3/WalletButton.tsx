"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState, useCallback } from "react";
import { Wallet, Loader2, X, ChevronDown } from "lucide-react";
import { useTronWeb } from "@/hooks/useTronWeb";
import type { WindowExtensions, DetectedWallet } from "@/types/wallet";

interface WalletButtonProps {
  disabled?: boolean;
  disabledLabel?: string;
}

export function WalletButton({ disabled, disabledLabel }: WalletButtonProps) {
  const ethAccount = useAccount();
  const { disconnect: ethDisconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { openConnectModal } = useConnectModal();

  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  // Auto-detect available wallets (same approach as cloud-mining)
  useEffect(() => {
    if (!showDropdown) return;

    setIsDetecting(true);

    const detectWallets = () => {
      const wallets: DetectedWallet[] = [];

      if (typeof window !== "undefined") {
        const win = window as WindowExtensions;

        // MetaMask Detection
        if (win.ethereum?.isMetaMask && !win.ethereum?.isBraveWallet) {
          const metaMaskConnector = connectors.find(
            (c) =>
              c.name === "MetaMask" ||
              c.name.toLowerCase().includes("metamask") ||
              (c.name === "Injected" && win.ethereum?.isMetaMask)
          );
          if (metaMaskConnector) {
            wallets.push({
              name: "MetaMask",
              icon: "🦊",
              installed: true,
              type: "browser_extension",
              connector: metaMaskConnector,
            });
          }
        }

        // Trust Wallet Detection
        if (win.ethereum?.isTrustWallet || win.trustWallet) {
          const trustConnector = connectors.find(
            (c) =>
              c.name.toLowerCase().includes("trust") ||
              c.name === "Trust Wallet" ||
              (c.name === "Injected" && win.ethereum?.isTrustWallet)
          );
          if (trustConnector) {
            wallets.push({
              name: "Trust Wallet",
              icon: "🛡️",
              installed: true,
              type: "browser_extension",
              connector: trustConnector,
            });
          }
        }

        // Coinbase Wallet Detection
        if (win.ethereum?.isCoinbaseWallet || win.coinbaseWalletExtension) {
          const coinbaseConnector = connectors.find(
            (c) =>
              c.name.toLowerCase().includes("coinbase") || c.name === "Coinbase Wallet"
          );
          if (coinbaseConnector) {
            wallets.push({
              name: "Coinbase Wallet",
              icon: "🔵",
              installed: true,
              type: "browser_extension",
              connector: coinbaseConnector,
            });
          }
        }
      }

      // WalletConnect (always available)
      const walletConnectConnector = connectors.find(
        (c) =>
          c.name === "WalletConnect" ||
          c.name.toLowerCase().includes("walletconnect") ||
          c.name.toLowerCase().includes("wallet connect")
      );
      if (walletConnectConnector) {
        wallets.push({
          name: "WalletConnect",
          icon: "🔗",
          installed: true,
          type: "walletconnect",
          connector: walletConnectConnector,
        });
      }

      setDetectedWallets(wallets);
      setIsDetecting(false);
    };

    // Delay to ensure connectors are loaded (same as cloud-mining uses 1000ms)
    const timer = setTimeout(detectWallets, 1000);
    return () => clearTimeout(timer);
  }, [showDropdown, connectors]);

  // Connect wallet using wagmi connector (same approach as cloud-mining)
  const handleWalletConnect = useCallback(
    async (wallet: DetectedWallet) => {
      if (!wallet.connector) {
        console.error("No connector found for wallet:", wallet.name);
        return;
      }

      setConnectingWallet(wallet.name);
      setConnectError(null);
      try {
        await connect({
          connector: wallet.connector as ReturnType<typeof useConnect>["connectors"][0],
        });
        setShowDropdown(false);
      } catch (error: any) {
        console.error("Failed to connect to wallet:", wallet.name, error);
        if (error?.code === 4001) {
          setConnectError("Connection rejected. Please approve in your wallet.");
        } else {
          setConnectError(error?.message || `Failed to connect ${wallet.name}`);
        }
      } finally {
        setConnectingWallet(null);
      }
    },
    [connect]
  );

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-wallet-dropdown]")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showDropdown]);

  // If already connected, show address
  if (ethAccount.isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-3 py-2 dark:border-success-800 dark:bg-success-500/10">
          <div className="h-2 w-2 rounded-full bg-success-500" />
          <span className="text-xs font-medium text-success-700 dark:text-success-400">
            {ethAccount.address?.slice(0, 6)}...{ethAccount.address?.slice(-4)}
          </span>
        </div>
        <button
          onClick={() => ethDisconnect()}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs font-medium text-surface-600 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative" data-wallet-dropdown>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled}
        className="flex items-center gap-2 rounded-lg gradient-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Wallet className="h-4 w-4" />
        {disabled ? disabledLabel || "Disabled" : "Connect Wallet"}
        {!disabled && <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {/* Wallet Selection Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-surface-200 bg-white p-4 shadow-xl dark:border-surface-700 dark:bg-surface-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
              Connect Wallet
            </h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isDetecting ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
              <span className="ml-2 text-sm text-surface-500">Detecting wallets...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Detected Browser Wallets */}
              {detectedWallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletConnect(wallet)}
                  disabled={connectingWallet !== null}
                  className="flex w-full items-center justify-between rounded-lg border border-surface-200 p-3 transition-all hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-700 dark:hover:border-brand-600 dark:hover:bg-brand-500/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{wallet.icon}</span>
                    <div className="text-left">
                      <span className="block text-sm font-medium text-surface-900 dark:text-white">
                        {wallet.name}
                      </span>
                      <span className="block text-xs text-success-600 dark:text-success-400">
                        Detected
                      </span>
                    </div>
                  </div>
                  {connectingWallet === wallet.name ? (
                    <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                  ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-success-500" />
                  )}
                </button>
              ))}

              {/* Other Wallets via RainbowKit Modal */}
              <button
                onClick={() => {
                  setShowDropdown(false);
                  if (openConnectModal) openConnectModal();
                }}
                disabled={connectingWallet !== null}
                className="flex w-full items-center justify-between rounded-lg border border-surface-200 p-3 transition-all hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-700 dark:hover:border-brand-600 dark:hover:bg-brand-500/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌐</span>
                  <div className="text-left">
                    <span className="block text-sm font-medium text-surface-900 dark:text-white">
                      Other Wallets
                    </span>
                    <span className="block text-xs text-surface-500 dark:text-surface-400">
                      WalletConnect, Coinbase, etc.
                    </span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 -rotate-90 text-surface-400" />
              </button>
            </div>
          )}

          {/* Error message */}
          {connectError && (
            <div className="mt-3 rounded-lg bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:bg-danger-500/10 dark:text-danger-400">
              {connectError}
            </div>
          )}

          {/* No wallets detected hint */}
          {detectedWallets.length === 0 && !isDetecting && (
            <p className="mt-3 text-center text-xs text-surface-400">
              No browser wallets detected. Install MetaMask or use &quot;Other Wallets&quot; to connect via WalletConnect.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Tron wallet button component
interface TronButtonProps {
  disabled?: boolean;
  disabledLabel?: string;
}

export function TronWalletButton({ disabled, disabledLabel }: TronButtonProps) {
  const tron = useTronWeb();

  if (tron.address) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-500/10">
        <div className="h-2 w-2 rounded-full bg-blue-500" />
        <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
          Tron: {tron.address.slice(0, 8)}...{tron.address.slice(-6)}
        </span>
        <button
          onClick={tron.disconnect}
          className="ml-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={tron.connect}
      disabled={tron.connecting || disabled}
      className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:bg-blue-600 disabled:opacity-50 dark:border-blue-700"
    >
      {tron.connecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="h-4 w-4" />
      )}
      {disabled
        ? disabledLabel || "Disabled"
        : tron.connecting
          ? "Connecting..."
          : "Connect TronLink"}
    </button>
  );
}

// Combined wallet section - Ethereum only
interface WalletSectionProps {
  disabled?: boolean;
  disabledLabel?: string;
}

export function WalletSection({ disabled, disabledLabel }: WalletSectionProps) {
  return (
    <div>
      <WalletButton disabled={disabled} disabledLabel={disabledLabel} />
    </div>
  );
}
