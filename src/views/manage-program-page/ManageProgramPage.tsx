import AppExistingList from "@/components/app-components/app-existing-list/AppExistingList"
import AppModal from "@/components/app-components/app-modal/AppModal"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
import AppTable from "@/components/app-components/app-table/AppTable"
import AppTextField from "@/components/app-components/app-text-field/AppTextField"
import AppSearchBar from "@/components/app-layout/app-search-bar/AppSearchBar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { usePrivilegeAccess } from "@/helpers/hooks/usePrivilegeAccess/usePrivilegeAccess"
import { ProgramService } from "@/helpers/services/ProgramService"
import type {
    DeleteProgramRequest,
    GetProgramListRequest,
    InsertProgramRequest,
    UpdateProgramRequest,
} from "@/interfaces/IProgramService"
import type { MsProgram } from "@/interfaces/IModel.interface"
import {
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
    useReactTable,
} from "@tanstack/react-table"
import { Pencil, Trash } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
    MANAGE_PROGRAM_PAGE_SIZE_OPTIONS,
    type PendingActionManageProgram,
} from "./ManageProgramPage.constant"

const ManageProgramPage = () => {
    const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
    const programAccess = usePrivilegeAccess("Master Program")

    const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false)
    const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [isShowError, setIsShowError] = useState(false)
    const [newProgramName, setNewProgramName] = useState("")
    const [editingProgramId, setEditingProgramId] = useState<number | null>(null)
    const [pendingAction, setPendingAction] = useState<PendingActionManageProgram>(null)
    const [pendingDeleteProgram, setPendingDeleteProgram] = useState<MsProgram | null>(null)

    const [programList, setProgramList] = useState<MsProgram[]>([])
    const [existingProgramList, setExistingProgramList] = useState<MsProgram[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)

    const manageProgramTableColumns: ColumnDef<MsProgram>[] = [
        {
            accessorKey: "programName",
            header: "Program Name",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {programAccess.canUpdate ? (
                        <Button
                            variant="outline"
                            size="sm"
                            title="Edit program"
                            onClick={() => handleEditProgram(row.original)}
                        >
                            <Pencil className="size-4" />
                        </Button>
                    ) : null}
                    {programAccess.canDelete ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            title="Delete program"
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
        data: programList,
        columns: manageProgramTableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const filteredExistingProgramList = useMemo(() => {
        const keyword = newProgramName.trim().toLowerCase()

        if (!keyword) {
            return existingProgramList
        }

        return existingProgramList.filter((program) =>
            program.programName.toLowerCase().includes(keyword),
        )
    }, [existingProgramList, newProgramName])

    const ensureAuthenticatedUserId = () => {
        const userId = authenticatedUser?.userId

        if (!userId) {
            setErrorMessage("Authenticated user not found. Please login again.")
            setIsShowError(true)
            return null
        }

        return userId
    }

    const resetProgramForm = () => {
        setNewProgramName("")
        setEditingProgramId(null)
    }

    const resetConfirmActionState = () => {
        setPendingAction(null)
        setPendingDeleteProgram(null)
        setIsConfirmActionModalOpen(false)
    }

    const handleOpenCreateModal = () => {
        resetProgramForm()
        handleFetchExistingPrograms()
        setIsUpsertModalOpen(true)
    }

    const handleEditProgram = (program: MsProgram) => {
        setEditingProgramId(program.programId)
        setNewProgramName(program.programName)
        handleFetchExistingPrograms()
        setIsUpsertModalOpen(true)
    }

    const handleOpenUpdateConfirmation = () => {
        if (!editingProgramId || !newProgramName.trim()) {
            return
        }

        setPendingAction("update")
        setPendingDeleteProgram(null)
        setIsConfirmActionModalOpen(true)
    }

    const handleOpenInsertConfirmation = () => {
        if (!newProgramName.trim()) {
            return
        }

        setPendingAction("insert")
        setPendingDeleteProgram(null)
        setIsConfirmActionModalOpen(true)
    }

    const handleOpenDeleteConfirmation = (program: MsProgram) => {
        setPendingAction("delete")
        setPendingDeleteProgram(program)
        setIsConfirmActionModalOpen(true)
    }

    const isDuplicateProgramName = () => {
        const normalized = newProgramName.trim().toLowerCase()

        return existingProgramList.some((program) => {
            const isSameRecord = editingProgramId ? program.programId === editingProgramId : false

            if (isSameRecord) {
                return false
            }

            return program.programName.trim().toLowerCase() === normalized
        })
    }

    const handleInsert = async () => {
        if (!newProgramName.trim()) {
            return
        }

        if (isDuplicateProgramName()) {
            setErrorMessage("Program name already exists")
            setIsShowError(true)
            return
        }

        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: InsertProgramRequest = {
            programName: newProgramName.trim(),
            userIn: userId,
            setIsLoading,
        }

        await ProgramService.insertProgram(payload)
            .then(() => {
                setIsUpsertModalOpen(false)
                resetProgramForm()
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Program added successfully")
                setIsShowError(true)
                handleFetchPrograms()
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleUpdate = async () => {
        if (!editingProgramId || !newProgramName.trim()) {
            return
        }

        if (isDuplicateProgramName()) {
            setErrorMessage("Program name already exists")
            setIsShowError(true)
            return
        }

        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: UpdateProgramRequest = {
            programId: editingProgramId,
            programName: newProgramName.trim(),
            userUp: userId,
            updatedAt: new Date().toISOString(),
            setIsLoading,
        }

        await ProgramService.updateProgram(payload)
            .then(() => {
                setIsUpsertModalOpen(false)
                resetProgramForm()
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Program updated successfully")
                setIsShowError(true)
                handleFetchPrograms()
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleDeleteProgram = async (program: MsProgram) => {
        const userId = ensureAuthenticatedUserId()
        if (!userId) {
            return
        }

        const payload: DeleteProgramRequest = {
            programId: program.programId,
            userUp: userId,
            updatedAt: new Date().toISOString(),
            setIsLoading,
        }

        await ProgramService.deleteProgram(payload)
            .then(() => {
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("Program deleted successfully")
                setIsShowError(true)

                if (programList.length === 1 && page > 1) {
                    setPage((prev) => prev - 1)
                    return
                }

                handleFetchPrograms()
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

        if (pendingAction === "delete" && pendingDeleteProgram) {
            await handleDeleteProgram(pendingDeleteProgram)
        }
    }

    const handleFetchPrograms = async () => {
        const payload: GetProgramListRequest = {
            page,
            pageSize,
            search,
            setIsLoading,
        }

        await ProgramService.getProgramList(payload)
            .then((res) => {
                setProgramList(res.data || [])
                setTotalCount(res.count ?? 0)
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    const handleFetchExistingPrograms = async () => {
        await ProgramService.getProgramList({
            page: 1,
            pageSize: 9999,
            search: "",
        })
            .then((res) => {
                setExistingProgramList(res.data || [])
            })
            .catch((error) => {
                setErrorMessage(error.error.message)
                setIsShowError(true)
            })
    }

    useEffect(() => {
        handleFetchPrograms()
    }, [page, pageSize, search])

    return (
        <div>
            <div className="mb-4">
                <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                    Manage Program
                </h1>
                <p className="text-muted-foreground">Manage program data</p>
            </div>

            <AppModal
                trigger={
                    programAccess.canInsert ? (
                        <Button className="mb-4" onClick={handleOpenCreateModal}>
                            Add Program
                        </Button>
                    ) : undefined
                }
                title={editingProgramId ? "Edit Program" : "Add New Program"}
                description={editingProgramId ? "Update selected program" : "Add a new program"}
                open={isUpsertModalOpen}
                onOpenChange={(open) => {
                    setIsUpsertModalOpen(open)

                    if (!open) {
                        resetProgramForm()
                    }
                }}
                footer={
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            onClick={() => {
                                setIsUpsertModalOpen(false)
                                resetProgramForm()
                            }}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (editingProgramId) {
                                    handleOpenUpdateConfirmation()
                                    return
                                }

                                handleOpenInsertConfirmation()
                            }}
                        >
                            {editingProgramId ? "Update" : "Save"}
                        </Button>
                    </div>
                }
            >
                <AppTextField
                    label="Program Name"
                    placeholder="New Year Program"
                    required
                    value={newProgramName}
                    onChange={(value) => setNewProgramName(value)}
                />
                <AppExistingList
                    title="Existing Program List"
                    items={filteredExistingProgramList.map((program) => program.programName)}
                    emptyMessage="No program data"
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
                        ? "Delete Program"
                        : pendingAction === "insert"
                            ? "Confirm Save"
                            : "Confirm Update"
                }
                description={
                    pendingAction === "delete"
                        ? "This action will remove the selected program"
                        : pendingAction === "insert"
                            ? "This action will add new program"
                            : "This action will update the selected program"
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
                        ? "Are you sure you want to delete this program?"
                        : pendingAction === "insert"
                            ? "Are you sure you want to add this program?"
                            : "Are you sure you want to update this program?"}
                </p>
            </AppModal>

            <AppSearchBar
                label="Search Program"
                placeholder="New Year Program"
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
                columnsCount={manageProgramTableColumns.length}
                emptyMessage="No programs found."
                showPagination
                page={page}
                pageSize={pageSize}
                rowCount={programList.length}
                hasNextPage={hasNextPage}
                onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
                onNextPage={() => setPage((p) => p + 1)}
                onPageSizeChange={(size) => {
                    setPageSize(size)
                    setPage(1)
                }}
                pageSizeOptions={MANAGE_PROGRAM_PAGE_SIZE_OPTIONS}
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

export default ManageProgramPage
