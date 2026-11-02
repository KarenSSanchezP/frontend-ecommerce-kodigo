import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatUSD } from '@/lib/products';
import { AddToCartButton } from '@/components/add-to-cart-button';

const art: Record<string, { icon: string; tone: string }> = {
  'TEC-001': { icon: '🖱️', tone: 'tone-lavender' },
  'TEC-002': { icon: '⌨️', tone: 'tone-blue' },
  'TEC-003': { icon: '🎧', tone: 'tone-peach' },
  'TEC-004': { icon: '🔌', tone: 'tone-mint' },
  'TEC-005': { icon: '💻', tone: 'tone-sand' },
};

export function ProductCard({ product }: { product: Product }) {
  const visual = art[product.sku] ?? { icon: '📦', tone: 'tone-lavender' };
  return (
    <article className="product-card">
      <Link href={`/productos/${product.id}`} className={`product-art ${visual.tone}`} aria-label={`Ver ${product.name}`}>
        <span className="product-visual-ornament" aria-hidden="true">N° {String(product.id).padStart(2, '0')}</span>
        <span className="product-emoji" aria-hidden="true">{visual.icon}</span>
        <span className="product-visual-label">TECNOLOGÍA DIARIA</span>
      </Link>
      <div className="product-content">
        <span className="eyebrow tiny">{product.sku} · {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}</span>
        <Link href={`/productos/${product.id}`} className="product-name">{product.name}</Link>
        <p className="product-description">{product.description || 'Un accesorio para tu espacio de trabajo.'}</p>
        <div className="product-bottom"><strong>{formatUSD(product.price_cents)}</strong><Link href={`/productos/${product.id}`} className="card-arrow" aria-label={`Ver detalle de ${product.name}`}>↗</Link></div>
        <AddToCartButton product={product} compact />
      </div>
    </article>
  );
}
