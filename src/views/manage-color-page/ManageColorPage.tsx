import AppModal from "@/components/app-components/app-modal/AppModal"
import AppExistingList from "@/components/app-components/app-existing-list/AppExistingList"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
import AppTable from "@/components/app-components/app-table/AppTable"
import AppTextField from "@/components/app-components/app-text-field/AppTextField"
import AppSearchBar from "@/components/app-layout/app-search-bar/AppSearchBar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { usePrivilegeAccess } from "@/helpers/hooks/usePrivilegeAccess/usePrivilegeAccess"
import { ColorService } from "@/helpers/services/ColorService"
import type {
  DeleteColorRequest,
  GetColorListRequest,
  InsertColorRequest,
  UpdateColorRequest,
} from "@/interfaces/IColorService"
import type { MsColor } from "@/interfaces/IModel.interface"
import {
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table"
import { Pencil, Trash } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { MANAGE_COLOR_PAGE_SIZE_OPTIONS, type PendingActionManageColor } from "./MangeColorPage.constant"

const ManageColorPage = () => {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
  const colorAccess = usePrivilegeAccess("Master Color")

  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false)
  const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isShowError, setIsShowError] = useState(false)
  const [newColorName, setNewColorName] = useState("")
  const [editingColorId, setEditingColorId] = useState<number | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingActionManageColor>(null)
  const [pendingDeleteColor, setPendingDeleteColor] = useState<MsColor | null>(null)

  const [colorList, setColorList] = useState<MsColor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [existingColorList, setExistingColorList] = useState<MsColor[]>([])

  const manageColorTableColumns: ColumnDef<MsColor>[] = [
    {
      accessorKey: "colorName",
      header: "Color Name",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {colorAccess.canUpdate ? (
            <Button
              variant="outline"
              size="sm"
              title="Edit color"
              onClick={() => handleEditColor(row.original)}
            >
              <Pencil className="size-4" />
            </Button>
          ) : null}
          {colorAccess.canDelete ? (
            <Button
              variant="destructive"
              size="sm"
              title="Delete color"
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
    data: colorList,
    columns: manageColorTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const filteredExistingColorList = useMemo(() => {
    const keyword = newColorName.trim().toLowerCase()

    if (!keyword) {
      return existingColorList
    }

    return existingColorList.filter((color) =>
      color.colorName.toLowerCase().includes(keyword),
    )
  }, [existingColorList, newColorName])

  const ensureAuthenticatedUserId = () => {
    const userId = authenticatedUser?.userId

    if (!userId) {
      setErrorMessage("Authenticated user not found. Please login again.")
      setIsShowError(true)
      return null
    }

    return userId
  }

  const resetColorForm = () => {
    setNewColorName("")
    setEditingColorId(null)
  }

  const resetConfirmActionState = () => {
    setPendingAction(null)
    setPendingDeleteColor(null)
    setIsConfirmActionModalOpen(false)
  }

  const handleOpenCreateModal = () => {
    resetColorForm()
    handleFetchExistingColors()
    setIsUpsertModalOpen(true)
  }

  const handleEditColor = (color: MsColor) => {
    setEditingColorId(color.colorId)
    setNewColorName(color.colorName)
    handleFetchExistingColors()
    setIsUpsertModalOpen(true)
  }

  const handleOpenUpdateConfirmation = () => {
    if (!editingColorId || !newColorName.trim()) {
      return
    }

    setPendingAction("update")
    setPendingDeleteColor(null)
    setIsConfirmActionModalOpen(true)
  }

  const handleOpenInsertConfirmation = () => {
    if (!newColorName.trim()) {
      return
    }

    setPendingAction("insert")
    setPendingDeleteColor(null)
    setIsConfirmActionModalOpen(true)
  }

  const handleOpenDeleteConfirmation = (color: MsColor) => {
    setPendingAction("delete")
    setPendingDeleteColor(color)
    setIsConfirmActionModalOpen(true)
  }

  const isDuplicateColorName = () => {
    const normalizedColorName = newColorName.trim().toLowerCase()

    return existingColorList.some((color) => {
      const isSameRecord = editingColorId
        ? color.colorId === editingColorId
        : false

      if (isSameRecord) {
        return false
      }

      return color.colorName.trim().toLowerCase() === normalizedColorName
    })
  }

  const handleInsert = async () => {
    if (!newColorName.trim()) {
      return
    }

    if (isDuplicateColorName()) {
      setErrorMessage("Color name already exists")
      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: InsertColorRequest = {
      colorName: newColorName,
      userIn: userId,
      setIsLoading,
    }

    await ColorService.insertColor(payload)
      .then(() => {
        setIsUpsertModalOpen(false)
        resetColorForm()
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Color added successfully")
        setIsShowError(true)
        handleFetchColors()
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleUpdate = async () => {
    if (!editingColorId || !newColorName.trim()) {
      return
    }

    if (isDuplicateColorName()) {
      setErrorMessage("Color name already exists")
      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: UpdateColorRequest = {
      colorId: editingColorId,
      colorName: newColorName,
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading,
    }

    await ColorService.updateColor(payload)
      .then(() => {
        setIsUpsertModalOpen(false)
        resetColorForm()
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Color updated successfully")
        setIsShowError(true)
        handleFetchColors()
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleDeleteColor = async (color: MsColor) => {
    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: DeleteColorRequest = {
      colorId: color.colorId,
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading,
    }

    await ColorService.deleteColor(payload)
      .then(() => {
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Color deleted successfully")
        setIsShowError(true)

        if (colorList.length === 1 && page > 1) {
          setPage((prev) => prev - 1)
          return
        }

        handleFetchColors()
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

    if (pendingAction === "delete" && pendingDeleteColor) {
      await handleDeleteColor(pendingDeleteColor)
    }
  }

  const handleFetchColors = async () => {
    const payload: GetColorListRequest = {
      page,
      pageSize,
      search,
      setIsLoading,
    }

    await ColorService.getColorList(payload)
      .then((res) => {
        setColorList(res.data || [])
        setTotalCount(res.count ?? 0)
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleFetchExistingColors = async () => {
    await ColorService.getColorList({
      page: 1,
      pageSize: 9999,
      search: "",
    })
      .then((res) => {
        setExistingColorList(res.data || [])
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  useEffect(() => {
    handleFetchColors()
  }, [page, pageSize, search])

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Manage Color
        </h1>
        <p className="text-muted-foreground">Manage color motor (e.g., Red, Black)</p>
      </div>

      <AppModal
        trigger={colorAccess.canInsert ? <Button className="mb-4" onClick={handleOpenCreateModal}>Add Color</Button> : undefined}
        title={editingColorId ? "Edit Color" : "Add New Color"}
        description={editingColorId ? "Update selected color" : "Add a new color"}
        open={isUpsertModalOpen}
        onOpenChange={(open) => {
          setIsUpsertModalOpen(open)

          if (!open) {
            resetColorForm()
          }
        }}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              onClick={() => {
                setIsUpsertModalOpen(false)
                resetColorForm()
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (editingColorId) {
                  handleOpenUpdateConfirmation()
                  return
                }

                handleOpenInsertConfirmation()
              }}
            >
              {editingColorId ? "Update" : "Save"}
            </Button>
          </div>
        }
      >
        <AppTextField
          label="Color Name"
          placeholder="RED"
          required={true}
          value={newColorName}
          onChange={(value) => setNewColorName(value)}
          isCapital
        />
        <AppExistingList
          title="Existing Color List"
          items={filteredExistingColorList.map((color) => color.colorName)}
          emptyMessage="No color data"
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
            ? "Delete Color"
            : pendingAction === "insert"
              ? "Confirm Save"
              : "Confirm Update"
        }
        description={
          pendingAction === "delete"
            ? "This action will remove the selected color"
            : pendingAction === "insert"
              ? "This action will add new color"
              : "This action will update the selected color"
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
            ? "Are you sure you want to delete this color?"
            : pendingAction === "insert"
              ? "Are you sure you want to add this color?"
              : "Are you sure you want to update this color?"}
        </p>
      </AppModal>

      <AppSearchBar
        label="Search Color"
        placeholder="Red"
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
        columnsCount={manageColorTableColumns.length}
        emptyMessage="No colors found."
        showPagination
        page={page}
        pageSize={pageSize}
        rowCount={colorList.length}
        hasNextPage={hasNextPage}
        onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
        onNextPage={() => setPage((p) => p + 1)}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        pageSizeOptions={MANAGE_COLOR_PAGE_SIZE_OPTIONS}
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

export default ManageColorPage
