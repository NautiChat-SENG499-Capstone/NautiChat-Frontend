// src/lib/users.ts

export type User = {
  username: string;
  password: string;
};

/**
 * In‐memory “database” of users.
 * Each entry is { username, password }. 
 * NOTE: This resets when the server restarts.
 */
export const users: User[] = [];
