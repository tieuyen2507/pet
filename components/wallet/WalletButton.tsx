"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/components/wallet/WalletProvider";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletButton() {
  const {
    isConnected,
    address,
    chainId,
    balanceEth,
    isConnecting,
    error,
    connect,
    disconnect,
    switchToLocalhost,
  } = useWallet();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white/80 p-4 shadow-soft">
      <div className="flex flex-wrap items-center gap-3">
        {isConnected && address ? (
          <>
            <Badge variant="secondary">Đã kết nối</Badge>
            <span className="text-sm font-medium">{shortenAddress(address)}</span>
            <span className="text-sm text-muted-foreground">
              {balanceEth ? `${Number(balanceEth).toFixed(4)} ETH` : "Đang tải..."}
            </span>
            <span className="text-xs text-muted-foreground">
              Chain ID: {chainId ?? "--"}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            Ví chưa được kết nối.
          </span>
        )}
      </div>

      {error ? (
        <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {isConnected ? (
          <Button variant="outline" onClick={disconnect}>
            Ngắt kết nối
          </Button>
        ) : (
          <Button onClick={connect} disabled={isConnecting}>
            {isConnecting ? "Đang kết nối..." : "Kết nối MetaMask"}
          </Button>
        )}
        {isConnected && chainId !== null && chainId !== 31337 ? (
          <Button variant="secondary" onClick={switchToLocalhost}>
            Chuyển sang localhost (31337)
          </Button>
        ) : null}
      </div>
    </div>
  );
}
