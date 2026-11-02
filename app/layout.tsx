import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'KODIGO Store | Accesorios tecnológicos',
  description:
    'Descubre accesorios para tu escritorio y tus actividades diarias. Explora productos, precios y disponibilidad en KODIGO Store.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <div className="container nav-wrap">
            <Link className="brand" href="/" aria-label="Ir al inicio de KODIGO Store">
              <span className="brand-mark">
                K<span>✳</span>
              </span>
              <span>
                KODIGO<span className="brand-light">STORE</span>
              </span>
            </Link>
            <nav aria-label="Navegación principal">
              <Link href="/">Inicio</Link>
              <Link href="/catalogo">Catálogo</Link>
            </nav>
            <span className="demo-label">ACCESORIOS TECNOLÓGICOS</span>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="container footer-inner">
            <Link className="brand footer-brand" href="/">
              KODIGO<span className="brand-light">STORE</span>
            </Link>
            <span>TECNOLOGÍA PARA TU DÍA A DÍA</span>
            <span>© 2026 KODIGO Store</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
