import { getProducts } from '@/lib/products';
import { ProductCard } from '@/components/product-card';

export function CatalogSkeleton() {
  return <div className="product-grid" aria-label="Cargando catálogo" aria-busy="true">{Array.from({length:5}, (_,i) => <div key={i} className="skeleton-product"><div className="skeleton-art"/><div className="skeleton-line"/><div className="skeleton-line short"/></div>)}</div>;
}

export async function ProductCatalog() {
  const page = await getProducts();
  return <>
    <div className="catalog-head"><span className="eyebrow">COLECCIÓN ACTUAL</span><span className="result-count">{page.total} productos</span></div>
    {page.data.length > 0 ? <div className="product-grid">{page.data.map(product => <ProductCard key={product.id} product={product}/>)}</div> : <p className="empty-message">Por ahora no hay productos activos.</p>}
  </>;
}
