import { paymentIntents } from '../utils/stripe';
import { get, defaultTo } from 'lodash';
import { inCent } from '../utils/money';

// Create new PaymentIntent in EUR only.
type CreatePaymentIntentPayload = {
  amount: number;
  customerId: string;
  customerEmail: string;
  paymentMethodTypes: string[];
  clientReferenceId: string;
  productId: string;
};
const create = async (payload: CreatePaymentIntentPayload) => {
  try {
    return await paymentIntents
      .create({
        amount: inCent(get(payload, 'amount', 0)),
        currency: 'eur',
        customer: get(payload, 'customerId', ''),
        receipt_email: get(payload, 'customerEmail', ''),
        payment_method_types: get(payload, 'paymentMethodTypes', []),
        description: get(payload, 'clientReferenceId', ''),
        metadata: {
          product_id: get(payload, 'productId', ''),
          client_reference_id: get(payload, 'clientReferenceId', ''),
        },
      })
      .then((paymentIntent) => {
        console.log(`Create new PaymentIntent ${paymentIntent.id} - ${get(payload, 'amount', 0)} EUR`);
        return paymentIntent;
      });
  } catch (e) {
    throw new Error(get(e, 'message', ''));
  }
};

/**
 * Find PaymentIntent by id and update its payment_method_types.
 * @param {string} id - PaymentIntent id.
 * @param paymentMethodTypes - PaymentIntent payment method types.
 * @returns {Promise<Stripe.PaymentIntent>}
 */
const updatePaymentMethodTypes = async (id: string, paymentMethodTypes: string[]) => {
  try {
    return await paymentIntents
      .update(id, {
        payment_method_types: defaultTo(paymentMethodTypes, ['cards']),
      })
      .then((paymentIntent) => {
        console.log(`Update PaymentIntent ${paymentIntent.id} payment_method_types to [${paymentMethodTypes}]`);
        return paymentIntent;
      });
  } catch (e) {
    throw new Error(get(e, 'message', ''));
  }
};

/**
 * Get PaymentIntent by its id or null
 * @param {string} id - PaymentIntent id
 * @returns {Promise<Stripe.PaymentIntent|null>}
 */
const findByPaymentIntentId = async (id: string) => {
  try {
    return await paymentIntents.retrieve(id);
  } catch (e) {
    return null;
  }
};

export default {
  create,
  updatePaymentMethodTypes,
  findByPaymentIntentId,
};
