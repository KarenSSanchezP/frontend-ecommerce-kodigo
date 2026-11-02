import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatUSD, getProduct } from '@/lib/products';

type Props = { params: Promise<{ id: string }> };

function DetailSkeleton() {
  return (
    <div className="container inner-page">
      <div className="skeleton-art detail-skeleton" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  );
}

async function ProductDetails({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) notFound();

  const visual: Record<string, string> = {
    'TEC-001': '🖱️',
    'TEC-002': '⌨️',
    'TEC-003': '🎧',
    'TEC-004': '🔌',
    'TEC-005': '💻',
  };

  return (
    <main className="container inner-page">
      <Link href="/catalogo" className="back-link">
        ← Volver al catálogo
      </Link>
      <div className="detail-grid">
        <div className="detail-art">
          <span className="detail-art-number">{product.sku}</span>
          <span className="detail-emoji" aria-hidden="true">
            {visual[product.sku] ?? '📦'}
          </span>
          <span className="detail-art-bottom">PARA TU DÍA A DÍA ↗</span>
        </div>
        <div className="detail-content">
          <span className="eyebrow">TECNOLOGÍA / ACCESORIOS</span>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          <div className="detail-price">{formatUSD(product.price_cents)}</div>
          <div className="detail-stock">
            <span className={product.stock > 0 ? 'stock-dot' : 'stock-dot empty'} />
            {product.stock > 0
              ? `${product.stock} unidades disponibles`
              : 'Actualmente agotado'}
          </div>
          <div className="next-stage-message">
            <strong>Complementa tu espacio</strong>
            <p>
              ¿Buscas algo más? Descubre otros accesorios para acompañar
              tu rutina de trabajo, estudio o entretenimiento.
            </p>
            <Link href="/catalogo" className="back-link">
              Seguir explorando ↗
            </Link>
          </div>
          <p className="detail-disclaimer">
            Precio en USD · Referencia: {product.sku} · Disponibilidad sujeta a cambios
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ProductDetails params={params} />
    </Suspense>
  );
}
