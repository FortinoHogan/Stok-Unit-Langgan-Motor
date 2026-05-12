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
import { PrivillegeService } from "@/helpers/services/PrivillegeService"
import type { MsPrivillege } from "@/interfaces/IModel.interface"
import type {
  DeletePrivillegeRequest,
  GetPrivillegeListRequest,
  InsertPrivillegeRequest,
  UpdatePrivillegeRequest,
} from "@/interfaces/IPrivillegeService"
import { MANAGE_PRIVILLEGE_PAGE_SIZE_OPTIONS } from "./ManagePrivillegePage.constant"

const ManagePrivillegePage = () => {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
  const privillegeAccess = usePrivillegeAccess("Master Privillege")

  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false)
  const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isShowError, setIsShowError] = useState(false)
  const [newPrivillegeName, setNewPrivillegeName] = useState("")
  const [editingPrivillegeId, setEditingPrivillegeId] = useState<number | null>(null)
  const [pendingAction, setPendingAction] = useState<"insert" | "update" | "delete" | null>(null)
  const [pendingDeletePrivillege, setPendingDeletePrivillege] = useState<MsPrivillege | null>(null)

  const [privillegeList, setPrivillegeList] = useState<MsPrivillege[]>([])
  const [existingPrivillegeList, setExistingPrivillegeList] = useState<MsPrivillege[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const managePrivillegeTableColumns: ColumnDef<MsPrivillege>[] = [
    {
      accessorKey: "privillegeName",
      header: "Privillege Name",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {privillegeAccess.canUpdate ? (
            <Button
              variant="outline"
              size="sm"
              title="Edit privillege"
              onClick={() => handleEditPrivillege(row.original)}
            >
              <Pencil className="size-4" />
            </Button>
          ) : null}
          {privillegeAccess.canDelete ? (
            <Button
              variant="destructive"
              size="sm"
              title="Delete privillege"
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
    data: privillegeList,
    columns: managePrivillegeTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const filteredExistingPrivillegeList = useMemo(() => {
    const keyword = newPrivillegeName.trim().toLowerCase()

    if (!keyword) {
      return existingPrivillegeList
    }

    return existingPrivillegeList.filter((privillege) =>
      privillege.privillegeName.toLowerCase().includes(keyword),
    )
  }, [existingPrivillegeList, newPrivillegeName])

  const ensureAuthenticatedUserId = () => {
    const userId = authenticatedUser?.userId

    if (!userId) {
      setErrorMessage("Authenticated user not found. Please login again.")
      setIsShowError(true)
      return null
    }

    return userId
  }

  const resetPrivillegeForm = () => {
    setNewPrivillegeName("")
    setEditingPrivillegeId(null)
  }

  const resetConfirmActionState = () => {
    setPendingAction(null)
    setPendingDeletePrivillege(null)
    setIsConfirmActionModalOpen(false)
  }

  const handleOpenCreateModal = () => {
    resetPrivillegeForm()
    handleFetchExistingPrivilleges()
    setIsUpsertModalOpen(true)
  }

  const handleEditPrivillege = (privillege: MsPrivillege) => {
    setEditingPrivillegeId(privillege.privillegeId)
    setNewPrivillegeName(privillege.privillegeName)
    handleFetchExistingPrivilleges()
    setIsUpsertModalOpen(true)
  }

  const handleOpenUpdateConfirmation = () => {
    if (!editingPrivillegeId || !newPrivillegeName.trim()) {
      return
    }

    setPendingAction("update")
    setPendingDeletePrivillege(null)
    setIsConfirmActionModalOpen(true)
  }

  const handleOpenInsertConfirmation = () => {
    if (!newPrivillegeName.trim()) {
      return
    }

    setPendingAction("insert")
    setPendingDeletePrivillege(null)
    setIsConfirmActionModalOpen(true)
  }

  const handleOpenDeleteConfirmation = (privillege: MsPrivillege) => {
    setPendingAction("delete")
    setPendingDeletePrivillege(privillege)
    setIsConfirmActionModalOpen(true)
  }

  const isDuplicatePrivillegeName = () => {
    const normalizedPrivillegeName = newPrivillegeName.trim().toLowerCase()

    return existingPrivillegeList.some((privillege) => {
      const isSameRecord = editingPrivillegeId
        ? privillege.privillegeId === editingPrivillegeId
        : false

      if (isSameRecord) {
        return false
      }

      return privillege.privillegeName.trim().toLowerCase() === normalizedPrivillegeName
    })
  }

  const handleInsert = async () => {
    if (!newPrivillegeName.trim()) {
      return
    }

    if (isDuplicatePrivillegeName()) {
      setErrorMessage("Privillege name already exists")
      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: InsertPrivillegeRequest = {
      privillegeName: newPrivillegeName.trim(),
      userIn: userId,
      setIsLoading,
    }

    await PrivillegeService.insertPrivillege(payload)
      .then(() => {
        setIsUpsertModalOpen(false)
        resetPrivillegeForm()
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Privillege added successfully")
        setIsShowError(true)
        handleFetchPrivilleges()
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleUpdate = async () => {
    if (!editingPrivillegeId || !newPrivillegeName.trim()) {
      return
    }

    if (isDuplicatePrivillegeName()) {
      setErrorMessage("Privillege name already exists")
      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: UpdatePrivillegeRequest = {
      privillegeId: editingPrivillegeId,
      privillegeName: newPrivillegeName.trim(),
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading,
    }

    await PrivillegeService.updatePrivillege(payload)
      .then(() => {
        setIsUpsertModalOpen(false)
        resetPrivillegeForm()
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Privillege updated successfully")
        setIsShowError(true)
        handleFetchPrivilleges()
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleDeletePrivillege = async (privillege: MsPrivillege) => {
    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: DeletePrivillegeRequest = {
      privillegeId: privillege.privillegeId,
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading,
    }

    await PrivillegeService.deletePrivillege(payload)
      .then(() => {
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Privillege deleted successfully")
        setIsShowError(true)

        if (privillegeList.length === 1 && page > 1) {
          setPage((prev) => prev - 1)
          return
        }

        handleFetchPrivilleges()
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

    if (pendingAction === "delete" && pendingDeletePrivillege) {
      await handleDeletePrivillege(pendingDeletePrivillege)
    }
  }

  const handleFetchPrivilleges = async () => {
    const payload: GetPrivillegeListRequest = {
      page,
      pageSize,
      search,
      setIsLoading,
    }

    await PrivillegeService.getPrivillegeList(payload)
      .then((res) => {
        setPrivillegeList(res.data || [])
        setTotalCount(res.count ?? 0)
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleFetchExistingPrivilleges = async () => {
    await PrivillegeService.getPrivillegeList({
      page: 1,
      pageSize: 9999,
      search: "",
    })
      .then((res) => {
        setExistingPrivillegeList(res.data || [])
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  useEffect(() => {
    handleFetchPrivilleges()
  }, [page, pageSize, search])

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Manage Privillege
        </h1>
        <p className="text-muted-foreground">Manage privillege access (e.g., Read Master Category)</p>
      </div>

      <AppModal
        trigger={privillegeAccess.canInsert ? <Button className="mb-4" onClick={handleOpenCreateModal}>Add Privillege</Button> : undefined}
        title={editingPrivillegeId ? "Edit Privillege" : "Add New Privillege"}
        description={editingPrivillegeId ? "Update selected privillege" : "Add a new privillege"}
        open={isUpsertModalOpen}
        onOpenChange={(open) => {
          setIsUpsertModalOpen(open)

          if (!open) {
            resetPrivillegeForm()
          }
        }}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              onClick={() => {
                setIsUpsertModalOpen(false)
                resetPrivillegeForm()
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (editingPrivillegeId) {
                  handleOpenUpdateConfirmation()
                  return
                }

                handleOpenInsertConfirmation()
              }}
            >
              {editingPrivillegeId ? "Update" : "Save"}
            </Button>
          </div>
        }
      >
        <AppTextField
          label="Privillege Name"
          placeholder="Can Edit User"
          required={true}
          value={newPrivillegeName}
          onChange={(value) => setNewPrivillegeName(value)}
        />
        <AppExistingList
          title="Existing Privillege List"
          items={filteredExistingPrivillegeList.map((privillege) => privillege.privillegeName)}
          emptyMessage="No privillege data"
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
            ? "Delete Privillege"
            : pendingAction === "insert"
              ? "Confirm Save"
              : "Confirm Update"
        }
        description={
          pendingAction === "delete"
            ? "This action will remove the selected privillege"
            : pendingAction === "insert"
              ? "This action will add new privillege"
              : "This action will update the selected privillege"
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
            ? "Are you sure you want to delete this privillege?"
            : pendingAction === "insert"
              ? "Are you sure you want to add this privillege?"
              : "Are you sure you want to update this privillege?"}
        </p>
      </AppModal>

      <AppSearchBar
        label="Search Privillege"
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
        columnsCount={managePrivillegeTableColumns.length}
        emptyMessage="No privilleges found."
        showPagination
        page={page}
        pageSize={pageSize}
        rowCount={privillegeList.length}
        hasNextPage={hasNextPage}
        onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
        onNextPage={() => setPage((p) => p + 1)}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        pageSizeOptions={MANAGE_PRIVILLEGE_PAGE_SIZE_OPTIONS}
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

export default ManagePrivillegePage
