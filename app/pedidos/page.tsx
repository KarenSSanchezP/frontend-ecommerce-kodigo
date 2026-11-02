import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getOrders, orderStatus } from '@/lib/orders';
import { formatUSD } from '@/lib/currency';

export const metadata: Metadata = { title: 'Mis pedidos | KODIGO Store' };

async function OrderHistory({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/pedidos');
  const { pagina } = await searchParams;
  const requested = pagina && /^\d{1,4}$/.test(pagina) ? Number(pagina) : 1;
  const page = await getOrders(requested >= 1 && requested <= 1000 ? requested : 1);
  return page.data.length === 0 ? (
    <div className="cart-empty"><h2>Aún no tienes pedidos</h2><p>Cuando confirmes tu primera compra, aparecerá aquí.</p><Link href="/catalogo" className="btn-primary">Explorar productos ↗</Link></div>
  ) : (
    <>
      <div className="order-list">
        {page.data.map((order) => (
          <article key={order.id} className="order-list-row">
            <div><span className="eyebrow">PEDIDO #{order.id}</span><h2>{orderStatus(order.status)}</h2><p>{order.items?.length ?? 0} productos diferentes · {order.created_at ? new Date(order.created_at).toLocaleDateString('es-SV') : ''}</p></div>
            <div className="order-list-end"><strong>{formatUSD(order.total_cents)}</strong><Link className="btn-secondary" href={`/pedidos/${order.id}`}>Ver detalle →</Link></div>
          </article>
        ))}
      </div>
      {page.last_page > 1 && <nav className="orders-pagination" aria-label="Páginas de pedidos">
        {page.current_page > 1 && <Link className="btn-secondary" href={`/pedidos?pagina=${page.current_page - 1}`}>← Anteriores</Link>}
        <span>Página {page.current_page} de {page.last_page}</span>
        {page.current_page < page.last_page && <Link className="btn-secondary" href={`/pedidos?pagina=${page.current_page + 1}`}>Siguientes →</Link>}
      </nav>}
    </>
  );
}

export default function OrdersPage({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  return (
    <main className="container inner-page orders-page">
      <span className="eyebrow">MI CUENTA</span>
      <h1 className="page-title">Mis <i>pedidos.</i></h1>
      <p className="page-intro">Consulta el estado de tus compras y revisa sus detalles.</p>
      <Suspense fallback={<div className="cart-empty" role="status">Buscando tus pedidos…</div>}>
        <OrderHistory searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
