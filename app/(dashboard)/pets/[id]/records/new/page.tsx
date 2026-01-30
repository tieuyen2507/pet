"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewRecordPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    visitDate: "",
    attachmentsUrl: "",
    recordHash: "",
    txHash: "",
    chainId: "",
  });

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title: form.title,
      description: form.description,
      visitDate: form.visitDate,
      attachmentsUrl: form.attachmentsUrl || null,
      recordHash: form.recordHash || undefined,
      txHash: form.txHash || null,
      chainId: form.chainId ? Number(form.chainId) : null,
    };

    const response = await fetch(`/api/pets/${petId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setError("Không thể tạo hồ sơ. Vui lòng kiểm tra dữ liệu.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push(`/pets/${petId}/records`);
  }

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Hồ sơ
          </p>
          <h2 className="section-title text-3xl font-semibold">
            Hồ sơ y tế mới
          </h2>
        </div>
        <Button variant="ghost" asChild>
          <Link href={`/pets/${petId}/records`}>Quay lại danh sách</Link>
        </Button>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Chi tiết hồ sơ</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                required
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitDate">Ngày khám</Label>
              <Input
                id="visitDate"
                type="date"
                required
                value={form.visitDate}
                onChange={(event) =>
                  updateField("visitDate", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attachmentsUrl">Liên kết tệp đính kèm</Label>
              <Input
                id="attachmentsUrl"
                type="url"
                value={form.attachmentsUrl}
                onChange={(event) =>
                  updateField("attachmentsUrl", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recordHash">Mã băm hồ sơ</Label>
              <Input
                id="recordHash"
                value={form.recordHash}
                onChange={(event) =>
                  updateField("recordHash", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="txHash">Mã giao dịch</Label>
              <Input
                id="txHash"
                value={form.txHash}
                onChange={(event) => updateField("txHash", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chainId">Mã chain</Label>
              <Input
                id="chainId"
                type="number"
                value={form.chainId}
                onChange={(event) =>
                  updateField("chainId", event.target.value)
                }
              />
            </div>

            {error ? (
              <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger md:col-span-2">
                {error}
              </p>
            ) : null}

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Tạo hồ sơ"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
