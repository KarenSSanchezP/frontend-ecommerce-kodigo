'use client';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container error-page" role="alert">
      <span className="eyebrow">OCURRIÓ UN INCONVENIENTE</span>
      <h1>No pudimos cargar esta sección.</h1>
      <p>
        Estamos teniendo dificultades para mostrar los productos en este momento.
        Intenta nuevamente en unos instantes.
      </p>
      <button className="btn-primary" type="button" onClick={() => reset()}>
        Volver a intentar ↗
      </button>
    </main>
  );
}
