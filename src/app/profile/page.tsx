'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useData } from '@/context/data-context';
import { useTheme } from '@/context/theme-provider';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AuthGate } from '@/components/auth-gate';
import {
  User,
  Database,
  Cloud,
  Palette,
  Download,
  Upload,
  Check,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const { importData, exportData } = useData();
  const { theme, setTheme, themes } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataUsage, setDataUsage] = useState(0);

  const getInitials = (name?: string | null) => {
    if (!name) return '...';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('');
  };

  useEffect(() => {
    // This is a mock calculation for data usage
    const estimateSize = () => {
      try {
        const data = exportData();
        const sizeInBytes = new TextEncoder().encode(JSON.stringify(data)).length;
        setDataUsage(sizeInBytes / 1024); // in KB
      } catch (e) {
        console.error("Could not estimate data size", e);
        setDataUsage(0);
      }
    };
    estimateSize();
  }, [exportData]);

  const handleExport = () => {
    try {
      const data = exportData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spesa-smart-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Backup Esportato', description: 'Il file JSON è stato scaricato.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Errore Esportazione', description: 'Impossibile creare il backup.' });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('File could not be read.');
        
        const data = JSON.parse(text);
        
        // Basic validation
        if (data.products && data.supermarkets && data.categories && data.shoppingLists && data.receipts) {
          importData(data);
          toast({ title: 'Importazione Riuscita', description: 'I tuoi dati sono stati ripristinati dal backup.' });
          // Force a reload or a state update to reflect changes immediately
           setTimeout(() => window.location.reload(), 1000);
        } else {
          throw new Error('Il file JSON non ha la struttura corretta.');
        }
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Errore Importazione', description: error.message });
      } finally {
        // Reset file input
        if(fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col flex-1 pb-16 md:pb-0 bg-background">
      <div className="relative bg-primary text-primary-foreground text-center rounded-b-3xl px-4 pt-8 pb-24">
        <h1 className="text-3xl font-bold">Account</h1>
      </div>

      <div className="p-4 -mt-20 space-y-4 max-w-md mx-auto w-full">
        <Card className="shadow-xl rounded-2xl w-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
                {loading ? (
                    <div className="flex flex-col items-center text-center h-[112px] justify-center">
                        <Skeleton className="h-20 w-20 rounded-full mb-3" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-3 w-40 mt-2" />
                    </div>
                ) : user ? (
                  <div className="flex flex-col items-center text-center">
                      <Avatar className="h-20 w-20 mb-3 border-4 border-white shadow-md bg-gray-200">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                      </Avatar>
                      <p className="font-bold text-xl">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                     <Avatar className="h-20 w-20 mb-3 border-4 border-white shadow-md bg-gray-200">
                        <AvatarFallback><User className="h-8 w-8 text-gray-400" /></AvatarFallback>
                      </Avatar>
                    <p className="font-bold text-xl">Ospite</p>
                    <p className="text-sm text-muted-foreground">Accedi per il sync su cloud</p>
                  </div>
                )}
            </CardContent>
        </Card>
        
         <Card className="shadow-lg rounded-2xl">
            <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-bold text-lg">Cache Dati</h2>
                </div>
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-2xl font-bold text-primary">{dataUsage.toFixed(0)} KB</span>
                    <span className="text-sm font-semibold text-primary">{Math.min(100, (dataUsage / 8304) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(dataUsage / 8304) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                    Spazio occupato dalla copia locale nel browser per velocizzare l'app. I dati sono al sicuro nel Cloud se hai fatto l'accesso.
                </p>
            </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <Cloud className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-bold text-lg">Backup</h2>
                </div>
                <Button className="w-full h-12" onClick={handleExport}>
                    <Download className="mr-2" />
                    Esporta JSON
                </Button>
                <Button className="w-full h-12" variant="outline" onClick={handleImportClick}>
                    <Upload className="mr-2" />
                    Importa JSON
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
            </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
            <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-bold text-lg">Tema</h2>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {themes.map(t => (
                        <button key={t.name} onClick={() => setTheme(t.name)} className="aspect-square rounded-xl transition-all" style={{ backgroundColor: t.color }}>
                            {theme === t.name && (
                                <div className="flex items-center justify-center h-full w-full bg-black/30 rounded-xl">
                                    <Check className="h-6 w-6 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
        
        <div className="pt-4 flex justify-center">
          <AuthGate />
        </div>
      </div>
    </div>
  );
}
