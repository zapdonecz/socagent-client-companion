import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Calendar, AlertCircle } from 'lucide-react';
import { getClients } from '@/lib/storage';
import { getReviewsByClientId, getNextReviewDate } from '@/lib/extendedStorage';
import { Client, SemiAnnualReview } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { cs } from 'date-fns/locale';

export default function Reviews() {
  const navigate = useNavigate();
  const [clientsWithReviews, setClientsWithReviews] = useState<{
    client: Client;
    reviews: SemiAnnualReview[];
    nextReviewDate: Date;
    daysUntilNext: number;
  }[]>([]);

  useEffect(() => {
    const clients = getClients();
    const now = new Date();
    
    const data = clients.map(client => {
      const reviews = getReviewsByClientId(client.id);
      const nextReviewDate = getNextReviewDate(client.contractDate, reviews);
      const daysUntilNext = differenceInDays(nextReviewDate, now);
      
      return {
        client,
        reviews,
        nextReviewDate,
        daysUntilNext,
      };
    }).sort((a, b) => a.daysUntilNext - b.daysUntilNext);
    
    setClientsWithReviews(data);
  }, []);

  const getProgressColor = (progress: 'green' | 'yellow' | 'red') => {
    switch (progress) {
      case 'green': return 'bg-green-100 text-green-800 border-green-300';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'red': return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Hodnocení</h2>
        <p className="text-muted-foreground">Půlroční hodnocení spolupráce</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Celkem klientů</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsWithReviews.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Vyžaduje hodnocení</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {clientsWithReviews.filter(c => c.daysUntilNext <= 0).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Nadcházející (30 dní)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {clientsWithReviews.filter(c => c.daysUntilNext > 0 && c.daysUntilNext <= 30).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>Přehled klientů a hodnocení</CardTitle>
          <CardDescription>
            Klikněte na klienta pro zobrazení detailu a vytvoření hodnocení
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clientsWithReviews.map(({ client, reviews, nextReviewDate, daysUntilNext }) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/clients/${client.id}?tab=reviews`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">
                      {client.firstName} {client.lastName}
                    </h3>
                    {daysUntilNext <= 0 && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Vyžaduje hodnocení
                      </Badge>
                    )}
                    {daysUntilNext > 0 && daysUntilNext <= 30 && (
                      <Badge variant="outline" className="gap-1 border-warning text-warning">
                        <Calendar className="h-3 w-3" />
                        Za {daysUntilNext} dní
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {reviews.length} {reviews.length === 1 ? 'hodnocení' : reviews.length < 5 ? 'hodnocení' : 'hodnocení'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Další: {format(nextReviewDate, 'dd. MM. yyyy', { locale: cs })}
                    </span>
                  </div>

                  {reviews.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {reviews.slice(-3).map(review => (
                        <div
                          key={review.id}
                          className="text-xs px-2 py-1 bg-muted rounded"
                        >
                          {format(new Date(review.period.end), 'MM/yyyy')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant={daysUntilNext <= 0 ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/clients/${client.id}?tab=reviews`);
                  }}
                >
                  {reviews.length === 0 ? 'Vytvořit hodnocení' : 'Zobrazit'}
                </Button>
              </div>
            ))}
          </div>

          {clientsWithReviews.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Zatím nemáte žádné klienty</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
