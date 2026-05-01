import { Navigate, Outlet, matchPath, useLocation } from "react-router-dom"

import { routes } from "@/constants/paths"
import { sidebarMenu } from "@/constants/SidebarMenu"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import SidebarProvider from "@/helpers/provider/SidebarProvider"

const getAdminOnlyPaths = () => {
    const paths: string[] = []

    sidebarMenu.forEach((group) => {
        group.items.forEach((item) => {
            if (item.isAdminOnly && item.url) {
                paths.push(item.url)
            }

            item.subItems?.forEach((subItem) => {
                if (subItem.isAdminOnly) {
                    paths.push(subItem.url)
                }
            })
        })
    })

    return paths
}

const adminOnlyPaths = getAdminOnlyPaths()

const AppContainer = () => {
    const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
    const location = useLocation()

    const isAdminOnlyPath = adminOnlyPaths.some((path) =>
        Boolean(matchPath({ path, end: true }, location.pathname)),
    )

    if (isAdminOnlyPath && !authenticatedUser?.isAdmin) {
        return <Navigate to={routes.home} replace />
    }

    return (
        <SidebarProvider>
            <div>
                <Outlet />
            </div>
        </SidebarProvider>
    )
}

export default AppContainer
