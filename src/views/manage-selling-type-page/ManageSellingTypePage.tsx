import AppExistingList from "@/components/app-components/app-existing-list/AppExistingList"
import AppModal from "@/components/app-components/app-modal/AppModal"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
import AppTable from "@/components/app-components/app-table/AppTable"
import AppTextField from "@/components/app-components/app-text-field/AppTextField"
import AppSearchBar from "@/components/app-layout/app-search-bar/AppSearchBar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { usePrivilegeAccess } from "@/helpers/hooks/usePrivilegeAccess/usePrivilegeAccess"
import { SellingTypeService } from "@/helpers/services/SellingTypeService"
import type {
    DeleteSellingTypeRequest,
    GetSellingTypeListRequest,
    InsertSellingTypeRequest,
    UpdateSellingTypeRequest,
} from "@/interfaces/ISellingTypeService"
import type { MsSellingType } from "@/interfaces/IModel.interface"
import {
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
    useReactTable,
} from "@tanstack/react-table"
import { Pencil, Trash } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
    MANAGE_SELLING_TYPE_PAGE_SIZE_OPTIONS,
    type PendingActionManageSellingType,
} from "./ManageSellingTypePage.constant"

const ManageSellingTypePage = () => {
    const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
    const sellingTypeAccess = usePrivilegeAccess("Master Selling Type")

    const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false)
    const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [isShowError, setIsShowError] = useState(false)
    const [newSellingTypeName, setNewSellingTypeName] = useState("")
    const [editingSellingTypeId, setEditingSellingTypeId] = useState<number | null>(null)
    const [pendingAction, setPendingAction] = useState<PendingActionManageSellingType>(null)
    const [pendingDeleteSellingType, setPendingDeleteSellingType] = useState<MsSellingType | null>(null)

    const [sellingTypeList, setSellingTypeList] = useState<MsSellingType[]>([])
    const [existingSellingTypeList, setExistingSellingTypeList] = useState<MsSellingType[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)

    const manageSellingTypeTableColumns: ColumnDef<MsSellingType>[] = [
        {
            accessorKey: "sellingTypeName",
            header: "Selling Type Name",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {sellingTypeAccess.canUpdate ? (
                        <Button
                            variant="outline"
                            size="sm"
                            title="Edit selling type"
                            onClick={() => handleEditSellingType(row.original)}
                        >
                            <Pencil className="size-4" />
                        </Button>
                    ) : null}
                    {sellingTypeAccess.canDelete ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            title="Delete selling type"
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
        data: sellingTypeList,
        columns: manageSellingTypeTableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const filteredExistingSellingTypeList = useMemo(() => {
        const keyword = newSellingTypeName.trim().toLowerCase()

        if (!keyword) {
            return existingSellingTypeList
        }

        return existingSellingTypeList.filter((sellingType) =>
            sellingType.sellingTypeName.toLowerCase().includes(keyword),
        )
    }, [existingSellingTypeList, newSellingTypeName])

    const ensureAuthenticatedUserId = () => {
        const userId = authenticatedUser?.userId

        if (!userId) {
            setErrorMessage("Authenticated user not found. Please login again.")
            setIsShowError(true)
            return null
        }

        return userId
    }

    const resetSellingTypeForm = () => {
        setNewSellingTypeName("")
        setEditingSellingTypeId(null)
    }

    const resetConfirmActionState = () => {
        setPendingAction(null)
        setPendingDeleteSellingType(null)
        setIsConfirmActionModalOpen(false)
    }

    const handleOpenCreateModal = () => {
        resetSellingTypeForm()
        handleFetchExistingSellingTypes()
        setIsUpsertModalOpen(true)
    }

    const handleEditSellingType = (sellingType: MsSellingType) => {
        setEditingSellingTypeId(sellingType.sellingTypeId)
        setNewSellingTypeName(sellingType.sellingTypeName)
        handleFetchExistingSellingTypes()
        setIsUpsertModalOpen(true)
    }

    const handleOpenUpdateConfirmation = () => {
        if (!editingSellingTypeId || !newSellingTypeName.trim()) {
            return
        }

        setPendingAction("update")
        setPendingDeleteSellingType(null)
        setIsConfirmActionModalOpen(true)
    }

    const handleOpenInsertConfirmation = () => {
        if (!newSellingTypeName.trim()) {
            return
        }

        setPendingAction("insert")
        setPendingDeleteSellingType(null)
        setIsConfirmActionModalOpen(true)
    }

    const handleOpenDeleteConfirmation = (sellingType: MsSellingType) => {
        setPendingAction("delete")
        setPendingDeleteSellingType(sellingType)
        setIsConfirmActionModalOpen(true)
    }

    const isDuplicateSellingTypeName = () => {
        const normalized = newSellingTypeName.trim().toLowerCase()

        return existingSellingTypeList.some((sellingType) => {
            const isSameRecord = editingSellingTypeId
                ? sellingType.sellingTypeId === editingSellingTypeId
                : false

            if (isSameRecord) {
                return false
            }

            return sellingType.sellingTypeName.trim().toLowerCase() === normalized
        })
    }

    const handleInsert = async () => {
        if (!newSellingTypeName.trim()) {
            return
        }

        if (isDuplicateSellingTypeName()) {
            setErrorMessage("Selling type name already exists")
            setIsShowError(true)
            return
        }

        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: InsertSellingTypeRequest = {
            sellingTypeName: newSellingTypeName.trim().toUpperCase(),
            userIn: userId,
            setIsLoading,
        }

        await SellingTypeService.insertSellingType(payload)
            .then(() => {
                setIsUpsertModalOpen(false)
                resetSellingTypeForm()
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Selling type added successfully")
                setIsShowError(true)
                handleFetchSellingTypes()
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleUpdate = async () => {
        if (!editingSellingTypeId || !newSellingTypeName.trim()) {
            return
        }

        if (isDuplicateSellingTypeName()) {
            setErrorMessage("Selling type name already exists")
            setIsShowError(true)
            return
        }

        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: UpdateSellingTypeRequest = {
            sellingTypeId: editingSellingTypeId,
            sellingTypeName: newSellingTypeName.trim().toUpperCase(),
            userUp: userId,
            updatedAt: new Date().toISOString(),
            setIsLoading,
        }

        await SellingTypeService.updateSellingType(payload)
            .then(() => {
                setIsUpsertModalOpen(false)
                resetSellingTypeForm()
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Selling type updated successfully")
                setIsShowError(true)
                handleFetchSellingTypes()
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleDeleteSellingType = async (sellingType: MsSellingType) => {
        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: DeleteSellingTypeRequest = {
            sellingTypeId: sellingType.sellingTypeId,
            userUp: userId,
            updatedAt: new Date().toISOString(),
            setIsLoading,
        }

        await SellingTypeService.deleteSellingType(payload)
            .then(() => {
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Selling type deleted successfully")
                setIsShowError(true)

                if (sellingTypeList.length === 1 && page > 1) {
                    setPage((prev) => prev - 1)
                    return
                }

                handleFetchSellingTypes()
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

        if (pendingAction === "delete" && pendingDeleteSellingType) {
            await handleDeleteSellingType(pendingDeleteSellingType)
        }
    }

    const handleFetchSellingTypes = async () => {
        const payload: GetSellingTypeListRequest = {
            page,
            pageSize,
            search,
            setIsLoading,
        }

        await SellingTypeService.getSellingTypeList(payload)
            .then((res) => {
                setSellingTypeList(res.data || [])
                setTotalCount(res.count ?? 0)
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleFetchExistingSellingTypes = async () => {
        await SellingTypeService.getSellingTypeList({
            page: 1,
            pageSize: 9999,
            search: "",
        })
            .then((res) => {
                setExistingSellingTypeList(res.data || [])
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    useEffect(() => {
        handleFetchSellingTypes()
    }, [page, pageSize, search])

    return (
        <div>
            <div className="mb-4">
                <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                    Manage Selling Type
                </h1>
                <p className="text-muted-foreground">Manage selling type data</p>
            </div>

            <AppModal
                trigger={
                    sellingTypeAccess.canInsert ? (
                        <Button className="mb-4" onClick={handleOpenCreateModal}>
                            Add Selling Type
                        </Button>
                    ) : undefined
                }
                title={editingSellingTypeId ? "Edit Selling Type" : "Add New Selling Type"}
                description={
                    editingSellingTypeId ? "Update selected selling type" : "Add a new selling type"
                }
                open={isUpsertModalOpen}
                onOpenChange={(open) => {
                    setIsUpsertModalOpen(open)

                    if (!open) {
                        resetSellingTypeForm()
                    }
                }}
                footer={
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            onClick={() => {
                                setIsUpsertModalOpen(false)
                                resetSellingTypeForm()
                            }}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (editingSellingTypeId) {
                                    handleOpenUpdateConfirmation()
                                    return
                                }

                                handleOpenInsertConfirmation()
                            }}
                        >
                            {editingSellingTypeId ? "Update" : "Save"}
                        </Button>
                    </div>
                }
            >
                <AppTextField
                    label="Selling Type Name"
                    placeholder="RETAIL"
                    required
                    value={newSellingTypeName}
                    onChange={(value) => setNewSellingTypeName(value)}
                    isUppercase
                />
                <AppExistingList
                    title="Existing Selling Type List"
                    items={filteredExistingSellingTypeList.map((st) => st.sellingTypeName)}
                    emptyMessage="No selling type data"
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
                        ? "Delete Selling Type"
                        : pendingAction === "insert"
                            ? "Confirm Save"
                            : "Confirm Update"
                }
                description={
                    pendingAction === "delete"
                        ? "This action will remove the selected selling type"
                        : pendingAction === "insert"
                            ? "This action will add new selling type"
                            : "This action will update the selected selling type"
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
                        ? "Are you sure you want to delete this selling type?"
                        : pendingAction === "insert"
                            ? "Are you sure you want to add this selling type?"
                            : "Are you sure you want to update this selling type?"}
                </p>
            </AppModal>

            <AppSearchBar
                label="Search Selling Type"
                placeholder="RETAIL"
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
                columnsCount={manageSellingTypeTableColumns.length}
                emptyMessage="No selling types found."
                showPagination
                page={page}
                pageSize={pageSize}
                rowCount={sellingTypeList.length}
                hasNextPage={hasNextPage}
                onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
                onNextPage={() => setPage((p) => p + 1)}
                onPageSizeChange={(size) => {
                    setPageSize(size)
                    setPage(1)
                }}
                pageSizeOptions={MANAGE_SELLING_TYPE_PAGE_SIZE_OPTIONS}
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

export default ManageSellingTypePage
