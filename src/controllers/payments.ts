import { CREATED, OK, BAD_REQUEST, NO_CONTENT } from 'http-status-codes';
import customerModel from '@models/customer';
import paymentIntentModel from '@models/payment-intent';
import { inCent, inEuro } from '@utils/money';
import {
  type PostPaymentsRequest,
  type PostPaymentResponse,
  type GetPaymentsRequest,
  type GetPaymentResponse,
  type PatchPaymentsRequest,
  type PatchPaymentsResponse,
} from '@utils/types';

// Create new PaymentIntent and Customer. If customer with such clientReferenceId already exists reuse it to create new PaymentIntent
const create = async (req: PostPaymentsRequest, res: PostPaymentResponse) => {
  const amount = req.body.payment.amount;
  const paymentMethodTypes = req.body.payment.paymentMethodTypes;
  const productId = req.body.payment.productId;
  const clientReferenceId = req.body.customer.clientReferenceId;
  const name = req.body.customer.name;
  const email = req.body.customer.email;
  const phone = req.body.customer.phone;
  const city = req.body.customer.address.city;
  const country = req.body.customer.address.country;
  const line1 = req.body.customer.address.line1;
  const line2 = req.body.customer.address.line2;
  const postalCode = req.body.customer.address.postalCode;
  const state = req.body.customer.address.state;
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
      customerId: customer.id,
      customerEmail: customer.email || '',
      paymentMethodTypes,
      clientReferenceId: customer.description || '',
      productId,
    });
    res.json(paymentIntent);
  } catch (e) {
    res.json({
      message: 'Failed to create PaymentIntent',
      error: (e as Error).message,
    });
  }
};

// Look for PaymentIntent by id and if price changed create new PaymentIntent for same Customer if
// price is not changed return found PaymentIntent. If not PaymentIntent found return 404
const getPaymentIntentOrCreateNewIfAmountIsDifferent = async (req: GetPaymentsRequest, res: GetPaymentResponse) => {
  const id = req.query.id;
  const amount = parseInt(req.query.amount);
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
          customerEmail: paymentIntent.receipt_email || '',
          paymentMethodTypes: paymentIntent.payment_method_types,
          clientReferenceId: paymentIntent.metadata.client_reference_id,
          productId: paymentIntent.metadata.product_id,
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
      error: (e as Error).message,
    });
  }
};

// Update PaymentIntents payment_method_types. Find PaymentIntent by id and update it
const updateMethodTypes = async (req: PatchPaymentsRequest, res: PatchPaymentsResponse) => {
  const id = req.body.id;
  const paymentMethodTypes = req.body.types;
  try {
    const paymentIntent = await paymentIntentModel.updatePaymentMethodTypes(id, paymentMethodTypes);
    res.status(OK).json(paymentIntent);
  } catch (e) {
    res.status(BAD_REQUEST).json({
      message: "Failed to update PaymentIntent' payment_method_types",
      error: (e as Error).message,
    });
  }
};

export default {
  create,
  getPaymentIntentOrCreateNewIfAmountIsDifferent,
  updateMethodTypes,
};
