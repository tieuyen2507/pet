"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BrowserProvider, Contract } from "ethers";
import {
  CalendarClock,
  ClipboardList,
  PawPrint,
  ShieldCheck,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { petAttestationAbi } from "@/lib/contract";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  birthDate?: string | null;
  weightKg?: number | null;
  photoUrl?: string | null;
  notes?: string | null;
}

interface Reminder {
  id: string;
  type: string;
  title: string;
  dueDate: string;
  status: string;
}

interface MedicalRecord {
  id: string;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  cost: number;
  recordType: string;
  recordHash: string;
  issuerAddress?: string | null;
  signature?: string | null;
}

const reminderTypeOptions = [
  "VACCINE",
  "MEDICINE",
  "CHECKUP",
  "GROOMING",
  "OTHER",
] as const;

const speciesOptions = ["DOG", "CAT", "BIRD", "RABBIT", "OTHER"] as const;
const genderOptions = ["MALE", "FEMALE", "UNKNOWN"] as const;

const recordTypeOptions = [
  "VACCINE",
  "DIAGNOSIS",
  "TRANSFER",
  "OTHER",
] as const;

const reminderStatusVariant: Record<string, "default" | "success" | "danger"> = {
  UPCOMING: "default",
  DONE: "success",
  OVERDUE: "danger",
};

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params?.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attestingId, setAttestingId] = useState<string | null>(null);

  const [reminderForm, setReminderForm] = useState({
    type: "VACCINE",
    title: "",
    dueDate: "",
  });

  const [recordForm, setRecordForm] = useState({
    visitDate: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    cost: "",
    recordType: "VACCINE",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    species: "DOG",
    breed: "",
    gender: "UNKNOWN",
    birthDate: "",
    weightKg: "",
    photoUrl: "",
    notes: "",
  });

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";

  const canAttest = useMemo(() => !!contractAddress, [contractAddress]);

  async function loadAll() {
    try {
      setLoading(true);
      const [petRes, reminderRes, recordRes] = await Promise.all([
        fetch(`/api/pets/${petId}`),
        fetch(`/api/pets/${petId}/reminders`),
        fetch(`/api/pets/${petId}/records`),
      ]);

      if (!petRes.ok) {
        throw new Error("Unable to load pet");
      }

      const petData = await petRes.json();
      const reminderData = await reminderRes.json();
      const recordData = await recordRes.json();

      setPet(petData.pet);
      setReminders(reminderData.reminders ?? []);
      setRecords(recordData.records ?? []);
      setError(null);
    } catch (err) {
      setError("Unable to load pet details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (petId) {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId]);

  useEffect(() => {
    if (!pet) return;
    const birthDateValue = pet.birthDate
      ? new Date(pet.birthDate).toISOString().slice(0, 10)
      : "";
    setEditForm({
      name: pet.name ?? "",
      species: pet.species ?? "DOG",
      breed: pet.breed ?? "",
      gender: pet.gender ?? "UNKNOWN",
      birthDate: birthDateValue,
      weightKg: pet.weightKg ? String(pet.weightKg) : "",
      photoUrl: pet.photoUrl ?? "",
      notes: pet.notes ?? "",
    });
  }, [pet]);

  async function handleReminderSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(`/api/pets/${petId}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminderForm),
    });

    if (response.ok) {
      setReminderForm({ type: "VACCINE", title: "", dueDate: "" });
      loadAll();
    }
  }

  async function handleRecordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      visitDate: recordForm.visitDate,
      symptoms: recordForm.symptoms,
      diagnosis: recordForm.diagnosis,
      treatment: recordForm.treatment,
      cost: Number(recordForm.cost),
      recordType: recordForm.recordType,
    };

    const response = await fetch(`/api/pets/${petId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setRecordForm({
        visitDate: "",
        symptoms: "",
        diagnosis: "",
        treatment: "",
        cost: "",
        recordType: "VACCINE",
      });
      loadAll();
    }
  }

  async function handlePetUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsedWeight = editForm.weightKg ? Number(editForm.weightKg) : null;
    const payload = {
      name: editForm.name,
      species: editForm.species,
      breed: editForm.breed,
      gender: editForm.gender,
      birthDate: editForm.birthDate || null,
      weightKg: Number.isFinite(parsedWeight) ? parsedWeight : null,
      photoUrl: editForm.photoUrl || null,
      notes: editForm.notes || null,
    };

    const response = await fetch(`/api/pets/${petId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setError("Unable to update pet profile.");
      return;
    }

    await loadAll();
  }

  async function handlePetDelete() {
    const confirmed = window.confirm(
      "Delete this pet and all related records? This cannot be undone."
    );
    if (!confirmed) return;

    const response = await fetch(`/api/pets/${petId}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Unable to delete pet.");
      return;
    }

    router.push("/pets");
  }

  async function markReminderDone(reminderId: string) {
    await fetch(`/api/reminders/${reminderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });
    loadAll();
  }

  async function deleteReminder(reminderId: string) {
    await fetch(`/api/reminders/${reminderId}`, {
      method: "DELETE" },
    );
    loadAll();
  }

  async function handleAttest(record: MedicalRecord) {
    if (!canAttest) {
      setError("Missing contract address. Configure env first.");
      return;
    }

    try {
      setAttestingId(record.id);

      const prepareRes = await fetch(
        `/api/records/${record.id}/prepare-attestation`,
        { method: "POST" }
      );
      if (!prepareRes.ok) {
        throw new Error("Prepare attestation failed");
      }

      const payload = await prepareRes.json();

      if (!(window as any).ethereum) {
        throw new Error("MetaMask not found");
      }

      const provider = new BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const signature = await signer.signTypedData(
        payload.typedData.domain,
        payload.typedData.types,
        payload.typedData.message
      );

      const contract = new Contract(contractAddress, petAttestationAbi, signer);
      const tx = await contract.attestRecord(
        payload.recordIdBytes32,
        payload.petIdBytes32,
        payload.recordHash,
        payload.typedData.message.recordType
      );
      await tx.wait();

      await fetch(`/api/records/${record.id}/save-signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerAddress: signerAddress,
          signature,
          recordHash: payload.recordHash,
        }),
      });

      await loadAll();
    } catch (err) {
      setError((err as Error).message || "Attestation failed.");
    } finally {
      setAttestingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading pet...</p>;
  }

  if (!pet) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Pet not found.</p>
        <Button variant="outline" onClick={() => router.push("/pets")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Profile
          </p>
          <h2 className="section-title text-3xl font-semibold">{pet.name}</h2>
          <p className="text-sm text-muted-foreground">
            {pet.species} / {pet.breed} / {pet.gender}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => router.push("/pets")}>
            Back to pets
          </Button>
          <Button variant="destructive" onClick={handlePetDelete}>
            Delete pet
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Vitals snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <PawPrint className="h-4 w-4 text-primary" />
            Weight: {pet.weightKg ? `${pet.weightKg} kg` : "N/A"}
          </div>
          <div className="flex items-center gap-3">
            <CalendarClock className="h-4 w-4 text-accent" />
            Birth date: {pet.birthDate ? new Date(pet.birthDate).toLocaleDateString() : "N/A"}
          </div>
          <div className="flex items-center gap-3">
            <ClipboardList className="h-4 w-4 text-primary" />
            Notes: {pet.notes || "No notes"}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Update profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handlePetUpdate}>
            <div className="space-y-2">
              <Label htmlFor="editName">Name</Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Species</Label>
              <Select
                value={editForm.species}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, species: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select species" />
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
              <Label htmlFor="editBreed">Breed</Label>
              <Input
                id="editBreed"
                value={editForm.breed}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, breed: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={editForm.gender}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
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
              <Label htmlFor="editBirthDate">Birth date</Label>
              <Input
                id="editBirthDate"
                type="date"
                value={editForm.birthDate}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    birthDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editWeight">Weight (kg)</Label>
              <Input
                id="editWeight"
                type="number"
                step="0.1"
                value={editForm.weightKg}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    weightKg: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="editPhoto">Photo URL</Label>
              <Input
                id="editPhoto"
                type="url"
                value={editForm.photoUrl}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    photoUrl: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea
                id="editNotes"
                value={editForm.notes}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Update pet</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="reminders">
        <TabsList>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="records">Medical records</TabsTrigger>
        </TabsList>

        <TabsContent value="reminders" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Upcoming care</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reminders yet.</p>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-white/70 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold">{reminder.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {reminder.type} / {new Date(reminder.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={reminderStatusVariant[reminder.status] ?? "default"}>
                          {reminder.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markReminderDone(reminder.id)}
                        >
                          Mark done
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReminder(reminder.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Create reminder</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-3" onSubmit={handleReminderSubmit}>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={reminderForm.type}
                    onValueChange={(value) =>
                      setReminderForm((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reminderTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderTitle">Title</Label>
                  <Input
                    id="reminderTitle"
                    value={reminderForm.title}
                    onChange={(event) =>
                      setReminderForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderDate">Due date</Label>
                  <Input
                    id="reminderDate"
                    type="date"
                    value={reminderForm.dueDate}
                    onChange={(event) =>
                      setReminderForm((prev) => ({
                        ...prev,
                        dueDate: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <Button type="submit">Save reminder</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Medical history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {records.length === 0 ? (
                <p className="text-sm text-muted-foreground">No records yet.</p>
              ) : (
                <div className="space-y-4">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="rounded-xl border border-border bg-white/70 p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold">
                            {record.recordType} / {new Date(record.visitDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cost: {record.cost} / Hash: {record.recordHash.slice(0, 10)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {record.signature ? (
                            <Badge variant="success">Attested</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              !canAttest || attestingId === record.id || !!record.signature
                            }
                            onClick={() => handleAttest(record)}
                          >
                            {record.signature
                              ? "Attested"
                              : attestingId === record.id
                              ? "Attesting..."
                              : "Attest (Vet)"}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                        <p>
                          <span className="font-semibold text-foreground">Symptoms:</span>{" "}
                          {record.symptoms}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Diagnosis:</span>{" "}
                          {record.diagnosis}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Treatment:</span>{" "}
                          {record.treatment}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Issuer:</span>{" "}
                          {record.issuerAddress ? record.issuerAddress : "Not signed"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>New medical record</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleRecordSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="visitDate">Visit date</Label>
                  <Input
                    id="visitDate"
                    type="date"
                    value={recordForm.visitDate}
                    onChange={(event) =>
                      setRecordForm((prev) => ({
                        ...prev,
                        visitDate: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Record type</Label>
                  <Select
                    value={recordForm.recordType}
                    onValueChange={(value) =>
                      setRecordForm((prev) => ({ ...prev, recordType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {recordTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    value={recordForm.symptoms}
                    onChange={(event) =>
                      setRecordForm((prev) => ({
                        ...prev,
                        symptoms: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    value={recordForm.diagnosis}
                    onChange={(event) =>
                      setRecordForm((prev) => ({
                        ...prev,
                        diagnosis: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="treatment">Treatment</Label>
                  <Textarea
                    id="treatment"
                    value={recordForm.treatment}
                    onChange={(event) =>
                      setRecordForm((prev) => ({
                        ...prev,
                        treatment: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={recordForm.cost}
                    onChange={(event) =>
                      setRecordForm((prev) => ({
                        ...prev,
                        cost: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    <ShieldCheck className="inline-block h-4 w-4 text-accent" />{" "}
                    Sign later using the Vet attestation flow.
                  </p>
                  <Button type="submit">Save record</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
