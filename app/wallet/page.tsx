"use client";

import { useState } from "react";
import { WalletButton } from "@/components/wallet/WalletButton";
import { useWallet } from "@/components/wallet/WalletProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WalletPage() {
  const { signMessage, isConnected } = useWallet();
  const [message, setMessage] = useState("Xin chào từ Pet Manager!");
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSign() {
    setError(null);
    setSignature(null);
    if (!isConnected) {
      setError("Vui lòng kết nối ví trước khi ký.");
      return;
    }
    if (!message.trim()) {
      setError("Nội dung ký không được để trống.");
      return;
    }
    setLoading(true);
    try {
      const sig = await signMessage(message);
      setSignature(sig);
    } catch (err) {
      setError("Không thể ký thông điệp.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Ví
        </p>
        <h1 className="section-title text-3xl font-semibold">
          Kết nối MetaMask
        </h1>
      </div>

      <WalletButton />

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Ký thông điệp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Nhập thông điệp cần ký"
            />
          </div>
          <Button onClick={handleSign} disabled={loading}>
            {loading ? "Đang ký..." : "Ký thông điệp"}
          </Button>
          {error ? (
            <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          {signature ? (
            <div className="rounded-md border border-border bg-white/70 px-3 py-2 text-xs text-muted-foreground break-all">
              {signature}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
