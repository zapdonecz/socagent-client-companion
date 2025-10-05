import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon, 
  FileText, 
  Plus,
  Trash2,
  Video,
  Upload,
  Edit,
  Clock
} from 'lucide-react';
import { getClients, saveEvent, getEvents } from '@/lib/storage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  getNotesByClientId, 
  saveNote, 
  deleteNote,
  getDocumentsByClientId,
  saveDocument,
  deleteDocument,
  saveMeeting,
  getMeetingsByClientId
} from '@/lib/extendedStorage';
import { RichTextEditor } from '@/components/RichTextEditor';
import { getCurrentUser } from '@/lib/auth';
import { Client, ClientNote, Meeting } from '@/types';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  
  const [client, setClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingContent, setMeetingContent] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventType, setEventType] = useState<'meeting' | 'accompaniment' | 'other'>('meeting');
  const [eventNotes, setEventNotes] = useState('');

  useEffect(() => {
    if (id) {
      const clients = getClients();
      const foundClient = clients.find(c => c.id === id);
      setClient(foundClient || null);
      loadNotes();
      loadDocuments();
      loadMeetings();
      loadEvents();
    }
  }, [id]);

  const loadNotes = () => {
    if (id) {
      setNotes(getNotesByClientId(id));
    }
  };

  const loadDocuments = () => {
    if (id) {
      setDocuments(getDocumentsByClientId(id));
    }
  };

  const loadMeetings = () => {
    if (id) {
      setMeetings(getMeetingsByClientId(id));
    }
  };

  const loadEvents = () => {
    if (id) {
      const allEvents = getEvents();
      setEvents(allEvents.filter((e: any) => e.clientId === id));
    }
  };

  const handleAddNote = () => {
    if (!newNoteTitle || !newNoteContent || !id || !user) return;

    if (editingNote) {
      // Edit existing note
      const updatedNote: ClientNote = {
        ...editingNote,
        title: newNoteTitle,
        content: newNoteContent,
        updatedAt: new Date().toISOString(),
      };
      saveNote(updatedNote);
      setEditingNote(null);
      toast({
        title: 'Poznámka upravena',
        description: 'Změny byly úspěšně uloženy',
      });
    } else {
      // Create new note
      const note: ClientNote = {
        id: Date.now().toString(),
        clientId: id,
        title: newNoteTitle,
        content: newNoteContent,
        createdBy: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveNote(note);
      toast({
        title: 'Poznámka přidána',
        description: 'Poznámka byla úspěšně uložena',
      });
    }

    loadNotes();
    setNewNoteTitle('');
    setNewNoteContent('');
    setNoteDialogOpen(false);
  };

  const handleEditNote = (note: ClientNote) => {
    setEditingNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setNoteDialogOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    loadNotes();
    toast({
      title: 'Poznámka smazána',
      description: 'Poznámka byla odstraněna',
    });
  };

  const handleStartMeeting = () => {
    if (!meetingTitle || !meetingContent || !id || !user) return;

    const meeting: Meeting = {
      id: Date.now().toString(),
      clientId: id,
      title: meetingTitle,
      content: meetingContent,
      startTime: new Date().toISOString(),
      createdBy: user.name,
      participants: [user.name],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveMeeting(meeting);
    loadMeetings();
    setMeetingTitle('');
    setMeetingContent('');
    setMeetingDialogOpen(false);

    toast({
      title: 'Schůzka uložena',
      description: 'Zápis ze schůzky byl úspěšně uložen',
    });
  };

  const handleAddEvent = () => {
    if (!eventTitle || !eventDate || !id || !user) return;

    const event = {
      id: Date.now().toString(),
      clientId: id,
      clientName: `${client?.firstName} ${client?.lastName}`,
      title: eventTitle,
      type: eventType,
      date: `${eventDate}T${eventTime || '00:00'}`,
      duration: 60,
      notes: eventNotes,
      createdBy: user.name,
    };

    saveEvent(event);
    loadEvents();
    setEventTitle('');
    setEventDate('');
    setEventTime('');
    setEventNotes('');
    setEventDialogOpen(false);

    toast({
      title: 'Událost naplánována',
      description: 'Schůzka byla přidána do kalendáře',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id || !user) return;

    const document = {
      id: Date.now().toString(),
      clientId: id,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedBy: user.name,
      uploadedAt: new Date().toISOString(),
    };

    saveDocument(document);
    loadDocuments();

    toast({
      title: 'Dokument nahrán',
      description: `${file.name} byl úspěšně nahrán`,
    });
  };

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Klient nenalezen</p>
        <Button onClick={() => navigate('/clients')} className="mt-4">
          Zpět na seznam
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => navigate('/clients')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zpět na seznam
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {client.firstName} {client.lastName}
            </h2>
            <div className="flex gap-2 items-center text-muted-foreground">
              <Badge variant="outline">{client.keyWorker}</Badge>
              <span>•</span>
              <span>Klient od {new Date(client.contractDate).toLocaleDateString('cs-CZ')}</span>
            </div>
          </div>
          
          <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Video className="mr-2 h-4 w-4" />
                Začít schůzku
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Zápis ze schůzky</DialogTitle>
                <DialogDescription>
                  Pořiďte si poznámky během schůzky s klientem
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meetingTitle">Název schůzky</Label>
                  <Input
                    id="meetingTitle"
                    placeholder="např. Konzultace osobního plánu"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Poznámky ze schůzky</Label>
                  <RichTextEditor
                    content={meetingContent}
                    onChange={setMeetingContent}
                    placeholder="Zapište si průběh a závěry schůzky..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setMeetingDialogOpen(false)}>
                    Zrušit
                  </Button>
                  <Button onClick={handleStartMeeting}>
                    Uložit zápis
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Základní informace</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Datum narození</p>
            <p className="font-medium">{new Date(client.dateOfBirth).toLocaleDateString('cs-CZ')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Číslo smlouvy</p>
            <p className="font-medium">{client.contractNumber || 'Neuvedeno'}</p>
          </div>
          {client.phone && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Telefon</p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{client.phone}</p>
              </div>
            </div>
          )}
          {client.email && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{client.email}</p>
              </div>
            </div>
          )}
          {client.address && (
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-muted-foreground">Adresa</p>
              <p className="font-medium">{client.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="notes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notes">Poznámky</TabsTrigger>
          <TabsTrigger value="documents">Dokumenty</TabsTrigger>
          <TabsTrigger value="plans">Plány</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Poznámky</CardTitle>
                  <CardDescription>
                    Poznámky a záznamy ke klientovi
                  </CardDescription>
                </div>
                <Dialog open={noteDialogOpen} onOpenChange={(open) => {
                  setNoteDialogOpen(open);
                  if (!open) {
                    setEditingNote(null);
                    setNewNoteTitle('');
                    setNewNoteContent('');
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nová poznámka
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingNote ? 'Upravit poznámku' : 'Přidat poznámku'}</DialogTitle>
                      <DialogDescription>
                        {editingNote ? 'Upravte poznámku ke klientovi' : 'Vytvořte novou poznámku ke klientovi'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="noteTitle">Název poznámky</Label>
                        <Input
                          id="noteTitle"
                          placeholder="např. Konzultace 12.1.2025"
                          value={newNoteTitle}
                          onChange={(e) => setNewNoteTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Obsah poznámky</Label>
                        <RichTextEditor
                          content={newNoteContent}
                          onChange={setNewNoteContent}
                          placeholder="Napište svou poznámku..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                          Zrušit
                        </Button>
                        <Button onClick={handleAddNote}>
                          Uložit poznámku
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Zatím nejsou žádné poznámky</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map(note => (
                    <Card key={note.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold">{note.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {note.createdBy} • {new Date(note.createdAt).toLocaleString('cs-CZ')}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNote(note)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Dokumenty</CardTitle>
                  <CardDescription>
                    Nahrané dokumenty klienta
                  </CardDescription>
                </div>
                <Button onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Nahrát dokument
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Zatím nejsou nahrány žádné dokumenty</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          Nahráno: {new Date(doc.uploadedAt).toLocaleString('cs-CZ')} • {doc.uploadedBy}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          deleteDocument(doc.id);
                          loadDocuments();
                          toast({
                            title: 'Dokument smazán',
                            description: 'Dokument byl odstraněn',
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Osobní plány</CardTitle>
              <CardDescription>
                Individuální plány klienta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Plány budou brzy k dispozici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zápisy ze schůzek</CardTitle>
              <CardDescription>
                Historie schůzek s klientem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {meetings.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Zatím nejsou žádné záznamy schůzek</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Použijte tlačítko "Začít schůzku" pro vytvoření zápisu
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map(meeting => (
                    <Card key={meeting.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{meeting.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {meeting.createdBy} • {new Date(meeting.startTime).toLocaleString('cs-CZ')}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Schůzka
                          </Badge>
                        </div>
                        <div 
                          className="prose prose-sm max-w-none mt-3"
                          dangerouslySetInnerHTML={{ __html: meeting.content }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Naplánované události</CardTitle>
                  <CardDescription>
                    Schůzky a doprovody s klientem
                  </CardDescription>
                </div>
                <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Naplánovat událost
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Naplánovat událost</DialogTitle>
                      <DialogDescription>
                        Vytvořte schůzku nebo doprovod s klientem
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="eventTitle">Název události</Label>
                        <Input
                          id="eventTitle"
                          placeholder="např. Konzultace osobního plánu"
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="eventDate">Datum</Label>
                          <Input
                            id="eventDate"
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="eventTime">Čas</Label>
                          <Input
                            id="eventTime"
                            type="time"
                            value={eventTime}
                            onChange={(e) => setEventTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eventType">Typ události</Label>
                        <Select value={eventType} onValueChange={(value: any) => setEventType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="meeting">Schůzka</SelectItem>
                            <SelectItem value="accompaniment">Doprovod</SelectItem>
                            <SelectItem value="other">Jiné</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
                          Zrušit
                        </Button>
                        <Button onClick={handleAddEvent}>
                          Naplánovat
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Žádné naplánované události</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map(event => (
                    <div key={event.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge variant="outline">
                            {event.type === 'meeting' ? 'Schůzka' : event.type === 'accompaniment' ? 'Doprovod' : 'Jiné'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleString('cs-CZ')}
                        </p>
                        {event.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
