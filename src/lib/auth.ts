import { User, UserRole } from '@/types';

interface StoredUser extends User {
}

const STORAGE_KEYS = {
  USER: 'socagent_user',
  USERS_DB: 'socagent_users_db',
} as const;

// Initialize with some default users
const initializeUsers = () => {
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  if (!usersJson) {
    const defaultUsers: StoredUser[] = [
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


export const createOrLoginUser = (name: string): { success: boolean; user?: User; error?: string } => {
  initializeUsers();
  
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  if (!usersJson) return { success: false, error: 'Systémová chyba' };
  
  const users: StoredUser[] = JSON.parse(usersJson);
  
  // Check if user with this name already exists
  const existingUser = users.find(u => u.name.toLowerCase() === name.toLowerCase());
  
  if (existingUser) {
    // Login existing user
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(existingUser));
    return { success: true, user: existingUser };
  }
  
  // Create new user
  const newUser: StoredUser = {
    id: Date.now().toString(),
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@socagent.cz`,
    name,
    role: 'worker',
  };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  
  return { success: true, user: newUser };
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
  initializeUsers();
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  if (!usersJson) return [];
  const storedUsers: StoredUser[] = JSON.parse(usersJson);
  return storedUsers;
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
