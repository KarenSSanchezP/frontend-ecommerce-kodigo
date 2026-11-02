'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { registerAction } from '@/app/actions/auth';

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, { error: '' });
  const next = useSearchParams().get('next');
  const safeNext = next === '/checkout' || next === '/pedidos' ? next : '';
  return (
    <form action={action} className="auth-form">
      {safeNext && <input type="hidden" name="next" value={safeNext} />}
      {state.error && <p className="auth-error" role="alert">{state.error}</p>}
      <label className="auth-field">
        <span>Nombre completo</span>
        <input type="text" name="name" placeholder="Tu nombre" autoComplete="name" minLength={2} maxLength={120} required />
      </label>
      <label className="auth-field">
        <span>Correo electrónico</span>
        <input type="email" name="email" placeholder="nombre@correo.com" autoComplete="email" maxLength={190} required />
      </label>
      <label className="auth-field">
        <span>Contraseña</span>
        <input type="password" name="password" autoComplete="new-password" minLength={12} required />
        <small>Al menos 12 caracteres, con letras y números.</small>
      </label>
      <label className="auth-field">
        <span>Confirmar contraseña</span>
        <input type="password" name="password_confirmation" autoComplete="new-password" minLength={12} required />
      </label>
      <button className="btn-primary auth-submit" type="submit" disabled={pending}>
        {pending ? 'Creando cuenta…' : 'Crear cuenta →'}
      </button>
      <p className="auth-small">¿Ya tienes cuenta? <Link href={safeNext ? `/login?next=${encodeURIComponent(safeNext)}` : "/login"}>Inicia sesión</Link></p>
    </form>
  );
}
