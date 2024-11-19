const { CREATED, OK, BAD_REQUEST } = require('http-status-codes');
const { get } = require('lodash');
const customerModel = require('#customer-model');
const paymentIntentModel = require('#payment-intent-model');

const create = async (req, res) => {
  const amount = get(req, 'body.payment.amount', 0);
  const paymentMethodTypes = get(req, 'body.payment.paymentMethodTypes', []);
  const productId = get(req, 'body.payment.productId', '');
  const clientReferenceId = get(req, 'body.customer.clientReferenceId', '');
  const name = get(req, 'body.customer.name', '');
  const email = get(req, 'body.customer.email', '');
  const phone = get(req, 'body.customer.phone', '');
  const city = get(req, 'body.customer.address.city', '');
  const country = get(req, 'body.customer.address.country', '');
  const line1 = get(req, 'body.customer.address.line1', '');
  const line2 = get(req, 'body.customer.address.line2', '');
  const postalCode = get(req, 'body.customer.address.postalCode', '');
  const state = get(req, 'body.customer.address.state', '');
  try {
    const customer = await customerModel.createOrReuse({
      clientReferenceId,
      name,
      email,
      phone,
      address: {
        city,
        country,
        line1,
        line2,
        postalCode,
        state,
      },
    });
    const paymentIntent = await paymentIntentModel.create({
      amount,
      customerId: get(customer, 'id', ''),
      customerEmail: get(customer, 'email', ''),
      paymentMethodTypes,
      clientReferenceId: get(customer, 'description', ''),
      productId,
    });
    res.status(CREATED).json(paymentIntent);
  } catch (e) {
    res.status(BAD_REQUEST).json({
      message: 'Failed to create PaymentIntent',
      error: get(e, 'message', ''),
    });
  }
};

const updateMethodTypes = async (req, res) => {
  const id = get(req, 'body.id', '');
  const paymentMethodTypes = get(req, 'body.paymentMethodTypes', []);
  try {
    const paymentIntent = await paymentIntentModel.updatePaymentMethodTypes(id, paymentMethodTypes);
    res.status(OK).json(paymentIntent);
  } catch (e) {
    res.status(BAD_REQUEST).json({
      message: "Failed to update PaymentIntent' payment_method_types",
      error: get(e, 'message', ''),
    });
  }
};

module.exports = {
  create,
  updateMethodTypes,
};
