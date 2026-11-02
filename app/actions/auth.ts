'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { AUTH_COOKIE, apiBaseUrl, getSessionToken } from '@/lib/auth';

export type AuthActionState = { error: string };

function textField(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function passwordField(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
}

type LaravelResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
};

type ApiPostResult<T> = { status: number; body: LaravelResponse<T> };

async function postToLaravel<T>(route: string, body: object): Promise<ApiPostResult<T>> {
  const response = await fetch(`${apiBaseUrl()}${route}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
  });
  const payload: LaravelResponse<T> = await response.json().catch(() => ({}));
  return { status: response.status, body: payload };
}

export async function registerAction(
  previous: AuthActionState,
  data: FormData
): Promise<AuthActionState> {
  void previous;
  const name = textField(data, 'name');
  const email = textField(data, 'email').toLowerCase();
  const password = passwordField(data, 'password');
  const confirmation = passwordField(data, 'password_confirmation');

  if (name.length < 2 || name.length > 120) {
    return { error: 'Introduce un nombre de entre 2 y 120 caracteres.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190) {
    return { error: 'Introduce un correo electrónico válido.' };
  }
  if (password.length < 12 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return { error: 'La contraseña debe tener al menos 12 caracteres, letras y números.' };
  }
  if (password !== confirmation) {
    return { error: 'Las contraseñas no coinciden.' };
  }

  let result: ApiPostResult<{ id: number }>;
  try {
    result = await postToLaravel('/auth/register', {
      name,
      email,
      password,
      password_confirmation: confirmation,
    });
  } catch {
    return { error: 'No pudimos completar el registro. Inténtalo de nuevo.' };
  }

  if (result.status === 422) {
    if (result.body.errors?.email) {
      return { error: 'El correo ya está registrado o no es válido.' };
    }
    return { error: 'Revisa los datos y vuelve a intentarlo.' };
  }
  if (result.status === 429) {
    return { error: 'Demasiados intentos. Inténtalo más tarde.' };
  }
  if (result.status !== 201 || !result.body.success) {
    return { error: 'No se pudo crear la cuenta en este momento.' };
  }
  redirect('/login?registered=1');
}

export async function loginAction(
  previous: AuthActionState,
  data: FormData
): Promise<AuthActionState> {
  void previous;
  const email = textField(data, 'email').toLowerCase();
  const password = passwordField(data, 'password');
  if (!email || !password) return { error: 'Introduce tu correo y contraseña.' };

  type LoginPayload = { access_token: string; token_type: string; expires_in: number };
  let result: ApiPostResult<LoginPayload>;
  try {
    result = await postToLaravel<LoginPayload>('/auth/login', { email, password });
  } catch {
    return { error: 'No pudimos conectar con la tienda. Inténtalo nuevamente.' };
  }

  if (result.status === 401 || result.status === 422) {
    return { error: 'Correo o contraseña incorrectos.' };
  }
  if (result.status === 429) {
    return { error: 'Demasiados intentos. Inténtalo más tarde.' };
  }
  const auth = result.body.data;
  if (result.status !== 200 || !result.body.success ||
      !auth || typeof auth.access_token !== 'string' ||
      !auth.access_token || auth.token_type?.toLowerCase() !== 'bearer' ||
      typeof auth.expires_in !== 'number' || auth.expires_in <= 0) {
    return { error: 'No pudimos iniciar sesión en este momento.' };
  }

  // JWT legible únicamente por el servidor, con duración limitada por Laravel.
  (await cookies()).set(AUTH_COOKIE, auth.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.min(Math.floor(auth.expires_in), 86400),
  });
  revalidatePath('/', 'layout');
  redirect('/cuenta');
}

export async function logoutAction(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    try {
      await fetch(`${apiBaseUrl()}/auth/logout`, {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // Aun si Laravel no responde, se borra la cookie del navegador.
    }
  }
  (await cookies()).delete(AUTH_COOKIE);
  revalidatePath('/', 'layout');
  redirect('/login');
}
