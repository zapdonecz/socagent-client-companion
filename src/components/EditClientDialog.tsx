import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Client, Employment, SocialService } from '@/types';
import { saveClient } from '@/lib/storage';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onClientUpdated: () => void;
}

export function EditClientDialog({ open, onOpenChange, client, onClientUpdated }: EditClientDialogProps) {
  const [formData, setFormData] = useState({
    firstName: client.firstName,
    lastName: client.lastName,
    dateOfBirth: client.dateOfBirth,
    address: client.address,
    phone: client.phone || '',
    email: client.email || '',
    contractNumber: client.contractNumber,
    contractDate: client.contractDate,
    contractEndDate: client.contractEndDate || '',
    keyWorker: client.keyWorker,
    hasGuardian: client.guardianship?.hasGuardian || false,
    guardianName: client.guardianship?.guardianName || '',
    disabilityLevel: client.disability?.level || '',
    disabilityWithBenefit: client.disability?.withBenefit || false,
    disabilityBenefitAmount: client.disability?.benefitAmount || '',
    careLevel: client.careAllowance?.level || '',
    careDateGranted: client.careAllowance?.dateGranted || '',
    medication: client.medication || '',
  });
  
  const [employments, setEmployments] = useState(client.employments || []);
  const [socialServices, setSocialServices] = useState(client.socialServices || []);
  const { toast } = useToast();

  const addEmployment = () => {
    setEmployments([...employments, { id: Date.now().toString(), workplace: '', income: undefined }]);
  };

  const removeEmployment = (id: string) => {
    setEmployments(employments.filter(e => e.id !== id));
  };

  const updateEmployment = (id: string, field: keyof Employment, value: any) => {
    setEmployments(employments.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addSocialService = () => {
    setSocialServices([...socialServices, { id: Date.now().toString(), name: '', notes: '' }]);
  };

  const removeSocialService = (id: string) => {
    setSocialServices(socialServices.filter(s => s.id !== id));
  };

  const updateSocialService = (id: string, field: keyof SocialService, value: any) => {
    setSocialServices(socialServices.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.contractDate) {
      toast({
        title: 'Chyba',
        description: 'Vyplňte prosím všechna povinná pole',
        variant: 'destructive',
      });
      return;
    }

    const updatedClient: Client = {
      ...client,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      address: formData.address,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      contractNumber: formData.contractNumber,
      contractDate: formData.contractDate,
      contractEndDate: formData.contractEndDate || undefined,
      keyWorker: formData.keyWorker,
      guardianship: {
        hasGuardian: formData.hasGuardian,
        guardianName: formData.hasGuardian ? formData.guardianName : undefined,
      },
      disability: formData.disabilityLevel ? {
        level: formData.disabilityLevel as '1' | '2' | '3',
        withBenefit: formData.disabilityWithBenefit,
        benefitAmount: formData.disabilityWithBenefit && formData.disabilityBenefitAmount ? Number(formData.disabilityBenefitAmount) : undefined,
      } : undefined,
      careAllowance: formData.careLevel ? {
        level: formData.careLevel,
        dateGranted: formData.careDateGranted || undefined,
      } : undefined,
      medication: formData.medication || undefined,
      employments: employments.filter(e => e.workplace.trim()),
      socialServices: socialServices.filter(s => s.name.trim()),
      updatedAt: new Date().toISOString(),
    };

    saveClient(updatedClient);
    onClientUpdated();
    onOpenChange(false);
    
    toast({
      title: 'Klient aktualizován',
      description: 'Informace o klientovi byly úspěšně uloženy',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upravit informace klienta</DialogTitle>
          <DialogDescription>
            Aktualizujte základní informace o klientovi
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Jméno *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Příjmení *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Datum narození *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyWorker">Klíčový pracovník *</Label>
              <Input
                id="keyWorker"
                value={formData.keyWorker}
                onChange={(e) => setFormData({ ...formData, keyWorker: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresa</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contractNumber">Číslo smlouvy *</Label>
              <Input
                id="contractNumber"
                value={formData.contractNumber}
                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractDate">Datum smlouvy *</Label>
              <Input
                id="contractDate"
                type="date"
                value={formData.contractDate}
                onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractEndDate">Datum konce smlouvy</Label>
            <Input
              id="contractEndDate"
              type="date"
              value={formData.contractEndDate}
              onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold">Opatrovnictví</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasGuardian"
                checked={formData.hasGuardian}
                onCheckedChange={(checked) => setFormData({ ...formData, hasGuardian: checked as boolean })}
              />
              <Label htmlFor="hasGuardian" className="cursor-pointer">
                Klient má opatrovníka
              </Label>
            </div>
            {formData.hasGuardian && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="guardianName">Jméno opatrovníka</Label>
                <Input
                  id="guardianName"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold">Stupeň invalidity</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="disabilityLevel">Stupeň</Label>
                <Select value={formData.disabilityLevel || 'none'} onValueChange={(v) => setFormData({ ...formData, disabilityLevel: v === 'none' ? '' : v })}>
                  <SelectTrigger id="disabilityLevel">
                    <SelectValue placeholder="Vyberte stupeň" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Bez invalidity</SelectItem>
                    <SelectItem value="1">1. stupeň</SelectItem>
                    <SelectItem value="2">2. stupeň</SelectItem>
                    <SelectItem value="3">3. stupeň</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabilityBenefitAmount">Výše invalidního důchodu (Kč)</Label>
                <Input
                  id="disabilityBenefitAmount"
                  type="number"
                  value={formData.disabilityBenefitAmount}
                  onChange={(e) => setFormData({ ...formData, disabilityBenefitAmount: e.target.value })}
                  disabled={!formData.disabilityLevel}
                  placeholder="např. 5000"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="disabilityWithBenefit"
                checked={formData.disabilityWithBenefit}
                onCheckedChange={(checked) => setFormData({ ...formData, disabilityWithBenefit: checked as boolean })}
                disabled={!formData.disabilityLevel}
              />
              <Label htmlFor="disabilityWithBenefit" className="cursor-pointer">
                S výplatou invalidního důchodu
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medication">Aktuální medikace</Label>
            <Textarea
              id="medication"
              value={formData.medication}
              onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
              placeholder="Uveďte aktuální léky, dávkování..."
              rows={3}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Zaměstnání</h4>
              <Button type="button" variant="outline" size="sm" onClick={addEmployment}>
                <Plus className="h-4 w-4 mr-2" />
                Přidat zaměstnání
              </Button>
            </div>
            {employments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Zatím nejsou přidána žádná zaměstnání</p>
            ) : (
              <div className="space-y-3">
                {employments.map((employment) => (
                  <Card key={employment.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <Label>Místo práce</Label>
                            <Input
                              value={employment.workplace}
                              onChange={(e) => updateEmployment(employment.id, 'workplace', e.target.value)}
                              placeholder="např. Chráněná dílna XY"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Příjem (Kč/měsíc)</Label>
                            <Input
                              type="number"
                              value={employment.income || ''}
                              onChange={(e) => updateEmployment(employment.id, 'income', e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="např. 8000"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEmployment(employment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Jiné sociální služby</h4>
              <Button type="button" variant="outline" size="sm" onClick={addSocialService}>
                <Plus className="h-4 w-4 mr-2" />
                Přidat službu
              </Button>
            </div>
            {socialServices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Zatím nejsou přidány žádné sociální služby</p>
            ) : (
              <div className="space-y-3">
                {socialServices.map((service) => (
                  <Card key={service.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <Label>Název služby</Label>
                            <Input
                              value={service.name}
                              onChange={(e) => updateSocialService(service.id, 'name', e.target.value)}
                              placeholder="např. Denní stacionář ABC"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Poznámky</Label>
                            <Textarea
                              value={service.notes || ''}
                              onChange={(e) => updateSocialService(service.id, 'notes', e.target.value)}
                              placeholder="Dodatečné informace..."
                              rows={2}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSocialService(service.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Zrušit
            </Button>
            <Button type="submit">
              Uložit změny
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
