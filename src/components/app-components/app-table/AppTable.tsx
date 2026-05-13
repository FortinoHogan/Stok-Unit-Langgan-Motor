import { flexRender } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

import type { AppTableProps } from "./AppTable.interface"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const AppTable = <TData,>(props: AppTableProps<TData>) => {
    const {
        table,
        isLoading = false,
        loadingRowCount = 6,
        columnsCount,
        showNumberColumn = false,
        numberColumnHeader = "No",
        emptyMessage = "No data found.",
        enableSorting = true,
        classNames,
        wrapperProps,
        tableContainerProps,
        tableProps,
        showPagination = false,
        page = 1,
        pageSize = table.getState().pagination?.pageSize ?? 10,
        rowCount = table.getRowModel().rows.length,
        hasNextPage = false,
        pageSizeOptions = [5, 10, 20],
        rowsPerPageLabel = "Rows",
        pageInfoRenderer,
        onPreviousPage,
        onNextPage,
        onPageSizeChange,
        paginationRenderer,
    } = props

    const rowModel = table.getRowModel()
    const visibleColumnLength = table.getVisibleLeafColumns().length
    const resolvedColumnsCount = (columnsCount ?? visibleColumnLength) + (showNumberColumn ? 1 : 0)
    const safeColSpan = Math.max(resolvedColumnsCount || 1, 1)

    const paginationContext = {
        page,
        pageSize,
        rowCount,
        hasNextPage,
        canPreviousPage: page > 1,
        pageSizeOptions,
        onPreviousPage: () => {
            onPreviousPage?.()
        },
        onNextPage: () => {
            onNextPage?.()
        },
        onPageSizeChange,
    }

    return (
        <div className={cn("min-w-0 space-y-4", classNames?.wrapper)} {...wrapperProps}>
            <div className={cn("min-w-0 rounded-lg border overflow-x-auto", classNames?.tableContainer)} {...tableContainerProps}>
                <Table
                    className={cn(
                        "min-w-full w-max table-auto [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap",
                        classNames?.table,
                    )}
                    {...tableProps}
                >
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {showNumberColumn ? (
                                    <TableHead className={cn(classNames?.headerCell)}>
                                        {numberColumnHeader}
                                    </TableHead>
                                ) : null}
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className={cn(classNames?.headerCell)}>
                                        {header.isPlaceholder ? null : (
                                            enableSorting && header.column.getCanSort() ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn("-ml-2 h-8 gap-1", classNames?.sortButton)}
                                                    onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getIsSorted() === "asc" ? (
                                                        <ArrowUp className="h-3.5 w-3.5" />
                                                    ) : header.column.getIsSorted() === "desc" ? (
                                                        <ArrowDown className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                                                    )}
                                                </Button>
                                            ) : (
                                                flexRender(header.column.columnDef.header, header.getContext())
                                            )
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: loadingRowCount }).map((_, rowIndex) => (
                                <TableRow key={`loading-${rowIndex}`} className={cn(classNames?.bodyRow)}>
                                    {showNumberColumn ? (
                                        <TableCell className={cn(classNames?.bodyCell)}>
                                            <Skeleton className="h-4 w-6" />
                                        </TableCell>
                                    ) : null}
                                    {Array.from({ length: visibleColumnLength }).map((__, cellIndex) => (
                                        <TableCell key={`loading-cell-${rowIndex}-${cellIndex}`} className={cn(classNames?.bodyCell)}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : rowModel.rows.length ? (
                            rowModel.rows.map((row, rowIndex) => (
                                <TableRow key={row.id} className={cn(classNames?.bodyRow)}>
                                    {showNumberColumn ? (
                                        <TableCell className={cn(classNames?.bodyCell)}>
                                            <p className="pl-2">{(page - 1) * pageSize + rowIndex + 1}</p>
                                        </TableCell>
                                    ) : null}
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className={cn(classNames?.bodyCell)}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={safeColSpan} className={cn("h-24 text-center", classNames?.emptyCell)}>
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {showPagination
                ? paginationRenderer
                    ? paginationRenderer(paginationContext)
                    : (
                        <div className={cn("flex flex-wrap items-center justify-between gap-3", classNames?.paginationWrapper)}>
                            <p className={cn("text-sm text-muted-foreground", classNames?.paginationInfo)}>
                                {pageInfoRenderer
                                    ? pageInfoRenderer(paginationContext)
                                    : `Page ${page} - ${rowCount} row(s)`}
                            </p>

                            <div className={cn("flex flex-wrap items-center gap-2", classNames?.paginationActions)}>
                                <Label htmlFor="app-table-page-size">{rowsPerPageLabel}</Label>
                                <Select
                                    value={String(pageSize)}
                                    onValueChange={(event) => {
                                        onPageSizeChange?.(Number(event))
                                    }}
                                >
                                    <SelectTrigger id="page-size-user" className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        {pageSizeOptions.map((option) => (
                                            <SelectItem key={option} value={String(option)}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        paginationContext.onPreviousPage()
                                    }}
                                    disabled={!paginationContext.canPreviousPage}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        paginationContext.onNextPage()
                                    }}
                                    disabled={!paginationContext.hasNextPage}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )
                : null}
        </div>
    )
}

export default AppTable
