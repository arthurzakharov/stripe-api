import "dotenv/config";
import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { defaultTo, get } from "lodash";
// STRIPE
import Stripe from "stripe";

// Create Express instance
const app: Express = express();
// Create Stripe instance
const stripe = new Stripe(process.env.SECRET_KEY || "");

// Using middlewares
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// Port application
const PORT = process.env.PORT || 3000;

type PaymentMethod = "card" | "paypal" | "klarna";

type IntentData = {
  amount: number;
  paymentMethodTypes: PaymentMethod[];
  productId: string;
};
const createPaymentIntent = async (
  data: IntentData,
  customer: Stripe.Customer,
): Promise<{ paymentIntent: string; clientSecret: string }> => {
  const customerId = defaultTo(customer.id, "");
  const email = defaultTo(customer.email, "");
  const referenceId = defaultTo(customer.metadata.client_reference_id, "");
  const paymentIntent = await stripe.paymentIntents.create({
    amount: data.amount * 100,
    currency: "eur",
    customer: customerId,
    payment_method_types: data.paymentMethodTypes,
    description: referenceId,
    receipt_email: email,
    metadata: {
      product_id: data.productId,
      prefilled_email: email,
      client_reference_id: referenceId,
    },
  });
  console.log("🚀 => CREATING NEW INTENT:", paymentIntent.id);
  return {
    paymentIntent: defaultTo(paymentIntent.id, ""),
    clientSecret: defaultTo(paymentIntent.client_secret, ""),
  };
};

// Routes
type CreatePaymentIntentBody = {
  amount: number;
  product_id: string;
  prefilled_email: string;
  client_reference_id: string;
  client_name: string;
  payment_methods_types: PaymentMethod[];
};
type CreatePaymentIntentResponse = {
  paymentIntent: string;
  clientSecret: string;
  customerId: string;
};
app.post(
  "/payments",
  async (req: Request<{}, {}, CreatePaymentIntentBody>, res: Response<CreatePaymentIntentResponse>) => {
    // res.status(402).send({
    //   paymentIntent: "",
    //   clientSecret: "",
    //   customerId: "",
    // });
    // return;
    const referenceId = get(req, "body.client_reference_id", "");
    const email = get(req, "body.prefilled_email", "");
    const amount = get(req, "body.amount", 0);
    const intent: IntentData = {
      amount,
      paymentMethodTypes: get(req, "body.payment_methods_types", []),
      productId: get(req, "body.product_id", ""),
    };
    const customerSearchResult = await stripe.customers.search({
      query: `metadata["client_reference_id"]:"${referenceId}"`,
    });
    if (customerSearchResult.data.length === 1) {
      const customer = customerSearchResult.data[0];
      console.log("🚀 => REUSING EXISTING CUSTOMER:", customer.id);
      const { paymentIntent, clientSecret } = await createPaymentIntent(intent, customer);
      res.send({
        paymentIntent,
        clientSecret,
        customerId: customer.id,
      });
    } else {
      const customer = await stripe.customers.create({
        email,
        name: get(req, "body.client_name", email),
        metadata: {
          client_reference_id: referenceId,
        },
      });
      console.log("🚀 => CREATING NEW CUSTOMER:", customer.id);
      const { paymentIntent, clientSecret } = await createPaymentIntent(intent, customer);
      res.send({
        paymentIntent,
        clientSecret,
        customerId: customer.id,
      });
    }
  },
);

type UpdatePaymentIntentPostBody = {
  paymentIntent: string;
  paymentMethodsTypes: PaymentMethod[];
};
app.patch("/payments", async (req: Request<{}, {}, UpdatePaymentIntentPostBody>, res: Response<string>) => {
  const paymentIntent = await stripe.paymentIntents.update(get(req, "body.paymentIntent"), {
    payment_method_types: get(req, "body.paymentMethodsTypes", []),
  });
  res.send(defaultTo(paymentIntent.client_secret, ""));
  // ! FAIL REQUEST
  // res.status(402).send();
});

// Start application
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
