import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar as CalendarIcon, Users, FileText, Clock, Target, LogOut } from 'lucide-react';
import { getCurrentUser, logout } from '@/lib/auth';
import { getClients, getProfiles, getPlansByClientId, getReviewsByClientId, getEvents, getPlans } from '@/lib/storage';
import { DataManagement } from '@/components/DataManagement';
import { UserManagement } from '@/components/UserManagement';
import { Client, PersonalPlan } from '@/types';
import { differenceInMonths, differenceInDays, isBefore, parseISO, format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [clientsNeedingReview, setClientsNeedingReview] = useState<Client[]>([]);
  const [clientsNeedingPlanning, setClientsNeedingPlanning] = useState<Client[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<PersonalPlan[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState(0);

  const isSettingsPage = location.pathname === '/settings';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Calculate alerts
    const clients = getClients();
    const profiles = getProfiles();
    const allPlans = getPlans();
    const now = new Date();

    // Clients needing semi-annual review
    const needingReview = clients.filter(client => {
      const reviews = getReviewsByClientId(client.id);
      const lastReview = reviews.length > 0 
        ? new Date(reviews[reviews.length - 1].period.end)
        : new Date(client.contractDate);
      
      const monthsSinceReview = differenceInMonths(now, lastReview);
      return monthsSinceReview >= 5;
    });
    setClientsNeedingReview(needingReview);

    // Clients needing planning
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

    // Upcoming plan deadlines (next 14 days)
    const upcoming = allPlans.filter(plan => {
      if (plan.status !== 'active' || !plan.deadline) return false;
      const deadline = parseISO(plan.deadline);
      const daysUntil = differenceInDays(deadline, now);
      return daysUntil >= 0 && daysUntil <= 14;
    }).sort((a, b) => {
      const dateA = parseISO(a.deadline!);
      const dateB = parseISO(b.deadline!);
      return dateA.getTime() - dateB.getTime();
    });
    setUpcomingDeadlines(upcoming);

    // Upcoming events
    const events = getEvents();
    const upcomingEvts = events.filter(event => {
      const eventDate = new Date(event.date);
      return isBefore(now, eventDate) && differenceInMonths(eventDate, now) === 0;
    });
    setUpcomingEvents(upcomingEvts.length);
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getClientName = (clientId: string) => {
    const client = getClients().find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Neznámý klient';
  };

  if (!user) return null;

  if (isSettingsPage) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Nastavení</h2>
          <p className="text-muted-foreground">Správa dat a uživatelů</p>
        </div>
        <DataManagement />
        {user.role === 'admin' && <UserManagement />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Vítejte, {user.name}!
          </h2>
          <p className="text-muted-foreground">Přehled vašeho workspace</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Odhlásit se
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift shadow-soft border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Události</CardTitle>
            <CalendarIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{upcomingEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Tento týden</p>
          </CardContent>
        </Card>

        <Card className="hover-lift shadow-soft border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Klienti</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{getClients().length}</div>
            <p className="text-xs text-muted-foreground mt-1">Aktivní případy</p>
          </CardContent>
        </Card>

        <Card className="hover-lift shadow-soft border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deadliny plánů</CardTitle>
            <Target className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{upcomingDeadlines.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Příštích 14 dní</p>
          </CardContent>
        </Card>

        <Card className="hover-lift shadow-soft border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vyžaduje akci</CardTitle>
            <FileText className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              {clientsNeedingReview.length + clientsNeedingPlanning.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Úkoly celkem</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {upcomingDeadlines.length > 0 && (
          <Card className="shadow-medium border-t-4 border-t-warning">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                <CardTitle>Blížící se deadliny plánů</CardTitle>
              </div>
              <CardDescription>
                Cíle s termínem dokončení do 14 dní
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 5).map(plan => {
                  const daysUntil = differenceInDays(parseISO(plan.deadline!), new Date());
                  return (
                    <div key={plan.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">{plan.goal}</p>
                        <p className="text-xs text-muted-foreground">{getClientName(plan.clientId)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={daysUntil <= 3 ? 'destructive' : 'default'}>
                          {daysUntil === 0 ? 'Dnes' : daysUntil === 1 ? 'Zítra' : `${daysUntil}d`}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(plan.deadline!), 'dd.MM.yyyy')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {clientsNeedingReview.length > 0 && (
          <Card className="shadow-medium border-t-4 border-t-destructive">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Půlroční hodnocení</CardTitle>
              </div>
              <CardDescription>
                Klienti vyžadující hodnocení spolupráce
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clientsNeedingReview.slice(0, 5).map(client => (
                  <div key={client.id} className="flex justify-between items-center p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <span className="font-medium text-sm">{client.firstName} {client.lastName}</span>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/clients`)}>
                      Zobrazit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {clientsNeedingPlanning.length > 0 && (
          <Card className="shadow-medium border-t-4 border-t-accent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                <CardTitle>Individuální plánování</CardTitle>
              </div>
              <CardDescription>
                Klienti vyžadující aktualizaci plánu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clientsNeedingPlanning.slice(0, 5).map(client => (
                  <div key={client.id} className="flex justify-between items-center p-3 bg-accent/5 border border-accent/20 rounded-lg">
                    <span className="font-medium text-sm">{client.firstName} {client.lastName}</span>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/clients`)}>
                      Zobrazit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Rychlé akce</CardTitle>
          <CardDescription>Přejít na hlavní sekce</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button 
            variant="outline" 
            className="justify-start h-auto py-4 hover-lift" 
            onClick={() => navigate('/clients')}
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-accent" />
                <span className="font-semibold">Klienti</span>
              </div>
              <span className="text-xs text-muted-foreground">Správa klientů</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="justify-start h-auto py-4 hover-lift" 
            onClick={() => navigate('/calendar')}
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span className="font-semibold">Kalendář</span>
              </div>
              <span className="text-xs text-muted-foreground">Plánování událostí</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="justify-start h-auto py-4 hover-lift" 
            onClick={() => navigate('/reviews')}
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-secondary" />
                <span className="font-semibold">Hodnocení</span>
              </div>
              <span className="text-xs text-muted-foreground">Půlroční hodnocení</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="justify-start h-auto py-4 hover-lift" 
            onClick={() => navigate('/settings')}
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span className="font-semibold">Nastavení</span>
              </div>
              <span className="text-xs text-muted-foreground">Správa systému</span>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
