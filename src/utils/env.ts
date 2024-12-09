import { defaultTo } from 'lodash';

export const PORT_IN = defaultTo(process.env.PORT_IN, 3000);

export const PORT_OUT = defaultTo(process.env.PORT_OUT, 9000);

export const SECRET_KEY = defaultTo(process.env.SECRET_KEY, '');
