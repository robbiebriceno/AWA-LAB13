// Simple in-memory database for demonstration
// In production, use a real database like MongoDB, PostgreSQL, etc.

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

export interface LoginAttempt {
  email: string;
  attempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

// In-memory storage
const users: User[] = [];
const loginAttempts: Map<string, LoginAttempt> = new Map();

// User operations
export const userDb = {
  async findByEmail(email: string): Promise<User | null> {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },

  async create(email: string, password: string, name: string): Promise<User> {
    const user: User = {
      id: Math.random().toString(36).substring(7),
      email: email.toLowerCase(),
      password,
      name,
      createdAt: new Date(),
    };
    users.push(user);
    return user;
  },

  async findById(id: string): Promise<User | null> {
    const user = users.find(u => u.id === id);
    return user || null;
  },
};

// Login attempt tracking
export const loginAttemptDb = {
  async getAttempts(email: string): Promise<LoginAttempt | null> {
    return loginAttempts.get(email.toLowerCase()) || null;
  },

  async recordFailedAttempt(email: string): Promise<void> {
    const emailLower = email.toLowerCase();
    const existing = loginAttempts.get(emailLower);
    
    if (existing) {
      existing.attempts += 1;
      existing.lastAttempt = new Date();
      
      // Lock account after 5 failed attempts for 15 minutes
      if (existing.attempts >= 5) {
        existing.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
    } else {
      loginAttempts.set(emailLower, {
        email: emailLower,
        attempts: 1,
        lastAttempt: new Date(),
      });
    }
  },

  async resetAttempts(email: string): Promise<void> {
    loginAttempts.delete(email.toLowerCase());
  },

  async isLocked(email: string): Promise<boolean> {
    const attempt = loginAttempts.get(email.toLowerCase());
    if (!attempt || !attempt.lockedUntil) return false;
    
    if (attempt.lockedUntil > new Date()) {
      return true;
    }
    
    // Lock expired, reset attempts
    this.resetAttempts(email);
    return false;
  },
};
