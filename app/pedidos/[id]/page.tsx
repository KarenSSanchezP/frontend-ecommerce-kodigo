import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getOrder, OrderApiError, orderStatus } from '@/lib/orders';
import { formatUSD } from '@/lib/currency';
import { CancelOrderButton } from '@/components/cancel-order-button';
import { StripeCheckoutButton } from '@/components/stripe-checkout-button';

export const metadata: Metadata = { title: 'Detalle del pedido | KODIGO Store' };
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ creado?: string; stripe?: string }> };

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
  const { creado, stripe } = await searchParams;
  const canCancel = order.status === 'pending' && !order.payment?.stripe_checkout_session_id;

  return (
    <div className="order-details">
      <Link href="/pedidos" className="back-link">← Volver a mis pedidos</Link>
      {creado === '1' && <div role="status" className="auth-success order-notice">Tu pedido se creó correctamente. Los artículos están reservados, pero el pago sigue pendiente.</div>}
      {stripe === 'success' && order.status === 'paid' && <p role="status" className="auth-success order-notice">Pago confirmado. ¡Gracias por tu compra!</p>}
      {stripe === 'success' && order.status === 'pending' && <div role="status" className="order-payment-note order-notice"><strong>Estamos verificando tu pago.</strong><p>Tu pedido sigue pendiente mientras se recibe la confirmación. Actualiza esta página dentro de unos momentos para consultar el estado.</p></div>}
      {stripe === 'cancel' && order.status === 'pending' && <div role="status" className="order-payment-note order-notice"><strong>No completaste el pago.</strong><p>Tu pedido sigue pendiente. Puedes regresar a la página de pago mientras la sesión esté disponible.</p></div>}
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
        <p>Tu pedido está registrado, pero todavía no está pagado. Puedes completar el pago con tarjeta de manera segura.</p>
        <StripeCheckoutButton orderId={order.id} />
        {canCancel ? <CancelOrderButton orderId={order.id} /> : <p>Si ya abriste la página de pago, no es posible cancelar desde aquí. Si la sesión vence sin completarse, el estado se actualizará al recibir la notificación de Stripe.</p>}
      </div>}
      {order.status === 'paid' && <p className="auth-success">Tu pago fue confirmado.</p>}
      {order.status === 'cancelled' && <p className="order-hint">Este pedido fue cancelado.</p>}
      {order.status === 'expired' && <p className="order-hint">El tiempo para completar el pago terminó. Puedes crear otro pedido si aún deseas estos productos.</p>}
      {order.status === 'payment_failed' && <p className="order-hint">El pago no pudo completarse. Puedes crear otro pedido.</p>}
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
