import { CostAnalysis } from '@/components/cost-analysis';
import { RecentReceipts } from '@/components/recent-receipts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardPage() {
  // Mock user data, will be replaced by auth
  const user = {
    name: 'Mario Rossi',
    imageUrl: 'https://picsum.photos/seed/user/100/100',
  };
  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.map((n) => n[0]).join('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.imageUrl} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-muted-foreground">Benvenuto,</p>
          <h1 className="text-2xl font-bold">{user.name}</h1>
        </div>
      </div>

      <div className="space-y-8">
        <CostAnalysis />
        <RecentReceipts />
      </div>
    </div>
  );
}
