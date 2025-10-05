import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Phone, Mail, Calendar, UserPlus } from 'lucide-react';
import { getClients } from '@/lib/storage';
import { AddClientDialog } from '@/components/AddClientDialog';
import { Client } from '@/types';

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);

  const loadClients = () => {
    setClients(getClients());
  };

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">Klienti</h2>
          <p className="text-muted-foreground">Správa klientů chráněného bydlení</p>
        </div>
        <AddClientDialog onClientAdded={loadClients} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Seznam klientů</CardTitle>
              <CardDescription>
                Celkem {clients.length} aktivních klientů
              </CardDescription>
            </div>
            {clients.length > 0 && <AddClientDialog onClientAdded={loadClients} />}
          </div>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Zatím nemáte žádné klienty</p>
              <p className="text-sm text-muted-foreground mb-6">
                Začněte přidáním prvního klienta do systému
              </p>
              <AddClientDialog onClientAdded={loadClients} />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clients.map(client => (
                <Card key={client.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {client.firstName} {client.lastName}
                        </h3>
                        <Badge variant="outline" className="mt-1">
                          {client.keyWorker}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          Smlouva: {new Date(client.contractDate).toLocaleDateString('cs-CZ')}
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        Zobrazit detail
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

