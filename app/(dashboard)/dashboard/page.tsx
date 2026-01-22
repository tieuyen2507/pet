import { redirect } from "next/navigation";
import { CalendarCheck, ClipboardList, PawPrint } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const [petCount, upcomingReminders, recordCount] = await Promise.all([
    prisma.pet.count({ where: { ownerId: session.user.id } }),
    prisma.reminder.count({
      where: {
        pet: { ownerId: session.user.id },
        status: "UPCOMING",
      },
    }),
    prisma.medicalRecord.count({
      where: { pet: { ownerId: session.user.id } },
    }),
  ]);

  return (
    <div className="space-y-8 fade-up">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Overview
        </p>
        <h2 className="section-title text-3xl font-semibold">Dashboard</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pets managed
            </CardTitle>
            <PawPrint className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{petCount}</div>
            <p className="text-sm text-muted-foreground">Profiles ready for care.</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming reminders
            </CardTitle>
            <CalendarCheck className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{upcomingReminders}</div>
            <p className="text-sm text-muted-foreground">Stay ahead of care tasks.</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Medical records
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{recordCount}</div>
            <p className="text-sm text-muted-foreground">Attested visits and vaccines.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
