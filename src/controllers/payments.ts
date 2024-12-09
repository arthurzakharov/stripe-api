import { type Request, type Response } from 'express';
import { CREATED, OK, BAD_REQUEST, NO_CONTENT } from 'http-status-codes';
import { defaultTo, get } from 'lodash';
import customerModel, { type CreateCustomerPayload } from '../models/customer';
import paymentIntentModel from '../models/payment-intent';
import { inCent, inEuro } from '../utils/money';

// Create new PaymentIntent and Customer. If customer with such clientReferenceId already exists reuse it to create new PaymentIntent
type CreatePaymentIntent = {
  payment: {
    amount: number;
    paymentMethodTypes: string[];
  };
  customer: CreateCustomerPayload;
};
const create = async (req: Request<void, void, CreatePaymentIntent>, res: Response) => {
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
      customerEmail: defaultTo(customer.email, ''),
      paymentMethodTypes,
      clientReferenceId: defaultTo(customer.description, ''),
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

// Look for PaymentIntent by id and if price changed create new PaymentIntent for same Customer if
// price is not changed return found PaymentIntent. If not PaymentIntent found return 404
type GetPaymentIntentQuery = {
  id: string;
  amount: string;
};
const getPaymentIntentOrCreateNewIfAmountIsDifferent = async (req: Request<void, void, void, GetPaymentIntentQuery>, res: Response) => {
  const id = get(req, 'query.id', '');
  const amount = parseInt(get(req, 'query.amount', ''));
  try {
    const paymentIntent = await paymentIntentModel.findByPaymentIntentId(id);
    if (paymentIntent) {
      if (paymentIntent.amount === inCent(amount)) {
        console.log(`Get PaymentIntent ${paymentIntent.id} - ${amount} EUR.`);
        res.status(OK).json(paymentIntent);
      } else {
        /**
         * TODO: Possible logic update
         * 1. It can happen so that we have several PaymentIntents for same Customer with same amount.
         * Should we cancel such PaymentIntents?
         * 2. Should we cancel previous PaymentIntent if price is changed?
         */
        const customer = typeof paymentIntent.customer === 'string' ? paymentIntent.customer : '';
        const paymentIntentForNewAmount = await paymentIntentModel.create({
          amount,
          customerId: customer,
          customerEmail: defaultTo(paymentIntent.receipt_email, ''),
          paymentMethodTypes: get(paymentIntent, 'payment_method_types', []),
          clientReferenceId: get(paymentIntent, 'metadata.client_reference_id', ''),
          productId: get(paymentIntent, 'metadata.product_id', ''),
        });
        console.log(`Price for Customer ${paymentIntent.customer} changed: ${inEuro(paymentIntent.amount)} EUR -> ${amount} EUR`);
        res.status(CREATED).json(paymentIntentForNewAmount);
      }
    } else {
      console.log(`PaymentIntent ${id} is not found`);
      res.status(NO_CONTENT).end();
    }
  } catch (e) {
    res.status(BAD_REQUEST).json({
      message: 'Fail on get PaymentIntent',
      error: get(e, 'message', ''),
    });
  }
};

// Update PaymentIntents payment_method_types. Find PaymentIntent by id and update it
const updateMethodTypes = async (req: Request, res: Response) => {
  const id = get(req, 'body.id', '');
  const paymentMethodTypes = get(req, 'body.types', []);
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

export default {
  create,
  getPaymentIntentOrCreateNewIfAmountIsDifferent,
  updateMethodTypes,
};
