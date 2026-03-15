'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ShoppingBasket,
  List,
  CreditCard,
  History,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'HOME', icon: Home },
  { href: '/catalog', label: 'CATALOGO', icon: ShoppingBasket },
  { href: '/lists', label: 'LISTE', icon: List },
  { href: '#', label: 'CARTE', icon: CreditCard },
  { href: '#', label: 'STORICO', icon: History },
  { href: '#', label: 'PROFILO', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-white border-t md:hidden">
      <div className="grid h-16 grid-cols-6 mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === item.href
              : item.href !== '/' && pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'inline-flex flex-col items-center justify-center p-2 text-xs font-medium gap-1',
                isActive ? 'text-primary' : 'text-gray-500'
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
