import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { getSettings, saveSettings } from '@/lib/extendedStorage';
import { AppSettings } from '@/types';

export function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const { toast } = useToast();

  const handleSave = () => {
    saveSettings(settings);
    toast({
      title: 'Nastavení uloženo',
      description: 'Vaše předvolby byly úspěšně uloženy',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <CardTitle>Předvolby systému</CardTitle>
        </div>
        <CardDescription>
          Nastavte si upozornění a zobrazení podle vašich preferencí
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deadlineWarning">
              Upozornění na deadline plánů (dny předem)
            </Label>
            <Input
              id="deadlineWarning"
              type="number"
              min="1"
              max="90"
              value={settings.deadlineWarningDays}
              onChange={(e) => setSettings({
                ...settings,
                deadlineWarningDays: parseInt(e.target.value) || 14
              })}
            />
            <p className="text-xs text-muted-foreground">
              Zobrazit plány s deadlinem do X dní na dashboardu
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewReminder">
              Připomenutí půlročního hodnocení (měsíce předem)
            </Label>
            <Input
              id="reviewReminder"
              type="number"
              min="1"
              max="6"
              value={settings.reviewReminderMonths}
              onChange={(e) => setSettings({
                ...settings,
                reviewReminderMonths: parseInt(e.target.value) || 5
              })}
            />
            <p className="text-xs text-muted-foreground">
              Upozornit X měsíců před termínem hodnocení
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileUpdate">
              Aktualizace osobního profilu (měsíce)
            </Label>
            <Input
              id="profileUpdate"
              type="number"
              min="1"
              max="12"
              value={settings.profileUpdateMonths}
              onChange={(e) => setSettings({
                ...settings,
                profileUpdateMonths: parseInt(e.target.value) || 6
              })}
            />
            <p className="text-xs text-muted-foreground">
              Upozornit na aktualizaci profilu po X měsících
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stepDeadlineWarning">
              Upozornění na deadline kroků (dny předem)
            </Label>
            <Input
              id="stepDeadlineWarning"
              type="number"
              min="1"
              max="90"
              value={settings.stepDeadlineWarningDays}
              onChange={(e) => setSettings({
                ...settings,
                stepDeadlineWarningDays: parseInt(e.target.value) || 14
              })}
            />
            <p className="text-xs text-muted-foreground">
              Zobrazit kroky plánů s deadlinem do X dní na dashboardu
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventReminder">
              Upozornění na události (dny předem)
            </Label>
            <Input
              id="eventReminder"
              type="number"
              min="1"
              max="30"
              value={settings.eventReminderDays}
              onChange={(e) => setSettings({
                ...settings,
                eventReminderDays: parseInt(e.target.value) || 7
              })}
            />
            <p className="text-xs text-muted-foreground">
              Zobrazit nadcházející události do X dní na dashboardu
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskReminder">
              Upozornění na úkoly (dny předem)
            </Label>
            <Input
              id="taskReminder"
              type="number"
              min="1"
              max="30"
              value={settings.taskReminderDays}
              onChange={(e) => setSettings({
                ...settings,
                taskReminderDays: parseInt(e.target.value) || 7
              })}
            />
            <p className="text-xs text-muted-foreground">
              Zobrazit úkoly s termínem do X dní na dashboardu
            </p>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4 border-t">
            <div className="space-y-0.5">
              <Label htmlFor="showCompleted">
                Zobrazit dokončené plány
              </Label>
              <p className="text-xs text-muted-foreground">
                Ukázat i dokončené plány v přehledech
              </p>
            </div>
            <Switch
              id="showCompleted"
              checked={settings.showCompletedPlans}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                showCompletedPlans: checked
              })}
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Uložit nastavení
        </Button>
      </CardContent>
    </Card>
  );
}
