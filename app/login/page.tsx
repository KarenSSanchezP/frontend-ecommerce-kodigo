import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = { title: 'Iniciar sesión | KODIGO Store' };

export default function LoginPage() {
  return (
    <main className="container auth-shell">
      <div className="auth-panel">
        <span className="eyebrow">BIENVENIDO DE NUEVO</span>
        <h1>Tu cuenta, a un clic.</h1>
        <p className="auth-description">Inicia sesión para gestionar tus compras y consultar tus pedidos.</p>
        <Suspense fallback={<p className="auth-small">Preparando el formulario…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
