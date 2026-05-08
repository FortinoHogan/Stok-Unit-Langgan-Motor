import { ChevronDown, ChevronsUpDown, LogOut, Motorbike } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { sidebarMenu } from "@/constants/SidebarMenu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/helpers/hooks/useAuthStore/useAuthStore"
import { supabase } from "@/helpers/supabase/client"
import { routes } from "@/constants/paths"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { usePrivillegeStore } from "@/helpers/hooks/usePrivillegeStore/usePrivillegeStore"
import { canAccessPathByPrivillege } from "@/constants/privillegeAccess"

const AppSidebar = () => {
    const { isMobile } = useSidebar()
    const authenticatedUser = useAuthStore((state) => state.authenticatedUser)
    const clearAuthenticatedUser = useAuthStore((state) => state.clearAuthenticatedUser)
    const privillegeList = usePrivillegeStore((state) => state.privillegeList)
    const isLoadingPrivilleges = usePrivillegeStore((state) => state.isLoading)
    const navigate = useNavigate()
    const location = useLocation()

    const visibleSidebarMenu = sidebarMenu
        .map((group) => {
            const visibleItems = group.items
                .map((item) => {
                    const visibleSubItems = item.subItems?.filter((subItem) =>
                        canAccessPathByPrivillege(subItem.url, privillegeList),
                    )

                    if (!item.url && (!visibleSubItems || visibleSubItems.length === 0)) {
                        return null
                    }

                    if (item.url && !canAccessPathByPrivillege(item.url, privillegeList)) {
                        return null
                    }

                    return {
                        ...item,
                        subItems: visibleSubItems,
                    }
                })
                .filter((item): item is NonNullable<typeof item> => item !== null)

            return {
                ...group,
                items: visibleItems,
            }
        })
        .filter((group) => group.items.length > 0)

    if (isLoadingPrivilleges) {
        return null
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        clearAuthenticatedUser()
        navigate(routes.login)
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className=" data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Motorbike className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">Stok Unit <br></br>Langgan Motor</span>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {visibleSidebarMenu
                    .map((group) => (
                        <SidebarGroup key={group.title}>
                            {group.title && (
                                <SidebarGroupLabel>
                                    {group.title}
                                </SidebarGroupLabel>
                            )}
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((item) => {
                                        const hasSubMenu = (item.subItems?.length ?? 0) > 0
                                        const isSubMenuActive = item.subItems?.some((subItem) => location.pathname === subItem.url) ?? false
                                        const isItemActive = item.url ? location.pathname === item.url : isSubMenuActive

                                        if (hasSubMenu) {
                                            return (
                                                <Collapsible key={item.title} defaultOpen={isSubMenuActive} asChild className="group/collapsible">
                                                    <SidebarMenuItem>
                                                        <CollapsibleTrigger asChild>
                                                            <SidebarMenuButton isActive={isSubMenuActive}>
                                                                {item.icon && <item.icon className="h-4 w-4" />}
                                                                <span>{item.title}</span>
                                                                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                            </SidebarMenuButton>
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent>
                                                            <SidebarMenuSub>
                                                                {item.subItems?.map((subItem) => (
                                                                    <SidebarMenuSubItem key={subItem.title}>
                                                                        <SidebarMenuSubButton asChild isActive={location.pathname === subItem.url}>
                                                                            <Link to={subItem.url}>{subItem.title}</Link>
                                                                        </SidebarMenuSubButton>
                                                                    </SidebarMenuSubItem>
                                                                ))}
                                                            </SidebarMenuSub>
                                                        </CollapsibleContent>
                                                    </SidebarMenuItem>
                                                </Collapsible>
                                            )
                                        }

                                        if (!item.url) {
                                            return null
                                        }

                                        return (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton asChild isActive={isItemActive}>
                                                    <Link to={item.url}>
                                                        {item.icon && <item.icon className="h-4 w-4" />}
                                                        {item.title}
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src="" alt={authenticatedUser?.email} />
                                        <AvatarFallback className="rounded-full">
                                            <img src="/assets/img/avatar.png" alt="" className="object-contain w-full h-full rounded-full" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{authenticatedUser?.email}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src="" alt={authenticatedUser?.email} />
                                            <AvatarFallback className="rounded-full">
                                                <img src="/assets/img/avatar.png" alt="" className="object-contain w-full h-full rounded-full" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate text-xs">{authenticatedUser?.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { handleLogout() }}>
                                    <LogOut />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar
