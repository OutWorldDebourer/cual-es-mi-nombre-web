import { ConsoleClient } from "./ConsoleClient";

export const dynamic = "force-dynamic";

export default function QAConsolePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <ConsoleClient />
    </main>
  );
}
