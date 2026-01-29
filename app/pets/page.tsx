"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PawPrint, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  weightKg?: number | null;
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPets() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/pets?search=${encodeURIComponent(search)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch pets.");
        }
        const data = await response.json();
        if (isMounted) {
          setPets(data.pets ?? []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load pets.");
          setPets([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadPets();
    return () => {
      isMounted = false;
    };
  }, [search]);

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Directory
          </p>
          <h2 className="section-title text-3xl font-semibold">Pets</h2>
        </div>
        <Button asChild>
          <Link href="/pets/new" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add pet
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-white/70 px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          className="border-0 bg-transparent focus-visible:ring-0"
          placeholder="Search pets by name or breed"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading pets...</p>
      ) : error ? (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Unable to load</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : pets.length === 0 ? (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>No pets yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Create a profile to start tracking health records.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pets.map((pet) => (
            <Link key={pet.id} href={`/pets/${pet.id}`}>
              <Card className="h-full transition hover:-translate-y-1 hover:shadow-glow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pet.name}</CardTitle>
                    <Badge variant="secondary">{pet.species}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <PawPrint className="h-4 w-4 text-primary" />
                    {pet.breed} / {pet.gender}
                  </div>
                  <p>Weight: {pet.weightKg ? `${pet.weightKg} kg` : "N/A"}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
