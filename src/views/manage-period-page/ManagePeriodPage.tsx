import AppExistingList from "@/components/app-components/app-existing-list/AppExistingList"
import AppModal from "@/components/app-components/app-modal/AppModal"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
import AppSwitch from "@/components/app-components/app-switch/AppSwitch"
import AppTable from "@/components/app-components/app-table/AppTable"
import AppSearchBar from "@/components/app-layout/app-search-bar/AppSearchBar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { usePrivilegeAccess } from "@/helpers/hooks/usePrivilegeAccess/usePrivilegeAccess"
import { PeriodService } from "@/helpers/services/PeriodService"
import type {
    DeletePeriodRequest,
    GetPeriodListRequest,
    InsertPeriodRequest,
    UpdatePeriodRequest,
} from "@/interfaces/IPeriodService"
import type { MsPeriod } from "@/interfaces/IModel.interface"
import {
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
    useReactTable,
} from "@tanstack/react-table"
import { Pencil, Trash } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
    MANAGE_PERIOD_PAGE_SIZE_OPTIONS,
    type PendingActionManagePeriod,
} from "./ManagePeriodPage.constant"
import AppDatePicker from "@/components/app-components/app-datepicker/AppDatePicker"
import { formatDateAsYmd, formatShortDate } from "@/lib/utils"

