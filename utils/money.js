/**
 * Convert amount in cents to euros
 * @param {number} amount
 * @returns {number}
 */
const inEuro = (amount) => amount / 100;

/**
 * Convert amount in euros to cents
 * @param {number} amount
 * @returns {number}
 */
const inCent = (amount) => amount * 100;

module.exports = {
  inEuro,
  inCent,
};
