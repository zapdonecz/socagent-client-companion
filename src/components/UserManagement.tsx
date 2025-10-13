import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Shield, User as UserIcon } from 'lucide-react';
import { getAllUsers, deleteUser, getCurrentUser } from '@/lib/auth';
import { User } from '@/types';
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
import { Badge } from '@/components/ui/badge';
import { EditUserDialog } from '@/components/EditUserDialog';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(getAllUsers());
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const handleDeleteUser = (userId: string) => {
    const result = deleteUser(userId);
    
    if (result.success) {
      setUsers(getAllUsers());
      toast({
        title: 'Uživatel smazán',
        description: 'Uživatel byl úspěšně odstraněn',
      });
    } else {
      toast({
        title: 'Chyba při mazání',
        description: result.error || 'Nepodařilo se smazat uživatele',
        variant: 'destructive',
      });
    }
  };

  const refreshUsers = () => {
    setUsers(getAllUsers());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Správa uživatelů</CardTitle>
            <CardDescription>
              Seznam registrovaných uživatelů systému
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refreshUsers}>
            Obnovit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.role === 'admin' ? (
                    <Shield className="h-5 w-5 text-primary" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user.name}</p>
                    {currentUser?.id === user.id && (
                      <Badge variant="secondary" className="text-xs">Vy</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                  {user.role === 'admin' ? 'Administrátor' : 'Pracovník'}
                </Badge>
                {currentUser?.role === 'admin' && (
                  <>
                    <EditUserDialog user={user} onUserUpdated={refreshUsers} />
                    {currentUser?.id !== user.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
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
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Žádní uživatelé nenalezeni
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
