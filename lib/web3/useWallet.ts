"use client";

import { createContext, useContext } from "react";

export type WalletState = {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balanceEth: string | null;
  isConnecting: boolean;
  error: string | null;
};

export type WalletActions = {
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  switchToLocalhost: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
};

export type WalletContextValue = WalletState & WalletActions;

export const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
