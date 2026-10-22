/**
 * Authentication & User Session Service
 *
 * Provides persistent user authentication, session management, profile storage,
 * and multi-user switching for SiteForge AI.
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'admin' | 'creator' | 'member';
  plan: 'Starter' | 'Pro' | 'Enterprise';
  createdAt: string;
  organization?: string;
}

const STORAGE_KEY_USER = 'siteforge_auth_user';
const STORAGE_KEY_USERS_DB = 'siteforge_users_directory';

// Pre-seeded professional default user
const DEFAULT_USER: UserProfile = {
  id: 'usr_bilal_pctsc',
  name: 'Bilal',
  email: 'bilal@pctsc.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  role: 'admin',
  plan: 'Pro',
  createdAt: '2026-01-15T09:00:00Z',
  organization: 'PCTSC Global',
};

type AuthListener = (user: UserProfile | null) => void;

class AuthenticationService {
  private listeners: Set<AuthListener> = new Set();
  private currentUser: UserProfile | null = null;

  constructor() {
    this.initSession();
  }

  private initSession(): void {
    if (typeof window === 'undefined') {
      this.currentUser = DEFAULT_USER;
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        // Initialize default user on first visit
        this.currentUser = DEFAULT_USER;
        this.saveUser(DEFAULT_USER);
      }

      // Ensure default user is in directory
      const users = this.getUsersDirectory();
      if (!users.some((u) => u.email === DEFAULT_USER.email)) {
        users.push(DEFAULT_USER);
        localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
      }
    } catch {
      this.currentUser = DEFAULT_USER;
    }
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.currentUser);
    }
  }

  private saveUser(user: UserProfile | null): void {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }

  public getUsersDirectory(): UserProfile[] {
    if (typeof window === 'undefined') return [DEFAULT_USER];
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS_DB);
      return data ? JSON.parse(data) : [DEFAULT_USER];
    } catch {
      return [DEFAULT_USER];
    }
  }

  public signIn(email: string, _password?: string): { success: boolean; user?: UserProfile; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const directory = this.getUsersDirectory();
    let matched = directory.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!matched) {
      // Auto-provision demo account for convenience if unknown
      const namePart = trimmedEmail.split('@')[0];
      matched = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
        email: trimmedEmail,
        role: 'creator',
        plan: 'Pro',
        createdAt: new Date().toISOString(),
      };
      directory.push(matched);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(directory));
      }
    }

    this.currentUser = matched;
    this.saveUser(matched);
    this.notify();
    return { success: true, user: matched };
  }

  public signUp(data: { name: string; email: string; organization?: string; password?: string }): {
    success: boolean;
    user?: UserProfile;
    error?: string;
  } {
    const trimmedEmail = data.email.trim().toLowerCase();
    const trimmedName = data.name.trim();

    if (!trimmedName) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const directory = this.getUsersDirectory();
    if (directory.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      // Already exists, just log in
      return this.signIn(trimmedEmail);
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      email: trimmedEmail,
      organization: data.organization?.trim() || undefined,
      role: 'creator',
      plan: 'Pro',
      createdAt: new Date().toISOString(),
    };

    directory.push(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(directory));
    }

    this.currentUser = newUser;
    this.saveUser(newUser);
    this.notify();
    return { success: true, user: newUser };
  }

  public signOut(): void {
    this.currentUser = null;
    this.saveUser(null);
    this.notify();
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    if (!this.currentUser) return null;
    this.currentUser = { ...this.currentUser, ...updates };
    this.saveUser(this.currentUser);

    // Update in directory
    const directory = this.getUsersDirectory().map((u) =>
      u.id === this.currentUser?.id ? this.currentUser : u
    );
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(directory));
    }

    this.notify();
    return this.currentUser;
  }
}

export const AuthService = new AuthenticationService();
