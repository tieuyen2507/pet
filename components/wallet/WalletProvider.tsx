"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, ethers } from "ethers";
import {
  WalletContext,
  WalletContextValue,
  useWallet,
} from "@/lib/web3/useWallet";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

function getEthereum(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return (window as { ethereum?: EthereumProvider }).ethereum ?? null;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balanceEth, setBalanceEth] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!address;

  const provider = useMemo(() => {
    const ethereum = getEthereum();
    if (!ethereum) return null;
    return new BrowserProvider(ethereum);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!provider || !address) return;
    const balance = await provider.getBalance(address);
    setBalanceEth(ethers.formatEther(balance));
  }, [address, provider]);

  const refreshNetwork = useCallback(async () => {
    if (!provider) return;
    const network = await provider.getNetwork();
    setChainId(Number(network.chainId));
  }, [provider]);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum || !provider) {
      setError("Chưa phát hiện MetaMask.");
      return;
    }
    setError(null);
    setIsConnecting(true);
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const nextAddress = await signer.getAddress();
      setAddress(nextAddress);
      await refreshNetwork();
      await refreshBalance();
    } catch (err) {
      setError("Không thể kết nối ví.");
    } finally {
      setIsConnecting(false);
    }
  }, [provider, refreshBalance, refreshNetwork]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setBalanceEth(null);
    setError(null);
  }, []);

  const signMessage = useCallback(
    async (message: string) => {
      if (!provider) {
        throw new Error("Ví chưa sẵn sàng.");
      }
      if (!address) {
        throw new Error("Bạn chưa kết nối ví.");
      }
      const signer = await provider.getSigner();
      return signer.signMessage(message);
    },
    [address, provider]
  );

  const switchToLocalhost = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setError("Chưa phát hiện MetaMask.");
      return;
    }
    setError(null);
    const chainHex = "0x7a69";
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainHex }],
      });
    } catch (switchError: any) {
      if (switchError?.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainHex,
              chainName: "Localhost 31337",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["http://127.0.0.1:8545"],
            },
          ],
        });
      } else {
        setError("Không thể chuyển mạng.");
      }
    }
  }, []);

  useEffect(() => {
    if (!provider) return;
    const ethereum = getEthereum();
    if (!ethereum?.request) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
        return;
      }
      setAddress(accounts[0]);
      refreshBalance();
    };

    const handleChainChanged = (chainHex: string) => {
      setChainId(parseInt(chainHex, 16));
      refreshBalance();
    };

    ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      const list = accounts as string[];
      if (list.length > 0) {
        setAddress(list[0]);
        refreshNetwork();
        refreshBalance();
      }
    });

    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [disconnect, provider, refreshBalance, refreshNetwork]);

  const value: WalletContextValue = {
    isConnected,
    address,
    chainId,
    balanceEth,
    isConnecting,
    error,
    connect,
    disconnect,
    refreshBalance,
    switchToLocalhost,
    signMessage,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export { useWallet };
