"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  useEffect(() => {
    let active = true;
    async function loadRecords() {
      setLoading(true);
      try {
        const response = await fetch(`/api/pets/${petId}/records`);
        if (!response.ok) {
          throw new Error("Failed to load records");
        }
        const data = await response.json();
        if (active) {
          setRecords(data.records ?? []);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError("Unable to load records.");
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

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Records
          </p>
          <h2 className="section-title text-3xl font-semibold">
            Medical records
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href={`/pets/${petId}`}>Back to pet</Link>
          </Button>
          <Button asChild>
            <Link href={`/pets/${petId}/records/new`}>Add record</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading records...</p>
      ) : error ? (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Unable to load</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : records.length === 0 ? (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>No records yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Create the first medical record for this pet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record.id} className="glass-panel">
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <CardTitle>{record.title ?? "Untitled record"}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(record.visitDate).toLocaleDateString()}
                  </p>
                </div>
                {record.txHash ? (
                  <Badge variant="success">Anchored</Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{record.description ?? "No description provided."}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {record.recordHash ? (
                    <span>recordHash: {shorten(record.recordHash, 12)}</span>
                  ) : null}
                  {record.txHash ? (
                    <span>txHash: {shorten(record.txHash, 12)}</span>
                  ) : null}
                  {record.chainId ? <span>chainId: {record.chainId}</span> : null}
                </div>
                {record.attachmentsUrl ? (
                  <Link
                    className="text-xs font-medium text-primary hover:underline"
                    href={record.attachmentsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View attachment
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
