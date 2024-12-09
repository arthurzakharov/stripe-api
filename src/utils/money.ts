/**
 * Convert amount in cents to euros
 * @param {number} amount
 * @returns {number}
 */
export const inEuro = (amount: number): number => amount / 100;

/**
 * Convert amount in euros to cents
 * @param {number} amount
 * @returns {number}
 */
export const inCent = (amount: number): number => amount * 100;
