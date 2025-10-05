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
  Calendar, 
  FileText, 
  Plus,
  Trash2,
  Video,
  Upload
} from 'lucide-react';
import { getClients } from '@/lib/storage';
import { 
  getNotesByClientId, 
  saveNote, 
  deleteNote,
  getDocumentsByClientId,
  saveDocument,
  deleteDocument,
  saveMeeting
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
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingContent, setMeetingContent] = useState('');

  useEffect(() => {
    if (id) {
      const clients = getClients();
      const foundClient = clients.find(c => c.id === id);
      setClient(foundClient || null);
      loadNotes();
      loadDocuments();
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

  const handleAddNote = () => {
    if (!newNoteTitle || !newNoteContent || !id || !user) return;

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
    loadNotes();
    setNewNoteTitle('');
    setNewNoteContent('');
    setNoteDialogOpen(false);

    toast({
      title: 'Poznámka přidána',
      description: 'Poznámka byla úspěšně uložena',
    });
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
    setMeetingTitle('');
    setMeetingContent('');
    setMeetingDialogOpen(false);

    toast({
      title: 'Schůzka uložena',
      description: 'Zápis ze schůzky byl úspěšně uložen',
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
                <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nová poznámka
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Přidat poznámku</DialogTitle>
                      <DialogDescription>
                        Vytvořte novou poznámku ke klientovi
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
                          <div>
                            <h4 className="font-semibold">{note.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {note.createdBy} • {new Date(note.createdAt).toLocaleString('cs-CZ')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
      </Tabs>
    </div>
  );
}
