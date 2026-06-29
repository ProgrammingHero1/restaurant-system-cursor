/**
 * Payment helpers for Stripe Checkout integration.
 */

export function isStripeEnabled(config) {
  return Boolean(config?.stripeEnabled);
}
