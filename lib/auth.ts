import 'server-only';
import { cookies } from 'next/headers';

export const AUTH_COOKIE = 'kodigo_session';

export type Customer = {
  id: number;
  name: string;
  email: string;
};

export function apiBaseUrl(): string {
  const value = process.env.API_BASE_URL;
  if (!value) throw new Error('API_BASE_URL no está configurada.');
  return value.replace(/\/$/, '');
}

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(AUTH_COOKIE)?.value ?? null;
}

/** Comprueba la sesión contra Laravel. Nunca confía en un JWT solo por existir. */
export async function getCurrentUser(): Promise<Customer | null> {
  const token = await getSessionToken();
  if (!token) return null;

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}/auth/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new Error('No pudimos consultar tu cuenta. Inténtalo nuevamente.');
  }

  if (response.status === 401) return null;
  if (!response.ok) throw new Error('No pudimos comprobar tu sesión.');

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { id?: number; name?: string; email?: string };
  };
  const user = payload.data;
  if (!payload.success || !user || typeof user.id !== 'number' ||
      typeof user.name !== 'string' || typeof user.email !== 'string') {
    throw new Error('No se pudo cargar la información de tu cuenta.');
  }
  return { id: user.id, name: user.name, email: user.email };
}
