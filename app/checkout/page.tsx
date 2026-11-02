import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { CheckoutForm } from '@/components/checkout-form';

export const metadata: Metadata = { title: 'Confirmar pedido | KODIGO Store' };

async function CheckoutContent() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/checkout');
  return <CheckoutForm customerName={user.name} />;
}

export default function CheckoutPage() {
  return (
    <main className="container inner-page checkout-page">
      <span className="eyebrow">TU COMPRA</span>
      <h1 className="page-title">Confirma tu <i>pedido.</i></h1>
      <Suspense fallback={<div className="cart-empty" role="status">Preparando tu pedido…</div>}>
        <CheckoutContent />
      </Suspense>
    </main>
  );
}
