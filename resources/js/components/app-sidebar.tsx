import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Receipt, Users, Trophy } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { capitalFamily, dashboard, travel } from '@/routes';
import { index as expenses } from '@/routes/expenses';
import { index as children } from '@/routes/children';
import type { NavItem } from '@/types';


export function AppSidebar() {
    const { auth } = usePage().props as {
        auth: { user?: { role?: string } | null };
    };

    const mainNavItems = mainNavItemsBase.filter((item) => {
        if (item.title === 'Cuentas Hijo' && auth.user?.role === 'child') {
            return false;
        }

        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

const mainNavItemsBase: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Gastos',
        href: expenses(),
        icon: Receipt,
    },
    {
        title: 'Cuentas Hijo',
        href: children(),
        icon: Users,
    },
    {
        title: 'Misiones',
        href: '/missions',
        icon: Trophy,
    },
    {
        title: 'Capital Family',
        href: capitalFamily(),
        icon: LayoutGrid,
    },
    {
        title: 'Capital Travel',
        href: travel(),
        icon: LayoutGrid,
    },
];
