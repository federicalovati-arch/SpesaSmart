'use client';

import Link from 'next/link';
import { CostAnalysis } from '@/components/cost-analysis';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { useData } from '@/context/data-context';
import { ShoppingCart, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { isSameMonth, parseISO } from 'date-fns';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { receipts, loading: dataLoading } = useData();

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase();
  };

  const currentMonthTotal = receipts
    .filter(receipt => isSameMonth(parseISO(receipt.archivedAt), new Date()))
    .reduce((total, receipt) => total + receipt.totalCost, 0);
    
  const loading = userLoading || dataLoading;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-full shadow-md">
                <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
            <div>
                <h1 className="text-2xl font-bold">Spesa Smart</h1>
                <p className="text-muted-foreground text-sm">Dashboard Risparmio</p>
            </div>
        </div>
      </header>

      <div className="space-y-6">
        {loading ? (
            <Skeleton className="h-16 w-full rounded-xl" />
        ) : user ? (
            <Link href="/profile">
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white shadow-md cursor-pointer transition-colors hover:bg-gray-50">
                     <Avatar className="h-12 w-12">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-xs text-muted-foreground font-semibold">BENVENUTO</p>
                        <p className="text-lg font-bold">{user.displayName}</p>
                    </div>
                </div>
            </Link>
        ) : (
            <Link href="/profile">
                 <div className="flex items-center gap-4 p-3 rounded-2xl bg-white shadow-md cursor-pointer transition-colors hover:bg-gray-50">
                     <Avatar className="h-12 w-12">
                        <AvatarFallback>
                            <User className="h-6 w-6" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-lg font-bold">Accedi o Registrati</p>
                        <p className="text-sm text-muted-foreground">Sincronizza i tuoi dati su più dispositivi.</p>
                    </div>
                </div>
            </Link>
        )}

        <div className="p-2 text-center rounded-3xl bg-primary text-primary-foreground shadow-lg">
            <p className="text-xs font-semibold opacity-80">MESE CORRENTE</p>
            <p className="text-4xl font-bold tracking-tighter">€{currentMonthTotal.toFixed(2)}</p>
        </div>

        <CostAnalysis />

      </div>
    </div>
  );
}
