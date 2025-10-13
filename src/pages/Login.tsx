import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createOrLoginUser, getAllUsers, deleteUser } from '@/lib/auth';
import { importData, downloadDataAsJSON } from '@/lib/dataExport';
import { Upload, Download, Trash2, User as UserIcon, LogIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { User } from '@/types';

export default function Login() {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [users, setUsers] = useState<User[]>(getAllUsers());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      return;
    }

    setIsLoading(true);

    const result = createOrLoginUser(userName.trim());
    
    if (result.success && result.user) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleQuickLogin = (user: User) => {
    setIsLoading(true);
    const result = createOrLoginUser(user.name);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const text = await file.text();
      const result = importData(text);

      if (result.success) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = () => {
    try {
      downloadDataAsJSON();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const result = deleteUser(userId);
    
    if (result.success) {
      setUsers(getAllUsers());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">SocAgent</CardTitle>
          <CardDescription className="text-center">
            Systém pro správu chráněného bydlení
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Vaše jméno</Label>
              <Input
                id="user-name"
                type="text"
                placeholder="např. Jan Novák"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? 'Přihlašování...' : 'Přihlásit se / Vytvořit účet'}
            </Button>
          </form>

          {users.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">
                Nebo vyberte existujícího uživatele:
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <button
                      onClick={() => handleQuickLogin(user)}
                      className="flex items-center gap-2 flex-1 text-left"
                      disabled={isLoading}
                    >
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.name}</span>
                      {user.role === 'admin' && (
                        <Badge variant="secondary" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Smazat uživatele?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Opravdu chcete smazat uživatele {user.name}? Tato akce je nevratná.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Zrušit</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Smazat
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
