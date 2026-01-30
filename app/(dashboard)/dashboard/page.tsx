import { redirect } from "next/navigation";
import { CalendarCheck, ClipboardList, PawPrint } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

const recordTypeLabel: Record<string, string> = {
  VACCINE: "Tiêm phòng",
  DIAGNOSIS: "Chẩn đoán",
  TRANSFER: "Chuyển tuyến",
  OTHER: "Khác",
};

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const now = new Date();
  const [petCount, upcomingAppointments, recentRecords] = await Promise.all([
    prisma.pet.count({ where: { ownerId: session.user.id } }),
    prisma.appointment.findMany({
      where: {
        pet: { ownerId: session.user.id },
        startAt: { gte: now },
      },
      orderBy: { startAt: "asc" },
      take: 5,
      include: { pet: true },
    }),
    prisma.medicalRecord.findMany({
      where: { pet: { ownerId: session.user.id } },
      orderBy: { visitDate: "desc" },
      take: 5,
      include: { pet: true },
    }),
  ]);

  return (
    <div className="space-y-8 fade-up">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Tổng quan
        </p>
        <h2 className="section-title text-3xl font-semibold">Bảng điều khiển</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng số thú cưng
            </CardTitle>
            <PawPrint className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{petCount}</div>
            <p className="text-sm text-muted-foreground">
              Hồ sơ đang được quản lý.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              5 lịch hẹn sắp tới
            </CardTitle>
            <CalendarCheck className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {upcomingAppointments.length === 0 ? (
              <p>Chưa có lịch hẹn sắp tới.</p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {appointment.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.pet.name}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {appointment.startAt.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              5 hồ sơ y tế gần đây
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {recentRecords.length === 0 ? (
              <p>Chưa có hồ sơ y tế.</p>
            ) : (
              recentRecords.map((record) => (
                <div key={record.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {recordTypeLabel[record.recordType] ?? record.recordType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.pet.name}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {record.visitDate.toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
