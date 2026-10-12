export interface Credentials {
  username: string;
  password: string;
  passwordConfirmation: string;
}
export interface Draft {
  tokenHash: string;
  userId: string;
  email: string;
  username: string;
  createdAt: Date;
  lastSentAt: Date;
}
export interface Account {
  userId: string;
  email: string;
  verified: boolean;
  completedAt: Date | null;
  pending: boolean;
  temporary: boolean;
  hasDraft: boolean;
}
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email?: string;
    email_confirmed_at?: string | null;
    app_metadata?: Record<string, unknown>;
  };
}
export interface AuthProvider {
  signup(email: string, password: string, intentNonce: string): Promise<string>;
  updatePendingPassword(userId: string, password: string): Promise<void>;
  resend(email: string): Promise<void>;
  verify(email: string, otp: string): Promise<Session>;
  signInPassword(
    email: string,
    password: string,
    signal?: AbortSignal,
  ): Promise<Session>;
  clearPending(userId: string): Promise<void>;
  deletePending(userId: string): Promise<void>;
  getUser(accessToken: string): Promise<Session["user"]>;
}
export interface RegistrationStore {
  withLocks<T>(
    keys: string[],
    work: (store: RegistrationStore) => Promise<T>,
  ): Promise<T>;
  usernameTaken(username: string, userId?: string): Promise<boolean>;
  accountByEmail(email: string): Promise<Account | null>;
  accountById(userId: string): Promise<Account | null>;
  beginIntent(email: string, nonce: string, time: Date): Promise<void>;
  bindIntent(email: string, userId: string): Promise<void>;
  removeIntent(email: string): Promise<void>;
  removeEmptyIntents(before: Date): Promise<void>;
  saveDraft(draft: Draft): Promise<void>;
  draftByHash(hash: string): Promise<Draft | null>;
  updateSentAt(hash: string, time: Date): Promise<void>;
  complete(userId: string, username: string, time: Date): Promise<void>;
  clearPending(userId: string): Promise<void>;
  removeDraft(userId: string): Promise<void>;
  staleAccounts(before: Date): Promise<Account[]>;
}
export class RegistrationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
    public readonly step?: number,
  ) {
    super(message);
  }
}
