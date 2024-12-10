import express, { type Router } from 'express';
import controller from '@controllers/payments';

const router: Router = express.Router();

router.get('/payments', controller.getPaymentIntentOrCreateNewIfAmountIsDifferent);

router.post('/payments', controller.create);

router.patch('/payments', controller.updateMethodTypes);

export default router;
