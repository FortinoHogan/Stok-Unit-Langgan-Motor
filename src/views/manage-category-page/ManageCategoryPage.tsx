import AppModal from "@/components/app-components/app-modal/AppModal"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
import AppTable from "@/components/app-components/app-table/AppTable"
import AppTextField from "@/components/app-components/app-text-field/AppTextField"
import AppSearchBar from "@/components/app-layout/app-search-bar/AppSearchBar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { CategoryService } from "@/helpers/services/CategoryService"
import type {
  DeleteCategoryRequest,
  GetCategoryListRequest,
  InsertCategoryRequest,
  UpdateCategoryRequest,
} from "@/interfaces/ICategoryService"
import type { MsCategory } from "@/interfaces/IModel.interface"
import {
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table"
import { Pencil, Trash } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { MANAGE_CATEGORY_PAGE_SIZE_OPTIONS, type PendingActionManageCategory } from "./ManageCategoryPage.constant"

const ManageCategoryPage = () => {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isConfirmActionModalOpen, setIsConfirmActionModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isShowError, setIsShowError] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingActionManageCategory>(null)
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<MsCategory | null>(null)

  const [categoryList, setCategoryList] = useState<MsCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalCount, setTotalCount] = useState(0)
  const [existingCategoryList, setExistingCategoryList] = useState<MsCategory[]>([])

  const manageCategoryTableColumns: ColumnDef<MsCategory>[] = [
    {
      accessorKey: "no",
      header: "No",
      enableSorting: false,
      cell: ({ row }) => <p className="pl-2">{(page - 1) * pageSize + row.index + 1}</p>,
    },
    {
      accessorKey: "categoryName",
      header: "Category Name",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            title="Edit category"
            onClick={() => handleEditCategory(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            title="Delete category"
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
    data: categoryList,
    columns: manageCategoryTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const filteredExistingCategoryList = useMemo(() => {
    const keyword = newCategoryName.trim().toLowerCase()

    if (!keyword) {
      return existingCategoryList
    }

    return existingCategoryList.filter((category) =>
      category.categoryName.toLowerCase().includes(keyword),
    )
  }, [existingCategoryList, newCategoryName])

  const ensureAuthenticatedUserId = () => {
    const userId = authenticatedUser?.userId

    if (!userId) {
      setErrorMessage("Authenticated user not found. Please login again.")
      setIsShowError(true)
      return null
    }

    return userId
  }

  const resetCategoryForm = () => {
    setNewCategoryName("")
    setEditingCategoryId(null)
  }

  const resetConfirmActionState = () => {
    setPendingAction(null)
    setPendingDeleteCategory(null)
    setIsConfirmActionModalOpen(false)
  }

  const handleOpenCreateModal = () => {
    resetCategoryForm()
    handleFetchExistingCategories()
    setIsAddModalOpen(true)
  }

  const handleEditCategory = (category: MsCategory) => {
    setEditingCategoryId(category.categoryId)
    setNewCategoryName(category.categoryName)
    handleFetchExistingCategories()
    setIsAddModalOpen(true)
  }

  const handleOpenUpdateConfirmation = () => {
    if (!editingCategoryId || !newCategoryName.trim()) {
      return
    }

    setPendingAction("update")
    setPendingDeleteCategory(null)
    setIsConfirmActionModalOpen(true)
  }

  const handleOpenInsertConfirmation = () => {
    if (!newCategoryName.trim()) {
      return
    }

    setPendingAction("insert")
    setPendingDeleteCategory(null)
    setIsConfirmActionModalOpen(true)
  }

  const handleOpenDeleteConfirmation = (category: MsCategory) => {
    setPendingAction("delete")
    setPendingDeleteCategory(category)
    setIsConfirmActionModalOpen(true)
  }

  const isDuplicateCategoryName = () => {
    const normalizedCategoryName = newCategoryName.trim().toLowerCase()

    return existingCategoryList.some((category) => {
      const isSameRecord = editingCategoryId
        ? category.categoryId === editingCategoryId
        : false

      if (isSameRecord) {
        return false
      }

      return category.categoryName.trim().toLowerCase() === normalizedCategoryName
    })
  }

  const handleInsert = async () => {
    if (!newCategoryName.trim()) {
      return
    }

    if (isDuplicateCategoryName()) {
      setErrorMessage("Category name already exists")
      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: InsertCategoryRequest = {
      categoryName: newCategoryName,
      userIn: userId,
      setIsLoading,
    }

    await CategoryService.insertCategory(payload)
      .then(() => {
        setIsAddModalOpen(false)
        resetCategoryForm()
        handleFetchCategories()
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
  }

  const handleUpdate = async () => {
    if (!editingCategoryId || !newCategoryName.trim()) {
      return
    }

    if (isDuplicateCategoryName()) {
      setErrorMessage("Category name already exists")
      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: UpdateCategoryRequest = {
      categoryId: editingCategoryId,
      categoryName: newCategoryName,
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading,
    }

    await CategoryService.updateCategory(payload)
      .then(() => {
        setIsAddModalOpen(false)
        resetCategoryForm()
        resetConfirmActionState()
        handleFetchCategories()
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
  }

  const handleDeleteCategory = async (category: MsCategory) => {
    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    const payload: DeleteCategoryRequest = {
      categoryId: category.categoryId,
      userUp: userId,
      updatedAt: new Date().toISOString(),
      setIsLoading,
    }

    await CategoryService.deleteCategory(payload)
      .then(() => {
        resetConfirmActionState()

        if (categoryList.length === 1 && page > 1) {
          setPage((prev) => prev - 1)
          return
        }

        handleFetchCategories()
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

    if (pendingAction === "delete" && pendingDeleteCategory) {
      await handleDeleteCategory(pendingDeleteCategory)
    }
  }

  const handleFetchCategories = async () => {
    const payload: GetCategoryListRequest = {
      page,
      pageSize,
      search,
      setIsLoading,
    }

    await CategoryService.getCategoryList(payload)
      .then((res) => {
        setCategoryList(res.data || [])
        setTotalCount(res.count ?? 0)
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
  }

  const handleFetchExistingCategories = async () => {
    await CategoryService.getCategoryList({
      page: 1,
      pageSize: 1000,
      search: "",
    })
      .then((res) => {
        setExistingCategoryList(res.data || [])
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
  }

  useEffect(() => {
    handleFetchCategories()
  }, [page, pageSize, search])

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Manage Category
        </h1>
        <p className="text-muted-foreground">Manage category motor (e.g., CUB, MATIC)</p>
      </div>

      <AppModal
        trigger={<Button className="mb-4" onClick={handleOpenCreateModal}>Add Category</Button>}
        title={editingCategoryId ? "Edit Category" : "Add New Category"}
        description={editingCategoryId ? "Update selected category" : "Add a new category motor"}
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open)

          if (!open) {
            resetCategoryForm()
          }
        }}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false)
                resetCategoryForm()
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (editingCategoryId) {
                  handleOpenUpdateConfirmation()
                  return
                }

                handleOpenInsertConfirmation()
              }}
            >
              {editingCategoryId ? "Update" : "Save"}
            </Button>
          </div>
        }
      >
        <AppTextField
          label="Category Name"
          placeholder="CUB"
          required={true}
          value={newCategoryName}
          onChange={(value) => setNewCategoryName(value)}
          isUppercase
        />
        <div>
          <p className="mb-2 text-sm font-medium">Existing Category List</p>
          <div className="max-h-36 overflow-y-auto rounded-md border p-2">
            {filteredExistingCategoryList.length ? (
              <div className="flex flex-wrap gap-2">
                {filteredExistingCategoryList.map((category) => (
                  <span
                    key={category.categoryId}
                    className="rounded-md bg-muted px-2 py-1 text-xs"
                  >
                    {category.categoryName}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No category data</p>
            )}
          </div>
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
            ? "Delete Category"
            : pendingAction === "insert"
              ? "Confirm Save"
              : "Confirm Update"
        }
        description={
          pendingAction === "delete"
            ? "This action will remove the selected category"
            : pendingAction === "insert"
              ? "This action will add new category"
              : "This action will update the selected category"
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
            ? "Are you sure you want to delete this category?"
            : pendingAction === "insert"
              ? "Are you sure you want to add this category?"
              : "Are you sure you want to update this category?"}
        </p>
      </AppModal>

      <AppSearchBar
        label="Search Category"
        placeholder="CUB"
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
        columnsCount={manageCategoryTableColumns.length}
        emptyMessage="No categories found."
        showPagination
        page={page}
        pageSize={pageSize}
        rowCount={categoryList.length}
        hasNextPage={hasNextPage}
        onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
        onNextPage={() => setPage((p) => p + 1)}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        pageSizeOptions={MANAGE_CATEGORY_PAGE_SIZE_OPTIONS}
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
                setIsShowError(false)
              }}
            >
              OK
            </Button>
          </div>
        }
      >
        {errorMessage ? <p>{errorMessage}</p> : <p>{errorMessage}</p>}
      </AppModal>

      {isLoading && <AppSpinner />}
    </div>
  )
}

export default ManageCategoryPage