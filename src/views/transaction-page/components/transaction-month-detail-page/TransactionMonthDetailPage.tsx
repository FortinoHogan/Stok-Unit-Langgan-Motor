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
import { routes } from "@/constants/paths"
import { TransactionService } from "@/helpers/services/TransactionService"
import { transactionModeWordingList } from "../../TransactionPage.constant"
import type { TransactionMonthDetailPageProps, TransactionGroupedRow } from "./TransactionMonthDetailPage.interface"
import { getDayIndex, getMonthIndex, monthFormatter } from "../../utilities"
import { Eye } from "lucide-react"
import type { TransactionDetailRow } from "@/interfaces/ITransactionService"

const TransactionMonthDetailPage = (props: TransactionMonthDetailPageProps) => {
  const { mode } = props

  const navigate = useNavigate()
  const { year: yearParam, month: monthParam } = useParams()

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isShowError, setIsShowError] = useState(false)
  const [transactionList, setTransactionList] = useState<TransactionDetailRow[]>([])
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedDetailRows, setSelectedDetailRows] = useState<TransactionDetailRow[]>([])
  const [selectedDetailTitle, setSelectedDetailTitle] = useState("")
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())

  const handleCloseErrorModal = () => {
    setErrorMessage("")
    setIsShowError(false)
  }

  const handleSelectDay = (day: number) => {
    const detailPathTemplate = mode === "DO"
      ? routes.deliveryOrderDayDetail
      : routes.sellingDayDetail

    navigate(
      detailPathTemplate
        .replace(":year", String(selectedYear))
        .replace(":month", String(selectedMonth))
        .replace(":day", String(day)),
    )
  }

  const handleOpenDetailModal = (row: TransactionGroupedRow) => {
    setSelectedDetailRows(row.details)
    setSelectedDetailTitle(`${row.categoryName} - ${row.typeName} (${row.typeCode})`)
    setIsDetailModalOpen(true)
  }

  const handleFetchTransactionByMonth = async () => {
    if (!isValidYear || !isValidMonth) {
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
  const todayDay = useMemo(() => new Date().getDate(), [])
  const selectedYear = useMemo(() => Number(yearParam), [yearParam])
  const selectedMonth = useMemo(() => Number(monthParam), [monthParam])
  const isValidYear = useMemo(() => Number.isInteger(selectedYear) && selectedYear > 0, [selectedYear])
  const isValidMonth = useMemo(() => Number.isInteger(selectedMonth) && selectedMonth >= 1 && selectedMonth <= 12, [selectedMonth])

  const monthTransactionList = useMemo(() => {
    return transactionList.filter((transaction) => {
      const month = getMonthIndex(mode === "DO" ? transaction.dateDO : transaction.dateOUT)
      return month === selectedMonth
    })
  }, [mode, selectedMonth, transactionList])

  const dayQuantityMap = useMemo(() => {
    const quantityMap: Record<number, number> = {}

    monthTransactionList.forEach((transaction) => {
      const day = getDayIndex(mode === "DO" ? transaction.dateDO : transaction.dateOUT)

      if (day !== null) {
        quantityMap[day] = (quantityMap[day] || 0) + 1
      }
    })

    return quantityMap
  }, [mode, monthTransactionList])

  const displayDays = useMemo(() => {
    const dayList = Object.keys(dayQuantityMap).map((day) => Number(day))
    const shouldIncludeToday = selectedYear === todayYear && selectedMonth === todayMonth

    if (!shouldIncludeToday) {
      return dayList.sort((a, b) => a - b)
    }

    return [...new Set([...dayList, todayDay])].sort((a, b) => a - b)
  }, [dayQuantityMap, selectedMonth, selectedYear, todayDay, todayMonth, todayYear])

  const filteredTransactionList = useMemo(() => {
    if (!displayDays.length) {
      return []
    }

    return monthTransactionList.filter((transaction) => {
      const day = getDayIndex(mode === "DO" ? transaction.dateDO : transaction.dateOUT)
      return day === selectedDay
    })
  }, [displayDays.length, mode, monthTransactionList, selectedDay])

  const groupedTransactionRows = useMemo<TransactionGroupedRow[]>(() => {
    const groupedMap = new Map<string, TransactionGroupedRow>()

    filteredTransactionList.forEach((transaction) => {
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
  }, [filteredTransactionList])

  const transactionColumns: ColumnDef<TransactionGroupedRow>[] = [
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
    handleFetchTransactionByMonth()
  }, [mode, selectedYear, selectedMonth, isValidYear, isValidMonth, todayYear])

  useEffect(() => {
    const shouldUseTodayDay = selectedYear === todayYear && selectedMonth === todayMonth

    if (shouldUseTodayDay) {
      setSelectedDay(todayDay)
      return
    }

    if (displayDays.length) {
      setSelectedDay(displayDays[0])
      return
    }

    setSelectedDay(1)
  }, [displayDays, selectedMonth, selectedYear, todayDay, todayMonth, todayYear])

  return (
    <div>
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
            {modeWording.title} - {monthFormatter.format(new Date(2000, selectedMonth - 1, 1))} {isValidYear ? selectedYear : "-"}
          </h1>
        </div>
        <p className="text-muted-foreground">
          Showing transaction list of {monthFormatter.format(new Date(2000, selectedMonth - 1, 1))} {isValidYear ? selectedYear : "-"}.
        </p>
      </div>

      {isLoading ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AppSkeleton withoutMargin itemClassName="h-16 rounded-xl" />
          <AppSkeleton withoutMargin itemClassName="h-16 rounded-xl" />
          <AppSkeleton withoutMargin itemClassName="h-16 rounded-xl" />
          <AppSkeleton withoutMargin itemClassName="h-16 rounded-xl" />
        </div>
      ) : (
        <div className="mb-6 grid gap-3 sm:grid-cols-5 lg:grid-cols-7">
          {displayDays.length ? displayDays.map((day) => (
            <AppCard
              key={`${mode}-${selectedYear}-${selectedMonth}-${day}`}
              withoutMargin
              title={day}
              action={
                <p className="text-xs text-muted-foreground">
                  Qty: {dayQuantityMap[day] || 0}
                  {selectedYear === todayYear && selectedMonth === todayMonth && day === todayDay
                    ? ` ${modeWording.cardAction} (Today)`
                    : ""}
                </p>
              }
              classNames={{
                title: "text-xl",
                card: day === selectedDay ? "border-primary" : "",
                footer: "flex items-center justify-end",
              }}
              footer={
                <Button type="button" variant={day === selectedDay ? "default" : "outline"} onClick={() => handleSelectDay(day)}>
                  View Detail
                </Button>
              }
            />
          )) : (
            <AppCard
              withoutMargin
              title="No Day Data"
              action={<p className="text-xs text-muted-foreground">Qty: 0</p>}
            />
          )}
        </div>
      )}

      <AppTable
        table={table}
        showNumberColumn
        emptyMessage={isLoading ? "Loading transactions..." : "No transaction found for this day."}
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

export default TransactionMonthDetailPage
