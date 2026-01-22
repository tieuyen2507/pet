export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff4e6] to-[#e0f2f1]">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white/80 p-8 shadow-soft backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}
