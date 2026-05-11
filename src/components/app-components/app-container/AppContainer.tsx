import { Outlet } from "react-router-dom"
import { useEffect } from "react"

import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { usePrivillegeStore } from "@/helpers/hooks/usePrivillegeStore/usePrivillegeStore"
import { PrivillegeService } from "@/helpers/services/PrivillegeService"
import { RolePrivillegeService } from "@/helpers/services/RolePrivillegeService"
import SidebarProvider from "@/helpers/provider/SidebarProvider"

const AppContainer = () => {
    const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
    const loadedRoleId = usePrivillegeStore((state) => state.loadedRoleId)
    const setPrivillegeList = usePrivillegeStore((state) => state.setPrivillegeList)
    const setIsLoading = usePrivillegeStore((state) => state.setIsLoading)
    const clearPrivilleges = usePrivillegeStore((state) => state.clearPrivilleges)

    useEffect(() => {
        const roleId = authenticatedUser?.roleId

        if (!roleId) {
            clearPrivilleges()
            return
        }

        // Reuse cached privilege mapping for the same role across page refreshes.
        if (loadedRoleId === roleId) {
            return
        }

        const fetchPrivilleges = async () => {
            clearPrivilleges()
            setIsLoading(true)

            try {
                const [rolePrivillegeResponse, privillegeResponse] = await Promise.all([
                    RolePrivillegeService.getRolePrivillegeListByRoleIds({ roleIds: [roleId] }),
                    PrivillegeService.getPrivillegeList({
                        page: 1,
                        pageSize: 1000,
                        search: "",
                    }),
                ])

                const privillegeNameById = new Map(
                    (privillegeResponse.data || []).map((privillege) => [
                        privillege.privillegeId,
                        privillege.privillegeName,
                    ]),
                )

                const nextPrivillegeList = Array.from(new Set(
                    (rolePrivillegeResponse.data || [])
                        .map((rolePrivillege) => privillegeNameById.get(rolePrivillege.privillegeId) || "")
                        .filter(Boolean),
                ))

                setPrivillegeList(nextPrivillegeList, roleId)
            } catch {
                setPrivillegeList([], roleId)
            }
        }

        void fetchPrivilleges()
    }, [authenticatedUser?.roleId, loadedRoleId, clearPrivilleges, setIsLoading, setPrivillegeList])

    return (
        <SidebarProvider>
            <div>
                <Outlet />
            </div>
        </SidebarProvider>
    )
}

export default AppContainer
