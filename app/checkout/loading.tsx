export default function CheckoutLoading() {
  return (
    <main className="container inner-page" role="status" aria-busy="true">
      <span className="eyebrow">TU COMPRA</span>
      <div className="skeleton-line" style={{ maxWidth: 360, height: 36 }} />
      <div className="skeleton-art" style={{ maxWidth: 900, height: 280, marginTop: 36 }} />
    </main>
  );
}
