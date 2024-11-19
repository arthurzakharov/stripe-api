const express = require('express');
const paymentsControllers = require('#payments-controllers');

const router = express.Router();

router.post('/payments', paymentsControllers.create);

router.patch('/payments', paymentsControllers.updateMethodTypes);

module.exports = router;
