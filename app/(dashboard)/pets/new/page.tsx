"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const speciesOptions = ["DOG", "CAT", "BIRD", "RABBIT", "OTHER"] as const;
const genderOptions = ["MALE", "FEMALE", "UNKNOWN"] as const;

export default function NewPetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    species: "DOG",
    breed: "",
    gender: "UNKNOWN",
    birthDate: "",
    weightKg: "",
    photoUrl: "",
    notes: "",
  });

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const parsedWeight = form.weightKg ? Number(form.weightKg) : null;
    const payload = {
      name: form.name,
      species: form.species,
      breed: form.breed,
      gender: form.gender,
      birthDate: form.birthDate || null,
      weightKg: Number.isFinite(parsedWeight) ? parsedWeight : null,
      photoUrl: form.photoUrl || null,
      notes: form.notes || null,
    };

    const response = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setError("Unable to create pet. Check inputs and try again.");
      setLoading(false);
      return;
    }

    const data = await response.json();
    setLoading(false);
    router.push(`/pets/${data.pet.id}`);
  }

  return (
    <div className="space-y-6 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Create
          </p>
          <h2 className="section-title text-3xl font-semibold">New pet</h2>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/pets">Back to pets</Link>
        </Button>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Pet profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Species</Label>
              <Select
                value={form.species}
                onValueChange={(value) => updateField("species", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  {speciesOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                required
                value={form.breed}
                onChange={(event) => updateField("breed", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(value) => updateField("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth date</Label>
              <Input
                id="birthDate"
                type="date"
                value={form.birthDate}
                onChange={(event) => updateField("birthDate", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <Input
                id="weightKg"
                type="number"
                step="0.1"
                value={form.weightKg}
                onChange={(event) => updateField("weightKg", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input
                id="photoUrl"
                type="url"
                value={form.photoUrl}
                onChange={(event) => updateField("photoUrl", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </div>

            {error ? (
              <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger md:col-span-2">
                {error}
              </p>
            ) : null}

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create pet"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
