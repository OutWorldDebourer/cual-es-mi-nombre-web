/**
 * AuthFooterLink — Client link that preserves the current `?next=` param.
 *
 * Drop-in replacement for a plain `<Link>` in auth pages so lateral
 * navigation (signup → login, login → signup, recovery → login, etc.)
 * doesn't lose the post-auth destination encoded in the URL.
 *
 * Rendered in a `<Suspense>` boundary — `useSearchParams` forces client-side
 * param reading, which Next.js requires to be wrapped in Suspense.
 *
 * @module components/auth/auth-footer-link
 */

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { preserveNext } from "@/lib/auth/next-url";

interface AuthFooterLinkProps {
  /** Target auth route. Restricted to known safe paths. */
  href: "/login" | "/signup" | "/recovery" | "/set-password";
  children: React.ReactNode;
  className?: string;
}

export function AuthFooterLink({ href, children, className }: AuthFooterLinkProps) {
  const searchParams = useSearchParams();
  return (
    <Link href={preserveNext(href, searchParams)} className={className}>
      {children}
    </Link>
  );
}
