import AppModal from "@/components/app-components/app-modal/AppModal"
import AppExistingList from "@/components/app-components/app-existing-list/AppExistingList"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
import AppTable from "@/components/app-components/app-table/AppTable"
import AppTextField from "@/components/app-components/app-text-field/AppTextField"
import AppAutoComplete from "@/components/app-components/app-auto-complete/AppAutoComplete"
import AppSearchBar from "@/components/app-layout/app-search-bar/AppSearchBar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { CategoryService } from "@/helpers/services/CategoryService"
import { TypeService } from "@/helpers/services/TypeService"
import type {
  DeleteTypeRequest,
  GetTypeListRequest,
  InsertTypeRequest,
  UpdateTypeRequest,
} from "@/interfaces/ITypeService"
import type { MsCategory, MsType } from "@/interfaces/IModel.interface"
import {
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table"
import { Pencil, Trash } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  MANAGE_TYPE_PAGE_SIZE_OPTIONS,
  type PendingActionManageType,
} from "./ManageTypePage.constant"

const ManageTypePage = () => {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser)

  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false)
  const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isShowError, setIsShowError] = useState(false)
  const [newTypeName, setNewTypeName] = useState("")
  const [newTypeCode, setNewTypeCode] = useState("")
  const [newTypeDescription, setNewTypeDescription] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingActionManageType>(null)
  const [pendingDeleteType, setPendingDeleteType] = useState<MsType | null>(null)
  const [typeList, setTypeList] = useState<MsType[]>([])
  const [existingTypeList, setExistingTypeList] = useState<MsType[]>([])
  const [categoryList, setCategoryList] = useState<MsCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const categoryNameById = useMemo(
    () => new Map(categoryList.map((category) => [category.categoryId, category.categoryName])),
    [categoryList],
  )

  const categoryOptions = useMemo(() =>
    categoryList.map((category) =>
    ({
      value: String(category.categoryId),
      label: category.categoryName,
    })),
    [categoryList],
  )

  const manageTypeTableColumns: ColumnDef<MsType>[] = [
    {
      id: "categoryName",
      header: "Category",
      cell: ({ row }) => categoryNameById.get(row.original.categoryId) || "-",
    },
    {
      accessorKey: "typeName",
      header: "Type Name",
    },
    {
      accessorKey: "typeCode",
      header: "Type Code",
    },
    {
      accessorKey: "typeDescription",
      header: "Description",
      cell: ({ getValue }) => <p className="max-w-xs truncate">{getValue<string>() || "-"}</p>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            title="Edit type"
            onClick={() => handleEditType(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            title="Delete type"
            onClick={() => handleOpenDeleteConfirmation(row.original)}
          >
            <Trash className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  const hasNextPage = page * pageSize < totalCount

  const table = useReactTable({
    data: typeList,
    columns: manageTypeTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const ensureAuthenticatedUserId = () => {
    const userId = authenticatedUser?.userId

    if (!userId) {
      setErrorMessage("Authenticated user not found. Please login again.")
      setIsShowError(true)
      return null
    }

    return userId
  }

  const resetTypeForm = () => {
    setNewTypeName("")
    setNewTypeCode("")
    setNewTypeDescription("")
    setSelectedCategoryId("")
    setEditingTypeId(null)
  }

  const resetConfirmActionState = () => {
    setPendingAction(null)
    setPendingDeleteType(null)
    setIsConfirmActionModalOpen(false)
  }

  const handleOpenCreateModal = () => {
    resetTypeForm()
    handleFetchCategories()
    handleFetchExistingTypes()
    setIsUpsertModalOpen(true)
  }

  const handleEditType = (type: MsType) => {
    setEditingTypeId(type.typeId)
    setNewTypeName(type.typeName)
    setNewTypeCode(type.typeCode)
    setNewTypeDescription(type.typeDescription ?? "")
    setSelectedCategoryId(String(type.categoryId))
    handleFetchCategories()
    handleFetchExistingTypes()
    setIsUpsertModalOpen(true)
  }

  const handleOpenInsertConfirmation = () => {
    if (!newTypeName.trim() || !newTypeCode.trim() || !newTypeDescription.trim() || !selectedCategoryId) {
      return
    }

    setPendingAction("insert")
    setPendingDeleteType(null)
    setIsConfirmActionModalOpen(true)
  }

  const handleOpenUpdateConfirmation = () => {
    if (!editingTypeId || !newTypeName.trim() || !newTypeCode.trim() || !newTypeDescription.trim() || !selectedCategoryId) {
      return
    }

    setPendingAction("update")
    setPendingDeleteType(null)
    setIsConfirmActionModalOpen(true)
  }

  const handleOpenDeleteConfirmation = (type: MsType) => {
    setPendingAction("delete")
    setPendingDeleteType(type)
    setIsConfirmActionModalOpen(true)
  }

  const isDuplicateTypeCode = () => {
    const normalizedTypeCode = newTypeCode.trim().toLowerCase()

    return existingTypeList.some((type) => {
      const isSameRecord = editingTypeId
        ? type.typeId === editingTypeId
        : false

      if (isSameRecord) {
        return false
      }

      return type.typeCode.trim().toLowerCase() === normalizedTypeCode
    })
  }

  const isDuplicateTypeDescription = () => {
    const normalizedTypeDescription = newTypeDescription.trim().toLowerCase()

    return existingTypeList.some((type) => {
      const isSameRecord = editingTypeId
        ? type.typeId === editingTypeId
        : false

      if (isSameRecord) {
        return false
      }

      return type.typeDescription?.trim().toLowerCase() === normalizedTypeDescription
    })
  }

  const handleInsert = async () => {
    if (!newTypeName.trim() || !newTypeCode.trim() || !newTypeDescription.trim() || !selectedCategoryId) {
      return
    }

    const hasDuplicateTypeCode = isDuplicateTypeCode()
    const hasDuplicateTypeDescription = isDuplicateTypeDescription()

    if (hasDuplicateTypeCode || hasDuplicateTypeDescription) {
      if (hasDuplicateTypeCode && hasDuplicateTypeDescription) {
        setErrorMessage("Type code and description already exist")
      } else if (hasDuplicateTypeCode) {
        setErrorMessage("Type code already exists")
      } else {
        setErrorMessage("Type description already exists")
      }

      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: InsertTypeRequest = {
      typeName: newTypeName.trim().toUpperCase(),
      typeCode: newTypeCode.trim().toUpperCase(),
      typeDescription: newTypeDescription.trim(),
      categoryId: Number(selectedCategoryId),
      userIn: userId,
      setIsLoading,
    }

    await TypeService.insertType(payload)
      .then(() => {
        setIsUpsertModalOpen(false)
        resetTypeForm()
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Type added successfully")
        setIsShowError(true)
        handleFetchTypes()
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
  }

  const handleUpdate = async () => {
    if (!editingTypeId || !newTypeName.trim() || !newTypeCode.trim() || !newTypeDescription.trim() || !selectedCategoryId) {
      return
    }

    const hasDuplicateTypeCode = isDuplicateTypeCode()
    const hasDuplicateTypeDescription = isDuplicateTypeDescription()

    if (hasDuplicateTypeCode || hasDuplicateTypeDescription) {
      if (hasDuplicateTypeCode && hasDuplicateTypeDescription) {
        setErrorMessage("Type code and description already exist")
      } else if (hasDuplicateTypeCode) {
        setErrorMessage("Type code already exists")
      } else {
        setErrorMessage("Type description already exists")
      }

      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: UpdateTypeRequest = {
      typeId: editingTypeId,
      typeName: newTypeName.trim().toUpperCase(),
      typeCode: newTypeCode.trim().toUpperCase(),
      typeDescription: newTypeDescription.trim(),
      categoryId: Number(selectedCategoryId),
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading,
    }

    await TypeService.updateType(payload)
      .then(() => {
        setIsUpsertModalOpen(false)
        resetTypeForm()
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Type updated successfully")
        setIsShowError(true)
        handleFetchTypes()
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
  }

  const handleDeleteType = async (type: MsType) => {
    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: DeleteTypeRequest = {
      typeId: type.typeId,
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading,
    }

    await TypeService.deleteType(payload)
      .then(() => {
        resetConfirmActionState()
        setErrorMessage("")
        setSuccessMessage("Type deleted successfully")
        setIsShowError(true)

        if (typeList.length === 1 && page > 1) {
          setPage((prev) => prev - 1)
          return
        }

        handleFetchTypes()
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

    if (pendingAction === "delete" && pendingDeleteType) {
      await handleDeleteType(pendingDeleteType)
    }
  }

  const handleFetchTypes = async () => {
    const payload: GetTypeListRequest = {
      page,
      pageSize,
      search,
      setIsLoading,
    }

    await TypeService.getTypeList(payload)
      .then((res) => {
        setTypeList(res.data || [])
        setTotalCount(res.count ?? 0)
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
  }

  const handleFetchExistingTypes = async () => {
    await TypeService.getTypeList({
      page: 1,
      pageSize: 1000,
      search: "",
    })
      .then((res) => {
        setExistingTypeList(res.data || [])
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
  }

  const handleFetchCategories = async () => {
    await CategoryService.getCategoryList({
      page: 1,
      pageSize: 1000,
      search: "",
    })
      .then((res) => {
        const nextCategoryList = res.data || []

        setCategoryList(nextCategoryList)
        // setSelectedCategoryId((currentValue) => currentValue || String(nextCategoryList[0]?.categoryId || ""))
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
  }

  const filteredExistingTypeList = useMemo(() => {
    const typeCodeKeyword = newTypeCode.trim().toLowerCase()
    const typeDescriptionKeyword = newTypeDescription.trim().toLowerCase()

    if (!typeCodeKeyword && !typeDescriptionKeyword) {
      return existingTypeList
    }

    return existingTypeList.filter((type) => {
      const matchesTypeCode = typeCodeKeyword
        ? type.typeCode.toLowerCase().includes(typeCodeKeyword)
        : false

      const matchesTypeDescription = typeDescriptionKeyword
        ? (type.typeDescription || "").toLowerCase().includes(typeDescriptionKeyword)
        : false

      return matchesTypeCode || matchesTypeDescription
    })
  }, [existingTypeList, newTypeCode, newTypeDescription])

  useEffect(() => {
    handleFetchTypes()
  }, [page, pageSize, search])

  useEffect(() => {
    handleFetchCategories()
  }, [])

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Manage Type
        </h1>
        <p className="text-muted-foreground">Manage type motor (e.g., SUPRA X, VARIO)</p>
      </div>

      <AppModal
        trigger={<Button className="mb-4" onClick={handleOpenCreateModal}>Add Type</Button>}
        title={editingTypeId ? "Edit Type" : "Add New Type"}
        description={editingTypeId ? "Update selected type" : "Add a new type"}
        open={isUpsertModalOpen}
        onOpenChange={(open) => {
          setIsUpsertModalOpen(open)

          if (!open) {
            resetTypeForm()
          }
        }}
        classNames={{
          content: "sm:max-w-xl",
        }}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              onClick={() => {
                setIsUpsertModalOpen(false)
                resetTypeForm()
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (editingTypeId) {
                  handleOpenUpdateConfirmation()
                  return
                }

                handleOpenInsertConfirmation()
              }}
            >
              {editingTypeId ? "Update" : "Save"}
            </Button>
          </div>
        }
      >
        <AppAutoComplete
          label="Category"
          required
          placeholder="EV"
          emptyMessage="No categories found"
          value={selectedCategoryId}
          options={categoryOptions}
          onValueChange={(value) => setSelectedCategoryId(value)}
        />
        <AppTextField
          label="Type Name"
          placeholder="SUPRA X 125 SW"
          required={true}
          value={newTypeName}
          onChange={(value) => setNewTypeName(value)}
        />
        <AppTextField
          label="Type Code"
          placeholder="GE5"
          required={true}
          value={newTypeCode}
          onChange={(value) => setNewTypeCode(value)}
          isUppercase
        />
        <AppTextField
          label="Type Description"
          placeholder="G2A02N02L4 M/T"
          required={true}
          value={newTypeDescription}
          onChange={(value) => setNewTypeDescription(value)}
          isUppercase
        />
        <AppExistingList
          title="Existing Type List"
          items={filteredExistingTypeList.map((type) => {
            const categoryName = categoryNameById.get(type.categoryId) || "-"
            const typeDescription = type.typeDescription || "-"
            return `${categoryName} - ${type.typeName} (${type.typeCode} - ${typeDescription})`
          })}
          emptyMessage="No type data"
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
            ? "Delete Type"
            : pendingAction === "insert"
              ? "Confirm Save"
              : "Confirm Update"
        }
        description={
          pendingAction === "delete"
            ? "This action will remove the selected type"
            : pendingAction === "insert"
              ? "This action will add new type"
              : "This action will update the selected type"
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
            ? "Are you sure you want to delete this type?"
            : pendingAction === "insert"
              ? "Are you sure you want to add this type?"
              : "Are you sure you want to update this type?"}
        </p>
      </AppModal>

      <AppSearchBar
        label="Search Type"
        placeholder="SUPRA"
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
        columnsCount={manageTypeTableColumns.length}
        emptyMessage="No types found."
        showPagination
        page={page}
        pageSize={pageSize}
        rowCount={typeList.length}
        hasNextPage={hasNextPage}
        onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
        onNextPage={() => setPage((p) => p + 1)}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        pageSizeOptions={MANAGE_TYPE_PAGE_SIZE_OPTIONS}
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

export default ManageTypePage