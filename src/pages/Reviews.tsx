import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function Reviews() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Hodnocení</h2>
        <p className="text-muted-foreground">Půlroční hodnocení spolupráce</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hodnocení klientů</CardTitle>
          <CardDescription>
            Přehled půlročních hodnocení
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Hodnocení budou brzy k dispozici</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
