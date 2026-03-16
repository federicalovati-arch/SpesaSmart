'use client';

import Link from 'next/link';
import { CostAnalysis } from '@/components/cost-analysis';
import { RecentReceipts } from '@/components/recent-receipts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { ShoppingCart, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading } = useUser();

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Spesa Smart</h1>
        </Link>
        
        {loading ? (
            <Skeleton className="h-12 w-12 rounded-full" />
        ) : (
            <Link href="/profile">
                <Avatar className="h-12 w-12 cursor-pointer">
                    {user ? (
                        <>
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </>
                    ) : (
                        <AvatarFallback className="bg-gray-200">
                            <User className="h-6 w-6 text-gray-500" />
                        </AvatarFallback>
                    )}
                </Avatar>
            </Link>
        )}

      </header>

      <div className="space-y-8">
        <CostAnalysis />
        <RecentReceipts />
      </div>
    </div>
  );
}
