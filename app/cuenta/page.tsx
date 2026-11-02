import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { logoutAction } from '@/app/actions/auth';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Mi cuenta | KODIGO Store' };

async function AccountDetails() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="auth-panel account-panel">
      <span className="eyebrow">MI CUENTA</span>
      <h1>¡Hola, {user.name}!</h1>
      <p className="auth-description">Aquí encontrarás la información de tu cuenta.</p>
      <dl className="account-info">
        <div><dt>Nombre</dt><dd>{user.name}</dd></div>
        <div><dt>Correo electrónico</dt><dd>{user.email}</dd></div>
      </dl>
      <div className="account-actions">
        <Link href="/pedidos" className="btn-primary">Mis pedidos →</Link>
        <Link href="/catalogo" className="btn-secondary">Explorar productos</Link>
        <form action={logoutAction}>
          <button type="submit" className="btn-secondary">Cerrar sesión</button>
        </form>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <main className="container auth-shell">
      <Suspense fallback={<p className="auth-description">Cargando tu cuenta…</p>}>
        <AccountDetails />
      </Suspense>
    </main>
  );
}
