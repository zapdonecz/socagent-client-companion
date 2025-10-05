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
  Clock,
  CheckSquare,
  Square,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { getClients, saveEvent, getEvents, deleteEvent, getPlansByClientId, savePlan, saveClient } from '@/lib/storage';
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
  getMeetingsByClientId,
  deleteMeeting,
  getReviewsByClientId,
  saveReview,
  deleteReview,
  getNextReviewDate,
  getContactsByClientId,
  saveContact,
  deleteContact
} from '@/lib/extendedStorage';
import { RichTextEditor } from '@/components/RichTextEditor';
import { getCurrentUser } from '@/lib/auth';
import { Client, ClientNote, Meeting, PersonalPlan, PlanStep, SemiAnnualReview, ClientContact } from '@/types';
import { ReviewDialog } from '@/components/ReviewDialog';
import { EditClientDialog } from '@/components/EditClientDialog';
import { addMonths, differenceInDays, format } from 'date-fns';
import { cs } from 'date-fns/locale';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  
  // Get tab from URL query parameter
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const defaultTab = searchParams.get('tab') || 'notes';
  
  const [client, setClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [plans, setPlans] = useState<PersonalPlan[]>([]);
  const [reviews, setReviews] = useState<SemiAnnualReview[]>([]);
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [editClientDialogOpen, setEditClientDialogOpen] = useState(false);
  
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editingPlan, setEditingPlan] = useState<PersonalPlan | null>(null);
  const [editingReview, setEditingReview] = useState<SemiAnnualReview | null>(null);
  const [editingContact, setEditingContact] = useState<ClientContact | null>(null);
  
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingContent, setMeetingContent] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventType, setEventType] = useState<'meeting' | 'accompaniment' | 'other'>('meeting');
  const [eventNotes, setEventNotes] = useState('');
  
  // Plan state
  const [planGoal, setPlanGoal] = useState('');
  const [planImportance, setPlanImportance] = useState('');
  const [planDeadline, setPlanDeadline] = useState('');
  const [planSteps, setPlanSteps] = useState<PlanStep[]>([]);
  
  // Contact state
  const [contactName, setContactName] = useState('');
  const [contactRelationship, setContactRelationship] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactNotes, setContactNotes] = useState('');

  useEffect(() => {
    if (id) {
      const clients = getClients();
      const foundClient = clients.find(c => c.id === id);
      setClient(foundClient || null);
      loadClientData();
    }
  }, [id]);

  // Reload contacts when tab becomes active or when returning to the page
  useEffect(() => {
    const handleFocus = () => {
      if (id) {
        loadContacts();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    // Also reload when component becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden && id) {
        loadContacts();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id, client]);

  const loadClientData = () => {
    if (id) {
      const clients = getClients();
      const foundClient = clients.find(c => c.id === id);
      setClient(foundClient || null);
      loadNotes();
      loadDocuments();
      loadMeetings();
      loadEvents();
      loadPlans();
      loadReviews();
      loadContacts();
    }
  };

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

  const loadPlans = () => {
    if (id) {
      setPlans(getPlansByClientId(id));
    }
  };

  const loadReviews = () => {
    if (id) {
      setReviews(getReviewsByClientId(id));
    }
  };

  const loadContacts = () => {
    if (!id) {
      console.log('LoadContacts: No client ID');
      return;
    }

    console.log('LoadContacts: Loading contacts for client ID:', id);
    let allContacts = getContactsByClientId(id);
    console.log('LoadContacts: Found contacts:', allContacts.length, allContacts);
    
    // Check if client exists and has contact info
    if (client && (client.phone || client.email || client.address)) {
      const clientOwnContact = allContacts.find(c => c.id === `client-${id}`);
      
      const ownContactData: ClientContact = {
        id: `client-${id}`,
        name: `${client.firstName} ${client.lastName}`,
        relationship: 'Klient',
        phone: client.phone,
        email: client.email,
        address: client.address,
        notes: 'Kontaktní údaje klienta',
        clientIds: [id],
        createdAt: clientOwnContact?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('LoadContacts: Saving client own contact:', ownContactData);
      saveContact(ownContactData);
      allContacts = getContactsByClientId(id);
      console.log('LoadContacts: After saving own contact, total contacts:', allContacts.length);
    }
    
    console.log('LoadContacts: Setting contacts state with:', allContacts);
    setContacts(allContacts);
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

    if (editingMeeting) {
      const updatedMeeting: Meeting = {
        ...editingMeeting,
        title: meetingTitle,
        content: meetingContent,
        updatedAt: new Date().toISOString(),
      };
      saveMeeting(updatedMeeting);
      setEditingMeeting(null);
      toast({
        title: 'Zápis upraven',
        description: 'Změny byly úspěšně uloženy',
      });
    } else {
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
      toast({
        title: 'Schůzka uložena',
        description: 'Zápis ze schůzky byl úspěšně uložen',
      });
    }

    loadMeetings();
    setMeetingTitle('');
    setMeetingContent('');
    setMeetingDialogOpen(false);
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setMeetingTitle(meeting.title);
    setMeetingContent(meeting.content);
    setMeetingDialogOpen(true);
  };

  const handleAddEvent = () => {
    if (!eventTitle || !eventDate || !id || !user) return;

    const eventData = {
      id: editingEvent?.id || Date.now().toString(),
      clientId: id,
      clientName: `${client?.firstName} ${client?.lastName}`,
      title: eventTitle,
      type: eventType,
      date: `${eventDate}T${eventTime || '00:00'}`,
      duration: 60,
      notes: eventNotes,
      createdBy: user.name,
    };

    saveEvent(eventData);
    loadEvents();
    setEventTitle('');
    setEventDate('');
    setEventTime('');
    setEventNotes('');
    setEditingEvent(null);
    setEventDialogOpen(false);

    toast({
      title: editingEvent ? 'Událost upravena' : 'Událost naplánována',
      description: editingEvent ? 'Změny byly úspěšně uloženy' : 'Schůzka byla přidána do kalendáře',
    });
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventType(event.type);
    setEventDate(event.date.split('T')[0]);
    setEventTime(event.date.split('T')[1]?.substring(0, 5) || '');
    setEventNotes(event.notes || '');
    setEventDialogOpen(true);
  };

  const handleAddPlan = () => {
    if (!planGoal || !planImportance || !id || !user) return;

    if (editingPlan) {
      const updatedPlan: PersonalPlan = {
        ...editingPlan,
        goal: planGoal,
        importance: planImportance,
        deadline: planDeadline || undefined,
        steps: planSteps,
        updatedAt: new Date().toISOString(),
      };
      savePlan(updatedPlan);
      setEditingPlan(null);
      toast({
        title: 'Plán upraven',
        description: 'Změny byly úspěšně uloženy',
      });
    } else {
      const plan: PersonalPlan = {
        id: Date.now().toString(),
        clientId: id,
        goal: planGoal,
        importance: planImportance,
        deadline: planDeadline || undefined,
        status: 'active',
        steps: planSteps,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      savePlan(plan);
      toast({
        title: 'Plán přidán',
        description: 'Osobní plán byl úspěšně vytvořen',
      });
    }

    loadPlans();
    setPlanGoal('');
    setPlanImportance('');
    setPlanDeadline('');
    setPlanSteps([]);
    setPlanDialogOpen(false);
  };

  const handleEditPlan = (plan: PersonalPlan) => {
    setEditingPlan(plan);
    setPlanGoal(plan.goal);
    setPlanImportance(plan.importance);
    setPlanDeadline(plan.deadline || '');
    setPlanSteps(plan.steps);
    setPlanDialogOpen(true);
  };

  const handleAddPlanStep = () => {
    const newStep: PlanStep = {
      id: Date.now().toString(),
      clientAction: '',
      othersAction: '',
      deadline: '',
      completed: false,
      notes: '',
    };
    setPlanSteps([...planSteps, newStep]);
  };

  const handleUpdatePlanStep = (stepId: string, field: keyof PlanStep, value: any) => {
    setPlanSteps(planSteps.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    ));
  };

  const handleDeletePlanStep = (stepId: string) => {
    setPlanSteps(planSteps.filter(step => step.id !== stepId));
  };

  const handleTogglePlanStatus = (plan: PersonalPlan) => {
    const updatedPlan = {
      ...plan,
      status: plan.status === 'active' ? 'completed' : 'active' as 'active' | 'completed',
      updatedAt: new Date().toISOString(),
    };
    savePlan(updatedPlan);
    loadPlans();
    toast({
      title: plan.status === 'active' ? 'Plán dokončen' : 'Plán obnoven',
      description: plan.status === 'active' ? 'Plán byl označen jako dokončený' : 'Plán byl obnoven',
    });
  };

  const handleToggleStepComplete = (plan: PersonalPlan, stepId: string) => {
    const updatedSteps = plan.steps.map(step =>
      step.id === stepId
        ? {
            ...step,
            completed: !step.completed,
            completedDate: !step.completed ? new Date().toISOString() : undefined
          }
        : step
    );
    const updatedPlan = {
      ...plan,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };
    savePlan(updatedPlan);
    loadPlans();
  };

  const handleAddContact = () => {
    if (!contactName || !contactRelationship || !id) {
      toast({
        title: 'Chyba',
        description: 'Vyplňte prosím jméno a vztah',
        variant: 'destructive',
      });
      return;
    }

    const contact: ClientContact = {
      id: editingContact?.id || Date.now().toString(),
      name: contactName,
      relationship: contactRelationship,
      phone: contactPhone,
      email: contactEmail,
      address: contactAddress,
      notes: contactNotes,
      clientIds: editingContact?.clientIds.filter(cid => cid !== id) || [],
      createdAt: editingContact?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add current client ID
    if (!contact.clientIds.includes(id)) {
      contact.clientIds.push(id);
    }

    saveContact(contact);
    loadContacts();
    resetContactForm();
    setContactDialogOpen(false);

    toast({
      title: editingContact ? 'Kontakt upraven' : 'Kontakt přidán',
      description: editingContact ? 'Změny byly úspěšně uloženy' : 'Kontakt byl úspěšně vytvořen',
    });
  };

  const handleEditContact = (contact: ClientContact) => {
    setEditingContact(contact);
    setContactName(contact.name);
    setContactRelationship(contact.relationship);
    setContactPhone(contact.phone || '');
    setContactEmail(contact.email || '');
    setContactAddress(contact.address || '');
    setContactNotes(contact.notes || '');
    setContactDialogOpen(true);
  };

  const handleDeleteContact = (contactId: string) => {
    if (!id) return;
    
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    // If contact is linked to only this client, delete it entirely
    if (contact.clientIds.length === 1 && contact.clientIds[0] === id) {
      deleteContact(contactId);
    } else {
      // Otherwise, just remove this client from the contact's clientIds
      const updatedContact = {
        ...contact,
        clientIds: contact.clientIds.filter(cid => cid !== id),
        updatedAt: new Date().toISOString(),
      };
      saveContact(updatedContact);
    }

    loadContacts();
    toast({
      title: 'Kontakt odebrán',
      description: 'Kontakt byl úspěšně odebrán z klienta',
    });
  };

  const resetContactForm = () => {
    setEditingContact(null);
    setContactName('');
    setContactRelationship('');
    setContactPhone('');
    setContactEmail('');
    setContactAddress('');
    setContactNotes('');
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
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setEditClientDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Upravit informace
            </Button>
          
            <Dialog open={meetingDialogOpen} onOpenChange={(open) => {
            setMeetingDialogOpen(open);
            if (!open) {
              setEditingMeeting(null);
              setMeetingTitle('');
              setMeetingContent('');
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Video className="mr-2 h-4 w-4" />
                Začít schůzku
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMeeting ? 'Upravit zápis' : 'Zápis ze schůzky'}</DialogTitle>
                <DialogDescription>
                  {editingMeeting ? 'Upravte zápis ze schůzky' : 'Pořiďte si poznámky během schůzky s klientem'}
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
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Klíčový pracovník</p>
            <p className="font-medium">{client.keyWorker || 'Neuvedeno'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Opatrovník</p>
            <p className="font-medium">
              {client.guardianship?.hasGuardian ? (client.guardianship.guardianName || 'Ano') : 'Ne'}
            </p>
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
          
          {/* Invalidita */}
          {client.disability && (client.disability.level || client.disability.withBenefit) && (
            <>
              {client.disability.level && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Stupeň invalidity</p>
                  <p className="font-medium">{client.disability.level}. stupeň</p>
                </div>
              )}
              {client.disability.withBenefit && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Invalidní důchod</p>
                  <p className="font-medium">
                    {client.disability.benefitAmount 
                      ? `${client.disability.benefitAmount} Kč`
                      : 'Ano'}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Péče */}
          {client.careAllowance?.level && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Stupeň péče</p>
              <p className="font-medium">
                {client.careAllowance.level}. stupeň
                {client.careAllowance.dateGranted && ` (od ${new Date(client.careAllowance.dateGranted).toLocaleDateString('cs-CZ')})`}
              </p>
            </div>
          )}

          {/* Aktuální medikace */}
          {client.medication && (
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-muted-foreground">Aktuální medikace</p>
              <p className="font-medium whitespace-pre-wrap">{client.medication}</p>
            </div>
          )}

          {/* Zaměstnání */}
          {client.employments && client.employments.length > 0 && (
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-muted-foreground">Zaměstnání</p>
              <div className="space-y-2">
                {client.employments.map((employment, index) => (
                  <div key={employment.id} className="flex gap-2 items-baseline">
                    <p className="font-medium">
                      {index + 1}. {employment.workplace}
                      {employment.income && ` - ${employment.income} Kč`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sociální služby */}
          {client.socialServices && client.socialServices.length > 0 && (
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-muted-foreground">Jiné sociální služby</p>
              <div className="space-y-2">
                {client.socialServices.map((service, index) => (
                  <div key={service.id} className="space-y-1">
                    <p className="font-medium">
                      {index + 1}. {service.name}
                    </p>
                    {service.notes && (
                      <p className="text-sm text-muted-foreground pl-4">{service.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="notes">Poznámky</TabsTrigger>
          <TabsTrigger value="contacts">Kontakty</TabsTrigger>
          <TabsTrigger value="documents">Dokumenty</TabsTrigger>
          <TabsTrigger value="meetings">Schůzky</TabsTrigger>
          <TabsTrigger value="events">Události</TabsTrigger>
          <TabsTrigger value="plans">Plány</TabsTrigger>
          <TabsTrigger value="reviews">Hodnocení</TabsTrigger>
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

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Kontakty</CardTitle>
                  <CardDescription>
                    Kontaktní osoby klienta
                  </CardDescription>
                </div>
                <Dialog open={contactDialogOpen} onOpenChange={(open) => {
                  setContactDialogOpen(open);
                  if (!open) resetContactForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Přidat kontakt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingContact ? 'Upravit kontakt' : 'Přidat kontakt'}</DialogTitle>
                      <DialogDescription>
                        {editingContact ? 'Upravte informace o kontaktu' : 'Vyplňte informace o novém kontaktu'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="contactName">Jméno *</Label>
                          <Input
                            id="contactName"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="např. MUDr. Jan Novák"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactRelationship">Vztah/Funkce *</Label>
                          <Input
                            id="contactRelationship"
                            value={contactRelationship}
                            onChange={(e) => setContactRelationship(e.target.value)}
                            placeholder="např. Lékař, Opatrovník"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="contactPhone">Telefon</Label>
                          <Input
                            id="contactPhone"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="+420 123 456 789"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail">Email</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactAddress">Adresa</Label>
                        <Input
                          id="contactAddress"
                          value={contactAddress}
                          onChange={(e) => setContactAddress(e.target.value)}
                          placeholder="Ulice 123, 100 00 Praha"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactNotes">Poznámky</Label>
                        <Textarea
                          id="contactNotes"
                          value={contactNotes}
                          onChange={(e) => setContactNotes(e.target.value)}
                          placeholder="Další informace o kontaktu"
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
                          Zrušit
                        </Button>
                        <Button onClick={handleAddContact}>
                          Uložit kontakt
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Zatím nejsou žádné kontakty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map(contact => (
                    <Card key={contact.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div>
                              <h4 className="font-semibold text-lg">{contact.name}</h4>
                              <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                            </div>

                            <div className="grid gap-2 md:grid-cols-2">
                              {contact.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span>{contact.phone}</span>
                                </div>
                              )}
                              {contact.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span>{contact.email}</span>
                                </div>
                              )}
                            </div>

                            {contact.address && (
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span>{contact.address}</span>
                              </div>
                            )}

                            {contact.notes && (
                              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                {contact.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditContact(contact)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
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

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Osobní plány</CardTitle>
                  <CardDescription>
                    Individuální plány a cíle klienta
                  </CardDescription>
                </div>
                <Dialog open={planDialogOpen} onOpenChange={(open) => {
                  setPlanDialogOpen(open);
                  if (!open) {
                    setEditingPlan(null);
                    setPlanGoal('');
                    setPlanImportance('');
                    setPlanDeadline('');
                    setPlanSteps([]);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nový plán
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPlan ? 'Upravit plán' : 'Vytvořit osobní plán'}</DialogTitle>
                      <DialogDescription>
                        {editingPlan ? 'Upravte cíl a kroky plánu' : 'Definujte cíl klienta a kroky k jeho dosažení'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="planGoal">Cíl</Label>
                        <Textarea
                          id="planGoal"
                          placeholder="Co chce klient dosáhnout?"
                          value={planGoal}
                          onChange={(e) => setPlanGoal(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="planImportance">Proč je to pro klienta důležité?</Label>
                        <Textarea
                          id="planImportance"
                          placeholder="Důvod a význam cíle..."
                          value={planImportance}
                          onChange={(e) => setPlanImportance(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="planDeadline">Termín (nepovinné)</Label>
                        <Input
                          id="planDeadline"
                          type="date"
                          value={planDeadline}
                          onChange={(e) => setPlanDeadline(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Kroky k dosažení cíle</Label>
                          <Button type="button" size="sm" variant="outline" onClick={handleAddPlanStep}>
                            <Plus className="h-4 w-4 mr-1" />
                            Přidat krok
                          </Button>
                        </div>
                        {planSteps.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Zatím nejsou definovány žádné kroky
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {planSteps.map((step, index) => (
                              <Card key={step.id}>
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Krok {index + 1}</h4>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeletePlanStep(step.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Co udělá klient?</Label>
                                    <Textarea
                                      placeholder="Akce klienta..."
                                      value={step.clientAction}
                                      onChange={(e) => handleUpdatePlanStep(step.id, 'clientAction', e.target.value)}
                                      rows={2}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Co udělají ostatní?</Label>
                                    <Textarea
                                      placeholder="Podpora od pracovníka, rodiny..."
                                      value={step.othersAction}
                                      onChange={(e) => handleUpdatePlanStep(step.id, 'othersAction', e.target.value)}
                                      rows={2}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Termín</Label>
                                      <Input
                                        type="date"
                                        value={step.deadline}
                                        onChange={(e) => handleUpdatePlanStep(step.id, 'deadline', e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Poznámky</Label>
                                      <Input
                                        placeholder="Dodatečné poznámky..."
                                        value={step.notes}
                                        onChange={(e) => handleUpdatePlanStep(step.id, 'notes', e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
                          Zrušit
                        </Button>
                        <Button onClick={handleAddPlan}>
                          {editingPlan ? 'Uložit změny' : 'Vytvořit plán'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Zatím nejsou vytvořeny žádné plány</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {plans.map(plan => (
                    <Card key={plan.id} className={plan.status === 'completed' ? 'opacity-70' : ''}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{plan.goal}</h4>
                              <Badge variant={plan.status === 'completed' ? 'secondary' : 'default'}>
                                {plan.status === 'completed' ? 'Dokončeno' : 'Aktivní'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{plan.importance}</p>
                            {plan.deadline && (
                              <p className="text-xs text-muted-foreground">
                                Termín: {new Date(plan.deadline).toLocaleDateString('cs-CZ')}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePlanStatus(plan)}
                            >
                              {plan.status === 'completed' ? '↻' : '✓'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPlan(plan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {plan.steps.length > 0 && (
                          <div className="space-y-2 mt-3">
                            <p className="text-sm font-medium">Kroky:</p>
                            {plan.steps.map((step, index) => (
                              <div 
                                key={step.id} 
                                className={`flex items-start gap-2 text-sm pl-4 border-l-2 ${step.completed ? 'border-green-500 opacity-60' : 'border-muted'}`}
                              >
                                <button
                                  onClick={() => handleToggleStepComplete(plan, step.id)}
                                  className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {step.completed ? (
                                    <CheckSquare className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Square className="h-4 w-4" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <p className={`font-medium ${step.completed ? 'line-through' : ''}`}>
                                    Krok {index + 1}
                                  </p>
                                  <p className="text-muted-foreground">Klient: {step.clientAction}</p>
                                  {step.othersAction && (
                                    <p className="text-muted-foreground">Ostatní: {step.othersAction}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Termín: {new Date(step.deadline).toLocaleDateString('cs-CZ')}
                                    {step.completed && step.completedDate && (
                                      <> • Dokončeno: {new Date(step.completedDate).toLocaleDateString('cs-CZ')}</>
                                    )}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
                          <div className="flex-1">
                            <h4 className="font-semibold">{meeting.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {meeting.createdBy} • {new Date(meeting.startTime).toLocaleString('cs-CZ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Schůzka
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMeeting(meeting)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                deleteMeeting(meeting.id);
                                loadMeetings();
                                toast({
                                  title: 'Zápis smazán',
                                  description: 'Zápis ze schůzky byl odstraněn',
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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
                    Schůzky, události s klientem
                  </CardDescription>
                </div>
                <Dialog open={eventDialogOpen} onOpenChange={(open) => {
                  setEventDialogOpen(open);
                  if (!open) {
                    setEditingEvent(null);
                    setEventTitle('');
                    setEventDate('');
                    setEventTime('');
                    setEventNotes('');
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Naplánovat událost
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingEvent ? 'Upravit událost' : 'Naplánovat událost'}</DialogTitle>
                      <DialogDescription>
                        {editingEvent ? 'Upravte naplánovanou událost' : 'Vytvořte schůzku nebo událost s klientem'}
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
                          onClick={() => {
                            deleteEvent(event.id);
                            loadEvents();
                            toast({
                              title: 'Událost smazána',
                              description: 'Událost byla odstraněna z kalendáře',
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Půlroční hodnocení</CardTitle>
                  <CardDescription>
                    Hodnocení spolupráce s klientem každých 6 měsíců
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingReview(null);
                  setReviewDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nové hodnocení
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {client && (
                <>
                  {/* Next Review Info - Always Visible */}
                  {(() => {
                    const nextDate = getNextReviewDate(client.contractDate, reviews);
                    const daysUntil = differenceInDays(nextDate, new Date());
                    
                    return (
                      <div className={`p-4 rounded-lg mb-4 border ${
                        daysUntil <= 0 
                          ? 'bg-destructive/10 border-destructive' 
                          : daysUntil <= 30
                          ? 'bg-warning/10 border-warning'
                          : 'bg-muted/50 border-border'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Clock className={
                            daysUntil <= 0 
                              ? 'text-destructive h-5 w-5' 
                              : daysUntil <= 30
                              ? 'text-warning h-5 w-5'
                              : 'text-muted-foreground h-5 w-5'
                          } />
                          <div className="flex-1">
                            <p className="font-medium">
                              {daysUntil <= 0 
                                ? 'Hodnocení je po termínu!' 
                                : daysUntil === 0
                                ? 'Hodnocení je dnes!'
                                : daysUntil === 1
                                ? 'Hodnocení je zítra'
                                : daysUntil <= 30
                                ? `Hodnocení za ${daysUntil} dní`
                                : `Další hodnocení za ${daysUntil} dní`
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Termín: {format(nextDate, 'dd. MM. yyyy', { locale: cs })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Zatím nebylo vytvořeno žádné hodnocení</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        První hodnocení: {format(addMonths(new Date(client.contractDate), 6), 'dd. MM. yyyy', { locale: cs })}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <Card key={review.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">
                                    Hodnocení {format(new Date(review.period.start), 'MM/yyyy')} - {format(new Date(review.period.end), 'MM/yyyy')}
                                  </h4>
                                  {review.signedByClient && review.signedByWorker && (
                                    <Badge variant="default">Podepsáno</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Vytvořeno: {format(new Date(review.createdAt), 'dd. MM. yyyy', { locale: cs })}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingReview(review);
                                    setReviewDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Opravdu chcete smazat toto hodnocení?')) {
                                      deleteReview(review.id);
                                      loadReviews();
                                      toast({
                                        title: 'Hodnocení smazáno',
                                        description: 'Hodnocení bylo úspěšně odstraněno',
                                      });
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            {/* Progress Overview */}
                            <div className="grid grid-cols-3 gap-2 mt-3">
                              {Object.entries(review.areas).map(([key, area]) => {
                                const label = {
                                  housing: 'Bydlení',
                                  work: 'Práce',
                                  education: 'Vzdělávání',
                                  recreation: 'Volný čas',
                                  health: 'Zdraví',
                                  selfCare: 'Péče o sebe',
                                  relationships: 'Vztahy',
                                  safety: 'Bezpečí',
                                  finances: 'Finance',
                                }[key] || key;

                                return (
                                  <div
                                    key={key}
                                    className={`p-2 rounded text-xs text-center ${
                                      area.progress === 'green'
                                        ? 'bg-green-100 text-green-800'
                                        : area.progress === 'yellow'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {label}
                                  </div>
                                );
                              })}
                            </div>

                            {review.clientSatisfaction && (
                              <div className="mt-3 p-3 bg-muted/50 rounded">
                                <p className="text-sm font-medium mb-1">Spokojenost klienta:</p>
                                <p className="text-sm">{review.clientSatisfaction}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      {client && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          client={client}
          existingReview={editingReview || undefined}
          defaultPeriodStart={editingReview 
            ? new Date(editingReview.period.start)
            : reviews.length > 0 
              ? new Date(reviews[reviews.length - 1].period.end)
              : new Date(client.contractDate)
          }
          defaultPeriodEnd={editingReview
            ? new Date(editingReview.period.end)
            : getNextReviewDate(client.contractDate, reviews)
          }
          onSave={(review) => {
            saveReview(review);
            loadReviews();
          }}
        />
      )}

      {/* Edit Client Dialog */}
      <EditClientDialog
        open={editClientDialogOpen}
        onOpenChange={setEditClientDialogOpen}
        client={client}
        onClientUpdated={loadClientData}
      />
    </div>
  );
}
