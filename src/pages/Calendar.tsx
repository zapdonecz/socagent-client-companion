import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function Calendar() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Kalendář</h2>
        <p className="text-muted-foreground">Plánování schůzek a událostí</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kalendář událostí</CardTitle>
          <CardDescription>
            Nadcházející schůzky a události
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Kalendář bude brzy k dispozici</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
