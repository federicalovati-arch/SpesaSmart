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
import { Badge } from '@/components/ui/badge';
import {
  User,
  Database,
  Cloud,
  Palette,
  Download,
  Upload,
  Check,
  Loader2,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const { importData, exportData, loading: dataLoading } = useData();
  const { theme, setTheme, themes } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataUsage, setDataUsage] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

useEffect(() => {
  const backup = localStorage.getItem('lastManualBackup');
  setLastBackup(backup);
}, []);

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
    if (!dataLoading) {
      estimateSize();
    }
  }, [exportData, dataLoading]);

  const handleExport = () => {
    try {
      const data = exportData();
      const jsonString = JSON.stringify(data, null, 2);
      const now = new Date();   // <-- una sola volta
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spesa-smart-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
       // Salva la data dell'ultimo backup
    localStorage.setItem('lastManualBackup', now.toISOString());

alert(localStorage.getItem('lastManualBackup'));
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
    reader.onload = async (e) => {
      try {
        setIsImporting(true);
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('Impossibile leggere il file.');
        
        const data = JSON.parse(text);
        
        await importData(data);

        toast({ title: 'Importazione Riuscita', description: 'I tuoi dati sono stati ripristinati dal backup.' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Errore Importazione', description: error.message || 'Il file potrebbe essere corrotto o non avere un formato JSON valido.' });
      } finally {
        // Reset file input
        if(fileInputRef.current) fileInputRef.current.value = '';
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };
  
  const isLoading = userLoading || dataLoading;

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="relative bg-primary text-primary-foreground text-center rounded-b-3xl px-4 pt-8 pb-24">
        <h1 className="text-3xl font-bold">Account</h1>
      </div>

      <div className="p-4 -mt-20 space-y-4 max-w-md mx-auto w-full pb-20 md:pb-4">
        <Card className="shadow-xl rounded-2xl w-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
                {isLoading ? (
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
                      <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                      <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 flex gap-1.5 items-center">
                        <ShieldCheck className="h-3.5 w-3.5" /> Sincronizzato su Cloud
                      </Badge>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                     <Avatar className="h-20 w-20 mb-3 border-4 border-white shadow-md bg-gray-200">
                        <AvatarFallback><User className="h-8 w-8 text-gray-400" /></AvatarFallback>
                      </Avatar>
                    <p className="font-bold text-xl">Ospite</p>
                    <p className="text-sm text-muted-foreground mb-3">Accedi per proteggere i tuoi dati</p>
                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 px-3 py-1 flex gap-1.5 items-center">
                        <Smartphone className="h-3.5 w-3.5" /> Solo su questo dispositivo
                    </Badge>
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
                {isLoading ? <Skeleton className="h-12 w-full" /> :
                <>
                  <div className="flex justify-between items-baseline mb-1">
                      <span className="text-2xl font-bold text-primary">{dataUsage.toFixed(0)} KB</span>
                      <span className="text-sm font-semibold text-primary">{Math.min(100, (dataUsage / 8304) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={(dataUsage / 8304) * 100} className="h-2" />
                </>
                }
                <p className="text-xs text-muted-foreground mt-2">
                    Spazio occupato dalla copia locale per velocizzare l'app. {user ? 'I dati sono al sicuro nel Cloud.' : 'Senza account, i dati risiedono solo qui.'}
                </p>
            </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <Cloud className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-bold text-lg">Backup Manuale</h2>
                </div>
                        <p className="text-sm text-muted-foreground">
            Ultimo backup manuale:{' '}
            <span className="font-medium text-foreground">
                {lastBackup
                    ? new Date(lastBackup).toLocaleString('it-IT', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                      })
                    : 'Mai eseguito'}
            </span>
        </p>
                <Button className="w-full h-12" onClick={handleExport} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
                    {isLoading ? 'Caricamento...' : 'Esporta file JSON'}
                </Button>
                <Button className="w-full h-12" variant="outline" onClick={handleImportClick} disabled={isImporting || isLoading}>
                    {isImporting ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
                    {isImporting ? 'Importazione...' : 'Importa file JSON'}
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
                        <button key={t.name} onClick={() => setTheme(t.name)} className="aspect-square rounded-lg transition-all" style={{ backgroundColor: t.color }}>
                            {theme === t.name && (
                                <div className="flex items-center justify-center h-full w-full bg-black/30 rounded-lg">
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
