import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
    useReactTable,
} from "@tanstack/react-table"

import AppCard from "@/components/app-components/app-card/AppCard"
import AppModal from "@/components/app-components/app-modal/AppModal"
import AppSkeleton from "@/components/app-components/app-skeleton/AppSkeleton"
import AppTable from "@/components/app-components/app-table/AppTable"
import { Button } from "@/components/ui/button"
import { TransactionService } from "@/helpers/services/TransactionService"
import type { TransactionDetailRow } from "@/interfaces/ITransactionService"
import { transactionModeWordingList } from "../../TransactionPage.constant"
import type { TransactionYearDetailPageProps, TransactionYearGroupedRow } from "./TransactionYearDetailPage.interface"
import { routes } from "@/constants/paths"
import { Eye } from "lucide-react"

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" })

const getMonthIndex = (dateText?: string | null) => {
    if (!dateText) {
        return null
    }

    const parsed = new Date(dateText)

    if (Number.isNaN(parsed.getTime())) {
        return null
    }

    return parsed.getMonth() + 1
}

const TransactionYearDetailPage = (props: TransactionYearDetailPageProps) => {
    const { mode } = props

    const navigate = useNavigate()
    const { year: yearParam } = useParams()

    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [isShowError, setIsShowError] = useState(false)
    const [transactionList, setTransactionList] = useState<TransactionDetailRow[]>([])
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedDetailRows, setSelectedDetailRows] = useState<TransactionDetailRow[]>([])
    const [selectedDetailTitle, setSelectedDetailTitle] = useState("")
    const [selectedMonth] = useState(new Date().getMonth() + 1)

    const handleCloseErrorModal = () => {
        setErrorMessage("")
        setIsShowError(false)
    }

    const handleSelectMonth = (month: number) => {
        const detailPathTemplate = mode === "DO"
            ? routes.deliveryOrderMonthDetail
            : routes.sellingMonthDetail

        navigate(
            detailPathTemplate
                .replace(":year", String(selectedYear))
                .replace(":month", String(month)),
        )
    }

    const handleOpenDetailModal = (row: TransactionYearGroupedRow) => {
        setSelectedDetailRows(row.details)
        setSelectedDetailTitle(`${row.categoryName} - ${row.typeName} (${row.typeCode})`)
        setIsDetailModalOpen(true)
    }

    const handleFetchTransactionByYear = async () => {
        if (!isValidYear) {
            navigate(routes.notFound, { replace: true })
            return
        }

        const distinctYearResponse = await TransactionService.getDistinctTransactionYears()
        const validYearList = mode === "DO"
            ? distinctYearResponse.dateDOYears
            : distinctYearResponse.dateOUTYears

        const hasTransactionInYear = validYearList.includes(selectedYear)

        if (!hasTransactionInYear && selectedYear !== todayYear) {
            navigate(routes.notFound, { replace: true })
            return
        }

        await TransactionService.getTransactionsByModeYear({
            mode,
            year: selectedYear,
            setIsLoading,
        })
            .then((res) => {
                setTransactionList(res.data || [])
            })
            .catch((error) => {
                setErrorMessage(error.message)
                setIsShowError(true)
            })
    }

    const modeWording = useMemo(() => transactionModeWordingList[mode], [mode])
    const todayYear = useMemo(() => new Date().getFullYear(), [])
    const todayMonth = useMemo(() => new Date().getMonth() + 1, [])
    const selectedYear = useMemo(() => Number(yearParam), [yearParam])
    const isValidYear = useMemo(
        () => Number.isInteger(selectedYear) && selectedYear > 0,
        [selectedYear],
    )

    const monthQuantityMap = useMemo(() => {
        const quantityMap: Record<number, number> = {}

        transactionList.forEach((transaction) => {
            const month = getMonthIndex(mode === "DO" ? transaction.dateDO : transaction.dateOUT)

            if (month !== null) {
                quantityMap[month] = (quantityMap[month] || 0) + 1
            }
        })

        return quantityMap
    }, [transactionList, mode])

    const displayMonths = useMemo(() => {
        const monthList = Object.keys(monthQuantityMap).map((month) => Number(month))
        return [...new Set([...monthList, todayMonth])].sort((a, b) => a - b)
    }, [monthQuantityMap, todayMonth])

    const groupedTransactionRows = useMemo<TransactionYearGroupedRow[]>(() => {
        const groupedMap = new Map<string, TransactionYearGroupedRow>()

        transactionList.forEach((transaction) => {
            const categoryName = transaction.categoryName || "-"
            const typeName = transaction.typeName || "-"
            const typeCode = transaction.typeCode || "-"
            const key = `${categoryName}|${typeName}|${typeCode}|${transaction.year}`

            const existing = groupedMap.get(key)

            if (existing) {
                existing.quantity += 1
                existing.details.push(transaction)
                return
            }

            groupedMap.set(key, {
                key,
                categoryName,
                typeName,
                typeCode,
                year: transaction.year,
                quantity: 1,
                details: [transaction],
            })
        })

        return Array.from(groupedMap.values())
    }, [transactionList])

    const transactionColumns: ColumnDef<TransactionYearGroupedRow>[] = [
        {
            accessorKey: "categoryName",
            header: "Category",
        },
        {
            accessorKey: "typeName",
            header: "Type Name",
        },
        {
            accessorKey: "typeCode",
            header: "Type Code",
        },
        {
            accessorKey: "year",
            header: "Year",
        },
        {
            accessorKey: "quantity",
            header: "Quantity",
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetailModal(row.original)}
                >
                    <Eye className="size-4" />
                </Button>
            ),
        },
    ]

    const table = useReactTable({
        data: groupedTransactionRows,
        columns: transactionColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    useEffect(() => {
        handleFetchTransactionByYear()
    }, [mode, selectedYear, isValidYear, todayYear])

    return (
        <div>
            <div className="mb-4">
                <div className="mb-2 flex items-center gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                        {modeWording.title} - {isValidYear ? selectedYear : "-"}
                    </h1>
                </div>
                <p className="text-muted-foreground">Showing transaction list of year {isValidYear ? selectedYear : "-"}.</p>

            </div>

            {isLoading ? (
                <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <AppSkeleton withoutMargin itemClassName="h-16 rounded-xl" />
                    <AppSkeleton withoutMargin itemClassName="h-16 rounded-xl" />
                    <AppSkeleton withoutMargin itemClassName="h-16 rounded-xl" />
                    <AppSkeleton withoutMargin itemClassName="h-16 rounded-xl" />
                </div>
            ) : (
                <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {displayMonths.length ? displayMonths.map((month) => (
                        <AppCard
                            key={`${mode}-${selectedYear}-${month}`}
                            withoutMargin
                            title={monthFormatter.format(new Date(2000, month - 1, 1))}
                            action={
                                <p className="text-xs text-muted-foreground">
                                    Qty: {monthQuantityMap[month] || 0}{month === todayMonth ? ` ${modeWording.cardAction} (Today)` : ""}
                                </p>
                            }
                            classNames={{
                                title: "text-xl",
                                card: month === selectedMonth ? "border-primary" : "",
                                footer: "flex items-center justify-end",
                            }}
                            footer={
                                <Button type="button" variant={month === selectedMonth ? "default" : "outline"} onClick={() => handleSelectMonth(month)}>
                                    View Detail
                                </Button>
                            }
                        />
                    )) : (
                        <AppCard
                            withoutMargin
                            title="No Month Data"
                            action={<p className="text-xs text-muted-foreground">Qty: 0</p>}
                        />
                    )}
                </div>
            )}

            <AppTable
                table={table}
                showNumberColumn
                emptyMessage={isLoading ? "Loading transactions..." : "No transaction found for this year."}
            />

            <AppModal
                open={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
                title={selectedDetailTitle || "Detail"}
                showCloseButton={true}
                classNames={{
                    content: "sm:max-w-lg",
                    body: "space-y-2",
                    footer: "bg-muted/30",
                }}
                footer={
                    <div className="flex w-full justify-center">
                        <Button type="button" onClick={() => setIsDetailModalOpen(false)}>
                            Close
                        </Button>
                    </div>
                }
            >
                {selectedDetailRows.length ? selectedDetailRows.map((item) => (
                    <div key={item.transactionId} className="rounded-md border p-2 text-sm">
                        <p>No Mesin: {item.noMesin || "-"}</p>
                        <p>No Rangka: {item.noRangka || "-"}</p>
                        <p>
                            Date DO: {item.dateDO ? new Intl.DateTimeFormat("en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            }).format(new Date(item.dateDO)) : "-"}
                        </p>
                    </div>
                )) : <p className="text-sm text-muted-foreground">No detail found.</p>}
            </AppModal>

            <AppModal
                open={isShowError}
                onOpenChange={setIsShowError}
                title="Error"
                showCloseButton={true}
                classNames={{
                    content: "sm:max-w-sm",
                    header: "gap-1",
                    title: "text-lg",
                    description: "text-xs",
                    body: "space-y-3",
                    footer: "bg-muted/30",
                }}
                footer={
                    <div className="flex w-full justify-center">
                        <Button type="button" onClick={handleCloseErrorModal}>
                            OK
                        </Button>
                    </div>
                }
            >
                <p>{errorMessage}</p>
            </AppModal>
        </div>
    )
}

export default TransactionYearDetailPage
