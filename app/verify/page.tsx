import { Contract, JsonRpcProvider, verifyTypedData } from "ethers";
import { prisma } from "@/lib/db";
import { buildRecordHash, buildTypedData, hashToBytes32 } from "@/lib/attestation";
import { petAttestationAbi } from "@/lib/contract";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VerifyPageProps {
  searchParams: { recordId?: string };
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const recordId = searchParams.recordId;

  if (!recordId) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-12 fade-up">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Verify a medical record</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Provide a record ID in the URL: /verify?recordId=&lt;uuid&gt;.
          </CardContent>
        </Card>
      </div>
    );
  }

  const record = await prisma.medicalRecord.findUnique({
    where: { id: recordId },
    include: { pet: true },
  });

  if (!record) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-12 fade-up">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Record not found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Double-check the record ID and try again.
          </CardContent>
        </Card>
      </div>
    );
  }

  const computedHash = buildRecordHash(record, record.pet);
  const recordIdBytes32 = hashToBytes32(record.id);
  const petIdBytes32 = hashToBytes32(record.pet.id);

  const chainId = Number(process.env.CHAIN_ID ?? 31337);
  const contractAddress = process.env.CONTRACT_ADDRESS ?? "";
  const rpcUrl = process.env.RPC_URL ?? "";

  let onchainValid = false;
  let onchainReason = "";
  let signatureValid = false;
  let signatureReason = "";

  if (!rpcUrl || !contractAddress) {
    onchainReason = "Missing RPC_URL or CONTRACT_ADDRESS.";
  } else {
    try {
      const provider = new JsonRpcProvider(rpcUrl);
      const contract = new Contract(contractAddress, petAttestationAbi, provider);
      const attestation = await contract.getAttestation(recordIdBytes32);

      const attestedHash = attestation.recordHash as string;
      const attestedPetId = attestation.petId as string;
      const attestedIssuer = (attestation.issuer as string).toLowerCase();

      if (attestedIssuer === "0x0000000000000000000000000000000000000000") {
        onchainReason = "No on-chain attestation found.";
      } else if (attestedPetId.toLowerCase() !== petIdBytes32.toLowerCase()) {
        onchainReason = "On-chain pet ID does not match this record.";
      } else if (attestedHash.toLowerCase() !== computedHash.toLowerCase()) {
        onchainReason = "On-chain hash does not match computed record hash.";
      } else {
        onchainValid = true;
        onchainReason = "On-chain attestation matches the record hash.";
      }
    } catch (error) {
      onchainReason = "Unable to read attestation from chain.";
    }
  }

  if (!record.signature || !record.issuerAddress) {
    signatureReason = "No signature stored.";
  } else if (!contractAddress) {
    signatureReason = "Missing CONTRACT_ADDRESS for signature verification.";
  } else {
    try {
      const typedData = buildTypedData({
        chainId,
        verifyingContract: contractAddress,
        recordIdBytes32,
        petIdBytes32,
        recordHash: computedHash,
        issuedAt: record.issuedAt,
        recordType: record.recordType,
      });

      const recovered = verifyTypedData(
        typedData.domain,
        typedData.types,
        typedData.message,
        record.signature
      );

      if (recovered.toLowerCase() === record.issuerAddress.toLowerCase()) {
        signatureValid = true;
        signatureReason = "Signature matches the issuer address.";
      } else {
        signatureReason = "Signature does not match issuer address.";
      }
    } catch (error) {
      signatureReason = "Signature verification failed.";
    }
  }

  const overallValid = onchainValid && signatureValid;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-12 fade-up">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Record verification</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={overallValid ? "success" : "danger"}>
              {overallValid ? "VALID" : "INVALID"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Record ID: {record.id}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Pet
              </p>
              <p className="text-lg font-semibold">{record.pet.name}</p>
              <p className="text-sm text-muted-foreground">
                {record.pet.species} / {record.pet.breed}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Visit
              </p>
              <p className="text-lg font-semibold">
                {new Date(record.visitDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {record.recordType} / Cost {record.cost}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-white/70 p-4">
              <p className="text-sm font-semibold">On-chain attestation</p>
              <p className="mt-1 text-xs text-muted-foreground">{onchainReason}</p>
            </div>
            <div className="rounded-xl border border-border bg-white/70 p-4">
              <p className="text-sm font-semibold">Signature verification</p>
              <p className="mt-1 text-xs text-muted-foreground">{signatureReason}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white/70 p-4 text-xs text-muted-foreground">
            <p>Computed hash: {computedHash}</p>
            <p>Issuer address: {record.issuerAddress ?? "Not signed"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
