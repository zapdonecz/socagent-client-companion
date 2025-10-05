import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { getClients } from '@/lib/storage';

export default function Clients() {
  const clients = getClients();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Klienti</h2>
        <p className="text-muted-foreground">Správa klientů chráněného bydlení</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seznam klientů</CardTitle>
          <CardDescription>
            Celkem {clients.length} aktivních klientů
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Zatím nemáte žádné klienty</p>
              <Button className="mt-4">Přidat prvního klienta</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {clients.map(client => (
                <div key={client.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{client.firstName} {client.lastName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Klíčový pracovník: {client.keyWorker}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Detail
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
