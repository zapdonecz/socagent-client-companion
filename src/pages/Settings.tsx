import { DataManagement } from '@/components/DataManagement';
import { UserManagement } from '@/components/UserManagement';
import { SettingsPanel } from '@/components/SettingsPanel';
import { getCurrentUser } from '@/lib/auth';

export default function Settings() {
  const user = getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Nastavení</h2>
        <p className="text-muted-foreground">Správa systému a předvoleb</p>
      </div>
      
      <SettingsPanel />
      <DataManagement />
      {user?.role === 'admin' && <UserManagement />}
    </div>
  );
}
