import Link from 'next/link';
export default function NotFound() { return <main className="container error-page"><span className="eyebrow">404 / PRODUCTO NO ENCONTRADO</span><h1>Esta página no existe.</h1><p>El producto pudo haberse eliminado o desactivado.</p><Link href="/catalogo" className="btn-primary">Volver al catálogo ↗</Link></main>;
}
