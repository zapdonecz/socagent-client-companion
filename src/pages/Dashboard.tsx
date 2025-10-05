import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, Users, FileText, Settings } from 'lucide-react';
import { getCurrentUser, logout } from '@/lib/auth';
import { getClients, getProfiles, getPlansByClientId, getReviewsByClientId, getEvents } from '@/lib/storage';
import { DataManagement } from '@/components/DataManagement';
import { UserManagement } from '@/components/UserManagement';
import { Client } from '@/types';
import { differenceInMonths, addMonths, isBefore } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [clientsNeedingReview, setClientsNeedingReview] = useState<Client[]>([]);
  const [clientsNeedingPlanning, setClientsNeedingPlanning] = useState<Client[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Calculate alerts
    const clients = getClients();
    const profiles = getProfiles();
    const allReviews = getReviewsByClientId;
    const now = new Date();

    // Clients needing semi-annual review (within 30 days of 6 month mark)
    const needingReview = clients.filter(client => {
      const reviews = getReviewsByClientId(client.id);
      const lastReview = reviews.length > 0 
        ? new Date(reviews[reviews.length - 1].period.end)
        : new Date(client.contractDate);
      
      const monthsSinceReview = differenceInMonths(now, lastReview);
      return monthsSinceReview >= 5; // Alert 30 days before
    });
    setClientsNeedingReview(needingReview);

    // Clients needing planning (no active plan or profile not updated in 6 months)
    const needingPlanning = clients.filter(client => {
      const profile = profiles.find(p => p.clientId === client.id);
      const plans = getPlansByClientId(client.id);
      const hasActivePlan = plans.some(p => p.status === 'active');
      
      if (!hasActivePlan) return true;
      
      if (profile) {
        const monthsSinceUpdate = differenceInMonths(now, new Date(profile.updatedAt));
        return monthsSinceUpdate >= 6;
      }
      
      return false;
    });
    setClientsNeedingPlanning(needingPlanning);

    // Upcoming events (next 7 days)
    const events = getEvents();
    const upcoming = events.filter(event => {
      const eventDate = new Date(event.date);
      return isBefore(now, eventDate) && differenceInMonths(eventDate, now) === 0;
    });
    setUpcomingEvents(upcoming.length);
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">SocAgent</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4 mr-2" />
              Nastavení
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Odhlásit se
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Přehled</h2>
          <p className="text-muted-foreground">Vítejte v systému správy chráněného bydlení</p>
        </div>

        {showSettings && (
          <div className="mb-8 space-y-6">
            <DataManagement />
            {user.role === 'admin' && <UserManagement />}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nadcházející události</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents}</div>
              <p className="text-xs text-muted-foreground mt-1">Tento týden</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Klienti celkem</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getClients().length}</div>
              <p className="text-xs text-muted-foreground mt-1">Aktivní případy</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Moje úkoly</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientsNeedingReview.length + clientsNeedingPlanning.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Vyžaduje pozornost</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {clientsNeedingReview.length > 0 && (
            <Card className="border-warning/50 bg-warning/5 shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <CardTitle>Půlroční hodnocení</CardTitle>
                </div>
                <CardDescription>
                  Klienti vyžadující půlroční hodnocení spolupráce
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {clientsNeedingReview.map(client => (
                    <li key={client.id} className="flex justify-between items-center p-3 bg-background rounded-md">
                      <span className="font-medium">{client.firstName} {client.lastName}</span>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/clients/${client.id}`)}>
                        Zobrazit
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {clientsNeedingPlanning.length > 0 && (
            <Card className="border-accent/50 bg-accent/5 shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-accent" />
                  <CardTitle>Individuální plánování</CardTitle>
                </div>
                <CardDescription>
                  Klienti vyžadující aktualizaci osobního profilu nebo plánu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {clientsNeedingPlanning.map(client => (
                    <li key={client.id} className="flex justify-between items-center p-3 bg-background rounded-md">
                      <span className="font-medium">{client.firstName} {client.lastName}</span>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/clients/${client.id}`)}>
                        Zobrazit
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Rychlé akce</CardTitle>
              <CardDescription>Přejít na hlavní sekce</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="justify-start" onClick={() => navigate('/clients')}>
                <Users className="mr-2 h-4 w-4" />
                Klienti
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/calendar')}>
                <Calendar className="mr-2 h-4 w-4" />
                Kalendář
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                <FileText className="mr-2 h-4 w-4" />
                Hodnocení
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                <AlertCircle className="mr-2 h-4 w-4" />
                Upozornění
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
