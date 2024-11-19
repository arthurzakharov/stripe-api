const { get, defaultTo } = require('lodash');
const { customers } = require('#stripe-util');

/**
 * Create new Customer
 * @param {Object} payload - data to create new Customer.
 * @param {string} payload.clientReferenceId - used as unique id to search.
 * @param {string} payload.name - customer name.
 * @param {string} payload.email - customer email.
 * @param {string} payload.phone - customer phone.
 * @param {Object} payload.address - customer address.
 * @param {string} payload.address.city - customer city.
 * @param {string} payload.address.country - customer country.
 * @param {string} payload.address.line1 - customer line1.
 * @param {string} payload.address.line2 - customer line2.
 * @param {string} payload.address.postalCode - customer postal code.
 * @param {string} payload.address.state - customer state.
 * @returns {Promise<Stripe.Customer>}
 */
const create = async (payload) => {
  try {
    return await customers
      .create({
        name: get(payload, 'name', ''),
        email: get(payload, 'email', ''),
        phone: get(payload, 'phone', ''),
        description: get(payload, 'clientReferenceId', ''),
        address: {
          city: get(payload, 'address.city', ''),
          country: get(payload, 'address.country', ''),
          line1: get(payload, 'address.line1', ''),
          line2: get(payload, 'address.line2', ''),
          postal_code: get(payload, 'address.postalCode', ''),
          state: get(payload, 'address.state', ''),
        },
        metadata: {
          client_reference_id: get(payload, 'clientReferenceId', ''),
        },
      })
      .then((customers) => {
        console.log(`Create new Customer ${customers.id}`);
        return customers;
      });
  } catch (e) {
    throw new Error(get(e, 'message', ''));
  }
};

/**
 * Create new Customer or if there is already customer with such clientReferenceId reuse
 * it and do not create new Customer. Avoiding create 2 customers with same clientReferenceId
 * @param {Object} payload - data to create new Customer.
 * @param {string} payload.clientReferenceId - used as unique id to search.
 * @param {string} payload.name - customer name.
 * @param {string} payload.email - customer email.
 * @param {string} payload.phone - customer phone.
 * @param {Object} payload.address - customer address.
 * @param {string} payload.address.city - customer city.
 * @param {string} payload.address.country - customer country.
 * @param {string} payload.address.line1 - customer line1.
 * @param {string} payload.address.line2 - customer line2.
 * @param {string} payload.address.postalCode - customer postal code.
 * @param {string} payload.address.state - customer state.
 * @returns {Promise<Stripe.Customer>}
 */
const createOrReuse = async (payload) => {
  try {
    const customer = await findByClientReferenceId(payload.clientReferenceId);
    if (customer) console.log(`Reuse Customer: ${customer.id}`);
    return customer || (await create(payload));
  } catch (e) {
    throw new Error(get(e, 'message', ''));
  }
};

/**
 * Find Customer by clientReferenceId that is recorded in metadata.
 * @param {string} id - client_reference_id that is used as unique id.
 * @returns {Promise<Stripe.Customer|undefined>}
 */
const findByClientReferenceId = async (id) => {
  try {
    const result = await customers
      .search({
        query: `metadata["client_reference_id"]:"${defaultTo(id, '')}"`,
      })
      .then((searchResults) => {
        console.log(`Find ${searchResults.data.length} Customer by clientReferenceId: ${id}`);
        return searchResults;
      });
    /**
     * TODO: Future possible improvement. Will require deleteByCustomerId then
     * Currently we return only first found customer. Considering that there can be only 1 customer
     * with same clientReferenceId. In theory there is no chance to get here more than 1 Customer.
     * Need to make decision what to do with rest customers
     */
    return get(result, 'data[0]', undefined);
  } catch (e) {
    throw new Error(get(e, 'message', ''));
  }
};

/**
 * TODO: Method is not currently used
 * Delete Customer by customer's id.
 * @param {string} id - customer id.
 * @returns {Promise<Stripe.DeletedCustomer>}
 */
const deleteByCustomerId = async (id) => {
  try {
    return await customers.del(id).then((customer) => {
      console.log(`Delete Customer ${id}`);
      return customer;
    });
  } catch (e) {
    throw new Error(get(e, 'message', ''));
  }
};

module.exports = {
  create,
  createOrReuse,
  findByClientReferenceId,
  deleteByCustomerId,
};
