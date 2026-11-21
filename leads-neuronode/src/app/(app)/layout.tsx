import { Nav } from "@/components/Nav";
import { getSesion } from "@/lib/sesion";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await getSesion();
  return (
    <div className="flex min-h-dvh">
      <Nav />
      <main className="min-w-0 flex-1 px-4 pt-6 pb-24 sm:px-8 md:pb-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
