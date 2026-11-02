'use client';

export default function OrdersError({ reset }: { error: Error; reset: () => void }) {
  return <main className="container error-page"><h1>No pudimos cargar tus pedidos</h1><p>Intenta nuevamente. Si el problema continúa, comprueba tu conexión.</p><button className="btn-primary" onClick={reset}>Volver a intentar</button></main>;
}
