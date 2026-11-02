'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: '' });
  const params = useSearchParams();
  return (
    <form action={action} className="auth-form">
      {params.get('registered') === '1' && (
        <p className="auth-success" role="status">Tu cuenta está lista. Ahora puedes iniciar sesión.</p>
      )}
      {state.error && <p className="auth-error" role="alert">{state.error}</p>}
      <label className="auth-field">
        <span>Correo electrónico</span>
        <input type="email" name="email" placeholder="nombre@correo.com" autoComplete="email" maxLength={190} required />
      </label>
      <label className="auth-field">
        <span>Contraseña</span>
        <input type="password" name="password" placeholder="Tu contraseña" autoComplete="current-password" required />
      </label>
      <button className="btn-primary auth-submit" type="submit" disabled={pending}>
        {pending ? 'Ingresando…' : 'Iniciar sesión →'}
      </button>
      <p className="auth-small">¿Aún no tienes cuenta? <Link href="/registro">Regístrate</Link></p>
    </form>
  );
}
