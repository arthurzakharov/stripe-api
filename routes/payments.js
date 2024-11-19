const express = require('express');
const paymentsControllers = require('#payments-controllers');

const router = express.Router();

router.get('/payments', paymentsControllers.getPaymentIntentOrCreateNewIfAmountIsDifferent);

router.post('/payments', paymentsControllers.create);

router.patch('/payments', paymentsControllers.updateMethodTypes);

module.exports = router;
