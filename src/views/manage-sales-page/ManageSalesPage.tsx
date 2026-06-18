import AppExistingList from "@/components/app-components/app-existing-list/AppExistingList"
import AppModal from "@/components/app-components/app-modal/AppModal"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
import AppTable from "@/components/app-components/app-table/AppTable"
import AppTextField from "@/components/app-components/app-text-field/AppTextField"
import AppSearchBar from "@/components/app-layout/app-search-bar/AppSearchBar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { usePrivilegeAccess } from "@/helpers/hooks/usePrivilegeAccess/usePrivilegeAccess"
import { SalesService } from "@/helpers/services/SalesService"
import type {
    DeleteSalesRequest,
    GetSalesListRequest,
    InsertSalesRequest,
    UpdateSalesRequest,
} from "@/interfaces/ISalesService"
import type { MsSales } from "@/interfaces/IModel.interface"
import {
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
    useReactTable,
} from "@tanstack/react-table"
import { Pencil, Trash } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
    MANAGE_SALES_PAGE_SIZE_OPTIONS,
    type PendingActionManageSales,
} from "./ManageSalesPage.constant"

const ManageSalesPage = () => {
    const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
    const salesAccess = usePrivilegeAccess("Master Sales")

    const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false)
    const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [isShowError, setIsShowError] = useState(false)
    const [newSalesName, setNewSalesName] = useState("")
    const [editingSalesId, setEditingSalesId] = useState<number | null>(null)
    const [pendingAction, setPendingAction] = useState<PendingActionManageSales>(null)
    const [pendingDeleteSales, setPendingDeleteSales] = useState<MsSales | null>(null)

    const [salesList, setSalesList] = useState<MsSales[]>([])
    const [existingSalesList, setExistingSalesList] = useState<MsSales[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)

    const manageSalesTableColumns: ColumnDef<MsSales>[] = [
        {
            accessorKey: "salesName",
            header: "Sales Name",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {salesAccess.canUpdate ? (
                        <Button
                            variant="outline"
                            size="sm"
                            title="Edit sales"
                            onClick={() => handleEditSales(row.original)}
                        >
                            <Pencil className="size-4" />
                        </Button>
                    ) : null}
                    {salesAccess.canDelete ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            title="Delete sales"
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
        data: salesList,
        columns: manageSalesTableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const filteredExistingSalesList = useMemo(() => {
        const keyword = newSalesName.trim().toLowerCase()

        if (!keyword) {
            return existingSalesList
        }

        return existingSalesList.filter((sales) =>
            sales.salesName.toLowerCase().includes(keyword),
        )
    }, [existingSalesList, newSalesName])

    const ensureAuthenticatedUserId = () => {
        const userId = authenticatedUser?.userId

        if (!userId) {
            setErrorMessage("Authenticated user not found. Please login again.")
            setIsShowError(true)
            return null
        }

        return userId
    }

    const resetSalesForm = () => {
        setNewSalesName("")
        setEditingSalesId(null)
    }

    const resetConfirmActionState = () => {
        setPendingAction(null)
        setPendingDeleteSales(null)
        setIsConfirmActionModalOpen(false)
    }

    const handleOpenCreateModal = () => {
        resetSalesForm()
        handleFetchExistingSales()
        setIsUpsertModalOpen(true)
    }

    const handleEditSales = (sales: MsSales) => {
        setEditingSalesId(sales.salesId)
        setNewSalesName(sales.salesName)
        handleFetchExistingSales()
        setIsUpsertModalOpen(true)
    }

    const handleOpenUpdateConfirmation = () => {
        if (!editingSalesId || !newSalesName.trim()) {
            return
        }

        setPendingAction("update")
        setPendingDeleteSales(null)
        setIsConfirmActionModalOpen(true)
    }

    const handleOpenInsertConfirmation = () => {
        if (!newSalesName.trim()) {
            return
        }

        setPendingAction("insert")
        setPendingDeleteSales(null)
        setIsConfirmActionModalOpen(true)
    }

    const handleOpenDeleteConfirmation = (sales: MsSales) => {
        setPendingAction("delete")
        setPendingDeleteSales(sales)
        setIsConfirmActionModalOpen(true)
    }

    const isDuplicateSalesName = () => {
        const normalized = newSalesName.trim().toLowerCase()

        return existingSalesList.some((sales) => {
            const isSameRecord = editingSalesId ? sales.salesId === editingSalesId : false

            if (isSameRecord) {
                return false
            }

            return sales.salesName.trim().toLowerCase() === normalized
        })
    }

    const handleInsert = async () => {
        if (!newSalesName.trim()) {
            return
        }

        if (isDuplicateSalesName()) {
            setErrorMessage("Sales name already exists")
            setIsShowError(true)
            return
        }

        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: InsertSalesRequest = {
            salesName: newSalesName.trim(),
            userIn: userId,
            setIsLoading,
        }

        await SalesService.insertSales(payload)
            .then(() => {
                setIsUpsertModalOpen(false)
                resetSalesForm()
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Sales added successfully")
                setIsShowError(true)
                handleFetchSalesList()
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleUpdate = async () => {
        if (!editingSalesId || !newSalesName.trim()) {
            return
        }

        if (isDuplicateSalesName()) {
            setErrorMessage("Sales name already exists")
            setIsShowError(true)
            return
        }

        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: UpdateSalesRequest = {
            salesId: editingSalesId,
            salesName: newSalesName.trim(),
            userUp: userId,
            updatedAt: new Date().toISOString(),
            setIsLoading,
        }

        await SalesService.updateSales(payload)
            .then(() => {
                setIsUpsertModalOpen(false)
                resetSalesForm()
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Sales updated successfully")
                setIsShowError(true)
                handleFetchSalesList()
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleDeleteSales = async (sales: MsSales) => {
        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: DeleteSalesRequest = {
            salesId: sales.salesId,
            userUp: userId,
            updatedAt: new Date().toISOString(),
            setIsLoading,
        }

        await SalesService.deleteSales(payload)
            .then(() => {
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Sales deleted successfully")
                setIsShowError(true)

                if (salesList.length === 1 && page > 1) {
                    setPage((prev) => prev - 1)
                    return
                }

                handleFetchSalesList()
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

        if (pendingAction === "delete" && pendingDeleteSales) {
            await handleDeleteSales(pendingDeleteSales)
        }
    }

    const handleFetchSalesList = async () => {
        const payload: GetSalesListRequest = {
            page,
            pageSize,
            search,
            setIsLoading,
        }

        await SalesService.getSalesList(payload)
            .then((res) => {
                setSalesList(res.data || [])
                setTotalCount(res.count ?? 0)
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleFetchExistingSales = async () => {
        await SalesService.getSalesList({
            page: 1,
            pageSize: 9999,
            search: "",
        })
            .then((res) => {
                setExistingSalesList(res.data || [])
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    useEffect(() => {
        handleFetchSalesList()
    }, [page, pageSize, search])

    return (
        <div>
            <div className="mb-4">
                <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                    Manage Sales
                </h1>
                <p className="text-muted-foreground">Manage sales data</p>
            </div>

            <AppModal
                trigger={
                    salesAccess.canInsert ? (
                        <Button className="mb-4" onClick={handleOpenCreateModal}>
                            Add Sales
                        </Button>
                    ) : undefined
                }
                title={editingSalesId ? "Edit Sales" : "Add New Sales"}
                description={editingSalesId ? "Update selected sales" : "Add a new sales"}
                open={isUpsertModalOpen}
                onOpenChange={(open) => {
                    setIsUpsertModalOpen(open)

                    if (!open) {
                        resetSalesForm()
                    }
                }}
                footer={
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            onClick={() => {
                                setIsUpsertModalOpen(false)
                                resetSalesForm()
                            }}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (editingSalesId) {
                                    handleOpenUpdateConfirmation()
                                    return
                                }

                                handleOpenInsertConfirmation()
                            }}
                        >
                            {editingSalesId ? "Update" : "Save"}
                        </Button>
                    </div>
                }
            >
                <AppTextField
                    label="Sales Name"
                    placeholder="John Doe"
                    required
                    value={newSalesName}
                    onChange={(value) => setNewSalesName(value)}
                />
                <AppExistingList
                    title="Existing Sales List"
                    items={filteredExistingSalesList.map((sales) => sales.salesName)}
                    emptyMessage="No sales data"
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
                        ? "Delete Sales"
                        : pendingAction === "insert"
                            ? "Confirm Save"
                            : "Confirm Update"
                }
                description={
                    pendingAction === "delete"
                        ? "This action will remove the selected sales"
                        : pendingAction === "insert"
                            ? "This action will add new sales"
                            : "This action will update the selected sales"
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
                        ? "Are you sure you want to delete this sales?"
                        : pendingAction === "insert"
                            ? "Are you sure you want to add this sales?"
                            : "Are you sure you want to update this sales?"}
                </p>
            </AppModal>

            <AppSearchBar
                label="Search Sales"
                placeholder="John Doe"
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
                columnsCount={manageSalesTableColumns.length}
                emptyMessage="No sales found."
                showPagination
                page={page}
                pageSize={pageSize}
                rowCount={salesList.length}
                hasNextPage={hasNextPage}
                onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
                onNextPage={() => setPage((p) => p + 1)}
                onPageSizeChange={(size) => {
                    setPageSize(size)
                    setPage(1)
                }}
                pageSizeOptions={MANAGE_SALES_PAGE_SIZE_OPTIONS}
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

export default ManageSalesPage
