import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  User,
  Filter,
  X
} from 'lucide-react';
import { getEvents, saveEvent, deleteEvent, getClients } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';
import { CalendarEvent, Client } from '@/types';
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { cs } from 'date-fns/locale';

export default function Calendar() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // Form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('meeting');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDuration, setEventDuration] = useState(60);
  const [eventNotes, setEventNotes] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  
  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');

  useEffect(() => {
    loadEvents();
    setClients(getClients());
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filterType, filterClient]);

  const loadEvents = () => {
    setEvents(getEvents());
  };

  const applyFilters = () => {
    let filtered = [...events];
    
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType);
    }
    
    if (filterClient !== 'all') {
      filtered = filtered.filter(e => filterClient === 'none' ? !e.clientId : e.clientId === filterClient);
    }
    
    setFilteredEvents(filtered);
  };

  const getDayEvents = (date: Date) => {
    return filteredEvents.filter(event => 
      isSameDay(parseISO(event.date), date)
    );
  };

  const getSelectedDateEvents = () => {
    return getDayEvents(selectedDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const handleAddEvent = () => {
    if (!eventTitle || !eventDate || !user) return;

    const eventData: CalendarEvent = {
      id: editingEvent?.id || Date.now().toString(),
      title: eventTitle,
      type: eventType,
      clientId: selectedClient && selectedClient !== 'none' ? selectedClient : undefined,
      clientName: selectedClient && selectedClient !== 'none' ? clients.find(c => c.id === selectedClient)?.firstName + ' ' + clients.find(c => c.id === selectedClient)?.lastName : undefined,
      date: `${eventDate}T${eventTime || '00:00'}`,
      duration: eventDuration,
      notes: eventNotes,
      createdBy: user.name,
    };

    saveEvent(eventData);
    loadEvents();
    resetForm();
    setDialogOpen(false);

    toast({
      title: editingEvent ? 'Událost upravena' : 'Událost vytvořena',
      description: editingEvent ? 'Změny byly úspěšně uloženy' : 'Nová událost byla přidána do kalendáře',
    });
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventType(event.type);
    setEventDate(event.date.split('T')[0]);
    setEventTime(event.date.split('T')[1]?.substring(0, 5) || '');
    setEventDuration(event.duration);
    setEventNotes(event.notes || '');
    setSelectedClient(event.clientId || '');
    setDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    loadEvents();
    toast({
      title: 'Událost smazána',
      description: 'Událost byla odstraněna z kalendáře',
    });
  };

  const resetForm = () => {
    setEditingEvent(null);
    setEventTitle('');
    setEventType('meeting');
    setEventDate(format(selectedDate, 'yyyy-MM-dd'));
    setEventTime('');
    setEventDuration(60);
    setEventNotes('');
    setSelectedClient('');
  };

  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    const labels = {
      meeting: 'Schůzka',
      accompaniment: 'Doprovod',
      community: 'Komunitní',
      planning: 'Plánování',
      review: 'Hodnocení',
      other: 'Jiné'
    };
    return labels[type];
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    const colors = {
      meeting: 'bg-blue-500',
      accompaniment: 'bg-green-500',
      community: 'bg-purple-500',
      planning: 'bg-orange-500',
      review: 'bg-red-500',
      other: 'bg-gray-500'
    };
    return colors[type];
  };

  const modifiers = {
    hasEvents: (date: Date) => getDayEvents(date).length > 0,
  };

  const modifiersClassNames = {
    hasEvents: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">Kalendář událostí</h2>
          <p className="text-muted-foreground">Plánování a správa událostí s klienty</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Nová událost
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Upravit událost' : 'Vytvořit novou událost'}</DialogTitle>
              <DialogDescription>
                {editingEvent ? 'Upravte detaily události' : 'Naplánujte novou událost v kalendáři'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventTitle">Název události *</Label>
                <Input
                  id="eventTitle"
                  placeholder="např. Konzultace osobního plánu"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventType">Typ události *</Label>
                  <Select value={eventType} onValueChange={(value: any) => setEventType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Schůzka</SelectItem>
                      <SelectItem value="accompaniment">Doprovod</SelectItem>
                      <SelectItem value="community">Komunitní</SelectItem>
                      <SelectItem value="planning">Plánování</SelectItem>
                      <SelectItem value="review">Hodnocení</SelectItem>
                      <SelectItem value="other">Jiné</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventClient">Klient (nepovinné)</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Žádný klient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Osobní událost</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Datum *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventTime">Čas *</Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDuration">Délka (min)</Label>
                  <Input
                    id="eventDuration"
                    type="number"
                    min="15"
                    step="15"
                    value={eventDuration}
                    onChange={(e) => setEventDuration(parseInt(e.target.value) || 60)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventNotes">Poznámky</Label>
                <Textarea
                  id="eventNotes"
                  placeholder="Dodatečné informace k události..."
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Zrušit
                </Button>
                <Button onClick={handleAddEvent}>
                  {editingEvent ? 'Uložit změny' : 'Vytvořit událost'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle>Filtry</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Typ události</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny typy</SelectItem>
                  <SelectItem value="meeting">Schůzka</SelectItem>
                  <SelectItem value="accompaniment">Doprovod</SelectItem>
                  <SelectItem value="community">Komunitní</SelectItem>
                  <SelectItem value="planning">Plánování</SelectItem>
                  <SelectItem value="review">Hodnocení</SelectItem>
                  <SelectItem value="other">Jiné</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Klient</Label>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všichni klienti</SelectItem>
                  <SelectItem value="none">Osobní události</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(filterType !== 'all' || filterClient !== 'all') && (
            <div className="flex gap-2 mt-4">
              <Badge variant="secondary" className="gap-1">
                Aktivní filtry: {filterType !== 'all' && getEventTypeLabel(filterType as any)}
                {filterType !== 'all' && filterClient !== 'all' && ', '}
                {filterClient !== 'all' && (filterClient === 'none' ? 'Osobní události' : clients.find(c => c.id === filterClient)?.firstName)}
                <button onClick={() => { setFilterType('all'); setFilterClient('all'); }}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2 shadow-medium">
          <CardHeader>
            <CardTitle>Kalendář</CardTitle>
            <CardDescription>
              Vyberte datum pro zobrazení událostí
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CalendarUI
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={cs}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border pointer-events-auto"
            />
          </CardContent>
        </Card>

        {/* Events for selected date */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>
              {format(selectedDate, 'd. MMMM yyyy', { locale: cs })}
            </CardTitle>
            <CardDescription>
              {getSelectedDateEvents().length} {getSelectedDateEvents().length === 1 ? 'událost' : getSelectedDateEvents().length < 5 ? 'události' : 'událostí'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getSelectedDateEvents().length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Žádné události</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    setEventDate(format(selectedDate, 'yyyy-MM-dd'));
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Přidat událost
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {getSelectedDateEvents().map(event => (
                  <Card key={event.id} className="hover-lift">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                            <h4 className="font-semibold text-sm">{event.title}</h4>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(parseISO(event.date), 'HH:mm')} ({event.duration} min)
                            </div>
                            {event.clientName && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                {event.clientName}
                              </div>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {getEventTypeLabel(event.type)}
                            </Badge>
                          </div>
                          {event.notes && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {event.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly overview */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Přehled měsíce</CardTitle>
          <CardDescription>
            Statistiky událostí pro {format(selectedDate, 'MMMM yyyy', { locale: cs })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(['meeting', 'accompaniment', 'community', 'planning', 'review', 'other'] as const).map(type => {
              const monthStart = startOfMonth(selectedDate);
              const monthEnd = endOfMonth(selectedDate);
              const count = filteredEvents.filter(e => 
                e.type === type && 
                isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd })
              ).length;

              return (
                <div key={type} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getEventTypeColor(type)}`} />
                    <p className="text-xs font-medium">{getEventTypeLabel(type)}</p>
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
