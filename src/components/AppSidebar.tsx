import { Home, Users, Calendar, Settings, FileText, LayoutDashboard, CheckSquare } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Klienti', url: '/clients', icon: Users },
  { title: 'Kalendář', url: '/calendar', icon: Calendar },
  { title: 'Úkoly', url: '/tasks', icon: CheckSquare },
  { title: 'Hodnocení', url: '/reviews', icon: FileText },
  { title: 'Nastavení', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const getNavCls = (active: boolean) =>
    active 
      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold' 
      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground';

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="bg-sidebar">
        <div className="px-6 py-4 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-foreground">
            SocAgent
          </h1>
          <p className="text-xs text-sidebar-foreground/70 mt-1">Systém pro CHB</p>
        </div>
        
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-sidebar-foreground/70 px-3">Hlavní menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
