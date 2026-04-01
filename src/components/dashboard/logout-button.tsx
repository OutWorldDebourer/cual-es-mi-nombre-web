/**
 * Logout Button — "Cuál es mi nombre" Web
 *
 * Client component that handles sign-out via the server action.
 *
 * @module components/dashboard/logout-button
 */

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} loading={isLoading} disabled={isLoading}>
      Cerrar sesión
    </Button>
  );
}
