"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BrowserProvider, Contract } from "ethers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletButton } from "@/components/wallet/WalletButton";
import { useWallet } from "@/components/wallet/WalletProvider";
import { medicalRecordAnchorAbi } from "@/lib/contract";

interface MedicalRecord {
  id: string;
  title?: string | null;
  description?: string | null;
  visitDate: string;
  attachmentsUrl?: string | null;
  recordHash?: string | null;
  txHash?: string | null;
  chainId?: number | null;
}

function shorten(value?: string | null, size = 10) {
  if (!value) return "";
  return value.length <= size ? value : `${value.slice(0, size)}...`;
}

export default function PetRecordsPage() {
  const params = useParams();
  const petId = params?.id as string;
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorError, setAnchorError] = useState<string | null>(null);
  const [anchoringId, setAnchoringId] = useState<string | null>(null);
  const { isConnected, chainId } = useWallet();

  useEffect(() => {
    let active = true;
    async function loadRecords() {
      setLoading(true);
      try {
        const response = await fetch(`/api/pets/${petId}/records`);
        if (!response.ok) {
          throw new Error("Không thể tải hồ sơ");
        }
        const data = await response.json();
        if (active) {
          setRecords(data.records ?? []);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError("Không thể tải hồ sơ.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (petId) {
      loadRecords();
    }

    return () => {
      active = false;
    };
  }, [petId]);

  async function handleAnchor(record: MedicalRecord) {
    if (!isConnected) {
      setAnchorError("Vui lòng kết nối ví trước khi neo.");
      return;
    }
    if (chainId !== 31337) {
      setAnchorError("Vui lòng chuyển sang mạng localhost (31337).");
      return;
    }
    setAnchorError(null);
    setAnchoringId(record.id);
    try {
      const response = await fetch("/api/anchor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: record.id }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Không thể tạo hash để neo.");
      }

      const data = (await response.json()) as {
        recordHashHex: string;
        petId: string;
        chainId: number;
        anchorAddress: string;
      };

      if (!(window as any).ethereum) {
        throw new Error("Chưa phát hiện MetaMask.");
      }

      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        data.anchorAddress,
        medicalRecordAnchorAbi,
        signer
      );

      const tx = await contract.anchorRecord(
        data.recordHashHex,
        BigInt(data.petId)
      );
      const receipt = await tx.wait();

      await fetch(`/api/records/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: receipt?.hash ?? tx.hash,
          recordHash: data.recordHashHex,
          chainId: data.chainId,
        }),
      });

      const updated = await fetch(`/api/pets/${petId}/records`);
      const updatedData = await updated.json();
      setRecords(updatedData.records ?? []);
    } catch (err) {
      setAnchorError((err as Error).message || "Không thể neo hồ sơ.");
    } finally {
      setAnchoringId(null);
    }
  }

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Hồ sơ
          </p>
          <h2 className="section-title text-3xl font-semibold">Hồ sơ y tế</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href={`/pets/${petId}`}>Quay lại thú cưng</Link>
          </Button>
          <Button asChild>
            <Link href={`/pets/${petId}/records/new`}>Thêm hồ sơ</Link>
          </Button>
        </div>
      </div>

      {!isConnected ? (
        <WalletButton />
      ) : anchorError ? (
        <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {anchorError}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải hồ sơ...</p>
      ) : error ? (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Không thể tải</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : records.length === 0 ? (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Chưa có hồ sơ</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tạo hồ sơ y tế đầu tiên cho thú cưng này.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record.id} className="glass-panel">
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <CardTitle>{record.title ?? "Chưa đặt tiêu đề"}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(record.visitDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {record.txHash ? (
                    <Badge variant="success">Đã neo</Badge>
                  ) : (
                    <Badge variant="secondary">Đang chờ</Badge>
                  )}
                  {!record.txHash ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAnchor(record)}
                      disabled={!isConnected || anchoringId === record.id}
                    >
                      {anchoringId === record.id ? "Đang neo..." : "Neo hồ sơ"}
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{record.description ?? "Chưa có mô tả."}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {record.recordHash ? (
                    <span>Mã băm: {shorten(record.recordHash, 12)}</span>
                  ) : null}
                  {record.txHash ? (
                    <span>Mã giao dịch: {shorten(record.txHash, 12)}</span>
                  ) : null}
                  {record.chainId ? (
                    <span>Mã chain: {record.chainId}</span>
                  ) : null}
                </div>
                {record.attachmentsUrl ? (
                  <Link
                    className="text-xs font-medium text-primary hover:underline"
                    href={record.attachmentsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Xem tệp đính kèm
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
