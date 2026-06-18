import { Outlet } from "react-router-dom"
import { useEffect } from "react"

import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { usePrivilegeStore } from "@/helpers/hooks/usePrivilegeStore/usePrivilegeStore"
import { PrivilegeService } from "@/helpers/services/PrivilegeService"
import { RolePrivilegeService } from "@/helpers/services/RolePrivilegeService"
import SidebarProvider from "@/helpers/provider/SidebarProvider"

const AppContainer = () => {
    const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
    const loadedRoleId = usePrivilegeStore((state) => state.loadedRoleId)
    const setPrivilegeList = usePrivilegeStore((state) => state.setPrivilegeList)
    const setIsLoading = usePrivilegeStore((state) => state.setIsLoading)
    const clearPrivileges = usePrivilegeStore((state) => state.clearPrivileges)

    useEffect(() => {
        const roleId = authenticatedUser?.roleId

        if (!roleId) {
            clearPrivileges()
            return
        }

        // Reuse cached privilege mapping for the same role across page refreshes.
        if (loadedRoleId === roleId) {
            return
        }

        const fetchPrivileges = async () => {
            clearPrivileges()
            setIsLoading(true)

            try {
                const [rolePrivilegeResponse, privilegeResponse] = await Promise.all([
                    RolePrivilegeService.getRolePrivilegeListByRoleIds({ roleIds: [roleId] }),
                    PrivilegeService.getPrivilegeList({
                        page: 1,
                        pageSize: 9999,
                        search: "",
                    }),
                ])

                const privilegeNameById = new Map(
                    (privilegeResponse.data || []).map((privilege) => [
                        privilege.privilegeId,
                        privilege.privilegeName,
                    ]),
                )

                const nextPrivilegeList = Array.from(new Set(
                    (rolePrivilegeResponse.data || [])
                        .map((rolePrivilege) => privilegeNameById.get(rolePrivilege.privilegeId) || "")
                        .filter(Boolean),
                ))

                setPrivilegeList(nextPrivilegeList, roleId)
            } catch {
                setPrivilegeList([], roleId)
            }
        }

        void fetchPrivileges()
    }, [authenticatedUser?.roleId, loadedRoleId, clearPrivileges, setIsLoading, setPrivilegeList])

    return (
        <SidebarProvider>
            <div>
                <Outlet />
            </div>
        </SidebarProvider>
    )
}

export default AppContainer
