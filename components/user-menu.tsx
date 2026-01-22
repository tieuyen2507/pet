"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function UserMenu({ name, email }: { name?: string | null; email?: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-semibold">{name ?? "Pet owner"}</p>
        <p className="text-xs text-muted-foreground">{email}</p>
      </div>
      <Button
        variant="outline"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Log out
      </Button>
    </div>
  );
}
