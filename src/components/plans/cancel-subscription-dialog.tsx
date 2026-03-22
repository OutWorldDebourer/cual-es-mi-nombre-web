/**
 * Cancel Subscription Dialog — "Cuál es mi nombre" Web
 *
 * Two-step AlertDialog: confirmation → optional reason → cancel.
 * Calls POST /api/subscription/cancel via the backend API client.
 *
 * @module components/plans/cancel-subscription-dialog
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { backendApi, ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

const GRACE_PERIOD_DAYS = 3;

export function CancelSubscriptionDialog() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    setLoading(true);
    try {
      const supabase = createClient();
      const api = backendApi(supabase);
      const result = await api.subscription.cancel(
        reason.trim() || undefined,
      );
      toast.success(result.message);
      setOpen(false);
      setReason("");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.detail);
      } else {
        toast.error("Error inesperado al cancelar. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
          Cancelar suscripción
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar tu suscripción?</AlertDialogTitle>
          <AlertDialogDescription>
            Al cancelar, mantendrás el acceso a todas las funciones de tu plan
            actual durante <strong>{GRACE_PERIOD_DAYS} días</strong> como período de gracia.
            Después, tu cuenta pasará al plan gratuito.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="cancel-reason">
            ¿Por qué cancelas? <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tu opinión nos ayuda a mejorar..."
            maxLength={500}
            rows={3}
          />
          <p className="text-xs text-muted-foreground text-right">
            {reason.length}/500
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Mantener plan
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
          >
            {loading ? "Cancelando..." : "Sí, cancelar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
