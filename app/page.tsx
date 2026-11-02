import Link from 'next/link';
import { Suspense } from 'react';
import { CatalogSkeleton, ProductCatalog } from '@/components/product-catalog';

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-wrap">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow">ACCESORIOS PARA TU ESPACIO</span>
            <h1>
              Tu espacio.
              <br />
              <span className="hero-gradient-text">Tu siguiente</span>
              <br />
              gran idea.
            </h1>
            <p>
              Tecnología para trabajar, estudiar y crear a tu manera.
              Encuentra los accesorios que mejor se adaptan a tu día.
            </p>
            <Link href="#catalogo" className="btn-primary">
              Explorar productos <span aria-hidden="true">↗</span>
            </Link>
            <span className="hero-note">TU SETUP, A TU MANERA</span>
          </div>
          <div className="hero-graphic" aria-hidden="true">
            <div className="orbit orbit-outer" />
            <div className="orbit orbit-inner" />
            <div className="hero-star hero-star-one">✳</div>
            <div className="hero-star hero-star-two">✧</div>
            <div className="hero-graphic-box">
              <span className="hero-graphic-icon">⌨️</span>
              <span className="graphic-caption">TU ESPACIO CREATIVO</span>
            </div>
            <span className="hero-pill">HECHO PARA TU DÍA ↗</span>
          </div>
        </div>
      </section>

      <div className="benefits">
        <div className="container benefits-inner">
          <span>✦ ACCESORIOS PARA TU SETUP</span>
          <span>✦ TECNOLOGÍA COTIDIANA</span>
          <span>✦ PRECIOS EN USD</span>
        </div>
      </div>

      <section id="catalogo" className="container catalog-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DESCUBRE LA COLECCIÓN</span>
            <h2>
              Eleva tu <i>setup.</i>
            </h2>
            <p>
              Descubre accesorios prácticos para tu escritorio, tus clases
              y tus momentos de inspiración.
            </p>
          </div>
        </div>
        <Suspense fallback={<CatalogSkeleton />}>
          <ProductCatalog />
        </Suspense>
      </section>

      <section className="container final-note">
        <span className="note-star" aria-hidden="true">✳</span>
        <div>
          <span className="eyebrow">UN ESPACIO QUE VA CONTIGO</span>
          <h2>
            Pequeños detalles.
            <br />
            Grandes ideas.
          </h2>
          <p>
            Desde un mouse cómodo hasta unos audífonos inalámbricos,
            encuentra accesorios que acompañen tu rutina y hagan tu espacio más tuyo.
          </p>
          <Link href="/catalogo" className="back-link">
            Ver todos los productos ↗
          </Link>
        </div>
      </section>
    </>
  );
}
