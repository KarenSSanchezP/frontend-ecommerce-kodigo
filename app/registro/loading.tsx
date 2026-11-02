export default function LoadingRegistro() {
  return (
    <main className="container auth-shell">
      <div className="auth-panel" role="status" aria-live="polite">
        <span className="eyebrow">BIENVENIDO</span>
        <h1>Crea tu cuenta</h1>
        <p className="auth-description">
          Preparando el formulario de registro…
        </p>
      </div>
    </main>
  );
}
