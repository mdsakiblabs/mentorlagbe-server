import Stripe from "stripe";

let stripe;

export const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY.");
  }

  if (!stripe) {
    stripe = new Stripe(secretKey);
  }

  return stripe;
};
