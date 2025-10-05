import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types';
import { saveClient } from '@/lib/storage';

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
    disability: client.disability || '',
    careLevel: client.careAllowance?.level || '',
    careDateGranted: client.careAllowance?.dateGranted || '',
    treatmentSupport: client.treatmentSupport,
  });
  const { toast } = useToast();

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
      disability: formData.disability || undefined,
      careAllowance: formData.careLevel ? {
        level: formData.careLevel,
        dateGranted: formData.careDateGranted || undefined,
      } : undefined,
      treatmentSupport: formData.treatmentSupport,
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

          <div className="space-y-2">
            <Label htmlFor="disability">Druh postižení</Label>
            <Input
              id="disability"
              value={formData.disability}
              onChange={(e) => setFormData({ ...formData, disability: e.target.value })}
              placeholder="např. Mentální postižení, Kombinované postižení..."
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold">Příspěvek na péči</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="careLevel">Stupeň příspěvku</Label>
                <Input
                  id="careLevel"
                  value={formData.careLevel}
                  onChange={(e) => setFormData({ ...formData, careLevel: e.target.value })}
                  placeholder="I, II, III, IV"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="careDateGranted">Datum přiznání</Label>
                <Input
                  id="careDateGranted"
                  type="date"
                  value={formData.careDateGranted}
                  onChange={(e) => setFormData({ ...formData, careDateGranted: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="treatmentSupport"
              checked={formData.treatmentSupport}
              onCheckedChange={(checked) => setFormData({ ...formData, treatmentSupport: checked as boolean })}
            />
            <Label htmlFor="treatmentSupport" className="cursor-pointer">
              Podpora léčby
            </Label>
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
