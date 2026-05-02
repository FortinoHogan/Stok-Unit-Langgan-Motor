import AppModal from "@/components/app-components/app-modal/AppModal"
import AppSwitch from "@/components/app-components/app-switch/AppSwitch"
import AppTable from "@/components/app-components/app-table/AppTable"
import AppTextField from "@/components/app-components/app-text-field/AppTextField"
import AppSearchBar from "@/components/app-layout/app-search-bar/AppSearchBar"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import type { AuthenticatedUser } from "@/interfaces/IModel.interface"
import { UserService } from "@/helpers/services/UserService"
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
} from "@tanstack/react-table"
import { useEffect, useState } from "react"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
import type {
    DeleteAuthenticatedUserRequest,
    GetAuthenticatedUserListRequest,
    InsertAuthenticatedUserRequest,
    UpdateAuthenticatedUserRequest,
} from "@/interfaces/IUserService.interface"
import { Pencil, Trash } from "lucide-react"
import { MANAGE_USER_PAGE_SIZE_OPTIONS, type PendingActionManageUser } from "./ManageUserPage.constant"

const ManageUserPage = () => {
    const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false)
    const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [isShowError, setIsShowError] = useState(false)
    const [newUserEmail, setNewUserEmail] = useState("")
    const [editingOriginalEmail, setEditingOriginalEmail] = useState("")
    const [isAdminChecked, setIsAdminChecked] = useState(false)
    const [editingUserId, setEditingUserId] = useState<number | null>(null)
    const [pendingAction, setPendingAction] = useState<PendingActionManageUser>(null)
    const [pendingDeleteUser, setPendingDeleteUser] = useState<AuthenticatedUser | null>(null)

    const [userList, setUserList] = useState<AuthenticatedUser[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const [totalCount, setTotalCount] = useState(0)

    const manageUserTableColumns: ColumnDef<AuthenticatedUser>[] = [
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "isAdmin",
            header: "Role",
            cell: ({ getValue }) => (getValue<boolean>() ? "Admin" : "Regular"),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        title="Edit user"
                        onClick={() => handleEditUser(row.original)}
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        title="Delete user"
                        onClick={() => handleOpenDeleteConfirmation(row.original)}
                    >
                        <Trash className="size-4" />
                    </Button>
                </div>
            ),
        }
    ]

    const hasNextPage = page * pageSize < totalCount

    const table = useReactTable({
        data: userList,
        columns: manageUserTableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const resetUserForm = () => {
        setNewUserEmail("")
        setEditingOriginalEmail("")
        setIsAdminChecked(false)
        setEditingUserId(null)
    }

    const resetConfirmActionState = () => {
        setPendingAction(null)
        setPendingDeleteUser(null)
        setIsConfirmActionModalOpen(false)
    }

    const handleOpenCreateModal = () => {
        resetUserForm()
        setIsUpsertModalOpen(true)
    }

    const handleEditUser = (user: AuthenticatedUser) => {
        setEditingUserId(user.userId)
        setNewUserEmail(user.email)
        setEditingOriginalEmail(user.email)
        setIsAdminChecked(user.isAdmin)
        setIsUpsertModalOpen(true)
    }

    const validateUniqueEmail = async (email: string) => {
        const normalizedEmail = email.trim().toLowerCase()
        const normalizedOriginalEmail = editingOriginalEmail.trim().toLowerCase()

        if (editingUserId && normalizedEmail === normalizedOriginalEmail) {
            return true
        }

        const res = await UserService.getUserByEmail({
            email: normalizedEmail,
        })

        if (res.data) {
            setErrorMessage("Email access already exists")
            setIsShowError(true)
            return false
        }

        return true
    }

    const handleOpenUpdateConfirmation = () => {
        if (!editingUserId || !newUserEmail.trim()) {
            return
        }

        setPendingAction("update")
        setPendingDeleteUser(null)
        setIsConfirmActionModalOpen(true)
    }

    const handleOpenInsertConfirmation = () => {
        if (!newUserEmail.trim()) {
            return
        }

        setPendingAction("insert")
        setPendingDeleteUser(null)
        setIsConfirmActionModalOpen(true)
    }

    const handleOpenDeleteConfirmation = (user: AuthenticatedUser) => {
        setPendingAction("delete")
        setPendingDeleteUser(user)
        setIsConfirmActionModalOpen(true)
    }

    const handleInsert = async () => {
        if (!newUserEmail.trim()) {
            return;
        }

        const isUniqueEmail = await validateUniqueEmail(newUserEmail)
        if (!isUniqueEmail) {
            return
        }

        const payload: InsertAuthenticatedUserRequest = {
            email: newUserEmail.trim().toLowerCase(),
            isAdmin: isAdminChecked,
            setIsLoading,
        }

        await UserService.insertAuthenticatedUser(payload)
            .then(() => {
                setIsUpsertModalOpen(false)
                setNewUserEmail("")
                setIsAdminChecked(false)
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("User access added successfully")
                setIsShowError(true)
                handleFetchUsers()
            })
            .catch((error) => {
                setErrorMessage(error.message);
                setIsShowError(true);
            })
    }

    const handleUpdate = async () => {
        if (!editingUserId || !newUserEmail.trim()) {
            return;
        }

        const isUniqueEmail = await validateUniqueEmail(newUserEmail)
        if (!isUniqueEmail) {
            return
        }

        const payload: UpdateAuthenticatedUserRequest = {
            userId: editingUserId,
            email: newUserEmail.trim().toLowerCase(),
            isAdmin: isAdminChecked,
            setIsLoading,
        }

        await UserService.updateAuthenticatedUser(payload)
            .then(() => {
                setIsUpsertModalOpen(false)
                resetUserForm()
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("User access updated successfully")
                setIsShowError(true)
                handleFetchUsers()
            })
            .catch((error) => {
                setErrorMessage(error.message)
                setIsShowError(true)
            })
    }

    const handleDeleteUser = async (user: AuthenticatedUser) => {
        const payload: DeleteAuthenticatedUserRequest = {
            userId: user.userId,
            setIsLoading,
        }

        await UserService.deleteAuthenticatedUser(payload)
            .then(() => {
                resetConfirmActionState()
                setErrorMessage("")
                setSuccessMessage("User access deleted successfully")
                setIsShowError(true)
                if (userList.length === 1 && page > 1) {
                    setPage((prev) => prev - 1)
                    return
                }

                handleFetchUsers()
            })
            .catch((error) => {
                setErrorMessage(error.message)
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

        if (pendingAction === "delete" && pendingDeleteUser) {
            await handleDeleteUser(pendingDeleteUser)
        }
    }

    const handleFetchUsers = async () => {
        const payload: GetAuthenticatedUserListRequest = {
            page,
            pageSize,
            search,
            setIsLoading,
        }

        await UserService.getAuthenticatedUserList(payload)
            .then((res) => {
                setUserList(res.data || []);
                setTotalCount(res.count ?? 0)
            })
            .catch((error) => {
                setErrorMessage(error.message);
                setIsShowError(true);
            })
    }

    useEffect(() => {
        handleFetchUsers();
    }, [page, pageSize, search])

    return (
        <div>
            <div className="mb-4">
                <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                    Manage User
                </h1>
                <p className="text-muted-foreground">Manage email and role access for this application</p>
            </div>
            <AppModal
                trigger={<Button className="mb-4" onClick={handleOpenCreateModal}>Add Email Access</Button>}
                title={editingUserId ? "Edit User Access" : "Add New User Access"}
                description={editingUserId ? "Update email access for AuthenticatedUser" : "Add a new email access for AuthenticatedUser"}
                open={isUpsertModalOpen}
                onOpenChange={(open) => {
                    setIsUpsertModalOpen(open)

                    if (!open) {
                        resetUserForm()
                    }
                }}
                footer={
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            onClick={() => {
                                setIsUpsertModalOpen(false)
                                resetUserForm()
                            }}
                            variant={"outline"}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (editingUserId) {
                                    handleOpenUpdateConfirmation()
                                    return
                                }

                                handleOpenInsertConfirmation()
                            }}
                        >
                            {editingUserId ? "Update" : "Save"}
                        </Button>
                    </div>
                }
            >
                <AppTextField
                    label="Email"
                    placeholder="user123@example.com"
                    type="email"
                    required={true}
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e)}
                />
                <div>
                    <FieldLabel className="mb-2">Admin Access</FieldLabel>
                    <AppSwitch
                        label={isAdminChecked ? "This user will get Admin Access" : "This user will get Regular Access"}
                        checked={isAdminChecked}
                        onCheckedChange={setIsAdminChecked}
                    />
                </div>
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
                        ? "Delete User Access"
                        : pendingAction === "insert"
                            ? "Confirm Save"
                            : "Confirm Update"
                }
                description={
                    pendingAction === "delete"
                        ? "This action will remove the selected user access"
                        : pendingAction === "insert"
                            ? "This action will add new user access"
                            : "This action will update the selected user access"
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
                        ? "Are you sure you want to delete this user?"
                        : pendingAction === "insert"
                            ? "Are you sure you want to add this user?"
                            : "Are you sure you want to update this user?"}
                </p>
            </AppModal>
            <AppSearchBar
                label="Search User"
                placeholder="user123@example.com"
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
                columnsCount={manageUserTableColumns.length}
                emptyMessage={"No users found."}
                showPagination
                page={page}
                pageSize={pageSize}
                rowCount={userList.length}
                hasNextPage={hasNextPage}
                onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
                onNextPage={() => setPage((p) => p + 1)}
                onPageSizeChange={(size) => {
                    setPageSize(size)
                    setPage(1)
                }}
                pageSizeOptions={MANAGE_USER_PAGE_SIZE_OPTIONS}
                pageInfoRenderer={({ page, rowCount }) =>
                    `Page ${page} • ${totalCount} total • ${rowCount} row(s) shown`
                }
            />
            <AppModal
                open={isShowError}
                onOpenChange={setIsShowError}
                title={errorMessage ? "Error" : "Success"}
                showCloseButton={true}
                contentProps={{
                    onOpenAutoFocus: (event) => {
                        event.preventDefault();
                    },
                    onCloseAutoFocus: (event) => {
                        event.preventDefault();
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
                                setErrorMessage("");
                                setSuccessMessage("");
                                setIsShowError(false);
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

export default ManageUserPage