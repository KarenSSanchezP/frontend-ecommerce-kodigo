'use client';

import { useActionState, useEffect } from 'react';
import { startStripeCheckoutAction, type StartPaymentState } from '@/app/actions/orders';

const initialState: StartPaymentState = { error: '', checkoutUrl: null };

export function StripeCheckoutButton({ orderId }: { orderId: number }) {
  const [state, action, pending] = useActionState(startStripeCheckoutAction, initialState);

  useEffect(() => {
    if (state.checkoutUrl) window.location.assign(state.checkoutUrl);
  }, [state.checkoutUrl]);

  return (
    <form action={action} className="stripe-checkout-form">
      <input type="hidden" name="order_id" value={orderId} />
      {state.error && <p className="auth-error" role="alert">{state.error}</p>}
      <button type="submit" className="btn-primary stripe-payment-button" disabled={pending || !!state.checkoutUrl}>
        {pending || state.checkoutUrl ? 'Abriendo pago seguro…' : 'Pagar con tarjeta →'}
      </button>
      <p className="stripe-checkout-disclaimer">Completarás el pago en la página segura de Stripe.</p>
    </form>
  );
}
