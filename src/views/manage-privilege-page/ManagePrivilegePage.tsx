import { useEffect, useMemo, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
import { usePrivilegeAccess } from "@/helpers/hooks/usePrivilegeAccess/usePrivilegeAccess"
import { PrivilegeService } from "@/helpers/services/PrivilegeService"
import type { MsPrivilege } from "@/interfaces/IModel.interface"
import type {
  DeletePrivilegeRequest,
  GetPrivilegeListRequest,
  InsertPrivilegeRequest,
  UpdatePrivilegeRequest,
} from "@/interfaces/IPrivilegeService"
import { MANAGE_PRIVILEGE_PAGE_SIZE_OPTIONS } from "./ManagePrivilegePage.constant"

const CRUD_ACTIONS = ["Insert", "Update", "Delete", "Read"] as const

const ManagePrivilegePage = () => {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
  const privilegeAccess = usePrivilegeAccess("Master Privilege")

  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false)
  const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isShowError, setIsShowError] = useState(false)
  const [newPrivilegeName, setNewPrivilegeName] = useState("")
  const [editingPrivilegeId, setEditingPrivilegeId] = useState<number | null>(null)
  const [pendingAction, setPendingAction] = useState<"insert" | "update" | "delete" | null>(null)
  const [pendingDeletePrivilege, setPendingDeletePrivilege] = useState<MsPrivilege | null>(null)

  const [isCrudMode, setIsCrudMode] = useState(false)
  const [crudResourceName, setCrudResourceName] = useState("")

  const [privilegeList, setPrivilegeList] = useState<MsPrivilege[]>([])
  const [existingPrivilegeList, setExistingPrivilegeList] = useState<MsPrivilege[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const existingPrivilegeNameSet = useMemo(
    () => new Set(existingPrivilegeList.map((p) => p.privilegeName.trim().toLowerCase())),
    [existingPrivilegeList],
  )

  const crudPrivilegeNames = useMemo(
    () =>
      CRUD_ACTIONS.map((action) => ({
        name: `${action} ${crudResourceName.trim()}`,
        alreadyExists: existingPrivilegeNameSet.has(
          `${action} ${crudResourceName.trim()}`.toLowerCase(),
        ),
      })),
    [crudResourceName, existingPrivilegeNameSet],
  )

  const crudNamesToInsert = useMemo(
    () => crudPrivilegeNames.filter((item) => !item.alreadyExists).map((item) => item.name),
    [crudPrivilegeNames],
  )

  const managePrivilegeTableColumns: ColumnDef<MsPrivilege>[] = [
    {
      accessorKey: "privilegeName",
      header: "Privilege Name",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {privilegeAccess.canUpdate ? (
            <Button
              variant="outline"
              size="sm"
              title="Edit Privilege"
              onClick={() => handleEditPrivilege(row.original)}
            >
              <Pencil className="size-4" />
            </Button>
          ) : null}
          {privilegeAccess.canDelete ? (
            <Button
              variant="destructive"
              size="sm"
              title="Delete Privilege"
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
    data: privilegeList,
    columns: managePrivilegeTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const filteredExistingPrivilegeList = useMemo(() => {
    const keyword = newPrivilegeName.trim().toLowerCase();

    if (!keyword) {
      return existingPrivilegeList;
    }

    return existingPrivilegeList.filter((privilege) =>
      privilege.privilegeName.toLowerCase().includes(keyword),
    );
  }, [existingPrivilegeList, newPrivilegeName]);

  const ensureAuthenticatedUserId = () => {
    const userId = authenticatedUser?.userId

    if (!userId) {
      setErrorMessage("Authenticated user not found. Please login again.")
      setIsShowError(true)
      return null
    }

    return userId
  }

  const resetPrivilegeForm = () => {
    setNewPrivilegeName("")
    setEditingPrivilegeId(null)
    setIsCrudMode(false)
    setCrudResourceName("")
  }

  const resetConfirmActionState = () => {
    setPendingAction(null)
    setPendingDeletePrivilege(null)
    setIsConfirmActionModalOpen(false)
  }

  const handleOpenCreateModal = () => {
    resetPrivilegeForm()
    handleFetchExistingPrivileges()
    setIsUpsertModalOpen(true)
  }

  const handleEditPrivilege = (privilege: MsPrivilege) => {
    setEditingPrivilegeId(privilege.privilegeId)
    setNewPrivilegeName(privilege.privilegeName)
    handleFetchExistingPrivileges()
    setIsUpsertModalOpen(true)
  }

  const handleOpenUpdateConfirmation = () => {
    if (!editingPrivilegeId || !newPrivilegeName.trim()) {
      return
    }

    setPendingAction("update")
    setPendingDeletePrivilege(null)
    setIsConfirmActionModalOpen(true)
  }

  const handleOpenInsertConfirmation = () => {
    if (isCrudMode) {
      if (!crudResourceName.trim() || crudNamesToInsert.length === 0) {
        return
      }

      setPendingAction("insert")
      setPendingDeletePrivilege(null)
      setIsConfirmActionModalOpen(true)
      return
    }

    if (!newPrivilegeName.trim()) {
      return
    }

    setPendingAction("insert")
    setPendingDeletePrivilege(null)
    setIsConfirmActionModalOpen(true)
  }

  const handleOpenDeleteConfirmation = (privilege: MsPrivilege) => {
    setPendingAction("delete")
    setPendingDeletePrivilege(privilege)
    setIsConfirmActionModalOpen(true)
  }

  const isDuplicatePrivilegeName = () => {
    const normalizedPrivilegeName = newPrivilegeName.trim().toLowerCase()

    return existingPrivilegeList.some((privilege) => {
      const isSameRecord = editingPrivilegeId
        ? privilege.privilegeId === editingPrivilegeId
        : false

      if (isSameRecord) {
        return false
      }

      return privilege.privilegeName.trim().toLowerCase() === normalizedPrivilegeName
    })
  }

  const handleInsert = async () => {
    if (isCrudMode) {
      if (!crudResourceName.trim() || crudNamesToInsert.length === 0) {
        return
      }

      const userId = ensureAuthenticatedUserId()
      if (!userId) {
        return
      }

      setIsLoading(true)
      try {
        for (const privilegeName of crudNamesToInsert) {
          await PrivilegeService.insertPrivilege({ privilegeName, userIn: userId })
        }

        setIsUpsertModalOpen(false)
        resetPrivilegeForm()
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage(`${crudNamesToInsert.length} privilege(s) added successfully`)
        setIsShowError(true)
        handleFetchPrivileges()
      } catch (error: unknown) {
        const err = error as { error: { message: string } }
        setErrorMessage(err.error.message)
        setIsShowError(true)
      } finally {
        setIsLoading(false)
      }

      return
    }

    if (!newPrivilegeName.trim()) {
      return
    }

    if (isDuplicatePrivilegeName()) {
      setErrorMessage("Privilege name already exists")
      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: InsertPrivilegeRequest = {
      privilegeName: newPrivilegeName.trim(),
      userIn: userId,
      setIsLoading,
    }

    await PrivilegeService.insertPrivilege(payload)
      .then(() => {
        setIsUpsertModalOpen(false)
        resetPrivilegeForm()
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Privilege added successfully")
        setIsShowError(true)
        handleFetchPrivileges()
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleUpdate = async () => {
    if (!editingPrivilegeId || !newPrivilegeName.trim()) {
      return
    }

    if (isDuplicatePrivilegeName()) {
      setErrorMessage("Privilege name already exists")
      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: UpdatePrivilegeRequest = {
      privilegeId: editingPrivilegeId,
      privilegeName: newPrivilegeName.trim(),
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading,
    }

    await PrivilegeService.updatePrivilege(payload)
      .then(() => {
        setIsUpsertModalOpen(false)
        resetPrivilegeForm()
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Privilege updated successfully")
        setIsShowError(true)
        handleFetchPrivileges()
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleDeletePrivilege = async (privilege: MsPrivilege) => {
    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: DeletePrivilegeRequest = {
      privilegeId: privilege.privilegeId,
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading,
    }

    await PrivilegeService.deletePrivilege(payload)
      .then(() => {
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Privilege deleted successfully")
        setIsShowError(true)

        if (privilegeList.length === 1 && page > 1) {
          setPage((prev) => prev - 1)
          return
        }

        handleFetchPrivileges()
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

    if (pendingAction === "delete" && pendingDeletePrivilege) {
      await handleDeletePrivilege(pendingDeletePrivilege)
    }
  }

  const handleFetchPrivileges = async () => {
    const payload: GetPrivilegeListRequest = {
      page,
      pageSize,
      search,
      setIsLoading,
    }

    await PrivilegeService.getPrivilegeList(payload)
      .then((res) => {
        setPrivilegeList(res.data || [])
        setTotalCount(res.count ?? 0)
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleFetchExistingPrivileges = async () => {
    await PrivilegeService.getPrivilegeList({
      page: 1,
      pageSize: 9999,
      search: "",
    })
      .then((res) => {
        setExistingPrivilegeList(res.data || [])
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  useEffect(() => {
    handleFetchPrivileges()
  }, [page, pageSize, search])

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Manage Privilege
        </h1>
        <p className="text-muted-foreground">Manage Privilege access (e.g., Read Master Category)</p>
      </div>

      <AppModal
        trigger={privilegeAccess.canInsert ? <Button className="mb-4" onClick={handleOpenCreateModal}>Add Privilege</Button> : undefined}
        classNames={{
          content: "sm:max-w-lg",
        }}
        title={editingPrivilegeId ? "Edit Privilege" : "Add New Privilege"}
        description={
          editingPrivilegeId
            ? "Update selected Privilege"
            : isCrudMode
              ? "Generate CRUD Privileges for a resource"
              : "Add a new Privilege"
        }
        open={isUpsertModalOpen}
        onOpenChange={(open) => {
          setIsUpsertModalOpen(open)

          if (!open) {
            resetPrivilegeForm()
          }
        }}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              onClick={() => {
                setIsUpsertModalOpen(false)
                resetPrivilegeForm()
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (editingPrivilegeId) {
                  handleOpenUpdateConfirmation()
                  return
                }

                handleOpenInsertConfirmation()
              }}
            >
              {editingPrivilegeId ? "Update" : "Save"}
            </Button>
          </div>
        }
      >
        {!editingPrivilegeId ? (
          <div className="mb-4 flex items-center gap-2">
            <Checkbox
              id="crud-mode-checkbox"
              checked={isCrudMode}
              onCheckedChange={(checked) => {
                setIsCrudMode(Boolean(checked))
                setCrudResourceName("")
                setNewPrivilegeName("")
              }}
            />
            <Label htmlFor="crud-mode-checkbox" className="cursor-pointer text-sm font-medium">
              CRUD Mode (generate Insert / Update / Delete / Read)
            </Label>
          </div>
        ) : null}

        {isCrudMode && !editingPrivilegeId ? (
          <div className="mb-5">
            <AppTextField
              label="Resource Name"
              placeholder="Master Program"
              required
              value={crudResourceName}
              onChange={(value) => setCrudResourceName(value)}
            />
            {crudResourceName.trim() ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">Privileges to be added:</p>
                <ul className="rounded-md border p-2 text-sm space-y-1">
                  {crudPrivilegeNames.map((item) => (
                    <li
                      key={item.name}
                      className={item.alreadyExists ? "text-muted-foreground line-through" : ""}
                    >
                      {item.name}
                      {item.alreadyExists ? (
                        <span className="ml-2 text-xs text-destructive">(already exists)</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                {crudNamesToInsert.length === 0 ? (
                  <p className="text-xs text-destructive">All Privileges already exist.</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <AppTextField
            label="Privilege Name"
            placeholder="Can Edit User"
            required={true}
            value={newPrivilegeName}
            onChange={(value) => setNewPrivilegeName(value)}
          />
        )}

        <AppExistingList
          title="Existing Privilege List"
          items={
            isCrudMode && crudResourceName.trim()
              ? crudPrivilegeNames.filter((item) => item.alreadyExists).map((item) => item.name)
              : filteredExistingPrivilegeList.map((privilege) => privilege.privilegeName)
          }
          emptyMessage="No Privilege data"
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
            ? "Delete Privilege"
            : pendingAction === "insert"
              ? "Confirm Save"
              : "Confirm Update"
        }
        description={
          pendingAction === "delete"
            ? "This action will remove the selected Privilege"
            : pendingAction === "insert"
              ? "This action will add new Privilege"
              : "This action will update the selected Privilege"
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
            ? "Are you sure you want to delete this Privilege?"
            : pendingAction === "insert"
              ? "Are you sure you want to add this Privilege?"
              : "Are you sure you want to update this Privilege?"}
        </p>
      </AppModal>

      <AppSearchBar
        label="Search Privilege"
        placeholder="Can Edit"
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
        columnsCount={managePrivilegeTableColumns.length}
        emptyMessage="No Privileges found."
        showPagination
        page={page}
        pageSize={pageSize}
        rowCount={privilegeList.length}
        hasNextPage={hasNextPage}
        onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
        onNextPage={() => setPage((p) => p + 1)}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        pageSizeOptions={MANAGE_PRIVILEGE_PAGE_SIZE_OPTIONS}
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

export default ManagePrivilegePage
