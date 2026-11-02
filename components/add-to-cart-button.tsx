'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-store';

export function AddToCartButton({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { ready, add } = useCart();
  const [feedback, setFeedback] = useState('');
  const outOfStock = !product.is_active || product.stock < 1;

  function handleClick() {
    const added = add(product);
    setFeedback(added ? 'Añadido al carrito' : 'Ya tienes el máximo disponible de este producto');
  }

  return (
    <div className={compact ? 'add-to-cart-wrap compact' : 'add-to-cart-wrap'}>
      <button
        type="button"
        className={compact ? 'add-to-cart-compact' : 'btn-primary add-to-cart-main'}
        onClick={handleClick}
        disabled={!ready || outOfStock}
        aria-label={`Agregar ${product.name} al carrito`}
      >
        {outOfStock ? 'Agotado' : compact ? '+ Agregar al carrito' : 'Agregar al carrito'}
      </button>
      <span className="cart-feedback" role="status" aria-live="polite">{feedback}</span>
    </div>
  );
}
