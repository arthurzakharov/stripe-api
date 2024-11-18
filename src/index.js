require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { defaultTo, get } = require("lodash");
const stripe = require("stripe")(defaultTo(process.env.SECRET_KEY, ""));

const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

const PORT = process.env.PORT || 3000;

const createPaymentIntent = async (data, customer) => {
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
  return {
    paymentIntent: defaultTo(paymentIntent.id, ""),
    clientSecret: defaultTo(paymentIntent.client_secret, ""),
  };
};

app.post("/payments", async (req, res) => {
  const referenceId = get(req, "body.client_reference_id", "");
  const email = get(req, "body.prefilled_email", "");
  const amount = get(req, "body.amount", 0);
  const intent = {
    amount,
    paymentMethodTypes: get(req, "body.payment_methods_types", []),
    productId: get(req, "body.product_id", ""),
  };
  const customerSearchResult = await stripe.customers.search({
    query: `metadata["client_reference_id"]:"${referenceId}"`,
  });
  if (customerSearchResult.data.length === 1) {
    const customer = customerSearchResult.data[0];
    const { paymentIntent, clientSecret } = await createPaymentIntent(
      intent,
      customer
    );
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
    const { paymentIntent, clientSecret } = await createPaymentIntent(
      intent,
      customer
    );
    res.send({
      paymentIntent,
      clientSecret,
      customerId: customer.id,
    });
  }
});

app.patch("/payments", async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.update(
    get(req, "body.paymentIntent"),
    {
      payment_method_types: get(req, "body.paymentMethodsTypes", []),
    }
  );
  res.send(defaultTo(paymentIntent.client_secret, ""));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
