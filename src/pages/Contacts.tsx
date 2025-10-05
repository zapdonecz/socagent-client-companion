import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Search, User } from 'lucide-react';
import { getContacts, saveContact, deleteContact } from '@/lib/extendedStorage';
import { getClients } from '@/lib/storage';
import { ClientContact, Client } from '@/types';
import { Badge } from '@/components/ui/badge';

export default function Contacts() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientContact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'relationship'>('name');
  
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    clientIds: [] as string[],
  });

  useEffect(() => {
    loadContacts();
    setClients(getClients());
  }, []);

  const loadContacts = () => {
    setContacts(getContacts());
  };

  const handleSave = () => {
    if (!formData.name || !formData.relationship) {
      toast({
        title: 'Chyba',
        description: 'Vyplňte prosím jméno a vztah',
        variant: 'destructive',
      });
      return;
    }

    const contact: ClientContact = {
      id: editingContact?.id || Date.now().toString(),
      name: formData.name,
      relationship: formData.relationship,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      notes: formData.notes,
      clientIds: formData.clientIds,
      createdAt: editingContact?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveContact(contact);
    loadContacts();
    resetForm();
    setDialogOpen(false);

    toast({
      title: editingContact ? 'Kontakt upraven' : 'Kontakt přidán',
      description: editingContact ? 'Změny byly úspěšně uloženy' : 'Kontakt byl úspěšně vytvořen',
    });
  };

  const handleEdit = (contact: ClientContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone || '',
      email: contact.email || '',
      address: contact.address || '',
      notes: contact.notes || '',
      clientIds: contact.clientIds || [],
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Opravdu chcete smazat tento kontakt?')) return;
    
    deleteContact(id);
    loadContacts();
    
    toast({
      title: 'Kontakt smazán',
      description: 'Kontakt byl úspěšně odstraněn',
    });
  };

  const resetForm = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      clientIds: [],
    });
  };

  const toggleClient = (clientId: string) => {
    setFormData(prev => ({
      ...prev,
      clientIds: prev.clientIds.includes(clientId)
        ? prev.clientIds.filter(id => id !== clientId)
        : [...prev.clientIds, clientId],
    }));
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Neznámý klient';
  };

  const filteredContacts = contacts
    .filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.relationship.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'cs');
      }
      return a.relationship.localeCompare(b.relationship, 'cs');
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Kontakty</h2>
          <p className="text-muted-foreground mt-1">Správa všech kontaktů</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
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
                  <Label htmlFor="name">Jméno *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="např. MUDr. Jan Novák"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Vztah/Funkce *</Label>
                  <Input
                    id="relationship"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="např. Lékař, Opatrovník"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+420 123 456 789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresa</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ulice 123, 100 00 Praha"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Poznámky</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Další informace o kontaktu"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Přiřazení klientům</Label>
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                  {clients.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Žádní klienti k dispozici</p>
                  ) : (
                    clients.map(client => (
                      <div key={client.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`client-${client.id}`}
                          checked={formData.clientIds.includes(client.id)}
                          onChange={() => toggleClient(client.id)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`client-${client.id}`} className="cursor-pointer flex-1">
                          {client.firstName} {client.lastName}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Můžete nechat bez přiřazení nebo vybrat více klientů
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Zrušit
                </Button>
                <Button onClick={handleSave}>
                  Uložit kontakt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1">
              <CardTitle>Seznam kontaktů</CardTitle>
              <CardDescription>
                Celkem {filteredContacts.length} kontakt{filteredContacts.length !== 1 ? 'ů' : ''}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hledat kontakt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'name' | 'relationship')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Seřadit dle jména</SelectItem>
                  <SelectItem value="relationship">Seřadit dle funkce</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Žádné kontakty nenalezeny' : 'Zatím nejsou žádné kontakty'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContacts.map(contact => (
                <Card key={contact.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-3">
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
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{contact.address}</span>
                          </div>
                        )}

                        {contact.notes && (
                          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            {contact.notes}
                          </p>
                        )}

                        {contact.clientIds && contact.clientIds.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {contact.clientIds.map(clientId => (
                              <Badge key={clientId} variant="secondary" className="text-xs">
                                {getClientName(clientId)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(contact)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(contact.id)}
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
  );
}
