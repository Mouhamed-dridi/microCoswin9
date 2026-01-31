
import { Ticket, User, AppPreferences } from '../types';

const STORAGE_KEY = 'microfix_db';
const SESSION_KEY = 'microfix_session';

/**
 * GLOBAL PERSISTENT DATABASE OBJECT
 * Accessible globally via window.DB or DB in the app.
 */
export const DB: {
  tickets: Ticket[];
  users: User[];
  settings: AppPreferences;
} = {
  tickets: [],
  users: [],
  settings: { darkMode: false, language: 'en' }
};

// Expose DB globally
(window as any).DB = DB;

/**
 * CORE DATABASE OPERATIONS
 */

/**
 * Reads from localStorage into the DB object.
 */
export const loadDB = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      DB.tickets = parsed.tickets || [];
      DB.users = parsed.users || [];
      DB.settings = parsed.settings || { darkMode: false, language: 'en' };
    } else {
      // Default data if none exists
      DB.users = [
        { username: 'manager', role: 'manager' },
        { username: 'operator', role: 'operator' }
      ];
      saveDB();
    }
  } catch (e) {
    console.error("Database Load Error", e);
  }
};

/**
 * Writes the DB object to localStorage.
 */
export const saveDB = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
};

/**
 * Updates DB.tickets and calls saveDB()
 */
export const addTicket = (ticket: any): Ticket => {
  const newTicket: Ticket = {
    ...ticket,
    id: Math.floor(100000 + Math.random() * 900000),
    date: new Date().toISOString(),
    status: 'Open',
    resolution: '',
  };
  DB.tickets.unshift(newTicket);
  saveDB();
  return newTicket;
};

/**
 * Updates DB.users and calls saveDB()
 */
export const addUser = (user: User): void => {
  const existingIndex = DB.users.findIndex(u => u.username === user.username);
  if (existingIndex > -1) {
    DB.users[existingIndex] = user;
  } else {
    DB.users.push(user);
  }
  saveDB();
};

/**
 * Updates DB.settings and calls saveDB()
 */
export const updateSettings = (settings: Partial<AppPreferences>): void => {
  DB.settings = { ...DB.settings, ...settings };
  saveDB();
  
  // Apply visual theme immediately based on settings
  if (DB.settings.darkMode) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
};

// Initialize DB immediately on load
loadDB();

/**
 * COMPATIBILITY & UTILITY EXPORTS FOR COMPONENTS
 */

export const getTickets = () => DB.tickets;
export const getPreferences = () => DB.settings;
export const savePreferences = (prefs: AppPreferences) => updateSettings(prefs);

// Session management (State of current login)
export const getSession = (): User | null => {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const setSession = (user: User): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const deleteTicket = (id: number) => {
  DB.tickets = DB.tickets.filter(t => t.id !== id);
  saveDB();
};

export const updateTicketFull = (id: number, updates: Partial<Ticket>) => {
  const index = DB.tickets.findIndex(t => t.id === id);
  if (index > -1) {
    DB.tickets[index] = { ...DB.tickets[index], ...updates };
    saveDB();
  }
};

export const exportDatabase = () => {
  const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `microfix_db_export.json`;
  a.click();
  URL.revokeObjectURL(url);
};
