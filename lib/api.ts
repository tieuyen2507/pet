import { getAuthSession } from "@/lib/auth";

export async function requireAuthSession() {
  const session = await getAuthSession();
  if (!session?.user?.id) return null;
  return session;
}

export function hasVetRole(role?: string) {
  return role === "VET" || role === "ADMIN";
}
