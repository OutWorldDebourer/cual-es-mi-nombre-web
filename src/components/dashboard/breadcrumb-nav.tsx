import { Fragment } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface DashboardBreadcrumbProps {
  pathname: string
  routeLabels: Record<string, string>
}

export function DashboardBreadcrumb({ pathname, routeLabels }: DashboardBreadcrumbProps) {
  if (pathname === "/dashboard") return null

  const parts = pathname.split("/").filter(Boolean)
  const paths = parts.map((_, i) => "/" + parts.slice(0, i + 1).join("/"))

  // Parent path for mobile back link (one level up)
  const parentPath = paths.length >= 2 ? paths[paths.length - 2] : "/dashboard"
  const parentLabel = routeLabels[parentPath] ?? (parts.length >= 2 ? parts[parts.length - 2] : "Inicio")

  return (
    <>
      {/* Mobile: back link */}
      <div className="md:hidden border-b px-4 py-2">
        <Link
          href={parentPath}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {parentLabel}
        </Link>
      </div>

      {/* Desktop: full breadcrumb */}
      <div className="hidden md:block border-b px-4 py-2 md:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            {paths.map((path, index) => {
              const label = routeLabels[path] ?? parts[index]
              const isLast = index === paths.length - 1

              return (
                <Fragment key={path}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={path}>{label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </>
  )
}
