import { User } from '../types';

/**
 * PURE LOCALSTORAGE PERSISTENCE
 * Rollback: All API, fetch, and backend-related logic removed.
 */

export const getSession = async (): Promise<User | null> => {
  const data = localStorage.getItem('microfix_session');
  return data ? JSON.parse(data) : null;
};

export const setSession = async (user: User | null): Promise<void> => {
  if (user) {
    localStorage.setItem('microfix_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('microfix_session');
  }
};

export const clearSession = async (): Promise<void> => {
  await setSession(null);
};