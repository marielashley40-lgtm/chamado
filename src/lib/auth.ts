import { CurrentUser } from '../types/ticket';

export interface AuthAccount extends CurrentUser {
  password: string;
}

export const ACCOUNTS: Record<string, AuthAccount> = {
  operador: {
    username: 'operador',
    password: 'operador123',
    name: 'Carlos Oliveira',
    role: 'operador',
    cargo: 'Operador de Máquinas & Produção',
    avatarBg: 'from-amber-500 to-amber-700',
  },
  mecanico: {
    username: 'mecanico',
    password: 'mecanico123',
    name: 'Roberto Almeida',
    role: 'mecanico',
    cargo: 'Especialista em Manutenção Mecânica',
    avatarBg: 'from-blue-600 to-cyan-700',
  },
};

const AUTH_STORAGE_KEY = 'sgc_auth_session';

export function getStoredUser(): CurrentUser | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function authenticate(username: string, password: string): { success: boolean; user?: CurrentUser; error?: string } {
  const normalizedUser = username.trim().toLowerCase();
  const account = ACCOUNTS[normalizedUser];

  if (!account || account.password !== password) {
    return { success: false, error: 'Usuário ou senha incorretos. Verifique suas credenciais.' };
  }

  const userSession: CurrentUser = {
    username: account.username,
    name: account.name,
    role: account.role,
    cargo: account.cargo,
    avatarBg: account.avatarBg,
  };

  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userSession));
  } catch {
    // ignore
  }

  return { success: true, user: userSession };
}

export function logout(): void {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}
