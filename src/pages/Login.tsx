import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { login } from '@/lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = login(email, password);
      
      if (user) {
        toast({
          title: 'Přihlášení úspěšné',
          description: `Vítejte, ${user.name}`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Chyba přihlášení',
          description: 'Neplatné přihlašovací údaje',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Něco se pokazilo',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vas.email@example.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Přihlašování...' : 'Přihlásit se'}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm font-semibold mb-2">Demo přihlašovací údaje:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Admin:</strong> admin@socagent.cz / demo123</p>
              <p><strong>Pracovník:</strong> pracovnik@socagent.cz / demo123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
