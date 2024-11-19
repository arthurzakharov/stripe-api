const { SECRET_KEY } = require('#env');
const stripe = require('stripe')(SECRET_KEY);

module.exports.paymentIntents = stripe.paymentIntents;

module.exports.customers = stripe.customers;
