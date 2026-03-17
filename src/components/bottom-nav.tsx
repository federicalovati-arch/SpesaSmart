'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ShoppingBasket,
  List,
  Receipt,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'HOME', icon: LayoutGrid },
  { href: '/catalog', label: 'CATALOGO', icon: ShoppingBasket },
  { href: '/lists', label: 'LISTE', icon: List },
  { href: '/history', label: 'STORICO', icon: Receipt },
  { href: '/profile', label: 'PROFILO', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-white border-t md:hidden">
      <div className="grid h-16 grid-cols-5 mx-auto">
        {navItems.map((item) => {
          const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'inline-flex flex-col items-center justify-center p-2 text-xs font-medium gap-1',
                isActive ? 'text-primary bg-primary/10' : 'text-gray-500'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
