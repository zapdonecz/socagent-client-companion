import { User, UserRole } from '@/types';
import { z } from 'zod';

const STORAGE_KEYS = {
  USER: 'socagent_user',
  USERS_DB: 'socagent_users_db',
} as const;

export const registerSchema = z.object({
  email: z.string().trim().email({ message: 'Neplatná emailová adresa' }).max(255),
  password: z.string().min(6, { message: 'Heslo musí mít alespoň 6 znaků' }).max(100),
  name: z.string().trim().min(2, { message: 'Jméno musí mít alespoň 2 znaky' }).max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hesla se neshodují',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Neplatná emailová adresa' }),
  password: z.string().min(1, { message: 'Heslo je povinné' }),
});

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
    ];
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(defaultUsers));
  }
};


export const register = (email: string, password: string, name: string): { success: boolean; error?: string } => {
  initializeUsers();
  
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  if (!usersJson) return { success: false, error: 'Systémová chyba' };
  
  const users: User[] = JSON.parse(usersJson);
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return { success: false, error: 'Email je již registrován' };
  }
  
  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
    role: 'worker',
  };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  
  return { success: true };
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
