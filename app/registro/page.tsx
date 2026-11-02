import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from '@/components/register-form';

export const metadata: Metadata = { title: 'Crear cuenta | KODIGO Store' };

export default function RegisterPage() {
  return (
    <main className="container auth-shell">
      <div className="auth-panel">
        <span className="eyebrow">ÚNETE A KODIGO STORE</span>
        <h1>Empieza por aquí.</h1>
        <p className="auth-description">Crea una cuenta para comprar tus accesorios favoritos y consultar tus pedidos.</p>
        <Suspense fallback={<p className="auth-small">Preparando el formulario…</p>}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}