const ManagePeriodPage = () => {
    const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
    const periodAccess = usePrivilegeAccess("Master Period")

    const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false)
    const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [isShowError, setIsShowError] = useState(false)
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [isDefault, setIsDefault] = useState(false)
    const [editingPeriodId, setEditingPeriodId] = useState<number | null>(null)
    const [pendingAction, setPendingAction] = useState<PendingActionManagePeriod>(null)
    const [pendingDeletePeriod, setPendingDeletePeriod] = useState<MsPeriod | null>(null)

    const [periodList, setPeriodList] = useState<MsPeriod[]>([])
    const [existingPeriodList, setExistingPeriodList] = useState<MsPeriod[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)

    const managePeriodTableColumns: ColumnDef<MsPeriod>[] = [
        {
            accessorKey: "startDate",
            header: "Start Date",
            cell: ({ row }) => formatShortDate(row.original.startDate),
        },
        {
            accessorKey: "endDate",
            header: "End Date",
            cell: ({ row }) => formatShortDate(row.original.endDate),
        },
        {
            accessorKey: "isDefault",
            header: "Default",
            cell: ({ row }) => (row.original.isDefault ? "Yes" : "No"),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {periodAccess.canUpdate ? (
                        <Button
                            variant="outline"
                            size="sm"
                            title="Edit period"
                            onClick={() => handleEditPeriod(row.original)}
                        >
                            <Pencil className="size-4" />
                        </Button>
                    ) : null}
                    {periodAccess.canDelete ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            title="Delete period"
                            onClick={() => handleOpenDeleteConfirmation(row.original)}
                        >
                            <Trash className="size-4" />
                        </Button>
                    ) : null}
                </div>
            ),
        },
    ]

    const hasNextPage = page * pageSize < totalCount

    const table = useReactTable({
        data: periodList,
        columns: managePeriodTableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const filteredExistingPeriodList = useMemo(() => {
        const keyword = `${startDate} ${endDate}`.trim().toLowerCase()
        const labels = existingPeriodList.map(
            (p) => `${formatShortDate(p.startDate)} - ${formatShortDate(p.endDate)}`,
        )

        if (!keyword) {
            return labels
        }

        return labels.filter((label) => label.toLowerCase().includes(keyword))
    }, [existingPeriodList, startDate, endDate])

    const ensureAuthenticatedUserId = () => {
        const userId = authenticatedUser?.userId

        if (!userId) {
            setErrorMessage("Authenticated user not found. Please login again.")
            setIsShowError(true)
            return null
        }

        return userId
    }

    const resetPeriodForm = () => {
        setStartDate(undefined)
        setEndDate(undefined)
        setIsDefault(false)
        setEditingPeriodId(null)
    }

    const resetConfirmActionState = () => {
        setPendingAction(null)
        setPendingDeletePeriod(null)
        setIsConfirmActionModalOpen(false)
    }

    const handleOpenCreateModal = () => {
        resetPeriodForm()
        handleFetchExistingPeriods()
        setIsUpsertModalOpen(true)
    }

    const handleEditPeriod = (period: MsPeriod) => {
        setEditingPeriodId(period.periodId)
        setStartDate(new Date(period.startDate))
        setEndDate(new Date(period.endDate))
        setIsDefault(period.isDefault)
        handleFetchExistingPeriods()
        setIsUpsertModalOpen(true)
    }

    const handleOpenUpdateConfirmation = () => {
        if (!editingPeriodId || !startDate || !endDate) {
            return
        }

        setPendingAction("update")
        setPendingDeletePeriod(null)
        setIsConfirmActionModalOpen(true)
    }

    const handleOpenInsertConfirmation = () => {
        if (!startDate || !endDate) {
            return
        }

        setPendingAction("insert")
        setPendingDeletePeriod(null)
        setIsConfirmActionModalOpen(true)
    }

    const handleOpenDeleteConfirmation = (period: MsPeriod) => {
        setPendingAction("delete")
        setPendingDeletePeriod(period)
        setIsConfirmActionModalOpen(true)
    }

    const isDuplicatePeriodRange = () => {
        return existingPeriodList.some((period) => {
            const isSameRecord = editingPeriodId ? period.periodId === editingPeriodId : false

            if (isSameRecord) {
                return false
            }

            if (!startDate || !endDate) {
                return false;
            }

            return (
                formatDateAsYmd(new Date(period.startDate)) === formatDateAsYmd(startDate) &&
                formatDateAsYmd(new Date(period.endDate)) === formatDateAsYmd(endDate)
            );
        })
    }

    const handleInsert = async () => {
        if (!startDate || !endDate) {
            return
        }

        if (startDate > endDate) {
            setErrorMessage("Start date cannot be greater than end date")
            setIsShowError(true)
            return
        }

        if (isDuplicatePeriodRange()) {
            setErrorMessage("Period range already exists")
            setIsShowError(true)
            return
        }

        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: InsertPeriodRequest = {
            startDate: formatDateAsYmd(startDate),
            endDate: formatDateAsYmd(endDate),
            isDefault,
            userIn: userId,
            setIsLoading,
        }

        await PeriodService.insertPeriod(payload)
            .then(() => {
                setIsUpsertModalOpen(false)
                resetPeriodForm()
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Period added successfully")
                setIsShowError(true)
                handleFetchPeriods()
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleUpdate = async () => {
        if (!editingPeriodId || !startDate || !endDate) {
            return
        }

        if (startDate > endDate) {
            setErrorMessage("Start date cannot be greater than end date")
            setIsShowError(true)
            return
        }

        if (isDuplicatePeriodRange()) {
            setErrorMessage("Period range already exists")
            setIsShowError(true)
            return
        }

        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: UpdatePeriodRequest = {
            periodId: editingPeriodId,
            startDate: formatDateAsYmd(startDate),
            endDate: formatDateAsYmd(endDate),
            isDefault,
            userUp: userId,
            updatedAt: new Date().toISOString(),
            setIsLoading,
        }

        await PeriodService.updatePeriod(payload)
            .then(() => {
                setIsUpsertModalOpen(false)
                resetPeriodForm()
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Period updated successfully")
                setIsShowError(true)
                handleFetchPeriods()
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleDeletePeriod = async (period: MsPeriod) => {
        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: DeletePeriodRequest = {
            periodId: period.periodId,
            userUp: userId,
            updatedAt: new Date().toISOString(),
            setIsLoading,
        }

        await PeriodService.deletePeriod(payload)
            .then(() => {
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Period deleted successfully")
                setIsShowError(true)

                if (periodList.length === 1 && page > 1) {
                    setPage((prev) => prev - 1)
                    return
                }

                handleFetchPeriods()
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleConfirmAction = async () => {
        if (pendingAction === "insert") {
            await handleInsert()
            return
        }

        if (pendingAction === "update") {
            await handleUpdate()
            return
        }

        if (pendingAction === "delete" && pendingDeletePeriod) {
            await handleDeletePeriod(pendingDeletePeriod)
        }
    }

    const handleFetchPeriods = async () => {
        const payload: GetPeriodListRequest = {
            page,
            pageSize,
            search,
            setIsLoading,
        }

        await PeriodService.getPeriodList(payload)
            .then((res) => {
                setPeriodList(res.data || [])
                setTotalCount(res.count ?? 0)
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleFetchExistingPeriods = async () => {
        await PeriodService.getPeriodList({
            page: 1,
            pageSize: 9999,
            search: "",
        })
            .then((res) => {
                setExistingPeriodList(res.data || [])
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    useEffect(() => {
        handleFetchPeriods()
    }, [page, pageSize, search])

    return (
        <div>
            <div className="mb-4">
                <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                    Manage Period
                </h1>
                <p className="text-muted-foreground">Manage period data</p>
            </div>

            <AppModal
                trigger={
                    periodAccess.canInsert ? (
                        <Button className="mb-4" onClick={handleOpenCreateModal}>
                            Add Period
                        </Button>
                    ) : undefined
                }
                title={editingPeriodId ? "Edit Period" : "Add New Period"}
                description={editingPeriodId ? "Update selected period" : "Add a new period"}
                open={isUpsertModalOpen}
                onOpenChange={(open) => {
                    setIsUpsertModalOpen(open)

                    if (!open) {
                        resetPeriodForm()
                    }
                }}
                footer={
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            onClick={() => {
                                setIsUpsertModalOpen(false)
                                resetPeriodForm()
                            }}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (editingPeriodId) {
                                    handleOpenUpdateConfirmation()
                                    return
                                }

                                handleOpenInsertConfirmation()
                            }}
                        >
                            {editingPeriodId ? "Update" : "Save"}
                        </Button>
                    </div>
                }
            >
                <AppDatePicker
                    label="Start Date"
                    value={startDate}
                    onValueChange={(value) => setStartDate(value)}
                    required
                />
                <AppDatePicker
                    label="End Date"
                    value={endDate}
                    onValueChange={(value) => setEndDate(value)}
                    required
                />
                <AppSwitch
                    label="Is Default"
                    checked={isDefault}
                    onCheckedChange={(checked) => setIsDefault(checked)}
                    description="Set this period as default"
                />
                <AppExistingList
                    title="Existing Period List"
                    items={filteredExistingPeriodList}
                    emptyMessage="No period data"
                />
            </AppModal>

            <AppModal
                open={isConfirmActionModalOpen}
                onOpenChange={(open) => {
                    setIsConfirmActionModalOpen(open)

                    if (!open) {
                        resetConfirmActionState()
                    }
                }}
                title={
                    pendingAction === "delete"
                        ? "Delete Period"
                        : pendingAction === "insert"
                            ? "Confirm Save"
                            : "Confirm Update"
                }
                description={
                    pendingAction === "delete"
                        ? "This action will remove the selected period"
                        : pendingAction === "insert"
                            ? "This action will add new period"
                            : "This action will update the selected period"
                }
                classNames={{
                    content: "sm:max-w-sm",
                    header: "gap-1",
                    title: "text-lg",
                    description: "text-xs",
                }}
                footer={
                    <div className="flex w-full justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                resetConfirmActionState()
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant={pendingAction === "delete" ? "destructive" : "default"}
                            onClick={() => {
                                handleConfirmAction()
                            }}
                        >
                            {pendingAction === "delete" ? "Delete" : pendingAction === "insert" ? "Save" : "Update"}
                        </Button>
                    </div>
                }
            >
                <p>
                    {pendingAction === "delete"
                        ? "Are you sure you want to delete this period?"
                        : pendingAction === "insert"
                            ? "Are you sure you want to add this period?"
                            : "Are you sure you want to update this period?"}
                </p>
            </AppModal>

            <AppSearchBar
                label="Search Period"
                placeholder="2024-01-01"
                onSearch={(value) => {
                    setSearch(value)
                    setPage(1)
                }}
                classNames={{
                    input: "max-w-sm",
                }}
            />

            <AppTable
                table={table}
                showNumberColumn
                columnsCount={managePeriodTableColumns.length}
                emptyMessage="No periods found."
                showPagination
                page={page}
                pageSize={pageSize}
                rowCount={periodList.length}
                hasNextPage={hasNextPage}
                onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
                onNextPage={() => setPage((p) => p + 1)}
                onPageSizeChange={(size) => {
                    setPageSize(size)
                    setPage(1)
                }}
                pageSizeOptions={MANAGE_PERIOD_PAGE_SIZE_OPTIONS}
                pageInfoRenderer={({ page: currentPage, rowCount }) =>
                    `Page ${currentPage} • ${totalCount} total • ${rowCount} row(s) shown`
                }
            />

            <AppModal
                open={isShowError}
                onOpenChange={setIsShowError}
                title={errorMessage ? "Error" : "Success"}
                showCloseButton
                contentProps={{
                    onOpenAutoFocus: (event) => {
                        event.preventDefault()
                    },
                    onCloseAutoFocus: (event) => {
                        event.preventDefault()
                    },
                }}
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
                        <Button
                            type="button"
                            onClick={() => {
                                setErrorMessage("")
                                setSuccessMessage("")
                                setIsShowError(false)
                            }}
                        >
                            OK
                        </Button>
                    </div>
                }
            >
                <p>{errorMessage || successMessage}</p>
            </AppModal>

            {isLoading && <AppSpinner />}
        </div>
    )
}

export default ManagePeriodPage
