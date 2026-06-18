import AppExistingList from "@/components/app-components/app-existing-list/AppExistingList"
import AppModal from "@/components/app-components/app-modal/AppModal"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
import AppTable from "@/components/app-components/app-table/AppTable"
import AppTextField from "@/components/app-components/app-text-field/AppTextField"
import AppSearchBar from "@/components/app-layout/app-search-bar/AppSearchBar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { usePrivilegeAccess } from "@/helpers/hooks/usePrivilegeAccess/usePrivilegeAccess"
import { VolumeService } from "@/helpers/services/VolumeService"
import type {
    DeleteVolumeRequest,
    GetVolumeListRequest,
    InsertVolumeRequest,
    UpdateVolumeRequest,
} from "@/interfaces/IVolumeService"
import type { MsVolume } from "@/interfaces/IModel.interface"
import {
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
    useReactTable,
} from "@tanstack/react-table"
import { Pencil, Trash } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
    MANAGE_VOLUME_PAGE_SIZE_OPTIONS,
    type PendingActionManageVolume,
} from "./ManageVolumePage.constant"

const ManageVolumePage = () => {
    const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
    const volumeAccess = usePrivilegeAccess("Master Volume")

    const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false)
    const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [isShowError, setIsShowError] = useState(false)
    const [newVolumeRaw, setNewVolumeRaw] = useState("")
    const [editingVolumeId, setEditingVolumeId] = useState<number | null>(null)
    const [pendingAction, setPendingAction] = useState<PendingActionManageVolume>(null)
    const [pendingDeleteVolume, setPendingDeleteVolume] = useState<MsVolume | null>(null)

    const [volumeList, setVolumeList] = useState<MsVolume[]>([])
    const [existingVolumeList, setExistingVolumeList] = useState<MsVolume[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)

    const manageVolumeTableColumns: ColumnDef<MsVolume>[] = [
        {
            accessorKey: "volume",
            header: "Volume",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {volumeAccess.canUpdate ? (
                        <Button
                            variant="outline"
                            size="sm"
                            title="Edit volume"
                            onClick={() => handleEditVolume(row.original)}
                        >
                            <Pencil className="size-4" />
                        </Button>
                    ) : null}
                    {volumeAccess.canDelete ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            title="Delete volume"
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
        data: volumeList,
        columns: manageVolumeTableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const newVolumeNumber = Number(newVolumeRaw)

    const filteredExistingVolumeList = useMemo(() => {
        const keyword = newVolumeRaw.trim()

        if (!keyword) {
            return existingVolumeList
        }

        return existingVolumeList.filter((v) => String(v.volume).includes(keyword))
    }, [existingVolumeList, newVolumeRaw])

    const ensureAuthenticatedUserId = () => {
        const userId = authenticatedUser?.userId

        if (!userId) {
            setErrorMessage("Authenticated user not found. Please login again.")
            setIsShowError(true)
            return null
        }

        return userId
    }

    const resetVolumeForm = () => {
        setNewVolumeRaw("")
        setEditingVolumeId(null)
    }

    const resetConfirmActionState = () => {
        setPendingAction(null)
        setPendingDeleteVolume(null)
        setIsConfirmActionModalOpen(false)
    }

    const handleOpenCreateModal = () => {
        resetVolumeForm()
        handleFetchExistingVolumes()
        setIsUpsertModalOpen(true)
    }

    const handleEditVolume = (volume: MsVolume) => {
        setEditingVolumeId(volume.volumeId)
        setNewVolumeRaw(String(volume.volume))
        handleFetchExistingVolumes()
        setIsUpsertModalOpen(true)
    }

    const handleOpenUpdateConfirmation = () => {
        if (!editingVolumeId || !newVolumeRaw.trim() || Number.isNaN(newVolumeNumber)) {
            return
        }

        setPendingAction("update")
        setPendingDeleteVolume(null)
        setIsConfirmActionModalOpen(true)
    }

    const handleOpenInsertConfirmation = () => {
        if (!newVolumeRaw.trim() || Number.isNaN(newVolumeNumber)) {
            return
        }

        setPendingAction("insert")
        setPendingDeleteVolume(null)
        setIsConfirmActionModalOpen(true)
    }

    const handleOpenDeleteConfirmation = (volume: MsVolume) => {
        setPendingAction("delete")
        setPendingDeleteVolume(volume)
        setIsConfirmActionModalOpen(true)
    }

    const isDuplicateVolume = () => {
        return existingVolumeList.some((v) => {
            const isSameRecord = editingVolumeId ? v.volumeId === editingVolumeId : false

            if (isSameRecord) {
                return false
            }

            return v.volume === newVolumeNumber
        })
    }

    const handleInsert = async () => {
        if (!newVolumeRaw.trim() || Number.isNaN(newVolumeNumber)) {
            return
        }

        if (isDuplicateVolume()) {
            setErrorMessage("Volume already exists")
            setIsShowError(true)
            return
        }

        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: InsertVolumeRequest = {
            volume: newVolumeNumber,
            userIn: userId,
            setIsLoading,
        }

        await VolumeService.insertVolume(payload)
            .then(() => {
                setIsUpsertModalOpen(false)
                resetVolumeForm()
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Volume added successfully")
                setIsShowError(true)
                handleFetchVolumes()
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleUpdate = async () => {
        if (!editingVolumeId || !newVolumeRaw.trim() || Number.isNaN(newVolumeNumber)) {
            return
        }

        if (isDuplicateVolume()) {
            setErrorMessage("Volume already exists")
            setIsShowError(true)
            return
        }

        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: UpdateVolumeRequest = {
            volumeId: editingVolumeId,
            volume: newVolumeNumber,
            userUp: userId,
            updatedAt: new Date().toISOString(),
            setIsLoading,
        }

        await VolumeService.updateVolume(payload)
            .then(() => {
                setIsUpsertModalOpen(false)
                resetVolumeForm()
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Volume updated successfully")
                setIsShowError(true)
                handleFetchVolumes()
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleDeleteVolume = async (volume: MsVolume) => {
        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: DeleteVolumeRequest = {
            volumeId: volume.volumeId,
            userUp: userId,
            updatedAt: new Date().toISOString(),
            setIsLoading,
        }

        await VolumeService.deleteVolume(payload)
            .then(() => {
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Volume deleted successfully")
                setIsShowError(true)

                if (volumeList.length === 1 && page > 1) {
                    setPage((prev) => prev - 1)
                    return
                }

                handleFetchVolumes()
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

        if (pendingAction === "delete" && pendingDeleteVolume) {
            await handleDeleteVolume(pendingDeleteVolume)
        }
    }

    const handleFetchVolumes = async () => {
        const payload: GetVolumeListRequest = {
            page,
            pageSize,
            search,
            setIsLoading,
        }

        await VolumeService.getVolumeList(payload)
            .then((res) => {
                setVolumeList(res.data || [])
                setTotalCount(res.count ?? 0)
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleFetchExistingVolumes = async () => {
        await VolumeService.getVolumeList({
            page: 1,
            pageSize: 9999,
            search: "",
        })
            .then((res) => {
                setExistingVolumeList(res.data || [])
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    useEffect(() => {
        handleFetchVolumes()
    }, [page, pageSize, search])

    return (
        <div>
            <div className="mb-4">
                <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                    Manage Volume
                </h1>
                <p className="text-muted-foreground">Manage volume data</p>
            </div>

            <AppModal
                trigger={
                    volumeAccess.canInsert ? (
                        <Button className="mb-4" onClick={handleOpenCreateModal}>
                            Add Volume
                        </Button>
                    ) : undefined
                }
                title={editingVolumeId ? "Edit Volume" : "Add New Volume"}
                description={editingVolumeId ? "Update selected volume" : "Add a new volume"}
                open={isUpsertModalOpen}
                onOpenChange={(open) => {
                    setIsUpsertModalOpen(open)

                    if (!open) {
                        resetVolumeForm()
                    }
                }}
                footer={
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            onClick={() => {
                                setIsUpsertModalOpen(false)
                                resetVolumeForm()
                            }}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (editingVolumeId) {
                                    handleOpenUpdateConfirmation()
                                    return
                                }

                                handleOpenInsertConfirmation()
                            }}
                        >
                            {editingVolumeId ? "Update" : "Save"}
                        </Button>
                    </div>
                }
            >
                <AppTextField
                    label="Volume"
                    placeholder="125"
                    type="number"
                    required
                    value={newVolumeRaw}
                    onChange={(value) => setNewVolumeRaw(value)}
                />
                <AppExistingList
                    title="Existing Volume List"
                    items={filteredExistingVolumeList.map((v) => String(v.volume))}
                    emptyMessage="No volume data"
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
                        ? "Delete Volume"
                        : pendingAction === "insert"
                            ? "Confirm Save"
                            : "Confirm Update"
                }
                description={
                    pendingAction === "delete"
                        ? "This action will remove the selected volume"
                        : pendingAction === "insert"
                            ? "This action will add new volume"
                            : "This action will update the selected volume"
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
                        ? "Are you sure you want to delete this volume?"
                        : pendingAction === "insert"
                            ? "Are you sure you want to add this volume?"
                            : "Are you sure you want to update this volume?"}
                </p>
            </AppModal>

            <AppSearchBar
                label="Search Volume"
                placeholder="125"
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
                columnsCount={manageVolumeTableColumns.length}
                emptyMessage="No volumes found."
                showPagination
                page={page}
                pageSize={pageSize}
                rowCount={volumeList.length}
                hasNextPage={hasNextPage}
                onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
                onNextPage={() => setPage((p) => p + 1)}
                onPageSizeChange={(size) => {
                    setPageSize(size)
                    setPage(1)
                }}
                pageSizeOptions={MANAGE_VOLUME_PAGE_SIZE_OPTIONS}
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

export default ManageVolumePage
