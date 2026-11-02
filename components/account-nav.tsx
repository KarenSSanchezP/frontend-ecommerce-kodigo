import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export function AccountNavFallback() {
  return <Link href="/login">Mi cuenta</Link>;
}

export async function AccountNav() {
  const user = await getCurrentUser();
  if (user) {
    return <Link href="/cuenta" className="nav-account-link">Mi cuenta</Link>;
  }
  return (
    <>
      <Link href="/login">Ingresar</Link>
      <Link className="nav-signup" href="/registro">Crear cuenta</Link>
    </>
  );
}
