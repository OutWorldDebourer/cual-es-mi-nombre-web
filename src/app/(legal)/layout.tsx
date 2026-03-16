import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span className="font-bold">Cual es mi nombre</span>
          </Link>
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Volver
            </Link>
          </Button>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {children}
      </main>
    </div>
  );
}
