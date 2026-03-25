/**
 * Logout Button — "Cuál es mi nombre" Web
 *
 * Client component that handles sign-out via the server action.
 *
 * @module components/dashboard/logout-button
 */

"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      Cerrar sesión
    </Button>
  );
}
