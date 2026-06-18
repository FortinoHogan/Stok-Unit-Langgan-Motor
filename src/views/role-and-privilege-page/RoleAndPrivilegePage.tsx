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
import { usePrivilegeAccess } from "@/helpers/hooks/usePrivilegeAccess/usePrivilegeAccess"
import { PrivilegeService } from "@/helpers/services/PrivilegeService"
import { RolePrivilegeService } from "@/helpers/services/RolePrivilegeService"
import { RoleService } from "@/helpers/services/RoleService"
import type { GetRoleListRequest } from "@/interfaces/IRoleService"
import type { MsPrivilege, MsRole, TrRolePrivilege } from "@/interfaces/IModel.interface"
import { ROLE_AND_PRIVILEGE_PAGE_SIZE_OPTIONS } from "./RoleAndPrivilegePage.constant"

const RoleAndPrivilegePage = () => {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
  const roleAndPrivilegeAccess = usePrivilegeAccess("Role and privilege")
  const canUpdateRolePrivilege = roleAndPrivilegeAccess.canUpdate

  const [isAddPrivilegeModalOpen, setIsAddPrivilegeModalOpen] = useState(false)
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isShowError, setIsShowError] = useState(false)

  const [roleList, setRoleList] = useState<MsRole[]>([])
  const [rolePrivilegeList, setRolePrivilegeList] = useState<TrRolePrivilege[]>([])
  const [privilegeList, setPrivilegeList] = useState<MsPrivilege[]>([])

  const [selectedRole, setSelectedRole] = useState<MsRole | null>(null)
  const [selectedPrivilegeIds, setSelectedPrivilegeIds] = useState<number[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalCount, setTotalCount] = useState(0)

  const privilegeNameById = useMemo(
    () => new Map(privilegeList.map((privilege) => [privilege.privilegeId, privilege.privilegeName])),
    [privilegeList],
  )

  const privilegeIdsByRoleId = useMemo(() => {
    return rolePrivilegeList.reduce((accumulator, item) => {
      const previous = accumulator.get(item.roleId) || []
      accumulator.set(item.roleId, [...previous, item.privilegeId])
      return accumulator
    }, new Map<number, number[]>())
  }, [rolePrivilegeList])

  const selectedRolePrivilegeIds = useMemo(
    () => (selectedRole ? privilegeIdsByRoleId.get(selectedRole.roleId) || [] : []),
    [privilegeIdsByRoleId, selectedRole],
  )

  const splitPrivilegeName = (privilegeName: string) => {
    const partList = privilegeName.split(" ")

    return {
      actionName: partList[0] || privilegeName,
      groupName: partList.length > 1 ? partList.slice(1).join(" ") : "Other",
    }
  }

  const privilegeOptions = useMemo(
    () => privilegeList.map((privilege) => {
      const { groupName } = splitPrivilegeName(privilege.privilegeName)

      return {
        value: String(privilege.privilegeId),
        label: privilege.privilegeName,
        group: groupName,
      }
    }),
    [privilegeList],
  )

  const roleAndPrivilegeTableColumns: ColumnDef<MsRole>[] = [
    {
      accessorKey: "roleName",
      header: "Role Name",
      cell: ({ row }) => (
        <p className="font-medium text-foreground">{row.original.roleName}</p>
      ),
    },
    {
      id: "privilege",
      header: "privilege",
      cell: ({ row }) => {
        const privilegeIds = privilegeIdsByRoleId.get(row.original.roleId) || []
        const privilegeNames = privilegeIds
          .map((privilegeId) => privilegeNameById.get(privilegeId))
          .filter((value): value is string => Boolean(value))

        const privilegesByGroupName = privilegeNames.reduce((accumulator, privilegeName) => {
          const { actionName, groupName } = splitPrivilegeName(privilegeName)
          const previous = accumulator.get(groupName) || []

          if (!previous.includes(actionName)) {
            accumulator.set(groupName, [...previous, actionName])
          }

          return accumulator
        }, new Map<string, string[]>())

        const groupedPrivileges = Array.from(privilegesByGroupName.entries())
          .map(([groupName, actionNames]) => ({
            groupName,
            actionNames: actionNames.sort((a, b) => a.localeCompare(b)),
          }))
          .sort((a, b) => a.groupName.localeCompare(b.groupName))

        if (!privilegeNames.length) {
          return <p className="text-sm text-muted-foreground">No privilege assigned</p>
        }

        return (
          <div className="grid gap-2 md:grid-cols-2">
            {groupedPrivileges.map((group) => (
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
          {canUpdateRolePrivilege ? (
            <Button
              variant="outline"
              size="sm"
              title="Add privileges"
              className="h-8 w-8 p-0"
              onClick={() => handleOpenAddPrivilegeModal(row.original)}
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
    columns: roleAndPrivilegeTableColumns,
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

  const resetAddPrivilegeState = () => {
    setSelectedRole(null)
    setSelectedPrivilegeIds([])
    setIsAddPrivilegeModalOpen(false)
  }

  const resetConfirmSaveState = () => {
    setIsConfirmSaveModalOpen(false)
  }

  const handleOpenAddPrivilegeModal = (role: MsRole) => {
    const mappedPrivilegeIds = privilegeIdsByRoleId.get(role.roleId) || []

    setSelectedRole(role)
    setSelectedPrivilegeIds(mappedPrivilegeIds)
    setIsAddPrivilegeModalOpen(true)
  }

  const handleOpenConfirmSave = () => {
    if (!selectedRole) {
      return
    }

    setIsConfirmSaveModalOpen(true)
  }

  const handleFetchRolePrivileges = async (roles: MsRole[]) => {
    const roleIds = roles.map((role) => role.roleId)

    if (!roleIds.length) {
      setRolePrivilegeList([])
      return
    }

    await RolePrivilegeService.getRolePrivilegeListByRoleIds({ roleIds })
      .then((res) => {
        setRolePrivilegeList(res.data || [])
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
        handleFetchRolePrivileges(nextRoleList)
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleFetchPrivileges = async () => {
    await PrivilegeService.getPrivilegeList({
      page: 1,
      pageSize: 9999,
      search: "",
    })
      .then((res) => {
        const sorted = (res.data || []).sort((a, b) =>
          a.privilegeName.localeCompare(b.privilegeName),
        )

        setPrivilegeList(sorted)
      })
      .catch((error) => {
        setErrorMessage(error.error.message)
        setIsShowError(true)
      })
  }

  const handleInsertRolePrivilege = async () => {
    if (!selectedRole) {
      return
    }

    const selectedRolePrivilegeMappings = rolePrivilegeList.filter(
      (rolePrivilege) => rolePrivilege.roleId === selectedRole.roleId,
    )

    const nextPrivilegeIds = selectedPrivilegeIds.filter(
      (privilegeId) => !selectedRolePrivilegeIds.includes(privilegeId),
    )

    const removedRolePrivilegeMappings = selectedRolePrivilegeMappings.filter(
      (rolePrivilege) => !selectedPrivilegeIds.includes(rolePrivilege.privilegeId),
    )

    if (!nextPrivilegeIds.length && !removedRolePrivilegeMappings.length) {
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
        ...nextPrivilegeIds.map((privilegeId) =>
          RolePrivilegeService.insertRolePrivilege({
            roleId: selectedRole.roleId,
            privilegeId,
            userIn: userId,
          }),
        ),
        ...removedRolePrivilegeMappings.map((rolePrivilege) =>
          RolePrivilegeService.deleteRolePrivilege({
            rolePrivilegeId: rolePrivilege.rolePrivilegeId,
            userUp: userId,
            updatedAt: new Date().toISOString(),
          }),
        ),
      ],
    )
      .then(() => {
        resetConfirmSaveState()
        resetAddPrivilegeState()
        setErrorMessage("")
        setSuccessMessage("privilege assignment saved successfully")
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
    handleFetchPrivileges()
  }, [])

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-2 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Role and privilege
        </h1>
        <p className="text-muted-foreground">Manage privilege assignment for each role</p>
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
        columnsCount={roleAndPrivilegeTableColumns.length}
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
        pageSizeOptions={ROLE_AND_PRIVILEGE_PAGE_SIZE_OPTIONS}
        pageInfoRenderer={({ page: currentPage, rowCount }) =>
          `Page ${currentPage} • ${totalCount} total • ${rowCount} row(s) shown`
        }
      />

      <AppModal
        open={isAddPrivilegeModalOpen}
        onOpenChange={(open) => {
          setIsAddPrivilegeModalOpen(open)

          if (!open) {
            resetAddPrivilegeState()
          }
        }}
        title="Add privilege"
        description={`Add privilege for ${selectedRole ? `role: ${selectedRole.roleName}` : "role not selected"}`}
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              onClick={() => {
                resetAddPrivilegeState()
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
              disabled={!canUpdateRolePrivilege}
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
          label="Choose privilege (Multiple)"
          placeholder="Select privileges"
          searchPlaceholder="Search privilege"
          emptyMessage="No privileges found"
          values={selectedPrivilegeIds.map((privilegeId) => String(privilegeId))}
          options={privilegeOptions}
          onValuesChange={(values) => {
            setSelectedPrivilegeIds(values.map((value) => Number(value)))
          }}
        />

        <AppExistingList
          title="Existing privilege List"
          items={selectedRolePrivilegeIds.map((privilegeId) => privilegeNameById.get(privilegeId) || "-")}
          emptyMessage="No privilege assigned"
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
        description="This action will add selected privilege to selected role"
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
                handleInsertRolePrivilege()
              }}
            >
              Save
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to add this privilege?</p>
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

export default RoleAndPrivilegePage
