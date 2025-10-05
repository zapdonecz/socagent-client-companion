import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { SemiAnnualReview, ReviewArea, Client } from '@/types';
import { addMonths, format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  existingReview?: SemiAnnualReview;
  defaultPeriodStart: Date;
  defaultPeriodEnd: Date;
  onSave: (review: SemiAnnualReview) => void;
}

const emptyReviewArea: ReviewArea = {
  clientView: '',
  workerView: '',
  progress: 'yellow',
};

export function ReviewDialog({
  open,
  onOpenChange,
  client,
  existingReview,
  defaultPeriodStart,
  defaultPeriodEnd,
  onSave,
}: ReviewDialogProps) {
  const [periodStart, setPeriodStart] = useState<Date>(defaultPeriodStart);
  const [periodEnd, setPeriodEnd] = useState<Date>(defaultPeriodEnd);
  const [areas, setAreas] = useState(existingReview?.areas || {
    housing: { ...emptyReviewArea },
    work: { ...emptyReviewArea },
    education: { ...emptyReviewArea },
    recreation: { ...emptyReviewArea },
    health: { ...emptyReviewArea },
    selfCare: { ...emptyReviewArea },
    relationships: { ...emptyReviewArea },
    safety: { ...emptyReviewArea },
    finances: { ...emptyReviewArea },
  });
  const [clientSatisfaction, setClientSatisfaction] = useState(existingReview?.clientSatisfaction || '');
  const [workerNotes, setWorkerNotes] = useState(existingReview?.workerNotes || '');
  const [signedByClient, setSignedByClient] = useState(existingReview?.signedByClient || false);
  const [signedByWorker, setSignedByWorker] = useState(existingReview?.signedByWorker || false);

  useEffect(() => {
    if (open && !existingReview) {
      setPeriodStart(defaultPeriodStart);
      setPeriodEnd(defaultPeriodEnd);
    }
  }, [open, existingReview, defaultPeriodStart, defaultPeriodEnd]);

  const handleSave = () => {
    const review: SemiAnnualReview = {
      id: existingReview?.id || Date.now().toString(),
      clientId: client.id,
      period: {
        start: format(periodStart, 'yyyy-MM-dd'),
        end: format(periodEnd, 'yyyy-MM-dd'),
      },
      createdAt: existingReview?.createdAt || new Date().toISOString(),
      areas,
      clientSatisfaction,
      workerNotes,
      signedByClient,
      signedByWorker,
    };

    onSave(review);
    toast({
      title: 'Hodnocení uloženo',
      description: `Půlroční hodnocení pro ${client.firstName} ${client.lastName} bylo uloženo.`,
    });
    onOpenChange(false);
  };

  const areaLabels: Record<keyof SemiAnnualReview['areas'], string> = {
    housing: 'Bydlení',
    work: 'Práce',
    education: 'Vzdělávání',
    recreation: 'Volný čas',
    health: 'Zdraví',
    selfCare: 'Péče o sebe',
    relationships: 'Vztahy',
    safety: 'Bezpečí',
    finances: 'Finance',
  };

  const updateArea = (key: keyof SemiAnnualReview['areas'], field: keyof ReviewArea, value: string) => {
    setAreas(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? 'Upravit' : 'Nové'} půlroční hodnocení - {client.firstName} {client.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Period Selection */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label>Období od</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(periodStart, 'dd. MM. yyyy', { locale: cs })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={periodStart}
                    onSelect={(date) => date && setPeriodStart(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Období do</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(periodEnd, 'dd. MM. yyyy', { locale: cs })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={periodEnd}
                    onSelect={(date) => date && setPeriodEnd(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Areas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Oblasti hodnocení</h3>
            {Object.entries(areaLabels).map(([key, label]) => (
              <div key={key} className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">{label}</h4>
                
                <div className="space-y-2">
                  <Label className="text-xs">Pohled klienta</Label>
                  <Textarea
                    value={areas[key as keyof SemiAnnualReview['areas']].clientView}
                    onChange={(e) => updateArea(key as keyof SemiAnnualReview['areas'], 'clientView', e.target.value)}
                    placeholder="Co říká klient..."
                    className="min-h-[60px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Pohled pracovníka</Label>
                  <Textarea
                    value={areas[key as keyof SemiAnnualReview['areas']].workerView}
                    onChange={(e) => updateArea(key as keyof SemiAnnualReview['areas'], 'workerView', e.target.value)}
                    placeholder="Pozorování pracovníka..."
                    className="min-h-[60px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Pokrok</Label>
                  <RadioGroup
                    value={areas[key as keyof SemiAnnualReview['areas']].progress}
                    onValueChange={(value) => updateArea(key as keyof SemiAnnualReview['areas'], 'progress', value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="green" id={`${key}-green`} />
                      <Label htmlFor={`${key}-green`} className="text-green-600">Pozitivní</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yellow" id={`${key}-yellow`} />
                      <Label htmlFor={`${key}-yellow`} className="text-yellow-600">Neutrální</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="red" id={`${key}-red`} />
                      <Label htmlFor={`${key}-red`} className="text-red-600">Vyžaduje pozornost</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>

          {/* Client Satisfaction */}
          <div className="space-y-2">
            <Label>Spokojenost klienta se spoluprací</Label>
            <Textarea
              value={clientSatisfaction}
              onChange={(e) => setClientSatisfaction(e.target.value)}
              placeholder="Co klient říká o spolupráci..."
              className="min-h-[100px]"
            />
          </div>

          {/* Worker Notes */}
          <div className="space-y-2">
            <Label>Poznámky pracovníka</Label>
            <Textarea
              value={workerNotes}
              onChange={(e) => setWorkerNotes(e.target.value)}
              placeholder="Další poznámky k hodnocení..."
              className="min-h-[100px]"
            />
          </div>

          {/* Signatures */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <Label>Podpisy</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="signedByClient"
                checked={signedByClient}
                onCheckedChange={(checked) => setSignedByClient(checked as boolean)}
              />
              <Label htmlFor="signedByClient" className="font-normal cursor-pointer">
                Podepsáno klientem
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="signedByWorker"
                checked={signedByWorker}
                onCheckedChange={(checked) => setSignedByWorker(checked as boolean)}
              />
              <Label htmlFor="signedByWorker" className="font-normal cursor-pointer">
                Podepsáno pracovníkem
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Zrušit
            </Button>
            <Button onClick={handleSave}>
              Uložit hodnocení
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
