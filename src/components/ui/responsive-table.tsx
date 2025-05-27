
import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveTableRowProps {
  children: React.ReactNode;
  className?: string;
  mobileCardContent?: React.ReactNode;
}

const ResponsiveTable = React.forwardRef<
  HTMLDivElement,
  ResponsiveTableProps
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props}>
    {/* Desktop table view */}
    <div className="hidden md:block">
      <div className="relative w-full overflow-auto">
        <Table className="w-full caption-bottom text-sm">
          {children}
        </Table>
      </div>
    </div>
  </div>
))
ResponsiveTable.displayName = "ResponsiveTable"

const ResponsiveTableRow = React.forwardRef<
  HTMLTableRowElement,
  ResponsiveTableRowProps
>(({ className, children, mobileCardContent, ...props }, ref) => (
  <>
    {/* Desktop row */}
    <TableRow
      ref={ref}
      className={cn("hidden md:table-row", className)}
      {...props}
    >
      {children}
    </TableRow>
    
    {/* Mobile card */}
    {mobileCardContent && (
      <div className="md:hidden mb-4 p-4 border rounded-lg bg-white shadow-sm">
        {mobileCardContent}
      </div>
    )}
  </>
))
ResponsiveTableRow.displayName = "ResponsiveTableRow"

export {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
}
