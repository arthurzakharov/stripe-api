const { paymentIntents } = require('#stripe-util');
const { get } = require('lodash');
const { inCent } = require('#money-util');

/**
 * Create new PaymentIntent in EUR only.
 * @param {Object} payload - data to create PaymentIntent.
 * @param {number} payload.amount - price in EUR not in cents.
 * @param {string} payload.customerId - customer id to associate with PaymentIntent.
 * @param {string} payload.customerEmail - customer email to associate with PaymentIntent.
 * @param {('card'|'klarna'|'paypal')[]} payload.paymentMethodTypes - payment method types.
 * @param {string} payload.clientReferenceId - clientReferenceId.
 * @param {string} payload.productId - productId.
 * @returns {Promise<Stripe.PaymentIntent>}
 */
const create = async (payload) => {
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
 * TODO: Method is not currently used
 * Get PaymentIntent by its id or null
 * @param {string} id - PaymentIntent id
 * @returns {Promise<Stripe.PaymentIntent|null>}
 */
const findByPaymentIntentId = async (id) => {
  try {
    return await paymentIntents.retrieve(id);
  } catch (e) {
    return null;
  }
};

module.exports = {
  create,
  findByPaymentIntentId,
};
