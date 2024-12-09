import { SECRET_KEY } from './env';
import Stripe from 'stripe';

const stripe = new Stripe(SECRET_KEY);

export const paymentIntents = stripe.paymentIntents;

export const customers = stripe.customers;
