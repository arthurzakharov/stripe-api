import { paymentIntents } from '@utils/stripe';
import { inCent } from '@utils/money';
import { type PaymentIntentType } from '@utils/types';

// Create new PaymentIntent in EUR only.
const create = async (paymentIntent: PaymentIntentType) => {
  try {
    return await paymentIntents
      .create({
        amount: inCent(paymentIntent.amount),
        currency: 'eur',
        customer: paymentIntent.customerId,
        receipt_email: paymentIntent.customerEmail,
        payment_method_types: paymentIntent.paymentMethodTypes,
        description: paymentIntent.clientReferenceId,
        metadata: {
          product_id: paymentIntent.productId,
          client_reference_id: paymentIntent.clientReferenceId,
        },
      })
      .then((newPaymentIntent) => {
        console.log(`Create new PaymentIntent ${newPaymentIntent.id} - ${paymentIntent.amount} EUR`);
        return newPaymentIntent;
      });
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

// Find PaymentIntent by id and update its payment_method_types.
const updatePaymentMethodTypes = async (id: string, paymentMethodTypes: string[]) => {
  try {
    return await paymentIntents
      .update(id, {
        payment_method_types: paymentMethodTypes,
      })
      .then((paymentIntent) => {
        console.log(`Update PaymentIntent ${paymentIntent.id} payment_method_types to [${paymentMethodTypes}]`);
        return paymentIntent;
      });
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

// Get PaymentIntent by its id or null
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
