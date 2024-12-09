import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import paymentRoutes from './routes/payments';
import { PORT_IN, PORT_OUT } from './utils/env';

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use(paymentRoutes);

app.listen(PORT_IN, () => console.log(`Server: http://localhost:${PORT_IN} -> ${PORT_OUT}`));
