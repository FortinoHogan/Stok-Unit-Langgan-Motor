import { useEffect, useMemo, useState } from "react"
import {
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table"
import { Pencil, Trash } from "lucide-react"

import AppExistingList from "@/components/app-components/app-existing-list/AppExistingList"
import AppModal from "@/components/app-components/app-modal/AppModal"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
import AppTable from "@/components/app-components/app-table/AppTable"
import AppTextField from "@/components/app-components/app-text-field/AppTextField"
import AppSearchBar from "@/components/app-layout/app-search-bar/AppSearchBar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { usePrivillegeAccess } from "@/helpers/hooks/usePrivillegeAccess/usePrivillegeAccess"
import { RoleService } from "@/helpers/services/RoleService"
import type { MsRole } from "@/interfaces/IModel.interface"
import type {
  DeleteRoleRequest,
  GetRoleListRequest,
  InsertRoleRequest,
  UpdateRoleRequest,
} from "@/interfaces/IRoleService"
import { MANAGE_ROLE_PAGE_SIZE_OPTIONS } from "./ManageRolePage.constant"

const ManageRolePage = () => {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
  const roleAccess = usePrivillegeAccess("Master Role")

  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false)
  const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isShowError, setIsShowError] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null)
  const [pendingAction, setPendingAction] = useState<"insert" | "update" | "delete" | null>(null)
  const [pendingDeleteRole, setPendingDeleteRole] = useState<MsRole | null>(null)

  const [roleList, setRoleList] = useState<MsRole[]>([])
  const [existingRoleList, setExistingRoleList] = useState<MsRole[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const manageRoleTableColumns: ColumnDef<MsRole>[] = [
    {
      accessorKey: "roleName",
      header: "Role Name",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {roleAccess.canUpdate ? (
            <Button
              variant="outline"
              size="sm"
              title="Edit role"
              onClick={() => handleEditRole(row.original)}
            >
              <Pencil className="size-4" />
            </Button>
          ) : null}
          {roleAccess.canDelete ? (
            <Button
              variant="destructive"
              size="sm"
              title="Delete role"
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
    data: roleList,
    columns: manageRoleTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const filteredExistingRoleList = useMemo(() => {
    const keyword = newRoleName.trim().toLowerCase()

    if (!keyword) {
      return existingRoleList
    }

    return existingRoleList.filter((role) =>
      role.roleName.toLowerCase().includes(keyword),
    )
  }, [existingRoleList, newRoleName])

  const ensureAuthenticatedUserId = () => {
    const userId = authenticatedUser?.userId

    if (!userId) {
      setErrorMessage("Authenticated user not found. Please login again.")
      setIsShowError(true)
      return null
    }

    return userId
  }

  const resetRoleForm = () => {
    setNewRoleName("")
    setEditingRoleId(null)
  }

  const resetConfirmActionState = () => {
    setPendingAction(null)
    setPendingDeleteRole(null)
    setIsConfirmActionModalOpen(false)
  }

  const handleOpenCreateModal = () => {
    resetRoleForm()
    handleFetchExistingRoles()
    setIsUpsertModalOpen(true)
  }

  const handleEditRole = (role: MsRole) => {
    setEditingRoleId(role.roleId)
    setNewRoleName(role.roleName)
    handleFetchExistingRoles()
    setIsUpsertModalOpen(true)
  }

  const handleOpenUpdateConfirmation = () => {
    if (!editingRoleId || !newRoleName.trim()) {
      return
    }

    setPendingAction("update")
    setPendingDeleteRole(null)
    setIsConfirmActionModalOpen(true)
  }

  const handleOpenInsertConfirmation = () => {
    if (!newRoleName.trim()) {
      return
    }

    setPendingAction("insert")
    setPendingDeleteRole(null)
    setIsConfirmActionModalOpen(true)
  }

  const handleOpenDeleteConfirmation = (role: MsRole) => {
    setPendingAction("delete")
    setPendingDeleteRole(role)
    setIsConfirmActionModalOpen(true)
  }

  const isDuplicateRoleName = () => {
    const normalizedRoleName = newRoleName.trim().toLowerCase()

    return existingRoleList.some((role) => {
      const isSameRecord = editingRoleId ? role.roleId === editingRoleId : false

      if (isSameRecord) {
        return false
      }

      return role.roleName.trim().toLowerCase() === normalizedRoleName
    })
  }

  const handleInsert = async () => {
    if (!newRoleName.trim()) {
      return
    }

    if (isDuplicateRoleName()) {
      setErrorMessage("Role name already exists")
      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: InsertRoleRequest = {
      roleName: newRoleName.trim(),
      userIn: userId,
      setIsLoading,
    }

    await RoleService.insertRole(payload)
      .then(() => {
        setIsUpsertModalOpen(false)
        resetRoleForm()
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Role added successfully")
        setIsShowError(true)
        handleFetchRoles()
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleUpdate = async () => {
    if (!editingRoleId || !newRoleName.trim()) {
      return
    }

    if (isDuplicateRoleName()) {
      setErrorMessage("Role name already exists")
      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: UpdateRoleRequest = {
      roleId: editingRoleId,
      roleName: newRoleName.trim(),
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading,
    }

    await RoleService.updateRole(payload)
      .then(() => {
        setIsUpsertModalOpen(false)
        resetRoleForm()
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Role updated successfully")
        setIsShowError(true)
        handleFetchRoles()
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleDeleteRole = async (role: MsRole) => {
    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: DeleteRoleRequest = {
      roleId: role.roleId,
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading,
    }

    await RoleService.deleteRole(payload)
      .then(() => {
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Role deleted successfully")
        setIsShowError(true)

        if (roleList.length === 1 && page > 1) {
          setPage((prev) => prev - 1)
          return
        }

        handleFetchRoles()
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

    if (pendingAction === "delete" && pendingDeleteRole) {
      await handleDeleteRole(pendingDeleteRole)
    }
  }

  const handleFetchRoles = async () => {
    const payload: GetRoleListRequest = {
      page,
      pageSize,
      search,
      setIsLoading,
    }

    await RoleService.getRoleList(payload)
      .then((res) => {
        setRoleList(res.data || [])
        setTotalCount(res.count ?? 0)
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleFetchExistingRoles = async () => {
    await RoleService.getRoleList({
      page: 1,
      pageSize: 1000,
      search: "",
    })
      .then((res) => {
        setExistingRoleList(res.data || [])
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  useEffect(() => {
    handleFetchRoles()
  }, [page, pageSize, search])

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Manage Role
        </h1>
        <p className="text-muted-foreground">Manage role access (e.g., Admin, Staff)</p>
      </div>

      <AppModal
        trigger={roleAccess.canInsert ? <Button className="mb-4" onClick={handleOpenCreateModal}>Add Role</Button> : undefined}
        title={editingRoleId ? "Edit Role" : "Add New Role"}
        description={editingRoleId ? "Update selected role" : "Add a new role"}
        open={isUpsertModalOpen}
        onOpenChange={(open) => {
          setIsUpsertModalOpen(open)

          if (!open) {
            resetRoleForm()
          }
        }}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              onClick={() => {
                setIsUpsertModalOpen(false)
                resetRoleForm()
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (editingRoleId) {
                  handleOpenUpdateConfirmation()
                  return
                }

                handleOpenInsertConfirmation()
              }}
            >
              {editingRoleId ? "Update" : "Save"}
            </Button>
          </div>
        }
      >
        <AppTextField
          label="Role Name"
          placeholder="Admin"
          required={true}
          value={newRoleName}
          onChange={(value) => setNewRoleName(value)}
        />
        <AppExistingList
          title="Existing Role List"
          items={filteredExistingRoleList.map((role) => role.roleName)}
          emptyMessage="No role data"
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
            ? "Delete Role"
            : pendingAction === "insert"
              ? "Confirm Save"
              : "Confirm Update"
        }
        description={
          pendingAction === "delete"
            ? "This action will remove the selected role"
            : pendingAction === "insert"
              ? "This action will add new role"
              : "This action will update the selected role"
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
            ? "Are you sure you want to delete this role?"
            : pendingAction === "insert"
              ? "Are you sure you want to add this role?"
              : "Are you sure you want to update this role?"}
        </p>
      </AppModal>

      <AppSearchBar
        label="Search Role"
        placeholder="Admin"
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
        columnsCount={manageRoleTableColumns.length}
        emptyMessage="No roles found."
        showPagination
        page={page}
        pageSize={pageSize}
        rowCount={roleList.length}
        hasNextPage={hasNextPage}
        onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
        onNextPage={() => setPage((p) => p + 1)}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        pageSizeOptions={MANAGE_ROLE_PAGE_SIZE_OPTIONS}
        pageInfoRenderer={({ page: currentPage, rowCount }) =>
          `Page ${currentPage} • ${totalCount} total • ${rowCount} row(s) shown`
        }
      />

      <AppModal
        open={isShowError}
        onOpenChange={setIsShowError}
        title={errorMessage ? "Error" : "Success"}
        showCloseButton={true}
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

export default ManageRolePage
