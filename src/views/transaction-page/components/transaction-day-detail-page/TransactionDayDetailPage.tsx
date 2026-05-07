import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table"
import { Eye } from "lucide-react"

import AppModal from "@/components/app-components/app-modal/AppModal"
import AppTable from "@/components/app-components/app-table/AppTable"
import { Button } from "@/components/ui/button"
import { routes } from "@/constants/paths"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { TransactionService } from "@/helpers/services/TransactionService"
import type { TransactionDetailRow } from "@/interfaces/ITransactionService"
import { transactionModeWordingList } from "../../TransactionPage.constant"
import { getDayIndex, getMonthIndex, monthFormatter } from "../../utilities"
import type {
  TransactionDayDetailPageProps,
  TransactionDayGroupedRow,
} from "./TransactionDayDetailPage.interface"

const TransactionDayDetailPage = (props: TransactionDayDetailPageProps) => {
  const { mode } = props

  const navigate = useNavigate()
  const { year: yearParam, month: monthParam, day: dayParam } = useParams()
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isShowError, setIsShowError] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isConfirmAddModalOpen, setIsConfirmAddModalOpen] = useState(false)
  const [transactionList, setTransactionList] = useState<TransactionDetailRow[]>([])
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedDetailRows, setSelectedDetailRows] = useState<TransactionDetailRow[]>([])
  const [selectedDetailTitle, setSelectedDetailTitle] = useState("")
  const [typeColorIdInput, setTypeColorIdInput] = useState("")
  const [noMesinInput, setNoMesinInput] = useState("")
  const [noRangkaInput, setNoRangkaInput] = useState("")
  const [isRFSInput, setIsRFSInput] = useState(false)

  const handleCloseErrorModal = () => {
    setErrorMessage("")
    setIsShowError(false)
  }

  const resetInsertForm = () => {
    setTypeColorIdInput("")
    setNoMesinInput("")
    setNoRangkaInput("")
    setIsRFSInput(false)
  }

  const handleOpenAddModal = () => {
    resetInsertForm()
    setIsAddModalOpen(true)
  }

  const handleOpenConfirmAddModal = () => {
    if (!typeColorIdInput.trim() || !noMesinInput.trim() || !noRangkaInput.trim()) {
      setErrorMessage("Please fill Type Color Id, No Mesin, and No Rangka")
      setIsShowError(true)
      return
    }

    setIsConfirmAddModalOpen(true)
  }

  const handleInsertTransaction = async () => {
    const userId = authenticatedUser?.userId

    if (!userId) {
      setErrorMessage("Authenticated user not found. Please login again.")
      setIsShowError(true)
      return
    }

    const parsedTypeColorId = Number(typeColorIdInput)

    if (!Number.isInteger(parsedTypeColorId) || parsedTypeColorId <= 0) {
      setErrorMessage("Type Color Id must be a valid number")
      setIsShowError(true)
      return
    }

    const selectedDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`

    await TransactionService.insertTransaction({
      typeColorId: parsedTypeColorId,
      noMesin: noMesinInput.trim(),
      noRangka: noRangkaInput.trim(),
      year: selectedYear,
      isRFS: isRFSInput,
      dateDO: mode === "DO" ? selectedDate : null,
      dateOUT: mode === "SELLING" ? selectedDate : null,
      userIn: userId,
      setIsLoading,
    })
      .then(() => {
        setIsConfirmAddModalOpen(false)
        setIsAddModalOpen(false)
        resetInsertForm()
        handleFetchTransactionByDay()
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
  }

  const handleOpenDetailModal = (row: TransactionDayGroupedRow) => {
    setSelectedDetailRows(row.details)
    setSelectedDetailTitle(`${row.categoryName} - ${row.typeName} (${row.typeCode})`)
    setIsDetailModalOpen(true)
  }

  const handleFetchTransactionByDay = async () => {
    if (!isValidYear || !isValidMonth || !isValidDay) {
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
  const selectedYear = useMemo(() => Number(yearParam), [yearParam])
  const selectedMonth = useMemo(() => Number(monthParam), [monthParam])
  const selectedDay = useMemo(() => Number(dayParam), [dayParam])
  const isValidYear = useMemo(() => Number.isInteger(selectedYear) && selectedYear > 0, [selectedYear])
  const isValidMonth = useMemo(() => Number.isInteger(selectedMonth) && selectedMonth >= 1 && selectedMonth <= 12, [selectedMonth])
  const isValidDay = useMemo(() => Number.isInteger(selectedDay) && selectedDay >= 1 && selectedDay <= 31, [selectedDay])

  const filteredTransactionList = useMemo(() => {
    return transactionList.filter((transaction) => {
      const month = getMonthIndex(mode === "DO" ? transaction.dateDO : transaction.dateOUT)
      const day = getDayIndex(mode === "DO" ? transaction.dateDO : transaction.dateOUT)

      return month === selectedMonth && day === selectedDay
    })
  }, [mode, selectedDay, selectedMonth, transactionList])

  const groupedTransactionRows = useMemo<TransactionDayGroupedRow[]>(() => {
    const groupedMap = new Map<string, TransactionDayGroupedRow>()

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

  const transactionColumns: ColumnDef<TransactionDayGroupedRow>[] = [
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
    handleFetchTransactionByDay()
  }, [mode, selectedYear, selectedMonth, selectedDay, isValidYear, isValidMonth, isValidDay, todayYear])

  return (
    <div>
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
            {modeWording.title} - {selectedDay} {monthFormatter.format(new Date(2000, selectedMonth - 1, 1))} {isValidYear ? selectedYear : "-"}
          </h1>
        </div>
        <p className="mb-3 text-muted-foreground">
          Showing transaction list of day {selectedDay} in {monthFormatter.format(new Date(2000, selectedMonth - 1, 1))} {isValidYear ? selectedYear : "-"}.
        </p>

        <Button type="button" onClick={handleOpenAddModal}>
          {mode === "DO" ? "Add Delivery Order" : "Add Selling"}
        </Button>
      </div>

      <AppTable
        table={table}
        showNumberColumn
        emptyMessage={isLoading ? "Loading transactions..." : "No transaction found for this day."}
      />

      <AppModal
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open)

          if (!open) {
            resetInsertForm()
          }
        }}
        title={mode === "DO" ? "Add Delivery Order" : "Add Selling"}
        showCloseButton={true}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                resetInsertForm()
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleOpenConfirmAddModal}>
              Save
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Form content intentionally left blank for custom editing.
        </p>
      </AppModal>

      <AppModal
        open={isConfirmAddModalOpen}
        onOpenChange={setIsConfirmAddModalOpen}
        title={mode === "DO" ? "Confirm Add Delivery Order" : "Confirm Add Selling"}
        showCloseButton={true}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleInsertTransaction}>
              Confirm
            </Button>
          </div>
        }
      >
        <p className="text-sm">
          {mode === "DO" ? "Add Delivery Order" : "Add Selling"} for {selectedDay} {monthFormatter.format(new Date(2000, selectedMonth - 1, 1))} {selectedYear}?
        </p>
      </AppModal>

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

export default TransactionDayDetailPage
