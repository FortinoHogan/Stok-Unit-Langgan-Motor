import type React from "react"
import { SidebarProvider as ShadcnSidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Outlet } from "react-router-dom"
import AppThemeSwitcher from "@/components/app-layout/app-theme-switcher/AppThemeSwitcher"
import AppContent from "@/components/app-layout/app-content/AppContent"
import AppSidebar from "@/components/app-components/app-sidebar/AppSidebar"

type SidebarProviderProps = {
    children: React.ReactNode
    defaultOpen?: boolean
}

const SidebarProvider = ({ children, defaultOpen = true }: SidebarProviderProps) => {
    return (
        <ShadcnSidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <main className="flex-1">
                <div className="flex items-center justify-between mr-4">
                    <div className="p-2 flex items-center gap-2">
                        <SidebarTrigger />
                        <Separator orientation="vertical" />
                    </div>
                    <AppThemeSwitcher />
                </div>
                <Separator />

                <div className="p-4">
                    <AppContent>
                        {children || <Outlet />}
                    </AppContent>
                </div>
            </main>
        </ShadcnSidebarProvider>
    )
}

export default SidebarProvider
