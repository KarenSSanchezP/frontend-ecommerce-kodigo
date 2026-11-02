'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-store';
import { formatUSD } from '@/lib/currency';

const visuals: Record<string, string> = {
  'TEC-001': '🖱️',
  'TEC-002': '⌨️',
  'TEC-003': '🎧',
  'TEC-004': '🔌',
  'TEC-005': '💻',
};

export default function CartPage() {
  const { ready, items, count, totalCents, updateQuantity, remove, clear } = useCart();

  return (
    <main className="container inner-page cart-page">
      <span className="eyebrow">KODIGO STORE / TU CARRITO</span>
      <h1 className="page-title">Tu selección, <i>a tu manera.</i></h1>
      {!ready ? (
        <div className="cart-empty" role="status">Preparando tu carrito…</div>
      ) : items.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon" aria-hidden="true">🛍️</div>
          <h2>Tu carrito está vacío</h2>
          <p>Explora nuestros accesorios y encuentra algo que te guste.</p>
          <Link href="/catalogo" className="btn-primary">Explorar productos ↗</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Artículos en tu carrito">
            <div className="cart-section-head">
              <h2>Mis artículos <span>({count})</span></h2>
              <button type="button" className="cart-clear" onClick={clear}>Vaciar carrito</button>
            </div>
            {items.map((item) => (
              <article className="cart-row" key={item.id}>
                <Link href={`/productos/${item.id}`} className="cart-item-art" aria-label={`Ver ${item.name}`}>
                  <span aria-hidden="true">{visuals[item.sku] ?? '📦'}</span>
                </Link>
                <div className="cart-item-info">
                  <span className="eyebrow tiny">{item.sku}</span>
                  <Link href={`/productos/${item.id}`} className="cart-item-name">{item.name}</Link>
                  <span className="cart-item-price">{formatUSD(item.price_cents)} por unidad</span>
                  <div className="cart-item-actions">
                    <div className="quantity-control" aria-label={`Cantidad de ${item.name}`}>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Restar una unidad de ${item.name}`}>−</button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label={`Agregar una unidad de ${item.name}`}>+</button>
                    </div>
                    <button type="button" className="cart-remove" onClick={() => remove(item.id)}>Quitar</button>
                  </div>
                  <span className="cart-stock">Máximo disponible: {item.stock}</span>
                </div>
                <strong className="cart-line-price">{formatUSD(item.price_cents * item.quantity)}</strong>
              </article>
            ))}
            <Link href="/catalogo" className="back-link cart-back">← Seguir comprando</Link>
          </section>
          <aside className="cart-summary" aria-label="Resumen del carrito">
            <span className="eyebrow">RESUMEN</span>
            <h2>Tu carrito</h2>
            <div className="cart-summary-line"><span>Artículos</span><strong>{count}</strong></div>
            <div className="cart-summary-total"><span>Subtotal</span><strong>{formatUSD(totalCents)}</strong></div>
            <p>Los precios y las existencias se confirmarán antes de realizar el pedido.</p>
            <Link href="/checkout" className="btn-primary cart-summary-link checkout-button">Continuar con mi pedido →</Link>
          </aside>
        </div>
      )}
    </main>
  );
}
