import { type Request } from 'express';

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

type GetPaymentsQuery = {
  id: string;
  amount: string;
};

export type GetPaymentsRequest = Request<void, void, void, GetPaymentsQuery>;

type PostPaymentsData = {
  payment: {
    amount: number;
    productId: string;
    paymentMethodTypes: string[];
  };
  customer: CustomerType;
};

export type PostPaymentsRequest = Request<void, void, PostPaymentsData>;

type PatchPaymentsData = {
  id: string;
  types: string[];
};

export type PatchPaymentsRequest = Request<void, void, PatchPaymentsData>;
