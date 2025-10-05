import { User, UserRole } from '@/types';

const STORAGE_KEYS = {
  USER: 'socagent_user',
  USERS_DB: 'socagent_users_db',
} as const;

// Initialize default admin user
const initializeUsers = () => {
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  if (!usersJson) {
    const defaultUsers: User[] = [
      {
        id: '1',
        email: 'admin@socagent.cz',
        name: 'Administrátor',
        role: 'admin',
      },
      {
        id: '2',
        email: 'pracovnik@socagent.cz',
        name: 'Karel Novák',
        role: 'worker',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(defaultUsers));
  }
};

export const login = (email: string, password: string): User | null => {
  initializeUsers();
  
  // Simple demo auth - in production, this would be server-side
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  if (!usersJson) return null;
  
  const users: User[] = JSON.parse(usersJson);
  const user = users.find(u => u.email === email);
  
  if (user && password === 'demo123') {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  }
  
  return null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userJson) return null;
  return JSON.parse(userJson);
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};
