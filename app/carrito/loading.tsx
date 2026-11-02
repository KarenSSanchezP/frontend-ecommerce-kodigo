export default function CartLoading() {
  return (
    <main className="container inner-page cart-page" role="status" aria-busy="true">
      <span className="eyebrow">TU CARRITO</span>
      <div className="skeleton-line" style={{ maxWidth: 340, height: 35 }} />
      <div className="skeleton-art" style={{ maxWidth: 850, height: 260, marginTop: 35 }} />
    </main>
  );
}
