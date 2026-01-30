import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AppointmentsPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const now = new Date();
  const appointments = await prisma.appointment.findMany({
    where: {
      pet: { ownerId: session.user.id },
      startAt: { gte: now },
    },
    orderBy: { startAt: "asc" },
    include: { pet: true },
  });

  return (
    <div className="space-y-6 fade-up">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Lịch hẹn
        </p>
        <h2 className="section-title text-3xl font-semibold">
          Lịch hẹn sắp tới
        </h2>
      </div>

      {appointments.length === 0 ? (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Chưa có lịch hẹn</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Bạn chưa có lịch hẹn nào sắp tới.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="glass-panel">
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>{appointment.type}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {appointment.pet.name} •{" "}
                    {appointment.startAt.toLocaleString()}
                  </p>
                </div>
              </CardHeader>
              {appointment.note ? (
                <CardContent className="text-sm text-muted-foreground">
                  {appointment.note}
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
