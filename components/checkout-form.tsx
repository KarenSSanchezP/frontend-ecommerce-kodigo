'use client';

import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrderAction, type CreateOrderState } from '@/app/actions/orders';
import { useCart } from '@/lib/cart-store';
import { formatUSD } from '@/lib/currency';

const initialState: CreateOrderState = { error: '', orderId: null };

export function CheckoutForm({ customerName }: { customerName: string }) {
  const { ready, items, count, totalCents, clear } = useCart();
  const [state, action, pending] = useActionState(createOrderAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.orderId !== null) {
      clear();
      router.replace(`/pedidos/${state.orderId}?creado=1`);
    }
  }, [state.orderId, clear, router]);

  if (!ready) return <div className="cart-empty" role="status">Preparando tu pedido…</div>;
  if (!items.length && state.orderId === null) return (
    <div className="cart-empty">
      <h2>Tu carrito está vacío</h2>
      <p>Agrega tus accesorios favoritos para continuar.</p>
      <Link href="/catalogo" className="btn-primary">Ir al catálogo ↗</Link>
    </div>
  );

  return (
    <div className="cart-layout">
      <section className="cart-items checkout-items">
        <div className="cart-section-head"><h2>Resumen del pedido</h2></div>
        <p className="checkout-greeting">Compra a nombre de <strong>{customerName}</strong>.</p>
        {items.map((item) => (
          <div className="checkout-line" key={item.id}>
            <div><strong>{item.name}</strong><small>{item.quantity} × {formatUSD(item.price_cents)}</small></div>
            <strong>{formatUSD(item.quantity * item.price_cents)}</strong>
          </div>
        ))}
        <Link href="/carrito" className="back-link checkout-back">← Editar carrito</Link>
      </section>
      <aside className="cart-summary">
        <span className="eyebrow">CONFIRMACIÓN</span>
        <h2>Tu pedido</h2>
        <div className="cart-summary-line"><span>Artículos</span><strong>{count}</strong></div>
        <div className="cart-summary-total"><span>Subtotal estimado</span><strong>{formatUSD(totalCents)}</strong></div>
        <p>Al confirmar, se comprobarán los precios y las existencias actuales y se reservarán tus artículos. Todavía no se realizará ningún cobro.</p>
        <form action={action}>
          <input type="hidden" name="items" value={JSON.stringify(items.map((item) => ({ product_id: item.id, quantity: item.quantity })))} />
          {state.error && <p role="alert" className="auth-error">{state.error} <Link href="/pedidos">Ver mis pedidos</Link></p>}
          <button className="btn-primary checkout-submit" type="submit" disabled={pending || state.orderId !== null}>
            {pending || state.orderId !== null ? 'Procesando pedido…' : 'Confirmar pedido →'}
          </button>
        </form>
        <p className="checkout-small-print">El total definitivo se calculará en la tienda al crear tu pedido. Podrás consultar su estado y cancelarlo si el pago aún no ha comenzado.</p>
      </aside>
    </div>
  );
}
