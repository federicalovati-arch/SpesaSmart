'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Home,
  ShoppingBasket,
  List,
  History,
  User,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/catalog', label: 'Catalogo', icon: ShoppingBasket },
  { href: '/lists', label: 'Liste Spesa', icon: List },
  { href: '/history', label: 'Storico', icon: History },
  { href: '/profile', label: 'Profilo', icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r hidden md:block">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <ShoppingCart className="w-6 h-6 text-primary" />
          <span>SpesaIntelligente</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={
                  item.href === '/'
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                }
                className="w-full justify-start"
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
