import Stripe from 'stripe';
import { SECRET_KEY } from '@utils/env';

const stripe = new Stripe(SECRET_KEY);

export const paymentIntents = stripe.paymentIntents;

export const customers = stripe.customers;
