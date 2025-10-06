import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { downloadDataAsJSON, importData, clearAllData } from '@/lib/dataExport';
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
} from '@/components/ui/alert-dialog';

export function DataManagement() {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = () => {
    try {
      downloadDataAsJSON();
      toast({
        title: 'Export úspěšný',
        description: 'Data byla exportována do JSON souboru',
      });
    } catch (error) {
      toast({
        title: 'Chyba při exportu',
        description: 'Nepodařilo se exportovat data',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const text = await file.text();
      const result = importData(text);

      if (result.success) {
        toast({
          title: 'Import úspěšný',
          description: 'Data byla úspěšně importována.',
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        toast({
          title: 'Chyba při importu',
          description: result.error || 'Neplatný formát dat',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Chyba při importu',
        description: 'Nepodařilo se načíst soubor',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearData = () => {
    clearAllData();
    toast({
      title: 'Data vymazána',
      description: 'Všechna data byla vymazána.',
    });
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Správa dat</CardTitle>
        <CardDescription>
          Export a import všech dat aplikace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleExport} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Exportovat data
          </Button>
          
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isImporting ? 'Importuji...' : 'Importovat data'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Vymazat všechna data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Jste si jisti?</AlertDialogTitle>
              <AlertDialogDescription>
                Tato akce nenávratně vymaže všechna data včetně klientů, plánů a událostí.
                Doporučujeme před smazáním provést export dat.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Zrušit</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Vymazat data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="p-4 bg-muted rounded-md text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Poznámka:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Export vytvoří JSON soubor se všemi daty</li>
            <li>Import nahradí všechna aktuální data importovanými</li>
            <li>Data jsou uložena v lokálním úložišti prohlížeče</li>
            <li>Pro produkční použití doporučujeme backend řešení</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
