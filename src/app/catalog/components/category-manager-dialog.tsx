'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Save, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';


type CategoryManagerDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onUpdateCategory: (oldName: string, newName: string) => void;
};

export function CategoryManagerDialog({
  isOpen,
  setIsOpen,
  categories,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory,
}: CategoryManagerDialogProps) {
    const { toast } = useToast();
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState('');

    const handleAdd = () => {
        if (newCategory.trim() === '') {
            toast({ variant: 'destructive', description: 'Il nome della categoria non può essere vuoto.' });
            return;
        }
        if (categories.map(c => c.toLowerCase()).includes(newCategory.toLowerCase())) {
            toast({ variant: 'destructive', description: 'Questa categoria esiste già.' });
            return;
        }
        onAddCategory(newCategory);
        setNewCategory('');
    };

    const handleStartEdit = (category: string) => {
        setEditingCategory(category);
        setEditingValue(category);
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setEditingValue('');
    };

    const handleSaveEdit = () => {
        if (!editingCategory) return;
        if (editingValue.trim() === '') {
            toast({ variant: 'destructive', description: 'Il nome della categoria non può essere vuoto.' });
            return;
        }
        if (categories.map(c => c.toLowerCase()).includes(editingValue.toLowerCase()) && editingValue.toLowerCase() !== editingCategory.toLowerCase()) {
            toast({ variant: 'destructive', description: 'Questa categoria esiste già.' });
            return;
        }
        onUpdateCategory(editingCategory, editingValue);
        handleCancelEdit();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Gestisci Categorie</DialogTitle>
                    <DialogDescription>
                        Aggiungi, modifica o elimina le categorie dei prodotti.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-64 pr-4">
                    <div className="space-y-2">
                        {categories.map(category => (
                            <div key={category} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                                {editingCategory === category ? (
                                    <>
                                        <Input
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            className="h-8"
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveEdit}><Save className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 text-sm font-medium">{category}</span>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEdit(category)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        L'eliminazione di una categoria è irreversibile. I prodotti in questa categoria non saranno eliminati, ma potrebbero dover essere riclassificati.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDeleteCategory(category)}>Elimina</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="flex gap-2 pt-4">
                    <Input
                        placeholder="Nuova categoria..."
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <Button onClick={handleAdd}>Aggiungi</Button>
                </div>
            
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Chiudi</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
