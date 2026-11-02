'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-store';

export function CartNav() {
  const { count, ready } = useCart();
  return (
    <Link href="/carrito" className="nav-cart" aria-label={`Ver carrito${ready && count ? `, ${count} artículos` : ''}`}>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.5 13.5a2 2 0 0 0 2 1.5H19a2 2 0 0 0 2-1.6L23 6H6" />
      </svg>
      <span>Carrito</span>
      {ready && count > 0 ? <span className="cart-count" aria-hidden="true">{count > 99 ? '99+' : count}</span> : null}
    </Link>
  );
}
