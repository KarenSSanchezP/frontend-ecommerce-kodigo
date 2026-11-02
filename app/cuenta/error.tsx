'use client';

export default function AccountError({ reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container error-page" role="alert">
      <h1>No pudimos mostrar tu cuenta.</h1>
      <p>Comprueba tu conexión e inténtalo de nuevo.</p>
      <button className="btn-primary" type="button" onClick={() => reset()}>
        Reintentar
      </button>
    </main>
  );
}
