import { useEffect, useMemo, useState } from "react"
import {
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table"
import { Pencil } from "lucide-react"

import AppModal from "@/components/app-components/app-modal/AppModal"
import AppExistingList from "@/components/app-components/app-existing-list/AppExistingList"
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner"
import AppTable from "@/components/app-components/app-table/AppTable"
import AppCheckboxList from "@/components/app-layout/app-checkbox-list/AppCheckboxList"
import AppSearchBar from "@/components/app-layout/app-search-bar/AppSearchBar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { usePrivillegeAccess } from "@/helpers/hooks/usePrivillegeAccess/usePrivillegeAccess"
import { PrivillegeService } from "@/helpers/services/PrivillegeService"
import { RolePrivillegeService } from "@/helpers/services/RolePrivillegeService"
import { RoleService } from "@/helpers/services/RoleService"
import type { GetRoleListRequest } from "@/interfaces/IRoleService"
import type { MsPrivillege, MsRole, TrRolePrivillege } from "@/interfaces/IModel.interface"
import { ROLE_AND_PRIVILLEGE_PAGE_SIZE_OPTIONS } from "./RoleAndPrivillegePage.constant"

const RoleAndPrivillegePage = () => {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
  const roleAndPrivillegeAccess = usePrivillegeAccess("Role and Privillege")
  const canUpdateRolePrivillege = roleAndPrivillegeAccess.canUpdate

  const [isAddPrivillegeModalOpen, setIsAddPrivillegeModalOpen] = useState(false)
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isShowError, setIsShowError] = useState(false)

  const [roleList, setRoleList] = useState<MsRole[]>([])
  const [rolePrivillegeList, setRolePrivillegeList] = useState<TrRolePrivillege[]>([])
  const [privillegeList, setPrivillegeList] = useState<MsPrivillege[]>([])

  const [selectedRole, setSelectedRole] = useState<MsRole | null>(null)
  const [selectedPrivillegeIds, setSelectedPrivillegeIds] = useState<number[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalCount, setTotalCount] = useState(0)

  const privillegeNameById = useMemo(
    () => new Map(privillegeList.map((privillege) => [privillege.privillegeId, privillege.privillegeName])),
    [privillegeList],
  )

  const privillegeIdsByRoleId = useMemo(() => {
    return rolePrivillegeList.reduce((accumulator, item) => {
      const previous = accumulator.get(item.roleId) || []
      accumulator.set(item.roleId, [...previous, item.privillegeId])
      return accumulator
    }, new Map<number, number[]>())
  }, [rolePrivillegeList])

  const selectedRolePrivillegeIds = useMemo(
    () => (selectedRole ? privillegeIdsByRoleId.get(selectedRole.roleId) || [] : []),
    [privillegeIdsByRoleId, selectedRole],
  )

  const splitPrivillegeName = (privillegeName: string) => {
    const partList = privillegeName.split(" ")

    return {
      actionName: partList[0] || privillegeName,
      groupName: partList.length > 1 ? partList.slice(1).join(" ") : "Other",
    }
  }

  const privillegeOptions = useMemo(
    () => privillegeList.map((privillege) => {
      const { groupName } = splitPrivillegeName(privillege.privillegeName)

      return {
        value: String(privillege.privillegeId),
        label: privillege.privillegeName,
        group: groupName,
      }
    }),
    [privillegeList],
  )

  const roleAndPrivillegeTableColumns: ColumnDef<MsRole>[] = [
    {
      accessorKey: "roleName",
      header: "Role Name",
      cell: ({ row }) => (
        <p className="font-medium text-foreground">{row.original.roleName}</p>
      ),
    },
    {
      id: "privillege",
      header: "Privillege",
      cell: ({ row }) => {
        const privillegeIds = privillegeIdsByRoleId.get(row.original.roleId) || []
        const privillegeNames = privillegeIds
          .map((privillegeId) => privillegeNameById.get(privillegeId))
          .filter((value): value is string => Boolean(value))

        const privillegesByGroupName = privillegeNames.reduce((accumulator, privillegeName) => {
          const { actionName, groupName } = splitPrivillegeName(privillegeName)
          const previous = accumulator.get(groupName) || []

          if (!previous.includes(actionName)) {
            accumulator.set(groupName, [...previous, actionName])
          }

          return accumulator
        }, new Map<string, string[]>())

        const groupedPrivilleges = Array.from(privillegesByGroupName.entries())
          .map(([groupName, actionNames]) => ({
            groupName,
            actionNames: actionNames.sort((a, b) => a.localeCompare(b)),
          }))
          .sort((a, b) => a.groupName.localeCompare(b.groupName))

        if (!privillegeNames.length) {
          return <p className="text-sm text-muted-foreground">No privillege assigned</p>
        }

        return (
          <div className="grid gap-2 md:grid-cols-2">
            {groupedPrivilleges.map((group) => (
              <div
                key={group.groupName}
                className="rounded-md border border-border/60 bg-muted/20 p-2"
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.groupName}
                </p>
                <div className="flex flex-wrap gap-1">
                  {group.actionNames.map((actionName) => (
                    <span
                      key={`${group.groupName}-${actionName}`}
                      className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-xs"
                    >
                      {actionName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {canUpdateRolePrivillege ? (
            <Button
              variant="outline"
              size="sm"
              title="Add privilleges"
              className="h-8 w-8 p-0"
              onClick={() => handleOpenAddPrivillegeModal(row.original)}
            >
              <Pencil className="size-4" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ]

  const hasNextPage = page * pageSize < totalCount

  const table = useReactTable({
    data: roleList,
    columns: roleAndPrivillegeTableColumns,
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

  const resetAddPrivillegeState = () => {
    setSelectedRole(null)
    setSelectedPrivillegeIds([])
    setIsAddPrivillegeModalOpen(false)
  }

  const resetConfirmSaveState = () => {
    setIsConfirmSaveModalOpen(false)
  }

  const handleOpenAddPrivillegeModal = (role: MsRole) => {
    const mappedPrivillegeIds = privillegeIdsByRoleId.get(role.roleId) || []

    setSelectedRole(role)
    setSelectedPrivillegeIds(mappedPrivillegeIds)
    setIsAddPrivillegeModalOpen(true)
  }

  const handleOpenConfirmSave = () => {
    if (!selectedRole) {
      return
    }

    setIsConfirmSaveModalOpen(true)
  }

  const handleFetchRolePrivilleges = async (roles: MsRole[]) => {
    const roleIds = roles.map((role) => role.roleId)

    if (!roleIds.length) {
      setRolePrivillegeList([])
      return
    }

    await RolePrivillegeService.getRolePrivillegeListByRoleIds({ roleIds })
      .then((res) => {
        setRolePrivillegeList(res.data || [])
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
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
        const nextRoleList = res.data || []
        setRoleList(nextRoleList)
        setTotalCount(res.count ?? 0)
        handleFetchRolePrivilleges(nextRoleList)
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleFetchPrivilleges = async () => {
    await PrivillegeService.getPrivillegeList({
      page: 1,
      pageSize: 9999,
      search: "",
    })
      .then((res) => {
        const sorted = (res.data || []).sort((a, b) =>
          a.privillegeName.localeCompare(b.privillegeName),
        )

        setPrivillegeList(sorted)
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleInsertRolePrivillege = async () => {
    if (!selectedRole) {
      return
    }

    const selectedRolePrivillegeMappings = rolePrivillegeList.filter(
      (rolePrivillege) => rolePrivillege.roleId === selectedRole.roleId,
    )

    const nextPrivillegeIds = selectedPrivillegeIds.filter(
      (privillegeId) => !selectedRolePrivillegeIds.includes(privillegeId),
    )

    const removedRolePrivillegeMappings = selectedRolePrivillegeMappings.filter(
      (rolePrivillege) => !selectedPrivillegeIds.includes(rolePrivillege.privillegeId),
    )

    if (!nextPrivillegeIds.length && !removedRolePrivillegeMappings.length) {
      setErrorMessage("No changes detected for this role")
      setIsShowError(true)
      return
    }

    const userId = ensureAuthenticatedUserId()
    if (!userId) {
      return
    }

    setIsLoading(true)
    await Promise.all(
      [
        ...nextPrivillegeIds.map((privillegeId) =>
          RolePrivillegeService.insertRolePrivillege({
            roleId: selectedRole.roleId,
            privillegeId,
            userIn: userId,
          }),
        ),
        ...removedRolePrivillegeMappings.map((rolePrivillege) =>
          RolePrivillegeService.deleteRolePrivillege({
            rolePrivillegeId: rolePrivillege.rolePrivillegeId,
            userUp: userId,
            updatedAt: new Date().toISOString(),
          }),
        ),
      ],
    )
      .then(() => {
        resetConfirmSaveState()
        resetAddPrivillegeState()
        setErrorMessage("")
        setSuccessMessage("Privillege assignment saved successfully")
        setIsShowError(true)
        handleFetchRoles()
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    handleFetchRoles()
  }, [page, pageSize, search])

  useEffect(() => {
    handleFetchPrivilleges()
  }, [])

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Role and Privillege
        </h1>
        <p className="text-muted-foreground">Manage privillege assignment for each role</p>
      </div>

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
        columnsCount={roleAndPrivillegeTableColumns.length}
        emptyMessage="No roles found."
        classNames={{
          tableContainer: "rounded-xl border-border/70 bg-card",
          headerCell: "bg-muted/30 text-xs font-semibold uppercase tracking-wide",
          bodyCell: "align-top py-3",
          bodyRow: "hover:bg-muted/20",
        }}
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
        pageSizeOptions={ROLE_AND_PRIVILLEGE_PAGE_SIZE_OPTIONS}
        pageInfoRenderer={({ page: currentPage, rowCount }) =>
          `Page ${currentPage} • ${totalCount} total • ${rowCount} row(s) shown`
        }
      />

      <AppModal
        open={isAddPrivillegeModalOpen}
        onOpenChange={(open) => {
          setIsAddPrivillegeModalOpen(open)

          if (!open) {
            resetAddPrivillegeState()
          }
        }}
        title="Add Privillege"
        description={`Add privillege for ${selectedRole ? `role: ${selectedRole.roleName}` : "role not selected"}`}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              onClick={() => {
                resetAddPrivillegeState()
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
              disabled={!canUpdateRolePrivillege}
            >
              Save
            </Button>
          </div>
        }
      >
        <p className="mb-4 text-sm text-muted-foreground">
          {selectedRole ? `Role: ${selectedRole.roleName}` : "Role not selected"}
        </p>

        <AppCheckboxList
          label="Choose Privillege (Multiple)"
          placeholder="Select privilleges"
          searchPlaceholder="Search privillege"
          emptyMessage="No privilleges found"
          values={selectedPrivillegeIds.map((privillegeId) => String(privillegeId))}
          options={privillegeOptions}
          onValuesChange={(values) => {
            setSelectedPrivillegeIds(values.map((value) => Number(value)))
          }}
        />

        <AppExistingList
          title="Existing Privillege List"
          items={selectedRolePrivillegeIds.map((privillegeId) => privillegeNameById.get(privillegeId) || "-")}
          emptyMessage="No privillege assigned"
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
        description="This action will add selected privillege to selected role"
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
                handleInsertRolePrivillege()
              }}
            >
              Save
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to add this privillege?</p>
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

export default RoleAndPrivillegePage
