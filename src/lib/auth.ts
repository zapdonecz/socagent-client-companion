import { User, UserRole } from '@/types';
import { z } from 'zod';

interface StoredUser extends User {
  password: string;
}

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
    const defaultUsers: StoredUser[] = [
      {
        id: '1',
        email: 'admin@socagent.cz',
        name: 'Administrátor',
        role: 'admin',
        password: 'demo123',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(defaultUsers));
  }
};


export const register = (email: string, password: string, name: string): { success: boolean; error?: string } => {
  initializeUsers();
  
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  if (!usersJson) return { success: false, error: 'Systémová chyba' };
  
  const users: StoredUser[] = JSON.parse(usersJson);
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return { success: false, error: 'Email je již registrován' };
  }
  
  // Create new user with password
  const newUser: StoredUser = {
    id: Date.now().toString(),
    email,
    name,
    role: 'worker',
    password, // In production, this would be hashed
  };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  
  return { success: true };
};

export const login = (email: string, password: string): User | null => {
  initializeUsers();
  
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  if (!usersJson) return null;
  
  const users: StoredUser[] = JSON.parse(usersJson);
  const storedUser = users.find(u => u.email === email);
  
  if (storedUser && storedUser.password === password) {
    // Don't store password in session
    const { password: _, ...user } = storedUser;
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

export const getAllUsers = (): User[] => {
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  if (!usersJson) return [];
  const storedUsers: StoredUser[] = JSON.parse(usersJson);
  // Don't return passwords
  return storedUsers.map(({ password, ...user }) => user);
};

export const updateUser = (userId: string, data: { name?: string; email?: string; role?: UserRole }): { success: boolean; error?: string } => {
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  if (!usersJson) return { success: false, error: 'Systémová chyba' };
  
  const users: StoredUser[] = JSON.parse(usersJson);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return { success: false, error: 'Uživatel nenalezen' };
  }
  
  // Check if email already exists (for different user)
  if (data.email && users.some(u => u.email === data.email && u.id !== userId)) {
    return { success: false, error: 'Email je již registrován' };
  }
  
  // Prevent removing last admin
  if (data.role && users[userIndex].role === 'admin' && data.role !== 'admin') {
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return { success: false, error: 'Nelze odebrat roli poslednímu administrátorovi' };
    }
  }
  
  // Update user
  users[userIndex] = {
    ...users[userIndex],
    ...data,
  };
  
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  
  // Update current user session if editing self
  const currentUser = getCurrentUser();
  if (currentUser?.id === userId) {
    const { password: _, ...updatedUser } = users[userIndex];
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  }
  
  return { success: true };
};

export const deleteUser = (userId: string): { success: boolean; error?: string } => {
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  if (!usersJson) return { success: false, error: 'Systémová chyba' };
  
  const users: StoredUser[] = JSON.parse(usersJson);
  const currentUser = getCurrentUser();
  
  // Prevent deleting yourself
  if (currentUser?.id === userId) {
    return { success: false, error: 'Nelze smazat vlastní účet' };
  }
  
  // Prevent deleting last admin
  const user = users.find(u => u.id === userId);
  if (user?.role === 'admin') {
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return { success: false, error: 'Nelze smazat posledního administrátora' };
    }
  }
  
  const filteredUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(filteredUsers));
  
  return { success: true };
};
