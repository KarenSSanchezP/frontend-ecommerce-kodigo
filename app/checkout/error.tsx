'use client';

import Link from 'next/link';

export default function CheckoutError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container error-page">
      <h1>No pudimos preparar tu pedido</h1>
      <p>Comprueba tu conexión y vuelve a intentarlo. Tu carrito no se ha eliminado.</p>
      <button className="btn-primary" onClick={reset}>Volver a intentar</button>
      <p><Link href="/carrito" className="back-link">Volver al carrito</Link></p>
    </main>
  );
}
