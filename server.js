require('dotenv').config();
const express = require('express');
const cors = require('cors');

const paymentRoutes = require('#payments-routes');
const { PORT } = require('#env');

const app = express();

app.use(cors());
app.use(express.json());

app.use(paymentRoutes);

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
