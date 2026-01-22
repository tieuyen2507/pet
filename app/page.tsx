import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getAuthSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-10 top-24 h-72 w-72 rounded-full bg-accent/20 blur-[140px]" />
      </div>

      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-6 py-16 fade-up">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1">
            <Sparkles className="h-4 w-4 text-primary" />
            Blockchain-backed care timeline
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Vet-signed records
          </span>
        </div>

        <div className="space-y-6">
          <h1 className="section-title text-4xl font-semibold tracking-tight sm:text-5xl">
            Pet Health Passport
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Track pets, reminders, and medical records in one place. When a vet
            signs, a tamper-proof hash is anchored on-chain so anyone can verify
            the record instantly.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button asChild size="lg">
            <Link href="/register">Create account</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
