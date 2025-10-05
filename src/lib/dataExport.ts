import { z } from 'zod';

const STORAGE_KEYS = {
  USER: 'socagent_user',
  USERS_DB: 'socagent_users_db',
  CLIENTS: 'socagent_clients',
  PROFILES: 'socagent_profiles',
  PLANS: 'socagent_plans',
  EVENTS: 'socagent_events',
  REVIEWS: 'socagent_reviews',
} as const;

export interface ExportData {
  version: string;
  exportDate: string;
  data: {
    users: any[];
    clients: any[];
    profiles: any[];
    plans: any[];
    events: any[];
    reviews: any[];
  };
}

const exportDataSchema = z.object({
  version: z.string(),
  exportDate: z.string(),
  data: z.object({
    users: z.array(z.any()),
    clients: z.array(z.any()),
    profiles: z.array(z.any()),
    plans: z.array(z.any()),
    events: z.array(z.any()),
    reviews: z.array(z.any()),
  }),
});

export const exportAllData = (): ExportData => {
  const data: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: {
      users: JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '[]'),
      clients: JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]'),
      profiles: JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]'),
      plans: JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANS) || '[]'),
      events: JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]'),
      reviews: JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]'),
    },
  };
  
  return data;
};

export const downloadDataAsJSON = () => {
  const data = exportAllData();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `socagent-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importData = (jsonData: string): { success: boolean; error?: string } => {
  try {
    const parsed = JSON.parse(jsonData);
    
    // Validate schema
    const validated = exportDataSchema.parse(parsed);
    
    // Import data
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(validated.data.users));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(validated.data.clients));
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(validated.data.profiles));
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(validated.data.plans));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(validated.data.events));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(validated.data.reviews));
    
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Neplatný formát dat' };
    }
    return { success: false, error: 'Chyba při importu dat' };
  }
};

export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    if (key !== STORAGE_KEYS.USER) {
      localStorage.removeItem(key);
    }
  });
};
