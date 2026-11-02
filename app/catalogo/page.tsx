import { Suspense } from 'react';
import { CatalogSkeleton, ProductCatalog } from '@/components/product-catalog';

export default function CatalogPage() {
  return (
    <main className="container inner-page">
      <span className="eyebrow">KODIGO STORE / CATÁLOGO</span>
      <h1 className="page-title">
        Encuentra tu <i>favorito.</i>
      </h1>
      <p className="page-intro">
        Explora nuestra selección de accesorios tecnológicos y encuentra
        lo que necesitas para tu espacio.
      </p>
      <Suspense fallback={<CatalogSkeleton />}>
        <ProductCatalog />
      </Suspense>
    </main>
  );
}
