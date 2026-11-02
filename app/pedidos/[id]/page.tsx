import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getOrder, OrderApiError, orderStatus } from '@/lib/orders';
import { formatUSD } from '@/lib/currency';
import { CancelOrderButton } from '@/components/cancel-order-button';

export const metadata: Metadata = { title: 'Detalle del pedido | KODIGO Store' };
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ creado?: string }> };

async function OrderDetails({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/pedidos');
  const { id } = await params;
  if (!/^\d{1,12}$/.test(id)) notFound();
  let order;
  try { order = await getOrder(Number(id)); }
  catch (error) {
    if (error instanceof OrderApiError && error.status === 404) notFound();
    throw error;
  }
  const { creado } = await searchParams;
  const canCancel = order.status === 'pending' && !order.payment?.stripe_checkout_session_id;

  return (
    <div className="order-details">
      <Link href="/pedidos" className="back-link">← Volver a mis pedidos</Link>
      {creado === '1' && <div role="status" className="auth-success order-notice">Tu pedido se creó correctamente. Los artículos están reservados, pero el pago sigue pendiente.</div>}
      <div className="order-details-head">
        <div><span className="eyebrow">PEDIDO #{order.id}</span><h2>{orderStatus(order.status)}</h2><p>Consulta el resumen de tu compra.</p></div>
        <strong>{formatUSD(order.total_cents)}</strong>
      </div>
      <section className="order-detail-list" aria-label="Artículos de tu pedido">
        {order.items.map((item) => <div className="checkout-line" key={item.id}>
          <div><strong>{item.name_snapshot}</strong><small>{item.quantity} × {formatUSD(item.unit_price_cents)}</small></div>
          <strong>{formatUSD(item.subtotal_cents)}</strong>
        </div>)}
      </section>
      <div className="order-total"><span>Total del pedido</span><strong>{formatUSD(order.total_cents)}</strong></div>
      {order.status === 'pending' && <div className="order-payment-note">
        <h3>Pago pendiente</h3>
        <p>Tu pedido está registrado, pero todavía no está pagado. Puedes cancelarlo antes de iniciar el pago para liberar las existencias reservadas.</p>
        {canCancel ? <CancelOrderButton orderId={order.id} /> : <p>El proceso de pago ya se ha iniciado. Consulta el estado más reciente de este pedido antes de realizar otra acción.</p>}
      </div>}
      {order.status === 'paid' && <p className="auth-success">Tu pago fue confirmado.</p>}
      {order.status === 'cancelled' && <p className="order-hint">Este pedido fue cancelado.</p>}
      <Link href="/catalogo" className="back-link">Seguir explorando ↗</Link>
    </div>
  );
}

export default function OrderDetailPage(props: Props) {
  return <main className="container inner-page orders-page">
    <h1 className="page-title">Detalle de <i>pedido.</i></h1>
    <Suspense fallback={<div className="cart-empty" role="status">Cargando el pedido…</div>}><OrderDetails {...props} /></Suspense>
  </main>;
}
