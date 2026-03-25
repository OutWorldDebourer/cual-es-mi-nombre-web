import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function CreditBalanceSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-3.5 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24 rounded-full" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-3.5 w-8 ml-auto" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-3.5 w-10 ml-auto" />
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Skeleton className="h-3.5 w-32" />
      </TableCell>
    </TableRow>
  )
}

export function TransactionTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="hidden sm:table-cell">Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }, (_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function CreditsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <CreditBalanceSkeleton />
      <TransactionTableSkeleton />
    </div>
  )
}
