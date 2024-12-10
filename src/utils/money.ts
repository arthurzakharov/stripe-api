// Convert amount in cents to euros
export const inEuro = (amount: number): number => amount / 100;

// Convert amount in euros to cents
export const inCent = (amount: number): number => amount * 100;
