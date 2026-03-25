import { Fragment } from "react"
import Link from "next/link"
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

  return (
    <div className="border-b px-4 py-2 md:px-6">
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
  )
}
