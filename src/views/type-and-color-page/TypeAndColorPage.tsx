import AppModal from "@/components/app-components/app-modal/AppModal"
import AppExistingList from "@/components/app-components/app-existing-list/AppExistingList"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
import AppTable from "@/components/app-components/app-table/AppTable"
import AppCheckboxList from "@/components/app-layout/app-checkbox-list/AppCheckboxList"
import AppSearchBar from "@/components/app-layout/app-search-bar/AppSearchBar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { CategoryService } from "@/helpers/services/CategoryService"
import { ColorService } from "@/helpers/services/ColorService"
import { TypeColorService } from "@/helpers/services/TypeColorService"
import { TypeService } from "@/helpers/services/TypeService"
import type { GetTypeListRequest } from "@/interfaces/ITypeService"
import type {
  MsCategory,
  MsColor,
  MsType,
  TrTypeColor,
} from "@/interfaces/IModel.interface"
import {
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table"
import { Pencil } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { TYPE_AND_COLOR_PAGE_SIZE_OPTIONS } from "./TypeAndColorPage.constant"

const TypeAndColorPage = () => {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser)

  const [isAddColorModalOpen, setIsAddColorModalOpen] = useState(false)
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isShowError, setIsShowError] = useState(false)

  const [typeList, setTypeList] = useState<MsType[]>([])
  const [typeColorList, setTypeColorList] = useState<TrTypeColor[]>([])
  const [categoryList, setCategoryList] = useState<MsCategory[]>([])
  const [colorList, setColorList] = useState<MsColor[]>([])

  const [selectedType, setSelectedType] = useState<MsType | null>(null)
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const categoryNameById = useMemo(
    () => new Map(categoryList.map((category) => [category.categoryId, category.categoryName])),
    [categoryList],
  )

  const colorNameById = useMemo(
    () => new Map(colorList.map((color) => [color.colorId, color.colorName])),
    [colorList],
  )

  const colorIdsByTypeId = useMemo(() => {
    return typeColorList.reduce((accumulator, item) => {
      const previous = accumulator.get(item.typeId) || []
      accumulator.set(item.typeId, [...previous, item.colorId])
      return accumulator
    }, new Map<number, number[]>())
  }, [typeColorList])

  const selectedTypeColorIds = useMemo(
    () => (selectedType ? colorIdsByTypeId.get(selectedType.typeId) || [] : []),
    [colorIdsByTypeId, selectedType],
  )

  const colorOptions = useMemo(
    () => colorList.map((color) => ({
      value: String(color.colorId),
      label: color.colorName,
    })),
    [colorList],
  )

  const typeAndColorTableColumns: ColumnDef<MsType>[] = [
    {
      accessorKey: "categoryId",
      id: "category",
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
      id: "color",
      header: "Color",
      cell: ({ row }) => {
        const colorIds = colorIdsByTypeId.get(row.original.typeId) || []
        const colorNames = colorIds
          .map((colorId) => colorNameById.get(colorId))
          .filter((value): value is string => Boolean(value))

        if (!colorNames.length) {
          return "-"
        }

        return (
          <div className="space-y-1">
            {colorNames.map((colorName) => (
              <p key={colorName}>- {colorName}</p>
            ))}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            title="Add colors"
            onClick={() => handleOpenAddColorModal(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  const hasNextPage = page * pageSize < totalCount

  const table = useReactTable({
    data: typeList,
    columns: typeAndColorTableColumns,
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

  const resetAddColorState = () => {
    setSelectedType(null)
    setSelectedColorIds([])
    setIsAddColorModalOpen(false)
  }

  const resetConfirmSaveState = () => {
    setIsConfirmSaveModalOpen(false)
  }

  const handleOpenAddColorModal = (type: MsType) => {
    const mappedColorIds = colorIdsByTypeId.get(type.typeId) || []

    setSelectedType(type)
    setSelectedColorIds(mappedColorIds)
    setIsAddColorModalOpen(true)
  }

  const handleOpenConfirmSave = () => {
    if (!selectedType || !selectedColorIds.length) {
      return
    }

    setIsConfirmSaveModalOpen(true)
  }

  const handleFetchTypeColors = async (types: MsType[]) => {
    const typeIds = types.map((type) => type.typeId)

    if (!typeIds.length) {
      setTypeColorList([])
      return
    }

    await TypeColorService.getTypeColorListByTypeIds({ typeIds })
      .then((res) => {
        setTypeColorList(res.data || [])
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
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
        const nextTypeList = res.data || []
        setTypeList(nextTypeList)
        setTotalCount(res.count ?? 0)
        handleFetchTypeColors(nextTypeList)
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
        setCategoryList(res.data || [])
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
  }

  const handleFetchColors = async () => {
    await ColorService.getColorList({
      page: 1,
      pageSize: 1000,
      search: "",
    })
      .then((res) => {
        const sorted = (res.data || []).sort((a, b) =>
          a.colorName.localeCompare(b.colorName)
        );

        setColorList(sorted);
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
  }

  const handleInsertTypeColor = async () => {
    if (!selectedType || !selectedColorIds.length) {
      return
    }

    const nextColorIds = selectedColorIds.filter(
      (colorId) => !selectedTypeColorIds.includes(colorId),
    )

    if (!nextColorIds.length) {
      setErrorMessage("All selected colors already exist for this type")
      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    setIsLoading(true)
    await Promise.all(
      nextColorIds.map((colorId) =>
        TypeColorService.insertTypeColor({
          typeId: selectedType.typeId,
          colorId,
          userIn: userId,
        }),
      ),
    )
      .then(() => {
        resetConfirmSaveState()
        resetAddColorState()
        setErrorMessage("")
        setSuccessMessage("Color assignment saved successfully")
        setIsShowError(true)
        handleFetchTypes()
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setIsShowError(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    handleFetchTypes()
  }, [page, pageSize, search])

  useEffect(() => {
    handleFetchCategories()
    handleFetchColors()
  }, [])

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Type and Color
        </h1>
        <p className="text-muted-foreground">Manage color assignment for each motor type</p>
      </div>

      <AppSearchBar
        label="Search Type"
        placeholder="BEAT"
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
        columnsCount={typeAndColorTableColumns.length}
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
        pageSizeOptions={TYPE_AND_COLOR_PAGE_SIZE_OPTIONS}
        pageInfoRenderer={({ page: currentPage, rowCount }) =>
          `Page ${currentPage} • ${totalCount} total • ${rowCount} row(s) shown`
        }
      />

      <AppModal
        open={isAddColorModalOpen}
        onOpenChange={(open) => {
          setIsAddColorModalOpen(open)

          if (!open) {
            resetAddColorState()
          }
        }}
        title="Add Color"
        description="Add color for selected type"
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              onClick={() => {
                resetAddColorState()
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                handleOpenConfirmSave()
              }}
            >
              Save
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground mb-4">
          {selectedType
            ? `Type: ${selectedType.typeName} (${categoryNameById.get(selectedType.categoryId) || "-"})`
            : "Type not selected"}
        </p>

        <AppCheckboxList
          label="Choose Color (Multiple)"
          placeholder="Select colors"
          searchPlaceholder="Search color"
          emptyMessage="No colors found"
          values={selectedColorIds.map((colorId) => String(colorId))}
          options={colorOptions}
          onValuesChange={(values) => {
            setSelectedColorIds(values.map((value) => Number(value)))
          }}
        />

        <AppExistingList
          title="Existing Color List"
          items={selectedTypeColorIds.map((colorId) => colorNameById.get(colorId) || "-")}
          emptyMessage="No color assigned"
        />
      </AppModal>

      <AppModal
        open={isConfirmSaveModalOpen}
        onOpenChange={(open) => {
          setIsConfirmSaveModalOpen(open)

          if (!open) {
            resetConfirmSaveState()
          }
        }}
        title="Confirm Save"
        description="This action will add selected color to selected type"
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
                resetConfirmSaveState()
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                handleInsertTypeColor()
              }}
            >
              Save
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to add this color?</p>
      </AppModal>

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

export default TypeAndColorPage