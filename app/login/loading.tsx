export default function LoadingLogin() {
  return (
    <main className="container auth-shell">
      <div className="auth-panel" role="status" aria-live="polite">
        <span className="eyebrow">TU CUENTA</span>
        <h1>Iniciar sesión</h1>
        <p className="auth-description">
          Preparando el acceso a tu cuenta…
        </p>
      </div>
    </main>
  );
}
