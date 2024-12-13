import { type Request, type Response } from 'express';
import { type Stripe } from 'stripe';

type ErrorMessage = {
  message: string;
  error: string;
};

export type CustomerType = {
  clientReferenceId: string;
  name: string;
  email: string;
  phone: string;
  address: {
    city: string;
    country: string;
    line1: string;
    line2: string;
    postalCode: string;
    state: string;
  };
};

export type PaymentIntentType = {
  amount: number;
  customerId: string;
  customerEmail: string;
  paymentMethodTypes: string[];
  clientReferenceId: string;
  productId: string;
};

// PAYMENTS GET

type GetPaymentResponseBody = Stripe.PaymentIntent | ErrorMessage;

export type GetPaymentResponse = Response<GetPaymentResponseBody>;

type GetPaymentsQuery = {
  id: string;
  amount: string;
};

export type GetPaymentsRequest = Request<void, GetPaymentResponseBody, void, GetPaymentsQuery>;

// PAYMENTS POST

type PostPaymentResponseBody = Stripe.PaymentIntent | ErrorMessage;

export type PostPaymentResponse = Response<PostPaymentResponseBody>;

type PostPaymentsData = {
  payment: {
    amount: number;
    productId: string;
    paymentMethodTypes: string[];
  };
  customer: CustomerType;
};

export type PostPaymentsRequest = Request<void, PostPaymentResponseBody, PostPaymentsData>;

type PatchPaymentsData = {
  id: string;
  types: string[];
};

// PAYMENTS PATCH

type PatchPaymentsResponseBody = Stripe.PaymentIntent | ErrorMessage;

export type PatchPaymentsResponse = Response<PatchPaymentsResponseBody>;

export type PatchPaymentsRequest = Request<void, PatchPaymentsResponseBody, PatchPaymentsData>;
